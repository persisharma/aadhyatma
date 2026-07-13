import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { useGitaLanguage } from '@/data/gita/language';
import { usePanchangCalendarSystem, usePanchangForSelection } from '@/panchang/usePanchang';
import { useMuhurat } from '@/panchang/useMuhurat';
import { formatRange } from '@/panchang/muhuratFormat';
import { contentByLang } from '@/utils/localize';
import { pillTextStyle, scriptTitleFont } from '@/utils/langType';

/**
 * Home "आज · Today" strip (design.md §48): a one-card daily-panchang glance —
 * vara + tithi headline, today's observance chips, and the day's Abhijit /
 * Rahu Kaal windows — so Home answers "what matters today", not only "what can
 * I read". Tapping anywhere opens the Panchang tab. A thin view over the
 * existing engines (`usePanchangForSelection`, `useMuhurat`); both solve off
 * the render path, so the card paints immediately and fills in a frame later.
 */
export default function TodayStrip() {
  const { colors, typography, radii } = useTheme();
  const { lang } = useGitaLanguage();
  // Sibling tab — navigate via the parent so the action bubbles up (same
  // pattern as RoutineBanner / the Panchang spotlight card).
  const rootNav = useNavigation<any>();
  const [calendarSystem] = usePanchangCalendarSystem();

  const todayKey = new Date().toDateString();
  const today = React.useMemo(() => new Date(todayKey), [todayKey]);
  const { panchang, observances } = usePanchangForSelection(today, calendarSystem);
  const { muhurat } = useMuhurat(today, calendarSystem);

  const headlineFont = lang === 'en' ? fontFamilies.latinBold : scriptTitleFont(lang, fontFamilies.devanagariBold);
  const headline = panchang
    ? contentByLang(
        lang,
        `${panchang.vara.nameHi} · ${panchang.tithi.paksha === 'shukla' ? 'शुक्ल' : 'कृष्ण'} ${panchang.tithi.nameHi}`,
        `${panchang.vara.nameEn} · ${panchang.tithi.nameEn} (${panchang.tithi.paksha === 'shukla' ? 'Shukla' : 'Krishna'})`
      )
    : '—';

  const festChips = observances.slice(0, 2);

  const a11yFest = festChips.map((o) => o.rule.nameEn).join(', ');
  const a11y = panchang
    ? `Today's Panchang. ${panchang.vara.nameEn}, ${panchang.tithi.nameEn}.${a11yFest ? ` ${a11yFest}.` : ''} Tap to open.`
    : "Today's Panchang. Tap to open.";

  return (
    <Pressable
      onPress={() => rootNav.navigate('PanchangTab')}
      style={({ pressed }) => [
        styles.card,
        {
          borderRadius: radii.lg,
          borderColor: colors.cardActiveBorder,
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
            fontFamily: typography.cardLatin.fontFamily,
            fontSize: 12,
            letterSpacing: 0.4,
            color: colors.saffronDeep,
          }}
        >
          {contentByLang(lang, 'आज का पंचांग', "Today's Panchang")}
        </Text>
        <Text style={{ fontFamily: fontFamilies.latinSemiBold, fontSize: 14, color: colors.saffron }}>
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
            <Text
              numberOfLines={1}
              style={[
                pillTextStyle(lang, { ...typography.versePill, letterSpacing: 0.8, fontSize: 10.5 }),
                { color: colors.saffronDeep, maxWidth: 180 },
              ]}
            >
              {contentByLang(lang, o.rule.nameHi, o.rule.nameEn)}
            </Text>
          </View>
        ))}
        {muhurat?.abhijit && (
          <View style={[styles.chip, { backgroundColor: colors.goldChipBg, borderRadius: radii.pill }]}>
            <Text numberOfLines={1}>
              <Text
                style={[
                  pillTextStyle(lang, { ...typography.versePill, letterSpacing: 0.8, fontSize: 10.5 }),
                  { color: colors.saffronDeep },
                ]}
              >
                {contentByLang(lang, 'अभिजीत', 'Abhijit')}
              </Text>
              {/* Time ranges never render in the thin italic face (design.md §3). */}
              <Text style={{ fontFamily: fontFamilies.latinSemiBold, fontSize: 11, color: colors.saffronDeep }}>
                {'  '}
                {formatRange(muhurat.abhijit.start, muhurat.abhijit.end)}
              </Text>
            </Text>
          </View>
        )}
        {muhurat && (
          <View style={[styles.chip, { backgroundColor: colors.avoidChipBg, borderRadius: radii.pill }]}>
            <Text numberOfLines={1}>
              <Text
                style={[
                  pillTextStyle(lang, { ...typography.versePill, letterSpacing: 0.8, fontSize: 10.5 }),
                  { color: colors.avoid },
                ]}
              >
                {contentByLang(lang, 'राहु काल', 'Rahu Kaal')}
              </Text>
              <Text style={{ fontFamily: fontFamilies.latinSemiBold, fontSize: 11, color: colors.avoid }}>
                {'  '}
                {formatRange(muhurat.rahu.start, muhurat.rahu.end)}
              </Text>
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: '#3C1E0A',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
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
