// Jest setup for educational tutor testing
// Following BP-T3: Separate pure-logic unit tests from API-touching integration tests

const { TextEncoder, TextDecoder } = require('util')

// Polyfills for Node.js environment
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: '',
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    }
  },
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock environment variables for testing
process.env.ANTHROPIC_API_KEY = 'sk-ant-test123456789012345678901234567890'
process.env.OPENAI_API_KEY = 'sk-test123456789012345678901234567890123456'
process.env.YOUTUBE_API_KEY = 'test_youtube_key'
process.env.NODE_ENV = 'test'

// Global test utilities for educational content
global.createMockStudentQuery = (overrides = {}) => ({
  id: 'q_test_123',
  content: 'How to fix a sink drainage effectively?',
  subject: 'plumbing',
  difficultyLevel: 'intermediate',
  timestamp: new Date('2024-01-01T00:00:00Z'),
  ...overrides
})

global.createMockVideoContent = (overrides = {}) => ({
  id: 'youtube_test123',
  title: 'Fix a Sink Drainage - Step by Step',
  description: 'Complete guide to clearing a P-trap clog',
  thumbnail: 'https://test.jpg',
  url: 'https://youtube.com/watch?v=test123',
  duration: '15:30',
  source: 'youtube',
  relevanceScore: 0.9,
  educationalValue: 0.85,
  ...overrides
})

// Suppress console logs in tests unless debugging
const originalConsoleLog = console.log
const originalConsoleError = console.error

console.log = (...args) => {
  if (process.env.DEBUG_TESTS) {
    originalConsoleLog(...args)
  }
}

console.error = (...args) => {
  if (process.env.DEBUG_TESTS || args[0]?.includes?.('Educational')) {
    originalConsoleError(...args)
  }
}