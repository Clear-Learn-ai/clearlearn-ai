import { NextRequest, NextResponse } from 'next/server'
import { ContentIntegrator } from '@/lib/pdf/contentIntegrator'

export async function GET(request: NextRequest) {
  try {
    const contentIntegrator = new ContentIntegrator()
    
    // Test search with common plumbing queries
    const testQueries = [
      "toilet installation steps",
      "pipe fitting procedures", 
      "safety warnings plumbing",
      "PEX pipe installation",
      "drain cleaning methods"
    ]

    const results = []
    
    for (const query of testQueries) {
      try {
        const searchResults = await contentIntegrator.searchTrainingData(query, 3)
        results.push({
          query,
          resultCount: searchResults.length,
          results: searchResults.slice(0, 2), // Just show first 2 for testing
        })
      } catch (error) {
        results.push({
          query,
          error: error instanceof Error ? error.message : 'Search failed',
          resultCount: 0,
        })
      }
    }

    // Get system statistics
    const stats = {
      totalTestQueries: testQueries.length,
      successfulQueries: results.filter(r => !r.error).length,
      totalResults: results.reduce((sum, r) => sum + (r.resultCount || 0), 0),
    }

    return NextResponse.json({
      success: true,
      message: 'PDF system test completed',
      stats,
      testResults: results,
    })

  } catch (error) {
    console.error('PDF system test error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'PDF system test failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}