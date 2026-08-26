import React from 'react';
import { InteractionManager, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useReducedMotion } from '@/utils/useReducedMotion';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { useGitaLanguage } from '@/data/gita/language';
import { useTilePress } from '@/contexts/TilePressContext';
import { usePanchangCalendarSystem, useObservancesForDate } from '@/panchang/usePanchang';
import { useMuhurat } from '@/panchang/useMuhurat';
import { formatClock, formatRangeCompact } from '@/panchang/muhuratFormat';
import { useMuhuratFollows } from '@/contexts/MuhuratFollowContext';
import { useNextFollowedMuhurat } from '@/panchang/useMuhuratFinder';
import { PAKSHA_NAMES_HI, PAKSHA_NAMES_EN, VARA_NAMES_EN, VARA_NAMES_HI } from '@/panchang/names';
import { transliterateDevanagari } from '@/utils/transliterate';
import { contentByLang } from '@/utils/localize';
import { pillTextStyle, scriptTitleFont, eyebrowTextStyle } from '@/utils/langType';
import { useTodayKey } from '@/utils/useTodayKey';
import { launchMarkOnce } from '@/utils/launchTrace';
import PitruSmaranDayChip from '@/components/PitruSmaranDayChip';
import { moreTabTarget } from '@/navigation/entryRoutes';
import {
  pitruPakshaObservanceForDate,
  type PitruPakshaDayObservance,
  type PitruPakshaWindow,
} from '@/panchang/pitruSmaran';
import {
  ensurePakshaWindow,
  hydrateSmaranSolves,
  knownPakshaWindow,
  persistSmaranSolves,
} from '@/panchang/pitruSmaranSolves';

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
/**
 * Stepped by a timer rather than `Animated`, so the tick rate is ours to pick:
 * 50 ms moves ~1.2 px, below the eye's threshold for a crawl this slow, at a
 * third of a 60 Hz frame budget's worth of wake-ups.
 */
const AUTO_SCROLL_TICK_MS = 50;
/**
 * How long the chip row must hold still before a fresh pass may start. Longer
 * than the deferred solves that fill the row take to land, so the launch's own
 * churn keeps pushing the drift out instead of racing it.
 */
const AUTO_SCROLL_SETTLE_MS = 1200;

/**
 * The day's Pitru-Paksha observance from whatever is already memoised. Never
 * throws — a day the calendar cannot solve simply carries no chip.
 */
function readPitruPaksha(day: Date): PitruPakshaDayObservance | null {
  try {
    return pitruPakshaObservanceForDate(day);
  } catch {
    return null;
  }
}

/**
 * Whether `date` falls in the fortnight at all — the one Pitru-Paksha question
 * answerable with zero engine calls, and on ~350 days of the year the answer is
 * no. Mirrors `pitruPakshaObservanceForDate`'s own bounds exactly; anything
 * inside them needs the day's tithi reads and therefore an idle UI.
 */
function isInsidePakshaWindow(window: PitruPakshaWindow, date: Date): boolean {
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  return day >= window.purnima.getTime() && day <= window.end.getTime();
}

