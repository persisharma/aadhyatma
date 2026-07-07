import { useEffect, useRef } from 'react';
import type { ScrollView, View } from 'react-native';

/**
 * Cross-screen registry for feature-tour spotlight targets.
 *
 * A screen wraps the element a tour step describes with `useTourTarget(id)` and
 * spreads the returned ref onto a measurable native view (`collapsable={false}`).
 * `FeatureTour` then measures that element's on-screen rect to draw the saffron
 * highlight ring and position its card.
 *
 * A screen can also pass an optional `reveal` callback — invoked by the tour just
 * before it measures — to scroll the target into view (targets that live inside a
 * `ScrollView` and may sit below the fold, e.g. the Japa tile or the "+ Add" rows).
 *
 * A plain module singleton (not a context) keeps wiring to a single hook call
 * per target — refs are stable, so there's nothing to re-render on register.
 */

export type TourTargetId =
  | 'routineCard'
  | 'categoriesGrid'
  | 'japaTile'
  | 'japamInside'
  | 'theerthTile'
  | 'theerthInside'
  | 'dailyVerse'
  | 'shareButton'
  | 'muhuratCard'
  | 'panchangSegment'
  | 'vratList'
  | 'vratFollow'
  | 'myVrat'
  | 'bhajanInside'
  | 'reminderToggle'
  | 'reminderTimes'
  | 'japamAdd';

export type Rect = { x: number; y: number; width: number; height: number };

type TargetRef = React.RefObject<View | null>;
type RevealFn = (ref: TargetRef) => void;
type TargetEntry = { ref: TargetRef; reveal?: RevealFn };

const registry = new Map<TourTargetId, TargetEntry>();

export function registerTourTarget(id: TourTargetId, entry: TargetEntry) {
  registry.set(id, entry);
}

export function unregisterTourTarget(id: TourTargetId, ref: TargetRef) {
  // Only clear if the current entry is still this ref — guards against a late
  // unmount of an old screen clobbering a freshly-registered same-id target.
  if (registry.get(id)?.ref === ref) registry.delete(id);
}

/**
 * Measure a registered target's window rect. Resolves null when the target is
 * not mounted or measures to zero size (not laid out yet) — the caller retries
 * or falls back to a tab-anchored card.
 */
export function measureTourTarget(id: TourTargetId): Promise<Rect | null> {
  const node = registry.get(id)?.ref.current;
  if (!node || typeof node.measureInWindow !== 'function') return Promise.resolve(null);
  return new Promise((resolve) => {
    node.measureInWindow((x, y, width, height) => {
      if (!width || !height) resolve(null);
      else resolve({ x, y, width, height });
    });
  });
}

/**
 * Ask the owning screen to scroll a target into view before it is measured.
 * No-op when the target isn't registered or declared no `reveal`.
 */
export function revealTourTarget(id: TourTargetId): void {
  const entry = registry.get(id);
  if (!entry?.reveal) return;
  // Best-effort: a native measure/scroll error must not escape into the tour's
  // animation-frame loop. Measurement + the tab-ring fallback still run.
  try {
    entry.reveal(entry.ref);
  } catch {
    // ignore
  }
}

/**
 * Imperative scroll-into-view helper for a `reveal` callback: scrolls `scrollRef`
 * so `targetRef` lands `padding` px below the top of the viewport. Measures the
 * target relative to the scroll's inner content node, so it works regardless of
 * the current scroll offset.
 */
export function scrollNodeIntoView(
  scrollRef: React.RefObject<ScrollView | null>,
  targetRef: TargetRef,
  padding = 24
): void {
  const scroll = scrollRef.current;
  const node = targetRef.current;
  if (!scroll || !node || typeof node.measureLayout !== 'function') return;
  const innerNode = scroll.getInnerViewNode?.();
  if (innerNode == null) {
    scroll.scrollTo({ y: 0, animated: false });
    return;
  }
  node.measureLayout(
    innerNode,
    (_x: number, y: number) => scroll.scrollTo({ y: Math.max(0, y - padding), animated: false }),
    () => {}
  );
}

/**
 * Attach to the element a tour step highlights.
 *
 * @param id      Stable target id referenced by a tour step's `targetId`.
 * @param reveal  Optional callback the tour invokes (with this target's ref)
 *                right before measuring, to scroll it into view.
 */
export function useTourTarget(id: TourTargetId, reveal?: RevealFn) {
  const ref = useRef<View | null>(null);
  // Keep the latest reveal without re-registering on every render.
  const revealRef = useRef(reveal);
  revealRef.current = reveal;
  useEffect(() => {
    registerTourTarget(id, { ref, reveal: (r) => revealRef.current?.(r) });
    return () => unregisterTourTarget(id, ref);
  }, [id]);
  return ref;
}
