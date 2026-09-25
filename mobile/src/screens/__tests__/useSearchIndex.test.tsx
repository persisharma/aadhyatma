import React from 'react';
import { act, create } from 'react-test-renderer';

const mockIndex = { sections: [], deities: [], verses: [] };
let mockPeek: unknown = null;
let mockWarm: jest.Mock;

jest.mock('@/data/searchIndex', () => ({
  peekSearchIndex: () => mockPeek,
  warmSearchIndex: (...args: unknown[]) => mockWarm(...args),
}));

// eslint-disable-next-line import/first
import { useSearchIndex } from '../_useSearchIndex';

function Probe({ onValue }: { onValue: (v: unknown) => void }) {
  onValue(useSearchIndex());
  return null;
}

beforeEach(() => {
  mockPeek = null;
  mockWarm = jest.fn();
});

it('returns an already-warm index on the FIRST render, without starting a build', () => {
  mockPeek = mockIndex;
  const seen: unknown[] = [];
  act(() => {
    create(<Probe onValue={(v) => seen.push(v)} />);
  });
  expect(seen[0]).toBe(mockIndex);
  expect(mockWarm).not.toHaveBeenCalled();
});

it('cold: renders null at once, then the index once the build lands — never blocking', async () => {
  let finish!: (v: unknown) => void;
  mockWarm.mockImplementation(() => new Promise((r) => (finish = r)));
  const seen: unknown[] = [];
  await act(async () => {
    create(<Probe onValue={(v) => seen.push(v)} />);
  });
  expect(seen[0]).toBeNull();
  // Takes over the build at a foreground budget, not the background one.
  expect(mockWarm).toHaveBeenCalledTimes(1);
  expect(mockWarm.mock.calls[0][1]).toBeGreaterThan(8);

  await act(async () => {
    finish(mockIndex);
  });
  expect(seen[seen.length - 1]).toBe(mockIndex);
});

it('leaving the screen stops its foreground loop, quietly', async () => {
  let aborted: unknown = 'not aborted';
  let paces = 0;
  mockWarm.mockImplementation(async (pace: () => Promise<void>) => {
    try {
      for (;;) {
        await pace();
        paces += 1;
      }
    } catch (e) {
      aborted = e;
      throw e;
    }
  });
  let tree!: ReturnType<typeof create>;
  await act(async () => {
    tree = create(<Probe onValue={() => {}} />);
  });
  await new Promise((r) => setTimeout(r, 10));
  expect(paces).toBeGreaterThan(0); // it was genuinely running

  // Unmount in its own act: React flushes the effect cleanup when act exits.
  await act(async () => {
    tree.unmount();
  });
  await new Promise((r) => setTimeout(r, 10));
  expect(typeof aborted).toBe('symbol'); // stopped by the unmount, not by an error

  const atAbort = paces;
  await new Promise((r) => setTimeout(r, 20));
  expect(paces).toBe(atAbort); // and it stays stopped — no CPU spent off-screen
});

it('a build that throws fails loudly, as the synchronous build did', async () => {
  const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
  mockWarm.mockImplementation(() => Promise.reject(new Error('sundarkand: manifest drifts')));
  class Boundary extends React.Component<React.PropsWithChildren, { error: Error | null }> {
    state = { error: null as Error | null };
    static getDerivedStateFromError(error: Error) {
      return { error };
    }
    render() {
      return this.state.error ? <>{`caught: ${this.state.error.message}`}</> : this.props.children;
    }
  }
  let tree!: ReturnType<typeof create>;
  await act(async () => {
    tree = create(
      <Boundary>
        <Probe onValue={() => {}} />
      </Boundary>
    );
  });
  expect(JSON.stringify(tree.toJSON())).toContain('sundarkand: manifest drifts');
  errors.mockRestore();
});
