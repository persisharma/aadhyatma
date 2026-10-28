import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import BackgroundLayer from '@/components/BackgroundLayer';
import LanguageToggle from '@/components/LanguageToggle';
import ReaderHeader from '@/components/ReaderHeader';
import { readingParchment } from '@/data/backgroundAsset';
import { useGitaLanguage } from '@/data/gita/language';
import { getAllPratha, getPrathaForMasa, hasPratha, hasPrathaForMasa, type PrathaAxis } from '@/data/pratha';
import { matchesPratha, PRATHA_TIERS } from '@/data/pratha/presentation';
import type { PrathaStackParamList } from '@/navigation/types';
import { usePanchangCalendarSystem, usePanchangForSelection } from '@/panchang/usePanchang';
import { useTheme } from '@/theme/ThemeContext';
import { meaningToken, scriptTitleFont } from '@/utils/langType';
import { contentByLang } from '@/utils/localize';

type Props = NativeStackScreenProps<PrathaStackParamList, 'Pratha'>;
type Tab = 'current' | 'festival' | Exclude<PrathaAxis, 'masa' | 'bodh'>;
const TABS: readonly [Tab, string, string][] = [
  ['current', 'इस मास', 'This month'], ['festival', 'पर्व', 'Festivals'], ['vaar', 'वार', 'Weekdays'],
  ['nitya', 'घर-आँगन', 'At home'], ['puja-niyam', 'पूजा-नियम', 'Puja customs'], ['prakriti', 'प्रकृति', 'Nature'],
  ['sanskar', 'संस्कार', 'Life stages'], ['tirth', 'तीर्थ', 'Pilgrimage'],
];
const MONTHS = [
  ['चैत्र', 'Chaitra'], ['वैशाख', 'Vaishakh'], ['ज्येष्ठ', 'Jyeshtha'], ['आषाढ़', 'Ashadha'],
  ['श्रावण', 'Shravan'], ['भाद्रपद', 'Bhadrapad'], ['आश्विन', 'Ashwin'], ['कार्तिक', 'Kartik'],
  ['मार्गशीर्ष', 'Margashirsha'], ['पौष', 'Paush'], ['माघ', 'Magh'], ['फाल्गुन', 'Phalgun'], ['अधिक मास', 'Adhik month'],
];

