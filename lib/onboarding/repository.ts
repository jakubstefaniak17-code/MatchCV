import type {SupabaseClient} from '@supabase/supabase-js';
import {HttpError} from '@/lib/auth/server';
import {onboardingProgressSchema,type SaveSetupInput} from './schema';
export async function getOnboarding(db:SupabaseClient,userId:string){
 const {data,error}=await db.from('onboarding_progress').select('*').eq('user_id',userId).maybeSingle();
 if(error)throw new HttpError(503,'Nie udało się odczytać postępu konfiguracji. Spróbuj ponownie; zapisane dane nie zostały zresetowane.');
 if(!data)throw new HttpError(503,'Stan konfiguracji nie jest dostępny. Sprawdź migracje bazy i spróbuj ponownie.');
 return onboardingProgressSchema.parse(data);
}
export async function saveOnboarding(db:SupabaseClient,input:SaveSetupInput){
 const changes=input.action==='complete'?{}:{path:input.path,currentStep:input.currentStep,completeStep:input.completeStep,identity:input.identity,importStatus:input.importStatus};
 const {data,error}=await db.rpc('save_onboarding_progress',{expected_version:input.expectedVersion,changes:JSON.parse(JSON.stringify(changes)),finalize:input.action==='complete'});
 if(error?.code==='40001')throw new HttpError(409,'Postęp został zmieniony w innym oknie. Zachowaj swoje zmiany i odśwież stronę.');
 if(error?.code==='23514'||error?.code==='22P02')throw new HttpError(400,'Sprawdź dane i ukończ wcześniejsze kroki. Import możesz zastąpić wywiadem.');
 if(error)throw new HttpError(503,'Nie udało się zapisać konfiguracji. Zachowaj zmiany i spróbuj ponownie.');
 return onboardingProgressSchema.parse(Array.isArray(data)?data[0]:data);
}
