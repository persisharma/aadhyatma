/**
 * Vidhi content contract (PRD-19, RULEBOOK §18 / §11).
 *
 * Pins for every published vidhi:
 * - non-empty samagri + steps, both-language fields everywhere;
 * - every mantra is complete (devanagari + iast + per-mantra sourceUrl) and
 *   its Devanagari passes the canonical well-formedness validator (§11.14 —
 *   vidhi data is a .ts module, so the JSON sweep in
 *   devanagariWellFormed.test.ts cannot see it; this test closes that gap
 *   with the SAME validator, never a reimplementation);
 * - every ref resolves: kathaId into KATHA_CONTENT_BY_ID, section id into an
 *   active texts.ts library entry (§11.11 — reference, never re-type);
 * - the source block is complete with URLs (§11.2);
 * - the festival hook round-trips: every rule.vidhiId resolves to a vidhi and
 *   every vidhi.festivalIds names a real observance rule;
 * - deities are valid Deity tags;
 * - IAST fields carry no Devanagari and no ITRANS residue (§11.12).
 *
 * Run: npx tsx --test src/data/__tests__/vidhiContent.test.ts
 */
import assert from 'node:assert/strict';

import { VIDHI_BY_ID, VIDHI_ENTRIES, getVidhiForFestival } from '../vidhi';
import { findDevanagariDefects, describeDevanagariDefect } from '../devanagariWellFormed';
import { KATHA_CONTENT_BY_ID } from '../../panchang/kathaContent';
import { OBSERVANCE_RULES } from '../../panchang/festivals';
import { library } from '../texts';
import { deities } from '../deities';

const DEVANAGARI = /[ऀ-ॿ]/;
// ITRANS/encoder residue tells (§11.12): tilde nasals, RRi, mid-word capitals.
const ITRANS_RESIDUE = /~[nNm]|RRi?|\.[Nnh]\b|[a-zāīūṛṅñṭḍṇśṣḥṁ][A-Z]|chCh/;

const nonEmpty = (value: unknown, at: string) => {
  assert.equal(typeof value, 'string', `${at}: expected string`);
  assert.ok((value as string).trim().length > 0, `${at}: empty`);
};

const deityIds = new Set(deities.map((d) => d.id as string));
const ruleIds = new Set(OBSERVANCE_RULES.map((rule) => rule.id));
const activeLibraryIds = new Set(
  library.filter((entry) => entry.status === 'active').map((entry) => entry.id)
);

assert.ok(VIDHI_ENTRIES.length >= 1, 'at least one published vidhi');

