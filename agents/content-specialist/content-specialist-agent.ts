import { Agent, AgentCapabilities } from '../orchestrator/base-agent.js';
import { 
  AgentType, 
  AgentMessage, 
  ContentSpecialistPayload,
  OrganicChemistryContext,
  ChemistryTopic,
  Priority
} from '../shared/types/agent-types.js';
import { AgentMessageBus } from '../shared/protocols/message-bus.js';
import { MCPServiceLayer } from '../shared/protocols/mcp-service-layer.js';

/**
 * Content Specialist Agent
 * 
 * Specialized in organic chemistry knowledge and concept explanation.
 * Provides deep subject matter expertise for educational content.
 */
export class ContentSpecialistAgent extends Agent {
  private knowledgeBase: ChemistryKnowledgeBase;
  private conceptGraph: ConceptGraph;

  constructor(messageBus: AgentMessageBus, mcpService: MCPServiceLayer) {
    super(AgentType.CONTENT_SPECIALIST, messageBus, mcpService, {
      maxConcurrentTasks: 3,
      timeout: 45000,
      mcpTools: ['ai_query_claude', 'video_search_youtube', 'fs_read_file']
    });
    
    this.knowledgeBase = new ChemistryKnowledgeBase();
    this.conceptGraph = new ConceptGraph();
  }

  async processMessage(message: AgentMessage): Promise<AgentMessage> {
    const payload = message.payload as ContentSpecialistPayload;
    
    switch (payload.type) {
      case 'explain_concept':
        return await this.explainConcept(payload, message);
      case 'validate_information':
        return await this.validateInformation(payload, message);
      case 'analyze_prerequisites':
        return await this.analyzePrerequisites(payload, message);
      case 'suggest_pathway':
        return await this.suggestLearningPathway(payload, message);
      default:
        throw new Error(`Unsupported content specialist operation: ${payload.type}`);
    }
  }

  getCapabilities(): AgentCapabilities {
    return {
      canExplainConcepts: true,
      canCreateVisualizations: false,
      canGenerateAssessments: false,
      canSearchResources: true,
      canAnalyzeLearning: true,
      canManageConversations: false,
      supportedTopics: [
        'alkanes', 'alkenes', 'alkynes', 'aromatic', 'stereochemistry',
        'substitution', 'elimination', 'addition', 'oxidation-reduction',
        'spectroscopy', 'synthesis', 'biomolecules'
      ],
      supportedModalities: ['text', 'structured-explanation', 'concept-hierarchy'],
      maxComplexity: 5
    };
  }

  // Explain a concept with deep chemical knowledge
  private async explainConcept(
    payload: ContentSpecialistPayload, 
    originalMessage: AgentMessage
  ): Promise<AgentMessage> {
    const concept = payload.concept || payload.query;
    if (!concept) {
      throw new Error('No concept specified for explanation');
    }

    // Get concept context from knowledge base
    const conceptContext = this.knowledgeBase.getConceptContext(concept);
    
    // Build comprehensive explanation prompt
    const explanationPrompt = this.buildExplanationPrompt(
      concept,
      conceptContext,
      payload.difficultyLevel || 'intermediate'
    );

    // Query AI for detailed explanation
    const aiResponse = await this.queryAI('claude', explanationPrompt, {
      concept,
      difficulty: payload.difficultyLevel,
      context: conceptContext
    });

    // Enhance explanation with structured knowledge
    const enhancedExplanation = await this.enhanceExplanation(
      aiResponse.response,
      conceptContext
    );

    // Find related videos for visual learning
    const relatedVideos = await this.findRelatedVideos(concept);

    // Get prerequisites and next steps
    const prerequisites = this.conceptGraph.getPrerequisites(concept);
    const nextSteps = this.conceptGraph.getNextConcepts(concept);

    // Track learning analytics
    await this.trackEvent('concept_explained', {
      concept,
      difficulty: payload.difficultyLevel,
      hasPrerequisites: prerequisites.length > 0,
      explanationLength: enhancedExplanation.length
    });

    return {
      id: `content_resp_${Date.now()}`,
      timestamp: new Date(),
      sender: this.agentType,
      recipient: originalMessage.sender,
      messageType: originalMessage.messageType,
      payload: {
        explanation: enhancedExplanation,
        conceptContext,
        prerequisites,
        nextSteps,
        relatedVideos: relatedVideos.videos.slice(0, 3),
        confidence: aiResponse.confidence || 0.8,
        sources: ['chemistry_knowledge_base', 'ai_explanation', 'video_search'],
        metadata: {
          difficulty: payload.difficultyLevel,
          topic: conceptContext.topic,
          conceptsExplained: [concept, ...conceptContext.relatedConcepts]
        }
      },
      priority: originalMessage.priority || Priority.MEDIUM
    };
  }

