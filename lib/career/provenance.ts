import {interviewQuestions} from '@/data/interview-questions';
import {usableFacts,factSchema,type Fact} from '@/lib/resume/engine';
type SourceFact=Record<string,unknown>&Fact;
export function importCoverage(facts:SourceFact[]){
 const eligible=new Set(usableFacts(facts).map(f=>f.id));const validIds=new Set(interviewQuestions.map(q=>q.id));
 const coveredQuestionIds:string[]=[];const questionContexts:Record<string,string[]>={};
 for(const fact of facts){if(fact.source_type!=='import'||!eligible.has(fact.id))continue;
 const value=fact.structured_value as {question_coverage?:{question_id:string;coverage:string}[];coverage_confirmed?:boolean}|undefined;
 for(const coverage of value?.question_coverage||[]){if(!validIds.has(coverage.question_id))continue;(questionContexts[coverage.question_id]??=[]).push(fact.statement);
 if(coverage.coverage==='full'&&value?.coverage_confirmed===true)coveredQuestionIds.push(coverage.question_id);}
 }return {coveredQuestionIds:[...new Set(coveredQuestionIds)],questionContexts};
}
export function parsedFacts(rows:Record<string,unknown>[]){return rows.map(row=>({...row,...factSchema.parse(row)}));}

/** Exact user-specified exclusion phrases are never sent to the model. Matching facts are suppressed. */
export function applyExclusions(facts:Fact[],phrases:unknown):Fact[]{
 const terms=Array.isArray(phrases)?phrases.filter((v):v is string=>typeof v==='string').map(v=>v.trim().toLocaleLowerCase('pl')).filter(Boolean):[];
 return facts.map(f=>terms.some(term=>f.statement.toLocaleLowerCase('pl').includes(term))?{...f,excluded:true,forbidden_for_cv:true}:f);
}
