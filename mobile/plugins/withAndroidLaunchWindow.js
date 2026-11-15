const { AndroidConfig, withAndroidColors, withAndroidStyles, withMainActivity } = require('@expo/config-plugins');
const { mergeContents } = require('@expo/config-plugins/build/utils/generateCode');

/**
 * Android launch window: draw on the first traversal, in brand ivory.
 *
 * expo-splash-screen keeps its native splash by returning `false` from the
 * activity's OnPreDrawListener until JS calls `hide`. An undrawn window never
 * takes input focus, so a key press (Back) during that hold becomes a
 * user-perceived ANR after 5 s — Play's "Input dispatching timed out (No focused
 * window)" clusters (docs/engineering/android-anr-audit-2026-11.md §5). The hold
 * spanned process start, bundle evaluation and the first React commit, which JS
 * cannot shorten.
 *
 * 1. MainActivity flips SplashScreenManager's keep flag before the first draw,
 *    so the listener lets every draw through. Order-independent: `hide()` only
 *    clears a static flag that the listener reads at draw time.
 * 2. AppTheme's window background becomes the splash ivory, so the frames before
 *    React's LaunchCover (also ivory) are indistinguishable from the splash
 *    instead of the DayNight default (white, or near-black in system dark mode).
 *
 * Native: takes effect only in a new store build.
 */
const LAUNCH_WINDOW_COLOR_NAME = 'vedansh_launch_window';
const LAUNCH_WINDOW_COLOR = '#FFF1D5';
const TAG = 'vedansh-android-launch-window';

function addSplashRelease(src) {
  // Already present (prebuild without --clean re-runs mods on the same file).
  if (src.includes(`@generated begin ${TAG}`)) return src;
  return mergeContents({
    tag: TAG,
    src,
    newSrc:
      '    // Never veto the first draw: an undrawn window has no input focus (ANR).\n' +
      '    expo.modules.splashscreen.SplashScreenManager.hide()',
    anchor: /super\.onCreate\(/,
    offset: 0,
    comment: '//',
  }).contents;
}

function applyLaunchWindowColors(colors) {
  return AndroidConfig.Colors.assignColorValue(colors, {
    name: LAUNCH_WINDOW_COLOR_NAME,
    value: LAUNCH_WINDOW_COLOR,
  });
}

function applyLaunchWindowStyles(styles) {
  return AndroidConfig.Styles.assignStylesValue(styles, {
    add: true,
    parent: AndroidConfig.Styles.getAppThemeGroup(),
    name: 'android:windowBackground',
    value: `@color/${LAUNCH_WINDOW_COLOR_NAME}`,
  });
}

function withAndroidLaunchWindow(config) {
  config = withMainActivity(config, (cfg) => {
    if (cfg.modResults.language !== 'kt') {
      throw new Error('withAndroidLaunchWindow: expected a Kotlin MainActivity');
    }
    cfg.modResults.contents = addSplashRelease(cfg.modResults.contents);
    return cfg;
  });
  config = withAndroidColors(config, (cfg) => {
    cfg.modResults = applyLaunchWindowColors(cfg.modResults);
    return cfg;
  });
  return withAndroidStyles(config, (cfg) => {
    cfg.modResults = applyLaunchWindowStyles(cfg.modResults);
    return cfg;
  });
}

module.exports = withAndroidLaunchWindow;
module.exports.addSplashRelease = addSplashRelease;
module.exports.applyLaunchWindowColors = applyLaunchWindowColors;
module.exports.applyLaunchWindowStyles = applyLaunchWindowStyles;
module.exports.LAUNCH_WINDOW_COLOR = LAUNCH_WINDOW_COLOR;
