// Japam bead-counter logic (PR #40 / #93) — unit coverage for the paths the
// Maestro flow can't reach. japam-smoke.yaml drives the bead increment 0 → 3 on
// the simulator, but the Reset/Clear actions go through a confirm <Modal> whose
// accessible backdrop collapses its buttons out of Maestro's a11y tree (see the
// japam-smoke header). So the round rollover + resetBeads + clear semantics are
// pinned down here instead.
//
// `increment` reads from a ref that `persist` updates synchronously, so several
// calls in ONE act() — and a single batched `increment(id, n)` — compose on the
// latest value rather than a stale render snapshot (see the batching tests).

import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

// JapamCounterProvider logs to UserActivity on each bead/round — stub it out.
jest.mock('@/contexts/UserActivityContext', () => ({
  useUserActivity: () => ({ logJapaBead: jest.fn(), logJapaRound: jest.fn() }),
}));

const { JapamCounterProvider, useJapamCounter } = jest.requireActual<
  typeof import('@/contexts/JapamCounterContext')
>('@/contexts/JapamCounterContext');
const { JAPAM_BEADS_PER_ROUND } = jest.requireActual<typeof import('@/data/japam')>(
  '@/data/japam'
);

const MANTRA = 'gayatri-mantra';

let api: ReturnType<typeof useJapamCounter>;
function Capture() {
  api = useJapamCounter();
  return null;
}

function mount() {
  act(() => {
    TestRenderer.create(
      <JapamCounterProvider>
        <Capture />
      </JapamCounterProvider>
    );
  });
}

/** Tap N beads, each in its own act() so the closure sees fresh state. */
function inc(times: number) {
  for (let i = 0; i < times; i++) {
    act(() => {
      api.increment(MANTRA);
    });
  }
}

describe('JapamCounterContext (PR #40/#93 bead-count logic)', () => {
  test('increment raises the bead count', () => {
    mount();
    inc(3);
    expect(api.getEntry(MANTRA).count).toBe(3);
    expect(api.getEntry(MANTRA).rounds).toBe(0);
  });

  test('reaching JAPAM_BEADS_PER_ROUND rolls over into a completed round', () => {
    mount();
    inc(JAPAM_BEADS_PER_ROUND);
    const e = api.getEntry(MANTRA);
    expect(e.rounds).toBe(1);
    expect(e.count).toBe(0);
  });

  test('resetBeads zeroes the current count but keeps completed rounds', () => {
    mount();
    inc(JAPAM_BEADS_PER_ROUND + 5); // 1 completed round + 5 beads
    expect(api.getEntry(MANTRA).rounds).toBe(1);
    expect(api.getEntry(MANTRA).count).toBe(5);

    act(() => {
      api.resetBeads(MANTRA);
    });
    expect(api.getEntry(MANTRA).count).toBe(0);
    expect(api.getEntry(MANTRA).rounds).toBe(1); // rounds preserved
  });

  test('clear wipes both beads and rounds', () => {
    mount();
    inc(JAPAM_BEADS_PER_ROUND + 3);
    act(() => {
      api.clear(MANTRA);
    });
    expect(api.getEntry(MANTRA)).toEqual({ count: 0, rounds: 0, updatedAt: 0 });
  });

  test('a single call can add many beads at once (batched delta)', () => {
    mount();
    act(() => {
      api.increment(MANTRA, 5);
    });
    expect(api.getEntry(MANTRA).count).toBe(5);
  });

  test('several increments in ONE tick compose instead of clobbering', () => {
    mount();
    act(() => {
      api.increment(MANTRA); // +1
      api.increment(MANTRA, 2); // +2
      api.increment(MANTRA); // +1
    });
    // Without synchronous composition these would collapse to the last write.
    expect(api.getEntry(MANTRA).count).toBe(4);
  });

  test('a batch that crosses the round boundary rolls over correctly', () => {
    mount();
    act(() => {
      api.increment(MANTRA, JAPAM_BEADS_PER_ROUND + 2);
    });
    const e = api.getEntry(MANTRA);
    expect(e.rounds).toBe(1);
    expect(e.count).toBe(2);
  });
});
