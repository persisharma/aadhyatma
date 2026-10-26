import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import ObservancePreviewCard from '@/components/ObservancePreviewCard';
import ReaderHeader from '@/components/ReaderHeader';
import { observanceMonth, observanceCountdown } from '@/panchang/observancePresentation';
import ShareButton from '@/components/ShareButton';
import { useShare } from '@/utils/shareVerse';
import { buildListingShare } from '@/utils/listingShare';
import TextField from '@/components/TextField';
import AreaFilterChips, { areaName } from '@/components/AreaFilterChips';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage, type Lang } from '@/data/gita/language';
import { usePanchangCalendarSystem } from '@/panchang/usePanchang';
import { getNextOccurrence, getRulesForCategory, type BrowseCategory } from '@/panchang/vratCatalog';
import { useVratFollows } from '@/contexts/VratFollowContext';
import { areasPresent, getObservanceAreas, matchesAreaFilter, type AreaFilter } from '@/panchang/observanceAreas';
import type { PanchangStackParamList } from '@/navigation/types';
import { captionFont } from '@/utils/scriptFont';
import { contentByLang } from '@/utils/localize';
import { scriptTitleFont, scriptBodyFont } from '@/utils/langType';
import { transliterateDevanagari } from '@/utils/transliterate';
import { useTourTarget } from '@/components/tour/tourTargets';
import { useIsFocused } from '@react-navigation/native';

