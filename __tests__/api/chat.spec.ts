// Integration tests for chat API endpoint
// Following BP-T2: Integration tests for API endpoints in __tests__/api/

import { NextRequest } from 'next/server'
import { POST, GET } from '../../app/api/chat/route'
import type { ChatApiRequest, ChatApiResponse } from '../../types/api'
import type { SessionId } from '../../types/education'

// Mock external APIs
jest.mock('@anthropic-ai/sdk')
jest.mock('openai')

const mockAnthropicResponse = {
  content: [{ type: 'text', text: 'SN2 reactions proceed through a concerted mechanism where the nucleophile attacks from the backside...' }]
}

const mockOpenAIResponse = {
  choices: [{ message: { content: 'The SN2 mechanism involves simultaneous bond formation and breaking...' } }]
}

describe('Chat API Integration', () => {
  beforeEach(() => {
    // Set up valid API keys for testing
    process.env.ANTHROPIC_API_KEY = 'sk-ant-test123456789012345678901234567890'
    process.env.OPENAI_API_KEY = 'sk-test123456789012345678901234567890123456'
    process.env.YOUTUBE_API_KEY = 'test_youtube_key'
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/chat', () => {
    it('should return information message for GET requests', async () => {
      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toContain('Chat API endpoint')
    })
  })

  describe('POST /api/chat', () => {
    it('should generate AI explanation with video results for organic chemistry questions', async () => {
      // Mock Anthropic SDK
      const mockAnthropic = {
        messages: {
          create: jest.fn().mockResolvedValue(mockAnthropicResponse)
        }
      }
      require('@anthropic-ai/sdk').default = jest.fn(() => mockAnthropic)

      const requestBody: ChatApiRequest = {
        message: 'Explain the SN2 mechanism with stereochemistry',
        sessionId: 'session_test_123' as SessionId,
        conversationHistory: []
      }

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data: ChatApiResponse = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data?.explanation).toBeDefined()
      expect(data.data?.videoResults).toBeInstanceOf(Array)
      expect(data.data?.provider).toBe('claude')
      expect(data.data?.sessionId).toBe(requestBody.sessionId)
    })

    it('should fall back to OpenAI when Claude fails', async () => {
      // Mock Anthropic to fail
      const mockAnthropic = {
        messages: {
          create: jest.fn().mockRejectedValue(new Error('Claude API error'))
        }
      }
      require('@anthropic-ai/sdk').default = jest.fn(() => mockAnthropic)

      // Mock OpenAI to succeed
      const mockOpenAI = {
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue(mockOpenAIResponse)
          }
        }
      }
      require('openai').default = jest.fn(() => mockOpenAI)

      const requestBody: ChatApiRequest = {
        message: 'What is nucleophilic substitution?',
        sessionId: 'session_test_456' as SessionId,
        conversationHistory: []
      }

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data: ChatApiResponse = await response.json()

      expect(response.status).toBe(200)
      expect(data.data?.provider).toBe('openai-fallback')
      expect(data.data?.explanation).toBeDefined()
    })

    it('should return appropriate error for invalid API keys', async () => {
      process.env.ANTHROPIC_API_KEY = 'invalid_key'
      process.env.OPENAI_API_KEY = 'also_invalid'

      const requestBody: ChatApiRequest = {
        message: 'Test question',
        sessionId: 'session_test_789' as SessionId,
        conversationHistory: []
      }

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('API keys not configured correctly')
      expect(data.details).toBeDefined()
    })

    it('should handle conversation history correctly', async () => {
      const mockAnthropic = {
        messages: {
          create: jest.fn().mockResolvedValue(mockAnthropicResponse)
        }
      }
      require('@anthropic-ai/sdk').default = jest.fn(() => mockAnthropic)

      const conversationHistory = [
        {
          id: 'msg_1' as any,
          role: 'user' as const,
          content: 'What is SN1?',
          timestamp: new Date()
        },
        {
          id: 'msg_2' as any,
          role: 'assistant' as const,
          content: 'SN1 is a two-step substitution mechanism...',
          timestamp: new Date()
        }
      ]

      const requestBody: ChatApiRequest = {
        message: 'Now explain SN2 and compare with SN1',
        sessionId: 'session_test_context' as SessionId,
        conversationHistory
      }

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      
      expect(response.status).toBe(200)
      expect(mockAnthropic.messages.create).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              content: expect.stringMatching(/SN1.*SN2/)
            })
          ])
        })
      )
    })

    it('should search for relevant educational videos', async () => {
      const mockAnthropic = {
        messages: {
          create: jest.fn().mockResolvedValue(mockAnthropicResponse)
        }
      }
      require('@anthropic-ai/sdk').default = jest.fn(() => mockAnthropic)

      // Mock YouTube API response
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          items: [
            {
              id: { videoId: 'test123' },
              snippet: {
                title: 'SN2 Mechanism Explained',
                description: 'Complete guide to SN2 reactions',
                thumbnails: { medium: { url: 'https://test.jpg' } }
              }
            }
          ]
        })
      })

      const requestBody: ChatApiRequest = {
        message: 'Explain SN2 mechanism',
        sessionId: 'session_test_videos' as SessionId,
        conversationHistory: []
      }

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data: ChatApiResponse = await response.json()

      expect(data.data?.videoResults).toHaveLength(1)
      expect(data.data?.videoResults[0]).toMatchObject({
        id: 'test123',
        title: 'SN2 Mechanism Explained',
        url: 'https://www.youtube.com/watch?v=test123'
      })
    })
  })

  describe('Error Handling and Recovery', () => {
    it('should handle YouTube API failures gracefully', async () => {
      const mockAnthropic = {
        messages: {
          create: jest.fn().mockResolvedValue(mockAnthropicResponse)
        }
      }
      require('@anthropic-ai/sdk').default = jest.fn(() => mockAnthropic)

      // Mock YouTube API to fail
      global.fetch = jest.fn().mockRejectedValue(new Error('YouTube API down'))

      const requestBody: ChatApiRequest = {
        message: 'Explain photosynthesis',
        sessionId: 'session_test_yt_fail' as SessionId,
        conversationHistory: []
      }

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data: ChatApiResponse = await response.json()

      expect(response.status).toBe(200) // Should still succeed
      expect(data.data?.explanation).toBeDefined()
      expect(data.data?.videoResults).toBeInstanceOf(Array) // Should fallback to mock videos
    })

    it('should provide detailed error information for debugging', async () => {
      process.env.ANTHROPIC_API_KEY = 'demo_mode_enabled'
      process.env.OPENAI_API_KEY = 'demo_mode_enabled'

      const requestBody: ChatApiRequest = {
        message: 'Test question',
        sessionId: 'session_test_debug' as SessionId,
        conversationHistory: []
      }

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.details).toMatchObject({
        anthropicKey: expect.objectContaining({
          present: true,
          valid: false,
          expectedFormat: expect.any(String)
        }),
        openaiKey: expect.objectContaining({
          present: true,
          valid: false,
          expectedFormat: expect.any(String)
        }),
        troubleshooting: expect.stringMatching(/debug/)
      })
    })
  })
})

describe('Student Learning Experience', () => {
  it('should provide educational follow-up questions', async () => {
    const mockAnthropic = {
      messages: {
        create: jest.fn().mockResolvedValue({
          content: [{ 
            type: 'text', 
            text: 'SN2 reactions involve backside attack. Follow-up: How does substrate structure affect SN2 rates? What role does solvent play? Can you predict stereochemistry?'
          }]
        })
      }
    }
    require('@anthropic-ai/sdk').default = jest.fn(() => mockAnthropic)

    const requestBody: ChatApiRequest = {
      message: 'Basic SN2 question',
      sessionId: 'session_test_followup' as SessionId,
      conversationHistory: []
    }

    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' }
    })

    const response = await POST(request)
    const data: ChatApiResponse = await response.json()

    expect(data.data?.explanation).toMatch(/follow.*up|question/i)
    expect(data.data?.videoResults).toBeDefined()
  })
})