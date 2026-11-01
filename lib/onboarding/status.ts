import type {OnboardingProgress} from './schema';
export function needsOnboarding(progress:Pick<OnboardingProgress,'status'>):boolean{return progress.status!=='completed';}
export function setupDestination(progress:Pick<OnboardingProgress,'status'|'current_step'>):string{return progress.status==='not_started'?'/welcome':`/setup/${progress.current_step}`;}
