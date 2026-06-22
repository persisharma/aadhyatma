import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage, type Lang } from '@/data/gita/language';
import { usePanchangCalendarSystem } from '@/panchang/usePanchang';
import { getNextOccurrence, getRulesForCategory, type BrowseCategory } from '@/panchang/vratCatalog';
import { useVratFollows } from '@/contexts/VratFollowContext';
import type { ObservanceRule } from '@/panchang/types';
import type { PanchangStackParamList } from '@/navigation/types';
import { captionFont } from '@/utils/scriptFont';
import { contentByLang } from '@/utils/localize';
import { scriptTitleFont, scriptBodyFont } from '@/utils/langType';
import { transliterateDevanagari } from '@/utils/transliterate';

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

function relativeLabel(date: Date, from: Date, lang: Lang): string {
  const days = Math.round((startOfLocalDay(date).getTime() - startOfLocalDay(from).getTime()) / 86400000);
  if (days <= 0) return contentByLang(lang, 'आज', 'today');
  if (days === 1) return contentByLang(lang, 'कल', '1d');
  return contentByLang(lang, `${days}द`, `${days}d`);
}

const TITLES: Record<BrowseCategory, { hi: string; en: string }> = {
  vrat: { hi: 'व्रत', en: 'Vrat' },
  festival: { hi: 'पर्व', en: 'Festivals' },
  upavas: { hi: 'उपवास', en: 'Upvas' },
};

export default function ObservanceListScreen({ route, navigation }: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const [calendarSystem] = usePanchangCalendarSystem();
  const [query, setQuery] = useState('');
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(({ rule }) =>
      `${rule.nameHi} ${rule.nameEn} ${rule.deityEn}`.toLowerCase().includes(q)
    );
  }, [rows, query]);

  const title = TITLES[category];

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel={contentByLang(lang, 'वापस', 'Back')}
            hitSlop={12}
            style={({ pressed }) => [styles.backButton, { borderColor: colors.divider }, pressed && { opacity: 0.6 }]}
          >
            <Text style={{ color: colors.inkSoft, fontSize: 20 }}>‹</Text>
          </Pressable>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 16, color: colors.ink }}>
              {contentByLang(lang, title.hi, title.en)}
            </Text>
            <Text style={{ ...captionFont(lang === 'en' ? title.hi : title.en), fontSize: 12, color: colors.inkMuted }}>
              {lang === 'en' ? title.hi : title.en} · {rows.length}
            </Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing.xxl }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={contentByLang(lang, 'इस सूची में खोजें…', 'Search within this list…')}
            placeholderTextColor={colors.inkMuted}
            style={[styles.search, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.md, color: colors.ink }]}
          />

          {filtered.map(({ rule, next }) => {
            const following = isFollowing(rule.id);
            return (
              <ObservanceRow
                key={rule.id}
                rule={rule}
                nextDate={next?.date ?? null}
                today={today}
                lang={lang}
                colors={colors}
                typography={typography}
                following={following}
                onToggleFollow={() => (following ? unfollow(rule.id) : follow(rule.id))}
                onPress={() => navigation.navigate('ObservanceDetail', { ruleId: rule.id })}
              />
            );
          })}
          {filtered.length === 0 && (
            <Text style={{ fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 13, color: colors.inkMuted, marginTop: 24, textAlign: 'center' }}>
              {contentByLang(lang, 'कोई परिणाम नहीं।', 'No matches.')}
            </Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function ObservanceRow({ rule, nextDate, today, lang, colors, typography, following, onToggleFollow, onPress }: {
  rule: ObservanceRule;
  nextDate: Date | null;
  today: Date;
  lang: Lang;
  colors: any;
  typography: any;
  following: boolean;
  onToggleFollow: () => void;
  onPress: () => void;
}) {
  return (
    <View style={[styles.row, { borderBottomColor: colors.divider }]}>
      {/* Leading star — tap to follow/unfollow without opening the detail; a
          filled gold ★ marks an already-followed vrat, an outline ☆ an un-followed one. */}
      <Pressable
        onPress={onToggleFollow}
        accessibilityRole="button"
        accessibilityState={{ selected: following }}
        accessibilityLabel={`${following ? 'Unfollow' : 'Follow'} ${rule.nameEn}`}
        hitSlop={8}
        style={({ pressed }) => [styles.starBtn, pressed && { opacity: 0.5 }]}
      >
        <Text style={{ fontSize: 20, color: following ? colors.gold : colors.inkMuted }}>
          {following ? '★' : '☆'}
        </Text>
      </Pressable>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={contentByLang(lang, rule.nameHi, rule.nameEn)}
        style={({ pressed }) => [styles.rowMain, pressed && { opacity: 0.6 }]}
      >
        <View style={{ flex: 1, paddingRight: 10 }}>
          <Text style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 15, color: colors.ink }}>
            {contentByLang(lang, rule.nameHi, rule.nameEn)}
          </Text>
          <Text style={{ ...captionFont(lang === 'en' ? rule.nameHi : rule.nameEn), fontSize: 13, color: colors.inkMuted, marginTop: 2 }}>
            {lang === 'en' ? rule.nameHi : rule.nameEn}
          </Text>
        </View>
        {nextDate && (
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: colors.inkSoft }}>
              {shortDate(nextDate, lang)}
            </Text>
            <Text style={{ fontFamily: 'CormorantGaramond_500Medium', fontSize: 13, color: colors.inkSoft, marginTop: 1 }}>
              {relativeLabel(nextDate, today, lang)}
            </Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8 },
  backButton: { width: 36, height: 36, borderWidth: 1, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingTop: 8, paddingBottom: 32 },
  search: { width: '100%', height: 44, borderWidth: 1, paddingHorizontal: 14, fontFamily: 'CormorantGaramond_500Medium', fontSize: 15, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth },
  starBtn: { width: 36, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center', marginRight: 4 },
  rowMain: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingVertical: 13 },
});
