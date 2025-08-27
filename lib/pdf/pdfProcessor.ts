import fs from 'fs/promises'
import path from 'path'
import pdfParse from 'pdf-parse'
import pdf2pic from 'pdf2pic'
import { OpenAI } from 'openai'

interface PDFContent {
  id: string
  filename: string
  title: string
  author?: string
  category: 'code' | 'manufacturer' | 'procedure' | 'troubleshooting'
  manufacturer?: string
  productType?: string
  text: string
  images: string[]
  sections: PDFSection[]
  metadata: PDFMetadata
  processedAt: Date
}

interface PDFSection {
  title: string
  content: string
  pageNumber: number
  type: 'installation' | 'specifications' | 'troubleshooting' | 'safety' | 'general'
  images?: string[]
  procedures?: InstallationStep[]
}

interface InstallationStep {
  stepNumber: number
  title: string
  description: string
  tools?: string[]
  materials?: string[]
  warnings?: string[]
  images?: string[]
  codeReferences?: string[]
}

interface PDFMetadata {
  pages: number
  author?: string
  title?: string
  subject?: string
  creator?: string
  producer?: string
  creationDate?: Date
  modificationDate?: Date
}

interface ContentEmbedding {
  id: string
  content: string
  embedding: number[]
  metadata: {
    source: string
    section: string
    category: string
    manufacturer?: string
    pageNumber?: number
  }
}

