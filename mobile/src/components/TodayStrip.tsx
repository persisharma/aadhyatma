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
import { pillTextStyle, scriptTitleFont } from '@/utils/langType';

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

  const todayKey = new Date().toDateString();
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

  const festChips = observances.slice(0, 2);

  const chipText = pillTextStyle(lang, {
    ...typography.versePill,
    letterSpacing: 0.8,
    fontSize: 10.5,
  });

  // Time ranges never render in the thin italic face (design.md §3).
  const muhuratChips = muhurat
    ? [
        muhurat.abhijit && {
          key: 'abhijit',
          labelHi: 'अभिजीत',
          labelEn: 'Abhijit',
          range: formatRange(muhurat.abhijit.start, muhurat.abhijit.end),
          bg: colors.goldChipBg,
          fg: colors.saffronDeep,
        },
        {
          key: 'rahu',
          labelHi: 'राहु काल',
          labelEn: 'Rahu Kaal',
          range: formatRange(muhurat.rahu.start, muhurat.rahu.end),
          bg: colors.avoidChipBg,
          fg: colors.avoid,
        },
      ].filter((c): c is NonNullable<typeof c> => Boolean(c))
    : [];

  const a11yFest = festChips.map((o) => o.rule.nameEn).join(', ');
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
        <Text
          style={{
            // cardLatin (Cormorant) has no Indic glyphs, and Latin tracking
            // splits the shirorekha — script serif for hi/gu/kn (design.md §3).
            fontFamily:
              lang === 'en'
                ? typography.cardLatin.fontFamily
                : scriptTitleFont(lang, fontFamilies.devanagariBold),
            fontSize: 12,
            letterSpacing: lang === 'en' ? 0.4 : 0,
            color: colors.saffronDeep,
          }}
        >
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
        {festChips.map((o) => (
          <View
            key={o.rule.id}
            style={[styles.chip, { backgroundColor: colors.saffronTint, borderRadius: radii.pill }]}
          >
            <Text numberOfLines={1} style={[chipText, { color: colors.saffronDeep, maxWidth: 180 }]}>
              {contentByLang(lang, o.rule.nameHi, o.rule.nameEn)}
            </Text>
          </View>
        ))}
        {muhuratChips.map((chip) => (
          <View
            key={chip.key}
            style={[styles.chip, { backgroundColor: chip.bg, borderRadius: radii.pill }]}
          >
            <Text numberOfLines={1}>
              <Text style={[chipText, { color: chip.fg }]}>
                {contentByLang(lang, chip.labelHi, chip.labelEn)}
              </Text>
              <Text style={{ fontFamily: fontFamilies.latinSemiBold, fontSize: 11, color: chip.fg }}>
                {'  '}
                {chip.range}
              </Text>
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
