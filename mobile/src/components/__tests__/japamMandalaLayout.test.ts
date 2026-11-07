import fs from 'node:fs';
import crypto from 'node:crypto';
import { layoutMandala, mandalaClusters, mandalaPageOpacity, mandalaWordBounds } from '../japamMandalaLayout';
import { ringSeparator, ringWords } from '../japamMantraRingLayout';
import measurements from './fixtures/japamMandalaWidths.json';
import { findJapamMantra } from '@/data/japam';
import { verseLinesByLang } from '@/utils/localize';

test.each([
  ['श्री', ['श्री']], ['सवितुर्वरेण्यं', ['स', 'वि', 'तु', 'र्व', 'रे', 'ण्यं']],
  ['क्षेत्रं', ['क्षे', 'त्रं']], ['क्‍ष', ['क्‍ष']], ['क्‌ष', ['क्‌ष']],
  ['શ્રી', ['શ્રી']], ['ક્ષેત્રં', ['ક્ષે', 'ત્રં']],
  ['ಶ್ರೀ', ['ಶ್ರೀ']], ['ಕ್ಷೇತ್ರಂ', ['ಕ್ಷೇ', 'ತ್ರಂ']], ['ಪ್ರೀತಿ', ['ಪ್ರೀ', 'ತಿ']],
  ['ṛā', ['ṛ', 'ā']],
])('curvature keeps every sign and conjunct intact in %s', (word, expected) => {
  expect(mandalaClusters(word as string)).toEqual(expected);
  expect(mandalaClusters(word as string).join('')).toBe(word);
});

test('font fixtures match the actual locked reading faces and the current recitation text', () => {
  for (const { file, sha256 } of Object.values(measurements.fonts)) {
    expect(crypto.createHash('sha256').update(fs.readFileSync(require.resolve(file))).digest('hex')).toBe(sha256);
  }
  for (const row of measurements.cases) {
    const mantra = findJapamMantra(row.id);
    expect(mantra).not.toBeNull();
    if (!mantra) continue;
    expect(verseLinesByLang(row.lang as 'hi' | 'en' | 'gu' | 'kn', mantra.lines, mantra.linesEn)).toEqual(row.lines);
  }
});

test('all 22 mantras and 16 long Tandav shlokas fit without cutting runs or dropping text in four scripts', () => {
  let checked = 0;
  for (const row of measurements.cases) for (const size of [280, 296, 340]) {
    const text = row.lines.join(' ');
    const layout = layoutMandala(text, size, row.widths);
    expect(layout).not.toBeNull();
    if (!layout) continue;
    expect(layout.overflow).toBe(false);
    expect(layout.bands.length).toBeGreaterThan(0);
    const separator = ringSeparator(text);
    let observed = '';
    let nodeCount = 0;
    const pages = layout.bands[0].pages.length;
    for (let page = 0; page < pages; page++) layout.bands.forEach((band, index) => {
      const words = band.pages[page];
      nodeCount += words.length;
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const bounds = mandalaWordBounds(band.radius, word.width, band.lineHeight);
        expect(bounds.outer).toBeLessThanOrEqual((index === 0 ? layout.outer : layout.middle) + 1e-6);
        expect(bounds.inner).toBeGreaterThanOrEqual(index === 0 ? layout.middle : layout.inner);
        const next = words[(i + 1) % words.length];
        const half = (w: number) => Math.atan2(w / 2, band.radius - band.lineHeight / 2) * 180 / Math.PI;
        const separation = (next.angleDeg - word.angleDeg + 360) % 360 || 360;
        expect(separation + 1e-6).toBeGreaterThanOrEqual(half(word.width) + half(next.width));
        if (word.text !== separator) observed += word.text;
      }
    });
    const expected = ringWords(text).join('');
    expect(observed.length % expected.length).toBe(0);
    expect(observed).toBe(expected.repeat(observed.length / expected.length));
    expect(nodeCount).toBeLessThanOrEqual(768);
    checked++;
  }
  expect(checked).toBe(456);
});

test('Gayatri in Hindi fits both ornamental bands in a single page even on the compact frame', () => {
  const row = measurements.cases.find(c => c.id === 'gayatri-mantra' && c.lang === 'hi')!;
  for (const size of [280, 296, 340]) {
    const layout = layoutMandala(row.lines.join(' '), size, row.widths)!;
    expect(layout.bands).toHaveLength(2);
    expect(layout.bands.every(b => b.pages.length === 1)).toBe(true);
    expect(layout.loop).toBeGreaterThan(0);
  }
});

test('word windows use valid native opacity ranges and missing measurements never start layout work', () => {
  for (let total = 1; total <= 20; total++) for (let page = 0; page < total; page++) {
    const frames = mandalaPageOpacity(page, total);
    expect(frames.inputRange[0]).toBe(0);
    expect(frames.inputRange[frames.inputRange.length - 1]).toBe(1);
    frames.inputRange.forEach((value, index) => { if (index) expect(value).toBeGreaterThan(frames.inputRange[index - 1]); });
    expect(frames.outputRange.every(value => value >= 0 && value <= 1)).toBe(true);
  }
  expect(layoutMandala('जय श्री राम', 296, {})).toBeNull();
  expect(layoutMandala('', 296, {})).toBeNull();
  expect(layoutMandala('राम', NaN, { राम: 20 })).toBeNull();
});
