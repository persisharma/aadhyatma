import React from 'react';
import { InteractionManager, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useReducedMotion } from '@/utils/useReducedMotion';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { useGitaLanguage } from '@/data/gita/language';
import { useTilePress } from '@/contexts/TilePressContext';
import { usePanchangLocation } from '@/contexts/PanchangLocationContext';
import {
  usePanchangCalendarSystem,
  useObservancesForDate,
  useUpcomingObservances,
} from '@/panchang/usePanchang';
import { useMuhurat } from '@/panchang/useMuhurat';
import { nextAuspiciousPeriod } from '@/panchang/muhurat';
import { prevailingTithi, successorTithiToday } from '@/panchang/prevailingTithi';
import {
  formatClock,
  formatEndInstant,
  formatLongDate,
  formatRangeCompact,
} from '@/panchang/muhuratFormat';
import { toDevanagariDigits } from '@/panchang/pincodes';
import { useHomeRashifal } from '@/panchang/useHomeRashifal';
import { useMuhuratFollows } from '@/contexts/MuhuratFollowContext';
import { useNextFollowedMuhurat } from '@/panchang/useMuhuratFinder';
import { PAKSHA_NAMES_HI, PAKSHA_NAMES_EN, VARA_NAMES_EN, VARA_NAMES_HI } from '@/panchang/names';
import { getVidhiById, getVidhiForFestival } from '@/data/vidhi';
import { transliterateDevanagari } from '@/utils/transliterate';
import { contentByLang } from '@/utils/localize';
import { pillTextStyle, scriptBodyFont, scriptTitleFont, eyebrowTextStyle } from '@/utils/langType';
import { useTodayKey } from '@/utils/useTodayKey';
import { launchMarkOnce } from '@/utils/launchTrace';
import PitruSmaranDayChip from '@/components/PitruSmaranDayChip';
import JanmaTithiDayChip from '@/components/JanmaTithiDayChip';
import { moreTabTarget, panchangTabTarget } from '@/navigation/entryRoutes';
import type { ResolvedObservance } from '@/panchang/types';
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
 * Home "आज · Today" card (design.md §48): the day's panchang answered in one
 * card — date/city eyebrow with a विधान door, vara + tithi headline, the
 * masa/samvat/handover line, the LIVE choghadiya (quality tag, progress, next
 * auspicious), the Rahu Kaal / Abhijit chip row, then a व्रत-पर्व row (today's
 * observance or the next one, with its तैयारी door), a राशिफल row for the
 * active person, and an ask field into जिज्ञासा. Tapping the header opens the
 * Panchang tab; every row carries its own door.
 *
 * Data comes from ONE day solve: `useMuhurat` (cached, off the render path)
 * supplies the muhurat windows and the day's PanchangData; observances and the
 * upcoming list ride the lighter deferred hooks; the Rashifal row solves behind
 * a dynamic import. `live: true` drives the choghadiya row once a minute.
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

/** How far ahead the व्रत-पर्व row looks for the next observance. */
const UPCOMING_LOOKAHEAD_DAYS = 30;

const DAY_MS = 86_400_000;

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

/** Whole civil days from `from` (a local-midnight date) to `to`. */
function daysBetween(from: Date, to: Date): number {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime();
  return Math.round((b - a) / DAY_MS);
}

/** The published vidhi behind an observance, if any (the तैयारी door). */
function vidhiFor(o: ResolvedObservance) {
  return (o.rule.vidhiId ? getVidhiById(o.rule.vidhiId) : null) ?? getVidhiForFestival(o.rule.id);
}

