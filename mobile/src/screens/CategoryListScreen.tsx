import ReadingLinks from '@/components/ReadingLinks';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { titleFontByLang } from '@/utils/langType';
import { orderTitlesByLanguage } from '@/utils/titleByLanguage';
import { library, type LibraryEntry } from '@/data/texts';
import { categories } from '@/data/categories';
import { getCategoryBackground } from '@/data/backgrounds';
import BackgroundLayer from '@/components/BackgroundLayer';
import LibraryCard from '@/components/LibraryCard';
import ShareButton from '@/components/ShareButton';
import { useShare } from '@/utils/shareVerse';
import { buildListingShare } from '@/utils/listingShare';
import ResumeReadingSheet from '@/components/ResumeReadingSheet';
import { useResumeSheetCoverage } from '@/components/useResumeSheetCoverage';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { useNewContent } from '@/contexts/NewContentContext';
import { navigateReadingLink, navigateStotramPractice, isChapteredEntry, navigateToEntryStart, navigateToProgress } from '@/navigation/entryRoutes';
import { formatLocation } from '@/utils/formatLocation';
import type { HomeStackParamList } from '@/navigation/types';
import { useTourTarget } from '@/components/tour/tourTargets';

type Props = NativeStackScreenProps<HomeStackParamList, 'CategoryList'>;

