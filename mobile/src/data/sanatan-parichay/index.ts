import content from './content.json';
import {experiences} from './experience';
import {knowledgeText} from './knowledge';
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
// Build a small concept index once, behind the existing lazy section boundary.
// Prose is deliberately not duplicated/transliterated into an unbounded full-text corpus.
type SearchMatch={topic:SanatanTopic;page:number};
const searchDocuments=topics.filter(t=>t.status==='published').map(topic=>{
 const fields=[...topic.name,...topic.title,...topic.question,...topic.aliases,topic.id];
 const expand=(values:readonly string[])=>[...new Set(values.flatMap(v=>/[\u0900-\u097F]/.test(v)?[v,toGujarati(v),toKannada(v)]:[v]).map(normalize))];
 return {topic,fields:expand(fields),pages:topic.pages.map((_,page)=>expand([
  ...(topic.pageTitles?.[page]??[]),
  ...(page===0?(experiences[topic.id]?.terms??[]).flatMap(t=>[...t.name]):[]),
 ]))};
});
export function searchSanatanMatches(query:string):SearchMatch[]{
 const q=normalize(query.trim());if(!q)return getSanatanTopics().map(topic=>({topic,page:0}));
 const words=q.split(/\s+/).filter(w=>w.length>1&&!['kyu','kyon','kya','hai','hain','why','what','is','are','the','in','of'].includes(w));
 const score=(fields:readonly string[])=>fields.reduce((n,k)=>Math.max(n,k===q?100:k.includes(q)?80:words.length&&words.every(w=>k.includes(w))?60:0),0);
 return searchDocuments.map(({topic,fields,pages})=>{
  let best=score(fields),page=0;
  pages.forEach((p,i)=>{const value=score(p);if(value>best){best=value;page=i;}});
  return {topic,page,score:best};
 }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).map(({topic,page})=>({topic,page}));
}
export function searchSanatanTopics(query:string):SanatanTopic[]{return searchSanatanMatches(query).map(x=>x.topic);}
const narrated=new Map<string,readonly Pair[]>();
/** Same definitions and complete rosters as the visible educational components. */
export function getSanatanReadingPages(topic:SanatanTopic):readonly Pair[]{
 const cached=narrated.get(topic.id);if(cached)return cached;
 const experience=experiences[topic.id];
 const pages=topic.pages.map((p,i):Pair=>{
  const supplement=knowledgeText(topic.id,i);
  const terms=i===0&&experience?experience.terms.map(t=>[t.name[0]+': '+t.meaning[0],t.name[1]+': '+t.meaning[1]] as Pair):[];
  const extra=[...(i===0&&experience?[experience.answer]:[]),p,...terms,...(supplement?[supplement]:[]),...(i===topic.pages.length-1&&experience?[experience.takeaway]:[])];
  return [extra.map(x=>x[0]).join('\n\n'),extra.map(x=>x[1]).join('\n\n')];
 });narrated.set(topic.id,pages);return pages;
}
export function validSanatanPage(id:string,page:number){const t=getSanatanTopic(id);return !!t&&Number.isInteger(page)&&page>=0&&page<t.pages.length;}
