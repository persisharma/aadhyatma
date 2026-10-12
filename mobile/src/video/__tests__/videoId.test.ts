import { isValidYouTubeId, youtubeWatchUrl } from '../videoId';

describe('isValidYouTubeId', () => {
  it('accepts a well-formed 11-char id', () => {
    expect(isValidYouTubeId('AETFvQonfV8')).toBe(true);
    expect(isValidYouTubeId('dQw4w9WgXcQ')).toBe(true);
    expect(isValidYouTubeId('_-aB3cD4e5F')).toBe(true);
  });

  it('rejects wrong length', () => {
    expect(isValidYouTubeId('short')).toBe(false);
    expect(isValidYouTubeId('waytoolongid123')).toBe(false);
    expect(isValidYouTubeId('')).toBe(false);
  });

  it('rejects out-of-alphabet characters (injection guard)', () => {
    expect(isValidYouTubeId("abc'};alert(")).toBe(false);
    expect(isValidYouTubeId('abcdefghij!')).toBe(false);
    expect(isValidYouTubeId('abc def ghi')).toBe(false);
  });
});

describe('youtubeWatchUrl', () => {
  it('builds the canonical watch url', () => {
    expect(youtubeWatchUrl('AETFvQonfV8')).toBe('https://www.youtube.com/watch?v=AETFvQonfV8');
  });
});
