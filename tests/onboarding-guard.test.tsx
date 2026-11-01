import {beforeEach,describe,expect,it,vi} from 'vitest';
const state=vi.hoisted(()=>({progress:{status:'not_started',current_step:1},error:false,anonymous:false,redirects:[] as string[]}));
vi.mock('next/navigation',()=>({redirect:(path:string)=>{state.redirects.push(path);throw Error('REDIRECT:'+path);}}));
vi.mock('@/lib/auth/server',()=>({requireUser:async()=>{if(state.anonymous)throw Error('REDIRECT:/login');return {user:{id:'synthetic',email:'qa@example.com'},db:{}};}}));
vi.mock('@/lib/onboarding/repository',()=>({getOnboarding:async()=>{if(state.error)throw Error('Database unavailable');return state.progress;}}));
vi.mock('@/components/shell',()=>({Shell:({children}:{children:React.ReactNode})=><div>{children}</div>}));
import Layout from '@/app/(dashboard)/layout';
beforeEach(()=>{vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL','https://qa.invalid');vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY','synthetic');state.progress={status:'not_started',current_step:1};state.error=false;state.anonymous=false;state.redirects=[];});
describe('server-owned setup route guard',()=>{
 it('redirects a fresh account away from any protected dashboard child',async()=>{await expect(Layout({children:<p>Career</p>})).rejects.toThrow('REDIRECT:/welcome');});
 it('resumes persisted step for a direct protected URL',async()=>{state.progress={status:'in_progress',current_step:3};await expect(Layout({children:<p>CV editor</p>})).rejects.toThrow('REDIRECT:/setup/3');});
 it('does not restart completed or migrated accounts',async()=>{state.progress={status:'completed',current_step:5};const result=await Layout({children:<p>Career</p>});expect(result.props.children).toEqual(<p>Career</p>);expect(state.redirects).toEqual([]);});
 it('fails closed without resetting setup during a database outage',async()=>{state.error=true;const result=await Layout({children:<p>Private career</p>});expect(result.type).toBe('main');expect(state.redirects).toEqual([]);});
 it('checks authentication before reading setup state',async()=>{state.anonymous=true;await expect(Layout({children:null})).rejects.toThrow('REDIRECT:/login');});
});
