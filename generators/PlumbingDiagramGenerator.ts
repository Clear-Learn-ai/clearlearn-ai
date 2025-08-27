import { 
  PlumbingLearningContent, 
  PlumbingInstallation, 
  PlumbingComponent, 
  PlumbingTool, 
  SAMPLE_PLUMBING_QUESTIONS,
  PLUMBING_TERMINOLOGY,
  PlumbingSkillLevel
} from '@/types/plumbing'

export class PlumbingDiagramGenerator {
  
  /**
   * Analyzes a user query to determine plumbing content type and skill level
   */
  static analyzeQuery(query: string): {
    contentType: string
    skillLevel: PlumbingSkillLevel
    components: string[]
    keywords: string[]
  } {
    const lowerQuery = query.toLowerCase()
    
    // Determine skill level
    let skillLevel: PlumbingSkillLevel = 'beginner'
    
    if (lowerQuery.includes('install') || lowerQuery.includes('size') || lowerQuery.includes('code')) {
      skillLevel = 'intermediate'
    }
    if (lowerQuery.includes('design') || lowerQuery.includes('calculate') || lowerQuery.includes('system')) {
      skillLevel = 'advanced'
    }
    
    // Determine content type
    let contentType = 'step-by-step'
    
    if (lowerQuery.includes('show') || lowerQuery.includes('visualize') || lowerQuery.includes('model')) {
      contentType = '3d-visualization'
    }
    if (lowerQuery.includes('code') || lowerQuery.includes('requirement')) {
      contentType = 'code-reference'
    }
    if (lowerQuery.includes('fix') || lowerQuery.includes('repair') || lowerQuery.includes('troubleshoot')) {
      contentType = 'troubleshooting'
    }
    
    // Extract plumbing components and terms
    const components: string[] = []
    const keywords: string[] = []
    
    Object.keys(PLUMBING_TERMINOLOGY).forEach(term => {
      if (lowerQuery.includes(term.toLowerCase())) {
        components.push(term)
        keywords.push(term)
      }
    })
    
    // Common plumbing components
    const commonComponents = [
      'pipe', 'flange', 'p-trap', 'elbow', 'tee', 'coupling', 'valve', 
      'toilet', 'sink', 'faucet', 'drain', 'vent', 'water heater'
    ]
    
    commonComponents.forEach(component => {
      if (lowerQuery.includes(component)) {
        components.push(component)
      }
    })
    
    return { contentType, skillLevel, components, keywords }
  }
  
  /**
   * Generates plumbing learning content based on query analysis
   */
  static generateContent(query: string): PlumbingLearningContent {
    const analysis = this.analyzeQuery(query)
    
    // Generate content based on common queries
    if (query.toLowerCase().includes('toilet flange')) {
      return this.generateToiletFlangeContent()
    }
    
    if (query.toLowerCase().includes('p-trap')) {
      return this.generatePTrapContent()
    }
    
    if (query.toLowerCase().includes('pipe size') || query.toLowerCase().includes('kitchen sink')) {
      return this.generatePipeSizingContent()
    }
    
    if (query.toLowerCase().includes('joint') || query.toLowerCase().includes('connection')) {
      return this.generateJointTypesContent()
    }
    
    // Default generic plumbing content
    return this.generateGenericPlumbingContent(analysis)
  }
  
