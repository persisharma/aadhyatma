import { estimateCues, isValidCueSheet, pageAtTime, syllableWeight } from '../videoSync';
import { getChalisa } from '@/data/chalisaRegistry';

describe('pageAtTime', () => {
  // Intro music to 30s, then uneven verse lengths — the case proportional mapping got wrong.
  const cues = [0, 30, 52, 60, 68.5];

  it('holds page 0 through the intro', () => {
    expect(pageAtTime(cues, 0)).toBe(0);
    expect(pageAtTime(cues, 29.9)).toBe(0);
  });

  it('flips exactly at a cue and holds until the next', () => {
    expect(pageAtTime(cues, 30)).toBe(1);
    expect(pageAtTime(cues, 51.9)).toBe(1);
    expect(pageAtTime(cues, 52)).toBe(2);
    expect(pageAtTime(cues, 68.4)).toBe(3);
  });

  it('stays on the last page through the outro', () => {
    expect(pageAtTime(cues, 68.5)).toBe(4);
    expect(pageAtTime(cues, 600)).toBe(4);
  });

  it('treats a time before the first cue as page 0', () => {
    expect(pageAtTime([5, 10], 1)).toBe(0);
  });
});

describe('isValidCueSheet', () => {
  it('accepts one strictly increasing cue per page', () => {
    expect(isValidCueSheet([0, 30, 52], 3)).toBe(true);
  });

  it('rejects a sheet whose length does not match the page count', () => {
    expect(isValidCueSheet([0, 30], 3)).toBe(false);
    expect(isValidCueSheet([0, 30, 52, 60], 3)).toBe(false);
  });

  it('rejects non-increasing, negative or non-finite cues', () => {
    expect(isValidCueSheet([0, 30, 30], 3)).toBe(false);
    expect(isValidCueSheet([0, 40, 30], 3)).toBe(false);
    expect(isValidCueSheet([-1, 30, 52], 3)).toBe(false);
    expect(isValidCueSheet([0, NaN, 52], 3)).toBe(false);
  });

  it('rejects a missing sheet or an empty text', () => {
    expect(isValidCueSheet(undefined, 3)).toBe(false);
    expect(isValidCueSheet([], 0)).toBe(false);
  });

  it('rejects a sparse sheet (a capture with a skipped page)', () => {
    const sparse: number[] = [];
    sparse[0] = 0;
    sparse[2] = 52;
    expect(isValidCueSheet(sparse, 3)).toBe(false);
  });
});

describe('syllableWeight', () => {
  it('counts a conjunct once and ignores verse numbers and dandas', () => {
    // श्री = श + ् + र + ी → one syllable; ॥1॥ adds nothing.
    expect(syllableWeight(['श्री'])).toBe(1);
    expect(syllableWeight(['राम ॥1॥'])).toBe(2);
  });

  it('weighs a Hanuman Chalisa doha well above a chaupai', () => {
    const verses = getChalisa('hanuman-chalisa').verses;
    const doha = syllableWeight(verses[0].lines);
    const chaupai = syllableWeight(verses[2].lines);
    expect(doha / chaupai).toBeGreaterThan(1.4);
  });

  it('floors at 1 for a page with no Devanagari', () => {
    expect(syllableWeight(['…'])).toBe(1);
  });
});

describe('estimateCues', () => {
  it('spreads the duration over pages by weight, starting at 0', () => {
    expect(estimateCues([2, 1, 1], 100)).toEqual([0, 50, 75]);
  });

  it('produces a valid sheet for the whole Hanuman Chalisa', () => {
    const verses = getChalisa('hanuman-chalisa').verses;
    const cues = estimateCues(verses.map((v) => syllableWeight(v.lines)), 582);
    expect(isValidCueSheet(cues, verses.length)).toBe(true);
    // The closing doha starts before the end, and the last page holds through it.
    expect(pageAtTime(cues, 581)).toBe(verses.length - 1);
  });
});
