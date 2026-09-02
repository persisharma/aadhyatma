// Data-driven audit of vrat-katha content.
// For every UN-HIDDEN (visibility:'default') storyable observance, resolve its
// katha and report: section count, Hi/En char totals, and whether the prose
// still reads as COMMENTARY (meta-framing) rather than in-story narrative.
//
// Output: .context/vrat-content/audit.json  + a console summary.
// Run from mobile/:  npx tsx scripts/vrat-audit.mts

import { writeFileSync } from 'node:fs';
import { getObservanceCatalog } from '../src/panchang/festivals';
import { getKathaContent } from '../src/panchang/kathaContent';

// Commentary / meta-framing markers — phrasing that talks ABOUT the story
// instead of telling it. Faithful in-story prose should not contain these.
const EN_MARKERS: RegExp[] = [
  /\bthe (first|second|third|fourth|fifth|sixth|seventh|eighth|next|final|last) (chapter|adhyay|section)\b/i,
  /\bchapter \d+\b/i,
  /\bthis (chapter|section|story|katha) (tells|introduces|describes|narrates|recounts|explains)\b/i,
  /\bthe (chapter|story|katha|legend) (tells|introduces|describes|narrates|recounts|explains)\b/i,
  /\btells of\b/i,
  /\bthe story (does not|teaches|shows|reminds|reduces)\b/i,
  /\bin this (chapter|section|episode)\b/i,
];
const HI_MARKERS: RegExp[] = [
  /अध्याय में/,
  /वर्णन आता है/,
  /प्रसंग आता है/,
  /कथा यह (नहीं )?कहती/,
  /इस (अध्याय|कथा|प्रसंग) में/,
  /का वर्णन है/,
  /यह कथा (बताती|सिखाती|कहती) है/,
];

function scanMarkers(paras: string[], markers: RegExp[]): string[] {
  const hits: string[] = [];
  for (const p of paras) for (const m of markers) {
    const mm = p.match(m);
    if (mm) hits.push(mm[0]);
  }
  return hits;
}

const catalog = getObservanceCatalog();
const seen = new Set<string>();
const rows: any[] = [];

for (const obs of catalog) {
  const kathaId: string | undefined = (obs as any).kathaId;
  if (!kathaId || seen.has(kathaId)) continue;
  seen.add(kathaId);
  const entry = getKathaContent(kathaId);
  if (!entry) {
    rows.push({ kathaId, ruleId: obs.id, status: 'NO_CONTENT' });
    continue;
  }
  let hi = 0, en = 0, hiP = 0, enP = 0;
  const enHits: string[] = [], hiHits: string[] = [];
  for (const s of entry.sections) {
    hi += s.bodyHi.join('').length; en += s.bodyEn.join('').length;
    hiP += s.bodyHi.length; enP += s.bodyEn.length;
    enHits.push(...scanMarkers(s.bodyEn, EN_MARKERS));
    hiHits.push(...scanMarkers(s.bodyHi, HI_MARKERS));
  }
  rows.push({
    kathaId, ruleId: obs.id, sections: entry.sections.length,
    hiChars: hi, enChars: en, hiParas: hiP, enParas: enP,
    commentary: enHits.length + hiHits.length > 0,
    enHits: [...new Set(enHits)], hiHits: [...new Set(hiHits)],
  });
}

const commentary = rows.filter((r) => r.commentary);
const thin = rows.filter((r) => r.status !== 'NO_CONTENT' && (r.sections < 4 || r.hiChars < 900 || r.enChars < 1100));
const missing = rows.filter((r) => r.status === 'NO_CONTENT');

writeFileSync('../.context/vrat-content/audit.json', JSON.stringify({ rows, commentary, thin, missing }, null, 2));
console.log(`un-hidden katha entries audited: ${rows.length}`);
console.log(`  with commentary markers: ${commentary.length}`);
console.log(`  thin (<4 sec / <900 Hi / <1100 En): ${thin.length}`);
console.log(`  no content resolved: ${missing.length}`);
console.log('--- commentary entries ---');
for (const r of commentary) console.log(' ', r.kathaId, '|', [...r.enHits, ...r.hiHits].slice(0, 3).join(' ; '));
