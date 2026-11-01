import {resumeSchema,resumeClaims,validateResume,editorialClaimKey,type Resume,type Fact} from './engine';
/** prior must come from the owner's stored CV, never from an incoming request. */
export function reviewResume(candidate:Resume,prior:Resume,facts:Fact[],approveDocument:boolean){
 const content=resumeSchema.parse(candidate);
 const priorKeys=prior.generation?.editorialApprovals||[];
 const preliminary=validateResume(content,facts,{allowPendingEditorial:true,approvedEditorialClaims:priorKeys});
 if(!preliminary.valid)return {content,result:preliminary};
 const claims=resumeClaims(content),currentKeys=new Set(claims.map(c=>editorialClaimKey(c,facts)));
 const keys=[...new Set([...priorKeys.filter(key=>currentKeys.has(key)),...claims.filter(c=>c.editorialApproved===true).map(c=>editorialClaimKey(c,facts))])];
 const result=validateResume(content,facts,{allowPendingEditorial:!approveDocument,approvedEditorialClaims:keys});
 const generation=prior.generation||{mode:'basic' as const,status:'basic_draft' as const,warnings:[]};
 content.generation={...generation,editorialApprovals:keys,status:result.needsEditorialReview?'editorial_review_required':generation.mode==='basic'?'basic_draft':'ready_for_review',warnings:[...new Set([...generation.warnings,...result.warnings])]};
 return {content,result};
}
