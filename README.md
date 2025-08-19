# ChemTutor AI - Organic Chemistry AI Tutor

A specialized AI-powered tutor for pre-med organic chemistry students, combining intelligent explanations with curated educational videos.

## 🎯 Project Overview

ChemTutor AI is designed specifically for organic chemistry education, providing:
- **AI-powered explanations** using Claude/OpenAI
- **Video integration** from YouTube and Khan Academy
- **Conversation memory** for contextual learning
- **Modern, educational-focused UI**
- **Pre-med curriculum alignment**

## 🚀 Features

### Core Functionality
- **Natural Language Queries**: Ask questions about organic chemistry concepts
- **AI Explanations**: Get detailed, accurate explanations from expert AI tutors
- **Video Integration**: Automatically find and display relevant educational videos
- **Conversation Memory**: Maintain context across multiple questions
- **Session Management**: Track learning progress and preferences

### Organic Chemistry Focus
- **Reaction Mechanisms**: SN1, SN2, E1, E2 reactions
- **Stereochemistry**: R/S configuration, enantiomers, diastereomers
- **Functional Groups**: Identification and reactivity
- **Spectroscopy**: NMR, IR, MS interpretation
- **Synthesis Strategies**: Retrosynthesis and planning
- **Molecular Orbital Theory**: Understanding bonding and reactivity

### User Experience
- **Clean, Modern UI**: Educational-focused design
- **Responsive Design**: Works on desktop and mobile
- **Real-time Chat**: Instant AI responses
- **Video Player**: Integrated video viewing experience
- **Suggested Questions**: Quick access to common topics

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with custom components
- **State Management**: Zustand with optimized selectors
- **AI Integration**: Claude AI + OpenAI with fallback
- **Video Integration**: YouTube API + Khan Academy
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 🏃‍♀️ Getting Started

### Prerequisites
- Node.js 18+
- API keys for Claude AI, OpenAI, and YouTube

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd organic-chem-ai-tutor
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

4. **Required Environment Variables**:
   ```env
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   YOUTUBE_API_KEY=your_youtube_api_key_here
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```

6. **Open browser**: Navigate to `http://localhost:3000`

## 📁 Project Structure

```
organic-chem-ai-tutor/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── chat/          # Chat API with AI integration
│   ├── chemistry-chat/    # Main chat interface
│   ├── demo/              # Demo page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ChatInterface.tsx  # Main chat component
│   └── VideoPlayer.tsx    # Video player component
├── lib/                   # Utilities and state
│   ├── store.ts          # Zustand state management
│   └── utils.ts          # Utility functions
├── public/               # Static assets
└── package.json          # Dependencies and scripts
```

## 🧪 Testing the System

### Sample Questions to Try
- "What is an SN2 reaction?"
- "How do I determine R and S configuration?"
- "Explain the mechanism of E1 elimination"
- "What is the difference between enantiomers and diastereomers?"
- "How do I read an NMR spectrum?"
- "What are the steps in retrosynthesis?"

### Expected Behavior
1. **AI Response**: Get detailed, educational explanations
2. **Video Results**: See relevant educational videos
3. **Conversation Memory**: Follow-up questions maintain context
4. **Video Player**: Click videos to watch in integrated player

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Key Components

#### ChatInterface.tsx
- Main chat interface with message display
- AI response handling
- Video result integration
- Suggested questions
- Session management

#### VideoPlayer.tsx
- Modal video player
- Video controls and metadata
- External link support
- Responsive design

#### API Routes
- `/api/chat`: Handles AI queries and video search
- Claude AI + OpenAI integration
- Conversation context management
- Video result filtering

## 🎨 Design System

### Color Palette
- **Primary**: Green (#16a34a) to Blue (#2563eb) gradient
- **Secondary**: Gray scale for text and backgrounds
- **Accent**: Green for success states and highlights

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Components
- **Cards**: Rounded corners, subtle shadows
- **Buttons**: Gradient backgrounds, hover effects
- **Inputs**: Focus states with green accent
- **Modals**: Backdrop blur, smooth animations

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- **Netlify**: Similar to Vercel setup
- **Railway**: Good for full-stack applications
- **AWS**: More complex but highly scalable

## 🔒 Security

### API Key Management
- Store all API keys in environment variables
- Never commit API keys to version control
- Use different keys for development and production
- Regularly rotate access tokens

### Data Privacy
- No user data is stored permanently
- Session data is temporary and client-side
- API calls are stateless
- No personal information collection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Update documentation
6. Submit a pull request

### Development Guidelines
- Follow TypeScript strict mode
- Use ESLint configuration
- Write comprehensive tests
- Document public APIs
- Follow component naming conventions

## 📊 Analytics & Monitoring

### Built-in Metrics
- Message count per session
- Session duration
- Video interaction rates
- Error tracking

### Future Enhancements
- User learning analytics
- Content effectiveness metrics
- Performance monitoring
- A/B testing framework

## 🔮 Roadmap

### Phase 1 (Current)
- ✅ Basic AI chat functionality
- ✅ Video integration
- ✅ Conversation memory
- ✅ Modern UI/UX

### Phase 2 (Next)
- Real YouTube API integration
- Advanced video search algorithms
- User authentication
- Progress tracking

### Phase 3 (Future)
- Mobile app development
- Collaborative learning features
- Advanced analytics
- Multi-language support

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- **Claude AI** for educational content generation
- **OpenAI** for AI model integration
- **YouTube** for educational video content
- **Khan Academy** for additional learning resources
- **Next.js** for the excellent framework
- **Tailwind CSS** for the design system

---

## 🌟 Why ChemTutor AI?

Organic chemistry is one of the most challenging subjects for pre-med students. Traditional study methods often fail to provide the personalized, visual learning experience that students need. ChemTutor AI bridges this gap by combining:

1. **Expert AI Explanations**: Clear, accurate explanations from AI trained on organic chemistry
2. **Visual Learning**: Curated videos that show concepts in action
3. **Personalized Experience**: Conversation memory and adaptive responses
4. **Modern Interface**: Clean, distraction-free learning environment

This combination creates a powerful learning tool that can help students master organic chemistry more effectively than traditional methods alone.

---

Built with ❤️ for organic chemistry education.