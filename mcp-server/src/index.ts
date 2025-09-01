#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { GitHubProvider } from './providers/github.js';
import { FigmaProvider } from './providers/figma.js';
import { FilesystemProvider } from './providers/filesystem.js';
import { APICoordinator } from './providers/api-coordinator.js';
import { Logger } from './utils/logger.js';

// Load environment variables
config();

const logger = new Logger('MCP-Server');
const app = express();
const PORT = parseInt(process.env.MCP_SERVER_PORT || '10000');
const HOST = process.env.MCP_SERVER_HOST || 'localhost';

// Initialize providers
const githubProvider = new GitHubProvider();
const figmaProvider = new FigmaProvider();
const filesystemProvider = new FilesystemProvider();
const apiCoordinator = new APICoordinator();

// MCP Server setup
const server = new Server(
  {
    name: 'ai-tutor-mcp-server',
    version: '1.0.0',
    description: 'MCP Server for AI Tutor with multi-platform integrations',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
  }
);

// Express middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/health', (req: any, res: any) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    services: {
      github: githubProvider.isHealthy(),
      figma: figmaProvider.isHealthy(),
      filesystem: filesystemProvider.isHealthy(),
      apiCoordinator: apiCoordinator.isHealthy()
    }
  });
});

// GitHub integration endpoints
app.use('/github', async (req: any, res: any, next: any) => {
  try {
    const result = await githubProvider.handleRequest(req.method, req.path, req.body);
    res.json(result);
  } catch (error) {
    logger.error('GitHub request failed:', error);
    res.status(500).json({ error: 'GitHub integration error' });
  }
});

// Figma integration endpoints
app.use('/figma', async (req: any, res: any, next: any) => {
  try {
    const result = await figmaProvider.handleRequest(req.method, req.path, req.body);
    res.json(result);
  } catch (error) {
    logger.error('Figma request failed:', error);
    res.status(500).json({ error: 'Figma integration error' });
  }
});

// Filesystem access endpoints
app.use('/filesystem', async (req: any, res: any, next: any) => {
  try {
    const result = await filesystemProvider.handleRequest(req.method, req.path, req.body);
    res.json(result);
  } catch (error) {
    logger.error('Filesystem request failed:', error);
    res.status(500).json({ error: 'Filesystem access error' });
  }
});

// API coordination endpoints
app.use('/api', async (req: any, res: any, next: any) => {
  try {
    const result = await apiCoordinator.handleRequest(req.method, req.path, req.body);
    res.json(result);
  } catch (error) {
    logger.error('API coordination failed:', error);
    res.status(500).json({ error: 'API coordination error' });
  }
});

