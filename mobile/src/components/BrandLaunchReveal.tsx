import React, { useCallback, useEffect, useRef, useState, type ComponentType } from 'react';
import { AccessibilityInfo, AppState, Linking, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import type { BrandParticleProps } from './BrandParticleWebView';

export const BRAND_REVEAL_MS = 3350;
export const BRAND_REVEAL_TIMEOUT_MS = 7000;

/** Owns launch cancellation; the approved renderer owns every pixel and frame. */
export default function BrandLaunchReveal({ onComplete, onReady }: BrandParticleProps) {
  const { colors } = useTheme();
  const completeCallback = useRef(onComplete);
  const readyCallback = useRef(onReady);
  completeCallback.current = onComplete;
  readyCallback.current = onReady;
  const active = useRef(true);
  const completed = useRef(false);
  const [Renderer, setRenderer] = useState<ComponentType<BrandParticleProps> | null>(null);
  const complete = useCallback(() => {
    if (!active.current || completed.current) return;
    completed.current = true;
    completeCallback.current();
  }, []);
  const ready = useCallback(() => { if (active.current && !completed.current) readyCallback.current?.(); }, []);

  useEffect(() => {
    active.current = true;
    const watchdog = setTimeout(complete, BRAND_REVEAL_TIMEOUT_MS);
    const reduced = AccessibilityInfo.addEventListener('reduceMotionChanged', enabled => { if (enabled) complete(); });
    const reader = AccessibilityInfo.addEventListener('screenReaderChanged', enabled => { if (enabled) complete(); });
    const app = AppState.addEventListener('change', state => { if (state !== 'active') complete(); });
    const link = Linking.addEventListener('url', complete);
    void Promise.all([AccessibilityInfo.isReduceMotionEnabled(), AccessibilityInfo.isScreenReaderEnabled()])
      .then(([reduceMotion, screenReader]) => {
        if (!active.current || completed.current) return;
        if (reduceMotion || screenReader) { complete(); return; }
        // Same source as the accepted preview. No substitute motion or typography.
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { default: Surface } = require('./BrandParticleWebView') as typeof import('./BrandParticleWebView');
        setRenderer(() => Surface);
      }).catch(complete);
    return () => {
      active.current = false;
      clearTimeout(watchdog);
      reduced.remove(); reader.remove(); app.remove(); link.remove();
    };
  }, [complete]);

  return <View testID="brand-launch-reveal" pointerEvents="none" style={{ flex: 1, backgroundColor: colors.brandIvory }}>
    {Renderer ? <Renderer onReady={ready} onComplete={complete} /> : null}
  </View>;
}
