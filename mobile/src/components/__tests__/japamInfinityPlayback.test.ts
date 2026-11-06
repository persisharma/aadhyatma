import assert from 'node:assert/strict';
import { startInfinityMotion } from '../japamInfinityPlayback';

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

test('one start continues across many full cycles without extra taps', () => {
  const d = driver();
  const stop = startInfinityMotion(d.motion);
  for (let i = 0; i < 20; i++) d.callbacks[i](true);
  assert.equal(d.durations.length, 21);
  assert.ok(d.durations.every(ms => ms === 800));
  stop();
  assert.equal(d.stops, 1);
  assert.equal(d.nativeStops, 1);
});

test('stop freezes the marker and late completion cannot restart it', () => {
  const d = driver(.25);
  const stop = startInfinityMotion(d.motion);
  assert.equal(d.durations[0], 600);
  stop(); d.callbacks[0](true);
  assert.equal(d.durations.length, 1);
  assert.deepEqual(d.resets, []);
});

test('a later start resumes the paused fraction and then full 800ms cycles', () => {
  const d = driver(.625);
  const stop = startInfinityMotion(d.motion);
  assert.equal(d.durations[0], 300);
  d.callbacks[0](true);
  assert.deepEqual(d.durations, [300, 800]);
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
  assert.deepEqual(d.durations, [800]);
  assert.deepEqual(d.resets, [0]);
  stop();
});
