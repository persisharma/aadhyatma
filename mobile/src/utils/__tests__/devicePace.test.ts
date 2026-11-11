import {
  CONSTRAINED_BUNDLE_EVALUATION_MS,
  bundleEvaluationTime,
  isConstrainedDevice,
  markBundleEvaluated,
  setBundleEvaluationTimeForTests,
} from '../devicePace';

afterEach(() => { setBundleEvaluationTimeForTests(null); jest.restoreAllMocks(); });

/** A fresh copy of the module whose stopwatch reads `startedAt`, then `evaluatedAt`. */
function launch(startedAt: number, evaluatedAt: number) {
  const clock = jest.spyOn(globalThis.performance, 'now').mockReturnValueOnce(startedAt).mockReturnValue(evaluatedAt);
  let pace!: typeof import('../devicePace');
  jest.isolateModules(() => { pace = require('../devicePace'); });
  pace.markBundleEvaluated();
  clock.mockRestore();
  return pace;
}

test('an unmeasured launch is never treated as constrained', () => {
  expect(bundleEvaluationTime()).toBeNull();
  expect(isConstrainedDevice()).toBe(false);
});

test('the reading is the time from the module’s own evaluation to the mark', () => {
  const pace = launch(120, 120 + 345);
  expect(pace.bundleEvaluationTime()).toBe(345);
  expect(pace.isConstrainedDevice()).toBe(false);
});

test('a launch graph that took the threshold or longer marks the phone constrained', () => {
  expect(launch(0, CONSTRAINED_BUNDLE_EVALUATION_MS - 1).isConstrainedDevice()).toBe(false);
  expect(launch(0, CONSTRAINED_BUNDLE_EVALUATION_MS).isConstrainedDevice()).toBe(true);
  expect(launch(0, 2400).isConstrainedDevice()).toBe(true);
});

test('only the first mark counts: later work cannot reclassify the launch', () => {
  const pace = launch(0, 300);
  jest.spyOn(globalThis.performance, 'now').mockReturnValue(9000);
  pace.markBundleEvaluated();
  expect(pace.bundleEvaluationTime()).toBe(300);
  expect(pace.isConstrainedDevice()).toBe(false);
});

test('the module shares state with every importer of the same instance', () => {
  setBundleEvaluationTimeForTests(CONSTRAINED_BUNDLE_EVALUATION_MS + 1);
  expect(isConstrainedDevice()).toBe(true);
  markBundleEvaluated();
  expect(bundleEvaluationTime()).toBe(CONSTRAINED_BUNDLE_EVALUATION_MS + 1);
});