  // Validate chemical information for accuracy
  private async validateInformation(
    payload: ContentSpecialistPayload,
    originalMessage: AgentMessage
  ): Promise<AgentMessage> {
    const data = payload.validationData;
    
    // Cross-reference with knowledge base
    const knowledgeValidation = this.knowledgeBase.validateInformation(data);
    
    // Get AI validation for complex concepts
    const validationPrompt = `
      Validate the following chemical information for accuracy:
      ${JSON.stringify(data, null, 2)}
      
      Check for:
      1. Chemical accuracy
      2. Nomenclature correctness
      3. Mechanism validity
      4. Common misconceptions
      5. Safety considerations
    `;

    const aiValidation = await this.queryAI('claude', validationPrompt);

    return {
      id: `validation_resp_${Date.now()}`,
      timestamp: new Date(),
      sender: this.agentType,
      recipient: originalMessage.sender,
      messageType: originalMessage.messageType,
      payload: {
        isValid: knowledgeValidation.isValid && !aiValidation.response.includes('incorrect'),
        knowledgeValidation,
        aiValidation: aiValidation.response,
        corrections: knowledgeValidation.corrections,
        confidence: Math.min(knowledgeValidation.confidence, aiValidation.confidence || 0.8)
      },
      priority: originalMessage.priority || Priority.MEDIUM
    };
  }

  // Analyze learning prerequisites for a concept
  private async analyzePrerequisites(
    payload: ContentSpecialistPayload,
    originalMessage: AgentMessage
  ): Promise<AgentMessage> {
    const concept = payload.concept;
    if (!concept) {
      throw new Error('No concept specified for prerequisite analysis');
    }

    // Get prerequisites from concept graph
    const prerequisites = this.conceptGraph.getPrerequisites(concept);
    const conceptContext = this.knowledgeBase.getConceptContext(concept);
    
    // Analyze prerequisite gaps
    const userContext = payload.context;
    const gaps = this.analyzePrerequisiteGaps(prerequisites, userContext);

    // Generate learning sequence
    const learningSequence = this.generateLearningSequence(concept, gaps);

    return {
      id: `prereq_resp_${Date.now()}`,
      timestamp: new Date(),
      sender: this.agentType,
      recipient: originalMessage.sender,
      messageType: originalMessage.messageType,
      payload: {
        concept,
        prerequisites: prerequisites.map(p => ({
          concept: p,
          context: this.knowledgeBase.getConceptContext(p),
          importance: this.conceptGraph.getImportance(p, concept)
        })),
        gaps,
        learningSequence,
        estimatedTime: this.estimateLearningTime(learningSequence),
        recommendations: this.generateRecommendations(gaps, conceptContext)
      },
      priority: originalMessage.priority || Priority.MEDIUM
    };
  }

  // Suggest learning pathway for mastering concepts
  private async suggestLearningPathway(
    payload: ContentSpecialistPayload,
    originalMessage: AgentMessage
  ): Promise<AgentMessage> {
    const targetConcept = payload.concept;
    const context = payload.context;
    
    if (!targetConcept) {
      throw new Error('No target concept specified for pathway suggestion');
    }

    // Build complete learning pathway
    const pathway = this.conceptGraph.buildLearningPathway(targetConcept);
    
    // Customize based on user context
    const customizedPathway = this.customizePathway(pathway, context);
    
    // Add time estimates and difficulty progression
    const enhancedPathway = await this.enhancePathwayWithDetails(customizedPathway);

    return {
      id: `pathway_resp_${Date.now()}`,
      timestamp: new Date(),
      sender: this.agentType,
      recipient: originalMessage.sender,
      messageType: originalMessage.messageType,
      payload: {
        targetConcept,
        pathway: enhancedPathway,
        totalEstimatedTime: enhancedPathway.reduce((sum, step) => sum + step.estimatedTime, 0),
        difficultyProgression: enhancedPathway.map(step => step.difficulty),
        checkpoints: this.identifyCheckpoints(enhancedPathway),
        alternatives: this.generateAlternativePathways(targetConcept, context)
      },
      priority: originalMessage.priority || Priority.MEDIUM
    };
  }

