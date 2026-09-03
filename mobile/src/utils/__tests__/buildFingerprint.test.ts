/**
 * The build fingerprint. Its only job is to CHANGE whenever the running build
 * changes — nothing parses it, orders it, or shows it — so the tests are all of
 * the shape "these two builds must not produce the same string", plus the
 * dev-client cases where the expo modules return null or throw.
 *
 * `expo-updates` and `expo-constants` are untranspiled ESM that Jest cannot
 * parse, which is exactly why this read lives in its own module: mocking them
 * here costs one file, whereas importing them into the cache graph would have
 * forced a global mock for every suite that touches a panchang cache.
 */
// The mock factories below are hoisted above this import by
// babel-plugin-jest-hoist, so the module under test sees them.
import { currentBuildFingerprint } from '../buildFingerprint';

// `mock`-prefixed so babel-plugin-jest-hoist allows the hoisted factories below
// to reference them. Getters, not values, so a test can move the "build" between
// calls without re-requiring the module under test.
const mockUpdates: { updateId: unknown; runtimeVersion: unknown } = {
  updateId: null,
  runtimeVersion: null,
};
const mockConstants: { expoConfig: unknown } = { expoConfig: null };

jest.mock('expo-updates', () => ({
  get updateId() {
    return mockUpdates.updateId;
  },
  get runtimeVersion() {
    return mockUpdates.runtimeVersion;
  },
}));
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    get expoConfig() {
      return mockConstants.expoConfig;
    },
  },
}));

/** A released store build running its embedded bundle. */
const setBuild = (opts: {
  updateId?: string | null;
  version?: string;
  iosBuild?: string;
  androidVersionCode?: number;
}): void => {
  mockUpdates.updateId = opts.updateId ?? null;
  mockUpdates.runtimeVersion = opts.version ?? '1.4.7';
  mockConstants.expoConfig = {
    version: opts.version ?? '1.4.7',
    ios: opts.iosBuild === undefined ? undefined : { buildNumber: opts.iosBuild },
    android:
      opts.androidVersionCode === undefined ? undefined : { versionCode: opts.androidVersionCode },
  };
};

beforeEach(() => {
  mockUpdates.updateId = null;
  mockUpdates.runtimeVersion = null;
  mockConstants.expoConfig = null;
});

test('an OTA changes the fingerprint', () => {
  setBuild({ version: '1.4.7', iosBuild: '52' });
  const embedded = currentBuildFingerprint();

  setBuild({ version: '1.4.7', iosBuild: '52', updateId: 'a3f1-ota-1' });
  const afterOta = currentBuildFingerprint();

  expect(afterOta).not.toBe(embedded);
});

test('a second OTA changes it again', () => {
  setBuild({ version: '1.4.7', iosBuild: '52', updateId: 'a3f1-ota-1' });
  const first = currentBuildFingerprint();
  setBuild({ version: '1.4.7', iosBuild: '52', updateId: 'b7c2-ota-2' });

  expect(currentBuildFingerprint()).not.toBe(first);
});

test('rolling back from an OTA to the embedded bundle changes it', () => {
  setBuild({ version: '1.4.7', iosBuild: '52', updateId: 'a3f1-ota-1' });
  const onOta = currentBuildFingerprint();
  setBuild({ version: '1.4.7', iosBuild: '52' });

  // Right: the embedded bundle is a different build than the OTA, so cached
  // output from the OTA must not be trusted after a rollback.
  expect(currentBuildFingerprint()).not.toBe(onOta);
});

test('a store version bump changes it', () => {
  setBuild({ version: '1.4.7', iosBuild: '52' });
  const before = currentBuildFingerprint();
  setBuild({ version: '1.4.8', iosBuild: '53' });

  expect(currentBuildFingerprint()).not.toBe(before);
});

test('a rebuild of the SAME version changes it', () => {
  // The case `runtimeVersion` alone misses: policy `appVersion` gives build 52
  // and 53 of 1.4.7 the same runtime version, and both run an embedded bundle,
  // so without the build number an internal rebuild would look identical.
  setBuild({ version: '1.4.7', iosBuild: '52' });
  const build52 = currentBuildFingerprint();
  setBuild({ version: '1.4.7', iosBuild: '53' });

  expect(currentBuildFingerprint()).not.toBe(build52);
});

test('an Android versionCode bump changes it', () => {
  setBuild({ version: '1.4.7', androidVersionCode: 9 });
  const nine = currentBuildFingerprint();
  setBuild({ version: '1.4.7', androidVersionCode: 10 });

  expect(currentBuildFingerprint()).not.toBe(nine);
});

test('the same build twice is stable — no spurious sweep on every launch', () => {
  setBuild({ version: '1.4.7', iosBuild: '52', updateId: 'a3f1-ota-1' });

  expect(currentBuildFingerprint()).toBe(currentBuildFingerprint());
});

test('a dev client with everything null still yields a stable string', () => {
  // Expo Go / dev builds report no update and often no config. The fingerprint
  // must not be empty (it is compared against a stored value) and must not vary
  // between reads, or every dev reload would sweep.
  const first = currentBuildFingerprint();

  expect(first).toBe('embedded|no-runtime|no-version|no-build');
  expect(currentBuildFingerprint()).toBe(first);
});

test('a module that throws on access degrades instead of breaking startup', () => {
  Object.defineProperty(mockUpdates, 'updateId', {
    configurable: true,
    get() {
      throw new Error('updates unavailable in this client');
    },
  });

  expect(() => currentBuildFingerprint()).not.toThrow();
  expect(currentBuildFingerprint()).toContain('embedded');

  Object.defineProperty(mockUpdates, 'updateId', { configurable: true, value: null, writable: true });
});
