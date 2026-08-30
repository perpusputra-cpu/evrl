export type ExperimentStatus =
  | 'DRAFT'
  | 'PREPARING'
  | 'RUNNING'
  | 'MEASURED'
  | 'ANALYZING'
  | 'COMPLETED';

export type PlasticCategory =
  | 'HDPE' // Kantong kresek / botol sabun
  | 'LDPE' // Plastik wrap / kantong tipis
  | 'BOPP' // Bungkus snack / aluminium foil berplastik
  | 'PP' // Sedotan / gelas plastik tipis
  | 'MIXED'; // Fragmen plastik campuran

export interface MaterialItem {
  id: string;
  name: string;
  category: PlasticCategory;
  mass: number; // in grams
  preparation: 'chopped' | 'strips' | 'whole' | 'compacted_pellet';
  cleanliness: 'washed_dry' | 'moderate' | 'unwashed';
  color: string;
}

export interface BottleSpec {
  id: string;
  name: string;
  nominalVolume: number; // in ml / cm3 (e.g. 600)
  tareWeight: number; // in grams (e.g. 24)
  height: number; // in cm (e.g. 22.5)
  diameter: number; // in cm (e.g. 6.5)
}

export interface VariableItem {
  id: string;
  type: 'INDEPENDENT' | 'DEPENDENT' | 'CONTROLLED';
  name: string;
  description: string;
  valueOrUnit: string;
}

export interface MeasurementRecord {
  id: string;
  timestamp: string;
  grossMass: number; // grams (bottle + plastic)
  tareMass: number; // grams (empty bottle)
  netMass: number; // grams (net plastic)
  volume: number; // ml / cm3
  density: number; // g/cm3 (calculated netMass / volume)
  compactionFactor: number; // 0 - 100%
  heightFilled: number; // cm
  hardnessIndex: number; // Shore scale equivalent or manual resistance 1 - 10
  standardMet: boolean; // >= 0.33 g/cm3
  classification: 'Underpacked' | 'Standard Ecobrick' | 'Optimal Structural' | 'Overcompressed';
}

export interface ObservationRecord {
  id: string;
  timestamp: string;
  note: string;
  layerLevel: 'bottom' | 'middle' | 'top' | 'cap';
  observedColor: string;
  voidDetected: boolean;
  compressionResistance: 'soft' | 'firm' | 'very_solid' | 'rigid';
}

export interface Experiment {
  id: string;
  workspaceId: string;
  trialNumber: number;
  title: string;
  objective: string;
  hypothesis: string;
  bottle: BottleSpec;
  materials: MaterialItem[];
  variables: VariableItem[];
  measurements: MeasurementRecord[];
  observations: ObservationRecord[];
  procedureSteps: string[];
  currentStepIndex: number;
  stickCompressionCycles: number;
  status: ExperimentStatus;
  resultSummary?: string;
  aiAnalysis?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResearchNote {
  id: string;
  workspaceId: string;
  title: string;
  content: string;
  tags: string[];
  linkedExperimentId?: string;
  linkedReferenceId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReferenceItem {
  id: string;
  workspaceId: string;
  type: 'PRIMARY_KTI' | 'JOURNAL' | 'STANDARD_GUIDE' | 'COMMUNITY_REPORT' | 'DATASET' | 'SUPPORTING';
  title: string;
  authors: string;
  year: number;
  source: string;
  citationCode: string; // e.g. [REF-001]
  doiOrUrl?: string;
  abstractOrSummary: string;
  keyFindings: string[];
  relevanceRating: 'High' | 'Medium' | 'Supporting';
  uploadedAt: string;
}

export interface KTIStructure {
  title: string;
  authors: string;
  institution: string;
  abstract: string;
  chapter1_Introduction: {
    background: string;
    problemFormulation: string[];
    researchObjectives: string[];
    significance: string;
  };
  chapter2_LiteratureReview: {
    plasticWasteContext: string;
    ecobrickConceptAndStandards: string;
    mechanicalDensityPrinciples: string;
  };
  chapter3_Methodology: {
    samplePreparation: string;
    experimentalDesign: string;
    toolsAndMaterials: string;
    measurementProcedure: string;
  };
  chapter4_ResultsAndDiscussion: {
    dataSummary: string;
    densityAnalysis: string;
    comparisonDiscussion: string;
  };
  chapter5_Conclusion: {
    conclusion: string;
    recommendations: string[];
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
  citations?: string[]; // e.g. ['[REF-001]', '[EXP-01]']
  inferenceType?: 'EVIDENCE_BASED' | 'SCIENTIFIC_INFERENCE' | 'METHODOLOGY_CRITIQUE';
  suggestedFollowUps?: string[];
}

export interface Conversation {
  id: string;
  workspaceId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  mode: 'ASSISTANT' | 'ANALYST' | 'CRITIQUE' | 'EXPLANATION' | 'SUMMARY';
}

export type JuryPersonaId =
  | 'methodology' // Dr. Hendra
  | 'substance' // Prof. Ratna
  | 'implementation' // Ir. Bambang
  | 'skeptical' // Dr. Irwan
  | 'panel'; // Panel Gabungan

export type JuryDifficulty =
  | 'BEGINNER'
  | 'MODERATE'
  | 'COMPETITIVE'
  | 'HARD'
  | 'BRIDA_PIMNAS';

export interface JuryQuestion {
  id: string;
  roundNumber: number;
  personaId: JuryPersonaId;
  personaName: string;
  personaTitle: string;
  focusArea: string;
  questionText: string;
  targetAspect: string;
}

export interface JuryScoreBreakdown {
  scientificSubstance: number; // max 20
  methodology: number; // max 20
  dataInterpretation: number; // max 15
  novelty: number; // max 15
  implementation: number; // max 10
  presentation: number; // max 10
  defenseQA: number; // max 10
  totalScore: number; // max 100
}

export interface JuryResponseEvaluation {
  id: string;
  questionId: string;
  userAnswer: string;
  score: number; // 0-100 for this round
  rubric: JuryScoreBreakdown;
  strongPoints: string[];
  weakPoints: string[];
  juryConcerns: string;
  recommendedImprovement: string;
  followUpTriggered?: boolean;
}

export interface JuryReport {
  sessionId: string;
  overallScore: number;
  rankGrade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D';
  overallFeedback: string;
  topStrengths: string[];
  topWeaknesses: string[];
  mostDangerousQuestions: string[];
  recommendedAnswers: { question: string; idealDefense: string }[];
  presentationPriorities: string[];
  scoreBreakdownAverage: JuryScoreBreakdown;
}

export interface JurySession {
  id: string;
  workspaceId: string;
  persona: JuryPersonaId;
  difficulty: JuryDifficulty;
  currentRound: number;
  totalRounds: number;
  status: 'IN_PROGRESS' | 'COMPLETED';
  questions: JuryQuestion[];
  evaluations: JuryResponseEvaluation[];
  finalReport?: JuryReport;
  startedAt: string;
  endedAt?: string;
}

export interface WorkspaceMetadata {
  id: string;
  createdAt: string;
  lastActivityAt: string;
  expiresAt: string;
  version: number;
  title: string;
  primaryResearchTitle: string;
}

export interface WorkspaceState {
  metadata: WorkspaceMetadata;
  experiments: Experiment[];
  activeExperimentId: string | null;
  notes: ResearchNote[];
  references: ReferenceItem[];
  kti: KTIStructure;
  conversations: Conversation[];
  activeConversationId: string | null;
  jurySessions: JurySession[];
  activeJurySessionId: string | null;
}
