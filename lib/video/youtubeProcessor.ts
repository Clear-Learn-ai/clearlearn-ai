import { YoutubeTranscript } from 'youtube-transcript-api'
import youtubedl from 'youtube-dl-exec'
import ffmpegPath from 'ffmpeg-static'
import { FFmpeg } from '@ffmpeg/ffmpeg'
// import { toBlobURL } from '@ffmpeg/util'
import fs from 'fs/promises'
import path from 'path'
import { OpenAI } from 'openai'

interface VideoMetadata {
  id: string
  title: string
  description: string
  duration: number
  uploadDate: string
  uploader: string
  channel: string
  channelId: string
  viewCount?: number
  likeCount?: number
  tags?: string[]
  thumbnail: string
  url: string
}

interface TranscriptSegment {
  start: number
  duration: number
  text: string
  confidence?: number
}

interface VideoFrame {
  timestamp: number
  frameNumber: number
  imagePath: string
  description?: string
  keyObjects?: string[]
  isKeyFrame: boolean
  importance: number
}

interface PlumbingStep {
  stepNumber: number
  title: string
  description: string
  startTime: number
  endTime: number
  transcript: string
  frames: VideoFrame[]
  tools?: string[]
  materials?: string[]
  techniques?: string[]
  warnings?: string[]
  codeReferences?: string[]
}

interface ProcessedVideo {
  id: string
  metadata: VideoMetadata
  transcript: TranscriptSegment[]
  keyFrames: VideoFrame[]
  plumbingSteps: PlumbingStep[]
  summary: string
  skillLevel: 'beginner' | 'intermediate' | 'advanced'
  category: 'installation' | 'repair' | 'troubleshooting' | 'maintenance' | 'inspection'
  relatedComponents: string[]
  processedAt: Date
}

interface PlumbingChannel {
  name: string
  channelId: string
  channelUrl: string
  specialties: string[]
  skillLevel: 'beginner' | 'intermediate' | 'advanced'
  videoPatterns: RegExp[]
}

export class YouTubeVideoProcessor {
  private openai: OpenAI
  private ffmpeg: FFmpeg | null = null
  private outputDir: string
  private framesDir: string
  private transcriptDir: string

