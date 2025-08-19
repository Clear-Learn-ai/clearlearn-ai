import { EventEmitter } from 'events';
import { AgentMessage, AgentType, MessageType, Priority } from '../types/agent-types.js';

// Priority Queue Implementation for Message Handling
class PriorityQueue<T> {
  private heap: Array<{ item: T; priority: number }> = [];

  enqueue(item: T, priority: number): void {
    this.heap.push({ item, priority });
    this.heapifyUp();
  }

  dequeue(): T | undefined {
    if (this.heap.length === 0) return undefined;
    
    const result = this.heap[0];
    const end = this.heap.pop();
    
    if (this.heap.length > 0 && end) {
      this.heap[0] = end;
      this.heapifyDown();
    }
    
    return result.item;
  }

  size(): number {
    return this.heap.length;
  }

  private heapifyUp(): void {
    let index = this.heap.length - 1;
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[parentIndex].priority >= this.heap[index].priority) break;
      
      [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
      index = parentIndex;
    }
  }

  private heapifyDown(): void {
    let index = 0;
    while (index * 2 + 1 < this.heap.length) {
      const leftChild = index * 2 + 1;
      const rightChild = index * 2 + 2;
      let largest = index;

      if (this.heap[leftChild].priority > this.heap[largest].priority) {
        largest = leftChild;
      }

      if (rightChild < this.heap.length && this.heap[rightChild].priority > this.heap[largest].priority) {
        largest = rightChild;
      }

      if (largest === index) break;

      [this.heap[index], this.heap[largest]] = [this.heap[largest], this.heap[index]];
      index = largest;
    }
  }
}

// Circuit Breaker Pattern for Agent Communication
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private failureThreshold: number = 5,
    private recoveryTimeout: number = 60000 // 1 minute
  ) {}

  async call<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime < this.recoveryTimeout) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  getState(): string {
    return this.state;
  }
}

// Message Bus Implementation
export class AgentMessageBus extends EventEmitter {
  private messageQueue: PriorityQueue<AgentMessage>;
  private subscribers: Map<AgentType, Set<MessageHandler>>;
  private routingTable: Map<MessageType, Set<AgentType>>;
  private deadLetterQueue: AgentMessage[] = [];
  private circuitBreakers: Map<AgentType, CircuitBreaker>;
  private isProcessing = false;
  private processingInterval: NodeJS.Timeout | null = null;

  constructor(
    private config: MessageBusConfig = new DefaultMessageBusConfig()
  ) {
    super();
    this.messageQueue = new PriorityQueue<AgentMessage>();
    this.subscribers = new Map();
    this.routingTable = new Map();
    this.circuitBreakers = new Map();
    this.startProcessing();
  }

  // Subscribe an agent to receive messages
  async subscribe(agentType: AgentType, handler: MessageHandler): Promise<void> {
    if (!this.subscribers.has(agentType)) {
      this.subscribers.set(agentType, new Set());
    }
    this.subscribers.get(agentType)!.add(handler);
    
    // Initialize circuit breaker for this agent
    if (!this.circuitBreakers.has(agentType)) {
      this.circuitBreakers.set(agentType, new CircuitBreaker());
    }
    
    this.emit('agent_subscribed', { agentType, handlerCount: this.subscribers.get(agentType)!.size });
  }

