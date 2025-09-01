# AI Tutor MCP Server

A comprehensive Model Context Protocol (MCP) server for the AI Tutor project, providing seamless integration with GitHub, Figma, local filesystem, and AI APIs for educational content management.

## Features

### 🔧 **Core Integrations**
- **GitHub Integration**: Repository management, file operations, pull requests
- **Figma Integration**: Design file access, component extraction, asset export
- **Filesystem Access**: Secure local file operations with access controls
- **API Coordination**: Claude AI, OpenAI, YouTube, and Khan Academy integration

### 🎯 **Specialized for Education**
- Organic chemistry domain expertise
- Conversation memory and context management
- Video content search and analysis
- Educational resource aggregation

### 🛡️ **Security Features**
- Path validation and access controls
- File type restrictions
- Blocked directory protection
- Environment variable configuration

## Quick Start

### 1. Install Dependencies
```bash
cd mcp-server
npm install
```

### 2. Environment Configuration
```bash
cp .env.example .env
# Edit .env with your API keys and configuration
```

### 3. Required Environment Variables
```env
# AI API Keys
ANTHROPIC_API_KEY=your_anthropic_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# GitHub Integration
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_OWNER=your_github_username
GITHUB_REPO=your_repo_name

# Figma Integration
FIGMA_ACCESS_TOKEN=your_figma_access_token
FIGMA_FILE_KEY=your_figma_file_key

# Video APIs
YOUTUBE_API_KEY=your_youtube_api_key
KHAN_ACADEMY_API_KEY=your_khan_academy_api_key

# Server Configuration
MCP_SERVER_PORT=10000
MCP_SERVER_HOST=localhost
PROJECT_ROOT=C:/Users/fonke/OneDrive/Desktop/Clearlearn
```

### 4. Start the Server
```bash
# Development mode with hot reload
npm run dev

# Build and start production
npm run build
npm start

# MCP stdio mode (for client integration)
npm run dev -- --stdio
```

## API Endpoints

### Health Check
```http
GET /health
```

### GitHub Operations
```http
POST /github/repos          # List repositories
POST /github/branches       # List branches
POST /github/commits        # List commits
```

### Figma Operations
```http
GET /figma/files            # List recent files
POST /figma/file            # Get file data
POST /figma/export          # Export images
```

### Filesystem Operations
```http
POST /filesystem/read       # Read file
POST /filesystem/write      # Write file
POST /filesystem/list       # List directory
```

### AI & Video Operations
```http
POST /api/claude            # Query Claude AI
POST /api/openai            # Query OpenAI
POST /api/youtube           # Search YouTube
POST /api/khan-academy      # Search Khan Academy
```

## MCP Tools

The server provides these MCP tools for direct integration:

### GitHub Tools
- `github_read_file` - Read repository files
- `github_write_file` - Create/update files
- `github_create_pr` - Create pull requests

### Figma Tools
- `figma_get_file` - Access Figma files
- `figma_export_images` - Export design assets

### Filesystem Tools
- `fs_read_file` - Read local files
- `fs_write_file` - Write local files
- `fs_list_directory` - Browse directories

### AI Tools
- `ai_query_claude` - Query Claude with context
- `ai_query_openai` - Query OpenAI with context
- `video_search_youtube` - Search educational videos

## Cursor IDE Integration

### 1. Configure MCP in Cursor

Create or update your Cursor configuration file:

**Windows**: `%APPDATA%\\Cursor\\User\\globalStorage\\cursor.mcp\\config.json`
**macOS**: `~/Library/Application Support/Cursor/User/globalStorage/cursor.mcp/config.json`
**Linux**: `~/.config/Cursor/User/globalStorage/cursor.mcp/config.json`

```json
{
  "mcpServers": {
    "ai-tutor": {
      "command": "node",
      "args": [
        "C:/Users/fonke/OneDrive/Desktop/Clearlearn/mcp-server/dist/index.js",
        "--stdio"
      ],
      "env": {
        "ANTHROPIC_API_KEY": "your_key_here",
        "OPENAI_API_KEY": "your_key_here",
        "GITHUB_TOKEN": "your_token_here",
        "PROJECT_ROOT": "C:/Users/fonke/OneDrive/Desktop/Clearlearn"
      }
    }
  }
}
```

