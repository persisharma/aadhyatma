import React from 'react';
import { Platform, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { lightColors } from '@/theme/colors';
import { launchMarkOnce } from '@/utils/launchTrace';

let released = false;

/**
 * Android only: hand the window from the native splash to the JS launch cover as
 * soon as that cover has laid out.
 *
 * expo-splash-screen holds the native splash by returning `false` from the
 * activity's `OnPreDrawListener`, so the activity window is never drawn and
 * never takes input focus. A key event during that hold (Back is the usual one)
 * waits for a focused window, and after 5 s Android raises a user-perceived ANR
 * ("Application does not have a focused window"). The hold used to cover fonts,
 * preference hydration and the particle WebView's Chromium start-up, which only
 * the 7 s reveal watchdog bounded.
 *
 * The cover paints the native splash colour (`#FFF1D5`, pinned by
 * BrandNativeHandoff.test), so the handoff cannot be seen. Home stays hidden
 * behind it until the same hydration and brand-readiness conditions as before.
 * iOS keeps the native hold: it has no ANR and its approved launch is unchanged.
 */
export function releaseNativeSplashForCover(): void {
  if (Platform.OS !== 'android' || released) return;
  released = true;
  launchMarkOnce('native-splash-released (android cover)');
  SplashScreen.hideAsync().catch(() => {
    // Let the next cover layout retry rather than leave the window undrawn.
    released = false;
  });
}

/** Blank brand-ivory launch frame shown while fonts and layout-critical preferences load. */
export default function LaunchCover() {
  return (
    <View
      testID="launch-cover"
      style={{ flex: 1, backgroundColor: lightColors.brandIvory }}
      onLayout={releaseNativeSplashForCover}
    />
  );
}

export function __resetLaunchCoverForTests(): void {
  released = false;
}
