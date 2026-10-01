import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ReaderHeader from '@/components/ReaderHeader';
import KidsStoryArt from '@/components/KidsStoryArt';
import { kidsStories, storyText } from '@/data/kidsStories';
import { useGitaLanguage } from '@/data/gita/language';
import { useTheme } from '@/theme/ThemeContext';
import { titleFontByLang, meaningToken } from '@/utils/langType';
import { pick } from '@/utils/localize';
import type { MoreStackParamList } from '@/navigation/types';

export default function KidsStoryLibraryScreen({ navigation }: NativeStackScreenProps<MoreStackParamList, 'KidsStoryLibrary'>) {
  const { lang } = useGitaLanguage();
  const { colors, typography, spacing } = useTheme();
  const title = pick(lang, { hi: 'बच्चों की चित्र-कथाएँ', en: 'Stories for Kids', gu: 'બાળકોની ચિત્રવાર્તાઓ', kn: 'ಮಕ್ಕಳ ಚಿತ್ರಕಥೆಗಳು' });
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.parchment }} edges={['top', 'left', 'right', 'bottom']}>
      <ReaderHeader title={title} onBack={() => navigation.goBack()} variant="index" />
      <ScrollView contentContainerStyle={{ padding: spacing.readingGutter, gap: spacing.lg }}>
        {kidsStories.map(story => (
          <Pressable key={story.id} testID={`kids-story-${story.id}`} accessibilityRole="button" accessibilityLabel={storyText(story.title, lang)} onPress={() => navigation.navigate('KidsStoryReader', { storyId: story.id })} style={{ backgroundColor: colors.parchmentSoft, borderRadius: 16, padding: 14, gap: 10 }}>
            <View style={{ width: 130, alignSelf: 'center' }}><KidsStoryArt art={story.coverArt} label={storyText(story.title, lang)} /></View>
            <Text style={{ fontFamily: titleFontByLang(lang), color: colors.ink, fontSize: 24 }}>{storyText(story.title, lang)}</Text>
            <Text style={{ ...meaningToken(lang, typography), color: colors.inkSoft }}>{storyText(story.description, lang)}</Text>
            <Text style={{ color: colors.inkMuted, fontFamily: titleFontByLang(lang) }}>{story.ageMin}+ · {story.pages.length} {pick(lang, { hi: 'पृष्ठ', en: 'pages', gu: 'પાનાં', kn: 'ಪುಟಗಳು' })}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
