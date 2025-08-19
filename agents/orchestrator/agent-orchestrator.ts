import { EventEmitter } from 'events';
import { 
  AgentType, 
  AgentMessage, 
  MessageType, 
  Priority, 
  ConversationContext,
  TutorResponse,
  SystemConfig,
  AgentConfig,
  AgentError,
  ErrorCode
} from '../shared/types/agent-types.js';
import { AgentMessageBus, createRequest, createResponse } from '../shared/protocols/message-bus.js';
import { MCPServiceLayer } from '../shared/protocols/mcp-service-layer.js';
import { Agent } from './base-agent.js';

// Import specific agent implementations
import { ContentSpecialistAgent } from '../content-specialist/content-specialist-agent.js';
import { PedagogyAgent } from '../pedagogy/pedagogy-agent.js';
import { VisualLearningAgent } from '../visual-learning/visual-learning-agent.js';
import { AssessmentAgent } from '../assessment/assessment-agent.js';
import { ConversationAgent } from '../conversation/conversation-agent.js';
import { ResourceAgent } from '../resource/resource-agent.js';

export class AgentOrchestrator extends EventEmitter {
  private agents: Map<AgentType, Agent>;
  private messageBus: AgentMessageBus;
  private mcpService: MCPServiceLayer;
  private conversationManager: ConversationManager;
  private config: SystemConfig;
  private isInitialized = false;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private metrics: OrchestratorMetrics;

  constructor(config: SystemConfig) {
    super();
    this.config = config;
    this.agents = new Map();
    this.messageBus = new AgentMessageBus(config.communication);
    this.mcpService = new MCPServiceLayer();
    this.conversationManager = new ConversationManager();
    this.metrics = new OrchestratorMetrics();
    
    this.setupEventHandlers();
  }

