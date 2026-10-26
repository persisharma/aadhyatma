import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import {
  gitaSaarChaptersManifest,
  gitaSaarTitleEn,
  gitaSaarTitleHi,
  gitaSaarTotal,
  getGitaSaarChapter,
} from '@/data/gita-saar';
import { gitaSaarExperiences } from '@/data/gita-saar/experience';
import { useGitaSaarLearning } from '@/data/gita-saar/learningStore';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang, pick } from '@/utils/localize';
import { meaningToken, scriptTitleFont } from '@/utils/langType';
import { getSourceBackground } from '@/data/backgrounds';
import ReaderHeader from '@/components/ReaderHeader';
import BackgroundLayer from '@/components/BackgroundLayer';
import { readingParchment } from '@/data/backgroundAsset';
import ReadingBanner from '@/components/ReadingBanner';
import ProseParagraph from '@/components/ProseParagraph';
import AppIcon from '@/components/AppIcon';
import GitaSaarThemeIcon from '@/components/GitaSaarThemeIcon';
import ShareButton from '@/components/ShareButton';
import BookmarkButton from '@/components/BookmarkButton';
import LanguageToggle from '@/components/LanguageToggle';
import { useShare } from '@/utils/shareVerse';
import { buildListingShare } from '@/utils/listingShare';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { useBookmarks } from '@/contexts/BookmarksContext';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'GitaSaarChapters'>;
type Filter = 'all' | 'mind' | 'life' | 'heart' | 'saved';
/** A question-led hub: one tap to a lesson, with saved learning on the same surface. */
export default function GitaSaarThemesScreen({ navigation }: Props) {
  const { colors, spacing, typography, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const { share, busy: shareBusy } = useShare();
  const { getChapterProgress, getProgress } = useReadingProgress();
  const { bookmarks, removeBookmark } = useBookmarks();
  const learning = useGitaSaarLearning();
  const { width } = useWindowDimensions();
  const [filter, setFilter] = useState<Filter>('all');
  const [removeError, setRemoveError] = useState(false);
  const tok = meaningToken(lang, typography);
  const titleType = {
    color: colors.ink,
    fontFamily:
      lang === 'en'
        ? fontFamilies.latinSemiBold
        : scriptTitleFont(lang, typography.screenTitle.fontFamily),
  } as const;
  const bodyType = {
    color: colors.inkSoft,
    fontFamily: tok.fontFamily,
    fontSize: tok.fontSize,
    lineHeight: tok.lineHeight,
  } as const;
  const small = {
    color: colors.inkMuted,
    fontFamily: tok.fontFamily,
    fontSize: 12,
    lineHeight: 23,
  } as const;
  const saved = useMemo(
    () =>
      bookmarks.filter(
        (b) =>
          b.sourceId === 'gita-saar' &&
          b.chapter &&
          gitaSaarChaptersManifest[b.chapter - 1] &&
          Number.isInteger(b.verseIndex) &&
          b.verseIndex >= 0 &&
          b.verseIndex < gitaSaarChaptersManifest[b.chapter - 1].verseCount
      ),
    [bookmarks]
  );
  const visibleThemes = gitaSaarChaptersManifest.filter(
    (t) => filter === 'all' || gitaSaarExperiences[t.id]?.category === filter
  );
  const recent = getProgress('gita-saar');
  const recentTheme = recent?.chapter
    ? gitaSaarChaptersManifest[recent.chapter - 1]
    : undefined;
  const listingShare = buildListingShare({
    sourceId: 'gita-saar',
    titleHi: gitaSaarTitleHi,
    titleEn: gitaSaarTitleEn,
    background: getSourceBackground('gita-saar'),
    items: gitaSaarChaptersManifest.map((t) => ({
      titleHi: t.titleHi,
      titleEn: t.titleEn,
      detailHi: `${t.verseCount} श्लोक`,
      detailEn: `${t.verseCount} verses`,
    })),
  });
  function open(chapter: number, exactIndex?: number) {
    const summary = gitaSaarChaptersManifest[chapter - 1];
    if (!summary) return;
    const index =
      exactIndex ?? getChapterProgress('gita-saar', chapter)?.verseIndex ?? 0;
    navigation.navigate('GitaSaarReader', {
      chapter,
      initialIndex: Math.max(0, Math.min(summary.verseCount - 1, index)),
    });
  }
  return (
    <View style={[styles.root, { backgroundColor: colors.parchment }]}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView
        style={styles.root}
        edges={['top', 'left', 'right', 'bottom']}
      >
        <ReaderHeader
          title={contentByLang(lang, gitaSaarTitleHi, gitaSaarTitleEn)}
          onBack={() => navigation.goBack()}
          sideWidth={48}
          right={
            <ShareButton
              busy={shareBusy}
              accessibilityLabel="Share chapter listing"
              accessibilityHint="Share the complete chapter list"
              onPress={() => void share(listingShare, lang)}
            />
          }
          variant="index"
        />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ReadingBanner
            testID="gita-saar-index-artwork"
            source={getSourceBackground('gita-saar')!}
            fallback={<BackgroundLayer source={readingParchment} />}
            style={{
              width,
              height: width / 2,
              maxWidth: width,
              maxHeight: width / 2,
            }}
          />
          <View style={{ paddingHorizontal: spacing.screenGutter }}>
            <View style={styles.introControls}>
              <ProseParagraph
                style={[small, { color: colors.saffronDeep, flex: 1 }]}
              >
                {pick(lang, {
                  hi: 'जीवन के प्रश्न · गीता के उत्तर',
                  en: 'Your questions. Timeless wisdom.',
                  gu: 'જીવનના પ્રશ્નો · ગીતાના ઉત્તર',
                  kn: 'ಜೀವನದ ಪ್ರಶ್ನೆಗಳು · ಗೀತೆಯ ಉತ್ತರಗಳು',
                })}
              </ProseParagraph>
              <LanguageToggle compact />
            </View>
            <ProseParagraph
              accessibilityRole="header"
              style={[
                titleType,
                styles.heroTitle,
                { fontSize: lang === 'en' ? 36 : 32 },
              ]}
            >
              {pick(lang, {
                hi: 'हर उलझन में,\nथोड़ा-सा उजाला।',
                en: 'A little light.\nFor whatever life brings.',
                gu: 'દરેક મૂંઝવણમાં,\nથોડો પ્રકાશ.',
                kn: 'ಪ್ರತಿ ಗೊಂದಲದಲ್ಲೂ,\nಸ್ವಲ್ಪ ಬೆಳಕು.',
              })}
            </ProseParagraph>
            <ProseParagraph style={[small, { marginBottom: 22 }]}>
              {pick(lang, {
                hi: 'आपके आज के लिए, श्रीकृष्ण की एक सीख।',
                en: 'Meet your day with a teaching from the Gita.',
                gu: 'તમારા આજ માટે, શ્રીકૃષ્ણની એક શીખ.',
                kn: 'ನಿಮ್ಮ ಇಂದಿಗಾಗಿ, ಶ್ರೀಕೃಷ್ಣನ ಒಂದು ಪಾಠ.',
              })}
            </ProseParagraph>
            <ProseParagraph
              style={[small, { color: colors.saffronDeep, marginBottom: 9 }]}
            >
              {pick(lang, {
                hi: 'आज का मनन',
                en: 'A moment of clarity',
                gu: 'આજનું મનન',
                kn: 'ಇಂದಿನ ಚಿಂತನೆ',
              })}
            </ProseParagraph>
            <Pressable
              testID="gita-saar-featured"
              accessibilityRole="button"
              accessibilityLabel="Explore Gita 2.47. Work and expectation."
              onPress={() => open(5, 0)}
              style={({ pressed }) => [
                styles.featured,
                {
                  backgroundColor: colors.saffronDeep,
                  borderRadius: radii.md,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <ProseParagraph style={[small, { color: colors.parchmentDeep }]}>
                {contentByLang(
                  lang,
                  'कर्म और अपेक्षा',
                  'On work and expectation'
                )}
              </ProseParagraph>
              <ProseParagraph
                style={[
                  titleType,
                  {
                    color: colors.parchmentSoft,
                    fontSize: lang === 'en' ? 31 : 27,
                    lineHeight: lang === 'en' ? 38 : 44,
                    marginTop: 9,
                    marginBottom: 18,
                  },
                ]}
              >
                {contentByLang(
                  lang,
                  'मेहनत मेरी है।\nपरिणाम का क्या?',
                  'Your effort is yours.\nWhat about the result?'
                )}
              </ProseParagraph>
              <View style={styles.featuredBottom}>
                <ProseParagraph
                  style={[small, { color: colors.parchmentSoft }]}
                >
                  {contentByLang(
                    lang,
                    'समझें · गीता २.४७',
                    'Explore Gita 2.47'
                  )}
                </ProseParagraph>
                <AppIcon name="next" color={colors.parchmentSoft} size={23} />
              </View>
            </Pressable>
            {recent && recentTheme && (
              <Pressable
                testID="gita-saar-resume"
                accessibilityRole="button"
                accessibilityLabel="Continue your Gita Saar reading"
                onPress={() => open(recentTheme.chapter, recent.verseIndex)}
                style={[styles.resume, { borderColor: colors.divider }]}
              >
                <AppIcon name="text" size={21} color={colors.saffronDeep} />
                <View style={{ flex: 1 }}>
                  <ProseParagraph style={small}>
                    {pick(lang, {
                      hi: 'यहीं से जारी रखें',
                      en: 'Continue where you left off',
                      gu: 'અહીંથી આગળ વાંચો',
                      kn: 'ಇಲ್ಲಿಂದ ಮುಂದುವರಿಸಿ',
                    })}
                  </ProseParagraph>
                  <ProseParagraph
                    style={[titleType, { fontSize: 17, lineHeight: 29 }]}
                  >
                    {contentByLang(
                      lang,
                      recentTheme.titleHi,
                      recentTheme.titleEn
                    )}
                  </ProseParagraph>
                </View>
                <AppIcon name="next" size={18} />
              </Pressable>
            )}
            <View style={styles.sectionHeading}>
              <ProseParagraph
                accessibilityRole="header"
                style={[titleType, { fontSize: 23, lineHeight: 36, flex: 1 }]}
              >
                {pick(lang, {
                  hi: 'आज मन में क्या है?',
                  en: 'What is on your mind?',
                  gu: 'આજે મનમાં શું છે?',
                  kn: 'ಇಂದು ಮನಸ್ಸಿನಲ್ಲಿ ಏನಿದೆ?',
                })}
              </ProseParagraph>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Saved Gita Saar learning"
                accessibilityState={{ selected: filter === 'saved' }}
                onPress={() =>
                  setFilter((f) => (f === 'saved' ? 'all' : 'saved'))
                }
                style={[
                  styles.savedTarget,
                  {
                    backgroundColor:
                      filter === 'saved' ? colors.goldTint : 'transparent',
                    borderRadius: radii.md,
                  },
                ]}
              >
                <AppIcon name="saved" size={20} color={colors.saffronDeep} />
                <ProseParagraph style={[small, { color: colors.saffronDeep }]}>
                  {pick(lang, {
                    hi: 'मेरी सीख',
                    en: 'My learning',
                    gu: 'મારી શીખ',
                    kn: 'ನನ್ನ ಕಲಿಕೆ',
                  })}
                </ProseParagraph>
              </Pressable>
            </View>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[
              styles.filters,
              { paddingHorizontal: spacing.screenGutter },
            ]}
          >
            {(['all', 'mind', 'life', 'heart'] as const).map((key) => (
              <Pressable
                key={key}
                accessibilityRole="button"
                accessibilityLabel={`Gita Saar filter ${key}`}
                accessibilityState={{ selected: filter === key }}
                onPress={() => setFilter(key)}
                style={[
                  styles.filter,
                  {
                    borderColor:
                      filter === key ? colors.saffronDeep : colors.divider,
                    backgroundColor:
                      filter === key
                        ? colors.saffronDeep
                        : colors.parchmentSoft,
                    borderRadius: radii.pill,
                  },
                ]}
              >
                <ProseParagraph
                  style={[
                    small,
                    {
                      color: filter === key ? colors.onPrimary : colors.inkSoft,
                    },
                  ]}
                >
                  {pick(
                    lang,
                    {
                      all: {
                        hi: 'सभी विषय',
                        en: 'All themes',
                        gu: 'બધા વિષયો',
                        kn: 'ಎಲ್ಲ ವಿಷಯಗಳು',
                      },
                      mind: {
                        hi: 'मन और भाव',
                        en: 'Mind & emotions',
                        gu: 'મન અને ભાવ',
                        kn: 'ಮನಸ್ಸು ಮತ್ತು ಭಾವನೆ',
                      },
                      life: {
                        hi: 'कर्म और जीवन',
                        en: 'Work & life',
                        gu: 'કર્મ અને જીવન',
                        kn: 'ಕರ್ಮ ಮತ್ತು ಜೀವನ',
                      },
                      heart: {
                        hi: 'हृदय और आत्मा',
                        en: 'Heart & self',
                        gu: 'હૃદય અને આત્મા',
                        kn: 'ಹೃದಯ ಮತ್ತು ಆತ್ಮ',
                      },
                    }[key]
                  )}
                </ProseParagraph>
              </Pressable>
            ))}
          </ScrollView>
          <View style={{ paddingHorizontal: spacing.screenGutter }}>
            {filter !== 'saved' ? (
              <View style={styles.grid}>
                {visibleThemes.map((theme) => {
                  const experience = gitaSaarExperiences[theme.id];
                  return (
                    <Pressable
                      testID={`gita-saar-theme-${theme.id}`}
                      key={theme.id}
                      accessibilityRole="button"
                      accessibilityLabel={`${theme.titleEn}. ${theme.verseCount} verses. Tap to open.`}
                      onPress={() => open(theme.chapter)}
                      style={({ pressed }) => [
                        styles.themeCard,
                        {
                          width: (width - spacing.screenGutter * 2 - 12) / 2,
                          backgroundColor: colors.cardSurface,
                          borderColor: colors.divider,
                          borderRadius: radii.md,
                          opacity: pressed ? 0.8 : 1,
                        },
                      ]}
                    >
                      <GitaSaarThemeIcon themeId={theme.id} />
                      <ProseParagraph
                        style={[
                          titleType,
                          {
                            fontSize: lang === 'en' ? 21 : 19,
                            lineHeight: lang === 'en' ? 28 : 33,
                            marginTop: 13,
                            marginBottom: 7,
                          },
                        ]}
                      >
                        {contentByLang(lang, theme.titleHi, theme.titleEn)}
                      </ProseParagraph>
                      <ProseParagraph style={small}>
                        {contentByLang(
                          lang,
                          experience.question.hi,
                          experience.question.en
                        )}
                      </ProseParagraph>
                      <View style={styles.cardBottom}>
                        <ProseParagraph style={[small, { fontSize: 11 }]}>
                          {contentByLang(
                            lang,
                            `${theme.verseCount} श्लोक`,
                            `${theme.verseCount} verses`
                          )}
                        </ProseParagraph>
                        <AppIcon
                          name="next"
                          size={16}
                          color={colors.saffronDeep}
                        />
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <View testID="gita-saar-saved-learning">
                <ProseParagraph
                  accessibilityRole="header"
                  style={[
                    titleType,
                    { fontSize: 25, lineHeight: 39, marginBottom: 15 },
                  ]}
                >
                  {pick(lang, {
                    hi: 'मेरी सीख',
                    en: 'My learning',
                    gu: 'મારી શીખ',
                    kn: 'ನನ್ನ ಕಲಿಕೆ',
                  })}
                </ProseParagraph>
                {saved.length === 0 && (
                  <View
                    style={[
                      styles.empty,
                      {
                        backgroundColor: colors.cardSurface,
                        borderRadius: radii.md,
                      },
                    ]}
                  >
                    <AppIcon
                      name="saved"
                      size={29}
                      color={colors.saffronDeep}
                    />
                    <ProseParagraph style={[bodyType, { marginTop: 14 }]}>
                      {pick(lang, {
                        hi: 'जो मन छुए, सहेज लें। हर सीख के अंत में सहेजने का विकल्प है।',
                        en: 'Keep what speaks to you. Every teaching has a save action at the end.',
                        gu: 'જે મનને સ્પર્શે, સાચવો. દરેક શીખના અંતે સાચવવાનો વિકલ્પ છે.',
                        kn: 'ಮನಸ್ಸಿಗೆ ತಟ್ಟಿದ್ದನ್ನು ಉಳಿಸಿ. ಪ್ರತಿ ಕಲಿಕೆಯ ಕೊನೆಯಲ್ಲಿ ಉಳಿಸುವ ಆಯ್ಕೆ ಇದೆ.',
                      })}
                    </ProseParagraph>
                  </View>
                )}
                {saved.map((bookmark) => {
                  const chapter = bookmark.chapter!;
                  const v =
                    getGitaSaarChapter(chapter).verses[bookmark.verseIndex];
                  const note = learning.reflections.find(
                    (r) =>
                      r.chapter === chapter &&
                      r.verseIndex === bookmark.verseIndex
                  );
                  return (
                    <View
                      key={bookmark.id}
                      style={[
                        styles.savedCard,
                        {
                          borderColor: colors.divider,
                          backgroundColor: colors.cardSurface,
                          borderRadius: radii.md,
                        },
                      ]}
                    >
                      <View style={styles.savedHeader}>
                        <Pressable
                          style={{ flex: 1 }}
                          accessibilityRole="button"
                          accessibilityLabel={`Open saved Gita Saar ${v.gitaChapter}.${v.gitaVerse}`}
                          onPress={() => open(chapter, bookmark.verseIndex)}
                        >
                          <ProseParagraph
                            style={[small, { color: colors.saffronDeep }]}
                          >
                            {contentByLang(
                              lang,
                              `गीता ${v.gitaChapter}.${v.gitaVerse}`,
                              `Gita ${v.gitaChapter}.${v.gitaVerse}`
                            )}
                          </ProseParagraph>
                          <ProseParagraph
                            style={[
                              titleType,
                              { fontSize: 21, lineHeight: 34, marginTop: 8 },
                            ]}
                          >
                            {contentByLang(lang, v.themeHi, v.themeEn)}
                          </ProseParagraph>
                        </Pressable>
                        <BookmarkButton
                          isBookmarked
                          onToggle={() => removeBookmark(bookmark.id)}
                        />
                      </View>
                      {note && (
                        <View
                          style={[styles.note, { borderColor: colors.gold }]}
                        >
                          <ProseParagraph style={small}>
                            {pick(lang, {
                              hi: 'मेरे मन की बात',
                              en: 'My reflection',
                              gu: 'મારા મનની વાત',
                              kn: 'ನನ್ನ ಮನಸ್ಸಿನ ಮಾತು',
                            })}
                          </ProseParagraph>
                          <ProseParagraph
                            style={[
                              bodyType,
                              /[\u0900-\u097F]/.test(note.text) && {
                                fontFamily: fontFamilies.devanagari,
                              },
                              { marginTop: 8 },
                            ]}
                          >
                            {note.text}
                          </ProseParagraph>
                        </View>
                      )}
                    </View>
                  );
                })}
                {learning.reflections
                  .filter(
                    (note) =>
                      !saved.some(
                        (b) =>
                          b.chapter === note.chapter &&
                          b.verseIndex === note.verseIndex
                      )
                  )
                  .map((note) => (
                    <View
                      key={`${note.chapter}:${note.verseIndex}`}
                      style={[
                        styles.savedCard,
                        { borderColor: colors.divider, borderRadius: radii.md },
                      ]}
                    >
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Open Gita Saar reflection"
                        onPress={() => open(note.chapter, note.verseIndex)}
                      >
                        <ProseParagraph style={bodyType}>
                          {note.text}
                        </ProseParagraph>
                      </Pressable>
                      <Pressable
                        style={styles.removeNote}
                        accessibilityRole="button"
                        accessibilityLabel="Delete Gita Saar reflection"
                        onPress={() => {
                          setRemoveError(false);
                          void learning
                            .remove(note.chapter, note.verseIndex)
                            .catch(() => setRemoveError(true));
                        }}
                      >
                        <ProseParagraph
                          style={[small, { color: colors.saffronDeep }]}
                        >
                          {pick(lang, {
                            hi: 'विचार हटाएँ',
                            en: 'Remove reflection',
                            gu: 'વિચાર દૂર કરો',
                            kn: 'ವಿಚಾರ ತೆಗೆದುಹಾಕಿ',
                          })}
                        </ProseParagraph>
                      </Pressable>
                    </View>
                  ))}
                {removeError && (
                  <ProseParagraph
                    accessibilityLiveRegion="polite"
                    style={small}
                  >
                    {pick(lang, {
                      hi: 'हटाया नहीं जा सका। फिर कोशिश करें।',
                      en: 'Could not remove. Try again.',
                      gu: 'દૂર કરી શકાયું નથી. ફરી પ્રયાસ કરો.',
                      kn: 'ತೆಗೆದುಹಾಕಲಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
                    })}
                  </ProseParagraph>
                )}
              </View>
            )}
            <ProseParagraph style={[small, styles.total]}>
              {contentByLang(
                lang,
                `${gitaSaarChaptersManifest.length} विषय · ${gitaSaarTotal} चुने हुए श्लोक`,
                `${gitaSaarChaptersManifest.length} themes · ${gitaSaarTotal} carefully chosen verses`
              )}
            </ProseParagraph>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  introControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 19,
    paddingBottom: 10,
  },
  heroTitle: { lineHeight: 49, paddingTop: 8, paddingBottom: 9 },
  featured: { padding: 21 },
  featuredBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resume: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 70,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginTop: 16,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 25,
    marginBottom: 12,
  },
  savedTarget: {
    minHeight: 48,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filters: { gap: 8, paddingBottom: 20 },
  filter: {
    minHeight: 44,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  themeCard: { borderWidth: StyleSheet.hairlineWidth, padding: 15 },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  empty: { padding: 22 },
  savedCard: {
    padding: 18,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 14,
  },
  savedHeader: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  note: { borderLeftWidth: 2, paddingLeft: 14, marginTop: 19 },
  removeNote: {
    minHeight: 44,
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  total: { textAlign: 'center', paddingVertical: 27 },
});
