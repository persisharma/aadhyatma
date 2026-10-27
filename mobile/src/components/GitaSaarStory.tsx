import React, { useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { gitaSaarStories } from '@/data/gita-saar/stories';
import type { LearningCopy } from '@/data/gita-saar/experience';
import { readerIllustrationAsset } from '@/data/readerIllustrationAsset';
import { meaningByLang, meaningSourceLang, pick } from '@/utils/localize';
import { meaningToken, scriptTitleFont } from '@/utils/langType';
import { fontFamilies } from '@/theme/typography';
import ReadingBanner from './ReadingBanner';
import ProseParagraph from './ProseParagraph';
import AppIcon from './AppIcon';

function useStoryStyle() {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const token = meaningToken(meaningSourceLang(lang), typography);
  return {
    colors,
    lang,
    copy: (value: LearningCopy) => meaningByLang(lang, value.hi, value.en),
    body: { ...token, color: colors.inkSoft },
    heading: {
      fontFamily:
        lang === 'en'
          ? fontFamilies.latinSemiBold
          : scriptTitleFont(lang, typography.screenTitle.fontFamily),
      color: colors.ink,
    },
    label: {
      fontFamily: token.fontFamily,
      fontSize: 12,
      lineHeight: 22,
      color: colors.saffronDeep,
    },
  };
}

/** The picture appears at the opening, not after several screens of text. */
export function GitaSaarStoryHero({
  themeId,
  width,
}: {
  themeId: string;
  width: number;
}) {
  const story = gitaSaarStories[themeId];
  const { colors, lang, copy, heading, label } = useStoryStyle();
  if (!story) return null;
  return (
    <View testID={`gita-saar-story-hero-${themeId}`} style={styles.hero}>
      <ProseParagraph style={label}>
        {pick(lang, {
          hi: 'एक प्रसंग से समझें',
          en: 'Wisdom through a story',
          gu: 'એક પ્રસંગથી સમજો',
          kn: 'ಒಂದು ಪ್ರಸಂಗದ ಮೂಲಕ ಅರಿಯಿರಿ',
        })}
      </ProseParagraph>
      <ProseParagraph
        accessibilityRole="header"
        style={[
          heading,
          { fontSize: 25, lineHeight: 37, marginTop: 6, marginBottom: 16 },
        ]}
      >
        {copy(story.title)}
      </ProseParagraph>
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={copy(story.imageCaption)}
      >
        <ReadingBanner
          testID={`gita-saar-story-image-${themeId}`}
          source={readerIllustrationAsset(story.imageStem)}
          style={{ width, maxWidth: 560, maxHeight: 280 }}
        />
      </View>
      <ProseParagraph
        style={[label, { color: colors.inkMuted, marginTop: 10 }]}
      >
        {copy(story.imageCaption)}
      </ProseParagraph>
    </View>
  );
}

/** A resumed teaching keeps a direct, illustrated door to its theme's story. */
export function GitaSaarStoryDoor({
  themeId,
  onPress,
}: {
  themeId: string;
  onPress?: () => void;
}) {
  const story = gitaSaarStories[themeId];
  const { colors, lang, copy, heading, label } = useStoryStyle();
  if (!story || !onPress) return null;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Read this theme's illustrated story"
      onPress={onPress}
      style={[styles.door, { borderColor: colors.divider }]}
    >
      <ReadingBanner
        source={readerIllustrationAsset(story.imageStem)}
        style={{ width: 88, height: 44, maxWidth: 88, maxHeight: 44 }}
      />
      <View style={{ flex: 1 }}>
        <ProseParagraph style={label}>
          {pick(lang, {
            hi: 'इस विषय का प्रसंग',
            en: 'This theme’s story',
            gu: 'આ વિષયનો પ્રસંગ',
            kn: 'ಈ ವಿಷಯದ ಪ್ರಸಂಗ',
          })}
        </ProseParagraph>
        <ProseParagraph style={[heading, { fontSize: 16, lineHeight: 27 }]}>
          {copy(story.title)}
        </ProseParagraph>
      </View>
      <AppIcon name="next" color={colors.saffronDeep} size={18} />
    </Pressable>
  );
}

