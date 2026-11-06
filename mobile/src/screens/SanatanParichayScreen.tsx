import React, { useState } from 'react';
import { Alert, Keyboard, Modal, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/navigation/types';
import { useGitaLanguage } from '@/data/gita/language';
import { titleFontByLang } from '@/utils/langType';
import { useTheme } from '@/theme/ThemeContext';
import { getSanatanTopic, getSanatanTopics, searchSanatanTopics, getSanatanPageTitles } from '@/data/sanatan-parichay';
import { useSanatanLearning } from '@/data/sanatan-parichay/store';
import ReaderHeader from '@/components/ReaderHeader';
import LanguageToggle from '@/components/LanguageToggle';
import TextField from '@/components/TextField';
import AppIcon from '@/components/AppIcon';
import Ornament from '@/components/Ornament';
import { ListingSectionHeader, ListingCardFrame } from '@/components/ListingCard';
import CollectionCard, { DiscoveryPair } from '@/components/sanatan/CollectionCard';
import { Action, Copy, Painting, Panel, PrimaryAction, ToolAction, useSanatanText } from '@/components/sanatan/Primitives';
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
    <ReaderHeader title={t(['सनातन परिचय', 'Sanatan Parichay'])} onBack={() => navigation.goBack()} sideWidth={52}
      right={!topic ? <ToolAction compact icon="saved" label={t(savedOnly ? ['सभी परिचय दिखाएँ','Show all introductions'] : ['सहेजे हुए परिचय','Saved introductions'])} selected={savedOnly} onPress={() => setSavedOnly(x => !x)} /> : undefined} />
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 22, gap: 16, paddingBottom: 40 }}>
      <LanguageToggle />
      {route.params?.topicId && !topic ? <Copy>{t(['यह परिचय उपलब्ध नहीं है।','This introduction is unavailable.'])}</Copy> : topic ? <>
        <ListingSectionHeader>{t(topic.group)}</ListingSectionHeader>
        <Copy heading>{t(topic.name)}</Copy>
        <Painting id={topic.id} />
        <Ornament compact />
        <Copy heading>{t(topic.question)}</Copy>
        <Copy>{t(topic.pages[0]).split(/\n\s*\n/)[0]}</Copy>
        <Panel><Copy heading>{t(topic.title)}</Copy><PrimaryAction testID="sanatan-start" label={t(['पाठ खोलें', 'Open lesson'])} onPress={() => read(topic.id)} /></Panel>
        <ToolAction icon="saved" label={t(learning.saved.includes(topic.id) ? ['सहेजा हुआ हटाएँ','Remove saved lesson'] : ['बाद के लिए सहेजें','Save for later'])}
          selected={learning.saved.includes(topic.id)} onPress={() => void learning.toggleSaved(topic.id).catch(failed)} />
        <ListingSectionHeader>{t(['इस पाठ में','In this lesson'])}</ListingSectionHeader>
        {getSanatanPageTitles(topic).map((name, i) => <ListingCardFrame key={i} onPress={() => read(topic.id, i)} accessibilityLabel={t(name)}
          contentStyle={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 9 }}>
          <View style={{ width: 40, minHeight: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 20, backgroundColor: colors.saffronTint }}><Copy>{String(i + 1)}</Copy></View>
          <View style={{ flex: 1 }}><Copy>{t(name)}</Copy></View><AppIcon name="next" size={18} color={colors.saffronDeep} />
        </ListingCardFrame>)}
        <ToolAction icon="info" label={t(['स्रोत और सन्दर्भ','Sources & context'])} onPress={() => setSources(true)} />
      </> : <>
        <Text accessibilityRole="header" style={{ fontFamily: titleFontByLang(lang), color: colors.ink, fontSize: 29, lineHeight: 49 }}>{t(['हर परम्परा में\nएक अर्थ छिपा है।','Every tradition\nhas a story to tell.'])}</Text>
        <Text style={{ fontFamily: titleFontByLang(lang), color: colors.inkMuted, fontSize: 14, lineHeight: 24 }}>{t(['आपके मन के प्रश्न, चित्रों के साथ सरल उत्तर।','Questions on your mind. Answers brought to life.'])}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><AppIcon name="search" size={21} color={colors.saffronDeep} />
        <TextField variant="search" testID="sanatan-search" accessibilityLabel={t(['परिचय खोजें','Search introductions'])}
          placeholder={t(['स्वस्तिक, दिक्पाल, 33 देवता…','Swastika, Dikpal, 33 deities…'])}
          placeholderTextColor={colors.inkMuted} value={query} onChangeText={setQuery}
          autoCorrect={false} autoCapitalize="none" returnKeyType="search" onSubmitEditing={() => Keyboard.dismiss()}
          style={{ flex: 1, minWidth: 0, height: undefined, minHeight: 48, paddingVertical: 10, color: colors.ink, fontFamily: titleFontByLang(lang), lineHeight: 24 }} /></View>
        {resume && learning.resume && <Panel><Copy>{t(['जहाँ छोड़ा था','Continue reading'])}</Copy>
          <Action testID="sanatan-resume" label={`${t(resume.title)} · ${learning.resume.page + 1}/3`}
            onPress={() => read(resume.id, learning.resume!.page)} /></Panel>}
        {learning.error && <Action label={t(['सहेजी प्रगति फिर लोड करें','Retry loading progress'])} onPress={() => void learning.hydrate().catch(failed)} />}
        {!query && !savedOnly && <>
          <CollectionCard topic={getSanatanTopic('symbols')!} variant="feature" onPress={() => open('symbols')} testID="sanatan-featured" />
          <ListingSectionHeader>{t(['कभी सोचा है?','Have you wondered?'])}</ListingSectionHeader>
          <DiscoveryPair topics={['dikpal','thirty'].map(id => getSanatanTopic(id)!)} onOpen={open} />
        </>}
        <ListingSectionHeader>{t(['आप क्या समझना चाहेंगे?','What would you like to understand?'])}</ListingSectionHeader>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {[['सभी','All',''],['देव और स्वरूप','Deities','Deities & forms'],['प्रतीक और पूजा','Worship','Symbols & worship'],['समय और ज्ञान','Knowledge','Time & knowledge']].map(([hi,en,value]) =>
            <Action key={value} label={t([hi,en])} selected={group === value} onPress={() => setGroup(value)} style={{ borderRadius: 24, minHeight: 44, paddingVertical: 8, paddingHorizontal: 14 }} />)}
        </View>
        {[...new Set(topics.map(x => x.group[1]))].map(key => <View key={key} style={{ gap: 12 }}>
          <ListingSectionHeader>{t(topics.find(x => x.group[1] === key)!.group)}</ListingSectionHeader>
          {topics.filter(x => x.group[1] === key).map(x => <CollectionCard key={x.id} topic={x} testID={`sanatan-collection-${x.id}`} onPress={() => open(x.id)} />)}
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
