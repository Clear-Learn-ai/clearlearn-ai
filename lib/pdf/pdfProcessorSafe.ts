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

export class PDFProcessorSafe {
  private openai: OpenAI
  private outputDir: string

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
    this.outputDir = path.join(process.cwd(), 'data', 'processed')
  }

  async processPDF(
    filePath: string, 
    category: 'code' | 'manufacturer' | 'procedure' | 'troubleshooting',
    manufacturer?: string
  ): Promise<PDFContent> {
    try {
      console.log(`Processing PDF: ${path.basename(filePath)}`)
      
      // Generate unique ID
      const id = `pdf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Extract text content with timeout protection
      const pdfData = await this.extractTextWithTimeout(filePath, 60000) // 60 second limit
      
      console.log(`Extracted text: ${pdfData.text.length} characters`)
      
      // Extract images with timeout protection
      const images = await this.extractImagesWithTimeout(filePath, id, 45000) // 45 second limit
      
      // Parse content into sections with AI assistance
      const sections = await this.parseContentSections(pdfData.text, pdfData.info, category)
      
      console.log(`Parsed ${sections.length} sections`)
      
      const pdfContent: PDFContent = {
        id,
        filename: path.basename(filePath),
        title: pdfData.info.Title || path.basename(filePath, '.pdf'),
        author: pdfData.info.Author,
        category,
        manufacturer,
        text: pdfData.text,
        images,
        sections,
        metadata: {
          pages: pdfData.numpages,
          author: pdfData.info.Author,
          title: pdfData.info.Title,
          subject: pdfData.info.Subject,
          creator: pdfData.info.Creator,
          producer: pdfData.info.Producer,
          creationDate: pdfData.info.CreationDate,
          modificationDate: pdfData.info.ModificationDate,
        },
        processedAt: new Date(),
      }

      // Save processed content
      await this.saveProcessedPDF(pdfContent)
      console.log(`Successfully processed: ${pdfContent.filename}`)
      
      return pdfContent

    } catch (error) {
      console.error(`Error processing PDF ${filePath}:`, error)
      throw error
    }
  }

  private async extractTextWithTimeout(filePath: string, timeoutMs: number): Promise<any> {
    return Promise.race([
      this.extractTextContent(filePath),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('PDF text extraction timeout')), timeoutMs)
      )
    ])
  }

  private async extractTextContent(filePath: string): Promise<any> {
    const buffer = await fs.readFile(filePath)
    return pdfParse(buffer)
  }

  private async extractImagesWithTimeout(filePath: string, pdfId: string, timeoutMs: number): Promise<string[]> {
    try {
      return await Promise.race([
        this.extractImages(filePath, pdfId),
        new Promise<string[]>((_, reject) => 
          setTimeout(() => reject(new Error('Image extraction timeout')), timeoutMs)
        )
      ])
    } catch (error) {
      console.warn(`Image extraction failed for ${path.basename(filePath)}:`, error instanceof Error ? error.message : 'Unknown error')
      return [] // Return empty array if images fail - text processing continues
    }
  }

  private async extractImages(filePath: string, pdfId: string): Promise<string[]> {
    try {
      const outputDir = path.join(this.outputDir, 'images', pdfId)
      await fs.mkdir(outputDir, { recursive: true })

      // Configure pdf2pic with safe settings
      const convert = (pdf2pic as any).fromPath(filePath, {
        density: 150, // Lower density for faster processing
        saveFilename: "page",
        savePath: outputDir,
        format: "png",
        width: 800, // Limit image size
        height: 600
      })

      console.log(`Extracting images to: ${outputDir}`)
      
      // Convert only first 10 pages to prevent overwhelming processing
      const results = await convert.bulk(-1, { responseType: "image" })
      
      const imagePaths = results.map((result: any) => result.path)
      console.log(`Extracted ${imagePaths.length} images from PDF`)
      
      return imagePaths

    } catch (error) {
      console.error(`Error extracting images from ${filePath}:`, error instanceof Error ? error.message : 'Unknown error')
      throw error
    }
  }

  private async parseContentSections(
    text: string, 
    info: any, 
    category: string
  ): Promise<PDFSection[]> {
    // Simple section parsing without AI for now to avoid timeouts
    const sections: PDFSection[] = []
    
    // Split text into chunks by common section headers
    const sectionPatterns = [
      /(?:installation|install|setup)/i,
      /(?:specifications|specs|technical)/i,
      /(?:troubleshooting|problems|issues)/i,
      /(?:safety|warning|caution)/i,
      /(?:parts|components|materials)/i
    ]
    
    const chunks = text.split(/\n\s*\n/) // Split on double newlines
    let sectionIndex = 1
    
    for (const chunk of chunks) {
      if (chunk.trim().length < 50) continue // Skip very short chunks
      
      let sectionType: PDFSection['type'] = 'general'
      let title = `Section ${sectionIndex}`
      
      // Try to identify section type
      for (const pattern of sectionPatterns) {
        if (pattern.test(chunk)) {
          if (/installation|install/i.test(chunk)) sectionType = 'installation'
          else if (/specifications|specs/i.test(chunk)) sectionType = 'specifications'
          else if (/troubleshooting|problems/i.test(chunk)) sectionType = 'troubleshooting'
          else if (/safety|warning/i.test(chunk)) sectionType = 'safety'
          break
        }
      }
      
      sections.push({
        title,
        content: chunk.trim(),
        pageNumber: Math.ceil(sectionIndex / 3), // Rough estimate
        type: sectionType,
        images: [],
        procedures: []
      })
      
      sectionIndex++
      
      // Limit sections to prevent overwhelming processing
      if (sections.length >= 20) break
    }
    
    return sections
  }

  private async saveProcessedPDF(pdfContent: PDFContent): Promise<void> {
    await fs.mkdir(this.outputDir, { recursive: true })
    const outputPath = path.join(this.outputDir, `${pdfContent.id}.json`)
    await fs.writeFile(outputPath, JSON.stringify(pdfContent, null, 2))
  }

  async searchProcessedPDFs(query: string): Promise<PDFContent[]> {
    try {
      const files = await fs.readdir(this.outputDir)
      const pdfFiles = files.filter(f => f.endsWith('.json'))
      const results: PDFContent[] = []
      
      for (const file of pdfFiles) {
        const content = await fs.readFile(path.join(this.outputDir, file), 'utf-8')
        const pdf: PDFContent = JSON.parse(content)
        
        // Simple text search
        const searchText = [pdf.title, pdf.text, ...pdf.sections.map(s => s.content)].join(' ').toLowerCase()
        if (searchText.includes(query.toLowerCase())) {
          results.push(pdf)
        }
      }
      
      return results.slice(0, 10) // Limit results
      
    } catch (error) {
      console.error('Error searching PDFs:', error)
      return []
    }
  }
}

export type { PDFContent, PDFSection, InstallationStep, PDFMetadata }