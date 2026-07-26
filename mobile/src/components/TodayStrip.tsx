import React from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useReducedMotion } from '@/utils/useReducedMotion';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { useGitaLanguage } from '@/data/gita/language';
import { useTilePress } from '@/contexts/TilePressContext';
import { usePanchangCalendarSystem, useObservancesForDate } from '@/panchang/usePanchang';
import { useMuhurat } from '@/panchang/useMuhurat';
import { formatRangeCompact } from '@/panchang/muhuratFormat';
import { PAKSHA_NAMES_HI, PAKSHA_NAMES_EN } from '@/panchang/names';
import { contentByLang } from '@/utils/localize';
import { pillTextStyle, scriptTitleFont, eyebrowTextStyle } from '@/utils/langType';
import { useTodayKey } from '@/utils/useTodayKey';

/**
 * Home "आज · Today" strip (design.md §48): a one-card daily-panchang glance —
 * vara + tithi headline plus one row of observance / Abhijit / Rahu Kaal chips —
 * so Home answers "what matters today", not only "what can I read". Tapping
 * anywhere opens the Panchang tab.
 *
 * Data comes from ONE solve: `useMuhurat` (cached, off the render path)
 * supplies both the muhurat windows and the day's PanchangData; observances
 * ride the lighter `useObservancesForDate`. `live: false` skips the per-minute
 * tick — the strip renders only static day windows.
 */
/** Auto-scroll pacing for the chip row. ~24px/s reads as a drift, not a marquee. */
const AUTO_SCROLL_PX_PER_SEC = 24;
const AUTO_SCROLL_END_PAUSE_MS = 1800;

