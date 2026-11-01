export type SetupPath='cv'|'interview';
export interface SetupIdentity {firstName:string;lastName:string;targetRole:string;language:'pl'|'en';email:string;phone:string;location:string;publishIdentity:boolean;publishContact:boolean}
export interface SetupProgress {path:SetupPath|null;status:'not_started'|'in_progress'|'completed';current_step:number;completed_steps:number[];version:number;legacy_supplement?:boolean;import_status?:'not_started'|'succeeded'|'failed'|'skipped'}
export interface SetupState {progress:SetupProgress;identity:SetupIdentity;readiness:{ready:boolean;canGenerate:boolean;gaps:string[];warnings:string[];confirmedFacts:number;publishableFacts:number};questionIds:string[]}
export interface SetupSave {path?:SetupPath;currentStep:number;completeStep?:number;identity?:SetupIdentity;importStatus?:'not_started'|'succeeded'|'failed'|'skipped'}
export const setupSteps=['Poznajmy się','Dodaj swoje CV','Sprawdźmy historię','Odkryjmy więcej','Twój punkt wyjścia'];
