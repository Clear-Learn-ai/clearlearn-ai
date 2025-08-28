# TradeAI Tutor Development Guide

AI-powered visual learning system for plumbing apprentice training.

## Quick Reference
- **Frontend**: See [docs/FRONTEND.md](docs/FRONTEND.md)
- **Backend**: See [docs/BACKEND.md](docs/BACKEND.md) 
- **Deployment**: See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

## Development Commands
- `npm run dev` - Start development (http://localhost:3000)
- `npm run build` - Production build
- `npm run type-check` - TypeScript check
- `npm run lint` - Code quality

## Project Structure
```
app/          # Next.js routes & pages
components/   # React components  
lib/          # Utilities & services
core/         # Learning engine
generators/   # Content generators
docs/         # Documentation split by area
```

## Target Audience
- **Primary**: Plumbing apprentices learning hands-on skills
- **Secondary**: Journeymen needing quick reference guides
- **Use Cases**: Jobsite learning, classroom supplements, code reference

## Sample Questions
- "How do I install a toilet flange?"
- "What size pipe for kitchen sink?"
- "How to fix a P-trap leak?"
- "Show me different joint types"
- "What's the code for bathroom venting?"

## Live Environment
- **Production**: https://clearlearn-ai.vercel.app
- **Auto-deploy**: From main branch
- **AI Status**: ✅ Fully operational (Claude + OpenAI)
- **Features**: Chat, PDF processing, Authentication

## Code Guidelines
- TypeScript strict mode
- Functional components with hooks
- Tailwind CSS for styling
- Zustand for state management
- No comments unless requested

## Current Status
- ✅ AI chat working (15-17s response time)
- ✅ 684 Q&A pairs from PDF training
- ✅ Mobile-optimized interface
- ⏸️ Video processing (disabled for production)

---
*Optimized for production scale with clean architecture and type safety*