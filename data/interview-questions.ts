/** Product Kit is the canonical, unmodified question bank. No legacy IDs are inferred. */
import source from './interview-40.json';
import type { InterviewQuestion } from '@/lib/interview/types';
export type { InterviewQuestion, InterviewAnswer, AnswerStatus, AnswerType } from '@/lib/interview/types';
export type InterviewSectionId = 'A'|'B'|'C'|'D'|'E'|'F'|'G'|'H'|'I'|'J';
export const interviewBankVersion = source.schema_version;
export const interviewQuestions = source.questions as InterviewQuestion[];
export const interviewSections = source.sections;
export const interviewRules = source.rules;
