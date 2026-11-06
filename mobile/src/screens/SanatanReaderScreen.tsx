import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, Modal, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { getSanatanTopic, getSanatanPageTitles, validSanatanPage, sanatanSources, type SanatanTopic } from '@/data/sanatan-parichay';
import { useSanatanLearning } from '@/data/sanatan-parichay/store';
import ReaderHeader from '@/components/ReaderHeader';
import ReadingProgressBar from '@/components/ReadingProgressBar';
import LanguageToggle from '@/components/LanguageToggle';
import ProseReadingCard from '@/components/ProseReadingCard';
import AutoSlideScrollView from '@/components/AutoSlideScrollView';
import AutoSlideButton from '@/components/AutoSlideButton';
import ReadAloudButton from '@/components/readAloud/ReadAloudButton';
import { useReaderPlayback } from '@/screens/_useAutoSlide';
import { useShare, type ShareableProse } from '@/utils/shareVerse';
import BackgroundLayer from '@/components/BackgroundLayer';
import { readingParchment } from '@/data/backgroundAsset';
import { Action, Copy, Painting, PrimaryAction, ToolAction, useSanatanText } from '@/components/sanatan/Primitives';
import SourceCredits from '@/components/sanatan/SourceCredits';
import ExploreDiagram from '@/components/sanatan/ExploreDiagram';
import type { KathaContentSection } from '@/panchang/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'SanatanReader'>;
export default function SanatanReaderScreen(props: Props) {
  const topic = getSanatanTopic(props.route.params.topicId);
  const learning = useSanatanLearning();
  const t = useSanatanText();
  const { colors } = useTheme();
  if (!topic || (!learning.ready && props.route.params.initialPage === undefined)) {
    return <SafeAreaView style={{ flex: 1, backgroundColor: colors.parchment }}>
      <ReaderHeader title={t(['सनातन परिचय','Sanatan Parichay'])} onBack={() => props.navigation.goBack()} />
      <View style={{ padding: 22 }}><Copy>{t(topic ? ['प्रगति लोड हो रही है…','Loading progress…'] : ['यह परिचय उपलब्ध नहीं है।','This introduction is unavailable.'])}</Copy>
        {learning.error && <Action label={t(['फिर प्रयास करें','Try again'])} onPress={() => void learning.hydrate().catch(() => undefined)} />}</View>
    </SafeAreaView>;
  }
  const requested = props.route.params.initialPage ?? (learning.resume?.id === topic.id ? learning.resume.page : 0);
  return <Lesson key={topic.id} {...props} topic={topic} initialPage={validSanatanPage(topic.id, requested) ? requested : 0} />;
}

