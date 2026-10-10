import React, { useEffect, useRef, useState } from 'react';
import { FlatList, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ReaderHeader from '@/components/ReaderHeader';
import ReadingProgressBar from '@/components/ReadingProgressBar';
import LanguageToggle from '@/components/LanguageToggle';
import KidsStoryArt from '@/components/KidsStoryArt';
import ShareButton from '@/components/ShareButton';
import { useShare } from '@/utils/shareVerse';
import { kidsStoryShareable } from '@/utils/shareContent';
import { getKidsStory, storyPageIndex, storyText, type StoryPage } from '@/data/kidsStories';
import { useGitaLanguage } from '@/data/gita/language';
import { useTheme } from '@/theme/ThemeContext';
import { meaningToken, titleFontByLang } from '@/utils/langType';
import { pick } from '@/utils/localize';
import type { HomeStackParamList } from '@/navigation/types';

export default function KidsStoryReaderScreen({ navigation, route }: NativeStackScreenProps<HomeStackParamList, 'KidsStoryReader'>) {
  const { lang } = useGitaLanguage();
  const { share, busy } = useShare();
  const { colors, typography, spacing } = useTheme();
  const story = getKidsStory(route.params.storyId);
  const [index, setIndex] = useState(() => story ? storyPageIndex(story, route.params.pageId) : 0);
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.parchment }} edges={['top', 'left', 'right']}>
      <ReaderHeader title={library} onBack={() => navigation.goBack()} />
      <Text style={{ ...meaningToken(lang, typography), padding: spacing.readingGutter, color: colors.ink }}>{pick(lang, { hi: 'कथा नहीं मिली।', en: 'Story not found.', gu: 'વાર્તા મળી નથી.', kn: 'ಕಥೆ ಸಿಗಲಿಲ್ಲ.' })}</Text>
    </SafeAreaView>
  );
  // The visible bottom tab bar already owns the bottom safe-area inset.
  return (
    <SafeAreaView testID="kids-story-reader" style={{ flex: 1, backgroundColor: colors.parchment }} edges={['top', 'left', 'right']}>
      <ReaderHeader title={storyText(story.title, lang)} onBack={() => navigation.goBack()} sideWidth={60} right={
        <Text testID="story-progress" style={{ color: colors.inkMuted, fontFamily: typography.pageCounter.fontFamily, fontSize: typography.pageCounter.fontSize, fontStyle: 'italic', includeFontPadding: false, minWidth: 48, textAlign: 'right' }}>
          {index + 1} / {story.pages.length}
        </Text>
      } />
      <ReadingProgressBar current={index + 1} total={story.pages.length} />
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingTop: 6, paddingBottom: 12 }}>
        <View style={{ position: 'absolute', right: spacing.readingGutter }}>
          <ShareButton busy={busy} accessibilityLabel={pick(lang, { hi: 'चित्र-कथा साझा करें', en: 'Share picture story', gu: 'ચિત્રવાર્તા શેર કરો', kn: 'ಚಿತ್ರಕಥೆ ಹಂಚಿಕೊಳ್ಳಿ' })}
            accessibilityHint={pick(lang, { hi: 'चित्र और कथा के कार्ड चुनें', en: 'Choose illustrated story cards', gu: 'ચિત્ર અને વાર્તાનાં કાર્ડ પસંદ કરો', kn: 'ಚಿತ್ರ ಮತ್ತು ಕಥೆಯ ಕಾರ್ಡ್‌ಗಳನ್ನು ಆರಿಸಿ' })}
            onPress={() => void share(kidsStoryShareable(story, index), lang)} />
        </View>
        <LanguageToggle />
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
          renderItem={({ item: page, index: pageIndex }) => {
      const isLast = pageIndex === story.pages.length - 1;
      const caption = (
        <View testID="story-caption" accessibilityLiveRegion="polite" style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: 12, backgroundColor: colors.parchmentSoft, gap: spacing.sm }}>
          <Text accessibilityRole="header" style={{ fontFamily: titleFontByLang(lang), color: colors.saffronDeep, fontSize: 24 }}>{storyText(page.title, lang)}</Text>
          <Text style={{ ...meaningToken(lang, typography), color: colors.ink }}>{storyText(page.text, lang)}</Text>
          {page.dialogue && <View style={{ padding: spacing.md, backgroundColor: colors.goldTint, borderRadius: 10 }}>
            <Text style={{ fontFamily: titleFontByLang(lang), color: colors.inkSoft }}>{storyText(page.dialogue.speaker, lang)}</Text>
            <Text style={{ ...meaningToken(lang, typography), color: colors.ink }}>{storyText(page.dialogue.text, lang)}</Text>
          </View>}
        </View>
      );
      // Preserve the scene independently of caption length. Vertical overflow
      // scrolls within this page; horizontal swipes still turn the story page.
      return (
          <ScrollView testID={`story-page-${page.id}`} directionalLockEnabled nestedScrollEnabled style={{ width: pageWidth, flex: 1 }} contentContainerStyle={{ paddingHorizontal: spacing.readingGutter, paddingBottom: spacing.sm, gap: spacing.sm }}>
            <KidsStoryArt art={page.art} label={storyText(page.title, lang)} />
            {caption}
            {isLast && <View style={{ padding: spacing.lg, gap: spacing.sm }}>
              <Text style={{ fontFamily: titleFontByLang(lang), fontSize: 22, color: colors.saffronDeep }}>{pick(lang, { hi: 'कथा की सीख', en: 'What we learn', gu: 'વાર્તાની શીખ', kn: 'ಕಥೆಯ ಪಾಠ' })}</Text>
              <Text style={{ ...meaningToken(lang, typography), color: colors.ink }}>{storyText(story.takeaway, lang)}</Text>
              <Text style={{ ...meaningToken(lang, typography), color: colors.inkSoft }}>{storyText(story.sourceNote, lang)}</Text>
            </View>}
          </ScrollView>
      );
          }}
        />
      </View>
    </SafeAreaView>
  );
}
