import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import ReaderHeader from '@/components/ReaderHeader';
import PanchangTimelineRow from '@/components/PanchangTimelineRow';
import { useGitaLanguage } from '@/data/gita/language';
import { usePitruSmaran } from '@/contexts/PitruSmaranContext';
import { getVidhiById } from '@/data/vidhi';
import { addDays } from '@/panchang/calendarGrid';
import { computeTithiAndMonth } from '@/panchang/engine';
import { TITHI_NAMES_EN, TITHI_NAMES_HI } from '@/panchang/names';
import { pakshaShraddhaDay, pitruPakshaWindow } from '@/panchang/pitruSmaran';
import { entryDisplayName, shortDate, startOfLocalDay } from '@/panchang/pitruSmaranDisplay';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { contentByLang } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';
import type { MoreStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<MoreStackParamList, 'PitruPakshaOverview'>;

type FortnightRow = {
  key: string;
  date: Date;
  labelHi: string;
  labelEn: string;
  /** Display names of family entries whose shraddha day this is. */
  family: string[];
};

type OverviewState = { year: number; start: Date; end: Date; rows: FortnightRow[] };

function rowKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/**
 * पितृ पक्ष overview (PRD-17) — the fortnight as §33.6 "आगामी · Upcoming" rows:
 * 8 px marker dot (saffron for family-matched days, gold default), short date,
 * tithi-shraddha name, and the matched person's name beneath in saffron-deep.
 * Unknown-tithi entries collect on सर्वपितृ अमावस्या.
 */
export default function PitruPakshaOverviewScreen({ navigation }: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const { entries } = usePitruSmaran();

  const todayMs = startOfLocalDay(new Date()).getTime();
  const [state, setState] = useState<OverviewState | null>(null);

  // The fortnight table needs ~17 memoised sunrise solves plus one shraddha-day
  // solve per entry — assembled off the render path.
  useEffect(() => {
    let cancelled = false;
    const handle = setTimeout(() => {
      try {
        const today = new Date(todayMs);
        let year = today.getFullYear();
        let window = pitruPakshaWindow(year);
        if (window && window.end.getTime() < today.getTime()) {
          year += 1;
          window = pitruPakshaWindow(year);
        }
        if (!window) {
          if (!cancelled) setState(null);
          return;
        }

        // Family mapping: each entry's tithi projected onto its shraddha day.
        const familyByDay = new Map<string, string[]>();
        for (const entry of entries) {
          const day = pakshaShraddhaDay(entry.tithiRule, year);
          if (!day) continue;
          const key = rowKey(day);
          const names = familyByDay.get(key) ?? [];
          names.push(entryDisplayName(entry, lang));
          familyByDay.set(key, names);
        }

        // One row per civil day, purnima through amavasya, named by its sunrise
        // tithi; a kshaya day (sunrise index jumps by 2) carries both names, the
        // same combined form published shraddha calendars use.
        const rows: FortnightRow[] = [];
        for (let d = new Date(window.purnima); d.getTime() <= window.end.getTime(); d = addDays(d, 1)) {
          const isLast = d.getTime() === window.end.getTime();
          const key = rowKey(d);
          let labelHi: string;
          let labelEn: string;
          if (d.getTime() === window.purnima.getTime()) {
            labelHi = 'पूर्णिमा श्राद्ध';
            labelEn = 'Purnima Shraddha';
          } else if (isLast) {
            labelHi = 'सर्वपितृ अमावस्या — अज्ञात तिथियों हेतु';
            labelEn = 'Sarvapitri Amavasya — for unknown tithis';
          } else {
            const { tithiIndex } = computeTithiAndMonth(d, { calendarSystem: 'purnimant' });
            const nextIndex = computeTithiAndMonth(addDays(d, 1), { calendarSystem: 'purnimant' }).tithiIndex;
            const kshayaIndex = (tithiIndex + 2) % 30 === nextIndex ? (tithiIndex + 1) % 30 : null;
            labelHi = kshayaIndex !== null
              ? `${TITHI_NAMES_HI[tithiIndex]} व ${TITHI_NAMES_HI[kshayaIndex]} श्राद्ध`
              : `${TITHI_NAMES_HI[tithiIndex]} श्राद्ध`;
            labelEn = kshayaIndex !== null
              ? `${TITHI_NAMES_EN[tithiIndex]} & ${TITHI_NAMES_EN[kshayaIndex]} Shraddha`
              : `${TITHI_NAMES_EN[tithiIndex]} Shraddha`;
          }
          rows.push({ key, date: new Date(d), labelHi, labelEn, family: familyByDay.get(key) ?? [] });
        }
        if (!cancelled) setState({ year, start: window.start, end: window.end, rows });
      } catch {
        if (!cancelled) setState(null);
      }
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [entries, lang, todayMs]);

  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);
  const titleFont = scriptTitleFont(lang, typography.readerTitle.fontFamily);
  const shraddhaVidhi = getVidhiById('shraddha-tarpan-vidhi');
  const vidhiOccurrence = state?.rows.find((row) => row.family.length > 0)?.date ?? state?.start ?? null;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ReaderHeader
          variant="index"
          title={contentByLang(lang, `पितृ पक्ष ${state?.year ?? ''}`.trim(), `Pitru Paksha ${state?.year ?? ''}`.trim())}
          onBack={() => navigation.goBack()}
        />
        {state === null ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.saffron} />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing.xxl }]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.hero}>
              <Text style={{ fontFamily: titleFont, fontSize: 18, color: colors.ink, textAlign: 'center' }}>
                {shortDate(state.start, lang)} – {shortDate(state.end, lang)}
              </Text>
              <Text style={{ fontFamily: bodyFont, fontSize: 13, color: colors.inkSoft, textAlign: 'center', marginTop: 3 }}>
                {contentByLang(
                  lang,
                  'भाद्रपद कृष्ण पक्ष · आपके परिवार की श्राद्ध-तिथियाँ',
                  'The Mahalaya fortnight · your family’s shraddha tithis'
                )}
              </Text>
            </View>

            {state.rows.map((row, i) => (
              <PanchangTimelineRow
                key={row.key}
                markerColor={row.family.length > 0 ? colors.saffron : colors.gold}
                dateLabel={shortDate(row.date, lang)}
                title={contentByLang(lang, row.labelHi, row.labelEn)}
                secondary={row.family.map((who) => `॥ ${who}`)}
                density="comfortable"
                showDivider={i < state.rows.length - 1}
                accessibilityLabel={`${shortDate(row.date, 'en')}, ${row.labelEn}${row.family.length > 0 ? `, ${row.family.join(', ')}` : ''}`}
              />
            ))}

            {shraddhaVidhi && vidhiOccurrence && (
              <Pressable
                onPress={() => navigation.navigate('VidhiDetail', {
                  vidhiId: shraddhaVidhi.id,
                  dateMs: vidhiOccurrence.getTime(),
                })}
                testID="pitru-paksha-vidhi-door"
                accessibilityRole="button"
                accessibilityLabel="Open Tila-Tarpana remembrance guide"
                style={({ pressed }) => [
                  styles.vidhiDoor,
                  { backgroundColor: colors.goldTint, borderColor: colors.gold, borderRadius: radii.md },
                  pressed && { opacity: 0.75 },
                ]}
              >
                <View style={styles.vidhiDoorMain}>
                  <Text style={{ fontFamily: titleFont, fontSize: 15, color: colors.ink }}>
                    ॥ {contentByLang(lang, 'पितृ तिल-तर्पण स्मरण', 'Pitru Tila-Tarpana Remembrance')}
                  </Text>
                  <Text style={{ fontFamily: bodyFont, fontSize: 12, lineHeight: 18, color: colors.inkMuted, marginTop: 2 }}>
                    {shortDate(vidhiOccurrence, lang)} · {contentByLang(lang, 'सीमित गृहस्थ मार्गदर्शिका', 'Limited household guide')}
                  </Text>
                </View>
                <Text style={{ color: colors.inkSoft, fontSize: 17 }}>›</Text>
              </Pressable>
            )}

            <Text style={{ fontFamily: fontFamilies.latinItalic, fontSize: 12, lineHeight: 19, color: colors.inkMuted, textAlign: 'center', marginTop: 16 }}>
              {contentByLang(
                lang,
                'मिलान इसी फ़ोन पर पंचांग इंजन से — सूर्योदय-तिथि पद्धति',
                'Matched on-device by the panchang engine — sunrise-tithi convention'
              )}
            </Text>
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingTop: 4, paddingBottom: 40 },
  hero: { marginTop: 2, marginBottom: 14 },
  vidhiDoor: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginTop: 18,
    minHeight: 52,
  },
  vidhiDoorMain: { flex: 1, minWidth: 0 },
});
