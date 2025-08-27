# Clearlearn Educational AI Tutor - Development Guide

This file contains development context and guidelines for working with the Clearlearn production-ready educational AI tutor platform following industry best practices.

## 🏛️ AI Tutor Architecture

Following **AI Tutor Best Practices** for production-ready educational platforms:

```
clearlearn/
├── app/                     # Next.js 15 App Router
│   ├── api/                # API routes for AI and video processing
│   │   ├── chat/           # Educational AI chat endpoint
│   │   └── debug/          # System health and diagnostics
│   ├── chat/               # Chat interface and conversation components  
│   ├── globals.css         # Global styles and design system
│   └── layout.tsx          # Root layout with educational UI
├── types/                   # Educational Domain Types
│   ├── education.ts        # Core educational types with branded IDs
│   ├── api.ts             # API response types for educational platform
│   └── overrides.ts        # Type overrides for external APIs
├── lib/                     # Core Educational Business Logic
│   ├── ai/                 # AI model integration (Claude, OpenAI)
│   │   ├── generateExplanation.ts   # Educational content generation
│   │   └── generateExplanation.spec.ts # Unit tests
│   ├── video/              # Video search and processing (YouTube API)
│   │   ├── searchVideoContent.ts    # Educational video curation
│   │   └── searchVideoContent.spec.ts # Unit tests
│   ├── store.ts            # Educational state management (Zustand)
│   └── utils.ts            # Utility functions
├── components/              # React Components
│   ├── ChatInterface.tsx   # Main educational chat UI
│   ├── VideoPlayer.tsx     # Educational video integration
│   └── (legacy components) # Existing UI components
├── __tests__/               # Integration Tests
│   └── api/                # API endpoint integration tests
└── Configuration files      # TypeScript, Jest, Prettier, ESLint
```

## 🚀 Development Commands

### Core Development
- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build for production
- `npm run start` - Start production server

### Code Quality (Required for Production)
- `npm run type-check` - TypeScript compilation check
- `npm run lint` - ESLint code quality check
- `npm run prettier` - Format code with Prettier
- `npm run prettier:check` - Check code formatting

### Educational Testing
- `npm run test` - Run unit and integration tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report

## 🚀 PRODUCTION DEPLOYMENT

**CRITICAL**: This is a production educational platform deployed to Vercel.

### Pre-Deployment Checklist (MANDATORY)
✅ **Code Quality Gates**:
- `npm run type-check` - Must pass TypeScript compilation
- `npm run lint` - Must pass ESLint checks  
- `npm run test` - All educational tests must pass
- `npm run build` - Production build must succeed
- `npm run prettier:check` - Code must be properly formatted

### Educational AI Services
- **Primary AI**: Claude 3.5 Sonnet (Anthropic) for educational explanations
- **Fallback AI**: GPT-4 Turbo (OpenAI) for high availability
- **Video Content**: YouTube API for educational video curation
- **Database**: Supabase for user sessions and learning progress
- **Authentication**: NextAuth with Google OAuth for students

### Production Environment
- **Live URL**: https://clearlearn-ai.vercel.app
- **Auto-deployment**: Vercel deploys from main branch
- **Monitoring**: Built-in error tracking and performance monitoring
- **API Rate Limits**: Configured for educational usage patterns

## 🧠 Educational AI Architecture

Following **Industry Best Practices** for educational technology platforms:

### 1. Educational Domain-Driven Design
**Branded Types for Type Safety**:
```typescript
type SessionId = Brand<string, 'SessionId'>
type StudentQuery = { id: QuestionId; content: string; subject: SubjectArea }
type VideoContent = { id: VideoId; educationalValue: number; relevanceScore: number }
```

### 2. AI-Powered Educational Content Generation
**Function Names Use Educational Vocabulary**:
- `generateExplanation()` - Creates pedagogically sound explanations
- `parseStudentQuery()` - Extracts learning intent from student questions
- `searchVideoContent()` - Curates relevant educational videos
- `enhanceExplanationClarity()` - Improves readability for students

