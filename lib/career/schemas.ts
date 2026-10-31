import {z} from 'zod';
const text=z.string().max(5000).nullable().optional();
const name=z.string().trim().min(1).max(300);
const date=z.union([z.iso.date(),z.literal('').transform(()=>null)]).nullable().optional();
export const entitySchemas={
 work_experiences:z.object({employer:name,position:name,start_date:date,end_date:date,employment_type:text,location:text,department:text,responsibility_scope:text,team_structure:text,management_responsibilities:text,tools:z.array(name).optional(),industry:text}),
 projects:z.object({title:name,organization:text,description:text,industry:text,project_type:text,budget:z.number().nonnegative().nullable().optional(),currency:z.string().regex(/^[A-Z]{3}$/).nullable().optional(),team_size:z.number().int().nonnegative().nullable().optional(),role:text,duration:text,responsibilities:z.array(name).optional(),technologies:z.array(name).optional(),deliverables:z.array(name).optional(),results:z.array(name).optional(),challenges:text,stakeholders:z.array(name).optional(),confidential:z.boolean().optional()}),
 achievements:z.object({description:name,context:text,contribution:text,measurable_outcome:z.number().nullable().optional(),measurement_unit:text,supporting_evidence:text}),
 skills:z.object({name,category:text,proficiency:text,years_experience:z.number().nonnegative().nullable().optional()}),
 education:z.object({institution:name,degree:text,field_of_study:text,start_date:date,end_date:date,specialization:text}),
 certifications:z.object({name,issuer:text,issue_date:date,expiration_date:date,credential_id:text}),
 languages:z.object({language:name,proficiency:name,certification:text}),
};
export const entityName=z.enum(['work_experiences','projects','achievements','skills','education','certifications','languages']);
export const factTypeForEntity={work_experiences:'experience',projects:'project',achievements:'achievement',skills:'skill',education:'education',certifications:'certification',languages:'language'} as const;
export function entityStatement(entity:z.infer<typeof entityName>,data:Record<string,unknown>):string{
 const fields:Record<z.infer<typeof entityName>,string[]>={work_experiences:['position','employer','start_date','end_date','responsibility_scope'],projects:['title','organization','role','description','budget','currency'],achievements:['description','contribution','measurable_outcome','measurement_unit'],skills:['name','proficiency'],education:['institution','degree','field_of_study'],certifications:['name','issuer'],languages:['language','proficiency']};
 return fields[entity].map(f=>data[f]).filter(v=>v!==null&&v!==undefined&&v!=='').join(' — ').slice(0,4000);
}
