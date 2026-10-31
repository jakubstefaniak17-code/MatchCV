import { z } from 'zod';

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
  excluded: z.boolean().optional(), confidential: z.boolean().optional(), private:z.boolean().optional(), forbidden_for_cv:z.boolean().optional(),
});
export type Fact = z.infer<typeof factSchema>;
export const requirementSchema = z.object({ id: z.string(), statement: z.string().min(1), category: z.string(), priority: z.enum(['mandatory','preferred','responsibility']) });
export type Requirement = z.infer<typeof requirementSchema>;
export const jobAnalysisSchema = z.object({ title: z.string(), employer: z.string().nullable(), location: z.string().nullable().default(null), seniority: z.string().nullable().default(null), keywords: z.array(z.string()).default([]), requirements: z.array(requirementSchema).max(100) });
export type JobAnalysis = z.infer<typeof jobAnalysisSchema>;
export type EvidenceStatus = 'supported' | 'partial' | 'not_established' | 'explicitly_unsupported';
export interface EvidenceMapping { requirementId: string; factIds: string[]; status: EvidenceStatus; proposedStatement: string | null; followUp: string | null }
export const resumeSchema = z.object({
  title: z.string().max(300), language: z.enum(['pl','en']), template: templateSchema,
  headline: z.string().max(400), summary: z.string().max(16000),
  person:z.object({name:z.string().max(4000).optional(),contact:z.array(z.string().max(4000)).max(12),factIds:z.array(z.string().uuid()).min(1)}).optional(),
  sections: z.array(z.object({ id: z.string(), title: z.string(), hidden: z.boolean().default(false), claims: z.array(z.object({ text: z.string(), factIds: z.array(z.string().uuid()).min(1) })) })),
});
export type Resume = z.infer<typeof resumeSchema>;
export function normalizeLegacyResume(value:unknown):Resume {
  if(!value||typeof value!=='object')throw new Error('Invalid saved CV.');
  const draft=value as Record<string,unknown>;
  return resumeSchema.parse({...draft,template:normalizeLegacyTemplate(draft.template)});
}
export function usableFacts(facts: Fact[]): Fact[] {
  return facts.filter(f => ['user_confirmed','document_supported'].includes(f.verification_status) && !f.excluded && !f.confidential && !f.private && !f.forbidden_for_cv);
}
const stop = new Set('the and with for from this that has have are was were you your oraz jest jako przez przy dla lub się na do to of in a an i z w'.split(' '));
function tokens(text: string): string[] { return text.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').match(/[a-z0-9]{3,}/g)?.filter(x=>!stop.has(x)) ?? []; }
export function relevance(text: string, context: string): number { const a = new Set(tokens(text)); return [...new Set(tokens(context))].filter(t=>a.has(t)).length; }
export function mapEvidence(requirements: Requirement[], facts: Fact[]): EvidenceMapping[] {
  const safe = usableFacts(facts).filter(f=>!['identity','contact'].includes(f.fact_type));
  return requirements.map(r => {
    const matches = safe.map(f=>({f, score: relevance(f.statement,r.statement)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,3);
    // Lexical overlap alone cannot prove a requirement. All automatic matches require review.
    return { requirementId:r.id, factIds: matches.map(x=>x.f.id), status: matches.length?'partial':'not_established', proposedStatement:matches[0]?.f.statement ?? null, followUp:matches.length?null:`${r.statement} — provide a concrete example and supporting evidence.` };
  });
}
const labels = {pl:{experience:'Doświadczenie zawodowe',achievement:'Wybrane osiągnięcia',education:'Wykształcenie',certification:'Certyfikaty',language:'Języki',skill:'Kompetencje',project:'Wybrane projekty',other:'Pozostałe doświadczenia'},en:{experience:'Professional experience',achievement:'Selected achievements',education:'Education',certification:'Certifications',language:'Languages',skill:'Core competencies',project:'Selected projects',other:'Additional experience'}};
export function summaryLabel(language:'pl'|'en',template:TemplateId):string{return template==='modern_studio'?(language==='pl'?'Kim jestem':'About me'):(language==='pl'?'Profil zawodowy':'Professional profile');}
export function generateResume(input: {facts: Fact[]; analysis: JobAnalysis; language:'pl'|'en'; template:TemplateId}): Resume {
  const allFacts = usableFacts(input.facts);
  const facts=allFacts.filter(f=>!['identity','contact'].includes(f.fact_type));
  if(!facts.length) throw new Error('Confirm at least one non-confidential career fact before generating a CV.');
  const context = input.analysis.requirements.map(r=>r.statement).join(' ');
  const ranked = [...facts].sort((a,b)=>relevance(b.statement,context)-relevance(a.statement,context));
  const modern=input.template==='modern_studio';
  const order = modern?['skill','project','experience','education','certification','language','other']:['achievement','experience','skill','project','education','certification','language','other'];
  const sections = order.map(id=>{
    let title=labels[input.language][id as keyof typeof labels.en];
    if(modern&&id==='skill')title=input.language==='pl'?'Kompetencje i narzędzia':'Skills and tools';
    if(modern&&id==='project')title=input.language==='pl'?'Wybrane projekty i rezultaty':'Selected projects and results';
    if(modern&&id==='experience')title=input.language==='pl'?'Doświadczenie':'Experience';
    if(modern&&id==='education')title=input.language==='pl'?'Wykształcenie i rozwój':'Education and development';
    return {id,title,hidden:false,claims:ranked.filter(f=>modern&&id==='project'?['project','achievement'].includes(f.fact_type):(Object.keys(labels.en).includes(f.fact_type)?f.fact_type:'other')===id).filter(f=>!['skill','project','achievement'].includes(id)||relevance(f.statement,context)>0).slice(0,['skill','project','achievement'].includes(id)?4:20).map(f=>({text:f.statement,factIds:[f.id]}))};
  }).filter(s=>s.claims.length);
  const identity=allFacts.find(f=>f.fact_type==='identity');
  const contact=allFacts.filter(f=>f.fact_type==='contact').slice(0,12);
  const person=identity||contact.length?{...(identity?{name:identity.statement}:{}),contact:contact.map(f=>f.statement),factIds:[...(identity?[identity.id]:[]),...contact.map(f=>f.id)]}:undefined;
  // Target is explicitly a desired role. All factual text remains exact approved evidence.
  const resume:Resume={title:input.analysis.title,language:input.language,template:input.template,headline:`${input.language==='pl'?'Rola docelowa':'Target role'}: ${input.analysis.title}`,summary:ranked.slice(0,2).map(f=>f.statement).join('\n'),...(person?{person}:{}),sections};
  const result=validateResume(resume,allFacts); if(!result.valid) throw new Error(result.errors.join('; ')); return resume;
}
export function validateResume(resume: Resume, facts: Fact[]): {valid:boolean; errors:string[]} {
  const safe=new Map(usableFacts(facts).map(f=>[f.id,f])); const errors:string[]=[];
  for(const section of resume.sections) for(const claim of section.claims) {
    if(!claim.factIds.length || claim.factIds.some(id=>!safe.has(id))) errors.push('Unknown, unconfirmed, excluded, private or confidential fact reference.');
    const statements=claim.factIds.map(id=>safe.get(id)?.statement);
    if(!statements.includes(claim.text)) errors.push('A factual statement differs from its confirmed source. Confirm edited wording as a new fact first.');
  }
  if(resume.summary.split('\n').filter(Boolean).some(line=>![...safe.values()].some(f=>f.statement===line&&!['identity','contact'].includes(f.fact_type)))) errors.push('Summary contains unsupported wording.');
  if(resume.person){
    const headerFacts=resume.person.factIds.map(id=>safe.get(id));
    if(headerFacts.some(f=>!f||!['identity','contact'].includes(f.fact_type)))errors.push('Header contains an unknown, unconfirmed or private identity/contact source.');
    if(resume.person.name&&!headerFacts.some(f=>f?.fact_type==='identity'&&f.statement===resume.person?.name))errors.push('Name differs from its confirmed identity source.');
    if(resume.person.contact.some(text=>!headerFacts.some(f=>f?.fact_type==='contact'&&f.statement===text)))errors.push('Contact details differ from their confirmed sources.');
  }
  const prefix=resume.language==='pl'?'Rola docelowa: ':'Target role: ';
  if(resume.headline!==prefix+resume.title) errors.push('Headline must identify the target role.');
  return {valid:!errors.length,errors:[...new Set(errors)]};
}
