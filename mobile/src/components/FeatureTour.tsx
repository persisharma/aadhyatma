import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  InteractionManager,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FullWindowOverlay } from 'react-native-screens';
import { useTheme } from '@/theme/ThemeContext';
import { useTour } from '@/contexts/TourContext';
import { tourSteps, TAB_ORDER } from '@/data/tour/steps';
import { navigationRef } from '@/notifications/deepLink';
import { measureTourTarget, revealTourTarget, type Rect } from '@/components/tour/tourTargets';
import {
  placeTourCard,
  tabItemRect,
  inflateRect,
  sameRect,
  measureSettled,
  CARD_HEIGHT_EST,
  REMEASURE_POLL_MS,
} from '@/components/tour/placement';

/**
 * In-context first-launch feature tour. Renders a translucent full-window
 * overlay above the app. Each step navigates to the real surface it describes,
 * rings the element (or its
 * destination tab when no element target is measurable), and hugs a compact
 * tooltip card to it. See design.md §47.
 *
 * Self-mounts when `useTour().shouldShowFirstLaunchTour` is true.
 */

const RING_PAD = 6;
const CARD_HPAD = 20;
const POINTER_W = 22;
const POINTER_H = 14;
const TAB_COUNT = 5;
const TAB_BAR_CONTENT_HEIGHT = 60; // matches TabNavigator tabBarStyle height (excl. safe area)

