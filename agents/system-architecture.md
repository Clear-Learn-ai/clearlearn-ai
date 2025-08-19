# Multi-Agent AI Tutor System Architecture

## 🏗️ System Overview

The AI Tutor employs a sophisticated multi-agent architecture designed specifically for pre-med organic chemistry education. Each agent has specialized responsibilities while maintaining seamless communication through a centralized orchestrator.

## 🤖 Agent Definitions

### 1. **Content Specialist Agent** 
*Role: Domain Expert & Knowledge Curator*

**Responsibilities:**
- Deep organic chemistry knowledge and concept mapping
- Content validation and accuracy checking
- Learning prerequisite analysis
- Concept difficulty assessment
- Educational pathway recommendations

**Specializations:**
- Reaction mechanisms (SN1, SN2, E1, E2, etc.)
- Functional group chemistry
- Stereochemistry and chirality
- Spectroscopy (NMR, IR, MS)
- Synthesis strategies

**MCP Integration:**
- `ai_query_claude` for advanced chemical reasoning
- `video_search_youtube` for educational content discovery
- `fs_read_file` for accessing chemistry databases

### 2. **Pedagogy Agent**
*Role: Learning Strategy & Adaptation Specialist*

**Responsibilities:**
- Learning style assessment and adaptation
- Difficulty progression management
- Personalized learning path generation
- Study schedule optimization
- Learning outcome prediction

**Capabilities:**
- Bayesian learner modeling
- Adaptive questioning strategies
- Spaced repetition scheduling
- Metacognitive skill development
- Performance analytics

**MCP Integration:**
- `ai_query_openai` for educational psychology insights
- `fs_write_file` for learning progress persistence
- Custom analytics tools

### 3. **Visual Learning Agent**
*Role: Multimedia Content Orchestrator*

**Responsibilities:**
- Video content curation and analysis
- Interactive visualization creation
- Molecular model generation
- Diagram and flowchart creation
- Visual learning assessment

**Content Types:**
- 3D molecular structures
- Reaction mechanism animations
- Interactive problem-solving tools
- Concept maps and flowcharts
- Study guides and flashcards

**MCP Integration:**
- `video_search_youtube` for educational videos
- `figma_export_images` for design assets
- `github_write_file` for content versioning

### 4. **Assessment Agent**
*Role: Evaluation & Feedback Specialist*

**Responsibilities:**
- Problem generation and validation
- Answer evaluation and scoring
- Detailed feedback provision
- Learning gap identification
- Progress tracking and reporting

**Assessment Types:**
- Multiple choice questions
- Mechanism drawing problems
- Synthesis pathway challenges
- Spectroscopy interpretation
- Case-based scenarios

**MCP Integration:**
- `ai_query_claude` for problem generation
- `fs_read_file` for question banks
- Analytics integration

### 5. **Conversation Agent**
*Role: Natural Language Interface & Context Manager*

**Responsibilities:**
- Natural language understanding and generation
- Conversation flow management
- Context preservation across sessions
- Question clarification and refinement
- Emotional support and motivation

**Capabilities:**
- Multi-turn conversation handling
- Intent recognition and classification
- Context-aware response generation
- Clarifying question formulation
- Empathetic communication

**MCP Integration:**
- `ai_query_claude` and `ai_query_openai` for dialogue
- Conversation persistence
- Session management

### 6. **Resource Agent**
*Role: External Content & Tool Integration*

**Responsibilities:**
- External resource discovery and integration
- Study material aggregation
- Reference management
- Tool recommendations
- Content quality assessment

**Resources:**
- Academic papers and textbooks
- Online chemistry databases
- Practice problem repositories
- Study apps and tools
- Peer learning communities

**MCP Integration:**
- `video_search_youtube` for video content
- `github_read_file` for resource databases
- Web scraping and API integration

## 🔄 Communication Protocols

### Agent Communication Framework

```typescript
interface AgentMessage {
  id: string;
  timestamp: Date;
  sender: AgentType;
  recipient: AgentType | 'orchestrator' | 'broadcast';
  messageType: MessageType;
  payload: any;
  context?: ConversationContext;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

enum MessageType {
  REQUEST = 'request',
  RESPONSE = 'response',
  NOTIFICATION = 'notification',
  ERROR = 'error',
  HEARTBEAT = 'heartbeat'
}

enum AgentType {
  CONTENT_SPECIALIST = 'content-specialist',
  PEDAGOGY = 'pedagogy',
  VISUAL_LEARNING = 'visual-learning',
  ASSESSMENT = 'assessment',
  CONVERSATION = 'conversation',
  RESOURCE = 'resource',
  ORCHESTRATOR = 'orchestrator'
}
```

