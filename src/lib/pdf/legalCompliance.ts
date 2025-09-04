interface LegalAttribution {
  sourceId: string
  title: string
  author?: string
  publisher: string
  publicationDate?: Date
  copyright: string
  license?: string
  url?: string
  fairUseJustification: string
  usageType: 'educational' | 'excerpt' | 'reference' | 'citation'
  excerptLength: number
  maxAllowedLength: number
}

interface ComplianceRule {
  id: string
  name: string
  description: string
  maxExcerptLength: number
  requiresAttribution: boolean
  allowedUsages: string[]
  restrictions: string[]
}

interface ContentUsage {
  contentId: string
  sourceId: string
  excerptText: string
  usageContext: string
  timestamp: Date
  complianceStatus: 'compliant' | 'review_needed' | 'violation'
  reviewNotes?: string
}

export class LegalComplianceManager {
  private attributions: Map<string, LegalAttribution> = new Map()
  private complianceRules: Map<string, ComplianceRule> = new Map()
  private usageLog: ContentUsage[] = []

  constructor() {
    this.initializeComplianceRules()
  }

  private initializeComplianceRules(): void {
    // Fair use guidelines for educational content
    this.complianceRules.set('fair_use_educational', {
      id: 'fair_use_educational',
      name: 'Fair Use - Educational Purpose',
      description: 'Content used for educational purposes under fair use doctrine',
      maxExcerptLength: 500, // words
      requiresAttribution: true,
      allowedUsages: ['educational', 'excerpt', 'reference'],
      restrictions: [
        'No commercial use',
        'Must include attribution',
        'Limited excerpt length',
        'Transformative educational purpose',
      ],
    })

    // Technical standards and codes
    this.complianceRules.set('technical_standards', {
      id: 'technical_standards',
      name: 'Technical Standards Reference',
      description: 'References to public technical standards and building codes',
      maxExcerptLength: 200, // words
      requiresAttribution: true,
      allowedUsages: ['reference', 'citation'],
      restrictions: [
        'Reference only, not full reproduction',
        'Must include official source citation',
        'No modification of original text',
      ],
    })

    // Manufacturer documentation
    this.complianceRules.set('manufacturer_docs', {
      id: 'manufacturer_docs',
      name: 'Manufacturer Technical Documentation',
      description: 'Technical installation and specification guides from manufacturers',
      maxExcerptLength: 300, // words
      requiresAttribution: true,
      allowedUsages: ['educational', 'excerpt'],
      restrictions: [
        'Must credit manufacturer',
        'Educational use only',
        'No redistribution of complete manuals',
        'Encourage users to reference original documentation',
      ],
    })
  }

  // Register a content source with legal attribution
  registerContentSource(attribution: Omit<LegalAttribution, 'sourceId'>): string {
    const sourceId = this.generateSourceId(attribution.title, attribution.publisher)
    
    const completeAttribution: LegalAttribution = {
      ...attribution,
      sourceId,
    }

    this.attributions.set(sourceId, completeAttribution)
    return sourceId
  }

  // Check if content usage complies with legal requirements
  checkCompliance(
    sourceId: string, 
    excerptText: string, 
    usageContext: string
  ): { 
    compliant: boolean
    issues: string[]
    recommendations: string[]
    attribution: string
  } {
    const attribution = this.attributions.get(sourceId)
    if (!attribution) {
      return {
        compliant: false,
        issues: ['Source not registered for legal compliance'],
        recommendations: ['Register content source with proper attribution'],
        attribution: '',
      }
    }

    const issues: string[] = []
    const recommendations: string[] = []

    // Check excerpt length
    const wordCount = this.countWords(excerptText)
    if (wordCount > attribution.maxAllowedLength) {
      issues.push(`Excerpt too long: ${wordCount} words exceeds limit of ${attribution.maxAllowedLength}`)
      recommendations.push('Reduce excerpt length or use multiple smaller excerpts')
    }

    // Validate usage type
    const rule = this.getApplicableRule(attribution)
    if (rule && !rule.allowedUsages.includes(attribution.usageType)) {
      issues.push(`Usage type '${attribution.usageType}' not allowed for this content`)
      recommendations.push(`Use one of: ${rule.allowedUsages.join(', ')}`)
    }

    // Generate attribution text
    const attributionText = this.generateAttributionText(attribution)

    // Log usage
    this.logUsage({
      contentId: this.generateContentId(excerptText),
      sourceId,
      excerptText: excerptText.substring(0, 200) + '...',
      usageContext,
      timestamp: new Date(),
      complianceStatus: issues.length > 0 ? 'review_needed' : 'compliant',
      reviewNotes: issues.length > 0 ? issues.join('; ') : undefined,
    })

    return {
      compliant: issues.length === 0,
      issues,
      recommendations,
      attribution: attributionText,
    }
  }

