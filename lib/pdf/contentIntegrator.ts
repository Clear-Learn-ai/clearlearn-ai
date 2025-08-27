import { PDFProcessor, PDFContent, PDFSection, InstallationStep } from './pdfProcessor'
import { PlumbingComponent, PlumbingInstallation, PlumbingTool } from '@/types/plumbing'

interface TrainingData {
  id: string
  type: 'qa_pair' | 'procedure' | 'specification' | 'troubleshooting'
  question: string
  answer: string
  context: {
    source: string
    manufacturer?: string
    category: string
    codeReferences?: string[]
    relatedComponents?: string[]
  }
  embeddings?: number[]
  tags: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

interface ComponentReference {
  componentId: string
  componentName: string
  modelPath?: string
  relatedProcedures: string[]
  specifications: ComponentSpec[]
  troubleshooting: TroubleshootingItem[]
}

interface ComponentSpec {
  property: string
  value: string
  unit?: string
  codeReference?: string
}

interface TroubleshootingItem {
  problem: string
  symptoms: string[]
  solutions: string[]
  tools?: string[]
  difficulty: 'easy' | 'medium' | 'hard'
}

interface ContentSearchResult {
  content: string
  source: string
  relevance: number
  category: string
  manufacturer?: string
  procedures?: InstallationStep[]
}

export class ContentIntegrator {
  private pdfProcessor: PDFProcessor
  private trainingData: Map<string, TrainingData> = new Map()
  private componentReferences: Map<string, ComponentReference> = new Map()

  constructor() {
    this.pdfProcessor = new PDFProcessor()
  }

  // Generate training data from processed PDFs
  async generateTrainingData(pdfContents: PDFContent[]): Promise<TrainingData[]> {
    const trainingData: TrainingData[] = []

    for (const pdf of pdfContents) {
      // Generate Q&A pairs from sections
      for (const section of pdf.sections) {
        const qaPairs = await this.generateQAPairs(section, pdf)
        trainingData.push(...qaPairs)

        // Generate procedure-specific training data
        if (section.procedures && section.procedures.length > 0) {
          const procedureData = await this.generateProcedureData(section.procedures, pdf)
          trainingData.push(...procedureData)
        }

        // Generate troubleshooting data
        if (section.type === 'troubleshooting') {
          const troubleshootingData = await this.generateTroubleshootingData(section, pdf)
          trainingData.push(...troubleshootingData)
        }

        // Generate specification data
        if (section.type === 'specifications') {
          const specData = await this.generateSpecificationData(section, pdf)
          trainingData.push(...specData)
        }
      }
    }

    // Store training data
    trainingData.forEach(data => this.trainingData.set(data.id, data))

    return trainingData
  }

  private async generateQAPairs(section: PDFSection, pdf: PDFContent): Promise<TrainingData[]> {
    const qaPairs: TrainingData[] = []

    // Extract key information from section content
    const keyPoints = this.extractKeyPoints(section.content)

    for (let i = 0; i < keyPoints.length; i++) {
      const point = keyPoints[i]
      
      // Generate different types of questions
      const questions = this.generateQuestionsFromKeyPoint(point, section.type, pdf.manufacturer)

      for (const question of questions) {
        qaPairs.push({
          id: `${pdf.id}_${section.title}_qa_${i}_${questions.indexOf(question)}`,
          type: 'qa_pair',
          question: question.question,
          answer: question.answer,
          context: {
            source: pdf.filename,
            manufacturer: pdf.manufacturer,
            category: pdf.category,
            codeReferences: this.extractCodeReferences(section.content),
            relatedComponents: this.extractComponentReferences(section.content),
          },
          tags: this.generateTags(question.question, section.type, pdf.manufacturer),
          difficulty: this.assessDifficulty(question.question, section.content),
        })
      }
    }

    return qaPairs
  }

