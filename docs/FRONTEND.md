# TradeAI Tutor - Frontend Architecture

## Component Structure
```
components/
├── chat/              # Chat interface
├── video/             # Video players & analysis
├── pdf/               # PDF upload & display
├── 3d/                # Three.js components
├── QueryInput.tsx     # Smart plumbing autocomplete
├── ContentDisplay.tsx # Content renderer
└── VideoPlayer.tsx    # Video demonstrations
```

## Key Pages
- `app/page.tsx` - Landing page with hero
- `app/chat/page.tsx` - AI chat interface
- `app/pdf/page.tsx` - PDF upload system
- `app/video/page.tsx` - Video processing (disabled in prod)

## State Management (Zustand)
- `lib/store.ts` - Main application state
- Chat messages and AI responses
- Video processing state
- PDF upload progress
- Learning session tracking

## Styling & Design
- **Tailwind CSS** with custom theme
- **Brand Colors**: #1E0F2E (dark purple), #B87A7A (accent)
- **Mobile-first** design for jobsite use
- **High contrast** for outdoor lighting
- **Large buttons** for gloved hands

## 3D Visualization Stack
- `@react-three/fiber` - React Three.js integration
- `@react-three/drei` - Helper components
- Interactive pipe models and tool visualization
- Performance optimized for mobile devices

## Progressive Web App
- `next-pwa` with service workers
- Offline capability for remote jobsites
- Install prompt for mobile devices
- Background sync for content updates