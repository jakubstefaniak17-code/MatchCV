import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
export function isConfigured(){return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);}
export async function createDb(){
 if(!isConfigured()) throw new Error('Configure Supabase environment variables first.');
 const jar=await cookies();
 return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{cookies:{getAll:()=>jar.getAll(),setAll:(items)=>{try{items.forEach(({name,value,options})=>jar.set(name,value,options));}catch{/* Server Components cannot write; proxy refreshes cookies. */}}}});
}
export async function requireUser(){const db=await createDb();const {data:{user},error}=await db.auth.getUser();if(error||!user)redirect('/login');return {user,db};}
export async function apiUser(){const db=await createDb();const {data:{user},error}=await db.auth.getUser();if(error||!user)throw new HttpError(401,'Please sign in again.');return {user,db};}
export class HttpError extends Error {constructor(public status:number,message:string){super(message);}}
