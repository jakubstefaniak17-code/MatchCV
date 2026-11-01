import type {Fact,ResumeClaim} from './engine';
import {entitySnapshot} from './context';
import {normalized,semanticConcepts} from './semantic';
import {contentFingerprint} from './fingerprint';
export interface ClaimAssessment {status:'source_exact'|'grounded_edit'|'needs_editorial_review'|'rejected';errors:string[];warnings:string[]}
const wordNumbers:Record<string,string>={one:'1',two:'2',three:'3',four:'4',five:'5',six:'6',seven:'7',eight:'8',nine:'9',ten:'10',jeden:'1',jednego:'1',dwa:'2',dwie:'2',dwoch:'2',trzy:'3',trzech:'3',cztery:'4',czterech:'4',piec:'5',pieciu:'5',szesc:'6',szesciu:'6',siedem:'7',siedmiu:'7',osiem:'8',osmiu:'8',dziewiec:'9',dziewieciu:'9',dziesiec:'10',dziesieciu:'10'};
function numberWords(text:string){return normalized(text).replace(/\b[a-z]+\b/g,t=>wordNumbers[t]??t);}
export function quantities(text:string):Set<string>{
 const clean=numberWords(text).replace(/(\d)[\s\u00a0](?=\d{3}(?:\D|$))/g,'$1');
 const result=new Set<string>();
 for(const match of clean.matchAll(/\d+(?:[.,]\d+)?(?:\s*(?:mln|million|milion[a-z]*|mld|billion|tys\.?|thousand))?\s*%?/g)){
  const raw=match[0].trim(),value=Number(raw.match(/^\d+(?:[.,]\d+)?/)?.[0].replace(',','.'));const scale=/mln|million|milion/.test(raw)?1e6:/mld|billion/.test(raw)?1e9:/tys|thousand/.test(raw)?1e3:1;
  result.add(`${value*scale}${raw.endsWith('%')?'%':''}`);
 }
 return result;
}
function currencies(text:string):Set<string>{const t=normalized(text);return new Set([...(t.match(/\b(?:pln|eur|usd|gbp|chf|cny)\b/g)??[]),...(/\bz[lł]\b|z[lł]ot/.test(t)?['pln']:[]),...(text.includes('€')?['eur']:[]),...(text.includes('$')?['usd']:[]),...(text.includes('£')?['gbp']:[])]);}

