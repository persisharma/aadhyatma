import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { getSanatanTopic, getSanatanPageTitles, getSanatanReadingPages, validSanatanPage, type SanatanTopic } from '@/data/sanatan-parichay';
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
import BookmarkButton from '@/components/BookmarkButton';
import ShareButton from '@/components/ShareButton';
import PagerNavBar from '@/components/PagerNavBar';
import ZoomableArtwork from '@/components/ZoomableArtwork';
import { sanatanArtwork } from '@/data/sanatan-parichay/artwork';
import { Action, Copy, PagePill, Painting, useSanatanText } from '@/components/sanatan/Primitives';
import {LessonAnswer,LessonTerms,LessonTakeaway,LessonRelated,ReadingBlocks} from '@/components/sanatan/LessonPanels';
import {openSanatanRelated} from '@/navigation/sanatanRelated';
import ExploreDiagram from '@/components/sanatan/ExploreDiagram';
import SwastikaGuide from '@/components/sanatan/SwastikaGuide';
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
  const { colors, spacing, typography } = useTheme();
  const { width } = useWindowDimensions();
  const learning = useSanatanLearning();
  const [page, setPage] = useState(initialPage);
  const pageRef = useRef(initialPage);
  const listRef = useRef<FlatList<KathaContentSection>>(null);
  const { share, busy } = useShare();
  const titles = getSanatanPageTitles(topic);
  const readingPages=useMemo(()=>getSanatanReadingPages(topic),[topic]);
  const data = useMemo<KathaContentSection[]>(() => readingPages.map((body, index) => ({
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
  // Finishing is explicit: it records the last page and clears the resume position.
  const finish = () => {
    readAloud.stop(); autoSlide.stop();
    void learning.readPage(topic.id, pageRef.current, true).then(() => navigation.goBack()).catch(failed);
  };
  const saved = learning.saved.includes(topic.id);
  const openRelated=(link:import('@/data/sanatan-parichay/experience').RelatedLesson)=>{
    readAloud.stop();autoSlide.stop();
    if(link.target.kind==='lesson'&&link.target.id===topic.id){go(link.target.page??0);return;}
    openSanatanRelated(navigation,link);
  };
  const shareLesson = () => {
    const scope = (whole: boolean) => ({ id: whole ? 'whole' : `page-${page}`, labelHi: whole ? 'पूरा परिचय' : 'यह पृष्ठ', labelEn: whole ? 'Whole introduction' : 'This page',
      headerHi: topic.title[0], headerEn: topic.title[1], titleHi: topic.question[0], titleEn: topic.question[1],
      blocks: (whole ? readingPages : [readingPages[page]]).map(body => ({ kind: 'para' as const, hi: body[0], en: body[1] })),
    });
    const content: ShareableProse = { kind: 'prose', sourceId: `sanatan-${topic.id}`, background: null,
      sectionNameHi: 'सनातन परिचय', sectionNameEn: 'Sanatan Parichay', tagNameHi: topic.name[0], tagNameEn: topic.name[1],
      scopes: [scope(false), scope(true)] };
    void share(content, lang);
  };
  return <View style={{ flex: 1, backgroundColor: colors.parchment }}>
    <BackgroundLayer source={readingParchment} />
    {/* The tab bar below owns the bottom inset, as in the other readers. */}
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
      <ReaderHeader title={t(topic.title)} onBack={() => navigation.goBack()} sideWidth={60}
        right={<Text testID="sanatan-page-counter" style={{ color: colors.inkMuted, fontFamily: typography.pageCounter.fontFamily, fontSize: typography.pageCounter.fontSize, fontStyle: 'italic' }}>{page + 1} / {data.length}</Text>} />
      <ReadingProgressBar current={page + 1} total={data.length} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: spacing.readingGutter, paddingVertical: 8 }}>
        <LanguageToggle />
        <ReadAloudButton control={readAloud} />
        {/* The pill pins itself to flex-start; the wrapper lets the row centre it. */}
        <View><AutoSlideButton control={autoSlide} floating={false} /></View>
      </View>
      <FlatList ref={listRef} data={data} keyExtractor={item => item.id} horizontal pagingEnabled style={{ flex: 1 }}
        initialScrollIndex={initialPage} extraData={lang} CellRendererComponent={autoSlide.Cell}
        showsHorizontalScrollIndicator={false} getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        onMomentumScrollEnd={event => changed(Math.round(event.nativeEvent.contentOffset.x / width))}
        onScrollToIndexFailed={() => listRef.current?.scrollToOffset({ offset: width * pageRef.current, animated: false })}
        renderItem={({ index }) => <View style={{ width, flex: 1 }}
          accessibilityElementsHidden={index !== page}
          importantForAccessibility={index === page ? 'auto' : 'no-hide-descendants'}>
          <AutoSlideScrollView contentContainerStyle={{ paddingHorizontal: spacing.readingGutter, paddingTop: 4, paddingBottom: 28, gap: 16 }}>
            <ProseReadingCard heading={<>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <PagePill>{t(index === 1 ? ['चित्र से समझें', 'Explore visually'] : topic.name)}</PagePill>
                {/* The shared round buttons; -7 sets the 34pt circle, not the 48pt target, on the gutter. */}
                <View style={{ flexDirection: 'row', flexShrink: 0, marginRight: -7 }}>
                  <BookmarkButton isBookmarked={saved} onToggle={() => void learning.toggleSaved(topic.id).catch(failed)}
                    accessibilityLabel={t(saved ? ['सहेजा हुआ हटाएँ','Remove saved lesson'] : ['बाद के लिए सहेजें','Save for later'])} />
                  <ShareButton busy={busy} accessibilityLabel={t(['साझा करें','Share'])} accessibilityHint="Opens share options for this page" onPress={shareLesson} />
                </View>
              </View>
              <Copy heading>{t(titles[index])}</Copy>
            </>}>
              {index === 0 && <ZoomableArtwork testID={`sanatan-painting-${topic.id}`} source={sanatanArtwork[topic.id]} aspectRatio={1.5}
                title={t(topic.title)} caption={t(topic.question)} onOpen={autoSlide.stop}><Painting id={topic.id} /></ZoomableArtwork>}
              {index === 0 && <LessonAnswer id={topic.id} question={topic.question}/>}
              {index === 1 && <ExploreDiagram topic={topic} onOpenPicture={autoSlide.stop}/>}
              {topic.kind === 'swastika' && index === 2 && <SwastikaGuide mode="drawing" />}
              {index !== 1 && <ReadingBlocks body={topic.pages[index]}/>}
              {index===0&&<LessonTerms id={topic.id}/>}
              {index===data.length-1&&<LessonTakeaway id={topic.id}/>}
            </ProseReadingCard>
            {index===data.length-1&&<LessonRelated id={topic.id} onOpen={openRelated}/>}
          </AutoSlideScrollView>
        </View>} />
      <PagerNavBar page={page} total={data.length} nextTestID="sanatan-next"
        onPrevious={() => go(page - 1)} onNext={() => page < data.length - 1 ? go(page + 1) : finish()}
        previousLabel={t(['पिछला पृष्ठ','Previous page'])} nextLabel={t(['अगला पृष्ठ','Next page'])}
        finishLabel={t(['परिचय पूरा हुआ','Finish introduction'])}
        pageLabel={`${t(['पृष्ठ','Page'])} ${page + 1} / ${data.length}`} />
    </SafeAreaView>
  </View>;
}
