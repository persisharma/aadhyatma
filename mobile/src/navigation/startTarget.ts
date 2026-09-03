import type { TabParamList } from './types';

/**
 * A validated cold-start destination: the tab `TabNavigator` should commit as
 * its INITIAL route, plus that tab's initial params (for the stack tabs, the
 * nested `{ screen, params, initial: false }` shape the tab's stack applies on
 * its first mount).
 *
 * Two launch sources produce one — a Home/Lock Screen widget URL
 * (`widgets/deepLink.ts`) and the notification tap that launched the app
 * (`notifications/deepLink.ts`) — and both are resolved in `App.tsx` BEFORE
 * `NavigationContainer` mounts. That ordering is the whole point: a target
 * dispatched after mount commits the default Home route first, Home pays its
 * full mount cost, and only then does the redirect land — the user watches the
 * homepage flash by on a tap that named a different screen. The same object is
 * also what the warm-tap handlers dispatch, so cold and warm taps cannot drift.
 */
export type StartTarget = {
  [K in keyof TabParamList]: { name: K; params?: TabParamList[K] };
}[keyof TabParamList];