  private extractKeyPoints(content: string): string[] {
    const keyPoints: string[] = []

    // Look for bullet points, numbered lists, and important statements
    const patterns = [
      /(?:^|\n)[\s]*[•\-\*]\s*([^.\n]{20,200})/g,
      /(?:^|\n)[\s]*\d+\.\s*([^.\n]{20,200})/g,
      /(?:important|note|remember|ensure):\s*([^.\n]{20,200})/gi,
    ]

    patterns.forEach(pattern => {
      let match
      while ((match = pattern.exec(content)) !== null) {
        keyPoints.push(match[1].trim())
      }
    })

    return keyPoints
  }

  private generateQuestionsFromKeyPoint(
    keyPoint: string, 
    sectionType: PDFSection['type'], 
    manufacturer?: string
  ): Array<{ question: string; answer: string }> {
    const questions: Array<{ question: string; answer: string }> = []

    // Generate different question types based on section type
    switch (sectionType) {
      case 'installation':
        questions.push(
          {
            question: `How do you ${this.extractAction(keyPoint)}?`,
            answer: keyPoint,
          },
          {
            question: `What is the proper way to ${this.extractAction(keyPoint)}?`,
            answer: keyPoint,
          }
        )
        break

      case 'specifications':
        questions.push(
          {
            question: `What are the specifications for ${this.extractSubject(keyPoint)}?`,
            answer: keyPoint,
          },
          {
            question: `What size/type of ${this.extractSubject(keyPoint)} should I use?`,
            answer: keyPoint,
          }
        )
        break

      case 'troubleshooting':
        questions.push(
          {
            question: `How do I fix ${this.extractProblem(keyPoint)}?`,
            answer: keyPoint,
          },
          {
            question: `What causes ${this.extractProblem(keyPoint)}?`,
            answer: keyPoint,
          }
        )
        break

      case 'safety':
        questions.push(
          {
            question: `What safety precautions should I take when ${this.extractContext(keyPoint)}?`,
            answer: keyPoint,
          },
          {
            question: `What are the safety requirements for ${this.extractContext(keyPoint)}?`,
            answer: keyPoint,
          }
        )
        break

      default:
        questions.push({
          question: `Tell me about ${this.extractSubject(keyPoint)}.`,
          answer: keyPoint,
        })
    }

    return questions.filter(q => q.question.length > 10 && q.answer.length > 20)
  }

  private async generateProcedureData(
    procedures: InstallationStep[], 
    pdf: PDFContent
  ): Promise<TrainingData[]> {
    const procedureData: TrainingData[] = []

    for (const procedure of procedures) {
      // Generate step-by-step question
      procedureData.push({
        id: `${pdf.id}_procedure_${procedure.stepNumber}`,
        type: 'procedure',
        question: `What is step ${procedure.stepNumber} in ${procedure.title.toLowerCase()}?`,
        answer: `Step ${procedure.stepNumber}: ${procedure.description}${
          procedure.tools ? `\n\nTools needed: ${procedure.tools.join(', ')}` : ''
        }${
          procedure.materials ? `\n\nMaterials: ${procedure.materials.join(', ')}` : ''
        }${
          procedure.warnings && procedure.warnings.length > 0 
            ? `\n\nWarnings: ${procedure.warnings.join('. ')}` 
            : ''
        }`,
        context: {
          source: pdf.filename,
          manufacturer: pdf.manufacturer,
          category: 'procedure',
          codeReferences: procedure.codeReferences,
        },
        tags: [
          'installation',
          'procedure',
          `step-${procedure.stepNumber}`,
          ...(procedure.tools || []),
          ...(pdf.manufacturer ? [pdf.manufacturer.toLowerCase()] : []),
        ],
        difficulty: this.assessProcedureDifficulty(procedure),
      })

      // Generate tool-specific questions if tools are specified
      if (procedure.tools && procedure.tools.length > 0) {
        procedureData.push({
          id: `${pdf.id}_tools_${procedure.stepNumber}`,
          type: 'procedure',
          question: `What tools do I need for ${procedure.title.toLowerCase()}?`,
          answer: `For ${procedure.title.toLowerCase()}, you will need: ${procedure.tools.join(', ')}`,
          context: {
            source: pdf.filename,
            manufacturer: pdf.manufacturer,
            category: 'procedure',
          },
          tags: ['tools', 'equipment', ...procedure.tools.map(t => t.toLowerCase())],
          difficulty: 'beginner',
        })
      }
    }

    return procedureData
  }