function quantityUnits(text:string):Set<string>{
 const clean=numberWords(text),result=new Set<string>();
 for(const match of clean.matchAll(/\d+(?:[.,]\d+)?(?:\s*(?:mln|million|milion[a-z]*|mld|billion|tys\.?|thousand))?\s*%?/g)){
  const index=match.index??0,before=clean.slice(Math.max(0,index-8),index),after=clean.slice(index+match[0].length,index+match[0].length+40),window=before+match[0]+after;
  const currency=window.match(/\b(?:pln|eur|usd|gbp|chf)\b|z[lł]ot|\bz[lł]\b/)?.[0];
  let unit=match[0].trim().endsWith('%')?'percent':currency?currency.replace(/z[lł].*/,'pln'):/^\s*mwh\b/.test(after)?'mwh':/^\s*mw\b/.test(after)?'mw':null;
  if(!unit){const following=after.match(/^\s*(?:[a-z]+\s+){0,2}(contracts?|kontrakt[a-z]*|employees|people|pracownik[a-z]*|osob[a-z]*|years?|lat[a-z]*|months?|miesi[a-z]*)\b/)?.[1];if(following)unit=/contract|kontrakt/.test(following)?'contracts':/employees|people|pracownik|osob/.test(following)?'people':/year|lat/.test(following)?'years':'months';}
  if(unit)for(const value of quantities(match[0]))result.add(value+'|'+unit);
 }
 return result;
}
function flatten(data:unknown):string[]{if(typeof data==='string'||typeof data==='number')return [String(data)];if(Array.isArray(data))return data.flatMap(flatten);if(data&&typeof data==='object')return Object.values(data).flatMap(flatten);return [];}
export function approvedSourceText(fact:Fact):string{const snapshot=entitySnapshot(fact);return [fact.statement,...(snapshot?[...flatten(snapshot.data),...flatten(snapshot.period)]:[])].join('\n');}
function strength(text:string):number{const s=normalized(text);if(/direct reports|line manag|people manag|managed employees|managing employees|zarzadz[a-z]* (?:pracownik|zespol)|bezposredni.*(podw|pracow|zesp)|bezposrednio zarzadz/.test(s))return 3;if(/zarzadz|kierowa|\bmanaged\b|\blead\b|\bled\b|prowadz/.test(s))return 2;if(/koordyn|coordinat|nadzor|supervis/.test(s))return 1;return 0;}
function approvedCredential(text:string){const s=normalized(text);return /certif|certyf|license|licence|uprawnien|akredyt/.test(s)&&!/not certified|without certification|no certification|brak cert|nie posiad.*cert|bez cert/.test(s);}
const generalCapital=new Set('Coordination Management Managed Coordinated Led Prepared Implemented Delivered Development Design Analysis Project Professional Selected Experience Skills Education Languages Certificates Certification Responsibility Responsibilities Achievement Achievements Technical About Target Summary Senior Junior Specialist Manager Director Chief Koordynacja Zarządzanie Prowadzenie Przygotowanie Wdrożenie Realizacja Analiza Projekt Projekty Doświadczenie Kompetencje Wykształcenie Języki Certyfikaty Odpowiedzialność Osiągnięcia Nadzór Współpraca Udział Zastosowanie Praca Budowa Experienced Focused Skilled Specialist Specialising Specializing Combining Doświadczony Doświadczona Łączę Specjalizuję Praktyczne Odpowiedzialny Wspieranie Współtworzenie Wykorzystanie Kompleksowa Kompleksowe'.split(' ').map(normalized));
function tokens(text:string):string[]{
 const stop=new Set('the and with for from this that has have are was were you your a an of in to by at i o oraz jako przez przy dla lub sie na do z w pod nad lacznej wartosci combined total totaling value around approximately okolo about own moj moje mojej jestem is was were'.split(' '));
 return numberWords(text).replace(/\b(prowadz[a-z]*|koordyn[a-z]*|coordinat[a-z]*)\b/g,' coordinate ').replace(/\b(kontrakt[a-z]*|contracts?)\b/g,' contract ').replace(/\b(energet[a-z]*|energi[a-z]*|energy)\b/g,' energy ').replace(/\b(reduc[a-z]*|ogranicz[a-z]*|zmniejsz[a-z]*)\b/g,' reduction ').match(/[a-z0-9]+/g)?.filter(t=>!stop.has(t)&&!/^\d/.test(t)&&!['mln','million','pln','eur','usd','tys'].includes(t)).map(t=>t.length>5?t.replace(/(?:ow|ami|ach|ych|ymi|ami|nie|nia|ing|ed|es|s)$/,''):t)??[];
}
export function assessClaim(claim:ResumeClaim,facts:Fact[]):ClaimAssessment{
 const safe=facts.filter(f=>['user_confirmed','document_supported'].includes(f.verification_status)&&!f.excluded&&!f.private&&!f.forbidden_for_cv&&!f.confidential&&!['preference','interpretation'].includes(String(f.structured_value?.information_kind)));
 const sources=claim.factIds.map(id=>safe.find(f=>f.id===id));
 if(!sources.length||sources.some(f=>!f))return {status:'rejected',errors:['Claim refers to missing, unconfirmed or non-public evidence.'],warnings:[]};
 const sourceFacts=sources as Fact[],source=sourceFacts.map(approvedSourceText).join('\n'),s=normalized(source),c=normalized(claim.text),errors:string[]=[];
 const sourceQuantities=quantities(source);for(const quantity of quantities(claim.text))if(!sourceQuantities.has(quantity))errors.push(`Unsupported numerical value or unit: ${quantity}.`);
 const sourceUnits=quantityUnits(source);for(const value of quantityUnits(claim.text))if(!sourceUnits.has(value))errors.push('A numerical value was attached to a different or unestablished unit.');
 const sourceDates=new Set(source.match(/\b\d{4}-\d{2}-\d{2}\b/g)??[]);for(const date of claim.text.match(/\b\d{4}-\d{2}-\d{2}\b/g)??[])if(!sourceDates.has(date))errors.push('The edited statement changes or invents an exact date.');
 const sourceCurrencies=currencies(source);for(const currency of currencies(claim.text))if(!sourceCurrencies.has(currency))errors.push(`Unsupported currency: ${currency.toUpperCase()}.`);
 for(const degree of c.match(/\b(?:phd|msc|bsc|mba|doctorate|doctor|doktor|master|magister|bachelor|licencjat)\b/g)??[])if(!s.includes(degree)&&!([/phd|doctorate|doktor/,/master|msc|magister/,/bachelor|bsc|licencjat/].some(group=>group.test(degree)&&group.test(s))))errors.push('An academic qualification is absent from the cited evidence.');
 for(const level of c.match(/\b(?:senior|executive|principal|chief|director|dyrektor)\b/g)??[])if(!s.includes(level))errors.push('Seniority or executive scope is not established by the sources.');
 const credentials=claim.text.match(/\b(?:PMP|PRINCE2|IPMA|CFA|ACCA|CISSP|AWS|AZ-\d+|TOEFL|IELTS)\b/gi)??[];
 if(credentials.some(name=>!s.includes(name.toLowerCase())))errors.push('A credential or qualification is absent from the cited evidence.');
 if(approvedCredential(claim.text)&&!approvedCredential(source)&&!sourceFacts.some(f=>f.fact_type==='certification'))errors.push('Applied knowledge or a course cannot be promoted to a certification or licence.');
 if(strength(claim.text)>strength(source))errors.push('The edited statement increases responsibility beyond its sources.');
 if(/samodziel|solely|independent|full ownership|end.to.end|od poczatku do konca/.test(c)&&!/samodziel|solely|independent|full ownership|end.to.end|od poczatku do konca/.test(s))errors.push('Independent ownership is not established by the sources.');
 if(/(?:managed|zarzadz|odpowiedzial)[^.!?\n]{0,50}(?:budget|budzet)/.test(c)&&!/(?:managed|zarzadz|odpowiedzial)[^.!?\n]{0,50}(?:budget|budzet)/.test(s))errors.push('A project total is not evidence of personal budget responsibility.');
 if(/team (?:achieved|delivered)|zespol (?:osiagn|zrealiz|dostarcz)/.test(s)&&!/team|zespol|contribut|wklad|udzial|wspar/.test(c))errors.push('A team result cannot become an individual achievement.');
 for(const outcome of [/saving|oszczedn/,/reduc|zmniejsz|ogranicz/,/increas|wzrost|zwieksz/,/successfully|z sukcesem/])if(outcome.test(c)&&!outcome.test(s))errors.push('The edited statement introduces a new result.');
 // Unknown names/technologies remain protected, including sentence-initial employers.
 for(const match of claim.text.matchAll(/(?<![\p{L}\p{N}])\p{Lu}[\p{L}\p{N}+.#-]{2,}/gu)){
  const term=normalized(match[0]);if(!generalCapital.has(term)&&!s.includes(term)&&!({english:/angiel/,polish:/polsk/,german:/niemieck/,french:/francusk/} as Record<string,RegExp>)[term]?.test(s)&&!/^[a-z]{1,2}$/.test(term))errors.push(`New proper name or technical term: ${match[0]}.`);
 }
 const technology=/\b(?:Python|JavaScript|TypeScript|Kubernetes|Docker|SQL|SAP|BIM|Power BI|Excel|AutoCAD|React|AWS|Azure|GCP|C\+\+)\b/gi;
 for(const term of claim.text.match(technology)??[])if(!s.includes(normalized(term)))errors.push('A technical qualification is not established by the sources.');
 if(errors.length)return {status:'rejected',errors:[...new Set(errors)],warnings:[]};
 if(sourceFacts.some(f=>f.statement===claim.text))return {status:'source_exact',errors:[],warnings:[]};
 const sourceTokens=new Set(tokens(source)),claimTokens=tokens(claim.text);const missing=claimTokens.filter(t=>!sourceTokens.has(t));
 const sourceConcepts=new Set(semanticConcepts(source)),claimConcepts=semanticConcepts(claim.text);
 const newConcepts=claimConcepts.filter(t=>!sourceConcepts.has(t));
 if(newConcepts.length)return {status:'rejected',errors:['The edit introduces an unsupported qualification or responsibility category.'],warnings:[]};
 const editorialWords=new Set('way complex structured professional relevant crossfunctional cross-functional experienced focused practical clear coherent effective natural concise coordination collaboration odpowiedzialny doswiadczony doswiadczona kompleksow kompleksowy uporzadkowany praktyczne zlozony zlozone'.split(' ').flatMap(tokens));
 const unknownDetails=missing.filter(word=>!editorialWords.has(word)&&!semanticConcepts(word).some(concept=>sourceConcepts.has(concept)));
 if(unknownDetails.length)return {status:'rejected',errors:['New substantive detail needs confirmation as a career fact before publication: '+[...new Set(unknownDetails)].join(', ')+'.'],warnings:[]};
 if(!missing.length&&!newConcepts.length)return {status:'grounded_edit',errors:[],warnings:[]};
 if(/expert|eksperck|world.class|wybitn|best.in.class|top.perform/.test(c)&&!/expert|eksperck|world.class|wybitn|best.in.class|top.perform/.test(s))return {status:'rejected',errors:['Unestablished expertise or superlative added.'],warnings:[]};
 const overlap=claimTokens.filter(t=>sourceTokens.has(t)).length/Math.max(claimTokens.length,1);
 if(overlap<.2&&!claimConcepts.some(t=>sourceConcepts.has(t)))return {status:'rejected',errors:['The edit has no established relationship to its cited evidence.'],warnings:[]};
 return {status:'needs_editorial_review',errors:[],warnings:['Editorial wording needs explicit user review against its sources; hard factual checks passed.']};
}

export function editorialClaimKey(claim:ResumeClaim,facts:Fact[]):string{
 const sources=[...new Set(claim.factIds)].sort().map(id=>{const fact=facts.find(f=>f.id===id);return {id,source:fact?approvedSourceText(fact):null,status:fact?.verification_status,excluded:fact?.excluded??false,private:fact?.private??false,forbidden:fact?.forbidden_for_cv??false,confidential:fact?.confidential??false};});
 return contentFingerprint(JSON.stringify({text:claim.text,sources}));
}
