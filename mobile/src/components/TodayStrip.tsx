import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { useGitaLanguage } from '@/data/gita/language';
import { usePanchangCalendarSystem, useObservancesForDate } from '@/panchang/usePanchang';
import { useMuhurat } from '@/panchang/useMuhurat';
import { formatRangeCompact } from '@/panchang/muhuratFormat';
import { PAKSHA_NAMES_HI, PAKSHA_NAMES_EN } from '@/panchang/names';
import { contentByLang } from '@/utils/localize';
import { pillTextStyle, scriptTitleFont, scriptBodyFont, eyebrowTextStyle } from '@/utils/langType';
import { useTodayKey } from '@/utils/useTodayKey';

/**
 * Home "आज · Today" strip (design.md §48): a one-card daily-panchang glance —
 * vara + tithi headline, today's lead observance pill, and one quiet line with
 * the day's Abhijit / Rahu Kaal windows — so Home answers "what matters today",
 * not only "what can I read". Tapping anywhere opens the Panchang tab.
 *
 * Data comes from ONE solve: `useMuhurat` (cached, off the render path)
 * supplies both the muhurat windows and the day's PanchangData; observances
 * ride the lighter `useObservancesForDate`. `live: false` skips the per-minute
 * tick — the strip renders only static day windows.
 */
export default function TodayStrip() {
  const { colors, typography, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  // Sibling tab — navigate via the parent so the action bubbles up (same
  // pattern as RoutineBanner / the Panchang spotlight card).
  const rootNav = useNavigation<any>();
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

  // One lead observance pill at most — the full observance list lives on the
  // Panchang tab this card opens. The former per-window pills read as a wall
  // of caps; the windows now share one quiet dot-marked meta line instead.
  const observance = observances[0];

  type DayWindow = { key: string; labelHi: string; labelEn: string; range: string; dot: string };
  const windows: DayWindow[] = [
    ...(muhurat?.abhijit
      ? [
          {
            key: 'abhijit',
            labelHi: 'अभिजीत',
            labelEn: 'Abhijit',
            range: formatRangeCompact(muhurat.abhijit.start, muhurat.abhijit.end),
            dot: colors.gold,
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
            dot: colors.avoid,
          },
        ]
      : []),
  ];

  // Meta-line text: inkMuted clears AA on both gradient stops
  // (colors.contrast.test.ts); numerals/ranges never in the thin italic (§3).
  const windowLabelFont =
    lang === 'en' ? fontFamilies.latinSemiBold : scriptBodyFont(lang, fontFamilies.devanagari);

  const a11y = panchang
    ? `Today's Panchang. ${panchang.vara.nameEn}, ${panchang.tithi.nameEn}.${observance ? ` ${observance.rule.nameEn}.` : ''} Tap to open.`
    : "Today's Panchang. Tap to open.";

  return (
    <Pressable
      onPress={() => rootNav.navigate('PanchangTab')}
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
      {(observance != null || windows.length > 0) && (
        <View style={styles.metaRow}>
          {observance != null && (
            <View
              style={[styles.chip, { backgroundColor: colors.saffronTint, borderRadius: radii.pill }]}
            >
              <Text numberOfLines={1} style={[chipText, { maxWidth: 200, color: colors.saffronDeep }]}>
                {contentByLang(lang, observance.rule.nameHi, observance.rule.nameEn)}
              </Text>
            </View>
          )}
          {windows.map((w) => (
            <View key={w.key} style={styles.window}>
              <View style={[styles.dot, { backgroundColor: w.dot }]} />
              <Text numberOfLines={1}>
                <Text style={{ fontFamily: windowLabelFont, fontSize: 12, color: colors.inkMuted }}>
                  {contentByLang(lang, w.labelHi, w.labelEn)}
                </Text>
                <Text
                  style={{ fontFamily: fontFamilies.latinSemiBold, fontSize: 12, color: colors.inkMuted }}
                >
                  {' '}
                  {w.range}
                </Text>
              </Text>
            </View>
          ))}
        </View>
      )}
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
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: 14,
    rowGap: 6,
    marginTop: 9,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  window: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