  private async generateTroubleshootingData(
    section: PDFSection, 
    pdf: PDFContent
  ): Promise<TrainingData[]> {
    const troubleshootingData: TrainingData[] = []

    // Extract problem-solution pairs from troubleshooting content
    const problemSolutions = this.extractProblemSolutions(section.content)

    problemSolutions.forEach((ps, index) => {
      troubleshootingData.push({
        id: `${pdf.id}_troubleshoot_${index}`,
        type: 'troubleshooting',
        question: `How do I fix ${ps.problem}?`,
        answer: ps.solution,
        context: {
          source: pdf.filename,
          manufacturer: pdf.manufacturer,
          category: 'troubleshooting',
        },
        tags: ['troubleshooting', 'repair', 'problem', ps.problem.toLowerCase()],
        difficulty: this.assessTroubleshootingDifficulty(ps.solution),
      })
    })

    return troubleshootingData
  }

  private async generateSpecificationData(
    section: PDFSection, 
    pdf: PDFContent
  ): Promise<TrainingData[]> {
    const specData: TrainingData[] = []

    // Extract specifications from content
    const specs = this.extractSpecifications(section.content)

    specs.forEach((spec, index) => {
      specData.push({
        id: `${pdf.id}_spec_${index}`,
        type: 'specification',
        question: `What are the specifications for ${spec.component}?`,
        answer: spec.details,
        context: {
          source: pdf.filename,
          manufacturer: pdf.manufacturer,
          category: 'specification',
        },
        tags: ['specifications', 'dimensions', spec.component.toLowerCase()],
        difficulty: 'intermediate',
      })
    })

    return specData
  }

  // Link procedures to 3D models
  linkProcedureTo3DModel(procedureId: string, modelPath: string): void {
    // Implementation to create associations between procedures and 3D models
    const componentRef = this.componentReferences.get(procedureId)
    if (componentRef) {
      componentRef.modelPath = modelPath
    }
  }

  // Search training data for AI responses
  async searchTrainingData(query: string, limit: number = 5): Promise<TrainingData[]> {
    try {
      // Use PDF processor's semantic search for relevant content
      const searchResults = await this.pdfProcessor.searchContent(query, limit * 2)

      // Map search results to training data
      const relevantData: TrainingData[] = []

      for (const result of searchResults) {
        // Find training data that matches this content
        const matchingData = Array.from(this.trainingData.values()).find(data =>
          data.answer.includes(result.content.substring(0, 100)) ||
          result.content.includes(data.answer.substring(0, 100))
        )

        if (matchingData && !relevantData.find(d => d.id === matchingData.id)) {
          relevantData.push(matchingData)
        }
      }

      return relevantData.slice(0, limit)

    } catch (error) {
      console.error('Error searching training data:', error)
      return []
    }
  }

  // Helper methods for content extraction
  private extractAction(text: string): string {
    const actionWords = text.match(/(?:install|connect|attach|secure|tighten|place|position|align)/i)
    return actionWords ? actionWords[0].toLowerCase() : 'work'
  }

  private extractSubject(text: string): string {
    const subjects = text.match(/(?:pipe|fitting|valve|toilet|sink|drain|connection|joint)/i)
    return subjects ? subjects[0].toLowerCase() : 'component'
  }

  private extractProblem(text: string): string {
    const problems = text.match(/(?:leak|blockage|clog|break|crack|overflow|backup)/i)
    return problems ? problems[0].toLowerCase() : 'issue'
  }

  private extractContext(text: string): string {
    return text.substring(0, 50) + '...'
  }

  private extractCodeReferences(content: string): string[] {
    const codePattern = /(?:IPC|UPC|NPC|CSA)\s*[\d.]+/g
    const matches = content.match(codePattern) || []
    return [...new Set(matches)]
  }

