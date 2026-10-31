import type {JobAnalysis} from '../resume/engine';
export function analyzeJob(text:string, language:'pl'|'en'='pl'):JobAnalysis {
  const lines=text.split(/\n+/).map(l=>l.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);
  if(text.trim().length<40)throw new Error('Paste at least 40 characters of the advertisement.');
  let priority:'mandatory'|'preferred'|'responsibility'='mandatory';
  const requirements:JobAnalysis['requirements']=[];
  for(const rawLine of lines.slice(1)) {
    let line=rawLine;
    const heading=line.match(/^(mile widziane|preferred|nice to have|desirable|wymagania|requirements|qualifications|nasze wymagania|obowiązki|responsibilities|twój zakres obowiązków|your role)\s*:?\s*(.*)$/i);
    if(heading){priority=/^(mile widziane|preferred|nice to have|desirable)$/i.test(heading[1])?'preferred':/^(obowiązki|responsibilities|twój zakres obowiązków|your role)$/i.test(heading[1])?'responsibility':'mandatory';line=heading[2].trim();if(!line)continue;}
    if(line.length<8)continue;
    const category=/certyf|certif|license/i.test(line)?'certification':/angiel|english|language|język/i.test(line)?'language':/degree|wykształ|studia|education/i.test(line)?'education':/lead|team|zesp|zarządz/i.test(line)?'management':/tool|software|python|excel|system|technolog/i.test(line)?'technical':'experience';
    requirements.push({id:`R${String(requirements.length+1).padStart(3,'0')}`,statement:line,category,priority});
  }
  return {title:lines[0]?.slice(0,200)|| (language==='pl'?'Oferta pracy':'Job offer'),employer:null,location:null,seniority:null,keywords:[...new Set(text.match(/\b(?:SQL|Python|Excel|SAP|PRINCE2|PMP|Agile|Scrum|BIM|PV|BESS|AI|PMBOK)\b/gi)??[])],requirements:requirements.slice(0,100)};
}
