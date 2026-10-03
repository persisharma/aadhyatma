import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { gitaSaarChaptersManifest, gitaSaarTitleEn, gitaSaarTitleHi } from '@/data/gita-saar';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang, pick } from '@/utils/localize';
import { scriptBodyFont } from '@/utils/langType';
import { getSourceBackground } from '@/data/backgrounds';
import ReaderHeader from '@/components/ReaderHeader';
import BackgroundLayer from '@/components/BackgroundLayer';
import LanguageToggle from '@/components/LanguageToggle';
import GitaChapterCard from '@/components/GitaChapterCard';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'GitaSaarChapters'>;

/**
 * गीता सार themes index — the §15 chapters index with a theme per row
 * (`विषय N` / `THEME N`, `<n> श्लोक`). `entryRoutes` skips this screen while
 * only one theme ships; it becomes the landing surface the day a second one
 * is appended to the manifest.
 */
export default function GitaSaarThemesScreen({ navigation }: Props) {
  const { colors, spacing, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const { getChapterProgress } = useReadingProgress();

  const title = contentByLang(lang, gitaSaarTitleHi, gitaSaarTitleEn);
  const lede = pick(lang, {
    hi: 'एक विषय, गीता के चुने हुए श्लोक, सरल अर्थ। हर श्लोक से पूरा अर्थ गीता में खुलता है।',
    en: 'One theme, the Gita\'s chosen verses, plain meaning. Every verse opens its full meaning in the Gita.',
    gu: 'એક વિષય, ગીતાના પસંદ કરેલા શ્લોક, સરળ અર્થ. દરેક શ્લોકથી પૂરો અર્થ ગીતામાં ખૂલે છે.',
    kn: 'ಒಂದು ವಿಷಯ, ಗೀತೆಯ ಆಯ್ದ ಶ್ಲೋಕಗಳು, ಸರಳ ಅರ್ಥ. ಪ್ರತಿ ಶ್ಲೋಕದಿಂದ ಪೂರ್ಣ ಅರ್ಥ ಗೀತೆಯಲ್ಲಿ ತೆರೆಯುತ್ತದೆ.',
  });

  return (
    <View style={[styles.root, { backgroundColor: colors.parchment }]}>
      <StatusBar barStyle="light-content" />
      <BackgroundLayer source={getSourceBackground('gita-saar')} />

      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <ReaderHeader title={title} onBack={() => navigation.goBack()} variant="index" />

        <View style={styles.toggleRow}>
          <LanguageToggle />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.screenGutter, gap: spacing.md }]}
          showsVerticalScrollIndicator={false}
        >
          <Text
            style={[
              styles.lede,
              {
                color: colors.inkSoft,
                fontFamily: lang === 'en' ? typography.subtitle.fontFamily : scriptBodyFont(lang, typography.meaning.fontFamily),
                fontSize: 15,
                lineHeight: 23,
                fontStyle: lang === 'en' ? 'italic' : 'normal',
              },
            ]}
          >
            {lede}
          </Text>
          {gitaSaarChaptersManifest.map((theme) => (
            <GitaChapterCard
              key={theme.chapter}
              chapter={theme}
              chapterLabelHi="विषय"
              chapterLabelEn="Theme"
              onPress={() => {
                const resumeIndex = getChapterProgress('gita-saar', theme.chapter)?.verseIndex ?? 0;
                navigation.navigate('GitaSaarReader', { chapter: theme.chapter, initialIndex: resumeIndex });
              }}
            />
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  toggleRow: {
    paddingVertical: 8,
    paddingBottom: 16,
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  lede: {
    textAlign: 'center',
    marginBottom: 4,
  },
});
