import {copyFile,mkdir,access} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const source=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const target=process.argv[2];
if(!target||!path.isAbsolute(target))throw new Error('Supply the absolute checkout of the existing MatchCV review Site.');
await access(path.join(target,'.openai/hosting.json'));
const files=['components/career/source-details.tsx','components/workspace-state.tsx','components/career/story.tsx','components/resume/editor.tsx','lib/resume/context.ts','lib/resume/editorial.ts','lib/resume/fingerprint.ts','lib/resume/semantic.ts','lib/resume/language.ts','lib/resume/review.ts','components/demo-workspace.tsx','components/workspace.tsx','components/shell.tsx','components/career/entity-editor.tsx','components/ui/button.tsx','lib/demo/transport.ts','lib/resume/engine.ts','lib/jobs/analyze.ts','lib/interview/engine.ts','lib/career/schemas.ts','lib/documents/render.ts','lib/utils.ts','data/demo.ts','data/interview-questions.ts','app/globals.css','public/fonts/DejaVuSans.ttf','public/fonts/LICENSE-DejaVu.txt','public/fonts/DejaVuSans-Bold.ttf','data/interview-40.json','lib/interview/types.ts','lib/interview/schema.ts','lib/interview/repository.ts','lib/career/provenance.ts','components/interview/interview.tsx','styles/tokens.css'];
for(const file of files){await mkdir(path.dirname(path.join(target,file)),{recursive:true});await copyFile(path.join(source,file),path.join(target,file));}
console.log(`Synced ${files.length} product files. Existing Site identity and adapters preserved.`);
