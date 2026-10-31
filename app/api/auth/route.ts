import {NextResponse} from 'next/server';
import {z} from 'zod';
import {createDb,HttpError} from '@/lib/auth/server';
import {body,fail,sameOrigin} from '@/lib/auth/http';
const schema=z.object({action:z.enum(['login','register','reset','logout','updatePassword']),email:z.email().optional(),password:z.string().min(10).max(128).optional()});
export async function POST(request:Request){try{
 sameOrigin(request);const input=schema.parse(await body(request));const db=await createDb();const appUrl=new URL(process.env.APP_URL||request.url).origin;
 if(input.action==='logout'){const {error}=await db.auth.signOut();if(error)throw error;return NextResponse.json({ok:true});}
 if(input.action==='updatePassword'){if(!input.password)throw new HttpError(400,'Password is required.');const {data:{user}}=await db.auth.getUser();if(!user)throw new HttpError(401,'Open the password recovery link first.');const {error}=await db.auth.updateUser({password:input.password});if(error)throw new HttpError(400,'Password could not be updated.');return NextResponse.json({ok:true});}
 if(!input.email)throw new HttpError(400,'Email is required.');
 if(input.action==='reset'){await db.auth.resetPasswordForEmail(input.email,{redirectTo:appUrl+'/auth/callback?next=/reset-password'});return NextResponse.json({ok:true,message:'If this account exists, a recovery email has been sent.'});}
 if(!input.password)throw new HttpError(400,'Password is required.');
 const result=input.action==='login'?await db.auth.signInWithPassword({email:input.email,password:input.password}):await db.auth.signUp({email:input.email,password:input.password,options:{emailRedirectTo:appUrl+'/auth/callback'}});
 if(result.error)throw new HttpError(400,input.action==='login'?'Unable to sign in. Check your credentials and email verification.':'Unable to register. Check your details or request a password reset.');
 return NextResponse.json({ok:true,verificationRequired:!result.data.session});
 }catch(error){return fail(error);}}
