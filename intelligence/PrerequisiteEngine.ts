import { 
  ConceptAnalysis, 
  UserProgress, 
  ContentModality,
  GeneratedContent 
} from '@/core/types'
import { SmartContentGenerator } from '@/generators/SmartContentGenerator'

interface ConceptPrerequisite {
  concept: string
  required: boolean
  difficulty: number
  estimatedTime: number
  description: string
  quickPrimer?: string
}

interface LearningPath {
  targetConcept: string
  prerequisites: ConceptPrerequisite[]
  totalEstimatedTime: number
  currentStep: number
  completedSteps: string[]
  nextRecommendation: string
}

interface PrerequisiteCheck {
  hasPrerequisites: boolean
  missingConcepts: ConceptPrerequisite[]
  suggestedPath: LearningPath
  canProceedDirectly: boolean
  quickPrimerAvailable: boolean
}

export class PrerequisiteEngine {
  private smartContentGenerator: SmartContentGenerator
  private conceptGraph: Map<string, ConceptPrerequisite[]> = new Map()
  private userKnowledge: Map<string, Set<string>> = new Map() // userId -> known concepts
  private quickPrimers: Map<string, string> = new Map()

  constructor() {
    this.smartContentGenerator = new SmartContentGenerator()
    this.initializeConceptGraph()
    this.initializeQuickPrimers()
    console.log('🧭 Prerequisite Engine initialized with concept dependency graph')
  }

  /**
   * Check if user has prerequisites for a concept
   */
  checkPrerequisites(
    concept: string, 
    userId?: string,
    userProgress?: UserProgress
  ): PrerequisiteCheck {
    console.log('🔍 Checking prerequisites for:', concept)
    
    const prerequisites = this.getPrerequisites(concept)
    const userKnowledge = this.getUserKnowledge(userId, userProgress)
    
    const missingConcepts = prerequisites.filter(prereq => 
      !userKnowledge.has(prereq.concept.toLowerCase())
    )
    
    const hasPrerequisites = prerequisites.length > 0
    const canProceedDirectly = missingConcepts.length === 0 || 
                              missingConcepts.every(c => !c.required)
    
    const suggestedPath = this.buildLearningPath(concept, missingConcepts, userId)
    const quickPrimerAvailable = missingConcepts.some(c => this.quickPrimers.has(c.concept))
    
    console.log(`📋 Prerequisites check: ${missingConcepts.length} missing, can proceed: ${canProceedDirectly}`)
    
    return {
      hasPrerequisites,
      missingConcepts,
      suggestedPath,
      canProceedDirectly,
      quickPrimerAvailable
    }
  }

  /**
   * Generate a quick primer for a prerequisite concept
   */
  async generateQuickPrimer(
    concept: string, 
    targetConcept: string,
    modality: ContentModality = 'animation'
  ): Promise<GeneratedContent> {
    console.log(`⚡ Generating quick primer for ${concept} (needed for ${targetConcept})`)
    
    // Check if we have a pre-written primer
    const quickPrimer = this.quickPrimers.get(concept)
    
    const primerContent = await this.smartContentGenerator.generateModalityContent(
      concept,
      modality,
      2 // Simplified complexity for primers
    )
    
    // Enhance with primer-specific content
    const enhancedContent = {
      ...primerContent,
      primer: {
        forConcept: targetConcept,
        quickExplanation: quickPrimer || `Quick overview of ${concept} to understand ${targetConcept}`,
        estimatedTime: 30, // Quick primers are always 30 seconds
        isPrerequisite: true
      }
    }
    
    return {
      id: `primer_${concept}_${Date.now()}`,
      queryId: `primer_for_${targetConcept}`,
      modality,
      data: enhancedContent,
      metadata: {
        title: `Quick Primer: ${concept}`,
        description: `Essential background for understanding ${targetConcept}`,
        estimatedDuration: 30,
        difficulty: 2,
        tags: [concept, 'primer', 'prerequisite', targetConcept]
      }
    }
  }

  /**
   * Get full learning path for a concept
   */
  async generateLearningPath(
    concept: string,
    userId?: string,
    userProgress?: UserProgress
  ): Promise<LearningPath> {
    console.log('🗺️ Generating learning path for:', concept)
    
    const check = this.checkPrerequisites(concept, userId, userProgress)
    
    if (check.canProceedDirectly) {
      return {
        targetConcept: concept,
        prerequisites: [],
        totalEstimatedTime: 0,
        currentStep: 0,
        completedSteps: [],
        nextRecommendation: `Ready to learn ${concept}!`
      }
    }
    
    // Sort missing prerequisites by difficulty and dependencies
    const sortedPrerequisites = this.sortPrerequisitesByDependency(check.missingConcepts)
    
    const totalTime = sortedPrerequisites.reduce((sum, prereq) => sum + prereq.estimatedTime, 0)
    
    return {
      targetConcept: concept,
      prerequisites: sortedPrerequisites,
      totalEstimatedTime: totalTime,
      currentStep: 0,
      completedSteps: [],
      nextRecommendation: sortedPrerequisites.length > 0 
        ? `Start with "${sortedPrerequisites[0].concept}"` 
        : `Ready for ${concept}!`
    }
  }

