import { PDFContent, PDFSection } from './pdfProcessorSafe'

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
  tags: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export class ContentIntegratorSafe {
  
  async generateTrainingData(pdfContents: PDFContent[]): Promise<TrainingData[]> {
    const trainingData: TrainingData[] = []
    
    for (const pdf of pdfContents) {
      console.log(`Generating training data for: ${pdf.filename}`)
      
      // Generate simple Q&A pairs from sections
      for (const section of pdf.sections) {
        if (section.content.length < 100) continue // Skip very short sections
        
        // Create basic training data without complex AI processing
        const qa = this.createBasicQA(section, pdf)
        if (qa) {
          trainingData.push(qa)
        }
        
        // Limit to prevent overwhelming processing
        if (trainingData.length >= 50) break
      }
      
      if (trainingData.length >= 100) break // Overall limit
    }
    
    console.log(`Generated ${trainingData.length} training items`)
    return trainingData
  }

  private createBasicQA(section: PDFSection, pdf: PDFContent): TrainingData | null {
    try {
      // Create question based on section type
      let question = ''
      let type: TrainingData['type'] = 'qa_pair'
      
      switch (section.type) {
        case 'installation':
          question = `How to install ${pdf.manufacturer || 'this component'}?`
          type = 'procedure'
          break
        case 'specifications':
          question = `What are the specifications for ${pdf.manufacturer || 'this product'}?`
          type = 'specification'
          break
        case 'troubleshooting':
          question = `How to troubleshoot ${pdf.manufacturer || 'this component'}?`
          type = 'troubleshooting'
          break
        case 'safety':
          question = `What are the safety requirements for ${pdf.manufacturer || 'this installation'}?`
          break
        default:
          question = `What information is available about ${pdf.manufacturer || 'this product'}?`
      }
      
      // Extract key terms for tags
      const tags = this.extractTags(section.content, pdf.category, pdf.manufacturer)
      
      const trainingItem: TrainingData = {
        id: `qa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        question,
        answer: section.content.substring(0, 500) + (section.content.length > 500 ? '...' : ''),
        context: {
          source: pdf.filename,
          manufacturer: pdf.manufacturer,
          category: pdf.category,
          codeReferences: this.extractCodeReferences(section.content),
          relatedComponents: this.extractComponents(section.content)
        },
        tags,
        difficulty: 'intermediate'
      }
      
      return trainingItem
      
    } catch (error) {
      console.error('Error creating training data:', error)
      return null
    }
  }
  
  private extractTags(content: string, category: string, manufacturer?: string): string[] {
    const tags = [category]
    
    if (manufacturer) tags.push(manufacturer.toLowerCase())
    
    // Extract common plumbing terms
    const plumbingTerms = [
      'pipe', 'fitting', 'valve', 'toilet', 'sink', 'drain', 
      'installation', 'repair', 'plumbing', 'water', 'sewer'
    ]
    
    for (const term of plumbingTerms) {
      if (content.toLowerCase().includes(term)) {
        tags.push(term)
      }
    }
    
    return Array.from(new Set(tags)).slice(0, 8) // Limit tags
  }
  
  private extractCodeReferences(content: string): string[] {
    const codePattern = /(?:IPC|UPC|NPC|CSA)\s*[\d.]+/g
    const matches = content.match(codePattern) || []
    return Array.from(new Set(matches)).slice(0, 5)
  }
  
  private extractComponents(content: string): string[] {
    const componentPattern = /(?:pipe|fitting|valve|toilet|sink|drain|elbow|tee|coupling|reducer)/gi
    const matches = content.match(componentPattern) || []
    return Array.from(new Set(matches.map(m => m.toLowerCase()))).slice(0, 5)
  }

  async searchTrainingData(query: string, limit: number = 10): Promise<any[]> {
    // Simple mock search for now - replace with real implementation
    return [
      {
        question: "Sample question related to " + query,
        answer: "This is a sample answer that would come from processed PDF content.",
        context: {
          source: "sample.pdf",
          category: "manufacturer",
          manufacturer: "Sample Manufacturer"
        }
      }
    ]
  }
}

export type { TrainingData }