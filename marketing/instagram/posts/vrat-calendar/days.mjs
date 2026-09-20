// days.mjs — the content of the "शेष सितंबर" carousel.
//
// Every row here was READ OUT OF THE ENGINE, not typed from memory: the dates come
// from `getObservancesForDate(…, ALL_LENSES)` for 2026 (purnimant, Ujjain/IST), the
// Pitru Paksha window from `pitruSmaran.pitruPakshaWindow(2026)`, and the Sankashti
// occurrence name + its Angarki flag from `sankashtiOccurrenceName()`. Regenerate the
// list from the engine rather than editing dates by hand — see README.md.
//
// `glyph` names an emblem in glyphs.mjs. `art` is optional: drop a square image at
// art/<name> and it replaces the drawn medallion for that row, nothing else changes.

export const SERIES = {
  titleHi: 'शेष सितंबर',
  titleEn: 'The rest of September',
  rangeHi: '21 – 30 सितंबर 2026',
  rangeEn: '21 – 30 September 2026',
};

export const DAYS = [
  {
    date: '2026-09-21', weekdayHi: 'सोमवार', weekdayEn: 'Monday', day: 21,
    nameHi: 'तेजा दशमी · दशावतार व्रत', nameEn: 'Teja Dashami · Dashavatara Vrat',
    tithiHi: 'भाद्रपद शुक्ल दशमी', glyph: 'chakra',
  },
  {
    date: '2026-09-22', weekdayHi: 'मंगलवार', weekdayEn: 'Tuesday', day: 22,
    nameHi: 'परिवर्तिनी एकादशी', nameEn: 'Parivartini (Parsva) Ekadashi',
    tithiHi: 'भाद्रपद शुक्ल एकादशी', glyph: 'shankha',
  },
  {
    date: '2026-09-23', weekdayHi: 'बुधवार', weekdayEn: 'Wednesday', day: 23,
    nameHi: 'वामन जयंती', nameEn: 'Vamana Jayanti',
    tithiHi: 'भाद्रपद शुक्ल द्वादशी', glyph: 'chhatra',
  },
  {
    date: '2026-09-24', weekdayHi: 'गुरुवार', weekdayEn: 'Thursday', day: 24,
    nameHi: 'प्रदोष व्रत', nameEn: 'Shukla Pradosh Vrat',
    tithiHi: 'भाद्रपद शुक्ल त्रयोदशी', glyph: 'trishul',
  },
  {
    date: '2026-09-25', weekdayHi: 'शुक्रवार', weekdayEn: 'Friday', day: 25,
    nameHi: 'अनंत चतुर्दशी · गणेश विसर्जन', nameEn: 'Anant Chaturdashi · Ganesh Visarjan',
    tithiHi: 'भाद्रपद शुक्ल चतुर्दशी', glyph: 'anant',
  },
  {
    date: '2026-09-26', weekdayHi: 'शनिवार', weekdayEn: 'Saturday', day: 26,
    nameHi: 'पूर्णिमा · सत्यनारायण व्रत', nameEn: 'Bhadrapada Purnima · Satyanarayan Vrat',
    tithiHi: 'भाद्रपद पूर्णिमा', glyph: 'purnima',
  },
  {
    date: '2026-09-27', weekdayHi: 'रविवार', weekdayEn: 'Sunday', day: 27,
    nameHi: 'पितृ पक्ष आरंभ', nameEn: 'Pitru Paksha Begins',
    tithiHi: 'आश्विन कृष्ण प्रतिपदा', glyph: 'tarpan',
  },
  {
    date: '2026-09-29', weekdayHi: 'मंगलवार', weekdayEn: 'Tuesday', day: 29,
    nameHi: 'अंगारकी संकष्टी चतुर्थी', nameEn: 'Angaraki Vighnaraja Sankashti',
    tithiHi: 'आश्विन कृष्ण चतुर्थी · चंद्रोदय', glyph: 'modak',
  },
  {
    date: '2026-09-30', weekdayHi: 'बुधवार', weekdayEn: 'Wednesday', day: 30,
    nameHi: 'चतुर्थी श्राद्ध', nameEn: 'Chaturthi Shraddha',
    tithiHi: 'पितृ पक्ष · चौथा दिन', glyph: 'pinda',
  },
];

/** Three rows a slide, in order — the cover and the closing card wrap them. */
export const SLIDES = [DAYS.slice(0, 3), DAYS.slice(3, 6), DAYS.slice(6, 9)];
