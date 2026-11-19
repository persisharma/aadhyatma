import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/navigation/types';
import CatalogBackground from '@/components/CatalogBackground';
import ReaderHeader from '@/components/ReaderHeader';
import LibraryCard from '@/components/LibraryCard';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { scriptBodyFont } from '@/utils/langType';
import { library } from '@/data/texts';
import { saptashatiCoreIds } from '@/data/saptashatiCore';
import { navigateToEntryStart } from '@/navigation/entryRoutes';

export default function SaptashatiCoreScreen({ navigation }: NativeStackScreenProps<HomeStackParamList, 'SaptashatiCore'>) {
  const { lang } = useGitaLanguage();
  const { colors, typography, spacing } = useTheme();
  return <View style={{ flex: 1 }}>
    <CatalogBackground />
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1 }}>
      <ReaderHeader title={contentByLang(lang, 'दुर्गा सप्तशती', 'Durga Saptashati')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.xxl, gap: spacing.md, paddingBottom: 48 }}>
        <Text testID="saptashati-chapter-list-heading" accessibilityRole="header" style={{ fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 18, lineHeight: 29, color: colors.ink }}>{contentByLang(lang, 'सभी १३ अध्याय', 'All 13 chapters')}</Text>
        <Text style={{ fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 15, lineHeight: 25, color: colors.inkMuted }}>{contentByLang(lang, 'सभी १३ अध्यायों के ७०० पारम्परिक पाठांश, अर्थ सहित पढ़ें। कवच, अर्गला और कीलक भी साथ हैं। अनुष्ठान-विधि इस पाठ-संग्रह में शामिल नहीं है।', 'Read all 13 chapters with meanings: 700 traditionally numbered text units, plus Kavach, Argala and Kilak. Ritual instructions are not part of this reading collection.')}</Text>
        {saptashatiCoreIds.map(id => {
          const entry = library.find(item => item.id === id);
          return entry ? <LibraryCard key={id} entry={entry} onPress={() => navigateToEntryStart(navigation, entry)} /> : null;
        })}
      </ScrollView>
    </SafeAreaView>
  </View>;
}
