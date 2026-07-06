/**
 * One-off: enumerate the un-hidden (visibility:'default') observances and their
 * katha coverage, to drive the content-authoring loop. Writes JSON to
 * .context/vrat-content/worklist.json. No PII; pure catalog metadata.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { getObservanceCatalog, OBSERVANCE_RULES } from '../src/panchang/festivals';
import { KATHA_CONTENT } from '../src/panchang/kathaContent';

const byId = new Map(KATHA_CONTENT.map((k) => [k.id, k]));

function kind(kathaId: string | undefined): string {
  if (!kathaId) return 'NONE';
  const k = byId.get(kathaId);
  if (!k) return 'MISSING_ENTRY';
  const ids = k.sections.map((s) => s.id).sort();
  const isSummary = ids.length === 2 && ids[0] === 'katha' && ids[1] === 'mahatva';
  if (isSummary) return 'SUMMARY';
  // generic ekadashi: shared by many rules
  return 'FULL';
}

const unhidden = getObservanceCatalog(); // visibility === 'default'
const sankranti = unhidden.filter((r) => r.ruleType === 'solar-sankranti');
const storyable = unhidden.filter((r) => r.ruleType !== 'solar-sankranti');

// how many un-hidden rules share each kathaId
const shareCount = new Map<string, number>();
for (const r of storyable) {
  if (r.kathaId) shareCount.set(r.kathaId, (shareCount.get(r.kathaId) ?? 0) + 1);
}

const rows = storyable.map((r) => ({
  id: r.id,
  nameEn: r.nameEn,
  nameHi: r.nameHi,
  category: r.category,
  deityEn: r.deityEn,
  kathaId: r.kathaId ?? null,
  kathaKind: kind(r.kathaId),
  sharesKatha: r.kathaId ? (shareCount.get(r.kathaId) ?? 1) : 0,
}));

const summary = {
  totalUnhidden: unhidden.length,
  sankrantiSkipped: sankranti.length,
  storyableRules: storyable.length,
  rulesWithFull: rows.filter((r) => r.kathaKind === 'FULL').length,
  rulesWithSummary: rows.filter((r) => r.kathaKind === 'SUMMARY').length,
  rulesWithNoKatha: rows.filter((r) => r.kathaKind === 'NONE').length,
  rulesWithMissingEntry: rows.filter((r) => r.kathaKind === 'MISSING_ENTRY').length,
  genericSharedKathas: [...shareCount.entries()].filter(([, n]) => n > 2).map(([id, n]) => ({ id, sharedBy: n })),
  totalKathaEntries: KATHA_CONTENT.length,
  summaryKathaEntries: KATHA_CONTENT.filter((k) => kind(k.id) === 'SUMMARY').map((k) => k.id),
};

const out = { summary, rows };
const dir = path.resolve(process.cwd(), '../.context/vrat-content');
mkdirSync(dir, { recursive: true });
writeFileSync(path.join(dir, 'worklist.json'), JSON.stringify(out, null, 2));
console.log(JSON.stringify(summary, null, 2));
