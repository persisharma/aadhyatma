import React, { useCallback, useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeContext';
import { useTour } from '@/contexts/TourContext';
import { tourSteps } from '@/data/tour/steps';
import Ornament from './Ornament';

/**
 * First-launch feature tour. Self-mounts when `useTour().shouldShowFirstLaunchTour`
 * is true. Renders a parchment-styled multi-page walkthrough of the five
 * core surfaces (Home, Wishlist, Reminders, Bhakti, Share).
 *
 * The tour is fully bilingual — the user has not chosen a reading language
 * yet at first launch, so every page renders Hindi (primary) and English
 * (secondary) per design.md §1.
 */
export default function FeatureTour() {
  const { colors, typography, spacing, radii } = useTheme();
  const { shouldShowFirstLaunchTour, markTourCompleted } = useTour();
  const [visible, setVisible] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (shouldShowFirstLaunchTour && !visible) {
      setStepIndex(0);
      setVisible(true);
    }
  }, [shouldShowFirstLaunchTour, visible]);

  const close = useCallback(async () => {
    setVisible(false);
    await markTourCompleted();
  }, [markTourCompleted]);

  const next = useCallback(() => {
    setStepIndex((i) => Math.min(i + 1, tourSteps.length - 1));
  }, []);

  const back = useCallback(() => {
    setStepIndex((i) => Math.max(i - 1, 0));
  }, []);

  const step = tourSteps[stepIndex];
  const isLast = stepIndex === tourSteps.length - 1;
  const isFirst = stepIndex === 0;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={close}
    >
      <View style={styles.root}>
        <LinearGradient
          colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
          <View style={styles.headerRow}>
            <Text
              style={[
                styles.stepCount,
                {
                  color: colors.inkMuted,
                  fontFamily: typography.cardLatin.fontFamily,
                },
              ]}
            >
              {stepIndex + 1} / {tourSteps.length}
            </Text>
            <Pressable
              onPress={close}
              accessibilityRole="button"
              accessibilityLabel="Skip tour"
              hitSlop={16}
              style={({ pressed }) => [styles.skipBtn, pressed && { opacity: 0.6 }]}
            >
              <Text
                style={[
                  styles.skipLabel,
                  {
                    color: colors.inkMuted,
                    fontFamily: typography.cardLatin.fontFamily,
                  },
                ]}
              >
                Skip
              </Text>
            </Pressable>
          </View>

          <View style={[styles.body, { paddingHorizontal: spacing.xxl }]}>
            <View
              style={[
                styles.glyphBadge,
                {
                  backgroundColor: colors.saffron,
                  borderRadius: radii.pill,
                },
              ]}
              accessibilityElementsHidden
              importantForAccessibility="no"
            >
              <Text
                style={{
                  color: colors.onPrimary,
                  fontFamily: typography.readerTitle.fontFamily,
                  fontSize: 30,
                  includeFontPadding: false,
                }}
              >
                {step.glyph}
              </Text>
            </View>

            <Text
              accessibilityRole="header"
              style={[
                styles.titleHi,
                {
                  color: colors.ink,
                  fontFamily: typography.screenTitle.fontFamily,
                },
              ]}
            >
              {step.titleHi}
            </Text>
            <Text
              style={[
                styles.titleEn,
                {
                  color: colors.inkMuted,
                  fontFamily: typography.subtitle.fontFamily,
                },
              ]}
            >
              {step.titleEn}
            </Text>

            <Ornament />

            <Text
              style={[
                styles.bodyHi,
                {
                  color: colors.ink,
                  fontFamily: typography.meaning.fontFamily,
                },
              ]}
            >
              {step.bodyHi}
            </Text>
            <Text
              style={[
                styles.bodyEn,
                {
                  color: colors.inkSoft,
                  fontFamily: typography.meaning.fontFamily,
                },
              ]}
            >
              {step.bodyEn}
            </Text>
          </View>

          <View style={[styles.footer, { paddingHorizontal: spacing.xxl }]}>
            <View style={styles.dots} accessibilityElementsHidden importantForAccessibility="no">
              {tourSteps.map((s, i) => (
                <View
                  key={s.id}
                  style={[
                    styles.dot,
                    {
                      backgroundColor: i === stepIndex ? colors.saffron : colors.dotRest,
                    },
                  ]}
                />
              ))}
            </View>

            <View style={styles.controls}>
              <Pressable
                onPress={back}
                accessibilityRole="button"
                accessibilityLabel="Previous step"
                accessibilityState={{ disabled: isFirst }}
                disabled={isFirst}
                style={({ pressed }) => [
                  styles.secondary,
                  {
                    borderColor: colors.divider,
                    borderRadius: radii.md,
                    opacity: isFirst ? 0.3 : pressed ? 0.6 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.secondaryLabel,
                    {
                      color: colors.inkSoft,
                      fontFamily: typography.cardLatin.fontFamily,
                    },
                  ]}
                >
                  Back
                </Text>
              </Pressable>

              <Pressable
                onPress={isLast ? close : next}
                accessibilityRole="button"
                accessibilityLabel={isLast ? 'Done' : 'Next step'}
                style={({ pressed }) => [
                  styles.primary,
                  {
                    backgroundColor: colors.saffron,
                    borderRadius: radii.md,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.primaryLabel,
                    {
                      color: colors.onPrimary,
                      fontFamily: typography.readerTitle.fontFamily,
                    },
                  ]}
                >
                  {isLast ? 'Done · पूर्ण' : 'Next · आगे'}
                </Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 4,
  },
  stepCount: {
    fontSize: 13,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  skipBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  skipLabel: {
    fontSize: 13,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  glyphBadge: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  titleHi: {
    fontSize: 30,
    textAlign: 'center',
    includeFontPadding: false,
  },
  titleEn: {
    fontSize: 15,
    marginTop: 4,
    fontStyle: 'italic',
    textAlign: 'center',
    includeFontPadding: false,
  },
  bodyHi: {
    fontSize: 16,
    lineHeight: 28,
    textAlign: 'center',
  },
  bodyEn: {
    fontSize: 14,
    lineHeight: 24,
    marginTop: 14,
    textAlign: 'center',
    opacity: 0.85,
  },
  footer: {
    paddingBottom: 8,
    gap: 16,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
  },
  secondary: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 14,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryLabel: {
    fontSize: 13,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  primary: {
    flex: 2,
    paddingVertical: 14,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryLabel: {
    fontSize: 15,
    includeFontPadding: false,
  },
});