  /**
   * Update user knowledge after learning a concept
   */
  markConceptLearned(userId: string, concept: string): void {
    if (!this.userKnowledge.has(userId)) {
      this.userKnowledge.set(userId, new Set())
    }
    
    this.userKnowledge.get(userId)!.add(concept.toLowerCase())
    console.log(`✅ Marked ${concept} as learned for user ${userId}`)
    
    // Also add related concepts that are implied
    const impliedConcepts = this.getImpliedKnowledge(concept)
    impliedConcepts.forEach(implied => {
      this.userKnowledge.get(userId)!.add(implied.toLowerCase())
    })
  }

  /**
   * Suggest next step in learning path
   */
  getNextStep(learningPath: LearningPath): ConceptPrerequisite | null {
    if (learningPath.currentStep >= learningPath.prerequisites.length) {
      return null
    }
    
    return learningPath.prerequisites[learningPath.currentStep]
  }

  /**
   * Check if concept is foundational (many others depend on it)
   */
  isFoundationalConcept(concept: string): boolean {
    const dependents = Array.from(this.conceptGraph.entries())
      .filter(([_, prereqs]) => prereqs.some(p => p.concept.toLowerCase() === concept.toLowerCase()))
      .length
    
    return dependents >= 3 // If 3+ concepts depend on it, it's foundational
  }

  /**
   * Get concepts that this concept enables
   */
  getEnabledConcepts(concept: string): string[] {
    return Array.from(this.conceptGraph.entries())
      .filter(([_, prereqs]) => 
        prereqs.some(p => p.concept.toLowerCase() === concept.toLowerCase())
      )
      .map(([enabled, _]) => enabled)
  }

  /**
   * Generate learning path visualization data
   */
  getPathVisualization(learningPath: LearningPath): any {
    return {
      nodes: [
        ...learningPath.prerequisites.map((prereq, index) => ({
          id: prereq.concept,
          label: prereq.concept,
          type: 'prerequisite',
          difficulty: prereq.difficulty,
          completed: learningPath.completedSteps.includes(prereq.concept),
          current: index === learningPath.currentStep,
          estimatedTime: prereq.estimatedTime
        })),
        {
          id: learningPath.targetConcept,
          label: learningPath.targetConcept,
          type: 'target',
          difficulty: 8,
          completed: false,
          current: false,
          estimatedTime: 300
        }
      ],
      edges: [
        ...learningPath.prerequisites.map(prereq => ({
          from: prereq.concept,
          to: learningPath.targetConcept,
          type: 'enables'
        })),
        ...learningPath.prerequisites.slice(0, -1).map((prereq, index) => ({
          from: prereq.concept,
          to: learningPath.prerequisites[index + 1].concept,
          type: 'leads_to'
        }))
      ]
    }
  }

  private initializeConceptGraph(): void {
    // Define prerequisite relationships for common educational concepts
    this.conceptGraph.set('quantum entanglement', [
      {
        concept: 'quantum mechanics basics',
        required: true,
        difficulty: 6,
        estimatedTime: 180,
        description: 'Basic principles of quantum mechanics including superposition'
      },
      {
        concept: 'wave-particle duality',
        required: true,
        difficulty: 5,
        estimatedTime: 120,
        description: 'Understanding that particles can behave as waves'
      },
      {
        concept: 'probability and statistics',
        required: false,
        difficulty: 4,
        estimatedTime: 90,
        description: 'Basic probability concepts for quantum measurements'
      }
    ])

    this.conceptGraph.set('crispr gene editing', [
      {
        concept: 'dna structure',
        required: true,
        difficulty: 4,
        estimatedTime: 120,
        description: 'Understanding DNA double helix and base pairs'
      },
      {
        concept: 'protein synthesis',
        required: true,
        difficulty: 5,
        estimatedTime: 150,
        description: 'How genes code for proteins'
      },
      {
        concept: 'bacterial immunity',
        required: false,
        difficulty: 6,
        estimatedTime: 100,
        description: 'How bacteria defend against viruses (CRISPR origin)'
      }
    ])

    this.conceptGraph.set('recursion', [
      {
        concept: 'functions',
        required: true,
        difficulty: 3,
        estimatedTime: 90,
        description: 'Understanding what functions are and how they work'
      },
      {
        concept: 'call stack',
        required: true,
        difficulty: 5,
        estimatedTime: 120,
        description: 'How function calls are managed in memory'
      },
      {
        concept: 'problem decomposition',
        required: false,
        difficulty: 4,
        estimatedTime: 60,
        description: 'Breaking problems into smaller sub-problems'
      }
    ])

    this.conceptGraph.set('machine learning', [
      {
        concept: 'statistics',
        required: true,
        difficulty: 5,
        estimatedTime: 200,
        description: 'Statistical concepts and data analysis'
      },
      {
        concept: 'linear algebra',
        required: true,
        difficulty: 6,
        estimatedTime: 240,
        description: 'Vectors, matrices, and linear transformations'
      },
      {
        concept: 'calculus',
        required: false,
        difficulty: 7,
        estimatedTime: 180,
        description: 'Derivatives and optimization (for advanced ML)'
      }
    ])

    this.conceptGraph.set('photosynthesis', [
      {
        concept: 'cellular respiration',
        required: false,
        difficulty: 4,
        estimatedTime: 100,
        description: 'How cells use energy (opposite of photosynthesis)'
      },
      {
        concept: 'chemical reactions',
        required: true,
        difficulty: 3,
        estimatedTime: 80,
        description: 'Basic understanding of chemical processes'
      }
    ])

    console.log(`📚 Initialized concept graph with ${this.conceptGraph.size} concepts`)
  }