export class PDFProcessor {
  private openai: OpenAI
  private outputDir: string
  private embeddingsDir: string

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
    this.outputDir = path.join(process.cwd(), 'data', 'processed')
    this.embeddingsDir = path.join(process.cwd(), 'data', 'embeddings')
  }

  async processPDF(filePath: string, category: PDFContent['category'], manufacturer?: string): Promise<PDFContent> {
    try {
      const filename = path.basename(filePath)
      const id = this.generateId(filename)

      console.log(`Processing PDF: ${filename}`)

      // Extract text content
      const pdfBuffer = await fs.readFile(filePath)
      const pdfData = await pdfParse(pdfBuffer)

      // Extract images
      const images = await this.extractImages(filePath, id)

      // Parse content into sections
      const sections = await this.parseContentSections(pdfData.text, pdfData.info)

      // Create PDF content object
      const pdfContent: PDFContent = {
        id,
        filename,
        title: pdfData.info?.Title || this.extractTitleFromFilename(filename),
        author: pdfData.info?.Author,
        category,
        manufacturer,
        text: pdfData.text,
        images,
        sections,
        metadata: {
          pages: pdfData.numpages,
          author: pdfData.info?.Author,
          title: pdfData.info?.Title,
          subject: pdfData.info?.Subject,
          creator: pdfData.info?.Creator,
          producer: pdfData.info?.Producer,
          creationDate: pdfData.info?.CreationDate,
          modificationDate: pdfData.info?.ModDate,
        },
        processedAt: new Date(),
      }

      // Save processed content
      await this.saveProcessedContent(pdfContent)

      // Generate and save embeddings
      await this.generateEmbeddings(pdfContent)

      console.log(`Successfully processed: ${filename}`)
      return pdfContent

    } catch (error) {
      console.error(`Error processing PDF ${filePath}:`, error)
      throw error
    }
  }

  private async extractImages(pdfPath: string, pdfId: string): Promise<string[]> {
    try {
      const outputDir = path.join(this.outputDir, 'images', pdfId)
      await fs.mkdir(outputDir, { recursive: true })

      const convert = pdf2pic.fromPath(pdfPath, {
        density: 100,
        saveFilename: 'page',
        savePath: outputDir,
        format: 'png',
        width: 800,
        height: 1200,
      })

      const results = await Promise.race([
        convert.bulk(-1, { responseType: 'image' }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 20000))
      ])
      
      return results.map((result, index) => 
        path.join(outputDir, `page.${index + 1}.png`)
      )

    } catch (error) {
      console.error(`Error extracting images from ${pdfPath}:`, error)
      return []
    }
  }

  private async parseContentSections(text: string, info: any): Promise<PDFSection[]> {
    const sections: PDFSection[] = []

    // Split text into logical sections based on common patterns
    const sectionPatterns = [
      /(?:^|\n)(INSTALLATION|PROCEDURE|SPECIFICATIONS|TROUBLESHOOTING|SAFETY|WARNING|CAUTION)/gi,
      /(?:^|\n)(\d+\.?\s+[A-Z][^.\n]{10,100})/g,
      /(?:^|\n)(Chapter|Section|Part)\s+\d+/gi,
    ]

    let currentSection = ''
    let currentTitle = 'Introduction'
    let pageNumber = 1

    const lines = text.split('\n')
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      // Check if line is a section header
      const isHeader = sectionPatterns.some(pattern => pattern.test(line))
      
      if (isHeader && currentSection.length > 100) {
        // Save previous section
        sections.push({
          title: currentTitle,
          content: currentSection.trim(),
          pageNumber: Math.floor(i / 50) + 1, // Rough page estimation
          type: this.classifySectionType(currentTitle, currentSection),
          procedures: await this.extractInstallationSteps(currentSection),
        })
        
        currentTitle = line
        currentSection = ''
      } else {
        currentSection += line + '\n'
      }
    }

    // Add final section
    if (currentSection.length > 100) {
      sections.push({
        title: currentTitle,
        content: currentSection.trim(),
        pageNumber: Math.floor(lines.length / 50) + 1,
        type: this.classifySectionType(currentTitle, currentSection),
        procedures: await this.extractInstallationSteps(currentSection),
      })
    }

    return sections
  }

  private classifySectionType(title: string, content: string): PDFSection['type'] {
    const titleLower = title.toLowerCase()
    const contentLower = content.toLowerCase()

    if (titleLower.includes('installation') || titleLower.includes('install') || 
        contentLower.includes('step 1') || contentLower.includes('procedure')) {
      return 'installation'
    }
    
    if (titleLower.includes('specification') || titleLower.includes('dimensions') ||
        contentLower.includes('diameter') || contentLower.includes('pressure')) {
      return 'specifications'
    }
    
    if (titleLower.includes('troubleshoot') || titleLower.includes('problem') ||
        contentLower.includes('leak') || contentLower.includes('blockage')) {
      return 'troubleshooting'
    }
    
    if (titleLower.includes('safety') || titleLower.includes('warning') ||
        titleLower.includes('caution') || contentLower.includes('danger')) {
      return 'safety'
    }

    return 'general'
  }

  private async extractInstallationSteps(content: string): Promise<InstallationStep[]> {
    const steps: InstallationStep[] = []
    
    // Pattern to match numbered steps
    const stepPattern = /(?:^|\n)(\d+)\.?\s+([^\n]+(?:\n(?!\d+\.)[^\n]+)*)/g
    let match

    while ((match = stepPattern.exec(content)) !== null) {
      const stepNumber = parseInt(match[1])
      const stepContent = match[2].trim()

      // Extract tools, materials, and warnings from step content
      const tools = this.extractToolsFromText(stepContent)
      const materials = this.extractMaterialsFromText(stepContent)
      const warnings = this.extractWarningsFromText(stepContent)

      steps.push({
        stepNumber,
        title: `Step ${stepNumber}`,
        description: stepContent,
        tools: tools.length > 0 ? tools : undefined,
        materials: materials.length > 0 ? materials : undefined,
        warnings: warnings.length > 0 ? warnings : undefined,
      })
    }

    return steps
  }

  private extractToolsFromText(text: string): string[] {
    const toolPatterns = [
      /(?:use|using|with|require)\s+(?:a\s+)?([^.]+(?:wrench|pliers|cutter|drill|saw|torch|level))/gi,
      /(?:tool|equipment):\s*([^.\n]+)/gi,
    ]

    const tools: string[] = []
    toolPatterns.forEach(pattern => {
      let match
      while ((match = pattern.exec(text)) !== null) {
        tools.push(match[1].trim())
      }
    })

    return [...new Set(tools)] // Remove duplicates
  }

  private extractMaterialsFromText(text: string): string[] {
    const materialPatterns = [
      /(\d+(?:\.\d+)?\s*(?:inch|"|mm)\s+(?:copper|pvc|pex|abs|steel)\s+(?:pipe|fitting|elbow|tee))/gi,
      /(?:material|supply):\s*([^.\n]+)/gi,
    ]

    const materials: string[] = []
    materialPatterns.forEach(pattern => {
      let match
      while ((match = pattern.exec(text)) !== null) {
        materials.push(match[1].trim())
      }
    })

    return [...new Set(materials)]
  }

  private extractWarningsFromText(text: string): string[] {
    const warningPatterns = [
      /(?:warning|caution|danger|important):\s*([^.\n]+)/gi,
      /(do not|never|avoid|ensure)(?:\s+[^.\n]+)/gi,
    ]

    const warnings: string[] = []
    warningPatterns.forEach(pattern => {
      let match
      while ((match = pattern.exec(text)) !== null) {
        warnings.push(match[1] || match[0])
      }
    })

    return warnings
  }

  private async generateEmbeddings(pdfContent: PDFContent): Promise<void> {
    const embeddings: ContentEmbedding[] = []

    // Generate embeddings for each section
    for (const section of pdfContent.sections) {
      try {
        const response = await this.openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: `${section.title}\n\n${section.content}`,
        })

        embeddings.push({
          id: `${pdfContent.id}_${section.title.replace(/\s+/g, '_')}`,
          content: `${section.title}\n\n${section.content}`,
          embedding: response.data[0].embedding,
          metadata: {
            source: pdfContent.filename,
            section: section.title,
            category: pdfContent.category,
            manufacturer: pdfContent.manufacturer,
            pageNumber: section.pageNumber,
          },
        })

        // Generate embeddings for individual procedures if available
        if (section.procedures && section.procedures.length > 0) {
          for (const procedure of section.procedures) {
            const procedureResponse = await this.openai.embeddings.create({
              model: 'text-embedding-3-small',
              input: `${procedure.title}\n${procedure.description}`,
            })

            embeddings.push({
              id: `${pdfContent.id}_step_${procedure.stepNumber}`,
              content: `${procedure.title}\n${procedure.description}`,
              embedding: procedureResponse.data[0].embedding,
              metadata: {
                source: pdfContent.filename,
                section: `${section.title} - Step ${procedure.stepNumber}`,
                category: 'procedure',
                manufacturer: pdfContent.manufacturer,
                pageNumber: section.pageNumber,
              },
            })
          }
        }

      } catch (error) {
        console.error(`Error generating embeddings for section ${section.title}:`, error)
      }
    }

    // Save embeddings
    await this.saveEmbeddings(embeddings, pdfContent.id)
  }

  private async saveProcessedContent(content: PDFContent): Promise<void> {
    const outputPath = path.join(this.outputDir, `${content.id}.json`)
    await fs.writeFile(outputPath, JSON.stringify(content, null, 2))

    // Also save to category-specific directory
    const categoryDir = path.join(process.cwd(), 'data', 'training', content.category)
    await fs.mkdir(categoryDir, { recursive: true })
    await fs.writeFile(
      path.join(categoryDir, `${content.id}.json`),
      JSON.stringify(content, null, 2)
    )
  }

  private async saveEmbeddings(embeddings: ContentEmbedding[], pdfId: string): Promise<void> {
    await fs.mkdir(this.embeddingsDir, { recursive: true })
    const embeddingsPath = path.join(this.embeddingsDir, `${pdfId}_embeddings.json`)
    await fs.writeFile(embeddingsPath, JSON.stringify(embeddings, null, 2))
  }

  private generateId(filename: string): string {
    return filename
      .replace(/\.pdf$/i, '')
      .replace(/[^a-zA-Z0-9]/g, '_')
      .toLowerCase()
  }

  private extractTitleFromFilename(filename: string): string {
    return filename
      .replace(/\.pdf$/i, '')
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
  }

  // Batch process multiple PDFs
  async processPDFBatch(pdfsConfig: Array<{
    filePath: string
    category: PDFContent['category']
    manufacturer?: string
  }>): Promise<PDFContent[]> {
    const results: PDFContent[] = []

    for (const config of pdfsConfig) {
      try {
        const result = await this.processPDF(config.filePath, config.category, config.manufacturer)
        results.push(result)
      } catch (error) {
        console.error(`Failed to process ${config.filePath}:`, error)
      }
    }

    return results
  }

  // Search processed content using semantic similarity
  async searchContent(query: string, limit: number = 10): Promise<Array<{
    content: string
    similarity: number
    metadata: any
  }>> {
    try {
      // Generate embedding for query
      const queryResponse = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: query,
      })

      const queryEmbedding = queryResponse.data[0].embedding

      // Load all embeddings and calculate similarities
      const embeddingFiles = await fs.readdir(this.embeddingsDir)
      const results: Array<{ content: string; similarity: number; metadata: any }> = []

      for (const file of embeddingFiles) {
        if (file.endsWith('_embeddings.json')) {
          const embeddingsData = await fs.readFile(
            path.join(this.embeddingsDir, file),
            'utf-8'
          )
          const embeddings: ContentEmbedding[] = JSON.parse(embeddingsData)

          for (const embedding of embeddings) {
            const similarity = this.cosineSimilarity(queryEmbedding, embedding.embedding)
            results.push({
              content: embedding.content,
              similarity,
              metadata: embedding.metadata,
            })
          }
        }
      }

      // Sort by similarity and return top results
      return results
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)

    } catch (error) {
      console.error('Error searching content:', error)
      return []
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0)
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))
    return dotProduct / (magnitudeA * magnitudeB)
  }
}

export type { PDFContent, PDFSection, InstallationStep, PDFMetadata, ContentEmbedding }