/** Three visible beats, a Gita connection and an applied example; no stage tabs. */
export function GitaSaarStoryDetails({ themeId }: { themeId: string }) {
  const story = gitaSaarStories[themeId];
  const { colors, lang, copy, body, heading, label } = useStoryStyle();
  const [sourceError, setSourceError] = useState(false);
  if (!story) return null;
  return (
    <View testID={`gita-saar-story-details-${themeId}`} style={styles.details}>
      <ProseParagraph style={label}>
        {pick(
          lang,
          story.kind === 'scriptural-example'
            ? {
                hi: 'ग्रंथ का उदाहरण · संक्षिप्त प्रस्तुति',
                en: 'A scriptural example · abridged',
                gu: 'ગ્રંથનું ઉદાહરણ · સંક્ષિપ્ત રજૂઆત',
                kn: 'ಗ್ರಂಥದ ಉದಾಹರಣೆ · ಸಂಕ್ಷಿಪ್ತ ನಿರೂಪಣೆ',
              }
            : {
                hi: 'कथा का सूत्र · संक्षिप्त रूपांतर',
                en: 'The story · an abridged retelling',
                gu: 'કથાનું સૂત્ર · સંક્ષિપ્ત રૂપાંતર',
                kn: 'ಕಥೆಯ ಸಾರ · ಸಂಕ್ಷಿಪ್ತ ರೂಪಾಂತರ',
              }
        )}
      </ProseParagraph>
      {story.beats.map((beat, index) => (
        <View
          key={index}
          style={styles.beat}
          testID={`gita-saar-story-beat-${index + 1}`}
        >
          <View style={styles.rail}>
            <View style={[styles.number, { backgroundColor: colors.goldTint }]}>
              <ProseParagraph style={[label, { textAlign: 'center' }]}>
                {String(index + 1).padStart(2, '0')}
              </ProseParagraph>
            </View>
            {index < story.beats.length - 1 && (
              <View
                style={[styles.line, { backgroundColor: colors.divider }]}
              />
            )}
          </View>
          <View style={{ flex: 1, paddingBottom: 25 }}>
            <ProseParagraph
              accessibilityRole="header"
              style={[
                heading,
                { fontSize: body.fontSize + 2, lineHeight: body.lineHeight },
              ]}
            >
              {copy(beat.title)}
            </ProseParagraph>
            <ProseParagraph style={[body, { marginTop: 7 }]}>
              {copy(beat.body)}
            </ProseParagraph>
          </View>
        </View>
      ))}
      <View
        testID="gita-saar-story-connection"
        style={[
          styles.connection,
          { borderColor: colors.gold, backgroundColor: colors.cardSurface },
        ]}
      >
        <ProseParagraph style={label}>
          {pick(lang, {
            hi: 'गीता से संबंध',
            en: 'The connection to the Gita',
            gu: 'ગીતા સાથેનો સંબંધ',
            kn: 'ಗೀತೆಯೊಂದಿಗಿನ ಸಂಬಂಧ',
          })}
        </ProseParagraph>
        <ProseParagraph style={[body, { color: colors.ink, marginTop: 10 }]}>
          {copy(story.connection)}
        </ProseParagraph>
      </View>
      <View
        testID="gita-saar-story-everyday"
        style={[styles.everyday, { borderColor: colors.divider }]}
      >
        <ProseParagraph style={label}>
          {pick(lang, {
            hi: 'आपके दिन में इसका रूप',
            en: 'What this looks like today',
            gu: 'તમારા દિવસમાં આનો અર્થ',
            kn: 'ನಿಮ್ಮ ದಿನದಲ್ಲಿ ಇದರ ರೂಪ',
          })}
        </ProseParagraph>
        <ProseParagraph style={[body, { marginTop: 10 }]}>
          {copy(story.everyday)}
        </ProseParagraph>
      </View>
      <ProseParagraph
        style={[label, { color: colors.inkMuted, marginTop: 14 }]}
      >
        {pick(lang, {
          hi: 'कथा का स्रोत नीचे है। गीता से संबंध और दैनिक उदाहरण संपादकीय मनन हैं।',
          en: 'Story sources are below. The Gita connection and everyday example are editorial reflections.',
          gu: 'કથાના સ્રોત નીચે છે. ગીતા સાથેનો સંબંધ અને દૈનિક ઉદાહરણ સંપાદકીય મનન છે.',
          kn: 'ಕಥೆಯ ಮೂಲಗಳು ಕೆಳಗಿವೆ. ಗೀತೆಯ ಸಂಪರ್ಕ ಮತ್ತು ದಿನನಿತ್ಯದ ಉದಾಹರಣೆ ಸಂಪಾದಕೀಯ ಚಿಂತನೆಗಳು.',
        })}
      </ProseParagraph>
      {story.sources.map((source) => (
        <Pressable
          key={source.url}
          accessibilityRole="link"
          accessibilityLabel={`Read story source ${lang === 'hi' ? source.passageHi ?? source.passage : source.passage}`}
          onPress={() => {
            setSourceError(false);
            void Linking.openURL(source.url).catch(() => setSourceError(true));
          }}
          style={[styles.source, { borderColor: colors.divider }]}
        >
          <AppIcon name="text" color={colors.saffronDeep} size={16} />
          <ProseParagraph style={[label, { flex: 1 }]}>
            {`${copy(source.title)} · ${lang === 'hi' ? source.passageHi ?? source.passage : source.passage}`}
          </ProseParagraph>
          <AppIcon name="next" color={colors.saffronDeep} size={16} />
        </Pressable>
      ))}
      {sourceError && (
        <ProseParagraph accessibilityLiveRegion="polite" style={label}>
          {pick(lang, {
            hi: 'स्रोत नहीं खुल सका। फिर कोशिश करें।',
            en: 'Could not open the source. Try again.',
            gu: 'સ્રોત ખૂલી શક્યો નથી. ફરી પ્રયાસ કરો.',
            kn: 'ಮೂಲವನ್ನು ತೆರೆಯಲಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
          })}
        </ProseParagraph>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { marginTop: 17, marginBottom: 18 },
  details: { marginTop: 13, marginBottom: 22 },
  door: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    marginBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  beat: { flexDirection: 'row', gap: 13, marginTop: 16 },
  rail: { width: 34, alignItems: 'center' },
  number: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: { width: 1, flex: 1, marginTop: 10 },
  connection: {
    borderLeftWidth: 3,
    padding: 19,
    borderRadius: 13,
    marginTop: 2,
  },
  everyday: {
    paddingVertical: 22,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  source: {
    minHeight: 48,
    paddingVertical: 12,
    flexDirection: 'row',
    gap: 9,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