### Communication Patterns

#### 1. **Request-Response Pattern**
```typescript
// Student asks: "What is SN2 reaction?"
Conversation Agent → Content Specialist Agent
{
  messageType: REQUEST,
  payload: {
    query: "What is SN2 reaction?",
    studentLevel: "beginner",
    context: "nucleophilic substitution"
  }
}

Content Specialist Agent → Conversation Agent
{
  messageType: RESPONSE,
  payload: {
    explanation: "...",
    visualizations: [...],
    prerequisites: [...],
    nextSteps: [...]
  }
}
```

#### 2. **Collaborative Pattern**
```typescript
// Multi-agent collaboration for complex queries
Orchestrator → [Content Specialist, Visual Learning, Assessment]
{
  messageType: REQUEST,
  payload: {
    task: "explain_mechanism",
    reaction: "SN2",
    studentProfile: {...}
  }
}
```

#### 3. **Event-Driven Pattern**
```typescript
// Progress update triggers multiple agents
Assessment Agent → broadcast
{
  messageType: NOTIFICATION,
  payload: {
    event: "learning_milestone_reached",
    student: "user123",
    topic: "stereochemistry",
    performance: 0.85
  }
}
```

### Message Bus Architecture

```typescript
class AgentMessageBus {
  private subscribers: Map<AgentType, Agent[]>;
  private messageQueue: PriorityQueue<AgentMessage>;
  private routingTable: Map<MessageType, AgentType[]>;

  async route(message: AgentMessage): Promise<void>;
  async broadcast(message: AgentMessage): Promise<void>;
  async subscribe(agentType: AgentType, agent: Agent): Promise<void>;
  async unsubscribe(agentType: AgentType, agent: Agent): Promise<void>;
}
```

## 🎯 MCP Integration Points

### Primary Integration Map

| Agent | Primary MCP Tools | Secondary MCP Tools |
|-------|------------------|-------------------|
| **Content Specialist** | `ai_query_claude`, `video_search_youtube` | `fs_read_file`, `github_read_file` |
| **Pedagogy** | `ai_query_openai`, `fs_write_file` | Analytics tools |
| **Visual Learning** | `figma_export_images`, `video_search_youtube` | `github_write_file` |
| **Assessment** | `ai_query_claude`, `fs_read_file` | Question bank tools |
| **Conversation** | `ai_query_claude`, `ai_query_openai` | Session persistence |
| **Resource** | `video_search_youtube`, `github_read_file` | Web APIs |

### MCP Service Layer

```typescript
class MCPServiceLayer {
  // AI Services
  async queryAI(provider: 'claude' | 'openai', prompt: string, context?: any): Promise<string>;
  
  // Content Services
  async searchVideos(query: string, subject: string): Promise<VideoResult[]>;
  async getDesignAssets(nodeIds: string[]): Promise<AssetResult[]>;
  
  // File Services
  async readProjectFile(path: string): Promise<string>;
  async writeProjectFile(path: string, content: string): Promise<void>;
  
  // GitHub Services
  async readRepoFile(path: string, branch?: string): Promise<string>;
  async writeRepoFile(path: string, content: string, message: string): Promise<void>;
  
  // Analytics Services
  async trackEvent(event: string, data: any): Promise<void>;
  async getAnalytics(query: any): Promise<AnalyticsResult>;
}
```

## 🎮 Agent Orchestration Framework

### Core Orchestrator

```typescript
class AgentOrchestrator {
  private agents: Map<AgentType, Agent>;
  private messageBus: AgentMessageBus;
  private mcpService: MCPServiceLayer;
  private conversationManager: ConversationManager;

  constructor() {
    this.initializeAgents();
    this.setupMessageRouting();
    this.startHealthChecking();
  }

  async processStudentQuery(query: string, context: ConversationContext): Promise<TutorResponse> {
    // 1. Route to Conversation Agent for processing
    const processedQuery = await this.routeToAgent('conversation', {
      type: 'process_query',
      query,
      context
    });

    // 2. Determine required agents based on query analysis
    const requiredAgents = await this.determineRequiredAgents(processedQuery);

    // 3. Coordinate multi-agent response
    const responses = await Promise.all(
      requiredAgents.map(agentType => 
        this.routeToAgent(agentType, processedQuery)
      )
    );

    // 4. Synthesize final response
    return await this.synthesizeResponse(responses, context);
  }

  private async determineRequiredAgents(query: ProcessedQuery): Promise<AgentType[]> {
    const agents: AgentType[] = ['conversation']; // Always include conversation

    if (query.needsExplanation) agents.push('content-specialist');
    if (query.needsVisualization) agents.push('visual-learning');
    if (query.needsAssessment) agents.push('assessment');
    if (query.needsResources) agents.push('resource');
    if (query.needsLearningPath) agents.push('pedagogy');

    return agents;
  }
}
```