export default function FeatureTour() {
  const { colors, typography, radii } = useTheme();
  const { shouldShowFirstLaunchTour, markTourCompleted } = useTour();
  const insets = useSafeAreaInsets();
  const { width: screenW, height: screenH } = useWindowDimensions();

  const [visible, setVisible] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  // Measured element rect for the current step, or null → ring the destination
  // tab instead (fallback while measuring / when the element isn't present).
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  // The card's real rendered height (arrow + card), reported by onLayout. Feeds
  // the above/below fit decision so the card never lands on a side too small to
  // hold it — which is what made it cover the highlighted element on shorter
  // screens or larger type scales. Seeded with the estimate until the first
  // layout lands.
  const [cardHeight, setCardHeight] = useState(CARD_HEIGHT_EST);

  // Rising-edge guard: open exactly once per "should show" episode. Keyed on
  // shouldShowFirstLaunchTour ALONE (never `visible`), so the optimistic hide in
  // close() can't be misread as "not shown yet" and re-open before
  // markTourCompleted() flips the gate off. Re-armed when the gate clears.
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

  const step = tourSteps[stepIndex];
  const isLast = stepIndex === tourSteps.length - 1;
  const isFirst = stepIndex === 0;

  // On each step: navigate to the surface, scroll the target into view, then
  // measure it — re-measuring across frames and always keeping the LATEST rect,
  // until it settles (a freshly-navigated screen shifts as its header/content lays
  // out — and some targets, e.g. the muhurat card, mount a few frames late; taking
  // only an early measure would ring the wrong spot). Once the frame loop settles,
  // a bounded low-frequency poll keeps re-measuring: some screens hydrate their
  // content asynchronously (e.g. Japam alarms load from AsyncStorage) and shift
  // the target AFTER the frame cap, and the empty-state layout looks "stable" to
  // the frame loop — without the poll the ring freezes on that stale spot. Both
  // phases keep the LATEST rect and are cancelled on cleanup so nothing stale lands.
  // Depends on screen size so a rotation re-measures.
  useEffect(() => {
    if (!visible || !step || !navigationRef.isReady()) return undefined;
    setTargetRect(null);
    let cancelled = false;
    let raf: number | undefined;
    let poll: ReturnType<typeof setTimeout> | undefined;
    let tries = 0;
    let prev: Rect | null = null;
    let stable = 0;
    let revealed = false;

    // Commit the latest measurement, skipping a no-op re-render when unchanged.
    const commit = (rect: Rect) => {
      revealed = true;
      setTargetRect((cur) => (sameRect(cur, rect) ? cur : rect));
    };

    // Slow path: after the frame loop settles, re-reveal + re-measure for as long
    // as the step is shown, so a late async layout shift re-positions the ring no
    // matter how slow the hydration is (device-agnostic — no fixed time window).
    const schedulePoll = () => {
      if (cancelled || !step.targetId) return;
      poll = setTimeout(() => {
        if (cancelled || !step.targetId) return;
        revealTourTarget(step.targetId);
        void measureTourTarget(step.targetId).then((rect) => {
          if (cancelled) return;
          if (rect) commit(rect);
          schedulePoll();
        });
      }, REMEASURE_POLL_MS);
    };

    // Fast path: re-measure across frames until the rect holds still.
    const measure = () => {
      if (cancelled || !step.targetId) return;
      // Ask the screen to scroll the target on-screen until the first measure
      // lands, so below-the-fold targets aren't ringed at the wrong spot.
      if (!revealed) revealTourTarget(step.targetId);
      void measureTourTarget(step.targetId).then((rect) => {
        if (cancelled) return;
        if (rect) {
          commit(rect); // last write wins → ring tracks to the final position
          stable = sameRect(prev, rect) ? stable + 1 : 0;
          prev = rect;
        }
        tries += 1;
        if (measureSettled(tries, stable)) schedulePoll();
        else raf = requestAnimationFrame(measure);
      });
    };
    const handle = InteractionManager.runAfterInteractions(() => {
      if (cancelled || !navigationRef.isReady()) return;
      navigationRef.dispatch(
        CommonActions.navigate({
          name: step.navigateTo.name,
          params: 'params' in step.navigateTo ? step.navigateTo.params : undefined,
        } as never)
      );
      measure();
    });
    return () => {
      cancelled = true;
      if (raf !== undefined) cancelAnimationFrame(raf);
      if (poll !== undefined) clearTimeout(poll);
      handle.cancel();
    };
  }, [visible, stepIndex, step, screenW, screenH]);

  const close = useCallback(() => {
    setVisible(false);
    void markTourCompleted();
    // The walkthrough pushes screens onto tab stacks (e.g. TheerthMap on Home,
    // MyVrat on Panchang, JapamAlarms on More); reset so every tab returns to
    // its root and the user lands back on Home instead of on the last surface.
    if (navigationRef.isReady()) {
      navigationRef.resetRoot({
        index: 0,
        routes: [
          { name: 'HomeTab' },
          { name: 'DailyBhaktiTab' },
          { name: 'PanchangTab' },
          { name: 'AudioTab' },
          { name: 'MoreTab' },
        ],
      });
    }
  }, [markTourCompleted]);

  const next = useCallback(() => {
    setStepIndex((i) => Math.min(i + 1, tourSteps.length - 1));
  }, []);

  const back = useCallback(() => {
    setStepIndex((i) => Math.max(i - 1, 0));
  }, []);

  const screen = useMemo(() => ({ width: screenW, height: screenH }), [screenW, screenH]);

  // Ring the measured element, else the destination tab; the card hugs whichever.
  const baseRect = useMemo(
    () =>
      targetRect ??
      tabItemRect(TAB_ORDER[step.navigateTo.name], TAB_COUNT, screen, insets.bottom, TAB_BAR_CONTENT_HEIGHT),
    [targetRect, step, screen, insets.bottom]
  );
  const ringRect = useMemo(() => inflateRect(baseRect, RING_PAD), [baseRect]);
  const placement = useMemo(
    () => placeTourCard(baseRect, screen, { top: insets.top, bottom: insets.bottom }, CARD_HPAD, POINTER_W, cardHeight),
    [baseRect, screen, insets.top, insets.bottom, cardHeight]
  );

  if (!visible || !step) return null;

  return (
    <TourOverlayContainer>
      <View style={[StyleSheet.absoluteFill, styles.overlay]}>
        {/* Visual-only scrim. The full-window overlay itself blocks the app
            underneath; keeping the scrim out of the hit-test path lets the tour
            controls receive taps reliably. */}
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(15, 10, 5, 0.55)' }]}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />

      {/* Spotlight ring around the current target. */}
      <View
        pointerEvents="none"
        style={[
          styles.ring,
          {
            left: ringRect.x,
            top: ringRect.y,
            width: ringRect.width,
            height: ringRect.height,
            borderColor: colors.saffron,
            borderRadius: radii.md,
            shadowColor: colors.saffron,
          },
        ]}
      />

      {/* Header: step counter + Skip, pinned to the top. */}
      <View style={[styles.headerRow, { top: insets.top + 6 }]}>
        <Text style={[styles.stepCount, { color: colors.parchment, fontFamily: typography.cardLatin.fontFamily }]}>
          {stepIndex + 1} / {tourSteps.length}
        </Text>
        <Pressable
          onPress={close}
          accessibilityRole="button"
          accessibilityLabel="Skip tour"
          hitSlop={16}
          style={({ pressed }) => [styles.skipBtn, pressed && { opacity: 0.6 }]}
        >
          <Text style={[styles.skipLabel, { color: colors.parchment, fontFamily: typography.cardLatin.fontFamily }]}>
            Skip
          </Text>
        </Pressable>
      </View>

      {/* Card — hugs the target on whichever side has room; arrow leads to it.
          onLayout reports the real height (arrow + card) so placement can decide
          the side by the card's true size, not a fixed guess. */}
      <View
        pointerEvents="box-none"
        onLayout={(e) => {
          const h = Math.round(e.nativeEvent.layout.height);
          if (h > 0) setCardHeight((prev) => (prev === h ? prev : h));
        }}
        style={[
          styles.cardWrap,
          placement.top !== undefined ? { top: placement.top } : { bottom: placement.bottom },
        ]}
      >
        {placement.arrow === 'up' && (
          <View style={styles.pointerRow} accessibilityElementsHidden importantForAccessibility="no">
            <View style={[styles.pointerUp, { marginLeft: placement.arrowLeft, borderBottomColor: colors.parchmentSoft }]} />
          </View>
        )}

        <View
          style={[
            styles.card,
            { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg },
          ]}
        >
          <Text
            accessibilityRole="header"
            style={[styles.titleHi, { color: colors.ink, fontFamily: typography.readerTitle.fontFamily }]}
          >
            {step.titleHi}
          </Text>
          <Text style={[styles.titleEn, { color: colors.inkMuted, fontFamily: typography.subtitle.fontFamily }]}>
            {step.titleEn}
          </Text>

          <View style={[styles.rule, { backgroundColor: colors.divider }]} />

          <Text style={[styles.bodyHi, { color: colors.ink, fontFamily: typography.meaning.fontFamily }]}>
            {step.bodyHi}
          </Text>
          <Text style={[styles.bodyEn, { color: colors.inkSoft, fontFamily: typography.meaning.fontFamily }]}>
            {step.bodyEn}
          </Text>

          <View style={styles.dots} accessibilityElementsHidden importantForAccessibility="no">
            {tourSteps.map((s, i) => (
              <View
                key={s.id}
                style={[styles.dot, { backgroundColor: i === stepIndex ? colors.saffron : colors.dotRest }]}
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
                { borderColor: colors.divider, borderRadius: radii.md, opacity: isFirst ? 0.3 : pressed ? 0.6 : 1 },
              ]}
            >
              <Text style={[styles.secondaryLabel, { color: colors.inkSoft, fontFamily: typography.cardLatin.fontFamily }]}>
                Back
              </Text>
            </Pressable>

            <Pressable
              onPress={isLast ? close : next}
              accessibilityRole="button"
              accessibilityLabel={isLast ? 'Done' : 'Next step'}
              style={({ pressed }) => [
                styles.primary,
                { backgroundColor: colors.saffron, borderRadius: radii.md, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Text style={[styles.primaryLabel, { color: colors.onPrimary, fontFamily: typography.readerTitle.fontFamily }]}>
                {isLast ? 'Done · पूर्ण' : 'Next · आगे'}
              </Text>
            </Pressable>
          </View>
        </View>

        {placement.arrow === 'down' && (
          <View style={styles.pointerRow} accessibilityElementsHidden importantForAccessibility="no">
            <View style={[styles.pointerDown, { marginLeft: placement.arrowLeft, borderTopColor: colors.parchmentSoft }]} />
          </View>
        )}
      </View>
      </View>
    </TourOverlayContainer>
  );
}

/**
 * iOS renders the tour in a separate UIWindow via FullWindowOverlay so the
 * spotlight floats above the navigator, tab bar, and mini-player. On Android
 * FullWindowOverlay can land in a detached window that the accessibility tree
 * (TalkBack + Maestro) never sees, so render the overlay in-tree there — the
 * top-level root View already spans the screen and the children use
 * StyleSheet.absoluteFill. Keeping it in-tree fixes both the a11y gap and e2e
 * drivability without changing the iOS presentation.
 */
function TourOverlayContainer({ children }: { children: React.ReactNode }) {
  if (Platform.OS === 'ios') {
    return (
      <FullWindowOverlay unstable_accessibilityContainerViewIsModal>
        {children}
      </FullWindowOverlay>
    );
  }
  return <>{children}</>;
}

const styles = StyleSheet.create({
  overlay: { zIndex: 9999, elevation: 9999 },
  headerRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  stepCount: { fontSize: 13, letterSpacing: 1.6, textTransform: 'uppercase', includeFontPadding: false },
  skipBtn: { paddingHorizontal: 8, paddingVertical: 6 },
  skipLabel: { fontSize: 13, letterSpacing: 1.6, textTransform: 'uppercase', includeFontPadding: false },
  ring: {
    position: 'absolute',
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  cardWrap: { position: 'absolute', left: 0, right: 0, paddingHorizontal: CARD_HPAD },
  card: {
    borderWidth: 1,
    padding: 18,
    shadowColor: '#0a0604',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 10,
  },
  titleHi: { fontSize: 20, includeFontPadding: false, textAlign: 'center' },
  titleEn: { fontSize: 13, marginTop: 2, fontStyle: 'italic', textAlign: 'center', includeFontPadding: false },
  rule: { height: 1, marginVertical: 12, opacity: 0.8 },
  bodyHi: { fontSize: 14, lineHeight: 24, textAlign: 'left' },
  bodyEn: { fontSize: 12, lineHeight: 20, marginTop: 8, textAlign: 'left', opacity: 0.85 },
  dots: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 14 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  controls: { flexDirection: 'row', gap: 10, marginTop: 14 },
  secondary: { flex: 1, borderWidth: 1, paddingVertical: 12, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  secondaryLabel: { fontSize: 12, letterSpacing: 1.4, textTransform: 'uppercase', includeFontPadding: false },
  primary: { flex: 2, paddingVertical: 12, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  primaryLabel: { fontSize: 14, includeFontPadding: false },
  pointerRow: { flexDirection: 'row' },
  pointerUp: {
    width: 0,
    height: 0,
    borderLeftWidth: POINTER_W / 2,
    borderRightWidth: POINTER_W / 2,
    borderBottomWidth: POINTER_H,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  pointerDown: {
    width: 0,
    height: 0,
    borderLeftWidth: POINTER_W / 2,
    borderRightWidth: POINTER_W / 2,
    borderTopWidth: POINTER_H,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});
