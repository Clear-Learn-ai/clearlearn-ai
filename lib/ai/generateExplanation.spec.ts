// Unit tests for AI explanation generation
// Following BP-T1: Colocate unit tests in same directory as source file

import { generateExplanation, parseStudentQuery, enhanceExplanationClarity } from './generateExplanation'
import type { StudentQuery, AiExplanation, SubjectArea, DifficultyLevel } from '../../types/education'

// Mock data for testing
const mockStudentQuery: StudentQuery = {
  id: 'q_test_123' as any,
  content: 'How does the SN2 reaction mechanism work?',
  subject: 'organic_chemistry' as SubjectArea,
  difficultyLevel: 'intermediate' as DifficultyLevel,
  timestamp: new Date('2024-01-01T00:00:00Z'),
}

const mockConversationHistory: StudentQuery[] = [
  {
    id: 'q_test_001' as any,
    content: 'What is nucleophilic substitution?',
    subject: 'organic_chemistry' as SubjectArea,
    timestamp: new Date('2024-01-01T00:00:00Z'),
  }
]

describe('AI Response Generation', () => {
  describe('parseStudentQuery', () => {
    it('should extract key chemistry concepts from student questions', () => {
      const result = parseStudentQuery('Explain SN2 mechanism with stereochemistry')
      
      expect(result).toMatchObject({
        concepts: expect.arrayContaining(['sn2', 'mechanism', 'stereochemistry']),
        questionType: 'mechanism_explanation',
        difficultyLevel: expect.any(String),
        educationalIntent: expect.any(String)
      })
    })

    it('should handle complex organic chemistry queries', () => {
      const complexQuery = 'Why does primary alkyl halide favor SN2 over SN1 reaction?'
      const result = parseStudentQuery(complexQuery)
      
      expect(result.concepts).toContain('sn2')
      expect(result.concepts).toContain('sn1')
      expect(result.concepts).toContain('primary_alkyl_halide')
      expect(result.questionType).toBe('comparison')
    })

    it('should identify follow-up questions for deeper learning', () => {
      const result = parseStudentQuery('What happens in E2 elimination?')
      
      expect(result.suggestedFollowUps).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/stereochemistry/i),
          expect.stringMatching(/mechanism/i),
          expect.stringMatching(/substrate/i)
        ])
      )
    })
  })

  describe('generateExplanation', () => {
    it('should generate comprehensive explanations for organic chemistry concepts', async () => {
      const explanation = await generateExplanation({
        studentQuery: mockStudentQuery,
        conversationHistory: mockConversationHistory,
        preferredModality: 'visual'
      })

      expect(explanation).toMatchObject({
        content: expect.any(String),
        conceptsCovered: expect.arrayContaining(['sn2_mechanism']),
        difficulty: 'intermediate',
        followUpQuestions: expect.any(Array),
        learningObjectives: expect.any(Array),
        keyTerms: expect.arrayContaining(['nucleophile', 'electrophile'])
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

    it('should provide mechanism-specific explanations with visual cues', async () => {
      const mechanismQuery: StudentQuery = {
        ...mockStudentQuery,
        content: 'Show me the aldol condensation mechanism step by step'
      }

      const explanation = await generateExplanation({
        studentQuery: mechanismQuery,
        conversationHistory: [],
        preferredModality: 'visual'
      })

      expect(explanation.content).toMatch(/step 1|step 2|arrow|electron/i)
      expect(explanation.conceptsCovered).toContain('aldol_condensation')
      expect(explanation.learningObjectives).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/mechanism/i),
          expect.stringMatching(/step.*step/i)
        ])
      )
    })
  })

  describe('enhanceExplanationClarity', () => {
    it('should improve explanation readability for pre-med students', () => {
      const basicExplanation = 'SN2 reactions proceed via concerted mechanism with backside attack'
      const enhanced = enhanceExplanationClarity(basicExplanation, 'intermediate')

      expect(enhanced).toMatch(/simultaneously|at the same time/i) // Explains 'concerted'
      expect(enhanced).toMatch(/opposite side|back.*side/i) // Explains 'backside attack'
      expect(enhanced.length).toBeGreaterThan(basicExplanation.length)
    })

    it('should add relevant analogies for complex concepts', () => {
      const mechanismExplanation = 'E2 elimination requires anti-periplanar geometry'
      const enhanced = enhanceExplanationClarity(mechanismExplanation, 'advanced')

      expect(enhanced).toMatch(/like|similar to|imagine|think of/i)
      expect(enhanced).toMatch(/anti.*periplanar|180.*degree|opposite/i)
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