export default function TodayStrip() {
  launchMarkOnce('strip-render');
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
  /**
   * The public Pitru-Paksha chip, resolved the same way every other panchang
   * answer on this card is (§48, `usePitruSmaranSolves`): a memory read paints
   * on the first render, disk is I/O so it runs at once, and only ASTRONOMY
   * waits for an idle UI.
   *
   * This used to be a bare `setTimeout(…, 0)` around the raw engine call, which
   * put the fortnight's cold solve — a Bhadrapada-Purnima scan plus a 20-day
   * amavasya walk, ~250 ms on Hermes and unyielded — on the launch path of the
   * screen every cold start lands on, on EVERY launch: it never went through
   * the persisted `pitruSmaranSolves` layer that exists to make it a
   * once-per-install cost. Hydrating first also primes the engine's own memo, so
   * the common case now touches no astronomy at all.
   */
  const [pitruPakshaToday, setPitruPakshaToday] = React.useState<PitruPakshaDayObservance | null>(
    // A known fortnight answers on the first render: outside it for free, and
    // inside it from the tithi reads the pass that produced the window already
    // memoised (this strip is Home's first resolver, so it is that pass).
    () => (knownPakshaWindow(today.getFullYear()) ? readPitruPaksha(today) : null)
  );
  React.useEffect(() => {
    let cancelled = false;
    let interaction: ReturnType<typeof InteractionManager.runAfterInteractions> | undefined;
    let handle: ReturnType<typeof setTimeout> | undefined;
    const year = today.getFullYear();

    // Everything that can reach the engine — the fortnight scan when it is
    // missing, and the day's two tithi reads when today is inside it — waits for
    // an idle UI, then persists whatever it had to solve.
    const solveWhenIdle = () => {
      interaction = InteractionManager.runAfterInteractions(() => {
        handle = setTimeout(() => {
          if (cancelled) return;
          const cold = knownPakshaWindow(year) === null;
          const value = ensurePakshaWindow(year) ? readPitruPaksha(today) : null;
          if (cancelled) return;
          setPitruPakshaToday(value);
          if (cold) void persistSmaranSolves();
        }, 0);
      });
    };

    void (async () => {
      if (knownPakshaWindow(year) === null) {
        // Disk, immediately — hydration is I/O the JS thread does not perform,
        // and it also primes the engine memo `readPitruPaksha` reads through.
        await hydrateSmaranSolves([], today);
        if (cancelled) return;
      }
      const window = knownPakshaWindow(year);
      if (window && !isInsidePakshaWindow(window, today)) {
        setPitruPakshaToday(null);
        return;
      }
      solveWhenIdle();
    })();

    return () => {
      cancelled = true;
      interaction?.cancel();
      if (handle !== undefined) clearTimeout(handle);
    };
  }, [today]);

  if (panchang) launchMarkOnce('strip-headline (panchang solved)');
  if (observances.length > 0) launchMarkOnce('strip-observance-chips');
  if (pitruPakshaToday) launchMarkOnce('strip-pitru-chip');

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

  // Followed muhurat (PRD-16 §6.7) — resolved off the render path, null unless
  // one is upcoming and still grades.
  const { follows } = useMuhuratFollows();
  const nextFollow = useNextFollowedMuhurat(follows, today.getTime());
  const followWhen = React.useMemo(() => {
    if (!nextFollow) return undefined;
    const d = new Date(nextFollow.dateMs);
    const isToday = d.toDateString() === today.toDateString();
    const wdHi = VARA_NAMES_HI[d.getDay()];
    const day = isToday
      ? contentByLang(lang, 'आज', 'Today')
      : lang === 'en'
        ? VARA_NAMES_EN[d.getDay()].slice(0, 3)
        : lang === 'hi'
          ? wdHi
          : transliterateDevanagari(wdHi, lang);
    return nextFollow.windowStart ? `${day} ${formatClock(nextFollow.windowStart)}` : day;
  }, [nextFollow, today, lang]);

  // One normalized chip list — observances first, then the day's windows — so
  // the pill spec exists once. Chip text colors are the DEEP cuts: the tint
  // composites darker than the raw card surface (colors.contrast.test.ts pins
  // avoidDeep/saffronDeep against the composited chip surfaces). Ranges are
  // compact (shared meridiem written once) so the row needs less width.
  type Chip = { key: string; labelHi: string; labelEn: string; range?: string; bg: string; fg: string; onPress?: () => void };
  const chips: Chip[] = [
    // A followed muhurat leads the row when one is near (PRD-16 §6.7). Purely
    // contextual: `nextFollow` is null unless the user followed a day inside
    // the horizon and it still grades, so a user who follows nothing sees the
    // shipped strip unchanged.
    ...(nextFollow
      ? [{
          key: `muhurat-follow-${nextFollow.dateMs}`,
          labelHi: nextFollow.nameHi,
          labelEn: nextFollow.nameEn,
          range: followWhen,
          bg: colors.saffronTint,
          fg: colors.saffronDeep,
          onPress: () =>
            rootNav.navigate('PanchangTab', {
              screen: 'MuhuratDayDetail',
              params: { occasionId: nextFollow.occasionId, dateMs: nextFollow.dateMs },
              initial: false,
            }),
        }]
      : []),
    ...(pitruPakshaToday
      ? [{
          key: 'pitru-paksha',
          labelHi: pitruPakshaToday.labelHi,
          labelEn: pitruPakshaToday.labelEn,
          bg: colors.saffronTint,
          fg: colors.saffronDeep,
          onPress: () => rootNav.navigate('MoreTab', moreTabTarget('PitruPakshaOverview')),
        }]
      : []),
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
  // When the chips overflow the row, drift them to the end and back ONCE so
  // off-screen chips surface without a drag, then rest. A user drag takes over
  // for good; the pass pauses while the Home tab is unfocused and never runs
  // under reduce-motion (useReducedMotion — live, subscribed). Mutable bits
  // live in one lazily-created ref; every timer it owns lives in that ref and
  // is cleared by `stopAutoScroll`, so nothing can tick after unmount.
  //
  // NOT `Animated` (Aug 2026). This drift cannot use the native driver — it
  // drives `scrollTo` — so an `Animated.loop` meant a requestAnimationFrame
  // tick AND a `scrollTo` bridge call every frame, forever, on the one screen
  // every launch lands on. `isInteraction: false` (#268) stopped it starving
  // `runAfterInteractions`, and that fix is what finally let the day's
  // observance chips arrive — which is precisely what pushes the row into
  // overflow and starts this drift. So Home went from "never idle" to "one
  // endless JS-driven animation competing with the whole launch": the deferred
  // panchang solves, the pitru match, the reminder schedulers and the widget
  // writer all queue behind it, and taps land late. A decorative reveal has no
  // business holding the JS thread at 60 Hz.
  //
  // So: a plain self-scheduling timer at AUTO_SCROLL_TICK_MS, stepping a
  // number. It ticks only while actually drifting (an end pause is one idle
  // `setTimeout`, not 108 no-op frames), issues a `scrollTo` only when the
  // rounded pixel changes, waits AUTO_SCROLL_SETTLE_MS after the last content
  // change so the launch's own churn pushes it clear, and after one round trip
  // it stops for good — Home goes fully idle. A genuine content change (chips
  // landing, a language switch, the midnight rollover) re-arms exactly one
  // fresh pass.
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
    /** Current drift offset, and the last offset actually pushed to the row. */
    x: number;
    lastPx: number;
    /** +1 drifting towards the end, −1 returning to the start. */
    dir: 1 | -1;
    /** The round trip has completed — rest until the content changes. */
    revealed: boolean;
    /** The settle delay has already been served for this content. */
    armed: boolean;
    timer: ReturnType<typeof setTimeout> | null;
  };
  const autoRef = React.useRef<AutoScrollState | null>(null);
  if (autoRef.current == null) {
    autoRef.current = {
      layoutW: 0,
      contentW: 0,
      dragged: false,
      focused: true,
      reduceMotion: false,
      x: 0,
      lastPx: 0,
      dir: 1,
      revealed: false,
      armed: false,
      timer: null,
    };
  }

  const stopAutoScroll = React.useCallback(() => {
    const s = autoRef.current!;
    if (s.timer !== null) clearTimeout(s.timer);
    s.timer = null;
  }, []);

  const stepAutoScroll = React.useCallback(() => {
    const s = autoRef.current!;
    s.timer = null;
    const overflow = s.contentW - s.layoutW;
    if (s.revealed || s.dragged || !s.focused || s.reduceMotion || s.layoutW <= 0 || overflow <= 8) {
      return;
    }
    // Only a tick that actually drifts consumes the settle window — a tick that
    // fires while the tab is unfocused must not let a later refocus skip it.
    launchMarkOnce('strip-drift-first-tick');
    s.armed = true;
    const target = s.dir > 0 ? overflow : 0;
    const delta = (AUTO_SCROLL_PX_PER_SEC * AUTO_SCROLL_TICK_MS) / 1000;
    const next = s.dir > 0 ? Math.min(target, s.x + delta) : Math.max(target, s.x - delta);
    s.x = next;
    // One bridge call per whole pixel, not per tick: at 24 px/s a tick moves
    // well under a pixel, so most ticks have nothing to push.
    const px = Math.round(next);
    if (px !== s.lastPx) {
      s.lastPx = px;
      scrollRef.current?.scrollTo?.({ x: px, animated: false });
    }
    if (next !== target) {
      s.timer = setTimeout(stepAutoScroll, AUTO_SCROLL_TICK_MS);
      return;
    }
    if (s.dir > 0) {
      // Reached the end — pause, then come back.
      s.dir = -1;
      s.timer = setTimeout(stepAutoScroll, AUTO_SCROLL_END_PAUSE_MS);
      return;
    }
    // Home again. The reveal is done; leave the thread alone until the chips
    // themselves change.
    s.revealed = true;
  }, []);

  // Stop and (when allowed) re-arm the drift against the CURRENT overflow —
  // called on layout/content-size changes too, so a language switch or day
  // rollover re-targets the pass instead of driving a stale offset.
  const replanAutoScroll = React.useCallback(() => {
    const s = autoRef.current!;
    stopAutoScroll();
    const overflow = s.contentW - s.layoutW;
    if (s.revealed || s.dragged || !s.focused || s.reduceMotion || s.layoutW <= 0 || overflow <= 8) {
      return;
    }
    // A pass that has already started resumes on its own cadence; a fresh one
    // waits out the settle window so it never drifts into the launch.
    s.timer = setTimeout(stepAutoScroll, s.armed ? AUTO_SCROLL_TICK_MS : AUTO_SCROLL_SETTLE_MS);
  }, [stepAutoScroll, stopAutoScroll]);

  const onChipRowDrag = React.useCallback(() => {
    // Stop the auto-drift for good AND mark the shared press gesture as a scroll
    // so a horizontal chip swipe never opens the Panchang tab.
    markTileDrag();
    autoRef.current!.dragged = true;
    stopAutoScroll();
  }, [markTileDrag, stopAutoScroll]);

  // A real content change (the deferred chips landing, a language switch, the
  // midnight rollover) is the only thing that earns a new pass — re-serving the
  // settle delay with it, so several changes in a row collapse into one drift
  // after the last of them rather than one per change.
  const onChipRowContentSize = React.useCallback(
    (w: number) => {
      const s = autoRef.current!;
      if (w !== s.contentW) {
        s.contentW = w;
        s.revealed = false;
        s.armed = false;
        s.dir = 1;
      }
      replanAutoScroll();
    },
    [replanAutoScroll]
  );

  React.useEffect(() => {
    const s = autoRef.current!;
    s.focused = isFocused;
    s.reduceMotion = reduceMotion;
    replanAutoScroll();
  }, [isFocused, reduceMotion, replanAutoScroll]);

  React.useEffect(() => stopAutoScroll, [stopAutoScroll]);

  return (
    <View
      style={[
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
      ]}
    >
      <LinearGradient
        colors={[colors.cardActiveFrom, colors.cardActiveTo]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFillObject, { borderRadius: radii.lg }]}
      />
      {/* The card shell is not one accessibility element: private Smaran chips
          must remain independently focusable/tappable on iOS. This header keeps
          the original Panchang action and label without swallowing its siblings. */}
      <Pressable
        onPress={() => activateTile(openPanchang)}
        onPressIn={() => beginTilePress(openPanchang)}
        onPressOut={finishTilePress}
        accessibilityRole="button"
        accessibilityLabel={a11y}
      >
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
      </Pressable>
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
        onContentSizeChange={onChipRowContentSize}
        onScrollBeginDrag={onChipRowDrag}
        onTouchStart={stopAutoScroll}
      >
        {/* Personal remembrance is the most time-sensitive item in this row;
            keep it first so it is fully visible and tappable before overflow. */}
        <PitruSmaranDayChip date={today} compact />
        {chips.map((chip) => {
          const action = chip.onPress ?? openPanchang;
          return (
          <Pressable
            key={chip.key}
            onPress={() => activateTile(action)}
            onPressIn={() => beginTilePress(action)}
            onPressOut={finishTilePress}
            accessibilityRole="button"
            accessibilityLabel={chip.labelEn}
            style={({ pressed }) => [
              styles.chip,
              { backgroundColor: chip.bg, borderRadius: radii.pill },
              pressed && { opacity: 0.7 },
            ]}
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
          </Pressable>
        );})}
      </ScrollView>
    </View>
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
