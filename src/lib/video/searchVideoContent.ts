// Video search functionality for educational content
// Following BP-C2: Educational domain vocabulary

import type { 
  VideoContent, 
  VideoId,
  SubjectArea 
} from '@/types/education'
import { createVideoId } from '@/types/education'

export async function searchVideoContent(request: { query: string; subject: SubjectArea; maxResults?: number }): Promise<{ videos: VideoContent[]; totalResults: number; searchQuery: string; relevanceThreshold: number }> {
  try {
    // Try real YouTube API first if available
    const realVideos = await searchYouTubeEducationalContent(request)
    if (realVideos.length > 0) {
      return {
        videos: realVideos,
        totalResults: realVideos.length,
        searchQuery: request.query,
        relevanceThreshold: 0.7
      }
    }
  } catch (error) {
    console.warn('YouTube API unavailable, using educational mock data:', error)
  }
  
  // Fallback to curated educational content
  const mockVideos = getCuratedEducationalVideos(request.query, request.subject)
  
  return {
    videos: mockVideos.slice(0, request.maxResults || 5),
    totalResults: mockVideos.length,
    searchQuery: request.query,
    relevanceThreshold: 0.8
  }
}

export async function searchYouTubeEducationalContent(
  request: { query: string; subject: SubjectArea; maxResults?: number }
): Promise<VideoContent[]> {
  const youtubeApiKey = process.env.YOUTUBE_API_KEY
  
  if (!youtubeApiKey || youtubeApiKey === 'demo_mode_enabled') {
    throw new Error('YouTube API key not available')
  }
  
  // Enhance query with educational context
  const educationalQuery = enhanceQueryForEducationalContent(request.query, request.subject)
  
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?` +
    `part=snippet&maxResults=${request.maxResults || 5}` +
    `&q=${encodeURIComponent(educationalQuery)}` +
    `&type=video&videoEmbeddable=true&key=${youtubeApiKey}`
  
  const response = await fetch(searchUrl)
  
  if (!response.ok) {
    throw new Error(`YouTube API error: ${response.status}`)
  }
  
  const data = await response.json()
  
  return data.items?.map((item: any) => formatVideoForEducation(item)) || []
}

export function enhanceQueryForEducationalContent(query: string, subject: SubjectArea): string {
  const plumbingKeywords = {
    'plumbing': 'plumbing tutorial installation repair how-to step-by-step'
  } as const
  
  const subjectKeywords = plumbingKeywords['plumbing']
  
  // Filter for high-quality plumbing educational content
  return `${query} ${subjectKeywords} -music -vlog -reaction -comedy`
}

export function formatVideoForEducation(youtubeItem: any): VideoContent {
  const videoId = createVideoId('youtube', youtubeItem.id.videoId)
  
  return {
    id: videoId,
    title: youtubeItem.snippet.title,
    description: youtubeItem.snippet.description || '',
    thumbnail: youtubeItem.snippet.thumbnails?.medium?.url || 
               youtubeItem.snippet.thumbnails?.default?.url || '',
    url: `https://www.youtube.com/watch?v=${youtubeItem.id.videoId}`,
    duration: 'N/A', // Would need additional API call
    source: 'youtube',
    relevanceScore: calculateEducationalRelevance(youtubeItem.snippet),
    educationalValue: assessEducationalValue(youtubeItem.snippet)
  }
}

export function calculateEducationalRelevance(snippet: any): number {
  let score = 0.5 // Base score
  
  const title = snippet.title.toLowerCase()
  const description = snippet.description?.toLowerCase() || ''
  
  // Educational content indicators
  const educationalTerms = [
    'tutorial', 'explained', 'lesson', 'course', 'mechanism',
    'step by step', 'how to', 'understanding', 'basics', 'advanced'
  ]
  
  educationalTerms.forEach(term => {
    if (title.includes(term)) score += 0.1
    if (description.includes(term)) score += 0.05
  })
  
  // Boost for recognized plumbing/trades channels
  const educationalChannels = [
    'roger wakefield', 'this old house', 'essential craftsman', 'steve lav', 'houseimprovements', 'home repair tutor'
  ]
  
  const channelTitle = snippet.channelTitle?.toLowerCase() || ''
  educationalChannels.forEach(channel => {
    if (channelTitle.includes(channel)) score += 0.2
  })
  
  return Math.min(score, 1.0)
}

export function assessEducationalValue(snippet: any): number {
  let value = 0.6 // Base educational value
  
  const title = snippet.title.toLowerCase()
  const description = snippet.description?.toLowerCase() || ''
  
  // High-value educational content indicators
  if (title.includes('mechanism') || description.includes('mechanism')) value += 0.2
  if (title.includes('explained') || description.includes('explained')) value += 0.1
  if (title.includes('complete') || description.includes('comprehensive')) value += 0.1
  if (title.includes('step') || description.includes('step')) value += 0.1
  
  return Math.min(value, 1.0)
}

