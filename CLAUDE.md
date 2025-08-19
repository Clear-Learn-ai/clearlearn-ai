# Clearlearn Development Guide

This file contains development context and guidelines for working with the Clearlearn adaptive visual learning system.

## Project Structure

```
clearlearn/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles and design system
│   ├── layout.tsx         # Root layout with Inter font
│   └── page.tsx           # Home page with main interface
├── core/                  # Learning engine logic
│   ├── LearningEngine.ts  # Main orchestration class
│   └── types.ts          # TypeScript definitions
├── generators/           # Content generation modules
│   └── AnimatedDiagramGenerator.ts
├── components/           # React components
│   ├── QueryInput.tsx    # Smart input with autocomplete
│   ├── ContentDisplay.tsx # Content renderer
│   ├── AnimationRenderer.tsx # Canvas animation engine
│   └── FeedbackMechanism.tsx # User feedback
├── lib/                  # Utilities
│   ├── store.ts          # Zustand state management
│   └── utils.ts          # Utility functions (cn helper)
└── Configuration files   # TypeScript, Tailwind, ESLint, etc.
```

## Development Commands

- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build for production
- `npm run type-check` - TypeScript compilation check
- `npm run lint` - ESLint code quality check

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
- Test with "How does photosynthesis work?" for full demo
- Try edge cases with unknown topics
- Test feedback submission flow
- Verify responsive design

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