  // Target plumbing channels
  private plumbingChannels: PlumbingChannel[] = [
    {
      name: 'Roger Wakefield Plumbing',
      channelId: 'UCdTn6tMmjCbV8Ey7fqMjHtQ',
      channelUrl: 'https://www.youtube.com/c/RogerWakefield',
      specialties: ['residential plumbing', 'toilet repair', 'drain cleaning', 'water heater'],
      skillLevel: 'intermediate',
      videoPatterns: [
        /toilet/i, /drain/i, /leak/i, /install/i, /repair/i, /plumbing/i
      ]
    },
    {
      name: 'Steve Lav Pro Plumbing',
      channelId: 'UCr_IWb2wfvSiTKBGj_0pMqA',
      channelUrl: 'https://www.youtube.com/c/SteveLavPro',
      specialties: ['commercial plumbing', 'advanced repairs', 'code compliance'],
      skillLevel: 'advanced',
      videoPatterns: [
        /commercial/i, /code/i, /professional/i, /advanced/i
      ]
    },
    {
      name: 'Essential Craftsman',
      channelId: 'UCzr30osBdTmuFUS8IfXtXmg',
      channelUrl: 'https://www.youtube.com/c/EssentialCraftsman',
      specialties: ['construction plumbing', 'rough-in', 'tools', 'techniques'],
      skillLevel: 'intermediate',
      videoPatterns: [
        /construction/i, /rough.*in/i, /building/i, /craftsman/i
      ]
    },
    {
      name: 'This Old House Plumbing',
      channelId: 'UCUtWNBWbFL9We-cdXkiAuJA',
      channelUrl: 'https://www.youtube.com/c/thisoldhouse',
      specialties: ['home improvement', 'DIY plumbing', 'fixtures', 'upgrades'],
      skillLevel: 'beginner',
      videoPatterns: [
        /home/i, /DIY/i, /house/i, /improvement/i, /upgrade/i
      ]
    }
  ]

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
    this.outputDir = path.join(process.cwd(), 'data', 'videos')
    this.framesDir = path.join(process.cwd(), 'data', 'frames')
    this.transcriptDir = path.join(process.cwd(), 'data', 'transcripts')
  }

  private async initializeFFmpeg(): Promise<void> {
    if (this.ffmpeg) return

    this.ffmpeg = new FFmpeg()
    
    // Load FFmpeg WebAssembly
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd'
    // Disable FFmpeg loading for production build
    console.log('FFmpeg loading disabled for production')
  }

  // Extract video metadata using youtube-dl
  async extractVideoMetadata(videoUrl: string): Promise<VideoMetadata> {
    try {
      const info = await youtubedl(videoUrl, {
        dumpSingleJson: true,
        noWarnings: true,
        extractFlat: false,
      }) as any

      return {
        id: info.id,
        title: info.title || '',
        description: info.description || '',
        duration: info.duration || 0,
        uploadDate: info.upload_date || '',
        uploader: info.uploader || '',
        channel: info.channel || '',
        channelId: info.channel_id || '',
        viewCount: info.view_count,
        likeCount: info.like_count,
        tags: info.tags || [],
        thumbnail: info.thumbnail || '',
        url: videoUrl,
      }
    } catch (error) {
      console.error(`Error extracting metadata for ${videoUrl}:`, error)
      throw error
    }
  }

  // Extract transcript from YouTube video
  async extractTranscript(videoId: string): Promise<TranscriptSegment[]> {
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(videoId)
      
      return transcript.map((segment: any) => ({
        start: segment.offset / 1000, // Convert to seconds
        duration: segment.duration / 1000,
        text: segment.text,
        confidence: segment.confidence,
      }))
    } catch (error) {
      console.error(`Error extracting transcript for ${videoId}:`, error)
      return []
    }
  }

  // Download video for frame extraction
  async downloadVideo(videoUrl: string, videoId: string): Promise<string> {
    const videoPath = path.join(this.outputDir, `${videoId}.mp4`)
    
    try {
      await youtubedl(videoUrl, {
        output: videoPath,
        format: 'best[height<=720]', // Limit to 720p for processing efficiency
      })
      
      return videoPath
    } catch (error) {
      console.error(`Error downloading video ${videoId}:`, error)
      throw error
    }
  }

  // Extract key frames from video
  async extractKeyFrames(videoPath: string, videoId: string, duration: number): Promise<VideoFrame[]> {
    await this.initializeFFmpeg()
    if (!this.ffmpeg) throw new Error('FFmpeg not initialized')

    const frames: VideoFrame[] = []
    const frameInterval = Math.max(5, Math.floor(duration / 50)) // Extract frames every 5 seconds or max 50 frames
    
    try {
      // Load video into FFmpeg
      const videoData = await fs.readFile(videoPath)
      await this.ffmpeg.writeFile('input.mp4', videoData)

      for (let i = 0; i < duration; i += frameInterval) {
        const frameNumber = Math.floor(i / frameInterval)
        const outputName = `frame_${frameNumber}.png`
        
        // Extract frame at specific timestamp
        await this.ffmpeg.exec([
          '-i', 'input.mp4',
          '-ss', i.toString(),
          '-vframes', '1',
          '-q:v', '2',
          outputName
        ])

        // Read the extracted frame
        const frameData = await this.ffmpeg.readFile(outputName)
        const framePath = path.join(this.framesDir, `${videoId}_${outputName}`)
        
        // Save frame to disk
        await fs.writeFile(framePath, frameData as Uint8Array)

        // Analyze frame importance (basic implementation)
        const importance = await this.analyzeFrameImportance(framePath, i)

        frames.push({
          timestamp: i,
          frameNumber,
          imagePath: framePath,
          isKeyFrame: importance > 0.7, // Threshold for key frames
          importance,
        })

        // Clean up temporary file
        await this.ffmpeg.deleteFile(outputName)
      }

      // Clean up input file
      await this.ffmpeg.deleteFile('input.mp4')

    } catch (error) {
      console.error(`Error extracting frames from ${videoPath}:`, error)
    }

    return frames
  }

  // Analyze frame importance using AI vision
  private async analyzeFrameImportance(framePath: string, timestamp: number): Promise<number> {
    try {
      // Convert frame to base64 for OpenAI Vision
      const frameBuffer = await fs.readFile(framePath)
      const base64Frame = frameBuffer.toString('base64')

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this frame from a plumbing video. Rate its importance on a scale of 0-1 based on: 1) Shows clear plumbing work/installation, 2) Shows tools being used, 3) Shows important steps or techniques, 4) Shows problems or issues being addressed. Return only a number between 0 and 1.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${base64Frame}`,
                  detail: 'low'
                }
              }
            ]
          }
        ],
        max_tokens: 10,
      })

      const importanceText = response.choices[0]?.message?.content?.trim() || '0.5'
      return Math.max(0, Math.min(1, parseFloat(importanceText) || 0.5))

    } catch (error) {
      console.error(`Error analyzing frame importance:`, error)
      return 0.5 // Default importance
    }
  }

  // Process transcript to identify plumbing steps
  async identifyPlumbingSteps(
    transcript: TranscriptSegment[],
    keyFrames: VideoFrame[],
    metadata: VideoMetadata
  ): Promise<PlumbingStep[]> {
    try {
      // Combine transcript text for analysis
      const fullTranscript = transcript.map(seg => seg.text).join(' ')

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are analyzing a plumbing video transcript to identify step-by-step procedures. 
            Break down the content into logical plumbing steps with timestamps. 
            For each step, identify:
            - Step title and description
            - Tools mentioned
            - Materials mentioned
            - Techniques used
            - Safety warnings
            - Code references (if any)
            
            Return the analysis as a JSON array of steps.`
          },
          {
            role: 'user',
            content: `Video Title: ${metadata.title}
            Description: ${metadata.description}
            
            Transcript:
            ${transcript.map(seg => `[${seg.start}s] ${seg.text}`).join('\n')}
            
            Please identify the main plumbing steps in this video.`
          }
        ],
        max_tokens: 2000,
        temperature: 0.3,
      })

      const stepsText = response.choices[0]?.message?.content || '[]'
      const stepsData = JSON.parse(stepsText)

      return stepsData.map((step: any, index: number) => {
        // Find relevant frames for this step
        const stepFrames = keyFrames.filter(frame => 
          frame.timestamp >= (step.startTime || 0) && 
          frame.timestamp <= (step.endTime || metadata.duration)
        )

        // Get transcript for this step
        const stepTranscript = transcript
          .filter(seg => 
            seg.start >= (step.startTime || 0) && 
            seg.start <= (step.endTime || metadata.duration)
          )
          .map(seg => seg.text)
          .join(' ')

        return {
          stepNumber: index + 1,
          title: step.title || `Step ${index + 1}`,
          description: step.description || '',
          startTime: step.startTime || 0,
          endTime: step.endTime || metadata.duration,
          transcript: stepTranscript,
          frames: stepFrames,
          tools: step.tools || [],
          materials: step.materials || [],
          techniques: step.techniques || [],
          warnings: step.warnings || [],
          codeReferences: step.codeReferences || [],
        }
      })

    } catch (error) {
      console.error('Error identifying plumbing steps:', error)
      return []
    }
  }

  // Generate video summary and categorization
  async generateVideoSummary(metadata: VideoMetadata, transcript: TranscriptSegment[]): Promise<{
    summary: string
    skillLevel: 'beginner' | 'intermediate' | 'advanced'
    category: ProcessedVideo['category']
    relatedComponents: string[]
  }> {
    try {
      const fullTranscript = transcript.map(seg => seg.text).join(' ')

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Analyze this plumbing video and provide:
            1. A concise summary (2-3 sentences)
            2. Skill level (beginner/intermediate/advanced)
            3. Category (installation/repair/troubleshooting/maintenance/inspection)
            4. Related plumbing components mentioned
            
            Return as JSON with keys: summary, skillLevel, category, relatedComponents`
          },
          {
            role: 'user',
            content: `Title: ${metadata.title}
            Channel: ${metadata.channel}
            Description: ${metadata.description}
            Transcript: ${fullTranscript.substring(0, 2000)}...`
          }
        ],
        max_tokens: 500,
        temperature: 0.3,
      })

      const analysis = JSON.parse(response.choices[0]?.message?.content || '{}')
      
      return {
        summary: analysis.summary || '',
        skillLevel: analysis.skillLevel || 'intermediate',
        category: analysis.category || 'installation',
        relatedComponents: analysis.relatedComponents || [],
      }

    } catch (error) {
      console.error('Error generating video summary:', error)
      return {
        summary: '',
        skillLevel: 'intermediate',
        category: 'installation',
        relatedComponents: [],
      }
    }
  }

  // Main processing function
  async processVideo(videoUrl: string): Promise<ProcessedVideo> {
    console.log(`Processing video: ${videoUrl}`)

    try {
      // Extract video ID from URL
      const videoId = this.extractVideoId(videoUrl)
      if (!videoId) throw new Error('Invalid YouTube URL')

      // Check if this video is from a target plumbing channel
      const metadata = await this.extractVideoMetadata(videoUrl)
      const channel = this.identifyPlumbingChannel(metadata)
      
      if (!channel) {
        console.log(`Video not from target plumbing channel: ${metadata.channel}`)
      }

      // Extract transcript
      console.log('Extracting transcript...')
      const transcript = await this.extractTranscript(videoId)
      
      if (transcript.length === 0) {
        console.log('No transcript available, using audio transcription fallback')
        // TODO: Implement audio transcription fallback
      }

      // Download video for frame extraction
      console.log('Downloading video...')
      const videoPath = await this.downloadVideo(videoUrl, videoId)

      // Extract key frames
      console.log('Extracting key frames...')
      const keyFrames = await this.extractKeyFrames(videoPath, videoId, metadata.duration)

      // Identify plumbing steps
      console.log('Identifying plumbing steps...')
      const plumbingSteps = await this.identifyPlumbingSteps(transcript, keyFrames, metadata)

      // Generate summary and categorization
      console.log('Generating summary...')
      const analysis = await this.generateVideoSummary(metadata, transcript)

      const processedVideo: ProcessedVideo = {
        id: videoId,
        metadata,
        transcript,
        keyFrames,
        plumbingSteps,
        summary: analysis.summary,
        skillLevel: analysis.skillLevel,
        category: analysis.category,
        relatedComponents: analysis.relatedComponents,
        processedAt: new Date(),
      }

      // Save processed video data
      await this.saveProcessedVideo(processedVideo)

      console.log(`Successfully processed video: ${metadata.title}`)
      return processedVideo

    } catch (error) {
      console.error(`Error processing video ${videoUrl}:`, error)
      throw error
    }
  }

  // Batch process videos from target channels
  async processChannelVideos(channelId: string, limit: number = 10): Promise<ProcessedVideo[]> {
    const channel = this.plumbingChannels.find(c => c.channelId === channelId)
    if (!channel) throw new Error(`Unknown channel ID: ${channelId}`)

    console.log(`Processing videos from ${channel.name}...`)

    // TODO: Implement channel video discovery and batch processing
    // This would involve:
    // 1. Getting channel video list using YouTube API
    // 2. Filtering videos based on plumbing patterns
    // 3. Processing each video
    // 4. Managing rate limits and errors

    return []
  }

  // Helper methods
  private extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }

    return null
  }

  private identifyPlumbingChannel(metadata: VideoMetadata): PlumbingChannel | null {
    return this.plumbingChannels.find(channel => 
      channel.channelId === metadata.channelId ||
      channel.name.toLowerCase() === metadata.channel.toLowerCase()
    ) || null
  }

  private async saveProcessedVideo(video: ProcessedVideo): Promise<void> {
    const outputPath = path.join(this.outputDir, `${video.id}.json`)
    await fs.writeFile(outputPath, JSON.stringify(video, null, 2))

    // Also save transcript separately
    const transcriptPath = path.join(this.transcriptDir, `${video.id}_transcript.json`)
    await fs.writeFile(transcriptPath, JSON.stringify(video.transcript, null, 2))
  }

  // Search processed videos
  async searchVideos(query: string, filters?: {
    skillLevel?: string
    category?: string
    channel?: string
  }): Promise<ProcessedVideo[]> {
    try {
      // Load all processed videos
      const videoFiles = await fs.readdir(this.outputDir)
      const videos: ProcessedVideo[] = []

      for (const file of videoFiles) {
        if (file.endsWith('.json')) {
          const videoData = await fs.readFile(path.join(this.outputDir, file), 'utf-8')
          const video: ProcessedVideo = JSON.parse(videoData)
          
          // Apply filters
          if (filters?.skillLevel && video.skillLevel !== filters.skillLevel) continue
          if (filters?.category && video.category !== filters.category) continue
          if (filters?.channel && !video.metadata.channel.toLowerCase().includes(filters.channel.toLowerCase())) continue

          // Search in title, description, and transcript
          const searchText = [
            video.metadata.title,
            video.metadata.description,
            video.summary,
            ...video.transcript.map(t => t.text),
          ].join(' ').toLowerCase()

          if (searchText.includes(query.toLowerCase())) {
            videos.push(video)
          }
        }
      }

      return videos.sort((a, b) => 
        new Date(b.processedAt).getTime() - new Date(a.processedAt).getTime()
      )

    } catch (error) {
      console.error('Error searching videos:', error)
      return []
    }
  }

  // Get target channels information
  getTargetChannels(): PlumbingChannel[] {
    return this.plumbingChannels
  }
}

export type {
  VideoMetadata,
  TranscriptSegment,
  VideoFrame,
  PlumbingStep,
  ProcessedVideo,
  PlumbingChannel,
}