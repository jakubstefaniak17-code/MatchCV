// MatchCV interview v1.0: schema for matchcv_interview_40.json
export type AnswerType = 'long_text' | 'yes_no_with_details' | 'range_with_context';
export type AnswerStatus = 'unanswered' | 'draft' | 'answered' | 'skipped' | 'needs_review';
export type CareerFactStatus = 'unconfirmed' | 'user_confirmed' | 'document_supported' | 'disputed' | 'rejected';

export interface InterviewQuestion {
  id: string; // MCV-Q001 ... MCV-Q040
  order: number;
  section_id: string;
  section_title_pl: string;
  question_pl: string;
  answer_type: AnswerType;
  required: false;
  input_config: Record<string, unknown>;
  helper_text_pl: string;
  example_prompt_pl: string;
  ai_extraction_instruction_pl: string;
  conditional_followups: Array<{condition: string; question_pl: string; max_occurrences: number}>;
  career_tags: string[];
  storage_visibility: 'private_only' | 'profile_internal';
  share_in_cv_by_default: false;
  user_can_edit: true;
  user_can_skip: true;
}

export interface InterviewAnswer {
  answer_type: AnswerType;
  status: AnswerStatus;
  value: string | {choice: 'yes'|'no'|'unsure'|null; details: string|null} |
    {min:number|null; max:number|null; currency:string|null; period:string|null; contract_basis:string|null; negotiability:string|null} | null;
  followup_answers: Array<{question: string; answer: string}>;
  fact_ids: string[];
  last_edited_at: string | null;
}

export interface ExtractedCareerFact {
  id: string;
  statement: string;
  category: string;
  source_type: 'cv_import'|'interview'|'user_edit'|'document';
  source_id: string;
  verification_status: CareerFactStatus;
  confidence: number | null; // prediction confidence, NOT proof of truth
  private: boolean;
  forbidden_for_cv: boolean;
}

export const FACT_EXTRACTION_RULES = [
  'Extract only statements supported by the supplied answer.',
  'If a date, number, employer, title or credential is absent, leave it absent.',
  'Separate the user\'s contribution from the team outcome.',
  'Track source question IDs and user confirmation status.',
  'Never convert preferences into achievements or skills.',
  'Never expose facts marked private or forbidden_for_cv.',
] as const;
