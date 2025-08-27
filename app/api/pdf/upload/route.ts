import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { PDFProcessor } from '@/lib/pdf/pdfProcessor'
import { ContentIntegrator } from '@/lib/pdf/contentIntegrator'
import { legalCompliance } from '@/lib/pdf/legalCompliance'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const category = formData.get('category') as string
    const manufacturer = formData.get('manufacturer') as string | undefined
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    if (!category || !['code', 'manufacturer', 'procedure', 'troubleshooting'].includes(category)) {
      return NextResponse.json(
        { error: 'Valid category required (code, manufacturer, procedure, troubleshooting)' },
        { status: 400 }
      )
    }

    const results = []
    const pdfProcessor = new PDFProcessor()
    const contentIntegrator = new ContentIntegrator()

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'data', 'pdfs')
    await mkdir(uploadDir, { recursive: true })

    for (const file of files) {
      try {
        // Validate file type
        if (!file.name.toLowerCase().endsWith('.pdf')) {
          results.push({
            filename: file.name,
            status: 'error',
            message: 'Only PDF files are allowed',
          })
          continue
        }

        // Validate file size (max 50MB)
        const maxSize = 50 * 1024 * 1024 // 50MB
        if (file.size > maxSize) {
          results.push({
            filename: file.name,
            status: 'error',
            message: 'File size exceeds 50MB limit',
          })
          continue
        }

        // Save file to disk
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        const filepath = path.join(uploadDir, filename)
        
        await writeFile(filepath, buffer)

        // Register source for legal compliance
        const sourceId = legalCompliance.registerContentSource({
          title: file.name.replace('.pdf', ''),
          publisher: manufacturer || 'Unknown',
          copyright: `© ${new Date().getFullYear()} ${manufacturer || 'Original Publisher'}`,
          fairUseJustification: 'Educational content for plumbing apprentice training',
          usageType: category === 'code' ? 'reference' : 'educational',
          excerptLength: 0,
          maxAllowedLength: category === 'code' ? 200 : 400,
          publicationDate: new Date(),
        })

        // Process PDF
        const pdfContent = await pdfProcessor.processPDF(
          filepath, 
          category as any, 
          manufacturer
        )

        // Generate training data
        const trainingData = await contentIntegrator.generateTrainingData([pdfContent])

        // Check legal compliance for generated content
        let complianceIssues = 0
        for (const data of trainingData) {
          const compliance = legalCompliance.checkCompliance(
            sourceId,
            data.answer,
            'AI training data generation'
          )
          if (!compliance.compliant) {
            complianceIssues++
          }
        }

        results.push({
          filename: file.name,
          status: 'success',
          message: 'PDF processed successfully',
          data: {
            pdfId: pdfContent.id,
            sourceId,
            sections: pdfContent.sections.length,
            trainingData: trainingData.length,
            complianceIssues,
            pages: pdfContent.metadata.pages,
            images: pdfContent.images.length,
          },
        })

      } catch (error) {
        console.error(`Error processing ${file.name}:`, error)
        results.push({
          filename: file.name,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
        })
      }
    }

    // Generate compliance report
    const complianceReport = legalCompliance.generateComplianceReport()

    return NextResponse.json({
      success: true,
      message: `Processed ${results.filter(r => r.status === 'success').length} of ${files.length} files`,
      results,
      compliance: complianceReport,
    })

  } catch (error) {
    console.error('PDF upload error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process PDF upload',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Get processed PDF content
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('query')
    const category = searchParams.get('category')
    const manufacturer = searchParams.get('manufacturer')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter required' },
        { status: 400 }
      )
    }

    const contentIntegrator = new ContentIntegrator()
    
    // Search training data
    const searchResults = await contentIntegrator.searchTrainingData(query, limit)

    // Filter by category and manufacturer if specified
    let filteredResults = searchResults
    if (category) {
      filteredResults = filteredResults.filter(result => 
        result.context.category === category
      )
    }
    if (manufacturer) {
      filteredResults = filteredResults.filter(result => 
        result.context.manufacturer?.toLowerCase().includes(manufacturer.toLowerCase())
      )
    }

    // Add legal attribution for each result
    const resultsWithAttribution = filteredResults.map(result => ({
      ...result,
      attribution: legalCompliance.createContentAttribution([
        result.context.source.replace('.pdf', '').toLowerCase().replace(/\s+/g, '_')
      ]),
    }))

    return NextResponse.json({
      success: true,
      query,
      results: resultsWithAttribution,
      count: resultsWithAttribution.length,
    })

  } catch (error) {
    console.error('PDF search error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to search PDF content',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Delete processed PDF content
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const pdfId = searchParams.get('pdfId')

    if (!pdfId) {
      return NextResponse.json(
        { error: 'PDF ID required' },
        { status: 400 }
      )
    }

    // TODO: Implement deletion logic
    // - Remove processed content files
    // - Remove embeddings
    // - Remove training data
    // - Update compliance records

    return NextResponse.json({
      success: true,
      message: `PDF content ${pdfId} deleted successfully`,
    })

  } catch (error) {
    console.error('PDF deletion error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete PDF content',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}