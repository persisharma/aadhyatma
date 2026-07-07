import { useEffect, useRef } from 'react';
import type { View } from 'react-native';

/**
 * Cross-screen registry for feature-tour spotlight targets.
 *
 * A screen wraps the element a tour step describes with `useTourTarget(id)` and
 * spreads the returned ref onto a measurable native view (`collapsable={false}`).
 * `FeatureTour` then measures that element's on-screen rect to draw the saffron
 * highlight ring and position its card.
 *
 * A plain module singleton (not a context) keeps wiring to a single hook call
 * per target — refs are stable, so there's nothing to re-render on register.
 */

export type TourTargetId =
  | 'discover'
  | 'japaTile'
  | 'panchangDate'
  | 'routineToday'
  | 'dailyVerse'
  | 'shareButton'
  | 'reminderToggle';

export type Rect = { x: number; y: number; width: number; height: number };

const registry = new Map<TourTargetId, React.RefObject<View | null>>();

export function registerTourTarget(id: TourTargetId, ref: React.RefObject<View | null>) {
  registry.set(id, ref);
}

export function unregisterTourTarget(id: TourTargetId, ref: React.RefObject<View | null>) {
  // Only clear if the current entry is still this ref — guards against a late
  // unmount of an old screen clobbering a freshly-registered same-id target.
  if (registry.get(id) === ref) registry.delete(id);
}

/**
 * Measure a registered target's window rect. Resolves null when the target is
 * not mounted or measures to zero size (not laid out yet) — the caller retries
 * or falls back to a tab-anchored card.
 */
export function measureTourTarget(id: TourTargetId): Promise<Rect | null> {
  const node = registry.get(id)?.current;
  if (!node || typeof node.measureInWindow !== 'function') return Promise.resolve(null);
  return new Promise((resolve) => {
    node.measureInWindow((x, y, width, height) => {
      if (!width || !height) resolve(null);
      else resolve({ x, y, width, height });
    });
  });
}

/** Attach to the element a tour step highlights. */
export function useTourTarget(id: TourTargetId) {
  const ref = useRef<View | null>(null);
  useEffect(() => {
    registerTourTarget(id, ref);
    return () => unregisterTourTarget(id, ref);
  }, [id]);
  return ref;
}
