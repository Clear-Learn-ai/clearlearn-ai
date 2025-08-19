import { 
  GeneratedContent, 
  ContentModality, 
  ConceptAnalysis,
  LLMGeneratedContent 
} from '@/core/types'

interface CacheEntry {
  content: GeneratedContent | LLMGeneratedContent
  timestamp: Date
  accessCount: number
  lastAccessed: Date
  ttl: number // Time to live in milliseconds
  size: number // Estimated size in bytes
}

interface CacheStats {
  totalEntries: number
  hitRate: number
  totalSize: number
  maxSize: number
  oldestEntry: Date
  newestEntry: Date
}

export class ContentCacheEngine {
  private cache: Map<string, CacheEntry> = new Map()
  private maxCacheSize: number = 50 * 1024 * 1024 // 50MB in bytes
  private defaultTTL: number = 24 * 60 * 60 * 1000 // 24 hours
  private hits: number = 0
  private misses: number = 0
  private cleanupInterval: NodeJS.Timeout

  constructor(maxSizeMB: number = 50) {
    this.maxCacheSize = maxSizeMB * 1024 * 1024
    
    // Clean up expired entries every hour
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 60 * 60 * 1000)
    
    console.log(`💾 Content cache initialized with ${maxSizeMB}MB limit`)
  }

  /**
   * Get content from cache
   */
  get(key: string): GeneratedContent | LLMGeneratedContent | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      this.misses++
      console.log('❌ Cache miss for:', key)
      return null
    }
    
    // Check if expired
    if (this.isExpired(entry)) {
      this.cache.delete(key)
      this.misses++
      console.log('⏰ Cache expired for:', key)
      return null
    }
    
    // Update access stats
    entry.accessCount++
    entry.lastAccessed = new Date()
    this.hits++
    
    console.log('✅ Cache hit for:', key, `(accessed ${entry.accessCount} times)`)
    return entry.content
  }

  /**
   * Store content in cache
   */
  set(
    key: string, 
    content: GeneratedContent | LLMGeneratedContent, 
    ttl?: number
  ): boolean {
    const size = this.estimateSize(content)
    const entry: CacheEntry = {
      content,
      timestamp: new Date(),
      accessCount: 0,
      lastAccessed: new Date(),
      ttl: ttl || this.defaultTTL,
      size
    }
    
    // Check if we need to make space
    if (this.getCurrentSize() + size > this.maxCacheSize) {
      console.log('🧹 Cache full, cleaning up to make space')
      this.evictLRU(size)
    }
    
    this.cache.set(key, entry)
    console.log(`💾 Cached content for: ${key} (${this.formatSize(size)})`)
    
    return true
  }

  /**
   * Generate cache key for content
   */
  generateKey(
    concept: string, 
    modality: ContentModality, 
    complexity?: number,
    userId?: string,
    depth?: number
  ): string {
    const parts = [
      concept.toLowerCase().replace(/\s+/g, '_'),
      modality,
      complexity?.toString() || '5',
      userId || 'anonymous',
      depth?.toString() || '0'
    ]
    
    return parts.join(':')
  }

  /**
   * Generate cache key for LLM content
   */
  generateLLMKey(
    concept: string,
    modality: ContentModality,
    complexity: number
  ): string {
    return `llm:${concept.toLowerCase().replace(/\s+/g, '_')}:${modality}:${complexity}`
  }

  /**
   * Check if content exists in cache
   */
  has(key: string): boolean {
    const entry = this.cache.get(key)
    return entry !== undefined && !this.isExpired(entry)
  }

  /**
   * Preload common concepts into cache
   */
  async preloadCommonConcepts(concepts: string[], modalities: ContentModality[]): Promise<void> {
    console.log('🚀 Preloading common concepts into cache')
    
    const preloadPromises = []
    
    for (const concept of concepts) {
      for (const modality of modalities) {
        const key = this.generateKey(concept, modality)
        
        if (!this.has(key)) {
          // Generate placeholder content for preloading
          const preloadContent: GeneratedContent = {
            id: `preload_${Date.now()}`,
            queryId: `preload_${concept}`,
            modality,
            data: this.generatePlaceholderData(concept, modality),
            metadata: {
              title: `Understanding ${concept}`,
              description: `${modality} explanation of ${concept}`,
              estimatedDuration: 60,
              difficulty: 5,
              tags: [concept, 'preloaded']
            }
          }
          
          this.set(key, preloadContent, this.defaultTTL * 7) // 7 days for preloaded content
        }
      }
    }
    
    console.log(`✅ Preloaded ${concepts.length} concepts across ${modalities.length} modalities`)
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear()
    this.hits = 0
    this.misses = 0
    console.log('🗑️ Cache cleared')
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const entries = Array.from(this.cache.values())
    const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0)
    const timestamps = entries.map(e => e.timestamp)
    
    return {
      totalEntries: this.cache.size,
      hitRate: this.hits + this.misses > 0 ? this.hits / (this.hits + this.misses) : 0,
      totalSize,
      maxSize: this.maxCacheSize,
      oldestEntry: timestamps.length > 0 ? new Date(Math.min(...timestamps.map(t => t.getTime()))) : new Date(),
      newestEntry: timestamps.length > 0 ? new Date(Math.max(...timestamps.map(t => t.getTime()))) : new Date()
    }
  }

  /**
   * Get cache content for debugging
   */
  getCacheContents(): Array<{ key: string; size: string; age: string; accessCount: number }> {
    return Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      size: this.formatSize(entry.size),
      age: this.formatAge(entry.timestamp),
      accessCount: entry.accessCount
    }))
  }

  /**
   * Optimize cache by removing least accessed items
   */
  optimize(): void {
    console.log('⚡ Optimizing cache')
    
    const entries = Array.from(this.cache.entries())
    const sorted = entries.sort(([,a], [,b]) => {
      // Sort by access count (ascending) and last accessed (ascending)
      const accessDiff = a.accessCount - b.accessCount
      if (accessDiff !== 0) return accessDiff
      
      return a.lastAccessed.getTime() - b.lastAccessed.getTime()
    })
    
    // Remove bottom 25% of entries
    const toRemove = Math.floor(sorted.length * 0.25)
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(sorted[i][0])
    }
    
    console.log(`🗑️ Removed ${toRemove} least accessed cache entries`)
  }

  /**
   * Export cache to JSON for persistence
   */
  exportCache(): string {
    const exportData = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      content: entry.content,
      timestamp: entry.timestamp.toISOString(),
      accessCount: entry.accessCount,
      lastAccessed: entry.lastAccessed.toISOString(),
      ttl: entry.ttl,
      size: entry.size
    }))
    
    return JSON.stringify(exportData)
  }

  /**
   * Import cache from JSON
   */
  importCache(data: string): void {
    try {
      const importData = JSON.parse(data)
      
      for (const item of importData) {
        const entry: CacheEntry = {
          content: item.content,
          timestamp: new Date(item.timestamp),
          accessCount: item.accessCount,
          lastAccessed: new Date(item.lastAccessed),
          ttl: item.ttl,
          size: item.size
        }
        
        // Only import if not expired
        if (!this.isExpired(entry)) {
          this.cache.set(item.key, entry)
        }
      }
      
      console.log(`📥 Imported ${importData.length} cache entries`)
    } catch (error) {
      console.error('❌ Failed to import cache:', error)
    }
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const initialSize = this.cache.size
    let removedCount = 0
    
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key)
        removedCount++
      }
    }
    
    if (removedCount > 0) {
      console.log(`🧹 Cleaned up ${removedCount} expired cache entries`)
    }
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp.getTime() > entry.ttl
  }

  /**
   * Evict least recently used entries to make space
   */
  private evictLRU(spaceNeeded: number): void {
    const entries = Array.from(this.cache.entries())
    
    // Sort by last accessed time (oldest first)
    entries.sort(([,a], [,b]) => a.lastAccessed.getTime() - b.lastAccessed.getTime())
    
    let freedSpace = 0
    let evictedCount = 0
    
    for (const [key, entry] of entries) {
      this.cache.delete(key)
      freedSpace += entry.size
      evictedCount++
      
      if (freedSpace >= spaceNeeded) {
        break
      }
    }
    
    console.log(`🗑️ Evicted ${evictedCount} LRU entries, freed ${this.formatSize(freedSpace)}`)
  }

  /**
   * Estimate content size in bytes
   */
  private estimateSize(content: GeneratedContent | LLMGeneratedContent): number {
    const jsonString = JSON.stringify(content)
    return Buffer.byteLength(jsonString, 'utf8')
  }

  /**
   * Get current cache size
   */
  private getCurrentSize(): number {
    return Array.from(this.cache.values()).reduce((sum, entry) => sum + entry.size, 0)
  }

  /**
   * Format size in human readable format
   */
  private formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`
  }

  /**
   * Format age in human readable format
   */
  private formatAge(timestamp: Date): string {
    const ageMs = Date.now() - timestamp.getTime()
    const ageMinutes = Math.floor(ageMs / (1000 * 60))
    
    if (ageMinutes < 60) return `${ageMinutes}m`
    
    const ageHours = Math.floor(ageMinutes / 60)
    if (ageHours < 24) return `${ageHours}h`
    
    const ageDays = Math.floor(ageHours / 24)
    return `${ageDays}d`
  }

  /**
   * Generate placeholder data for preloading
   */
  private generatePlaceholderData(concept: string, modality: ContentModality): any {
    switch (modality) {
      case 'animation':
        return {
          type: 'animation',
          steps: [],
          duration: 60000,
          canvas: { width: 800, height: 600, backgroundColor: '#f0f9ff' }
        }
      case 'simulation':
        return {
          type: 'simulation',
          simulationType: 'physics',
          parameters: [],
          initialState: {},
          constraints: [],
          visualElements: [],
          updateInterval: 33
        }
      default:
        return {
          type: modality,
          placeholder: true,
          concept
        }
    }
  }

  /**
   * Destroy cache engine and cleanup
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.clear()
    console.log('💾 Cache engine destroyed')
  }
}