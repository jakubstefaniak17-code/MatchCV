import {lookup} from 'node:dns/promises';
import {request} from 'node:https';
import {isIP} from 'node:net';
const MAX_BYTES=1024*1024;
export function publicAddress(address:string):boolean {
  if(isIP(address)===6)return /^[23][0-9a-f]{3}:/i.test(address) && !/^(2001:(0:|db8:)|2002:)/i.test(address) && !address.includes('.');
  if(isIP(address)!==4)return false;
  const p=address.split('.').map(Number);return !(p[0]===0||p[0]===10||p[0]===127||p[0]>=224||(p[0]===169&&p[1]===254)||(p[0]===172&&p[1]>=16&&p[1]<=31)||(p[0]===192&&(p[1]===168||p[1]===0))||(p[0]===100&&p[1]>=64&&p[1]<=127)||(p[0]===198&&(p[1]===18||p[1]===19||p[1]===51))||(p[0]===203&&p[1]===0&&p[2]===113));
}
async function pinnedGet(url:URL):Promise<{status:number;text:string;contentType:string}> {
  const addresses=await lookup(url.hostname,{all:true});
  if(!addresses.length||addresses.some(a=>!publicAddress(a.address)))throw new Error('URL resolves to a prohibited network.');
  const pinned=addresses[0];
  return new Promise((resolve,reject)=>{
    const req=request(url,{method:'GET',headers:{'User-Agent':'MatchCV/0.3 (public job reader)','Accept':'text/html,text/plain'},lookup:(_hostname,_opts,callback)=>callback(null,pinned.address,pinned.family)},res=>{
      const chunks:Buffer[]=[];let size=0;
      res.on('data',(chunk:Buffer)=>{size+=chunk.length;if(size>MAX_BYTES){req.destroy(new Error('Advertisement exceeds retrieval limit.'));return;}chunks.push(chunk);});
      res.on('end',()=>resolve({status:res.statusCode??0,text:Buffer.concat(chunks).toString('utf8'),contentType:String(res.headers['content-type']??'')}));
      res.on('error',reject);
    });
    req.setTimeout(10000,()=>req.destroy(new Error('Advertisement retrieval timed out.')));req.on('error',reject);req.end();
  });
}
export async function retrieveJob(urlString:string):Promise<string>{
  const url=new URL(urlString);
  const allowed=(process.env.JOB_FETCH_ALLOWED_HOSTS??'').split(',').map(h=>h.trim().toLowerCase()).filter(Boolean);
  if(url.protocol!=='https:'||url.port&&url.port!=='443'||url.username||url.password||!allowed.includes(url.hostname.toLowerCase()))throw new Error('URL import is unavailable for this website. Paste the advertisement text instead.');
  // No redirects, cookies, scripts, login or CAPTCHA bypass. A conservatively interpreted robots policy is mandatory.
  const robots=await pinnedGet(new URL('/robots.txt',url));
  if(robots.status!==200)throw new Error('Website crawl policy could not be verified. Paste the advertisement instead.');
  let applies=false;
  for(const raw of robots.text.split('\n')){
    const line=raw.split('#')[0].trim();
    if(/^user-agent:/i.test(line)){const agent=line.split(':').slice(1).join(':').trim().toLowerCase();applies=agent==='*'||agent.includes('matchcv');}
    if(applies&&/^disallow:/i.test(line)){const path=line.slice(line.indexOf(':')+1).trim();if(path&&(path==='/'||url.pathname.startsWith(path.replace(/[*$].*$/,''))))throw new Error('Website restricts automated retrieval. Paste the advertisement instead.');}
  }
  const page=await pinnedGet(url);
  if(page.status!==200||!/text\/(html|plain)/i.test(page.contentType))throw new Error('Advertisement unavailable. Paste its text instead.');
  const text=page.text.replace(/<(script|style|nav|footer)\b[^>]*>[\s\S]*?<\/\1>/gi,' ').replace(/<[^>]+>/g,'\n').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/\n\s*\n/g,'\n').trim();
  if(text.length<40)throw new Error('No advertisement text found. Paste its text instead.');return text.slice(0,60000);
}
