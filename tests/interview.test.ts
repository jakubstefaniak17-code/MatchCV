import { describe, expect, it } from "vitest";
import { interviewQuestions, interviewSections } from "../data/interview-questions";
import { deterministicFollowUps, getInterviewProgress, getNextQuestion, getQuestionsForSection, validateInterviewAnswer } from "../lib/interview/engine";

describe("versioned career interview", () => {
  it("contains exactly 11 sections of nine bilingual, fully described questions", () => {
    expect(interviewQuestions).toHaveLength(99);
    expect(interviewSections).toHaveLength(11);
    expect(new Set(interviewQuestions.map((q) => q.id)).size).toBe(99);
    interviewSections.forEach((section) => expect(getQuestionsForSection(section.id)).toHaveLength(9));
    interviewQuestions.forEach((q, index) => {
      expect(q.id).toBe(`Q${String(index + 1).padStart(3, "0")}`);
      expect(q.pl.length).toBeGreaterThan(15);
      expect(q.en.length).toBeGreaterThan(15);
      expect(q.pl).not.toBe(q.en);
      expect(q.why.length).toBeGreaterThan(10);
      expect(q.entities.length).toBeGreaterThan(0);
      expect(q.extractionInstructions).toContain("Never mark model inferences confirmed");
    });
  });
  it("preserves skip as unknown and accepts edits without double counting", () => {
    expect(validateInterviewAnswer("Q001", "skipped", "not a negative")).toEqual({ valid: true, value: { questionId: "Q001", state: "skipped", text: "" } });
    const progress = getInterviewProgress([
      { questionId: "Q001", state: "answered", text: "Previous" },
      { questionId: "Q001", state: "skipped", text: "" },
      { questionId: "Q002", state: "answered", text: "Updated title" },
    ]);
    expect(progress.answered).toBe(1);
    expect(progress.skipped).toBe(1);
    expect(progress.remaining).toBe(97);
  });
  it("does not ask explicitly covered imported questions again", () => {
    expect(getNextQuestion([], { answeredQuestionIds: ["Q001", "Q002"] })?.id).toBe("Q003");
    expect(getInterviewProgress([], { answeredQuestionIds: ["Q001", "unknown"] }).imported).toBe(1);
  });
  it("validates input and does not require all questions before generation", () => {
    expect(validateInterviewAnswer("Q001", "answered", " ").valid).toBe(false);
    expect(validateInterviewAnswer("Q999", "answered", "Hello").valid).toBe(false);
    expect(validateInterviewAnswer("Q001", "answered", "a".repeat(12001)).valid).toBe(false);
    expect(validateInterviewAnswer("Q001", "answered", "Project manager").valid).toBe(true);
    expect(interviewQuestions.every((q) => q.optional)).toBe(true);
  });
  it("offers evidence-oriented follow-ups offline without fabricating facts", () => {
    expect(deterministicFollowUps({ questionId: "Q019", state: "answered", text: "I managed infrastructure projects." }).length).toBeGreaterThan(0);
    expect(deterministicFollowUps({ questionId: "Q019", state: "skipped", text: "" })).toEqual([]);
    expect(deterministicFollowUps({ questionId: "Q087", state: "answered", text: "Private." })).toEqual([]);
  });
});
