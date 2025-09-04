// Unit tests for video search functionality
// Following BP-T1: Colocate unit tests with source files

import { 
  searchVideoContent,
  enhanceQueryForEducationalContent,
  calculateEducationalRelevance,
  assessEducationalValue,
  getCuratedEducationalVideos,
  rankVideosByEducationalValue
} from './searchVideoContent'
import type { VideoContent, SubjectArea } from '../../types/education'

describe('Video Search', () => {
  describe('enhanceQueryForEducationalContent', () => {
    it('should add plumbing educational keywords to queries', () => {
      const enhanced = enhanceQueryForEducationalContent(
        'fix sink drainage',
        'plumbing' as SubjectArea
      )
      
      expect(enhanced).toContain('plumbing')
      expect(enhanced).toContain('tutorial')
      expect(enhanced).toContain('how to')
      expect(enhanced).toContain('-music')
    })
  })

  describe('calculateEducationalRelevance', () => {
    it('should score educational plumbing content highly', () => {
      const educationalSnippet = {
        title: 'Fix a Sink Drainage - Complete Tutorial',
        description: 'Step by step explanation of clearing a P-trap clog',
        channelTitle: 'Roger Wakefield'
      }
      
      const score = calculateEducationalRelevance(educationalSnippet)
      expect(score).toBeGreaterThan(0.8)
    })

    it('should boost recognized educational channels', () => {
      const khanAcademySnippet = {
        title: 'Basic Chemistry Concepts',
        description: 'Introduction to atoms and molecules',
        channelTitle: 'Khan Academy'
      }
      
      const score = calculateEducationalRelevance(khanAcademySnippet)
      expect(score).toBeGreaterThan(0.7)
    })

    it('should score non-educational content lower', () => {
      const nonEducationalSnippet = {
        title: 'Random vlog',
        description: 'Fun music video',
        channelTitle: 'Random YouTuber'
      }
      
      const score = calculateEducationalRelevance(nonEducationalSnippet)
      expect(score).toBeLessThan(0.7)
    })
  })

  describe('assessEducationalValue', () => {
    it('should value step-by-step explanations highly', () => {
      const mechanismSnippet = {
        title: 'Complete Toilet Installation - Step by Step',
        description: 'Comprehensive step-by-step installation explanation'
      }
      
      const value = assessEducationalValue(mechanismSnippet)
      expect(value).toBeGreaterThan(0.8)
    })

    it('should recognize comprehensive content', () => {
      const comprehensiveSnippet = {
        title: 'Complete Guide to PEX Plumbing',
        description: 'Comprehensive overview with step by step examples'
      }
      
      const value = assessEducationalValue(comprehensiveSnippet)
      expect(value).toBeGreaterThan(0.7)
    })
  })

  describe('getCuratedEducationalVideos', () => {
    it('should return relevant videos for plumbing queries', () => {
      const videos = getCuratedEducationalVideos('toilet install', 'plumbing' as SubjectArea)
      
      expect(videos.length).toBeGreaterThan(0)
      expect(videos[0]).toMatchObject({
        title: expect.stringMatching(/toilet|install/i),
        educationalValue: expect.any(Number),
        relevanceScore: expect.any(Number)
      })
    })

    it('should filter videos by query relevance', () => {
      const videos = getCuratedEducationalVideos('p-trap', 'plumbing' as SubjectArea)
      
      videos.forEach(video => {
        const matchesQuery = 
          video.title.toLowerCase().includes('p-trap') ||
          video.description.toLowerCase().includes('p-trap') ||
          (video as any).keywords?.some((k: string) => k.includes('p-trap'))
        
        expect(matchesQuery).toBe(true)
      })
    })

    it('should provide fallback content for unknown subjects', () => {
      const videos = getCuratedEducationalVideos('test query', 'unknown_subject' as SubjectArea)
      expect(videos).toBeInstanceOf(Array)
    })
  })

  describe('rankVideosByEducationalValue', () => {
    it('should rank videos by educational value first', () => {
      const videos: VideoContent[] = [
        {
          id: 'video1' as any,
          title: 'Low Quality',
          description: '',
          thumbnail: '',
          url: '',
          duration: '',
          source: 'youtube',
          relevanceScore: 0.9,
          educationalValue: 0.5
        },
        {
          id: 'video2' as any,
          title: 'High Quality',
          description: '',
          thumbnail: '',
          url: '',
          duration: '',
          source: 'youtube',
          relevanceScore: 0.7,
          educationalValue: 0.9
        }
      ]
      
      const ranked = rankVideosByEducationalValue(videos)
      expect(ranked[0].educationalValue).toBeGreaterThan(ranked[1].educationalValue)
    })

    it('should use relevance as secondary sort criteria', () => {
      const videos: VideoContent[] = [
        {
          id: 'video1' as any,
          title: 'Video 1',
          description: '',
          thumbnail: '',
          url: '',
          duration: '',
          source: 'youtube',
          relevanceScore: 0.7,
          educationalValue: 0.8
        },
        {
          id: 'video2' as any,
          title: 'Video 2',
          description: '',
          thumbnail: '',
          url: '',
          duration: '',
          source: 'youtube',
          relevanceScore: 0.9,
          educationalValue: 0.8
        }
      ]
      
      const ranked = rankVideosByEducationalValue(videos)
      expect(ranked[0].relevanceScore).toBeGreaterThan(ranked[1].relevanceScore)
    })
  })

  describe('searchVideoContent', () => {
    beforeEach(() => {
      // Mock environment for tests
      delete process.env.YOUTUBE_API_KEY
    })

    it('should return curated educational videos when YouTube API unavailable', async () => {
      const request = {
        query: 'SN2 mechanism',
        subject: 'plumbing' as SubjectArea,
        maxResults: 3
      }
      
      const response = await searchVideoContent(request)
      
      expect(response.videos.length).toBeGreaterThan(0)
      expect(response.videos.length).toBeLessThanOrEqual(3)
      expect(response.searchQuery).toBe('SN2 mechanism')
      expect(response.relevanceThreshold).toBeGreaterThan(0)
    })

    it('should limit results according to maxResults parameter', async () => {
      const request = {
        query: 'toilet install',
        subject: 'plumbing' as SubjectArea,
        maxResults: 2
      }
      
      const response = await searchVideoContent(request)
      expect(response.videos.length).toBeLessThanOrEqual(2)
    })

    it('should provide meaningful educational metadata', async () => {
      const request = {
        query: 'p-trap',
        subject: 'plumbing' as SubjectArea
      }
      
      const response = await searchVideoContent(request)
      
      response.videos.forEach(video => {
        expect(video.educationalValue).toBeGreaterThan(0)
        expect(video.relevanceScore).toBeGreaterThan(0)
        expect(video.source).toBeDefined()
        expect(video.url).toMatch(/^https?:\/\//)
      })
    })
  })
})

describe('Student Learning Experience', () => {
  it('should prioritize educational value over entertainment', async () => {
    const response = await searchVideoContent({
      query: 'fix clogged drain',
      subject: 'plumbing' as SubjectArea,
      maxResults: 5
    })
    
    // All videos should have high educational value
    response.videos.forEach(video => {
      expect(video.educationalValue).toBeGreaterThan(0.6)
    })
  })

  it('should provide relevant content for pre-med students', async () => {
    const response = await searchVideoContent({
      query: 'copper pipe soldering',
      subject: 'plumbing' as SubjectArea
    })
    
    expect(response.videos.length).toBeGreaterThan(0)
    expect(response.relevanceThreshold).toBeGreaterThan(0.5)
  })

  it('should handle subject-specific educational content', async () => {
    const plumbingRequest = {
      query: 'drain cleaning',
      subject: 'plumbing' as SubjectArea
    }
    
    const [plumbingResponse] = await Promise.all([
      searchVideoContent(plumbingRequest)
    ])
    
    expect(plumbingResponse.videos).toBeDefined()
    expect(plumbingResponse.searchQuery).toContain('drain cleaning')
  })
})