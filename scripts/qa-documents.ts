import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {PDFDocument} from 'pdf-lib';
import {documentCareerCases,documentCareerFixture} from '../tests/fixtures/document-careers';
import {exportDocx,exportPdf} from '../lib/documents/export';

async function main(){
// Deliberately writes outside the checkout by default; generated documents are QA artifacts, not fixtures containing personal data.
const output=path.resolve(process.argv[2]||'/tmp/matchcv-document-qa-v04');
await mkdir(output,{recursive:true});
const results=[];
for(const scenario of documentCareerCases)for(const template of ['executive_clarity','modern_studio'] as const){
 const resume=documentCareerFixture(scenario,template),name=`${scenario}-${template}`;
 const pdf=await exportPdf(resume);await writeFile(path.join(output,name+'.pdf'),pdf);await writeFile(path.join(output,name+'.docx'),await exportDocx(resume));
 const parsed=await PDFDocument.load(pdf);results.push({scenario,template,pages:parsed.getPageCount(),employmentCount:resume.employment?.length});
}
await writeFile(path.join(output,'manifest.json'),JSON.stringify(results,null,2));
console.log(JSON.stringify({output,results},null,2));

}
void main().catch(error=>{console.error(error instanceof Error?error.message:"Document QA failed");process.exitCode=1;});
