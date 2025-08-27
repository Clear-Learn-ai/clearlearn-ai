// AI explanation generation for educational content
// Following BP-C2: Educational domain vocabulary in function names

import type { 
  StudentQuery, 
  AiExplanation, 
  GenerateExplanationRequest,
  ConceptId,
  SubjectArea
} from '../../types/education'
import { DifficultyLevel } from '../../types/education'

// Core educational AI processing functions
export interface ParsedQuery {
  concepts: string[]
  questionType: 'mechanism_explanation' | 'comparison' | 'definition' | 'application' | 'synthesis'
  difficultyLevel: DifficultyLevel
  educationalIntent: string
  suggestedFollowUps: string[]
}

export function parseStudentQuery(queryContent: string): ParsedQuery {
  const content = queryContent.toLowerCase()
  
  // Extract chemistry concepts using educational vocabulary
  const concepts: string[] = []
  const conceptMappings = {
    'sn2': ['sn2', 'nucleophilic_substitution', 'backside_attack'],
    'sn1': ['sn1', 'carbocation', 'substitution'],
    'e2': ['e2', 'elimination', 'anti_periplanar'],
    'e1': ['e1', 'elimination', 'carbocation'],
    'aldol': ['aldol', 'condensation', 'enolate'],
    'photosynthesis': ['photosynthesis', 'light_reactions', 'calvin_cycle'],
    'stereochemistry': ['stereochemistry', 'chiral', 'enantiomers'],
    'primary alkyl halide': ['primary_alkyl_halide', 'substitution_preference']
  }
  
  for (const [key, mappedConcepts] of Object.entries(conceptMappings)) {
    if (content.includes(key)) {
      concepts.push(...mappedConcepts)
    }
  }
  
  // Determine question type for educational scaffolding
  let questionType: ParsedQuery['questionType'] = 'definition'
  if (content.includes('mechanism') || content.includes('how does')) {
    questionType = 'mechanism_explanation'
  } else if (content.includes('compare') || content.includes('vs') || content.includes('difference')) {
    questionType = 'comparison'
  } else if (content.includes('synthesize') || content.includes('make')) {
    questionType = 'synthesis'
  } else if (content.includes('apply') || content.includes('use')) {
    questionType = 'application'
  }
  
  // Assess difficulty level for appropriate scaffolding
  let difficultyLevel: DifficultyLevel = DifficultyLevel.INTERMEDIATE
  if (content.includes('basic') || content.includes('simple') || content.includes('what is')) {
    difficultyLevel = DifficultyLevel.BEGINNER
  } else if (content.includes('advanced') || content.includes('complex') || content.includes('asymmetric')) {
    difficultyLevel = DifficultyLevel.ADVANCED
  }
  
  // Generate educational follow-up questions
  const followUpsByType = {
    'mechanism_explanation': [
      'What factors affect the reaction rate?',
      'How does stereochemistry change during this reaction?',
      'What substrates work best for this mechanism?'
    ],
    'comparison': [
      'When would you choose one over the other?',
      'What experimental conditions favor each?',
      'How do the energy profiles differ?'
    ],
    'definition': [
      'Can you identify this in a molecule?',
      'What are some examples in biochemistry?',
      'How is this concept applied in drug design?'
    ],
    'synthesis': [
      'What are alternative synthetic routes?',
      'How would you optimize yield?',
      'What side reactions should you avoid?'
    ],
    'application': [
      'What are the limitations of this approach?',
      'How is this used in industry?',
      'What safety considerations apply?'
    ]
  }
  
  return {
    concepts,
    questionType,
    difficultyLevel,
    educationalIntent: `Help student understand ${questionType.replace('_', ' ')} at ${difficultyLevel} level`,
    suggestedFollowUps: followUpsByType[questionType] || []
  }
}

export async function generateExplanation(request: GenerateExplanationRequest): Promise<AiExplanation> {
  const parsedQuery = parseStudentQuery(request.studentQuery.content)
  
  // Build educational context from conversation history
  const conversationContext = buildLearningContext(request.conversationHistory)
  
  // Generate core explanation content
  const explanationContent = await generateEducationalContent(
    request.studentQuery,
    parsedQuery,
    conversationContext,
    request.preferredModality
  )
  
  // Extract covered concepts for learning tracking
  const conceptsCovered = identifyCoveredConcepts(explanationContent, parsedQuery.concepts)
  
  // Generate progressive follow-up questions
  const followUpQuestions = generateFollowUpQuestions(parsedQuery, request.studentQuery.difficultyLevel)
  
  // Create learning objectives
  const learningObjectives = generateLearningObjectives(parsedQuery, request.studentQuery.subject)
  
  // Extract key terminology
  const keyTerms = extractEducationalKeyTerms(explanationContent, request.studentQuery.subject)
  
  return {
    content: explanationContent,
    conceptsCovered: conceptsCovered.map(concept => concept as ConceptId),
    difficulty: request.studentQuery.difficultyLevel || parsedQuery.difficultyLevel,
    followUpQuestions,
    learningObjectives,
    keyTerms
  }
}