// MCP Tools Registration
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      // GitHub tools
      {
        name: 'github_read_file',
        description: 'Read a file from GitHub repository',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'File path in repository' },
            branch: { type: 'string', description: 'Branch name (optional)', default: 'main' }
          },
          required: ['path']
        }
      },
      {
        name: 'github_write_file',
        description: 'Write/update a file in GitHub repository',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'File path in repository' },
            content: { type: 'string', description: 'File content' },
            message: { type: 'string', description: 'Commit message' },
            branch: { type: 'string', description: 'Branch name (optional)', default: 'main' }
          },
          required: ['path', 'content', 'message']
        }
      },
      {
        name: 'github_create_pr',
        description: 'Create a pull request',
        inputSchema: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'PR title' },
            body: { type: 'string', description: 'PR description' },
            head: { type: 'string', description: 'Source branch' },
            base: { type: 'string', description: 'Target branch', default: 'main' }
          },
          required: ['title', 'head']
        }
      },
      // Figma tools
      {
        name: 'figma_get_file',
        description: 'Get Figma file data',
        inputSchema: {
          type: 'object',
          properties: {
            fileKey: { type: 'string', description: 'Figma file key' }
          },
          required: ['fileKey']
        }
      },
      {
        name: 'figma_export_images',
        description: 'Export images from Figma',
        inputSchema: {
          type: 'object',
          properties: {
            fileKey: { type: 'string', description: 'Figma file key' },
            nodeIds: { type: 'array', items: { type: 'string' }, description: 'Node IDs to export' },
            format: { type: 'string', enum: ['png', 'jpg', 'svg'], default: 'png' }
          },
          required: ['fileKey', 'nodeIds']
        }
      },
      // Filesystem tools
      {
        name: 'fs_read_file',
        description: 'Read a local file',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'File path relative to project root' }
          },
          required: ['path']
        }
      },
      {
        name: 'fs_write_file',
        description: 'Write to a local file',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'File path relative to project root' },
            content: { type: 'string', description: 'File content' }
          },
          required: ['path', 'content']
        }
      },
      {
        name: 'fs_list_directory',
        description: 'List directory contents',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Directory path relative to project root', default: '.' }
          }
        }
      },
      // API coordination tools
      {
        name: 'ai_query_claude',
        description: 'Query Claude AI with context',
        inputSchema: {
          type: 'object',
          properties: {
            message: { type: 'string', description: 'Message for Claude' },
            context: { type: 'string', description: 'Additional context' },
            model: { type: 'string', enum: ['claude-3-sonnet', 'claude-3-haiku'], default: 'claude-3-sonnet' }
          },
          required: ['message']
        }
      },
      {
        name: 'ai_query_openai',
        description: 'Query OpenAI with context',
        inputSchema: {
          type: 'object',
          properties: {
            message: { type: 'string', description: 'Message for OpenAI' },
            context: { type: 'string', description: 'Additional context' },
            model: { type: 'string', enum: ['gpt-4', 'gpt-3.5-turbo'], default: 'gpt-4' }
          },
          required: ['message']
        }
      },
      {
        name: 'video_search_youtube',
        description: 'Search for educational videos on YouTube',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search query' },
            subject: { type: 'string', description: 'Subject filter (e.g., organic chemistry)', default: 'organic chemistry' },
            maxResults: { type: 'number', description: 'Maximum results', default: 10 }
          },
          required: ['query']
        }
      }
    ]
  };
});

// MCP Tool execution handler
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    switch (name) {
      // GitHub tools
      case 'github_read_file':
        return await githubProvider.readFile(args.path, args.branch);
      case 'github_write_file':
        return await githubProvider.writeFile(args.path, args.content, args.message, args.branch);
      case 'github_create_pr':
        return await githubProvider.createPR(args.title, args.body, args.head, args.base);
      
      // Figma tools
      case 'figma_get_file':
        return await figmaProvider.getFile(args.fileKey);
      case 'figma_export_images':
        return await figmaProvider.exportImages(args.fileKey, args.nodeIds, args.format);
      
      // Filesystem tools
      case 'fs_read_file':
        return await filesystemProvider.readFile(args.path);
      case 'fs_write_file':
        return await filesystemProvider.writeFile(args.path, args.content);
      case 'fs_list_directory':
        return await filesystemProvider.listDirectory(args.path);
      
      // API coordination tools
      case 'ai_query_claude':
        return await apiCoordinator.queryClaude(args.message, args.context, args.model);
      case 'ai_query_openai':
        return await apiCoordinator.queryOpenAI(args.message, args.context, args.model);
      case 'video_search_youtube':
        return await apiCoordinator.searchYouTube(args.query, args.subject, args.maxResults);
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    logger.error(`Tool execution failed for ${name}:`, error);
    throw error;
  }
});

// Start HTTP server
app.listen(PORT, HOST, () => {
  logger.info(`MCP Server running on http://${HOST}:${PORT}`);
  logger.info('Available endpoints:');
  logger.info('  GET  /health - Health check');
  logger.info('  POST /github/* - GitHub integration');
  logger.info('  POST /figma/* - Figma integration');
  logger.info('  POST /filesystem/* - Filesystem access');
  logger.info('  POST /api/* - API coordination');
});

// Start MCP server for stdio transport
async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info('MCP Server connected via stdio transport');
}

// Handle both HTTP and MCP stdio
if (process.argv.includes('--stdio')) {
  runServer().catch((error) => {
    logger.error('MCP stdio server failed:', error);
    process.exit(1);
  });
}

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down MCP Server...');
  process.exit(0);
});

export { server, app };