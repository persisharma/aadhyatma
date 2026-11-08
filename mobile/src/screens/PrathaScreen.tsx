import React, { useMemo, useState } from 'react';
import { FlatList, Keyboard, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import LanguageToggle from '@/components/LanguageToggle';
import ReaderHeader from '@/components/ReaderHeader';
import TextField from '@/components/TextField';
import { ListingScope } from '@/components/ListingCard';
import { PrathaQuestionCard } from '@/components/PrathaCards';
import { Action, Copy, useSanatanText } from '@/components/sanatan/Primitives';
import { useGitaLanguage } from '@/data/gita/language';
import { getAllPratha, getPrathaForMasa, hasPratha, hasPrathaForMasa, type PrathaAxis } from '@/data/pratha';
import { matchesPratha } from '@/data/pratha/presentation';
import type { PrathaStackParamList } from '@/navigation/types';
import { usePanchangCalendarSystem, usePanchangForSelection } from '@/panchang/usePanchang';
import { useTheme } from '@/theme/ThemeContext';
import { meaningToken } from '@/utils/langType';

type Props = NativeStackScreenProps<PrathaStackParamList, 'Pratha'>;
type Tab = 'all' | 'current' | Exclude<PrathaAxis, 'bodh'>;
const AXES: readonly [Exclude<Tab, 'all' | 'current'>, string, string][] = [
  ['masa', 'पर्व', 'Festivals'], ['vaar', 'वार', 'Weekdays'], ['nitya', 'घर-आँगन', 'At home'],
  ['puja-niyam', 'पूजा-नियम', 'Puja customs'], ['prakriti', 'प्रकृति', 'Nature'],
  ['sanskar', 'संस्कार', 'Life stages'], ['tirth', 'तीर्थ', 'Pilgrimage'],
];
const MONTHS = [
  ['चैत्र', 'Chaitra'], ['वैशाख', 'Vaishakh'], ['ज्येष्ठ', 'Jyeshtha'], ['आषाढ़', 'Ashadha'],
  ['श्रावण', 'Shravan'], ['भाद्रपद', 'Bhadrapad'], ['आश्विन', 'Ashwin'], ['कार्तिक', 'Kartik'],
  ['मार्गशीर्ष', 'Margashirsha'], ['पौष', 'Paush'], ['माघ', 'Magh'], ['फाल्गुन', 'Phalgun'], ['अधिक मास', 'Adhik month'],
] as const;

export default function PrathaScreen({ route, navigation }: Props) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const t = useSanatanText();
  const [calendar] = usePanchangCalendarSystem();
  const [today] = useState(() => new Date());
  const { panchang } = usePanchangForSelection(today, calendar);
  // Sanatan opens the complete reviewed selection year-round; a month card
  // explicitly opens its own month. Never default to an empty seasonal tab.
  const [tab, setTab] = useState<Tab>(route.params?.masa ? 'current' : 'all');
  const [chosen, setChosen] = useState<{ masa: number; isAdhik: boolean } | null>(null);
  const [query, setQuery] = useState('');
  const masa = chosen?.masa ?? route.params?.masa ?? panchang?.lunarMonth.index;
  const adhik = chosen?.isAdhik ?? route.params?.isAdhik ?? panchang?.lunarMonth.isAdhik ?? false;
  const ready = hasPratha();
  const all = ready ? getAllPratha() : [];
  const entries = useMemo(() => {
    if (!ready) return [];
    if (query.trim()) return all.filter(entry => matchesPratha(entry, query));
    if (tab === 'current') return masa && hasPrathaForMasa(masa, adhik) ? getPrathaForMasa(masa, adhik) : [];
    if (tab === 'all') return all;
    return all.filter(entry => tab === 'nitya' ? entry.axis === 'nitya' || entry.axis === 'bodh' : entry.axis === tab);
  }, [ready, query, tab, masa, adhik]);
  const availableAxes = AXES.filter(([axis]) => all.some(entry => entry.axis === axis || (axis === 'nitya' && entry.axis === 'bodh')));
  const tabs: readonly (readonly [Tab, string, string])[] = [
    ['all', 'सभी प्रश्न', 'All questions'],
    ...(masa && hasPrathaForMasa(masa, adhik) ? [['current', 'इस मास', 'This month'] as const] : []),
    // An identical festival-only filter adds no value to this initial selection.
    ...(availableAxes.length > 1 ? availableAxes : []),
  ];
  const header = <View style={{ gap: 16, paddingBottom: 8 }}>
    <LanguageToggle />
    <ListingScope>{t(['सनातन परिचय · प्रथा और मान्यता', 'Sanatan Parichay · Customs & traditions'])}</ListingScope>
    <Copy>{t(['हम ऐसा क्यों करते हैं? परम्परा जानें, उसके पीछे की कथा पढ़ें और भाव समझें।', 'Why do we do this? Explore a custom, read its story and understand its meaning.'])}</Copy>
    {ready && <>
      <TextField variant="search" testID="pratha-search" value={query} onChangeText={setQuery}
        accessibilityLabel={t(['प्रथा खोजें', 'Search customs'])} placeholder={t(['अपना प्रश्न खोजें', 'Find your question'])}
        placeholderTextColor={colors.inkMuted} autoCorrect={false} autoCapitalize="none" returnKeyType="search"
        onSubmitEditing={() => Keyboard.dismiss()}
        style={{ ...meaningToken(lang, typography), color: colors.ink, height: undefined, minHeight: 48, paddingVertical: 10 }} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {tabs.map(([id, hi, en]) => <Action key={id} testID={`pratha-filter-${id}`} label={t([hi, en])} selected={tab === id} onPress={() => setTab(id)} style={{ borderRadius: 24 }} />)}
      </ScrollView>
      {tab === 'current' && !query.trim() && <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {MONTHS.map(([hi, en], i) => {
          const isAdhik = i === 12;
          const month = isAdhik ? panchang?.lunarMonth.index : i + 1;
          return month && hasPrathaForMasa(month, isAdhik) ? <Action key={i} testID={`pratha-filter-masa-${i + 1}`}
            label={t([hi, en])} selected={isAdhik ? adhik : !adhik && masa === month}
            onPress={() => setChosen({ masa: month, isAdhik })} style={{ borderRadius: 24 }} /> : null;
        })}
      </ScrollView>}
    </>}
  </View>;
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.parchment }} testID="pratha-hub">
    <ReaderHeader title={t(['ऐसा क्यों?', 'Why do we do this?'])} onBack={() => navigation.goBack()} />
    <FlatList data={entries} keyExtractor={entry => entry.id} extraData={lang} keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.list} ListHeaderComponent={header} initialNumToRender={6} windowSize={5}
      ListEmptyComponent={<Copy testID="pratha-empty">{t(query.trim()
        ? ['इस प्रश्न का परिचय अभी उपलब्ध नहीं है।', 'No introduction matches this question yet.']
        : ['इस वर्ग के परिचय अभी उपलब्ध नहीं हैं।', 'Introductions in this category are not available yet.'])}</Copy>}
      renderItem={({ item }) => <PrathaQuestionCard entry={item} testID={`pratha-question-${item.id}`}
        onPress={() => navigation.navigate('PrathaReader', { prathaId: item.id })} />} />
  </SafeAreaView>;
}
const styles = StyleSheet.create({ list: { padding: 22, paddingBottom: 40, gap: 12 }, filters: { gap: 8, paddingBottom: 4 } });
