import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);
const read = path => JSON.parse(readFileSync(new URL(path, root), 'utf8'));
const folder = 'docs/content/suvichar-scripture-integration/';
const approved = read(folder + 'reviewed-copy.json');
const register = read(folder + 'source-register.json').sources;
const english = new Map(readFileSync(new URL(folder + 'source-meanings-en.tsv', root), 'utf8').trim().split('\n').map(line => line.split('\t')));
const family = { ram: 'rama', ganesh: 'ganesha' };
const modes = { 'भावार्थ':'Meaning', 'प्रार्थना-भाव':'Prayer meaning', 'स्तुति-भाव':'Hymn meaning', 'प्रसंग-भाव':'Story lesson' };
const works = {'गीता':'Gita','मानस':'Manas','हनुमान चालीसा':'Hanuman Chalisa','श्वेताश्वतर':'Shvetashvatara','गणपत्यथर्वशीर्ष':'Ganapati Atharvashirsha','देवीमाहात्म्य':'Devi Mahatmya','भागवत':'Bhagavata','श्रीसूक्त':'Shri Sukta','श्रीस्तोत्र':'Shri Stotra','देवीभागवत':'Devi Bhagavata','सरस्वतीरहस्य':'Sarasvati Rahasya','अन्नपूर्णास्तोत्र':'Annapurna Stotra','अन्नपूर्णोप.':'Annapurna Up.'};
const entries = [...approved.entries, ...approved.app_thought_edits].map(row => {
  const en = row.revised_en || english.get(row.source_id);
  if (!en) throw Error('Missing English sense: '+row.id);
  return {id:row.id,family:family[row.deity]||row.deity,categoryHi:row.category,hi:row.revised_hi,en,sourceId:row.source_id};
});
const sources = register.map(row => {
  let ref = row.card_reference;
  const work = Object.keys(works).sort((a,b)=>b.length-a.length).find(work => ref.startsWith(work));
  if (!work) throw Error('Missing reference name: '+row.id);
  ref = works[work]+ref.slice(work.length);
  for (const [hi,en] of [['लं.','Lanka '],['अ.','Aranya '],['उ.','Uttara '],['दो.','opening doha '],['समापन','closing doha'],['स्तु.','hymn '],['ऋक्.','rik ']]) ref=ref.replaceAll(hi,en);
  return {id:row.id,referenceHi:row.card_reference,referenceEn:ref,modeHi:row.mode_hi,modeEn:modes[row.mode_hi],url:row.url,contextHi:row.connection_hi};
});
if (entries.length!==621||new Set(entries.map(e=>e.id)).size!==621||sources.length!==364) throw Error('Catalogue coverage changed');
const output = {source:{baseText:'621 approved editorial meanings and narrative lessons, derived from the 364 referenced passages. Not verbatim scripture or a complete scripture collection.',retrievedOn:'2026-10-28',referenceUrls:[...new Set(sources.map(s=>s.url))],notes:'600 catalogue entries and 21 app proposals. Source verification evidence and edition caveats are retained in docs/content/suvichar-scripture-integration/source-register.json. English senses are source-level editorial adaptations; Hindi variants may share an English sense.'},entries,sources};
const path = new URL('mobile/src/data/suvichar-content/catalogue.json', root);
writeFileSync(path, JSON.stringify(output,null,2)+'\n');
console.log(`Wrote ${entries.length} messages and ${sources.length} source locations to ${fileURLToPath(path)}`);
