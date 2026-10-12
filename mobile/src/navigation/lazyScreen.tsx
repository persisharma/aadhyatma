import React, { Suspense, use, type ComponentType, type FunctionComponent } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
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
  // The resolved screen, captured SYNCHRONOUSLY the moment its module arrives.
  let Resolved: ComponentType<P> | null = null;

  const load = () =>
    (loading ??= loader().then(
      (mod) => {
        Resolved = mod.default;
        return mod;
      },
      (error: unknown) => {
        // Forget a failed load so the next render (StackLoadBoundary's Retry,
        // or simply navigating back in) tries again instead of re-throwing a
        // cached rejection forever.
        loading = null;
        throw error;
      },
    ));

  registerPrefetch({ label, depth, load });

  /**
   * WHY NOT `React.lazy`. It records that its promise resolved inside a `.then`
   * callback, i.e. asynchronously — so on its FIRST render it always suspends,
   * even when the module was warmed seconds ago. Every first tap painted the
   * spinner for a frame, which silently defeated the whole background warm-up.
   *
   * `Body` checks `Resolved` first, so a warmed screen renders synchronously and
   * the fallback never commits. Only a genuinely cold screen reaches `use()`,
   * which suspends until the module arrives. Both paths render the same tree —
   * Suspense > Body > Screen — so a screen that mounted cold is never remounted
   * (and never loses its state) when it later becomes warm.
   */
  function Body(props: P) {
    const Screen = Resolved ?? use(load()).default;
    return <Screen {...props} />;
  }

  function LazyRouteScreen(props: P) {
    return (
      <Suspense fallback={<ScreenLoadFallback />}>
        <Body {...props} />
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
  const { lang } = useGitaLanguage();
  return (
    <View
      // Announced, so a screen-reader user who beats the warm-up hears that the
      // screen is on its way rather than silence (StackLoadBoundary does the same).
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={contentByLang(lang, 'खुल रहा है', 'Opening')}
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
