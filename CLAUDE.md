# TradeAI Tutor Development Guide

This file contains development context and guidelines for working with the TradeAI Tutor platform - an AI-powered visual learning system focused on plumbing apprentice training.

## Project Structure

```
tradeai-tutor/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles and design system
│   ├── layout.tsx         # Root layout with Inter font
│   └── page.tsx           # Home page with main interface
├── core/                  # Learning engine logic
│   ├── LearningEngine.ts  # Main orchestration class
│   └── types.ts          # TypeScript definitions
├── generators/           # Content generation modules
│   ├── AnimatedDiagramGenerator.ts
│   ├── PlumbingDiagramGenerator.ts # Plumbing-specific content
│   └── ThreeDModelGenerator.ts     # 3D pipe models
├── components/           # React components
│   ├── QueryInput.tsx    # Smart input with plumbing autocomplete
│   ├── ContentDisplay.tsx # Content renderer
│   ├── AnimationRenderer.tsx # Canvas animation engine
│   ├── ThreeDRenderer.tsx    # Three.js 3D models
│   ├── VideoPlayer.tsx       # Video demonstrations
│   └── FeedbackMechanism.tsx # User feedback
├── lib/                  # Utilities
│   ├── store.ts          # Zustand state management
│   ├── plumbing/         # Plumbing-specific utilities
│   └── utils.ts          # Utility functions (cn helper)
└── Configuration files   # TypeScript, Tailwind, ESLint, etc.
```

## Development Commands

- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build for production
- `npm run type-check` - TypeScript compilation check
- `npm run lint` - ESLint code quality check

## 🚀 CRITICAL DEPLOYMENT INFORMATION

**IMPORTANT**: This project is actively deployed to Vercel in production.

### Deployment Workflow
1. All changes should be committed to git and pushed to the repository
2. Vercel automatically deploys from the main branch
3. Live site: https://clearlearn-ai.vercel.app (soon to rebrand as TradeAI Tutor)
4. Always test locally before pushing to production

### Before Pushing:
- Run `npm run build` to ensure production build works
- Run `npm run type-check` to catch TypeScript errors
- Run `npm run lint` to ensure code quality
- Test all major features locally

### Environment Variables in Production:
- All API keys are configured in Vercel dashboard
- Database: Supabase (configured)
- Authentication: NextAuth with Google OAuth
- AI Services: OpenAI + Anthropic APIs
- Video: YouTube API integration

## TradeAI Tutor - Plumbing Focus

### Target Audience
- **Primary**: Plumbing apprentices learning hands-on skills
- **Secondary**: Journeymen needing quick reference guides
- **Use Cases**: Jobsite learning, classroom supplements, code reference

### Plumbing-Specific Features
1. **Visual Learning Priority**
   - 3D pipe models with Three.js
   - Step-by-step installation animations
   - Interactive tool identification
   - Code violation visual markers

2. **Sample Questions Library**
   - "How do I install a toilet flange?"
   - "What size pipe for kitchen sink?"
   - "How to fix a P-trap leak?"
   - "Show me different joint types"
   - "What's the code for bathroom venting?"

3. **Content Categories**
   - **Beginner**: Basic pipe types, tool identification
   - **Intermediate**: Installation procedures, code compliance  
   - **Advanced**: Troubleshooting, system design

4. **Mobile-First Design Requirements**
   - Large buttons for gloved hands
   - High contrast for outdoor/basement lighting
   - Offline capability for remote jobsites
   - Quick reference cards for common problems

5. **Visual Content Types**
   - Animated GIFs of cutting techniques
   - 3D models of joint types (sweated, threaded, compression)
   - Flow diagrams showing water/waste movement
   - Interactive hotspots on tools and components
   - Before/after code violation examples

### Technical Integration Points
- **Canadian/US Plumbing Codes**: Reference integration
- **Plumbing Terminology**: Specialized vocabulary system
- **Tool Library**: Interactive identification system
- **3D Models**: Pipe fittings, valves, fixtures
- **Video Integration**: Technique demonstrations

### Advanced 3D Tech Stack (NEW)

#### 3D Libraries & Rendering
- **@react-three/fiber**: React Three.js integration
- **@react-three/drei**: Helper components (OrbitControls, Environment)
- **@react-three/gltfjsx**: 3D model components
- **@react-three/postprocessing**: Realistic rendering effects
- **three-mesh-bvh**: Efficient collision detection
- **r3f-perf**: Real-time performance monitoring

#### Interactive Diagrams & Technical Drawing
- **React Flow**: Plumbing system flowcharts and schematics
- **Konva**: Canvas-based technical drawing engine
- **Fabric.js**: Interactive diagram manipulation
- **@react-spring/three**: Physics-based 3D animations

#### Mobile & Offline Capabilities
- **next-pwa**: Progressive Web App with service workers
- **Workbox**: Offline caching for jobsite access
- **react-webcam**: Camera integration for site documentation