  // Unsubscribe an agent
  async unsubscribe(agentType: AgentType, handler: MessageHandler): Promise<void> {
    const handlers = this.subscribers.get(agentType);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.subscribers.delete(agentType);
        this.circuitBreakers.delete(agentType);
      }
    }
    
    this.emit('agent_unsubscribed', { agentType });
  }

  // Route a message to specific recipient(s)
  async route(message: AgentMessage): Promise<void> {
    // Validate message
    if (!this.validateMessage(message)) {
      throw new Error(`Invalid message: ${JSON.stringify(message)}`);
    }

    // Add to queue with priority
    const priority = this.getPriorityScore(message.priority);
    this.messageQueue.enqueue(message, priority);

    this.emit('message_queued', { 
      messageId: message.id, 
      queueSize: this.messageQueue.size(),
      priority: message.priority 
    });

    // Start processing if not already running
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  // Broadcast message to all subscribers of a type
  async broadcast(message: AgentMessage): Promise<void> {
    message.recipient = 'broadcast';
    await this.route(message);
  }

  // Set up routing rules
  setupRouting(messageType: MessageType, targetAgents: AgentType[]): void {
    this.routingTable.set(messageType, new Set(targetAgents));
  }

  // Get message bus statistics
  getStats(): MessageBusStats {
    return {
      queueSize: this.messageQueue.size(),
      subscriberCount: Array.from(this.subscribers.values()).reduce((sum, handlers) => sum + handlers.size, 0),
      deadLetterQueueSize: this.deadLetterQueue.length,
      circuitBreakerStates: Array.from(this.circuitBreakers.entries()).reduce((acc, [agent, cb]) => {
        acc[agent] = cb.getState();
        return acc;
      }, {} as Record<AgentType, string>),
      isProcessing: this.isProcessing
    };
  }

  // Process message queue
  private async processQueue(): Promise<void> {
    this.isProcessing = true;
    
    while (this.messageQueue.size() > 0) {
      const message = this.messageQueue.dequeue();
      if (!message) break;

      try {
        await this.deliverMessage(message);
      } catch (error) {
        await this.handleDeliveryError(message, error as Error);
      }
    }
    
    this.isProcessing = false;
  }

  // Deliver message to recipient(s)
  private async deliverMessage(message: AgentMessage): Promise<void> {
    const startTime = Date.now();
    
    try {
      if (message.recipient === 'broadcast') {
        await this.deliverBroadcast(message);
      } else if (message.recipient === 'orchestrator') {
        await this.deliverToOrchestrator(message);
      } else {
        await this.deliverToAgent(message.recipient as AgentType, message);
      }
      
      this.emit('message_delivered', {
        messageId: message.id,
        recipient: message.recipient,
        deliveryTime: Date.now() - startTime
      });
      
    } catch (error) {
      this.emit('message_delivery_failed', {
        messageId: message.id,
        recipient: message.recipient,
        error: (error as Error).message
      });
      throw error;
    }
  }

  // Deliver broadcast message
  private async deliverBroadcast(message: AgentMessage): Promise<void> {
    const targetAgents = this.routingTable.get(message.messageType) || new Set(this.subscribers.keys());
    
    const deliveryPromises = Array.from(targetAgents).map(agentType => 
      this.deliverToAgent(agentType, message)
    );
    
    await Promise.allSettled(deliveryPromises);
  }

  // Deliver to orchestrator
  private async deliverToOrchestrator(message: AgentMessage): Promise<void> {
    // Special handling for orchestrator messages
    this.emit('orchestrator_message', message);
  }

  // Deliver to specific agent
  private async deliverToAgent(agentType: AgentType, message: AgentMessage): Promise<void> {
    const handlers = this.subscribers.get(agentType);
    if (!handlers || handlers.size === 0) {
      throw new Error(`No subscribers for agent type: ${agentType}`);
    }

    const circuitBreaker = this.circuitBreakers.get(agentType);
    if (!circuitBreaker) {
      throw new Error(`No circuit breaker for agent type: ${agentType}`);
    }

    // Use circuit breaker pattern
    await circuitBreaker.call(async () => {
      const deliveryPromises = Array.from(handlers).map(handler => 
        this.callHandlerWithTimeout(handler, message)
      );
      
      await Promise.race(deliveryPromises); // First successful delivery wins
    });
  }

  // Call handler with timeout
  private async callHandlerWithTimeout(handler: MessageHandler, message: AgentMessage): Promise<void> {
    const timeout = message.timeout || this.config.defaultTimeout;
    
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Message handler timeout after ${timeout}ms`));
      }, timeout);

      handler(message)
        .then(() => {
          clearTimeout(timer);
          resolve();
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  // Handle delivery errors
  private async handleDeliveryError(message: AgentMessage, error: Error): Promise<void> {
    if (this.config.retryAttempts > 0 && this.shouldRetry(message, error)) {
      // Implement retry logic with exponential backoff
      const retryDelay = Math.min(1000 * Math.pow(2, (message as any).retryCount || 0), 30000);
      
      setTimeout(() => {
        (message as any).retryCount = ((message as any).retryCount || 0) + 1;
        if ((message as any).retryCount <= this.config.retryAttempts) {
          this.route(message);
        } else {
          this.sendToDeadLetterQueue(message, error);
        }
      }, retryDelay);
    } else {
      this.sendToDeadLetterQueue(message, error);
    }
  }

  // Send message to dead letter queue
  private sendToDeadLetterQueue(message: AgentMessage, error: Error): void {
    if (this.config.deadLetterQueue) {
      this.deadLetterQueue.push({
        ...message,
        metadata: { ...message.context, error: error.message, timestamp: new Date() }
      });
      
      this.emit('message_dead_lettered', {
        messageId: message.id,
        error: error.message,
        deadLetterQueueSize: this.deadLetterQueue.length
      });
    }
  }

  // Validate message format
  private validateMessage(message: AgentMessage): boolean {
    return !!(
      message.id &&
      message.timestamp &&
      message.sender &&
      message.recipient &&
      message.messageType &&
      message.priority
    );
  }

  // Get priority score for queue ordering
  private getPriorityScore(priority: Priority): number {
    const scores = {
      [Priority.CRITICAL]: 100,
      [Priority.HIGH]: 75,
      [Priority.MEDIUM]: 50,
      [Priority.LOW]: 25
    };
    return scores[priority] || 50;
  }

  // Determine if message should be retried
  private shouldRetry(message: AgentMessage, error: Error): boolean {
    // Don't retry validation errors or certain system errors
    const nonRetryableErrors = ['INVALID_MESSAGE', 'AGENT_NOT_FOUND', 'VALIDATION_ERROR'];
    return !nonRetryableErrors.some(code => error.message.includes(code));
  }

  // Start background processing
  private startProcessing(): void {
    this.processingInterval = setInterval(() => {
      if (!this.isProcessing && this.messageQueue.size() > 0) {
        this.processQueue();
      }
    }, this.config.processingInterval);
  }

  // Cleanup resources
  public destroy(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }
    
    this.subscribers.clear();
    this.routingTable.clear();
    this.circuitBreakers.clear();
    this.removeAllListeners();
  }
}

// Type definitions
export type MessageHandler = (message: AgentMessage) => Promise<void>;

export interface MessageBusConfig {
  defaultTimeout: number;
  retryAttempts: number;
  deadLetterQueue: boolean;
  processingInterval: number;
  maxQueueSize: number;
  circuitBreakerEnabled: boolean;
}

export class DefaultMessageBusConfig implements MessageBusConfig {
  defaultTimeout = 30000; // 30 seconds
  retryAttempts = 3;
  deadLetterQueue = true;
  processingInterval = 100; // 100ms
  maxQueueSize = 10000;
  circuitBreakerEnabled = true;
}

export interface MessageBusStats {
  queueSize: number;
  subscriberCount: number;
  deadLetterQueueSize: number;
  circuitBreakerStates: Record<AgentType, string>;
  isProcessing: boolean;
}

// Message Bus Events
export interface MessageBusEvents {
  'agent_subscribed': { agentType: AgentType; handlerCount: number };
  'agent_unsubscribed': { agentType: AgentType };
  'message_queued': { messageId: string; queueSize: number; priority: Priority };
  'message_delivered': { messageId: string; recipient: string; deliveryTime: number };
  'message_delivery_failed': { messageId: string; recipient: string; error: string };
  'message_dead_lettered': { messageId: string; error: string; deadLetterQueueSize: number };
  'orchestrator_message': AgentMessage;
}

// Utility functions for message creation
export function createMessage(
  sender: AgentType,
  recipient: AgentType | 'orchestrator' | 'broadcast',
  messageType: MessageType,
  payload: any,
  options: Partial<AgentMessage> = {}
): AgentMessage {
  return {
    id: generateMessageId(),
    timestamp: new Date(),
    sender,
    recipient,
    messageType,
    payload,
    priority: Priority.MEDIUM,
    ...options
  };
}

export function createRequest(
  sender: AgentType,
  recipient: AgentType,
  payload: any,
  options: Partial<AgentMessage> = {}
): AgentMessage {
  return createMessage(sender, recipient, MessageType.REQUEST, payload, {
    correlationId: generateCorrelationId(),
    ...options
  });
}

export function createResponse(
  originalMessage: AgentMessage,
  payload: any,
  options: Partial<AgentMessage> = {}
): AgentMessage {
  return createMessage(
    originalMessage.recipient as AgentType,
    originalMessage.sender,
    MessageType.RESPONSE,
    payload,
    {
      correlationId: originalMessage.correlationId,
      ...options
    }
  );
}

// ID generation utilities
let messageCounter = 0;
let correlationCounter = 0;

function generateMessageId(): string {
  return `msg_${Date.now()}_${++messageCounter}`;
}

function generateCorrelationId(): string {
  return `corr_${Date.now()}_${++correlationCounter}`;
}