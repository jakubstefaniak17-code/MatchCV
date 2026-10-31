import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {Packer} from 'docx';
import type {Resume} from '../resume/engine';
import {buildDocx,buildPdf} from './render';
export async function exportDocx(resume:Resume):Promise<Buffer>{return Packer.toBuffer(buildDocx(resume));}
export async function exportPdf(resume:Resume):Promise<Uint8Array>{
  const [regular,bold]=await Promise.all(['DejaVuSans.ttf','DejaVuSans-Bold.ttf'].map(file=>readFile(path.join(process.cwd(),'public/fonts',file))));
  return buildPdf(resume,regular,bold);
}
