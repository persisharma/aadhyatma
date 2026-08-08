import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { library } from '../../data/texts';
import {
  computeHastRekha,
  FATE_LINE_TRAITS,
  HEAD_LINE_TRAITS,
  HEART_LINE_TRAITS,
  LIFE_LINE_TRAITS,
  PALM_LINES,
  validatePalmProfile,
  type PalmProfile,
} from '../hastRekha';
import { parseStoredPalmProfile } from '../useHastRekha';

function allProfiles(): PalmProfile[] {
  const profiles: PalmProfile[] = [];
  for (const heart of HEART_LINE_TRAITS) {
    for (const head of HEAD_LINE_TRAITS) {
      for (const life of LIFE_LINE_TRAITS) {
        for (const fate of FATE_LINE_TRAITS) {
          profiles.push({ heart, head, life, fate });
        }
      }
    }
  }
  return profiles;
}

test('line catalog exposes four classical lines with three observable options each', () => {
  assert.deepEqual(
    PALM_LINES.map((spec) => spec.line),
    ['heart', 'head', 'life', 'fate']
  );
  for (const spec of PALM_LINES) {
    assert.equal(spec.options.length, 3, `${spec.line} has 3 options`);
    assert.ok(spec.nameHi.length > 0 && spec.nameEn.length > 0);
    assert.ok(spec.locateHi.length > 0 && spec.locateEn.length > 0);
    for (const option of spec.options) {
      assert.ok(option.labelHi.length > 0 && option.labelEn.length > 0);
      assert.ok(option.descHi.length > 0 && option.descEn.length > 0);
    }
  }
});

test('every one of the 81 palm profiles yields a complete bilingual reading', () => {
  for (const profile of allProfiles()) {
    const reading = computeHastRekha(profile);
    assert.equal(reading.insights.length, 4);
    assert.deepEqual(
      reading.insights.map((insight) => insight.line),
      ['heart', 'head', 'life', 'fate']
    );
    for (const insight of reading.insights) {
      for (const field of [
        insight.eyebrowHi,
        insight.eyebrowEn,
        insight.titleHi,
        insight.titleEn,
        insight.bodyHi,
        insight.bodyEn,
      ]) {
        assert.ok(field.trim().length > 0, `non-empty copy for ${insight.line}`);
      }
    }
    assert.ok(reading.reflectionHi.trim().length > 0);
    assert.ok(reading.reflectionEn.trim().length > 0);
    assert.ok(reading.practiceHi.trim().length > 0);
    assert.ok(reading.practiceEn.trim().length > 0);
  }
});

test('readings are deterministic — same profile, same output', () => {
  const profile: PalmProfile = {
    heart: 'curved',
    head: 'sloping',
    life: 'faint',
    fate: 'absent',
  };
  assert.deepEqual(computeHastRekha(profile), computeHastRekha(profile));
});

test('insight titles echo the selected option labels', () => {
  const profile: PalmProfile = {
    heart: 'straight',
    head: 'long',
    life: 'broad',
    fate: 'defined',
  };
  const reading = computeHastRekha(profile);
  const specByLine = new Map(PALM_LINES.map((spec) => [spec.line, spec]));
  for (const insight of reading.insights) {
    const option = specByLine
      .get(insight.line)!
      .options.find((candidate) => candidate.id === profile[insight.line]);
    assert.ok(option, `option exists for ${insight.line}`);
    assert.equal(insight.titleHi, option.labelHi);
    assert.equal(insight.titleEn, option.labelEn);
  }
});

test('life-line copy always frames vitality, never lifespan', () => {
  for (const profile of allProfiles()) {
    const life = computeHastRekha(profile).insights.find(
      (insight) => insight.line === 'life'
    )!;
    assert.match(life.bodyEn, /never length of life/);
    assert.match(life.bodyHi, /जीवन की लम्बाई नहीं/);
    assert.doesNotMatch(life.bodyEn, /lifespan|how long you/i);
    assert.doesNotMatch(life.bodyHi, /आयु/);
  }
});

test('every insight stays guidance-framed — no predictive verdicts', () => {
  for (const profile of allProfiles()) {
    const reading = computeHastRekha(profile);
    for (const insight of reading.insights) {
      assert.match(
        insight.bodyEn,
        /Tradition (links|reads)/,
        `${insight.line} attributes the association to tradition`
      );
      assert.match(
        insight.bodyEn,
        /Consider/,
        `${insight.line} invites reflection instead of declaring outcomes`
      );
      assert.doesNotMatch(
        insight.bodyEn,
        /\bwill\b|\byou are destined\b|guarantee/i,
        `${insight.line} makes no promise about the future`
      );
    }
    assert.match(reading.reflectionEn, /\?$/);
  }
});

test('suggested practice is an allow-listed active library entry', () => {
  for (const profile of allProfiles()) {
    const reading = computeHastRekha(profile);
    assert.equal(reading.sourceId, 'navagraha-stotram');
    const entry = library.find((candidate) => candidate.id === reading.sourceId);
    assert.ok(entry, 'practice id exists in the library registry');
  }
});

test('invalid profiles are rejected by validate and compute alike', () => {
  const broken = { heart: 'wavy', head: 'long', life: 'broad', fate: 'defined' };
  assert.deepEqual(validatePalmProfile(broken as PalmProfile), ['heart']);
  assert.throws(() => computeHastRekha(broken as PalmProfile), /heart/);
});

test('stored-profile parsing accepts only valid shapes', () => {
  const valid: PalmProfile = {
    heart: 'chained',
    head: 'short',
    life: 'close',
    fate: 'faint',
  };
  assert.deepEqual(parseStoredPalmProfile(JSON.stringify(valid)), valid);
  assert.equal(parseStoredPalmProfile(null), null);
  assert.equal(parseStoredPalmProfile('not json'), null);
  assert.equal(parseStoredPalmProfile(JSON.stringify({ heart: 'curved' })), null);
  assert.equal(
    parseStoredPalmProfile(
      JSON.stringify({ ...valid, fate: 'guaranteed' })
    ),
    null
  );
});

test('engine source stays pure — no clock, randomness, network, or React', () => {
  const sourcePath = resolve(
    dirname(fileURLToPath(import.meta.url)),
    '../hastRekha.ts'
  );
  const source = readFileSync(sourcePath, 'utf8');
  assert.doesNotMatch(source, /Date\.now\s*\(/);
  assert.doesNotMatch(source, /Math\.random\s*\(/);
  assert.doesNotMatch(source, /\bfetch\s*\(/);
  assert.doesNotMatch(source, /AsyncStorage|react-native|from ['"]react['"]/);
});
