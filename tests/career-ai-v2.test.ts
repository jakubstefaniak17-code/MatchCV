import {describe,it,expect,vi,beforeEach} from 'vitest';
vi.mock('../lib/ai/provider',()=>({structuredAI:vi.fn()}));
import {structuredAI} from '../lib/ai/provider';
import {composeResumeAI,parseResume} from '../lib/ai/workflows';
import {generateResume,buildCareerContext,type Fact,type Resume} from '../lib/resume/engine';
const id='82000000-0000-4000-8000-000000000001',sourceId='82000000-0000-4000-8000-000000000002';
const role={employer:'Fictional Harbor',position:'Project Manager',start_date:'2021-01-01',end_date:'2026-01-01',responsibility_scope:'Coordinated project delivery and contractor schedules.'};
const facts:Fact[]=[{id:sourceId,statement:'Project Manager — Fictional Harbor — 2021-01-01 — 2026-01-01 — Coordinated project delivery and contractor schedules.',fact_type:'experience',source_reference:'work_experiences:'+id,structured_value:role,verification_status:'user_confirmed'},{id:'82000000-0000-4000-8000-000000000003',statement:'Morgan Example',fact_type:'identity',verification_status:'user_confirmed'}];
const args={facts,analysis:{title:'Project Manager',employer:null,location:null,seniority:null,keywords:[],requirements:[{id:'R1',statement:'project delivery',category:'experience',priority:'mandatory' as const}]},language:'en' as const,template:'executive_clarity' as const,context:buildCareerContext({facts})};
let response:Resume;
beforeEach(()=>{vi.clearAllMocks();response=generateResume(args);delete response.generation;vi.mocked(structuredAI).mockImplementation(async()=>response as never);});
describe('AI composition2 hard boundaries',()=>{
 it('rejects omitted chronology even without a generation object',async()=>{delete response.employment;await expect(composeResumeAI(args)).rejects.toThrow('chronology');});
 it('rejects roles stripped of their established responsibilities',async()=>{response.employment![0].claims=[];await expect(composeResumeAI(args)).rejects.toThrow('empty description');});
 it('rejects omitted approved candidate identity',async()=>{delete response.person;await expect(composeResumeAI(args)).rejects.toThrow('identity/contact');});
 it('returns a professional-edit candidate with explicit editorial-review status, not fabricated approval',async()=>{response.summaryClaims=[{text:'Coordinated complex project delivery and contractor schedules.',factIds:[sourceId]}];response.summary=response.summaryClaims[0].text;const result=await composeResumeAI(args);expect(result.generation?.mode).toBe('ai');expect(result.generation?.status).toBe('editorial_review_required');expect(result.generation?.editorialApprovals).toBeUndefined();});
 it('rejects a model granting itself editorial approval',async()=>{response.summaryClaims![0].editorialApproved=true;await expect(composeResumeAI(args)).rejects.toThrow('cannot grant');});
 it('does not fabricate ISO dates from a year-only resume import',async()=>{vi.mocked(structuredAI).mockResolvedValue({facts:[{statement:'Project Manager at Fictional Harbor from 2021.',fact_type:'experience',source_quote:'Project Manager at Fictional Harbor from 2021.',related_question_ids:[],information_kind:'fact',question_coverage:[],proposed_entity:{entity:'work_experiences',data:{employer:'Fictional Harbor',position:'Project Manager',start_date:'2021-01-01'},period:{start:'2021',end:null}}}]} as never);const result=await parseResume('Project Manager at Fictional Harbor from 2021.');expect(result.facts[0].proposed_entity?.data.start_date).toBeNull();expect(result.facts[0].proposed_entity?.period?.start).toBe('2021');});
});
