import type {Resume,TemplateId} from '../../lib/resume/engine';

/** Entirely fictional profiles for document layout regression; never seeded into user accounts. */
export const documentCareerCases=['junior','mid','senior_project_manager','executive','project_portfolio','career_change'] as const;
export type DocumentCareerCase=typeof documentCareerCases[number];
const id=(index:number)=>`94000000-0000-4000-8000-${String(index+1).padStart(12,'0')}`;
const responsibilities=[
 'Przygotowanie harmonogramu i uzgodnienie zależności pomiędzy zespołem projektowym, dostawcami oraz jednostkami operacyjnymi.',
 'Koordynacja współpracy z wykonawcami, prowadzenie przeglądów postępu i dokumentowanie uzgodnionych działań naprawczych.',
 'Analiza ryzyk technicznych oraz przygotowanie wariantów decyzji wraz z oceną wpływu na termin, jakość i koszty realizacji.',
 'Organizacja odbiorów, weryfikacja dokumentacji powykonawczej i przekazanie rezultatów do eksploatacji.',
 'Opracowanie standardu raportowania i przeszkolenie użytkowników w zakresie nowych procedur pracy.',
 'Uzgadnianie wymagań z interesariuszami i przekładanie ich na zakres prac oraz mierzalne kryteria akceptacji.',
];
export function documentCareerFixture(kind:DocumentCareerCase,template:TemplateId):Resume{
 const count={junior:1,mid:3,senior_project_manager:4,executive:5,project_portfolio:4,career_change:3}[kind];
 const details={junior:2,mid:3,senior_project_manager:5,executive:6,project_portfolio:4,career_change:4}[kind];
 const title={junior:'Młodsza koordynatorka projektów',mid:'Kierowniczka projektów',senior_project_manager:'Senior Project Manager',executive:'Dyrektorka realizacji inwestycji',project_portfolio:'Kierowniczka portfela projektów',career_change:'Koordynatorka transformacji procesów'}[kind];
 const employment=Array.from({length:count},(_,index)=>({id:id(100+index),employer:['Brzeg Energia','Studio Rzeczne','Północ Systemy','Zielony Most','Atlas Procesów'][index],position:index===0?title:['Specjalistka ds. realizacji','Koordynatorka projektów','Inżynierka projektu','Analityczka operacyjna'][index-1],startDate:`${2024-index*2}-01-01`,endDate:index===0?null:`${2025-index*2}-12-31`,isCurrent:index===0,location:index%2?'Warszawa':'Łódź',factIds:[id(index)],claims:responsibilities.slice(0,details).map((text,j)=>({text,factIds:[id(index*10+j)]}))}));
 const projects=Array.from({length:kind==='project_portfolio'?12:kind==='executive'?5:3},(_,index)=>({text:`Projekt ${index+1} — ${['Modernizacja zasilania zakładu','Cyfrowy obieg dokumentacji','Standaryzacja odbiorów'][index%3]}. Odpowiedzialność za uzgodnienie zakresu, koordynację dostawców i weryfikację rezultatów. Dokumentacja przekazana zespołowi operacyjnemu.`,factIds:[id(200+index)]}));
 const summary=kind==='career_change'?'Specjalistka operacyjna rozwijająca karierę w transformacji procesów. Łączy doświadczenie we współpracy z wykonawcami z analizą ryzyk i porządkowaniem sposobu pracy. W nowej roli chce wykorzystać umiejętność przekładania potrzeb użytkowników na konkretne usprawnienia.':'Koordynuje realizację projektów od uzgodnienia wymagań do przekazania rezultatów do eksploatacji. Łączy pracę z dokumentacją techniczną z prowadzeniem uzgodnień między wykonawcami i zespołami operacyjnymi. W przedstawionych rolach odpowiadała za harmonogramy, zarządzanie ryzykiem oraz jakość realizacji.';
 return {title,headline:title,language:'pl',template,person:{name:'Ewa Rzeczna',contact:['ewa.rzeczna@example.com','Łódź'],factIds:[id(999)]},summary,employment,sections:[{id:'skill',title:'Najważniejsze kompetencje',hidden:false,claims:[{text:'Koordynacja wykonawców · Harmonogramowanie · Zarządzanie ryzykiem · Dokumentacja techniczna',factIds:[id(500)]}]},{id:'experience',title:'Doświadczenie zawodowe',hidden:false,claims:[]},{id:'project',title:'Wybrane projekty',hidden:false,claims:projects},{id:'education',title:'Wykształcenie',hidden:false,claims:[{text:'Akademia Techniczna Brzegu — inżynieria środowiska, studia magisterskie, 2018.',factIds:[id(600)]}]},{id:'language',title:'Języki',hidden:false,claims:[{text:'Polski — ojczysty. Angielski — B2, współpraca projektowa.',factIds:[id(601)]}]}]};
}
