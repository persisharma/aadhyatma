import React from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { gitaSaarChaptersManifest, gitaSaarTitleEn, gitaSaarTitleHi, gitaSaarTotal } from '@/data/gita-saar';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang, pick } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';
import { getSourceBackground } from '@/data/backgrounds';
import ReaderHeader from '@/components/ReaderHeader';
import HomeWordmark from '@/components/HomeWordmark';
import BackgroundLayer from '@/components/BackgroundLayer';
import { readingParchment } from '@/data/backgroundAsset';
import ReadingBanner from '@/components/ReadingBanner';
import ProseParagraph from '@/components/ProseParagraph';
import AppIcon from '@/components/AppIcon';
import GitaSaarThemeIcon from '@/components/GitaSaarThemeIcon';
import GitaSaarDivider from '@/components/GitaSaarDivider';
import ShareButton from '@/components/ShareButton';
import { useShare } from '@/utils/shareVerse';
import { buildListingShare } from '@/utils/listingShare';
import LanguageToggle from '@/components/LanguageToggle';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'GitaSaarChapters'>;

/** Editorial Gita Saar index: a Krishna–Arjuna cover above a quiet theme list. */
export default function GitaSaarThemesScreen({ navigation }: Props) {
  const { colors, spacing, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const { share, busy: shareBusy } = useShare();
  const { getChapterProgress } = useReadingProgress();
  const { width } = useWindowDimensions();

  const title = contentByLang(lang, gitaSaarTitleHi, gitaSaarTitleEn);
  const listingShare = buildListingShare({
    sourceId: 'gita-saar',
    titleHi: gitaSaarTitleHi, titleEn: gitaSaarTitleEn,
    background: getSourceBackground('gita-saar'),
    items: gitaSaarChaptersManifest.map((chapter) => ({
      titleHi: chapter.titleHi, titleEn: chapter.titleEn,
      detailHi: `${chapter.verseCount} श्लोक`,
      detailEn: `${chapter.verseCount} ${chapter.verseCount === 1 ? 'verse' : 'verses'}`,
    })),
  });
  const lede = pick(lang, {
    hi: 'एक विषय, गीता के चुने हुए श्लोक, सरल अर्थ। हर श्लोक से पूरा अर्थ गीता में खुलता है।',
    en: 'One theme, the Gita’s chosen verses, plain meaning. Every verse opens its full meaning in the Gita.',
    gu: 'એક વિષય, ગીતાના પસંદ કરેલા શ્લોક, સરળ અર્થ. દરેક શ્લોકથી પૂરો અર્થ ગીતામાં ખૂલે છે.',
    kn: 'ಒಂದು ವಿಷಯ, ಗೀತೆಯ ಆಯ್ದ ಶ್ಲೋಕಗಳು, ಸರಳ ಅರ್ಥ. ಪ್ರತಿ ಶ್ಲೋಕದಿಂದ ಪೂರ್ಣ ಅರ್ಥ ಗೀತೆಯಲ್ಲಿ ತೆರೆಯುತ್ತದೆ.',
  });
  const themeLabel = pick(lang, { hi: 'विषय चुनें', en: 'Choose a theme', gu: 'વિષય પસંદ કરો', kn: 'ವಿಷಯ ಆರಿಸಿ' });
  const totalLabel = pick(lang, {
    hi: `${gitaSaarChaptersManifest.length} विषय · ${gitaSaarTotal} श्लोक`,
    en: `${gitaSaarChaptersManifest.length} themes · ${gitaSaarTotal} verses`,
    gu: `${gitaSaarChaptersManifest.length} વિષય · ${gitaSaarTotal} શ્લોક`,
    kn: `${gitaSaarChaptersManifest.length} ವಿಷಯ · ${gitaSaarTotal} ಶ್ಲೋಕಗಳು`,
  });
  const heroHeight = width / 2;

  return (
    <View style={[styles.root, { backgroundColor: colors.parchment }]}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <ReaderHeader
          title={title}
          titleContent={<HomeWordmark compact showTagline={false} />}
          onBack={() => navigation.goBack()}
          sideWidth={48}
          right={<ShareButton busy={shareBusy} accessibilityLabel="Share chapter listing" accessibilityHint="Share the complete chapter list as post, Story, or Reel cards" onPress={() => void share(listingShare, lang)} />}
          variant="index"
        />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.hero, { height: heroHeight }]}>
            <ReadingBanner
              source={getSourceBackground('gita-saar')!}
              testID="gita-saar-index-artwork"
              fallback={<BackgroundLayer source={readingParchment} />}
              style={{ width, height: heroHeight, maxWidth: width, maxHeight: heroHeight }}
            />
          </View>

          <View style={[styles.content, { paddingHorizontal: spacing.screenGutter }]}>
            <ProseParagraph
              style={[
                styles.title,
                {
                  color: colors.ink,
                  fontFamily: lang === 'en' ? fontFamilies.latinBold : scriptTitleFont(lang, typography.screenTitle.fontFamily),
                  fontSize: lang === 'en' ? 40 : 42,
                  fontStyle: lang === 'en' ? 'italic' : 'normal',
                },
              ]}
            >
              {title}
            </ProseParagraph>
            <ProseParagraph
              style={[
                styles.total,
                {
                  color: colors.inkSoft,
                  fontFamily: lang === 'en' ? typography.subtitle.fontFamily : scriptBodyFont(lang, typography.meaning.fontFamily),
                },
              ]}
            >
              {totalLabel}
            </ProseParagraph>
            <ProseParagraph
              style={[
                styles.lede,
                {
                  color: colors.inkSoft,
                  fontFamily: lang === 'en' ? typography.subtitle.fontFamily : scriptBodyFont(lang, typography.meaning.fontFamily),
                  fontStyle: lang === 'en' ? 'italic' : 'normal',
                },
              ]}
            >
              {lede}
            </ProseParagraph>

            <View style={styles.toggleRow}>
              <LanguageToggle />
            </View>

            <GitaSaarDivider />
            <View style={[styles.sectionHeading, { borderBottomColor: colors.divider }]}>
              <ProseParagraph
                style={[
                  styles.sectionTitle,
                  {
                    color: colors.ink,
                    fontFamily: lang === 'en' ? fontFamilies.latinSemiBold : scriptTitleFont(lang, typography.cardHindi.fontFamily),
                  },
                ]}
              >
                {themeLabel}
              </ProseParagraph>
              <View style={[styles.ornament, { backgroundColor: colors.gold }]} />
            </View>

            <View>
              {gitaSaarChaptersManifest.map((theme, index) => {
                const themeTitle = contentByLang(lang, theme.titleHi, theme.titleEn);
                const verseMeta = lang === 'en'
                  ? `${theme.verseCount} ${theme.verseCount === 1 ? 'verse' : 'verses'}`
                  : `${theme.verseCount} ${pick(lang, { hi: 'श्लोक', en: 'verses', gu: 'શ્લોક', kn: 'ಶ್ಲೋಕಗಳು' })}`;
                const a11yLabel = `${themeTitle}. ${verseMeta}. Tap to open.`;

                return (
                  <Pressable
                    key={theme.chapter}
                    onPress={() => {
                      const resumeIndex = getChapterProgress('gita-saar', theme.chapter)?.verseIndex ?? 0;
                      navigation.navigate('GitaSaarReader', { chapter: theme.chapter, initialIndex: resumeIndex });
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={a11yLabel}
                    style={({ pressed }) => [styles.themeRow, pressed && styles.pressed]}
                  >
                    <View style={styles.themeIcon}>
                      <GitaSaarThemeIcon themeId={theme.id} />
                    </View>
                    <View style={[styles.rowDivider, { backgroundColor: colors.divider }]} />
                    <View style={styles.themeMeta}>
                      <ProseParagraph
                        style={[
                          styles.themeTitle,
                          {
                            color: colors.ink,
                            fontFamily: lang === 'en' ? fontFamilies.latinSemiBold : scriptTitleFont(lang, typography.cardHindi.fontFamily),
                          },
                        ]}
                      >
                        {themeTitle}
                      </ProseParagraph>
                      <ProseParagraph style={[styles.verseMeta, { color: colors.inkMuted }]}>{verseMeta}</ProseParagraph>
                    </View>
                    <AppIcon name="next" size={22} color={colors.saffronDeep} />
                    {index < gitaSaarChaptersManifest.length - 1 && (
                      <View style={[styles.separator, { backgroundColor: colors.divider }]} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 28 },
  hero: { width: '100%', overflow: 'hidden' },
  content: { paddingTop: 24 },
  title: { includeFontPadding: true, lineHeight: 64, paddingTop: 8, paddingBottom: 8 },
  total: { marginTop: 2, fontSize: 17, lineHeight: 25 },
  lede: { marginTop: 8, fontSize: 15, lineHeight: 23 },
  toggleRow: { alignItems: 'flex-end', marginTop: 16, marginBottom: 12 },
  sectionHeading: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 4,
  },
  sectionTitle: { fontSize: 20, lineHeight: 30 },
  ornament: { height: 1, flex: 1, marginLeft: 16, opacity: 0.65 },
  themeRow: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  pressed: { opacity: 0.72 },
  themeIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  rowDivider: { width: 1, alignSelf: 'stretch', marginVertical: 4, marginRight: 16 },
  themeMeta: { flex: 1, minWidth: 0, gap: 2 },
  themeTitle: { fontSize: 19, lineHeight: 32, paddingVertical: 3 },
  verseMeta: { fontSize: 14, lineHeight: 20 },
  separator: { position: 'absolute', bottom: 0, left: 74, right: 0, height: StyleSheet.hairlineWidth },
});
