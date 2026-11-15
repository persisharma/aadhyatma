import { prefetchOrder, resetScreenPrefetchForTests } from '../screenPrefetch';
import { CONSTRAINED_BUNDLE_EVALUATION_MS, setBundleEvaluationTimeForTests } from '@/utils/devicePace';

const mockPreloadPanchangStack = jest.fn(async () => undefined);
jest.mock('../lazyPanchangStack', () => ({ preloadPanchangStack: () => mockPreloadPanchangStack() }));

// The warm-up is fire-and-forget: let the macrotask queue turn before looking.
const flush = async () => { for (let i = 0; i < 5; i++) await new Promise<void>((resolve) => setImmediate(resolve)); };
const entry = (label: string) => prefetchOrder().find((e) => e.label === label)!;

let warmSearchIndexInBackground: typeof import('../dataWarmups').warmSearchIndexInBackground;
beforeAll(() => {
  resetScreenPrefetchForTests();
  // Importing the module is what enrols the warm-ups, as App.tsx relies on.
  ({ warmSearchIndexInBackground } = require('../dataWarmups'));
});
afterEach(() => { setBundleEvaluationTimeForTests(null); jest.clearAllMocks(); });

/** Stands in for the dynamically imported search module. */
function searchModule() {
  const warmSearchIndex = jest.fn(async (pace: () => Promise<void>) => {
    void pace;
    return { sections: [], deities: [], verses: [] };
  });
  const load = jest.fn(async () => ({ warmSearchIndex }));
  return { load, warmSearchIndex };
}

test('both warm-ups are one tap from Home', () => {
  expect(entry('search-index').depth).toBe(2);
  expect(entry('panchang-stack').depth).toBe(2);
});

test('the search index is built in the background on an ordinary phone', async () => {
  const { load, warmSearchIndex } = searchModule();
  warmSearchIndexInBackground(load as never);
  await flush();
  expect(load).toHaveBeenCalledTimes(1);
  expect(warmSearchIndex).toHaveBeenCalledTimes(1);
});

test('a constrained phone does not even load the search module: Search builds it on open', async () => {
  setBundleEvaluationTimeForTests(CONSTRAINED_BUNDLE_EVALUATION_MS);
  const { load, warmSearchIndex } = searchModule();
  warmSearchIndexInBackground(load as never);
  await flush();
  expect(load).not.toHaveBeenCalled();
  expect(warmSearchIndex).not.toHaveBeenCalled();
});

test('a corpus that cannot be indexed never fails the background walk', async () => {
  const load = jest.fn(async () => { throw new Error('broken corpus'); });
  expect(() => warmSearchIndexInBackground(load as never)).not.toThrow();
  await flush();
  await expect(entry('search-index').load()).resolves.toBeUndefined();
});

test('the Panchang stack chunk is warmed either way: it is what registers its screens', async () => {
  setBundleEvaluationTimeForTests(CONSTRAINED_BUNDLE_EVALUATION_MS);
  await entry('panchang-stack').load();
  expect(mockPreloadPanchangStack).toHaveBeenCalledTimes(1);
});
