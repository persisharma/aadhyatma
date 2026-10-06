import React from 'react';
import { ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ReaderHeader from '@/components/ReaderHeader';
import DeityCard from '@/components/DeityCard';
import { storyDeities, storiesForDeity } from '@/data/kidsStories';
import { useGitaLanguage } from '@/data/gita/language';
import { useTheme } from '@/theme/ThemeContext';
import { titleFontByLang } from '@/utils/langType';
import { pick } from '@/utils/localize';
import type { HomeStackParamList } from '@/navigation/types';

export default function KidsStoryLibraryScreen({ navigation }: NativeStackScreenProps<HomeStackParamList, 'KidsStoryLibrary'>) {
  const { lang } = useGitaLanguage();
  const { colors, spacing, typography } = useTheme();
  const title = pick(lang, { hi: 'बच्चों की चित्र-कथाएँ', en: 'Stories for Kids', gu: 'બાળકોની ચિત્રવાર્તાઓ', kn: 'ಮಕ್ಕಳ ಚಿತ್ರಕಥೆಗಳು' });
  const prompt = pick(lang, { hi: 'किसकी कथा पढ़ेंगे?', en: 'Whose stories shall we read?', gu: 'કોની વાર્તાઓ વાંચશો?', kn: 'ಯಾರ ಕಥೆಗಳನ್ನು ಓದುತ್ತೀರಿ?' });
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.parchment }} edges={['top', 'left', 'right', 'bottom']}>
      <ReaderHeader title={title} onBack={() => navigation.goBack()} variant="index" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.xxl, paddingTop: 8, paddingBottom: 40, gap: spacing.md }}>
        <Text style={{ color: colors.inkSoft, fontFamily: titleFontByLang(lang), fontSize: typography.subtitle.fontSize, lineHeight: 23, marginBottom: 6 }}>{prompt}</Text>
        {storyDeities.map(deity => {
          const count = storiesForDeity(deity.id).length;
          const status = count
            ? pick(lang, { hi: `${count} कथा`, en: `${count} story`, gu: `${count} વાર્તા`, kn: `${count} ಕಥೆ` })
            : pick(lang, { hi: 'कथाएँ जल्द आएँगी', en: 'Stories coming soon', gu: 'વાર્તાઓ જલ્દી આવશે', kn: 'ಕಥೆಗಳು ಶೀಘ್ರದಲ್ಲೇ ಬರಲಿವೆ' });
          return (
            <DeityCard
              key={deity.id}
              testID={`kids-story-deity-${deity.id}`}
              nameHi={deity.name.hi}
              nameEn={deity.name.en}
              nameGu={deity.name.gu}
              nameKn={deity.name.kn}
              itemCount={status}
              iconKey={deity.iconKey}
              onPress={() => navigation.navigate('KidsStoryDeity', { deityId: deity.id })}
            />
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
