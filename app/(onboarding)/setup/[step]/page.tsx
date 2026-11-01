import {notFound} from 'next/navigation';
import {SetupStep} from '@/components/onboarding/setup';
export default async function Page({params}:{params:Promise<{step:string}>}){const {step}=await params;if(!/^[1-5]$/.test(step))notFound();return <SetupStep step={Number(step)}/>;}