export function getCuratedEducationalVideos(query: string, subject: SubjectArea): VideoContent[] {
  // High-quality curated plumbing educational content
  const plumbingVideoDatabase = {
    'plumbing': [
      {
        id: createVideoId('youtube', 'toilet_install_guide'),
        title: 'How to Install a Toilet - Complete Step-by-Step Guide',
        description: 'Professional plumber shows complete toilet installation including flange, wax ring, and proper sealing techniques',
        thumbnail: 'https://img.youtube.com/vi/placeholder/maxresdefault.jpg',
        url: 'https://www.youtube.com/watch?v=placeholder',
        duration: '15:30',
        source: 'youtube' as const,
        relevanceScore: 0.95,
        educationalValue: 0.92,
        keywords: ['toilet', 'install', 'installation', 'flange', 'wax ring', 'seal']
      },
      {
        id: createVideoId('youtube', 'pex_pipe_install'),
        title: 'PEX Pipe Installation - Tools, Fittings, and Best Practices',
        description: 'Complete guide to PEX plumbing installation including expansion fittings, manifolds, and code requirements',
        thumbnail: 'https://img.youtube.com/vi/placeholder2/maxresdefault.jpg',
        url: 'https://www.youtube.com/watch?v=placeholder2',
        duration: '22:15',
        source: 'youtube' as const,
        relevanceScore: 0.90,
        educationalValue: 0.88,
        keywords: ['pex', 'pipe', 'installation', 'fittings', 'expansion', 'manifold']
      },
      {
        id: createVideoId('youtube', 'drain_cleaning'),
        title: 'Drain Cleaning Techniques - When to Snake vs. Hydro Jet',
        description: 'Professional techniques for clearing different types of drain clogs including tool selection and safety',
        thumbnail: 'https://img.youtube.com/vi/placeholder3/maxresdefault.jpg',
        url: 'https://www.youtube.com/watch?v=placeholder3',
        duration: '18:45',
        source: 'youtube' as const,
        relevanceScore: 0.87,
        educationalValue: 0.85,
        keywords: ['drain', 'cleaning', 'snake', 'hydro', 'jet', 'clog', 'blockage']
      },
      {
        id: createVideoId('youtube', 'leak_repair'),
        title: 'Finding and Fixing Water Leaks - Diagnostic Guide',
        description: 'Step-by-step leak detection and repair techniques for common plumbing problems',
        thumbnail: 'https://img.youtube.com/vi/placeholder4/maxresdefault.jpg',
        url: 'https://www.youtube.com/watch?v=placeholder4',
        duration: '14:20',
        source: 'youtube' as const,
        relevanceScore: 0.92,
        educationalValue: 0.90,
        keywords: ['leak', 'repair', 'water', 'detection', 'diagnostic', 'fix']
      }
    ]
  }
  
  // Get relevant videos for subject with proper typing
  const subjectVideos = plumbingVideoDatabase['plumbing'] // Always use plumbing videos for TradeAI Tutor
  
  // Filter by query relevance
  const queryLower = query.toLowerCase()
  return subjectVideos.filter((video: any) => 
    video.keywords?.some((keyword: string) => queryLower.includes(keyword)) ||
    video.title.toLowerCase().includes(queryLower) ||
    video.description.toLowerCase().includes(queryLower)
  )
}

export function rankVideosByEducationalValue(videos: VideoContent[]): VideoContent[] {
  return videos.sort((a, b) => {
    // Primary sort: educational value
    if (b.educationalValue !== a.educationalValue) {
      return b.educationalValue - a.educationalValue
    }
    
    // Secondary sort: relevance score
    return b.relevanceScore - a.relevanceScore
  })
}

export function filterVideosByEducationalCriteria(
  videos: VideoContent[],
  criteria: {
    minEducationalValue?: number
    minRelevanceScore?: number
    maxResults?: number
    preferredSources?: ('youtube' | 'khan-academy' | 'coursera')[]
  }
): VideoContent[] {
  let filtered = videos
  
  if (criteria.minEducationalValue) {
    filtered = filtered.filter(v => v.educationalValue >= criteria.minEducationalValue!)
  }
  
  if (criteria.minRelevanceScore) {
    filtered = filtered.filter(v => v.relevanceScore >= criteria.minRelevanceScore!)
  }
  
  if (criteria.preferredSources?.length) {
    filtered = filtered.filter(v => criteria.preferredSources!.includes(v.source as any))
  }
  
  if (criteria.maxResults) {
    filtered = filtered.slice(0, criteria.maxResults)
  }
  
  return filtered
}