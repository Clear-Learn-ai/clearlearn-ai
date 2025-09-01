import { ContentModality, GeneratedContent } from '@/core/types'

interface VoiceSettings {
  enabled: boolean
  rate: number        // 0.1 to 10
  pitch: number       // 0 to 2  
  volume: number      // 0 to 1
  voice: string       // Voice name
  language: string    // Language code
}

interface SpeechSegment {
  text: string
  timestamp: number
  duration: number
  type: 'narration' | 'explanation' | 'instruction'
  visualSync?: {
    element: string
    action: string
  }
}

interface VoiceSession {
  contentId: string
  segments: SpeechSegment[]
  currentSegment: number
  isPlaying: boolean
  startTime: number
  totalDuration: number
}

export class VoiceEngine {
  private synthesis: SpeechSynthesis | null = null
  private recognition: any = null // SpeechRecognition
  private settings: VoiceSettings
  private currentSession: VoiceSession | null = null
  private availableVoices: SpeechSynthesisVoice[] = []
  private isListening: boolean = false
  private onResultCallback?: (transcript: string, confidence: number) => void

  constructor() {
    this.settings = {
      enabled: true,
      rate: 0.9,
      pitch: 1.0,
      volume: 0.8,
      voice: 'default',
      language: 'en-US'
    }
    
    this.initializeSpeech()
    console.log('🎤 Voice Engine initialized')
  }

  /**
   * Generate speech segments from content
   */
  generateSpeechSegments(content: GeneratedContent): SpeechSegment[] {
    console.log('🗣️ Generating speech segments for:', content.modality)
    
    const segments: SpeechSegment[] = []
    let currentTime = 0
    
    switch (content.modality) {
      case 'animation':
        segments.push(...this.generateAnimationSpeech(content, currentTime))
        break
      
      case 'simulation':
        segments.push(...this.generateSimulationSpeech(content, currentTime))
        break
      
      case 'concept-map':
        segments.push(...this.generateConceptMapSpeech(content, currentTime))
        break
      
      case '3d':
        segments.push(...this.generate3DSpeech(content, currentTime))
        break
      
      default:
        // Generic explanation
        segments.push({
          text: `Let me explain ${content.metadata.title}. ${content.metadata.description}`,
          timestamp: 0,
          duration: this.estimateSpeechDuration(`Let me explain ${content.metadata.title}. ${content.metadata.description}`),
          type: 'explanation'
        })
    }
    
    console.log(`📝 Generated ${segments.length} speech segments`)
    return segments
  }

  /**
   * Start synchronized speech for content
   */
  async startSynchronizedSpeech(
    content: GeneratedContent,
    onVisualSync?: (element: string, action: string) => void
  ): Promise<void> {
    if (!this.synthesis) {
      console.warn('⚠️ Speech synthesis not available')
      return
    }
    
    const segments = this.generateSpeechSegments(content)
    
    this.currentSession = {
      contentId: content.id,
      segments,
      currentSegment: 0,
      isPlaying: true,
      startTime: Date.now(),
      totalDuration: segments.reduce((sum, s) => sum + s.duration, 0)
    }
    
    console.log('🎵 Starting synchronized speech')
    await this.playSegments(onVisualSync)
  }

  /**
   * Start voice input listening
   */
  startListening(
    onResult: (transcript: string, confidence: number) => void,
    onEnd?: () => void
  ): void {
    if (!this.recognition) {
      console.warn('⚠️ Speech recognition not available')
      return
    }
    
    this.isListening = true
    this.onResultCallback = onResult
    
    this.recognition.start()
    console.log('👂 Started listening for voice input')
  }