  // Generate proper attribution text
  generateAttributionText(attribution: LegalAttribution): string {
    let attributionText = ''

    // Basic attribution format
    attributionText += `Source: "${attribution.title}"`
    
    if (attribution.author) {
      attributionText += ` by ${attribution.author}`
    }
    
    attributionText += `, ${attribution.publisher}`
    
    if (attribution.publicationDate) {
      attributionText += ` (${attribution.publicationDate.getFullYear()})`
    }

    // Add copyright notice
    if (attribution.copyright) {
      attributionText += `. ${attribution.copyright}`
    }

    // Add URL if available
    if (attribution.url) {
      attributionText += `. Available at: ${attribution.url}`
    }

    // Add fair use notice for educational content
    if (attribution.usageType === 'educational') {
      attributionText += '. Used under fair use for educational purposes.'
    }

    return attributionText
  }

  // Create content attribution for AI responses
  createContentAttribution(sourceIds: string[]): string {
    if (sourceIds.length === 0) {
      return ''
    }

    let attribution = '\n\n---\n**Sources:**\n'

    sourceIds.forEach((sourceId, index) => {
      const source = this.attributions.get(sourceId)
      if (source) {
        attribution += `${index + 1}. ${this.generateAttributionText(source)}\n`
      }
    })

    attribution += '\n*This content is used for educational purposes under fair use guidelines. '
    attribution += 'Please refer to original manufacturer documentation for complete installation instructions and warranty information.*'

    return attribution
  }

  // Register common plumbing industry sources
  initializeIndustrySources(): void {
    // Canadian National Plumbing Code
    this.registerContentSource({
      title: 'National Plumbing Code of Canada 2020',
      publisher: 'National Research Council Canada',
      copyright: '© 2020 National Research Council Canada',
      url: 'https://nrc-publications.canada.ca/',
      fairUseJustification: 'Educational reference to public building code standards',
      usageType: 'reference',
      excerptLength: 0,
      maxAllowedLength: 200,
    })

    // International Plumbing Code
    this.registerContentSource({
      title: 'International Plumbing Code 2021',
      publisher: 'International Code Council',
      copyright: '© 2021 International Code Council',
      fairUseJustification: 'Educational reference to public building code standards',
      usageType: 'reference',
      excerptLength: 0,
      maxAllowedLength: 200,
    })

    // Major manufacturer placeholders (to be updated with actual sources)
    const manufacturers = [
      { name: 'Viega', description: 'PEX and ProPress Installation Guides' },
      { name: 'NIBCO', description: 'PVC and Copper Fitting Manuals' },
      { name: 'Kohler', description: 'Fixture Installation Guides' },
      { name: 'RIDGID', description: 'Tool Operation Manuals' },
      { name: 'Fernco', description: 'Flexible Coupling Installation Guides' },
    ]

    manufacturers.forEach(mfg => {
      this.registerContentSource({
        title: `${mfg.name} Technical Documentation`,
        publisher: mfg.name,
        copyright: `© ${new Date().getFullYear()} ${mfg.name}`,
        fairUseJustification: 'Educational excerpts from manufacturer technical documentation for training purposes',
        usageType: 'educational',
        excerptLength: 0,
        maxAllowedLength: 300,
      })
    })
  }

