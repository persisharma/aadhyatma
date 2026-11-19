import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, AppState, Linking, StyleSheet, View } from 'react-native';
import { setBrandLaunchVisible, subscribeBrandLaunchTarget } from '@/navigation/brandLaunchIntent';
import BrandLaunchReveal from './BrandLaunchReveal';

/**
 * Kill switch for the cold-start particle reveal, OFF on every platform since the
 * November 2026 Android ANR review (docs/engineering/android-anr-audit-2026-11.md):
 * the reveal mounted a WebView on every cold start, and a process's first WebView
 * initialises Chromium on the main thread. Off, every launch takes the gate's
 * existing bypass path (the one targeted launches use): no reveal, no WebView, Home
 * after hydration. The approved renderer and its contract stay intact for a
 * deliberate re-enable — flip this only with ANR evidence that it is safe.
 */
export const BRAND_LAUNCH_REVEAL_ENABLED = false;

export const BRAND_HOME_FADE_MS = 180;
export const BRAND_HOME_HANDOFF_TIMEOUT_MS = 1200;

/** One introduction per cold JS process. Background returns retain the running app. */
export default function BrandLaunchGate({ targeted, children, onReady }: {
  targeted: boolean; children: React.ReactNode; onReady?: () => void | Promise<void>;
}) {
  // Deliberately in memory: a killed process gets a fresh gate; a warm resume
  // cannot reset it. Do not persist this as an install-level "already seen" flag.
  const [phase, setPhase] = useState<'playing' | 'preparing' | 'entered'>(targeted ? 'entered' : 'playing');
  const [laidOut, setLaidOut] = useState(false);
  const opacity = useRef(new Animated.Value(1)).current;
  const visible = phase !== 'entered' && !targeted;
  const finish = useCallback(() => {
    setBrandLaunchVisible(false);
    setPhase('entered');
  }, []);
  const complete = useCallback((formed = false) => {
    // Only normal formation earns a crossfade. Targets, accessibility, errors
    // and interruptions retain their immediate fail-open path.
    if (formed) setPhase(current => current === 'playing' ? 'preparing' : current);
    else finish();
  }, [finish]);
  useLayoutEffect(() => { setBrandLaunchVisible(visible); }, [visible]);
  useEffect(() => () => setBrandLaunchVisible(false), []);
  useEffect(() => { if (targeted) finish(); }, [targeted, finish]);
  useEffect(() => { if (!visible) onReady?.(); }, [visible, onReady]);
  useEffect(() => {
    const link = Linking.addEventListener('url', finish);
    const unsubscribe = subscribeBrandLaunchTarget(finish);
    return () => { link.remove(); unsubscribe(); };
  }, [finish]);
  useEffect(() => {
    if (phase !== 'preparing' || targeted) return;
    if (AppState.currentState !== 'active') { finish(); return; }
    const watchdog = setTimeout(finish, BRAND_HOME_HANDOFF_TIMEOUT_MS);
    const app = AppState.addEventListener('change', state => { if (state !== 'active') finish(); });
    const reduced = AccessibilityInfo.addEventListener('reduceMotionChanged', enabled => { if (enabled) finish(); });
    const reader = AccessibilityInfo.addEventListener('screenReaderChanged', enabled => { if (enabled) finish(); });
    return () => {
      clearTimeout(watchdog);
      app.remove(); reduced.remove(); reader.remove();
    };
  }, [phase, targeted, finish]);
  useEffect(() => {
    if (phase !== 'preparing' || targeted || !laidOut) return;
    // The last approved canvas frame covers Home's mount and native layout.
    // Give that layout a paint opportunity before fading on the native driver.
    let cancelled = false;
    let animation: Animated.CompositeAnimation | undefined;
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        if (cancelled) return;
        animation = Animated.timing(opacity, { toValue: 0, duration: BRAND_HOME_FADE_MS, useNativeDriver: true, isInteraction: false });
        animation.start(({ finished }) => { if (finished && !cancelled) finish(); });
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      animation?.stop();
    };
  }, [phase, laidOut, targeted, opacity, finish]);

  return <View style={{ flex: 1 }}>
    {(phase !== 'playing' || targeted) && <View testID="brand-launch-content" style={{ flex: 1 }}
      onLayout={() => setLaidOut(true)} pointerEvents={visible ? 'none' : 'auto'}
      accessibilityElementsHidden={visible} importantForAccessibility={visible ? 'no-hide-descendants' : 'auto'}>
      {children}
    </View>}
    {visible && <Animated.View testID="brand-launch-cover" style={[StyleSheet.absoluteFillObject, { opacity }]}>
      <BrandLaunchReveal onReady={onReady} onComplete={complete} />
    </Animated.View>}
  </View>;
}

