import {
  interviewQuestions,
  type InterviewQuestion,
  type InterviewSectionId,
} from "../../data/interview-questions";

export type AnswerState = "answered" | "skipped";
export interface InterviewAnswer {
  questionId: string;
  state: AnswerState;
  text: string;
}

/** Coverage is explicit provenance from a reviewed import, never keyword guessing. */
export interface InterviewCoverage {
  answeredQuestionIds?: readonly string[];
}

export function getQuestionsForSection(section: InterviewSectionId | string): InterviewQuestion[] {
  return interviewQuestions.filter((question) => question.section === section.toUpperCase());
}

export function validateInterviewAnswer(
  questionId: string,
  state: AnswerState,
  text: string,
): { valid: true; value: InterviewAnswer } | { valid: false; error: string } {
  const question = interviewQuestions.find((item) => item.id === questionId);
  if (!question) return { valid: false, error: "Unknown question ID." };
  if (state !== "answered" && state !== "skipped") return { valid: false, error: "Unknown answer state." };
  if (state === "skipped") return { valid: true, value: { questionId, state, text: "" } };
  const cleaned = text.trim();
  if (cleaned.length < question.validation.minLength) {
    return { valid: false, error: `Answer must contain at least ${question.validation.minLength} characters, or skip this question.` };
  }
  if (cleaned.length > question.validation.maxLength) {
    return { valid: false, error: `Answer cannot exceed ${question.validation.maxLength} characters.` };
  }
  return { valid: true, value: { questionId, state, text: cleaned } };
}

/** Last occurrence wins, matching editing an answer rather than counting revisions. */
function latestAnswers(answers: readonly InterviewAnswer[]): Map<string, InterviewAnswer> {
  const validIds = new Set(interviewQuestions.map((question) => question.id));
  return new Map(answers.filter((answer) => validIds.has(answer.questionId)).map((answer) => [answer.questionId, answer]));
}

export function getInterviewProgress(answers: readonly InterviewAnswer[], coverage: InterviewCoverage = {}) {
  const latest = latestAnswers(answers);
  const covered = new Set(coverage.answeredQuestionIds ?? []);
  const answered = [...latest.values()].filter((answer) => answer.state === "answered").length;
  const skipped = [...latest.values()].filter((answer) => answer.state === "skipped").length;
  const imported = interviewQuestions.filter((question) => !latest.has(question.id) && covered.has(question.id)).length;
  const remaining = interviewQuestions.length - answered - skipped - imported;
  return { total: interviewQuestions.length, answered, skipped, imported, remaining, completionPercent: Math.round(((answered + imported) / interviewQuestions.length) * 100) };
}

export function getNextQuestion(
  answers: readonly InterviewAnswer[],
  coverage: InterviewCoverage = {},
  section?: InterviewSectionId,
): InterviewQuestion | null {
  const latest = latestAnswers(answers);
  const covered = new Set(coverage.answeredQuestionIds ?? []);
  return interviewQuestions.find((question) => (!section || question.section === section) && !latest.has(question.id) && !covered.has(question.id)) ?? null;
}

export interface FollowUpQuestion {
  id: string;
  questionId: string;
  pl: string;
  en: string;
  reason: string;
}

/** Offline assist. These prompts request evidence; no facts are inferred from the answer. */
export function deterministicFollowUps(answer: InterviewAnswer): FollowUpQuestion[] {
  if (answer.state === "skipped" || !answer.text.trim()) return [];
  const question = interviewQuestions.find((item) => item.id === answer.questionId);
  if (!question || question.section === "J") return [];
  const text = answer.text.trim();
  const followUps: FollowUpQuestion[] = [];
  const add = (suffix: string, pl: string, en: string, reason: string) => followUps.push({ id: `${question.id}:${suffix}`, questionId: question.id, pl, en, reason });
  if (text.length < 100) {
    add("scope", "Podaj konkretny przykład: czego dotyczyła praca i za co osobiście odpowiadał(a)eś?", "Give a concrete example: what was the work about, and what were you personally responsible for?", "vague_scope");
  }
  if (["B", "C", "D", "E", "G", "I", "K"].includes(question.section) && !/\d/.test(text)) {
    add("evidence", "Jaki był obserwowalny rezultat? Jeśli znasz skalę, budżet lub miernik, podaj go; nie musisz zgadywać liczb.", "What was the observable result? If you know the scale, budget or metric, provide it; do not guess numbers.", "missing_evidence");
  }
  if (/\b(projekt|project|infrastruktur|infrastructur)/iu.test(text) && text.length < 200) {
    add("role", "Jaką część projektu prowadził(a)eś, z kim współpracował(a)eś i jakie rezultaty dostarczył(a)eś?", "Which part of the project did you lead, who did you work with, and which deliverables did you produce?", "missing_personal_contribution");
  }
  return followUps.slice(0, 3);
}