### 3. Robust Error Handling & Recovery
**Educational Error System**:
```typescript
type EducationalError = {
  code: 'AI_UNAVAILABLE' | 'VIDEO_SEARCH_FAILED' | 'RATE_LIMIT_EXCEEDED'
  message: string
  recoveryActions: string[] // Guide students on next steps
}
```

### 4. Multi-Provider AI Integration
- **Primary**: Claude 3.5 Sonnet for comprehensive educational explanations
- **Fallback**: GPT-4 Turbo with automatic failover
- **Rate Limiting**: Graceful handling with student-friendly error messages
- **Caching**: Optimized for educational content delivery

### 5. Educational Video Curation
**YouTube API Integration**:
- Quality scoring based on educational value
- Relevance matching for student queries
- Fallback to curated educational content
- Support for Khan Academy, Coursera, and educational channels

## 📋 AI Tutor Implementation Best Practices

### Educational Function Design
✅ **MUST Follow**:
- Use educational domain vocabulary in function names
- Functions should enhance student learning experience
- Handle AI model errors and rate limits gracefully
- Optimize video search and display for educational content
- Test AI response quality and video relevance

### TypeScript Standards
✅ **Strict Educational Types**:
- Branded types for all educational IDs (SessionId, VideoId, etc.)
- `import type { ... }` for type-only imports
- Educational domain interfaces over generic types
- No `any` types - use proper educational domain types

### Testing Strategy
✅ **Educational Content Validation**:
- **Unit Tests**: Colocated with source files (`*.spec.ts`)
- **Integration Tests**: API endpoints in `__tests__/api/`
- **Separation**: Pure logic tests vs. API-touching tests
- **Coverage**: AI processing functions and video matching algorithms

### Error Handling
✅ **Student-Friendly Error Recovery**:
- Provide clear recovery actions for students
- Handle API failures gracefully with educational context
- Rate limiting with helpful retry guidance
- Fallback content when external services fail

### Code Organization
✅ **Educational Platform Structure**:
- `lib/ai/` - AI processing used by ≥2 components
- `lib/video/` - Video search and educational content curation
- `types/education.ts` - Core educational domain types
- `types/api.ts` - API response structures

## 🔧 Educational Platform Extension

### Adding New AI Capabilities
1. **Educational Function**: Create in `lib/ai/` with educational domain vocabulary
2. **Unit Tests**: Add colocated `*.spec.ts` for AI processing logic
3. **Types**: Add educational domain types to `types/education.ts`
4. **Integration**: Update API routes with proper error handling
5. **Testing**: Add integration tests in `__tests__/api/`

### Adding New Video Sources
1. **Search Function**: Extend `searchVideoContent()` in `lib/video/`
2. **Educational Scoring**: Implement `assessEducationalValue()` for new source
3. **API Integration**: Handle rate limits and fallback content
4. **Testing**: Add comprehensive video matching tests
5. **Types**: Update `VideoContent` interface for new metadata

### Adding New Educational Subjects
1. **Domain Types**: Add to `SubjectArea` enum in `types/education.ts`
2. **AI Prompts**: Update educational prompts for subject-specific content
3. **Video Curation**: Add subject-specific video collections
4. **Testing**: Validate subject-appropriate explanations and videos
5. **UI Components**: Update subject selection and display logic

## 🧪 Educational Testing Strategy

### Comprehensive Educational Validation
✅ **Student Learning Scenarios**:
- **Organic Chemistry**: "Explain SN2 mechanism with stereochemistry"
- **Biology**: "How does photosynthesis work at the molecular level?"
- **Biochemistry**: "What are enzyme kinetics and Michaelis-Menten?"
- **Edge Cases**: Unknown topics, incomplete questions, complex queries

