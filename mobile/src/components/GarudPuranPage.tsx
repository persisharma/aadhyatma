/** Illustrated prose page, adapted from KathaSectionPage (not a verse renderer). */
import React, { useState } from 'react';
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { garudPuranImages } from '@assets/garud-puran';
import type { GarudPuranPage as Page, GarudPuranSource } from '@/data/garud-puran';
import { useGitaLanguage } from '@/data/gita/language';
import { useTheme } from '@/theme/ThemeContext';
import { commentaryByLang, contentByLang } from '@/utils/localize';
import { meaningToken, pillTextStyle, scriptTitleFont } from '@/utils/langType';
import { LeafIcon } from 'phosphor-react-native/src/icons/Leaf';
import ProseParagraph from './ProseParagraph';

type Props = { verse: Page; source: GarudPuranSource; width: number; topActions?: React.ReactNode };

export default function GarudPuranPage({ verse, source, width, topActions }: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const [showSources, setShowSources] = useState(false);
  const body = commentaryByLang(lang, verse.bodyHi, verse.bodyEn);
  const title = contentByLang(lang, verse.titleHi, verse.titleEn);
  const bodyStyle = { ...meaningToken(lang, typography), color: colors.ink };
  return (
    <View style={[styles.page, { width }]} testID={`garud-page-${verse.id}`}>
      <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: spacing.screenGutter }]} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <View style={[styles.pill, { backgroundColor: colors.saffronTint, borderRadius: radii.pill }]}>
            <Text style={[pillTextStyle(lang, typography.versePill), { color: colors.saffronDeep }]}>
              {contentByLang(lang, 'चयनित प्रसंग', 'Selected reading')}
            </Text>
          </View>
          <View style={styles.actions}>{topActions}</View>
        </View>
        <Text accessibilityRole="header" style={[styles.title, { color: colors.ink, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily) }]}>{title}</Text>
        {verse.number === 1 && (
          <View testID={`garud-art-${verse.id}`} style={styles.art}>
            <Image source={garudPuranImages[verse.artId]} style={{ width: '100%', height: '100%' }} resizeMode="contain"
              accessibilityLabel={contentByLang(lang, 'प्रसंग पर आधारित सांकेतिक चित्र', 'Interpretive illustration for this reading')} />
          </View>
        )}
        <View style={styles.divider} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <View style={[styles.rule, { backgroundColor: colors.gold }]} />
          <LeafIcon size={18} weight="fill" color={colors.gold} />
          <View style={[styles.rule, { backgroundColor: colors.gold }]} />
        </View>
        {body.map((paragraph, index) => <ProseParagraph key={index} style={[styles.paragraph, bodyStyle]}>{paragraph}</ProseParagraph>)}
        <Pressable onPress={() => setShowSources(value => !value)} accessibilityRole="button"
          accessibilityState={{ expanded: showSources }} testID={`garud-sources-${verse.id}`}
          style={[styles.sourceButton, { borderColor: colors.divider }]}>
          <Text style={[pillTextStyle(lang, typography.versePill), { color: colors.saffronDeep }]}>
            {contentByLang(lang, 'स्रोत और पाठ का परिचय', 'Sources and reading context')} {showSources ? '−' : '+'}
          </Text>
        </Pressable>
        {showSources && <View testID="garud-source-details">
          <Text style={[styles.sourceText, bodyStyle]}>{contentByLang(lang, source.citeHi, source.citeEn)}</Text>
          <Text style={[styles.sourceText, bodyStyle]}>{contentByLang(lang,
            'यह चुने हुए प्रसंगों की सरल व्याख्या है, पूरा अध्याय या शब्दशः अनुवाद नहीं। संस्कृत पाठ और गीताप्रेस के संक्षिप्त हिन्दी पाठ से तुलना की गई है। चित्र सांकेतिक हैं।',
            'This is an editorial explanation of selected passages, not a complete chapter or a word-for-word translation. It was compared with the Sanskrit text and the Gita Press Hindi abridgement. The illustrations are interpretive.')}</Text>
          <Text selectable style={[styles.sourceText, bodyStyle]}>{source.sanskritReferences.join(', ')}</Text>
          {[source.referenceUrls[0], source.referenceUrls[1]].map((url, index) => (
            <Pressable key={url} onPress={() => { Linking.openURL(url).catch(() => undefined); }} accessibilityRole="link" style={styles.link}>
              <Text style={[bodyStyle, { color: colors.saffronDeep, textDecorationLine: 'underline' }]}>
                {index === 0 ? contentByLang(lang, 'संस्कृत स्रोत खोलें', 'Open Sanskrit source') : contentByLang(lang, 'हिन्दी स्रोत खोलें', 'Open Hindi source')}
              </Text>
            </Pressable>
          ))}
        </View>}
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1 }, content: { paddingTop: 8, paddingBottom: 32 },
  topRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  actions: { flexDirection: 'row', gap: 8 }, pill: { paddingHorizontal: 10, paddingVertical: 6 },
  title: { fontSize: 20, lineHeight: 30, marginTop: 8, marginBottom: 4 },
  // Same complete-canvas frame as current-main ReadingBanner. Never crop a portrait to fit.
  art: { width: '100%', maxWidth: 360, aspectRatio: 2, maxHeight: 180, alignSelf: 'center', marginTop: 8 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8, marginBottom: 16, opacity: 0.75 },
  rule: { flex: 1, height: 1 }, paragraph: { marginBottom: 14 }, sourceText: { marginTop: 14 },
  sourceButton: { borderTopWidth: 1, marginTop: 24, minHeight: 48, justifyContent: 'center' },
  link: { minHeight: 48, justifyContent: 'center', marginTop: 8 },
});
