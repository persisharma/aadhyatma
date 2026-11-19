import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/navigation/types';
import { backgroundImages } from '@assets/backgrounds';
import AddToRoutineButton from '@/components/AddToRoutineButton';
import LanguageToggle from '@/components/LanguageToggle';
import LibraryCardProgress from '@/components/LibraryCardProgress';
import ListingCard, { ListingScope, ListingSectionHeader, ListingThumbImage } from '@/components/ListingCard';
import ReaderHeader from '@/components/ReaderHeader';
import { useProgressReset } from '@/components/useProgressReset';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { getSourceBackground } from '@/data/backgrounds';
import { useGitaLanguage } from '@/data/gita/language';
import { saptashatiChapterIds, saptashatiPreliminaryIds } from '@/data/saptashatiCore';
import { library, type LibraryEntry } from '@/data/texts';
import { navigateToEntryStart } from '@/navigation/entryRoutes';
import { useTheme } from '@/theme/ThemeContext';
import { contentByLang } from '@/utils/localize';
import { useReadCoverage } from '@/utils/readCoverageStore';

const groups = [
  { ids: saptashatiPreliminaryIds, hi: 'प्रारम्भिक पाठ', en: 'Preparatory readings' },
  { ids: saptashatiChapterIds, hi: 'सभी १३ अध्याय', en: 'All 13 chapters', testID: 'saptashati-chapter-list-heading' },
];

function SaptashatiReadingCard({ entry, onPress }: { entry: LibraryEntry; onPress: () => void }) {
  const { lang } = useGitaLanguage();
  const { colors, radii } = useTheme();
  const { getProgress } = useReadingProgress();
  const { getSourceCoverage } = useReadCoverage();
  const reset = useProgressReset();
  const coverage = getSourceCoverage(entry.id);
  const title = contentByLang(lang, entry.nameHi.split(' · ').at(-1)!, entry.nameEn.split(' · ').at(-1)!);
  const readCount = coverage?.read ?? 0;
  const askReset = () => reset.ask({ sourceId: entry.id, label: title, readCount });

  return (
    <>
      <ListingCard
        testID={`saptashati-reading-${entry.id}`}
        title={title}
        meta={contentByLang(lang, `${entry.verseCount} पाठांश`, `${entry.verseCount} passages`)}
        thumbnail={<ListingThumbImage source={getSourceBackground(entry.id) ?? backgroundImages.deity_durga_lion} />}
        action={<AddToRoutineButton sourceId={entry.id} style={[
          styles.routine, { backgroundColor: colors.parchmentSoft, borderRadius: radii.pill },
        ]} />}
        footer={coverage ? <LibraryCardProgress coverage={coverage} pin={getProgress(entry.id)} onUndo={reset.undo} /> : null}
        onPress={onPress}
        onLongPress={readCount > 0 ? askReset : undefined}
        accessibilityValue={coverage && (readCount || coverage.paath) ? { text: `${coverage.pct} percent read, ${coverage.paath} full readings` } : undefined}
        accessibilityActions={reset.undo
          ? [{ name: 'undo', label: 'Undo reset' }]
          : readCount > 0 ? [{ name: 'longpress', label: 'Reset progress' }] : undefined}
        onAccessibilityAction={(event) => {
          if (event.nativeEvent.actionName === 'longpress') askReset();
          if (event.nativeEvent.actionName === 'undo') reset.undo?.();
        }}
      />
      {reset.dialog}
    </>
  );
}

export default function SaptashatiCoreScreen({ navigation }: NativeStackScreenProps<HomeStackParamList, 'SaptashatiCore'>) {
  const { lang } = useGitaLanguage();
  const { colors, spacing } = useTheme();

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: colors.parchment }}>
      <ReaderHeader
        title={contentByLang(lang, 'दुर्गा सप्तशती', 'Durga Saptashati')}
        onBack={() => navigation.goBack()}
        variant="index"
      />
      <View style={{ paddingBottom: spacing.md }}><LanguageToggle /></View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.readingGutter, gap: spacing.md, paddingBottom: 48 }}
      >
        <ListingScope testID="saptashati-collection-scope">{contentByLang(lang, '१३ अध्याय · ७०० पारम्परिक पाठांश', '13 chapters · 700 traditionally numbered passages')}</ListingScope>
        {groups.map((group) => (
          <View key={group.en} style={{ gap: spacing.md }}>
            <View testID={group.testID}>
              <ListingSectionHeader>{contentByLang(lang, group.hi, group.en)}</ListingSectionHeader>
            </View>
            {group.ids.map((id) => {
              const entry = library.find((item) => item.id === id);
              return entry ? <SaptashatiReadingCard key={id} entry={entry} onPress={() => navigateToEntryStart(navigation, entry)} /> : null;
            })}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  routine: { position: 'absolute', left: 16, bottom: 16, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
