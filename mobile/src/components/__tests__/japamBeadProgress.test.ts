import {
  advanceBeadProgress,
  INITIAL_BEAD_PROGRESS,
  type BeadProgress,
  type BeadTick,
} from '@/components/japamBeadProgress';
import { getJapamAudioRepetitions } from '@assets/japam-audio';

/**
 * Drive the reducer through a sequence of ticks and return the total beads
 * emitted plus the final state — mirrors how JapamAudioPlayer feeds it status
 * updates.
 */
function run(
  ticks: BeadTick[],
  start: BeadProgress = INITIAL_BEAD_PROGRESS
): { total: number; state: BeadProgress } {
  let state = start;
  let total = 0;
  for (const tick of ticks) {
    const res = advanceBeadProgress(state, tick);
    state = res.state;
    total += res.delta;
  }
  return { total, state };
}

/** Simulate `loops` full playbacks of a clip sampled every `stepSec`. */
function playLoops(
  loops: number,
  duration: number,
  repetitions: number,
  stepSec = 0.25
): BeadTick[] {
  const ticks: BeadTick[] = [];
  for (let l = 0; l < loops; l++) {
    for (let t = stepSec; t < duration; t += stepSec) {
      ticks.push({ currentTime: t, duration, repetitions, playing: true });
    }
    // Wrap back to the top for the next loop.
    ticks.push({ currentTime: 0, duration, repetitions, playing: true });
  }
  return ticks;
}

describe('advanceBeadProgress', () => {
  test('single-recitation clip registers exactly one bead per loop', () => {
    const { total } = run(playLoops(5, 6, 1));
    expect(total).toBe(5);
  });

  test('a musical rendition registers `repetitions` beads per loop', () => {
    expect(run(playLoops(1, 480, 16)).total).toBe(16);
    expect(run(playLoops(3, 193, 6)).total).toBe(18); // 6 × 3 loops
  });

  test('beads are spread across the clip, not dumped at the wrap', () => {
    // Halfway through a 6-rep clip, ~3 beads should have registered.
    const half: BeadTick[] = [];
    for (let t = 0.25; t <= 96; t += 0.25) {
      half.push({ currentTime: t, duration: 192, repetitions: 6, playing: true });
    }
    const { total } = run(half);
    expect(total).toBe(3);
  });

  test('a coarse tick that skips segments emits the whole delta at once', () => {
    // Jump straight from 0 to 75% of a 4-rep clip in one tick → 3 beads.
    const { total, state } = run([
      { currentTime: 0, duration: 100, repetitions: 4, playing: true },
      { currentTime: 75, duration: 100, repetitions: 4, playing: true },
    ]);
    expect(total).toBe(3);
    expect(state.emitted).toBe(3);
  });

  test('paused playback and unknown duration register nothing', () => {
    expect(
      run([{ currentTime: 10, duration: 100, repetitions: 4, playing: false }]).total
    ).toBe(0);
    expect(
      run([{ currentTime: 10, duration: 0, repetitions: 4, playing: true }]).total
    ).toBe(0);
  });

  test('a missed wrap loses at most one loop and never stalls', () => {
    const duration = 100;
    const reps = 4;
    // Loop 1 plays fully, but the wrap tick (position back to ~0) is dropped;
    // loop 2 resumes mid-clip. Counting must recover, not freeze.
    const ticks: BeadTick[] = [];
    for (let t = 25; t <= 100; t += 25) {
      ticks.push({ currentTime: t, duration, repetitions: reps, playing: true });
    }
    // No {currentTime: 0} wrap tick here — it's the "missed" one.
    for (let t = 25; t <= 100; t += 25) {
      ticks.push({ currentTime: t, duration, repetitions: reps, playing: true });
    }
    // A third loop that DOES wrap cleanly.
    ticks.push({ currentTime: 0, duration, repetitions: reps, playing: true });
    for (let t = 25; t <= 100; t += 25) {
      ticks.push({ currentTime: t, duration, repetitions: reps, playing: true });
    }
    const { total } = run(ticks);
    // Without the fix this would stall at 4; it must keep counting past that.
    expect(total).toBeGreaterThan(reps);
  });
});

describe('getJapamAudioRepetitions', () => {
  test('musical renditions declare their repetition count', () => {
    expect(getJapamAudioRepetitions('hare-krishna-mahamantra')).toBe(16);
    expect(getJapamAudioRepetitions('gayatri-mantra')).toBe(6);
  });

  test('single-recitation and unknown clips default to 1', () => {
    expect(getJapamAudioRepetitions('om-namah-shivaya')).toBe(1);
    expect(getJapamAudioRepetitions('does-not-exist')).toBe(1);
  });
});
