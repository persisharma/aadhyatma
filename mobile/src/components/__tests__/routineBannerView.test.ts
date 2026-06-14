import { bannerStatus, bannerLine, type BannerStatus } from '@/components/routineBannerView';

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
  const cases: Array<[BannerStatus, string, string]> = [
    ['nudge', 'अपनी नित्य साधना बनाएँ', 'Set your daily practice'],
    ['progress', 'नित्य साधना · आज', 'Daily Routine · Today'],
    ['complete', 'साधना पूर्ण · आज', 'Complete for today'],
  ];

  it.each(cases)('%s → one localized line', (status, hi, en) => {
    expect(bannerLine(status, true)).toBe(hi);
    expect(bannerLine(status, false)).toBe(en);
  });
});
