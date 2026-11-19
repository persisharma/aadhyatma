import React from 'react';
import { Pressable, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ReaderHeader from '@/components/ReaderHeader';
import { useJapamCounter } from '@/contexts/JapamCounterContext';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { useGitaLanguage } from '@/data/gita/language';
import { library } from '@/data/texts';
import { getPracticeHymn } from '@/data/practiceHymn';
import { navigateReadingLink, navigateToEntryStart, navigateToProgress } from '@/navigation/entryRoutes';
import type { HomeStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme/ThemeContext';
import { pick, contentByLang } from '@/utils/localize';
import { titleFontByLang } from '@/utils/langType';

export default function StotramPracticeScreen({
  route,
  navigation,
}: NativeStackScreenProps<HomeStackParamList, 'StotramPractice'>) {
  const { lang } = useGitaLanguage();
  const { colors } = useTheme();
  const { recitations, countRecitation, isLoading } = useJapamCounter();
  const { getProgress } = useReadingProgress();
  const entry = getPracticeHymn(route.params.sourceId);
  const fontFamily = titleFontByLang(lang);
  const action = {
    minHeight: 48,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardActiveBorder,
    backgroundColor: colors.cardActiveFrom,
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.parchment }}>
      <ReaderHeader title={contentByLang(lang, 'स्तोत्रम्', 'Stotram')} onBack={() => navigation.goBack()} />
      {entry && (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
          <Text style={{ fontFamily, fontSize: 25, color: colors.ink }}>
            {contentByLang(lang, entry.nameHi, entry.nameEn)}
          </Text>
          <Text style={{ fontFamily, color: colors.inkMuted }}>{contentByLang(lang, entry.sub, entry.subEn)}</Text>
          <Pressable
            style={action}
            accessibilityRole="button"
            onPress={() => {
              if (navigateReadingLink(navigation, entry.id)) return;
              const canonical = library.find((item) => item.id === entry.id);
              if (!canonical) return;
              const saved = getProgress(entry.id);
              if (!saved || !navigateToProgress(navigation, saved)) navigateToEntryStart(navigation, canonical);
            }}
          >
            <Text style={{ fontFamily, color: colors.saffronDeep }}>
              {pick(lang, { hi: 'पाठ खोलें', en: 'Open reading', gu: 'પાઠ ખોલો', kn: 'ಪಾಠ ತೆರೆಯಿರಿ' })} ›
            </Text>
          </Pressable>
          <Text accessibilityLiveRegion="polite" style={{ fontFamily, fontSize: 23, color: colors.ink }}>
            {recitations[entry.id]?.count ?? 0} ·{' '}
            {pick(lang, { hi: 'पूरे पाठ', en: 'Completed recitations', gu: 'પૂર્ણ પાઠ', kn: 'ಪೂರ್ಣ ಪಠಣಗಳು' })}
          </Text>
          <Pressable
            style={action}
            accessibilityRole="button"
            disabled={isLoading}
            onPress={() => countRecitation(entry.id)}
          >
            <Text style={{ fontFamily, color: colors.saffronDeep }}>
              {pick(lang, {
                hi: 'एक पूरा पाठ गिनें',
                en: 'Count one full recitation',
                gu: 'એક પૂર્ણ પાઠ ગણો',
                kn: 'ಒಂದು ಪೂರ್ಣ ಪಠಣ ಎಣಿಸಿ',
              })}
            </Text>
          </Pressable>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
