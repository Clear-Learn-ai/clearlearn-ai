import { EventEmitter } from 'events';
import { 
  AgentType, 
  AgentMessage, 
  MessageType, 
  Priority, 
  AgentConfig,
  AgentError,
  ErrorCode
} from '../shared/types/agent-types.js';
import { AgentMessageBus, MessageHandler, createResponse, createMessage } from '../shared/protocols/message-bus.js';
import { MCPServiceLayer } from '../shared/protocols/mcp-service-layer.js';

/**
 * Base Agent Class
 * 
 * Provides common functionality for all agents in the multi-agent system:
 * - Message handling and routing
 * - MCP service integration
 * - Health checking and metrics
 * - Error handling and recovery
 * - Configuration management
 */
export abstract class Agent extends EventEmitter {
  protected agentType: AgentType;
  protected messageBus: AgentMessageBus;
  protected mcpService: MCPServiceLayer;
  protected config: AgentConfig;
  protected isInitialized = false;
  protected isHealthy = true;
  protected metrics: AgentMetrics;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private messageHandler: MessageHandler;

  constructor(
    agentType: AgentType, 
    messageBus: AgentMessageBus, 
    mcpService: MCPServiceLayer,
    config?: Partial<AgentConfig>
  ) {
    super();
    this.agentType = agentType;
    this.messageBus = messageBus;
    this.mcpService = mcpService;
    this.metrics = new AgentMetrics(agentType);
    
    // Default configuration
    this.config = {
      agentType,
      enabled: true,
      maxConcurrentTasks: 5,
      timeout: 30000,
      retryAttempts: 3,
      priority: Priority.MEDIUM,
      dependencies: [],
      mcpTools: [],
      ...config
    };

    // Bind message handler
    this.messageHandler = this.handleMessage.bind(this);
  }

  // Abstract methods that must be implemented by subclasses
  abstract processMessage(message: AgentMessage): Promise<AgentMessage>;
  abstract getCapabilities(): AgentCapabilities;

