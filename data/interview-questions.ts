/** Versioned, bilingual interview bank. Question IDs are immutable persistence keys. */
export type InterviewSectionId = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K";
export interface InterviewQuestion {
  id: string;
  section: InterviewSectionId;
  pl: string;
  en: string;
  why: string;
  answerType: "text";
  validation: { minLength: number; maxLength: number };
  optional: boolean;
  entities: string[];
  competencies: string[];
  extractionInstructions: string;
  followUpTriggers: string[];
  requirementCategories: string[];
}
export const interviewBankVersion = "v0.3.1";
export const interviewSections: { id: InterviewSectionId; en: string; pl: string }[] = [{"id": "A", "en": "Professional identity", "pl": "Tożsamość zawodowa"}, {"id": "B", "en": "Employment history", "pl": "Historia zatrudnienia"}, {"id": "C", "en": "Project experience", "pl": "Doświadczenie projektowe"}, {"id": "D", "en": "Measurable achievements", "pl": "Mierzalne osiągnięcia"}, {"id": "E", "en": "Leadership and management", "pl": "Przywództwo i zarządzanie"}, {"id": "F", "en": "Technical skills and tools", "pl": "Umiejętności techniczne i narzędzia"}, {"id": "G", "en": "Business and commercial experience", "pl": "Doświadczenie biznesowe i handlowe"}, {"id": "H", "en": "Education and qualifications", "pl": "Wykształcenie i kwalifikacje"}, {"id": "I", "en": "Work environment and soft skills", "pl": "Środowisko pracy i kompetencje interpersonalne"}, {"id": "J", "en": "Career preferences and positioning", "pl": "Preferencje i pozycjonowanie zawodowe"}, {"id": "K", "en": "Advanced evidence and career narrative", "pl": "Dowody i narracja kariery"}];

