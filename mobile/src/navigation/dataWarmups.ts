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
 * The search index — ~0.7 s of CPU across every indexed corpus.
 *
 * Depth 2, because Search opens directly from Home and is one of the likeliest
 * first taps. `warmSearchIndex` yields between library entries, so this spends
 * the idle time in slices rather than one long block; by the time Search is
 * tapped the index is usually already cached and the screen paints immediately.
 */
registerPrefetch({
  label: 'search-index',
  depth: 2,
  load: async () => {
    const { warmSearchIndex } = await import('@/data/searchIndex');
    await warmSearchIndex(idleTick);
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
