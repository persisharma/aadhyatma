import {
  estimateWrappedLines,
  fitMeaningType,
  meaningScriptFor,
  shareCardMetrics,
} from '../shareCardType';

/**
 * Guard: the shared verse image is read at thumbnail size in a chat thread, so
 * its meaning must never fall back to the sub-legible sizes the old
 * `adjustsFontSizeToFit` path produced (14 pt shrunk to 7 while the leading
 * stayed pinned at 24). These pin the readability floor, the proportional
 * leading, and that the block still fits the card it is drawn on.
 */

const CARD = { cardWidth: 540, cardHeight: 675 };

// The reported case: दुःस्वप्ननाशक श्लोक, two paragraphs of Hindi commentary.
const REPORTED_MEANING =
  'जो व्यक्ति शयन (सोते समय) करते हुए नित्य राम, स्कन्द (कार्तिकेय — षडानन, देवसेनापति), ' +
  'हनुमान, वैनतेय (गरुड़ — विनता के पुत्र, विष्णु-वाहन) और वृकोदर (भीम — भेड़िये जैसा उदर वाला, ' +
  'अतुल बलशाली) का स्मरण करता है, उसके दुःस्वप्न (बुरे सपने) नष्ट हो जाते हैं।\n\n' +
  'ये पाँच नाम पाँच महावीरों के हैं — प्रत्येक अपराजेय शक्ति का प्रतीक है। इनका स्मरण मन में ' +
  'सुरक्षा और निर्भयता का भाव उत्पन्न करता है, जिससे रात्रि भयमुक्त होती है।';

const TYPICAL_HI = 'श्वेतवर्णा, परब्रह्म के चिन्तन की सार-स्वरूपा भगवती शारदा की मैं वन्दना करता हूँ।';

function fit(meaning: string, verseLineCount = 2, script: 'indic' | 'latin' = 'indic') {
  return fitMeaningType({ meaning, verseLineCount, script, ...CARD });
}

describe('share card meaning fit', () => {
  test('a typical meaning gets a comfortable reading size', () => {
    expect(fit(TYPICAL_HI).fontSize).toBeGreaterThanOrEqual(16);
  });

  test('the reported two-paragraph meaning is far above the old 7 pt render', () => {
    // The old path: 14 pt × minimumFontScale 0.5 = 7 pt over 5 lines.
    expect(fit(REPORTED_MEANING).fontSize).toBeGreaterThanOrEqual(15);
    // ...and it no longer has to fit inside five lines.
    expect(fit(REPORTED_MEANING).numberOfLines).toBeGreaterThan(5);
  });

  test('never drops under the 12 pt floor, whatever the length', () => {
    const monstrous = 'अ'.repeat(4000);
    expect(fit(monstrous).fontSize).toBeGreaterThanOrEqual(12);
    // §3.0's enforced floor is 10; this card keeps clear of it.
    expect(fit(monstrous).fontSize).toBeGreaterThanOrEqual(10);
  });

  test('leading scales with the size and clears the 1.4x Indic floor', () => {
    for (const meaning of [TYPICAL_HI, REPORTED_MEANING, 'क'.repeat(2000)]) {
      const { fontSize, lineHeight } = fit(meaning);
      expect(lineHeight / fontSize).toBeGreaterThanOrEqual(1.4);
      expect(lineHeight / fontSize).toBeLessThanOrEqual(1.7);
    }
  });

  test('longer meanings step down, never up', () => {
    const short = fit(TYPICAL_HI).fontSize;
    const mid = fit(REPORTED_MEANING).fontSize;
    const long = fit('न'.repeat(1200)).fontSize;
    expect(short).toBeGreaterThanOrEqual(mid);
    expect(mid).toBeGreaterThanOrEqual(long);
  });

  test('a four-line shloka leaves the meaning less room than a two-line one', () => {
    const two = fit(REPORTED_MEANING, 2);
    const four = fit(REPORTED_MEANING, 4);
    expect(four.numberOfLines).toBeLessThan(two.numberOfLines);
  });

  test('the block it asks for still fits the card', () => {
    const m = shareCardMetrics;
    for (const verseLines of [1, 2, 3, 4, 6]) {
      for (const meaning of [TYPICAL_HI, REPORTED_MEANING, 'क'.repeat(3000)]) {
        const f = fit(meaning, verseLines);
        const used =
          m.paddingTop +
          m.paddingBottom +
          m.headerBlock +
          m.ornamentBlock +
          m.footerBlock +
          m.meaningMarginTop +
          verseLines * (m.verseLineHeight + m.verseLineMargin) +
          f.numberOfLines * f.lineHeight;
        expect(used).toBeLessThanOrEqual(CARD.cardHeight);
      }
    }
  });

  test('an English meaning of the same length fits at least as large', () => {
    const en =
      'One who, on lying down to sleep, daily remembers Rama, Skanda, Hanuman, ' +
      'Vainateya and Vrikodara — his bad dreams are destroyed.';
    expect(fit(en, 2, 'latin').fontSize).toBeGreaterThanOrEqual(16);
  });
});

describe('estimateWrappedLines', () => {
  test('counts explicit paragraph breaks as lines', () => {
    const oneLine = estimateWrappedLines('छोटा वाक्य।', 460, 17, 'indic');
    const withBreaks = estimateWrappedLines('छोटा वाक्य।\n\nदूसरा वाक्य।', 460, 17, 'indic');
    expect(oneLine).toBe(1);
    expect(withBreaks).toBe(3);
  });

  test('more text at the same size means more lines', () => {
    const a = estimateWrappedLines('क'.repeat(100), 460, 17, 'indic');
    const b = estimateWrappedLines('क'.repeat(400), 460, 17, 'indic');
    expect(b).toBeGreaterThan(a);
  });
});

describe('meaningScriptFor', () => {
  test('only en reads as Latin', () => {
    expect(meaningScriptFor('en')).toBe('latin');
    for (const lang of ['hi', 'gu', 'kn']) {
      expect(meaningScriptFor(lang)).toBe('indic');
    }
  });
});