export default function TodayStrip() {
  const { colors, typography, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  // Sibling tab — navigate via the parent so the action bubbles up (same
  // pattern as RoutineBanner / the Panchang spotlight card).
  const rootNav = useNavigation<any>();
  const { beginTilePress, markTileDrag, finishTilePress, activateTile } = useTilePress();
  const openPanchang = React.useCallback(() => rootNav.navigate('PanchangTab'), [rootNav]);
  const [calendarSystem] = usePanchangCalendarSystem();

  // useTodayKey rolls the strip over at midnight / on app foreground — with
  // live:false there is no minute tick, so the date needs its own trigger.
  const todayKey = useTodayKey();
  const today = React.useMemo(() => new Date(todayKey), [todayKey]);
  const observances = useObservancesForDate(today, calendarSystem);
  const { muhurat, panchang } = useMuhurat(today, calendarSystem, { live: false });

  const headlineFont =
    lang === 'en' ? fontFamilies.latinBold : scriptTitleFont(lang, fontFamilies.devanagariBold);
  const headline = panchang
    ? contentByLang(
        lang,
        `${panchang.vara.nameHi} · ${PAKSHA_NAMES_HI[panchang.tithi.paksha]} ${panchang.tithi.nameHi}`,
        `${panchang.vara.nameEn} · ${panchang.tithi.nameEn} (${PAKSHA_NAMES_EN[panchang.tithi.paksha]})`
      )
    : '—';

  const chipText = pillTextStyle(lang, {
    ...typography.versePill,
    letterSpacing: 0.8,
    fontSize: 10.5,
  });

  // One normalized chip list — observances first, then the day's windows — so
  // the pill spec exists once. Chip text colors are the DEEP cuts: the tint
  // composites darker than the raw card surface (colors.contrast.test.ts pins
  // avoidDeep/saffronDeep against the composited chip surfaces). Ranges are
  // compact (shared meridiem written once) so the row needs less width.
  type Chip = { key: string; labelHi: string; labelEn: string; range?: string; bg: string; fg: string };
  const chips: Chip[] = [
    ...observances.slice(0, 2).map((o) => ({
      key: o.rule.id,
      labelHi: o.rule.nameHi,
      labelEn: o.rule.nameEn,
      bg: colors.saffronTint,
      fg: colors.saffronDeep,
    })),
    ...(muhurat?.abhijit
      ? [
          {
            key: 'abhijit',
            labelHi: 'अभिजीत',
            labelEn: 'Abhijit',
            range: formatRangeCompact(muhurat.abhijit.start, muhurat.abhijit.end),
            bg: colors.goldChipBg,
            fg: colors.saffronDeep,
          },
        ]
      : []),
    ...(muhurat
      ? [
          {
            // Kaal name rides the KaalWindow itself (KAAL_NAMES, muhurat.ts) —
            // no duplicated literals to drift.
            key: muhurat.rahu.key,
            labelHi: muhurat.rahu.nameHi,
            labelEn: muhurat.rahu.nameEn,
            range: formatRangeCompact(muhurat.rahu.start, muhurat.rahu.end),
            bg: colors.avoidChipBg,
            fg: colors.avoidDeep,
          },
        ]
      : []),
  ];

  const a11yFest = observances
    .slice(0, 2)
    .map((o) => o.rule.nameEn)
    .join(', ');
  const a11y = panchang
    ? `Today's Panchang. ${panchang.vara.nameEn}, ${panchang.tithi.nameEn}.${a11yFest ? ` ${a11yFest}.` : ''} Tap to open.`
    : "Today's Panchang. Tap to open.";

  // ── Chip-row auto-scroll ──────────────────────────────────────────────────
  // When the chips overflow the row, drift them to the end and back on a slow
  // loop so off-screen chips surface without a drag. A user drag takes over
  // for good; the loop pauses while the Home tab is unfocused and never runs
  // under reduce-motion (useReducedMotion — live, subscribed). Mutable bits
  // live in one lazily-created ref; replanning is fully synchronous, so
  // nothing can start after unmount.
  const isFocused = useIsFocused();
  const reduceMotion = useReducedMotion();
  const scrollRef = React.useRef<ScrollView>(null);
  type AutoScrollState = {
    layoutW: number;
    contentW: number;
    dragged: boolean;
    // Live mirrors of the two hooks, so the stable callbacks read fresh values.
    focused: boolean;
    reduceMotion: boolean;
    anim: Animated.CompositeAnimation | null;
    x: Animated.Value;
  };
  const autoRef = React.useRef<AutoScrollState | null>(null);
  if (autoRef.current == null) {
    autoRef.current = {
      layoutW: 0,
      contentW: 0,
      dragged: false,
      focused: true,
      reduceMotion: false,
      anim: null,
      x: new Animated.Value(0),
    };
  }

  const stopAutoScroll = React.useCallback(() => {
    const s = autoRef.current!;
    s.anim?.stop();
    s.anim = null;
  }, []);

  // Stop and (when allowed) restart the drift against the CURRENT overflow —
  // called on layout/content-size changes too, so a language switch or day
  // rollover re-targets the loop instead of leaving it driving a stale offset.
  const replanAutoScroll = React.useCallback(() => {
    const s = autoRef.current!;
    stopAutoScroll();
    const overflow = s.contentW - s.layoutW;
    if (s.dragged || !s.focused || s.reduceMotion || s.layoutW <= 0 || overflow <= 8) return;
    const duration = (overflow / AUTO_SCROLL_PX_PER_SEC) * 1000;
    const drift = (toValue: number) =>
      Animated.timing(s.x, {
        toValue,
        duration,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: false,
      });
    s.anim = Animated.loop(
      Animated.sequence([
        Animated.delay(AUTO_SCROLL_END_PAUSE_MS),
        drift(overflow),
        Animated.delay(AUTO_SCROLL_END_PAUSE_MS),
        drift(0),
      ])
    );
    s.anim.start();
  }, [stopAutoScroll]);

  const onChipRowDrag = React.useCallback(() => {
    // Stop the auto-drift for good AND mark the shared press gesture as a scroll
    // so a horizontal chip swipe never opens the Panchang tab.
    markTileDrag();
    autoRef.current!.dragged = true;
    stopAutoScroll();
  }, [markTileDrag, stopAutoScroll]);

  React.useEffect(() => {
    const s = autoRef.current!;
    s.focused = isFocused;
    s.reduceMotion = reduceMotion;
    replanAutoScroll();
  }, [isFocused, reduceMotion, replanAutoScroll]);

  React.useEffect(() => {
    const s = autoRef.current!;
    const sub = s.x.addListener(({ value }) => {
      scrollRef.current?.scrollTo?.({ x: value, animated: false });
    });
    return () => {
      s.x.removeListener(sub);
      stopAutoScroll();
    };
  }, [stopAutoScroll]);

  return (
    <Pressable
      onPress={() => activateTile(openPanchang)}
      onPressIn={() => beginTilePress(openPanchang)}
      onPressOut={finishTilePress}
      style={({ pressed }) => [
        styles.card,
        elevation.raised,
        {
          borderRadius: radii.lg,
          borderColor: colors.cardActiveBorder,
          // Opaque base so the Android elevation shadow renders (design.md §4);
          // no overflow:'hidden' — it would clip the iOS shadow — the gradient
          // carries its own matching radius instead.
          backgroundColor: colors.cardActiveFrom,
        },
        pressed && { opacity: 0.85 },
      ]}
      accessibilityRole="button"
      accessibilityLabel={a11y}
    >
      <LinearGradient
        colors={[colors.cardActiveFrom, colors.cardActiveTo]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFillObject, { borderRadius: radii.lg }]}
      />
      <View style={styles.headRow}>
        <Text style={[eyebrowTextStyle(lang, 12), { color: colors.saffronDeep }]}>
          {contentByLang(lang, 'आज का पंचांग', "Today's Panchang")}
        </Text>
        <Text style={{ fontFamily: fontFamilies.latinSemiBold, fontSize: 14, color: colors.saffronDeep }}>
          ›
        </Text>
      </View>
      <Text
        numberOfLines={1}
        style={{
          marginTop: 3,
          fontFamily: headlineFont,
          fontSize: lang === 'en' ? 17 : 16,
          color: colors.ink,
          ...(lang === 'en' ? { letterSpacing: 0.3 } : null),
        }}
      >
        {headline}
      </Text>
      {/* Reserve this row even before the deferred Panchang solve completes.
          Otherwise its later insertion moves the category grid during a press. */}
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
        contentContainerStyle={styles.chipRow}
        onLayout={(e) => {
          autoRef.current!.layoutW = e.nativeEvent.layout.width;
          replanAutoScroll();
        }}
        onContentSizeChange={(w) => {
          autoRef.current!.contentW = w;
          replanAutoScroll();
        }}
        onScrollBeginDrag={onChipRowDrag}
      >
        {chips.map((chip) => (
          <View
            key={chip.key}
            style={[styles.chip, { backgroundColor: chip.bg, borderRadius: radii.pill }]}
          >
            <Text numberOfLines={1} style={{ maxWidth: 200 }}>
              <Text style={[chipText, { color: chip.fg }]}>
                {contentByLang(lang, chip.labelHi, chip.labelEn)}
              </Text>
              {chip.range != null && (
                // Time ranges never render in the thin italic face (design.md §3).
                <Text style={{ fontFamily: fontFamilies.latinSemiBold, fontSize: 11, color: chip.fg }}>
                  {'  '}
                  {chip.range}
                </Text>
              )}
            </Text>
          </View>
        ))}
      </ScrollView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chipScroll: {
    // Cancel the card's horizontal padding so chips run (and clip) at the card
    // edge; the row re-pads its content to align the first chip with the text.
    marginTop: 9,
    marginHorizontal: -14,
    height: 24,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
});
