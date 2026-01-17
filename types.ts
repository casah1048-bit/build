
export interface InstructionStep {
  roundOrRow: string;
  step: string;
}

export interface CrochetPattern {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Easy' | 'Intermediate' | 'Advanced';
  materials: string[];
  abbreviations: Record<string, string>;
  instructions: InstructionStep[];
  description: string;
  category: string;
  hookSize: string;
}

export interface UserProject {
  id: string;
  pattern: CrochetPattern;
  currentStepIndex: number;
  notes: string;
  startDate: string;
  lastModified: string;
  counter: number;
}

export type View = 'home' | 'generate' | 'project' | 'glossary';
