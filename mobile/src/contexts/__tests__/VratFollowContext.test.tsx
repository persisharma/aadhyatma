import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VratFollowProvider, useVratFollows } from '../VratFollowContext';

// Stateful in-memory AsyncStorage mock (same pattern as NewContentContext.test).
let mockStore: Record<string, string> = {};
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn((k: string) => Promise.resolve(mockStore[k] ?? null)),
  setItem: jest.fn((k: string, v: string) => {
    mockStore[k] = v;
    return Promise.resolve();
  }),
  removeItem: jest.fn((k: string) => {
    delete mockStore[k];
    return Promise.resolve();
  }),
}));

const STORAGE_KEY = '@vedansh/vrat-follows';

type Ctx = ReturnType<typeof useVratFollows>;
let captured!: Ctx;
function Probe() {
  captured = useVratFollows();
  return null;
}

async function flush() {
  await act(async () => {
    for (let i = 0; i < 5; i++) await Promise.resolve();
  });
}

async function mountAndHydrate(): Promise<TestRenderer.ReactTestRenderer> {
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <VratFollowProvider>
        <Probe />
      </VratFollowProvider>
    );
  });
  await flush();
  return tree;
}

async function actSync(fn: () => void) {
  await act(async () => {
    fn();
    await Promise.resolve();
  });
}

beforeEach(() => {
  mockStore = {};
  jest.clearAllMocks();
});

describe('VratFollowContext', () => {
  test('fresh install: no follows, not loading, count 0', async () => {
    await mountAndHydrate();
    expect(captured.isLoading).toBe(false);
    expect(captured.follows).toEqual([]);
    expect(captured.followCount).toBe(0);
    expect(captured.isFollowing('nirjala-ekadashi')).toBe(false);
  });

  test('follow adds a vrat, marks following, persists with order 0', async () => {
    await mountAndHydrate();
    await actSync(() => captured.follow('nirjala-ekadashi'));
    expect(captured.isFollowing('nirjala-ekadashi')).toBe(true);
    expect(captured.followCount).toBe(1);
    const persisted = JSON.parse(mockStore[STORAGE_KEY]);
    expect(persisted).toHaveLength(1);
    expect(persisted[0].ruleId).toBe('nirjala-ekadashi');
    expect(persisted[0].order).toBe(0);
    expect(typeof persisted[0].addedAt).toBe('number');
  });

  test('follow is idempotent — the same vrat twice keeps one entry', async () => {
    await mountAndHydrate();
    await actSync(() => captured.follow('ekadashi'));
    await actSync(() => captured.follow('ekadashi'));
    expect(captured.followCount).toBe(1);
  });

  test('follow appends in priority order (0,1,2 by follow time)', async () => {
    await mountAndHydrate();
    await actSync(() => captured.follow('a'));
    await actSync(() => captured.follow('b'));
    await actSync(() => captured.follow('c'));
    expect(captured.follows.map((f) => f.ruleId)).toEqual(['a', 'b', 'c']);
    expect(captured.follows.map((f) => f.order)).toEqual([0, 1, 2]);
  });

  test('unfollow removes and re-indexes the remaining orders, persisting', async () => {
    await mountAndHydrate();
    await actSync(() => captured.follow('a'));
    await actSync(() => captured.follow('b'));
    await actSync(() => captured.follow('c'));
    await actSync(() => captured.unfollow('b'));
    expect(captured.follows.map((f) => f.ruleId)).toEqual(['a', 'c']);
    expect(captured.follows.map((f) => f.order)).toEqual([0, 1]);
    const persisted = JSON.parse(mockStore[STORAGE_KEY]);
    expect(persisted.map((f: { ruleId: string }) => f.ruleId)).toEqual(['a', 'c']);
  });

  test('reorder up/down swaps priority with the neighbour; no-op at the ends', async () => {
    await mountAndHydrate();
    await actSync(() => captured.follow('a'));
    await actSync(() => captured.follow('b'));
    await actSync(() => captured.follow('c'));

    await actSync(() => captured.reorder('c', 'up'));
    expect(captured.follows.map((f) => f.ruleId)).toEqual(['a', 'c', 'b']);

    await actSync(() => captured.reorder('a', 'up')); // already first → no-op
    expect(captured.follows.map((f) => f.ruleId)).toEqual(['a', 'c', 'b']);

    await actSync(() => captured.reorder('a', 'down'));
    expect(captured.follows.map((f) => f.ruleId)).toEqual(['c', 'a', 'b']);
    expect(captured.follows.map((f) => f.order)).toEqual([0, 1, 2]);

    await actSync(() => captured.reorder('b', 'down')); // already last → no-op
    expect(captured.follows.map((f) => f.ruleId)).toEqual(['c', 'a', 'b']);
  });

  test('load: sorts by order, dedups ruleId, drops invalid, re-indexes, re-persists', async () => {
    mockStore[STORAGE_KEY] = JSON.stringify([
      { ruleId: 'b', addedAt: 2, order: 5 },
      { ruleId: 'a', addedAt: 1, order: 1 },
      { ruleId: 'b', addedAt: 9, order: 0 }, // dup ruleId → dropped
      { foo: 'bar' }, // missing ruleId → dropped
      null, // invalid → dropped
    ]);
    await mountAndHydrate();
    expect(captured.follows.map((f) => f.ruleId)).toEqual(['a', 'b']);
    expect(captured.follows.map((f) => f.order)).toEqual([0, 1]);
    const persisted = JSON.parse(mockStore[STORAGE_KEY]);
    expect(persisted).toHaveLength(2);
    expect(persisted.map((f: { order: number }) => f.order)).toEqual([0, 1]);
  });

  test('corrupt stored JSON → empty, no throw', async () => {
    mockStore[STORAGE_KEY] = '{not json';
    await mountAndHydrate();
    expect(captured.isLoading).toBe(false);
    expect(captured.follows).toEqual([]);
  });

  test('storage read failure → empty, not loading (safe fallback)', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('boom'));
    await mountAndHydrate();
    expect(captured.isLoading).toBe(false);
    expect(captured.follows).toEqual([]);
  });
});