  /**
   * Generates toilet flange installation content
   */
  private static generateToiletFlangeContent(): PlumbingLearningContent {
    const installation: PlumbingInstallation = {
      id: 'toilet-flange-install',
      title: 'How to Install a Toilet Flange',
      difficulty: 'intermediate',
      timeEstimate: '2-3 hours',
      tools: [
        {
          id: 'saw',
          name: 'PVC Pipe Saw',
          category: 'cutting',
          description: 'For cutting drain pipe to proper length',
          uses: ['Cutting PVC pipe', 'Trimming existing pipes'],
          safetyNotes: ['Wear eye protection', 'Ensure clean, square cuts']
        },
        {
          id: 'screwdriver',
          name: 'Screwdriver Set',
          category: 'specialty',
          description: 'For securing flange screws',
          uses: ['Installing flange screws', 'General assembly'],
          safetyNotes: ['Use proper size to avoid stripping screws']
        }
      ],
      materials: [
        {
          id: 'flange',
          name: 'Toilet Flange',
          category: 'fitting',
          material: 'pvc',
          size: '4"',
          description: 'Connects toilet to drain pipe and floor',
          commonUses: ['Toilet installation', 'Floor mounting'],
          codeReferences: ['IPC 405.3.1']
        }
      ],
      steps: [
        {
          id: 'step1',
          title: 'Measure and Mark',
          description: 'Measure the drain pipe and mark the proper height for the flange. The flange should sit on top of the finished floor.',
          visualType: '3d-model',
          visualContent: 'toilet-flange-measuring',
          tools: ['measuring tape'],
          tips: ['Flange should be 1/4" above finished floor for proper seal'],
          codeNotes: ['IPC requires proper height for seal integrity']
        },
        {
          id: 'step2',
          title: 'Cut Pipe to Length',
          description: 'Cut the drain pipe to the proper length using a PVC saw. Ensure the cut is square and clean.',
          visualType: '3d-model',
          visualContent: 'pipe-cutting',
          tools: ['PVC saw', 'sandpaper'],
          warnings: ['Wear eye protection when cutting'],
          tips: ['Sand the cut end smooth to ensure proper fit']
        },
        {
          id: 'step3',
          title: 'Install Flange',
          description: 'Place the flange over the pipe and secure to the floor with appropriate screws.',
          visualType: '3d-model',
          visualContent: 'flange-installation',
          tools: ['screwdriver', 'drill'],
          materials: ['flange screws'],
          codeNotes: ['Secure with minimum 4 screws as per code']
        }
      ],
      codeRequirements: [
        {
          jurisdiction: 'IPC',
          section: '405.3.1',
          requirement: 'Toilet flange must be installed level and secured to floor structure',
          rationale: 'Ensures proper seal and prevents toilet movement'
        }
      ],
      safetyWarnings: [
        'Wear eye protection when cutting pipes',
        'Ensure proper ventilation when working with solvents',
        'Check for electrical wires before drilling into floor'
      ],
      commonMistakes: [
        'Installing flange below floor level',
        'Not checking that flange is level',
        'Using wrong size screws for floor type'
      ]
    }
    
    return {
      id: 'toilet-flange-content',
      title: 'Toilet Flange Installation Guide',
      category: 'installation',
      difficulty: 'intermediate',
      contentType: '3d-visualization',
      learningObjectives: [
        'Understand proper toilet flange height',
        'Learn to cut drain pipe to correct length',
        'Master secure flange installation techniques'
      ],
      prerequisites: ['Basic plumbing knowledge', 'Tool safety'],
      estimatedTime: '30 minutes',
      content: installation
    }
  }
  
