import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { getVersePool, type UniformVerse } from '@/data/versePool';
import { transliterateDevanagari } from '@/utils/transliterate';
import { flowedVerse, twoLineExcerpt } from '../planner';
import { widgetVerseSubject } from '../heritage';

const swift = fs.readFileSync(
  path.join(__dirname, '..', '..', '..', 'plugins', 'home-widgets', 'ios', 'VedanshWidgets.swift'),
  'utf8',
);
const verseView = swift.slice(swift.indexOf('MARK: - आज का श्लोक'), swift.indexOf('MARK: - आज का पंचांग'));
const pool = getVersePool();

// These are live Daily Bhakti sources, not manually reconstructed shlokas. Pick
// the longest verse from each source to exercise realistic multi-pada content.
const sources = [
  'bhagavad-gita',
  'vishnu-sahasranama',
  'sundarkand',
  'shiva-strotam',
  'madhurashtakam',
  'purusha-suktam',
  'om-namo-bhagavate-vasudevaya',
] as const;

function selected(sourceId: string): UniformVerse {
  const choices = pool.filter((verse) => verse.sourceId === sourceId);
  assert.ok(choices.length > 0, `Daily Bhakti no longer offers ${sourceId}`);
  return choices.reduce((best, verse) =>
    flowedVerse(verse.textHi).length > flowedVerse(best.textHi).length ? verse : best
  );
}

test('real short/medium/long Daily Bhakti sources preserve every pada in all four languages', () => {
  const seen = sources.map(selected);
  assert.equal(new Set(seen.map((verse) => verse.sourceId)).size, sources.length);
  assert.ok(seen.some((verse) => verse.textHi.length >= 2), 'no multi-line Sanskrit verse');
  const lengths = seen.map((verse) => flowedVerse(verse.textHi).length);
  assert.ok(Math.max(...lengths) > Math.min(...lengths) * 1.5, 'sample lacks meaningful length variation');

  for (const verse of seen) {
    assert.ok(verse.sourceNameHi && verse.sourceNameEn, `source attribution missing for ${verse.sourceId}`);
    assert.ok(widgetVerseSubject(verse.sourceId).length > 0, 'all sources must have an art fallback');
    const lines = {
      hi: verse.textHi, en: verse.textEn,
      gu: verse.textHi.map((line) => transliterateDevanagari(line, 'gu')),
      kn: verse.textHi.map((line) => transliterateDevanagari(line, 'kn')),
    };
    for (const [lang, padas] of Object.entries(lines)) {
      assert.ok(padas.length > 0 && padas.every((s) => s.trim().length > 0),
        `${verse.sourceId} ${lang} has empty text`);
      const full = flowedVerse(padas);
      assert.equal(full.split(' · ').length, padas.length,
        `${verse.sourceId} ${lang} lost a pada`);
      assert.ok(full.startsWith(padas[0].trim()) && full.endsWith(padas[padas.length - 1].trim()),
        `${verse.sourceId} ${lang} lost its first or last pada`);
      const excerpt = twoLineExcerpt(padas);
      assert.ok(excerpt.length <= 88, `${verse.sourceId} ${lang} small excerpt exceeded the cap`);
      assert.doesNotMatch(excerpt, /[्્್‌‍]…$/u,
        `${verse.sourceId} ${lang} split an Indic conjunct`);
    }
  }
});

test('the iOS layout measures complete verses before switching to an explicitly labelled preview', () => {
  assert.match(verseView, /ViewThatFits\(in: \.vertical\)/);
  assert.match(verseView, /artFraction: 0\.32/);
  assert.match(verseView, /artFraction: 0\.16/);
  assert.match(verseView, /artFraction: 0,/);
  assert.match(verseView, /\.fixedSize\(horizontal: false, vertical: !condensed\)/,
    'full-size composition must measure intrinsic text height, not silently truncate');
  assert.match(verseView, /Text\(flowedVerse\(v\.lines\.value\(lang\)\)\)/,
    'medium and long iOS variants must use the full verse lines');
  assert.match(verseView, /ForEach\(Array\(v\.lines\.value\(lang\)\.enumerated\(\)\)/,
    'large variants must support separated padas');
  assert.match(verseView, /Text\(v\.source\.value\(lang\)\)/);
  assert.match(verseView, /readFullVerseKicker\(lang\)/);
  assert.match(verseView, /\.accessibilityLabel\(v\.accessibilityLabel\.value\(lang\)\)/);
  assert.match(verseView, /\.widgetURL\(URL\(string: v\.deepLink\)\)/);
  assert.equal((verseView.match(/v\.excerpt/g) ?? []).length, 1,
    'only the small widget may use the precomputed excerpt');
  for (const locale of ['en', 'gu', 'kn']) {
    assert.match(verseView, new RegExp(`lang == "${locale}"`),
      `missing localized tap-to-read copy: ${locale}`);
  }
});

test('the chosen native layout retains a safe plain-parchment path', () => {
  assert.match(verseView, /art == nil \? CGFloat\(0\)/);
  assert.match(verseView, /palette\.parchment\.opacity\(0\.88\)/);
  assert.match(swift, /guard renderingMode == \.fullColor, case \.ready\(let payload\) = entry\.state/);
});