export default function TodayStrip() {
  launchMarkOnce('strip-render');
  const { colors, typography, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  // Sibling tab — navigate via the parent so the action bubbles up (same
  // pattern as RoutineBanner). Home-stack screens (TodayVidhan, Search,
  // VidhiDetail) resolve on this same navigator, since the card is mounted on
  // the Home stack's root screen.
  const rootNav = useNavigation<any>();
  const { beginTilePress, markTileDrag, finishTilePress, activateTile } = useTilePress();
  const openPanchang = React.useCallback(() => rootNav.navigate('PanchangTab'), [rootNav]);
  const openVidhan = React.useCallback(() => rootNav.navigate('TodayVidhan'), [rootNav]);
  const [calendarSystem] = usePanchangCalendarSystem();
  const { location } = usePanchangLocation();

  // useTodayKey rolls the card over at midnight / on app foreground; the
  // minute tick inside useMuhurat only moves the live choghadiya row.
  const todayKey = useTodayKey();
  const today = React.useMemo(() => new Date(todayKey), [todayKey]);
  const observances = useObservancesForDate(today, calendarSystem);
  const upcoming = useUpcomingObservances(today, calendarSystem, {
    count: 3,
    withinDays: UPCOMING_LOOKAHEAD_DAYS,
  });
  const { muhurat, panchang, nowChoghadiya } = useMuhurat(today, calendarSystem);
  const rashifal = useHomeRashifal(today);
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

  // ── Type ──────────────────────────────────────────────────────────────────
  // Titles: script-bold serif for hi/gu/kn, Cormorant bold for en. Body copy:
  // the script's medium serif, Cormorant medium for en. Clock digits ALWAYS
  // ride latinSemiBold — never the thin italic (design.md §3). Cormorant's
  // small x-height reads a point smaller than the Indic faces at equal size.
  const isEn = lang === 'en';
  const titleFont = isEn ? fontFamilies.latinBold : scriptTitleFont(lang, fontFamilies.devanagariBold);
  const bodyFont = isEn ? fontFamilies.latin : scriptBodyFont(lang, fontFamilies.devanagari);
  const clockFont = fontFamilies.latinSemiBold;
  const bump = isEn ? 1 : 0;

  // ── Header ────────────────────────────────────────────────────────────────
  const eyebrow = `${contentByLang(lang, 'आज', 'Today')} · ${formatLongDate(today, lang)} · ${contentByLang(
    lang,
    location.labelHi,
    location.labelEn
  )}`;
  const headline = panchang
    ? contentByLang(
        lang,
        `${panchang.vara.nameHi} · ${PAKSHA_NAMES_HI[panchang.tithi.paksha]} ${panchang.tithi.nameHi}`,
        `${panchang.vara.nameEn} · ${panchang.tithi.nameEn} (${PAKSHA_NAMES_EN[panchang.tithi.paksha]})`
      )
    : '—';

  // The masa · samvat · tithi-handover line. The tithi part is LIVE: past the
  // sunrise tithi's end instant it names the tithi actually running now, so the
  // headline's almanac label and this line together never contradict the clock
  // (the MuhuratGlanceCard kicker's rule). Segments so the clock digits can take
  // the Latin semibold face inside an otherwise script-set line.
  const now = Date.now();
  type Seg = { text: string; clock?: boolean };
  const subline: Seg[] = [];
  if (panchang) {
    const masa = contentByLang(
      lang,
      `${panchang.lunarMonth.nameHi}${panchang.lunarMonth.isAdhik ? ' (अधिक)' : ''}`,
      `${panchang.lunarMonth.nameEn}${panchang.lunarMonth.isAdhik ? ' (Adhik)' : ''}`
    );
    const samvat = contentByLang(
      lang,
      `विक्रम संवत् ${toDevanagariDigits(String(panchang.vikramSamvat))}`,
      `Vikram Samvat ${panchang.vikramSamvat}`
    );
    subline.push({ text: `${masa} · ${samvat} · ` });
    const running = prevailingTithi(panchang, new Date(now));
    if (running.nameEn === panchang.tithi.nameEn) {
      if (panchang.tithi.endTime) {
        subline.push({ text: contentByLang(lang, `${running.nameHi} तक `, `${running.nameEn} till `) });
        subline.push({ text: formatEndInstant(panchang.tithi.endTime, panchang.date, lang), clock: true });
        const next = successorTithiToday(panchang);
        if (next) subline.push({ text: contentByLang(lang, `, फिर ${next.nameHi}`, `, then ${next.nameEn}`) });
      } else {
        subline.push({ text: contentByLang(lang, `${running.nameHi} पूरे दिन`, `${running.nameEn} all day`) });
      }
    } else {
      subline.push({ text: contentByLang(lang, `अब ${running.nameHi}`, `now ${running.nameEn}`) });
      if (running.endTime) {
        subline.push({ text: contentByLang(lang, ' · ', ' · till ') });
        subline.push({ text: formatEndInstant(running.endTime, panchang.date, lang), clock: true });
        if (!isEn) subline.push({ text: contentByLang(lang, ' तक', '') });
      }
    }
  }

  // ── Live choghadiya ───────────────────────────────────────────────────────
  const nowAvoid = nowChoghadiya?.quality === 'avoid';
  const nowProgress = nowChoghadiya
    ? Math.min(
        1,
        Math.max(
          0,
          (now - nowChoghadiya.start.getTime()) /
            Math.max(1, nowChoghadiya.end.getTime() - nowChoghadiya.start.getTime())
        )
      )
    : 0;
  // "When is it good next?" — asked only while an avoid period runs; an
  // auspicious "now" answers with its own end instead.
  const nextShubh = muhurat && nowChoghadiya && nowAvoid ? nextAuspiciousPeriod(muhurat, new Date(now)) : null;
  const openMuhuratDetail = React.useCallback(
    () => rootNav.navigate('PanchangTab', panchangTabTarget('MuhuratDetail', { dateMs: today.getTime() })),
    [rootNav, today]
  );

  // ── व्रत-पर्व row ─────────────────────────────────────────────────────────
  const todayObservance = observances[0] ?? null;
  const nextObservance = upcoming.find((o) => o.date.getTime() > today.getTime()) ?? null;
  const focusObservance = todayObservance ?? nextObservance;
  const focusVidhi = focusObservance ? vidhiFor(focusObservance) : null;
  const vratWeekday = (d: Date) =>
    isEn
      ? VARA_NAMES_EN[d.getDay()]
      : lang === 'hi'
        ? VARA_NAMES_HI[d.getDay()]
        : transliterateDevanagari(VARA_NAMES_HI[d.getDay()], lang);
  const inDays = (d: Date) => {
    const n = daysBetween(today, d);
    if (n === 1) return contentByLang(lang, 'कल', 'tomorrow');
    return contentByLang(lang, `${n} दिन में`, `in ${n} days`);
  };
  // Title segments: the observance name is the bold part.
  type VratLine = { lead: string; name: string; sub: string };
  const vratLine: VratLine = todayObservance
    ? {
        lead: contentByLang(lang, 'आज ', 'Today '),
        name: contentByLang(lang, todayObservance.rule.nameHi, todayObservance.rule.nameEn),
        sub: nextObservance
          ? `${contentByLang(lang, 'आगे', 'Next')} ${contentByLang(lang, nextObservance.rule.nameHi, nextObservance.rule.nameEn)} · ${inDays(nextObservance.date)}`
          : contentByLang(lang, todayObservance.rule.deityHi, todayObservance.rule.deityEn),
      }
    : nextObservance
      ? {
          lead: contentByLang(lang, 'आज कोई नहीं · आगे ', 'None today · next '),
          name: contentByLang(lang, nextObservance.rule.nameHi, nextObservance.rule.nameEn),
          sub: `${vratWeekday(nextObservance.date)} ${formatLongDate(nextObservance.date, lang)} · ${inDays(nextObservance.date)}`,
        }
      : {
          lead: contentByLang(lang, 'आज कोई व्रत-पर्व नहीं', 'No vrat or festival today'),
          name: '',
          sub: contentByLang(lang, `अगले ${toDevanagariDigits(String(UPCOMING_LOOKAHEAD_DAYS))} दिनों में कोई नहीं`, `None in the next ${UPCOMING_LOOKAHEAD_DAYS} days`),
        };
  const vratCta = focusVidhi
    ? contentByLang(lang, 'तैयारी', 'Prepare')
    : focusObservance
      ? contentByLang(lang, 'विवरण', 'Details')
      : contentByLang(lang, 'सूची', 'All');
  const openVrat = React.useCallback(() => {
    if (focusObservance && focusVidhi) {
      rootNav.navigate('VidhiDetail', { vidhiId: focusVidhi.id, dateMs: focusObservance.date.getTime() });
      return;
    }
    if (focusObservance) {
      rootNav.navigate('PanchangTab', panchangTabTarget('ObservanceDetail', { ruleId: focusObservance.rule.id }));
      return;
    }
    rootNav.navigate('PanchangTab', panchangTabTarget('ObservanceList', { category: 'vrat' }));
  }, [rootNav, focusObservance, focusVidhi]);

  // ── राशिफल row ────────────────────────────────────────────────────────────
  const rashi = rashifal.value;
  const rashiTitle = rashi
    ? `${contentByLang(lang, rashi.rashiHi, rashi.rashiEn)} · ${contentByLang(lang, rashi.themeHi, rashi.themeEn)}`
    : rashifal.hydrated
      ? contentByLang(lang, 'आज का राशिफल', "Today's Rashifal")
      : '—';
  const rashiSub = rashi
    ? `${
        rashi.personName
          ? contentByLang(lang, `${rashi.personName} की चन्द्र राशि से`, `From ${rashi.personName}'s Moon sign`)
          : contentByLang(lang, 'चन्द्र राशि से', 'From your Moon sign')
      } · ${panchang ? contentByLang(lang, panchang.vara.nameHi, panchang.vara.nameEn) : vratWeekday(today)}`
    : rashifal.hydrated
      ? contentByLang(lang, 'अपनी राशि चुनें', 'Choose your sign')
      : '';
  const openRashifal = React.useCallback(
    () => rootNav.navigate('PanchangTab', panchangTabTarget('Rashifal', undefined)),
    [rootNav]
  );

  // ── Ask field ─────────────────────────────────────────────────────────────
  // The example is a real question the resolver answers (`observance.next`),
  // named after the observance this card is already talking about — so the
  // tap lands on an answer, not an empty box. Falls back to today's windows.
  const askExample = focusObservance
    ? contentByLang(lang, `${focusObservance.rule.nameHi} कब है?`, `When is ${focusObservance.rule.nameEn}?`)
    : contentByLang(lang, 'आज राहु काल कब है?', 'When is Rahu Kaal today?');
  const openAsk = React.useCallback(
    () => rootNav.navigate('Search', { initialQuery: askExample }),
    [rootNav, askExample]
  );

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

  // One normalized chip list — the day's windows plus the contextual chips —
  // so the pill spec exists once. Chip text colors are the DEEP cuts: the tint
  // composites darker than the raw card surface (colors.contrast.test.ts pins
  // avoidDeep/saffronDeep against the composited chip surfaces). Ranges are
  // compact (shared meridiem written once) so the row needs less width.
  // Observances no longer ride this row — they have the व्रत-पर्व row below.
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
            onPress: openMuhuratDetail,
          },
        ]
      : []),
    ...(muhurat?.abhijit
      ? [
          {
            key: 'abhijit',
            labelHi: 'अभिजीत',
            labelEn: 'Abhijit',
            range: formatRangeCompact(muhurat.abhijit.start, muhurat.abhijit.end),
            bg: colors.goldChipBg,
            fg: colors.saffronDeep,
            onPress: openMuhuratDetail,
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

  // ── Shared row pieces ─────────────────────────────────────────────────────
  const pillStyle = [
    styles.pill,
    { borderColor: colors.cardActiveBorder, backgroundColor: colors.parchmentSoft, borderRadius: radii.pill },
  ];
  const renderPill = (label: string) => (
    <View style={pillStyle}>
      <Text numberOfLines={1} style={{ fontFamily: titleFont, fontSize: 13 + bump, color: colors.saffronDeep }}>
        {label}
        <Text style={{ fontFamily: fontFamilies.latinSemiBold, fontSize: 14, color: colors.saffronDeep }}> ›</Text>
      </Text>
    </View>
  );
  const rowLabelStyle = { fontFamily: bodyFont, fontSize: 12 + bump, color: colors.inkMuted };
  const rowTitleStyle = { fontFamily: bodyFont, fontSize: 16 + bump, color: colors.ink, lineHeight: 23 };
  const rowSubStyle = { fontFamily: bodyFont, fontSize: 12.5 + bump, color: colors.inkSoft, marginTop: 2 };

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

      {/* ── Header: eyebrow + headline + handover line → Panchang tab; the
          विधान door sits beside it as its own button. The card shell is not
          one accessibility element: every row and the Smaran chips must remain
          independently focusable/tappable on iOS. */}
      <View style={styles.headRow}>
        <Pressable
          onPress={() => activateTile(openPanchang)}
          onPressIn={() => beginTilePress(openPanchang)}
          onPressOut={finishTilePress}
          accessibilityRole="button"
          accessibilityLabel={a11y}
          style={styles.headMain}
        >
          <Text numberOfLines={1} style={[eyebrowTextStyle(lang, 12), { color: colors.saffronDeep }]}>
            {eyebrow}
          </Text>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
            style={{
              marginTop: 4,
              fontFamily: titleFont,
              fontSize: isEn ? 24 : 22,
              color: colors.ink,
              ...(isEn ? { letterSpacing: 0.3 } : null),
            }}
          >
            {headline}
          </Text>
          {/* Reserve the line before the solve lands so the rows below never
              move under a finger when it does. */}
          <Text numberOfLines={1} style={[styles.subline, { fontFamily: bodyFont, fontSize: 12.5 + bump, color: colors.inkSoft }]}>
            {subline.length === 0
              ? ' '
              : subline.map((seg, i) =>
                  seg.clock ? (
                    <Text key={i} style={{ fontFamily: clockFont, fontSize: 13, color: colors.inkSoft }}>
                      {seg.text}
                    </Text>
                  ) : (
                    <Text key={i}>{seg.text}</Text>
                  )
                )}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => activateTile(openVidhan)}
          onPressIn={() => beginTilePress(openVidhan)}
          onPressOut={finishTilePress}
          accessibilityRole="button"
          accessibilityLabel="Today's Vidhan. Tap to open."
          hitSlop={8}
          style={({ pressed }) => [styles.vidhanDoor, pressed && { opacity: 0.7 }]}
        >
          <Text style={{ fontFamily: titleFont, fontSize: 14 + bump, color: colors.saffronDeep }}>
            {contentByLang(lang, 'विधान', 'Vidhan')}
            <Text style={{ fontFamily: fontFamilies.latinSemiBold, fontSize: 15, color: colors.saffronDeep }}> ›</Text>
          </Text>
        </Pressable>
      </View>

      {/* ── Live choghadiya: quality is carried by the dot AND the text tag
          (§12 — never colour alone). The minute tick re-renders the fraction. */}
      <Pressable
        onPress={() => activateTile(openMuhuratDetail)}
        onPressIn={() => beginTilePress(openMuhuratDetail)}
        onPressOut={finishTilePress}
        accessibilityRole="button"
        accessibilityLabel={
          nowChoghadiya
            ? `Now ${nowChoghadiya.nameEn} Choghadiya, ${nowAvoid ? 'avoid' : 'auspicious'}, till ${formatClock(nowChoghadiya.end)}.${
                nextShubh ? ` Next auspicious ${nextShubh.nameEn} from ${formatClock(nextShubh.start)}.` : ''
              } Tap to open timings.`
            : "Today's timings. Tap to open."
        }
        style={styles.nowBlock}
      >
        <View style={styles.nowRow}>
          <View
            style={[
              styles.dot,
              { backgroundColor: nowChoghadiya ? (nowAvoid ? colors.avoid : colors.saffronDeep) : colors.divider },
            ]}
          />
          <Text numberOfLines={1} style={[styles.nowText, { fontFamily: bodyFont, fontSize: 16 + bump, color: colors.ink }]}>
            {nowChoghadiya ? (
              <Text>
                {contentByLang(lang, 'अभी ', 'Now ')}
                <Text style={{ fontFamily: titleFont }}>{contentByLang(lang, nowChoghadiya.nameHi, nowChoghadiya.nameEn)}</Text>
                {contentByLang(lang, ' चौघड़िया', ' Choghadiya')}
              </Text>
            ) : (
              contentByLang(lang, 'चौघड़िया', 'Choghadiya')
            )}
          </Text>
          {nowChoghadiya && (
            <Text
              style={[
                styles.tag,
                {
                  fontFamily: fontFamilies.latinBold,
                  // Deep cuts on the chip tints — the composite darkens the
                  // surface, so raw `avoid` drops under AA there.
                  color: nowAvoid ? colors.avoidDeep : colors.saffronDeep,
                  backgroundColor: nowAvoid ? colors.avoidChipBg : colors.goldChipBg,
                },
              ]}
            >
              {nowAvoid ? contentByLang(lang, 'त्याज्य', 'avoid') : contentByLang(lang, 'शुभ', 'auspicious')}
            </Text>
          )}
        </View>
        <View
          style={[styles.progressTrack, { backgroundColor: colors.divider }]}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: 100, now: Math.round(nowProgress * 100) }}
          accessibilityLabel={contentByLang(lang, 'चौघड़िया प्रगति', 'Choghadiya progress')}
        >
          <View
            style={[styles.progressFill, { backgroundColor: colors.saffron, width: `${Math.round(nowProgress * 100)}%` }]}
          />
        </View>
        <Text numberOfLines={1} style={[styles.nextLine, { fontFamily: bodyFont, fontSize: 13 + bump, color: colors.inkSoft }]}>
          {!nowChoghadiya ? (
            ' '
          ) : nextShubh ? (
            <Text>
              {contentByLang(lang, 'अगला शुभ · ', 'Next auspicious · ')}
              <Text style={{ color: colors.ink }}>{contentByLang(lang, nextShubh.nameHi, nextShubh.nameEn)}</Text>
              {isEn ? ' from ' : ' '}
              <Text style={{ fontFamily: clockFont, fontSize: 13.5, color: colors.saffronDeep }}>{formatClock(nextShubh.start)}</Text>
              {isEn ? '' : contentByLang(lang, ' से', '')}
            </Text>
          ) : nowAvoid ? (
            contentByLang(lang, 'आज कोई शुभ चौघड़िया शेष नहीं', 'No auspicious choghadiya left today')
          ) : (
            <Text>
              {isEn ? 'till ' : ''}
              <Text style={{ fontFamily: clockFont, fontSize: 13.5, color: colors.saffronDeep }}>{formatClock(nowChoghadiya.end)}</Text>
              {isEn ? '' : contentByLang(lang, ' तक', '')}
            </Text>
          )}
        </Text>
      </Pressable>

      {/* Reserve this row even before the deferred Panchang solve completes.
          Otherwise its later insertion moves the rows below during a press. */}
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
            keep it first so it is fully visible and tappable before overflow.
            The living's जन्म तिथि chip (PRD-29) sits beside it, same register. */}
        <PitruSmaranDayChip date={today} compact />
        <JanmaTithiDayChip date={today} compact />
        {chips.map((chip) => {
          const action = chip.onPress ?? openPanchang;
          return (
          <Pressable
            key={chip.key}
            onPress={() => activateTile(action)}
            onPressIn={() => beginTilePress(action)}
            onPressOut={finishTilePress}
            accessibilityRole="button"
            accessibilityLabel={chip.range ? `${chip.labelEn} ${chip.range}` : chip.labelEn}
            style={({ pressed }) => [
              styles.chip,
              { backgroundColor: chip.bg, borderRadius: radii.pill },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text numberOfLines={1} style={{ maxWidth: 220 }}>
              <Text style={[chipText, { color: chip.fg }]}>
                {contentByLang(lang, chip.labelHi, chip.labelEn)}
              </Text>
              {chip.range != null && (
                // Time ranges never render in the thin italic face (design.md §3).
                <Text style={{ fontFamily: fontFamilies.latinSemiBold, fontSize: 12, color: chip.fg }}>
                  {'  '}
                  {chip.range}
                </Text>
              )}
            </Text>
          </Pressable>
        );})}
      </ScrollView>

      <View style={[styles.divider, { backgroundColor: colors.divider }]} />

      {/* ── व्रत-पर्व: today's observance, or the next one and how far off it is.
          One button per row; the pill is the affordance, not a second control. */}
      <Pressable
        onPress={() => activateTile(openVrat)}
        onPressIn={() => beginTilePress(openVrat)}
        onPressOut={finishTilePress}
        accessibilityRole="button"
        accessibilityLabel={`Vrat and Parv. ${vratLine.lead}${vratLine.name}. ${vratLine.sub}. ${vratCta}.`}
        style={styles.row}
      >
        <Text style={[styles.rowLabel, rowLabelStyle]}>{contentByLang(lang, 'व्रत-पर्व', 'Vrat · Parv')}</Text>
        <View style={styles.rowBody}>
          <Text numberOfLines={2} style={rowTitleStyle}>
            {vratLine.lead}
            {vratLine.name ? <Text style={{ fontFamily: titleFont }}>{vratLine.name}</Text> : null}
          </Text>
          <Text numberOfLines={1} style={rowSubStyle}>
            {vratLine.sub}
          </Text>
        </View>
        {renderPill(vratCta)}
      </Pressable>

      <View style={[styles.divider, { backgroundColor: colors.divider }]} />

      {/* ── राशिफल: the active person's Moon sign and the day's theme (a house
          theme, the same vocabulary the full Rashifal's Favour row uses — never a
          prediction). Guests get the door to the sign picker. */}
      <Pressable
        onPress={() => activateTile(openRashifal)}
        onPressIn={() => beginTilePress(openRashifal)}
        onPressOut={finishTilePress}
        accessibilityRole="button"
        accessibilityLabel={
          rashi
            ? `Rashifal. ${rashi.rashiEn}, ${rashi.rashiWestern}. ${rashi.themeEn}. Read.`
            : 'Rashifal. Choose your sign. Read.'
        }
        style={styles.row}
      >
        <Text style={[styles.rowLabel, rowLabelStyle]}>{contentByLang(lang, 'राशिफल', 'Rashifal')}</Text>
        <View style={styles.rowBody}>
          <Text numberOfLines={2} style={rowTitleStyle}>
            {rashiTitle}
          </Text>
          <Text numberOfLines={1} style={rowSubStyle}>
            {rashiSub || ' '}
          </Text>
        </View>
        {renderPill(contentByLang(lang, 'पढ़ें', 'Read'))}
      </Pressable>

      {/* ── Ask: the जिज्ञासा door, seeded with a question this card is already
          about, so the tap lands on an answer (design.md §71). */}
      <Pressable
        onPress={() => activateTile(openAsk)}
        onPressIn={() => beginTilePress(openAsk)}
        onPressOut={finishTilePress}
        accessibilityRole="button"
        accessibilityLabel={`Ask Vedansh. ${askExample}`}
        style={({ pressed }) => [
          styles.ask,
          { borderColor: colors.divider, borderRadius: radii.md, backgroundColor: colors.parchmentSoft },
          pressed && { opacity: 0.8 },
        ]}
      >
        <Text style={{ fontSize: 15, color: colors.saffron }}>⌕</Text>
        <Text numberOfLines={1} style={[styles.askText, { fontFamily: bodyFont, fontSize: 14 + bump, color: colors.inkSoft }]}>
          {contentByLang(lang, 'पूछें… ', 'Ask… ')}
          {askExample}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  headMain: {
    flex: 1,
  },
  vidhanDoor: {
    paddingTop: 1,
  },
  subline: {
    marginTop: 3,
  },
  nowBlock: {
    marginTop: 12,
  },
  nowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: { width: 12, height: 12, borderRadius: 6 },
  nowText: { flex: 1 },
  // No fontWeight: the call site sets fontFamilies.latinBold, a static 700 file
  // that already carries the weight (see utils/langType.ts).
  tag: { fontSize: 10, letterSpacing: 0.4, textTransform: 'uppercase', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, overflow: 'hidden' },
  progressTrack: { height: 4, borderRadius: 2, marginTop: 8, marginLeft: 22, overflow: 'hidden' },
  progressFill: { height: 4, borderRadius: 2 },
  nextLine: { marginTop: 6, marginLeft: 22 },
  chipScroll: {
    // Cancel the card's horizontal padding so chips run (and clip) at the card
    // edge; the row re-pads its content to align the first chip with the text.
    marginTop: 10,
    marginHorizontal: -14,
    height: 26,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  divider: {
    height: 1,
    marginTop: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 12,
  },
  rowLabel: {
    width: 64,
  },
  rowBody: {
    flex: 1,
  },
  pill: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 32,
    justifyContent: 'center',
  },
  ask: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
  },
  askText: {
    flex: 1,
  },
});
