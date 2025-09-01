import { AgentType } from '../types/agent-types.js';

// MCP Service Layer for Agent Integration
export class MCPServiceLayer {
  private mcpServerUrl: string;
  private apiKey?: string;
  private requestCache: Map<string, CacheEntry> = new Map();
  private healthStatus: Map<string, boolean> = new Map();

  constructor(
    mcpServerUrl: string = 'http://localhost:10000',
    apiKey?: string
  ) {
    this.mcpServerUrl = mcpServerUrl;
    this.apiKey = apiKey;
    this.startHealthChecking();
  }

  // AI Services Integration
  async queryAI(
    provider: 'claude' | 'openai',
    prompt: string,
    context?: any,
    conversationId?: string,
    agentType?: AgentType
  ): Promise<AIResponse> {
    const cacheKey = this.generateCacheKey('ai_query', { provider, prompt, context });
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return cached.data as AIResponse;
    }

    try {
      const endpoint = provider === 'claude' ? '/api/claude' : '/api/openai';
      const response = await this.makeRequest(endpoint, {
        message: prompt,
        context: context ? JSON.stringify(context) : undefined,
        conversationId,
        agentMetadata: {
          agentType,
          timestamp: new Date().toISOString()
        }
      });

      this.setCache(cacheKey, response, 300); // Cache for 5 minutes
      return response as AIResponse;
    } catch (error) {
      throw new MCPError(`AI query failed for ${provider}`, 'AI_QUERY_FAILED', error);
    }
  }

  // Content Discovery Services
  async searchVideos(
    query: string,
    subject: string = 'organic chemistry',
    maxResults: number = 10,
    quality: 'any' | 'high' | 'verified' = 'high'
  ): Promise<VideoSearchResult> {
    const cacheKey = this.generateCacheKey('video_search', { query, subject, maxResults, quality });
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return cached.data as VideoSearchResult;
    }

    try {
      const response = await this.makeRequest('/api/youtube', {
        query,
        subject,
        maxResults,
        filter: {
          quality,
          educational: true,
          duration: 'any'
        }
      });

      this.setCache(cacheKey, response, 1800); // Cache for 30 minutes
      return response as VideoSearchResult;
    } catch (error) {
      throw new MCPError('Video search failed', 'VIDEO_SEARCH_FAILED', error);
    }
  }

  async searchKhanAcademy(
    query: string,
    subject: string = 'organic chemistry',
    maxResults: number = 10
  ): Promise<KhanAcademyResult> {
    try {
      const response = await this.makeRequest('/api/khan-academy', {
        query,
        subject,
        maxResults
      });

      return response as KhanAcademyResult;
    } catch (error) {
      throw new MCPError('Khan Academy search failed', 'KHAN_ACADEMY_FAILED', error);
    }
  }

  // File System Services
  async readProjectFile(path: string): Promise<FileContent> {
    try {
      const response = await this.makeRequest('/filesystem/read', { path });
      return response as FileContent;
    } catch (error) {
      throw new MCPError(`Failed to read file: ${path}`, 'FILE_READ_FAILED', error);
    }
  }

  async writeProjectFile(path: string, content: string): Promise<FileOperation> {
    try {
      const response = await this.makeRequest('/filesystem/write', { path, content });
      return response as FileOperation;
    } catch (error) {
      throw new MCPError(`Failed to write file: ${path}`, 'FILE_WRITE_FAILED', error);
    }
  }

  async listDirectory(path: string = '.'): Promise<DirectoryListing> {
    try {
      const response = await this.makeRequest('/filesystem/list', { path });
      return response as DirectoryListing;
    } catch (error) {
      throw new MCPError(`Failed to list directory: ${path}`, 'DIRECTORY_LIST_FAILED', error);
    }
  }

  async searchFiles(query: string, searchPath: string = '.'): Promise<FileSearchResult> {
    try {
      const response = await this.makeRequest('/filesystem/search', { query, path: searchPath });
      return response as FileSearchResult;
    } catch (error) {
      throw new MCPError(`File search failed for: ${query}`, 'FILE_SEARCH_FAILED', error);
    }
  }

  // GitHub Integration Services
  async readRepoFile(path: string, branch: string = 'main'): Promise<GitHubFileContent> {
    try {
      const response = await this.makeRequest('/github/read', { path, branch });
      return response as GitHubFileContent;
    } catch (error) {
      throw new MCPError(`Failed to read GitHub file: ${path}`, 'GITHUB_READ_FAILED', error);
    }
  }

  async writeRepoFile(
    path: string,
    content: string,
    message: string,
    branch: string = 'main'
  ): Promise<GitHubOperation> {
    try {
      const response = await this.makeRequest('/github/write', {
        path,
        content,
        message,
        branch
      });
      return response as GitHubOperation;
    } catch (error) {
      throw new MCPError(`Failed to write GitHub file: ${path}`, 'GITHUB_WRITE_FAILED', error);
    }
  }

  async createPullRequest(
    title: string,
    body: string,
    head: string,
    base: string = 'main'
  ): Promise<PullRequestResult> {
    try {
      const response = await this.makeRequest('/github/pr', {
        title,
        body,
        head,
        base
      });
      return response as PullRequestResult;
    } catch (error) {
      throw new MCPError('Failed to create pull request', 'GITHUB_PR_FAILED', error);
    }
  }

  // Figma Integration Services
  async getFigmaFile(fileKey: string): Promise<FigmaFileData> {
    const cacheKey = this.generateCacheKey('figma_file', { fileKey });
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return cached.data as FigmaFileData;
    }

    try {
      const response = await this.makeRequest('/figma/file', { fileKey });
      this.setCache(cacheKey, response, 600); // Cache for 10 minutes
      return response as FigmaFileData;
    } catch (error) {
      throw new MCPError(`Failed to get Figma file: ${fileKey}`, 'FIGMA_FILE_FAILED', error);
    }
  }

  async exportFigmaImages(
    fileKey: string,
    nodeIds: string[],
    format: 'png' | 'jpg' | 'svg' = 'png'
  ): Promise<FigmaExportResult> {
    try {
      const response = await this.makeRequest('/figma/export', {
        fileKey,
        nodeIds,
        format
      });
      return response as FigmaExportResult;
    } catch (error) {
      throw new MCPError('Failed to export Figma images', 'FIGMA_EXPORT_FAILED', error);
    }
  }

  // Analytics and Tracking Services
  async trackEvent(
    event: string,
    data: any,
    agentType?: AgentType,
    userId?: string
  ): Promise<void> {
    try {
      await this.makeRequest('/analytics/track', {
        event,
        data,
        agentType,
        userId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      // Non-critical error, log but don't throw
      console.warn('Analytics tracking failed:', error);
    }
  }

  async getAnalytics(
    query: AnalyticsQuery,
    agentType?: AgentType
  ): Promise<AnalyticsResult> {
    try {
      const response = await this.makeRequest('/analytics/query', {
        ...query,
        agentType
      });
      return response as AnalyticsResult;
    } catch (error) {
      throw new MCPError('Analytics query failed', 'ANALYTICS_FAILED', error);
    }
  }

  // Health and Status Services
  async getHealth(): Promise<HealthStatus> {
    try {
      const response = await fetch(`${this.mcpServerUrl}/health`);
      const data = await response.json();
      
      // Update health status cache
      for (const [service, status] of Object.entries(data.services)) {
        this.healthStatus.set(service, status as boolean);
      }
      
      return data as HealthStatus;
    } catch (error) {
      throw new MCPError('Health check failed', 'HEALTH_CHECK_FAILED', error);
    }
  }

  isServiceHealthy(serviceName: string): boolean {
    return this.healthStatus.get(serviceName) ?? false;
  }

  // Conversation Management Services
  async createConversation(
    subject?: string,
    metadata?: any
  ): Promise<ConversationSession> {
    try {
      const response = await this.makeRequest('/api/conversation', {
        subject,
        metadata
      });
      return response as ConversationSession;
    } catch (error) {
      throw new MCPError('Failed to create conversation', 'CONVERSATION_CREATE_FAILED', error);
    }
  }

  async getConversation(conversationId: string): Promise<ConversationSession> {
    try {
      const response = await this.makeRequest('/api/conversation', { conversationId });
      return response as ConversationSession;
    } catch (error) {
      throw new MCPError('Failed to get conversation', 'CONVERSATION_GET_FAILED', error);
    }
  }

  // Batch Operations
  async batchRequest(operations: BatchOperation[]): Promise<BatchResult[]> {
    try {
      const response = await this.makeRequest('/batch', { operations });
      return response as BatchResult[];
    } catch (error) {
      throw new MCPError('Batch request failed', 'BATCH_FAILED', error);
    }
  }

  // Private helper methods
  private async makeRequest(endpoint: string, data?: any): Promise<any> {
    const url = `${this.mcpServerUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return await response.json();
  }

  private generateCacheKey(operation: string, params: any): string {
    const paramString = JSON.stringify(params, Object.keys(params).sort());
    return `${operation}:${Buffer.from(paramString).toString('base64')}`;
  }

  private getFromCache(key: string): CacheEntry | null {
    const entry = this.requestCache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.requestCache.delete(key);
      return null;
    }
    
    return entry;
  }

  private setCache(key: string, data: any, ttlSeconds: number): void {
    const entry: CacheEntry = {
      data,
      expiresAt: Date.now() + (ttlSeconds * 1000)
    };
    
    this.requestCache.set(key, entry);
    
    // Basic cache size management
    if (this.requestCache.size > 1000) {
      const oldestKey = this.requestCache.keys().next().value;
      if (oldestKey) {
        this.requestCache.delete(oldestKey);
      }
    }
  }

  private startHealthChecking(): void {
    // Check health every 30 seconds
    setInterval(async () => {
      try {
        await this.getHealth();
      } catch (error) {
        console.warn('Health check failed:', error);
      }
    }, 30000);
  }
}

// Type Definitions
interface CacheEntry {
  data: any;
  expiresAt: number;
}

export interface AIResponse {
  response: string;
  model: string;
  usage?: any;
  conversationId?: string;
  confidence?: number;
}

export interface VideoSearchResult {
  videos: VideoContent[];
  query: string;
  totalResults: number;
  message: string;
}

export interface VideoContent {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnailUrl?: string;
  duration: number;
  channel: string;
  publishedAt: string;
  embedUrl: string;
  relevanceScore?: number;
}

export interface KhanAcademyResult {
  content: KhanAcademyContent[];
  query: string;
  subject: string;
  message: string;
}

export interface KhanAcademyContent {
  id: string;
  title: string;
  description: string;
  url: string;
  type: string;
  thumbnail?: string;
}

export interface FileContent {
  content: string;
  path: string;
  size: number;
  modified: Date;
  message: string;
}

export interface FileOperation {
  path: string;
  size: number;
  modified: Date;
  message: string;
}

export interface DirectoryListing {
  path: string;
  directories: FileInfo[];
  files: FileInfo[];
  totalItems: number;
  message: string;
}

export interface FileInfo {
  name: string;
  path: string;
  size: number;
  modified: Date;
  type: 'file' | 'directory';
}

export interface FileSearchResult {
  query: string;
  searchPath: string;
  results: FileSearchMatch[];
  totalFound: number;
  message: string;
}

export interface FileSearchMatch {
  name: string;
  path: string;
  type: 'filename' | 'content';
  size: number;
  modified: Date;
}

export interface GitHubFileContent {
  content: string;
  sha: string;
  path: string;
  message: string;
}

export interface GitHubOperation {
  message: string;
  commit: any;
  content: any;
}

export interface PullRequestResult {
  message: string;
  pullRequest: {
    number: number;
    url: string;
    title: string;
    state: string;
  };
}

export interface FigmaFileData {
  message: string;
  file: {
    name: string;
    lastModified: string;
    thumbnailUrl?: string;
    version: string;
    document: any;
    components: any;
    styles: any;
  };
}

export interface FigmaExportResult {
  message: string;
  images: Record<string, string>;
  format: string;
  scale: number;
}

export interface AnalyticsQuery {
  metric: string;
  timeRange: {
    start: Date;
    end: Date;
  };
  filters?: Record<string, any>;
  groupBy?: string[];
}

export interface AnalyticsResult {
  data: any[];
  summary: {
    total: number;
    average: number;
    trends: any;
  };
  metadata: {
    query: AnalyticsQuery;
    executionTime: number;
  };
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: Record<string, boolean>;
}

export interface ConversationSession {
  conversationId: string;
  subject?: string;
  metadata?: any;
  message: string;
}

export interface BatchOperation {
  id: string;
  type: 'ai_query' | 'file_read' | 'file_write' | 'video_search';
  params: any;
}

export interface BatchResult {
  id: string;
  success: boolean;
  data?: any;
  error?: string;
}

// Error handling
export class MCPError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'MCPError';
  }
}

// Singleton instance for easy access
let mcpServiceInstance: MCPServiceLayer | null = null;

export function getMCPService(mcpServerUrl?: string, apiKey?: string): MCPServiceLayer {
  if (!mcpServiceInstance) {
    mcpServiceInstance = new MCPServiceLayer(mcpServerUrl, apiKey);
  }
  return mcpServiceInstance;
}

export function resetMCPService(): void {
  mcpServiceInstance = null;
}