import {z} from 'zod';
export const identitySchema=z.object({
 firstName:z.string().max(200).default(''),lastName:z.string().max(200).default(''),
 targetRole:z.string().max(300).default(''),language:z.enum(['pl','en']).default('pl'),
 email:z.union([z.literal(''),z.email().max(320)]).default(''),phone:z.string().max(100).default(''),location:z.string().max(300).default(''),
 publishIdentity:z.boolean().default(false),publishContact:z.boolean().default(false),
}).strict();
export type SetupIdentity=z.infer<typeof identitySchema>;
export const onboardingProgressSchema=z.object({
 user_id:z.string().uuid(),onboarding_version:z.string(),path:z.enum(['cv','interview']).nullable(),
 status:z.enum(['not_started','in_progress','completed']),current_step:z.number().int().min(1).max(5),
 completed_steps:z.array(z.number().int().min(1).max(5)),selected_question_ids:z.array(z.string()).max(5),version:z.number().int().nonnegative(),
 identity:identitySchema,import_status:z.enum(['not_started','succeeded','failed','skipped']),legacy_supplement:z.boolean(),
 started_at:z.string().nullable(),completed_at:z.string().nullable(),created_at:z.string(),updated_at:z.string(),
});
export type OnboardingProgress=z.infer<typeof onboardingProgressSchema>;
export const saveSetupSchema=z.discriminatedUnion('action',[
 z.object({action:z.literal('save'),expectedVersion:z.number().int().nonnegative(),path:z.enum(['cv','interview']).optional(),currentStep:z.number().int().min(1).max(5),completeStep:z.number().int().min(1).max(4).optional(),identity:identitySchema.optional(),importStatus:z.enum(['not_started','succeeded','failed','skipped']).optional()}).strict(),
 z.object({action:z.literal('complete'),expectedVersion:z.number().int().nonnegative()}).strict(),
]);
export type SaveSetupInput=z.infer<typeof saveSetupSchema>;