  /**
   * Stop voice input listening
   */
  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
      this.isListening = false
      console.log('🔇 Stopped listening')
    }
  }

  /**
   * Speak text immediately (for quick responses)
   */
  async speakText(
    text: string, 
    type: 'instruction' | 'feedback' | 'prompt' = 'instruction'
  ): Promise<void> {
    if (!this.synthesis) return
    
    const utterance = new SpeechSynthesisUtterance(text)
    this.configureUtterance(utterance)
    
    // Adjust voice characteristics based on type
    switch (type) {
      case 'feedback':
        utterance.pitch = 1.2 // Slightly higher for positive feedback
        utterance.rate = 0.8  // Slower for clarity
        break
      case 'prompt':
        utterance.pitch = 1.1 // Questioning tone
        break
    }
    
    return new Promise((resolve) => {
      utterance.onend = () => resolve()
      this.synthesis!.speak(utterance)
    })
  }

  /**
   * Pause current speech
   */
  pauseSpeech(): void {
    if (this.synthesis) {
      this.synthesis.pause()
      if (this.currentSession) {
        this.currentSession.isPlaying = false
      }
      console.log('⏸️ Speech paused')
    }
  }

  /**
   * Resume paused speech
   */
  resumeSpeech(): void {
    if (this.synthesis) {
      this.synthesis.resume()
      if (this.currentSession) {
        this.currentSession.isPlaying = true
      }
      console.log('▶️ Speech resumed')
    }
  }

  /**
   * Stop all speech
   */
  stopSpeech(): void {
    if (this.synthesis) {
      this.synthesis.cancel()
      this.currentSession = null
      console.log('⏹️ Speech stopped')
    }
  }

  /**
   * Update voice settings
   */
  updateSettings(newSettings: Partial<VoiceSettings>): void {
    this.settings = { ...this.settings, ...newSettings }
    console.log('⚙️ Voice settings updated:', newSettings)
  }

  /**
   * Get available voices
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.availableVoices
  }

  /**
   * Get current session info
   */
  getCurrentSession(): VoiceSession | null {
    return this.currentSession
  }

  /**
   * Check if voice features are supported
   */
  isSupported(): { speech: boolean; recognition: boolean } {
    return {
      speech: !!this.synthesis,
      recognition: !!this.recognition
    }
  }

  /**
   * Generate accessibility-compliant speech
   */
  generateAccessibleNarration(content: GeneratedContent): string {
    let narration = `Beginning explanation of ${content.metadata.title}. `
    
    // Add content type description
    switch (content.modality) {
      case 'animation':
        narration += 'This is an animated demonstration. '
        break
      case 'simulation':
        narration += 'This is an interactive simulation you can control. '
        break
      case 'concept-map':
        narration += 'This is a concept map showing relationships between ideas. '
        break
      case '3d':
        narration += 'This is a three-dimensional model you can explore. '
        break
    }
    
    narration += content.metadata.description
    narration += ` The estimated duration is ${content.metadata.estimatedDuration} seconds. `
    narration += `Difficulty level: ${content.metadata.difficulty} out of 10.`
    
    return narration
  }

  private initializeSpeech(): void {
    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis
      
      // Load available voices
      const loadVoices = () => {
        this.availableVoices = this.synthesis!.getVoices()
        console.log(`🎭 Loaded ${this.availableVoices.length} voices`)
      }
      
      loadVoices()
      this.synthesis.onvoiceschanged = loadVoices
    }
    
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      this.recognition = new SpeechRecognition()
      
      this.recognition.continuous = false
      this.recognition.interimResults = true
      this.recognition.lang = this.settings.language
      
      this.recognition.onresult = (event: any) => {
        const result = event.results[0]
        const transcript = result[0].transcript
        const confidence = result[0].confidence
        
        if (this.onResultCallback) {
          this.onResultCallback(transcript, confidence)
        }
      }
      
      this.recognition.onend = () => {
        this.isListening = false
        console.log('👂 Speech recognition ended')
      }
      
      this.recognition.onerror = (event: any) => {
        console.error('🚫 Speech recognition error:', event.error)
        this.isListening = false
      }
    }
  }

  private generateAnimationSpeech(content: GeneratedContent, startTime: number): SpeechSegment[] {
    const segments: SpeechSegment[] = []
    const data = content.data
    
    if ((data as any).steps) {
      segments.push({
        text: 'Watch as I show you step by step how this works.',
        timestamp: startTime,
        duration: 2000,
        type: 'instruction'
      });
      
      (data as any).steps.forEach((step: any, index: number) => {
        const stepText = step.narration || step.description || `Step ${index + 1}: Observing the process.`
        segments.push({
          text: stepText,
          timestamp: startTime + step.duration * index,
          duration: this.estimateSpeechDuration(stepText),
          type: 'narration',
          visualSync: {
            element: step.id,
            action: 'highlight'
          }
        })
      })
    }
    
    return segments
  }

  private generateSimulationSpeech(content: GeneratedContent, startTime: number): SpeechSegment[] {
    const segments: SpeechSegment[] = []
    const data = content.data
    
    segments.push({
      text: 'This is an interactive simulation. You can adjust the parameters to see how they affect the outcome.',
      timestamp: startTime,
      duration: 3000,
      type: 'instruction'
    })
    
    if ((data as any).parameters && (data as any).parameters.length > 0) {
      const paramText = `You can control ${(data as any).parameters.length} different parameters: ${(data as any).parameters.slice(0, 3).map((p: any) => p.name).join(', ')}.`
      segments.push({
        text: paramText,
        timestamp: startTime + 3500,
        duration: this.estimateSpeechDuration(paramText),
        type: 'instruction'
      })
    }
    
    return segments
  }

  private generateConceptMapSpeech(content: GeneratedContent, startTime: number): SpeechSegment[] {
    const segments: SpeechSegment[] = []
    const data = content.data
    
    segments.push({
      text: 'This concept map shows how different ideas connect to each other. Each circle represents a concept, and the lines show relationships.',
      timestamp: startTime,
      duration: 4000,
      type: 'instruction'
    })
    
    if ((data as any).nodes && (data as any).nodes.length > 0) {
      const nodeText = `There are ${(data as any).nodes.length} main concepts in this map. Click on any concept to learn more about it.`
      segments.push({
        text: nodeText,
        timestamp: startTime + 4500,
        duration: this.estimateSpeechDuration(nodeText),
        type: 'instruction'
      })
    }
    
    return segments
  }

  private generate3DSpeech(content: GeneratedContent, startTime: number): SpeechSegment[] {
    const segments: SpeechSegment[] = []
    
    segments.push({
      text: 'This is a three-dimensional model. You can rotate it by dragging, and zoom in or out using your mouse wheel or touch gestures.',
      timestamp: startTime,
      duration: 4000,
      type: 'instruction'
    })
    
    segments.push({
      text: 'Take your time to explore the model from different angles to better understand its structure.',
      timestamp: startTime + 4500,
      duration: 3000,
      type: 'instruction'
    })
    
    return segments
  }

  private async playSegments(onVisualSync?: (element: string, action: string) => void): Promise<void> {
    if (!this.currentSession || !this.synthesis) return
    
    for (let i = 0; i < this.currentSession.segments.length; i++) {
      if (!this.currentSession.isPlaying) break
      
      const segment = this.currentSession.segments[i]
      this.currentSession.currentSegment = i
      
      // Trigger visual sync if available
      if (segment.visualSync && onVisualSync) {
        onVisualSync(segment.visualSync.element, segment.visualSync.action)
      }
      
      await this.speakSegment(segment)
      
      // Small pause between segments
      await new Promise(resolve => setTimeout(resolve, 300))
    }
    
    console.log('🎵 Speech session completed')
    this.currentSession = null
  }

  private async speakSegment(segment: SpeechSegment): Promise<void> {
    if (!this.synthesis) return
    
    const utterance = new SpeechSynthesisUtterance(segment.text)
    this.configureUtterance(utterance)
    
    return new Promise((resolve) => {
      utterance.onend = () => resolve()
      this.synthesis!.speak(utterance)
    })
  }

  private configureUtterance(utterance: SpeechSynthesisUtterance): void {
    utterance.rate = this.settings.rate
    utterance.pitch = this.settings.pitch
    utterance.volume = this.settings.volume
    utterance.lang = this.settings.language
    
    // Set voice if specified
    if (this.settings.voice !== 'default') {
      const voice = this.availableVoices.find(v => v.name === this.settings.voice)
      if (voice) {
        utterance.voice = voice
      }
    }
  }

  private estimateSpeechDuration(text: string): number {
    // Rough estimation: 150 words per minute average speech rate
    const wordsPerMinute = 150
    const words = text.split(' ').length
    const minutes = words / wordsPerMinute
    const milliseconds = minutes * 60 * 1000
    
    // Apply rate adjustment
    return milliseconds / this.settings.rate
  }
}