import { registerPrefetch, idleTick } from './screenPrefetch';

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
