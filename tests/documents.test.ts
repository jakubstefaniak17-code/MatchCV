import {describe,it,expect} from 'vitest';
import {generateResume} from '../lib/resume/engine';
import {analyzeJob} from '../lib/jobs/analyze';
import {syntheticFacts,syntheticJobs} from '../data/demo';
import {exportPdf,exportDocx} from '../lib/documents/export';
import {extractDocument} from '../lib/documents/import';
describe('synthetic demonstration and real document exports',()=>{
 it('materially selects different summaries, competencies and achievements for three roles',()=>{const versions=syntheticJobs.map(j=>generateResume({facts:syntheticFacts,analysis:analyzeJob(j.text,'en'),language:'en',template:'professional'}));expect(new Set(versions.map(v=>v.summary)).size).toBe(3);expect(new Set(versions.map(v=>JSON.stringify(v.sections.find(s=>s.id==='skill')?.claims))).size).toBe(3);expect(new Set(versions.map(v=>JSON.stringify(v.sections.find(s=>s.id==='achievement')?.claims))).size).toBe(3);});
 it('exports real PDF and DOCX with selectable Unicode text and imports both',async()=>{const r=generateResume({facts:[...syntheticFacts,{id:'71000000-0000-4000-8000-000000000011',statement:'Zarządzał zespołem: Łódź, język polski, osiągnięcia.',fact_type:'language',verification_status:'user_confirmed'}],analysis:analyzeJob(syntheticJobs[0].text),language:'pl',template:'executive'});const pdf=Buffer.from(await exportPdf(r));const docx=await exportDocx(r);expect(pdf.subarray(0,5).toString()).toBe('%PDF-');expect(docx.subarray(0,2).toString()).toBe('PK');const pdfText=await extractDocument({name:'cv.pdf',type:'application/pdf',buffer:pdf});const docxText=await extractDocument({name:'cv.docx',type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',buffer:docx});for(const text of [pdfText,docxText]){expect(text).toContain('Łódź');expect(text).toContain('osiągnięcia');expect(text).toContain('Rola docelowa');}},20000);
});
