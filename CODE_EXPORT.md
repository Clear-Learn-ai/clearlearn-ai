# ClearLearn - Complete Codebase Export

## Project Overview
ClearLearn is an Adaptive Visual Learning System powered by AI that personalizes educational content delivery in real-time. The system learns how each user learns best and adapts between different modalities (animations, simulations, 3D models, concept maps) to optimize learning outcomes.

## 🏗️ Architecture

### Core Technologies
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **AI Integration**: OpenAI/Claude APIs
- **Analytics**: Custom Bayesian inference engine

### Key Features
- ⚡ Real-time adaptation (45-second confusion detection)
- 🧠 Bayesian learning model for user preferences
- 🎯 Automatic prerequisite detection
- 🎮 Multiple content modalities (animation, simulation, 3D, concept maps)
- 🗣️ Voice integration with TTS
- 📊 Comprehensive learning analytics
- 🚀 Performance optimization (< 2s response times)

## 📁 Project Structure

```
ClearLearn/
├── app/                          # Next.js 14 App Router pages
│   ├── page.tsx                  # Landing page with demo widget
│   ├── demo-simple/page.tsx      # YC presentation demo (simplified)
│   ├── admin-simple/page.tsx     # Analytics dashboard (simplified)
│   ├── test-simple/page.tsx      # Basic functionality test
│   ├── status/page.tsx           # System status overview
│   ├── demo/page.tsx             # Full demo with all features
│   ├── admin/page.tsx            # Complete analytics dashboard
│   ├── test-quantum/page.tsx     # Full intelligence layer testing
│   └── layout.tsx                # Root layout
│
├── components/                   # React components
│   ├── ErrorBoundary.tsx        # Production error handling
│   ├── LazyLoader.tsx            # Performance optimization
│   ├── ContentDisplay.tsx       # Main content rendering
│   ├── QueryInput.tsx           # User input interface
│   ├── FeedbackMechanism.tsx    # User feedback collection
│   ├── AnimationRenderer.tsx    # Animation display
│   ├── SimulationRenderer.tsx   # Interactive simulation
│   ├── Model3DRenderer.tsx      # 3D model display
│   └── ConceptMapRenderer.tsx   # Concept map visualization
│
├── generators/                   # Content generation engines
│   ├── AnimatedDiagramGenerator.ts      # Creates animated explanations
│   ├── InteractiveSimulationGenerator.ts # Interactive experiences
│   ├── Model3DGenerator.ts              # 3D visualizations
│   ├── ConceptMapGenerator.ts           # Knowledge graphs
│   └── SmartContentGenerator.ts         # AI-powered content creation
│
├── intelligence/                 # AI adaptation layer
│   ├── BayesianPredictor.ts     # Learning preference prediction
│   ├── UserModel.ts             # User behavior tracking
│   ├── AdaptiveEngine.ts        # Real-time adaptation logic
│   ├── ProgressiveDepthEngine.ts # Complexity scaling
│   ├── PrerequisiteEngine.ts    # Knowledge gap detection
│   ├── VoiceEngine.ts           # Speech integration
│   ├── ContentCacheEngine.ts    # Performance caching
│   ├── APIFallbackEngine.ts     # Multi-provider reliability
│   └── RequestQueueEngine.ts    # Performance optimization
│
├── core/                        # Core system logic
│   ├── LearningEngine.ts        # Main orchestration
│   └── types.ts                 # TypeScript definitions
│
├── lib/                         # Utilities
│   ├── store.ts                 # Zustand state management
│   └── utils.ts                 # Helper functions
│
└── Configuration files
    ├── package.json             # Dependencies
    ├── tsconfig.json            # TypeScript config
    ├── tailwind.config.js       # Styling config
    ├── next.config.ts           # Next.js config
    └── vercel.json              # Deployment config
```

