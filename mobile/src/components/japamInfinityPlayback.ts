import { EXTRA_JAPA_MS, MIN_SILENT_JAPA_MS } from './japamRecitationTiming';

export type InfinityMotionDriver = {
  readPhase: (callback: (phase: number) => void) => void;
  setPhase: (phase: number) => void;
  animate: (duration: number, complete: (finished: boolean) => void) => { stop: () => void };
  stopPhase: () => void;
  onCycle?: () => void;
};

/** 1× short-name fallback. The screen supplies the full mantra's cadence. */
export const INFINITY_CYCLE_MS = MIN_SILENT_JAPA_MS + EXTRA_JAPA_MS;

/** Continuous motion; only successfully completed foreground cycles are emitted. */
export function startInfinityMotion(driver: InfinityMotionDriver, cycleMs = INFINITY_CYCLE_MS): () => void {
  const fullCycleMs = Number.isFinite(cycleMs) && cycleMs > 0 ? cycleMs : INFINITY_CYCLE_MS;
  let live = true;
  let animation: { stop: () => void } | undefined;
  function cycle(from: number) {
    if (!live) return;
    let consumed = false;
    animation = driver.animate(Math.max(1, Math.round(fullCycleMs * (1 - from))), (finished) => {
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
export function japaAutoCountSource(style: 'mala' | 'infinity', running: boolean, audioPlaying: boolean): 'none' | 'audio' | 'motion' {
  if (style === 'infinity' && !running) return 'none';
  if (audioPlaying) return 'audio';
  return style === 'infinity' ? 'motion' : 'none';
}
