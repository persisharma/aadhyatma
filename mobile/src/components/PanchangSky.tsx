import React, { useEffect, useRef, useState } from 'react';
import { Animated, StatusBar, StyleSheet, Text, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeContext';
import type { ColorPalette } from '@/theme/colors';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { eyebrowTextStyle, scriptBodyFont, scriptTitleFont } from '@/utils/langType';
import { fontFamilies } from '@/theme/typography';
import { useReducedMotion } from '@/utils/useReducedMotion';
import { useMuhurat } from '@/panchang/useMuhurat';
import { nextAuspiciousPeriod } from '@/panchang/muhurat';
import { formatClock, formatEndInstant, formatRange, isSameLocalDay } from '@/panchang/muhuratFormat';
import { formatSpan } from '@/panchang/muhuratSpan';
import { prevailingTithi } from '@/panchang/prevailingTithi';
import { moonHorizonState } from '@/panchang/moonHorizon';
import { useMoonHorizon } from '@/panchang/useMoonHorizon';
import type { CalendarSystem } from '@/panchang/types';
import CelestialGlyph from './CelestialGlyph';

export type SkyTone = 'night' | 'day';

/** The ink a control needs to sit on the sky in a given tone. */
export type SkyInk = {
  tone: SkyTone;
  ink: string;
  inkSoft: string;
  inkMuted: string;
  accent: string;
  glass: string;
  glassBorder: string;
  glassActive: string;
  glassActiveText: string;
};

export function skyInk(tone: SkyTone, colors: ColorPalette): SkyInk {
  return tone === 'night'
    ? {
        tone,
        ink: colors.nightInk,
        inkSoft: colors.nightInkSoft,
        inkMuted: colors.nightInkMuted,
        accent: colors.nightGold,
        glass: colors.nightGlass,
        glassBorder: colors.nightGlassBorder,
        glassActive: colors.nightGlassActive,
        glassActiveText: colors.saffronDeep,
      }
    : {
        tone,
        ink: colors.ink,
        inkSoft: colors.inkSoft,
        inkMuted: colors.inkMuted,
        accent: colors.saffronDeep,
        glass: colors.dayGlass,
        glassBorder: colors.dayGlassBorder,
        glassActive: colors.dayGlassActive,
        glassActiveText: colors.saffronDeep,
      };
}

// Cormorant's default figures are old-style; clock digits read as one height.
const LINING = ['lining-nums', 'tabular-nums'] as const;
const ZONE_HEIGHT = 132;
const HORIZON = 104;

// Stars kept off the controls: a few in the status-bar band (fractions of the
// width and of the top inset) and the rest over the arc's half of the hero zone
// (fractions of the width and of the zone's height), clear of the hero text.
const BAND_STARS: readonly (readonly [number, number, number])[] = [
  [0.08, 0.45, 1.2], [0.3, 0.7, 1], [0.55, 0.35, 1.3], [0.78, 0.6, 1], [0.95, 0.3, 1.1],
];
const ZONE_STARS: readonly (readonly [number, number, number])[] = [
  [0.56, 0.1, 1.1], [0.66, 0.03, 0.9], [0.74, 0.2, 1.3], [0.83, 0.06, 1], [0.93, 0.16, 1.4],
  [0.97, 0.45, 0.9], [0.6, 0.5, 0.8], [0.88, 0.55, 1],
];

type Point = { x: number; y: number };
const lerp = (a: Point, b: Point, t: number): Point => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

/**
 * The Panchang tab's sky header (design.md §33, option A): full-bleed behind the
 * status bar, it carries the tab's controls (rendered by `children` with the
 * tone's `skyInk`) and answers "what is running now", with a sunrise → sunset
 * progress arc by day. At night the moon is a phase illustration, shown
 * only between its calculated rise and set, separately from night boundaries.
 * Night — a live read between sunset and sunrise — is deep sepia
 * with stars; day, and every browsed date, is saffron with clouds; never indigo.
 * The live read (and its minute tick) lives here, so the minute re-renders the
 * sky and its controls, not the whole Panchang screen.
 */
export default function PanchangSky({
  date,
  calendarSystem,
  topInset,
  focused,
  style,
  children,
  action,
}: {
  date: Date;
  calendarSystem: CalendarSystem;
  /** Status bar inset + the screen's own top padding, so controls sit where they do in every mode. */
  topInset: number;
  /** Whether the screen is the one showing — only then may the sky set the status bar. */
  focused: boolean;
  style?: StyleProp<ViewStyle>;
  children: (ink: SkyInk) => React.ReactNode;
  /** One glass circle at the hero zone's top-right (the day's share, design.md §33a).
   * It lives here, not in the chip row, because that row has no width to spare: a
   * fourth circle there cut "Bengaluru" to 79% on a 390 pt phone and to nothing at 320. */
  action?: (ink: SkyInk) => React.ReactNode;
}) {
  const sky = useMuhurat(date, calendarSystem);
  const tone: SkyTone = sky.isToday && sky.nowChoghadiya?.phase === 'night' ? 'night' : 'day';
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const reduceMotion = useReducedMotion();
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [zoneTop, setZoneTop] = useState(0);
  const glow = useRef(new Animated.Value(0)).current;
  const night = tone === 'night';
  const ink = skyInk(tone, colors);
  const titleFont = scriptTitleFont(lang, typography.cardHindi.fontFamily);
  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);
  const clockFont = lang === 'en' ? fontFamilies.latinSemiBold : bodyFont;

  // A slow breathing halo on the moon/sun; still under reduce-motion.
  useEffect(() => {
    if (reduceMotion) {
      glow.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [glow, reduceMotion]);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== size.w || height !== size.h) setSize({ w: width, h: height });
  };

  const { muhurat, nowChoghadiya, nowRun, isToday, panchang } = sky;
  const at = Date.now();
  const moonTithiIndex = panchang
    ? (isToday ? prevailingTithi(panchang, new Date(at)).index : panchang.tithi.index)
    : undefined;
  const showNow = isToday && nowChoghadiya != null && nowRun != null;
  const run = showNow ? nowRun! : muhurat?.dayChoghadiya ?? null;
  const moonHorizon = useMoonHorizon(night && run ? run[0].start : null);
  const moonState = moonHorizonState(moonHorizon, at);
  const showMoon = moonState === 'above' && moonTithiIndex !== 29;
  const riseLabel = moonHorizon?.nightRise && run
    ? formatEndInstant(moonHorizon.nightRise, isSameLocalDay(moonHorizon.nightRise, date) ? run[0].start : date, lang)
    : '—';
  const moonStatus = moonState === 'unavailable'
    ? contentByLang(lang, 'समय उपलब्ध नहीं', 'Time unavailable')
    : moonState === 'not-risen'
      ? contentByLang(lang, 'अभी उदय नहीं', 'Yet to rise')
      : moonState === 'set'
        ? contentByLang(lang, 'चन्द्रास्त हो चुका है', 'Moon has set')
        : moonTithiIndex === 29
          ? contentByLang(lang, 'अमावस्या', 'Amavasya')
          : contentByLang(lang, 'चन्द्रमा क्षितिज के ऊपर', 'Moon above horizon');
  const nowIndex = showNow ? nowRun!.findIndex((p) => p.start.getTime() === nowChoghadiya!.start.getTime()) : -1;
  // Where on the arc: the share of this half already gone; a browsed day sits
  // its sun at noon.
  const t = showNow && run
    ? Math.min(1, Math.max(0, (at - run[0].start.getTime()) / Math.max(1, run[7].end.getTime() - run[0].start.getTime())))
    : 0.5;
  const nowAvoid = nowChoghadiya?.quality === 'avoid';
  // "When is it good next?" — the rest of THIS half first: before sunrise the
  // running half is last night's, which today's solve does not hold.
  const nextShubh = showNow && nowAvoid && muhurat
    ? nowRun!.slice(nowIndex + 1).find((p) => p.quality === 'auspicious') ?? nextAuspiciousPeriod(muhurat, new Date(at))
    : null;
  const following = showNow && !nowAvoid && nowIndex < 7 ? nowRun![nowIndex + 1] : null;

  const W = size.w;
  const p0 = { x: W * 0.52, y: HORIZON };
  const p2 = { x: W - 24, y: HORIZON };
  const p1 = { x: (p0.x + p2.x) / 2, y: -30 };
  const q0 = lerp(p0, p1, t);
  const q1 = lerp(p1, p2, t);
  const b = lerp(q0, q1, t);

  const startLabel = run
    ? `${run[0].phase === 'night' ? contentByLang(lang, 'सूर्यास्त', 'Sunset') : contentByLang(lang, 'सूर्योदय', 'Sunrise')} ${formatClock(run[0].start)}`
    : '';
  const endLabel = run
    ? `${run[0].phase === 'night' ? contentByLang(lang, 'सूर्योदय', 'Sunrise') : contentByLang(lang, 'सूर्यास्त', 'Sunset')} ${formatClock(run[7].end)}`
    : '';

  const chipBg = nowAvoid ? (night ? colors.nightAvoidTrack : colors.avoidChipBg) : (night ? colors.nightGoldTrack : colors.goldChipBg);
  // Cream on the night chips: coloured text on the composited tints falls under AA.
  const chipText = night ? colors.nightInk : nowAvoid ? colors.avoidDeep : colors.saffronDeep;
  const quality = nowAvoid ? contentByLang(lang, 'त्याज्य', 'avoid') : contentByLang(lang, 'शुभ', 'auspicious');

  return (
    <LinearGradient
      colors={
        night
          ? [colors.skyNightTop, colors.skyNightUpper, colors.skyNightLower, colors.skyNightHorizon]
          : [colors.skyDayTop, colors.skyDayUpper, colors.skyDayLower, colors.skyDayHorizon]
      }
      onLayout={onLayout}
      style={[styles.sky, { paddingTop: topInset }, style]}
    >
      {W > 0 && (
        <Svg width={W} height={size.h} style={StyleSheet.absoluteFill} pointerEvents="none">
          {night
            ? [
                ...BAND_STARS.map(([fx, fy, r], i) => (
                  <Circle key={`b${i}`} cx={fx * W} cy={fy * topInset} r={r} fill={colors.starLight} opacity={i % 2 === 0 ? 0.9 : 0.55} />
                )),
                ...ZONE_STARS.map(([fx, fy, r], i) => (
                  <Circle key={`z${i}`} cx={fx * W} cy={zoneTop + fy * ZONE_HEIGHT} r={r} fill={colors.starLight} opacity={i % 3 === 0 ? 0.55 : 0.9} />
                )),
              ]
            : [
                <Ellipse key="c1" cx={W * 0.86} cy={zoneTop + 22} rx={26} ry={8} fill={colors.cloud} />,
                <Ellipse key="c2" cx={W * 0.9} cy={zoneTop + 16} rx={15} ry={9} fill={colors.cloud} />,
                <Ellipse key="c3" cx={W * 0.62} cy={zoneTop + 6} rx={20} ry={5} fill={colors.cloud} />,
              ]}
        </Svg>
      )}

      {/* Cream status-bar glyphs over the night sky while this screen shows;
          unmounting hands the app's dark style back. */}
      {focused && night && <StatusBar barStyle="light-content" />}

      <View style={styles.controls}>{children(ink)}</View>

      <View style={styles.zone} onLayout={(event) => {
        const y = event.nativeEvent.layout.y;
        if (y !== zoneTop) setZoneTop(y);
      }}>
        {action && <View style={styles.action}>{action(ink)}</View>}
        {W > 0 && muhurat && run && (
          <>
            <Svg width={W} height={ZONE_HEIGHT} style={StyleSheet.absoluteFill} pointerEvents="none">
              <Path
                d={`M0 ${HORIZON + 4} C ${W * 0.13} ${HORIZON - 4}, ${W * 0.26} ${HORIZON + 8}, ${W * 0.41} ${HORIZON + 2} S ${W * 0.72} ${HORIZON - 6}, ${W} ${HORIZON + 4} L ${W} ${ZONE_HEIGHT} L 0 ${ZONE_HEIGHT} Z`}
                fill={night ? colors.skyHillsNight : colors.skyHillsDay}
              />
              {!night && <>
                <Path d={`M${p0.x} ${p0.y} Q${q0.x} ${q0.y} ${b.x} ${b.y}`} stroke={colors.skyArcDay} strokeWidth={1.6} strokeLinecap="round" fill="none" />
                <Path d={`M${b.x} ${b.y} Q${q1.x} ${q1.y} ${p2.x} ${p2.y}`} stroke={colors.skyArcDayRest} strokeWidth={1.5} strokeDasharray="2 5" strokeLinecap="round" fill="none" />
                <Circle cx={p0.x} cy={p0.y} r={2.6} fill={colors.skyArcDay} />
                <Circle cx={p2.x} cy={p2.y} r={2.6} fill={colors.skyArcDayRest} />
              </>}
            </Svg>
            {(!night || showMoon) && <Animated.View
              pointerEvents="none"
              style={[
                styles.glyph,
                {
                  left: night ? W * 0.72 - 24 : b.x - 24,
                  top: night ? 32 : b.y - 24,
                  opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1] }),
                  transform: [{ scale: glow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) }],
                },
              ]}
            >
              <CelestialGlyph kind={night ? 'moon' : 'sun'} tithiIndex={moonTithiIndex} size={30} />
            </Animated.View>}
            <Text numberOfLines={1} style={[styles.arcLabel, { left: p0.x - 60, width: 120, textAlign: 'center', fontFamily: clockFont, color: ink.inkMuted }]}>
              {startLabel}
            </Text>
            <Text numberOfLines={1} style={[styles.arcLabel, { right: 12, width: 120, textAlign: 'right', fontFamily: clockFont, color: ink.inkMuted }]}>
              {endLabel}
            </Text>
          </>
        )}

        {muhurat && (
          <View
            accessible
            accessibilityLabel={
              showNow
                ? `Now ${nowChoghadiya!.nameEn} choghadiya, ${nowAvoid ? 'avoid' : 'auspicious'}, ${formatSpan(nowChoghadiya!.end.getTime() - at, 'en')} left, till ${formatClock(nowChoghadiya!.end)}`
                : `Abhijit muhurat ${muhurat.abhijit ? formatRange(muhurat.abhijit.start, muhurat.abhijit.end) : ''}`
            }
            style={[styles.hero, { width: Math.max(160, W * 0.5 - 24) }]}
          >
            <View style={styles.eyebrowRow}>
              {showNow && <View style={[styles.nowDot, { backgroundColor: nowAvoid ? (night ? colors.nightAvoid : colors.avoid) : (night ? colors.nightGold : colors.gold) }]} />}
              <Text style={[eyebrowTextStyle(lang, 11, 0.6), { color: ink.inkMuted, textTransform: lang === 'en' ? 'uppercase' : 'none' }]}>
                {showNow ? contentByLang(lang, 'अभी', 'Now') : contentByLang(lang, 'शुभ मुहूर्त', 'Auspicious')}
              </Text>
            </View>
            <View style={styles.titleRow}>
              <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: titleFont, fontSize: 30, color: ink.ink }}>
                {showNow ? contentByLang(lang, nowChoghadiya!.nameHi, nowChoghadiya!.nameEn) : contentByLang(lang, 'अभिजीत', 'Abhijit')}
              </Text>
              <Text style={{ fontFamily: bodyFont, fontSize: 15, color: ink.inkSoft }}>
                {showNow ? contentByLang(lang, 'चौघड़िया', 'Choghadiya') : contentByLang(lang, 'मुहूर्त', 'Muhurat')}
              </Text>
              {showNow && (
                <Text style={[styles.chip, { fontFamily: lang === 'en' ? fontFamilies.latinBold : titleFont, color: chipText, backgroundColor: chipBg }]}>
                  {quality}
                </Text>
              )}
            </View>
            {showNow ? (
              <Text numberOfLines={1}>
                <Text style={{ fontFamily: titleFont, fontSize: 14, color: ink.ink }}>
                  {contentByLang(lang, `${formatSpan(nowChoghadiya!.end.getTime() - at, lang)} शेष`, `${formatSpan(nowChoghadiya!.end.getTime() - at, lang)} left`)}
                </Text>
                <Text style={{ fontFamily: clockFont, fontSize: 12.5, color: ink.inkSoft, fontVariant: [...LINING] }}>
                  {contentByLang(lang, ` · ${formatClock(nowChoghadiya!.end)} तक`, ` · till ${formatClock(nowChoghadiya!.end)}`)}
                </Text>
              </Text>
            ) : (
              <Text style={{ fontFamily: clockFont, fontSize: 14, color: ink.inkSoft, fontVariant: [...LINING] }}>
                {muhurat.abhijit ? formatRange(muhurat.abhijit.start, muhurat.abhijit.end) : ''}
              </Text>
            )}
            {nextShubh && (
              <Text numberOfLines={1} style={{ fontFamily: bodyFont, fontSize: 12, color: ink.accent, marginTop: 2 }}>
                {contentByLang(lang, `अगला शुभ: ${nextShubh.nameHi} ${formatClock(nextShubh.start)} से`, `Next auspicious: ${nextShubh.nameEn} from ${formatClock(nextShubh.start)}`)}
              </Text>
            )}
            {following && (
              <Text numberOfLines={1} style={{ fontFamily: bodyFont, fontSize: 12, color: ink.inkMuted, marginTop: 2 }}>
                {contentByLang(
                  lang,
                  `फिर ${following.nameHi} · ${following.quality === 'avoid' ? 'त्याज्य' : 'शुभ'}`,
                  `then ${following.nameEn} · ${following.quality === 'avoid' ? 'avoid' : 'auspicious'}`
                )}
              </Text>
            )}
          </View>
        )}
      </View>
      {night && (
        <View testID="panchang-night-moon-info" style={[styles.moonInfo, { borderTopColor: colors.nightGlassBorder }]}>
          <Text style={{ fontFamily: clockFont, fontSize: 13, lineHeight: 20, color: ink.ink, fontVariant: [...LINING] }}>
            {contentByLang(lang, `चन्द्रोदय ${riseLabel}`, `Moonrise ${riseLabel}`)}
          </Text>
          <Text testID={`moon-horizon-${moonState}`} style={{ fontFamily: bodyFont, fontSize: 12, lineHeight: 18, color: ink.inkSoft }}>
            {moonStatus}
          </Text>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  sky: { borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: 'hidden' },
  controls: { paddingHorizontal: 14 },
  zone: { height: ZONE_HEIGHT, marginTop: 6 },
  moonInfo: { marginHorizontal: 14, borderTopWidth: 1, paddingTop: 6, paddingBottom: 10, minHeight: 64 },
  // The day arc passes below the action; the fixed night moon stays to its left.
  action: { position: 'absolute', top: 0, right: 14, zIndex: 1 },
  glyph: { position: 'absolute', width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  arcLabel: { position: 'absolute', top: HORIZON + 8, fontSize: 11 },
  hero: { position: 'absolute', left: 20, top: 0 },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  nowDot: { width: 6, height: 6, borderRadius: 3 },
  titleRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 1 },
  // No fontWeight: the call site sets a static bold file (see utils/langType.ts).
  chip: { alignSelf: 'center', fontSize: 11, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, overflow: 'hidden' },
});

/** A month-calendar mark for the sky's month-view button (no icon-font cost on the launch path). */
export function MonthGlyph({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M6.5 5h11a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-11a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3zM3.5 10h17M8 3v4M16 3v4" />
    </Svg>
  );
}
