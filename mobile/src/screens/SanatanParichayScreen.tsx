import React, { useState } from 'react';
import { Alert, Keyboard, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/navigation/types';
import { useGitaLanguage } from '@/data/gita/language';
import { scriptTitleFont, titleFontByLang } from '@/utils/langType';
import { useTheme } from '@/theme/ThemeContext';
import { getSanatanTopic, getSanatanTopics, searchSanatanMatches, type SanatanTopic } from '@/data/sanatan-parichay';
import { sanatanArtwork, sanatanThumbFocus } from '@/data/sanatan-parichay/artwork';
import { useSanatanLearning } from '@/data/sanatan-parichay/store';
import ReaderHeader from '@/components/ReaderHeader';
import LanguageToggle from '@/components/LanguageToggle';
import TextField from '@/components/TextField';
import AppIcon from '@/components/AppIcon';
import BookmarkButton from '@/components/BookmarkButton';
import ListingCard, { ListingScope, ListingSectionHeader, ListingThumbImage } from '@/components/ListingCard';
import { Action, Copy, LinkRow, useSanatanText } from '@/components/sanatan/Primitives';

// Hindi, short English chip, and the group key the lessons carry. English accessibility
// labels so Maestro can target a chip in any reading language (as AreaFilterChips).
const FILTERS = [
  ['सभी', 'All', '', 'Filter: all'],
  ['देव और स्वरूप', 'Deities', 'Deities & forms', 'Filter: deities and forms'],
  ['प्रतीक और पूजा', 'Worship', 'Symbols & worship', 'Filter: symbols and worship'],
  ['समय और ज्ञान', 'Knowledge', 'Time & knowledge', 'Filter: time and knowledge'],
] as const;
const SANSKAR_LABELS = ['संस्कार', 'Sanskar', 'Good Habits', 'સંસ્કાર', 'ಸಂಸ್ಕಾರ'];
const CHIP_FONT_CAP = 1.25;

type Props = NativeStackScreenProps<HomeStackParamList, 'SanatanParichay'>;

/** The Sanatan Parichay hub: the shared listing frame (design.md §82) over thirteen lessons. */
export default function SanatanParichayScreen({ navigation }: Props) {
  const t = useSanatanText();
  const { lang } = useGitaLanguage();
  const { colors, radii, spacing, typography } = useTheme();
  const learning = useSanatanLearning();
  const [query, setQuery] = useState('');
  const [savedOnly, setSavedOnly] = useState(false);
  const [group, setGroup] = useState('');
  // A card opens the lesson itself; Back returns here with the query and filters intact.
  const read = (id: string, initialPage = 0) => navigation.navigate('SanatanReader', { topicId: id, initialPage });
  const failed = () => Alert.alert(t(['सहेजा नहीं जा सका', 'Could not save']), t(['फिर प्रयास करें।','Please try again.']));
  const search = query.trim();
  // A search hit opens the page that matched (a taught term or page heading), as global Search does.
  const matches = searchSanatanMatches(query).filter(({ topic: x }) => (!savedOnly || learning.saved.includes(x.id)) && (!group || x.group[1] === group));
  const topics = matches.map(match => match.topic);
  const resume = learning.resume && getSanatanTopic(learning.resume.id);
  const thumb = (id: string) => <ListingThumbImage source={sanatanArtwork[id]} focusX={sanatanThumbFocus[id]} />;
  const pages = (count: number) => `${count} ${t(['पृष्ठ', count === 1 ? 'page' : 'pages'])}`;
  // The shared card contract (RULEBOOK §3): eyebrow = the sequence, one-line description
  // (the collection, ≤32 characters), meta = the unit count, progress as a bar.
  const card = (topic: SanatanTopic, resumeAt?: number) => {
    const done = resumeAt === undefined ? learning.read[topic.id]?.length ?? 0 : resumeAt + 1;
    const page = resumeAt ?? matches.find(match => match.topic === topic)?.page ?? 0;
    return <ListingCard key={topic.id} testID={resumeAt === undefined ? `sanatan-collection-${topic.id}` : 'sanatan-resume'}
      eyebrow={`${t(['परिचय', 'Introduction'])} ${getSanatanTopics().indexOf(topic) + 1}`}
      title={t(topic.title)} description={t(topic.name)} meta={pages(topic.pages.length)}
      progress={done ? done / topic.pages.length : undefined}
      accessibilityLabel={resumeAt === undefined ? undefined : `${t(['जहाँ छोड़ा था','Continue reading'])}. ${t(topic.title)}. ${resumeAt + 1}/${topic.pages.length}`}
      thumbnail={thumb(topic.id)} onPress={() => read(topic.id, page)} />;
  };
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.parchment }} edges={['top', 'left', 'right']}>
    <ReaderHeader title={t(['सनातन परिचय', 'Sanatan Parichay'])} onBack={() => navigation.goBack()} variant="index" sideWidth={60}
      right={<BookmarkButton testID="sanatan-saved-filter" isBookmarked={savedOnly} onToggle={() => setSavedOnly(x => !x)}
        accessibilityLabel={t(savedOnly ? ['सभी परिचय दिखाएँ','Show all introductions'] : ['सहेजे हुए परिचय','Saved introductions'])} />} />
    <View style={{ paddingBottom: spacing.md }}><LanguageToggle /></View>
    <ScrollView testID="sanatan-index" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: spacing.readingGutter, paddingBottom: 40, gap: spacing.md }}>
      <ListingScope testID="sanatan-scope">
        {t([`${getSanatanTopics().length} परिचय · चित्रों के साथ सरल उत्तर`, `${getSanatanTopics().length} introductions · simple answers with pictures`])}
      </ListingScope>
      <View style={styles.search}>
        <TextField variant="search" testID="sanatan-search" accessibilityLabel={t(['परिचय खोजें','Search introductions'])}
          placeholder={t(['स्वस्तिक, दिक्पाल, 33 देवता…','Swastika, Dikpal, 33 deities…'])}
          placeholderTextColor={colors.inkMuted} value={query} onChangeText={setQuery}
          autoCorrect={false} autoCapitalize="none" returnKeyType="search" onSubmitEditing={() => Keyboard.dismiss()}
          style={{ height: undefined, minHeight: 48, paddingVertical: 10, paddingLeft: 44, color: colors.ink, fontFamily: titleFontByLang(lang), lineHeight: 24 }} />
        <View pointerEvents="none" style={styles.searchIcon}><AppIcon name="search" size={20} color={colors.saffronDeep} /></View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" accessibilityLabel="Lesson filter"
        style={{ flexGrow: 0, marginHorizontal: -spacing.readingGutter }}
        contentContainerStyle={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: spacing.readingGutter }}>
        {FILTERS.map(([hi, en, value, a11y]) => {
          const selected = group === value;
          return <Pressable key={value} testID={`sanatan-filter-${value ? value.split(' ')[0].toLowerCase() : 'all'}`}
            accessibilityRole="button" accessibilityState={{ selected }} accessibilityLabel={a11y} onPress={() => setGroup(value)}
            style={({ pressed }) => [styles.chip, { borderRadius: radii.pill, borderColor: selected ? colors.cardActiveBorder : colors.divider,
              backgroundColor: selected ? colors.saffronTint : colors.parchmentSoft }, pressed && { opacity: 0.7 }]}>
            <Text numberOfLines={1} maxFontSizeMultiplier={CHIP_FONT_CAP} style={{ ...typography.listingScope,
              fontFamily: scriptTitleFont(lang, typography.cardHindi.fontFamily), color: selected ? colors.saffronDeep : colors.inkSoft }}>{t([hi, en])}</Text>
          </Pressable>;
        })}
      </ScrollView>
      {resume && learning.resume && <View style={{ gap: spacing.md }}>
        <ListingSectionHeader>{t(['जहाँ छोड़ा था','Continue reading'])}</ListingSectionHeader>
        {card(resume, learning.resume.page)}
      </View>}
      {learning.error && <Action label={t(['सहेजी प्रगति फिर लोड करें','Retry loading progress'])} onPress={() => void learning.hydrate().catch(failed)} />}
      {[...new Set(topics.map(x => x.group[1]))].map(key => <View key={key} style={{ gap: spacing.md }}>
        <ListingSectionHeader>{t(topics.find(x => x.group[1] === key)!.group)}</ListingSectionHeader>
        {topics.filter(x => x.group[1] === key).map(topic => card(topic))}
      </View>)}
      {!topics.length && <Copy>{t(['कोई परिचय नहीं मिला। दूसरा शब्द आज़माएँ।','No introductions found. Try another word.'])}</Copy>}
      {!savedOnly && (!search || SANSKAR_LABELS.some(label => label.toLowerCase().includes(search.toLowerCase()))) && <View style={{ gap: spacing.md }}>
        <ListingSectionHeader>{t(['यह भी देखें','See also'])}</ListingSectionHeader>
        <LinkRow testID="sanatan-sanskar" label={t(['संस्कार','Sanskar'])}
          description={t(['प्रभाती श्लोक, भोजन मंत्र और दैनिक प्रार्थनाएँ','Morning slokas, meal prayers and daily observances'])}
          onPress={() => navigation.navigate('CategoryList', { categoryId: 'sanskar' })} />
      </View>}
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  search: { justifyContent: 'center' },
  searchIcon: { position: 'absolute', left: 14 },
  chip: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 16, borderWidth: 1 },
});
