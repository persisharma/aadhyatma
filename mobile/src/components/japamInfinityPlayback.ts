export type InfinityMotionDriver = {
  readPhase: (callback: (phase: number) => void) => void;
  setPhase: (phase: number) => void;
  animate: (duration: number, complete: (finished: boolean) => void) => { stop: () => void };
  stopPhase: () => void;
  onCycle?: () => void;
  /** Full-cycle duration; defaults to the Infinity loop. */
  cycleMs?: number;
};

/** One full figure-eight. 880 ms is ~10% slower than the first cut's 800 ms. */
export const INFINITY_CYCLE_MS = 880;

/** Continuous motion; only successfully completed foreground cycles are emitted. */
export function startInfinityMotion(driver: InfinityMotionDriver): () => void {
  let live = true;
  let animation: { stop: () => void } | undefined;
  const cycleMs = driver.cycleMs ?? INFINITY_CYCLE_MS;
  function cycle(from: number) {
    if (!live) return;
    let consumed = false;
    animation = driver.animate(Math.max(1, Math.round(cycleMs * (1 - from))), (finished) => {
      if (!live || consumed) return;
      consumed = true;
      if (!finished) return;
      driver.setPhase(0); // Closed path: phase 0 and 1 share the same crossing.
      driver.onCycle?.();
      cycle(0);
    });
  }
  driver.readPhase((value) => {
    if (!live) return;
    const phase = Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
    if (phase === 1) driver.setPhase(0);
    cycle(phase === 1 ? 0 : phase);
  });
  return () => {
    live = false;
    animation?.stop();
    driver.stopPhase(); // Keep the marker where the user paused it.
  };
}

/** Exactly one automatic count source: recorded chant or silent infinity cycle. */
export function japaAutoCountSource(style: 'mala' | 'infinity' | 'kirtan', running: boolean, audioPlaying: boolean): 'none' | 'audio' | 'motion' {
  const motionStyle = style === 'infinity' || style === 'kirtan';
  if (motionStyle && !running) return 'none';
  if (audioPlaying) return 'audio';
  return motionStyle ? 'motion' : 'none';
}