  /**
   * Generates P-trap content
   */
  private static generatePTrapContent(): PlumbingLearningContent {
    const installation: PlumbingInstallation = {
      id: 'p-trap-repair',
      title: 'How to Fix a P-Trap Leak',
      difficulty: 'beginner',
      timeEstimate: '30-60 minutes',
      tools: [
        {
          id: 'channel-locks',
          name: 'Channel Lock Pliers',
          category: 'specialty',
          description: 'For gripping and turning pipe fittings',
          uses: ['Tightening connections', 'Removing old fittings'],
          safetyNotes: ['Grip firmly but don\'t overtighten']
        }
      ],
      materials: [
        {
          id: 'p-trap',
          name: 'P-Trap Assembly',
          category: 'fitting',
          material: 'pvc',
          size: '1-1/4"',
          description: 'U-shaped trap that prevents sewer gas entry',
          commonUses: ['Sink drainage', 'Preventing gas backup'],
          codeReferences: ['IPC 1002.1']
        }
      ],
      steps: [
        {
          id: 'step1',
          title: 'Locate the Leak',
          description: 'Identify where the P-trap is leaking - usually at connections or in the curved section.',
          visualType: '3d-model',
          visualContent: 'p-trap-inspection',
          tips: ['Look for water stains or active dripping'],
          warnings: ['Turn off water supply before starting work']
        },
        {
          id: 'step2',
          title: 'Disassemble P-Trap',
          description: 'Carefully remove the P-trap by loosening the slip nuts at both ends.',
          visualType: '3d-model',
          visualContent: 'p-trap-removal',
          tools: ['channel locks'],
          tips: ['Place bucket underneath to catch water'],
          warnings: ['Trapped water will spill out']
        },
        {
          id: 'step3',
          title: 'Clean and Inspect',
          description: 'Clean the trap and inspect all washers and connections for damage.',
          visualType: 'diagram',
          visualContent: 'p-trap-parts',
          tips: ['Replace rubber washers if cracked or deformed'],
          materials: ['replacement washers']
        },
        {
          id: 'step4',
          title: 'Reassemble',
          description: 'Reassemble the P-trap with new washers, hand-tighten connections.',
          visualType: '3d-model',
          visualContent: 'p-trap-assembly',
          tools: ['channel locks'],
          tips: ['Hand-tight plus 1/4 turn with pliers'],
          warnings: ['Don\'t overtighten - can crack fittings']
        }
      ],
      codeRequirements: [
        {
          jurisdiction: 'IPC',
          section: '1002.1',
          requirement: 'Each fixture must have a water seal trap',
          rationale: 'Prevents sewer gas from entering building'
        }
      ],
      safetyWarnings: [
        'Water may contain bacteria - wash hands thoroughly',
        'Don\'t overtighten fittings'
      ],
      commonMistakes: [
        'Forgetting to replace washers',
        'Overtightening connections',
        'Not checking for proper trap seal'
      ]
    }
    
    return {
      id: 'p-trap-content',
      title: 'P-Trap Leak Repair Guide',
      category: 'repair',
      difficulty: 'beginner',
      contentType: '3d-visualization',
      learningObjectives: [
        'Identify P-trap leak sources',
        'Learn proper disassembly techniques',
        'Master reassembly with proper torque'
      ],
      estimatedTime: '20 minutes',
      content: installation
    }
  }
  
  /**
   * Generates pipe sizing content
   */
  private static generatePipeSizingContent(): PlumbingLearningContent {
    const component: PlumbingComponent = {
      id: 'kitchen-sink-sizing',
      name: 'Kitchen Sink Pipe Sizing',
      category: 'pipe',
      material: 'copper',
      size: '1/2" supply, 1-1/2" drain',
      description: 'Proper pipe sizing for kitchen sink installation',
      commonUses: ['Kitchen sink installation', 'Supply line sizing'],
      codeReferences: ['IPC Table 604.5'],
      installationSteps: [
        'Supply lines: 1/2" copper or PEX for hot and cold',
        'Drain line: 1-1/2" minimum diameter',
        'Vent: 1-1/2" or larger depending on fixture units'
      ]
    }
    
    return {
      id: 'pipe-sizing-content',
      title: 'Kitchen Sink Pipe Sizing Guide',
      category: 'code',
      difficulty: 'intermediate',
      contentType: 'code-reference',
      learningObjectives: [
        'Understand code requirements for pipe sizing',
        'Learn fixture unit calculations',
        'Master proper supply and drain sizing'
      ],
      estimatedTime: '15 minutes',
      content: component
    }
  }
  
