export interface FormulaItem {
  id: string;
  module: 1 | 2 | 3 | 4 | 5 | 6;
  title: string;
  latex: string;
  onExam3Sheet: boolean;
  whenToUse: string;
  commonTrap: string;
  conditions: string[]; // when are conditions met for this formula?
  vsAlternative?: string; // e.g. "Use Welch (not pooled) when variances are unequal"
}

export interface NoteSheetEntry {
  itemId: string;
  side: 'A' | 'B';
  priority: 'must-have' | 'trap' | 'proof' | 'example';
  customNote: string;
  masteryStreak: number;
  archived: boolean;
  content: string;
  title: string;
  latex?: string;
}

export interface Flashcard {
  id: string;
  module: 1 | 2 | 3 | 4 | 5 | 6;
  type: 'scenario' | 'test-selection' | 'assumption' | 'interpretation' | 'when-to-use';
  front: string;
  back: string;
  frontLatex?: string;
  backLatex?: string;
  interval: number;
  repetition: number;
  efactor: number;
  dueDate: string;
  lastReviewed?: string;
}

export type FlashcardItem = Flashcard;

export interface FlashcardProgress {
  interval: number;
  repetition: number;
  efactor: number;
  nextReviewDate: string;
  lastReviewed?: string;
}

export interface MistakeEntry {
  id: string;
  timestamp: string;
  source: 'scenario' | 'walkthrough' | 'flashcard' | 'exam' | 'cloze';
  itemId: string;
  itemTitle: string;
  module: 1 | 2 | 3 | 4 | 5 | 6;
  errorType:
    | 'wrong-test-selected'
    | 'assumption-missed'
    | 'wrong-hypotheses'
    | 'misread-output'
    | 'other';
  details: string;
}

export interface WalkthroughStage {
  stageNum: 1 | 2 | 3 | 4 | 5;
  label: string;
  prompt: string;
  hint: string;
  answer: string;
  answerLatex?: string;
  explanation: string;
}

export interface WalkthroughProblem {
  id: string;
  source: string;
  module: 1 | 2 | 3 | 4 | 5 | 6;
  title: string;
  context: string;
  contextLatex?: string;
  stages: WalkthroughStage[];
}

export interface ScenarioCard {
  id: string;
  module: 1 | 2 | 3 | 4 | 5 | 6;
  scenario: string;
  correctTest: string;
  correctTestLatex?: string;
  wrongOptions: string[];
  whyCorrect: string;
  keySignals: string[];
  assumptions: string[];
}

export interface ClozeBlank {
  index: number;
  answer: string;
  tolerance?: number;
  hint: string;
}

export interface ClozeTableCell {
  isBlank: boolean;
  answer?: string;
  value?: string;
}

export interface ClozeTableRow {
  cells: ClozeTableCell[];
}

export interface ClozeExercise {
  id: string;
  module: 1 | 2 | 3 | 4 | 5 | 6;
  type: 'decision-tree' | 'anova-table' | 'assumption-check';
  title: string;
  template: string;
  templateLatex?: string;
  blanks: ClozeBlank[];
  answers?: string[];
  hints?: string[];
  tableData?: ClozeTableRow[];
}

export interface ProofStep {
  id: string;
  content: string;
  latex?: string;
  explanation: string;
}

export interface DerivationProof {
  id: string;
  pattern: number;
  title: string;
  description: string;
  steps: ProofStep[];
}

export interface ExamSubpart {
  id: string;
  label: string;
  prompt: string;
  points: number;
  solution: string;
  solutionLatex?: string;
}

export interface ExamQuestion {
  id: string;
  examNum: 1 | 2 | 3;
  questionNum: number;
  mandatory: boolean;
  title: string;
  content: string;
  subparts: ExamSubpart[];
  totalPoints: number;
}

export interface ExamSimSession {
  id: string;
  practiceExamNum: 1 | 2 | 3;
  startTime: string;
  endTime?: string;
  selectedOptional: string[];
  selfGrades: Record<string, number>;
  submitted: boolean;
}

export interface ModuleProgress {
  moduleNum: 1 | 2 | 3 | 4 | 5 | 6;
  topicsCompleted: number;
  totalTopics: number;
  lastStudied?: string;
}

export interface AppState {
  noteSheet: NoteSheetEntry[];
  mistakes: MistakeEntry[];
  flashcardProgress: Record<string, FlashcardProgress>;
  walkthroughProgress: Record<string, number>;
  moduleProgress: Record<string, number>;
  examSessions: ExamSimSession[];
  lastWarmupDate?: string;
  learningMode?: 'progressive' | 'freestyle';
  warmupState?: {
    date: string; // YYYY-MM-DD
    currentIndex: number;
    completed: boolean;
    itemIds: string[];
    completedAt?: string;
  };
  scenariosProgress?: {
    masteredIds: string[];
    history: Record<string, { correct: boolean; timestamp: string }>;
  };
  clozeProgress?: {
    completedIds: string[];
  };
  proofProgress?: {
    masteredIds: string[];
  };
}
