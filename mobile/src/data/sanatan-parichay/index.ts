import content from './content.json';
import { normalize } from '@/data/searchNormalize';
export type Pair = readonly [string,string];
export type SanatanTopic = { id:string; name:Pair; title:Pair; question:Pair; group:Pair; pages:readonly Pair[]; refs:readonly string[]; kind:string; aliases:readonly string[]; status:'published'|'draft' };
export type SanatanSource = {title:string;edition:string;location:string};
const topics:readonly SanatanTopic[]=content.topics as SanatanTopic[];
export const sanatanSources:Readonly<Record<string,SanatanSource>>=content.sources;
export const SANATAN_PAGE_TITLES:readonly Pair[]=[['पहचान','Introduction'],['चित्र से समझें','Explore visually'],['संदर्भ और भिन्नता','Context & variations']];
export const getSanatanTopics=()=>topics.filter(t=>t.status==='published');
export const getSanatanTopic=(id:string)=>getSanatanTopics().find(t=>t.id===id);
/** Exact registry targets; no remote answer generation or draft visibility. */
export function searchSanatanTopics(query:string):SanatanTopic[]{
 const q=normalize(query.trim());if(!q)return [...getSanatanTopics()];
 const words=q.split(/\s+/).filter(w=>w.length>1&&!['kyu','kyon','kya','hai','hain','why','what','is','are','the','in','of'].includes(w));
 return getSanatanTopics().map(t=>({t,score:[...t.name,...t.title,...t.question,...t.aliases,t.id].reduce((n,s)=>{const k=normalize(s);return Math.max(n,k===q?100:k.includes(q)?80:words.length&&words.every(w=>k.includes(w))?60:0);},0)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).map(x=>x.t);
}
export function validSanatanPage(id:string,page:number){const t=getSanatanTopic(id);return !!t&&Number.isInteger(page)&&page>=0&&page<t.pages.length;}
