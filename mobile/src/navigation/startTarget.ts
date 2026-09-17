import type { InitialState } from '@react-navigation/native';
import { setPanchangSection } from './panchangSectionStore';
import type { PanchangSection, TabParamList } from './types';
import type { EntryPoint } from '@/analytics/events';

/**
 * The route each stack tab keeps as its root. A cold-start target aimed deeper
 * than the root is seeded with the root beneath it, so back always has
 * somewhere to go and the stack's own hub stays reachable.
 */
const STACK_ROOTS: Partial<Record<keyof TabParamList, string>> = {
  HomeTab: 'Home',
  PanchangTab: 'PanchangHome',
  MoreTab: 'MoreHome',
};

/**
 * A validated launch destination: the tab to open, optionally a screen inside
 * that tab's stack, and that screen's params.
 *
 * Two launch sources produce one — a Home/Lock Screen widget URL
 * (`widgets/deepLink.ts`) and the notification tap that launched the app
 * (`notifications/deepLink.ts`) — and one target serves both timings:
 *
 *  - **Cold start**: `buildInitialNavigationState` turns it into the
 *    `NavigationContainer`'s `initialState`, so the named screen is the FIRST
 *    one committed. This is why Home no longer mounts as an intermediate step
 *    on a tap that named something else.
 *  - **Warm tap**: `startTargetToNavigateAction` turns it into the
 *    `CommonActions.navigate` payload the live handlers dispatch.
 *
 * Deliberately NOT expressed as a tab's `initialParams`: those stay in
 * `route.params` for the life of the session, so React Navigation re-consumes
 * the nested `{ screen, params }` every time that tab is focused again and
 * pushes the target a second, third, fourth time. On the Panchang tab — whose
 * root is the heaviest screen in the app — that grew the stack on every tab
 * switch until the app froze (the Sept 2026 "widget tap gets stuck" report).
 * `initialState` is consumed exactly once, at mount.
 */
export type StartTarget = {
  tab: keyof TabParamList;
  /** A screen in that tab's stack. Omitted when the tab itself is the destination. */
  screen?: string;
  params?: object;
  /**
   * Which section the shared पंचांग/व्रत/ज्योतिष screen should be on. Set by
   * `PanchangTab` targets only.
   *
   * A vrat reminder still opens the specific `ObservanceDetail` it was armed
   * for — that is the useful destination, and flattening it to a section list
   * would throw away the one thing the notification knew. This field is the
   * layer UNDERNEATH: it makes `PanchangHome` mount on व्रत, so backing out of
   * the observance lands on व्रत rather than dumping the user on the calendar
   * they never asked for. `applyStartTargetSection` also writes it to the
   * section store, so the bottom-nav highlight is right on the first frame.
   */
  section?: PanchangSection;
};

/** The `NavigationContainer` `initialState` a cold start should mount with. */
export function buildInitialNavigationState(target: StartTarget): InitialState {
  const { tab, screen, params } = target;
  if (!screen) return { index: 0, routes: [{ name: tab, params }] };

  const root = STACK_ROOTS[tab];
  const rootParams = target.section ? { section: target.section } : undefined;
  const routes =
    root == null || screen === root
      ? [{ name: screen, params }]
      : [{ name: root, params: rootParams }, { name: screen, params }];

  return {
    index: 0,
    routes: [{ name: tab, state: { index: routes.length - 1, routes } }],
  };
}

/**
 * The `CommonActions.navigate` payload for the same target, used by the warm
 * handlers. `initial: false` is unconditional for a nested target — the
 * `panchangTabTarget` / `moreTabTarget` rule (see `entryRoutes.ts`): a lazily
 * mounted tab must not adopt the target as its stack root.
 */
export function startTargetToNavigateAction(target: StartTarget): {
  name: keyof TabParamList;
  params?: object;
} {
  const { tab, screen, params } = target;
  if (!screen) return { name: tab, params };
  return { name: tab, params: { screen, params, initial: false } };
}

/**
 * Write the target's section into the section store, so the bottom-nav
 * highlight and the segment control agree from the first frame — including on a
 * cold start, where `PanchangScreen` has not mounted yet and so cannot write it
 * itself.
 *
 * Called by both launch sources with their own attribution: a notification tap
 * passes `'notification'`, a widget or other in-app link passes `'deeplink'`.
 * Keeping the entry point at the CALL SITE is what makes those two
 * distinguishable in the log a month later (handover §5); resolving it inside
 * the store would collapse them.
 */
export function applyStartTargetSection(target: StartTarget, entryPoint: EntryPoint): void {
  if (!target.section) return;
  setPanchangSection(target.section, entryPoint);
}