export default function CategoryListScreen({ navigation, route }: Props) {
  const { colors, spacing } = useTheme();
  // Feature-tour anchor — the tour rings the first item when it lands here for
  // the Japa "inside" step (design.md §47). Harmless for other categories.
  const japamInsideRef = useTourTarget('japamInside');
  const { lang } = useGitaLanguage();
  const { share, busy: shareBusy } = useShare();
  const { categoryId } = route.params;
  const { getProgress, clearProgress, clearChapterProgress, isLoading } = useReadingProgress();
  const { markSeen } = useNewContent();
  const [pendingEntry, setPendingEntry] = useState<LibraryEntry | null>(null);

  const backgroundImage = useMemo(() => getCategoryBackground(categoryId), [categoryId]);
  const categoryMeta = categories.find((c) => c.id === categoryId);
  const title = orderTitlesByLanguage(lang, route.params.practice ? 'जप' : categoryMeta?.nameHi ?? '', route.params.practice ? 'Japa' : categoryMeta?.nameEn ?? '', {
    devPrimary: 16,
    devSecondary: 12,
    latPrimary: 18,
    latSecondary: 12,
  });
  const items = library.filter((e) => e.category === categoryId && !e.hidden);

  const handlePress = (entry: LibraryEntry) => {
    if(route.params.practice && categoryId==='stotram'){
      markSeen(entry.id);
      navigateStotramPractice(navigation, entry.id);
      return;
    }
    if (isLoading) {
      markSeen(entry.id);
      navigateToEntryStart(navigation, entry);
      return;
    }
    const progress = getProgress(entry.id);
    if (progress && progress.verseIndex > 0) {
      setPendingEntry(entry);
      return;
    }
    markSeen(entry.id);
    navigateToEntryStart(navigation, entry);
  };

  const pendingProgress = pendingEntry ? getProgress(pendingEntry.id) : undefined;
  const location = pendingProgress ? formatLocation(pendingProgress) : null;
  const resumeCoverage = useResumeSheetCoverage(pendingEntry, pendingProgress, navigation, () => {
    if (pendingEntry) markSeen(pendingEntry.id);
    setPendingEntry(null);
  });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <BackgroundLayer source={backgroundImage} />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        {/* Top bar */}
        <View style={[styles.topBar, { paddingHorizontal: spacing.xxl }]}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={16}
            style={({ pressed }) => [
              styles.backBtn,
              { backgroundColor: colors.parchmentSoft, borderColor: colors.divider },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={{ color: colors.inkSoft, fontSize: 18 }}>‹</Text>
          </Pressable>
          <View style={styles.titleRow}>
            <Text
              style={{
                fontFamily: title.primary.fontFamily,
                fontSize: title.primary.fontSize,
                fontStyle: title.primary.fontStyle,
                letterSpacing: title.primary.letterSpacing,
                color: colors.ink,
              }}
            >
              {title.primary.text}
            </Text>
            <Text
              style={{
                fontFamily: title.secondary.fontFamily,
                fontSize: title.secondary.fontSize,
                fontStyle: title.secondary.fontStyle,
                color: colors.inkMuted,
                marginLeft: 6,
              }}
            >
              · {title.secondary.text}
            </Text>
          </View>
          <ShareButton
            busy={shareBusy}
            accessibilityLabel="Share category listing"
            accessibilityHint="Share the complete list as post, Story, or Reel cards"
            onPress={() => {
              if (!categoryMeta) return;
              void share(buildListingShare({
                sourceId: `category-${categoryId}`,
                titleHi: categoryMeta.nameHi,
                titleEn: categoryMeta.nameEn,
                background: backgroundImage,
                items: items.map((entry) => ({
                  titleHi: entry.nameHi, titleEn: entry.nameEn,
                  detailHi: entry.sub, detailEn: entry.subEn,
                })),
              }), lang);
            }}
          />
        </View>

        {route.params.practice && <View style={{flexDirection:'row',paddingHorizontal:spacing.xxl,gap:8,marginVertical:8}}>
          {(['japam','stotram'] as const).map(id=><Pressable key={id} testID={'practice-tab-'+id} accessibilityRole="tab"
            accessibilityState={{selected:categoryId===id}} onPress={()=>navigation.setParams({categoryId:id})}
            style={{flex:1,minHeight:44,alignItems:'center',justifyContent:'center',backgroundColor:categoryId===id?colors.saffronDeep:colors.parchmentSoft,borderRadius:14}}>
            <Text style={{fontFamily:titleFontByLang(lang),color:categoryId===id?colors.onPrimary:colors.ink}}>{id==='japam'?contentByLang(lang,'मंत्र','Mantra'):contentByLang(lang,'स्तोत्रम्','Stotram')}</Text>
          </Pressable>)}
        </View>}
        <ScrollView key={categoryId}
          contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing.xxl, gap: spacing.md }]}
          showsVerticalScrollIndicator={false}
        >
          {categoryId === 'stotram' && (
            <ReadingLinks onOpen={(id) => {
              if (route.params.practice) navigateStotramPractice(navigation, id);
              else navigateReadingLink(navigation, id);
            }} />
          )}
          {items.map((entry, i) => {
            const onPress = entry.status === 'active' ? () => handlePress(entry) : undefined;
            const card = <LibraryCard entry={entry} onPress={onPress} />;
            return i === 0 ? (
              <View key={entry.id} ref={japamInsideRef} collapsable={false}>
                {card}
              </View>
            ) : (
              <React.Fragment key={entry.id}>{card}</React.Fragment>
            );
          })}
        </ScrollView>
      </SafeAreaView>

      {pendingEntry && pendingProgress && location && (
        <ResumeReadingSheet
          visible
          titleHi={pendingEntry.nameHi}
          titleEn={pendingEntry.nameEn}
          locationHi={location.hi}
          locationEn={location.en}
          onResume={() => {
            const progress = pendingProgress;
            markSeen(pendingEntry.id);
            setPendingEntry(null);
            navigateToProgress(navigation, progress);
          }}
          onStartOver={() => {
            const entry = pendingEntry;
            const progress = pendingProgress;
            markSeen(entry.id);
            setPendingEntry(null);
            if (isChapteredEntry(entry) && progress?.chapter != null) {
              // Reset only the chapter being resumed; keep sibling chapters'
              // bookmarks, and land back on the subsection list via the reader.
              clearChapterProgress(entry.id, progress.chapter);
              navigateToProgress(navigation, { ...progress, verseIndex: 0 });
            } else {
              clearProgress(entry.id);
              navigateToEntryStart(navigation, entry);
            }
          }}
          onDismiss={() => setPendingEntry(null)}
          {...resumeCoverage}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scroll: {
    paddingTop: 8,
    paddingBottom: 40,
  },
});
