import React, { useEffect } from 'react';
import { ActivityIndicator, Text } from 'react-native';
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
// The fallback localises its accessibility label. In the app it always renders
// inside GitaLanguageProvider (it lives inside the navigator), so stand one in.
jest.mock('@/data/gita/language', () => ({ useGitaLanguage: () => ({ lang: 'en' }) }));

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

describe('lazyScreen — what actually paints', () => {
  // These exist because an earlier version only asserted the module was
  // EVALUATED once, and never looked at what was committed to the screen. It
  // painted the fallback spinner on every first tap even after warm-up, and
  // every test passed.
  const spinnerCount = (t: ReturnType<typeof create>) => t.root.findAllByType(ActivityIndicator).length;
  const hasText = (t: ReturnType<typeof create>, text: string) =>
    t.root.findAll((n) => n.props.children === text).length > 0;

  it('a WARMED screen renders its content on the very first commit — no spinner', async () => {
    const Screen = lazyScreen('Warm', 2, async () => ({ default: () => <Text>CONTENT</Text> }));
    await startScreenPrefetch({ yieldToUI: async () => {} });

    let tree!: ReturnType<typeof create>;
    act(() => {
      tree = create(<Screen />);
    });
    expect(spinnerCount(tree)).toBe(0);
    expect(hasText(tree, 'CONTENT')).toBe(true);
  });

  it('a COLD screen shows the fallback, then its content once it arrives', async () => {
    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    const Screen = lazyScreen('Cold', 3, async () => {
      await gate;
      return { default: () => <Text>ARRIVED</Text> };
    });

    let tree!: ReturnType<typeof create>;
    await act(async () => {
      tree = create(<Screen />);
    });
    expect(spinnerCount(tree)).toBe(1);
    expect(hasText(tree, 'ARRIVED')).toBe(false);

    await act(async () => {
      release();
      await gate;
    });
    expect(spinnerCount(tree)).toBe(0);
    expect(hasText(tree, 'ARRIVED')).toBe(true);
  });

  it('a screen that mounted cold is NOT remounted when it later re-renders warm', async () => {
    let mounts = 0;
    function Counted({ n }: { n: number }) {
      useEffect(() => {
        mounts += 1;
      }, []);
      return <Text>{`n=${n}`}</Text>;
    }
    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    const Screen = lazyScreen<{ n: number }>('Remount', 3, async () => {
      await gate;
      return { default: Counted };
    });

    let tree!: ReturnType<typeof create>;
    await act(async () => {
      tree = create(<Screen n={1} />);
    });
    await act(async () => {
      release();
      await gate;
    });
    // New props after it resolved: the warm path now runs. Same tree shape, so
    // this must be an update, not a remount — a remount would lose the screen's
    // state (scroll position, form input) the moment it finished loading.
    await act(async () => {
      tree.update(<Screen n={2} />);
    });
    expect(hasText(tree, 'n=2')).toBe(true);
    expect(mounts).toBe(1);
  });

  it('a failed load is retried rather than cached forever', async () => {
    let attempts = 0;
    const Screen = lazyScreen('Flaky', 2, async () => {
      attempts += 1;
      if (attempts === 1) throw new Error('chunk failed');
      return { default: () => <Text>RECOVERED</Text> };
    });
    // First attempt fails during the walk (swallowed — it is only a warm-up).
    await startScreenPrefetch({ yieldToUI: async () => {} });
    expect(attempts).toBe(1);

    // The user taps it anyway: it must try again, not re-throw the old failure.
    let tree!: ReturnType<typeof create>;
    await act(async () => {
      tree = create(<Screen />);
    });
    expect(attempts).toBe(2);
    expect(hasText(tree, 'RECOVERED')).toBe(true);
  });
});

describe('screens registered on more than one stack', () => {
  it('warms EVERY stack\'s copy of a route, not just the first', async () => {
    // VidhiDetail, the Daan flow, GitaReader and VastuDisha each live on up to
    // three stacks. Deduplicating by label once left all but one of them cold.
    const warmed: string[] = [];
    registerPrefetch({ label: 'VidhiDetail', depth: 3, load: async () => void warmed.push('home') });
    registerPrefetch({ label: 'VidhiDetail', depth: 3, load: async () => void warmed.push('more') });
    registerPrefetch({ label: 'VidhiDetail', depth: 3, load: async () => void warmed.push('panchang') });

    await startScreenPrefetch({ yieldToUI: async () => {} });
    expect(warmed.sort()).toEqual(['home', 'more', 'panchang']);
  });

  it('prioritising a shared route pulls every copy forward', async () => {
    const order: string[] = [];
    registerPrefetch({ label: 'Near', depth: 2, load: async () => void order.push('near') });
    registerPrefetch({ label: 'Shared', depth: 4, load: async () => void order.push('shared-1') });
    registerPrefetch({ label: 'Shared', depth: 4, load: async () => void order.push('shared-2') });

    prioritise(['Shared']);
    await startScreenPrefetch({ yieldToUI: async () => {} });
    expect(order).toEqual(['shared-1', 'shared-2', 'near']);
  });

  it('still ignores the SAME loader registered twice', async () => {
    let calls = 0;
    const load = async () => void (calls += 1);
    registerPrefetch({ label: 'Once', depth: 2, load });
    registerPrefetch({ label: 'Once', depth: 2, load });
    await startScreenPrefetch({ yieldToUI: async () => {} });
    expect(calls).toBe(1);
  });
});
