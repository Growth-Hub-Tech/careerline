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
