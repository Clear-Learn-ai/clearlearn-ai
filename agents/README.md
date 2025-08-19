# AI Tutor Multi-Agent System

A sophisticated multi-agent architecture designed specifically for pre-med organic chemistry education. This system leverages specialized AI agents working in coordination to provide personalized, adaptive learning experiences.

## 🎯 System Overview

The AI Tutor employs six specialized agents orchestrated through a central coordinator:

1. **Content Specialist Agent** - Deep organic chemistry expertise
2. **Pedagogy Agent** - Learning strategy and adaptation
3. **Visual Learning Agent** - Multimedia content orchestration
4. **Assessment Agent** - Evaluation and feedback
5. **Conversation Agent** - Natural language interface
6. **Resource Agent** - External content integration

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Agent Orchestrator                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Message Bus & Routing                   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
    ┌────▼────┐         ┌────▼────┐         ┌────▼────┐
    │Content  │         │Pedagogy │         │Visual   │
    │Specialist│        │Agent    │         │Learning │
    └─────────┘         └─────────┘         └─────────┘
         │                    │                    │
    ┌────▼────┐         ┌────▼────┐         ┌────▼────┐
    │Assessment│        │Conversation│      │Resource │
    │Agent    │         │Agent     │        │Agent    │
    └─────────┘         └─────────┘         └─────────┘
         │                    │                    │
         └────────────────────▼────────────────────┘
                       MCP Service Layer
         ┌─────────────────────────────────────────────┐
         │  Claude AI │ OpenAI │ YouTube │ GitHub │ Figma│
         └─────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- TypeScript
- MCP Server running (see `../mcp-server/`)
- API keys for Claude/OpenAI, YouTube, GitHub

### Installation

1. **Install dependencies:**
   ```bash
   cd agents
   npm install
   ```

2. **Configure environment:**
   ```bash
   # Copy example configuration
   cp config/development.json config/local.json
   # Edit config/local.json with your settings
   ```

3. **Start the system:**
   ```bash
   # Start all agents
   npm run dev

   # Or start individual agents for development
   npm run agent:content
   npm run agent:pedagogy
   npm run orchestrator
   ```

### Development with Cursor + Claude Code

1. **Set up MCP integration** (see `../CURSOR_MCP_SETUP.md`)
2. **Configure development environment:**
   ```bash
   # Enable hot reload
   npm run dev -- --watch
   
   # Debug mode
   npm run debug
   ```

3. **Use MCP tools in development:**
   - `ai_query_claude` - Get AI assistance for agent development
   - `fs_read_file` - Read agent implementations
   - `github_write_file` - Version control integration
   - `video_search_youtube` - Test content discovery

## 🤖 Agent Specifications

### Content Specialist Agent
**Role:** Domain Expert & Knowledge Curator

**Capabilities:**
- Deep organic chemistry knowledge
- Concept explanation and validation
- Learning prerequisite analysis
- Educational pathway recommendations

**Specializations:**
- Reaction mechanisms (SN1, SN2, E1, E2)
- Functional group chemistry
- Stereochemistry and chirality
- Spectroscopy (NMR, IR, MS)
- Synthesis strategies

**MCP Integration:**
- `ai_query_claude` for advanced reasoning
- `video_search_youtube` for content discovery
- `fs_read_file` for knowledge base access

### Pedagogy Agent
**Role:** Learning Strategy & Adaptation Specialist

**Capabilities:**
- Learning style assessment
- Adaptive questioning strategies
- Spaced repetition scheduling
- Performance analytics

**Features:**
- Bayesian learner modeling
- Difficulty progression management
- Metacognitive skill development
- Personalized study plans

### Visual Learning Agent
**Role:** Multimedia Content Orchestrator

**Capabilities:**
- Video content curation
- Interactive visualization creation
- 3D molecular model generation
- Concept map creation

**Content Types:**
- Molecular structure visualizations
- Reaction mechanism animations
- Interactive problem-solving tools
- Study guides and flashcards

### Assessment Agent
**Role:** Evaluation & Feedback Specialist

**Capabilities:**
- Problem generation and validation
- Answer evaluation and scoring
- Learning gap identification
- Progress tracking

**Assessment Types:**
- Multiple choice questions
- Mechanism drawing problems
- Synthesis pathway challenges
- Spectroscopy interpretation

### Conversation Agent
**Role:** Natural Language Interface

**Capabilities:**
- Natural language understanding
- Context preservation
- Intent recognition
- Emotional support

**Features:**
- Multi-turn conversation handling
- Clarifying question formulation
- Empathetic communication
- Session management

### Resource Agent
**Role:** External Content Integration

**Capabilities:**
- Educational video discovery
- Study material aggregation
- Quality assessment
- Tool recommendations

**Sources:**
- YouTube educational content
- Khan Academy resources
- Academic databases
- Practice problem repositories

## 📡 Communication Protocols

### Message Types
```typescript
enum MessageType {
  REQUEST = 'request',           // Request for processing
  RESPONSE = 'response',         // Response to request
  NOTIFICATION = 'notification', // Broadcast updates
  ERROR = 'error',              // Error reporting
  HEARTBEAT = 'heartbeat'       // Health checking
}
```

### Message Flow Examples

