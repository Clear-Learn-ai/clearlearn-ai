# TradeAI Tutor - Deployment & Operations

## Production Environment
- **Platform**: Vercel
- **URL**: https://clearlearn-ai.vercel.app
- **Auto-deploy**: From main branch
- **Build Command**: `npm run build`

## Pre-Deployment Checklist
```bash
npm run build      # Production build test
npm run type-check # TypeScript validation
npm run lint       # Code quality check
```

## Environment Configuration
All API keys configured in Vercel dashboard:
- Anthropic Claude API (primary AI)
- OpenAI API (fallback)
- YouTube API (for future video features)
- Supabase (database + auth)
- Google OAuth (authentication)

## Disabled Features (Production)
- Video processing routes (503 responses)
- PDF testing endpoint (prevents timeouts)
- Large file uploads (use Supabase instead)

## Current Status
- ✅ AI chat fully functional
- ✅ PDF processing system operational (684 Q&A pairs)
- ✅ Authentication working
- ⏸️ Video processing (temporarily disabled)

## Performance Metrics
- AI response time: ~15-17 seconds
- Build time: ~30-45 seconds
- Static page generation: 21 pages
- First load JS: 87.1 kB shared

## Monitoring & Debugging
- `/api/debug` - API key validation
- Console logs for API call tracking
- Error boundaries with recovery actions
- Real-time status indicators