  // Generate compliance report
  generateComplianceReport(): {
    totalSources: number
    totalUsages: number
    complianceRate: number
    riskySources: string[]
    recommendations: string[]
  } {
    const totalUsages = this.usageLog.length
    const compliantUsages = this.usageLog.filter(u => u.complianceStatus === 'compliant').length
    const complianceRate = totalUsages > 0 ? (compliantUsages / totalUsages) * 100 : 100

    // Identify sources with compliance issues
    const riskySources: string[] = []
    const usagesBySource = this.groupUsagesBySource()
    
    for (const [sourceId, usages] of usagesBySource) {
      const issues = usages.filter((u: any) => u.complianceStatus !== 'compliant').length
      if (issues > 0) {
        const source = this.attributions.get(sourceId)
        riskySources.push(`${source?.title || sourceId}: ${issues} compliance issues`)
      }
    }

    const recommendations: string[] = []
    if (complianceRate < 95) {
      recommendations.push('Review and update content excerpts to ensure compliance')
    }
    if (riskySources.length > 0) {
      recommendations.push('Address compliance issues with flagged sources')
    }
    recommendations.push('Regularly update attribution information and copyright notices')
    recommendations.push('Encourage users to reference original manufacturer documentation')

    return {
      totalSources: this.attributions.size,
      totalUsages,
      complianceRate: Math.round(complianceRate * 100) / 100,
      riskySources,
      recommendations,
    }
  }

  // Helper methods
  private generateSourceId(title: string, publisher: string): string {
    return `${publisher.toLowerCase().replace(/\s+/g, '_')}_${title.toLowerCase().replace(/\s+/g, '_')}`
      .substring(0, 50)
  }

  private generateContentId(text: string): string {
    return `content_${Date.now()}_${text.substring(0, 20).replace(/\s+/g, '_')}`
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).length
  }

  private getApplicableRule(attribution: LegalAttribution): ComplianceRule | undefined {
    // Determine which compliance rule applies based on content type
    if (attribution.publisher.toLowerCase().includes('code') || 
        attribution.title.toLowerCase().includes('code')) {
      return this.complianceRules.get('technical_standards')
    }
    
    if (attribution.usageType === 'educational') {
      return this.complianceRules.get('fair_use_educational')
    }

    return this.complianceRules.get('manufacturer_docs')
  }

  private logUsage(usage: ContentUsage): void {
    this.usageLog.push(usage)
    
    // Keep log size manageable
    if (this.usageLog.length > 1000) {
      this.usageLog = this.usageLog.slice(-800) // Keep most recent 800 entries
    }
  }

  private groupUsagesBySource(): Map<string, ContentUsage[]> {
    const grouped = new Map<string, ContentUsage[]>()
    
    for (const usage of this.usageLog) {
      if (!grouped.has(usage.sourceId)) {
        grouped.set(usage.sourceId, [])
      }
      grouped.get(usage.sourceId)!.push(usage)
    }
    
    return grouped
  }

  // Export compliance data for auditing
  exportComplianceData(): string {
    return JSON.stringify({
      attributions: Array.from(this.attributions.entries()),
      complianceRules: Array.from(this.complianceRules.entries()),
      usageLog: this.usageLog.slice(-100), // Most recent 100 usages
      generatedAt: new Date().toISOString(),
    }, null, 2)
  }

  // Update attribution for a source
  updateAttribution(sourceId: string, updates: Partial<LegalAttribution>): boolean {
    const existing = this.attributions.get(sourceId)
    if (!existing) {
      return false
    }

    this.attributions.set(sourceId, { ...existing, ...updates })
    return true
  }

  // Get all registered sources
  getAllSources(): LegalAttribution[] {
    return Array.from(this.attributions.values())
  }

  // Check if source is registered
  isSourceRegistered(sourceId: string): boolean {
    return this.attributions.has(sourceId)
  }
}

// Export the compliance manager instance
export const legalCompliance = new LegalComplianceManager()

// Initialize with common industry sources
legalCompliance.initializeIndustrySources()

export type {
  LegalAttribution,
  ComplianceRule,
  ContentUsage,
}