✅ **AI Response Quality Testing**:
- Learning objectives are included and meaningful
- Key terminology is properly defined
- Follow-up questions promote deeper learning
- Explanations adapt to student difficulty level
- Educational analogies enhance understanding

✅ **Video Content Validation**:
- Relevance scoring accuracy (0.7+ threshold)
- Educational value assessment (0.6+ threshold)
- Fallback to curated content when APIs fail
- Support for multiple educational sources

✅ **Production-Ready Quality Gates**:
```bash
npm run type-check  # TypeScript compilation
npm run lint        # Code quality standards
npm run test        # Educational functionality
npm run build       # Production build verification
```

## ⚡ Educational Platform Performance

### AI Response Optimization
- **Response Times**: <2s for educational explanations
- **Fallback Systems**: Automatic Claude → OpenAI failover
- **Rate Limiting**: Graceful handling with student guidance
- **Caching**: Educational content caching for repeated queries

### Educational State Management
```typescript
// Optimized selectors for educational components
export const useIsGeneratingExplanation = () => 
  useEducationalTutorStore(state => state.learningSession.isGeneratingExplanation)
export const useRecommendedVideos = () =>
  useEducationalTutorStore(state => state.learningSession.recommendedVideos)
```

### Video Content Performance
- **YouTube API**: Optimized queries with educational keywords
- **Relevance Scoring**: Client-side filtering for faster results
- **Fallback Content**: Pre-curated educational videos for offline scenarios
- **Progressive Loading**: Videos load as students browse

### Bundle Optimization for Education
- **Code Splitting**: AI processing and video components
- **Educational Libraries**: Tree-shake unused AI model features
- **Type Definitions**: Separate educational types from runtime code

## 🚀 Educational Platform Roadmap

### Current Educational Capabilities
✅ **Production-Ready Features**:
- Multi-provider AI explanations (Claude + OpenAI)
- Educational video curation with quality scoring
- Branded type system for educational domain safety
- Comprehensive error handling with student guidance
- Unit and integration testing for educational features
- Student learning session tracking and progress

### Next Educational Enhancements
🔄 **Planned Improvements**:
1. **Advanced Subject Support**: Physics, Chemistry, Mathematics
2. **Learning Analytics**: Student progress tracking and insights
3. **Personalized Learning**: Adaptive difficulty and content recommendations
4. **Interactive Assessments**: Quiz generation from educational explanations
5. **Multi-Modal Learning**: Visual diagrams, interactive simulations
6. **Collaborative Features**: Study groups and peer learning
7. **Mobile Optimization**: Progressive Web App for student devices

## 🔧 Educational Platform Troubleshooting

### AI Service Issues
1. **"AI_UNAVAILABLE" Error**: 
   - Check API keys in environment variables
   - Verify Anthropic/OpenAI service status
   - Review rate limiting and retry logic

2. **Poor Educational Explanations**:
   - Validate educational prompts and context
   - Test with known good queries ("SN2 mechanism")
   - Check AI model confidence scores

3. **Video Search Failures**:
   - Verify YouTube API key configuration
   - Test educational query enhancement logic
   - Check fallback to curated content

### Educational Testing Issues
4. **Test Failures**:
   - Run `npm run type-check` for TypeScript issues
   - Check Jest configuration for educational mocks
   - Verify test data matches production educational types

5. **Performance Problems**:
   - Monitor AI response times (should be <2s)
   - Check video loading and relevance scoring
   - Validate educational state management selectors

### Production Debugging Tools
- **Educational Store**: `window.educationalTutorStore` (development)
- **API Health**: `/api/debug` endpoint for service status
- **Network Monitoring**: Check educational API response times
- **Error Tracking**: Educational error codes and recovery actions

## 📝 Educational AI Tutor Contributing Guidelines

### Before Contributing
1. **Understand AI Tutor Best Practices** - Review educational domain patterns
2. **Follow Educational Naming** - Use domain vocabulary (generateExplanation, not createResponse)
3. **Test Educational Value** - Ensure changes improve student learning outcomes

