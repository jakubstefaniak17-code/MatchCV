/** Conservative language gate, not a translation engine. Proper names and short technical lists remain undetermined. */
export function documentLanguage(text:string):'pl'|'en'|null{
 const t=text.toLowerCase();const pl=(t.match(/\b(?:oraz|przez|zespołu|zespołem|projektów|projektu|zarządzanie|koordynacja|wdrożenie|wyników|współpraca|przygotowanie|zawodowe|osiągnięcia|prowadzenie)\b/g)??[]).length;
 const en=(t.match(/\b(?:the|and|with|managed|coordinated|implemented|delivered|reporting|project|projects|team|experience|prepared|contributed)\b/g)??[]).length;
 if(pl>=3&&pl>en*1.5)return 'pl';if(en>=4&&en>pl*1.5)return 'en';return null;
}
