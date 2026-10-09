import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ReaderHeader from '@/components/ReaderHeader';
import KidsStoryArt from '@/components/KidsStoryArt';
import { getStoryDeity, navadurgaReadings, plannedStories, storiesForDeity, storyText, type KidsStory, type NavadurgaReading } from '@/data/kidsStories';
import { useGitaLanguage } from '@/data/gita/language';
import { useTheme } from '@/theme/ThemeContext';
import { titleFontByLang, meaningToken } from '@/utils/langType';
import { pick } from '@/utils/localize';
import { orderTitlesByLanguage } from '@/utils/titleByLanguage';
import type { HomeStackParamList } from '@/navigation/types';

export default function KidsStoryDeityScreen({ navigation, route }: NativeStackScreenProps<HomeStackParamList, 'KidsStoryDeity'>) {
  const { lang } = useGitaLanguage();
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const deity = getStoryDeity(route.params.deityId);
  const stories = storiesForDeity(route.params.deityId);
  const planned = plannedStories.filter(item => item.deityId === route.params.deityId);
  const title = deity ? storyText(deity.name, lang) : pick(lang, { hi: 'कथाएँ', en: 'Stories', gu: 'વાર્તાઓ', kn: 'ಕಥೆಗಳು' });
  const pageLabel = pick(lang, { hi: 'पृष्ठ', en: 'pages', gu: 'પાનાં', kn: 'ಪುಟಗಳು' });
  const comingSoon = pick(lang, { hi: 'जल्द आएगी', en: 'Coming soon', gu: 'જલ્દી આવશે', kn: 'ಶೀಘ್ರದಲ್ಲೇ ಬರಲಿದೆ' });
  const renderStory = (story: KidsStory, form?: NavadurgaReading) => {
    const ordered = orderTitlesByLanguage(lang, story.title.hi, story.title.en, { devPrimary: 17, devSecondary: 13, latPrimary: 19, latSecondary: 12 });
    const primary = { ...ordered.primary, text: lang === 'gu' || lang === 'kn' ? storyText(story.title, lang) : ordered.primary.text };
    const day = form ? pick(lang, { hi: `दिन ${form.day}`, en: `Day ${form.day}`, gu: `દિવસ ${form.day}`, kn: `ದಿನ ${form.day}` }) : '';
    const formLabel = form ? `${day} · ${storyText(form.name, lang)}` : '';
    const kindLabel = story.kind === 'introduction'
      ? pick(lang, { hi: 'परिचय', en: 'Introduction', gu: 'પરિચય', kn: 'ಪರಿಚಯ' })
      : pick(lang, { hi: 'कथा', en: 'Story', gu: 'વાર્તા', kn: 'ಕಥೆ' });
    return (
      <Pressable
        key={story.id}
        testID={`kids-story-${story.id}`}
        accessibilityRole="button"
        accessibilityLabel={`${formLabel ? `${formLabel}. ` : ''}${storyText(story.title, lang)}. ${story.pages.length} ${pageLabel}.`}
        onPress={() => navigation.navigate('KidsStoryReader', { storyId: story.id })}
        style={({ pressed }) => ({ borderColor: colors.cardActiveBorder, borderWidth: 1, borderRadius: radii.lg, padding: 14, overflow: 'hidden', ...elevation.raised, opacity: pressed ? 0.85 : 1 })}
      >
        <LinearGradient colors={[colors.cardActiveFrom, colors.cardActiveTo]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={{ width: 120, flexShrink: 0 }}><KidsStoryArt art={story.coverArt} label={storyText(story.title, lang)} /></View>
          <View style={{ flex: 1, gap: 5 }}>
            {form && <Text style={{ color: colors.saffron, fontFamily: titleFontByLang(lang), fontSize: 12 }}>{formLabel}</Text>}
            <Text style={{ color: colors.ink, fontFamily: primary.fontFamily, fontSize: primary.fontSize, fontStyle: primary.fontStyle, letterSpacing: primary.letterSpacing }} numberOfLines={2}>{primary.text}</Text>
            <Text style={{ color: colors.inkMuted, fontFamily: ordered.secondary.fontFamily, fontSize: ordered.secondary.fontSize, fontStyle: ordered.secondary.fontStyle }}>{ordered.secondary.text}</Text>
            <Text style={{ ...meaningToken(lang, typography), color: colors.inkSoft, fontSize: 13 }} numberOfLines={3}>{storyText(story.description, lang)}</Text>
            <Text style={{ color: colors.inkMuted, fontFamily: titleFontByLang(lang), fontSize: 11 }}>{story.ageMin}+ · {story.pages.length} {pageLabel}{story.deityId === 'durga' ? ` · ${kindLabel}` : ''}</Text>
          </View>
          <Text style={{ color: colors.saffron, fontSize: 26 }} accessible={false}>›</Text>
        </View>
      </Pressable>
    );
  };
  const sectionTitle = (text: string) => <Text accessibilityRole="header" style={{ ...meaningToken(lang, typography), color: colors.ink, marginTop: spacing.md }}>{text}</Text>;
  const formStoryIds = new Set(navadurgaReadings.map(form => form.storyId));
  const navaratri = stories.find(story => story.id === 'durga-navaratri');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.parchment }} edges={['top', 'left', 'right']}>
      <ReaderHeader title={title} onBack={() => navigation.goBack()} variant="index" />
      <ScrollView testID="kids-story-shelf" contentContainerStyle={{ paddingHorizontal: spacing.xxl, paddingTop: 8, paddingBottom: spacing.md, gap: spacing.md }}>
        {route.params.deityId === 'durga' ? <>
          {navaratri && renderStory(navaratri)}
          {sectionTitle(pick(lang, { hi: 'नवरात्रि के नौ रूप', en: 'Navaratri: nine forms', gu: 'નવરાત્રિનાં નવ રૂપ', kn: 'ನವರಾತ್ರಿಯ ಒಂಬತ್ತು ರೂಪಗಳು' }))}
          {navadurgaReadings.map(form => {
            const story = stories.find(item => item.id === form.storyId);
            return story ? renderStory(story, form) : null;
          })}
          {sectionTitle(pick(lang, { hi: 'माँ दुर्गा की अन्य कथाएँ', en: 'More Maa Durga stories', gu: 'મા દુર્ગાની બીજી વાર્તાઓ', kn: 'ದುರ್ಗಾ ಮಾತೆಯ ಇನ್ನಷ್ಟು ಕಥೆಗಳು' }))}
          {stories.filter(story => story.id !== 'durga-navaratri' && !formStoryIds.has(story.id)).map(story => renderStory(story))}
        </> : stories.map(story => renderStory(story))}
        {planned.map(item => {
          const ordered = orderTitlesByLanguage(lang, item.title.hi, item.title.en, { devPrimary: 16, devSecondary: 12, latPrimary: 18, latSecondary: 11 });
          const primary = { ...ordered.primary, text: lang === 'gu' || lang === 'kn' ? storyText(item.title, lang) : ordered.primary.text };
          return (
          <View
            key={item.id}
            testID={`kids-story-planned-${item.id}`}
            accessibilityLabel={`${storyText(item.title, lang)}. ${comingSoon}.`}
            style={{ backgroundColor: colors.parchmentSoft, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.divider, padding: 18, opacity: 0.72 }}
          >
            <Text style={{ color: colors.ink, fontFamily: primary.fontFamily, fontSize: primary.fontSize, fontStyle: primary.fontStyle, letterSpacing: primary.letterSpacing }}>{primary.text}</Text>
            <Text style={{ color: colors.inkMuted, fontFamily: ordered.secondary.fontFamily, fontSize: ordered.secondary.fontSize, fontStyle: ordered.secondary.fontStyle, marginTop: 2 }}>{ordered.secondary.text}</Text>
            <Text style={{ color: colors.inkMuted, fontFamily: titleFontByLang(lang), fontSize: 14, marginTop: 6 }}>{comingSoon}</Text>
          </View>
        ); })}
        {stories.length === 0 && planned.length === 0 && (
          <Text style={{ ...meaningToken(lang, typography), color: colors.inkSoft, textAlign: 'center', paddingVertical: 32 }}>
            {pick(lang, { hi: 'यहाँ नई चित्र-कथाएँ जल्द आएँगी।', en: 'New picture stories are being prepared for this shelf.', gu: 'અહીં નવી ચિત્રવાર્તાઓ જલ્દી આવશે.', kn: 'ಈ ವಿಭಾಗಕ್ಕೆ ಹೊಸ ಚಿತ್ರಕಥೆಗಳು ಶೀಘ್ರದಲ್ಲೇ ಬರಲಿವೆ.' })}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
