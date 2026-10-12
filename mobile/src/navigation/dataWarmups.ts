import { registerPrefetch, idleTick } from './screenPrefetch';
import { preloadPanchangStack } from './lazyPanchangStack';

/**
 * Warm-ups that are not screens.
 *
 * `screenPrefetch` walks lazy SCREENS; this file enrols the expensive things
 * those screens need on arrival. Everything is reached through a dynamic
 * `import()` on purpose: this module is imported from `App.tsx`, so a static
 * import here would put the payload back on the launch path and undo the point
 * of warming it.
 */

/**
 * The search index — seconds of CPU on a phone, across every indexed corpus.
 *
 * Depth 2, because Search opens directly from Home and is one of the likeliest
 * first taps. Two things keep it off the screen the user is looking at:
 *
 *   - The build runs in ~8 ms slices (one chapter or one temple per unit), each
 *     behind `InteractionManager` plus a one-frame gap, so it never holds the
 *     thread for a frame.
 *   - It runs ALONGSIDE the walk rather than inside it: `load` starts the job
 *     and returns at once. The walk awaits each entry, so awaiting a
 *     many-second job here would have parked every screen queued after it.
 *
 * If the user opens Search before it finishes, the screen takes the same job
 * over at a foreground pace (`screens/_useSearchIndex.ts`); nothing is built
 * twice.
 */
const SEARCH_SLICE_GAP_MS = 16;

registerPrefetch({
  label: 'search-index',
  depth: 2,
  load: async () => {
    void import('@/data/searchIndex')
      .then(({ warmSearchIndex }) => warmSearchIndex(() => idleTick(SEARCH_SLICE_GAP_MS)))
      // A background warm-up never fails the app. A corpus that cannot be
      // indexed still fails loudly — on the Search screen, which builds the
      // same job and throws.
      .catch(() => undefined);
  },
});

/**
 * The Panchang stack chunk.
 *
 * `App.tsx` preloads this only on a cold start that LANDS on the Panchang tab.
 * On an ordinary launch onto Home the module was never evaluated, which meant
 * its 27 `lazyScreen()` calls never ran and the walk could not see a single one
 * of them — tapping Panchang paid for the chunk, and then every screen inside
 * it paid again on its own first tap.
 *
 * Warming it here closes that. It is depth 2 because the tab bar puts it one
 * tap from Home, and because evaluating it is what REGISTERS the 27 screens
 * behind it: the walk drains the registry rather than snapshotting it, so those
 * screens join the queue the moment this entry completes and are warmed in turn.
 */
registerPrefetch({
  label: 'panchang-stack',
  depth: 2,
  load: () => preloadPanchangStack(),
});
