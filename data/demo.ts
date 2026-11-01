import type {Fact} from '../lib/resume/engine';
/** Entirely fictional demonstration data. Never contains an actual user's career details. */
export const syntheticFacts:Fact[]=[
{id:'71000000-0000-4000-8000-000000000101',statement:'Alex Morgan',fact_type:'identity',verification_status:'user_confirmed'},
{id:'71000000-0000-4000-8000-000000000102',statement:'alex.morgan@example.com',fact_type:'contact',verification_status:'user_confirmed'},
{id:'71000000-0000-4000-8000-000000000103',statement:'Westhaven (fictional)',fact_type:'contact',verification_status:'user_confirmed'},
{id:'71000000-0000-4000-8000-000000000001',statement:'Alex Morgan coordinated infrastructure procurement and contractor schedules for Northbridge Works, delivering a EUR 4.2 million programme.',fact_type:'experience',verification_status:'user_confirmed'},
{id:'71000000-0000-4000-8000-000000000002',statement:'Led project governance and stakeholder reporting for an international infrastructure team of 12 contributors.',fact_type:'achievement',verification_status:'user_confirmed'},
{id:'71000000-0000-4000-8000-000000000003',statement:'Implemented digital automation and analytics at Aster Process Labs, reducing monthly reporting preparation by 35%.',fact_type:'achievement',verification_status:'user_confirmed'},
{id:'71000000-0000-4000-8000-000000000004',statement:'Delivered digital transformation workshops and adoption training to 40 operational employees.',fact_type:'project',verification_status:'user_confirmed'},
{id:'71000000-0000-4000-8000-000000000005',statement:'Coordinated energy storage and grid infrastructure feasibility studies for a fictional 8 MW battery programme.',fact_type:'project',verification_status:'user_confirmed'},
{id:'71000000-0000-4000-8000-000000000006',statement:'Prepared energy procurement and grid connection risk assessments for Cedar Energy Studio.',fact_type:'achievement',verification_status:'user_confirmed'},
{id:'71000000-0000-4000-8000-000000000007',statement:'Applied project governance, procurement planning and stakeholder coordination methods.',fact_type:'skill',verification_status:'user_confirmed'},
{id:'71000000-0000-4000-8000-000000000008',statement:'Used digital automation, data analytics and change adoption methods.',fact_type:'skill',verification_status:'user_confirmed'},
{id:'71000000-0000-4000-8000-000000000009',statement:'Applied energy storage feasibility and grid connection assessment methods.',fact_type:'skill',verification_status:'user_confirmed'},
{id:'71000000-0000-4000-8000-000000000010',statement:'Completed a fictional MSc in Systems Engineering at Westhaven Institute of Technology in 2018.',fact_type:'education',verification_status:'user_confirmed'},
];
export const syntheticJobs=[
{title:'Senior Project Manager',text:'Senior Project Manager\nFictional employer: Northway Delivery\nRequirements\nProject governance and stakeholder reporting\nInfrastructure procurement and contractor schedules\nInternational project coordination\nResponsibilities\nManage programme budgets and risk assessments\nPreferred\nProcess improvement experience'},
{title:'Digital Transformation Manager',text:'Digital Transformation Manager\nFictional employer: Quartz Operations\nRequirements\nDigital automation and analytics\nTransformation workshops and adoption training\nChange adoption methods\nResponsibilities\nImprove reporting preparation and operational processes\nPreferred\nInternational team collaboration'},
{title:'Energy Infrastructure Manager',text:'Energy Infrastructure Manager\nFictional employer: Harbor Grid\nRequirements\nEnergy storage and grid infrastructure feasibility\nGrid connection risk assessments\nEnergy procurement\nResponsibilities\nCoordinate battery programme feasibility studies\nPreferred\nContractor coordination'},
];

/** Synthetic reviewed relational snapshots for chronology; unrelated to the owner's career. */
export const syntheticExperiences=[
 {id:'74000000-0000-4000-8000-000000000001',employer:'Northbridge Works',position:'Senior Project Coordinator',start_date:'2024-01-01',end_date:null,responsibility_scope:'Coordinated infrastructure procurement and contractor schedules. Prepared governance and stakeholder reporting.',industry:'Infrastructure'},
 {id:'74000000-0000-4000-8000-000000000002',employer:'Aster Process Labs',position:'Transformation Project Manager',start_date:'2022-01-01',end_date:'2023-12-31',responsibility_scope:'Implemented digital automation and analytics. Delivered transformation workshops and adoption training.',industry:'Digital operations'},
 {id:'74000000-0000-4000-8000-000000000003',employer:'Cedar Energy Studio',position:'Energy Project Analyst',start_date:'2020-01-01',end_date:'2021-12-31',responsibility_scope:'Prepared energy procurement and grid connection risk assessments. Coordinated energy storage feasibility studies.',industry:'Energy'},
 {id:'74000000-0000-4000-8000-000000000004',employer:'Westhaven Engineering',position:'Project Assistant',start_date:'2018-01-01',end_date:'2019-12-31',responsibility_scope:'Prepared project documentation and maintained contractor schedules.',industry:'Engineering'},
];
for(const experience of syntheticExperiences)syntheticFacts.push({id:experience.id.replace('74000000','75000000'),statement:`${experience.position} — ${experience.employer} — ${experience.start_date} — ${experience.end_date||'present'} — ${experience.responsibility_scope}`,fact_type:'experience',verification_status:'user_confirmed',source_reference:`work_experiences:${experience.id}`,structured_value:{...experience}} as Fact);
