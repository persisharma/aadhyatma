// Full linkage audit for vrat katha content. Walks every link in the chain:
//   observance rule -> kathaId -> KATHA_CATALOG entry -> KATHA_CONTENT story
// and reports coverage + any break. Run from mobile/:
//   npx tsx scripts/vrat-linkage-audit.mts

import { getObservanceCatalog, KATHA_CATALOG, OBSERVANCE_RULES } from '../src/panchang/festivals';
import { getKathaContent, KATHA_CONTENT } from '../src/panchang/kathaContent';

const ruleIds = new Set(OBSERVANCE_RULES.map((r: any) => r.id));
const contentIds = new Set(KATHA_CONTENT.map((c: any) => c.id));
const catalogById = new Map(KATHA_CATALOG.map((k: any) => [k.id, k]));
const problems: string[] = [];

// 1. every rule.kathaId resolves to content + catalog
let rulesWithKatha = 0;
for (const r of OBSERVANCE_RULES as any[]) {
  if (!r.kathaId) continue;
  rulesWithKatha++;
  if (!getKathaContent(r.kathaId)) problems.push(`rule '${r.id}' -> kathaId '${r.kathaId}' has NO content`);
  if (!catalogById.has(r.kathaId)) problems.push(`rule '${r.id}' -> kathaId '${r.kathaId}' has NO catalog entry`);
}

// 2. every catalog entry resolves to content; relatedRuleIds all exist
for (const k of KATHA_CATALOG as any[]) {
  if (!getKathaContent(k.id)) problems.push(`catalog '${k.id}' has NO content`);
  for (const rid of k.relatedRuleIds ?? []) {
    if (!ruleIds.has(rid)) problems.push(`catalog '${k.id}' relatedRuleId '${rid}' is not a real rule`);
  }
}

// 3. every content entry has a catalog entry + is reachable from >=1 rule
const reachable = new Set<string>();
for (const r of OBSERVANCE_RULES as any[]) if (r.kathaId) reachable.add(r.kathaId);
for (const k of KATHA_CATALOG as any[]) for (const rid of k.relatedRuleIds ?? []) reachable.add(k.id);
for (const c of KATHA_CONTENT as any[]) {
  if (!catalogById.has(c.id)) problems.push(`content '${c.id}' has NO catalog entry`);
  if (!reachable.has(c.id)) problems.push(`content '${c.id}' is NOT reachable from any rule`);
}

// 4. coverage across un-hidden (default-visible) observances
const visible = getObservanceCatalog().filter((o: any) => o.visibility === 'default');
const storyable = visible.filter((o: any) => o.ruleType !== 'solar-sankranti'); // sankranti are solar markers, no story
const withKatha = storyable.filter((o: any) => o.kathaId && getKathaContent(o.kathaId));
const missing = storyable.filter((o: any) => !o.kathaId || !getKathaContent(o.kathaId));

console.log('── Vrat katha linkage audit ──');
console.log(`rules with kathaId:            ${rulesWithKatha}`);
console.log(`KATHA_CATALOG entries:         ${KATHA_CATALOG.length}`);
console.log(`KATHA_CONTENT stories:         ${KATHA_CONTENT.length}`);
console.log(`un-hidden observances:         ${visible.length}`);
console.log(`  storyable (non-Sankranti):   ${storyable.length}`);
console.log(`  with a resolvable katha:     ${withKatha.length}`);
console.log(`  WITHOUT a katha:             ${missing.length}`);
if (missing.length) {
  console.log('  (no-katha observances): ' + missing.map((o: any) => o.id).join(', '));
}
console.log(`\ndata-linkage problems: ${problems.length}`);
for (const p of problems) console.log('  ✗ ' + p);
console.log(problems.length ? '\nRESULT: ✗ linkage has breaks' : '\nRESULT: ✓ data linkage intact (rule → catalog → content, 1:1, no dangling)');
process.exit(problems.length ? 1 : 0);
