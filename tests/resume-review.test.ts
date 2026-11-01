import {describe,expect,it} from 'vitest';
import {generateResume,resumeClaims,editorialClaimKey,type Fact} from '../lib/resume/engine';
import {reviewResume} from '../lib/resume/review';
const fact:Fact={id:'76000000-0000-4000-8000-000000000001',statement:'Coordinated contractor delivery schedules.',fact_type:'experience',verification_status:'user_confirmed'};
const make=()=>generateResume({facts:[fact],analysis:{title:'Project Coordinator',employer:null,location:null,seniority:null,keywords:[],requirements:[]},language:'en',template:'executive_clarity'});
function edited(){const prior=make(),candidate=structuredClone(prior);candidate.sections[0].claims[0].text='Coordinated contractor delivery schedules in a structured way.';return {prior,candidate};}
describe('server-bound editorial approval',()=>{
 it('saves a pending style draft without treating incoming approval hashes as approval',()=>{const {prior,candidate}=edited();candidate.generation!.editorialApprovals=resumeClaims(candidate).map(c=>editorialClaimKey(c,[fact]));expect(reviewResume(candidate,prior,[fact],false).result.valid).toBe(true);expect(reviewResume(candidate,prior,[fact],true).result.valid).toBe(false);});
 it('records explicit style consent against the exact text and source',()=>{const {prior,candidate}=edited();candidate.sections[0].claims[0].editorialApproved=true;const saved=reviewResume(candidate,prior,[fact],true);expect(saved.result.valid).toBe(true);expect(saved.content.generation?.editorialApprovals).toContain(editorialClaimKey(candidate.sections[0].claims[0],[fact]));});
 it('does not permit fabricated figures even with explicit editorial approval',()=>{const {prior,candidate}=edited();candidate.sections[0].claims[0]={...candidate.sections[0].claims[0],text:'Coordinated 50 contractor delivery schedules.',editorialApproved:true};expect(reviewResume(candidate,prior,[fact],true).result.valid).toBe(false);});
 it('invalidates wording approval when its source changes',()=>{const {prior,candidate}=edited();candidate.sections[0].claims[0].editorialApproved=true;const saved=reviewResume(candidate,prior,[fact],true).content;const next=structuredClone(saved);next.sections[0].claims[0].editorialApproved=false;expect(reviewResume(next,saved,[{...fact,statement:'Coordinated contractor delivery schedules and reports.'}],true).result.valid).toBe(false);});
});
