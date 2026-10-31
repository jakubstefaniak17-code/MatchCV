import {PDFDocument,rgb,type PDFFont} from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import {Document,Paragraph,TextRun,HeadingLevel,BorderStyle,LineRuleType,PageBorderOffsetFrom} from 'docx';
import {summaryLabel,type Resume,type TemplateId} from '../resume/engine';

/** Product Kit values, with its explicit 9 pt minimum taking precedence over 8/8.5 pt reference runs. */
export const documentTemplates={
  executive_clarity:{name:'Executive Clarity',accent:'20304B',caseAccent:'20304B',nameSize:23,headingSize:9.5,uppercase:true,sectionRule:true},
  modern_studio:{name:'Modern Studio',accent:'167C80',caseAccent:'D57866',nameSize:25,headingSize:10,uppercase:false,sectionRule:false},
} as const;
const BODY='1D2638',MUTED='617084',RULE='E3E8ED';
export const documentPage={width:595.28,height:841.89,left:51,right:51,top:48.2,bottom:41.1};
interface DocumentBlock {kind:'name'|'role'|'contact'|'heading'|'body'|'bullet'|'case';text:string;size:number;bold:boolean;color:string;before:number;after:number;prefix?:string;rule?:boolean;keepWithNext?:boolean}
export interface ResumeDocument {template:TemplateId;title:string;blocks:DocumentBlock[]}
/** PDF and DOCX consume this one ordered structure. No factual text is invented in presentation. */
export function buildResumeDocument(resume:Resume):ResumeDocument{
  const style=documentTemplates[resume.template];const blocks:DocumentBlock[]=[];
  if(resume.person?.name)blocks.push({kind:'name',text:resume.person.name.toLocaleUpperCase(resume.language),size:style.nameSize,bold:true,color:style.accent,before:0,after:4,keepWithNext:true});
  blocks.push({kind:'role',text:resume.headline,size:10,bold:true,color:MUTED,before:0,after:6,keepWithNext:Boolean(resume.person?.contact.length)});
  if(resume.person?.contact.length)blocks.push({kind:'contact',text:resume.person.contact.join('  •  '),size:9,bold:false,color:MUTED,before:0,after:7,rule:true});
  function heading(text:string){blocks.push({kind:'heading',text:style.uppercase?text.toLocaleUpperCase(resume.language):text,size:style.headingSize,bold:true,color:style.accent,before:10,after:5,rule:style.sectionRule,keepWithNext:true});}
  if(resume.summary.trim()){heading(summaryLabel(resume.language,resume.template));for(const text of resume.summary.split('\n').filter(Boolean))blocks.push({kind:'body',text,size:9,bold:false,color:BODY,before:0,after:3});}
  for(const section of resume.sections.filter(s=>!s.hidden&&s.claims.length)){
    heading(section.title);
    section.claims.forEach((claim,index)=>{
      const kind=resume.template==='modern_studio'&&['project','achievement'].includes(section.id)?'case':['education','certification','language','skill'].includes(section.id)?'body':'bullet';
      blocks.push({kind,text:claim.text,size:9,bold:false,color:BODY,before:0,after:kind==='case'?5:3,...(kind==='case'?{prefix:String(index+1).padStart(2,'0')}:kind==='bullet'?{prefix:'•'}:{})});
    });
  }
  return {template:resume.template,title:resume.title,blocks};
}
export function buildDocx(resume:Resume):Document{
  const model=buildResumeDocument(resume),style=documentTemplates[model.template];
  const children=model.blocks.map(block=>{
    const runs:TextRun[]=[];
    if(block.prefix)runs.push(new TextRun({text:block.prefix+'  ',bold:block.kind==='case',color:block.kind==='case'?style.caseAccent:BODY,size:block.size*2,font:'DejaVu Sans'}));
    runs.push(new TextRun({text:block.text,bold:block.bold,color:block.color,size:block.size*2,font:'DejaVu Sans'}));
    return new Paragraph({children:runs,...(block.kind==='heading'?{heading:HeadingLevel.HEADING_1}:{}),keepNext:block.keepWithNext,keepLines:block.kind==='heading'||block.kind==='name'||block.kind==='role',widowControl:true,wordWrap:true,spacing:{before:Math.round(block.before*20),after:Math.round(block.after*20),line:Math.round(block.size*1.3*20),lineRule:LineRuleType.EXACT},...(block.rule?{border:{bottom:{color:RULE,size:4,style:BorderStyle.SINGLE,space:2}}}:{}),...(block.prefix?{indent:{left:block.kind==='case'?400:200,hanging:block.kind==='case'?400:200}}:{})});
  });
  return new Document({creator:'MatchCV',title:model.title,description:`${style.name} — selectable, single-column A4 career document`,styles:{default:{document:{run:{font:'DejaVu Sans',size:18,color:BODY}}},paragraphStyles:[{id:'Heading1',name:'Heading 1',basedOn:'Normal',next:'Normal',quickFormat:true,run:{font:'DejaVu Sans',size:style.headingSize*2,bold:true,color:style.accent},paragraph:{keepNext:true,keepLines:true}}]},sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:964,bottom:822,left:1020,right:1020},borders:{pageBorders:{offsetFrom:PageBorderOffsetFrom.PAGE},pageBorderTop:{style:BorderStyle.SINGLE,size:18,color:style.accent,space:0}}}},children}]});
}
function pdfColor(hex:string){return rgb(parseInt(hex.slice(0,2),16)/255,parseInt(hex.slice(2,4),16)/255,parseInt(hex.slice(4,6),16)/255);}
function wrapText(text:string,font:PDFFont,size:number,width:number):string[]{
  const lines:string[]=[];
  for(const paragraph of text.replace(/\r/g,'').split('\n')){
    let current='';
    for(const word of paragraph.split(/\s+/).filter(Boolean)){
      const candidate=current?`${current} ${word}`:word;
      if(font.widthOfTextAtSize(candidate,size)<=width){current=candidate;continue;}
      if(current){lines.push(current);current='';}
      // A very long URL or technical identifier must never overflow the A4 content box.
      for(const char of word){if(current&&font.widthOfTextAtSize(current+char,size)>width){lines.push(current);current='';}current+=char;}
    }
    if(current)lines.push(current);
  }
  return lines.length?lines:[''];
}
export async function buildPdf(resume:Resume,fontData:Uint8Array,boldFontData?:Uint8Array):Promise<Uint8Array>{
  const doc=await PDFDocument.create();doc.registerFontkit(fontkit);
  const regular=await doc.embedFont(fontData,{subset:true}),bold=boldFontData?await doc.embedFont(boldFontData,{subset:true}):regular;
  const model=buildResumeDocument(resume),style=documentTemplates[model.template];
  const {width,height,left,right,top,bottom}=documentPage;const contentWidth=width-left-right;
  let page=doc.addPage([width,height]),cursor=height-top;
  function decoration(){page.drawLine({start:{x:left,y:height-1},end:{x:width-right,y:height-1},color:pdfColor(style.accent),thickness:2});}
  decoration();
  function newPage(){page=doc.addPage([width,height]);cursor=height-top;decoration();}
  const metrics=model.blocks.map(block=>{const font=block.bold?bold:regular;const indent=block.kind==='case'?20:block.kind==='bullet'?10:0;const lines=wrapText(block.text,font,block.size,contentWidth-indent);return {block,font,indent,lines,lineHeight:block.size*1.3};});
  for(let index=0;index<metrics.length;index++){
    const {block,font,indent,lines,lineHeight}=metrics[index];
    const next=metrics[index+1];
    // Keep headings with at least two following text lines. Header chains stay together too.
    let required=block.before+lines.length*lineHeight+block.after;
    if(block.keepWithNext&&next)required+=next.block.before+Math.min(2,next.lines.length)*next.lineHeight;
    const fullPage=height-top-bottom;
    if(cursor-bottom<required&&required<=fullPage)newPage();
    cursor-=block.before;
    for(let n=0;n<lines.length;n++){
      const remaining=lines.length-n;
      // Avoid single-line widows when a paragraph necessarily spans pages.
      if(cursor-bottom<lineHeight||(remaining>1&&cursor-bottom<lineHeight*2)){newPage();}
      page.drawText(lines[n],{x:left+indent,y:cursor-block.size,size:block.size,font,color:pdfColor(block.color)});
      if(n===0&&block.prefix)page.drawText(block.prefix,{x:left,y:cursor-block.size,size:block.size,font:block.kind==='case'?bold:regular,color:pdfColor(block.kind==='case'?style.caseAccent:BODY)});
      cursor-=lineHeight;
    }
    if(block.rule){cursor-=2;page.drawLine({start:{x:left,y:cursor},end:{x:width-right,y:cursor},color:pdfColor(RULE),thickness:.45});}
    cursor-=block.after;
  }
  // Page numbers are navigational text, never candidate facts.
  if(doc.getPageCount()>1)doc.getPages().forEach((p,index)=>p.drawText(`${index+1} / ${doc.getPageCount()}`,{x:width-right-35,y:20,size:9,font:regular,color:pdfColor(MUTED)}));
  doc.setTitle(resume.title);doc.setCreator('MatchCV');doc.setSubject(style.name);return doc.save();
}