  // Helper methods for concept explanation
  private buildExplanationPrompt(
    concept: string,
    context: OrganicChemistryContext,
    difficulty: string
  ): string {
    return `
      Explain the organic chemistry concept: "${concept}"
      
      Context:
      - Topic: ${context.topic}
      - Related concepts: ${context.relatedConcepts.join(', ')}
      - Prerequisites: ${context.prerequisites.join(', ')}
      - Difficulty level: ${difficulty}
      
      Please provide:
      1. Clear definition and explanation
      2. Key mechanisms or processes involved
      3. Real-world applications and examples
      4. Common student misconceptions to avoid
      5. Tips for remembering and understanding
      
      Tailor the explanation for ${difficulty} level students.
      Use clear, accessible language while maintaining scientific accuracy.
    `;
  }

  private async enhanceExplanation(
    explanation: string,
    context: OrganicChemistryContext
  ): Promise<string> {
    // Add structured information
    let enhanced = explanation;
    
    // Add mechanism steps if applicable
    if (context.topic === ChemistryTopic.SUBSTITUTION || 
        context.topic === ChemistryTopic.ELIMINATION) {
      enhanced += this.addMechanismSteps(context);
    }
    
    // Add safety considerations
    enhanced += this.addSafetyConsiderations(context);
    
    // Add memory aids
    enhanced += this.addMemoryAids(context);
    
    return enhanced;
  }

  private async findRelatedVideos(concept: string): Promise<any> {
    try {
      return await this.searchVideos(concept, 'organic chemistry');
    } catch (error) {
      console.warn(`Failed to find videos for concept: ${concept}`, error);
      return { videos: [] };
    }
  }

  private analyzePrerequisiteGaps(
    prerequisites: string[],
    userContext: any
  ): PrerequisiteGap[] {
    const gaps: PrerequisiteGap[] = [];
    
    for (const prereq of prerequisites) {
      const userKnowledge = userContext?.conceptsLearned || [];
      const isKnown = userKnowledge.includes(prereq);
      
      if (!isKnown) {
        gaps.push({
          concept: prereq,
          importance: this.conceptGraph.getConceptImportance(prereq),
          estimatedTime: this.estimateConceptLearningTime(prereq),
          difficulty: this.conceptGraph.getConceptDifficulty(prereq)
        });
      }
    }
    
    return gaps.sort((a, b) => b.importance - a.importance);
  }

  private generateLearningSequence(concept: string, gaps: PrerequisiteGap[]): LearningStep[] {
    const sequence: LearningStep[] = [];
    
    // Add prerequisite steps
    for (const gap of gaps) {
      sequence.push({
        concept: gap.concept,
        type: 'prerequisite',
        estimatedTime: gap.estimatedTime,
        difficulty: gap.difficulty,
        resources: this.knowledgeBase.getConceptResources(gap.concept)
      });
    }
    
    // Add main concept step
    sequence.push({
      concept,
      type: 'main_concept',
      estimatedTime: this.estimateConceptLearningTime(concept),
      difficulty: this.conceptGraph.getConceptDifficulty(concept),
      resources: this.knowledgeBase.getConceptResources(concept)
    });
    
    return sequence;
  }

  private customizePathway(pathway: any[], context: any): any[] {
    // Customize based on user's learning style, pace, and background
    return pathway.map(step => ({
      ...step,
      customizations: this.getStepCustomizations(step, context)
    }));
  }