export default function PrathaScreen({ route, navigation }: Props) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const [calendar] = usePanchangCalendarSystem();
  const [today] = useState(() => new Date());
  const { panchang } = usePanchangForSelection(today, calendar);
  const [tab, setTab] = useState<Tab>('current');
  const [chosen, setChosen] = useState<{ masa: number; isAdhik: boolean } | null>(null);
  const [query, setQuery] = useState('');
  const masa = chosen?.masa ?? route.params?.masa ?? panchang?.lunarMonth.index;
  const adhik = chosen?.isAdhik ?? route.params?.isAdhik ?? panchang?.lunarMonth.isAdhik ?? false;
  const ready = hasPratha();
  const entries = useMemo(() => {
    if (!ready) return [];
    if (query.trim()) return getAllPratha().filter((entry) => matchesPratha(entry, query));
    if (tab === 'current') return masa && hasPrathaForMasa(masa, adhik) ? getPrathaForMasa(masa, adhik) : [];
    return getAllPratha().filter((entry) => tab === 'festival' ? entry.axis === 'masa' : tab === 'nitya' ? entry.axis === 'nitya' || entry.axis === 'bodh' : entry.axis === tab);
  }, [ready, query, tab, masa, adhik]);
  const meaning = meaningToken(lang, typography);
  const chip = (id: string, hi: string, en: string, selected: boolean, disabled: boolean, onPress: () => void) => (
    <Pressable key={id} testID={`pratha-filter-${id}`} accessibilityRole="button" accessibilityState={{ selected, disabled }}
      disabled={disabled} onPress={onPress} style={[styles.chip, { borderColor: selected ? colors.saffronDeep : colors.divider, backgroundColor: selected ? colors.saffronTint : colors.parchmentSoft, opacity: disabled ? 0.45 : 1 }]}>
      <Text style={{ ...meaning, color: selected ? colors.saffronDeep : colors.ink }}>{contentByLang(lang, hi, en)}</Text>
    </Pressable>
  );
  return <View testID="pratha-hub" style={[styles.root, { backgroundColor: colors.parchment }]}>
    <BackgroundLayer source={readingParchment} />
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <ReaderHeader variant="index" title={contentByLang(lang, 'ऐसा क्यों?', 'Why do we do this?')} onBack={() => navigation.goBack()} />
      <LanguageToggle />
      {ready && <>
        <TextInput testID="pratha-search" value={query} onChangeText={setQuery}
          accessibilityLabel={contentByLang(lang, 'प्रथा खोजें', 'Search customs')}
          placeholder={contentByLang(lang, 'अपना प्रश्न खोजें', 'Find your question')}
          placeholderTextColor={colors.inkMuted} style={[styles.search, meaning, { color: colors.ink, borderColor: colors.divider }]} />
        <View><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {TABS.map(([id, hi, en]) => chip(id, hi, en, tab === id, false, () => setTab(id)))}
        </ScrollView></View>
        {tab === 'current' && !query.trim() && <View><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {MONTHS.map(([hi, en], i) => {
            const isAdhik = i === 12;
            const month = isAdhik ? (panchang?.lunarMonth.index ?? null) : i + 1;
            return chip(`masa-${i + 1}`, hi, en, isAdhik ? adhik : !adhik && masa === month,
              month === null || !hasPrathaForMasa(month, isAdhik), () => { if (month !== null) setChosen({ masa: month, isAdhik }); });
          })}
        </ScrollView></View>}
      </>}
      <FlatList data={entries} keyExtractor={(entry) => entry.id} extraData={lang} contentContainerStyle={styles.list}
        ListEmptyComponent={<Text testID="pratha-empty" style={{ ...meaning, color: colors.inkMuted }}>{contentByLang(lang,
          query.trim() ? 'इस प्रश्न का परिचय अभी उपलब्ध नहीं है।' : 'इस वर्ग के परिचय अभी उपलब्ध नहीं हैं।',
          query.trim() ? 'No introduction matches this question yet.' : 'Introductions in this category are not available yet.')}</Text>}
        renderItem={({ item }) => <Pressable testID={`pratha-question-${item.id}`} accessibilityRole="button"
          onPress={() => navigation.navigate('PrathaReader', { prathaId: item.id })}
          style={[styles.row, { borderColor: colors.divider, backgroundColor: colors.parchmentSoft }]}>
          <Text style={{ color: colors.ink, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 20 }}>{contentByLang(lang, item.questionHi, item.questionEn)}</Text>
          <Text numberOfLines={2} style={{ ...meaning, color: colors.inkSoft, marginTop: 8 }}>{contentByLang(lang, item.practiceHi, item.practiceEn)}</Text>
          <Text style={{ ...meaning, color: colors.saffronDeep, marginTop: 8 }}>{[...new Set(item.kathas.map((s) => s.tier))].map((tier) => contentByLang(lang, PRATHA_TIERS[tier].hi, PRATHA_TIERS[tier].en)).join(' · ')} →</Text>
        </Pressable>} />
    </SafeAreaView>
  </View>;
}

const styles = StyleSheet.create({
  root: { flex: 1 }, search: { borderWidth: 1, borderRadius: 16, marginHorizontal: 20, marginVertical: 12, padding: 12, minHeight: 48 },
  filters: { paddingHorizontal: 20, paddingBottom: 10, gap: 8 }, chip: { minHeight: 44, justifyContent: 'center', borderWidth: 1, borderRadius: 24, paddingHorizontal: 14 },
  list: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 }, row: { padding: 18, borderWidth: 1, borderRadius: 18, marginBottom: 12 },
});