### Contribution Checklist
✅ **Code Quality**:
- Educational domain types with branded IDs
- Functions enhance student learning experience
- Error handling provides student-friendly recovery actions
- Unit tests for AI processing functions
- Integration tests for educational API endpoints

✅ **Testing Requirements**:
- Test with real educational queries
- Validate AI response quality and educational value
- Verify video relevance and educational scoring
- Check error scenarios and recovery actions

✅ **Production Gates**:
```bash
npm run type-check  # Must pass
npm run lint        # Must pass
npm run test        # Must pass
npm run build       # Must pass
```

### Educational Commit Standards
Use **Conventional Commits** with educational scopes:
- `feat(chat): add follow-up question suggestions for better learning continuity`
- `feat(video): improve educational video relevance scoring algorithm`  
- `fix(ai): handle rate limits gracefully for student experience`
- `test(education): add comprehensive organic chemistry query validation`

---

## 🎓 Educational Platform Architecture Summary

This is a **production-ready educational AI tutor platform** built with:
- **Type-Safe Educational Domain**: Branded types for all educational concepts
- **Multi-Provider AI**: Claude + OpenAI with automatic failover
- **Educational Video Curation**: YouTube API with quality scoring
- **Robust Error Handling**: Student-friendly recovery guidance
- **Comprehensive Testing**: Unit + integration tests for educational features
- **Production Deployment**: Vercel with monitoring and performance tracking

**Core Principle**: Every function, type, and test should enhance the student learning experience while maintaining production-grade reliability and performance.

## 🎯 Quick Reference for Educational Development

### Essential Educational Functions
```typescript
// AI Processing
generateExplanation(request: GenerateExplanationRequest): Promise<AiExplanation>
parseStudentQuery(query: string): ParsedQuery
enhanceExplanationClarity(text: string, level: DifficultyLevel): string

// Video Curation 
searchVideoContent(request: SearchVideoContentRequest): Promise<SearchVideoContentResponse>
assessEducationalValue(video: VideoContent): number
rankVideosByEducationalValue(videos: VideoContent[]): VideoContent[]

// Educational State Management
useEducationalTutorStore() // Main educational store
useSubmitStudentQuery() // Submit educational queries
useRecommendedVideos() // Get curated educational videos
```

### Testing Educational Features
```bash
npm run test -- --testPathPattern=education  # Educational domain tests
npm run test -- --testPathPattern=ai         # AI processing tests  
npm run test -- --testPathPattern=video      # Video curation tests
npm run test:coverage                        # Educational test coverage
```

This documentation reflects the current **production-ready educational AI tutor architecture** with industry best practices for educational technology platforms.

# Educational AI Tutor Implementation Reminders

## Core Educational Principles
- **Student-First Design**: Every function should enhance learning outcomes
- **Educational Domain Vocabulary**: Use proper educational terminology in code
- **Error Recovery**: Provide helpful guidance when AI or video services fail
- **Quality Assurance**: Test educational content quality, not just functionality

## Production Standards
- **Type Safety**: Use branded educational IDs and domain-specific types
- **Testing**: Unit tests for AI functions, integration tests for API endpoints
- **Error Handling**: Educational errors with recovery actions for students
- **Performance**: <2s AI responses, graceful fallbacks, optimized video loading

## Development Workflow
1. **Educational Analysis**: Understand the learning objective
2. **Domain Modeling**: Use proper educational types and vocabulary
3. **Implementation**: Build with student experience as priority
4. **Testing**: Validate educational value and technical functionality
5. **Production**: Deploy with monitoring and error tracking

Remember: This is a production educational platform serving real students. Every change should improve their learning experience while maintaining enterprise-grade reliability.

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.

      
      IMPORTANT: this context may or may not be relevant to your tasks. You should not respond to this context unless it is highly relevant to your task.