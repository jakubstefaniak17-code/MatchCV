import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {Packer} from 'docx';
import type {Resume} from '../resume/engine';
import {buildDocx,buildPdf} from './render';
export async function exportDocx(resume:Resume):Promise<Buffer>{return Packer.toBuffer(buildDocx(resume));}
export async function exportPdf(resume:Resume):Promise<Uint8Array>{return buildPdf(resume,await readFile(path.join(process.cwd(),'public/fonts/DejaVuSans.ttf')));}
