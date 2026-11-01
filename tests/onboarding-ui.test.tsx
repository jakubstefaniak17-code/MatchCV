// @vitest-environment jsdom
import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {SetupProvider,useSetup} from '@/components/onboarding/provider';
import {SourceDetails} from '@/components/career/source-details';
import {WelcomeView,SetupStep} from '@/components/onboarding/setup';
import {IdentityStep} from '@/components/onboarding/identity';
import {GroupedFactReview,type SetupFact} from '@/components/onboarding/review';
import {validateSetupFile} from '@/components/onboarding/import';
import type {SetupState} from '@/components/onboarding/types';
const {request,push}=vi.hoisted(()=>({request:vi.fn(),push:vi.fn()}));
vi.mock('@/lib/demo/transport',()=>({workspaceFetch:request}));
vi.mock('next/navigation',()=>({useRouter:()=>({push,replace:vi.fn(),refresh:vi.fn()})}));
const initial:SetupState={progress:{path:'cv',status:'in_progress',current_step:1,completed_steps:[],version:7},identity:{firstName:'',lastName:'',targetRole:'',language:'pl',email:'',phone:'',location:'',publishIdentity:false,publishContact:false},readiness:{ready:false,canGenerate:false,gaps:['Brak historii'],warnings:[],confirmedFacts:0,publishableFacts:0},questionIds:[]};
function Harness(){return useSetup().data?<IdentityStep/>:<p>Wczytywanie</p>;}
afterEach(async()=>{cleanup();await new Promise(resolve=>setTimeout(resolve,0));vi.clearAllMocks();});
beforeEach(()=>request.mockImplementation(async(_url:string,options?:RequestInit)=>Response.json(options?.method==='POST'?{...initial,progress:{...initial.progress,version:8}}:initial)));
describe('Career Setup identity and progression',()=>{
 it('autosaves partial identity against the authoritative version and preserves typed text on 409',async()=>{
  request.mockImplementation(async(_url:string,options?:RequestInit)=>options?.method==='POST'?Response.json({error:'Nowszy postęp jest już zapisany.'},{status:409}):Response.json(initial));
  render(<SetupProvider><Harness/></SetupProvider>);
  const name=await screen.findByRole('textbox',{name:'Imię'});
  fireEvent.change(name,{target:{value:'Synthetic Alex'}});
  await screen.findByText('Nowszy postęp jest już zapisany.',{}, {timeout:2000});
  expect((name as HTMLInputElement).value).toBe('Synthetic Alex');
  const call=request.mock.calls.find(([,options])=>options?.method==='POST');
  expect(JSON.parse(call?.[1].body)).toMatchObject({action:'save',expectedVersion:7,currentStep:1,identity:{firstName:'Synthetic Alex',publishIdentity:false,publishContact:false}});
  expect(push).not.toHaveBeenCalled();
 });
 it('persists step completion before navigating and keeps publication opt-in',async()=>{
  render(<SetupProvider><Harness/></SetupProvider>);
  fireEvent.change(await screen.findByRole('textbox',{name:'Imię'}),{target:{value:'Alex'}});
  fireEvent.change(screen.getByRole('textbox',{name:'Nazwisko'}),{target:{value:'Sample'}});
  fireEvent.change(screen.getByRole('textbox',{name:'Docelowe stanowisko lub obszar'}),{target:{value:'Project Manager'}});
  fireEvent.click(screen.getByRole('button',{name:/Zapisz i przejdź dalej/}));
  await waitFor(()=>expect(push).toHaveBeenCalledWith('/setup/2'));
  const call=request.mock.calls.find(([,options])=>options?.method==='POST'&&JSON.parse(String(options.body)).completeStep===1);
  expect(JSON.parse(call?.[1].body)).toMatchObject({action:'save',completeStep:1,currentStep:2,expectedVersion:7,identity:{publishIdentity:false,publishContact:false}});
 });
});
describe('Grouped review separates truth and publication',()=>{
 const fact:SetupFact={id:'80000000-0000-4000-8000-000000000001',statement:'Synthetic role at Sample Energy.',fact_type:'experience',verification_status:'imported_unconfirmed',excluded:true,structured_value:{proposed_entity:{entity:'work_experiences',data:{employer:'Sample Energy',position:'Project Manager',start_date:'2020-01-01',responsibility_scope:'Coordinated contractors.'}}}};
 it('confirmation preserves excluded=true and includes the explicitly reviewed structured proposal',async()=>{
  const onSaved=vi.fn(async()=>undefined);render(<GroupedFactReview facts={[fact]} onSaved={onSaved}/>);
  expect(screen.getByText('Sample Energy')).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'Popraw'}));
  fireEvent.change(screen.getByRole('textbox',{name:'Pracodawca'}),{target:{value:'Corrected Sample Energy'}});
  fireEvent.click(screen.getByRole('button',{name:/Potwierdzam prawdziwość/}));
  await waitFor(()=>expect(onSaved).toHaveBeenCalled());
  expect(JSON.parse(request.mock.calls.find(([path,options])=>path==='/api/workspace'&&options?.method==='POST')?.[1]?.body)).toMatchObject({status:'user_confirmed',excluded:true,proposedEntity:{entity:'work_experiences',data:{employer:'Corrected Sample Energy'}}});
 });
 it('publication permission is a distinct mutation without automatic truth confirmation',async()=>{
  render(<GroupedFactReview facts={[fact]} onSaved={async()=>undefined}/>);
  fireEvent.click(screen.getByRole('checkbox',{name:'Zgadzam się na użycie w CV'}));
  await waitFor(()=>expect(request).toHaveBeenCalled());
  expect(JSON.parse(request.mock.calls.find(([path,options])=>path==='/api/workspace'&&options?.method==='POST')?.[1]?.body)).toMatchObject({excluded:false,status:'imported_unconfirmed'});
 });
 it('validates PDF/DOCX sizes and extensions before upload',()=>{
  expect(validateSetupFile({name:'sample.pdf',type:'application/pdf',size:200})).toBeNull();
  expect(validateSetupFile({name:'sample.exe',type:'application/pdf',size:200})).not.toBeNull();
  expect(validateSetupFile({name:'sample.docx',type:'application/pdf',size:200})).not.toBeNull();
  expect(validateSetupFile({name:'sample.pdf',type:'application/pdf',size:6*1024*1024})).not.toBeNull();
 });
});


