import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import LotusMark from './LotusMark';
import { useReducedMotion } from '@/utils/useReducedMotion';

/**
 * The "complete" seal for the Today's Practice summary card (PRD-10 §5.1). Reuses
 * the app's existing `LotusMark` "पूर्ण" achievement symbol (View+gradient — no
 * SVG, per design.md §30) and gives it a single, reverent **opacity fade-in** on
 * mount — NO scale pop or rotate, per the motion rule (design.md §11 / §30: a
 * soft fade, no scale effects). It rides the sanctioned completion-moment fade.
 * Under reduce-motion it appears instantly at its final frame. This is a
 * *persistent* state badge; the one-shot pushpa-varsha still fires from
 * `RoutineCelebrationOverlay`, so the two do not compete.
 */
export default function PracticeSeal({ size = 56 }: { size?: number }) {
  const reduced = useReducedMotion();
  const opacity = useRef(new Animated.Value(reduced ? 1 : 0)).current;

  useEffect(() => {
    if (reduced) {
      opacity.setValue(1);
      return;
    }
    const anim = Animated.timing(opacity, {
      toValue: 1,
      duration: 420,
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [reduced, opacity]);

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ opacity }}
    >
      <LotusMark size={size} />
    </Animated.View>
  );
}