type Props = NativeStackScreenProps<PanchangStackParamList, 'ObservanceList'>;

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_HI = ['जन', 'फ़र', 'मार्च', 'अप्रै', 'मई', 'जून', 'जुल', 'अग', 'सित', 'अक्टू', 'नवं', 'दिसं'];

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function shortDate(date: Date, lang: Lang): string {
  const months =
    lang === 'en' ? MONTHS_EN : lang === 'hi' ? MONTHS_HI : MONTHS_HI.map((m) => transliterateDevanagari(m, lang));
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

const TITLES: Record<BrowseCategory, { hi: string; en: string }> = {
  vrat: { hi: 'व्रत', en: 'Vrat' },
  festival: { hi: 'पर्व', en: 'Festivals' },
  upavas: { hi: 'उपवास', en: 'Upvas' },
};

export default function ObservanceListScreen({ route, navigation }: Props) {
  const { colors, typography, spacing } = useTheme();
  const { lang } = useGitaLanguage();
  const { share, busy: shareBusy } = useShare();
  // Feature-tour anchors (design.md §47): the first row (list) and its ★ follow.
  const isFocused = useIsFocused();
  const vratListRef = useTourTarget('vratList', undefined, isFocused);
  const vratFollowRef = useTourTarget('vratFollow', undefined, isFocused);
  const [calendarSystem] = usePanchangCalendarSystem();
  const [query, setQuery] = useState('');
  const [area, setArea] = useState<AreaFilter>('all');
  const [followingOnly, setFollowingOnly] = useState(false);
  const { isFollowing, follow, unfollow } = useVratFollows();

  const category = route.params.category;
  const today = useMemo(() => startOfLocalDay(new Date()), []);

  const rows = useMemo(() => {
    // getRulesForCategory dedupes by id, so keys here are unique.
    const withDates = getRulesForCategory(category).map((rule) => ({
      rule,
      next: getNextOccurrence(rule.id, today, calendarSystem),
    }));
    // soonest first; rules with no resolved date sink to the bottom
    withDates.sort((a, b) => {
      const at = a.next?.date.getTime() ?? Number.MAX_SAFE_INTEGER;
      const bt = b.next?.date.getTime() ?? Number.MAX_SAFE_INTEGER;
      return at - bt;
    });
    return withDates;
  }, [category, today, calendarSystem]);

  const areas = useMemo(() => areasPresent(rows.map(({ rule }) => rule)), [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(({ rule }) => {
      if (!matchesAreaFilter(rule, area)) return false;
      if (followingOnly && !isFollowing(rule.id)) return false;
      if (!q) return true;
      const areaText = getObservanceAreas(rule).map((id) => `${areaName(id, 'hi')} ${areaName(id, 'en')}`).join(' ');
      return `${rule.nameHi} ${rule.nameEn} ${rule.deityEn} ${areaText}`.toLowerCase().includes(q);
    });
  }, [rows, query, area, followingOnly, isFollowing]);

  const title = TITLES[category];

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ReaderHeader
          title={contentByLang(lang, title.hi, title.en)}
          titleContent={(
            <>
              <Text style={{ ...typography.cardHindi, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), color: colors.ink }}>
                {contentByLang(lang, title.hi, title.en)}
              </Text>
              <Text style={{ ...typography.cardLatin, ...captionFont(lang === 'en' ? title.hi : title.en), color: colors.inkMuted }}>
                {lang === 'en' ? title.hi : title.en} · {rows.length}
              </Text>
            </>
          )}
          onBack={() => navigation.goBack()}
          sideWidth={48}
          right={(
          <ShareButton
            busy={shareBusy || filtered.length === 0}
            accessibilityLabel="Share observance listing"
            accessibilityHint="Share the visible observances and next dates as post, Story, or Reel cards"
            onPress={() => void share(buildListingShare({
              sourceId: `observance-${category}`,
              titleHi: title.hi, titleEn: title.en, background: null,
              items: filtered.map(({ rule, next }) => ({
                titleHi: rule.nameHi, titleEn: rule.nameEn,
                detailHi: next?.date ? `${shortDate(next.date, 'hi')} ${next.date.getFullYear()}` : rule.deityEn,
                detailEn: next?.date ? `${shortDate(next.date, 'en')} ${next.date.getFullYear()}` : rule.deityEn,
              })),
            }), lang)}
          />
          )}
        />

        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing.xxl }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TextField
            value={query}
            onChangeText={setQuery}
            placeholder={contentByLang(lang, 'इस सूची में खोजें…', 'Search within this list…')}
            style={styles.search}
          />
          <AreaFilterChips
            areas={areas} value={area} lang={lang} onChange={setArea}
            followingOnly={followingOnly} onFollowingOnlyChange={setFollowingOnly}
          />

          {filtered.map(({ rule, next }, i) => {
            const following = isFollowing(rule.id);
            const month = observanceMonth(next?.date ?? null, today, lang);
            const previous = i > 0 ? observanceMonth(filtered[i - 1].next?.date ?? null, today, lang) : null;
            const row = (
              <ObservancePreviewCard
                rule={rule}
                dateLabel={next?.date ? `${shortDate(next.date, lang)}${next.date.getFullYear() !== today.getFullYear() ? ` ${next.date.getFullYear()}` : ''}` : undefined}
                countdown={next?.date ? observanceCountdown(next.date, today, lang) : undefined}
                areaLabel={getObservanceAreas(rule).map(id => areaName(id, lang)).join(' · ') || undefined}
                lang={lang}
                following={following}
                starRef={i === 0 ? vratFollowRef : undefined}
                onToggleFollow={() => (following ? unfollow(rule.id) : follow(rule.id))}
                onPress={() => navigation.navigate('ObservanceDetail', { ruleId: rule.id })}
              />
            );
            return (
              <React.Fragment key={rule.id}>
                {month !== previous && (
                  <View style={[styles.monthHeading, { gap: spacing.md, marginTop: spacing.md, marginBottom: spacing.sm }]}>
                    <Text accessibilityRole="header" style={{ ...typography.cardHindi, fontFamily: scriptTitleFont(lang, typography.cardHindi.fontFamily), color: colors.inkSoft }}>{month}</Text>
                    <View style={[styles.monthLine, { backgroundColor: colors.divider }]} />
                  </View>
                )}
                {i === 0 ? <View ref={vratListRef} collapsable={false}>{row}</View> : row}
              </React.Fragment>
            );
          })}
          {filtered.length === 0 && (
            <Text style={{ fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 13, color: colors.inkMuted, marginTop: 24, textAlign: 'center' }}>
              {followingOnly ? contentByLang(lang, 'यहाँ कोई सहेजा हुआ व्रत नहीं है। सभी में जाकर ☆ दबाएँ।', 'No saved observances here. Choose All and tap a star to save one.') : contentByLang(lang, 'कोई परिणाम नहीं।', 'No matches.')}
            </Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingTop: 8, paddingBottom: 32 },
  search: { marginBottom: 8 },
  monthHeading: { flexDirection: 'row', alignItems: 'center' },
  monthLine: { flex: 1, height: StyleSheet.hairlineWidth },
});