#### Student Query Processing
```
Student Query → Conversation Agent → Orchestrator
                     ↓
         ┌─────────────────────────────┐
         │    Agent Coordination       │
         └─────────────────────────────┘
                     ↓
    Content Specialist + Visual Learning + Assessment
                     ↓
         Response Synthesis → Final Answer
```

#### Learning Adaptation
```
Assessment Results → Pedagogy Agent → Learning Model Update
                                           ↓
                            Updated Learning Path → Content Specialist
                                           ↓
                            Adapted Content → Student
```

## 🔧 Configuration

### Agent Configuration (`config/development.json`)

```json
{
  "agents": {
    "content-specialist": {
      "enabled": true,
      "maxConcurrentTasks": 3,
      "timeout": 45000,
      "mcpTools": ["ai_query_claude", "video_search_youtube"],
      "customConfig": {
        "preferredAIProvider": "claude",
        "maxExplanationLength": 2000,
        "chemistrySpecialization": {
          "organicChemistry": true,
          "biochemistry": true
        }
      }
    }
  }
}
```

### MCP Integration Configuration

```json
{
  "mcp": {
    "serverUrl": "http://localhost:10000",
    "fallbackStrategy": "priority",
    "healthCheckInterval": 30000,
    "timeout": 30000
  }
}
```

## 🧪 Development & Testing

### Running Individual Agents

```bash
# Content Specialist Agent
npm run agent:content

# Pedagogy Agent  
npm run agent:pedagogy

# Full orchestrator
npm run orchestrator
```

### Testing Agent Communication

```typescript
// Example: Test content explanation
const orchestrator = new AgentOrchestrator(config);
await orchestrator.initialize();

const response = await orchestrator.processStudentQuery(
  "What is an SN2 reaction?",
  {
    sessionId: "test_session",
    userId: "test_user",
    studentLevel: "intermediate",
    // ... other context
  }
);

console.log(response.content.text);
console.log(response.content.visualizations);
```

### Health Monitoring

```bash
# Check agent health
curl http://localhost:8080/health

# Agent metrics
curl http://localhost:8080/metrics
```

## 📊 Monitoring & Analytics

### Available Metrics
- Query processing times
- Agent health status
- Error rates and types
- Learning progression analytics
- Content effectiveness metrics

### Event Tracking
- Concept explanations requested
- Learning milestones reached
- Assessment completions
- Video content interactions

## 🔄 Extensibility

### Adding New Agents

1. **Create agent class:**
   ```typescript
   export class NewAgent extends Agent {
     async processMessage(message: AgentMessage): Promise<AgentMessage> {
       // Implementation
     }
     
     getCapabilities(): AgentCapabilities {
       // Return capabilities
     }
   }
   ```

2. **Register in orchestrator:**
   ```typescript
   // Add to agent factory
   [AgentType.NEW_AGENT]: () => new NewAgent(this.messageBus, this.mcpService)
   ```

3. **Update configuration:**
   ```json
   {
     "agents": {
       "new-agent": {
         "enabled": true,
         "maxConcurrentTasks": 2,
         // ... configuration
       }
     }
   }
   ```

### Custom MCP Tools

Add custom tools to the MCP server and reference them in agent configurations:

```json
{
  "mcpTools": ["custom_chemistry_tool", "custom_visualization_tool"]
}
```

## 🚢 Deployment

### Local Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
CMD ["npm", "start"]
```

### Environment Variables
```env
# AI Services
ANTHROPIC_API_KEY=your_claude_key
OPENAI_API_KEY=your_openai_key

# MCP Configuration
MCP_SERVER_URL=http://localhost:10000

# Agent Configuration
AGENT_CONFIG_PATH=./config/production.json
LOG_LEVEL=info
```

## 🔍 Troubleshooting

### Common Issues

1. **Agent Communication Failures**
   - Check message bus health
   - Verify agent registration
   - Review timeout settings

2. **MCP Service Unavailable**
   - Ensure MCP server is running
   - Check API keys and permissions
   - Verify network connectivity

3. **AI Service Errors**
   - Validate API keys
   - Check rate limits
   - Monitor service health

### Debug Mode

```bash
# Enable detailed logging
LOG_LEVEL=debug npm run dev

# Agent-specific debugging
npm run debug agent:content
```

### Health Checks

```bash
# System health
curl http://localhost:8080/health

# Individual agent health
curl http://localhost:8080/agents/content-specialist/health
```

## 📚 Documentation

- [System Architecture](./system-architecture.md)
- [Agent Types & Interfaces](./shared/types/agent-types.ts)
- [Communication Protocols](./shared/protocols/)
- [MCP Integration Guide](../CURSOR_MCP_SETUP.md)
- [Configuration Reference](./config/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests for new functionality
5. Update documentation
6. Submit a pull request

### Development Guidelines

- Follow TypeScript strict mode
- Use ESLint configuration
- Write comprehensive tests
- Document public APIs
- Follow agent interface contracts

## 📄 License

MIT License - see LICENSE file for details

---

## 🌟 Next Steps

This multi-agent system provides a solid foundation for building sophisticated AI tutoring experiences. Key areas for expansion:

1. **Additional Subject Domains** - Extend beyond organic chemistry
2. **Advanced Learning Analytics** - Deeper learner modeling
3. **Real-time Collaboration** - Multi-student learning sessions
4. **Mobile Integration** - Native app agent coordination
5. **VR/AR Experiences** - Immersive chemistry visualization

The modular architecture ensures easy expansion while maintaining system coherence and performance.