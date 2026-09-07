/**
 * The analytics store — persistence, fan-out, and the failure postures that
 * differ from every other store in the app.
 *
 * The model itself is pinned by `events.test.ts` (a `tsx --test` script). This
 * suite needs the AsyncStorage mock, so it is Jest and carries the
 * `.jest.test.ts` suffix that opts it into `jest.config.js`.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import { MAX_EVENTS, serializeLog, sharedScreenView, type AnalyticsEvent } from '../events';
import {
  ANALYTICS_LOG_STORAGE_KEY,
  __resetAnalyticsStoreForTests,
  __setAnalyticsClockForTests,
  flushAnalyticsWrites,
  getEventsSnapshot,
  loadAnalyticsLog,
  logEvent,
  logSharedScreenView,
  registerSink,
} from '../analyticsStore';

// Storage failures are induced the way the rest of the suite does it
// (`birthProfiles.jest.test.ts`): the AsyncStorage jest mock's methods are
// already `jest.fn()`s, so cast and use `mockImplementationOnce`, which clears
// itself. Do NOT reach for `jest.spyOn` + `mockRestore` here — restoring a spy
// laid over an existing mock leaves the method returning `undefined`, and every
// later test that touches storage then fails inside the store.
beforeEach(async () => {
  __resetAnalyticsStoreForTests();
  await AsyncStorage.clear();
});

describe('logSharedScreenView', () => {
  it('records section and entry_point for all four sources', async () => {
    let tick = 1_000;
    __setAnalyticsClockForTests(() => (tick += 10));

    logSharedScreenView('panchang', 'tab');
    logSharedScreenView('vrat', 'segment_swipe');
    logSharedScreenView('jyotish', 'notification');
    logSharedScreenView('vrat', 'deeplink');
    await flushAnalyticsWrites();

    expect(getEventsSnapshot()).toEqual([
      { name: 'shared_screen_view', at: 1_010, entry_point: 'tab', section: 'panchang' },
      { name: 'shared_screen_view', at: 1_020, entry_point: 'segment_swipe', section: 'vrat' },
      { name: 'shared_screen_view', at: 1_030, entry_point: 'notification', section: 'jyotish' },
      { name: 'shared_screen_view', at: 1_040, entry_point: 'deeplink', section: 'vrat' },
    ]);
  });

  it('persists the log so it survives a restart', async () => {
    __setAnalyticsClockForTests(() => 5_000);
    logSharedScreenView('vrat', 'tab');
    await flushAnalyticsWrites();

    // A fresh process: memory is empty, disk is not.
    __resetAnalyticsStoreForTests();
    expect(getEventsSnapshot()).toEqual([]);

    const restored = await loadAnalyticsLog();
    expect(restored).toEqual([
      { name: 'shared_screen_view', at: 5_000, entry_point: 'tab', section: 'vrat' },
    ]);
  });

  it('keeps the ring buffer bounded on disk as well as in memory', async () => {
    let tick = 0;
    __setAnalyticsClockForTests(() => (tick += 1));
    for (let i = 0; i < MAX_EVENTS + 5; i += 1) logSharedScreenView('panchang', 'tab');
    await flushAnalyticsWrites();

    expect(getEventsSnapshot()).toHaveLength(MAX_EVENTS);
    const raw = await AsyncStorage.getItem(ANALYTICS_LOG_STORAGE_KEY);
    expect(JSON.parse(raw as string).events).toHaveLength(MAX_EVENTS);
  });
});

describe('sinks', () => {
  it('hands every event to each registered sink, and stops on unregister', () => {
    const seen: AnalyticsEvent[] = [];
    const unregister = registerSink((event) => seen.push(event));

    logSharedScreenView('vrat', 'tab');
    expect(seen).toHaveLength(1);
    expect(seen[0]).toMatchObject({ section: 'vrat', entry_point: 'tab' });

    unregister();
    logSharedScreenView('jyotish', 'tab');
    expect(seen).toHaveLength(1);
  });

  it('drops a throwing sink instead of letting it break the caller', () => {
    const good: AnalyticsEvent[] = [];
    let calls = 0;
    registerSink(() => {
      calls += 1;
      throw new Error('sink is down');
    });
    registerSink((event) => good.push(event));

    // The navigation handler that logged this must not see the throw.
    expect(() => logSharedScreenView('panchang', 'tab')).not.toThrow();
    expect(() => logSharedScreenView('panchang', 'tab')).not.toThrow();

    // Called once, then removed from the fan-out for the rest of the session.
    expect(calls).toBe(1);
    // The healthy sink still received both events.
    expect(good).toHaveLength(2);
  });
});

describe('failure posture', () => {
  it('never throws when the write fails, and keeps the event in memory', async () => {
    const setItem = AsyncStorage.setItem as jest.Mock;
    setItem.mockImplementationOnce(() => Promise.reject(new Error('disk full')));

    __setAnalyticsClockForTests(() => 42);
    expect(() => logSharedScreenView('vrat', 'segment_swipe')).not.toThrow();
    await expect(flushAnalyticsWrites()).resolves.not.toThrow();

    // Nothing renders this log, so losing the row on disk is acceptable — but
    // the session's own view of it stays correct.
    expect(getEventsSnapshot()).toEqual([
      { name: 'shared_screen_view', at: 42, entry_point: 'segment_swipe', section: 'vrat' },
    ]);

    // The queue survives the failure: the next event still persists.
    logSharedScreenView('jyotish', 'tab');
    await flushAnalyticsWrites();
    expect(JSON.parse((await AsyncStorage.getItem(ANALYTICS_LOG_STORAGE_KEY)) as string).events)
      .toHaveLength(2);
  });

  it('retries a failed read rather than pinning the session to an empty log', async () => {
    await AsyncStorage.setItem(
      ANALYTICS_LOG_STORAGE_KEY,
      serializeLog([sharedScreenView('vrat', 'notification', 7)])
    );

    const getItem = AsyncStorage.getItem as jest.Mock;
    getItem.mockImplementationOnce(() => Promise.reject(new Error('transient')));

    expect(await loadAnalyticsLog()).toEqual([]);

    // Only a SUCCESSFUL read is memoized, so the next call actually re-reads.
    expect(await loadAnalyticsLog()).toEqual([
      { name: 'shared_screen_view', at: 7, entry_point: 'notification', section: 'vrat' },
    ]);
  });

  it('keeps events logged before hydration landed, ordered after the stored ones', async () => {
    await AsyncStorage.setItem(
      ANALYTICS_LOG_STORAGE_KEY,
      serializeLog([sharedScreenView('panchang', 'tab', 1)])
    );

    // A notification tap on a cold start logs before the read resolves. Those
    // are the most interesting rows for entry_point, so they must not be lost.
    __setAnalyticsClockForTests(() => 2);
    logEvent(sharedScreenView('vrat', 'notification', 2));
    await loadAnalyticsLog();
    await flushAnalyticsWrites();

    expect(getEventsSnapshot().map((e) => [e.section, e.at])).toEqual([
      ['panchang', 1],
      ['vrat', 2],
    ]);
  });

  it('drops unreadable stored rows without losing the readable ones', async () => {
    await AsyncStorage.setItem(
      ANALYTICS_LOG_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        events: [
          { name: 'shared_screen_view', at: 1, entry_point: 'tab', section: 'panchang' },
          { name: 'shared_screen_view', at: 2, entry_point: 'carrier_pigeon', section: 'vrat' },
          { name: 'shared_screen_view', at: 3, entry_point: 'deeplink', section: 'jyotish' },
        ],
      })
    );

    expect((await loadAnalyticsLog()).map((e) => e.at)).toEqual([1, 3]);
  });

  it('survives a corrupt record entirely', async () => {
    await AsyncStorage.setItem(ANALYTICS_LOG_STORAGE_KEY, '{{{not json');
    expect(await loadAnalyticsLog()).toEqual([]);
    expect(() => logSharedScreenView('vrat', 'tab')).not.toThrow();
  });
});