### 2. Alternative: HTTP Mode
If stdio mode has issues, use HTTP mode:

```json
{
  "mcpServers": {
    "ai-tutor": {
      "transport": "http",
      "baseUrl": "http://localhost:10000"
    }
  }
}
```

### 3. Restart Cursor
After configuration, restart Cursor IDE to load the MCP server.

## Usage Examples

### Query AI with Context
```typescript
// Using MCP tools in your code
const response = await mcp.callTool('ai_query_claude', {
  message: "Explain SN2 reactions in organic chemistry",
  context: "Student is learning about nucleophilic substitution",
  conversationId: "conv_123"
});
```

### Search Educational Videos
```typescript
const videos = await mcp.callTool('video_search_youtube', {
  query: "SN2 reaction mechanism",
  subject: "organic chemistry",
  maxResults: 5
});
```

### GitHub File Operations
```typescript
// Read a file from GitHub
const file = await mcp.callTool('github_read_file', {
  path: "src/components/VideoPlayer.tsx",
  branch: "main"
});

// Update the file
await mcp.callTool('github_write_file', {
  path: "src/components/VideoPlayer.tsx",
  content: updatedContent,
  message: "Add organic chemistry video support"
});
```

### Figma Design Access
```typescript
// Get Figma file data
const design = await mcp.callTool('figma_get_file', {
  fileKey: "your_figma_file_key"
});

// Export specific components
const images = await mcp.callTool('figma_export_images', {
  fileKey: "your_figma_file_key",
  nodeIds: ["component1", "component2"],
  format: "png"
});
```

## Security & Best Practices

### File System Security
- Only whitelisted file extensions are allowed
- Access restricted to project directory
- Blocked paths (node_modules, .env, etc.) are protected
- Path traversal attacks are prevented

### API Key Management
- Store all API keys in environment variables
- Never commit API keys to version control
- Use different keys for development and production
- Regularly rotate access tokens

### Network Security
- CORS configured for specific origins
- Request size limits enforced
- Rate limiting recommended for production
- HTTPS recommended for production deployment

## Development

### Project Structure
```
mcp-server/
├── src/
│   ├── index.ts              # Main server entry point
│   ├── providers/            # Integration providers
│   │   ├── github.ts         # GitHub API integration
│   │   ├── figma.ts          # Figma API integration
│   │   ├── filesystem.ts     # File system operations
│   │   └── api-coordinator.ts # AI & video APIs
│   └── utils/
│       └── logger.ts         # Logging utilities
├── dist/                     # Compiled JavaScript
├── package.json
├── tsconfig.json
└── README.md
```

### Adding New Integrations

1. Create a new provider in `src/providers/`
2. Implement the required interface methods
3. Register the provider in `src/index.ts`
4. Add corresponding MCP tools
5. Update documentation

### Testing

```bash
# Test the health endpoint
curl http://localhost:10000/health

# Test MCP tools (requires MCP client)
npm run test

# Manual testing with stdio
echo '{"method": "tools/list"}' | npm run dev -- --stdio
```

## Troubleshooting

### Common Issues

1. **Server won't start**
   - Check environment variables are set
   - Verify port 10000 is available
   - Check for missing dependencies

2. **API authentication errors**
   - Verify API keys are correct and active
   - Check token permissions for GitHub/Figma
   - Ensure tokens haven't expired

3. **File access denied**
   - Verify PROJECT_ROOT path is correct
   - Check file extensions are whitelisted
   - Ensure paths don't contain blocked directories

4. **Cursor integration not working**
   - Check MCP configuration file path
   - Verify server is built and accessible
   - Restart Cursor after configuration changes

### Logs
Check `mcp-server.log` for detailed error information:
```bash
tail -f mcp-server.log
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Update documentation
6. Submit a pull request

## License

MIT License - see LICENSE file for details