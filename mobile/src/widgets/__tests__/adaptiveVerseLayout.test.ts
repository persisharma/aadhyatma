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
  'ramcharitmanas',
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
      assert.equal(full.split('\n').length, padas.length,
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
  assert.match(verseView, /Text\(flowedVerse\(v\.lines\.value\(lang\)\)\)\s*\.font\([^\n]*\s*\.foregroundStyle\(palette\.ink\)\s*\.fixedSize\(horizontal: false, vertical: true\)/,
    'measured compositions must use intrinsic text height, not silently truncate');
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
  assert.match(verseView, /palette\.parchment\.opacity\(0\.93\)/);
  assert.match(swift, /guard renderingMode == \.fullColor, case \.ready\(let payload\) = entry\.state/);
});

// Nov 2026 device report: the medium Shloka clipped its source and rule. The
// flourish row sat OUTSIDE ViewThatFits, so a candidate was judged against the
// whole cell while ~38 pt above it was already spent.
test('the iOS verse measures the complete column, flourish included, against the real cell', () => {
  const body = verseView.slice(verseView.indexOf('private func verse('), verseView.indexOf('private enum VerseChrome'));
  assert.ok(body.length > 0, 'verse() body not found');
  assert.doesNotMatch(body, /Text\("ॐ वेदांश"\)/,
    'the brand flourish must be part of each measured candidate, not drawn beside ViewThatFits');
  assert.match(body, /ViewThatFits\(in: \.vertical\)/);
  assert.match(body, /\.frame\(width: geometry\.size\.width, height: geometry\.size\.height/,
    'ViewThatFits must be proposed the exact cell, not a stack share');
  const order = [...body.matchAll(/chrome: \.(full|compact|tight)|boundedVerseColumn\(/g)]
    .map((m) => m[1] ?? 'bounded');
  assert.deepEqual(order, ['full', 'full', 'full', 'compact', 'tight', 'tight', 'bounded'],
    'approved chrome first, then compact chrome, then the bounded tap-through fallback last');
  assert.match(verseView, /if chrome == \.full \{ verseFlourish\(\) \}/);
  assert.match(verseView, /if chrome != \.tight \{ verseRule\(\) \}/);
});

test('every verse candidate keeps the source; only the bounded fallback may truncate', () => {
  const composition = verseView.slice(verseView.indexOf('private func verseComposition('), verseView.indexOf('private func boundedVerseColumn('));
  const bounded = verseView.slice(verseView.indexOf('private func boundedVerseColumn('), verseView.indexOf('private func readFullVerseKicker('));
  for (const [name, part] of [['composition', composition], ['bounded', bounded]] as const) {
    assert.ok(part.length > 0, `${name} not found`);
    assert.match(part, /verseSource\(v, lang: lang\)/, `${name} dropped the source attribution`);
  }
  assert.match(bounded, /readFullVerseKicker\(lang\)/, 'the truncating fallback must cue tap-through');
  assert.match(bounded, /\.layoutPriority\(-1\)/, 'only the verse may yield height in the fallback');
  assert.match(bounded, /maxHeight: \.infinity/);
  assert.doesNotMatch(bounded, /\.fixedSize\(horizontal: false, vertical: true\)\s*\}\s*$/,
    'the fallback must fill the cell, not grow to its ideal height');
  assert.doesNotMatch(verseView, /lineLimit\(condensed/, 'retired fixed line caps must not return');
});

test('the medium/large Panchang is measured as whole columns with a compact fallback', () => {
  const panchang = swift.slice(swift.indexOf('MARK: - आज का पंचांग'), swift.indexOf('MARK: - जप-साधना'));
  assert.match(panchang, /ViewThatFits\(in: \.vertical\) \{\s*widePanchang\([\s\S]*?compact: false\)\s*widePanchang\([\s\S]*?compact: true\)/);
  assert.match(panchang, /if !compact \{ brand\(\) \}/);
});
