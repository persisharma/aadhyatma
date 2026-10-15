import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ReaderHeader from '@/components/ReaderHeader';
import LanguageToggle from '@/components/LanguageToggle';
import KidsStoryArt from '@/components/KidsStoryArt';
import ListingCard, { ListingScope, ListingSectionHeader } from '@/components/ListingCard';
import { getStoryDeity, navadurgaReadings, plannedStories, storiesForDeity, storyText, type KidsStory, type NavadurgaReading } from '@/data/kidsStories';
import { useGitaLanguage } from '@/data/gita/language';
import { useTheme } from '@/theme/ThemeContext';
import { titleFontByLang, meaningToken } from '@/utils/langType';
import { pick } from '@/utils/localize';
import type { HomeStackParamList } from '@/navigation/types';

export default function KidsStoryDeityScreen({ navigation, route }: NativeStackScreenProps<HomeStackParamList, 'KidsStoryDeity'>) {
  const { lang } = useGitaLanguage();
  const { colors, typography, spacing, radii } = useTheme();
  const deity = getStoryDeity(route.params.deityId);
  const stories = storiesForDeity(route.params.deityId);
  const planned = plannedStories.filter(item => item.deityId === route.params.deityId);
  const title = deity ? storyText(deity.name, lang) : pick(lang, { hi: 'कथाएँ', en: 'Stories', gu: 'વાર્તાઓ', kn: 'ಕಥೆಗಳು' });
  const pageLabel = pick(lang, { hi: 'पृष्ठ', en: 'pages', gu: 'પાનાં', kn: 'ಪುಟಗಳು' });
  const comingSoon = pick(lang, { hi: 'जल्द आएगी', en: 'Coming soon', gu: 'જલ્દી આવશે', kn: 'ಶೀಘ್ರದಲ್ಲೇ ಬರಲಿದೆ' });
  // Age is a shelf-wide fact, stated once in the scope line — never per card.
  const age = stories.length ? Math.min(...stories.map(story => story.ageMin)) : 0;
  const count = stories.length;
  const scope = pick(lang, {
    hi: `${age}+ आयु · ${count} चित्र-पाठ`,
    en: `Ages ${age}+ · ${count} illustrated ${count === 1 ? 'reading' : 'readings'}`,
    gu: `${age}+ વય · ${count} ચિત્રવાંચન`,
    kn: `${age}+ ವಯಸ್ಸು · ${count} ಚಿತ್ರವಾಚನಗಳು`,
  });
  const renderStory = (story: KidsStory, form?: NavadurgaReading) => {
    const storyTitle = storyText(story.title, lang);
    const day = form ? pick(lang, { hi: `दिन ${form.day}`, en: `Day ${form.day}`, gu: `દિવસ ${form.day}`, kn: `ದಿನ ${form.day}` }) : undefined;
    const meta = `${story.pages.length} ${pageLabel}`;
    return (
      <ListingCard
        key={story.id}
        testID={`kids-story-${story.id}`}
        eyebrow={day}
        title={storyTitle}
        description={storyText(story.description, lang)}
        meta={meta}
        // The form name stays in the spoken label: the visible eyebrow drops it because the title already leads with it.
        accessibilityLabel={`${day && form ? `${day} · ${storyText(form.name, lang)}. ` : ''}${storyTitle}. ${meta}.`}
        thumbnail={<KidsStoryArt fill art={story.coverArt} label={storyTitle} />}
        onPress={() => navigation.navigate('KidsStoryReader', { storyId: story.id })}
      />
    );
  };
  const formStoryIds = new Set(navadurgaReadings.map(form => form.storyId));
  const navaratri = stories.find(story => story.id === 'durga-navaratri');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.parchment }} edges={['top', 'left', 'right']}>
      <ReaderHeader title={title} onBack={() => navigation.goBack()} variant="index" />
      <View style={{ paddingBottom: spacing.md }}><LanguageToggle /></View>
      <ScrollView testID="kids-story-shelf" contentContainerStyle={{ paddingHorizontal: spacing.readingGutter, paddingBottom: spacing.md, gap: spacing.md }}>
        {count > 0 && <ListingScope testID="kids-story-scope">{scope}</ListingScope>}
        {route.params.deityId === 'durga' ? <>
          {navaratri && renderStory(navaratri)}
          <ListingSectionHeader>{pick(lang, { hi: 'नवरात्रि के नौ रूप', en: 'Navaratri: nine forms', gu: 'નવરાત્રિનાં નવ રૂપ', kn: 'ನವರಾತ್ರಿಯ ಒಂಬತ್ತು ರೂಪಗಳು' })}</ListingSectionHeader>
          {navadurgaReadings.map(form => {
            const story = stories.find(item => item.id === form.storyId);
            return story ? renderStory(story, form) : null;
          })}
          <ListingSectionHeader>{pick(lang, { hi: 'माँ दुर्गा की अन्य कथाएँ', en: 'More Maa Durga stories', gu: 'મા દુર્ગાની બીજી વાર્તાઓ', kn: 'ದುರ್ಗಾ ಮಾತೆಯ ಇನ್ನಷ್ಟು ಕಥೆಗಳು' })}</ListingSectionHeader>
          {stories.filter(story => story.id !== 'durga-navaratri' && !formStoryIds.has(story.id)).map(story => renderStory(story))}
        </> : stories.map(story => renderStory(story))}
        {planned.map(item => (
          <View
            key={item.id}
            testID={`kids-story-planned-${item.id}`}
            accessibilityLabel={`${storyText(item.title, lang)}. ${comingSoon}.`}
            style={{ backgroundColor: colors.parchmentSoft, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.divider, padding: 18, opacity: 0.72 }}
          >
            <Text style={{ color: colors.ink, fontFamily: titleFontByLang(lang), ...typography.listingTitle }}>{storyText(item.title, lang)}</Text>
            <Text style={{ color: colors.inkMuted, fontFamily: meaningToken(lang, typography).fontFamily, ...typography.listingBody, marginTop: 6 }}>{comingSoon}</Text>
          </View>
        ))}
        {stories.length === 0 && planned.length === 0 && (
          <Text style={{ ...meaningToken(lang, typography), color: colors.inkSoft, textAlign: 'center', paddingVertical: 32 }}>
            {pick(lang, { hi: 'यहाँ नई चित्र-कथाएँ जल्द आएँगी।', en: 'New picture stories are being prepared for this shelf.', gu: 'અહીં નવી ચિત્રવાર્તાઓ જલ્દી આવશે.', kn: 'ಈ ವಿಭಾಗಕ್ಕೆ ಹೊಸ ಚಿತ್ರಕಥೆಗಳು ಶೀಘ್ರದಲ್ಲೇ ಬರಲಿವೆ.' })}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