for (const vidhi of VIDHI_ENTRIES) {
  const at = `vidhi '${vidhi.id}'`;

  nonEmpty(vidhi.titleHi, `${at}.titleHi`);
  nonEmpty(vidhi.titleEn, `${at}.titleEn`);
  nonEmpty(vidhi.conventionLineHi, `${at}.conventionLineHi`);
  nonEmpty(vidhi.conventionLineEn, `${at}.conventionLineEn`);
  assert.ok(vidhi.durationHintMin > 0, `${at}.durationHintMin`);

  // Deity tags come from the shared Deity union (§11.4).
  assert.ok(vidhi.deities.length >= 1, `${at}: at least one deity`);
  for (const deity of vidhi.deities) {
    assert.ok(deityIds.has(deity), `${at}: unknown deity '${deity}'`);
  }

  // Festival hook round-trip, vidhi → rule.
  assert.ok(vidhi.festivalIds.length >= 1, `${at}: at least one festivalId`);
  for (const festivalId of vidhi.festivalIds) {
    assert.ok(ruleIds.has(festivalId), `${at}: unknown festival rule '${festivalId}'`);
    const resolved = getVidhiForFestival(festivalId);
    assert.equal(resolved?.id, vidhi.id, `${at}: getVidhiForFestival('${festivalId}')`);
  }

  // Samagri.
  assert.ok(vidhi.samagri.length > 0, `${at}: empty samagri`);
  for (const item of vidhi.samagri) {
    nonEmpty(item.itemHi, `${at} samagri.itemHi`);
    nonEmpty(item.itemEn, `${at} samagri.itemEn`);
  }

  // Steps.
  assert.ok(vidhi.steps.length > 0, `${at}: empty steps`);
  for (const step of vidhi.steps) {
    const sat = `${at} step '${step.id}'`;
    assert.ok(['prep', 'main', 'closing'].includes(step.phase), `${sat}.phase`);
    nonEmpty(step.titleHi, `${sat}.titleHi`);
    nonEmpty(step.titleEn, `${sat}.titleEn`);
    nonEmpty(step.instructionHi, `${sat}.instructionHi`);
    nonEmpty(step.instructionEn, `${sat}.instructionEn`);

    if (step.mantra) {
      nonEmpty(step.mantra.devanagari, `${sat}.mantra.devanagari`);
      nonEmpty(step.mantra.iast, `${sat}.mantra.iast`);
      nonEmpty(step.mantra.sourceUrl, `${sat}.mantra.sourceUrl`);
      assert.ok(
        step.mantra.sourceUrl.startsWith('https://'),
        `${sat}.mantra.sourceUrl must be a URL`
      );
      assert.ok(
        DEVANAGARI.test(step.mantra.devanagari),
        `${sat}.mantra.devanagari carries no Devanagari`
      );
      assert.ok(
        !DEVANAGARI.test(step.mantra.iast),
        `${sat}.mantra.iast leaks Devanagari (§11.12)`
      );
      assert.ok(
        !ITRANS_RESIDUE.test(step.mantra.iast),
        `${sat}.mantra.iast carries ITRANS residue (§11.12)`
      );
      // IAST drops dandas entirely (§11.12).
      assert.ok(!/[।॥|]/.test(step.mantra.iast), `${sat}.mantra.iast carries dandas/pipes`);
    }

    if (step.ref) {
      if (step.ref.kind === 'katha') {
        assert.ok(
          KATHA_CONTENT_BY_ID.has(step.ref.id),
          `${sat}: katha ref '${step.ref.id}' not in KATHA_CONTENT_BY_ID`
        );
      } else {
        assert.ok(
          activeLibraryIds.has(step.ref.id),
          `${sat}: section ref '${step.ref.id}' is not an active library entry`
        );
      }
    }
  }

  // Source block (§11.2) — review-only, but it must be complete.
  nonEmpty(vidhi.source.canonicalEdition, `${at}.source.canonicalEdition`);
  nonEmpty(vidhi.source.canonicalEditionStatus, `${at}.source.canonicalEditionStatus`);
  nonEmpty(vidhi.source.retrievedOn, `${at}.source.retrievedOn`);
  assert.ok(vidhi.source.canonicalEditionUrls.length >= 1, `${at}.source.canonicalEditionUrls`);
  assert.ok(
    vidhi.source.referenceUrls.length >= 2,
    `${at}.source.referenceUrls needs ≥2 independent references (§11.1)`
  );
  for (const url of [...vidhi.source.canonicalEditionUrls, ...vidhi.source.referenceUrls]) {
    assert.ok(url.startsWith('https://'), `${at}.source url '${url}'`);
  }

  // Devanagari well-formedness over EVERY string in the entry (§11.14) —
  // the canonical validator, so a malformed cluster fails here exactly as it
  // would in the JSON sweep.
  const walk = (node: unknown, path: string) => {
    if (typeof node === 'string') {
      const defects = findDevanagariDefects(node);
      assert.deepEqual(
        defects.map(describeDevanagariDefect),
        [],
        `${at} ${path}: malformed Devanagari`
      );
    } else if (Array.isArray(node)) {
      node.forEach((child, i) => walk(child, `${path}[${i}]`));
    } else if (node && typeof node === 'object') {
      for (const [key, child] of Object.entries(node)) walk(child, `${path}.${key}`);
    }
  };
  walk(vidhi, '');
}

// Festival hook round-trip, rule → vidhi: a rule naming a vidhiId that does
// not resolve would render a dead pill.
for (const rule of OBSERVANCE_RULES) {
  if (rule.vidhiId) {
    assert.ok(
      VIDHI_BY_ID.has(rule.vidhiId),
      `rule '${rule.id}' names unknown vidhiId '${rule.vidhiId}'`
    );
  }
}

// Phase 1 pins: the Satyanarayan vidhi is hooked to both purnima rules that
// share its katha (festivals.ts line ~115 relatedRuleIds).
const satyanarayan = VIDHI_BY_ID.get('satyanarayan-puja');
assert.ok(satyanarayan, 'satyanarayan-puja published');
assert.equal(getVidhiForFestival('shree-satyanarayan-vrat')?.id, 'satyanarayan-puja');
assert.equal(getVidhiForFestival('purnima-vrat')?.id, 'satyanarayan-puja');
assert.ok(
  satyanarayan.steps.some((step) => step.ref?.kind === 'katha' && step.ref.id === 'satyanarayana-vrat-katha'),
  'katha step refs the shipped satyanarayana-vrat-katha'
);
assert.ok(
  satyanarayan.steps.some((step) => step.ref?.kind === 'section' && step.ref.id === 'om-jai-jagdish'),
  'aarti step refs the shipped om-jai-jagdish (Vishnu aarti)'
);
// The sankalp step is deliberately instruction-only (§11.3 — its exact wording
// was not verbatim-verifiable; never approximate liturgical text).
const sankalp = satyanarayan.steps.find((step) => step.id === 'sankalp');
assert.ok(sankalp && !sankalp.mantra, 'sankalp stays instruction-only until verbatim-verified');

console.log(
  `vidhi content: ${VIDHI_ENTRIES.length} vidhi(s), ` +
    `${VIDHI_ENTRIES.reduce((n, v) => n + v.steps.length, 0)} steps, ` +
    `${VIDHI_ENTRIES.reduce((n, v) => n + v.steps.filter((s) => s.mantra).length, 0)} transcribed mantras — all gates green.`
);