describe('optional setup for migrated accounts',()=>{
 it('offers supplementary setup without making an existing account new',async()=>{
  const saved={...initial,progress:{...initial.progress,status:'completed' as const,current_step:5,legacy_supplement:true}};
  request.mockResolvedValue(Response.json(saved));render(<SetupProvider><WelcomeView/></SetupProvider>);
  await screen.findByRole('button',{name:/Mam już CV/});expect(screen.getByText(/dobrowolne uzupełnienie istniejącego profilu/)).toBeTruthy();
 });
 it('allows a migrated account to open optional identity editing without resetting completion',async()=>{
  const saved={...initial,progress:{...initial.progress,status:'completed' as const,current_step:5,legacy_supplement:true}};
  request.mockImplementation(async()=>Response.json(saved));render(<SetupProvider><SetupStep step={1}/></SetupProvider>);
  await screen.findByRole('textbox',{name:'Imię'});expect(request.mock.calls.some(([,options])=>options?.method==='POST')).toBe(false);
 });
});


it('exposes less common proposed fields before confirming an entire imported record',()=>{
 render(<SourceDetails structured={{proposed_entity:{entity:'projects',data:{title:'Fictional project',technologies:['SynthetixTool'],stakeholders:['Synthetic client'],confidential:true}}}}/>);
 fireEvent.click(screen.getByText('Sprawdź wszystkie rozpoznane szczegóły przed potwierdzeniem'));
 expect(screen.getByText('SynthetixTool')).toBeTruthy();expect(screen.getByText('Synthetic client')).toBeTruthy();expect(screen.getByText('Poufne')).toBeTruthy();
});
