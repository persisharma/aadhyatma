import React from 'react';
import { AppState, Linking, Share } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import { BookmarksProvider, useBookmarks, type BookmarkRef } from '@/contexts/BookmarksContext';
import { RatingPromptProvider, useRatingPrompt, RATING_PROMPT_DELAY_MS } from '@/contexts/RatingPromptContext';
import { useRatingShare } from '@/utils/useRatingShare';
import { beginRatingInteraction, isRatingInteractionActive } from '@/contexts/ratingInteraction';
import { RATING_PROMPT_STORAGE_KEY } from '@/data/ratingPrompt';

const mockStore = new Map<string, string>();
let mockTaken = false;
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: (key: string) => Promise.resolve(mockStore.get(key) ?? null),
  setItem: (key: string, value: string) => { mockStore.set(key, value); return Promise.resolve(); },
}));
jest.mock('@/contexts/NotificationPreferencesContext', () => ({
  useNotificationPreferences: () => ({ meta: { appOpenCount: 1 }, isLoading: false }),
}));
jest.mock('@/contexts/UserActivityContext', () => ({
  useUserActivity: () => ({ lifetimeTotals: () => ({ activeDays: 0, totalReads: 0 }), isLoading: false }),
}));
jest.mock('@/contexts/TourContext', () => ({
  useTour: () => ({ isLoading: false }),
}));
jest.mock('@/components/launchAskStore', () => ({
  useLaunchAsks: () => ({ ready: true, selectionComplete: true, taken: mockTaken }),
  claimLaunchAsk: () => { if (mockTaken) return false; mockTaken = true; return true; },
}));

let bookmarks: ReturnType<typeof useBookmarks>;
let rating: ReturnType<typeof useRatingPrompt>;
let share: ReturnType<typeof useRatingShare>;
function Probe() {
  bookmarks = useBookmarks(); rating = useRatingPrompt(); share = useRatingShare();
  return null;
}
let tree: TestRenderer.ReactTestRenderer;
async function mount() {
  // The actual App provider order: Bookmarks is ABOVE rating.
  await act(async () => { tree = TestRenderer.create(
    <BookmarksProvider><RatingPromptProvider><Probe /></RatingPromptProvider></BookmarksProvider>,
  ); });
}
const saved: BookmarkRef = { id: 'gita-1-0', sourceId: 'gita', chapter: 1, verseIndex: 0,
  savedAt: 1000, previewHi: 'श्लोक', previewEn: 'Verse' };
async function settle() { await act(async () => { jest.advanceTimersByTime(RATING_PROMPT_DELAY_MS); }); }

beforeEach(() => { jest.useFakeTimers(); mockStore.clear(); mockTaken = false; });
afterEach(() => {
  if (tree) act(() => tree.unmount());
  jest.restoreAllMocks(); jest.useRealTimers();
});

it('new wishlist saves trigger and persist an ask with zero reading, despite provider order', async () => {
  await mount();
  act(() => bookmarks.addBookmark(saved));
  expect(rating.visible).toBe(false);
  await settle();
  expect(rating.visible).toBe(true);
  expect(JSON.parse(mockStore.get(RATING_PROMPT_STORAGE_KEY)!)).toMatchObject({
    askCount: 1, asksByTrigger: { 'bookmark-saved': 1 },
  });
  expect(JSON.parse(mockStore.get('@vedansh/bookmarks')!)).toHaveLength(1);
});

it('restoring, replacing and removing a bookmark do not ask', async () => {
  mockStore.set('@vedansh/bookmarks', JSON.stringify([saved]));
  await mount(); await settle();
  act(() => bookmarks.addBookmark({ ...saved, savedAt: 2000 }));
  await settle();
  act(() => bookmarks.removeBookmark(saved.id));
  await settle();
  expect(rating.visible).toBe(false);
  expect(mockStore.has(RATING_PROMPT_STORAGE_KEY)).toBe(false);
});

it.each([Share.sharedAction, Share.dismissedAction])('direct shares report only a completed share: %s', async (action) => {
  jest.spyOn(Share, 'share').mockResolvedValue({ action });
  await mount();
  await act(async () => { await share({ message: 'Calendar or app share' }); });
  await settle();
  expect(rating.visible).toBe(action === Share.sharedAction);
  expect(isRatingInteractionActive()).toBe(false);
});

it('does not ask on a failed hand-off and releases the interaction guard', async () => {
  jest.spyOn(Share, 'share').mockRejectedValue(new Error('No target'));
  await mount();
  await act(async () => { await share({ message: 'Text' }); });
  await settle();
  expect(rating.visible).toBe(false);
  expect(isRatingInteractionActive()).toBe(false);
});

it.each(['rated', 'cooldown', 'low-rating', 'daily-budget'])('actions honour %s suppression', async (reason) => {
  if (reason === 'daily-budget') mockTaken = true;
  else mockStore.set(RATING_PROMPT_STORAGE_KEY, JSON.stringify({
    outcome: reason === 'rated' ? 'rated' : 'pending',
    lastAskedAt: reason === 'cooldown' ? Date.now() : 1,
    lowRatedAt: reason === 'low-rating' ? Date.now() : null,
  }));
  await mount();
  act(() => bookmarks.addBookmark(saved));
  await settle();
  expect(rating.visible).toBe(false);
});

it('cancels an automatic open if a share flow owns the screen during the delay', async () => {
  await mount();
  act(() => bookmarks.addBookmark(saved));
  const finish = beginRatingInteraction();
  await settle();
  expect(rating.visible).toBe(false);
  finish(); finish();
  expect(isRatingInteractionActive()).toBe(false);
  expect(mockStore.has(RATING_PROMPT_STORAGE_KEY)).toBe(false);
});

it('never opens over the background app', async () => {
  await mount();
  act(() => bookmarks.addBookmark(saved));
  const before = AppState.currentState;
  AppState.currentState = 'background';
  try { await settle(); expect(rating.visible).toBe(false); }
  finally { AppState.currentState = before; }
});

it('manual rating cancels a pending action ask', async () => {
  jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
  await mount();
  act(() => { bookmarks.addBookmark(saved); rating.open(); });
  act(() => { rating.rate(); });
  jest.spyOn(Share, 'share').mockResolvedValue({ action: Share.sharedAction });
  await settle();
  expect(rating.visible).toBe(false);
  expect(rating.state.outcome).toBe('rated');
  expect(rating.state.askCount).toBe(0);
});
