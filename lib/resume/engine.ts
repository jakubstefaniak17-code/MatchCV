import { z } from 'zod';
import {buildCareerContext,contextForFacts,chronologyEntries,entitySnapshot,type CareerContext} from './context';
import {semanticRelevance,retrieveCandidates,rankEvidence,verifyEvidence} from './semantic';
import {assessClaim,editorialClaimKey,approvedSourceText} from './editorial';
export {buildCareerContext} from './context';
export type {CareerContext} from './context';
export {editorialClaimKey,assessClaim} from './editorial';

export const templateSchema = z.enum(['executive_clarity', 'modern_studio']);
export type TemplateId = z.infer<typeof templateSchema>;
export const templateLabels: Record<TemplateId, string> = {executive_clarity:'Executive Clarity',modern_studio:'Modern Studio'};
/** Historical drafts retain every claim; only the obsolete presentation identifier changes. */
export function normalizeLegacyTemplate(value: unknown): TemplateId {
  if(value==='modern_studio'||value==='technical')return 'modern_studio';
  if(value==='executive_clarity'||value==='professional'||value==='executive')return 'executive_clarity';
  throw new Error('Unknown CV template. Choose Executive Clarity or Modern Studio.');
}
export const factSchema = z.object({
  id: z.string().uuid(), statement: z.string().min(1).max(4000), fact_type: z.string().default('experience'),
  verification_status: z.enum(['imported_unconfirmed', 'user_provided', 'user_confirmed', 'document_supported', 'disputed', 'rejected']),
  source_reference:z.string().nullable().optional(), source_type:z.string().optional(), structured_value:z.record(z.string(),z.unknown()).optional(), related_experience_id:z.string().nullable().optional(), related_project_id:z.string().nullable().optional(),
  excluded: z.boolean().optional(), confidential: z.boolean().optional(), private:z.boolean().optional(), forbidden_for_cv:z.boolean().optional(),
});
export type Fact = z.infer<typeof factSchema>;
export const requirementSchema = z.object({ id: z.string(), statement: z.string().min(1), category: z.string(), priority: z.enum(['mandatory','preferred','responsibility']) });
export type Requirement = z.infer<typeof requirementSchema>;
export const jobAnalysisSchema = z.object({ title: z.string(), employer: z.string().nullable(), location: z.string().nullable().default(null), seniority: z.string().nullable().default(null), keywords: z.array(z.string()).default([]), requirements: z.array(requirementSchema).max(100) });
export type JobAnalysis = z.infer<typeof jobAnalysisSchema>;
export type EvidenceStatus = 'supported' | 'partial' | 'not_established' | 'explicitly_unsupported';
export interface EvidenceMapping { requirementId:string;factIds:string[];status:EvidenceStatus;proposedStatement:string|null;followUp:string|null;confidence?:'high'|'medium'|'low';verification?:{factId:string;status:EvidenceStatus;confidence:'high'|'medium'|'low';reason:string;matchedConcepts:string[]}[] }
export const resumeClaimSchema=z.object({text:z.string().max(12000),factIds:z.array(z.string().uuid()).min(1),editorialApproved:z.boolean().optional()});
export type ResumeClaim=z.infer<typeof resumeClaimSchema>;
export const employmentSchema=z.object({id:z.string(),employer:z.string(),position:z.string(),startDate:z.string().nullable(),endDate:z.string().nullable(),location:z.string().nullable().optional(),isCurrent:z.boolean().optional(),factIds:z.array(z.string().uuid()).min(1),claims:z.array(resumeClaimSchema)});
export type EmploymentEntry=z.infer<typeof employmentSchema>;
export const resumeSchema = z.object({
  title: z.string().max(300), language: z.enum(['pl','en']), template: templateSchema,
  headline: z.string().max(400), summary: z.string().max(16000),
  person:z.object({name:z.string().max(4000).optional(),contact:z.array(z.string().max(4000)).max(12),factIds:z.array(z.string().uuid()).min(1)}).optional(),
  summaryClaims:z.array(resumeClaimSchema).optional(),employment:z.array(employmentSchema).optional(),
  generation:z.object({mode:z.enum(['ai','basic']),status:z.enum(['ready_for_review','editorial_review_required','basic_draft']),warnings:z.array(z.string()),engineVersion:z.string().optional(),recommendedPages:z.number().int().min(1).max(3).optional(),editorialApprovals:z.array(z.string()).optional()}).optional(),
  sections:z.array(z.object({id:z.string(),title:z.string(),hidden:z.boolean().default(false),claims:z.array(resumeClaimSchema)})),
});
export type Resume = z.infer<typeof resumeSchema>;
export function normalizeLegacyResume(value:unknown):Resume {
  if(!value||typeof value!=='object')throw new Error('Invalid saved CV.');
  const draft=value as Record<string,unknown>;
  return resumeSchema.parse({...draft,template:normalizeLegacyTemplate(draft.template)});
}
export function usableFacts(facts: Fact[]): Fact[] {
  return facts.filter(f => ['user_confirmed','document_supported'].includes(f.verification_status) && !f.excluded && !f.confidential && !f.private && !f.forbidden_for_cv && !['preference','interpretation'].includes(String(f.structured_value?.information_kind)));
}
export function relevance(text:string,context:string):number{return semanticRelevance(text,context);}
export function mapEvidence(requirements:Requirement[],facts:Fact[]):EvidenceMapping[]{
 const safe=usableFacts(facts).filter(f=>!['identity','contact'].includes(f.fact_type));
 return requirements.map(requirement=>{
  const candidates=rankEvidence(retrieveCandidates(requirement,safe)).slice(0,6),verification=candidates.map(c=>verifyEvidence(requirement,c));
  const best=verification.find(v=>v.status==='supported')??verification.find(v=>v.status==='partial')??verification[0];
  return {requirementId:requirement.id,factIds:candidates.map(c=>c.fact.id),status:best?.status??'not_established',confidence:best?.confidence??'low',verification,proposedStatement:candidates[0]?.fact.statement??null,followUp:best?.status==='supported'?null:`${requirement.statement} — provide scope, personal contribution and supporting evidence.`};
 });
}
const labels = {pl:{experience:'Doświadczenie zawodowe',achievement:'Wybrane osiągnięcia',education:'Wykształcenie',certification:'Certyfikaty',language:'Języki',skill:'Kompetencje',project:'Wybrane projekty',other:'Pozostałe doświadczenia'},en:{experience:'Professional experience',achievement:'Selected achievements',education:'Education',certification:'Certifications',language:'Languages',skill:'Core competencies',project:'Selected projects',other:'Additional experience'}};
export function summaryLabel(language:'pl'|'en',template:TemplateId):string{return template==='modern_studio'?(language==='pl'?'Kim jestem':'About me'):(language==='pl'?'Profil zawodowy':'Professional profile');}
export interface ResumeInput {facts:Fact[];analysis:JobAnalysis;language:'pl'|'en';template:TemplateId;context?:CareerContext}
export function recommendedPages(context:CareerContext,facts:Fact[]):number{
 const seniority=context.profile.seniority??'';if(/executive|director|dyrektor|c.level/i.test(seniority)||context.entities.filter(e=>e.entity==='work_experiences').length>=6)return 3;
 if(/senior|manager|lead|kierownik/i.test(seniority)||facts.length>=14)return 2;return 1;
}
export function generateResume(input:ResumeInput):Resume {
 const allFacts=usableFacts(input.facts),facts=allFacts.filter(f=>!['identity','contact'].includes(f.fact_type));
 if(!facts.length)throw new Error('Confirm at least one non-confidential career fact before generating a CV.');
 const context=contextForFacts(input.context,allFacts),target=input.analysis.requirements.map(r=>r.statement).join(' ');
 const ranked=[...facts].sort((a,b)=>relevance(approvedSourceText(b),target)-relevance(approvedSourceText(a),target));
 const employment:EmploymentEntry[]=chronologyEntries(context).map(entity=>{
  const data=entity.data;const linked=ranked.filter(f=>!entity.factIds.includes(f.id)&&(f.related_experience_id===entity.id||f.source_reference===`work_experiences:${entity.id}`));
  const scope=typeof data.responsibility_scope==='string'?data.responsibility_scope:null;
  const claims:ResumeClaim[]=[...(scope?[{text:scope,factIds:entity.factIds}]:[]),...linked.map(f=>({text:f.statement,factIds:[f.id]}))];
  return {id:entity.id,employer:String(data.employer),position:String(data.position),startDate:typeof data.start_date==='string'?data.start_date:entity.period?.start??null,endDate:typeof data.end_date==='string'?data.end_date:entity.period?.end??null,location:typeof data.location==='string'?data.location:null,...(!data.end_date&&(entity.period?.isCurrent||entity.factIds.some(id=>/\b(present|current|obecnie|nadal)\b/i.test(allFacts.find(f=>f.id===id)?.statement??'')))?{isCurrent:true}:{}),factIds:entity.factIds,claims};
 });
 const assigned=new Set(employment.flatMap(e=>[...e.factIds,...e.claims.flatMap(c=>c.factIds)]));
 const modern=input.template==='modern_studio',order=modern?['skill','project','experience','education','certification','language','other']:['achievement','experience','skill','project','education','certification','language','other'];
 const sections=order.map(id=>{
  let title=labels[input.language][id as keyof typeof labels.en];
  if(modern&&id==='skill')title=input.language==='pl'?'Kompetencje i narzędzia':'Skills and tools';
  if(modern&&id==='project')title=input.language==='pl'?'Wybrane projekty i rezultaty':'Selected projects and results';
  if(modern&&id==='experience')title=input.language==='pl'?'Doświadczenie':'Experience';
  if(modern&&id==='education')title=input.language==='pl'?'Wykształcenie i rozwój':'Education and development';
  const claims=ranked.filter(f=>modern&&id==='project'?['project','achievement'].includes(f.fact_type):(Object.keys(labels.en).includes(f.fact_type)?f.fact_type:'other')===id).filter(f=>id!=='experience'||!assigned.has(f.id)).filter(f=>!['project','achievement'].includes(id)||!target||relevance(approvedSourceText(f),target)>0).map(f=>({text:f.statement,factIds:[f.id]}));
  return {id,title,hidden:false,claims};
 }).filter(section=>section.claims.length||(section.id==='experience'&&employment.length));
 const identity=allFacts.find(f=>f.fact_type==='identity'),contact=allFacts.filter(f=>f.fact_type==='contact').slice(0,12);
 const person=identity||contact.length?{...(identity?{name:identity.statement}:{}),contact:contact.map(f=>f.statement),factIds:[...(identity?[identity.id]:[]),...contact.map(f=>f.id)]}:undefined;
 const summaryFacts=ranked.filter(f=>!['education','certification','language'].includes(f.fact_type)).slice(0,recommendedPages(context,facts)>=2?4:3),summaryClaims=summaryFacts.map(f=>({text:f.statement,factIds:[f.id]}));
 const resume:Resume={title:input.analysis.title,language:input.language,template:input.template,headline:`${input.language==='pl'?'Rola docelowa':'Target role'}: ${input.analysis.title}`,summary:summaryClaims.map(c=>c.text).join('\n'),summaryClaims,...(person?{person}:{}),...(employment.length?{employment}:{}),sections,generation:{mode:'basic',status:'basic_draft',engineVersion:'2.0',recommendedPages:recommendedPages(context,facts),warnings:['Basic source-based draft, not professional AI composition. Original wording may require editing or translation.',...context.warnings]}};
 const result=validateResume(resume,allFacts,{context});if(!result.valid)throw new Error(result.errors.join('; '));return resume;
}
export function resumeClaims(resume:Resume):ResumeClaim[]{return [...(resume.summaryClaims??[]),...resume.sections.flatMap(s=>s.claims),...(resume.employment??[]).flatMap(e=>e.claims)];}
export interface ValidationOptions {allowPendingEditorial?:boolean;approvedEditorialClaims?:string[];context?:CareerContext}
export function validateResume(resume:Resume,facts:Fact[],options:ValidationOptions={}):{valid:boolean;errors:string[];warnings:string[];needsEditorialReview:boolean}{
 const eligible=usableFacts(facts),safe=new Map(eligible.map(f=>[f.id,f])),errors:string[]=[],warnings:string[]=[];let needsEditorialReview=false;
 const approvals=new Set(options.approvedEditorialClaims??[]);
 const checkClaim=(claim:ResumeClaim)=>{const result=assessClaim(claim,eligible);errors.push(...result.errors);warnings.push(...result.warnings);if(result.status==='needs_editorial_review'&&!approvals.has(editorialClaimKey(claim,eligible))){needsEditorialReview=true;if(!options.allowPendingEditorial)errors.push('Edited wording requires explicit editorial approval against its cited sources.');}};
 resumeClaims(resume).forEach(checkClaim);
 if(resume.summaryClaims){if(resume.summary!==resume.summaryClaims.map(c=>c.text).join('\n'))errors.push('Summary text differs from its source-linked composition.');}
 else for(const line of resume.summary.split('\n').filter(Boolean)){const source=eligible.find(f=>f.statement===line&&!['identity','contact'].includes(f.fact_type));if(!source)errors.push('Legacy summary contains unsupported wording.');}
 if(resume.person){const refs=resume.person.factIds.map(id=>safe.get(id));if(refs.some(f=>!f||!['identity','contact'].includes(f.fact_type)))errors.push('Header contains an unknown, unconfirmed or private identity/contact source.');if(resume.person.name&&!refs.some(f=>f?.fact_type==='identity'&&f.statement===resume.person?.name))errors.push('Name differs from its confirmed identity source.');if(resume.person.contact.some(text=>!refs.some(f=>f?.fact_type==='contact'&&f.statement===text)))errors.push('Contact details differ from their confirmed sources.');}
 const context=contextForFacts(options.context??buildCareerContext({facts:eligible}),eligible),expected=chronologyEntries(context);
 for(const entry of resume.employment??[]){
  const sources=entry.factIds.map(id=>safe.get(id));if(sources.some(f=>!f))errors.push('Employment header refers to missing or non-public evidence.');
  const snapshots=sources.filter((f):f is Fact=>Boolean(f)).map(entitySnapshot).filter(e=>e?.entity==='work_experiences'&&e.id===entry.id);
  if(!snapshots.length)errors.push('Employment header has no confirmed structured source.');
  for(const [field,value] of [['employer',entry.employer],['position',entry.position],['start_date',entry.startDate],['end_date',entry.endDate],['location',entry.location??null]] as const)if(!snapshots.some(snapshot=>(snapshot?.data[field]??(field==='start_date'?snapshot?.period?.start:field==='end_date'?snapshot?.period?.end:null)??null)===value))errors.push(`Employment ${field} differs from its confirmed source.`);
  const expectedEntry=expected.find(e=>e.id===entry.id);
  if(options.context&&typeof expectedEntry?.data.responsibility_scope==='string'&&expectedEntry.data.responsibility_scope.trim()&&!entry.claims.length)errors.push('A role with confirmed responsibilities cannot have an empty description.');
  for(const bullet of entry.claims)if(bullet.factIds.some(id=>{const source=safe.get(id);return !entry.factIds.includes(id)&&source?.related_experience_id!==entry.id&&source?.source_reference!==`work_experiences:${entry.id}`;}))errors.push('An employment description cites evidence not linked to that role.');
  if(entry.isCurrent&&!snapshots.some(snapshot=>snapshot?.period?.isCurrent)&&!sources.some(f=>f&&/\b(present|current|obecnie|nadal)\b/i.test(f.statement)))errors.push('An unknown end date does not establish current employment.');
 }
 if((resume.generation||options.context)&&expected.some(entity=>!resume.employment?.some(entry=>entry.id===entity.id)))errors.push('A confirmed employment entry is missing from the chronology.');
 const dated=(resume.employment??[]).filter(e=>e.startDate);if(dated.some((e,index)=>index>0&&String(dated[index-1].startDate)<String(e.startDate)))errors.push('Employment must be in reverse chronological order.');
 const prefix=resume.language==='pl'?'Rola docelowa: ':'Target role: ';if(resume.headline!==prefix+resume.title)errors.push('Headline must identify the target role.');
 return {valid:errors.length===0,errors:[...new Set(errors)],warnings:[...new Set(warnings)],needsEditorialReview};
}
