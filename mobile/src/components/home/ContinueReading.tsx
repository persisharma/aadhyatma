import React from 'react';
import { Pressable, Text } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { useGitaLanguage } from '@/data/gita/language';
import { library } from '@/data/texts';
import { buildProgressTarget, navigateToProgress } from '@/navigation/entryRoutes';
import type { HomeStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme/ThemeContext';
import { contentByLang, pick } from '@/utils/localize';
import { formatLocation } from '@/utils/formatLocation';
import { titleFontByLang } from '@/utils/langType';

export default function ContinueReading({
  navigation,
}: {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'Home'>;
}) {
  const { progress, isLoading } = useReadingProgress();
  const { lang } = useGitaLanguage();
  const { colors } = useTheme();
  const saved = React.useMemo(
    () =>
      Object.values(progress)
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .find(
          (p) =>
            library.some((e) => e.id === p.sourceId && !e.hidden && e.status === 'active') &&
            buildProgressTarget(p),
        ),
    [progress],
  );
  if (isLoading || !saved) return null;
  const entry = library.find((e) => e.id === saved.sourceId)!;
  const where = formatLocation(saved);
  return (
    <Pressable
      accessibilityRole="button"
      testID="home-continue"
      onPress={() => navigateToProgress(navigation, saved)}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 8,
        minHeight: 48,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.divider,
        backgroundColor: colors.parchmentSoft,
        marginTop: 8,
      }}
    >
      <Text style={{ fontFamily: titleFontByLang(lang), fontSize: 12, color: colors.saffronDeep }}>
        {pick(lang, {
          hi: 'पढ़ना जारी रखें',
          en: 'Continue reading',
          gu: 'વાંચવાનું ચાલુ રાખો',
          kn: 'ಓದುವುದನ್ನು ಮುಂದುವರಿಸಿ',
          mr: 'वाचन सुरू ठेवा',
          te: 'చదవడం కొనసాగించండి',
        })}
      </Text>
      <Text style={{ fontFamily: titleFontByLang(lang), fontSize: 15, color: colors.ink }}>
        {contentByLang(lang, entry.nameHi, entry.nameEn)} · {contentByLang(lang, where.hi, where.en)} ›
      </Text>
    </Pressable>
  );
}
