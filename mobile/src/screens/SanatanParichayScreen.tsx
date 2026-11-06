import React, { useState } from 'react';
import { Alert, Modal, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/navigation/types';
import { useGitaLanguage } from '@/data/gita/language';
import { titleFontByLang } from '@/utils/langType';
import { useTheme } from '@/theme/ThemeContext';
import { getSanatanTopic, getSanatanTopics, searchSanatanTopics, SANATAN_PAGE_TITLES } from '@/data/sanatan-parichay';
import { useSanatanLearning } from '@/data/sanatan-parichay/store';
import ReaderHeader from '@/components/ReaderHeader';
import LanguageToggle from '@/components/LanguageToggle';
import { Action, Copy, Painting, Panel, useSanatanText } from '@/components/sanatan/Primitives';
import SourceCredits from '@/components/sanatan/SourceCredits';

type Props = NativeStackScreenProps<HomeStackParamList, 'SanatanParichay'>;
export default function SanatanParichayScreen({ route, navigation }: Props) {
  const t = useSanatanText();
  const { lang } = useGitaLanguage();
  const { colors } = useTheme();
  const learning = useSanatanLearning();
  const [query, setQuery] = useState('');
  const [savedOnly, setSavedOnly] = useState(false);
  const [sources, setSources] = useState(false);
  const [group, setGroup] = useState('');
  const topic = route.params?.topicId ? getSanatanTopic(route.params.topicId) : undefined;
  const open = (id: string) => navigation.push('SanatanParichay', { topicId: id });
  const read = (id: string, initialPage = 0) => navigation.navigate('SanatanReader', { topicId: id, initialPage });
  const failed = () => Alert.alert(t(['सहेजा नहीं जा सका', 'Could not save']), t(['फिर प्रयास करें।','Please try again.']));
  const topics = (query.trim() ? searchSanatanTopics(query) : getSanatanTopics()).filter(x => (!savedOnly || learning.saved.includes(x.id)) && (!group || x.group[1] === group));
  const resume = learning.resume && getSanatanTopic(learning.resume.id);
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.parchment }}>
    <ReaderHeader title={t(['सनातन परिचय', 'Sanatan Parichay'])} variant="index" onBack={() => navigation.goBack()} />
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 22, gap: 16, paddingBottom: 40 }}>
      <LanguageToggle />
      {route.params?.topicId && !topic ? <Copy>{t(['यह परिचय उपलब्ध नहीं है।','This introduction is unavailable.'])}</Copy> : topic ? <>
        <Copy heading>{t(topic.title)}</Copy>
        <Painting id={topic.id} />
        <Copy heading>{t(topic.question)}</Copy>
        <Copy>{t(topic.pages[0])}</Copy>
        <Action testID="sanatan-start" label={t(['परिचय पढ़ें', 'Read introduction'])} onPress={() => read(topic.id)} />
        <Action label={t(learning.saved.includes(topic.id) ? ['सहेजा हुआ हटाएँ','Remove saved lesson'] : ['बाद के लिए सहेजें','Save for later'])}
          selected={learning.saved.includes(topic.id)} onPress={() => void learning.toggleSaved(topic.id).catch(failed)} />
        {SANATAN_PAGE_TITLES.map((name, i) => <Action key={i} label={`${i + 1}. ${t(name)}`} onPress={() => read(topic.id, i)} />)}
        <Action label={t(['स्रोत और सन्दर्भ','Sources & context'])} onPress={() => setSources(true)} />
      </> : <>
        <Copy heading>{t(['हर परम्परा में एक अर्थ छिपा है।','Every tradition has a story to tell.'])}</Copy>
        <Copy>{t(['चित्र, प्रश्न और छोटे परिचयों से सनातन परम्परा को जानें।','Explore Sanatan traditions through paintings, questions and short introductions.'])}</Copy>
        <TextInput testID="sanatan-search" accessibilityLabel={t(['परिचय खोजें','Search introductions'])}
          placeholder={t(['स्वस्तिक, दिक्पाल, 33 देवता…','Swastika, Dikpal, 33 deities…'])}
          placeholderTextColor={colors.inkMuted} value={query} onChangeText={setQuery}
          style={{ minHeight: 52, borderWidth: 1, borderColor: colors.divider, borderRadius: 14, padding: 14, color: colors.ink, fontFamily: titleFontByLang(lang) }} />
        {resume && learning.resume && <Panel><Copy>{t(['जहाँ छोड़ा था','Continue reading'])}</Copy>
          <Action testID="sanatan-resume" label={`${t(resume.title)} · ${learning.resume.page + 1}/3`}
            onPress={() => read(resume.id, learning.resume!.page)} /></Panel>}
        {learning.error && <Action label={t(['सहेजी प्रगति फिर लोड करें','Retry loading progress'])} onPress={() => void learning.hydrate().catch(failed)} />}
        <Action label={t(savedOnly ? ['सभी परिचय दिखाएँ','Show all introductions'] : ['सहेजे हुए परिचय','Saved introductions'])}
          selected={savedOnly} onPress={() => setSavedOnly(x => !x)} />
        {!query && !savedOnly && <>
          <Painting id="symbols" /><Action label={t(getSanatanTopic('symbols')!.question)} onPress={() => open('symbols')} />
          <Copy heading>{t(['कभी सोचा है?','Ever wondered?'])}</Copy>
          {['dikpal','thirty'].map(id => <Panel key={id}><Painting id={id} />
            <Action label={t(getSanatanTopic(id)!.question)} onPress={() => open(id)} /></Panel>)}
        </>}
        <Copy heading>{t(['सभी परिचय','Explore introductions'])}</Copy>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {[['सभी','All',''],['देव और स्वरूप','Deities','Deities & forms'],['प्रतीक और पूजा','Worship','Symbols & worship'],['समय और ज्ञान','Knowledge','Time & knowledge']].map(([hi,en,value]) =>
            <Action key={value} label={t([hi,en])} selected={group === value} onPress={() => setGroup(value)} />)}
        </View>
        {topics.map(x => <View key={x.id} testID={`sanatan-collection-${x.id}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Painting id={x.id} small />
          <Action style={{ flex: 1 }} label={t(x.name)} onPress={() => open(x.id)} />
        </View>)}
        {!topics.length && <Copy>{t(['कोई परिचय नहीं मिला। दूसरा शब्द आज़माएँ।','No introductions found. Try another word.'])}</Copy>}
      </>}
    </ScrollView>
    <Modal visible={sources && !!topic} animationType="slide" onRequestClose={() => setSources(false)}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.parchment }}>
        <ReaderHeader title={t(['स्रोत और सन्दर्भ','Sources & context'])} onBack={() => setSources(false)} />
        {topic && <SourceCredits topic={topic} />}
      </SafeAreaView>
    </Modal>
  </SafeAreaView>;
}
