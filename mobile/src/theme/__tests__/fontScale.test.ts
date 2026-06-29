import assert from 'node:assert/strict';
import { typography } from '../typography';
import {
  FONT_SCALES,
  DEFAULT_FONT_SCALE,
  READING_STYLE_KEYS,
  fontScaleFactor,
  scaleTypography,
} from '../fontScale';

test('only M and L presets exist, M is the default and identity', () => {
  assert.deepEqual(Object.keys(FONT_SCALES), ['M', 'L']);
  assert.equal(DEFAULT_FONT_SCALE, 'M');
  assert.equal(FONT_SCALES.M, 1.0);
  assert.equal(fontScaleFactor('M'), 1.0);
});

test('M (factor 1.0) returns typography unchanged', () => {
  const scaled = scaleTypography(typography, fontScaleFactor('M'));
  assert.equal(scaled.verse.fontSize, typography.verse.fontSize);
  assert.equal(scaled.meaning.fontSize, typography.meaning.fontSize);
});

test('L scales reading text fontSize AND lineHeight by 1.15, rounded', () => {
  const scaled = scaleTypography(typography, fontScaleFactor('L'));
  // verse: 23 -> round(26.45) = 26 ; lineHeight 39 -> round(44.85) = 45
  assert.equal(scaled.verse.fontSize, Math.round(typography.verse.fontSize * 1.15));
  assert.equal(scaled.verse.lineHeight, Math.round(typography.verse.lineHeight * 1.15));
  assert.ok(scaled.verse.fontSize > typography.verse.fontSize);
});

test('every reading style (all scripts) is scaled at L', () => {
  const scaled = scaleTypography(typography, fontScaleFactor('L')) as Record<
    string,
    { fontSize?: number; lineHeight?: number }
  >;
  const base = typography as Record<string, { fontSize?: number; lineHeight?: number }>;
  for (const key of READING_STYLE_KEYS) {
    if (!base[key]?.fontSize) continue;
    assert.equal(
      scaled[key].fontSize,
      Math.round(base[key].fontSize! * 1.15),
      `${key} fontSize should scale`
    );
  }
});

test('UI chrome styles are never scaled', () => {
  const scaled = scaleTypography(typography, fontScaleFactor('L')) as Record<
    string,
    { fontSize?: number }
  >;
  for (const key of ['screenTitle', 'readerTitle', 'pageCounter', 'cardHindi', 'cardLatin']) {
    assert.equal(
      scaled[key].fontSize,
      (typography as Record<string, { fontSize?: number }>)[key].fontSize,
      `${key} must stay fixed`
    );
  }
});

test('scaleTypography does not mutate the input', () => {
  const before = typography.verse.fontSize;
  scaleTypography(typography, fontScaleFactor('L'));
  assert.equal(typography.verse.fontSize, before);
});