  // Initialize the orchestrator and all agents
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      throw new Error('Orchestrator already initialized');
    }

    try {
      // Initialize MCP service and check health
      await this.mcpService.getHealth();
      
      // Initialize agents based on configuration
      await this.initializeAgents();
      
      // Setup message routing
      await this.setupMessageRouting();
      
      // Start health checking
      this.startHealthChecking();
      
      this.isInitialized = true;
      this.emit('orchestrator_initialized');
      
    } catch (error) {
      throw new Error(`Orchestrator initialization failed: ${(error as Error).message}`);
    }
  }

  // Main entry point for student queries
  async processStudentQuery(
    query: string, 
    context: ConversationContext
  ): Promise<TutorResponse> {
    if (!this.isInitialized) {
      throw new Error('Orchestrator not initialized');
    }

    const startTime = Date.now();
    const requestId = this.generateRequestId();

    try {
      this.metrics.incrementQueryCount();
      
      // 1. Process and analyze the query through Conversation Agent
      const processedQuery = await this.processQuery(query, context, requestId);
      
      // 2. Determine which agents are needed for this query
      const requiredAgents = await this.determineRequiredAgents(processedQuery);
      
      // 3. Coordinate multi-agent collaboration
      const agentResponses = await this.coordinateAgents(requiredAgents, processedQuery, requestId);
      
      // 4. Synthesize the final response
      const response = await this.synthesizeResponse(agentResponses, processedQuery, context);
      
      // 5. Track metrics and update conversation
      const processingTime = Date.now() - startTime;
      this.metrics.recordQueryTime(processingTime);
      await this.conversationManager.updateConversation(context.sessionId, query, response);
      
      this.emit('query_processed', {
        requestId,
        query,
        processingTime,
        agentsUsed: requiredAgents,
        success: true
      });
      
      return response;
      
    } catch (error) {
      this.metrics.incrementErrorCount();
      this.emit('query_failed', {
        requestId,
        query,
        error: (error as Error).message,
        processingTime: Date.now() - startTime
      });
      
      // Return error response
      return this.createErrorResponse(error as Error, context);
    }
  }

  // Process query through Conversation Agent
  private async processQuery(
    query: string, 
    context: ConversationContext, 
    requestId: string
  ): Promise<ProcessedQuery> {
    const conversationAgent = this.agents.get(AgentType.CONVERSATION);
    if (!conversationAgent) {
      throw new Error('Conversation agent not available');
    }

    const message = createRequest(
      AgentType.ORCHESTRATOR,
      AgentType.CONVERSATION,
      {
        type: 'process_query',
        query,
        context
      },
      { correlationId: requestId, priority: Priority.HIGH }
    );

    const response = await this.sendMessageAndWaitForResponse(message, 30000);
    return response.payload as ProcessedQuery;
  }

  // Determine which agents are needed based on query analysis
  private async determineRequiredAgents(query: ProcessedQuery): Promise<AgentType[]> {
    const agents: AgentType[] = [AgentType.CONVERSATION]; // Always include conversation
    
    // Content explanation needed
    if (query.needsExplanation || query.concepts.length > 0) {
      agents.push(AgentType.CONTENT_SPECIALIST);
    }
    
    // Visual content needed
    if (query.needsVisualization || query.requestsVisualContent) {
      agents.push(AgentType.VISUAL_LEARNING);
    }
    
    // Assessment or practice needed
    if (query.needsAssessment || query.requestsPractice) {
      agents.push(AgentType.ASSESSMENT);
    }
    
    // Learning path or study guidance needed
    if (query.needsLearningPath || query.requestsStudyPlan) {
      agents.push(AgentType.PEDAGOGY);
    }
    
    // External resources needed
    if (query.needsResources || query.requestsAdditionalMaterials) {
      agents.push(AgentType.RESOURCE);
    }

    return [...new Set(agents)]; // Remove duplicates
  }

  // Coordinate multiple agents to handle the query
  private async coordinateAgents(
    agentTypes: AgentType[],
    query: ProcessedQuery,
    requestId: string
  ): Promise<Map<AgentType, any>> {
    const responses = new Map<AgentType, any>();
    const errors = new Map<AgentType, Error>();

    // Determine execution order and dependencies
    const executionPlan = this.createExecutionPlan(agentTypes, query);
    
    for (const stage of executionPlan) {
      const stagePromises = stage.map(async (agentType) => {
        try {
          const agent = this.agents.get(agentType);
          if (!agent) {
            throw new Error(`Agent ${agentType} not available`);
          }

          // Create agent-specific payload
          const payload = this.createAgentPayload(agentType, query, responses);
          
          const message = createRequest(
            AgentType.ORCHESTRATOR,
            agentType,
            payload,
            { correlationId: requestId, priority: Priority.HIGH }
          );

          const response = await this.sendMessageAndWaitForResponse(message, 60000);
          responses.set(agentType, response.payload);
          
        } catch (error) {
          errors.set(agentType, error as Error);
          this.emit('agent_error', { agentType, error: (error as Error).message, requestId });
        }
      });

      await Promise.allSettled(stagePromises);
    }

    // Check for critical errors
    if (errors.has(AgentType.CONVERSATION)) {
      throw new Error('Critical error: Conversation agent failed');
    }

    return responses;
  }

  // Create execution plan based on agent dependencies
  private createExecutionPlan(agentTypes: AgentType[], query: ProcessedQuery): AgentType[][] {
    const plan: AgentType[][] = [];
    
    // Stage 1: Core analysis agents (can run in parallel)
    const stage1 = [AgentType.CONVERSATION];
    if (agentTypes.includes(AgentType.CONTENT_SPECIALIST)) {
      stage1.push(AgentType.CONTENT_SPECIALIST);
    }
    plan.push(stage1);
    
    // Stage 2: Supporting agents that depend on content analysis
    const stage2: AgentType[] = [];
    if (agentTypes.includes(AgentType.VISUAL_LEARNING)) {
      stage2.push(AgentType.VISUAL_LEARNING);
    }
    if (agentTypes.includes(AgentType.ASSESSMENT)) {
      stage2.push(AgentType.ASSESSMENT);
    }
    if (agentTypes.includes(AgentType.RESOURCE)) {
      stage2.push(AgentType.RESOURCE);
    }
    if (stage2.length > 0) {
      plan.push(stage2);
    }
    
    // Stage 3: Pedagogy agent (depends on all other responses)
    if (agentTypes.includes(AgentType.PEDAGOGY)) {
      plan.push([AgentType.PEDAGOGY]);
    }
    
    return plan;
  }

  // Create agent-specific payload
  private createAgentPayload(
    agentType: AgentType,
    query: ProcessedQuery,
    previousResponses: Map<AgentType, any>
  ): any {
    const basePayload = {
      query: query.originalQuery,
      processedQuery: query,
      context: query.context,
      previousResponses: Object.fromEntries(previousResponses)
    };

    switch (agentType) {
      case AgentType.CONTENT_SPECIALIST:
        return {
          ...basePayload,
          type: 'explain_concept',
          concepts: query.concepts,
          difficulty: query.context?.studentLevel || 'intermediate'
        };
        
      case AgentType.VISUAL_LEARNING:
        return {
          ...basePayload,
          type: 'create_visualization',
          concepts: query.concepts,
          visualizationType: query.preferredVisualization,
          complexity: query.context?.preferences?.detailLevel || 'medium'
        };
        
      case AgentType.ASSESSMENT:
        return {
          ...basePayload,
          type: 'generate_question',
          concepts: query.concepts,
          difficulty: query.requestedDifficulty || 3,
          questionType: query.preferredQuestionType
        };
        
      case AgentType.PEDAGOGY:
        return {
          ...basePayload,
          type: 'create_learning_path',
          studentProfile: query.context,
          learningGoals: query.learningGoals
        };
        
      case AgentType.RESOURCE:
        return {
          ...basePayload,
          type: 'find_resources',
          topics: query.concepts,
          resourceTypes: query.preferredResourceTypes
        };
        
      default:
        return basePayload;
    }
  }

  // Synthesize responses from multiple agents
  private async synthesizeResponse(
    agentResponses: Map<AgentType, any>,
    query: ProcessedQuery,
    context: ConversationContext
  ): Promise<TutorResponse> {
    const conversationResponse = agentResponses.get(AgentType.CONVERSATION);
    const contentResponse = agentResponses.get(AgentType.CONTENT_SPECIALIST);
    const visualResponse = agentResponses.get(AgentType.VISUAL_LEARNING);
    const assessmentResponse = agentResponses.get(AgentType.ASSESSMENT);
    const pedagogyResponse = agentResponses.get(AgentType.PEDAGOGY);
    const resourceResponse = agentResponses.get(AgentType.RESOURCE);

    // Build comprehensive response
    const response: TutorResponse = {
      id: this.generateResponseId(),
      timestamp: new Date(),
      type: this.determineResponseType(query),
      content: {
        text: conversationResponse?.response || contentResponse?.explanation,
        visualizations: visualResponse?.visualizations || [],
        videos: resourceResponse?.videos || visualResponse?.videos || [],
        assessments: assessmentResponse?.questions || [],
        resources: resourceResponse?.resources || [],
        interactive: visualResponse?.interactive || []
      },
      metadata: {
        agentsInvolved: Array.from(agentResponses.keys()),
        processingTime: 0, // Will be set by caller
        confidence: this.calculateConfidence(agentResponses),
        sources: this.extractSources(agentResponses),
        adaptations: pedagogyResponse?.adaptations || []
      },
      followUpSuggestions: pedagogyResponse?.nextSteps || contentResponse?.relatedTopics || [],
      relatedTopics: contentResponse?.prerequisites || []
    };

    return response;
  }

  // Helper methods for response synthesis
  private determineResponseType(query: ProcessedQuery): 'explanation' | 'question' | 'feedback' | 'encouragement' | 'resources' {
    if (query.requestsAssessment) return 'question';
    if (query.requestsResources) return 'resources';
    if (query.requestsEncouragement) return 'encouragement';
    if (query.requestsFeedback) return 'feedback';
    return 'explanation';
  }

  private calculateConfidence(responses: Map<AgentType, any>): number {
    let totalConfidence = 0;
    let count = 0;
    
    for (const response of responses.values()) {
      if (response.confidence !== undefined) {
        totalConfidence += response.confidence;
        count++;
      }
    }
    
    return count > 0 ? totalConfidence / count : 0.7; // Default confidence
  }

  private extractSources(responses: Map<AgentType, any>): string[] {
    const sources: string[] = [];
    
    for (const response of responses.values()) {
      if (response.sources && Array.isArray(response.sources)) {
        sources.push(...response.sources);
      }
    }
    
    return [...new Set(sources)]; // Remove duplicates
  }

  // Initialize all configured agents
  private async initializeAgents(): Promise<void> {
    const agentFactories: Record<AgentType, () => Agent> = {
      [AgentType.CONTENT_SPECIALIST]: () => new ContentSpecialistAgent(this.messageBus, this.mcpService),
      [AgentType.PEDAGOGY]: () => new PedagogyAgent(this.messageBus, this.mcpService),
      [AgentType.VISUAL_LEARNING]: () => new VisualLearningAgent(this.messageBus, this.mcpService),
      [AgentType.ASSESSMENT]: () => new AssessmentAgent(this.messageBus, this.mcpService),
      [AgentType.CONVERSATION]: () => new ConversationAgent(this.messageBus, this.mcpService),
      [AgentType.RESOURCE]: () => new ResourceAgent(this.messageBus, this.mcpService),
      [AgentType.ORCHESTRATOR]: () => {
        throw new Error('Cannot create orchestrator agent');
      }
    };

    for (const [agentType, agentConfig] of Object.entries(this.config.agents)) {
      if (!agentConfig.enabled) continue;
      
      try {
        const factory = agentFactories[agentType as AgentType];
        if (!factory) {
          console.warn(`No factory available for agent type: ${agentType}`);
          continue;
        }
        
        const agent = factory();
        await agent.initialize();
        
        this.agents.set(agentType as AgentType, agent);
        this.emit('agent_initialized', { agentType });
        
      } catch (error) {
        console.error(`Failed to initialize agent ${agentType}:`, error);
        this.emit('agent_init_failed', { agentType, error: (error as Error).message });
      }
    }
  }

  // Setup message routing between agents
  private async setupMessageRouting(): Promise<void> {
    // Subscribe orchestrator to all message types
    await this.messageBus.subscribe(AgentType.ORCHESTRATOR, this.handleMessage.bind(this));
    
    // Setup routing rules for different message types
    this.messageBus.setupRouting(MessageType.REQUEST, Object.values(AgentType));
    this.messageBus.setupRouting(MessageType.RESPONSE, [AgentType.ORCHESTRATOR]);
    this.messageBus.setupRouting(MessageType.NOTIFICATION, Object.values(AgentType));
    this.messageBus.setupRouting(MessageType.ERROR, [AgentType.ORCHESTRATOR]);
  }

  // Handle incoming messages
  private async handleMessage(message: AgentMessage): Promise<void> {
    try {
      switch (message.messageType) {
        case MessageType.ERROR:
          await this.handleErrorMessage(message);
          break;
        case MessageType.NOTIFICATION:
          await this.handleNotificationMessage(message);
          break;
        case MessageType.HEARTBEAT:
          await this.handleHeartbeatMessage(message);
          break;
        default:
          console.warn(`Unhandled message type: ${message.messageType}`);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  // Error response creation
  private createErrorResponse(error: Error, context: ConversationContext): TutorResponse {
    return {
      id: this.generateResponseId(),
      timestamp: new Date(),
      type: 'feedback',
      content: {
        text: "I'm sorry, I encountered an error while processing your question. Please try rephrasing your question or ask something else.",
      },
      metadata: {
        agentsInvolved: [AgentType.ORCHESTRATOR],
        processingTime: 0,
        confidence: 0,
        sources: [],
        adaptations: []
      },
      followUpSuggestions: [
        "Try asking a more specific question",
        "Check if your question is about organic chemistry",
        "Ask for help with a particular concept"
      ]
    };
  }

  // Utility methods
  private async sendMessageAndWaitForResponse(
    message: AgentMessage, 
    timeout: number = 30000
  ): Promise<AgentMessage> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Message timeout after ${timeout}ms`));
      }, timeout);

      const responseHandler = (responseMessage: AgentMessage) => {
        if (responseMessage.correlationId === message.correlationId) {
          clearTimeout(timer);
          this.messageBus.off('message_delivered', responseHandler);
          resolve(responseMessage);
        }
      };

      this.messageBus.on('message_delivered', responseHandler);
      this.messageBus.route(message);
    });
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateResponseId(): string {
    return `resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Health checking and monitoring
  private startHealthChecking(): void {
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, 30000); // Check every 30 seconds
  }

  private async performHealthCheck(): Promise<void> {
    try {
      // Check MCP service health
      await this.mcpService.getHealth();
      
      // Check agent health
      for (const [agentType, agent] of this.agents) {
        try {
          const isHealthy = await agent.healthCheck();
          if (!isHealthy) {
            this.emit('agent_unhealthy', { agentType });
          }
        } catch (error) {
          this.emit('agent_health_check_failed', { 
            agentType, 
            error: (error as Error).message 
          });
        }
      }
      
    } catch (error) {
      this.emit('health_check_failed', { error: (error as Error).message });
    }
  }

  // Event handler setup
  private setupEventHandlers(): void {
    this.messageBus.on('message_dead_lettered', (event) => {
      this.metrics.incrementDeadLetterCount();
      this.emit('message_dead_lettered', event);
    });

    this.messageBus.on('message_delivery_failed', (event) => {
      this.metrics.incrementDeliveryFailureCount();
      this.emit('message_delivery_failed', event);
    });
  }

  // Error handling
  private async handleErrorMessage(message: AgentMessage): Promise<void> {
    const error: AgentError = message.payload;
    this.metrics.incrementErrorCount();
    
    console.error(`Agent error from ${message.sender}:`, error);
    this.emit('agent_error', {
      agentType: message.sender,
      error: error.message,
      code: error.code,
      retryable: error.retryable
    });
  }

  private async handleNotificationMessage(message: AgentMessage): Promise<void> {
    // Handle various notification types
    const notification = message.payload;
    
    switch (notification.type) {
      case 'learning_milestone_reached':
        await this.handleLearningMilestone(notification);
        break;
      case 'concept_mastered':
        await this.handleConceptMastery(notification);
        break;
      case 'study_session_completed':
        await this.handleStudySessionCompletion(notification);
        break;
      default:
        console.log(`Received notification: ${notification.type}`);
    }
  }

  private async handleHeartbeatMessage(message: AgentMessage): Promise<void> {
    // Update agent status
    this.metrics.updateAgentLastSeen(message.sender);
  }

  private async handleLearningMilestone(notification: any): Promise<void> {
    // Track learning milestones for analytics
    await this.mcpService.trackEvent('learning_milestone', notification);
    this.emit('learning_milestone', notification);
  }

  private async handleConceptMastery(notification: any): Promise<void> {
    // Update conversation context with new mastery
    await this.conversationManager.updateConceptMastery(
      notification.userId,
      notification.concept,
      notification.masteryLevel
    );
    this.emit('concept_mastered', notification);
  }

  private async handleStudySessionCompletion(notification: any): Promise<void> {
    // Track study session data
    await this.mcpService.trackEvent('study_session_completed', notification);
    this.emit('study_session_completed', notification);
  }

  // Public API for metrics and status
  public getMetrics(): OrchestratorMetrics {
    return this.metrics;
  }

  public getStatus(): OrchestratorStatus {
    return {
      initialized: this.isInitialized,
      agentCount: this.agents.size,
      queueStats: this.messageBus.getStats(),
      metrics: this.metrics.getSnapshot()
    };
  }

  // Cleanup
  public async shutdown(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    // Shutdown all agents
    for (const agent of this.agents.values()) {
      try {
        await agent.shutdown();
      } catch (error) {
        console.error('Error shutting down agent:', error);
      }
    }
    
    this.messageBus.destroy();
    this.emit('orchestrator_shutdown');
  }
}

// Supporting classes and interfaces
class ConversationManager {
  private conversations: Map<string, ConversationContext> = new Map();

  async updateConversation(
    sessionId: string, 
    query: string, 
    response: TutorResponse
  ): Promise<void> {
    // Implementation for conversation management
  }

  async updateConceptMastery(
    userId: string, 
    concept: string, 
    masteryLevel: number
  ): Promise<void> {
    // Implementation for concept mastery tracking
  }
}

class OrchestratorMetrics {
  private queryCount = 0;
  private errorCount = 0;
  private deadLetterCount = 0;
  private deliveryFailureCount = 0;
  private queryTimes: number[] = [];
  private agentLastSeen: Map<AgentType, Date> = new Map();

  incrementQueryCount(): void {
    this.queryCount++;
  }

  incrementErrorCount(): void {
    this.errorCount++;
  }

  incrementDeadLetterCount(): void {
    this.deadLetterCount++;
  }

  incrementDeliveryFailureCount(): void {
    this.deliveryFailureCount++;
  }

  recordQueryTime(time: number): void {
    this.queryTimes.push(time);
    // Keep only last 1000 entries
    if (this.queryTimes.length > 1000) {
      this.queryTimes = this.queryTimes.slice(-1000);
    }
  }

  updateAgentLastSeen(agentType: AgentType): void {
    this.agentLastSeen.set(agentType, new Date());
  }

  getSnapshot(): MetricsSnapshot {
    return {
      queryCount: this.queryCount,
      errorCount: this.errorCount,
      deadLetterCount: this.deadLetterCount,
      deliveryFailureCount: this.deliveryFailureCount,
      averageQueryTime: this.queryTimes.length > 0 
        ? this.queryTimes.reduce((a, b) => a + b, 0) / this.queryTimes.length 
        : 0,
      agentHealth: Object.fromEntries(this.agentLastSeen.entries())
    };
  }
}

interface ProcessedQuery {
  originalQuery: string;
  intent: string;
  concepts: string[];
  context: ConversationContext;
  needsExplanation: boolean;
  needsVisualization: boolean;
  needsAssessment: boolean;
  needsLearningPath: boolean;
  needsResources: boolean;
  requestsVisualContent: boolean;
  requestsPractice: boolean;
  requestsStudyPlan: boolean;
  requestsAdditionalMaterials: boolean;
  requestsAssessment: boolean;
  requestsEncouragement: boolean;
  requestsFeedback: boolean;
  preferredVisualization?: string;
  preferredQuestionType?: string;
  preferredResourceTypes?: string[];
  requestedDifficulty?: number;
  learningGoals?: string[];
}

interface OrchestratorStatus {
  initialized: boolean;
  agentCount: number;
  queueStats: any;
  metrics: MetricsSnapshot;
}

interface MetricsSnapshot {
  queryCount: number;
  errorCount: number;
  deadLetterCount: number;
  deliveryFailureCount: number;
  averageQueryTime: number;
  agentHealth: Record<AgentType, Date>;
}