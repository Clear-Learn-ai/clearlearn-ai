# Cursor MCP Integration Setup Guide

This guide will help you integrate the AI Tutor MCP Server with your Cursor IDE environment for seamless development workflow.

## 🚀 Quick Setup

### Step 1: Prepare the MCP Server

1. **Navigate to the MCP server directory:**
   ```bash
   cd C:\Users\fonke\OneDrive\Desktop\Clearlearn\mcp-server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` file with your API keys:**
   ```env
   # Required for AI functionality
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here

   # GitHub integration
   GITHUB_TOKEN=your_github_personal_access_token
   GITHUB_OWNER=Clear-Learn-ai
   GITHUB_REPO=clearlearn-ai

   # Optional: Video search (get from Google Console)
   YOUTUBE_API_KEY=your_youtube_api_key_here

   # Server configuration
   MCP_SERVER_PORT=10000
   MCP_SERVER_HOST=localhost
   PROJECT_ROOT=C:/Users/fonke/OneDrive/Desktop/Clearlearn
   ```

5. **Build the server:**
   ```bash
   npm run build
   ```

6. **Test the server:**
   ```bash
   npm run dev
   ```
   You should see: `MCP Server running on http://localhost:10000`

### Step 2: Configure Cursor IDE

1. **Find your Cursor configuration directory:**
   - **Windows**: `%APPDATA%\\Cursor\\User\\globalStorage\\`
   - **macOS**: `~/Library/Application Support/Cursor/User/globalStorage/`
   - **Linux**: `~/.config/Cursor/User/globalStorage/`

2. **Create MCP configuration directory:**
   ```bash
   # Windows (run in PowerShell)
   mkdir "$env:APPDATA\\Cursor\\User\\globalStorage\\cursor.mcp" -Force

   # macOS/Linux
   mkdir -p ~/Library/Application\ Support/Cursor/User/globalStorage/cursor.mcp
   ```

3. **Create the MCP configuration file:**

   **Windows**: Create `%APPDATA%\\Cursor\\User\\globalStorage\\cursor.mcp\\config.json`
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
           "ANTHROPIC_API_KEY": "your_anthropic_api_key_here",
           "OPENAI_API_KEY": "your_openai_api_key_here",
           "GITHUB_TOKEN": "your_github_token_here",
           "GITHUB_OWNER": "Clear-Learn-ai",
           "GITHUB_REPO": "clearlearn-ai",
           "YOUTUBE_API_KEY": "your_youtube_api_key_here",
           "PROJECT_ROOT": "C:/Users/fonke/OneDrive/Desktop/Clearlearn",
           "MCP_SERVER_PORT": "10000",
           "LOG_LEVEL": "info"
         }
       }
     }
   }
   ```

   **macOS**: Create `~/Library/Application Support/Cursor/User/globalStorage/cursor.mcp/config.json`
   ```json
   {
     "mcpServers": {
       "ai-tutor": {
         "command": "node",
         "args": [
           "/Users/your-username/path/to/Clearlearn/mcp-server/dist/index.js",
           "--stdio"
         ],
         "env": {
           "ANTHROPIC_API_KEY": "your_anthropic_api_key_here",
           "OPENAI_API_KEY": "your_openai_api_key_here",
           "GITHUB_TOKEN": "your_github_token_here",
           "PROJECT_ROOT": "/Users/your-username/path/to/Clearlearn"
         }
       }
     }
   }
   ```

4. **Alternative: HTTP Mode Configuration (if stdio has issues):**
   ```json
   {
     "mcpServers": {
       "ai-tutor": {
         "transport": "http",
         "baseUrl": "http://localhost:10000",
         "headers": {
           "Authorization": "Bearer your_api_key_if_needed"
         }
       }
     }
   }
   ```

### Step 3: Restart and Verify

1. **Close Cursor completely**
2. **Start the MCP server in a separate terminal:**
   ```bash
   cd C:\Users\fonke\OneDrive\Desktop\Clearlearn\mcp-server
   npm run dev -- --stdio
   ```

3. **Open Cursor IDE**
4. **Check MCP integration in Cursor:**
   - Look for MCP indicators in the status bar
   - Check if AI Tutor tools are available
   - Open Command Palette (Ctrl+Shift+P) and look for MCP commands

## 🛠️ Available MCP Tools

Once configured, you'll have access to these tools in Cursor:

### GitHub Operations
- `github_read_file` - Read files from your repository
- `github_write_file` - Create or update repository files
- `github_create_pr` - Create pull requests

### AI Integration
- `ai_query_claude` - Query Claude AI with context
- `ai_query_openai` - Query OpenAI with conversation memory
- `video_search_youtube` - Search for educational videos

### File System
- `fs_read_file` - Read local project files
- `fs_write_file` - Write to local project files
- `fs_list_directory` - Browse project directories

### Figma (if configured)
- `figma_get_file` - Access Figma design files
- `figma_export_images` - Export design assets

## 🎯 Usage Examples in Cursor

### 1. AI-Assisted Code Review
```
// In Cursor, you can now ask:
"Use ai_query_claude to review this React component for organic chemistry education best practices"
```

### 2. Video Content Integration
```
// Search for educational content:
"Use video_search_youtube to find videos about SN2 reactions in organic chemistry"
```

### 3. GitHub Integration
```
// Read repository files:
"Use github_read_file to get the current VideoPlayer component"

