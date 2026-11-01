import {z} from 'zod';
import {entitySchemas,entityName} from '../career/schemas';
import type {Fact} from './engine';
export type EntityName=z.infer<typeof entityName>;
export interface CareerEntity {id:string;entity:EntityName;data:Record<string,unknown>;period?:{start:string|null;end:string|null;isCurrent?:boolean};factIds:string[]}
export interface CareerContext {
 profile:{seniority?:string;targetRole?:string};
 entities:CareerEntity[];
 sourceCounts:{facts:number;entities:number;interviewAnswers:number;factSources:number};
 warnings:string[];
}
export type CareerContextRows={facts:Fact[];career_profiles?:Record<string,unknown>[];fact_sources?:Record<string,unknown>[];interview_answers?:Record<string,unknown>[]} & Partial<Record<EntityName,Record<string,unknown>[]>>;
function isSafe(f:Fact){return ['user_confirmed','document_supported'].includes(f.verification_status)&&!f.excluded&&!f.confidential&&!f.private&&!f.forbidden_for_cv&&!['preference','interpretation'].includes(String(f.structured_value?.information_kind));}
export function entitySnapshot(fact:Fact):{entity:EntityName;data:Record<string,unknown>;id:string;period?:{start:string|null;end:string|null;isCurrent?:boolean}}|null{
 const reference=fact.source_reference?.split(':');
 const proposed=fact.structured_value?.proposed_entity;
 const proposedRecord=proposed&&typeof proposed==='object'&&!Array.isArray(proposed)?proposed as Record<string,unknown>:null;
 const parsedEntity=entityName.safeParse(reference?.[0]??proposedRecord?.entity);
 if(!parsedEntity.success)return null;
 if(proposedRecord&&fact.structured_value?.entity_reviewed!==true&&!reference?.[1])return null;
 const raw=fact.structured_value?.entity_data??proposedRecord?.data??fact.structured_value;
 const parsed=entitySchemas[parsedEntity.data].safeParse(raw);
 if(!parsed.success)return null;
 const periodRaw=proposedRecord?.period;const periodSchema=z.object({start:z.string().max(100).nullable(),end:z.string().max(100).nullable(),isCurrent:z.boolean().optional()});const period=periodSchema.safeParse(periodRaw);const quote=String(fact.structured_value?.source_quote??fact.statement);
 const periodAllowed=fact.structured_value?.entity_reviewed===true&&period.success&&[period.data.start,period.data.end].filter(Boolean).every(label=>quote.includes(label!));
 return {entity:parsedEntity.data,data:parsed.data as Record<string,unknown>,id:reference?.[1]??fact.id,...(periodAllowed?{period:period.data}:{})};
}
/** Only reviewed source snapshots become publishable context; editing a relational row cannot silently expand old consent. */
export function buildCareerContext(rows:CareerContextRows):CareerContext{
 const safe=rows.facts.filter(isSafe),entities:CareerEntity[]=[];const warnings:string[]=[];const conflicting=new Set<string>();
 for(const fact of safe){
  const snapshot=entitySnapshot(fact);if(!snapshot||conflicting.has(snapshot.entity+':'+snapshot.id))continue;
  if(snapshot.entity==='projects'&&snapshot.data.confidential===true)continue;
  const current=rows[snapshot.entity]?.find(r=>r.id===snapshot.id);
  if(current){
   const parsed=entitySchemas[snapshot.entity].safeParse(current);
   // A canonical fact is invalidated by API edits. This additional guard catches bypasses or stale snapshots.
   if(parsed.success&&Object.keys(snapshot.data).some(key=>JSON.stringify(snapshot.data[key])!==JSON.stringify((parsed.data as Record<string,unknown>)[key]))){warnings.push('A structured career source changed after confirmation and was omitted.');continue;}
  }
  const previous=entities.find(e=>e.entity===snapshot.entity&&e.id===snapshot.id);
  if(previous){if(JSON.stringify(previous.data)!==JSON.stringify(snapshot.data)){warnings.push('Conflicting confirmed career snapshots need review.');conflicting.add(snapshot.entity+':'+snapshot.id);entities.splice(entities.indexOf(previous),1);}else previous.factIds.push(fact.id);}
  else entities.push({...snapshot,factIds:[fact.id]});
 }
 const profile=rows.career_profiles?.[0];
 return {profile:{...(typeof profile?.seniority==='string'?{seniority:profile.seniority}:{}),...(typeof profile?.professional_headline==='string'?{targetRole:profile.professional_headline}:{})},entities,sourceCounts:{facts:safe.length,entities:entities.length,interviewAnswers:rows.interview_answers?.length??0,factSources:rows.fact_sources?.length??0},warnings};
}
export function contextForFacts(context:CareerContext|undefined,facts:Fact[]):CareerContext{
 if(!context)return buildCareerContext({facts});
 const safe=new Set(facts.filter(isSafe).map(f=>f.id));
 return {...context,entities:context.entities.filter(e=>e.factIds.length&&e.factIds.every(id=>safe.has(id)))};
}
export function chronologyEntries(context:CareerContext){
 return context.entities.filter(e=>e.entity==='work_experiences').sort((a,b)=>String(b.data.start_date??b.period?.start??'').localeCompare(String(a.data.start_date??a.period?.start??''))||String(b.data.end_date??'9999').localeCompare(String(a.data.end_date??'9999')));
}
