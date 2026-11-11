import { InteractionManager } from 'react-native';
import { isConstrainedDevice } from '@/utils/devicePace';

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
 *
 * ON A CONSTRAINED PHONE THE WALK STAYS ONE TAP AHEAD AND NO FURTHER. "Invisible"
 * above is only true where a module evaluates in a few milliseconds. Where the
 * launch bundle itself took the best part of a second (`utils/devicePace`), the
 * same walk is ~120 further evaluations the user can feel, for screens most
 * sessions never open, and a heap that holds all of them. There the walk warms
 * what Home opens directly and then stops; `prioritise` wakes it for whatever
 * the screen the user is now on can open. A first tap is still usually warm —
 * the walk has simply stopped guessing two and three taps out.
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
  // Deduplicate by LOADER, not by label. The same route name legitimately
  // appears on several stacks — the Daan and Vidhi flows, GitaReader and
  // VastuDisha are each registered on up to three — and every one of those is
  // its own `lazyScreen` with its own loader to warm. Dropping repeats by label
  // left all but the first cold: VidhiDetail on the Panchang stack was never
  // warmed at all.
  //
  // What a repeat of the SAME loader means is a call sited inside a render
  // body, re-enrolling on every re-render. That is ignored here, and flagged in
  // development because the list would otherwise grow without bound.
  if (registry.some((e) => e.load === entry.load)) return;
  if (__DEV__ && registry.filter((e) => e.label === entry.label).length >= MAX_STACKS_PER_ROUTE) {
    console.warn(
      `screenPrefetch: '${entry.label}' enrolled more than ${MAX_STACKS_PER_ROUTE} times — ` +
        'is a lazyScreen/prefetchedRoute call inside a render body? It must be at module scope.'
    );
  }
  registry.push(entry);
}

/** A route is registered once per stack, and the app has four stacks. */
const MAX_STACKS_PER_ROUTE = 4;

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
  // On a constrained phone the walk stops after Home's own children and is
  // woken here, by the user arriving somewhere. Elsewhere the first walk is
  // still running (or has warmed everything) and this only reorders it.
  if (started?.constrained) void walk();
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

/** The same gap where one evaluation is itself a felt stall: leave real room
 * for a tap between two of them. */
const CONSTRAINED_GAP_MS = 250;

/** Home is depth 1; this is "what Home opens". Deeper screens wait to be asked
 * for on a constrained phone. */
const CONSTRAINED_MAX_DEPTH = 2;

/**
 * Resolve once the UI has nothing better to do. Injectable so the test does not
 * wait on real timers or a real InteractionManager.
 *
 * Exported because warm-ups that are not whole modules need the same pacing —
 * the search index builds itself one library entry per tick of this.
 */
export function idleTick(gapMs: number = GAP_MS): Promise<void> {
  return new Promise((resolve) => {
    InteractionManager.runAfterInteractions(() => {
      setTimeout(resolve, gapMs);
    });
  });
}

/** The walk in flight, if any. */
let walking: Promise<void> | null = null;
/** Set by the first `startScreenPrefetch`; the walk's fixed terms. */
let started: { yieldToUI: () => Promise<void>; constrained: boolean; first: Promise<void> } | null = null;
/** Keyed by ENTRY: labels repeat across stacks, and each copy is its own
 * loader that needs warming. */
const done = new Set<PrefetchEntry>();

/** Warm everything currently worth warming, then stop. */
function walk(): Promise<void> {
  if (walking || !started) return walking ?? Promise.resolve();
  const { yieldToUI, constrained } = started;
  const worthWarming = (entry: PrefetchEntry) =>
    !constrained || entry.depth <= CONSTRAINED_MAX_DEPTH || urgent.has(entry.label);
  let running = true;
  const pass = (async () => {
    // DRAIN the registry, do not snapshot it. Warming a lazily-loaded navigator
    // evaluates that module, and evaluating it runs its own `lazyScreen()`
    // calls — so the registry GROWS mid-walk. Iterating a snapshot taken at the
    // start silently dropped every one of those: the whole Panchang stack, 27
    // screens, stayed cold no matter how long the app idled. Re-reading each
    // time means a nested stack's screens simply join the queue at their own
    // depth and get warmed like any other.
    for (;;) {
      const next = prefetchOrder().find((entry) => !done.has(entry) && worthWarming(entry));
      if (!next) {
        // Given up in the SAME turn as the look that found nothing — not in a
        // reaction to this promise, which runs later. A `prioritise()` landing
        // in between would be handed this finished walk as if it were still
        // running, and the screens it asked for would stay cold.
        running = false;
        walking = null;
        return;
      }
      done.add(next);
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
  // A pass with nothing to warm has already finished by the time it returns.
  if (running) walking = pass;
  return pass;
}

/**
 * Start the background walk. Idempotent — the second call returns the first
 * walk's promise rather than starting a competing one.
 *
 * Call it once the first screen is on screen (`NavigationContainer`'s
 * `onReady`), never before: everything here is work the launch must not do.
 *
 * `constrained` defaults to this launch's own measurement; see the header.
 */
export function startScreenPrefetch(
  options: { yieldToUI?: () => Promise<void>; constrained?: boolean } = {},
): Promise<void> {
  if (started) return started.first;
  const constrained = options.constrained ?? isConstrainedDevice();
  const yieldToUI = options.yieldToUI ?? (() => idleTick(constrained ? CONSTRAINED_GAP_MS : GAP_MS));
  started = { yieldToUI, constrained, first: Promise.resolve() };
  started.first = walk();
  return started.first;
}

/** Test seam — forget that a walk ran. */
export function resetScreenPrefetchForTests(): void {
  walking = null;
  started = null;
  done.clear();
  registry.length = 0;
  urgent.clear();
}
