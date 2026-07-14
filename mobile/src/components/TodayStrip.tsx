import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { useGitaLanguage } from '@/data/gita/language';
import { usePanchangCalendarSystem, useObservancesForDate } from '@/panchang/usePanchang';
import { useMuhurat } from '@/panchang/useMuhurat';
import { formatRange } from '@/panchang/muhuratFormat';
import { PAKSHA_NAMES_HI, PAKSHA_NAMES_EN } from '@/panchang/names';
import { contentByLang } from '@/utils/localize';
import { pillTextStyle, scriptTitleFont, eyebrowTextStyle } from '@/utils/langType';
import { useTodayKey } from '@/utils/useTodayKey';

/**
 * Home "आज · Today" strip (design.md §48): a one-card daily-panchang glance —
 * vara + tithi headline, today's observance chips, and the day's Abhijit /
 * Rahu Kaal windows — so Home answers "what matters today", not only "what can
 * I read". Tapping anywhere opens the Panchang tab.
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

  // One normalized chip list — observances first, then the day's windows — so
  // the pill spec exists once. Chip text colors are the DEEP cuts: the tint
  // composites darker than the raw card surface (colors.contrast.test.ts pins
  // avoidDeep/saffronDeep against the composited chip surfaces).
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
            range: formatRange(muhurat.abhijit.start, muhurat.abhijit.end),
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
            range: formatRange(muhurat.rahu.start, muhurat.rahu.end),
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
      <View style={styles.chipRow}>
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
      </View>
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
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 9,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
});
