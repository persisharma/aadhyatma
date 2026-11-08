import assert from 'node:assert/strict';
import { INFINITY_CYCLE_MS, japaAutoCountSource, startInfinityMotion } from '../japamInfinityPlayback';

function driver(phase = 0) {
  const callbacks: ((finished: boolean) => void)[] = [];
  const durations: number[] = [];
  const resets: number[] = [];
  let stops = 0;
  let nativeStops = 0;
  const motion = {
    readPhase: (cb: (p: number) => void) => cb(phase),
    setPhase: (p: number) => { resets.push(p); },
    animate: (duration: number, cb: (finished: boolean) => void) => {
      durations.push(duration); callbacks.push(cb); return { stop: () => { stops++; } };
    },
    stopPhase: () => { nativeStops++; },
  };
  return { motion, callbacks, durations, resets, get stops() { return stops; }, get nativeStops() { return nativeStops; } };
}

test('short-name fallback is 1380ms', () => {
  assert.equal(INFINITY_CYCLE_MS, 1380);
});

test('one start continues across many full cycles without extra taps', () => {
  const d = driver();
  const stop = startInfinityMotion(d.motion);
  for (let i = 0; i < 20; i++) d.callbacks[i](true);
  assert.equal(d.durations.length, 21);
  assert.ok(d.durations.every(ms => ms === INFINITY_CYCLE_MS));
  stop();
  assert.equal(d.stops, 1);
  assert.equal(d.nativeStops, 1);
});

test('stop freezes the marker and late completion cannot restart it', () => {
  const d = driver(.25);
  const stop = startInfinityMotion(d.motion);
  assert.equal(d.durations[0], 1035);
  stop(); d.callbacks[0](true);
  assert.equal(d.durations.length, 1);
  assert.deepEqual(d.resets, []);
});

test('a later start resumes the paused fraction and then full 1380ms cycles', () => {
  const d = driver(.625);
  const stop = startInfinityMotion(d.motion);
  assert.equal(d.durations[0], 518);
  d.callbacks[0](true);
  assert.deepEqual(d.durations, [518, 1380]);
  stop();
});

test('stopping before the native phase read returns cannot start motion', () => {
  const d = driver();
  let resolve!: (p: number) => void;
  d.motion.readPhase = cb => { resolve = cb; };
  const stop = startInfinityMotion(d.motion);
  stop(); resolve(.5);
  assert.equal(d.durations.length, 0);
});

test('a cancelled native cycle does not repeat', () => {
  const d = driver();
  const stop = startInfinityMotion(d.motion);
  d.callbacks[0](false);
  assert.equal(d.durations.length, 1);
  stop();
});

test('the shared crossing resumes as a full loop', () => {
  const d = driver(1);
  const stop = startInfinityMotion(d.motion);
  assert.deepEqual(d.durations, [1380]);
  assert.deepEqual(d.resets, [0]);
  stop();
});

test('only completed live cycles count, exactly once per cycle', () => {
  const d = driver();
  let count = 0;
  const stop = startInfinityMotion({ ...d.motion, onCycle: () => { count++; } });
  assert.equal(count, 0);
  d.callbacks[0](true); d.callbacks[0](true);
  assert.equal(count, 1);
  assert.equal(d.durations.length, 2);
  stop(); d.callbacks[1](true);
  assert.equal(count, 1);
});

test('cancelled cycles and stale success callbacks never count', () => {
  const d = driver();
  let count = 0;
  const stop = startInfinityMotion({ ...d.motion, onCycle: () => { count++; } });
  d.callbacks[0](false); d.callbacks[0](true);
  assert.equal(count, 0);
  stop();
});

test('one count source is selected across audio, silent loops and pause', () => {
  assert.equal(japaAutoCountSource('infinity', true, false), 'motion');
  assert.equal(japaAutoCountSource('infinity', true, true), 'audio');
  assert.equal(japaAutoCountSource('infinity', false, true), 'none');
  assert.equal(japaAutoCountSource('infinity', false, false), 'none');
  assert.equal(japaAutoCountSource('mala', false, true), 'audio');
  assert.equal(japaAutoCountSource('mala', false, false), 'none');
});


test('ten thousand completed cycles keep one active animation and reject duplicate or stopped callbacks', () => {
  let current: (finished: boolean) => void = () => { throw new Error('not started'); };
  let active = 0;
  let maximum = 0;
  let count = 0;
  const stop = startInfinityMotion({
    readPhase: callback => callback(0),
    setPhase: () => {},
    stopPhase: () => {},
    onCycle: () => { count++; },
    animate: (_duration, callback) => {
      active++;
      maximum = Math.max(maximum, active);
      current = callback;
      return { stop: () => { active--; } };
    },
  });
  for (let i = 0; i < 10000; i++) {
    const completed = current;
    active--; // The native animation has completed before invoking JS.
    completed(true);
    completed(true); // Duplicate completion must not spawn another animation.
    assert.equal(active, 1);
  }
  assert.equal(count, 10000);
  assert.equal(maximum, 1);
  const late = current;
  stop();
  late(true);
  assert.equal(active, 0);
  assert.equal(count, 10000);
});


test('mantra-specific cadence applies to partial resume and every subsequent full utterance', () => {
  const d = driver(0.25);
  const stop = startInfinityMotion(d.motion, 10200);
  assert.deepEqual(d.durations, [7650]);
  d.callbacks[0](true);
  assert.deepEqual(d.durations, [7650, 10200]);
  stop();
});
