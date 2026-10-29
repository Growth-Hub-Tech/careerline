import type { components } from './schema';

type Schemas = components['schemas'];

export type RegisterRequest = Schemas['RegisterRequest'];
export type TokenResponse = Schemas['TokenResponse'];
export type Acknowledgement = Schemas['Acknowledgement'];
export type ContactRequest = Schemas['ContactRequest'];
export type ContactReceipt = Schemas['ContactReceipt'];
export type ContactTopic = NonNullable<ContactRequest['topic']>;
export type IntakeQuestionnaire = Schemas['IntakeQuestionnaire'];
export type IntakeQuestion = Schemas['IntakeQuestion'];
export type IntakeSubmission = Schemas['IntakeSubmission'];
export type BeginnerPath = Schemas['BeginnerPath'];
export type CareerPathRecommendation = Schemas['CareerPathRecommendation'];
export type Programme = Schemas['Programme'];
export type ProgrammeClick = Schemas['ProgrammeClick'];
export type ProgrammeClickRequest = Schemas['ProgrammeClickRequest'];
export type ProgrammeSummary = Schemas['ProgrammeSummary'];
export type Money = Schemas['Money'];

export type LevelName = Schemas['LevelName'];
export type AssessmentSummary = Schemas['AssessmentSummary'];
export type AssessmentPage = Schemas['Page_AssessmentSummary_'];
export type AssessmentDetail = Schemas['AssessmentDetail'];
export type AssessmentAccess = Schemas['AssessmentAccess'];

export interface Skill {
  readonly skill_id: number;
  readonly skill_name: string;
  readonly category: string;
  readonly description: string;
}

export interface SkillsPage {
  readonly skills: readonly Skill[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
}

export interface AttemptOption {
  readonly option_id: number;
  readonly option_text: string;
}

export interface AttemptQuestion {
  readonly question_id: number;
  readonly question_text: string;
  readonly difficulty_level: LevelName;
  readonly subskill_id: number;
  readonly options: readonly AttemptOption[];
}

export interface StartedAttempt {
  readonly attempt_id: number;
  readonly declared_level: LevelName;
  readonly total_questions: number;
  readonly questions: readonly AttemptQuestion[];
}

export interface Attempt {
  readonly attempt_id: number;
  readonly learner_id: number;
  readonly skill_id: number;
  readonly attempt_status: string;
  readonly overall_percentage: number | null;
  readonly start_time: string;
  readonly end_time: string | null;
}

export interface AttemptAnswer {
  readonly question_id: number;
  readonly selected_option_id: number;
}

export interface AttemptSubmission {
  readonly attempt_id: number;
  readonly answers: readonly AttemptAnswer[];
}

export interface AttemptResult {
  readonly score: number;
  readonly total_possible: number;
  readonly percentage: number;
  readonly declared_level: LevelName;
  readonly status: string;
  readonly confirmed_level: LevelName | null;
}

export interface AttemptSubmissionReply {
  readonly result: AttemptResult;
}
