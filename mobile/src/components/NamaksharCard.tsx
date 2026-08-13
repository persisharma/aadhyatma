import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import type { Lang } from '@/data/gita/language';
import { RASHI_NAMES_EN, RASHI_NAMES_HI } from '@/panchang/kundali';
import { NAKSHATRA_NAMES_EN, NAKSHATRA_NAMES_HI } from '@/panchang/names';
import type { CharanaCandidate } from '@/panchang/namkaran';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { contentByLang } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';

export default function NamaksharCard({ candidate, lang }: { candidate: CharanaCandidate; lang: Lang }) {
  const { colors, radii, elevation, typography } = useTheme();
  const primary = candidate.entry.syllables[0];
  const alternates = candidate.entry.syllables.slice(1);
  return (
    <LinearGradient
      colors={[colors.cardActiveFrom, colors.cardActiveTo]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      accessibilityRole="summary"
      accessibilityLabel={`${primary.hi}, ${primary.latin}. ${NAKSHATRA_NAMES_EN[candidate.entry.nakshatraIndex]}, pada ${candidate.entry.pada}.`}
      style={[styles.card, { borderColor: colors.cardActiveBorder, borderRadius: radii.lg }, elevation.raised]}
    >
      <Text style={[styles.eyebrow, { color: colors.saffronDeep }]}>{contentByLang(lang, '॥ नामाक्षर', '॥ NAMAKSHAR')}</Text>
      <View style={styles.syllableBox}>
        <Text
          allowFontScaling
          maxFontSizeMultiplier={1.25}
          style={{ color: colors.ink, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 58, lineHeight: 78 }}
        >
          {primary.hi}
        </Text>
      </View>
      <Text maxFontSizeMultiplier={1.25} style={[styles.latin, { color: colors.inkMuted }]}>{primary.latin}</Text>
      <Text maxFontSizeMultiplier={1.25} style={{ color: colors.ink, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 10 }}>
        {contentByLang(lang, NAKSHATRA_NAMES_HI[candidate.entry.nakshatraIndex], NAKSHATRA_NAMES_EN[candidate.entry.nakshatraIndex])}
        {' · '}{contentByLang(lang, `पद ${candidate.entry.pada}`, `Pada ${candidate.entry.pada}`)}
        {' · '}{contentByLang(lang, `${RASHI_NAMES_HI[candidate.rashiIndex]} राशि`, `${RASHI_NAMES_EN[candidate.rashiIndex]} rashi`)}
      </Text>
      {alternates.length ? (
        <Text maxFontSizeMultiplier={1.25} style={{ color: colors.inkMuted, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 11, lineHeight: 17, textAlign: 'center', marginTop: 4 }}>
          {contentByLang(lang, 'अन्य विकल्प', 'Alternates')}: {alternates.map((value) => `${value.hi} · ${value.latin}`).join(', ')}
        </Text>
      ) : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, padding: 20, alignItems: 'center', overflow: 'hidden' },
  // The hero is intentionally given a real line box. At the largest supported
  // type step, a bare Text line can otherwise crop Devanagari matras.
  syllableBox: { minHeight: 96, justifyContent: 'center', alignItems: 'center' },
  eyebrow: { fontFamily: fontFamilies.interSemiBold, fontSize: 10, letterSpacing: 1.2 },
  latin: { fontFamily: fontFamilies.latinSemiBoldItalic, fontSize: 18 },
});
