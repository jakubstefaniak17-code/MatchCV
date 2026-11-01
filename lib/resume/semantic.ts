import type {Fact,Requirement} from './engine';
/** Transparent bilingual domain vocabulary. This is semantic expansion, not an embedding similarity score or proof. */
const concepts:Record<string,RegExp>={
 contractor_coordination:/podwykonawc|wykonawc|contractor|subcontractor|vendor coordination|supplier coordination/i,
 delivery:/realizac|odbior|odbi[oó]r|deliver|acceptance|handover|harmonogram|schedule/i,
 procurement:/zakup|przetarg|zam[oó]wie|procurement|tender|purchas|sourc/i,
 project_management:/projekt|project|programme|programu|programem|portfolio/i,
 energy:/energet|energi|energy|power|grid|sie[ćc]|sieci|electri/i,
 storage:/magazyn|battery|batteries|storage|bess/i,
 digital:/cyfrow|digital|transformac|transformat/i,
 automation:/automatyzac|automation|automated|automat/i,
 analytics:/anali[tz]|analytics|analytical|report|raport|data analys/i,
 change:/zmian|change|adoption|adaptac|wdro[zż]/i,
 training:/szkol|warsztat|training|workshop|mentor|onboard/i,
 leadership:/koordyn|coordinat|zarz[aą]dz|manage|lead|kierowa|prowadz|nadzor|supervis/i,
 direct_management:/bezpo[sś]redni.*(podw|pracow|zesp)|direct reports|line manag|people manag|hired|recruited|rekrutow/i,
 stakeholder:/interesariusz|stakeholder|partner|mi[eę]dzynarod|international/i,
 budget:/bud[zż]et|budget|cost|koszt|financial|finansow|profit|rentown/i,
 risk:/ryzyk|risk|mitigat/i,
 quality:/jako[sś]|quality|standard|compliance|zgodno[sś]/i,
 strategy:/strateg|business case|studium|feasibility|wykonalno[sś]/i,
 education:/studia|magister|in[zż]ynier|degree|bachelor|master|msc|education|wykszta/i,
 certification:/certyf|certif|uprawnien|license|licence|credential/i,
 language:/j[eę]zyk|angiel|polski|english|polish|language|german|niemieck/i,
};
const stop=new Set('the and with for from this that has have are was were you your oraz jest jako przez przy dla lub się na do to of in a an i z w pod nad nadz nadzor'.split(' '));
export function normalized(text:string):string{return text.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/ł/g,'l');}
export function lexicalTokens(text:string):string[]{return normalized(text).match(/[a-z0-9]{3,}/g)?.filter(t=>!stop.has(t))??[];}
export function semanticConcepts(text:string):string[]{return Object.entries(concepts).filter(([,pattern])=>pattern.test(text)).map(([id])=>id);}
export function semanticRelevance(text:string,requirement:string):number{
 const left=new Set(lexicalTokens(text)),right=new Set(lexicalTokens(requirement));
 const lexical=[...right].filter(t=>left.has(t)).length;
 const a=new Set(semanticConcepts(text)),b=semanticConcepts(requirement);
 const overlap=b.filter(c=>a.has(c));
 // Generic leadership/project words are deliberately weak; specialist meaning is more useful.
 return lexical+overlap.reduce((n,c)=>n+(['leadership','project_management'].includes(c)?.4:2),0);
}
export interface EvidenceCandidate {fact:Fact;score:number;matchedConcepts:string[];retrieval:'lexical'|'semantic'|'both'}
export interface VerifiedEvidence {factId:string;status:'supported'|'partial'|'not_established'|'explicitly_unsupported';confidence:'high'|'medium'|'low';reason:string;matchedConcepts:string[]}
export function retrieveCandidates(requirement:Requirement,facts:Fact[]):EvidenceCandidate[]{
 const reqTokens=new Set(lexicalTokens(requirement.statement)),reqConcepts=semanticConcepts(requirement.statement);
 return facts.map(fact=>{const tokens=lexicalTokens(fact.statement),concepts=semanticConcepts(fact.statement);const lexical=tokens.some(t=>reqTokens.has(t));const matchedConcepts=reqConcepts.filter(c=>concepts.includes(c));return {fact,score:semanticRelevance(fact.statement,requirement.statement),matchedConcepts,retrieval:(lexical&&matchedConcepts.length?'both':lexical?'lexical':'semantic') as EvidenceCandidate['retrieval']};}).filter(c=>c.score>0);
}
export function rankEvidence(candidates:EvidenceCandidate[]):EvidenceCandidate[]{return [...candidates].sort((a,b)=>b.score-a.score||(a.fact.verification_status==='document_supported'?-1:0)-(b.fact.verification_status==='document_supported'?-1:0)||a.fact.id.localeCompare(b.fact.id));}
export function verifyEvidence(requirement:Requirement,candidate:EvidenceCandidate):VerifiedEvidence{
 const req=normalized(requirement.statement),source=normalized(candidate.fact.statement);
 const credentialNegative=/no certification|not certified|without certification|brak cert|nie posiad.*cert/.test(source);
 const reqCredential=/certif|certyf|licen|uprawnien/.test(req)||requirement.category==='certification';
 const directNegative=/never (?:managed|led)|no (?:experience|direct reports)|nie (?:zarzadzalem|kierowalem)|brak doswiadczenia/.test(source);
 const explicitNegative=(credentialNegative&&reqCredential)||directNegative;
 const exact=source===req;
 const dimensions=semanticConcepts(requirement.statement);
 const allMeaning=dimensions.length>0&&dimensions.every(c=>candidate.matchedConcepts.includes(c));
 const credentialRequirement=['certification','education','language'].includes(requirement.category)||dimensions.includes('certification');
 const knownCredential=/(?:PMP|PRINCE2|IPMA|CFA|ACCA|CISSP|AWS|AZ-\d+)/gi;
 const requiredCredentials=requirement.statement.match(knownCredential)??[];
 const credentialsPresent=requiredCredentials.every(c=>source.includes(c.toLowerCase()));
 const directRequired=dimensions.includes('direct_management');
 if(explicitNegative&&candidate.matchedConcepts.length)return {factId:candidate.fact.id,status:'explicitly_unsupported',confidence:'medium',reason:'Source contains an explicit negative assertion; scope requires human review.',matchedConcepts:candidate.matchedConcepts};
 // Semantic overlap finds candidates; only exact wording establishes all requested specifics automatically.
 if(exact&&!explicitNegative)return {factId:candidate.fact.id,status:'supported',confidence:'high',reason:'Confirmed source states this exact requirement.',matchedConcepts:candidate.matchedConcepts};
 const reason=credentialRequirement&&!credentialsPresent?'Relevant background does not establish the required credential.':directRequired&&!candidate.matchedConcepts.includes('direct_management')?'Coordination does not establish direct people management.':allMeaning?'Confirmed source covers related concepts; dates, scope and depth still need review.':'Related experience establishes only part of the requirement.';
 return {factId:candidate.fact.id,status:'partial',confidence:allMeaning&&!credentialRequirement?'medium':'low',reason,matchedConcepts:candidate.matchedConcepts};
}