#### 3D Component Architecture
```
components/3d/
├── pipes/                  # Realistic pipe models
│   └── RealisticPipe.tsx  # Material-specific pipes (copper, PVC, PEX)
├── fittings/              # Connection components
│   └── PlumbingFittings.tsx # Elbows, tees, reducers, unions
├── fixtures/              # Bathroom/kitchen fixtures
│   └── PlumbingFixtures.tsx # Toilets, sinks, valves, water heaters
├── tools/                 # Interactive tool models
│   └── PlumbingTools.tsx  # Wrenches, cutters, threading machines
└── PlumbingSceneComposer.tsx # Main 3D scene orchestrator
```

#### Performance Optimizations
- **Adaptive DPR**: Automatic resolution scaling for performance
- **Level-of-Detail (LOD)**: Distance-based model complexity
- **Instanced Rendering**: Efficient rendering of repeated components
- **Frustum Culling**: Only render visible objects
- **Texture Compression**: Optimized materials and textures
- **Progressive Loading**: Lazy loading of 3D assets

#### Mobile-First 3D Features
- **Touch Controls**: Optimized for touch interaction
- **Battery Optimization**: Reduced animation complexity
- **Offline 3D**: Cached models for jobsite use
- **High Contrast Mode**: Enhanced visibility in bright conditions

## Key Design Patterns

### 1. Learning Engine Architecture
The `LearningEngine` class orchestrates the entire pipeline:
1. Query parsing and concept analysis
2. Modality selection (animation, diagram, interactive, etc.)
3. Content generation using appropriate generator
4. Session tracking and metrics collection

### 2. State Management
Using Zustand with optimized selectors:
- `useLearningStore` - Main store
- Individual selectors (e.g., `useCurrentContent`, `useIsGenerating`) for performance

### 3. Animation System
Canvas-based animations with:
- Step-by-step progression
- Element-level animations (fade, move, scale, rotate)
- Interactive controls (play/pause, step navigation)
- Smooth transitions with easing functions

### 4. Content Generation
Modular generator system:
- Each generator implements specific content types
- AnimatedDiagramGenerator creates Canvas animations
- Extensible for future generators (3D, interactive, etc.)

## Code Style Guidelines

### TypeScript
- Strict mode enabled
- Explicit return types for public methods
- Use interfaces for data structures
- Avoid `any` types when possible

### Components
- Use functional components with hooks
- Implement proper TypeScript props interfaces
- Use `cn()` utility for conditional classes
- Optimize with `useCallback` and `useMemo` when needed

### File Naming
- PascalCase for components (e.g., `QueryInput.tsx`)
- camelCase for utilities (e.g., `store.ts`)
- kebab-case for config files (e.g., `tailwind.config.js`)

## Extension Points

### Adding New Content Generators
1. Create new generator in `/generators/`
2. Implement content generation method
3. Add new modality type to `core/types.ts`
4. Update `LearningEngine` to route to new generator
5. Add renderer component if needed

### Adding New UI Components
1. Create component in `/components/`
2. Use proper TypeScript interfaces
3. Follow existing design patterns
4. Import and use in main layout

### Adding New Animation Elements
1. Extend `CanvasElement` type in `core/types.ts`
2. Add drawing logic in `AnimationRenderer.tsx`
3. Update `AnimatedDiagramGenerator` to use new element

## Testing Strategy

### Manual Testing
- Test with "How do I install a toilet flange?" for full demo
- Try plumbing questions like "What size pipe for kitchen sink?"
- Test feedback submission flow
- Verify mobile-first design for jobsite use
- Test high contrast for outdoor lighting conditions

### Development Tools
- TypeScript compiler catches type errors
- ESLint ensures code quality
- Dev server with hot reloading
- Browser dev tools for Canvas debugging

## Performance Considerations

### State Management
- Use selective Zustand subscriptions
- Avoid unnecessary re-renders with proper selectors
- Minimize store updates frequency

### Canvas Animations
- Use `requestAnimationFrame` for smooth 60fps
- Implement proper cleanup in useEffect
- Optimize drawing operations
- Cache expensive calculations

### Bundle Size
- Tree-shake unused dependencies
- Lazy load heavy components
- Use dynamic imports for generators

## Known Limitations & Future Improvements

### Current Limitations
1. Only animation modality fully implemented
2. Simple concept parsing (no NLP/LLM integration)
3. Local state only (no persistence)
4. Limited animation elements

### Planned Improvements
1. Advanced NLP for concept analysis
2. 3D visualization generator
3. User accounts and progress tracking
4. Real-time collaboration features
5. Content library with more subjects

## Troubleshooting

### Common Issues
1. **Canvas not rendering**: Check canvas ref and useEffect dependencies
2. **TypeScript errors**: Ensure all types are properly imported
3. **Animation not smooth**: Verify requestAnimationFrame usage
4. **State not updating**: Check Zustand selector usage

### Development Tools
- React Developer Tools for component debugging
- Zustand devtools for state inspection
- Canvas inspector for animation debugging
- Network tab for performance monitoring

## Contributing Guidelines

1. Follow existing code patterns and style
2. Add TypeScript types for all new features
3. Test manually with various queries
4. Update documentation for significant changes
5. Ensure TypeScript compilation passes
6. Run linting before committing

---

This codebase is designed for production scale with clean architecture, type safety, and extensibility as core principles.