import {NextResponse} from 'next/server';
import {z} from 'zod';
import {apiUser} from '@/lib/auth/server';
import {body,fail,check,sameOrigin} from '@/lib/auth/http';
import {rows,ownedRow} from '@/lib/db/repository';
import {entitySchemas,entityName,entityStatement,factTypeForEntity} from '@/lib/career/schemas';
export async function GET(){try{const {user,db}=await apiUser();return NextResponse.json(Object.fromEntries(await Promise.all(entityName.options.map(async e=>[e,await rows(db,e,user.id)]))),{headers:{'Cache-Control':'no-store'}});}catch(e){return fail(e);}}
export async function POST(request:Request){try{
 sameOrigin(request);const {user,db}=await apiUser();const input=z.object({entity:entityName,id:z.string().uuid().optional(),data:z.record(z.string(),z.unknown())}).parse(await body(request));const data=entitySchemas[input.entity].parse(input.data);
 if(input.id)await ownedRow(db,input.entity,input.id,user.id);
 const query=input.id?db.from(input.entity).update(data).eq('id',input.id).eq('user_id',user.id):db.from(input.entity).insert({...data,user_id:user.id});
 const {data:saved,error}=await query.select().single();check(error);
 // Preserve provenance and invalidate old statements when the structured source is edited.
 if(input.id){const {error:invalidateError}=await db.from('career_facts').update({verification_status:'disputed'}).eq('user_id',user.id).eq('source_reference',`${input.entity}:${input.id}`);check(invalidateError);}
 // Edits create a new candidate; previous canonical facts are never silently overwritten.
 const {error:factError}=await db.from('career_facts').insert({user_id:user.id,fact_type:factTypeForEntity[input.entity],statement:entityStatement(input.entity,data),source_type:'manual',source_reference:`${input.entity}:${saved.id}`,structured_value:data,verification_status:'user_provided',confidential:input.entity==='projects'&&'confidential' in data?Boolean(data.confidential):false});check(factError);
 return NextResponse.json({ok:true,id:saved.id});
 }catch(e){return fail(e);}}
export async function DELETE(request:Request){try{sameOrigin(request);const {user,db}=await apiUser();const {entity,id}=z.object({entity:entityName,id:z.string().uuid()}).parse(await body(request));await ownedRow(db,entity,id,user.id);const {error}=await db.from(entity).delete().eq('id',id).eq('user_id',user.id);check(error);
 // Invalidate detached facts so old versions fail validation until reviewed.
 const {error:factError}=await db.from('career_facts').update({verification_status:'disputed'}).eq('user_id',user.id).eq('source_reference',`${entity}:${id}`);check(factError);return NextResponse.json({ok:true});}catch(e){return fail(e);}}
