/**
 * Copy text to the clipboard.
 *
 * React Native's own `Clipboard` is deprecated and is removed in a later
 * release (on the path to Expo SDK 58), so store builds from 1.5.7 carry
 * `expo-clipboard`. That is a native module, so it is PROBED and lazily
 * required — the same stale-binary honesty as `suvicharPhoto.ts`: this file also
 * ships by OTA to binaries that predate the module (1.5.6 and earlier), and
 * there it keeps using the React Native API instead of crashing.
 *
 * Both `require`s sit inside the function on purpose: the probe is only needed
 * when someone copies something, and these packages are untranspiled ESM that
 * must not join the import graph of every screen that can share.
 */
import { Clipboard as LegacyClipboard } from 'react-native';

type ExpoClipboard = { setStringAsync: (text: string) => Promise<boolean> };

let cached: ExpoClipboard | null | undefined;

function expoClipboard(): ExpoClipboard | null {
  if (cached !== undefined) return cached;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { requireOptionalNativeModule } = require('expo-modules-core') as typeof import('expo-modules-core');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cached = requireOptionalNativeModule('ExpoClipboard') ? (require('expo-clipboard') as ExpoClipboard) : null;
  } catch {
    cached = null;
  }
  return cached;
}

/** Best-effort copy: never throws, and a failed copy is not worth interrupting a share for. */
export function copyToClipboard(text: string): void {
  const modern = expoClipboard();
  if (modern) {
    modern.setStringAsync(text).catch(() => undefined);
    return;
  }
  try {
    LegacyClipboard.setString(text);
  } catch {
    /* no clipboard on this binary */
  }
}

/** Test-only: forget the probed module so each case starts cold. */
export function __resetClipboardForTests(): void {
  cached = undefined;
}
