// AI explanation generation for educational content
// Following BP-C2: Educational domain vocabulary in function names

import type { 
  StudentQuery, 
  AiExplanation, 
  GenerateExplanationRequest,
  ConceptId,
  SubjectArea
} from '@/types/education'
import { DifficultyLevel } from '@/types/education'

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
  
  // Extract trades concepts using educational vocabulary
  const concepts: string[] = []
  const conceptMappings = {
    'toilet flange': ['toilet', 'flange', 'installation'],
    'p-trap': ['p-trap', 'drain', 'seal'],
    'venting': ['vent', 'stack', 'code'],
    'copper soldering': ['solder', 'flux', 'sweat'],
    'pex': ['pex', 'expansion', 'manifold'],
    'snake drain': ['drain', 'snake', 'clog']
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
      'What is the exact symptom and where is it occurring?',
      'Any existing damage, leak severity, or previous repairs?',
      'What tools and materials do you have on site?'
    ],
    'comparison': [
      'When would you choose snake vs hydro jet for this case?',
      'Do any building codes or constraints affect the choice?',
      'What cost or time constraints should we consider?'
    ],
    'definition': [
      'Can you point to the specific part (trap, vent, fitting)?',
      'What tools do you have available on site?',
      'Where in the system does this issue occur?'
    ],
    'synthesis': [
      'What alternative installation routes could work here?',
      'How would you improve reliability and serviceability?',
      'What common mistakes should be avoided?'
    ],
    'application': [
      'What are the limitations of this approach?',
      'How is this applied in the field?',
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

export async function generateExplanation(request: GenerateExplanationRequest & { preferredModality?: string }): Promise<AiExplanation> {
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
  
  // Add clarifications for plumbing terms based on difficulty level
  const clarifications = {
    'flux': 'flux (soldering paste that cleans and helps solder flow)',
    'sweat': 'sweat (to solder a copper joint)',
    'pitch': difficultyLevel === 'beginner' ? 'pitch (slope of pipe for drainage)' : 'pitch (drain slope)',
    'siphon': 'siphon (flow that can pull water from a trap and break the seal)',
    'trap seal': 'trap seal (water barrier that blocks sewer gas)',
    'dielectric union': 'dielectric union (fitting that prevents galvanic corrosion between metals)',
    'water hammer': 'water hammer (sudden pressure surge causing banging pipes)'
  }
  
  for (const [term, clarification] of Object.entries(clarifications)) {
    enhanced = enhanced.replace(new RegExp(term, 'gi'), clarification)
  }
  
  // Add analogies for complex concepts
  if (difficultyLevel !== 'expert') {
    const analogies = {
      'heat distribution': 'heat distribution (like evenly heating a pan to avoid hot spots)',
      'alignment': 'alignment (like lining up two dowels before gluing)',
      'siphonage': 'siphonage (like sucking liquid through a straw)',
      'expansion': 'expansion (like pipes growing slightly when heated)'
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
  const subjectObjectives: Record<string, string[]> = {
    'plumbing': [
      'Follow safe step-by-step installation and repair procedures',
      'Apply code-compliant techniques and sizing'
    ]
  }
  
  return [...baseObjectives, ...(subjectObjectives[subject as keyof typeof subjectObjectives] || [])]
}

function extractEducationalKeyTerms(content: string, subject: SubjectArea): string[] {
  const commonTerms: Record<string, string[]> = {
    'plumbing': [
      'flange', 'p-trap', 'vent', 'slope', 'solder', 'flux', 'pex', 'manifold', 'trap seal', 'cleanout'
    ]
  }
  
  const relevantTerms = commonTerms[subject as keyof typeof commonTerms] || commonTerms['plumbing']
  const contentLower = content.toLowerCase()
  
  return relevantTerms.filter(term => contentLower.includes(term))
}