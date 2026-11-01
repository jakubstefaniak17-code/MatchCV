'use client';
import {createContext,useCallback,useContext,useEffect,useRef,useState} from 'react';
import type {ReactNode} from 'react';
import {workspaceFetch} from '@/lib/demo/transport';
import type {SetupSave,SetupState} from './types';
export class SetupApiError extends Error {constructor(public status:number,message:string){super(message);}}
export async function setupRequest(path:string,body?:unknown):Promise<unknown>{
 const response=await workspaceFetch(path,body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{cache:'no-store'});
 const data=await response.json();if(!response.ok)throw new SetupApiError(response.status,data.error||(response.status===409?'Postęp zmienił się na innym urządzeniu. Zachowaj wpisaną treść i wczytaj bieżący stan.':'Nie udało się zapisać danych. Spróbuj ponownie.'));return data;
}
interface Context {data:SetupState|null;error:string;busy:boolean;save:(patch:SetupSave)=>Promise<SetupState>;complete:()=>Promise<SetupState>;reload:()=>Promise<void>;clearError:()=>void}
const SetupContext=createContext<Context|null>(null);
export function SetupProvider({children}:{children:ReactNode}){
 const [data,setData]=useState<SetupState|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const current=useRef<SetupState|null>(null),queue=useRef<Promise<unknown>>(Promise.resolve()),pending=useRef(0);
 const reload=useCallback(async()=>{try{const value=await setupRequest('/api/onboarding') as SetupState;current.current=value;setData(value);setError('');}catch(e){setError(e instanceof Error?e.message:'Nie udało się wczytać postępu.');}},[]);
 useEffect(()=>{queueMicrotask(()=>void reload());},[reload]);
 const mutate=useCallback((patch:SetupSave|{action:'complete'})=>{
  pending.current++;setBusy(true);
  const operation=queue.current.catch(()=>undefined).then(async()=>{
   if(!current.current)throw new Error('Najpierw wczytaj zapisany postęp.');
   const result=await setupRequest('/api/onboarding',{...patch,action:'action'in patch?'complete':'save',expectedVersion:current.current.progress.version}) as SetupState;
   current.current=result;setData(result);setError('');return result;
  }).catch(e=>{setError(e instanceof Error?e.message:'Błąd zapisu.');throw e;}).finally(()=>{pending.current--;setBusy(pending.current>0);});
  queue.current=operation;return operation;
 },[]);
 const save=useCallback((patch:SetupSave)=>mutate(patch),[mutate]);const complete=useCallback(()=>mutate({action:'complete'}),[mutate]);
 return <SetupContext.Provider value={{data,error,busy,save,complete,reload,clearError:()=>setError('')}}>{children}</SetupContext.Provider>;
}
export function useSetup(){const value=useContext(SetupContext);if(!value)throw new Error('SetupProvider missing.');return value;}
