import {
  pick,
  contentByLang,
  meaningByLang,
  meaningSourceLang,
  commentaryByLang,
  verseLinesByLang,
} from '../localize';

const UI = { hi: 'नई साधना', en: 'New routine', gu: 'નવી સાધના', kn: 'ಹೊಸ ಸಾಧನೆ' };

describe('pick (UI chrome strings — all four hand-authored)', () => {
  test('returns the string for each language', () => {
    expect(pick('hi', UI)).toBe('नई साधना');
    expect(pick('en', UI)).toBe('New routine');
    expect(pick('gu', UI)).toBe('નવી સાધના');
    expect(pick('kn', UI)).toBe('ಹೊಸ ಸಾಧನೆ');
  });
});

describe('contentByLang (titles/labels — gu/kn derive from Devanagari)', () => {
  test('hi and en pass through unchanged', () => {
    expect(contentByLang('hi', 'भगवद् गीता', 'Bhagavad Gita')).toBe('भगवद् गीता');
    expect(contentByLang('en', 'भगवद् गीता', 'Bhagavad Gita')).toBe('Bhagavad Gita');
  });

  test('gu/kn transliterate the Devanagari source', () => {
    expect(contentByLang('gu', 'भगवद् गीता', 'Bhagavad Gita')).toBe('ભગવદ્ ગીતા');
    expect(contentByLang('kn', 'भगवद् गीता', 'Bhagavad Gita')).toBe('ಭಗವದ್ ಗೀತಾ');
    expect(contentByLang('gu', 'श्लोक · १.१', 'Shloka · 1.1')).toBe('શ્લોક · ૧.૧');
    expect(contentByLang('kn', 'चौपाई · ९', 'Chaupai · 9')).toBe('ಚೌಪಾಈ · ೯');
  });
});

describe('meaning policy (gu/kn render in their own script; en stays English)', () => {
  const hi = 'धृतराष्ट्र ने कहा';
  const en = 'Dhritarashtra said';

  test('meaningByLang', () => {
    expect(meaningByLang('hi', hi, en)).toBe(hi);
    expect(meaningByLang('en', hi, en)).toBe(en);
    expect(meaningByLang('gu', hi, en)).toBe('ધૃતરાષ્ટ્ર ને કહા');
    expect(meaningByLang('kn', hi, en)).toBe('ಧೃತರಾಷ್ಟ್ರ ನೇ ಕಹಾ');
  });

  test('meaningSourceLang is identity — each language styles in its own script', () => {
    expect(meaningSourceLang('hi')).toBe('hi');
    expect(meaningSourceLang('en')).toBe('en');
    expect(meaningSourceLang('gu')).toBe('gu');
    expect(meaningSourceLang('kn')).toBe('kn');
  });

  test('commentaryByLang follows the same policy per paragraph', () => {
    const cHi = ['पहला', 'दूसरा'];
    const cEn = ['first', 'second'];
    expect(commentaryByLang('hi', cHi, cEn)).toEqual(cHi);
    expect(commentaryByLang('en', cHi, cEn)).toEqual(cEn);
    expect(commentaryByLang('gu', cHi, cEn)).toEqual(['પહલા', 'દૂસરા']);
    expect(commentaryByLang('kn', cHi, cEn)).toEqual(['ಪಹಲಾ', 'ದೂಸರಾ']);
  });
});

describe('verseLinesByLang (recitation text — gu/kn always from the Devanagari)', () => {
  const deva = ['धर्मक्षेत्रे कुरुक्षेत्रे', 'मामकाः पाण्डवाश्चैव'];
  const latin = ['dharma-kṣhetre kuru-kṣhetre', 'māmakāḥ pāṇḍavāśhchaiva'];

  test('hi shows Devanagari, en shows the curated romanization', () => {
    expect(verseLinesByLang('hi', deva, latin)).toBe(deva);
    expect(verseLinesByLang('en', deva, latin)).toBe(latin);
  });

  test('gu/kn transliterate each Devanagari line', () => {
    expect(verseLinesByLang('gu', deva, latin)).toEqual([
      'ધર્મક્ષેત્રે કુરુક્ષેત્રે',
      'મામકાઃ પાણ્ડવાશ્ચૈવ',
    ]);
    expect(verseLinesByLang('kn', deva, latin)).toEqual([
      'ಧರ್ಮಕ್ಷೇತ್ರೇ ಕುರುಕ್ಷೇತ್ರೇ',
      'ಮಾಮಕಾಃ ಪಾಣ್ಡವಾಶ್ಚೈವ',
    ]);
  });
});
