import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

// Prevent build-time execution
export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({ message: 'Chat API endpoint - use POST to send messages' })
}

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId, conversationHistory } = await request.json()

    // Initialize AI clients only when needed and with proper error handling
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY
    const openaiApiKey = process.env.OPENAI_API_KEY

    // Check if API keys are properly configured (not demo mode)
    const hasValidAnthropicKey = anthropicApiKey && anthropicApiKey !== 'demo_mode_enabled' && anthropicApiKey.startsWith('sk-')
    const hasValidOpenAIKey = openaiApiKey && openaiApiKey !== 'demo_mode_enabled' && openaiApiKey.startsWith('sk-')

    if (!hasValidAnthropicKey && !hasValidOpenAIKey) {
      return NextResponse.json(
        { 
          error: 'API keys not configured correctly. Please set valid ANTHROPIC_API_KEY or OPENAI_API_KEY in your environment variables.',
          details: 'Keys should start with "sk-" and not be set to "demo_mode_enabled"'
        },
        { status: 500 }
      )
    }

    // Organic chemistry context for AI
    const systemPrompt = `You are an expert organic chemistry tutor specializing in pre-med education. Your role is to:

1. Provide clear, accurate explanations of organic chemistry concepts
2. Focus on reaction mechanisms, stereochemistry, synthesis, and spectroscopy
3. Use analogies and real-world examples when helpful
4. Keep explanations concise but comprehensive
5. Suggest follow-up questions to deepen understanding
6. Always maintain a supportive, encouraging tone

Key topics you should be expert in:
- SN1, SN2, E1, E2 reactions
- Functional group chemistry
- Stereochemistry and chirality
- Spectroscopy (NMR, IR, MS)
- Synthesis strategies
- Reaction mechanisms
- Molecular orbital theory

Respond in a conversational, helpful manner as if you're a knowledgeable tutor.`

    // Build conversation context
    const conversationContext = conversationHistory
      .slice(-5) // Last 5 messages for context
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n')

    // Generate AI response
    let aiResponse: string
    let usedProvider: string = 'none'
    
    try {
      // Try Claude first (better for educational content) if valid key available
      if (hasValidAnthropicKey) {
        try {
          const anthropic = new Anthropic({
            apiKey: anthropicApiKey,
          })
          
          const claudeResponse = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1000,
            messages: [
              {
                role: 'user',
                content: `${systemPrompt}\n\nConversation history:\n${conversationContext}\n\nStudent question: ${message}\n\nProvide a helpful, educational response:`
              }
            ]
          })
          
          aiResponse = claudeResponse.content[0].type === 'text' ? claudeResponse.content[0].text : ''
          usedProvider = 'claude'
        } catch (claudeError) {
          console.error('Claude API error:', claudeError)
          throw claudeError
        }
      } else if (hasValidOpenAIKey) {
        // Use OpenAI if Claude key not available
        const openai = new OpenAI({
          apiKey: openaiApiKey,
        })
        
        const openaiResponse = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            ...conversationHistory.slice(-5).map(msg => ({
              role: msg.role as 'user' | 'assistant',
              content: msg.content
            })),
            { role: 'user', content: message }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
        aiResponse = openaiResponse.choices[0].message.content || ''
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
            apiKey: openaiApiKey,
          })
          
          const openaiResponse = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
              { role: 'system', content: systemPrompt },
              ...conversationHistory.slice(-5).map(msg => ({
                role: msg.role as 'user' | 'assistant',
                content: msg.content
              })),
              { role: 'user', content: message }
            ],
            max_tokens: 1000,
            temperature: 0.7
          })
          aiResponse = openaiResponse.choices[0].message.content || ''
          usedProvider = 'openai-fallback'
        } catch (fallbackError) {
          console.error('Fallback OpenAI error:', fallbackError)
          throw new Error(`Both AI providers failed. Claude: ${error.message}, OpenAI: ${fallbackError.message}`)
        }
      } else {
        throw error
      }
    }

    // Search for relevant videos
    const videoResults = await searchEducationalVideos(message)

    return NextResponse.json({
      explanation: aiResponse,
      videoResults,
      sessionId,
      provider: usedProvider,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Chat API error:', error)
    
    // Provide more specific error messages
    let errorMessage = 'Failed to process message'
    let errorDetails = ''
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorMessage = 'API key configuration error'
        errorDetails = 'Please check your ANTHROPIC_API_KEY or OPENAI_API_KEY environment variables'
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'API rate limit exceeded'
        errorDetails = 'Please try again in a moment'
      } else if (error.message.includes('Both AI providers failed')) {
        errorMessage = 'All AI providers are unavailable'
        errorDetails = error.message
      } else {
        errorMessage = 'AI service error'
        errorDetails = error.message
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

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
          id: 'sn2_mechanism',
          title: 'SN2 Reaction Mechanism - Complete Guide',
          description: 'Step-by-step explanation of SN2 nucleophilic substitution reactions with stereochemistry',
          thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          duration: '12:34',
          source: 'youtube' as const,
          relevance: 0.95,
          keywords: ['sn2', 'substitution', 'nucleophilic', 'mechanism']
        },
        {
          id: 'stereochemistry_basics',
          title: 'Stereochemistry: R/S Configuration Made Easy',
          description: 'Learn how to assign R and S configuration to chiral centers',
          thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          duration: '15:22',
          source: 'youtube' as const,
          relevance: 0.87,
          keywords: ['stereochemistry', 'chiral', 'r/s', 'configuration', 'enantiomers']
        },
        {
          id: 'aldol_condensation',
          title: 'Aldol Condensation Reaction Mechanism',
          description: 'Complete walkthrough of aldol condensation with examples',
          thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          duration: '18:45',
          source: 'khan-academy' as const,
          relevance: 0.82,
          keywords: ['aldol', 'condensation', 'carbonyl', 'enolate']
        },
        {
          id: 'nmr_spectroscopy',
          title: 'NMR Spectroscopy for Organic Chemistry',
          description: 'How to interpret 1H NMR and 13C NMR spectra',
          thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          duration: '25:12',
          source: 'youtube' as const,
          relevance: 0.90,
          keywords: ['nmr', 'spectroscopy', '1h', '13c', 'analysis']
        },
        {
          id: 'benzene_substitution',
          title: 'Electrophilic Aromatic Substitution of Benzene',
          description: 'Mechanisms and selectivity in benzene reactions',
          thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
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
    
    return getRelevantMockVideos(query)

  } catch (error) {
    console.error('Video search error:', error)
    return []
  }
}
