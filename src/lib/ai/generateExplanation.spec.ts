// Unit tests for AI explanation generation
// Following BP-T1: Colocate unit tests in same directory as source file

import { generateExplanation, parseStudentQuery, enhanceExplanationClarity } from './generateExplanation'
import type { StudentQuery, AiExplanation, SubjectArea, DifficultyLevel } from '../../types/education'

// Mock data for testing
const mockStudentQuery: StudentQuery = {
  id: 'q_test_123' as any,
  content: 'How to fix a sink drainage effectively?',
  subject: 'plumbing' as SubjectArea,
  difficultyLevel: 'intermediate' as DifficultyLevel,
  timestamp: new Date('2024-01-01T00:00:00Z'),
}

const mockConversationHistory: StudentQuery[] = [
  {
    id: 'q_test_001' as any,
    content: 'What tools do I need for clearing a P-trap?',
    subject: 'plumbing' as SubjectArea,
    timestamp: new Date('2024-01-01T00:00:00Z'),
  }
]

describe('AI Response Generation', () => {
  describe('parseStudentQuery', () => {
    it('should extract key plumbing concepts from student questions', () => {
      const result = parseStudentQuery('Explain how to clear a P-trap clog')
      
      expect(result).toMatchObject({
        concepts: expect.arrayContaining(['p-trap', 'drain', 'clog']),
        questionType: expect.any(String),
        difficultyLevel: expect.any(String),
        educationalIntent: expect.any(String)
      })
    })

    it('should handle complex plumbing queries', () => {
      const complexQuery = 'Why does my toilet gurgle when the sink drains?'
      const result = parseStudentQuery(complexQuery)
      
      expect(result.concepts).toEqual(expect.arrayContaining(['vent', 'drain', 'siphon']))
      expect(result.questionType).toBeDefined()
    })

    it('should identify follow-up questions for deeper learning', () => {
      const result = parseStudentQuery('What happens when a P-trap dries out?')
      
      expect(result.suggestedFollowUps).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/vent/i),
          expect.stringMatching(/trap/i),
          expect.stringMatching(/seal/i)
        ])
      )
    })
  })

  describe('generateExplanation', () => {
    it('should generate comprehensive explanations for plumbing concepts', async () => {
      const explanation = await generateExplanation({
        studentQuery: mockStudentQuery,
        conversationHistory: mockConversationHistory,
        preferredModality: 'visual'
      })

      expect(explanation).toMatchObject({
        content: expect.any(String),
        conceptsCovered: expect.any(Array),
        difficulty: 'intermediate',
        followUpQuestions: expect.any(Array),
        learningObjectives: expect.any(Array),
        keyTerms: expect.any(Array)
      })
    })

    it('should adapt explanation complexity to student level', async () => {
      const beginnerQuery: StudentQuery = {
        ...mockStudentQuery,
        difficultyLevel: 'beginner' as DifficultyLevel,
        content: 'What is a chemical bond?'
      }

      const explanation = await generateExplanation({
        studentQuery: beginnerQuery,
        conversationHistory: [],
      })

      expect(explanation.difficulty).toBe('beginner')
      expect(explanation.content).toMatch(/simple|basic|fundamental/i)
      expect(explanation.keyTerms.length).toBeLessThan(8) // Fewer terms for beginners
    })

    it('should provide step-specific explanations with visual cues', async () => {
      const mechanismQuery: StudentQuery = {
        ...mockStudentQuery,
        content: 'Show me how to solder a copper pipe step by step'
      }

      const explanation = await generateExplanation({
        studentQuery: mechanismQuery,
        conversationHistory: [],
        preferredModality: 'visual'
      })

      expect(explanation.content).toMatch(/step 1|step 2|clean|flux|heat/i)
      expect(explanation.conceptsCovered).toEqual(expect.any(Array))
      expect(explanation.learningObjectives).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/step.*step/i),
          expect.stringMatching(/step.*step/i)
        ])
      )
    })
  })

  describe('enhanceExplanationClarity', () => {
    it('should improve explanation readability for apprentices', () => {
      const basicExplanation = 'Clean the pipe, apply flux, heat evenly, then solder'
      const enhanced = enhanceExplanationClarity(basicExplanation, 'intermediate')

      expect(enhanced).toMatch(/evenly|avoid overheating|safety/i)
      expect(enhanced.length).toBeGreaterThan(basicExplanation.length)
    })

    it('should add relevant analogies for complex concepts', () => {
      const mechanismExplanation = 'Maintain pipe alignment and heat distribution during soldering'
      const enhanced = enhanceExplanationClarity(mechanismExplanation, 'advanced')

      expect(enhanced).toMatch(/like|similar to|imagine|think of/i)
      expect(enhanced).toMatch(/alignment|heat|distribution|angle/i)
    })
  })
})

describe('Educational Value Assessment', () => {
  it('should verify explanation contains learning objectives', async () => {
    const explanation = await generateExplanation({
      studentQuery: mockStudentQuery,
      conversationHistory: [],
    })

    expect(explanation.learningObjectives.length).toBeGreaterThan(0)
    expect(explanation.learningObjectives[0]).toMatch(/understand|learn|identify|explain/i)
  })

  it('should suggest progressive follow-up questions', async () => {
    const explanation = await generateExplanation({
      studentQuery: mockStudentQuery,
      conversationHistory: [],
    })

    expect(explanation.followUpQuestions.length).toBe(3)
    explanation.followUpQuestions.forEach(question => {
      expect(question).toMatch(/\?$/) // Should end with question mark
      expect(question.length).toBeGreaterThan(10) // Substantial questions
    })
  })

  it('should cover prerequisite concepts when needed', async () => {
    const advancedQuery: StudentQuery = {
      ...mockStudentQuery,
      content: 'Explain asymmetric synthesis using chiral auxiliaries',
      difficultyLevel: 'advanced' as DifficultyLevel
    }

    const explanation = await generateExplanation({
      studentQuery: advancedQuery,
      conversationHistory: [],
    })

    expect(explanation.conceptsCovered).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/chiral/),
        expect.stringMatching(/stereochemistry/),
        expect.stringMatching(/enantioselective/)
      ])
    )
  })
})