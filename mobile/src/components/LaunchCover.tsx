import React from 'react';
import { Platform, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { lightColors } from '@/theme/colors';
import { launchMarkOnce } from '@/utils/launchTrace';

let released = false;

/**
 * Android only: hand the window from the native splash to the JS launch cover as
 * soon as that cover has laid out.
 *
 * expo-splash-screen holds the native splash by returning `false` from the
 * activity's `OnPreDrawListener`, so the activity window is never drawn and never
 * takes input focus. A key event during that hold (Back is the usual one) waits
 * for a focused window, and after 5 s Android raises a user-perceived ANR. Play's
 * Android vitals ANR clusters (8 Nov 2026) are almost all titled "Input dispatching
 * timed out (No focused window)" — with the main thread anywhere from idle
 * (`nativePollOnce`) to font/text mounting — which is this hold, not the code in
 * those stacks (docs/engineering/android-anr-audit-2026-11.md §5).
 *
 * The hold used to cover all 15 runtime fonts, the start-target race and the
 * font-size/language hydration. The cover paints the native splash colour
 * (`#FFF1D5`, pinned by BrandNativeHandoff.test), so the handoff cannot be seen,
 * and Home stays behind it until the same hydration conditions as before. iOS keeps
 * the native hold: it has no ANR and its approved launch is unchanged.
 *
 * Builds made with `plugins/withAndroidLaunchWindow.js` never veto the first draw
 * at all; this JS release is what reaches binaries already in the store via OTA.
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
    >
      {/* Visible on Android now: keep dark status-bar icons on the ivory field,
          as the app's own root StatusBar does once it mounts. */}
      <StatusBar style="dark" />
    </View>
  );
}

export function __resetLaunchCoverForTests(): void {
  released = false;
}
