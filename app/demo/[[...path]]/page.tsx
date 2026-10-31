import {DemoWorkspace} from '@/components/demo-workspace';
export default async function DemoPage({params}:{params:Promise<{path?:string[]}>}){const {path}=await params;return <DemoWorkspace path={path||['dashboard']}/>;}