const REMINDER_DEFAULT_KEY = '@vedansh/vrat-reminder-default';

describe('VratFollowContext reminders (P3)', () => {
  test('fresh install: reminderDefault is the built-in default (advance 1 day, day-of 07:00)', async () => {
    await mountAndHydrate();
    expect(captured.reminderDefault.advanceDays).toBe(1);
    expect(captured.reminderDefault.dayOf).toBe(true);
    expect(captured.reminderDefault.dayOfTime).toEqual({ hour: 7, minute: 0 });
  });

  test('setReminderDefault updates and persists', async () => {
    await mountAndHydrate();
    await actSync(() =>
      captured.setReminderDefault({ advanceDays: 2, dayOf: false, dayOfTime: { hour: 8, minute: 0 } })
    );
    expect(captured.reminderDefault.advanceDays).toBe(2);
    expect(captured.reminderDefault.dayOf).toBe(false);
    const persisted = JSON.parse(mockStore[REMINDER_DEFAULT_KEY]);
    expect(persisted.advanceDays).toBe(2);
    expect(persisted.dayOfTime).toEqual({ hour: 8, minute: 0 });
  });

  test('loads a stored reminder default', async () => {
    mockStore[REMINDER_DEFAULT_KEY] = JSON.stringify({ advanceDays: 3, dayOf: false, dayOfTime: { hour: 8, minute: 30 } });
    await mountAndHydrate();
    expect(captured.reminderDefault.advanceDays).toBe(3);
    expect(captured.reminderDefault.dayOf).toBe(false);
    expect(captured.reminderDefault.dayOfTime).toEqual({ hour: 8, minute: 30 });
  });

  test('corrupt/invalid stored default falls back to the built-in default', async () => {
    mockStore[REMINDER_DEFAULT_KEY] = JSON.stringify({ advanceDays: 9, dayOf: 'yes' });
    await mountAndHydrate();
    expect(captured.reminderDefault.advanceDays).toBe(1);
    expect(captured.reminderDefault.dayOf).toBe(true);
  });

  test('setReminder sets a per-vrat override on a followed vrat and persists', async () => {
    await mountAndHydrate();
    await actSync(() => captured.follow('ekadashi'));
    await actSync(() =>
      captured.setReminder('ekadashi', { advanceDays: 2, dayOf: true, dayOfTime: { hour: 8, minute: 0 } })
    );
    const f = captured.follows.find((x) => x.ruleId === 'ekadashi');
    expect(f?.reminder).toEqual({ advanceDays: 2, dayOf: true, dayOfTime: { hour: 8, minute: 0 } });
    const persisted = JSON.parse(mockStore['@vedansh/vrat-follows']);
    expect(persisted[0].reminder.advanceDays).toBe(2);
  });

  test('setReminder(undefined) clears the per-vrat override (revert to default)', async () => {
    await mountAndHydrate();
    await actSync(() => captured.follow('ekadashi'));
    await actSync(() =>
      captured.setReminder('ekadashi', { advanceDays: 2, dayOf: true, dayOfTime: { hour: 8, minute: 0 } })
    );
    await actSync(() => captured.setReminder('ekadashi', undefined));
    const f = captured.follows.find((x) => x.ruleId === 'ekadashi');
    expect(f?.reminder).toBeUndefined();
  });

  test('setReminder on a non-followed vrat is a no-op', async () => {
    await mountAndHydrate();
    await actSync(() => captured.setReminder('not-followed', { advanceDays: 1, dayOf: true, dayOfTime: { hour: 7, minute: 0 } }));
    expect(captured.isFollowing('not-followed')).toBe(false);
    expect(captured.followCount).toBe(0);
  });

  test('reminderCount counts follows whose resolved reminder still fires', async () => {
    await mountAndHydrate();
    await actSync(() => captured.follow('a'));
    await actSync(() => captured.follow('b'));
    expect(captured.reminderCount).toBe(2); // global default is on → both count
    await actSync(() => captured.setReminder('a', { advanceDays: 0, dayOf: false, dayOfTime: { hour: 7, minute: 0 } }));
    expect(captured.reminderCount).toBe(1); // 'a' now fully off
  });
});
