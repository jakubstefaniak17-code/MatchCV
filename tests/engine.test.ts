import {describe,it,expect,vi,afterEach} from 'vitest';
import {generateResume,mapEvidence,validateResume,type Fact,type JobAnalysis} from '../lib/resume/engine';
import {analyzeJob} from '../lib/jobs/analyze';
import {publicAddress,retrieveJob} from '../lib/jobs/retrieve';
import {structuredAI,AIUnavailableError} from '../lib/ai/provider';
import {z} from 'zod';
const facts:Fact[]=[
{id:'11111111-1111-4111-8111-111111111111',statement:'Managed infrastructure procurement with a budget of EUR 6 million.',fact_type:'achievement',verification_status:'user_confirmed'},
{id:'22222222-2222-4222-8222-222222222222',statement:'Implemented digital automation and analytics for operations.',fact_type:'project',verification_status:'user_confirmed'},
{id:'33333333-3333-4333-8333-333333333333',statement:'Managed energy storage infrastructure projects.',fact_type:'experience',verification_status:'document_supported'},
{id:'44444444-4444-4444-8444-444444444444',statement:'PMP certified.',fact_type:'certification',verification_status:'imported_unconfirmed'},
];
function job(statement:string):JobAnalysis{return {title:'Manager',employer:null,location:null,seniority:null,keywords:[],requirements:[{id:'R001',statement,category:'experience',priority:'mandatory'}]};}
afterEach(()=>vi.unstubAllEnvs());
describe('evidence-bound generation',()=>{
 it('changes summary and selected projects for different advertisements',()=>{const a=generateResume({facts,analysis:job('infrastructure procurement budget'),language:'en',template:'professional'}),b=generateResume({facts,analysis:job('digital automation analytics'),language:'en',template:'professional'});expect(a.summary).not.toEqual(b.summary);expect(a.sections.find(s=>s.id==='project')).toBeUndefined();expect(b.sections.find(s=>s.id==='project')?.claims[0].text).toContain('digital');});
 it('never uses unconfirmed, excluded or confidential facts',()=>{const r=generateResume({facts:[...facts,{...facts[0],id:'55555555-5555-4555-8555-555555555555',statement:'Secret customer.',confidential:true}],analysis:job('infrastructure'),language:'pl',template:'executive'});expect(JSON.stringify(r)).not.toContain('PMP');expect(JSON.stringify(r)).not.toContain('Secret');});
 it('rejects invented numbers and certifications even with real fact references',()=>{const r=generateResume({facts,analysis:job('infrastructure'),language:'en',template:'professional'});r.sections[0].claims[0].text='Managed EUR 99 million. PMP certified.';expect(validateResume(r,facts).valid).toBe(false);});
 it('rejects stale sources after exclusion',()=>{const r=generateResume({facts,analysis:job('infrastructure'),language:'en',template:'professional'});expect(validateResume(r,facts.map(f=>({...f,excluded:true}))).valid).toBe(false);});
 it('keeps missing evidence unknown and lexical matches partial',()=>{const m=mapEvidence([{id:'a',statement:'Kubernetes certification',category:'technical',priority:'mandatory'},{id:'b',statement:'infrastructure procurement',category:'experience',priority:'mandatory'}],facts);expect(m[0].status).toBe('not_established');expect(m[1].status).toBe('partial');});
});
describe('advertisements and SSRF',()=>{
 it('distinguishes preferred requirements',()=>{const a=analyzeJob('Senior PM\nRequirements\nManage infrastructure projects\nPreferred\nPMP certification');expect(a.requirements.map(r=>r.priority)).toEqual(['mandatory','preferred']);});
 it('blocks private, metadata and mapped IPv6 networks',()=>{for(const ip of ['127.0.0.1','10.1.2.3','169.254.169.254','172.16.0.1','192.168.0.1','::1','::ffff:127.0.0.1','fc00::1','fe80::1'])expect(publicAddress(ip)).toBe(false);expect(publicAddress('8.8.8.8')).toBe(true);});
 it('rejects URL hosts unless explicitly configured',async()=>{vi.stubEnv('JOB_FETCH_ALLOWED_HOSTS','');await expect(retrieveJob('https://127.0.0.1/job')).rejects.toThrow('Paste');});
});
describe('AI failures',()=>{
 it('returns actionable failure without configured credentials',async()=>{vi.stubEnv('AI_API_KEY','');await expect(structuredAI('test',z.object({ok:z.boolean()}),'test',{})).rejects.toBeInstanceOf(AIUnavailableError);});
 it('retries transient failures and validates JSON output',async()=>{vi.stubEnv('AI_API_KEY','test-key');const fetcher=vi.fn().mockResolvedValueOnce(new Response('',{status:503})).mockResolvedValueOnce(new Response(JSON.stringify({choices:[{message:{content:'{"ok":true}'}}],usage:{prompt_tokens:10,completion_tokens:2}}),{status:200}));const usage=vi.fn();expect(await structuredAI('test',z.object({ok:z.boolean()}),'test',{}, {fetcher,onUsage:usage})).toEqual({ok:true});expect(fetcher).toHaveBeenCalledTimes(2);expect(usage).toHaveBeenCalledWith(expect.objectContaining({input_tokens:10,status:'success'}));});
});

describe('fallback inline requirements',()=>{it('retains mandatory and preferred content after a heading',()=>{const analysis=analyzeJob('Senior Project Manager\nRequirements: infrastructure project delivery\nPreferred: energy infrastructure experience','en');expect(analysis.requirements).toEqual(expect.arrayContaining([expect.objectContaining({statement:'infrastructure project delivery',priority:'mandatory'}),expect.objectContaining({statement:'energy infrastructure experience',priority:'preferred'})]));});});
