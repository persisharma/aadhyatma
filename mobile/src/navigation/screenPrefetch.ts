import { InteractionManager } from 'react-native';

/**
 * Depth-staged background warm-up for lazy screens.
 *
 * THE PROBLEM. Every screen the navigators import statically is evaluated by
 * Hermes before the first frame — 1.4 MB of it across 65 screens, for surfaces
 * the user may never open. Putting them behind `React.lazy` fixes the launch
 * cost but moves it onto the tap: the user waits at a spinner instead.
 *
 * THE SHAPE. Render Home, then warm the rest in the background so a tap lands
 * on an already-evaluated module. Warming is ordered by how far a screen is
 * from Home — everything Home can reach (depth 2) before anything only those
 * screens can reach (depth 3), and so on. A breadth-first walk spends the
 * earliest, most valuable idle time on what the user is most likely to tap.
 *
 * NEVER AT THE COST OF THE CURRENT SCREEN. Evaluating a module is synchronous
 * work on the JS thread, so warming the whole list in one pass would jank
 * whatever the user is doing. Two rules keep it invisible:
 *
 *   1. Every module waits for `InteractionManager` to go idle first, so an
 *      in-flight touch, navigation or animation always wins.
 *   2. Modules are warmed ONE at a time with a gap between them, so the thread
 *      is handed back between evaluations instead of being held for a whole
 *      depth level.
 *
 * A screen the user taps before its turn is not penalised: `lazyScreen` hands
 * out ONE shared promise per screen, so the tap and the warm-up resolve off the
 * same evaluation rather than racing two of them.
 */
export type PrefetchEntry = {
  /** Route name, for debugging and for the ordering test. */
  label: string;
  /** Navigation distance from Home: Home itself is 1, what Home opens is 2. */
  depth: number;
  /** The screen's shared loader — safe to call repeatedly. */
  load: () => Promise<unknown>;
};

const registry: PrefetchEntry[] = [];

/** Called by `lazyScreen` at module scope, so the registry cannot drift from
 * the routes that actually exist. */
export function registerPrefetch(entry: PrefetchEntry): void {
  // Enrolment must happen at module scope, once per route. A duplicate means a
  // call got sited inside a render body, where it would re-enrol on every
  // re-render and grow this list without bound.
  if (registry.some((e) => e.label === entry.label)) return;
  registry.push(entry);
}

/**
 * Routes bumped to the front because the user is standing next to them.
 *
 * The plain walk is breadth-first FROM HOME, which is the right guess before
 * anyone has done anything. Once they move it is the wrong one: someone three
 * taps down one branch is served by warming that branch, not by finishing the
 * 46 unrelated screens that happen to share a depth. `prioritise` is how the
 * walk follows them.
 */
const urgent = new Set<string>();

/**
 * Warm these next, before anything still queued by depth.
 *
 * Called with the current screen's children on every navigation, so the walk
 * stays one tap ahead. Naming a label that is already warmed, or one that does
 * not exist, is a no-op — the caller works off the route graph, which is a
 * heuristic and allowed to be imperfect.
 */
export function prioritise(labels: readonly string[]): void {
  for (const label of labels) urgent.add(label);
}

/** Registered entries in the order they will be warmed. Exported for the test. */
export function prefetchOrder(): PrefetchEntry[] {
  return [...registry].sort(
    (a, b) =>
      Number(urgent.has(b.label)) - Number(urgent.has(a.label)) || a.depth - b.depth
  );
}

/** Gap between two evaluations. Long enough that a tap arriving mid-walk is
 * handled on an empty thread, short enough to finish depth 2 within a few
 * seconds of launch. */
const GAP_MS = 60;

/**
 * Resolve once the UI has nothing better to do. Injectable so the test does not
 * wait on real timers or a real InteractionManager.
 *
 * Exported because warm-ups that are not whole modules need the same pacing —
 * the search index builds itself one library entry per tick of this.
 */
export function idleTick(): Promise<void> {
  return new Promise((resolve) => {
    InteractionManager.runAfterInteractions(() => {
      setTimeout(resolve, GAP_MS);
    });
  });
}

let walking: Promise<void> | null = null;

/**
 * Start the background walk. Idempotent — the second call returns the first
 * walk's promise rather than starting a competing one.
 *
 * Call it once the first screen is on screen (`NavigationContainer`'s
 * `onReady`), never before: everything here is work the launch must not do.
 */
export function startScreenPrefetch(
  options: { yieldToUI?: () => Promise<void> } = {},
): Promise<void> {
  if (walking) return walking;
  const yieldToUI = options.yieldToUI ?? idleTick;
  walking = (async () => {
    // DRAIN the registry, do not snapshot it. Warming a lazily-loaded navigator
    // evaluates that module, and evaluating it runs its own `lazyScreen()`
    // calls — so the registry GROWS mid-walk. Iterating a snapshot taken at the
    // start silently dropped every one of those: the whole Panchang stack, 27
    // screens, stayed cold no matter how long the app idled. Re-reading each
    // time means a nested stack's screens simply join the queue at their own
    // depth and get warmed like any other.
    const done = new Set<string>();
    for (;;) {
      const next = prefetchOrder().find((entry) => !done.has(entry.label));
      if (!next) break;
      done.add(next.label);
      await yieldToUI();
      try {
        await next.load();
      } catch {
        // A warm-up is an optimisation, never a failure path: if the chunk is
        // broken the user still gets `StackLoadBoundary`'s Retry on tap, and
        // the remaining screens must still get their turn.
      }
    }
  })();
  return walking;
}

/** Test seam — forget that a walk ran. */
export function resetScreenPrefetchForTests(): void {
  walking = null;
  registry.length = 0;
  urgent.clear();
}
