# TradeAI Tutor - Backend Architecture

## API Routes
```
app/api/
├── chat/route.ts          # AI chat endpoint (Claude/OpenAI)
├── pdf/upload/route.ts    # PDF processing
├── video/process/route.ts # YouTube processing (disabled)
├── auth/[...nextauth]/    # NextAuth authentication
└── debug/route.ts         # API key status check
```

## Core Services

### AI Integration
- **Claude API**: Primary AI for plumbing education
- **OpenAI API**: Fallback for chat responses
- **System Prompt**: Plumbing expert instructor persona
- **Response Format**: Safety + Steps + Tools + Code compliance

### PDF Processing Pipeline
- `lib/pdf/pdfProcessor.ts` - Text/image extraction
- `lib/pdf/contentIntegrator.ts` - AI training data generation
- `lib/pdf/legalCompliance.ts` - Fair use compliance
- **684 Q&A pairs** extracted from manufacturer manuals

### Database (Supabase)
- User authentication (Google OAuth)
- Session management
- PDF processing logs
- Training data storage

### Environment Variables
```
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-proj-...
YOUTUBE_API_KEY=AIzaSy...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Legal Compliance
- Educational fair use framework
- Automatic source attribution
- Content excerpt limits (200-400 words)
- Usage tracking and audit trails

## Performance
- API response caching
- Timeout handling (20s max)
- Fallback to mock responses
- Vector search optimization