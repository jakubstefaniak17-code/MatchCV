import {NextResponse} from 'next/server';
import {apiUser} from '@/lib/auth/server';
import {body,fail,sameOrigin} from '@/lib/auth/http';
import {saveSetupSchema} from '@/lib/onboarding/schema';
import {getOnboarding,saveOnboarding} from '@/lib/onboarding/repository';
import {onboardingContext} from '@/lib/onboarding/readiness';
export async function GET(){try{const {db,user}=await apiUser();const progress=await getOnboarding(db,user.id);const context=await onboardingContext(db,user.id,progress);return NextResponse.json({progress,identity:progress.identity,...context},{headers:{'Cache-Control':'private, no-store'}});}catch(error){return fail(error);}}
export async function POST(request:Request){try{sameOrigin(request);const {db,user}=await apiUser();const input=saveSetupSchema.parse(await body(request));const progress=await saveOnboarding(db,input);const context=await onboardingContext(db,user.id,progress);return NextResponse.json({progress,identity:progress.identity,...context},{headers:{'Cache-Control':'private, no-store'}});}catch(error){return fail(error);}}
