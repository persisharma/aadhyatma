import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import type { Lang } from '@/data/gita/language';
import type { NamkaranShareModel } from '@/panchang/namkaranShare';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { contentByLang } from '@/utils/localize';
import { pillTextStyle, scriptBodyFont, scriptTitleFont } from '@/utils/langType';

export default function NamkaranShareCard({ width, lang, model }: { width: number; lang: Lang; model: NamkaranShareModel }) {
  const { colors, radii, typography } = useTheme();
  const shown = model.shortlistNames?.slice(0, 5) ?? [];
  const overflow = (model.shortlistNames?.length ?? 0) - shown.length;
  return (
    <LinearGradient colors={[colors.cardActiveFrom, colors.parchment]} style={[styles.card, { width, borderRadius: radii.lg, borderColor: colors.cardActiveBorder }]}>
      <Text style={[styles.brand, { color: colors.saffronDeep, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily) }]}>{model.brand}</Text>
      <Text style={[styles.eyebrow, pillTextStyle(lang, typography.sectionLabel), { color: colors.inkMuted }]}>{contentByLang(lang, 'नामाक्षर', 'NAMAKSHAR')}</Text>
      {/* No fixed `lineHeight` on the syllable: 70 is under the natural ~74 pt
          box at 54 pt, which slices an above-shirorekha matra (design.md §3.0).
          The flex spacer below absorbs the few points this adds. */}
      <Text style={{ color: colors.ink, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 54 }}>
        {model.syllables.map((value) => value.hi).join(' · ')}
      </Text>
      <Text style={[styles.aid, { color: colors.inkMuted }]}>{model.syllables.map((value) => value.latin).join(' · ')}</Text>
      <Text style={{ color: colors.ink, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 10 }}>
        {model.nakshatraHi} · {contentByLang(lang, `पद ${model.pada}`, `Pada ${model.pada}`)} · {model.rashiHi}
      </Text>
      {shown.length ? (
        <View style={[styles.shortlist, { borderColor: colors.divider }]}>
          <Text style={[styles.eyebrow, pillTextStyle(lang, typography.sectionLabel), { color: colors.saffronDeep }]}>{contentByLang(lang, 'चुने हुए नाम', 'SHORTLIST')}</Text>
          {shown.map((name) => <Text key={name.hi} numberOfLines={1} style={{ color: colors.ink, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 12, lineHeight: 18 }}>{name.hi} · {name.latin}</Text>)}
          {overflow > 0 ? <Text style={[styles.aid, { color: colors.inkMuted }]}>+{overflow} {contentByLang(lang, 'और', 'more')}</Text> : null}
        </View>
      ) : null}
      <View style={{ flex: 1 }} />
      <Text style={{ color: colors.inkMuted, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 10, lineHeight: 15, textAlign: 'center' }}>{model.conventionNote}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: { height: '100%', borderWidth: 1, padding: 22, alignItems: 'center', overflow: 'hidden' },
  brand: { fontSize: 17, lineHeight: 24 },
  // Face/tracking/case come from pillTextStyle (design.md §3.0) — this card is
  // rendered to an image, so an Inter-fallback Devanagari label ships as a file.
  eyebrow: { lineHeight: 16, marginTop: 10 },
  aid: { fontFamily: fontFamilies.latinSemiBoldItalic, fontSize: 14, lineHeight: 20 },
  shortlist: { alignSelf: 'stretch', borderTopWidth: StyleSheet.hairlineWidth, marginTop: 14, paddingTop: 4, gap: 2 },
});
