import content from './content.json';
import { normalize } from '@/data/searchNormalize';
import { toGujarati, toKannada } from '@/utils/transliterate';
export type Pair = readonly [string,string];
export type SanatanTopic = { id:string; name:Pair; title:Pair; question:Pair; group:Pair; pages:readonly Pair[]; pageTitles?:readonly Pair[]; refs:readonly string[]; kind:string; aliases:readonly string[]; status:'published'|'draft' };
export type SanatanSource = {title:string;edition:string;location:string};
function pair(value: string[]): Pair {
 if (value.length !== 2) throw Error('Expected Hindi and English content');
 return [value[0], value[1]];
}
const topics: readonly SanatanTopic[] = content.topics.map(topic => ({
 ...topic, name: pair(topic.name), title: pair(topic.title), question: pair(topic.question),
 group: pair(topic.group), pages: topic.pages.map(pair),
 pageTitles: 'pageTitles' in topic && Array.isArray(topic.pageTitles) ? topic.pageTitles.map(pair) : undefined,
 status: topic.status === 'published' ? 'published' : 'draft',
}));
export const sanatanSources:Readonly<Record<string,SanatanSource>>=content.sources;
export const SANATAN_PAGE_TITLES:readonly Pair[]=[['पहचान','Introduction'],['चित्र से समझें','Explore visually'],['संदर्भ और भिन्नता','Context & variations']];
export const getSanatanPageTitles=(topic:SanatanTopic)=>topic.pageTitles??SANATAN_PAGE_TITLES;
export const getSanatanTopics=()=>topics.filter(t=>t.status==='published');
export const getSanatanTopic=(id:string)=>getSanatanTopics().find(t=>t.id===id);
// Match the same regional-script labels that the app renders, as well as Hindi,
// English and aliases. Pre-normalize once when this lazy registry is loaded.
const searchDocuments = topics.filter(t => t.status === 'published').map(t => {
 const fields = [...t.name, ...t.title, ...t.question, ...t.aliases, t.id];
 const regional = fields.filter(field => /[\u0900-\u097F]/.test(field)).flatMap(field => [toGujarati(field), toKannada(field)]);
 return {t, fields: [...new Set([...fields, ...regional].map(normalize))]};
});
/** Exact registry targets; no remote answer generation or draft visibility. */
export function searchSanatanTopics(query:string):SanatanTopic[]{
 const q=normalize(query.trim());if(!q)return [...getSanatanTopics()];
 const words=q.split(/\s+/).filter(w=>w.length>1&&!['kyu','kyon','kya','hai','hain','why','what','is','are','the','in','of'].includes(w));
 return searchDocuments.map(({t,fields})=>({t,score:fields.reduce((n,k)=>Math.max(n,k===q?100:k.includes(q)?80:words.length&&words.every(w=>k.includes(w))?60:0),0)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).map(x=>x.t);
}
export function validSanatanPage(id:string,page:number){const t=getSanatanTopic(id);return !!t&&Number.isInteger(page)&&page>=0&&page<t.pages.length;}
