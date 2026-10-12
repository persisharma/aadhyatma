import { TurboModuleRegistry } from 'react-native';

/**
 * Multi-image share (PRD-45 Phase 2, design.md §39.6) — every page of a series handed
 * to the OS share sheet in one go, so WhatsApp receives an album and the iOS sheet
 * offers "Save N Images" (then Instagram → + → Select multiple builds the carousel).
 *
 * Neither share path the app already had can do this: RN `Share.share` takes one `url`
 * and `expo-sharing` one file. `react-native-share`'s `open({ urls })` can, but it is a
 * native module — a store build. So it is **probed and lazily required**, the same
 * stale-binary honesty as expo-sensors in `vastu/useCompassHeading.ts`: its codegen spec
 * calls `TurboModuleRegistry.getEnforcing('RNShare')` at import time, which throws on a
 * binary that predates it. An OTA landing on such a binary keeps the all-pages rows
 * visible but disabled ("needs the latest app update") instead of crashing.
 *
 * Why not `expo-media-library` for the Photos save: on Android 13+ its save path requires
 * the READ_MEDIA_IMAGES grant, which Google Play has required a core-use justification
 * for since May 2025. The share sheet's own save actions need no permission from us on
 * Android and only the add-only `NSPhotoLibraryAddUsageDescription` on iOS.
 */

type RNShareModule = {
  open: (options: {
    urls: string[];
    type?: string;
    message?: string;
    title?: string;
    subject?: string;
    failOnCancel?: boolean;
  }) => Promise<unknown>;
};

let cached: RNShareModule | null | undefined;

function load(): RNShareModule | null {
  if (cached !== undefined) return cached;
  try {
    if (!TurboModuleRegistry.get('RNShare')) {
      cached = null;
      return cached;
    }
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('react-native-share') as { default?: RNShareModule } & RNShareModule;
    cached = (mod.default ?? mod) as RNShareModule;
  } catch {
    cached = null;
  }
  return cached;
}

/** True when this binary can hand several images to the share sheet at once. */
export function isMultiShareAvailable(): boolean {
  return load() !== null;
}

/**
 * Open the OS share sheet with every file. Resolves `false` when the module is absent;
 * a dismissal resolves normally (`failOnCancel: false`).
 */
export async function shareFiles(
  urls: string[],
  opts: { message?: string; title?: string } = {}
): Promise<boolean> {
  const mod = load();
  if (!mod || urls.length === 0) return false;
  await mod.open({
    urls,
    type: 'image/png',
    message: opts.message,
    title: opts.title,
    subject: opts.title,
    failOnCancel: false,
  });
  return true;
}

/** Test hook: forget the probe result. */
export function __resetMultiShareForTests(): void {
  cached = undefined;
}
