import mammoth from 'mammoth';
import {PDFParse} from 'pdf-parse';
export const MAX_UPLOAD_BYTES=5*1024*1024;
export async function extractDocument(file:{name:string;type:string;buffer:Buffer}):Promise<string>{
  if(!file.buffer.length||file.buffer.length>MAX_UPLOAD_BYTES)throw new Error('Upload a non-empty PDF or DOCX up to 5 MB.');
  const extension=file.name.toLowerCase().split('.').pop();let text:string;
  if(extension==='pdf'&&file.type==='application/pdf'&&file.buffer.subarray(0,5).toString()==='%PDF-'){
    const parser=new PDFParse({data:new Uint8Array(file.buffer)});try{text=(await parser.getText()).text;}finally{await parser.destroy();}
  }else if(extension==='docx'&&file.type==='application/vnd.openxmlformats-officedocument.wordprocessingml.document'&&file.buffer.subarray(0,2).toString()==='PK'){
    // Reject ZIP bombs before extraction by examining central-directory uncompressed sizes.
    let total=0,entries=0;for(let i=0;i<file.buffer.length-46;i++){if(file.buffer.readUInt32LE(i)===0x02014b50){total+=file.buffer.readUInt32LE(i+24);entries++;if(total>20*1024*1024||entries>2000)throw new Error('DOCX decompressed content exceeds safety limits.');}}
    text=(await mammoth.extractRawText({buffer:file.buffer})).value;
  }else throw new Error('Unsupported document. File extension, MIME type and signature must match PDF or DOCX.');
  text=text.replace(/\u0000/g,'').trim();if(text.length<10)throw new Error('No readable text found. Scanned PDFs require OCR before importing.');if(text.length>100000)throw new Error('Document text exceeds 100,000 characters.');return text;
}
export function fallbackFacts(text:string){return text.split(/\n+/).map(line=>line.trim()).filter(line=>line.length>=12&&line.length<=1000).slice(0,100).map(statement=>({statement,fact_type:'other' as const,source_quote:statement,related_question_ids:[] as string[]}));}