export function enhanceExplanationClarity(explanation: string, difficultyLevel: DifficultyLevel): string {
  let enhanced = explanation
  
  // Add clarifications for technical terms based on difficulty level
  const clarifications = {
    'concerted': difficultyLevel === 'beginner' ? 'concerted (happening simultaneously)' : 'concerted',
    'backside attack': 'backside attack (nucleophile approaches from the opposite side)',
    'anti-periplanar': difficultyLevel === 'advanced' ? 
      'anti-periplanar (180° dihedral angle, like opposite sides of a see-saw)' : 
      'anti-periplanar (opposite sides, 180° apart)',
    'enolate': 'enolate (negatively charged carbon next to a carbonyl)'
  }
  
  for (const [term, clarification] of Object.entries(clarifications)) {
    enhanced = enhanced.replace(new RegExp(term, 'gi'), clarification)
  }
  
  // Add analogies for complex concepts
  if (difficultyLevel !== 'expert') {
    const analogies = {
      'orbital overlap': 'orbital overlap (like two soap bubbles touching and merging)',
      'resonance': 'resonance (like a hybrid of multiple structures, similar to a mule being a mix of horse and donkey)',
      'steric hindrance': 'steric hindrance (molecular crowding, like trying to park in a tight space)'
    }
    
    for (const [concept, analogy] of Object.entries(analogies)) {
      enhanced = enhanced.replace(new RegExp(concept, 'gi'), analogy)
    }
  }
  
  return enhanced
}

// Helper functions for educational content generation
function buildLearningContext(conversationHistory: StudentQuery[]): string {
  if (conversationHistory.length === 0) return ''
  
  const recentQueries = conversationHistory.slice(-3)
  return recentQueries
    .map(query => `Previous topic: ${query.content}`)
    .join('; ')
}

async function generateEducationalContent(
  query: StudentQuery,
  parsedQuery: ParsedQuery,
  context: string,
  modality?: string
): Promise<string> {
  // In production, this would call the AI service
  // For now, return structured educational content
  const modalityInstructions = modality === 'visual' ? 
    'Include step-by-step visual descriptions and mention where arrows point in mechanisms.' : ''
  
  return `Understanding ${query.subject.replace('_', ' ')}: ${query.content}

${modalityInstructions}

Key concepts to master: ${parsedQuery.concepts.join(', ')}
Difficulty level: ${parsedQuery.difficultyLevel}

[This would be replaced by actual AI-generated content in production]

Learning context: ${context || 'Fresh start - building foundational understanding'}`
}

function identifyCoveredConcepts(content: string, inputConcepts: string[]): string[] {
  const contentLower = content.toLowerCase()
  return inputConcepts.filter(concept => 
    contentLower.includes(concept.replace('_', ' ')) || 
    contentLower.includes(concept.replace('_', ''))
  )
}

function generateFollowUpQuestions(parsedQuery: ParsedQuery, difficultyLevel?: DifficultyLevel): string[] {
  const baseQuestions = parsedQuery.suggestedFollowUps
  
  // Adapt questions to difficulty level
  if (difficultyLevel === 'beginner') {
    return baseQuestions.map(q => q.replace(/optimize|advanced|complex/, 'improve'))
  } else if (difficultyLevel === 'advanced') {
    return [
      ...baseQuestions,
      'How would you modify this for pharmaceutical applications?',
      'What computational methods could predict this behavior?'
    ]
  }
  
  return baseQuestions
}

function generateLearningObjectives(parsedQuery: ParsedQuery, subject: SubjectArea): string[] {
  const baseObjectives = [
    `Understand the fundamental principles of ${parsedQuery.concepts[0]?.replace('_', ' ') || 'the topic'}`,
    `Identify key features and mechanisms involved`,
    `Apply knowledge to predict outcomes in similar situations`
  ]
  
  // Add subject-specific objectives
  const subjectObjectives = {
    'organic_chemistry': [
      'Predict reaction products and stereochemistry',
      'Understand structure-activity relationships'
    ],
    'biochemistry': [
      'Connect molecular mechanisms to biological function',
      'Understand metabolic pathway integration'
    ],
    'general_chemistry': [
      'Apply fundamental principles to new situations',
      'Understand thermodynamic and kinetic factors'
    ]
  }
  
  return [...baseObjectives, ...(subjectObjectives[subject as keyof typeof subjectObjectives] || [])]
}

function extractEducationalKeyTerms(content: string, subject: SubjectArea): string[] {
  const commonTerms = {
    'organic_chemistry': [
      'nucleophile', 'electrophile', 'mechanism', 'stereochemistry', 'chirality',
      'carbocation', 'carbanion', 'radical', 'resonance', 'aromaticity'
    ],
    'biochemistry': [
      'enzyme', 'substrate', 'cofactor', 'metabolism', 'pathway',
      'regulation', 'allosteric', 'kinetics', 'thermodynamics'
    ],
    'biology': [
      'cell', 'membrane', 'protein', 'DNA', 'RNA', 'evolution',
      'adaptation', 'homeostasis', 'ecology'
    ]
  }
  
  const relevantTerms = commonTerms[subject as keyof typeof commonTerms] || commonTerms['organic_chemistry']
  const contentLower = content.toLowerCase()
  
  return relevantTerms.filter(term => contentLower.includes(term))
}