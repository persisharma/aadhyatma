import {
  bannerStatus,
  bannerLine,
  shouldCelebrate,
  type BannerStatus,
} from '@/components/routineBannerView';

describe('bannerStatus', () => {
  it('is nudge when there is no routine', () => {
    expect(bannerStatus({ hasRoutine: false, doneCount: 0, total: 0 })).toBe('nudge');
    // no routine wins even if counts look complete
    expect(bannerStatus({ hasRoutine: false, doneCount: 3, total: 3 })).toBe('nudge');
  });

  it('is progress while partially done', () => {
    expect(bannerStatus({ hasRoutine: true, doneCount: 0, total: 4 })).toBe('progress');
    expect(bannerStatus({ hasRoutine: true, doneCount: 3, total: 4 })).toBe('progress');
  });

  it('is complete only when every scheduled item is done', () => {
    expect(bannerStatus({ hasRoutine: true, doneCount: 4, total: 4 })).toBe('complete');
  });

  it('treats a routine with nothing scheduled today as progress, never complete', () => {
    // total === 0 must not read as "complete" (would spuriously celebrate)
    expect(bannerStatus({ hasRoutine: true, doneCount: 0, total: 0 })).toBe('progress');
  });
});

describe('bannerLine', () => {
  const cases: Array<[BannerStatus, string, string, string, string]> = [
    ['nudge', 'अपनी नित्य साधना बनाएँ', 'Set your daily practice', 'તમારી નિત્ય સાધના સેટ કરો', 'ನಿಮ್ಮ ನಿತ್ಯ ಸಾಧನೆ ಹೊಂದಿಸಿ'],
    ['progress', 'नित्य साधना · आज', 'Daily Routine · Today', 'નિત્ય સાધના · આજ', 'ನಿತ್ಯ ಸಾಧನೆ · ಇಂದು'],
    ['complete', 'साधना पूर्ण · आज', 'Complete for today', 'સાધના પૂર્ણ · આજ', 'ಸಾಧನೆ ಪೂರ್ಣ · ಇಂದು'],
  ];

  it.each(cases)('%s → one localized line per language', (status, hi, en, gu, kn) => {
    expect(bannerLine(status, 'hi')).toBe(hi);
    expect(bannerLine(status, 'en')).toBe(en);
    expect(bannerLine(status, 'gu')).toBe(gu);
    expect(bannerLine(status, 'kn')).toBe(kn);
  });
});

describe('shouldCelebrate', () => {
  it('fires once: complete + focused + not yet celebrated', () => {
    expect(shouldCelebrate('complete', true, false)).toBe(true);
  });

  it('does not fire when not complete, not focused, or already celebrated', () => {
    expect(shouldCelebrate('progress', true, false)).toBe(false);
    expect(shouldCelebrate('nudge', true, false)).toBe(false);
    expect(shouldCelebrate('complete', false, false)).toBe(false);
    expect(shouldCelebrate('complete', true, true)).toBe(false);
  });
});
