interface QueuedRequest {
  id: string
  priority: number
  timestamp: Date
  concept: string
  userId?: string
  resolve: (result: any) => void
  reject: (error: Error) => void
  estimatedDuration: number
  retryCount: number
  maxRetries: number
}

interface QueueStats {
  totalRequests: number
  completedRequests: number
  failedRequests: number
  averageWaitTime: number
  averageProcessingTime: number
  currentQueueSize: number
  peakQueueSize: number
}

export class RequestQueueEngine {
  private queue: QueuedRequest[] = []
  private processing: Map<string, QueuedRequest> = new Map()
  private maxConcurrent: number = 3
  private stats: QueueStats = {
    totalRequests: 0,
    completedRequests: 0,
    failedRequests: 0,
    averageWaitTime: 0,
    averageProcessingTime: 0,
    currentQueueSize: 0,
    peakQueueSize: 0
  }

  constructor(maxConcurrent: number = 3) {
    this.maxConcurrent = maxConcurrent
    console.log(`🚦 Request Queue Engine initialized (max concurrent: ${maxConcurrent})`)
  }

  /**
   * Add request to queue with priority
   */
  async enqueue<T>(
    request: {
      concept: string
      userId?: string
      processor: () => Promise<T>
      priority?: number
      estimatedDuration?: number
      maxRetries?: number
    }
  ): Promise<T> {
    const requestId = this.generateRequestId()
    
    return new Promise<T>((resolve, reject) => {
      const queuedRequest: QueuedRequest = {
        id: requestId,
        priority: request.priority || 5,
        timestamp: new Date(),
        concept: request.concept,
        userId: request.userId,
        resolve,
        reject,
        estimatedDuration: request.estimatedDuration || 2000,
        retryCount: 0,
        maxRetries: request.maxRetries || 2
      }

      // Store the processor function
      ;(queuedRequest as any).processor = request.processor

      this.queue.push(queuedRequest)
      this.stats.totalRequests++
      this.sortQueue()
      
      console.log(`📥 Queued request ${requestId} for concept: ${request.concept}`)
      
      this.processQueue()
    })
  }

  /**
   * Process the queue
   */
  private async processQueue(): Promise<void> {
    // Update queue size stats
    this.stats.currentQueueSize = this.queue.length
    this.stats.peakQueueSize = Math.max(this.stats.peakQueueSize, this.queue.length)

    // Process requests up to max concurrent limit
    while (this.processing.size < this.maxConcurrent && this.queue.length > 0) {
      const request = this.queue.shift()!
      this.processing.set(request.id, request)
      
      console.log(`🔄 Processing request ${request.id} (${this.processing.size}/${this.maxConcurrent})`)
      
      // Calculate wait time
      const waitTime = Date.now() - request.timestamp.getTime()
      this.updateAverageWaitTime(waitTime)
      
      // Process the request
      this.processRequest(request)
    }
  }

  private async processRequest(request: QueuedRequest): Promise<void> {
    const startTime = Date.now()
    
    try {
      // Execute the processor function
      const processor = (request as any).processor
      const result = await Promise.race([
        processor(),
        this.createTimeout(request.estimatedDuration * 2) // 2x timeout
      ])
      
      const processingTime = Date.now() - startTime
      this.updateAverageProcessingTime(processingTime)
      
      console.log(`✅ Completed request ${request.id} in ${processingTime}ms`)
      
      request.resolve(result)
      this.stats.completedRequests++
      
    } catch (error) {
      console.warn(`❌ Request ${request.id} failed (attempt ${request.retryCount + 1}):`, error)
      
      if (request.retryCount < request.maxRetries) {
        // Retry with backoff
        request.retryCount++
        const backoffDelay = Math.pow(2, request.retryCount) * 1000 // Exponential backoff
        
        setTimeout(() => {
          console.log(`🔄 Retrying request ${request.id} (attempt ${request.retryCount + 1})`)
          this.processRequest(request)
        }, backoffDelay)
        
        return // Don't remove from processing yet
      } else {
        // Max retries exceeded
        request.reject(error as Error)
        this.stats.failedRequests++
      }
    } finally {
      // Remove from processing and continue queue
      this.processing.delete(request.id)
      this.processQueue()
    }
  }

  /**
   * Get queue statistics
   */
  getStats(): QueueStats {
    return { ...this.stats }
  }

  /**
   * Get current queue status
   */
  getQueueStatus(): {
    waiting: number
    processing: number
    estimatedWaitTime: number
  } {
    const avgProcessingTime = this.stats.averageProcessingTime || 2000
    const currentProcessing = this.processing.size
    const waiting = this.queue.length
    
    // Estimate wait time based on queue position and processing speed
    const estimatedWaitTime = waiting > 0 
      ? (avgProcessingTime * Math.ceil(waiting / this.maxConcurrent))
      : 0

    return {
      waiting,
      processing: currentProcessing,
      estimatedWaitTime
    }
  }

  /**
   * Set priority for user requests
   */
  setPriorityForUser(userId: string, priority: number): void {
    // Update priority for all pending requests from this user
    this.queue.forEach(request => {
      if (request.userId === userId) {
        request.priority = priority
      }
    })
    
    this.sortQueue()
    console.log(`🎯 Updated priority to ${priority} for user ${userId}`)
  }

  /**
   * Clear queue (emergency use)
   */
  clearQueue(): void {
    // Reject all pending requests
    this.queue.forEach(request => {
      request.reject(new Error('Queue cleared'))
    })
    
    this.queue = []
    console.log('🗑️ Queue cleared')
  }

  /**
   * Pause/resume queue processing
   */
  private isPaused: boolean = false
  
  pauseQueue(): void {
    this.isPaused = true
    console.log('⏸️ Queue processing paused')
  }
  
  resumeQueue(): void {
    this.isPaused = false
    console.log('▶️ Queue processing resumed')
    this.processQueue()
  }

  /**
   * Get detailed queue information for monitoring
   */
  getQueueDetails(): any[] {
    return [
      ...this.queue.map(req => ({
        id: req.id,
        concept: req.concept,
        userId: req.userId,
        priority: req.priority,
        waitTime: Date.now() - req.timestamp.getTime(),
        status: 'queued',
        retryCount: req.retryCount
      })),
      ...Array.from(this.processing.values()).map(req => ({
        id: req.id,
        concept: req.concept,
        userId: req.userId,
        priority: req.priority,
        processingTime: Date.now() - req.timestamp.getTime(),
        status: 'processing',
        retryCount: req.retryCount
      }))
    ]
  }

  private sortQueue(): void {
    // Sort by priority (higher number = higher priority), then by timestamp
    this.queue.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority // Higher priority first
      }
      return a.timestamp.getTime() - b.timestamp.getTime() // Earlier timestamp first
    })
  }

  private updateAverageWaitTime(waitTime: number): void {
    const count = this.stats.completedRequests + this.stats.failedRequests
    if (count === 0) {
      this.stats.averageWaitTime = waitTime
    } else {
      this.stats.averageWaitTime = (this.stats.averageWaitTime * count + waitTime) / (count + 1)
    }
  }

  private updateAverageProcessingTime(processingTime: number): void {
    const count = this.stats.completedRequests
    if (count === 0) {
      this.stats.averageProcessingTime = processingTime
    } else {
      this.stats.averageProcessingTime = (this.stats.averageProcessingTime * count + processingTime) / (count + 1)
    }
  }

  private createTimeout(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Request timeout after ${ms}ms`)), ms)
    })
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// Singleton instance for global use
export const globalRequestQueue = new RequestQueueEngine(3)