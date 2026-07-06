// Build .context/vrat-content/remaining.json — the authoring worklist that the
// build loop's subagents consume. Combines:
//   - audit.json   -> which existing entries still read as commentary (rewrites)
//   - queue.json   -> pending ekadashi + new (missing) kathas
// and enriches each with everything an authoring agent needs (no file reads on
// their side) plus the wiring metadata the assembler needs.
//
// Run from mobile/:  npx tsx scripts/vrat-build-spec.mts

import { readFileSync, writeFileSync } from 'node:fs';
import { getKathaContent } from '../src/panchang/kathaContent';

const ROOT = '../.context/vrat-content';
const audit = JSON.parse(readFileSync(`${ROOT}/audit.json`, 'utf8'));
const queue = JSON.parse(readFileSync(`${ROOT}/queue.json`, 'utf8'));
const items = Array.isArray(queue) ? queue : (queue.tasks ?? queue.items);

// Entries whose exact section-id list + source URLs are asserted by the gate test.
const PINNED = new Set([
  'satyanarayana-vrat-katha',
  'ganesha-chaturthi-vrat-katha',
  'sankashti-chaturthi-vrat-katha',
  'pradosha-vrat-katha',
]);

const tasks: any[] = [];

// --- rewrites: only the entries the audit flagged as commentary-style ---
for (const row of audit.commentary) {
  const entry = getKathaContent(row.kathaId);
  if (!entry) continue;
  tasks.push({
    kind: 'rewrite',
    pinned: PINNED.has(row.kathaId),
    targetKathaId: row.kathaId,
    // Preserve identity + structure; the agent rewrites only the prose bodies.
    existing: {
      id: entry.id,
      titleHi: entry.titleHi,
      titleEn: entry.titleEn,
      sourceUrls: entry.sourceUrls ?? [],
      sections: entry.sections.map((s) => ({
        id: s.id, titleHi: s.titleHi, titleEn: s.titleEn,
        hiParas: s.bodyHi.length, enParas: s.bodyEn.length,
      })),
    },
    minHiChars: row.hiChars, minEnChars: row.enChars,
  });
}

// --- ekadashi + new from the queue (pending only), de-duped by targetKathaId ---
const seen = new Set(tasks.map((t) => t.targetKathaId));
for (const it of items) {
  if (it.status !== 'pending') continue;
  if (it.type !== 'ekadashi' && it.type !== 'new') continue;
  const targetKathaId = it.targetKathaId;
  if (!targetKathaId || seen.has(targetKathaId)) continue;
  seen.add(targetKathaId);

  if (it.type === 'ekadashi') {
    tasks.push({
      kind: 'ekadashi',
      targetKathaId,
      ruleId: it.ruleId,
      nameHi: it.nameHi, nameEn: it.nameEn, deityEn: it.deityEn ?? 'Shri Vishnu',
      titleHi: `${it.nameHi} व्रत कथा`, titleEn: `${it.nameEn} Katha`,
      sourceUrls: [`https://www.drikpanchang.com/vrat-katha/ekadashi/${it.ruleId}-vrat-katha.html`],
      wire: {
        catalog: {
          nameHi: `${it.nameHi} व्रत कथा`, nameEn: `${it.nameEn} Katha`,
          sourceUrl: `https://www.drikpanchang.com/vrat-katha/ekadashi/${it.ruleId}-vrat-katha.html`,
          relatedRuleIds: [it.ruleId],
        },
        ekadashiName: it.nameEn,
      },
    });
  } else {
    const isFestival = it.category === 'festival';
    tasks.push({
      kind: 'new',
      targetKathaId,
      ruleId: it.ruleId,
      nameHi: it.nameHi, nameEn: it.nameEn, deityEn: it.deityEn ?? '',
      category: it.category,
      titleHi: `${it.nameHi} कथा`, titleEn: `${it.nameEn} Katha`,
      sourceUrls: ['https://www.drikpanchang.com/vrat-katha/vrat-katha.html'],
      wire: {
        catalog: {
          nameHi: `${it.nameHi} कथा`, nameEn: `${it.nameEn} Katha`,
          kind: isFestival ? 'festival-legend' : 'vrat-katha',
          sourceUrl: 'https://www.drikpanchang.com/vrat-katha/vrat-katha.html',
          relatedRuleIds: [it.ruleId],
        },
        setRuleKathaId: it.ruleId,
      },
    });
  }
}

writeFileSync(`${ROOT}/remaining.json`, JSON.stringify(tasks, null, 2));
const by = (k: string) => tasks.filter((t) => t.kind === k).length;
console.log(`remaining.json written: ${tasks.length} tasks`);
console.log(`  rewrite: ${by('rewrite')} (pinned: ${tasks.filter((t) => t.pinned).length})`);
console.log(`  ekadashi: ${by('ekadashi')}`);
console.log(`  new: ${by('new')}`);