// Update files with AI assistance:
"Use github_write_file to update the component with the new features"
```

### 4. Project Structure Analysis
```
// Analyze project structure:
"Use fs_list_directory to show me the current project structure"
```

## 🔧 Advanced Configuration

### Environment Variables in Detail

```env
# AI Services (at least one required)
ANTHROPIC_API_KEY=sk-ant-...     # Claude AI access
OPENAI_API_KEY=sk-...            # OpenAI/GPT access

# GitHub Integration (optional but recommended)
GITHUB_TOKEN=ghp_...             # Personal Access Token
GITHUB_OWNER=Clear-Learn-ai      # Repository owner
GITHUB_REPO=clearlearn-ai        # Repository name

# Video APIs (optional)
YOUTUBE_API_KEY=AIza...          # Google/YouTube Data API v3
KHAN_ACADEMY_API_KEY=...         # Khan Academy API (if available)

# Figma Integration (optional)
FIGMA_ACCESS_TOKEN=figd_...      # Figma personal access token
FIGMA_FILE_KEY=...               # Default Figma file to access

# Server Configuration
MCP_SERVER_PORT=10000            # Port for HTTP mode
MCP_SERVER_HOST=localhost        # Host for HTTP mode
LOG_LEVEL=info                   # Logging level: debug, info, warn, error
PROJECT_ROOT=C:/Users/.../Clearlearn  # Absolute path to project

# Security
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:10000
```

### Custom Tool Configuration

You can extend the MCP server by modifying `src/index.ts` to add custom tools specific to your AI tutor needs:

```typescript
// Add custom organic chemistry tools
{
  name: 'chemistry_formula_validator',
  description: 'Validate organic chemistry formulas',
  inputSchema: {
    type: 'object',
    properties: {
      formula: { type: 'string', description: 'Chemical formula to validate' }
    },
    required: ['formula']
  }
}
```

## 🐛 Troubleshooting

### Common Issues

1. **MCP Server Not Connecting**
   ```bash
   # Check if server is running
   curl http://localhost:10000/health
   
   # Check logs
   tail -f mcp-server.log
   ```

2. **Environment Variables Not Loading**
   - Ensure `.env` file is in the `mcp-server` directory
   - Check that API keys don't have extra spaces or quotes
   - Verify file paths use forward slashes on Windows

3. **Cursor Not Recognizing MCP**
   - Verify config file is in the correct location
   - Check JSON syntax is valid
   - Restart Cursor completely
   - Try HTTP mode instead of stdio

4. **API Authentication Errors**
   ```bash
   # Test API keys manually
   curl -H "Authorization: Bearer $ANTHROPIC_API_KEY" https://api.anthropic.com/v1/messages
   ```

### Debug Mode

Enable debug logging for detailed troubleshooting:

```env
LOG_LEVEL=debug
```

Then check the logs:
```bash
tail -f mcp-server.log | grep DEBUG
```

### Alternative Cursor Configuration

If the standard setup doesn't work, try this alternative:

1. **Start server in HTTP mode:**
   ```bash
   npm run dev
   ```

2. **Use HTTP transport in Cursor config:**
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

## 📚 Next Steps

Once your MCP server is integrated with Cursor:

1. **Test the integration** with simple file operations
2. **Configure your AI API keys** for full functionality
3. **Explore the available tools** for your AI tutor development
4. **Customize the server** to add domain-specific functionality
5. **Set up automated workflows** using the GitHub integration

## 🆘 Getting Help

If you encounter issues:

1. Check the server health endpoint: `http://localhost:10000/health`
2. Review the logs in `mcp-server.log`
3. Verify your environment variables are correct
4. Try the alternative HTTP configuration
5. Restart both the MCP server and Cursor IDE

The MCP server is now ready to enhance your AI tutor development workflow with seamless integration between your IDE, version control, AI services, and educational content platforms!