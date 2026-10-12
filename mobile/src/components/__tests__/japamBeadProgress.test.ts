import {
  advanceBeadProgress,
  INITIAL_BEAD_PROGRESS,
  type BeadProgress,
  type BeadTick,
} from '@/components/japamBeadProgress';
import { getJapamAudioRepetitions } from '@assets/japam-audio';

/**
 * Drive the reducer through a sequence of ticks and return the total beads
 * emitted plus the final state — mirrors how JapamAudioPlayer feeds it wall-
 * clock ticks on a fixed interval.
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

/**
 * Simulate `durationMs` of steady playback sampled every `stepMs`, as a fixed-
 * interval wall clock would deliver it. The first tick seeds the clock and
 * contributes no play time (there's no prior tick to measure from).
 */
function playFor(
  durationMs: number,
  opts: {
    duration: number;
    repetitions: number;
    rate?: number;
    stepMs?: number;
    startNow?: number;
  }
): BeadTick[] {
  const { duration, repetitions, rate = 1, stepMs = 250, startNow = 1_000 } = opts;
  const ticks: BeadTick[] = [];
  for (let t = 0; t <= durationMs; t += stepMs) {
    ticks.push({ nowMs: startNow + t, duration, repetitions, rate, playing: true });
  }
  return ticks;
}

describe('advanceBeadProgress', () => {
  test('single-recitation clip registers one bead per loop-length of play', () => {
    // A 6 s single-recitation clip: five loops = 30 s of play = 5 beads.
    const { total } = run(playFor(30_000, { duration: 6, repetitions: 1 }));
    expect(total).toBe(5);
  });

  test('a musical rendition registers `repetitions` beads per full playback', () => {
    expect(run(playFor(480_000, { duration: 480, repetitions: 16, stepMs: 1000 })).total).toBe(16);
    // Three loops of a 193 s, 6-rep clip → 18 beads.
    expect(run(playFor(193_000 * 3, { duration: 193, repetitions: 6, stepMs: 1000 })).total).toBe(18);
  });

  test('beads are spread across the clip, not dumped at the wrap', () => {
    // Halfway through a 6-rep, 192 s clip (96 s of play) → ~3 beads.
    const { total } = run(playFor(96_000, { duration: 192, repetitions: 6, stepMs: 1000 }));
    expect(total).toBe(3);
  });

  test('tempo scales the counting: faster play accrues beads sooner', () => {
    // At 2× tempo, 15 s of wall time plays 30 s of a 6 s clip → 5 beads.
    const { total } = run(playFor(15_000, { duration: 6, repetitions: 1, rate: 2 }));
    expect(total).toBe(5);
  });

  test('it never stalls: continuous play keeps counting well past the first loop', () => {
    // The regression this fixes: with the old position-wrap reducer, a device
    // that didn't emit a backward jump froze at one bead. Wall-clock keeps going.
    const { total } = run(playFor(60_000, { duration: 6, repetitions: 1, stepMs: 250 }));
    expect(total).toBe(10);
    expect(total).toBeGreaterThan(1);
  });

  test('a long gap (paused / backgrounded) does not dump a burst of beads', () => {
    const base = { duration: 6, repetitions: 1, rate: 1, playing: true as const };
    const ticks: BeadTick[] = [
      { nowMs: 1_000, ...base }, // seed
      { nowMs: 1_250, ...base }, // +250 ms of play
      { nowMs: 61_250, ...base }, // 60 s wall gap — NOT counted as play time
      { nowMs: 61_500, ...base }, // +250 ms of play
    ];
    expect(run(ticks).total).toBe(0);
  });

  test('a single tick (no prior clock) registers nothing', () => {
    expect(
      run([{ nowMs: 1_000, duration: 6, repetitions: 1, rate: 1, playing: true }]).total
    ).toBe(0);
  });

  test('paused playback and unknown duration register nothing', () => {
    expect(
      run([
        { nowMs: 1_000, duration: 6, repetitions: 1, rate: 1, playing: false },
        { nowMs: 1_250, duration: 6, repetitions: 1, rate: 1, playing: false },
      ]).total
    ).toBe(0);
    expect(
      run([
        { nowMs: 1_000, duration: 0, repetitions: 1, rate: 1, playing: true },
        { nowMs: 1_250, duration: 0, repetitions: 1, rate: 1, playing: true },
      ]).total
    ).toBe(0);
  });

  test('a mid-session pause contributes nothing while stopped', () => {
    // The player's interval keeps ticking (every 1 s here) whether or not audio
    // is playing, so a pause is a run of `playing: false` ticks, not a gap.
    const d = { duration: 6, repetitions: 1, rate: 1 };
    const ticks: BeadTick[] = [];
    let now = 1_000;
    const push = (secs: number, playing: boolean) => {
      for (let i = 0; i < secs; i++) {
        ticks.push({ nowMs: now, ...d, playing });
        now += 1_000;
      }
    };
    push(7, true); // seed + 6 s of play → 1 bead
    push(10, false); // paused — nothing accrues
    push(7, true); // 6 s more of play → 1 more bead
    expect(run(ticks).total).toBe(2);
  });
});

describe('getJapamAudioRepetitions', () => {
  test('musical renditions declare their repetition count', () => {
    expect(getJapamAudioRepetitions('hare-krishna-mahamantra')).toBe(4);
    expect(getJapamAudioRepetitions('gayatri-mantra')).toBe(6);
  });

  test('single-recitation and unknown clips default to 1', () => {
    expect(getJapamAudioRepetitions('om-namah-shivaya')).toBe(1);
    expect(getJapamAudioRepetitions('does-not-exist')).toBe(1);
  });
});
