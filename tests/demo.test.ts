// @vitest-environment jsdom
import {beforeEach,describe,expect,it} from 'vitest';
import {workspaceFetch} from '../lib/demo/transport';
beforeEach(()=>{localStorage.clear();window.history.replaceState({},'', '/demo');});
const post=(body:unknown)=>workspaceFetch('/api/workspace',{method:'POST',body:JSON.stringify(body)});
describe('browser-local review demo',()=>{
 it('provides three materially different drafts and persists interview edits',async()=>{
 const initial=await (await workspaceFetch('/api/workspace')).json();expect(initial.cvs).toHaveLength(3);expect(new Set(initial.cvs.map((cv:{content:{summary:string}})=>cv.content.summary)).size).toBe(3);
 await post({action:'answer',questionId:'Q001',answer:'Synthetic test career story',status:'answered'});
 const reloaded=await (await workspaceFetch('/api/workspace')).json();expect(reloaded.answers[0].answer).toBe('Synthetic test career story');expect(reloaded.aiConfigured).toBe(false);
 });
 it('keeps approval and confidential-evidence validation in the review path',async()=>{
 const state=await (await workspaceFetch('/api/workspace')).json();const cv=state.cvs[0];
 const unapproved=await workspaceFetch(`/api/cv/${cv.id}/export?format=pdf`);expect(unapproved.status).toBe(400);
 const save=await post({action:'saveCv',id:cv.id,content:cv.content,approved:true});expect(save.ok).toBe(true);
 const source=state.facts.find((f:{id:string})=>cv.content.sections[0].claims[0].factIds.includes(f.id));await post({action:'fact',id:source.id,statement:source.statement,factType:source.fact_type,status:'user_confirmed',confidential:true});
 const stale=await workspaceFetch(`/api/cv/${cv.id}/export?format=pdf`);expect(stale.status).toBe(400);
 });
 it('never calls the authenticated import endpoint from demo',async()=>{
 const result=await workspaceFetch('/api/import',{method:'POST'});expect(result.status).toBe(400);expect((await result.json()).error).toContain('Supabase');
 });
});
