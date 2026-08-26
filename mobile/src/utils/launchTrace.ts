/**
 * TEMPORARY launch instrumentation — delete this file and its call sites once the
 * launch-hang question is settled (`git log --grep launchTrace` finds them all).
 *
 * WHY IT EXISTS. Three separate launch-cost fixes have shipped for Home on
 * reasoning alone (#268 the interaction handle, #269 the prefetch, and the
 * Aug 2026 drift/pitru pair), and the report kept coming back. Reasoning found
 * real costs every time, but it cannot tell us which one the user is actually
 * feeling, and V8 numbers on a laptop are not Hermes numbers on a phone. This
 * module answers that from the device.
 *
 * TWO INSTRUMENTS, and the second is the important one:
 *
 *  1. **Marks** — a labelled timeline in ms from the first line of our bundle.
 *     `bundle-evaluated` is the whole static import graph's evaluation cost;
 *     the rest are lifecycle points (first render, splash hidden, Home painted,
 *     the strip's headline/chips/pitru answers, the widget plan, the observance
 *     warm scan).
 *
 *  2. **The stall sampler** — a 50 ms heartbeat that records every time it comes
 *     back late. A "hang" IS a late heartbeat: whatever blocks the JS thread
 *     blocks this timer by exactly as long. So the output says *when* the thread
 *     froze and for *how long*, which is the one thing no amount of code reading
 *     gives you. Cross a stall against the marks around it and the culprit is
 *     bracketed.
 *
 * DEPENDENCY-FREE BY DESIGN. This module imports nothing — not even
 * `react-native`. That is what lets it be called from `panchangPrefs`,
 * `panchangDayStore` and the rest of the deliberately RN-free engine side, which
 * `tsx --test` imports directly and which would break on react-native's
 * untranspiled Flow. The one thing it gives up is `InteractionManager`; the
 * `first-ui-idle` mark is emitted from `App.tsx` instead, where RN is already in
 * scope.
 *
 * READING IT. A stall's `at` is when the block ENDED (that is when we regain the
 * thread to notice), so the work that caused it ran in `[at - blocked, at]`.
 * Anything over ~100 ms is a dropped-frame cluster the user can feel; a few
 * hundred ms reads as a stutter; past ~500 ms it reads as a hang.
 */
/**
 * Flip to `true` to profile a RELEASE build, which is the only build whose
 * numbers matter: `__DEV__` runs unoptimised, off a Metro dev server, and (on
 * iOS) may not even be Hermes, so its module-eval figures are fiction. Remember
 * to flip it back.
 */
const FORCE_ON = false;

export const LAUNCH_TRACE =
  (typeof __DEV__ !== 'undefined' && __DEV__ ? true : FORCE_ON) &&
  // Never in Jest: the sampler would keep the event loop alive and every suite
  // that touches a marked module would print a timeline.
  process.env.NODE_ENV !== 'test';

/** Ms from the first line of our bundle to evaluate. */
const now = (): number =>
  typeof globalThis.performance?.now === 'function' ? globalThis.performance.now() : Date.now();

/**
 * t0 — this module's own evaluation. It is imported FIRST from `index.ts`
 * (before `expo` and before `./App`), so t0 is as close to "our JS started" as
 * we can observe from inside the bundle. Everything else is relative to it.
 */
const t0 = now();

type Mark = { name: string; at: number };
type Stall = { at: number; blocked: number };

const marks: Mark[] = [];
const stalls: Stall[] = [];
const onceSeen = new Set<string>();

/** Record a point in the launch. Cheap, and a no-op when the trace is off. */
export function launchMark(name: string): void {
  if (!LAUNCH_TRACE) return;
  marks.push({ name, at: now() - t0 });
}

/**
 * Record a point that can be reached repeatedly (a render, a resolve landing)
 * but is only interesting the first time — so a re-render cannot bury the
 * timeline in duplicates.
 */
export function launchMarkOnce(name: string): void {
  if (!LAUNCH_TRACE || onceSeen.has(name)) return;
  onceSeen.add(name);
  launchMark(name);
}

/**
 * Time one synchronous block and mark both ends. Use this to bisect a large
 * `bundle-evaluated` or a stall you have narrowed to a known function — wrap the
 * suspect, relaunch, read the number.
 */
export function launchMeasure<T>(name: string, fn: () => T): T {
  if (!LAUNCH_TRACE) return fn();
  const start = now();
  try {
    return fn();
  } finally {
    const took = now() - start;
    marks.push({ name: `${name} (${took.toFixed(0)}ms)`, at: now() - t0 });
  }
}

const SAMPLE_MS = 50;
/** Report a heartbeat that came back this much late or worse. ~3 dropped frames. */
const STALL_MS = 50;
/** How long to watch. Long enough to cover the launch plus the deferred tail. */
const WINDOW_MS = 25_000;

let sampling = false;

/**
 * Start the heartbeat. Every late return is the JS thread having been busy, so
 * this is a direct measurement of the symptom the user reports — no inference
 * about which code was running, just how long the thread was gone and when.
 */
export function startLaunchTrace(): void {
  if (!LAUNCH_TRACE || sampling) return;
  sampling = true;
  let last = now();
  const tick = () => {
    const at = now();
    const blocked = at - last - SAMPLE_MS;
    if (blocked >= STALL_MS) stalls.push({ at: at - t0, blocked });
    last = at;
    if (at - t0 < WINDOW_MS) setTimeout(tick, SAMPLE_MS);
    else dumpLaunchTrace('window elapsed');
  };
  setTimeout(tick, SAMPLE_MS);
}

/** Print the timeline and the stalls. Called automatically when the window ends. */
export function dumpLaunchTrace(reason = 'manual'): void {
  if (!LAUNCH_TRACE) return;
  const lines: string[] = [`── launch trace (${reason}) — ms from bundle start ──`];
  let prev = 0;
  for (const m of [...marks].sort((a, b) => a.at - b.at)) {
    const delta = m.at - prev;
    lines.push(`${m.at.toFixed(0).padStart(7)}  (+${delta.toFixed(0).padStart(5)})  ${m.name}`);
    prev = m.at;
  }
  const worst = [...stalls].sort((a, b) => b.blocked - a.blocked);
  const total = stalls.reduce((s, x) => s + x.blocked, 0);
  lines.push(
    `── JS-thread stalls ≥${STALL_MS}ms: ${stalls.length}, ${total.toFixed(0)}ms blocked in total ──`
  );
  // Chronological, so a stall reads against the marks above it; `at` is when the
  // block ENDED, so the work ran in [at - blocked, at].
  for (const s of stalls) {
    lines.push(`${s.at.toFixed(0).padStart(7)}  blocked ${s.blocked.toFixed(0)}ms (ended here)`);
  }
  if (worst.length > 0) lines.push(`── worst single stall: ${worst[0].blocked.toFixed(0)}ms ──`);
  console.log(lines.join('\n'));
}

/** Test-only: forget everything recorded so far. */
export function __resetLaunchTraceForTests(): void {
  marks.length = 0;
  stalls.length = 0;
  onceSeen.clear();
  sampling = false;
}
