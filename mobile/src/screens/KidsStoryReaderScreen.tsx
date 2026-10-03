import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ReaderHeader from '@/components/ReaderHeader';
import ReadingProgressBar from '@/components/ReadingProgressBar';
import LanguagePickerSheet from '@/components/LanguagePickerSheet';
import KidsStoryArt from '@/components/KidsStoryArt';
import { getKidsStory, storyPageIndex, storyText, type StoryPage } from '@/data/kidsStories';
import { LANGUAGES, useGitaLanguage } from '@/data/gita/language';
import { useTheme } from '@/theme/ThemeContext';
import { meaningToken, titleFontByLang } from '@/utils/langType';
import { pick } from '@/utils/localize';
import type { MoreStackParamList } from '@/navigation/types';

export default function KidsStoryReaderScreen({ navigation, route }: NativeStackScreenProps<MoreStackParamList, 'KidsStoryReader'>) {
  const { lang } = useGitaLanguage();
  const { colors, typography, spacing } = useTheme();
  const story = getKidsStory(route.params.storyId);
  const [index, setIndex] = useState(() => story ? storyPageIndex(story, route.params.pageId) : 0);
  const [languageOpen, setLanguageOpen] = useState(false);
  const { width } = useWindowDimensions();
  const [pageWidth, setPageWidth] = useState(width);
  const pager = useRef<FlatList<StoryPage>>(null);
  // A locale change never resets this index, remounts the image or swaps its key.
  useEffect(() => { setIndex(story ? storyPageIndex(story, route.params.pageId) : 0); }, [story, route.params.pageId]);
  useEffect(() => {
    if (story) pager.current?.scrollToIndex({ index: storyPageIndex(story, route.params.pageId), animated: false });
  }, [story, route.params.pageId]);
  const library = pick(lang, { hi: 'कथा संग्रह', en: 'Story library', gu: 'વાર્તા સંગ્રહ', kn: 'ಕಥಾ ಸಂಗ್ರಹ' });
  if (!story) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.parchment }}>
      <ReaderHeader title={library} onBack={() => navigation.goBack()} />
      <Text style={{ ...meaningToken(lang, typography), padding: spacing.readingGutter, color: colors.ink }}>{pick(lang, { hi: 'कथा नहीं मिली।', en: 'Story not found.', gu: 'વાર્તા મળી નથી.', kn: 'ಕಥೆ ಸಿಗಲಿಲ್ಲ.' })}</Text>
    </SafeAreaView>
  );
  const languageName = LANGUAGES.find(option => option.value === lang)?.shortLabel;
  return (
    <SafeAreaView testID="kids-story-reader" style={{ flex: 1, backgroundColor: colors.parchment }} edges={['top', 'left', 'right', 'bottom']}>
      <ReaderHeader title={storyText(story.title, lang)} onBack={() => navigation.goBack()} sideWidth={60} right={
        <Text testID="story-progress" style={{ color: colors.inkMuted, fontFamily: typography.pageCounter.fontFamily, fontSize: typography.pageCounter.fontSize, fontStyle: 'italic', includeFontPadding: false, minWidth: 48, textAlign: 'right' }}>
          {index + 1} / {story.pages.length}
        </Text>
      } />
      <ReadingProgressBar current={index + 1} total={story.pages.length} />
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingTop: 6, paddingBottom: 12 }}>
        <Pressable testID="story-language" onPress={() => setLanguageOpen(true)} accessibilityRole="button" accessibilityLabel={pick(lang, { hi: 'भाषा बदलें', en: 'Change language', gu: 'ભાષા બદલો', kn: 'ಭಾಷೆ ಬದಲಿಸಿ' })} style={{ minHeight: 44, minWidth: 44, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 12 }}>
          <Text style={{ fontFamily: titleFontByLang(lang), color: colors.saffronDeep }}>{languageName}</Text>
        </Pressable>
      </View>
      <View style={{ flex: 1 }} onLayout={event => { if (event.nativeEvent.layout.width > 0) setPageWidth(event.nativeEvent.layout.width); }}>
        <FlatList
          testID="story-pager"
          key={pageWidth}
          ref={pager}
          data={story.pages}
          extraData={lang}
          keyExtractor={page => page.id}
          horizontal
          pagingEnabled
          directionalLockEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={index}
          initialNumToRender={1}
          maxToRenderPerBatch={2}
          windowSize={3}
          getItemLayout={(_, pageIndex) => ({ length: pageWidth, offset: pageWidth * pageIndex, index: pageIndex })}
          onMomentumScrollEnd={event => {
            const settled = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
            setIndex(Math.max(0, Math.min(story.pages.length - 1, settled)));
          }}
          style={{ flex: 1 }}
          renderItem={({ item: page, index: pageIndex }) => (
      <ScrollView testID={`story-page-${page.id}`} style={{ width: pageWidth, flex: 1 }} contentContainerStyle={{ paddingHorizontal: spacing.readingGutter, paddingBottom: spacing.lg, gap: spacing.md }}>
        <KidsStoryArt art={page.art} label={storyText(page.title, lang)} />
        {/* Natural text height allows long translations and accessibility font scaling. */}
        <View testID="story-caption" accessibilityLiveRegion="polite" style={{ padding: spacing.lg, borderRadius: 12, backgroundColor: colors.parchmentSoft, gap: spacing.sm }}>
          <Text accessibilityRole="header" style={{ fontFamily: titleFontByLang(lang), color: colors.saffronDeep, fontSize: 24 }}>{storyText(page.title, lang)}</Text>
          <Text style={{ ...meaningToken(lang, typography), color: colors.ink }}>{storyText(page.text, lang)}</Text>
          {page.dialogue && <View style={{ padding: spacing.md, backgroundColor: colors.goldTint, borderRadius: 10 }}>
            <Text style={{ fontFamily: titleFontByLang(lang), color: colors.inkSoft }}>{storyText(page.dialogue.speaker, lang)}</Text>
            <Text style={{ ...meaningToken(lang, typography), color: colors.ink }}>{storyText(page.dialogue.text, lang)}</Text>
          </View>}
          <Text style={{ fontFamily: titleFontByLang(lang), color: colors.inkMuted }}>{pick(lang, { hi: 'भागवत', en: 'Bhagavata', gu: 'ભાગવત', kn: 'ಭಾಗವತ' })} · {page.source}</Text>
        </View>
        {pageIndex === story.pages.length - 1 && <View style={{ padding: spacing.lg, gap: spacing.sm }}>
          <Text style={{ fontFamily: titleFontByLang(lang), fontSize: 22, color: colors.saffronDeep }}>{pick(lang, { hi: 'कथा की सीख', en: 'What we learn', gu: 'વાર્તાની શીખ', kn: 'ಕಥೆಯ ಪಾಠ' })}</Text>
          <Text style={{ ...meaningToken(lang, typography), color: colors.ink }}>{storyText(story.takeaway, lang)}</Text>
          <Text style={{ ...meaningToken(lang, typography), color: colors.inkSoft }}>{storyText(story.sourceNote, lang)}</Text>
        </View>}
      </ScrollView>
          )}
        />
      </View>
      {languageOpen && <LanguagePickerSheet visible onClose={() => setLanguageOpen(false)} />}
    </SafeAreaView>
  );
}