  private extractComponentReferences(content: string): string[] {
    const componentPattern = /(?:pipe|fitting|valve|toilet|sink|drain|elbow|tee|coupling|reducer)/gi
    const matches = content.match(componentPattern) || []
    return [...new Set(matches.map(m => m.toLowerCase()))]
  }

  private generateTags(question: string, sectionType: string, manufacturer?: string): string[] {
    const tags = [sectionType]
    
    if (manufacturer) {
      tags.push(manufacturer.toLowerCase())
    }

    // Extract relevant keywords from question
    const keywords = question.toLowerCase().match(/\b(?:install|repair|size|type|code|safety|tool|material)\b/g) || []
    tags.push(...keywords)

    return [...new Set(tags)]
  }

  private assessDifficulty(question: string, content: string): 'beginner' | 'intermediate' | 'advanced' {
    const advancedIndicators = ['thread', 'solder', 'pressure test', 'code compliance', 'inspection']
    const intermediateIndicators = ['install', 'connect', 'measure', 'cut', 'assemble']

    const questionLower = question.toLowerCase()
    const contentLower = content.toLowerCase()

    if (advancedIndicators.some(indicator => 
      questionLower.includes(indicator) || contentLower.includes(indicator))) {
      return 'advanced'
    }

    if (intermediateIndicators.some(indicator => 
      questionLower.includes(indicator) || contentLower.includes(indicator))) {
      return 'intermediate'
    }

    return 'beginner'
  }

  private assessProcedureDifficulty(procedure: InstallationStep): 'beginner' | 'intermediate' | 'advanced' {
    const description = procedure.description.toLowerCase()

    if (description.includes('thread') || description.includes('solder') || 
        description.includes('pressure') || procedure.warnings && procedure.warnings.length > 0) {
      return 'advanced'
    }

    if (procedure.tools && procedure.tools.length > 3) {
      return 'intermediate'
    }

    return 'beginner'
  }

  private assessTroubleshootingDifficulty(solution: string): 'beginner' | 'intermediate' | 'advanced' {
    const solutionLower = solution.toLowerCase()

    if (solutionLower.includes('replace') || solutionLower.includes('disassemble') || 
        solutionLower.includes('professional')) {
      return 'advanced'
    }

    if (solutionLower.includes('adjust') || solutionLower.includes('tighten') || 
        solutionLower.includes('clean')) {
      return 'intermediate'
    }

    return 'beginner'
  }

  private extractProblemSolutions(content: string): Array<{ problem: string; solution: string }> {
    const problemSolutions: Array<{ problem: string; solution: string }> = []

    // Look for problem-solution patterns
    const patterns = [
      /Problem:\s*([^.\n]+)\s*Solution:\s*([^.\n]+)/gi,
      /If\s+([^,]+),\s*([^.\n]+)/g,
      /([^.\n]+leak[^.\n]*)\s*-\s*([^.\n]+)/gi,
    ]

    patterns.forEach(pattern => {
      let match
      while ((match = pattern.exec(content)) !== null) {
        problemSolutions.push({
          problem: match[1].trim(),
          solution: match[2].trim(),
        })
      }
    })

    return problemSolutions
  }

  private extractSpecifications(content: string): Array<{ component: string; details: string }> {
    const specs: Array<{ component: string; details: string }> = []

    // Look for specification patterns
    const specPattern = /([^:\n]+):\s*([^.\n]+(?:inch|mm|psi|gpm|°F|°C)[^.\n]*)/gi
    let match

    while ((match = specPattern.exec(content)) !== null) {
      specs.push({
        component: match[1].trim(),
        details: match[2].trim(),
      })
    }

    return specs
  }

  // Export training data for AI fine-tuning
  async exportTrainingData(): Promise<string> {
    const exportData = {
      trainingData: Array.from(this.trainingData.values()),
      componentReferences: Array.from(this.componentReferences.values()),
      exportedAt: new Date().toISOString(),
      totalEntries: this.trainingData.size,
    }

    return JSON.stringify(exportData, null, 2)
  }
}

export type {
  TrainingData,
  ComponentReference,
  ComponentSpec,
  TroubleshootingItem,
  ContentSearchResult,
}