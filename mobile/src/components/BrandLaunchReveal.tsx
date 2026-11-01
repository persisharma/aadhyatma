import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, AppState, Easing, Image, Linking, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useGitaLanguage } from '@/data/gita/language';
import { useTheme } from '@/theme/ThemeContext';
import VedanshWordmark from './VedanshWordmark';
import particles from './brandParticles.json';

const icon = require('@assets/splash-icon.png');
export const BRAND_REVEAL_MS = 1500;
export const BRAND_REVEAL_TIMEOUT_MS = 2000;

/** A bounded, cancellable JS-after-native-splash introduction. No native deps. */
export default function BrandLaunchReveal({ onComplete }: { onComplete: () => void }) {
  const { lang } = useGitaLanguage();
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const size = Math.min(160, width * 0.44, height * 0.28);
  const clock = useRef(new Animated.Value(0)).current;
  const completed = useRef(false);
  const callback = useRef(onComplete);
  callback.current = onComplete;
  const [motion, setMotion] = useState(false);
  const complete = useCallback(() => {
    if (completed.current) return;
    completed.current = true;
    callback.current();
  }, []);

  useEffect(() => {
    let alive = true;
    // An unresolved accessibility/native query can never trap launch.
    const watchdog = setTimeout(complete, BRAND_REVEAL_TIMEOUT_MS);
    const reduced = AccessibilityInfo.addEventListener('reduceMotionChanged', enabled => { if (enabled) complete(); });
    const reader = AccessibilityInfo.addEventListener('screenReaderChanged', enabled => { if (enabled) complete(); });
    const app = AppState.addEventListener('change', state => { if (state !== 'active') complete(); });
    const link = Linking.addEventListener('url', complete);
    let animation: Animated.CompositeAnimation | undefined;
    void Promise.all([AccessibilityInfo.isReduceMotionEnabled(), AccessibilityInfo.isScreenReaderEnabled()])
      .then(([reduceMotion, screenReader]) => {
        if (!alive || completed.current) return;
        if (reduceMotion || screenReader) { complete(); return; }
        setMotion(true);
        animation = Animated.timing(clock, { toValue: 1, duration: BRAND_REVEAL_MS,
          easing: Easing.out(Easing.cubic), useNativeDriver: true, isInteraction: false });
        animation.start(({ finished }) => { if (finished && alive) complete(); });
      }).catch(complete);
    return () => {
      alive = false;
      clearTimeout(watchdog);
      animation?.stop();
      reduced.remove(); reader.remove(); app.remove(); link.remove();
    };
  }, [clock, complete]);

  // Both names/subtitle and the actual icon resolve on this same clock.
  const opacity = clock.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 1, 1] });
  return <ScrollView testID="brand-launch-reveal" style={{ flex: 1, backgroundColor: colors.brandIvory }}
    contentContainerStyle={styles.content} bounces={false}>
    <View style={{ width: size, height: size }} accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {motion && particles.points.map(([x, y, color], i) => {
        const angle = i * 2.399963;
        const radius = size * (0.6 + (i % 7) / 14);
        return <Animated.View key={i} style={{ position: 'absolute', width: 3, height: 3, borderRadius: 1.5,
          left: Number(x) * size - 1.5, top: Number(y) * size - 1.5, backgroundColor: String(color),
          opacity: clock.interpolate({ inputRange: [0, 0.5, 0.8, 1], outputRange: [0, 1, 0, 0] }),
          transform: [
            { translateX: clock.interpolate({ inputRange: [0, 0.7, 1], outputRange: [Math.cos(angle) * radius, 0, 0] }) },
            { translateY: clock.interpolate({ inputRange: [0, 0.7, 1], outputRange: [Math.sin(angle) * radius, 0, 0] }) },
          ],
        }} />;
      })}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity }]}>
        <Image source={icon} onError={complete} style={{ width: size, height: size }} resizeMode="contain" accessibilityIgnoresInvertColors />
      </Animated.View>
    </View>
    <Animated.View style={{ width: '100%', marginTop: 16, opacity,
      transform: [{ translateY: clock.interpolate({ inputRange: [0, 0.6, 1], outputRange: [18, 0, 0] }) }],
    }}><VedanshWordmark lang={lang} bilingual /></Animated.View>
  </ScrollView>;
}

const styles = StyleSheet.create({ content: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 32, overflow: 'hidden' } });
