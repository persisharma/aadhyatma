import React from 'react';
import { act, create } from 'react-test-renderer';
import {
  registerPrefetch,
  prefetchOrder,
  prioritise,
  startScreenPrefetch,
  resetScreenPrefetchForTests,
} from '../screenPrefetch';
import { lazyScreen } from '../lazyScreen';

jest.mock('@/theme/ThemeContext', () => ({
  useTheme: () => ({ colors: { parchment: '#fff', saffron: '#f60' } }),
}));

afterEach(() => resetScreenPrefetchForTests());

describe('screenPrefetch', () => {
  it('walks breadth-first: every depth-2 screen before any depth-3', async () => {
    const order: string[] = [];
    const entry = (label: string, depth: number) =>
      registerPrefetch({ label, depth, load: async () => void order.push(label) });
    // Registered deliberately out of order — the walk must not preserve this.
    entry('deep-a', 3);
    entry('near-a', 2);
    entry('deepest', 4);
    entry('near-b', 2);
    entry('deep-b', 3);

    await startScreenPrefetch({ yieldToUI: async () => {} });

    expect(order).toEqual(['near-a', 'near-b', 'deep-a', 'deep-b', 'deepest']);
  });

  it('yields to the UI before every single module, never batching a level', async () => {
    const trace: string[] = [];
    registerPrefetch({ label: 'a', depth: 2, load: async () => void trace.push('load:a') });
    registerPrefetch({ label: 'b', depth: 2, load: async () => void trace.push('load:b') });

    await startScreenPrefetch({
      yieldToUI: async () => void trace.push('yield'),
    });

    // A yield between each pair, so the thread is handed back rather than held
    // for a whole depth level.
    expect(trace).toEqual(['yield', 'load:a', 'yield', 'load:b']);
  });

  it('keeps going when one screen fails to evaluate', async () => {
    const loaded: string[] = [];
    registerPrefetch({ label: 'broken', depth: 2, load: () => Promise.reject(new Error('boom')) });
    registerPrefetch({ label: 'fine', depth: 2, load: async () => void loaded.push('fine') });

    await expect(
      startScreenPrefetch({ yieldToUI: async () => {} })
    ).resolves.toBeUndefined();
    expect(loaded).toEqual(['fine']);
  });


  it('warms screens a nested stack registers WHILE the walk is running', async () => {
    const warmed: string[] = [];
    // A lazily-loaded navigator: evaluating it is what enrols its own screens,
    // so these appear in the registry only once the walk has loaded it. This is
    // exactly the Panchang stack, and iterating a snapshot used to drop it.
    registerPrefetch({
      label: 'nested-stack',
      depth: 2,
      load: async () => {
        warmed.push('nested-stack');
        registerPrefetch({ label: 'nested-child-a', depth: 3, load: async () => void warmed.push('nested-child-a') });
        registerPrefetch({ label: 'nested-child-b', depth: 3, load: async () => void warmed.push('nested-child-b') });
      },
    });
    registerPrefetch({ label: 'plain-deep', depth: 4, load: async () => void warmed.push('plain-deep') });

    await startScreenPrefetch({ yieldToUI: async () => {} });

    expect(warmed).toEqual(['nested-stack', 'nested-child-a', 'nested-child-b', 'plain-deep']);
  });

  it('warms each screen once even as the registry grows', async () => {
    const counts = new Map<string, number>();
    const bump = (label: string) => counts.set(label, (counts.get(label) ?? 0) + 1);
    registerPrefetch({
      label: 'root',
      depth: 2,
      load: async () => {
        bump('root');
        registerPrefetch({ label: 'child', depth: 3, load: async () => bump('child') });
      },
    });
    await startScreenPrefetch({ yieldToUI: async () => {} });
    expect([...counts.entries()].sort()).toEqual([['child', 1], ['root', 1]]);
  });


  it('follows the user: a prioritised screen jumps ahead of shallower ones', async () => {
    const order: string[] = [];
    const entry = (label: string, depth: number) =>
      registerPrefetch({ label, depth, load: async () => void order.push(label) });
    entry('near-a', 2);
    entry('near-b', 2);
    entry('deep-branch', 4);

    // The user has navigated somewhere that opens `deep-branch`.
    prioritise(['deep-branch']);
    await startScreenPrefetch({ yieldToUI: async () => {} });

    expect(order[0]).toBe('deep-branch');
    expect(order).toEqual(['deep-branch', 'near-a', 'near-b']);
  });

  it('keeps depth order among equally urgent screens', async () => {
    const order: string[] = [];
    const entry = (label: string, depth: number) =>
      registerPrefetch({ label, depth, load: async () => void order.push(label) });
    entry('urgent-deep', 5);
    entry('urgent-shallow', 3);
    entry('calm', 2);

    prioritise(['urgent-deep', 'urgent-shallow']);
    await startScreenPrefetch({ yieldToUI: async () => {} });

    expect(order).toEqual(['urgent-shallow', 'urgent-deep', 'calm']);
  });

  it('ignores prioritising a route that is not registered', async () => {
    const order: string[] = [];
    registerPrefetch({ label: 'only', depth: 2, load: async () => void order.push('only') });
    prioritise(['NoSuchRoute', 'AlsoMissing']);
    await expect(startScreenPrefetch({ yieldToUI: async () => {} })).resolves.toBeUndefined();
    expect(order).toEqual(['only']);
  });

  it('never starts a second competing walk', async () => {
    let calls = 0;
    registerPrefetch({ label: 'once', depth: 2, load: async () => void (calls += 1) });

    const a = startScreenPrefetch({ yieldToUI: async () => {} });
    const b = startScreenPrefetch({ yieldToUI: async () => {} });
    expect(a).toBe(b);
    await a;
    expect(calls).toBe(1);
  });
});

describe('lazyScreen', () => {
  it('registers the route for warm-up and shares ONE evaluation with the render', async () => {
    let evaluations = 0;
    const Screen = lazyScreen('Demo', 2, async () => {
      evaluations += 1;
      return { default: () => null };
    });

    expect(prefetchOrder().map((e) => e.label)).toEqual(['Demo']);

    // The background walk evaluates it...
    await startScreenPrefetch({ yieldToUI: async () => {} });
    // ...and a later render reads that same evaluation rather than a second one.
    await act(async () => {
      create(<Screen />);
    });
    expect(evaluations).toBe(1);
  });
});
