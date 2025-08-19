import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId, conversationHistory } = await request.json()

    // Initialize AI clients only when needed and with proper error handling
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY
    const openaiApiKey = process.env.OPENAI_API_KEY

    if (!anthropicApiKey && !openaiApiKey) {
      return NextResponse.json(
        { error: 'No AI API keys configured' },
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
    try {
      // Try Claude first (better for educational content) if API key available
      if (anthropicApiKey) {
        const anthropic = new Anthropic({
          apiKey: anthropicApiKey,
        })
        
        const claudeResponse = await anthropic.messages.create({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: `${systemPrompt}\n\nConversation history:\n${conversationContext}\n\nStudent question: ${message}\n\nProvide a helpful, educational response:`
            }
          ]
        })
        aiResponse = claudeResponse.content[0].type === 'text' ? claudeResponse.content[0].text : ''
      } else {
        throw new Error('No Anthropic API key')
      }
    } catch (error) {
      console.log('Claude failed, trying OpenAI...')
      // Fallback to OpenAI if available
      if (openaiApiKey) {
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
      } else {
        throw new Error('No OpenAI API key available')
      }
    }

    // Search for relevant videos
    const videoResults = await searchEducationalVideos(message)

    return NextResponse.json({
      explanation: aiResponse,
      videoResults,
      sessionId
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
}

async function searchEducationalVideos(query: string): Promise<any[]> {
  try {
    // Search YouTube for educational organic chemistry content
    const searchQuery = `organic chemistry ${query} tutorial explanation`
    
    // For now, return mock video results
    // In production, this would call YouTube API
    const mockVideos = [
      {
        id: 'video_1',
        title: 'Organic Chemistry: SN2 Reaction Mechanism',
        description: 'Complete explanation of SN2 nucleophilic substitution reactions with examples',
        thumbnail: 'https://img.youtube.com/vi/example1/maxresdefault.jpg',
        url: 'https://www.youtube.com/watch?v=example1',
        duration: '12:34',
        source: 'youtube' as const,
        relevance: 0.95
      },
      {
        id: 'video_2',
        title: 'Understanding Stereochemistry in Organic Chemistry',
        description: 'Learn about chirality, enantiomers, and diastereomers',
        thumbnail: 'https://img.youtube.com/vi/example2/maxresdefault.jpg',
        url: 'https://www.youtube.com/watch?v=example2',
        duration: '15:22',
        source: 'youtube' as const,
        relevance: 0.87
      },
      {
        id: 'video_3',
        title: 'Khan Academy: Organic Chemistry Fundamentals',
        description: 'Introduction to organic chemistry concepts and principles',
        thumbnail: 'https://img.youtube.com/vi/example3/maxresdefault.jpg',
        url: 'https://www.youtube.com/watch?v=example3',
        duration: '18:45',
        source: 'khan-academy' as const,
        relevance: 0.82
      }
    ]

    // Filter videos based on query relevance
    const relevantVideos = mockVideos.filter(video => 
      video.title.toLowerCase().includes(query.toLowerCase()) ||
      video.description.toLowerCase().includes(query.toLowerCase())
    )

    return relevantVideos.length > 0 ? relevantVideos : mockVideos.slice(0, 2)

  } catch (error) {
    console.error('Video search error:', error)
    return []
  }
}
