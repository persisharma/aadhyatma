const mockValues = new Map<string, string>();
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: (key: string) => Promise.resolve(mockValues.get(key) ?? null),
  setItem: (key: string, value: string) => { mockValues.set(key, value); return Promise.resolve(); },
}));

beforeEach(() => { jest.resetModules(); mockValues.clear(); });
async function ready(sameDay = false) {
  const store = jest.requireActual<typeof import('../launchAskStore')>('../launchAskStore');
  if (sameDay) mockValues.set(store.LAUNCH_ASK_KEY, JSON.stringify({
    firstDay: store.localDay(), lastDay: store.localDay(), declines: 0, stopped: false,
  }));
  await store.hydrateLaunchAsks(); store.completeLaunchSelection();
  return store;
}
it('rating-owned repeats work on the same day/session; initial and other launch asks stay limited', async () => {
  const store = await ready();
  expect(store.claimRatingAsk(false)).toBe(true);
  expect(store.claimRatingAsk(false)).toBe(false);
  expect(store.claimRatingAsk(true)).toBe(true);
  expect(store.claimLaunchAsk()).toBe(false);
});
it('a stored repeat can claim after a cold restart on the same local day', async () => {
  const store = await ready(true);
  expect(store.claimRatingAsk(false)).toBe(false);
  expect(store.claimRatingAsk(true)).toBe(true);
});
it('a rating repeat never takes an opportunity owned by a higher-priority launch prompt', async () => {
  const store = await ready();
  expect(store.claimLaunchAsk()).toBe(true);
  expect(store.claimRatingAsk(true)).toBe(false);
});
it('targeted launches still suppress rating repeats', async () => {
  const store = await ready(); store.suppressLaunchAsks();
  expect(store.claimRatingAsk(true)).toBe(false);
});
