/**
 * How long THIS phone took to evaluate our launch bundle, on THIS launch — and
 * the one decision that hangs off it.
 *
 * WHY A MEASUREMENT. After the first screen is up the app spends idle time
 * warming things the user has not asked for yet: every lazy screen module
 * (`navigation/screenPrefetch`) and the whole search index
 * (`navigation/dataWarmups`). On a fast phone that is invisible and makes every
 * first tap instant. On a slow one it is seconds of JS-thread work in slices the
 * user can feel — `InteractionManager` knows about touches and navigation, but
 * a native scroll never tells it anything, so a tap can land behind a module
 * evaluation — plus megabytes of heap for surfaces most sessions never open.
 *
 * The app has no native module that reports RAM or CPU class (and adding one
 * needs a store build). What it can observe for free is the thing it actually
 * cares about: how fast this phone runs our JavaScript. Evaluating the launch
 * graph is a fixed, known amount of work, so its duration is a direct reading
 * of that speed, on the device, under whatever load it is carrying right now.
 *
 * WHY 800 ms. Module evaluation cost scales with source size. The launch graph
 * is ~4 MB; the largest single unit the background walk evaluates is a few
 * hundred KB. Where the launch graph takes 800 ms, that unit blocks the thread
 * for well over 100 ms — the point at which this repo's own launch notes say a
 * stall becomes something the user feels (`utils/launchTrace`). Below it the
 * warm-up is worth having; above it the warm-up is the jank.
 *
 * The number is a judgement, not a measurement of a device fleet. It is one
 * constant so that real traces (`launchTrace` with `FORCE_ON` on a release
 * build) can move it.
 *
 * DEPENDENCY-FREE, like `launchTrace`: it must be importable as the second
 * line of `index.ts`, before anything it is timing.
 */
const now = (): number =>
  typeof globalThis.performance?.now === 'function' ? globalThis.performance.now() : Date.now();

/** This module is imported at the top of `index.ts`, so this is "our JS started". */
const startedAt = now();
let bundleEvaluationMs: number | null = null;

/** At or above this, the phone is treated as constrained for the rest of the launch. */
export const CONSTRAINED_BUNDLE_EVALUATION_MS = 800;

/**
 * Called from `index.ts` once every static import — `App`'s entire graph — has
 * been evaluated. Only the first call counts.
 */
export function markBundleEvaluated(): void {
  if (bundleEvaluationMs === null) bundleEvaluationMs = now() - startedAt;
}

/** Ms the launch graph took to evaluate, or null before `markBundleEvaluated`. */
export function bundleEvaluationTime(): number | null {
  return bundleEvaluationMs;
}

/**
 * True when this launch showed the phone to be slow at running our code.
 *
 * Unmeasured means NOT constrained: every caller's behaviour for a fast phone is
 * the behaviour the app has always had, so a missing reading can never take
 * something away.
 */
export function isConstrainedDevice(): boolean {
  return bundleEvaluationMs !== null && bundleEvaluationMs >= CONSTRAINED_BUNDLE_EVALUATION_MS;
}

/** Test seam. */
export function setBundleEvaluationTimeForTests(ms: number | null): void {
  bundleEvaluationMs = ms;
}
