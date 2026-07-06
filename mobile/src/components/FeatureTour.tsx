import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  InteractionManager,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeContext';
import { useTour } from '@/contexts/TourContext';
import { tourSteps, type TourAnchor } from '@/data/tour/steps';
import { navigationRef } from '@/notifications/deepLink';

/**
 * In-context first-launch feature tour. Renders a translucent overlay
 * above the live navigator — the underlying screen remains visible.
 * Each step navigates the user to the real surface it describes, then
 * anchors a tooltip card to the relevant region.
 *
 * Self-mounts when `useTour().shouldShowFirstLaunchTour` is true.
 */
export default function FeatureTour() {
  const { colors, typography, spacing, radii } = useTheme();
  const { shouldShowFirstLaunchTour, markTourCompleted } = useTour();
  const [visible, setVisible] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  // Rising-edge guard: open exactly once per "should show" episode. Keyed on
  // shouldShowFirstLaunchTour ALONE (never `visible`), so the optimistic hide in
  // close() can't be misread as "not shown yet" and re-open the tour before
  // markTourCompleted() has flipped the gate off. Re-armed when the gate clears
  // (e.g. resetTour() from More → replay).
  const openedRef = useRef(false);

  useEffect(() => {
    if (shouldShowFirstLaunchTour) {
      if (!openedRef.current) {
        openedRef.current = true;
        setStepIndex(0);
        setVisible(true);
      }
    } else {
      openedRef.current = false;
    }
  }, [shouldShowFirstLaunchTour]);

  // Drive navigation on each step change while the tour is up. The dispatch is
  // deferred (so the overlay's fade doesn't compete with the navigator swap)
  // and the handle is cancelled on cleanup — so a pending navigate never fires
  // after the step changed again or the tour was dismissed.
  useEffect(() => {
    if (!visible) return undefined;
    const step = tourSteps[stepIndex];
    if (!step || !navigationRef.isReady()) return undefined;
    const handle = InteractionManager.runAfterInteractions(() => {
      if (!navigationRef.isReady()) return;
      navigationRef.dispatch(
        CommonActions.navigate({
          name: step.navigateTo.name,
          params: 'params' in step.navigateTo ? step.navigateTo.params : undefined,
        } as never)
      );
    });
    return () => handle.cancel();
  }, [visible, stepIndex]);

  const close = useCallback(() => {
    // Hide immediately (optimistic); persist in the background. The open effect
    // is guarded by openedRef, so this early hide won't bounce back open.
    setVisible(false);
    void markTourCompleted();
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

  const containerStyle = useMemo(() => anchorContainerStyle(step?.anchor), [step]);

  if (!step) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="overFullScreen"
      transparent
      statusBarTranslucent
      onRequestClose={close}
    >
      {/* Dim layer — semi-transparent so the live screen reads through. */}
      <View style={[styles.backdrop, { backgroundColor: 'rgba(15, 10, 5, 0.55)' }]} pointerEvents="auto">
        <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
          <View style={[styles.headerRow, { paddingHorizontal: spacing.xxl }]}>
            <Text
              style={[
                styles.stepCount,
                {
                  color: colors.parchment,
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
                    color: colors.parchment,
                    fontFamily: typography.cardLatin.fontFamily,
                  },
                ]}
              >
                Skip
              </Text>
            </Pressable>
          </View>

          <View style={[styles.anchorWrap, containerStyle]}>
            {step.pointer === 'up' && (
              <View style={styles.pointerSlot} accessibilityElementsHidden importantForAccessibility="no">
                <View style={[styles.pointerTriangleUp, { borderBottomColor: colors.parchmentSoft }]} />
              </View>
            )}

            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.parchmentSoft,
                  borderColor: colors.divider,
                  borderRadius: radii.lg,
                },
              ]}
            >
              <Text
                accessibilityRole="header"
                style={[
                  styles.titleHi,
                  { color: colors.ink, fontFamily: typography.readerTitle.fontFamily },
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

              <View style={[styles.rule, { backgroundColor: colors.divider }]} />

              <Text
                style={[
                  styles.bodyHi,
                  { color: colors.ink, fontFamily: typography.meaning.fontFamily },
                ]}
              >
                {step.bodyHi}
              </Text>
              <Text
                style={[
                  styles.bodyEn,
                  { color: colors.inkSoft, fontFamily: typography.meaning.fontFamily },
                ]}
              >
                {step.bodyEn}
              </Text>

              <View style={styles.dots} accessibilityElementsHidden importantForAccessibility="no">
                {tourSteps.map((s, i) => (
                  <View
                    key={s.id}
                    style={[
                      styles.dot,
                      { backgroundColor: i === stepIndex ? colors.saffron : colors.dotRest },
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
                      { color: colors.onPrimary, fontFamily: typography.readerTitle.fontFamily },
                    ]}
                  >
                    {isLast ? 'Done · पूर्ण' : 'Next · आगे'}
                  </Text>
                </Pressable>
              </View>
            </View>

            {step.pointer === 'down' && (
              <View style={styles.pointerSlot} accessibilityElementsHidden importantForAccessibility="no">
                <View style={[styles.pointerTriangleDown, { borderTopColor: colors.parchmentSoft }]} />
              </View>
            )}
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function anchorContainerStyle(anchor: TourAnchor | undefined) {
  switch (anchor) {
    case 'top':
      return { justifyContent: 'flex-start' as const, paddingTop: 8 };
    case 'bottom':
      return { justifyContent: 'flex-end' as const, paddingBottom: 8 };
    case 'center':
    default:
      return { justifyContent: 'center' as const };
  }
}

// Pointer triangle dimensions: 14px tall, 22px wide.
const POINTER_W = 22;
const POINTER_H = 14;

const styles = StyleSheet.create({
  backdrop: { flex: 1 },
  safe: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  stepCount: {
    fontSize: 13,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  skipBtn: { paddingHorizontal: 8, paddingVertical: 6 },
  skipLabel: {
    fontSize: 13,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  anchorWrap: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'stretch',
  },
  card: {
    borderWidth: 1,
    padding: 20,
    gap: 0,
    shadowColor: '#0a0604',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 10,
  },
  titleHi: {
    fontSize: 22,
    includeFontPadding: false,
    textAlign: 'center',
  },
  titleEn: {
    fontSize: 13,
    marginTop: 2,
    fontStyle: 'italic',
    textAlign: 'center',
    includeFontPadding: false,
  },
  rule: {
    height: 1,
    marginVertical: 14,
    opacity: 0.8,
  },
  bodyHi: {
    fontSize: 15,
    lineHeight: 26,
    textAlign: 'left',
  },
  bodyEn: {
    fontSize: 13,
    lineHeight: 22,
    marginTop: 10,
    textAlign: 'left',
    opacity: 0.85,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  controls: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  secondary: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 12,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryLabel: {
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  primary: {
    flex: 2,
    paddingVertical: 12,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryLabel: {
    fontSize: 14,
    includeFontPadding: false,
  },
  pointerSlot: {
    alignItems: 'center',
  },
  pointerTriangleUp: {
    width: 0,
    height: 0,
    borderLeftWidth: POINTER_W / 2,
    borderRightWidth: POINTER_W / 2,
    borderBottomWidth: POINTER_H,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  pointerTriangleDown: {
    width: 0,
    height: 0,
    borderLeftWidth: POINTER_W / 2,
    borderRightWidth: POINTER_W / 2,
    borderTopWidth: POINTER_H,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});
