/**
 * The active section of the shared पंचांग / व्रत / ज्योतिष screen.
 *
 * THE SYNC RULE (handover §3): the active segment is the single source of
 * truth, and the bottom-nav highlight MIRRORS it. Tapping व्रत in the segment
 * control moves the bottom highlight to व्रत; tapping the व्रत tab selects the
 * व्रत segment. A bottom bar reading पंचांग while vrat content is on screen is
 * the nav reporting the wrong location — the specific thing that makes this
 * pattern feel broken — so there is exactly ONE piece of state, held here,
 * above both the tab bar and the screen.
 *
 * Why a MODULE STORE rather than a React context: one of the four writers is
 * not a component. A notification tap is resolved in `notifications/deepLink`
 * through `navigationRef`, outside the React tree entirely, and it is the
 * writer that has to attribute `entry_point: 'notification'`. Behind a context
 * it could not write at all, and the notification path would have to be logged
 * as a generic deep link — which is precisely the distinction §5 exists to
 * measure. So this follows the shape the app already uses for state that
 * non-React code must write (`birthProfileStore` ⇄ `useBirthProfileRoster`):
 * snapshot + subscribe here, a thin hook in `contexts/PanchangSectionContext`.
 *
 * Why not three tab routes: पंचांग, व्रत and ज्योतिष are three entry points into
 * ONE screen. Three `Tab.Screen`s would mount three copies of `PanchangScreen`
 * — three Hindu-calendar solves, three independent selected dates, so a segment
 * switch would silently reset the date — and the Jyotish copy would drag the
 * Kundali graph in behind it. See `AppTabBar`.
 *
 * Every write goes through `setPanchangSection`, which is also the ONE place a
 * shared-screen view is logged, so `entry_point` cannot drift from what
 * actually happened. Module state resets with the process, which is exactly the
 * "reset on cold start" the handover asks for — do not persist it.
 */
import { logSharedScreenView } from '@/analytics/analyticsStore';
import type { AnalyticsSection, EntryPoint } from '@/analytics/events';
import type { PanchangSection } from './types';

/**
 * `types.ts` owns the route-param vocabulary and `analytics/events` owns the
 * logged vocabulary; they are declared separately so the analytics layer
 * carries no navigation dependency. These two assignments fail to compile if
 * the two ever drift apart, which is the only thing keeping a month of logged
 * `section` values readable against the routes that produced them.
 */
const _sectionIsAnalyticsSection: AnalyticsSection = null as unknown as PanchangSection;
const _analyticsSectionIsSection: PanchangSection = null as unknown as AnalyticsSection;
void _sectionIsAnalyticsSection;
void _analyticsSectionIsSection;

export const DEFAULT_PANCHANG_SECTION: PanchangSection = 'panchang';

export type PanchangSectionState = {
  /** The active section — what the segment shows AND what the nav highlights. */
  section: PanchangSection;
  /** How the current view was entered. Recorded at `setPanchangSection` time. */
  entryPoint: EntryPoint;
  /**
   * Bumped when the already-active tab is re-tapped. `PanchangScreen` watches
   * it and scrolls the CURRENT segment to top — standard tab behaviour, and it
   * must not double as a section change.
   */
  scrollToTopNonce: number;
};

const INITIAL_STATE: PanchangSectionState = {
  section: DEFAULT_PANCHANG_SECTION,
  entryPoint: 'tab',
  scrollToTopNonce: 0,
};

let state: PanchangSectionState = INITIAL_STATE;
const listeners = new Set<(next: PanchangSectionState) => void>();

function publish(next: PanchangSectionState): void {
  state = next;
  listeners.forEach((listener) => listener(next));
}

export function getPanchangSectionSnapshot(): PanchangSectionState {
  return state;
}

export function subscribePanchangSection(
  listener: (next: PanchangSectionState) => void
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Select a section. Lateral, never a push: callers navigate to the single
 * `PanchangHome` route rather than stacking a screen (§3 navigation
 * semantics), so back from any segment still exits to होम.
 *
 * The four `entryPoint` values map to the four callers — `AppTabBar` (`tab`),
 * `PanchangScreen`'s segment control (`segment_swipe`), the notification-tap
 * handler (`notification`), and any other in-app hand-off such as Home's
 * Kundali launcher or a tour step (`deeplink`).
 */
export function setPanchangSection(section: PanchangSection, entryPoint: EntryPoint): void {
  // Re-selecting the active section from the TAB is a re-tap, which means
  // "scroll to top", not a new view — logging it would inflate `tab` counts
  // with taps that navigated nowhere and skew exactly the comparison §5 is
  // meant to answer.
  if (section === state.section && entryPoint === 'tab') {
    publish({ ...state, scrollToTopNonce: state.scrollToTopNonce + 1 });
    return;
  }
  publish({ ...state, section, entryPoint });
  logSharedScreenView(section, entryPoint);
}

/** Scroll the current segment to top without changing the section. */
export function requestPanchangScrollToTop(): void {
  publish({ ...state, scrollToTopNonce: state.scrollToTopNonce + 1 });
}

export function __resetPanchangSectionStoreForTests(): void {
  state = INITIAL_STATE;
  listeners.clear();
}
