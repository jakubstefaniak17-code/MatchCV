import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {PDFDocument,rgb} from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import {Document,Packer,Paragraph,TextRun,HeadingLevel} from 'docx';
import type {Resume} from '../resume/engine';
const palettes={professional:{color:'#17263B',font:'Arial',size:10},executive:{color:'#163C3A',font:'Georgia',size:11},technical:{color:'#204578',font:'Calibri',size:10}};
export async function exportDocx(resume:Resume):Promise<Buffer>{
  const style=palettes[resume.template];
  const children:Paragraph[]=[new Paragraph({text:resume.headline,heading:HeadingLevel.TITLE}),...resume.summary.split('\n').filter(Boolean).map(text=>new Paragraph({text,spacing:{after:120}}))];
  for(const section of resume.sections.filter(s=>!s.hidden)){
    children.push(new Paragraph({text:section.title,heading:HeadingLevel.HEADING_1}));
    for(const claim of section.claims)children.push(new Paragraph({children:[new TextRun(claim.text)],bullet:{level:0},spacing:{after:120}}));
  }
  return Packer.toBuffer(new Document({creator:'MatchCV',title:resume.title,styles:{default:{document:{run:{font:style.font,size:style.size*2,color:style.color.slice(1)},paragraph:{spacing:{line:276}}}}},sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:900,bottom:900,left:1000,right:1000}}},children}]}));
}
export async function exportPdf(resume:Resume):Promise<Uint8Array>{
  const doc=await PDFDocument.create();doc.registerFontkit(fontkit);
  const fontData=await readFile(path.join(process.cwd(),'public/fonts/DejaVuSans.ttf'));const font=await doc.embedFont(fontData,{subset:true});
  const style=palettes[resume.template];const hex=style.color.replace('#','');const color=rgb(parseInt(hex.slice(0,2),16)/255,parseInt(hex.slice(2,4),16)/255,parseInt(hex.slice(4,6),16)/255);
  let page=doc.addPage([595.28,841.89]),y=790;const margin=48,width=499;
  function line(text:string,size:number,gap:number){
    // Text remains selectable; long tokens are broken by measured glyph width.
    const words=text.replace(/\r/g,'').split(/\s+/);let current='';const lines:string[]=[];
    for(const word of words){const candidate=current?`${current} ${word}`:word;if(font.widthOfTextAtSize(candidate,size)<=width){current=candidate;continue;}if(current)lines.push(current);current='';for(const char of word){if(font.widthOfTextAtSize(current+char,size)>width){lines.push(current);current='';}current+=char;}}
    if(current)lines.push(current);
    for(const value of lines){if(y<60){page=doc.addPage([595.28,841.89]);y=790;}page.drawText(value,{x:margin,y,size,font,color});y-=size*1.45;}y-=gap;
  }
  line(resume.headline,resume.template==='executive'?20:18,16);
  for(const paragraph of resume.summary.split('\n').filter(Boolean))line(paragraph,style.size,8);
  for(const section of resume.sections.filter(s=>!s.hidden)){if(y<120){page=doc.addPage([595.28,841.89]);y=790;}line(section.title,13,8);for(const claim of section.claims)line(`• ${claim.text}`,style.size,8);y-=8;}
  doc.setTitle(resume.title);doc.setCreator('MatchCV');return doc.save();
}