## 🚀 Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   # Create .env.local
   OPENAI_API_KEY=your_openai_key_here
   ANTHROPIC_API_KEY=your_claude_key_here
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Visit pages**:
   - Landing: http://localhost:3000
   - Simple Demo: http://localhost:3000/demo-simple
   - Analytics: http://localhost:3000/admin-simple
   - Status: http://localhost:3000/status

## 📋 Available Pages

### ✅ Working (Simplified) Pages
- `/` - Landing page with marketing content and demo widget
- `/demo-simple` - YC presentation demo without complex dependencies
- `/admin-simple` - Learning analytics dashboard (simplified)
- `/test-simple` - Basic functionality verification
- `/status` - System status and navigation overview

### ⚠️ Full Feature Pages (May need dependency troubleshooting)
- `/demo` - Complete demo with all intelligence features
- `/admin` - Full analytics with live data
- `/test-quantum` - Intelligence layer testing suite

## 🧠 Intelligence System

### Bayesian Learning Engine
The system uses Bayesian inference to build probabilistic models of user learning preferences:

```typescript
// intelligence/BayesianPredictor.ts
class BayesianPredictor {
  updateBelief(userId: string, outcome: LearningOutcome) {
    // Updates probability distributions based on user interactions
    const prior = this.getUserBeliefs(userId)
    const likelihood = this.calculateLikelihood(outcome)
    const posterior = this.bayesianUpdate(prior, likelihood)
    this.storeBeliefs(userId, posterior)
  }
}
```

### Adaptive Engine
Real-time content adaptation based on user behavior:

```typescript
// intelligence/AdaptiveEngine.ts
async adaptContent(userId: string, currentContent: GeneratedContent): Promise<AdaptationResult> {
  const userModel = await this.userModelEngine.getModel(userId)
  const confusion = this.detectConfusion(userModel.recentInteractions)
  
  if (confusion.level > this.confusionThreshold) {
    return this.switchModality(currentContent, userModel.preferences)
  }
}
```

### Content Generators
Multiple specialized generators for different learning modalities:

```typescript
// generators/SmartContentGenerator.ts
async generateContent(concept: string, modality: ContentModality, userContext: UserContext): Promise<GeneratedContent> {
  const generator = this.getGenerator(modality)
  const content = await generator.generate(concept, userContext)
  return this.enhanceWithVoice(content)
}
```

## 📊 Analytics & Monitoring

The system tracks comprehensive learning analytics:
- User learning preferences and patterns
- Modality effectiveness for different concepts
- System performance metrics
- A/B testing for adaptation algorithms

## 🔧 Performance Features

- **Lazy Loading**: Components load on-demand
- **Content Caching**: 50MB LRU cache with intelligent eviction
- **Request Queuing**: Optimized API usage
- **API Fallback**: Multiple provider redundancy
- **Error Boundaries**: Graceful failure handling

## 🚀 Deployment

Ready for production deployment on Vercel with:
- Optimized build configuration
- Error boundaries for all major components
- Performance monitoring
- Scalable architecture

## 🎯 Demo Modes

### YC Presentation Demo (`/demo-simple`)
A 2-minute guided demonstration showing:
1. Initial content delivery (CRISPR animation)
2. Confusion detection and adaptation
3. Successful learning with new modality
4. System learning for future interactions

### Interactive Demo (`/test-quantum`)
Full intelligence layer demonstration with real AI adaptation.

---

## Key Files to Review

For understanding the core system, focus on these files:

1. **`app/page.tsx`** - Landing page and marketing
2. **`app/demo-simple/page.tsx`** - Main demonstration
3. **`core/LearningEngine.ts`** - System orchestration
4. **`intelligence/BayesianPredictor.ts`** - AI learning engine
5. **`intelligence/AdaptiveEngine.ts`** - Real-time adaptation
6. **`generators/SmartContentGenerator.ts`** - Content creation

This system represents a breakthrough in personalized education technology, combining cutting-edge AI with practical educational applications.