/**
 * "Answers that act" (PRD-41 Phase 3): turn an `AskTarget` into navigation
 * through the helpers every other cross-tab door already uses, so a Home-stack
 * push stays in place (back retraces the question) and a Panchang / More jump
 * carries `initial: false` (the lazily-mounted-tab rule in entryRoutes.ts).
 *
 * Kept free of the engine so it may sit on the launch graph with the screens
 * that import it (see `launchPath.test.ts` ALLOWED).
 */
import { moreTabTarget, navigateToHomeStackTarget, panchangTabTarget } from '@/navigation/entryRoutes';
import type { AskTarget } from './types';

export type AskNav = {
  navigate: (name: string, params?: object) => void;
  getState?: () => { routeNames?: readonly string[] } | undefined;
  getParent?: () => AskNav | undefined;
};

export function navigateAskTarget(nav: AskNav, target: AskTarget): void {
  if (target.tab === 'home') {
    navigateToHomeStackTarget(nav, { screen: target.screen, params: target.params });
    return;
  }
  // Sibling tabs: dispatch through the parent (tab) navigator when we have one,
  // exactly as the Today strip and recommendations row do.
  const tabNav = nav.getParent?.() ?? nav;
  if (target.tab === 'panchang') {
    tabNav.navigate('PanchangTab', panchangTabTarget(target.screen as never, target.params as never));
    return;
  }
  tabNav.navigate('MoreTab', moreTabTarget(target.screen as never, target.params as never));
}