  // Initialization and lifecycle management
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      throw new Error(`Agent ${this.agentType} already initialized`);
    }

    try {
      // Subscribe to message bus
      await this.messageBus.subscribe(this.agentType, this.messageHandler);
      
      // Perform agent-specific initialization
      await this.initializeAgent();
      
      // Validate MCP tools are available
      await this.validateMCPTools();
      
      // Start health checking
      this.startHealthChecking();
      
      this.isInitialized = true;
      this.isHealthy = true;
      
      this.emit('agent_initialized', { agentType: this.agentType });
      await this.sendHeartbeat();
      
    } catch (error) {
      this.isHealthy = false;
      this.emit('agent_init_failed', { 
        agentType: this.agentType, 
        error: (error as Error).message 
      });
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    await this.messageBus.unsubscribe(this.agentType, this.messageHandler);
    await this.shutdownAgent();
    
    this.isInitialized = false;
    this.emit('agent_shutdown', { agentType: this.agentType });
  }

  // Health checking
  async healthCheck(): Promise<boolean> {
    try {
      // Basic health checks
      if (!this.isInitialized) return false;
      if (!this.mcpService.isServiceHealthy('github')) return false;
      
      // Agent-specific health checks
      const agentHealthy = await this.performHealthCheck();
      
      this.isHealthy = agentHealthy;
      return agentHealthy;
      
    } catch (error) {
      this.isHealthy = false;
      this.emit('health_check_failed', { 
        agentType: this.agentType, 
        error: (error as Error).message 
      });
      return false;
    }
  }

  // Message handling
  private async handleMessage(message: AgentMessage): Promise<void> {
    const startTime = Date.now();
    
    try {
      this.metrics.incrementMessageCount();
      
      // Validate message
      if (!this.validateMessage(message)) {
        throw new AgentError(
          'Invalid message format',
          ErrorCode.INVALID_MESSAGE,
          message as any
        );
      }
      
      // Check if agent can handle the message
      if (!this.canHandleMessage(message)) {
        throw new AgentError(
          `Agent ${this.agentType} cannot handle message type ${message.messageType}`,
          ErrorCode.PROCESSING_ERROR,
          message as any
        );
      }
      
      // Process the message
      const response = await this.processMessageWithTimeout(message);
      
      // Send response if this was a request
      if (message.messageType === MessageType.REQUEST && response) {
        await this.sendResponse(message, response);
      }
      
      // Record metrics
      const processingTime = Date.now() - startTime;
      this.metrics.recordProcessingTime(processingTime);
      
      this.emit('message_processed', {
        agentType: this.agentType,
        messageId: message.id,
        processingTime
      });
      
    } catch (error) {
      this.metrics.incrementErrorCount();
      
      const agentError = error instanceof AgentError ? error : new AgentError(
        `Message processing failed: ${(error as Error).message}`,
        ErrorCode.PROCESSING_ERROR,
        error as any as any
      );
      
      await this.handleError(agentError, message);
    }
  }

  private async processMessageWithTimeout(message: AgentMessage): Promise<AgentMessage> {
    const timeout = message.timeout || this.config.timeout;
    
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new AgentError(
          `Message processing timeout after ${timeout}ms`,
          ErrorCode.TIMEOUT,
          message as any
        ));
      }, timeout);

      this.processMessage(message)
        .then((response) => {
          clearTimeout(timer);
          resolve(response);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  // Message validation and handling
  private validateMessage(message: AgentMessage): boolean {
    return !!(
      message.id &&
      message.timestamp &&
      message.sender &&
      message.messageType &&
      message.payload
    );
  }

  private canHandleMessage(message: AgentMessage): boolean {
    // Check if this agent type can handle the message
    const supportedTypes = [
      MessageType.REQUEST,
      MessageType.NOTIFICATION,
      MessageType.TASK_ASSIGNMENT
    ];
    
    return supportedTypes.includes(message.messageType);
  }

  // Response handling
  protected async sendResponse(originalMessage: AgentMessage, responsePayload: any): Promise<void> {
    const response = createResponse(originalMessage, responsePayload, {
      priority: originalMessage.priority
    });
    
    await this.messageBus.route(response);
  }

  protected async sendNotification(payload: any, priority: Priority = Priority.MEDIUM): Promise<void> {
    const notification = createMessage(
      this.agentType,
      'broadcast',
      MessageType.NOTIFICATION,
      payload,
      { priority }
    );
    
    await this.messageBus.broadcast(notification);
  }

  protected async sendRequest(
    recipient: AgentType,
    payload: any,
    priority: Priority = Priority.MEDIUM,
    timeout?: number
  ): Promise<AgentMessage> {
    const request = createMessage(
      this.agentType,
      recipient,
      MessageType.REQUEST,
      payload,
      { priority, timeout }
    );
    
    // This would need to be implemented with proper response waiting
    await this.messageBus.route(request);
    
    // For now, return a placeholder - in real implementation,
    // this would wait for and return the actual response
    return request;
  }

  // Error handling
  private async handleError(error: AgentError, originalMessage?: AgentMessage): Promise<void> {
    this.emit('agent_error', {
      agentType: this.agentType,
      error: error.message,
      code: error.code,
      retryable: error.retryable,
      messageId: originalMessage?.id
    });
    
    // Send error response if this was a request
    if (originalMessage && originalMessage.messageType === MessageType.REQUEST) {
      const errorResponse = createResponse(originalMessage, {
        error: {
          code: error.code,
          message: error.message,
          retryable: error.retryable
        }
      });
      
      await this.messageBus.route(errorResponse);
    }
    
    // Send error notification to orchestrator
    const errorNotification = createMessage(
      this.agentType,
      'orchestrator',
      MessageType.ERROR,
      error,
      { priority: Priority.HIGH }
    );
    
    await this.messageBus.route(errorNotification);
  }

  // MCP Service helpers
  protected async queryAI(
    provider: 'claude' | 'openai',
    prompt: string,
    context?: any,
    conversationId?: string
  ): Promise<any> {
    try {
      return await this.mcpService.queryAI(
        provider,
        prompt,
        context,
        conversationId,
        this.agentType
      );
    } catch (error) {
      throw new AgentError(
        `AI query failed: ${(error as Error).message}`,
        ErrorCode.MCP_CONNECTION_FAILED,
        error as any
      );
    }
  }

  protected async searchVideos(query: string, subject?: string): Promise<any> {
    try {
      return await this.mcpService.searchVideos(query, subject);
    } catch (error) {
      throw new AgentError(
        `Video search failed: ${(error as Error).message}`,
        ErrorCode.MCP_CONNECTION_FAILED,
        error as any
      );
    }
  }

  protected async readFile(path: string): Promise<any> {
    try {
      return await this.mcpService.readProjectFile(path);
    } catch (error) {
      throw new AgentError(
        `File read failed: ${(error as Error).message}`,
        ErrorCode.MCP_CONNECTION_FAILED,
        error as any
      );
    }
  }

  protected async writeFile(path: string, content: string): Promise<any> {
    try {
      return await this.mcpService.writeProjectFile(path, content);
    } catch (error) {
      throw new AgentError(
        `File write failed: ${(error as Error).message}`,
        ErrorCode.MCP_CONNECTION_FAILED,
        error as any
      );
    }
  }

  protected async trackEvent(event: string, data: any): Promise<void> {
    try {
      await this.mcpService.trackEvent(event, data, this.agentType);
    } catch (error) {
      // Non-critical, just log
      console.warn(`Event tracking failed for ${this.agentType}:`, error);
    }
  }

  // Health checking
  private startHealthChecking(): void {
    this.healthCheckInterval = setInterval(async () => {
      await this.healthCheck();
      await this.sendHeartbeat();
    }, 30000); // Every 30 seconds
  }

  private async sendHeartbeat(): Promise<void> {
    const heartbeat = createMessage(
      this.agentType,
      'orchestrator',
      MessageType.HEARTBEAT,
      {
        timestamp: new Date(),
        healthy: this.isHealthy,
        metrics: this.metrics.getSnapshot()
      },
      { priority: Priority.LOW }
    );
    
    await this.messageBus.route(heartbeat);
  }

  // Agent-specific methods to be overridden
  protected async initializeAgent(): Promise<void> {
    // Override in subclasses for specific initialization
  }

  protected async shutdownAgent(): Promise<void> {
    // Override in subclasses for specific cleanup
  }

  protected async performHealthCheck(): Promise<boolean> {
    // Override in subclasses for specific health checks
    return true;
  }

  private async validateMCPTools(): Promise<void> {
    // Validate that required MCP tools are available
    const health = await this.mcpService.getHealth();
    
    for (const tool of this.config.mcpTools) {
      if (!health.services[tool]) {
        throw new Error(`Required MCP tool not available: ${tool}`);
      }
    }
  }

  // Public getters
  public getAgentType(): AgentType {
    return this.agentType;
  }

  public getConfig(): AgentConfig {
    return { ...this.config };
  }

  public getMetrics(): AgentMetrics {
    return this.metrics;
  }

  public isAgent(): boolean {
    return this.isInitialized;
  }

  public isAgentHealthy(): boolean {
    return this.isHealthy;
  }
}

// Agent Metrics Class
export class AgentMetrics {
  private messageCount = 0;
  private errorCount = 0;
  private processingTimes: number[] = [];
  private lastProcessed = new Date();
  private startTime = new Date();

  constructor(private agentType: AgentType) {}

  incrementMessageCount(): void {
    this.messageCount++;
    this.lastProcessed = new Date();
  }

  incrementErrorCount(): void {
    this.errorCount++;
  }

  recordProcessingTime(time: number): void {
    this.processingTimes.push(time);
    // Keep only last 100 entries
    if (this.processingTimes.length > 100) {
      this.processingTimes = this.processingTimes.slice(-100);
    }
  }

  getSnapshot(): AgentMetricsSnapshot {
    return {
      agentType: this.agentType,
      messageCount: this.messageCount,
      errorCount: this.errorCount,
      averageProcessingTime: this.processingTimes.length > 0 
        ? this.processingTimes.reduce((a, b) => a + b, 0) / this.processingTimes.length 
        : 0,
      errorRate: this.messageCount > 0 ? this.errorCount / this.messageCount : 0,
      lastProcessed: this.lastProcessed,
      uptime: Date.now() - this.startTime.getTime()
    };
  }
}

// Interface definitions
export interface AgentCapabilities {
  canExplainConcepts: boolean;
  canCreateVisualizations: boolean;
  canGenerateAssessments: boolean;
  canSearchResources: boolean;
  canAnalyzeLearning: boolean;
  canManageConversations: boolean;
  supportedTopics: string[];
  supportedModalities: string[];
  maxComplexity: number;
}

export interface AgentMetricsSnapshot {
  agentType: AgentType;
  messageCount: number;
  errorCount: number;
  averageProcessingTime: number;
  errorRate: number;
  lastProcessed: Date;
  uptime: number;
}

// Agent Factory for creating agents
export class AgentFactory {
  static createAgent(
    agentType: AgentType,
    messageBus: AgentMessageBus,
    mcpService: MCPServiceLayer,
    config?: Partial<AgentConfig>
  ): Agent {
    // This would be implemented with actual agent classes
    throw new Error(`Agent factory not implemented for type: ${agentType}`);
  }
}

// Agent Registry for managing agent instances
export class AgentRegistry {
  private agents: Map<string, Agent> = new Map();

  registerAgent(id: string, agent: Agent): void {
    this.agents.set(id, agent);
  }

  getAgent(id: string): Agent | undefined {
    return this.agents.get(id);
  }

  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  getAgentsByType(agentType: AgentType): Agent[] {
    return Array.from(this.agents.values()).filter(
      agent => agent.getAgentType() === agentType
    );
  }

  removeAgent(id: string): boolean {
    return this.agents.delete(id);
  }

  getHealthyAgents(): Agent[] {
    return Array.from(this.agents.values()).filter(
      agent => agent.isAgentHealthy()
    );
  }

  getRegistry(): Record<string, AgentMetricsSnapshot> {
    const registry: Record<string, AgentMetricsSnapshot> = {};
    
    for (const [id, agent] of this.agents) {
      registry[id] = agent.getMetrics().getSnapshot();
    }
    
    return registry;
  }
}