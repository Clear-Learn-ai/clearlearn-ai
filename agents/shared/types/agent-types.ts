// Core Agent Types and Interfaces for AI Tutor Multi-Agent System

// AgentError class for proper error handling
export class AgentError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'AgentError'
  }
}

export enum AgentType {
  CONTENT_SPECIALIST = 'content-specialist',
  PEDAGOGY = 'pedagogy',
  VISUAL_LEARNING = 'visual-learning',
  ASSESSMENT = 'assessment',
  CONVERSATION = 'conversation',
  RESOURCE = 'resource',
  ORCHESTRATOR = 'orchestrator'
}

export enum MessageType {
  REQUEST = 'request',
  RESPONSE = 'response',
  NOTIFICATION = 'notification',
  ERROR = 'error',
  HEARTBEAT = 'heartbeat',
  TASK_ASSIGNMENT = 'task-assignment',
  TASK_COMPLETION = 'task-completion',
  COLLABORATION_REQUEST = 'collaboration-request'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Core Communication Interfaces
export interface AgentMessage {
  id: string;
  timestamp: Date;
  sender: AgentType;
  recipient: AgentType | 'orchestrator' | 'broadcast';
  messageType: MessageType;
  payload: any;
  context?: ConversationContext;
  priority: Priority;
  correlationId?: string; // For tracking request-response chains
  timeout?: number; // Message timeout in milliseconds
}

export interface ConversationContext {
  sessionId: string;
  userId: string;
  currentTopic?: string;
  learningObjectives?: string[];
  studentLevel: 'beginner' | 'intermediate' | 'advanced';
  learningStyle?: LearningStyle;
  previousQueries: string[];
  conceptsLearned: string[];
  weakAreas: string[];
  preferences: StudentPreferences;
  metadata?: Record<string, any>;
}

export interface LearningStyle {
  visual: number; // 0-1 preference score
  auditory: number;
  kinesthetic: number;
  reading: number;
  preferredPace: 'slow' | 'medium' | 'fast';
  detailLevel: 'high' | 'medium' | 'low';
}

export interface StudentPreferences {
  language: string;
  examples: 'minimal' | 'moderate' | 'extensive';
  difficulty: 'gentle' | 'standard' | 'challenging';
  interactivity: 'low' | 'medium' | 'high';
  feedbackStyle: 'immediate' | 'periodic' | 'final';
}

// Agent-Specific Payload Types
export interface ContentSpecialistPayload {
  type: 'explain_concept' | 'validate_information' | 'analyze_prerequisites' | 'suggest_pathway';
  concept?: string;
  query?: string;
  context?: OrganicChemistryContext;
  validationData?: any;
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
}

export interface OrganicChemistryContext {
  topic: ChemistryTopic;
  subtopic?: string;
  relatedConcepts: string[];
  prerequisites: string[];
  applications: string[];
  commonMisconceptions: string[];
}

export enum ChemistryTopic {
  ALKANES = 'alkanes',
  ALKENES = 'alkenes',
  ALKYNES = 'alkynes',
  AROMATIC = 'aromatic',
  STEREOCHEMISTRY = 'stereochemistry',
  SUBSTITUTION = 'substitution',
  ELIMINATION = 'elimination',
  ADDITION = 'addition',
  OXIDATION_REDUCTION = 'oxidation-reduction',
  SPECTROSCOPY = 'spectroscopy',
  SYNTHESIS = 'synthesis',
  BIOMOLECULES = 'biomolecules'
}

export interface PedagogyPayload {
  type: 'assess_learning_style' | 'create_learning_path' | 'update_progress' | 'suggest_study_plan';
  studentProfile?: StudentProfile;
  learningGoals?: LearningGoal[];
  progressData?: ProgressData;
  assessmentResults?: AssessmentResult[];
}

export interface StudentProfile {
  id: string;
  level: 'pre-med-1' | 'pre-med-2' | 'pre-med-3' | 'mcat-prep';
  gpa?: number;
  previousCourses: string[];
  strengths: string[];
  weaknesses: string[];
  studyHabits: StudyHabits;
  goals: LearningGoal[];
  timeAvailable: TimeAvailability;
}

export interface StudyHabits {
  averageSessionLength: number; // minutes
  preferredStudyTime: 'morning' | 'afternoon' | 'evening' | 'night';
  breakFrequency: number; // minutes between breaks
  retentionStrategy: 'repetition' | 'elaboration' | 'visual' | 'mixed';
}

export interface TimeAvailability {
  dailyStudyTime: number; // minutes
  weeklySchedule: DaySchedule[];
  examDates?: Date[];
  deadlines?: Deadline[];
}

export interface DaySchedule {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  availableSlots: TimeSlot[];
}

export interface TimeSlot {
  start: string; // HH:MM format
  end: string;
  quality: 'high' | 'medium' | 'low'; // Focus quality expected
}

export interface Deadline {
  date: Date;
  type: 'exam' | 'assignment' | 'mcat' | 'application';
  importance: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

export interface LearningGoal {
  id: string;
  description: string;
  topic: ChemistryTopic;
  targetDate?: Date;
  priority: Priority;
  measurable: boolean;
  prerequisites: string[];
  estimatedTime: number; // hours
  progress: number; // 0-1
}

export interface ProgressData {
  conceptsMastered: ConceptMastery[];
  timeSpent: Record<string, number>; // topic -> minutes
  sessionHistory: StudySession[];
  performanceMetrics: PerformanceMetrics;
  lastUpdated: Date;
}

export interface ConceptMastery {
  concept: string;
  topic: ChemistryTopic;
  masteryLevel: number; // 0-1
  confidence: number; // 0-1
  lastReviewed: Date;
  needsReview: boolean;
  difficultyRating: number; // 1-5
}

export interface StudySession {
  id: string;
  startTime: Date;
  endTime: Date;
  topics: string[];
  activitiesCompleted: ActivityCompletion[];
  performance: number; // 0-1
  engagement: number; // 0-1
  notes?: string;
}

export interface ActivityCompletion {
  type: 'reading' | 'video' | 'practice' | 'assessment' | 'discussion';
  topic: string;
  timeSpent: number; // minutes
  completed: boolean;
  score?: number; // 0-1
  difficulty: number; // 1-5
}

export interface PerformanceMetrics {
  overallProgress: number; // 0-1
  averageScore: number; // 0-1
  streakDays: number;
  totalStudyTime: number; // hours
  conceptsLearned: number;
  trendsLastWeek: TrendData;
  trendsLastMonth: TrendData;
}

export interface TrendData {
  progressChange: number; // -1 to 1
  scoreChange: number;
  timeChange: number;
  engagementChange: number;
}

export interface VisualLearningPayload {
  type: 'create_visualization' | 'find_videos' | 'generate_diagram' | 'create_interactive';
  concept?: string;
  visualizationType?: VisualizationType;
  complexity?: 'simple' | 'detailed' | 'comprehensive';
  interactivityLevel?: 'static' | 'interactive' | 'immersive';
  searchCriteria?: VideoSearchCriteria;
}

export enum VisualizationType {
  MOLECULAR_STRUCTURE = 'molecular-structure',
  REACTION_MECHANISM = 'reaction-mechanism',
  ENERGY_DIAGRAM = 'energy-diagram',
  CONCEPT_MAP = 'concept-map',
  FLOWCHART = 'flowchart',
  INTERACTIVE_SIMULATION = 'interactive-simulation',
  ANIMATION = 'animation',
  INFOGRAPHIC = 'infographic'
}

export interface VideoSearchCriteria {
  topic: string;
  duration?: 'short' | 'medium' | 'long'; // <10min, 10-30min, >30min
  quality?: 'high' | 'verified'; // High quality or verified educational
  source?: 'khan-academy' | 'youtube' | 'coursera' | 'any';
  language?: string;
  subtitles?: boolean;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface AssessmentPayload {
  type: 'generate_question' | 'evaluate_answer' | 'create_quiz' | 'analyze_performance';
  concept?: string;
  questionType?: QuestionType;
  difficulty?: number; // 1-5
  studentAnswer?: any;
  correctAnswer?: any;
  assessmentCriteria?: AssessmentCriteria;
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple-choice',
  TRUE_FALSE = 'true-false',
  SHORT_ANSWER = 'short-answer',
  MECHANISM_DRAWING = 'mechanism-drawing',
  STRUCTURE_IDENTIFICATION = 'structure-identification',
  SYNTHESIS_PATHWAY = 'synthesis-pathway',
  SPECTROSCOPY_INTERPRETATION = 'spectroscopy-interpretation',
  CASE_STUDY = 'case-study'
}

export interface AssessmentCriteria {
  scoringMethod: 'binary' | 'partial' | 'rubric';
  timeLimit?: number; // seconds
  hints?: boolean;
  feedback?: 'immediate' | 'delayed' | 'final';
  retries?: number;
  adaptiveDifficulty?: boolean;
}

export interface AssessmentResult {
  questionId: string;
  concept: string;
  topic: ChemistryTopic;
  questionType: QuestionType;
  difficulty: number;
  score: number; // 0-1
  timeSpent: number; // seconds
  hintsUsed: number;
  attempts: number;
  timestamp: Date;
  feedback?: string;
  commonErrors?: string[];
}

export interface ConversationPayload {
  type: 'process_query' | 'clarify_intent' | 'provide_encouragement' | 'summarize_session';
  query?: string;
  intent?: ConversationIntent;
  clarificationNeeded?: string[];
  sessionSummary?: SessionSummary;
}

export enum ConversationIntent {
  QUESTION = 'question',
  EXPLANATION_REQUEST = 'explanation-request',
  HELP_REQUEST = 'help-request',
  ASSESSMENT_REQUEST = 'assessment-request',
  PROGRESS_INQUIRY = 'progress-inquiry',
  STUDY_PLANNING = 'study-planning',
  CLARIFICATION = 'clarification',
  ENCOURAGEMENT_NEEDED = 'encouragement-needed'
}

export interface SessionSummary {
  topicsCovered: string[];
  conceptsLearned: string[];
  questionsAnswered: number;
  averageScore: number;
  timeSpent: number; // minutes
  nextSteps: string[];
  recommendedReview: string[];
}

export interface ResourcePayload {
  type: 'find_resources' | 'validate_source' | 'recommend_materials' | 'aggregate_content';
  topic?: string;
  resourceType?: ResourceType;
  quality?: 'any' | 'high' | 'verified' | 'peer-reviewed';
  format?: ResourceFormat;
  source?: string;
}

export enum ResourceType {
  TEXTBOOK = 'textbook',
  RESEARCH_PAPER = 'research-paper',
  VIDEO = 'video',
  PRACTICE_PROBLEMS = 'practice-problems',
  REFERENCE_MATERIAL = 'reference-material',
  STUDY_GUIDE = 'study-guide',
  FLASHCARDS = 'flashcards',
  SIMULATION = 'simulation',
  DATABASE = 'database'
}

export enum ResourceFormat {
  TEXT = 'text',
  VIDEO = 'video',
  AUDIO = 'audio',
  INTERACTIVE = 'interactive',
  PDF = 'pdf',
  WEB = 'web',
  MOBILE_APP = 'mobile-app'
}

// Response Types
export interface TutorResponse {
  id: string;
  timestamp: Date;
  type: 'explanation' | 'question' | 'feedback' | 'encouragement' | 'resources';
  content: ResponseContent;
  metadata: ResponseMetadata;
  followUpSuggestions?: string[];
  relatedTopics?: string[];
}

export interface ResponseContent {
  text?: string;
  visualizations?: VisualizationContent[];
  videos?: VideoContent[];
  assessments?: AssessmentContent[];
  resources?: ResourceContent[];
  interactive?: InteractiveContent[];
}

export interface VisualizationContent {
  type: VisualizationType;
  title: string;
  description?: string;
  url?: string;
  data?: any; // Visualization-specific data
  interactive: boolean;
}

export interface VideoContent {
  title: string;
  description: string;
  url: string;
  thumbnailUrl?: string;
  duration: number; // seconds
  source: string;
  quality: 'high' | 'medium' | 'low';
  relevanceScore: number; // 0-1
}

export interface AssessmentContent {
  question: string;
  type: QuestionType;
  options?: string[]; // For multiple choice
  correctAnswer?: any;
  difficulty: number; // 1-5
  timeLimit?: number; // seconds
  hints?: string[];
}

export interface ResourceContent {
  title: string;
  description: string;
  url: string;
  type: ResourceType;
  format: ResourceFormat;
  quality: 'verified' | 'high' | 'medium' | 'low';
  relevanceScore: number; // 0-1
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface InteractiveContent {
  type: 'simulation' | 'quiz' | 'drawing' | 'matching' | 'sorting';
  title: string;
  description: string;
  config: any; // Type-specific configuration
  estimatedTime: number; // minutes
}

export interface ResponseMetadata {
  agentsInvolved: AgentType[];
  processingTime: number; // milliseconds
  confidence: number; // 0-1
  sources: string[];
  adaptations: Adaptation[];
}

export interface Adaptation {
  type: 'difficulty' | 'style' | 'pace' | 'content';
  description: string;
  reason: string;
}

// Agent Configuration Types
export interface AgentConfig {
  agentType: AgentType;
  enabled: boolean;
  maxConcurrentTasks: number;
  timeout: number; // milliseconds
  retryAttempts: number;
  priority: Priority;
  dependencies: AgentType[];
  mcpTools: string[];
  customConfig?: Record<string, any>;
}

export interface SystemConfig {
  agents: Record<AgentType, AgentConfig>;
  communication: CommunicationConfig;
  mcp: MCPConfig;
  logging: LoggingConfig;
  performance: PerformanceConfig;
}

export interface CommunicationConfig {
  messageTimeout: number;
  retryAttempts: number;
  priorityQueues: boolean;
  maxQueueSize: number;
  deadLetterQueue: boolean;
  circuitBreaker: boolean;
}

export interface MCPConfig {
  endpoints: MCPEndpoint[];
  fallbackStrategy: 'round-robin' | 'priority' | 'random' | 'least-loaded';
  healthCheckInterval: number; // milliseconds
  timeout: number; // milliseconds
  retryAttempts: number;
}

export interface MCPEndpoint {
  name: string;
  url: string;
  priority: number;
  healthCheck: boolean;
  apiKey?: string;
  rateLimits?: RateLimit;
}

export interface RateLimit {
  requestsPerMinute: number;
  requestsPerHour: number;
  burstLimit: number;
}

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  logToFile: boolean;
  logToConsole: boolean;
  maxLogFiles: number;
  maxLogSize: string; // e.g., '10MB'
}

export interface PerformanceConfig {
  cachingEnabled: boolean;
  cacheSize: number; // MB
  cacheTTL: number; // seconds
  metricsCollection: boolean;
  healthChecks: boolean;
  loadBalancing: boolean;
}

// Error Types
export interface AgentError {
  code: string;
  message: string;
  agentType: AgentType;
  timestamp: Date;
  context?: Record<string, unknown>;
  stack?: string;
  retryable: boolean;
}

export enum ErrorCode {
  TIMEOUT = 'TIMEOUT',
  INVALID_MESSAGE = 'INVALID_MESSAGE',
  AGENT_UNAVAILABLE = 'AGENT_UNAVAILABLE',
  MCP_CONNECTION_FAILED = 'MCP_CONNECTION_FAILED',
  PROCESSING_ERROR = 'PROCESSING_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED'
}