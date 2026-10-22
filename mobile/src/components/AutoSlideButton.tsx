import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import AppIcon from '@/components/AppIcon';
import { useTheme } from '@/theme/ThemeContext';
import { elevation } from '@/theme/elevation';
import { useGitaLanguage } from '@/data/gita/language';
import { pick } from '@/utils/localize';
import { titleFontByLang } from '@/utils/langType';
import { useReducedMotion } from '@/utils/useReducedMotion';
import type { AutoSlideSpeed } from '@/utils/autoSlideStore';
import type { AutoSlideControl } from '@/screens/_useAutoSlide';

/** Pace as a three-bar meter: language-neutral and narrow enough for a toggle row. */
const SPEED_LEVEL: Record<AutoSlideSpeed, number> = { slow: 1, normal: 2, fast: 3 };
const BAR_HEIGHTS = [5, 8, 11];

/**
 * The auto-slide (स्वतः) control (design.md §85). Idle it is one pill — ▶ + "स्वतः /
 * Auto"; playing it splits into ❚❚ and a three-bar pace meter (slow · normal · fast) that
 * cycles on tap, over a hairline countdown to the next scroll or page turn.
 *
 * `floating` (the default) anchors it bottom-left of a verse pager, mirroring
 * `JumpToStartButton` on the right. Screens whose pager bottom is caption text (Kids
 * Stories, the comic) or step navigation (Vidhi conduct) render it inline instead.
 *
 * Visible labels follow the reading language; accessibility labels stay English for
 * Maestro, like every reader control.
 */
export default function AutoSlideButton({
  control,
  floating = true,
}: {
  control: AutoSlideControl;
  floating?: boolean;
}) {
  const { colors } = useTheme();
  const { lang } = useGitaLanguage();
  const reducedMotion = useReducedMotion();
  const progress = useRef(new Animated.Value(0)).current;

  const { playing, countdownMs, countdownKey } = control;
  useEffect(() => {
    progress.stopAnimation();
    progress.setValue(0);
    if (!playing || countdownMs == null || reducedMotion) return undefined;
    const countdown = Animated.timing(progress, {
      toValue: 1,
      duration: countdownMs,
      easing: Easing.linear,
      useNativeDriver: true,
    });
    countdown.start();
    return () => countdown.stop();
  }, [playing, countdownMs, countdownKey, reducedMotion, progress]);

  if (!control.visible) return null;

  const tint = colors.saffronDeep;
  const font = { fontFamily: titleFontByLang(lang), fontStyle: lang === 'en' ? 'italic' : 'normal' } as const;

  return (
    <View
      testID="auto-slide-control"
      style={[
        styles.pill,
        floating && styles.floating,
        {
          backgroundColor: playing ? colors.saffronTint : colors.parchmentSoft,
          borderColor: colors.cardActiveBorder,
        },
      ]}
    >
      <View style={styles.row}>
        <Pressable
          onPress={control.toggle}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={playing ? 'Pause slideshow' : 'Start slideshow'}
          accessibilityState={{ selected: playing }}
          style={({ pressed }) => [styles.segment, pressed && styles.pressed]}
        >
          <AppIcon name={playing ? 'pause' : 'play'} size={14} color={tint} weight="fill" />
          {!playing && (
            <Text style={[styles.label, font, { color: tint }]} numberOfLines={1}>
              {pick(lang, { hi: 'स्वतः', en: 'Auto', gu: 'સ્વતઃ', kn: 'ಸ್ವಯಂ' })}
            </Text>
          )}
        </Pressable>
        {playing && (
          <Pressable
            onPress={control.cycleSpeed}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={`Slideshow speed: ${control.speed}`}
            accessibilityHint="Changes how long each page stays"
            style={({ pressed }) => [
              styles.segment,
              styles.speed,
              { borderLeftColor: colors.cardActiveBorder },
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.meter}>
              {BAR_HEIGHTS.map((height, i) => (
                <View
                  key={height}
                  style={[
                    styles.bar,
                    { height, backgroundColor: tint },
                    i >= SPEED_LEVEL[control.speed] && styles.barOff,
                  ]}
                />
              ))}
            </View>
          </Pressable>
        )}
        {playing && !reducedMotion && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.countdown,
              { backgroundColor: tint, transform: [{ scaleX: progress }] },
            ]}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
  },
  floating: {
    position: 'absolute',
    left: 16,
    bottom: 16,
    ...elevation.lifted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    overflow: 'hidden',
  },
  segment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  speed: {
    borderLeftWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    alignSelf: 'stretch',
  },
  meter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 14,
  },
  bar: { width: 3, borderRadius: 1 },
  barOff: { opacity: 0.3 },
  pressed: { opacity: 0.6 },
  label: {
    fontSize: 13,
    includeFontPadding: false,
  },
  countdown: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 2,
    transformOrigin: 'left',
  },
});
