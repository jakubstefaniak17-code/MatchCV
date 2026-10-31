import {NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';
import {apiUser,HttpError} from '@/lib/auth/server';
import {body,fail,check,sameOrigin} from '@/lib/auth/http';
import {rows,ownedTables} from '@/lib/db/repository';
import {z} from 'zod';
export async function GET(){try{
 const {user,db}=await apiUser();const data=Object.fromEntries(await Promise.all(ownedTables.map(async table=>[table,await rows(db,table,user.id)])));
 async function files(prefix:string):Promise<string[]>{const all:string[]=[];for(let offset=0;;offset+=100){const {data:items,error}=await db.storage.from('career-documents').list(prefix,{limit:100,offset});check(error);for(const item of items||[]){if(item.id)all.push(prefix+'/'+item.name);else all.push(...await files(prefix+'/'+item.name));}if(!items||items.length<100)break;}return all;}
 const documents=await Promise.all((await files(user.id)).map(async path=>{const {data,error}=await db.storage.from('career-documents').createSignedUrl(path,300);check(error);return {path,url:data!.signedUrl,expiresInSeconds:300};}));
 return NextResponse.json({exportedAt:new Date().toISOString(),account:{id:user.id,email:user.email},data,documents},{headers:{'Content-Disposition':'attachment; filename="matchcv-personal-data.json"','Cache-Control':'private, no-store'}});
 }catch(error){return fail(error);}}
export async function DELETE(request:Request){try{
 sameOrigin(request);z.object({confirmation:z.literal('DELETE')}).parse(await body(request));const {user,db}=await apiUser();
 if(!process.env.SUPABASE_SERVICE_ROLE_KEY)throw new HttpError(503,'Account deletion is not configured. Contact the operator.');
 const admin=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
 async function removeTree(prefix:string):Promise<void>{
  // Always read page zero because successful removals shrink the prefix.
  while(true){const {data,error}=await admin.storage.from('career-documents').list(prefix,{limit:100});check(error);if(!data?.length)return;
  const paths:string[]=[];for(const item of data){if(item.id)paths.push(prefix+'/'+item.name);else await removeTree(prefix+'/'+item.name);}if(paths.length){const {error}=await admin.storage.from('career-documents').remove(paths);check(error);}else if(data.every(i=>!i.id))return;}
 }
 await removeTree(user.id);const {error}=await admin.auth.admin.deleteUser(user.id);check(error);await db.auth.signOut();return NextResponse.json({ok:true});
 }catch(error){return fail(error);}}