  /**
   * Generates joint types content
   */
  private static generateJointTypesContent(): PlumbingLearningContent {
    return {
      id: 'joint-types-content',
      title: 'Plumbing Joint Types and Applications',
      category: 'installation',
      difficulty: 'intermediate',
      contentType: '3d-visualization',
      learningObjectives: [
        'Identify different joint types',
        'Understand applications for each joint',
        'Learn proper installation techniques'
      ],
      estimatedTime: '25 minutes',
      content: {
        id: 'joint-types-system',
        name: 'Plumbing Joint Types',
        type: 'mixed' as const,
        components: [
          {
            id: 'sweated-joint',
            name: 'Sweated (Soldered) Joint',
            category: 'fitting' as const,
            material: 'copper' as const,
            size: 'Various',
            description: 'Permanent joint using solder and flux for copper pipes',
            commonUses: ['Copper pipe connections', 'Permanent installations'],
            installationSteps: [
              'Clean pipe ends with emery cloth',
              'Apply flux to both surfaces',
              'Heat joint with torch',
              'Apply solder when flux bubbles'
            ]
          },
          {
            id: 'threaded-joint',
            name: 'Threaded Joint',
            category: 'fitting' as const,
            material: 'steel' as const,
            size: 'NPT threads',
            description: 'Mechanical joint using threaded connections',
            commonUses: ['Gas lines', 'Removable connections'],
            installationSteps: [
              'Cut threads on pipe end',
              'Apply pipe dope or Teflon tape',
              'Hand tighten connection',
              'Wrench tighten 1-2 additional turns'
            ]
          },
          {
            id: 'compression-joint',
            name: 'Compression Fitting',
            category: 'fitting' as const,
            material: 'other' as const,
            size: 'Various',
            description: 'Mechanical joint using compression ferrule',
            commonUses: ['Fixture connections', 'Repair work'],
            installationSteps: [
              'Cut pipe square and clean',
              'Slide nut and ferrule onto pipe',
              'Insert pipe into fitting body',
              'Tighten compression nut'
            ]
          }
        ],
        flowDiagram: 'joint-types-comparison',
        codeRequirements: [
          {
            jurisdiction: 'IPC',
            section: '605.0',
            requirement: 'Joints must be made with approved methods and materials',
            rationale: 'Ensures system integrity and safety'
          }
        ]
      }
    }
  }
  
  /**
   * Generates generic plumbing content based on analysis
   */
  private static generateGenericPlumbingContent(analysis: any): PlumbingLearningContent {
    // Return appropriate content based on skill level
    const questions = SAMPLE_PLUMBING_QUESTIONS[analysis.skillLevel as keyof typeof SAMPLE_PLUMBING_QUESTIONS]
    const sampleQuestion = questions[Math.floor(Math.random() * questions.length)]
    
    return {
      id: 'generic-plumbing-content',
      title: `Plumbing Guide: ${analysis.components.join(', ') || 'General Information'}`,
      category: 'installation',
      difficulty: analysis.skillLevel,
      contentType: analysis.contentType as any,
      learningObjectives: [
        'Understand basic plumbing principles',
        'Learn proper installation techniques',
        'Follow code requirements'
      ],
      estimatedTime: '20 minutes',
      content: {
        id: 'basic-plumbing',
        title: 'Basic Plumbing Concepts',
        difficulty: analysis.skillLevel,
        timeEstimate: '1-2 hours',
        tools: [],
        materials: [],
        steps: [
          {
            id: 'step1',
            title: 'Understanding Your Question',
            description: `Based on your question about "${analysis.components.join(', ')}", here's what you need to know about plumbing systems.`,
            visualType: 'diagram',
            visualContent: 'plumbing-basics',
            tips: [`Try asking: "${sampleQuestion}"`]
          }
        ],
        codeRequirements: [],
        safetyWarnings: [
          'Always follow local plumbing codes',
          'Turn off water supply before starting work',
          'Wear appropriate safety equipment'
        ],
        commonMistakes: [
          'Not checking local code requirements',
          'Rushing the installation process'
        ]
      }
    }
  }
}

export default PlumbingDiagramGenerator