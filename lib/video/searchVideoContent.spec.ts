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
import type { SearchVideoContentRequest, VideoContent, SubjectArea } from '../../types/education'

describe('Video Search', () => {
  describe('enhanceQueryForEducationalContent', () => {
    it('should add educational keywords to organic chemistry queries', () => {
      const enhanced = enhanceQueryForEducationalContent(
        'SN2 mechanism',
        'organic_chemistry' as SubjectArea
      )
      
      expect(enhanced).toContain('organic chemistry')
      expect(enhanced).toContain('tutorial')
      expect(enhanced).toContain('mechanism')
      expect(enhanced).toContain('-music') // Filter out non-educational content
    })

    it('should adapt keywords for different subjects', () => {
      const biologyQuery = enhanceQueryForEducationalContent(
        'cell division',
        'biology' as SubjectArea
      )
      
      expect(biologyQuery).toContain('biology')
      expect(biologyQuery).toContain('tutorial')
      expect(biologyQuery).toContain('educational')
    })

    it('should filter out low-quality content', () => {
      const enhanced = enhanceQueryForEducationalContent(
        'photosynthesis',
        'biology' as SubjectArea
      )
      
      expect(enhanced).toContain('-music')
      expect(enhanced).toContain('-vlog')
      expect(enhanced).toContain('-reaction')
    })
  })

  describe('calculateEducationalRelevance', () => {
    it('should score educational content highly', () => {
      const educationalSnippet = {
        title: 'SN2 Reaction Mechanism Explained - Complete Tutorial',
        description: 'Step by step explanation of nucleophilic substitution mechanism',
        channelTitle: 'Organic Chemistry Tutor'
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
        title: 'Chemistry Song and Dance',
        description: 'Fun music video about chemistry',
        channelTitle: 'Random YouTuber'
      }
      
      const score = calculateEducationalRelevance(nonEducationalSnippet)
      expect(score).toBeLessThan(0.7)
    })
  })

  describe('assessEducationalValue', () => {
    it('should value mechanism explanations highly', () => {
      const mechanismSnippet = {
        title: 'Complete SN2 Mechanism with Stereochemistry Explained',
        description: 'Comprehensive step-by-step mechanism explanation'
      }
      
      const value = assessEducationalValue(mechanismSnippet)
      expect(value).toBeGreaterThan(0.8)
    })

    it('should recognize comprehensive content', () => {
      const comprehensiveSnippet = {
        title: 'Complete Guide to Organic Reactions',
        description: 'Comprehensive overview with step by step examples'
      }
      
      const value = assessEducationalValue(comprehensiveSnippet)
      expect(value).toBeGreaterThan(0.7)
    })
  })

  describe('getCuratedEducationalVideos', () => {
    it('should return relevant videos for organic chemistry queries', () => {
      const videos = getCuratedEducationalVideos('SN2 mechanism', 'organic_chemistry' as SubjectArea)
      
      expect(videos.length).toBeGreaterThan(0)
      expect(videos[0]).toMatchObject({
        title: expect.stringMatching(/SN2.*mechanism/i),
        educationalValue: expect.any(Number),
        relevanceScore: expect.any(Number)
      })
    })

    it('should filter videos by query relevance', () => {
      const videos = getCuratedEducationalVideos('stereochemistry', 'organic_chemistry' as SubjectArea)
      
      videos.forEach(video => {
        const matchesQuery = 
          video.title.toLowerCase().includes('stereochemistry') ||
          video.description.toLowerCase().includes('stereochemistry') ||
          (video as any).keywords?.some((k: string) => k.includes('stereochemistry'))
        
        expect(matchesQuery).toBe(true)
      })
    })

    it('should provide fallback content for unknown subjects', () => {
      const videos = getCuratedEducationalVideos('test query', 'unknown_subject' as SubjectArea)
      
      expect(videos).toBeInstanceOf(Array)
      // Should fallback to organic chemistry content
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
      const request: SearchVideoContentRequest = {
        query: 'SN2 mechanism',
        subject: 'organic_chemistry' as SubjectArea,
        maxResults: 3
      }
      
      const response = await searchVideoContent(request)
      
      expect(response.videos.length).toBeGreaterThan(0)
      expect(response.videos.length).toBeLessThanOrEqual(3)
      expect(response.searchQuery).toBe('SN2 mechanism')
      expect(response.relevanceThreshold).toBeGreaterThan(0)
    })

    it('should limit results according to maxResults parameter', async () => {
      const request: SearchVideoContentRequest = {
        query: 'organic chemistry',
        subject: 'organic_chemistry' as SubjectArea,
        maxResults: 2
      }
      
      const response = await searchVideoContent(request)
      expect(response.videos.length).toBeLessThanOrEqual(2)
    })

    it('should provide meaningful educational metadata', async () => {
      const request: SearchVideoContentRequest = {
        query: 'stereochemistry',
        subject: 'organic_chemistry' as SubjectArea
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
      query: 'photosynthesis',
      subject: 'biology' as SubjectArea,
      maxResults: 5
    })
    
    // All videos should have high educational value
    response.videos.forEach(video => {
      expect(video.educationalValue).toBeGreaterThan(0.6)
    })
  })

  it('should provide relevant content for pre-med students', async () => {
    const response = await searchVideoContent({
      query: 'enzyme kinetics',
      subject: 'biochemistry' as SubjectArea
    })
    
    expect(response.videos.length).toBeGreaterThan(0)
    expect(response.relevanceThreshold).toBeGreaterThan(0.5)
  })

  it('should handle subject-specific educational content', async () => {
    const organicRequest: SearchVideoContentRequest = {
      query: 'reaction mechanism',
      subject: 'organic_chemistry' as SubjectArea
    }
    
    const biologyRequest: SearchVideoContentRequest = {
      query: 'cell division',
      subject: 'biology' as SubjectArea
    }
    
    const [organicResponse, biologyResponse] = await Promise.all([
      searchVideoContent(organicRequest),
      searchVideoContent(biologyRequest)
    ])
    
    expect(organicResponse.videos).toBeDefined()
    expect(biologyResponse.videos).toBeDefined()
    
    // Each should return subject-appropriate content
    expect(organicResponse.searchQuery).toContain('reaction mechanism')
    expect(biologyResponse.searchQuery).toContain('cell division')
  })
})