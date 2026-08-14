import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import {
  MuhuratFollowProvider,
  useMuhuratFollows,
  normalizeFollows,
  followDateKey,
  dateFromFollowKey,
  DEFAULT_MUHURAT_REMINDER,
} from '../MuhuratFollowContext';

// Stateful in-memory AsyncStorage mock (same pattern as VratFollowContext.test).
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

const STORAGE_KEY = '@vedansh/muhurat-follows';

type Ctx = ReturnType<typeof useMuhuratFollows>;
let captured!: Ctx;
function Probe() {
  captured = useMuhuratFollows();
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
      <MuhuratFollowProvider>
        <Probe />
      </MuhuratFollowProvider>
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

/** A date key `n` days from today, so fixtures never rot. */
function keyOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return followDateKey(d);
}

beforeEach(() => {
  mockStore = {};
  jest.clearAllMocks();
});

describe('followDateKey / dateFromFollowKey', () => {
  it('round-trips a civil date through the key', () => {
    const d = new Date(2026, 7, 17);
    expect(followDateKey(d)).toBe('2026-08-17');
    expect(dateFromFollowKey('2026-08-17').getTime()).toBe(d.getTime());
  });

  it('zero-pads so keys sort lexically in date order', () => {
    expect(followDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect('2026-01-05' < '2026-08-17').toBe(true);
    expect('2026-08-17' < '2026-11-25').toBe(true);
  });
});

describe('normalizeFollows', () => {
  const today = '2026-08-14';

  it('drops malformed entries', () => {
    const { items, changed } = normalizeFollows(
      [
        null,
        'nope',
        { dateKey: '2026-08-17' }, // no occasionId
        { occasionId: 'vahan' }, // no dateKey
        { occasionId: 'vahan', dateKey: '17-08-2026' }, // wrong key shape
        { occasionId: 'vahan', dateKey: '2026-08-17', addedAt: 1 },
      ],
      today
    );
    expect(items).toHaveLength(1);
    expect(items[0].occasionId).toBe('vahan');
    expect(changed).toBe(true);
  });

  it('PRUNES days that are past — a one-shot cannot fire again', () => {
    const { items, changed } = normalizeFollows(
      [
        { occasionId: 'vahan', dateKey: '2026-08-13', addedAt: 1 }, // yesterday
        { occasionId: 'vahan', dateKey: '2026-08-17', addedAt: 2 },
      ],
      today
    );
    expect(items.map((f) => f.dateKey)).toEqual(['2026-08-17']);
    expect(changed).toBe(true);
  });

  it('keeps TODAY — a muhurat later today is still live', () => {
    const { items } = normalizeFollows([{ occasionId: 'vahan', dateKey: today, addedAt: 1 }], today);
    expect(items).toHaveLength(1);
  });

  it('de-dups by (occasion, date) but keeps the same date under two occasions', () => {
    const { items } = normalizeFollows(
      [
        { occasionId: 'vahan', dateKey: '2026-08-17', addedAt: 1 },
        { occasionId: 'vahan', dateKey: '2026-08-17', addedAt: 2 },
        { occasionId: 'namkaran', dateKey: '2026-08-17', addedAt: 3 },
      ],
      today
    );
    expect(items).toHaveLength(2);
  });

  it('sorts soonest-first regardless of insertion order', () => {
    const { items } = normalizeFollows(
      [
        { occasionId: 'a', dateKey: '2026-11-25', addedAt: 1 },
        { occasionId: 'b', dateKey: '2026-08-17', addedAt: 2 },
        { occasionId: 'c', dateKey: '2026-09-02', addedAt: 3 },
      ],
      today
    );
    expect(items.map((f) => f.dateKey)).toEqual(['2026-08-17', '2026-09-02', '2026-11-25']);
  });

  it('reports changed=false when nothing needed fixing', () => {
    const { changed } = normalizeFollows(
      [{ occasionId: 'vahan', dateKey: '2026-08-17', addedAt: 1 }],
      today
    );
    expect(changed).toBe(false);
  });

  it('drops a malformed reminder pref rather than the whole follow', () => {
    const { items } = normalizeFollows(
      [{ occasionId: 'vahan', dateKey: '2026-08-17', addedAt: 1, reminder: { advanceDays: 9, dayOf: true } }],
      today
    );
    expect(items).toHaveLength(1);
    expect(items[0].reminder).toBeUndefined();
  });

  it('preserves a valid reminder pref including dayOfAtWindow', () => {
    const { items } = normalizeFollows(
      [
        {
          occasionId: 'vahan',
          dateKey: '2026-08-17',
          addedAt: 1,
          reminder: { advanceDays: 2, dayOf: true, dayOfTime: { hour: 8, minute: 0 }, dayOfAtWindow: true },
        },
      ],
      today
    );
    expect(items[0].reminder).toEqual({
      advanceDays: 2,
      dayOf: true,
      dayOfTime: { hour: 8, minute: 0 },
      dayOfAtWindow: true,
    });
  });

  it('returns empty for non-array storage', () => {
    expect(normalizeFollows({ nope: true }, today).items).toEqual([]);
    expect(normalizeFollows(null, today).items).toEqual([]);
  });
});

describe('MuhuratFollowProvider', () => {
  it('starts empty and finishes loading', async () => {
    const tree = await mountAndHydrate();
    expect(captured.isLoading).toBe(false);
    expect(captured.follows).toEqual([]);
    expect(captured.followCount).toBe(0);
    tree.unmount();
  });

  it('follow → isFollowing, persisted', async () => {
    const tree = await mountAndHydrate();
    await actSync(() => captured.follow('vahan', keyOffset(3)));
    expect(captured.isFollowing('vahan', keyOffset(3))).toBe(true);
    expect(captured.followCount).toBe(1);
    expect(JSON.parse(mockStore[STORAGE_KEY])).toHaveLength(1);
    tree.unmount();
  });

  it('follow is idempotent', async () => {
    const tree = await mountAndHydrate();
    await actSync(() => captured.follow('vahan', keyOffset(3)));
    await actSync(() => captured.follow('vahan', keyOffset(3)));
    expect(captured.followCount).toBe(1);
    tree.unmount();
  });

  it('the same day under two occasions are two follows', async () => {
    const tree = await mountAndHydrate();
    const k = keyOffset(3);
    await actSync(() => captured.follow('vahan', k));
    await actSync(() => captured.follow('namkaran', k));
    expect(captured.followCount).toBe(2);
    tree.unmount();
  });

  it('unfollow removes only the targeted (occasion, date)', async () => {
    const tree = await mountAndHydrate();
    const k = keyOffset(3);
    await actSync(() => captured.follow('vahan', k));
    await actSync(() => captured.follow('namkaran', k));
    await actSync(() => captured.unfollow('vahan', k));
    expect(captured.isFollowing('vahan', k)).toBe(false);
    expect(captured.isFollowing('namkaran', k)).toBe(true);
    tree.unmount();
  });

  it('keeps follows soonest-first as they are added out of order', async () => {
    const tree = await mountAndHydrate();
    await actSync(() => captured.follow('griha-pravesh', keyOffset(30)));
    await actSync(() => captured.follow('vahan', keyOffset(3)));
    await actSync(() => captured.follow('namkaran', keyOffset(10)));
    expect(captured.follows.map((f) => f.occasionId)).toEqual(['vahan', 'namkaran', 'griha-pravesh']);
    tree.unmount();
  });

  it('setReminder stores a per-follow override; no-ops for a non-followed day', async () => {
    const tree = await mountAndHydrate();
    const k = keyOffset(3);
    await actSync(() => captured.follow('vahan', k));
    await actSync(() =>
      captured.setReminder('vahan', k, { advanceDays: 2, dayOf: false, dayOfAtWindow: false })
    );
    expect(captured.getFollow('vahan', k)?.reminder).toEqual({
      advanceDays: 2,
      dayOf: false,
      dayOfAtWindow: false,
    });

    await actSync(() =>
      captured.setReminder('vidyarambh', k, { ...DEFAULT_MUHURAT_REMINDER, advanceDays: 3 })
    );
    expect(captured.getFollow('vidyarambh', k)).toBeUndefined();
    tree.unmount();
  });

  it('hydrates stored follows and prunes past ones on load', async () => {
    mockStore[STORAGE_KEY] = JSON.stringify([
      { occasionId: 'old', dateKey: keyOffset(-2), addedAt: 1 },
      { occasionId: 'vahan', dateKey: keyOffset(5), addedAt: 2 },
    ]);
    const tree = await mountAndHydrate();
    expect(captured.follows.map((f) => f.occasionId)).toEqual(['vahan']);
    // The prune is durable — storage was rewritten, not just filtered in memory.
    expect(JSON.parse(mockStore[STORAGE_KEY])).toHaveLength(1);
    tree.unmount();
  });

  it('pruneExpired drops follows whose day has passed', async () => {
    const tree = await mountAndHydrate();
    await actSync(() => captured.follow('vahan', keyOffset(1)));
    await actSync(() => captured.follow('vidyarambh', keyOffset(9)));
    // Two days on: the first follow is dead.
    const twoDaysOn = new Date();
    twoDaysOn.setDate(twoDaysOn.getDate() + 2);
    await actSync(() => captured.pruneExpired(twoDaysOn));
    expect(captured.follows.map((f) => f.occasionId)).toEqual(['vidyarambh']);
    tree.unmount();
  });

  it('pruneExpired does not rewrite storage when nothing expired', async () => {
    const tree = await mountAndHydrate();
    await actSync(() => captured.follow('vahan', keyOffset(5)));
    const writes = (
      jest.requireMock('@react-native-async-storage/async-storage') as { setItem: jest.Mock }
    ).setItem.mock.calls.length;
    await actSync(() => captured.pruneExpired());
    const after = (
      jest.requireMock('@react-native-async-storage/async-storage') as { setItem: jest.Mock }
    ).setItem.mock.calls.length;
    expect(after).toBe(writes);
    tree.unmount();
  });

  it('survives corrupted storage', async () => {
    mockStore[STORAGE_KEY] = '{not json';
    const tree = await mountAndHydrate();
    expect(captured.isLoading).toBe(false);
    expect(captured.follows).toEqual([]);
    tree.unmount();
  });

  it('the default pref anchors day-of to the window', () => {
    expect(DEFAULT_MUHURAT_REMINDER.dayOfAtWindow).toBe(true);
    expect(DEFAULT_MUHURAT_REMINDER.advanceDays).toBe(1);
    expect(DEFAULT_MUHURAT_REMINDER.dayOf).toBe(true);
  });
});
