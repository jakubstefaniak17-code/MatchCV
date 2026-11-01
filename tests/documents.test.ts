import {describe,it,expect} from 'vitest';
import {inflateRawSync} from 'node:zlib';
import {PDFDocument} from 'pdf-lib';
import {generateResume,normalizeLegacyResume,normalizeLegacyTemplate,templateSchema,type TemplateId,type Resume} from '../lib/resume/engine';
import {analyzeJob} from '../lib/jobs/analyze';
import {syntheticFacts,syntheticJobs} from '../data/demo';
import {exportPdf,exportDocx} from '../lib/documents/export';
import {buildResumeDocument,employmentDateLabel} from '../lib/documents/render';
import {extractDocument} from '../lib/documents/import';
function zipText(zip:Buffer,name:string):string{
 for(let i=0;i<zip.length-46;i++)if(zip.readUInt32LE(i)===0x02014b50){const nameLength=zip.readUInt16LE(i+28);if(zip.subarray(i+46,i+46+nameLength).toString()!==name)continue;const compressedSize=zip.readUInt32LE(i+20),offset=zip.readUInt32LE(i+42),method=zip.readUInt16LE(i+10);const start=offset+30+zip.readUInt16LE(offset+26)+zip.readUInt16LE(offset+28);const content=zip.subarray(start,start+compressedSize);return (method===8?inflateRawSync(content):content).toString('utf8');}throw new Error('ZIP entry absent: '+name);
}
const templates:TemplateId[]=['executive_clarity','modern_studio'];
function draft(template:TemplateId):Resume{return generateResume({facts:[...syntheticFacts,{id:'71000000-0000-4000-8000-000000000011',statement:'Zarządzał zespołem: Łódź, język polski, osiągnięcia.',fact_type:'language',verification_status:'user_confirmed'}],analysis:analyzeJob(syntheticJobs[0].text),language:'pl',template});}
describe('synthetic demonstration and authoritative document templates',()=>{
 it('materially selects different summaries, competencies and achievements for three roles',()=>{const versions=syntheticJobs.map(j=>generateResume({facts:syntheticFacts,analysis:analyzeJob(j.text,'en'),language:'en',template:'executive_clarity'}));expect(new Set(versions.map(v=>v.summary)).size).toBe(3);expect(new Set(versions.map(v=>JSON.stringify(v.sections.find(s=>s.id==='skill')?.claims))).size).toBe(3);expect(new Set(versions.map(v=>JSON.stringify(v.sections.find(s=>s.id==='achievement')?.claims))).size).toBe(3);});
 it('offers exactly two templates and adapts old drafts without discarding claims',()=>{expect(templateSchema.options).toEqual(templates);expect(normalizeLegacyTemplate('technical')).toBe('modern_studio');const old={...draft('executive_clarity'),template:'professional'};const adapted=normalizeLegacyResume(old);expect(adapted.template).toBe('executive_clarity');expect(adapted.sections).toEqual(old.sections);expect(adapted.person).toEqual(old.person);});
 for(const template of templates){
  it(`${template}: exports selectable Unicode PDF and editable single-column A4 DOCX`,async()=>{const r=draft(template);const pdf=Buffer.from(await exportPdf(r));const docx=await exportDocx(r);expect(pdf.subarray(0,5).toString()).toBe('%PDF-');expect(docx.subarray(0,2).toString()).toBe('PK');const pdfText=await extractDocument({name:'cv.pdf',type:'application/pdf',buffer:pdf});const docxText=await extractDocument({name:'cv.docx',type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',buffer:docx});for(const text of [pdfText,docxText]){expect(text).toContain('Łódź');expect(text).toContain('osiągnięcia');expect(text).toContain('Rola docelowa');expect(text).toContain('ALEX MORGAN');expect(text).toContain('alex.morgan@example.com');}
   const xml=zipText(docx,'word/document.xml');expect(xml).toContain('w:w="11906"');expect(xml).toContain('w:h="16838"');expect(xml).toContain('w:left="1020"');expect(xml).toContain('w:top="964"');expect(xml).toContain('w:keepNext');expect(xml).toContain('w:widowControl');expect(xml).not.toContain('<w:tbl>');expect(xml).not.toContain('<w:drawing>');for(const match of xml.matchAll(/<w:sz w:val="(\d+)"/g))expect(Number(match[1])).toBeGreaterThanOrEqual(18);
   if(template==='modern_studio'){expect(xml).toContain('167C80');expect(xml).toContain('D57866');expect(xml).toContain('Wybrane projekty i rezultaty');}else{expect(xml).toContain('20304B');expect(xml).toContain('PROFIL ZAWODOWY');}
  },20000);
  it(`${template}: preserves long content across two pages and breaks unbroken identifiers`,async()=>{const r=draft(template);const identifier='VeryLongIdentifier'+('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.repeat(16));r.sections=[{id:'experience',title:'Doświadczenie zawodowe',hidden:false,claims:Array.from({length:27},(_,i)=>({text:`Projekt ${i+1}: Zarządzanie harmonogramem, współpraca z zespołem, nadzór jakości, analiza ryzyk oraz przygotowanie dokumentacji realizacji przedsięwzięcia. Łódź.`,factIds:[syntheticFacts[0].id]}))},{id:'skill',title:'Kompetencje i narzędzia',hidden:false,claims:[{text:identifier,factIds:[syntheticFacts[0].id]}]}];const bytes=Buffer.from(await exportPdf(r));const pdf=await PDFDocument.load(bytes);expect(pdf.getPageCount()).toBe(2);for(const page of pdf.getPages()){expect(page.getWidth()).toBeCloseTo(595.28);expect(page.getHeight()).toBeCloseTo(841.89);}const text=await extractDocument({name:'long.pdf',type:'application/pdf',buffer:bytes});expect(text).toContain('Projekt 27');expect(text.replace(/\s/g,'')).toContain(identifier);},20000);
 }
 it('uses different hierarchy and case accents from a shared factual model',()=>{const executive=buildResumeDocument(draft('executive_clarity')),modern=buildResumeDocument(draft('modern_studio'));expect(executive.blocks.find(b=>b.kind==='name')?.size).toBe(23);expect(modern.blocks.find(b=>b.kind==='name')?.size).toBe(25);expect(executive.blocks.find(b=>b.kind==='heading')?.rule).toBe(true);expect(modern.blocks.find(b=>b.kind==='heading')?.rule).toBe(false);expect(modern.blocks.some(b=>b.kind==='case'&&b.prefix==='01')).toBe(true);for(const model of [executive,modern])expect(model.blocks.every(b=>b.size>=9)).toBe(true);});
});

import {documentCareerCases,documentCareerFixture} from './fixtures/document-careers';
describe('Career Engine 2.0 document chronology',()=>{
 for(const template of templates){
  for(const scenario of documentCareerCases){
   it(`${template}: retains ${scenario} chronology in PDF and editable DOCX`,async()=>{
    const resume=documentCareerFixture(scenario,template);
    const pdf=Buffer.from(await exportPdf(resume)),docx=await exportDocx(resume);
    const pdfText=await extractDocument({name:'chronology.pdf',type:'application/pdf',buffer:pdf});
    const docxText=await extractDocument({name:'chronology.docx',type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',buffer:docx});
    for(const text of [pdfText,docxText]){
     let previous=-1;
     for(const entry of resume.employment||[]){const position=text.indexOf(entry.employer);expect(position).toBeGreaterThan(previous);expect(text).toContain(entry.position);expect(text).toContain(employmentDateLabel(entry.startDate,resume.language));previous=position;}
     expect(text).toContain('obecnie');expect(text).toContain('Łódź');
     for(const claim of resume.sections.find(s=>s.id==='project')!.claims)expect(text.replace(/•/g,'').replace(/\s+/g,' ')).toContain(claim.text);
    }
    const xml=zipText(docx,'word/document.xml');expect(xml).toContain('w:keepNext');expect(xml).not.toContain('<w:drawing>');
    const model=buildResumeDocument(resume);expect(model.blocks.filter(b=>b.kind==='employment')).toHaveLength(resume.employment!.length);
   },20000);
  }
 }
 it('does not imply current employment when the end date is unknown, and respects hiding the experience section',()=>{
  const resume=documentCareerFixture('junior','executive_clarity');resume.employment![0].isCurrent=false;
  const model=buildResumeDocument(resume);expect(model.blocks.find(b=>b.kind==='period')?.text).not.toContain('obecnie');
  resume.sections.find(s=>s.id==='experience')!.hidden=true;expect(buildResumeDocument(resume).blocks.some(b=>b.kind==='employment')).toBe(false);
 });
 it('keeps legacy unstructured experience visible without creating employers or dates',()=>{
  const resume=documentCareerFixture('junior','modern_studio');delete resume.employment;resume.sections.find(s=>s.id==='experience')!.claims=[{text:'Potwierdzona odpowiedzialność bez ustalonego pracodawcy.',factIds:[syntheticFacts[0].id]}];
  const model=buildResumeDocument(resume);expect(model.blocks.some(b=>b.text==='Potwierdzona odpowiedzialność bez ustalonego pracodawcy.')).toBe(true);expect(model.blocks.some(b=>b.kind==='employment')).toBe(false);
 });
});
