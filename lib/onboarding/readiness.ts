import type {SupabaseClient} from '@supabase/supabase-js';
import {rows} from '@/lib/db/repository';
import {factSchema,usableFacts} from '@/lib/resume/engine';
import {importCoverage,parsedFacts} from '@/lib/career/provenance';
import type {OnboardingProgress} from './schema';
import {interviewQuestions} from '@/data/interview-questions';
export interface CareerReadiness{ready:boolean;canGenerate:boolean;gaps:string[];warnings:string[];confirmedFacts:number;publishableFacts:number}
export function assessCareerReadiness(rawFacts:Record<string,unknown>[]):CareerReadiness{
 const facts=rawFacts.map(f=>factSchema.parse(f));const published=usableFacts(facts);
 const confirmed=facts.filter(f=>['user_confirmed','document_supported'].includes(f.verification_status));
 const gaps:string[]=[];const warnings:string[]=[];
 if(!published.some(f=>f.fact_type==='identity'))gaps.push('Potwierdź imię i nazwisko oraz osobno zezwól na umieszczenie ich w CV.');
 if(!published.some(f=>['experience','education','project'].includes(f.fact_type)))gaps.push('Potwierdź przynajmniej jedno doświadczenie zawodowe, wykształcenie lub projekt i zezwól na użycie w CV.');
 if(!published.some(f=>f.fact_type==='contact'))warnings.push('Dane kontaktowe są opcjonalne. Dodaj je i zezwól na publikację, jeśli mają znaleźć się w dokumencie.');
 const pending=facts.filter(f=>['imported_unconfirmed','user_provided','disputed'].includes(f.verification_status)).length;
 if(pending)warnings.push(`${pending} informacji wymaga jeszcze sprawdzenia. Nie są podstawą gotowego CV.`);
 if(!published.some(f=>f.fact_type==='education'))warnings.push('Brakuje zatwierdzonej informacji o wykształceniu. Możesz uzupełnić ją później.');
 return {ready:gaps.length===0,canGenerate:gaps.length===0,gaps,warnings,confirmedFacts:confirmed.length,publishableFacts:published.length};
}
export function selectSetupQuestions(facts:Record<string,unknown>[],answers:Record<string,unknown>[]):string[]{
 const {coveredQuestionIds}=importCoverage(parsedFacts(facts));const covered=new Set(coveredQuestionIds);
 const answered=new Set(answers.filter(a=>['answered','skipped'].includes(String(a.status))).map(a=>a.question_id));
 const preferred=['MCV-Q009','MCV-Q006','MCV-Q013','MCV-Q025','MCV-Q008','MCV-Q010','MCV-Q014','MCV-Q027'];
 return preferred.filter(id=>!covered.has(id)&&!answered.has(id)&&interviewQuestions.some(q=>q.id===id&&q.storage_visibility!=='private_only')).slice(0,5);
}
export async function getCareerReadiness(db:SupabaseClient,userId:string){return assessCareerReadiness(await rows(db,'career_facts',userId));}
export async function onboardingContext(db:SupabaseClient,userId:string,progress?:OnboardingProgress){const [facts,answers]=await Promise.all([rows(db,'career_facts',userId),rows(db,'interview_answers',userId)]);return {readiness:assessCareerReadiness(facts),questionIds:progress&&progress.current_step>=4?progress.selected_question_ids:selectSetupQuestions(facts,answers)};}
