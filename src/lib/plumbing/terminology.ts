import { PLUMBING_TERMINOLOGY } from '@/types/plumbing'

export interface TerminologyMatch {
  term: string
  definition: string
  context: string
  relatedTerms: string[]
}

export class PlumbingTerminology {
  /**
   * Extracts plumbing terminology from user query
   */
  static extractTerms(query: string): TerminologyMatch[] {
    const lowerQuery = query.toLowerCase()
    const matches: TerminologyMatch[] = []
    
    Object.entries(PLUMBING_TERMINOLOGY).forEach(([term, definition]) => {
      if (lowerQuery.includes(term.toLowerCase())) {
        matches.push({
          term,
          definition: definition as string,
          context: this.getContext(term, query),
          relatedTerms: this.getRelatedTerms(term)
        })
      }
    })
    
    return matches
  }
  
  /**
   * Gets context for how the term is being used
   */
  private static getContext(term: string, query: string): string {
    const lowerQuery = query.toLowerCase()
    const lowerTerm = term.toLowerCase()
    
    if (lowerQuery.includes(`install ${lowerTerm}`) || lowerQuery.includes(`installing ${lowerTerm}`)) {
      return 'installation'
    }
    if (lowerQuery.includes(`fix ${lowerTerm}`) || lowerQuery.includes(`repair ${lowerTerm}`)) {
      return 'repair'
    }
    if (lowerQuery.includes(`size ${lowerTerm}`) || lowerQuery.includes(`sizing ${lowerTerm}`)) {
      return 'sizing'
    }
    if (lowerQuery.includes(`what is ${lowerTerm}`) || lowerQuery.includes(`what's ${lowerTerm}`)) {
      return 'definition'
    }
    
    return 'general'
  }
  
  /**
   * Gets related terms for cross-referencing
   */
  private static getRelatedTerms(term: string): string[] {
    const relations: Record<string, string[]> = {
      'flange': ['toilet', 'mounting', 'seal'],
      'p-trap': ['drain', 'sewer gas', 'water seal'],
      'coupling': ['pipe', 'connection', 'fitting'],
      'elbow': ['pipe', 'direction', 'fitting'],
      'tee': ['pipe', 'branch', 'fitting'],
      'pipe wrench': ['threading', 'grip', 'turning'],
      'sweated joint': ['copper', 'solder', 'flux'],
      'threaded joint': ['threads', 'pipe dope', 'NPT'],
      'compression fitting': ['ferrule', 'mechanical', 'removable']
    }
    
    return relations[term] || []
  }
  
  /**
   * Provides educational content for a specific term
   */
  static getEducationalContent(term: string): {
    definition: string
    applications: string[]
    installation: string[]
    codes: string[]
    safety: string[]
  } {
    const educationalContent: Record<string, any> = {
      'flange': {
        definition: PLUMBING_TERMINOLOGY.flange,
        applications: [
          'Toilet mounting to floor and drain',
          'Pipe connections requiring solid mounting',
          'Sealing between different materials'
        ],
        installation: [
          'Ensure flange sits level on finished floor',
          'Use appropriate screws for floor type',
          'Check for proper seal with wax ring',
          'Verify drain pipe is cut to correct height'
        ],
        codes: [
          'IPC 405.3.1: Must be installed level and secure',
          'Height must allow proper toilet seal',
          'Minimum 4 securing screws required'
        ],
        safety: [
          'Wear eye protection when cutting',
          'Check for electrical wires before drilling',
          'Ensure proper support before working'
        ]
      },
      
      'p-trap': {
        definition: PLUMBING_TERMINOLOGY['p-trap'],
        applications: [
          'Every drain fixture must have a trap',
          'Prevents sewer gas from entering building',
          'Maintains water seal in drainage system'
        ],
        installation: [
          'Install with proper fall toward drain',
          'Ensure trap seal is 2-4 inches deep',
          'Use proper slip joint washers',
          'Hand tighten plus 1/4 turn with pliers'
        ],
        codes: [
          'IPC 1002.1: Each fixture requires water seal trap',
          'Trap seal depth: 2" minimum, 4" maximum',
          'Must be accessible for cleaning'
        ],
        safety: [
          'Trapped water may contain bacteria',
          'Don\'t overtighten connections',
          'Provide proper support for trap assembly'
        ]
      },
      
      'pipe wrench': {
        definition: PLUMBING_TERMINOLOGY['pipe wrench'],
        applications: [
          'Gripping and turning threaded pipes',
          'Installing and removing pipe fittings',
          'Working with iron and steel pipe'
        ],
        installation: [
          'Use two wrenches for leverage and control',
          'Grip close to fitting being turned',
          'Apply steady pressure, not sudden force',
          'Clean jaws regularly for better grip'
        ],
        codes: [
          'Use proper tools for each material type',
          'Threaded connections per ASTM standards'
        ],
        safety: [
          'Maintain secure grip to prevent slipping',
          'Keep fingers clear of moving parts',
          'Use appropriate size for pipe diameter',
          'Wear safety glasses when under pressure'
        ]
      }
    }
    
    return educationalContent[term] || {
      definition: PLUMBING_TERMINOLOGY[term as keyof typeof PLUMBING_TERMINOLOGY] || 'Term not found',
      applications: [],
      installation: [],
      codes: [],
      safety: []
    }
  }
  
  /**
   * Suggests related questions based on terminology
   */
  static suggestQuestions(terms: string[]): string[] {
    const suggestions: string[] = []
    
    terms.forEach(term => {
      switch (term) {
        case 'flange':
          suggestions.push(
            'How do I install a toilet flange?',
            'What height should a toilet flange be?',
            'How do I remove a broken toilet flange?'
          )
          break
          
        case 'p-trap':
          suggestions.push(
            'How to fix a P-trap leak?',
            'What size P-trap do I need?',
            'How to clean a P-trap?'
          )
          break
          
        case 'pipe':
          suggestions.push(
            'What size pipe for kitchen sink?',
            'How to cut copper pipe?',
            'What\'s the difference between PVC and ABS?'
          )
          break
          
        default:
          suggestions.push(
            `How to install ${term}?`,
            `What are the code requirements for ${term}?`
          )
      }
    })
    
    return Array.from(new Set(suggestions)).slice(0, 3) // Remove duplicates and limit to 3
  }
  
  /**
   * Provides autocomplete suggestions for plumbing terms
   */
  static getAutocompleteSuggestions(input: string): string[] {
    const lowerInput = input.toLowerCase()
    
    return Object.keys(PLUMBING_TERMINOLOGY)
      .filter(term => term.toLowerCase().includes(lowerInput))
      .sort((a, b) => {
        // Prioritize exact matches at the beginning
        const aStarts = a.toLowerCase().startsWith(lowerInput)
        const bStarts = b.toLowerCase().startsWith(lowerInput)
        
        if (aStarts && !bStarts) return -1
        if (!aStarts && bStarts) return 1
        
        return a.localeCompare(b)
      })
      .slice(0, 10)
  }
}

export default PlumbingTerminology