  private async enhancePathwayWithDetails(pathway: any[]): Promise<any[]> {
    return Promise.all(pathway.map(async step => ({
      ...step,
      estimatedTime: this.estimateConceptLearningTime(step.concept),
      difficulty: this.conceptGraph.getConceptDifficulty(step.concept),
      keyPoints: this.knowledgeBase.getKeyPoints(step.concept),
      commonMistakes: this.knowledgeBase.getCommonMistakes(step.concept)
    })));
  }

  // Helper methods for specific operations
  private addMechanismSteps(context: OrganicChemistryContext): string {
    // Add detailed mechanism steps based on reaction type
    return '\n\nMechanism Steps:\n' + this.knowledgeBase.getMechanismSteps(context.topic);
  }

  private addSafetyConsiderations(context: OrganicChemistryContext): string {
    const safety = this.knowledgeBase.getSafetyInfo(context.topic);
    return safety ? `\n\nSafety Considerations:\n${safety}` : '';
  }

  private addMemoryAids(context: OrganicChemistryContext): string {
    const aids = this.knowledgeBase.getMemoryAids(context.topic);
    return aids.length > 0 ? `\n\nMemory Aids:\n${aids.join('\n')}` : '';
  }

  private estimateLearningTime(sequence: LearningStep[]): number {
    return sequence.reduce((total, step) => total + step.estimatedTime, 0);
  }

  private estimateConceptLearningTime(concept: string): number {
    // Base estimate on concept complexity and typical learning patterns
    const complexity = this.conceptGraph.getConceptComplexity(concept);
    return complexity * 30; // 30 minutes per complexity unit
  }

  private generateRecommendations(gaps: PrerequisiteGap[], context: OrganicChemistryContext): string[] {
    const recommendations: string[] = [];
    
    if (gaps.length > 0) {
      recommendations.push(`Start with ${gaps[0].concept} as it's the most important prerequisite`);
    }
    
    if (context.commonMisconceptions.length > 0) {
      recommendations.push(`Pay special attention to avoiding these misconceptions: ${context.commonMisconceptions.join(', ')}`);
    }
    
    return recommendations;
  }

  private identifyCheckpoints(pathway: any[]): CheckPoint[] {
    // Identify key checkpoints for assessment and review
    return pathway
      .filter((_, index) => index % 3 === 2) // Every 3rd step
      .map(step => ({
        concept: step.concept,
        assessmentType: 'concept_check',
        importance: 'medium'
      }));
  }

  private generateAlternativePathways(concept: string, context: any): any[] {
    // Generate alternative learning paths based on different approaches
    return [
      this.conceptGraph.buildVisualPathway(concept),
      this.conceptGraph.buildApplicationPathway(concept),
      this.conceptGraph.buildMechanismPathway(concept)
    ].filter(Boolean);
  }

  private getStepCustomizations(step: any, context: any): any {
    return {
      visualEmphasis: context?.learningStyle?.visual > 0.7,
      practiceProblems: context?.preferences?.interactivity === 'high',
      detailedExplanations: context?.preferences?.detailLevel === 'high'
    };
  }

  // Agent-specific initialization
  protected async initializeAgent(): Promise<void> {
    // Load chemistry knowledge base
    await this.knowledgeBase.initialize();
    
    // Build concept graph
    await this.conceptGraph.initialize();
    
    // Validate AI access
    try {
      await this.queryAI('claude', 'Test query for organic chemistry agent');
    } catch (error) {
      console.warn('AI service not available, working in degraded mode');
    }
  }

  protected async performHealthCheck(): Promise<boolean> {
    try {
      // Check knowledge base integrity
      const kbHealth = this.knowledgeBase.healthCheck();
      
      // Check AI service availability
      const aiHealth = await this.testAIConnection();
      
      return kbHealth && aiHealth;
    } catch {
      return false;
    }
  }

  private async testAIConnection(): Promise<boolean> {
    try {
      await this.queryAI('claude', 'Health check query', {}, undefined);
      return true;
    } catch {
      return false;
    }
  }
}

// Supporting classes for chemistry knowledge
class ChemistryKnowledgeBase {
  private concepts: Map<string, OrganicChemistryContext> = new Map();
  private mechanisms: Map<ChemistryTopic, string[]> = new Map();
  private safetyInfo: Map<ChemistryTopic, string> = new Map();
  private memoryAids: Map<ChemistryTopic, string[]> = new Map();