  private initializeQuickPrimers(): void {
    this.quickPrimers.set('quantum mechanics basics', 
      'Quantum mechanics describes the behavior of very small particles. Unlike everyday objects, these particles can exist in multiple states at once (superposition) until measured.')

    this.quickPrimers.set('wave-particle duality',
      'Light and matter can act like both waves and particles. Think of an electron as sometimes behaving like a wave (spreads out) and sometimes like a particle (localized point).')

    this.quickPrimers.set('dna structure',
      'DNA is like a twisted ladder (double helix) with rungs made of four letters: A, T, G, C. These letters spell out instructions for making proteins.')

    this.quickPrimers.set('protein synthesis',
      'Genes are recipes written in DNA. Cells read these recipes and use them to build proteins, which do most of the work in your body.')

    this.quickPrimers.set('functions',
      'A function is like a recipe that takes ingredients (inputs) and produces a dish (output). You can use the same recipe multiple times with different ingredients.')

    this.quickPrimers.set('call stack',
      'When functions call other functions, the computer keeps track using a stack - like a pile of papers. The most recent function call goes on top.')

    this.quickPrimers.set('statistics',
      'Statistics helps us understand data by finding patterns, averages, and relationships. It tells us what\'s typical and what\'s unusual in a dataset.')

    this.quickPrimers.set('linear algebra',
      'Linear algebra works with lists of numbers (vectors) and tables of numbers (matrices). It\'s the math behind many computer graphics and AI systems.')

    console.log(`⚡ Initialized ${this.quickPrimers.size} quick primers`)
  }

  private getPrerequisites(concept: string): ConceptPrerequisite[] {
    const conceptLower = concept.toLowerCase()
    
    // Direct lookup
    if (this.conceptGraph.has(conceptLower)) {
      return this.conceptGraph.get(conceptLower)!
    }
    
    // Fuzzy matching for partial concept names
    for (const [key, prerequisites] of this.conceptGraph.entries()) {
      if (key.includes(conceptLower) || conceptLower.includes(key)) {
        return prerequisites
      }
    }
    
    // No prerequisites found
    return []
  }

  private getUserKnowledge(userId?: string, userProgress?: UserProgress): Set<string> {
    const knowledge = new Set<string>()
    
    // From explicit user knowledge tracking
    if (userId && this.userKnowledge.has(userId)) {
      this.userKnowledge.get(userId)!.forEach(concept => knowledge.add(concept))
    }
    
    // From user progress (concepts they've successfully learned)
    if (userProgress) {
      userProgress.conceptsLearned.forEach(concept => knowledge.add(concept.toLowerCase()))
    }
    
    // Add foundational concepts everyone should know
    const foundational = ['reading', 'basic math', 'everyday objects']
    foundational.forEach(concept => knowledge.add(concept))
    
    return knowledge
  }

  private buildLearningPath(
    concept: string, 
    missingConcepts: ConceptPrerequisite[],
    userId?: string
  ): LearningPath {
    const sorted = this.sortPrerequisitesByDependency(missingConcepts)
    const totalTime = sorted.reduce((sum, prereq) => sum + prereq.estimatedTime, 0)
    
    return {
      targetConcept: concept,
      prerequisites: sorted,
      totalEstimatedTime: totalTime,
      currentStep: 0,
      completedSteps: [],
      nextRecommendation: sorted.length > 0 
        ? `Let's start with "${sorted[0].concept}" - it'll take about ${sorted[0].estimatedTime} seconds`
        : `You're ready to learn ${concept}!`
    }
  }

  private sortPrerequisitesByDependency(prerequisites: ConceptPrerequisite[]): ConceptPrerequisite[] {
    // Sort by: required first, then by difficulty (easier first), then by time (shorter first)
    return prerequisites.sort((a, b) => {
      if (a.required !== b.required) return a.required ? -1 : 1
      if (a.difficulty !== b.difficulty) return a.difficulty - b.difficulty
      return a.estimatedTime - b.estimatedTime
    })
  }

  private getImpliedKnowledge(concept: string): string[] {
    // When someone learns a concept, what else can we assume they know?
    const implications: Record<string, string[]> = {
      'quantum mechanics basics': ['atoms', 'energy', 'physics basics'],
      'dna structure': ['cells', 'biology basics', 'molecules'],
      'functions': ['programming basics', 'variables', 'logic'],
      'statistics': ['math basics', 'numbers', 'averages'],
      'photosynthesis': ['plants', 'energy', 'sun', 'biology basics']
    }
    
    return implications[concept.toLowerCase()] || []
  }
}