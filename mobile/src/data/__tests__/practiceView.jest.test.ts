/**
 * Pure view-model tests for the Today's Practice screen (PRD-10). No providers.
 */
import {
  practiceSummary,
  formatOfferedTime,
  offeredTail,
  malaBeads,
  malaLabel,
} from '@/data/routine/practiceView';
import { transliterateDevanagari } from '@/utils/transliterate';

describe('practiceSummary', () => {
  it('partial day → "{done} of {total}" + remaining count (plural)', () => {
    const s = practiceSummary(4, 6, 'en');
    expect(s.allDone).toBe(false);
    expect(s.big).toBe('4 of 6');
    expect(s.sub).toBe('2 readings remaining');
  });

  it('one remaining is singular', () => {
    expect(practiceSummary(5, 6, 'en').sub).toBe('1 reading remaining');
  });

  it('all done → "offered" headline + complete sub', () => {
    const s = practiceSummary(6, 6, 'en');
    expect(s.allDone).toBe(true);
    expect(s.big).toBe('6 of 6 offered');
    expect(s.sub).toBe("Today's practice is complete");
  });

  it('zero scheduled is never "all done"', () => {
    expect(practiceSummary(0, 0, 'en').allDone).toBe(false);
  });

  it('renders Hindi register', () => {
    const partial = practiceSummary(3, 6, 'hi');
    expect(partial.big).toBe('6 में से 3');
    expect(partial.sub).toBe('3 पाठ शेष');
    expect(practiceSummary(6, 6, 'hi').sub).toBe('आज की साधना पूर्ण');
  });
});

describe('formatOfferedTime', () => {
  it('formats a 12-hour clock with meridiem', () => {
    expect(formatOfferedTime(new Date(2024, 0, 1, 7, 12).getTime(), 'en')).toBe('7:12 AM');
    expect(formatOfferedTime(new Date(2024, 0, 1, 19, 5).getTime(), 'en')).toBe('7:05 PM');
  });

  it('handles midnight and noon', () => {
    expect(formatOfferedTime(new Date(2024, 0, 1, 0, 0).getTime(), 'en')).toBe('12:00 AM');
    expect(formatOfferedTime(new Date(2024, 0, 1, 12, 0).getTime(), 'en')).toBe('12:00 PM');
  });

  it('uses Hindi meridiem', () => {
    expect(formatOfferedTime(new Date(2024, 0, 1, 7, 12).getTime(), 'hi')).toBe('7:12 पूर्वाह्न');
    expect(formatOfferedTime(new Date(2024, 0, 1, 19, 5).getTime(), 'hi')).toBe('7:05 अपराह्न');
  });

  it('returns null for missing/sentinel times', () => {
    expect(formatOfferedTime(0, 'en')).toBeNull();
    expect(formatOfferedTime(undefined, 'en')).toBeNull();
    expect(formatOfferedTime(-1, 'en')).toBeNull();
  });
});

describe('offeredTail', () => {
  const t = new Date(2024, 0, 1, 7, 12).getTime();

  it('pending → tap-to-read', () => {
    expect(offeredTail(false, undefined, 'en')).toBe('Tap to read');
    expect(offeredTail(false, undefined, 'hi')).toBe('पढ़ने के लिए टैप करें');
  });

  it('offered with a known time', () => {
    expect(offeredTail(true, t, 'en')).toBe('offered 7:12 AM');
    expect(offeredTail(true, t, 'hi')).toBe('7:12 पूर्वाह्न · अर्पित');
  });

  it('offered without a time (auto-japam / migrated legacy)', () => {
    expect(offeredTail(true, 0, 'en')).toBe('offered');
    expect(offeredTail(true, undefined, 'hi')).toBe('अर्पित');
  });
});

describe('malaBeads', () => {
  it('lights beads up to the streak', () => {
    expect(malaBeads(3, 7)).toEqual({ lit: 3, capacity: 7, todayIndex: 2, empty: false });
  });

  it('caps at capacity for long streaks', () => {
    expect(malaBeads(12, 7)).toEqual({ lit: 7, capacity: 7, todayIndex: 6, empty: false });
  });

  it('streak 0 → empty mala, no today bead', () => {
    expect(malaBeads(0, 7)).toEqual({ lit: 0, capacity: 7, todayIndex: -1, empty: true });
  });
});

describe('malaLabel', () => {
  it('labels a live streak', () => {
    expect(malaLabel(7, 'en')).toBe('7 day mala');
    expect(malaLabel(7, 'hi')).toBe('7 दिन की माला');
  });

  it('nudges an empty streak', () => {
    expect(malaLabel(0, 'en')).toBe('Start your mala today');
    expect(malaLabel(0, 'hi')).toBe('आज से माला आरम्भ करें');
  });
});

// Gujarati/Kannada render the Hindi wording re-scripted (app-wide gu/kn policy) —
// never English. Expectations are derived from the same engine the helpers use, so
// they pin the wiring (gu/kn route through contentByLang) without hard-coding glyphs.
describe('gu/kn render in-script (not English)', () => {
  for (const lang of ['gu', 'kn'] as const) {
    it(`practiceSummary uses the re-scripted Hindi for ${lang}`, () => {
      const s = practiceSummary(6, 6, lang);
      expect(s.sub).toBe(transliterateDevanagari('आज की साधना पूर्ण', lang));
      expect(s.sub).not.toBe("Today's practice is complete");
    });

    it(`offeredTail uses the re-scripted Hindi for ${lang}`, () => {
      expect(offeredTail(false, undefined, lang)).toBe(
        transliterateDevanagari('पढ़ने के लिए टैप करें', lang)
      );
    });

    it(`malaLabel uses the re-scripted Hindi for ${lang}`, () => {
      expect(malaLabel(7, lang)).toBe(transliterateDevanagari('7 दिन की माला', lang));
      expect(malaLabel(7, lang)).not.toBe('7 day mala');
    });
  }
});