  async initialize(): Promise<void> {
    // Load organic chemistry knowledge base
    this.loadConcepts();
    this.loadMechanisms();
    this.loadSafetyInfo();
    this.loadMemoryAids();
  }

  getConceptContext(concept: string): OrganicChemistryContext {
    return this.concepts.get(concept.toLowerCase()) || this.createDefaultContext(concept);
  }

  validateInformation(data: any): ValidationResult {
    // Implement chemistry validation logic
    return {
      isValid: true,
      confidence: 0.8,
      corrections: []
    };
  }

  getMechanismSteps(topic: ChemistryTopic): string {
    return this.mechanisms.get(topic)?.join('\n') || 'No mechanism steps available';
  }

  getSafetyInfo(topic: ChemistryTopic): string {
    return this.safetyInfo.get(topic) || '';
  }

  getMemoryAids(topic: ChemistryTopic): string[] {
    return this.memoryAids.get(topic) || [];
  }

  getConceptResources(concept: string): ResourceInfo[] {
    // Return relevant resources for concept
    return [];
  }

  getKeyPoints(concept: string): string[] {
    // Return key learning points for concept
    return [];
  }

  getCommonMistakes(concept: string): string[] {
    // Return common student mistakes for concept
    return [];
  }

  healthCheck(): boolean {
    return this.concepts.size > 0;
  }

  private loadConcepts(): void {
    // Load organic chemistry concepts and their contexts
    // This would typically be loaded from a database or file
  }

  private loadMechanisms(): void {
    // Load reaction mechanisms for different topics
  }

  private loadSafetyInfo(): void {
    // Load safety information for chemical topics
  }

  private loadMemoryAids(): void {
    // Load memory aids and mnemonics
  }

  private createDefaultContext(concept: string): OrganicChemistryContext {
    return {
      topic: ChemistryTopic.ALKANES,
      relatedConcepts: [],
      prerequisites: [],
      applications: [],
      commonMisconceptions: []
    };
  }
}

class ConceptGraph {
  private graph: Map<string, ConceptNode> = new Map();

  async initialize(): Promise<void> {
    this.buildConceptGraph();
  }

  getPrerequisites(concept: string): string[] {
    return this.graph.get(concept)?.prerequisites || [];
  }

  getNextConcepts(concept: string): string[] {
    return this.graph.get(concept)?.nextConcepts || [];
  }

  getImportance(prereq: string, concept: string): number {
    // Calculate importance of prerequisite for main concept
    return 0.5;
  }

  getConceptImportance(concept: string): number {
    return this.graph.get(concept)?.importance || 0.5;
  }

  getConceptDifficulty(concept: string): number {
    return this.graph.get(concept)?.difficulty || 3;
  }

  getConceptComplexity(concept: string): number {
    return this.graph.get(concept)?.complexity || 2;
  }

  buildLearningPathway(targetConcept: string): any[] {
    // Build optimal learning pathway to target concept
    return [];
  }

  buildVisualPathway(concept: string): any {
    // Build pathway emphasizing visual learning
    return null;
  }

  buildApplicationPathway(concept: string): any {
    // Build pathway emphasizing applications
    return null;
  }

  buildMechanismPathway(concept: string): any {
    // Build pathway emphasizing mechanisms
    return null;
  }

  private buildConceptGraph(): void {
    // Build the concept dependency graph
  }
}

// Type definitions
interface PrerequisiteGap {
  concept: string;
  importance: number;
  estimatedTime: number;
  difficulty: number;
}

interface LearningStep {
  concept: string;
  type: 'prerequisite' | 'main_concept' | 'application';
  estimatedTime: number;
  difficulty: number;
  resources: ResourceInfo[];
}

interface ValidationResult {
  isValid: boolean;
  confidence: number;
  corrections: string[];
}

interface ResourceInfo {
  type: string;
  title: string;
  url: string;
  difficulty: number;
}

interface CheckPoint {
  concept: string;
  assessmentType: string;
  importance: string;
}

interface ConceptNode {
  concept: string;
  prerequisites: string[];
  nextConcepts: string[];
  importance: number;
  difficulty: number;
  complexity: number;
}