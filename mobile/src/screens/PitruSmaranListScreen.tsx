import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import ReaderHeader from '@/components/ReaderHeader';
import ObservanceListRow from '@/components/ObservanceListRow';
import { useGitaLanguage, type Lang } from '@/data/gita/language';
import { usePitruSmaran } from '@/contexts/PitruSmaranContext';
import { type SmaranEntry } from '@/panchang/pitruSmaran';
import { useSmaranListSolve } from '@/panchang/usePitruSmaranSolves';
import {
  daysUntil,
  entryCaption,
  entryDisplayName,
  relativeDayLabel,
  shortDate,
  shortDateWithYear,
  startOfLocalDay,
} from '@/panchang/pitruSmaranDisplay';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { contentByLang } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';
import type { MoreStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<MoreStackParamList, 'PitruSmaranList'>;

type Row = { entry: SmaranEntry; next: Date | null };

// The seasonal banner surfaces only in the weeks before and during the paksha —
// quiet the rest of the year (design intent: no year-round seasonal chrome).
const BANNER_LEAD_DAYS = 30;

/**
 * पितृ स्मरण list (PRD-17) — one row per remembered person, on the §33
 * ObservanceList row pattern (॥ lead glyph · relation + tithi caption ·
 * right-aligned next date + relative label), sorted soonest-first. No streaks,
 * no celebration, no share affordances anywhere in this feature.
 */
export default function PitruSmaranListScreen({ navigation }: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const { entries, isLoading } = usePitruSmaran();

  const today = startOfLocalDay(new Date());
  const todayMs = today.getTime();

  // Annual solves come from the shared cache: warm on the first render when the
  // answers are already on disk or in memory, and never on the render path when
  // they are not. It also prewarms what the detail screen needs — see
  // `usePitruSmaranSolves`.
  const solve = useSmaranListSolve(entries, todayMs);
  const window_ = solve?.window ?? null;

  const rows = useMemo<Row[] | null>(() => {
    if (!solve) return null;
    const solved: Row[] = entries.map((entry) => ({
      entry,
      next: solve.nextByEntryId.get(entry.id) ?? null,
    }));
    solved.sort((a, b) => {
      const at = a.next?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const bt = b.next?.getTime() ?? Number.MAX_SAFE_INTEGER;
      return at - bt;
    });
    return solved;
  }, [solve, entries]);

  const showBanner =
    window_ !== null &&
    daysUntil(window_.start, today) <= BANNER_LEAD_DAYS &&
    daysUntil(window_.end, today) >= 0;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ReaderHeader
          variant="index"
          title={contentByLang(lang, 'पितृ स्मरण', 'Pitru Smaran')}
          onBack={() => navigation.goBack()}
        />
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing.xxl }]}
          showsVerticalScrollIndicator={false}
        >
          {showBanner && window_ && (
            <Pressable
              onPress={() => navigation.navigate('PitruPakshaOverview')}
              accessibilityRole="button"
              accessibilityLabel="Open Pitru Paksha overview"
              style={({ pressed }) => [
                styles.banner,
                { borderColor: colors.gold, backgroundColor: colors.parchmentSoft, borderRadius: radii.lg },
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 14, color: colors.saffronDeep }}>
                {daysUntil(window_.start, today) > 0
                  ? contentByLang(lang, '॥ पितृ पक्ष निकट है', '॥ Pitru Paksha approaches')
                  : contentByLang(lang, '॥ पितृ पक्ष चल रहा है', '॥ Pitru Paksha is underway')}
              </Text>
              <Text style={{ fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 12, lineHeight: 19, color: colors.inkSoft, marginTop: 3 }}>
                {contentByLang(
                  lang,
                  `${shortDate(window_.start, 'hi')} से — इस पखवाड़े में प्रत्येक की श्राद्ध-तिथि देखें ›`,
                  `From ${shortDate(window_.start, 'en')} — see each shraddha tithi in the fortnight ›`
                )}
              </Text>
            </Pressable>
          )}

          {isLoading || rows === null ? (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.saffron} />
            </View>
          ) : rows.length === 0 ? (
            <View style={styles.empty}>
              <Text style={{ fontSize: 30, color: colors.gold }}>॥</Text>
              <Text style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 15, color: colors.ink, textAlign: 'center', marginTop: 10 }}>
                {contentByLang(lang, 'अपने पितरों की तिथियाँ जोड़ें', 'Add your ancestors’ tithis')}
              </Text>
              <Text style={{ fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 13, lineHeight: 21, color: colors.inkSoft, textAlign: 'center', marginTop: 6 }}>
                {contentByLang(
                  lang,
                  'श्राद्ध व पुण्यतिथि तिथि से मनाई जाती है — एक बार जोड़ें, हर वर्ष की तिथि यह ऐप स्वयं निकालेगा।',
                  'Shraddha and punyatithi follow the tithi, not the civil date — add each once, and every year’s date is solved for you.'
                )}
              </Text>
            </View>
          ) : (
            rows.map(({ entry, next }) => (
              <ObservanceListRow
                key={entry.id}
                leading={(
                  <View style={[styles.lead, { borderColor: colors.goldTint, backgroundColor: colors.parchmentHighlight }]}>
                    <Text style={{ fontSize: 14, color: colors.inkMuted }}>॥</Text>
                  </View>
                )}
                title={(
                  <Text style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 15, color: colors.ink }} numberOfLines={1}>
                    {entryDisplayName(entry, lang)}
                  </Text>
                )}
                caption={(
                  <Text style={{ fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 13, color: colors.inkMuted, marginTop: 2 }} numberOfLines={1}>
                    {entryCaption(entry, lang)}
                  </Text>
                )}
                trailing={next ? (
                  <View style={styles.rowRight}>
                    <Text style={{ fontFamily: dateFont(lang, typography), fontSize: 13, color: colors.inkSoft }}>
                      {shortDateWithYear(next, lang)}
                    </Text>
                    <Text style={{ fontFamily: dateFont(lang, typography), fontSize: 13, color: colors.inkSoft, marginTop: 1 }}>
                      {relativeDayLabel(next, today, lang)}
                    </Text>
                  </View>
                ) : undefined}
                onPress={() => navigation.navigate('PitruSmaranDetail', { entryId: entry.id })}
                accessibilityLabel={[
                  `Smaran ${entryDisplayName(entry, 'en')}`,
                  entryDisplayName(entry, lang),
                  entryCaption(entry, lang),
                  next ? `Next ${shortDateWithYear(next, 'en')}, ${relativeDayLabel(next, today, 'en')}` : null,
                ].filter(Boolean).join(', ')}
              />
            ))
          )}

          <Pressable
            onPress={() => navigation.navigate('PitruSmaranEdit', {})}
            accessibilityRole="button"
            accessibilityLabel="Add smaran"
            style={({ pressed }) => [
              styles.addBtn,
              { borderColor: colors.gold, backgroundColor: colors.parchmentHighlight, borderRadius: radii.md },
              pressed && { opacity: 0.8 },
            ]}
          >
            <Text style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 14, color: colors.saffronDeep }}>
              {contentByLang(lang, '+ स्मरण जोड़ें', '+ Add smaran')}
            </Text>
          </Pressable>

          <Text style={{ fontFamily: fontFamilies.latinItalic, fontSize: 12, lineHeight: 19, color: colors.inkMuted, textAlign: 'center', marginTop: 14 }}>
            {contentByLang(
              lang,
              'यह सूची केवल इसी फ़ोन पर रहती है — तिथियाँ इसी फ़ोन पर पंचांग इंजन से निकाली जाती हैं',
              'This list lives only on this phone — solved on-device by the same engine as the festivals'
            )}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// Right-column date/relative labels: Latin semibold for English, script body
// serif otherwise (mirrors ObservanceListScreen's right column).
function dateFont(lang: Lang, typography: { meaning: { fontFamily: string } }): string {
  return lang === 'en' ? fontFamilies.latinSemiBold : scriptBodyFont(lang, typography.meaning.fontFamily);
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingTop: 4, paddingBottom: 32 },
  banner: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 13, marginBottom: 14 },
  loading: { paddingVertical: 48, alignItems: 'center' },
  empty: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 12 },
  lead: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  rowRight: { alignItems: 'flex-end' },
  addBtn: { borderWidth: 1.5, minHeight: 48, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
});
