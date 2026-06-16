import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { usePanchangCalendarSystem } from '@/panchang/usePanchang';
import { getNextOccurrence, getRulesForCategory, type BrowseCategory } from '@/panchang/vratCatalog';
import type { ObservanceRule } from '@/panchang/types';
import type { PanchangStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<PanchangStackParamList, 'ObservanceList'>;

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_HI = ['जन', 'फ़र', 'मार्च', 'अप्रै', 'मई', 'जून', 'जुल', 'अग', 'सित', 'अक्टू', 'नवं', 'दिसं'];

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function shortDate(date: Date, isHindi: boolean): string {
  const months = isHindi ? MONTHS_HI : MONTHS_EN;
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

function relativeLabel(date: Date, from: Date, isHindi: boolean): string {
  const days = Math.round((startOfLocalDay(date).getTime() - startOfLocalDay(from).getTime()) / 86400000);
  if (days <= 0) return isHindi ? 'आज' : 'today';
  if (days === 1) return isHindi ? 'कल' : '1d';
  return isHindi ? `${days}द` : `${days}d`;
}

const TITLES: Record<BrowseCategory, { hi: string; en: string }> = {
  vrat: { hi: 'व्रत', en: 'Vrat' },
  festival: { hi: 'पर्व', en: 'Festivals' },
  upavas: { hi: 'उपवास', en: 'Upvas' },
};

export default function ObservanceListScreen({ route, navigation }: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const isHindi = lang === 'hi';
  const [calendarSystem] = usePanchangCalendarSystem();
  const [query, setQuery] = useState('');

  const category = route.params.category;
  const today = useMemo(() => startOfLocalDay(new Date()), []);

  const rows = useMemo(() => {
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
            accessibilityLabel={isHindi ? 'वापस' : 'Back'}
            hitSlop={12}
            style={({ pressed }) => [styles.backButton, { borderColor: colors.divider }, pressed && { opacity: 0.6 }]}
          >
            <Text style={{ color: colors.inkSoft, fontSize: 20 }}>‹</Text>
          </Pressable>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontFamily: typography.readerTitle.fontFamily, fontSize: 16, color: colors.ink }}>
              {isHindi ? title.hi : title.en}
            </Text>
            <Text style={{ fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 11, color: colors.inkMuted }}>
              {isHindi ? title.en : title.hi} · {rows.length}
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
            placeholder={isHindi ? 'इस सूची में खोजें…' : 'Search within this list…'}
            placeholderTextColor={colors.inkMuted}
            style={[styles.search, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.md, color: colors.ink }]}
          />

          {filtered.map(({ rule, next }) => (
            <ObservanceRow
              key={rule.id}
              rule={rule}
              nextDate={next?.date ?? null}
              today={today}
              isHindi={isHindi}
              colors={colors}
              typography={typography}
              onPress={() => navigation.navigate('ObservanceDetail', { ruleId: rule.id })}
            />
          ))}
          {filtered.length === 0 && (
            <Text style={{ fontFamily: typography.meaning.fontFamily, fontSize: 13, color: colors.inkMuted, marginTop: 24, textAlign: 'center' }}>
              {isHindi ? 'कोई परिणाम नहीं।' : 'No matches.'}
            </Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function ObservanceRow({ rule, nextDate, today, isHindi, colors, typography, onPress }: {
  rule: ObservanceRule;
  nextDate: Date | null;
  today: Date;
  isHindi: boolean;
  colors: any;
  typography: any;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={isHindi ? rule.nameHi : rule.nameEn}
      style={({ pressed }) => [styles.row, { borderBottomColor: colors.divider }, pressed && { opacity: 0.6 }]}
    >
      <View style={{ flex: 1, paddingRight: 10 }}>
        <Text style={{ fontFamily: typography.readerTitle.fontFamily, fontSize: 15, color: colors.ink }}>
          {isHindi ? rule.nameHi : rule.nameEn}
        </Text>
        <Text style={{ fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 12, color: colors.inkMuted, marginTop: 1 }}>
          {isHindi ? rule.nameEn : rule.nameHi}
        </Text>
      </View>
      {nextDate && (
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 11, color: colors.saffronDeep }}>
            {shortDate(nextDate, isHindi)}
          </Text>
          <Text style={{ fontFamily: 'CormorantGaramond_500Medium', fontSize: 11, color: colors.inkMuted, marginTop: 1 }}>
            {relativeLabel(nextDate, today, isHindi)}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8 },
  backButton: { width: 36, height: 36, borderWidth: 1, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingTop: 8, paddingBottom: 32 },
  search: { width: '100%', height: 44, borderWidth: 1, paddingHorizontal: 14, fontFamily: 'CormorantGaramond_500Medium', fontSize: 15, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth },
});