function Lesson({ navigation, topic, initialPage }: Props & { topic: SanatanTopic; initialPage: number }) {
  const t = useSanatanText();
  const { lang } = useGitaLanguage();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const learning = useSanatanLearning();
  const [page, setPage] = useState(initialPage);
  const pageRef = useRef(initialPage);
  const [sources, setSources] = useState(false);
  const listRef = useRef<FlatList<KathaContentSection>>(null);
  const { share, busy } = useShare();
  const titles = getSanatanPageTitles(topic);
  const data = useMemo<KathaContentSection[]>(() => topic.pages.map((body, index) => ({
    id: `sanatan-${topic.id}-${index}`, titleHi: titles[index][0], titleEn: titles[index][1],
    bodyHi: [body[0]], bodyEn: [body[1]],
  })), [topic]);
  const { readAloud, autoSlide } = useReaderPlayback({ sourceId: `sanatan-${topic.id}`, data,
    offset: 0, verseCount: data.length, currentIndex: page, listRef });
  const failed = () => Alert.alert(t(['प्रगति सहेजी नहीं गई','Progress was not saved']), t(['फिर प्रयास करें।','Please try again.']));
  // Opening a lesson records a resume position, never a completed page.
  useEffect(() => { void learning.resumeAt(topic.id, initialPage).catch(failed); }, [topic.id]);
  useEffect(() => { listRef.current?.scrollToOffset({ offset: width * pageRef.current, animated: false }); }, [width]);
  const changed = (next: number) => {
    if (next < 0 || next >= data.length || next === pageRef.current) return;
    const previous = pageRef.current;
    pageRef.current = next;
    setPage(next);
    // Mark only the page left by a forward turn; backwards navigation is not completion.
    const persist = next > previous ? learning.readPage(topic.id, previous).then(() => learning.resumeAt(topic.id, next)) : learning.resumeAt(topic.id, next);
    void persist.catch(failed);
  };
  const go = (next: number) => {
    changed(next);
    listRef.current?.scrollToIndex({ index: next, animated: true });
  };
  const shareLesson = () => {
    const scope = (whole: boolean) => ({ id: whole ? 'whole' : `page-${page}`, labelHi: whole ? 'पूरा परिचय' : 'यह पृष्ठ', labelEn: whole ? 'Whole introduction' : 'This page',
      headerHi: topic.title[0], headerEn: topic.title[1], titleHi: topic.question[0], titleEn: topic.question[1],
      blocks: [...(whole ? topic.pages : [topic.pages[page]]).map(body => ({ kind: 'para' as const, hi: body[0], en: body[1] })),
        ...topic.refs.map(id => { const s = sanatanSources[id]; const credit = `${s.title} · ${s.edition} · ${s.location}`; return { kind: 'para' as const, hi: credit, en: credit }; })],
    });
    const content: ShareableProse = { kind: 'prose', sourceId: `sanatan-${topic.id}`, background: null,
      sectionNameHi: 'सनातन परिचय', sectionNameEn: 'Sanatan Parichay', tagNameHi: topic.name[0], tagNameEn: topic.name[1],
      scopes: [scope(false), scope(true)] };
    void share(content, lang);
  };
  return <View style={{ flex: 1, backgroundColor: colors.parchment }}>
    <BackgroundLayer source={readingParchment} />
    <SafeAreaView style={{ flex: 1 }}>
      <ReaderHeader title={t(topic.name)} onBack={() => navigation.goBack()} sideWidth={52}
        right={<Text style={{ color: colors.ink }}>{page + 1}/3</Text>} />
      <ReadingProgressBar current={page + 1} total={3} />
      <View style={{ paddingHorizontal: 22, paddingVertical: 8, gap: 8 }}>
        <LanguageToggle />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <ReadAloudButton control={readAloud} /><AutoSlideButton control={autoSlide} floating={false} />
        </View>
      </View>
      <FlatList ref={listRef} data={data} keyExtractor={item => item.id} horizontal pagingEnabled
        initialScrollIndex={initialPage} extraData={lang} CellRendererComponent={autoSlide.Cell}
        showsHorizontalScrollIndicator={false} getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        onMomentumScrollEnd={event => changed(Math.round(event.nativeEvent.contentOffset.x / width))}
        onScrollToIndexFailed={() => listRef.current?.scrollToOffset({ offset: width * pageRef.current, animated: false })}
        renderItem={({ index }) => <View style={{ width, flex: 1 }}>
          <AutoSlideScrollView contentContainerStyle={{ padding: 22, paddingBottom: 40, gap: 16 }}>
            <ProseReadingCard heading={<Copy heading>{t(titles[index])}</Copy>}>
              {index === 0 && <Painting id={topic.id} />}
              {index === 0 && <Copy heading>{t(topic.question)}</Copy>}
              {t(topic.pages[index]).split(/\n\s*\n/).map((paragraph, paragraphIndex) => <Copy key={paragraphIndex}>{paragraph}</Copy>)}
              {index === 1 && <ExploreDiagram topic={topic} onCollection={topicId => navigation.push('SanatanParichay', { topicId })} />}
            </ProseReadingCard>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
            <ToolAction icon="saved" label={t(learning.saved.includes(topic.id) ? ['सहेजा हुआ हटाएँ','Remove saved lesson'] : ['बाद के लिए सहेजें','Save for later'])}
              selected={learning.saved.includes(topic.id)} onPress={() => void learning.toggleSaved(topic.id).catch(failed)} />
            <ToolAction icon="info" label={t(['स्रोत और सन्दर्भ','Sources & context'])} onPress={() => { readAloud.stop(); autoSlide.stop(); setSources(true); }} />
            <ToolAction icon="share" disabled={busy} label={t(['साझा करें','Share'])} onPress={shareLesson} />
            </View>
            {index > 0 && <Action label={t(['पिछला पृष्ठ','Previous page'])} onPress={() => go(index - 1)} />}
            <PrimaryAction testID="sanatan-next" label={t(index === 2 ? ['परिचय पूरा हुआ','Finish introduction'] : ['अगला पृष्ठ','Next page'])}
              onPress={() => { if (index < 2) go(index + 1); else { readAloud.stop(); autoSlide.stop(); void learning.readPage(topic.id, index, true).then(() => navigation.goBack()).catch(failed); } }} />
          </AutoSlideScrollView>
        </View>} />
      <Modal visible={sources} animationType="slide" onRequestClose={() => setSources(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.parchment }}>
          <ReaderHeader title={t(['स्रोत और सन्दर्भ','Sources & context'])} onBack={() => setSources(false)} />
          <SourceCredits topic={topic} />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  </View>;
}