### Agent Base Class

```typescript
abstract class Agent {
  protected agentType: AgentType;
  protected messageBus: AgentMessageBus;
  protected mcpService: MCPServiceLayer;
  protected config: AgentConfig;

  constructor(type: AgentType, messageBus: AgentMessageBus, mcpService: MCPServiceLayer) {
    this.agentType = type;
    this.messageBus = messageBus;
    this.mcpService = mcpService;
    this.initialize();
  }

  abstract async processMessage(message: AgentMessage): Promise<AgentMessage>;
  abstract async initialize(): Promise<void>;
  abstract async healthCheck(): Promise<boolean>;

  protected async sendMessage(recipient: AgentType, payload: any, messageType = MessageType.REQUEST): Promise<void> {
    const message: AgentMessage = {
      id: generateId(),
      timestamp: new Date(),
      sender: this.agentType,
      recipient,
      messageType,
      payload,
      priority: 'medium'
    };

    await this.messageBus.route(message);
  }
}
```

## 🔧 Local Development Setup

### Cursor + Claude Code Integration

#### 1. Project Structure
```
ai-tutor/
├── agents/                    # Agent implementations
│   ├── content-specialist/
│   ├── pedagogy/
│   ├── visual-learning/
│   ├── assessment/
│   ├── conversation/
│   ├── resource/
│   └── orchestrator/
├── mcp-server/               # MCP server from previous setup
├── shared/                   # Shared types and utilities
│   ├── types/
│   ├── protocols/
│   └── utils/
├── config/                   # Configuration files
├── tests/                    # Test suites
└── docs/                     # Documentation
```

#### 2. Development Workflow

**Step 1: Start MCP Server**
```bash
cd mcp-server
npm run dev -- --stdio
```

**Step 2: Start Agent Development**
```bash
cd agents
npm run dev
```

**Step 3: Configure Cursor**
- MCP integration provides AI assistance
- GitHub integration for version control
- File system access for rapid development

#### 3. Agent Development Template

```typescript
// Template for creating new agents
export class NewAgent extends Agent {
  constructor(messageBus: AgentMessageBus, mcpService: MCPServiceLayer) {
    super(AgentType.NEW_AGENT, messageBus, mcpService);
  }

  async processMessage(message: AgentMessage): Promise<AgentMessage> {
    switch (message.payload.type) {
      case 'specific_task':
        return await this.handleSpecificTask(message);
      default:
        throw new Error(`Unknown message type: ${message.payload.type}`);
    }
  }

  async initialize(): Promise<void> {
    // Agent-specific initialization
    await this.loadConfiguration();
    await this.setupMCPConnections();
    await this.registerMessageHandlers();
  }

  async healthCheck(): Promise<boolean> {
    // Health check implementation
    return true;
  }

  private async handleSpecificTask(message: AgentMessage): Promise<AgentMessage> {
    // Use MCP services for external integrations
    const aiResponse = await this.mcpService.queryAI('claude', message.payload.query);
    
    return {
      id: generateId(),
      timestamp: new Date(),
      sender: this.agentType,
      recipient: message.sender,
      messageType: MessageType.RESPONSE,
      payload: { result: aiResponse },
      priority: 'medium'
    };
  }
}
```

## 🚀 Expandability Features

### 1. **Dynamic Agent Loading**
```typescript
class AgentRegistry {
  private registeredAgents: Map<string, AgentConstructor>;

  registerAgent(name: string, constructor: AgentConstructor): void;
  createAgent(name: string, config: AgentConfig): Agent;
  listAvailableAgents(): string[];
}
```

### 2. **Plugin Architecture**
```typescript
interface AgentPlugin {
  name: string;
  version: string;
  dependencies: string[];
  install(agent: Agent): Promise<void>;
  uninstall(agent: Agent): Promise<void>;
}
```

### 3. **Configuration Management**
```typescript
interface SystemConfig {
  agents: {
    [agentType: string]: {
      enabled: boolean;
      config: any;
      plugins: string[];
    };
  };
  communication: {
    messageTimeout: number;
    retryAttempts: number;
    priorityQueues: boolean;
  };
  mcp: {
    endpoints: MCPEndpoint[];
    fallbackStrategy: 'round-robin' | 'priority' | 'random';
  };
}
```

This architecture provides a solid foundation for building a sophisticated AI tutor while maintaining flexibility for future enhancements and specializations in organic chemistry education.