import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { HttpError } from './server';
export function fail(error:unknown){
 const status=error instanceof HttpError?error.status:error instanceof ZodError||error instanceof SyntaxError?400:503;
 const message=error instanceof HttpError?error.message:error instanceof ZodError||error instanceof SyntaxError?'Invalid input. Check the fields and try again.':'The operation could not be completed. Your saved data is safe. Please try again.';
 return NextResponse.json({error:message},{status});
}
export function sameOrigin(request:Request){const origin=request.headers.get('origin');const expected=new URL(process.env.APP_URL||request.url).origin;if(!origin||origin!==expected)throw new HttpError(403,'Invalid request origin.');}
export async function body(request:Request){if(Number(request.headers.get('content-length')||0)>200000)throw new HttpError(413,'Request too large.');const raw=await request.text();if(raw.length>200000)throw new HttpError(413,'Request too large.');return JSON.parse(raw) as unknown;}
export function check(error:{message:string}|null){if(error)throw new HttpError(503,'Database operation failed. Please retry.');}
