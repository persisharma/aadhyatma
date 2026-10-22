import { dailyBhaktiShareable } from '@/utils/dailyBhaktiShare';
import React, { useState, useCallback, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import {
  verseLinesByLang,
  meaningByLang,
  contentByLang,
  pick,
} from '@/utils/localize';
import { verseToken, meaningToken } from '@/utils/langType';
import { getRandomVerse, findVerse } from '@/data/versePool';
import { aartiIndexById } from '@/data/aarti/ids';
import type { UniformVerse } from '@/data/versePool';
import type { TabParamList } from '@/navigation/types';
import { DevotionalHero, DevotionalFooter, DevotionalVerseBody } from '@/components/DevotionalFrame';
import { devotionalFrameColors, devotionalReaderVerseLeading } from '@/theme/devotionalFrame';
import { devotionalCharanRows } from '@/utils/devotionalShareLayout';
import { devotionalArtForVerse } from '@/data/devotionalShareArt';
import ShareButton from '@/components/ShareButton';
import BookmarkButton from '@/components/BookmarkButton';
import { useShare } from '@/utils/shareVerse';
import { useBookmarks } from '@/contexts/BookmarksContext';
import RoutineBanner from '@/components/RoutineBanner';
import DailyBhaktiNudge from '@/components/DailyBhaktiNudge';
import LanguageToggle from '@/components/LanguageToggle';
import { useTourTarget } from '@/components/tour/tourTargets';

/**
 * Resolve the verse to show on entry. When a reminder tap forwarded a verse
 * identity, show that exact verse; if it can no longer be found (e.g. an OTA
 * update removed it) fall back to a random one. A manual open has no identity,
 * so it shows a random verse.
 */
function resolveInitialVerse(
  sourceId?: string,
  verseIndex?: number,
  chapter?: number
): UniformVerse | null {
  if (sourceId != null && verseIndex != null) {
    const found = findVerse(sourceId, verseIndex, chapter);
    if (found) return found;
  }
  return getRandomVerse();
}

export default function DailyBhaktiScreen() {
  const { colors, typography, spacing } = useTheme();
  // Feature-tour spotlight anchors (design.md §47).
  const dailyVerseRef = useTourTarget('dailyVerse');
  const shareButtonRef = useTourTarget('shareButton');
  const { lang } = useGitaLanguage();
  const { width: windowWidth } = useWindowDimensions();
  const [cardWidth, setCardWidth] = useState(Math.min(540, Math.max(240, windowWidth - 32)));
  const route = useRoute<RouteProp<TabParamList, 'DailyBhaktiTab'>>();
  const { sourceId, chapter, verseIndex } = route.params ?? {};
  const [verse, setVerse] = useState<UniformVerse | null>(() =>
    resolveInitialVerse(sourceId, verseIndex, chapter)
  );

  const { share, busy: shareBusy } = useShare();
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();

  // Manual opens show a random verse. Arriving from a reminder tap forwards the
  // exact verse identity baked into that notification, which locks the tab to
  // that verse — even if the screen was already mounted (e.g. the user had
  // browsed away with "next"). Looked up by identity, so it always matches the
  // notification regardless of pool-size drift.
  useEffect(() => {
    if (sourceId == null || verseIndex == null) return;
    const found = findVerse(sourceId, verseIndex, chapter);
    if (found) setVerse(found);
  }, [sourceId, chapter, verseIndex]);

  const refresh = useCallback(() => {
    setVerse(getRandomVerse());
  }, []);

  // Mirror each reader's bookmark-id convention: chaptered sources use
  // `id:chapter:idx`; chapterless ones (sanskar, japam, chalisa, …) use
  // `id::idx`, so an empty chapter segment keeps Daily Bhakti bookmarks in sync
  // with the reader. The Aarti reader alone uses `id:idx`.
  const bookmarkId = !verse
    ? ''
    : verse.sourceId in aartiIndexById
      ? `${verse.sourceId}:${verse.verseIndex}`
      : `${verse.sourceId}:${verse.chapter ?? ''}:${verse.verseIndex}`;
  const verseLines = verse
    ? verseLinesByLang(lang, verse.textHi, verse.textEn.length > 0 ? verse.textEn : verse.textHi)
    : [];
  const verseType = verseToken(lang, typography);

  if (!verse) {
    return (
      <View style={styles.root}>
        <LinearGradient
          colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
          <View style={[styles.empty, { paddingHorizontal: spacing.xxl }]}>
            <Text style={{ fontFamily: typography.readerTitle.fontFamily, fontSize: 32, color: colors.inkMuted, opacity: 0.4 }}>॥</Text>
            <Text style={{ fontFamily: typography.meaning.fontFamily, fontSize: 15, color: colors.inkMuted, textAlign: 'center', marginTop: 12 }}>
              {pick(lang, {
                hi: 'दैनिक श्लोक उपलब्ध नहीं',
                en: 'No verses available',
                gu: 'દૈનિક શ્લોક ઉપલબ્ધ નથી',
                kn: 'ದೈನಿಕ ಶ್ಲೋಕ ಲಭ್ಯವಿಲ್ಲ',
              })}
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingHorizontal: 16 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Setup strip (design.md §23): reminder first, then the verse widget —
              one ask at a time, renders nothing once both are settled. */}
          <DailyBhaktiNudge previewLines={verseLines} />

          {/* Compact controls leave the illustrated reading free of duplicated headings. */}
          <View style={styles.controls}>
            <LanguageToggle compact />
            <View style={styles.headerActions}>
              <BookmarkButton isBookmarked={isBookmarked(bookmarkId)} onToggle={() => {
                if (isBookmarked(bookmarkId)) removeBookmark(bookmarkId);
                else addBookmark({ id: bookmarkId, sourceId: verse.sourceId, chapter: verse.chapter,
                  verseIndex: verse.verseIndex, savedAt: Date.now(),
                  previewHi: verse.textHi.slice(0, 2).join(' '), previewEn: verse.textEn.slice(0, 2).join(' ') });
              }} />
              <View ref={shareButtonRef} collapsable={false}>
                <ShareButton busy={shareBusy} onPress={() => share(dailyBhaktiShareable(verse), lang)} />
              </View>
              <Pressable onPress={refresh} accessibilityRole="button"
                accessibilityLabel={pick(lang, { hi: 'अगला श्लोक', en: 'Next verse', gu: 'આગળનો શ્લોક', kn: 'ಮುಂದಿನ ಶ್ಲೋಕ' })}
                testID="daily-bhakti-next" style={styles.nextBtn}>
                <Text style={{ fontSize: 24, color: colors.saffronDeep }}>↻</Text>
              </Pressable>
            </View>
          </View>
          <View ref={dailyVerseRef} collapsable={false} testID="daily-bhakti-card" style={[styles.card, { backgroundColor: devotionalFrameColors.paper }]}
            onLayout={e => { const { width } = e.nativeEvent.layout; if (Number.isFinite(width) && width > 0) setCardWidth(width); }}>
            <DevotionalHero art={devotionalArtForVerse(verse)} lang={lang} width={cardWidth} />
            <DevotionalVerseBody
              width={cardWidth} inset={cardWidth * 55 / 1080}
              header={[contentByLang(lang, verse.sourceNameHi, verse.sourceNameEn), contentByLang(lang, verse.labelHi ?? '', verse.labelEn ?? '')].filter(Boolean).join(' · ')}
              // One charan per row when each fits; otherwise the stored lines flow
              // together so a short fragment can use the previous row.
              verse={verseLines.join(' ')} verseRows={devotionalCharanRows(lang, verse.textHi, verseLines)}
              meaning={meaningByLang(lang, verse.meaningHi, verse.meaningEn)}
              lang={lang} art={devotionalArtForVerse(verse)}
              verseStyle={{ ...verseType, lineHeight: lang === 'hi' ? devotionalReaderVerseLeading(verseType.fontSize) : verseType.lineHeight, color: colors.ink }}
              meaningStyle={{ ...meaningToken(lang, typography), color: colors.inkSoft }} />
            <DevotionalFooter art={devotionalArtForVerse(verse)} width={cardWidth} />
          </View>
        </ScrollView>
      </SafeAreaView>
      <RoutineBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingTop: 8, paddingBottom: 100, alignItems: 'center' },
  controls: { width: '100%', maxWidth: 540, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  card: { width: '100%', maxWidth: 540, borderRadius: 12, overflow: 'hidden' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  nextBtn: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