export const interviewQuestions: InterviewQuestion[] = [
  {
    "id": "Q001",
    "section": "A",
    "pl": "Jak opisał(a)byś swoją tożsamość zawodową w dwóch lub trzech zdaniach?",
    "en": "How would you describe your professional identity in two or three sentences?",
    "why": "Defines the professional focus of your summary.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "career_profiles"
    ],
    "competencies": [
      "positioning",
      "seniority"
    ],
    "extractionInstructions": "For Q001, extract only explicitly stated information relevant to: How would you describe your professional identity in two or three sentences? Ask for concrete scope and evidence rather than aspirational titles. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "positioning",
      "seniority"
    ]
  },
  {
    "id": "Q002",
    "section": "A",
    "pl": "Jakie stanowiska zajmował(a)eś i które najlepiej oddaje rzeczywisty zakres Twojej odpowiedzialności?",
    "en": "What job titles have you held, and which title best reflects your actual level of responsibility?",
    "why": "Separates job titles from demonstrated responsibility.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "career_profiles"
    ],
    "competencies": [
      "positioning",
      "seniority"
    ],
    "extractionInstructions": "For Q002, extract only explicitly stated information relevant to: What job titles have you held, and which title best reflects your actual level of responsibility? Ask for concrete scope and evidence rather than aspirational titles. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "positioning",
      "seniority"
    ]
  },
  {
    "id": "Q003",
    "section": "A",
    "pl": "W jakich branżach pracował(a)eś i jaką rolę pełnił(a)eś w każdej z nich?",
    "en": "Which industries have you worked in, and what was your role in each?",
    "why": "Establishes relevant industry experience.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "career_profiles"
    ],
    "competencies": [
      "positioning",
      "seniority"
    ],
    "extractionInstructions": "For Q003, extract only explicitly stated information relevant to: Which industries have you worked in, and what was your role in each? Ask for concrete scope and evidence rather than aspirational titles. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "positioning",
      "seniority"
    ]
  },
  {
    "id": "Q004",
    "section": "A",
    "pl": "Jakie są trzy najmocniejsze obszary Twojej wiedzy i doświadczenia zawodowego?",
    "en": "What are the three strongest areas of your professional expertise?",
    "why": "Prioritizes competencies for the CV.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "career_profiles"
    ],
    "competencies": [
      "positioning",
      "seniority"
    ],
    "extractionInstructions": "For Q004, extract only explicitly stated information relevant to: What are the three strongest areas of your professional expertise? Ask for concrete scope and evidence rather than aspirational titles. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "positioning",
      "seniority"
    ]
  },
  {
    "id": "Q005",
    "section": "A",
    "pl": "Co wyróżnia Cię na tle osób z podobnym doświadczeniem?",
    "en": "What distinguishes you from professionals with similar experience?",
    "why": "Identifies a defensible professional differentiator.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "career_profiles"
    ],
    "competencies": [
      "positioning",
      "seniority"
    ],
    "extractionInstructions": "For Q005, extract only explicitly stated information relevant to: What distinguishes you from professionals with similar experience? Ask for concrete scope and evidence rather than aspirational titles. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "positioning",
      "seniority"
    ]
  },
  {
    "id": "Q006",
    "section": "A",
    "pl": "Na jakie stanowiska obecnie aplikujesz?",
    "en": "Which positions are you currently targeting?",
    "why": "Guides role-specific positioning.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "career_profiles"
    ],
    "competencies": [
      "positioning",
      "seniority"
    ],
    "extractionInstructions": "For Q006, extract only explicitly stated information relevant to: Which positions are you currently targeting? Ask for concrete scope and evidence rather than aspirational titles. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "positioning",
      "seniority"
    ]
  },
  {
    "id": "Q007",
    "section": "A",
    "pl": "Jakiego poziomu stanowiska szukasz i jakie doświadczenia potwierdzają gotowość do tej roli?",
    "en": "What level of seniority are you seeking, and what evidence supports that level?",
    "why": "Requires evidence for seniority claims.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "career_profiles"
    ],
    "competencies": [
      "positioning",
      "seniority"
    ],
    "extractionInstructions": "For Q007, extract only explicitly stated information relevant to: What level of seniority are you seeking, and what evidence supports that level? Ask for concrete scope and evidence rather than aspirational titles. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "positioning",
      "seniority"
    ]
  },
  {
    "id": "Q008",
    "section": "A",
    "pl": "Jakie obowiązki zawodowe najbardziej lubisz i wykonujesz najlepiej?",
    "en": "What professional responsibilities do you most enjoy and perform best?",
    "why": "Aligns strengths with desired work.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "career_profiles"
    ],
    "competencies": [
      "positioning",
      "seniority"
    ],
    "extractionInstructions": "For Q008, extract only explicitly stated information relevant to: What professional responsibilities do you most enjoy and perform best? Ask for concrete scope and evidence rather than aspirational titles. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "positioning",
      "seniority"
    ]
  },
  {
    "id": "Q009",
    "section": "A",
    "pl": "W jakim kierunku chcesz rozwijać karierę w ciągu najbliższych trzech do pięciu lat?",
    "en": "What career direction would you like to pursue over the next three to five years?",
    "why": "Captures future goals without inventing current experience.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "career_profiles"
    ],
    "competencies": [
      "positioning",
      "seniority"
    ],
    "extractionInstructions": "For Q009, extract only explicitly stated information relevant to: What career direction would you like to pursue over the next three to five years? Ask for concrete scope and evidence rather than aspirational titles. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "positioning",
      "seniority"
    ]
  },
  {
    "id": "Q010",
    "section": "B",
    "pl": "Wymień wszystkich istotnych pracodawców, stanowiska i okresy zatrudnienia.",
    "en": "List every relevant employer, position, and employment period.",
    "why": "Creates an accurate employment timeline.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "work_experiences",
      "achievements"
    ],
    "competencies": [
      "employment",
      "responsibilities"
    ],
    "extractionInstructions": "For Q010, extract only explicitly stated information relevant to: List every relevant employer, position, and employment period. Preserve official titles, actual responsibilities and exact periods separately. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "employment",
      "responsibilities"
    ]
  },
  {
    "id": "Q011",
    "section": "B",
    "pl": "Jaka była oficjalna nazwa każdego stanowiska i czy trafnie opisywała Twoje obowiązki?",
    "en": "What was the official title of each position, and did it accurately describe your responsibilities?",
    "why": "Preserves official titles and explanatory context.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "work_experiences",
      "achievements"
    ],
    "competencies": [
      "employment",
      "responsibilities"
    ],
    "extractionInstructions": "For Q011, extract only explicitly stated information relevant to: What was the official title of each position, and did it accurately describe your responsibilities? Preserve official titles, actual responsibilities and exact periods separately. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "employment",
      "responsibilities"
    ]
  },
  {
    "id": "Q012",
    "section": "B",
    "pl": "Jakie były Twoje główne codzienne obowiązki na każdym stanowisku?",
    "en": "What were your main daily responsibilities in each role?",
    "why": "Establishes the actual scope of each role.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "work_experiences",
      "achievements"
    ],
    "competencies": [
      "employment",
      "responsibilities"
    ],
    "extractionInstructions": "For Q012, extract only explicitly stated information relevant to: What were your main daily responsibilities in each role? Preserve official titles, actual responsibilities and exact periods separately. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "employment",
      "responsibilities"
    ]
  },
  {
    "id": "Q013",
    "section": "B",
    "pl": "Które obowiązki wykonywał(a)eś samodzielnie?",
    "en": "Which responsibilities did you perform independently?",
    "why": "Demonstrates independent execution.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "work_experiences",
      "achievements"
    ],
    "competencies": [
      "employment",
      "responsibilities"
    ],
    "extractionInstructions": "For Q013, extract only explicitly stated information relevant to: Which responsibilities did you perform independently? Preserve official titles, actual responsibilities and exact periods separately. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "employment",
      "responsibilities"
    ]
  },
  {
    "id": "Q014",
    "section": "B",
    "pl": "Jakie decyzje mogłeś lub mogłaś podejmować bez zgody przełożonego?",
    "en": "Which decisions could you make without managerial approval?",
    "why": "Establishes decision authority.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "work_experiences",
      "achievements"
    ],
    "competencies": [
      "employment",
      "responsibilities"
    ],
    "extractionInstructions": "For Q014, extract only explicitly stated information relevant to: Which decisions could you make without managerial approval? Preserve official titles, actual responsibilities and exact periods separately. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "employment",
      "responsibilities"
    ]
  },
  {
    "id": "Q015",
    "section": "B",
    "pl": "Jak zmieniały się Twoje obowiązki w trakcie zatrudnienia u każdego pracodawcy?",
    "en": "How did your responsibilities evolve during each employment period?",
    "why": "Captures growth without assuming a promotion.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "work_experiences",
      "achievements"
    ],
    "competencies": [
      "employment",
      "responsibilities"
    ],
    "extractionInstructions": "For Q015, extract only explicitly stated information relevant to: How did your responsibilities evolve during each employment period? Preserve official titles, actual responsibilities and exact periods separately. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "employment",
      "responsibilities"
    ]
  },
  {
    "id": "Q016",
    "section": "B",
    "pl": "Z jakimi działami, funkcjami lub jednostkami biznesowymi współpracował(a)eś?",
    "en": "Which departments, functions, or business units did you collaborate with?",
    "why": "Identifies cross-functional collaboration.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "work_experiences",
      "achievements"
    ],
    "competencies": [
      "employment",
      "responsibilities"
    ],
    "extractionInstructions": "For Q016, extract only explicitly stated information relevant to: Which departments, functions, or business units did you collaborate with? Preserve official titles, actual responsibilities and exact periods separately. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "employment",
      "responsibilities"
    ]
  },
  {
    "id": "Q017",
    "section": "B",
    "pl": "Jakie problemy operacyjne lub biznesowe miał(a)eś rozwiązać po zatrudnieniu?",
    "en": "What operational or business problems were you hired to solve?",
    "why": "Connects work with business needs.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "work_experiences",
      "achievements"
    ],
    "competencies": [
      "employment",
      "responsibilities"
    ],
    "extractionInstructions": "For Q017, extract only explicitly stated information relevant to: What operational or business problems were you hired to solve? Preserve official titles, actual responsibilities and exact periods separately. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "employment",
      "responsibilities"
    ]
  },
  {
    "id": "Q018",
    "section": "B",
    "pl": "Jakie osiągnięcia najlepiej podsumowują Twój wkład u każdego pracodawcy?",
    "en": "Which achievements best summarize your contribution to each employer?",
    "why": "Identifies employer-specific outcomes.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "work_experiences",
      "achievements"
    ],
    "competencies": [
      "employment",
      "responsibilities"
    ],
    "extractionInstructions": "For Q018, extract only explicitly stated information relevant to: Which achievements best summarize your contribution to each employer? Preserve official titles, actual responsibilities and exact periods separately. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "employment",
      "responsibilities"
    ]
  },
  {
    "id": "Q019",
    "section": "C",
    "pl": "Opisz najważniejsze projekty, przy których pracował(a)eś.",
    "en": "Describe the most important projects you have worked on.",
    "why": "Creates a reusable project portfolio.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "projects",
      "achievements"
    ],
    "competencies": [
      "projects",
      "delivery"
    ],
    "extractionInstructions": "For Q019, extract only explicitly stated information relevant to: Describe the most important projects you have worked on. Distinguish personal contribution from the result of the whole project. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "projects",
      "delivery"
    ]
  },
  {
    "id": "Q020",
    "section": "C",
    "pl": "Jaki był cel biznesowy każdego projektu?",
    "en": "What was the business objective of each project?",
    "why": "Connects project work to purpose.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "projects",
      "achievements"
    ],
    "competencies": [
      "projects",
      "delivery"
    ],
    "extractionInstructions": "For Q020, extract only explicitly stated information relevant to: What was the business objective of each project? Distinguish personal contribution from the result of the whole project. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "projects",
      "delivery"
    ]
  },
  {
    "id": "Q021",
    "section": "C",
    "pl": "Jaka była Twoja dokładna rola i zakres odpowiedzialności?",
    "en": "What was your exact role and scope of responsibility?",
    "why": "Prevents attributing team work entirely to one person.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "projects",
      "achievements"
    ],
    "competencies": [
      "projects",
      "delivery"
    ],
    "extractionInstructions": "For Q021, extract only explicitly stated information relevant to: What was your exact role and scope of responsibility? Distinguish personal contribution from the result of the whole project. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "projects",
      "delivery"
    ]
  },
  {
    "id": "Q022",
    "section": "C",
    "pl": "Jakie były budżety, czas trwania i wielkości zespołów projektów, o ile je znasz?",
    "en": "What were the project budgets, durations, and team sizes, where known?",
    "why": "Captures scale with explicit uncertainty.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "projects",
      "achievements"
    ],
    "competencies": [
      "projects",
      "delivery"
    ],
    "extractionInstructions": "For Q022, extract only explicitly stated information relevant to: What were the project budgets, durations, and team sizes, where known? Distinguish personal contribution from the result of the whole project. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "projects",
      "delivery"
    ]
  },
  {
    "id": "Q023",
    "section": "C",
    "pl": "Którymi fazami projektu osobiście zarządzał(a)eś lub w których uczestniczył(a)eś?",
    "en": "Which project phases did you personally manage or contribute to?",
    "why": "Establishes lifecycle involvement.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "projects",
      "achievements"
    ],
    "competencies": [
      "projects",
      "delivery"
    ],
    "extractionInstructions": "For Q023, extract only explicitly stated information relevant to: Which project phases did you personally manage or contribute to? Distinguish personal contribution from the result of the whole project. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "projects",
      "delivery"
    ]
  },
  {
    "id": "Q024",
    "section": "C",
    "pl": "Za przygotowanie lub zatwierdzenie jakich rezultatów i dokumentów odpowiadał(a)eś?",
    "en": "What deliverables were you responsible for producing or approving?",
    "why": "Identifies concrete deliverables.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "projects",
      "achievements"
    ],
    "competencies": [
      "projects",
      "delivery"
    ],
    "extractionInstructions": "For Q024, extract only explicitly stated information relevant to: What deliverables were you responsible for producing or approving? Distinguish personal contribution from the result of the whole project. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "projects",
      "delivery"
    ]
  },
  {
    "id": "Q025",
    "section": "C",
    "pl": "Jakie były główne wyzwania techniczne, organizacyjne lub handlowe?",
    "en": "What were the main technical, organizational, or commercial challenges?",
    "why": "Captures project complexity.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "projects",
      "achievements"
    ],
    "competencies": [
      "projects",
      "delivery"
    ],
    "extractionInstructions": "For Q025, extract only explicitly stated information relevant to: What were the main technical, organizational, or commercial challenges? Distinguish personal contribution from the result of the whole project. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "projects",
      "delivery"
    ]
  },
  {
    "id": "Q026",
    "section": "C",
    "pl": "Jak radził(a)eś sobie z opóźnieniami, zmianami, ryzykiem lub nieoczekiwanymi problemami?",
    "en": "How did you address delays, changes, risks, or unexpected problems?",
    "why": "Demonstrates risk and change management.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "projects",
      "achievements"
    ],
    "competencies": [
      "projects",
      "delivery"
    ],
    "extractionInstructions": "For Q026, extract only explicitly stated information relevant to: How did you address delays, changes, risks, or unexpected problems? Distinguish personal contribution from the result of the whole project. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "projects",
      "delivery"
    ]
  },
  {
    "id": "Q027",
    "section": "C",
    "pl": "Jakie mierzalne lub możliwe do zaobserwowania rezultaty osiągnęły projekty?",
    "en": "What measurable or observable results did the projects achieve?",
    "why": "Records outcomes without requiring invented numbers.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "projects",
      "achievements"
    ],
    "competencies": [
      "projects",
      "delivery"
    ],
    "extractionInstructions": "For Q027, extract only explicitly stated information relevant to: What measurable or observable results did the projects achieve? Distinguish personal contribution from the result of the whole project. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "projects",
      "delivery"
    ]
  },
  {
    "id": "Q028",
    "section": "D",
    "pl": "Z jakiego osiągnięcia zawodowego jesteś najbardziej dumny lub dumna?",
    "en": "Which professional achievement are you most proud of?",
    "why": "Identifies a strong evidence-backed achievement.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "achievements",
      "projects"
    ],
    "competencies": [
      "results",
      "commercial"
    ],
    "extractionInstructions": "For Q028, extract only explicitly stated information relevant to: Which professional achievement are you most proud of? Keep reported numbers, currency, units and uncertainty; never infer missing metrics. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "results",
      "commercial"
    ]
  },
  {
    "id": "Q029",
    "section": "D",
    "pl": "Czy obniżył(a)eś koszty, zwiększył(a)eś przychody lub poprawił(a)eś rentowność?",
    "en": "Have you reduced costs, increased revenue, or improved profitability?",
    "why": "Establishes financial impact only where reported.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "achievements",
      "projects"
    ],
    "competencies": [
      "results",
      "commercial"
    ],
    "extractionInstructions": "For Q029, extract only explicitly stated information relevant to: Have you reduced costs, increased revenue, or improved profitability? Keep reported numbers, currency, units and uncertainty; never infer missing metrics. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "results",
      "commercial"
    ]
  },
  {
    "id": "Q030",
    "section": "D",
    "pl": "Czy poprawił(a)eś produktywność, jakość lub efektywność procesów?",
    "en": "Have you improved productivity, quality, or process efficiency?",
    "why": "Captures operational improvements.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "achievements",
      "projects"
    ],
    "competencies": [
      "results",
      "commercial"
    ],
    "extractionInstructions": "For Q030, extract only explicitly stated information relevant to: Have you improved productivity, quality, or process efficiency? Keep reported numbers, currency, units and uncertainty; never infer missing metrics. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "results",
      "commercial"
    ]
  },
  {
    "id": "Q031",
    "section": "D",
    "pl": "Czy skrócił(a)eś czas realizacji, ograniczył(a)eś ryzyko operacyjne lub liczbę błędów?",
    "en": "Have you reduced delivery time, operational risk, or error rates?",
    "why": "Captures reductions with a comparison basis.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "achievements",
      "projects"
    ],
    "competencies": [
      "results",
      "commercial"
    ],
    "extractionInstructions": "For Q031, extract only explicitly stated information relevant to: Have you reduced delivery time, operational risk, or error rates? Keep reported numbers, currency, units and uncertainty; never infer missing metrics. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "results",
      "commercial"
    ]
  },
  {
    "id": "Q032",
    "section": "D",
    "pl": "Czy wdrożył(a)eś systemy lub procesy wykorzystywane przez innych pracowników?",
    "en": "Have you implemented systems or processes adopted by other employees?",
    "why": "Demonstrates adoption and organizational impact.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "achievements",
      "projects"
    ],
    "competencies": [
      "results",
      "commercial"
    ],
    "extractionInstructions": "For Q032, extract only explicitly stated information relevant to: Have you implemented systems or processes adopted by other employees? Keep reported numbers, currency, units and uncertainty; never infer missing metrics. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "results",
      "commercial"
    ]
  },
  {
    "id": "Q033",
    "section": "D",
    "pl": "Czy zarządzał(a)eś znaczącymi budżetami, kontraktami lub zasobami finansowymi?",
    "en": "Have you managed significant budgets, contracts, or financial resources?",
    "why": "Distinguishes managed resources from overall project value.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "achievements",
      "projects"
    ],
    "competencies": [
      "results",
      "commercial"
    ],
    "extractionInstructions": "For Q033, extract only explicitly stated information relevant to: Have you managed significant budgets, contracts, or financial resources? Keep reported numbers, currency, units and uncertainty; never infer missing metrics. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "results",
      "commercial"
    ]
  },
  {
    "id": "Q034",
    "section": "D",
    "pl": "Czy uczestniczył(a)eś w pozyskaniu klientów, kontraktów lub inwestycji?",
    "en": "Have you contributed to winning customers, contracts, or investments?",
    "why": "Attributes commercial results to the actual contribution.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "achievements",
      "projects"
    ],
    "competencies": [
      "results",
      "commercial"
    ],
    "extractionInstructions": "For Q034, extract only explicitly stated information relevant to: Have you contributed to winning customers, contracts, or investments? Keep reported numbers, currency, units and uncertainty; never infer missing metrics. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "results",
      "commercial"
    ]
  },
  {
    "id": "Q035",
    "section": "D",
    "pl": "Czy otrzymał(a)eś awans, nagrodę lub formalne wyróżnienie?",
    "en": "Have you received promotions, awards, or formal recognition?",
    "why": "Records verifiable recognition.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "achievements",
      "projects"
    ],
    "competencies": [
      "results",
      "commercial"
    ],
    "extractionInstructions": "For Q035, extract only explicitly stated information relevant to: Have you received promotions, awards, or formal recognition? Keep reported numbers, currency, units and uncertainty; never infer missing metrics. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "results",
      "commercial"
    ]
  },
  {
    "id": "Q036",
    "section": "D",
    "pl": "Jakie osiągnięcia możesz poprzeć liczbami, dokumentami lub referencjami?",
    "en": "Which achievements can you support with numbers, documents, or references?",
    "why": "Links claims to supporting evidence.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "achievements",
      "projects"
    ],
    "competencies": [
      "results",
      "commercial"
    ],
    "extractionInstructions": "For Q036, extract only explicitly stated information relevant to: Which achievements can you support with numbers, documents, or references? Keep reported numbers, currency, units and uncertainty; never infer missing metrics. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "results",
      "commercial"
    ]
  },
  {
    "id": "Q037",
    "section": "E",
    "pl": "Czy bezpośrednio zarządzał(a)eś pracownikami, wykonawcami lub zespołami zewnętrznymi?",
    "en": "Have you directly managed employees, contractors, or external teams?",
    "why": "Separates people management from supplier coordination.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "work_experiences",
      "projects"
    ],
    "competencies": [
      "leadership",
      "management"
    ],
    "extractionInstructions": "For Q037, extract only explicitly stated information relevant to: Have you directly managed employees, contractors, or external teams? Distinguish direct reports from coordination of contractors and stakeholders. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "leadership",
      "management"
    ]
  },
  {
    "id": "Q038",
    "section": "E",
    "pl": "Jaki był największy zespół lub grupa interesariuszy, którą koordynował(a)eś?",
    "en": "What was the largest team or group of stakeholders you coordinated?",
    "why": "Establishes coordination scope.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "work_experiences",
      "projects"
    ],
    "competencies": [
      "leadership",
      "management"
    ],
    "extractionInstructions": "For Q038, extract only explicitly stated information relevant to: What was the largest team or group of stakeholders you coordinated? Distinguish direct reports from coordination of contractors and stakeholders. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "leadership",
      "management"
    ]
  },
  {
    "id": "Q039",
    "section": "E",
    "pl": "Czy rekrutował(a)eś, wdrażał(a)eś, szkolił(a)eś lub mentorował(a)eś inne osoby?",
    "en": "Have you recruited, onboarded, trained, or mentored others?",
    "why": "Captures team development activities.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "work_experiences",
      "projects"
    ],
    "competencies": [
      "leadership",
      "management"
    ],
    "extractionInstructions": "For Q039, extract only explicitly stated information relevant to: Have you recruited, onboarded, trained, or mentored others? Distinguish direct reports from coordination of contractors and stakeholders. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "leadership",
      "management"
    ]
  },
  {
    "id": "Q040",
    "section": "E",
    "pl": "Jak przydzielasz obowiązki i monitorujesz postępy?",
    "en": "How do you assign responsibilities and monitor progress?",
    "why": "Establishes practical management methods.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "work_experiences",
      "projects"
    ],
    "competencies": [
      "leadership",
      "management"
    ],
    "extractionInstructions": "For Q040, extract only explicitly stated information relevant to: How do you assign responsibilities and monitor progress? Distinguish direct reports from coordination of contractors and stakeholders. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "leadership",
      "management"
    ]
  },
  {
    "id": "Q041",
    "section": "E",
    "pl": "Opisz trudną sytuację związaną z przywództwem lub zarządzaniem interesariuszami.",
    "en": "Describe a difficult leadership or stakeholder-management situation.",
    "why": "Provides an example of leadership under difficulty.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "work_experiences",
      "projects"
    ],
    "competencies": [
      "leadership",
      "management"
    ],
    "extractionInstructions": "For Q041, extract only explicitly stated information relevant to: Describe a difficult leadership or stakeholder-management situation. Distinguish direct reports from coordination of contractors and stakeholders. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "leadership",
      "management"
    ]
  },
  {
    "id": "Q042",
    "section": "E",
    "pl": "Czy rozwiązywał(a)eś konflikty między działami, dostawcami lub poszczególnymi osobami?",
    "en": "Have you managed conflicts between departments, suppliers, or individuals?",
    "why": "Captures conflict resolution evidence.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "work_experiences",
      "projects"
    ],
    "competencies": [
      "leadership",
      "management"
    ],
    "extractionInstructions": "For Q042, extract only explicitly stated information relevant to: Have you managed conflicts between departments, suppliers, or individuals? Distinguish direct reports from coordination of contractors and stakeholders. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "leadership",
      "management"
    ]
  },
  {
    "id": "Q043",
    "section": "E",
    "pl": "Czy raportował(a)eś bezpośrednio do kadry kierowniczej wyższego szczebla lub zarządu?",
    "en": "Have you reported directly to senior management or executives?",
    "why": "Establishes executive exposure accurately.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "work_experiences",
      "projects"
    ],
    "competencies": [
      "leadership",
      "management"
    ],
    "extractionInstructions": "For Q043, extract only explicitly stated information relevant to: Have you reported directly to senior management or executives? Distinguish direct reports from coordination of contractors and stakeholders. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "leadership",
      "management"
    ]
  },
  {
    "id": "Q044",
    "section": "E",
    "pl": "Na jakie decyzje strategiczne miał(a)eś wpływ?",
    "en": "Which strategic decisions have you influenced?",
    "why": "Distinguishes influence from final decision authority.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "work_experiences",
      "projects"
    ],
    "competencies": [
      "leadership",
      "management"
    ],
    "extractionInstructions": "For Q044, extract only explicitly stated information relevant to: Which strategic decisions have you influenced? Distinguish direct reports from coordination of contractors and stakeholders. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "leadership",
      "management"
    ]
  },
  {
    "id": "Q045",
    "section": "E",
    "pl": "Jak współpracownicy opisaliby Twój styl zarządzania i komunikacji?",
    "en": "How would colleagues describe your management and communication style?",
    "why": "Captures communication style with examples where possible.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "work_experiences",
      "projects"
    ],
    "competencies": [
      "leadership",
      "management"
    ],
    "extractionInstructions": "For Q045, extract only explicitly stated information relevant to: How would colleagues describe your management and communication style? Distinguish direct reports from coordination of contractors and stakeholders. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "leadership",
      "management"
    ]
  },
  {
    "id": "Q046",
    "section": "F",
    "pl": "Jakie dziedziny techniczne lub obszary specjalistyczne znasz?",
    "en": "Which technical disciplines or specialist domains do you understand?",
    "why": "Maps specialist domain knowledge.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "skills",
      "experience_skills"
    ],
    "competencies": [
      "technical",
      "methodologies"
    ],
    "extractionInstructions": "For Q046, extract only explicitly stated information relevant to: Which technical disciplines or specialist domains do you understand? Separate practical professional use from theoretical knowledge and certification. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "technical",
      "methodologies"
    ]
  },
  {
    "id": "Q047",
    "section": "F",
    "pl": "Z jakich platform i narzędzi korzystał(a)eś zawodowo?",
    "en": "Which software platforms and tools have you used professionally?",
    "why": "Records actual professional tool use.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "skills",
      "experience_skills"
    ],
    "competencies": [
      "technical",
      "methodologies"
    ],
    "extractionInstructions": "For Q047, extract only explicitly stated information relevant to: Which software platforms and tools have you used professionally? Separate practical professional use from theoretical knowledge and certification. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "technical",
      "methodologies"
    ]
  },
  {
    "id": "Q048",
    "section": "F",
    "pl": "Z jakich narzędzi potrafisz samodzielnie korzystać na zaawansowanym poziomie?",
    "en": "Which tools can you use independently at an advanced level?",
    "why": "Distinguishes depth from basic exposure.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "skills",
      "experience_skills"
    ],
    "competencies": [
      "technical",
      "methodologies"
    ],
    "extractionInstructions": "For Q048, extract only explicitly stated information relevant to: Which tools can you use independently at an advanced level? Separate practical professional use from theoretical knowledge and certification. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "technical",
      "methodologies"
    ]
  },
  {
    "id": "Q049",
    "section": "F",
    "pl": "Z jakich języków programowania, narzędzi automatyzacji lub technologii analitycznych korzystał(a)eś?",
    "en": "Which programming languages, automation tools, or analytical technologies have you used?",
    "why": "Maps practical automation and analytical skills.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "skills",
      "experience_skills"
    ],
    "competencies": [
      "technical",
      "methodologies"
    ],
    "extractionInstructions": "For Q049, extract only explicitly stated information relevant to: Which programming languages, automation tools, or analytical technologies have you used? Separate practical professional use from theoretical knowledge and certification. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "technical",
      "methodologies"
    ]
  },
  {
    "id": "Q050",
    "section": "F",
    "pl": "Jakie metodyki, normy lub ramy postępowania stosował(a)eś w praktyce?",
    "en": "Which methodologies, standards, or frameworks have you applied in practice?",
    "why": "Avoids confusing applied methods with certificates.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "skills",
      "experience_skills"
    ],
    "competencies": [
      "technical",
      "methodologies"
    ],
    "extractionInstructions": "For Q050, extract only explicitly stated information relevant to: Which methodologies, standards, or frameworks have you applied in practice? Separate practical professional use from theoretical knowledge and certification. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "technical",
      "methodologies"
    ]
  },
  {
    "id": "Q051",
    "section": "F",
    "pl": "Jakie dokumenty techniczne, analizy lub raporty potrafisz przygotowywać?",
    "en": "Which technical documents, analyses, or reports can you prepare?",
    "why": "Records concrete documentation capabilities.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "skills",
      "experience_skills"
    ],
    "competencies": [
      "technical",
      "methodologies"
    ],
    "extractionInstructions": "For Q051, extract only explicitly stated information relevant to: Which technical documents, analyses, or reports can you prepare? Separate practical professional use from theoretical knowledge and certification. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "technical",
      "methodologies"
    ]
  },
  {
    "id": "Q052",
    "section": "F",
    "pl": "Jakie systemy lub technologie wdrażał(a)eś lub integrował(a)eś?",
    "en": "Which systems or technologies have you implemented or integrated?",
    "why": "Captures implementation experience.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "skills",
      "experience_skills"
    ],
    "competencies": [
      "technical",
      "methodologies"
    ],
    "extractionInstructions": "For Q052, extract only explicitly stated information relevant to: Which systems or technologies have you implemented or integrated? Separate practical professional use from theoretical knowledge and certification. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "technical",
      "methodologies"
    ]
  },
  {
    "id": "Q053",
    "section": "F",
    "pl": "Jakie umiejętności techniczne potwierdzają ukończone projekty lub certyfikaty?",
    "en": "Which technical skills are supported by completed projects or certifications?",
    "why": "Links technical claims to evidence.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "skills",
      "experience_skills"
    ],
    "competencies": [
      "technical",
      "methodologies"
    ],
    "extractionInstructions": "For Q053, extract only explicitly stated information relevant to: Which technical skills are supported by completed projects or certifications? Separate practical professional use from theoretical knowledge and certification. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "technical",
      "methodologies"
    ]
  },
  {
    "id": "Q054",
    "section": "F",
    "pl": "Jakie umiejętności znasz teoretycznie, ale nie wykorzystywał(a)eś ich zawodowo?",
    "en": "Which skills do you know theoretically but have not used professionally?",
    "why": "Prevents theoretical knowledge becoming experience claims.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "skills",
      "experience_skills"
    ],
    "competencies": [
      "technical",
      "methodologies"
    ],
    "extractionInstructions": "For Q054, extract only explicitly stated information relevant to: Which skills do you know theoretically but have not used professionally? Separate practical professional use from theoretical knowledge and certification. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "technical",
      "methodologies"
    ]
  },
  {
    "id": "Q055",
    "section": "G",
    "pl": "Czy przygotowywał(a)eś budżety, uzasadnienia biznesowe lub prognozy finansowe?",
    "en": "Have you prepared budgets, business cases, or financial forecasts?",
    "why": "Establishes financial planning capabilities.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "projects",
      "achievements",
      "work_experiences"
    ],
    "competencies": [
      "commercial",
      "business"
    ],
    "extractionInstructions": "For Q055, extract only explicitly stated information relevant to: Have you prepared budgets, business cases, or financial forecasts? Extract the individual decision authority and contribution, not assumed business ownership. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "commercial",
      "business"
    ]
  },
  {
    "id": "Q056",
    "section": "G",
    "pl": "Czy uczestniczył(a)eś w zakupach, przetargach lub wyborze dostawców?",
    "en": "Have you participated in procurement, tenders, or supplier selection?",
    "why": "Maps procurement participation.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "projects",
      "achievements",
      "work_experiences"
    ],
    "competencies": [
      "commercial",
      "business"
    ],
    "extractionInstructions": "For Q056, extract only explicitly stated information relevant to: Have you participated in procurement, tenders, or supplier selection? Extract the individual decision authority and contribution, not assumed business ownership. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "commercial",
      "business"
    ]
  },
  {
    "id": "Q057",
    "section": "G",
    "pl": "Czy negocjował(a)eś umowy, ceny lub warunki handlowe?",
    "en": "Have you negotiated contracts, prices, or commercial conditions?",
    "why": "Records negotiation responsibility.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "projects",
      "achievements",
      "work_experiences"
    ],
    "competencies": [
      "commercial",
      "business"
    ],
    "extractionInstructions": "For Q057, extract only explicitly stated information relevant to: Have you negotiated contracts, prices, or commercial conditions? Extract the individual decision authority and contribution, not assumed business ownership. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "commercial",
      "business"
    ]
  },
  {
    "id": "Q058",
    "section": "G",
    "pl": "Czy zarządzał(a)eś relacjami z klientami lub partnerstwami biznesowymi?",
    "en": "Have you managed customer relationships or business partnerships?",
    "why": "Captures relationship ownership.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "projects",
      "achievements",
      "work_experiences"
    ],
    "competencies": [
      "commercial",
      "business"
    ],
    "extractionInstructions": "For Q058, extract only explicitly stated information relevant to: Have you managed customer relationships or business partnerships? Extract the individual decision authority and contribution, not assumed business ownership. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "commercial",
      "business"
    ]
  },
  {
    "id": "Q059",
    "section": "G",
    "pl": "Czy uczestniczył(a)eś w sprzedaży, rozwoju biznesu lub ekspansji rynkowej?",
    "en": "Have you contributed to sales, business development, or market expansion?",
    "why": "Records commercial contribution.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "projects",
      "achievements",
      "work_experiences"
    ],
    "competencies": [
      "commercial",
      "business"
    ],
    "extractionInstructions": "For Q059, extract only explicitly stated information relevant to: Have you contributed to sales, business development, or market expansion? Extract the individual decision authority and contribution, not assumed business ownership. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "commercial",
      "business"
    ]
  },
  {
    "id": "Q060",
    "section": "G",
    "pl": "Czy przygotowywał(a)eś prezentacje lub rekomendacje dla osób podejmujących decyzje?",
    "en": "Have you prepared presentations or recommendations for decision-makers?",
    "why": "Establishes decision-support communication.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "projects",
      "achievements",
      "work_experiences"
    ],
    "competencies": [
      "commercial",
      "business"
    ],
    "extractionInstructions": "For Q060, extract only explicitly stated information relevant to: Have you prepared presentations or recommendations for decision-makers? Extract the individual decision authority and contribution, not assumed business ownership. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "commercial",
      "business"
    ]
  },
  {
    "id": "Q061",
    "section": "G",
    "pl": "Czy współpracował(a)eś z inwestorami, regulatorami lub instytucjami publicznymi?",
    "en": "Have you worked with investors, regulators, or public institutions?",
    "why": "Records institutional stakeholder experience.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "projects",
      "achievements",
      "work_experiences"
    ],
    "competencies": [
      "commercial",
      "business"
    ],
    "extractionInstructions": "For Q061, extract only explicitly stated information relevant to: Have you worked with investors, regulators, or public institutions? Extract the individual decision authority and contribution, not assumed business ownership. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "commercial",
      "business"
    ]
  },
  {
    "id": "Q062",
    "section": "G",
    "pl": "Czy oceniał(a)eś ryzyko inwestycyjne, rentowność lub wykonalność biznesową?",
    "en": "Have you evaluated investment risks, profitability, or commercial feasibility?",
    "why": "Maps investment evaluation capabilities.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "projects",
      "achievements",
      "work_experiences"
    ],
    "competencies": [
      "commercial",
      "business"
    ],
    "extractionInstructions": "For Q062, extract only explicitly stated information relevant to: Have you evaluated investment risks, profitability, or commercial feasibility? Extract the individual decision authority and contribution, not assumed business ownership. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "commercial",
      "business"
    ]
  },
  {
    "id": "Q063",
    "section": "G",
    "pl": "Czy założył(a)eś lub prowadził(a)eś firmę, startup albo samodzielne przedsięwzięcie?",
    "en": "Have you established or managed a business, startup, or independent venture?",
    "why": "Establishes entrepreneurship without assuming scale.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "projects",
      "achievements",
      "work_experiences"
    ],
    "competencies": [
      "commercial",
      "business"
    ],
    "extractionInstructions": "For Q063, extract only explicitly stated information relevant to: Have you established or managed a business, startup, or independent venture? Extract the individual decision authority and contribution, not assumed business ownership. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "commercial",
      "business"
    ]
  },
  {
    "id": "Q064",
    "section": "H",
    "pl": "Jakie studia i kwalifikacje ukończył(a)eś?",
    "en": "What degrees and qualifications have you completed?",
    "why": "Records completed education accurately.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "education",
      "certifications",
      "languages"
    ],
    "competencies": [
      "education",
      "certifications",
      "languages"
    ],
    "extractionInstructions": "For Q064, extract only explicitly stated information relevant to: What degrees and qualifications have you completed? Preserve completed versus ongoing qualifications; do not equate training with certification. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "education",
      "certifications",
      "languages"
    ]
  },
  {
    "id": "Q065",
    "section": "H",
    "pl": "Jakie były Twoje specjalizacje akademickie i najważniejsze przedmioty?",
    "en": "What were your academic specializations and most relevant subjects?",
    "why": "Captures relevant educational focus.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "education",
      "certifications",
      "languages"
    ],
    "competencies": [
      "education",
      "certifications",
      "languages"
    ],
    "extractionInstructions": "For Q065, extract only explicitly stated information relevant to: What were your academic specializations and most relevant subjects? Preserve completed versus ongoing qualifications; do not equate training with certification. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "education",
      "certifications",
      "languages"
    ]
  },
  {
    "id": "Q066",
    "section": "H",
    "pl": "Czy realizował(a)eś badania, prace dyplomowe lub projekty akademickie istotne dla kariery?",
    "en": "Did you complete research, theses, or academic projects relevant to your career?",
    "why": "Identifies relevant academic work separately from employment.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "education",
      "certifications",
      "languages"
    ],
    "competencies": [
      "education",
      "certifications",
      "languages"
    ],
    "extractionInstructions": "For Q066, extract only explicitly stated information relevant to: Did you complete research, theses, or academic projects relevant to your career? Preserve completed versus ongoing qualifications; do not equate training with certification. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "education",
      "certifications",
      "languages"
    ]
  },
  {
    "id": "Q067",
    "section": "H",
    "pl": "Jakie certyfikaty zawodowe posiadasz?",
    "en": "Which professional certifications do you hold?",
    "why": "Records credentials with issuer and status.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "education",
      "certifications",
      "languages"
    ],
    "competencies": [
      "education",
      "certifications",
      "languages"
    ],
    "extractionInstructions": "For Q067, extract only explicitly stated information relevant to: Which professional certifications do you hold? Preserve completed versus ongoing qualifications; do not equate training with certification. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "education",
      "certifications",
      "languages"
    ]
  },
  {
    "id": "Q068",
    "section": "H",
    "pl": "Jakie licencje, uprawnienia lub zezwolenia zawodowe posiadasz?",
    "en": "Which professional licenses, permissions, or authorizations do you possess?",
    "why": "Captures formal authorizations accurately.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "education",
      "certifications",
      "languages"
    ],
    "competencies": [
      "education",
      "certifications",
      "languages"
    ],
    "extractionInstructions": "For Q068, extract only explicitly stated information relevant to: Which professional licenses, permissions, or authorizations do you possess? Preserve completed versus ongoing qualifications; do not equate training with certification. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "education",
      "certifications",
      "languages"
    ]
  },
  {
    "id": "Q069",
    "section": "H",
    "pl": "Jakie kursy, warsztaty lub szkolenia ukończył(a)eś?",
    "en": "Which courses, workshops, or training programs have you completed?",
    "why": "Separates training attendance from certification.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "education",
      "certifications",
      "languages"
    ],
    "competencies": [
      "education",
      "certifications",
      "languages"
    ],
    "extractionInstructions": "For Q069, extract only explicitly stated information relevant to: Which courses, workshops, or training programs have you completed? Preserve completed versus ongoing qualifications; do not equate training with certification. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "education",
      "certifications",
      "languages"
    ]
  },
  {
    "id": "Q070",
    "section": "H",
    "pl": "Czy prowadził(a)eś szkolenia zawodowe lub warsztaty edukacyjne?",
    "en": "Have you delivered professional training or educational workshops?",
    "why": "Captures training delivery, audience and subject.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "education",
      "certifications",
      "languages"
    ],
    "competencies": [
      "education",
      "certifications",
      "languages"
    ],
    "extractionInstructions": "For Q070, extract only explicitly stated information relevant to: Have you delivered professional training or educational workshops? Preserve completed versus ongoing qualifications; do not equate training with certification. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "education",
      "certifications",
      "languages"
    ]
  },
  {
    "id": "Q071",
    "section": "H",
    "pl": "Jakimi językami obcymi się posługujesz i na jakim poziomie?",
    "en": "Which foreign languages do you speak, and at what level?",
    "why": "Records stated language proficiency.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "education",
      "certifications",
      "languages"
    ],
    "competencies": [
      "education",
      "certifications",
      "languages"
    ],
    "extractionInstructions": "For Q071, extract only explicitly stated information relevant to: Which foreign languages do you speak, and at what level? Preserve completed versus ongoing qualifications; do not equate training with certification. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "education",
      "certifications",
      "languages"
    ]
  },
  {
    "id": "Q072",
    "section": "H",
    "pl": "Czy publikował(a)eś artykuły, badania, opracowania techniczne lub materiały zawodowe?",
    "en": "Have you published articles, research, technical papers, or professional materials?",
    "why": "Captures relevant publications and authorship.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "education",
      "certifications",
      "languages"
    ],
    "competencies": [
      "education",
      "certifications",
      "languages"
    ],
    "extractionInstructions": "For Q072, extract only explicitly stated information relevant to: Have you published articles, research, technical papers, or professional materials? Preserve completed versus ongoing qualifications; do not equate training with certification. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "education",
      "certifications",
      "languages"
    ]
  },
  {
    "id": "Q073",
    "section": "I",
    "pl": "Czy pracował(a)eś w zespołach międzynarodowych lub wielokulturowych?",
    "en": "Have you worked in international or multicultural teams?",
    "why": "Establishes cross-cultural collaboration.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "skills",
      "achievements"
    ],
    "competencies": [
      "communication",
      "collaboration"
    ],
    "extractionInstructions": "For Q073, extract only explicitly stated information relevant to: Have you worked in international or multicultural teams? Ground interpersonal competencies in the described situation, action and result. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "communication",
      "collaboration"
    ]
  },
  {
    "id": "Q074",
    "section": "I",
    "pl": "Czy współpracował(a)eś zdalnie, hybrydowo lub w wielu lokalizacjach?",
    "en": "Have you collaborated remotely, in hybrid arrangements, or across multiple locations?",
    "why": "Captures distributed-work experience.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "skills",
      "achievements"
    ],
    "competencies": [
      "communication",
      "collaboration"
    ],
    "extractionInstructions": "For Q074, extract only explicitly stated information relevant to: Have you collaborated remotely, in hybrid arrangements, or across multiple locations? Ground interpersonal competencies in the described situation, action and result. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "communication",
      "collaboration"
    ]
  },
  {
    "id": "Q075",
    "section": "I",
    "pl": "Opisz sytuację, w której rozwiązał(a)eś złożony problem pod presją.",
    "en": "Describe a situation where you solved a complex problem under pressure.",
    "why": "Grounds problem solving in a concrete example.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "skills",
      "achievements"
    ],
    "competencies": [
      "communication",
      "collaboration"
    ],
    "extractionInstructions": "For Q075, extract only explicitly stated information relevant to: Describe a situation where you solved a complex problem under pressure. Ground interpersonal competencies in the described situation, action and result. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "communication",
      "collaboration"
    ]
  },
  {
    "id": "Q076",
    "section": "I",
    "pl": "Opisz sytuację, w której musiał(a)eś szybko nauczyć się nowej umiejętności lub technologii.",
    "en": "Describe a situation where you had to learn a new skill or technology quickly.",
    "why": "Provides evidence of learning agility.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "skills",
      "achievements"
    ],
    "competencies": [
      "communication",
      "collaboration"
    ],
    "extractionInstructions": "For Q076, extract only explicitly stated information relevant to: Describe a situation where you had to learn a new skill or technology quickly. Ground interpersonal competencies in the described situation, action and result. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "communication",
      "collaboration"
    ]
  },
  {
    "id": "Q077",
    "section": "I",
    "pl": "Czy zarządzał(a)eś jednocześnie kilkoma konkurującymi priorytetami?",
    "en": "Have you managed several competing priorities simultaneously?",
    "why": "Captures prioritization under constraints.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "skills",
      "achievements"
    ],
    "competencies": [
      "communication",
      "collaboration"
    ],
    "extractionInstructions": "For Q077, extract only explicitly stated information relevant to: Have you managed several competing priorities simultaneously? Ground interpersonal competencies in the described situation, action and result. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "communication",
      "collaboration"
    ]
  },
  {
    "id": "Q078",
    "section": "I",
    "pl": "Jak przekazujesz złożone informacje techniczne lub biznesowe osobom bez specjalistycznej wiedzy?",
    "en": "How do you communicate complex technical or business information to non-specialists?",
    "why": "Establishes accessible communication practices.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "skills",
      "achievements"
    ],
    "competencies": [
      "communication",
      "collaboration"
    ],
    "extractionInstructions": "For Q078, extract only explicitly stated information relevant to: How do you communicate complex technical or business information to non-specialists? Ground interpersonal competencies in the described situation, action and result. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "communication",
      "collaboration"
    ]
  },
  {
    "id": "Q079",
    "section": "I",
    "pl": "Czy prowadził(a)eś zmiany organizacyjne lub pomagał(a)eś pracownikom wdrażać nowe procesy?",
    "en": "Have you led organizational change or helped employees adopt new processes?",
    "why": "Records change leadership and adoption work.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "skills",
      "achievements"
    ],
    "competencies": [
      "communication",
      "collaboration"
    ],
    "extractionInstructions": "For Q079, extract only explicitly stated information relevant to: Have you led organizational change or helped employees adopt new processes? Ground interpersonal competencies in the described situation, action and result. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "communication",
      "collaboration"
    ]
  },
  {
    "id": "Q080",
    "section": "I",
    "pl": "Jak podchodzisz do różnicy zdań, krytyki i trudnych informacji zwrotnych?",
    "en": "How do you approach disagreement, criticism, and difficult feedback?",
    "why": "Captures a constructive approach with examples.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "skills",
      "achievements"
    ],
    "competencies": [
      "communication",
      "collaboration"
    ],
    "extractionInstructions": "For Q080, extract only explicitly stated information relevant to: How do you approach disagreement, criticism, and difficult feedback? Ground interpersonal competencies in the described situation, action and result. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "communication",
      "collaboration"
    ]
  },
  {
    "id": "Q081",
    "section": "I",
    "pl": "Jakie mocne strony zawodowe możesz pokazać na konkretnych przykładach?",
    "en": "What professional strengths can you demonstrate through specific examples?",
    "why": "Grounds strengths in demonstrated behavior.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "skills",
      "achievements"
    ],
    "competencies": [
      "communication",
      "collaboration"
    ],
    "extractionInstructions": "For Q081, extract only explicitly stated information relevant to: What professional strengths can you demonstrate through specific examples? Ground interpersonal competencies in the described situation, action and result. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "communication",
      "collaboration"
    ]
  },
  {
    "id": "Q082",
    "section": "J",
    "pl": "Jakie role i branże najbardziej Cię interesują?",
    "en": "Which roles and industries are you most interested in?",
    "why": "Captures current targeting preferences.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "career_profiles"
    ],
    "competencies": [
      "preferences",
      "location",
      "compensation"
    ],
    "extractionInstructions": "For Q082, extract only explicitly stated information relevant to: Which roles and industries are you most interested in? Treat preferences as constraints, not evidence of skills; preserve exclusions verbatim. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "ambiguous_preference"
    ],
    "requirementCategories": [
      "preferences",
      "location",
      "compensation"
    ]
  },
  {
    "id": "Q083",
    "section": "J",
    "pl": "Jakich ról lub obowiązków wolisz unikać?",
    "en": "Which roles or responsibilities would you prefer to avoid?",
    "why": "Records negative preferences without inferring inability.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "career_profiles"
    ],
    "competencies": [
      "preferences",
      "location",
      "compensation"
    ],
    "extractionInstructions": "For Q083, extract only explicitly stated information relevant to: Which roles or responsibilities would you prefer to avoid? Treat preferences as constraints, not evidence of skills; preserve exclusions verbatim. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "ambiguous_preference"
    ],
    "requirementCategories": [
      "preferences",
      "location",
      "compensation"
    ]
  },
  {
    "id": "Q084",
    "section": "J",
    "pl": "Czy interesują Cię stanowiska specjalistyczne, menedżerskie, zarządcze czy doradcze?",
    "en": "Are you interested in specialist, managerial, executive, or consulting positions?",
    "why": "Captures role-type preference separately from qualification.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "career_profiles"
    ],
    "competencies": [
      "preferences",
      "location",
      "compensation"
    ],
    "extractionInstructions": "For Q084, extract only explicitly stated information relevant to: Are you interested in specialist, managerial, executive, or consulting positions? Treat preferences as constraints, not evidence of skills; preserve exclusions verbatim. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "ambiguous_preference"
    ],
    "requirementCategories": [
      "preferences",
      "location",
      "compensation"
    ]
  },
  {
    "id": "Q085",
    "section": "J",
    "pl": "Jakie formy zatrudnienia są dla Ciebie akceptowalne?",
    "en": "What employment arrangements are acceptable to you?",
    "why": "Records contract preferences.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "career_profiles"
    ],
    "competencies": [
      "preferences",
      "location",
      "compensation"
    ],
    "extractionInstructions": "For Q085, extract only explicitly stated information relevant to: What employment arrangements are acceptable to you? Treat preferences as constraints, not evidence of skills; preserve exclusions verbatim. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "ambiguous_preference"
    ],
    "requirementCategories": [
      "preferences",
      "location",
      "compensation"
    ]
  },
  {
    "id": "Q086",
    "section": "J",
    "pl": "Jakie lokalizacje, formy pracy zdalnej i wymagania dotyczące podróży są dla Ciebie akceptowalne?",
    "en": "What locations, remote-work arrangements, and travel requirements are acceptable?",
    "why": "Captures location and travel constraints.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "career_profiles"
    ],
    "competencies": [
      "preferences",
      "location",
      "compensation"
    ],
    "extractionInstructions": "For Q086, extract only explicitly stated information relevant to: What locations, remote-work arrangements, and travel requirements are acceptable? Treat preferences as constraints, not evidence of skills; preserve exclusions verbatim. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "ambiguous_preference"
    ],
    "requirementCategories": [
      "preferences",
      "location",
      "compensation"
    ]
  },
  {
    "id": "Q087",
    "section": "J",
    "pl": "Jakie są Twoje oczekiwania finansowe i czy należy pominąć je w CV?",
    "en": "What are your compensation expectations, and should they be excluded from your CV?",
    "why": "Protects optional compensation privacy.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "career_profiles"
    ],
    "competencies": [
      "preferences",
      "location",
      "compensation"
    ],
    "extractionInstructions": "For Q087, extract only explicitly stated information relevant to: What are your compensation expectations, and should they be excluded from your CV? Treat preferences as constraints, not evidence of skills; preserve exclusions verbatim. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "ambiguous_preference"
    ],
    "requirementCategories": [
      "preferences",
      "location",
      "compensation"
    ]
  },
  {
    "id": "Q088",
    "section": "J",
    "pl": "Czy rozważasz relokację lub pracę za granicą?",
    "en": "Are you open to relocation or international employment?",
    "why": "Records mobility preferences.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "career_profiles"
    ],
    "competencies": [
      "preferences",
      "location",
      "compensation"
    ],
    "extractionInstructions": "For Q088, extract only explicitly stated information relevant to: Are you open to relocation or international employment? Treat preferences as constraints, not evidence of skills; preserve exclusions verbatim. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "ambiguous_preference"
    ],
    "requirementCategories": [
      "preferences",
      "location",
      "compensation"
    ]
  },
  {
    "id": "Q089",
    "section": "J",
    "pl": "Jakie osiągnięcia zawodowe powinny być najmocniej wyeksponowane?",
    "en": "Which professional achievements should receive the strongest emphasis?",
    "why": "Captures editorial priority among actual achievements.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "career_profiles"
    ],
    "competencies": [
      "preferences",
      "location",
      "compensation"
    ],
    "extractionInstructions": "For Q089, extract only explicitly stated information relevant to: Which professional achievements should receive the strongest emphasis? Treat preferences as constraints, not evidence of skills; preserve exclusions verbatim. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "ambiguous_preference"
    ],
    "requirementCategories": [
      "preferences",
      "location",
      "compensation"
    ]
  },
  {
    "id": "Q090",
    "section": "J",
    "pl": "Jakie informacje osobiste lub zawodowe nigdy nie powinny pojawić się w generowanych dokumentach?",
    "en": "Which personal or professional details should never appear in generated documents?",
    "why": "Defines explicit exclusions and confidentiality constraints.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "career_profiles"
    ],
    "competencies": [
      "preferences",
      "location",
      "compensation"
    ],
    "extractionInstructions": "For Q090, extract only explicitly stated information relevant to: Which personal or professional details should never appear in generated documents? Treat preferences as constraints, not evidence of skills; preserve exclusions verbatim. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "ambiguous_preference"
    ],
    "requirementCategories": [
      "preferences",
      "location",
      "compensation"
    ]
  },
  {
    "id": "Q091",
    "section": "K",
    "pl": "Opisz projekt, który początkowo wydawał się nieudany, ale przyniósł wartościowe rezultaty.",
    "en": "Describe a project that initially appeared unsuccessful but produced valuable results.",
    "why": "Captures nuanced outcomes without disguising failures.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "career_facts",
      "projects",
      "achievements"
    ],
    "competencies": [
      "strategy",
      "innovation",
      "ownership"
    ],
    "extractionInstructions": "For Q091, extract only explicitly stated information relevant to: Describe a project that initially appeared unsuccessful but produced valuable results. Preserve confidentiality and uncertain or unusual circumstances without speculative explanations. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "strategy",
      "innovation",
      "ownership"
    ]
  },
  {
    "id": "Q092",
    "section": "K",
    "pl": "Opisz wyzwanie zawodowe, które wymagało niekonwencjonalnego rozwiązania.",
    "en": "Describe a professional challenge that required an unconventional solution.",
    "why": "Establishes applied creativity.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "career_facts",
      "projects",
      "achievements"
    ],
    "competencies": [
      "strategy",
      "innovation",
      "ownership"
    ],
    "extractionInstructions": "For Q092, extract only explicitly stated information relevant to: Describe a professional challenge that required an unconventional solution. Preserve confidentiality and uncertain or unusual circumstances without speculative explanations. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "strategy",
      "innovation",
      "ownership"
    ]
  },
  {
    "id": "Q093",
    "section": "K",
    "pl": "Czy pracował(a)eś w środowisku silnie regulowanym, poufnym lub wrażliwym pod względem bezpieczeństwa?",
    "en": "Have you worked in highly regulated, confidential, or security-sensitive environments?",
    "why": "Identifies sensitive experience without requesting secret details.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "career_facts",
      "projects",
      "achievements"
    ],
    "competencies": [
      "strategy",
      "innovation",
      "ownership"
    ],
    "extractionInstructions": "For Q093, extract only explicitly stated information relevant to: Have you worked in highly regulated, confidential, or security-sensitive environments? Preserve confidentiality and uncertain or unusual circumstances without speculative explanations. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "strategy",
      "innovation",
      "ownership"
    ]
  },
  {
    "id": "Q094",
    "section": "K",
    "pl": "Czy koordynował(a)eś złożone projekty obejmujące wiele organizacji lub jurysdykcji?",
    "en": "Have you coordinated complex projects involving multiple organizations or jurisdictions?",
    "why": "Establishes multi-organization complexity.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "career_facts",
      "projects",
      "achievements"
    ],
    "competencies": [
      "strategy",
      "innovation",
      "ownership"
    ],
    "extractionInstructions": "For Q094, extract only explicitly stated information relevant to: Have you coordinated complex projects involving multiple organizations or jurisdictions? Preserve confidentiality and uncertain or unusual circumstances without speculative explanations. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "strategy",
      "innovation",
      "ownership"
    ]
  },
  {
    "id": "Q095",
    "section": "K",
    "pl": "Jakie doświadczenia zawodowe pokazują myślenie strategiczne wykraczające poza realizację operacyjną?",
    "en": "Which professional experiences demonstrate strategic thinking rather than only operational execution?",
    "why": "Grounds strategic positioning in actual decisions.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "career_facts",
      "projects",
      "achievements"
    ],
    "competencies": [
      "strategy",
      "innovation",
      "ownership"
    ],
    "extractionInstructions": "For Q095, extract only explicitly stated information relevant to: Which professional experiences demonstrate strategic thinking rather than only operational execution? Preserve confidentiality and uncertain or unusual circumstances without speculative explanations. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "strategy",
      "innovation",
      "ownership"
    ]
  },
  {
    "id": "Q096",
    "section": "K",
    "pl": "Jakie doświadczenia pokazują innowacyjność, automatyzację lub transformację cyfrową?",
    "en": "Which experiences demonstrate innovation, automation, or digital transformation?",
    "why": "Maps transformation claims to real examples.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "career_facts",
      "projects",
      "achievements"
    ],
    "competencies": [
      "strategy",
      "innovation",
      "ownership"
    ],
    "extractionInstructions": "For Q096, extract only explicitly stated information relevant to: Which experiences demonstrate innovation, automation, or digital transformation? Preserve confidentiality and uncertain or unusual circumstances without speculative explanations. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "strategy",
      "innovation",
      "ownership"
    ]
  },
  {
    "id": "Q097",
    "section": "K",
    "pl": "Jakie doświadczenia pokazują odpowiedzialność za rezultaty od planowania do realizacji?",
    "en": "Which experiences demonstrate ownership of results from planning through delivery?",
    "why": "Establishes end-to-end ownership accurately.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "career_facts",
      "projects",
      "achievements"
    ],
    "competencies": [
      "strategy",
      "innovation",
      "ownership"
    ],
    "extractionInstructions": "For Q097, extract only explicitly stated information relevant to: Which experiences demonstrate ownership of results from planning through delivery? Preserve confidentiality and uncertain or unusual circumstances without speculative explanations. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "strategy",
      "innovation",
      "ownership"
    ]
  },
  {
    "id": "Q098",
    "section": "K",
    "pl": "Czy są przerwy w zatrudnieniu, zmiany ścieżki kariery, nakładające się role lub nietypowe okoliczności wymagające rzetelnego wyjaśnienia?",
    "en": "Are there employment gaps, career transitions, overlapping roles, or unusual circumstances that require accurate explanation?",
    "why": "Preserves accurate chronology and voluntary explanations.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "career_facts",
      "projects",
      "achievements"
    ],
    "competencies": [
      "strategy",
      "innovation",
      "ownership"
    ],
    "extractionInstructions": "For Q098, extract only explicitly stated information relevant to: Are there employment gaps, career transitions, overlapping roles, or unusual circumstances that require accurate explanation? Preserve confidentiality and uncertain or unusual circumstances without speculative explanations. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "strategy",
      "innovation",
      "ownership"
    ]
  },
  {
    "id": "Q099",
    "section": "K",
    "pl": "Jakich ważnych informacji o Twojej wartości zawodowej nie objęły poprzednie pytania?",
    "en": "What important information about your professional value has not been covered by the previous questions?",
    "why": "Allows important evidence outside the predefined categories.",
    "answerType": "text",
    "validation": {
      "minLength": 2,
      "maxLength": 12000
    },
    "optional": true,
    "entities": [
      "career_facts",
      "projects",
      "achievements"
    ],
    "competencies": [
      "strategy",
      "innovation",
      "ownership"
    ],
    "extractionInstructions": "For Q099, extract only explicitly stated information relevant to: What important information about your professional value has not been covered by the previous questions? Preserve confidentiality and uncertain or unusual circumstances without speculative explanations. Keep the original answer as a source. Never mark model inferences confirmed. A skip is unknown, never a negative answer.",
    "followUpTriggers": [
      "vague_scope",
      "missing_personal_contribution",
      "missing_evidence"
    ],
    "requirementCategories": [
      "strategy",
      "innovation",
      "ownership"
    ]
  }
];
