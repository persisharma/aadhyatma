export type InfinityMotionDriver = {
  readPhase: (callback: (phase: number) => void) => void;
  setPhase: (phase: number) => void;
  animate: (duration: number, complete: (finished: boolean) => void) => { stop: () => void };
  stopPhase: () => void;
};

/** Continuous visual motion only. No chant-count callback or count timer. */
export function startInfinityMotion(driver: InfinityMotionDriver): () => void {
  let live = true;
  let animation: { stop: () => void } | undefined;
  function cycle(from: number) {
    if (!live) return;
    animation = driver.animate(Math.max(1, Math.round(800 * (1 - from))), (finished) => {
      if (!live || !finished) return;
      driver.setPhase(0); // Closed path: phase 0 and 1 share the same crossing.
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
