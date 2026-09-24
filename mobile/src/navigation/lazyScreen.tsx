import React, { lazy, Suspense, type ComponentType, type FunctionComponent } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { registerPrefetch } from './screenPrefetch';

/**
 * Put a route behind a dynamic boundary and enrol it in the background warm-up.
 *
 * This generalises what `lazyPanchangStack` does for the Panchang tab: ONE
 * shared promise per screen, so the background walk in `screenPrefetch` and a
 * user's tap read the same evaluation instead of racing two of them. By the
 * time a tap arrives the module is usually already warm and the `Suspense`
 * fallback below never paints.
 *
 * `depth` is the screen's navigation distance from Home — Home is 1, whatever
 * Home opens is 2, whatever those open is 3. It decides warm-up order only; it
 * has no effect on rendering, so an approximate value degrades gracefully into
 * "warmed a little later" rather than anything a user would see.
 */
export function lazyScreen<P extends object>(
  label: string,
  depth: number,
  loader: () => Promise<{ default: ComponentType<P> }>,
): FunctionComponent<P> {
  let loading: Promise<{ default: ComponentType<P> }> | null = null;
  const load = () => (loading ??= loader());

  registerPrefetch({ label, depth, load });

  const Loaded = lazy(load);

  function LazyRouteScreen(props: P) {
    return (
      <Suspense fallback={<ScreenLoadFallback />}>
        <Loaded {...props} />
      </Suspense>
    );
  }
  LazyRouteScreen.displayName = `LazyScreen(${label})`;
  return LazyRouteScreen;
}

/**
 * Shown only when a tap beats the warm-up. Parchment-backed rather than the
 * default transparent, so a slow chunk reads as the app thinking instead of a
 * white flash against the theme.
 */
function ScreenLoadFallback() {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.parchment,
      }}
    >
      <ActivityIndicator color={colors.saffron} />
    </View>
  );
}

/**
 * The same enrolment for a route that already uses react-navigation's own
 * `getComponent={() => require(...)}` lazy form (the More tab was written this
 * way before `lazyScreen` existed). Those routes were already off the launch
 * path but stayed cold until the first tap; registering them here means the
 * background walk warms them like every other screen, and `getComponent`'s
 * `require` then hits Metro's module cache instead of evaluating on the tap.
 *
 * Returns the loader unchanged, so it drops straight into `getComponent`.
 */
export function prefetchedRoute<T>(
  label: string,
  depth: number,
  require_: () => T,
): () => T {
  registerPrefetch({ label, depth, load: async () => require_() });
  return require_;
}
