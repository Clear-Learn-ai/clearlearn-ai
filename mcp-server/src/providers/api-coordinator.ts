import { Anthropic } from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import fetch from 'node-fetch';
import { Logger } from '../utils/logger.js';

interface ConversationContext {
  id: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  subject?: string;
  metadata?: Record<string, any>;
}

export class APICoordinator {
  private logger: Logger;
  private anthropic?: Anthropic;
  private openai?: OpenAI;
  private conversationHistory: Map<string, ConversationContext>;
  private youtubeApiKey?: string;
  private khanAcademyApiKey?: string;

  constructor() {
    this.logger = new Logger('APICoordinator');
    this.conversationHistory = new Map();
    
    // Initialize AI clients if API keys are available
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    }
    
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
    
    this.youtubeApiKey = process.env.YOUTUBE_API_KEY;
    this.khanAcademyApiKey = process.env.KHAN_ACADEMY_API_KEY;
  }

  isHealthy(): boolean {
    return !!(this.anthropic || this.openai);
  }

  async handleRequest(method: string, path: string, body: any) {
    const routes = {
      'POST:/claude': () => this.queryClaude(body.message, body.context, body.model, body.conversationId),
      'POST:/openai': () => this.queryOpenAI(body.message, body.context, body.model, body.conversationId),
      'POST:/youtube': () => this.searchYouTube(body.query, body.subject, body.maxResults),
      'POST:/khan-academy': () => this.searchKhanAcademy(body.query, body.subject, body.maxResults),
      'POST:/analyze-video': () => this.analyzeVideoContent(body.videoId, body.platform),
      'POST:/generate-summary': () => this.generateVideoSummary(body.videoData, body.context),
      'GET:/conversations': () => this.getConversations(),
      'GET:/conversation': () => this.getConversation(body.conversationId),
      'POST:/conversation': () => this.createConversation(body.subject, body.metadata),
      'DELETE:/conversation': () => this.deleteConversation(body.conversationId),
    };

    const route = `${method}:${path}`;
    const handler = routes[route as keyof typeof routes];
    
    if (handler) {
      return await handler();
    }
    
    throw new Error(`API coordination route not found: ${route}`);
  }

  async queryClaude(
    message: string, 
    context?: string, 
    model: string = 'claude-3-sonnet-20240229',
    conversationId?: string
  ): Promise<any> {
    try {
      if (!this.anthropic) {
        throw new Error('Anthropic API key not configured');
      }

      this.logger.info(`Querying Claude with model: ${model}`);
      
      // Get conversation context if provided
      let systemPrompt = 'You are a helpful AI assistant specialized in organic chemistry education.';
      let conversationContext = '';
      
      if (conversationId) {
        const conversation = this.conversationHistory.get(conversationId);
        if (conversation) {
          conversationContext = conversation.messages
            .slice(-10) // Last 10 messages for context
            .map(m => `${m.role}: ${m.content}`)
            .join('\n');
          
          if (conversation.subject) {
            systemPrompt += ` You are currently helping with ${conversation.subject}.`;
          }
        }
      }

      if (context) {
        systemPrompt += ` Additional context: ${context}`;
      }

      if (conversationContext) {
        systemPrompt += `\n\nPrevious conversation context:\n${conversationContext}`;
      }

      const response = await this.anthropic.messages.create({
        model,
        max_tokens: 4000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: message,
          },
        ],
      });

      const assistantMessage = response.content[0];
      const responseText = assistantMessage.type === 'text' ? assistantMessage.text : '';

      // Store in conversation history
      if (conversationId) {
        this.addToConversation(conversationId, 'user', message);
        this.addToConversation(conversationId, 'assistant', responseText);
      }

      return {
        response: responseText,
        model,
        usage: response.usage,
        conversationId,
        message: 'Successfully queried Claude',
      };
    } catch (error) {
      this.logger.error('Failed to query Claude:', error);
      throw error;
    }
  }

  async queryOpenAI(
    message: string, 
    context?: string, 
    model: string = 'gpt-4',
    conversationId?: string
  ): Promise<any> {
    try {
      if (!this.openai) {
        throw new Error('OpenAI API key not configured');
      }

      this.logger.info(`Querying OpenAI with model: ${model}`);
      
      // Build messages array with conversation context
      const messages: any[] = [
        {
          role: 'system',
          content: 'You are a helpful AI assistant specialized in organic chemistry education.',
        },
      ];

      // Add conversation context if provided
      if (conversationId) {
        const conversation = this.conversationHistory.get(conversationId);
        if (conversation) {
          // Add last 10 messages for context
          const recentMessages = conversation.messages.slice(-10);
          for (const msg of recentMessages) {
            messages.push({
              role: msg.role,
              content: msg.content,
            });
          }
        }
      }

      // Add context if provided
      if (context) {
        messages.push({
          role: 'system',
          content: `Additional context: ${context}`,
        });
      }

      // Add current message
      messages.push({
        role: 'user',
        content: message,
      });

      const response = await this.openai.chat.completions.create({
        model,
        messages,
        max_tokens: 4000,
        temperature: 0.7,
      });

      const responseText = response.choices[0]?.message?.content || '';

      // Store in conversation history
      if (conversationId) {
        this.addToConversation(conversationId, 'user', message);
        this.addToConversation(conversationId, 'assistant', responseText);
      }

      return {
        response: responseText,
        model,
        usage: response.usage,
        conversationId,
        message: 'Successfully queried OpenAI',
      };
    } catch (error) {
      this.logger.error('Failed to query OpenAI:', error);
      throw error;
    }
  }

  async searchYouTube(query: string, subject: string = 'organic chemistry', maxResults: number = 10): Promise<any> {
    try {
      if (!this.youtubeApiKey) {
        throw new Error('YouTube API key not configured');
      }

      this.logger.info(`Searching YouTube for: ${query} in ${subject}`);
      
      const searchQuery = `${query} ${subject} tutorial educational`;
      const url = new URL('https://www.googleapis.com/youtube/v3/search');
      url.searchParams.set('part', 'snippet');
      url.searchParams.set('q', searchQuery);
      url.searchParams.set('type', 'video');
      url.searchParams.set('maxResults', maxResults.toString());
      url.searchParams.set('order', 'relevance');
      url.searchParams.set('videoDefinition', 'high');
      url.searchParams.set('key', this.youtubeApiKey);

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data = await response.json() as any;
      
      const videos = data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        channel: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
      }));

      return {
        videos,
        query: searchQuery,
        totalResults: data.pageInfo?.totalResults || videos.length,
        message: `Found ${videos.length} videos for "${query}"`,
      };
    } catch (error) {
      this.logger.error('Failed to search YouTube:', error);
      throw error;
    }
  }

  async searchKhanAcademy(query: string, subject: string = 'organic chemistry', maxResults: number = 10): Promise<any> {
    try {
      this.logger.info(`Searching Khan Academy for: ${query} in ${subject}`);
      
      // Khan Academy's content API endpoint
      const url = new URL('https://www.khanacademy.org/api/v1/topic/organic-chemistry-v5');
      
      const response = await fetch(url.toString(), {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Khan Academy API error: ${response.status}`);
      }

      const data = await response.json() as any;
      
      // Filter and format the content
      const content = this.filterKhanAcademyContent(data, query, maxResults);

      return {
        content,
        query,
        subject,
        message: `Found ${content.length} Khan Academy resources for "${query}"`,
      };
    } catch (error) {
      this.logger.error('Failed to search Khan Academy:', error);
      // Return empty results rather than failing
      return {
        content: [],
        query,
        subject,
        message: `Khan Academy search temporarily unavailable`,
      };
    }
  }

  private filterKhanAcademyContent(data: any, query: string, maxResults: number): any[] {
    const results: any[] = [];
    const queryLower = query.toLowerCase();
    
    const processNode = (node: any) => {
      if (results.length >= maxResults) return;
      
      // Check if this node matches the query
      if (node.title && node.title.toLowerCase().includes(queryLower)) {
        results.push({
          id: node.id,
          title: node.title,
          description: node.description || '',
          url: `https://www.khanacademy.org${node.relative_url || ''}`,
          type: node.kind || 'unknown',
          thumbnail: node.image_url || '',
        });
      }
      
      // Process children if they exist
      if (node.children && Array.isArray(node.children)) {
        for (const child of node.children) {
          processNode(child);
        }
      }
    };
    
    if (data) {
      processNode(data);
    }
    
    return results;
  }

  async analyzeVideoContent(videoId: string, platform: string = 'youtube'): Promise<any> {
    try {
      this.logger.info(`Analyzing video content: ${videoId} on ${platform}`);
      
      if (platform === 'youtube' && this.youtubeApiKey) {
        const url = new URL('https://www.googleapis.com/youtube/v3/videos');
        url.searchParams.set('part', 'snippet,contentDetails,statistics');
        url.searchParams.set('id', videoId);
        url.searchParams.set('key', this.youtubeApiKey);

        const response = await fetch(url.toString());
        
        if (!response.ok) {
          throw new Error(`YouTube API error: ${response.status}`);
        }

        const data = await response.json() as any;
        const video = data.items[0];
        
        if (!video) {
          throw new Error('Video not found');
        }

        return {
          videoId,
          platform,
          title: video.snippet.title,
          description: video.snippet.description,
          duration: video.contentDetails.duration,
          viewCount: video.statistics.viewCount,
          likeCount: video.statistics.likeCount,
          channel: video.snippet.channelTitle,
          publishedAt: video.snippet.publishedAt,
          tags: video.snippet.tags || [],
          transcript: null, // Would need additional API for transcript
          message: 'Successfully analyzed video content',
        };
      }

      throw new Error(`Platform ${platform} not supported for video analysis`);
    } catch (error) {
      this.logger.error('Failed to analyze video content:', error);
      throw error;
    }
  }

  async generateVideoSummary(videoData: any, context?: string): Promise<any> {
    try {
      this.logger.info(`Generating summary for video: ${videoData.title}`);
      
      const prompt = `
        Please create a comprehensive summary for this educational video:
        
        Title: ${videoData.title}
        Description: ${videoData.description}
        Duration: ${videoData.duration || 'Unknown'}
        Channel: ${videoData.channel || 'Unknown'}
        ${context ? `Context: ${context}` : ''}
        
        Please provide:
        1. A brief overview of what the video covers
        2. Key concepts explained
        3. Learning objectives
        4. Prerequisites (if any)
        5. Difficulty level
        6. How this relates to organic chemistry studies
      `;

      // Use Claude if available, fallback to OpenAI
      let summary;
      if (this.anthropic) {
        const result = await this.queryClaude(prompt, context);
        summary = result.response;
      } else if (this.openai) {
        const result = await this.queryOpenAI(prompt, context);
        summary = result.response;
      } else {
        throw new Error('No AI service available for summary generation');
      }

      return {
        videoData,
        summary,
        generatedAt: new Date().toISOString(),
        message: 'Successfully generated video summary',
      };
    } catch (error) {
      this.logger.error('Failed to generate video summary:', error);
      throw error;
    }
  }

  // Conversation management methods
  createConversation(subject?: string, metadata?: Record<string, any>): any {
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const conversation: ConversationContext = {
      id: conversationId,
      messages: [],
      subject,
      metadata,
    };
    
    this.conversationHistory.set(conversationId, conversation);
    
    this.logger.info(`Created conversation: ${conversationId}`);
    
    return {
      conversationId,
      subject,
      metadata,
      message: 'Successfully created conversation',
    };
  }

  getConversation(conversationId: string): any {
    const conversation = this.conversationHistory.get(conversationId);
    
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }
    
    return {
      conversation,
      message: 'Successfully retrieved conversation',
    };
  }

  getConversations(): any {
    const conversations = Array.from(this.conversationHistory.values()).map(conv => ({
      id: conv.id,
      subject: conv.subject,
      messageCount: conv.messages.length,
      lastMessage: conv.messages[conv.messages.length - 1]?.timestamp,
      metadata: conv.metadata,
    }));
    
    return {
      conversations: conversations.sort((a, b) => 
        (b.lastMessage?.getTime() || 0) - (a.lastMessage?.getTime() || 0)
      ),
      total: conversations.length,
      message: 'Successfully retrieved conversations',
    };
  }

  deleteConversation(conversationId: string): any {
    const deleted = this.conversationHistory.delete(conversationId);
    
    if (!deleted) {
      throw new Error(`Conversation ${conversationId} not found`);
    }
    
    this.logger.info(`Deleted conversation: ${conversationId}`);
    
    return {
      conversationId,
      message: 'Successfully deleted conversation',
    };
  }

  private addToConversation(conversationId: string, role: 'user' | 'assistant', content: string): void {
    const conversation = this.conversationHistory.get(conversationId);
    
    if (conversation) {
      conversation.messages.push({
        role,
        content,
        timestamp: new Date(),
      });
      
      // Keep only last 50 messages to prevent memory issues
      if (conversation.messages.length > 50) {
        conversation.messages = conversation.messages.slice(-50);
      }
    }
  }
}