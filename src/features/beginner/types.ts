export type SectionId = 'personality' | 'background' | 'work-experience' | 'interests' | 'goals';

export interface Section {
  id: SectionId;
  label: string;
}

export interface Question {
  id: string;
  section: SectionId;
  prompt: string;
  options: string[];
}

export interface CareerPath {
  id: string;
  title: string;
  reason: string;
  matchScore: number;
  programme: {
    name: string;
    description: string;
  };
  whyThisProgramme: string[];
}

export type AssessmentPhase = 'questions' | 'processing' | 'results' | 'error';
