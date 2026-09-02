import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Tracks the OS "reduce motion" accessibility preference. Returns `false` until
 * the initial async read resolves (motion is the default), then stays in sync
 * via the `reduceMotionChanged` event. Components use it to swap entrance/pulse
 * animations for an instant final state (PRD-10 §5; design.md §11 "reverent,
 * not confetti" — honor reduced motion).
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => {
        if (mounted) setReduced(v);
      })
      .catch(() => undefined);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (v) => setReduced(v));
    return () => {
      mounted = false;
      sub?.remove?.();
    };
  }, []);

  return reduced;
}
