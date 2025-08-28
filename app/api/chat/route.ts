import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

// Educational domain imports - Following BP-C6: Use import type for type-only imports
import type { 
  ChatApiRequest, 
  ChatApiResponse, 
  ErrorApiResponse,
  RateLimitResponse 
} from '../../../types/api'
import type { EducationalError } from '../../../types/education'
import { SubjectArea, DifficultyLevel } from '../../../types/education'
import { searchVideoContent } from '../../../lib/video/searchVideoContent'

// Prevent build-time execution
export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({ message: 'Chat API endpoint - use POST to send messages' })
}

export async function POST(request: NextRequest) {
  try {
    const requestData: ChatApiRequest = await request.json()
    const { message, sessionId, conversationHistory } = requestData
    
    // Validate educational query input - Following BP-T3: Input validation
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json<ErrorApiResponse>({
        success: false,
        error: {
          code: 'INVALID_QUERY',
          message: 'Student query cannot be empty',
          context: { providedMessage: message },
          recoveryActions: ['Please provide a valid question about chemistry or biology']
        },
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}`
      }, { status: 400 })
    }

    // Initialize AI clients only when needed and with proper error handling
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY
    const openaiApiKey = process.env.OPENAI_API_KEY

    // Check if API keys are properly configured (not demo mode)
    const cleanAnthropicKey = anthropicApiKey?.replace(/\s+/g, '') || ''
    const cleanOpenAIKey = openaiApiKey?.replace(/\s+/g, '') || ''
    
    const hasValidAnthropicKey = cleanAnthropicKey && 
      cleanAnthropicKey !== 'demo_mode_enabled' && 
      cleanAnthropicKey.length > 20 &&
      (cleanAnthropicKey.startsWith('sk-ant-') || cleanAnthropicKey.startsWith('sk-'))
    
    const hasValidOpenAIKey = cleanOpenAIKey && 
      cleanOpenAIKey !== 'demo_mode_enabled' && 
      cleanOpenAIKey.length > 20 &&
      cleanOpenAIKey.startsWith('sk-')

    if (!hasValidAnthropicKey && !hasValidOpenAIKey) {
      return NextResponse.json(
        { 
          error: 'API keys not configured correctly',
          details: {
            message: 'Please set valid ANTHROPIC_API_KEY or OPENAI_API_KEY in your environment variables',
            anthropicKey: {
              present: !!anthropicApiKey,
              valid: hasValidAnthropicKey,
              expectedFormat: 'sk-ant-... or sk-...'
            },
            openaiKey: {
              present: !!openaiApiKey,
              valid: hasValidOpenAIKey,
              expectedFormat: 'sk-...'
            },
            troubleshooting: 'Check /api/debug for detailed key status'
          }
        },
        { status: 500 }
      )
    }

    // Plumbing education tutor system prompt
    const educationalTutorPrompt = `You are TradeAI Tutor, an expert plumbing instructor specializing in hands-on apprentice training. Your role is to:

1. Provide clear, step-by-step explanations for plumbing procedures and concepts
2. Emphasize safety protocols and code compliance in all responses
3. Offer practical troubleshooting guidance for common plumbing problems
4. Connect theoretical knowledge to real jobsite applications
5. Generate follow-up questions to reinforce learning
6. Identify tools, materials, and safety requirements for each task
7. Reference relevant building codes when applicable

Plumbing specialties you excel in:
- Installation: toilets, sinks, water heaters, fixtures, piping systems
- Repair: leaks, clogs, valve replacement, pipe repair
- Troubleshooting: diagnosing problems, identifying causes, solution planning  
- Codes & Standards: NPC, IPC, UPC compliance, permits, inspections
- Tools & Materials: pipe types, fittings, tools, safety equipment
- Systems: water supply, drainage, venting, gas lines

Always respond with:
- Safety warnings and PPE requirements
- Step-by-step procedures with clear instructions
- Tool and material lists
- Code compliance considerations
- Practical tips from experienced tradespeople
- Common mistakes to avoid

Use encouraging, mentor-like tone suitable for apprentice learning. Focus on practical, hands-on knowledge that works on actual jobsites.`

    // Build conversation context
    const conversationContext = conversationHistory
      .slice(-5) // Last 5 messages for context
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n')

    // Generate educational AI explanation - Following BP-C2: Educational domain vocabulary
    let educationalExplanation: string
    let usedProvider: 'claude' | 'openai' | 'openai-fallback' = 'claude'
    let confidence = 0.8 // Default confidence
    
    try {
      // Try Claude first (better for educational content) if valid key available
      if (hasValidAnthropicKey) {
        try {
          const anthropic = new Anthropic({
            apiKey: cleanAnthropicKey,
          })
          
          const claudeResponse = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1200, // Increased for comprehensive educational content
            temperature: 0.7, // Balanced creativity for educational explanations
            messages: [
              {
                role: 'user',
                content: `${educationalTutorPrompt}\n\nLearning Context:\n${conversationContext}\n\nStudent Query: ${message}\n\nProvide a comprehensive educational explanation with learning objectives, key terms, and follow-up questions:`
              }
            ]
          })
          
          educationalExplanation = claudeResponse.content[0].type === 'text' ? claudeResponse.content[0].text : ''
          confidence = 0.9 // High confidence for Claude educational content
          usedProvider = 'claude'
        } catch (claudeError) {
          console.error('Claude API error:', claudeError)
          throw claudeError
        }
      } else if (hasValidOpenAIKey) {
        // Use OpenAI if Claude key not available
        const openai = new OpenAI({
          apiKey: cleanOpenAIKey,
        })
        
        const openaiResponse = await openai.chat.completions.create({
          model: 'gpt-4-turbo', // Better model for educational content
          messages: [
            { role: 'system', content: educationalTutorPrompt },
            ...conversationHistory.slice(-5).map(msg => ({
              role: msg.role as 'user' | 'assistant',
              content: msg.content
            })),
            { role: 'user', content: message }
          ],
          max_tokens: 1200,
          temperature: 0.7
        })
        educationalExplanation = openaiResponse.choices[0].message.content || ''
        confidence = 0.8 // Good confidence for OpenAI educational content
        usedProvider = 'openai'
      } else {
        throw new Error('No valid API keys available')
      }
    } catch (error) {
      console.error('AI API error:', error)
      // Fallback to OpenAI if Claude fails and OpenAI key is valid
      if (usedProvider !== 'openai' && hasValidOpenAIKey) {
        try {
          const openai = new OpenAI({
            apiKey: cleanOpenAIKey,
          })
          
          const openaiResponse = await openai.chat.completions.create({
            model: 'gpt-4-turbo',
            messages: [
              { role: 'system', content: educationalTutorPrompt },
              ...conversationHistory.slice(-5).map(msg => ({
                role: msg.role as 'user' | 'assistant',
                content: msg.content
              })),
              { role: 'user', content: message }
            ],
            max_tokens: 1200,
            temperature: 0.7
          })
          educationalExplanation = openaiResponse.choices[0].message.content || ''
          confidence = 0.7 // Lower confidence for fallback
          usedProvider = 'openai-fallback'
        } catch (fallbackError) {
          console.error('Fallback OpenAI error:', fallbackError)
          throw new Error(`Both AI providers failed. Claude: ${(error as Error).message}, OpenAI: ${(fallbackError as Error).message}`)
        }
      } else {
        throw error
      }
    }

    // Search for relevant plumbing videos
    const educationalVideoResults = await searchVideoContent({
      query: message,
      subject: 'plumbing' as any, // TradeAI Tutor focuses on plumbing education
      maxResults: 4,
      difficultyLevel: DifficultyLevel.INTERMEDIATE // Could be inferred from conversation
    })

    // Generate follow-up questions for continued learning
    const followUpQuestions = generateEducationalFollowUpQuestions(message, educationalExplanation)

    const response: ChatApiResponse = {
      success: true,
      data: {
        explanation: educationalExplanation,
        videoResults: educationalVideoResults.videos,
        sessionId,
        provider: usedProvider,
        confidence,
        followUpQuestions
      },
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Educational API error:', error)
    
    // Create educational domain error - Following BP-D3: Handle API rate limits gracefully
    let educationalError: EducationalError
    let statusCode = 500
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        educationalError = {
          code: 'AI_UNAVAILABLE',
          message: 'Educational AI service configuration error',
          context: { errorType: 'api_key_invalid' },
          recoveryActions: [
            'Check API key configuration',
            'Try again in a few minutes',
            'Contact support if problem persists'
          ]
        }
      } else if (error.message.includes('rate limit')) {
        educationalError = {
          code: 'AI_UNAVAILABLE',
          message: 'Too many requests - educational AI service temporarily unavailable',
          context: { errorType: 'rate_limit', retryAfter: 60 },
          recoveryActions: [
            'Wait 1 minute before trying again',
            'Consider rephrasing your question',
            'Try asking a simpler question first'
          ]
        }
        statusCode = 429 // Rate limit status
      } else {
        educationalError = {
          code: 'AI_UNAVAILABLE',
          message: 'Educational AI service temporarily unavailable',
          context: { originalError: error.message },
          recoveryActions: [
            'Try rephrasing your question',
            'Check your internet connection',
            'Try again in a few moments'
          ]
        }
      }
    } else {
      educationalError = {
        code: 'AI_UNAVAILABLE',
        message: 'Unknown error in educational service',
        context: { error: String(error) },
        recoveryActions: ['Try again', 'Contact support if problem persists']
      }
    }
    
    const errorResponse: ErrorApiResponse = {
      success: false,
      error: educationalError,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`,
      debugInfo: process.env.NODE_ENV === 'development' ? {
        stack: error instanceof Error ? error.stack : undefined,
        requestDetails: { message: 'Provided in request' },
        systemInfo: {
          timestamp: new Date().toISOString(),
          endpoint: '/api/chat',
          method: 'POST'
        }
      } : undefined
    }
    
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}

// Helper function to generate plumbing follow-up questions
function generateEducationalFollowUpQuestions(query: string, explanation: string): string[] {
  // Extract key concepts for follow-up generation
  const queryLower = query.toLowerCase()
  
  if (queryLower.includes('install') || queryLower.includes('installation')) {
    return [
      'What tools do I need for this installation?',
      'What are the code requirements for this installation?',
      'What common mistakes should I avoid during installation?'
    ]
  } else if (queryLower.includes('leak') || queryLower.includes('repair')) {
    return [
      'How do I identify the source of this leak?',
      'What are the most common causes of this type of leak?',
      'When should I call a professional vs. doing this myself?'
    ]
  } else if (queryLower.includes('toilet') || queryLower.includes('flange')) {
    return [
      'What wax ring should I use for this toilet?',
      'How do I know if my flange is the right height?',
      'What if the floor around the toilet is uneven?'
    ]
  } else if (queryLower.includes('pipe') || queryLower.includes('fitting')) {
    return [
      'What size pipe do I need for this application?',
      'What type of fitting works best here?',
      'How do I ensure proper water pressure?'
    ]
  } else if (queryLower.includes('drain') || queryLower.includes('clog')) {
    return [
      'What tools work best for clearing this type of drain?',
      'How can I prevent this clog from happening again?',
      'When should I use chemical drain cleaners vs. mechanical methods?'
    ]
  }
  
  // Default plumbing follow-ups
  return [
    'What safety precautions should I take for this job?',
    'Do I need any permits for this type of work?',
    'What are the signs that this repair was successful?'
  ]
}

// Legacy function for backward compatibility - Following educational patterns
async function searchEducationalVideos(query: string): Promise<any[]> {
  try {
    const youtubeApiKey = process.env.YOUTUBE_API_KEY
    
    // If YouTube API key is available and valid, use real search
    if (youtubeApiKey && youtubeApiKey !== 'demo_mode_enabled') {
      try {
        const searchQuery = `organic chemistry ${query} tutorial mechanism explanation`
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?` +
          `part=snippet&maxResults=3&q=${encodeURIComponent(searchQuery)}` +
          `&type=video&videoEmbeddable=true&key=${youtubeApiKey}`
        )
        
        if (response.ok) {
          const data = await response.json()
          const videos = data.items?.map((item: any) => ({
            id: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            duration: 'N/A', // Would need additional API call to get duration
            source: 'youtube' as const,
            relevance: 0.9
          })) || []
          
          if (videos.length > 0) {
            return videos
          }
        }
      } catch (apiError) {
        console.error('YouTube API error:', apiError)
        // Fall through to mock data
      }
    }
    
    // Fallback to enhanced mock videos based on query
    const getRelevantMockVideos = (searchQuery: string) => {
      const allMockVideos = [
        {
          id: 'photosynthesis_basics',
          title: 'Photosynthesis: Crash Course Biology #8',
          description: 'Hank explains the extremely complex series of reactions whereby plants feed themselves on sunlight, carbon dioxide and water',
          thumbnail: 'https://img.youtube.com/vi/sQK3Yr4Sc_k/maxresdefault.jpg',
          url: 'https://www.youtube.com/watch?v=sQK3Yr4Sc_k',
          duration: '13:24',
          source: 'youtube' as const,
          relevance: 0.95,
          keywords: ['photosynthesis', 'biology', 'plants', 'sunlight', 'carbon dioxide']
        },
        {
          id: 'sn2_mechanism',
          title: 'SN2 Reaction Mechanism - Complete Guide',
          description: 'Step-by-step explanation of SN2 nucleophilic substitution reactions with stereochemistry',
          thumbnail: 'https://img.youtube.com/vi/9IKHgIaiTMM/maxresdefault.jpg',
          url: 'https://www.youtube.com/watch?v=9IKHgIaiTMM',
          duration: '12:34',
          source: 'youtube' as const,
          relevance: 0.95,
          keywords: ['sn2', 'substitution', 'nucleophilic', 'mechanism']
        },
        {
          id: 'stereochemistry_basics',
          title: 'Stereochemistry: R/S Configuration Made Easy',
          description: 'Learn how to assign R and S configuration to chiral centers',
          thumbnail: 'https://img.youtube.com/vi/VFl7Hrm5q-s/maxresdefault.jpg',
          url: 'https://www.youtube.com/watch?v=VFl7Hrm5q-s',
          duration: '15:22',
          source: 'youtube' as const,
          relevance: 0.87,
          keywords: ['stereochemistry', 'chiral', 'r/s', 'configuration', 'enantiomers']
        },
        {
          id: 'aldol_condensation',
          title: 'Aldol Condensation Reaction Mechanism',
          description: 'Complete walkthrough of aldol condensation with examples',
          thumbnail: 'https://img.youtube.com/vi/YlzZw1bEZJw/maxresdefault.jpg',
          url: 'https://www.youtube.com/watch?v=YlzZw1bEZJw',
          duration: '18:45',
          source: 'khan-academy' as const,
          relevance: 0.82,
          keywords: ['aldol', 'condensation', 'carbonyl', 'enolate']
        },
        {
          id: 'nmr_spectroscopy',
          title: 'NMR Spectroscopy for Organic Chemistry',
          description: 'How to interpret 1H NMR and 13C NMR spectra',
          thumbnail: 'https://img.youtube.com/vi/SBir5wUS3Bo/maxresdefault.jpg',
          url: 'https://www.youtube.com/watch?v=SBir5wUS3Bo',
          duration: '25:12',
          source: 'youtube' as const,
          relevance: 0.90,
          keywords: ['nmr', 'spectroscopy', '1h', '13c', 'analysis']
        },
        {
          id: 'benzene_substitution',
          title: 'Electrophilic Aromatic Substitution of Benzene',
          description: 'Mechanisms and selectivity in benzene reactions',
          thumbnail: 'https://img.youtube.com/vi/L89CjmfrxO4/maxresdefault.jpg',
          url: 'https://www.youtube.com/watch?v=L89CjmfrxO4',
          duration: '20:15',
          source: 'youtube' as const,
          relevance: 0.88,
          keywords: ['benzene', 'aromatic', 'substitution', 'electrophilic']
        }
      ]
      
      // Find relevant videos based on query keywords
      const queryLower = searchQuery.toLowerCase()
      const relevantVideos = allMockVideos.filter(video => 
        video.keywords.some(keyword => queryLower.includes(keyword)) ||
        video.title.toLowerCase().includes(queryLower) ||
        video.description.toLowerCase().includes(queryLower)
      )
      
      return relevantVideos.length > 0 ? relevantVideos.slice(0, 3) : allMockVideos.slice(0, 2)
    }
    
    // Use new educational video search system
    const videoResults = await searchVideoContent({
      query,
      subject: SubjectArea.ORGANIC_CHEMISTRY,
      maxResults: 3
    })
    
    return videoResults.videos

  } catch (error) {
    console.error('Video search error:', error)
    return []
  }
}
