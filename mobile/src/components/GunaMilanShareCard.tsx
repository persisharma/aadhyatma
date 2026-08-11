import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import type { Lang } from '@/data/gita/language';
import type { GunaMilanShareModel } from '@/panchang/gunaMilanShare';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';

const KOOTA_NAMES: Record<string, [string, string]> = {
  varna: ['वर्ण', 'Varna'],
  vashya: ['वश्य', 'Vashya'],
  tara: ['तारा', 'Tara'],
  yoni: ['योनि', 'Yoni'],
  grahaMaitri: ['ग्रह मैत्री', 'Graha Maitri'],
  gana: ['गण', 'Gana'],
  bhakoot: ['भकूट', 'Bhakoot'],
  nadi: ['नाड़ी', 'Nadi'],
};

const BAND_NAMES: Record<string, [string, string]> = {
  excellent: ['अति उत्तम', 'Excellent'],
  'very-good': ['बहुत अच्छा', 'Very good'],
  middling: ['मध्यम', 'Middling'],
  'below-reference': ['पारम्परिक सीमा से कम', 'Below reference threshold'],
};

export default function GunaMilanShareCard({
  width,
  lang,
  model,
}: {
  width: number;
  lang: Lang;
  model: GunaMilanShareModel;
}) {
  const { colors, typography, radii } = useTheme();
  const names = [
    model.groom.name ? `${model.groom.name} · ${contentByLang(lang, 'वर', 'Groom')}` : contentByLang(lang, 'वर', 'Groom'),
    model.bride.name ? `${model.bride.name} · ${contentByLang(lang, 'वधू', 'Bride')}` : contentByLang(lang, 'वधू', 'Bride'),
  ];
  const band = BAND_NAMES[model.band];
  return (
    <LinearGradient
      colors={[colors.cardActiveFrom, colors.parchment]}
      style={[styles.card, { width, aspectRatio: 4 / 5, borderColor: colors.saffronDeep, borderRadius: radii.lg }]}
    >
      <View style={styles.brandRow}>
        <Text style={[styles.om, { color: colors.saffronDeep }]}>ॐ</Text>
        <Text style={{ color: colors.ink, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 17 }}>
          {contentByLang(lang, 'वेदांश़', 'Vedansh')}
        </Text>
        <Text style={[styles.meta, { color: colors.inkMuted }]}>{contentByLang(lang, 'अष्टकूट मिलान', 'GUNA MILAN')}</Text>
      </View>
      <View style={[styles.rule, { backgroundColor: colors.divider }]} />
      <Text style={{ color: colors.ink, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 17, textAlign: 'center', marginTop: 10 }}>
        {names.join('  ×  ')}
      </Text>
      <View style={[styles.scoreCircle, { borderColor: colors.saffronDeep, backgroundColor: colors.saffronTint }]}
        accessibilityLabel={contentByLang(lang, `३६ में से ${model.total}`, `${model.total} out of 36`)}>
        <Text style={[styles.total, { color: colors.ink }]}>{model.total}</Text>
        <Text style={[styles.outOf, { color: colors.inkMuted }]}>/ 36</Text>
      </View>
      <Text style={{ color: colors.saffronDeep, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 14, textAlign: 'center' }}>
        {contentByLang(lang, band[0], band[1])}
      </Text>
      <View style={styles.grid}>
        {model.scores.map((row) => {
          const name = KOOTA_NAMES[row.id];
          return (
            <View key={row.id} style={[styles.row, { borderBottomColor: colors.divider }]}>
              <Text numberOfLines={1} style={{ flex: 1, color: colors.ink, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 10 }}>
                {contentByLang(lang, name[0], name[1])}
              </Text>
              <Text style={[styles.rowScore, { color: colors.ink }]}>{row.score}/{row.max}</Text>
            </View>
          );
        })}
      </View>
      <Text style={{ color: colors.inkMuted, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 10, lineHeight: 14, textAlign: 'center', marginTop: 'auto' }}>
        {meaningByLang(lang, 'पारम्परिक गणना — मार्गदर्शन हेतु, निर्णय हेतु नहीं।', 'Traditional calculation — for guidance, not a decision.')}
      </Text>
      <Text style={[styles.footer, { color: colors.saffronDeep }]}>ॐ वेदांश़</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, padding: 16, overflow: 'hidden' },
  brandRow: { flexDirection: 'row', alignItems: 'center', minHeight: 24 },
  om: { fontFamily: fontFamilies.devanagariBold, fontSize: 18, marginRight: 5 },
  meta: { marginLeft: 'auto', fontFamily: fontFamilies.interSemiBold, fontSize: 10, letterSpacing: 0.7 },
  rule: { height: StyleSheet.hairlineWidth, marginTop: 7 },
  scoreCircle: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  total: { fontFamily: fontFamilies.interSemiBold, fontSize: 30, lineHeight: 32 },
  outOf: { fontFamily: fontFamilies.inter, fontSize: 10 },
  grid: { marginTop: 8 },
  row: { height: 24, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', alignItems: 'center' },
  rowScore: { fontFamily: fontFamilies.interSemiBold, fontSize: 10 },
  footer: { fontFamily: fontFamilies.devanagariBold, fontSize: 11, textAlign: 'center', marginTop: 4 },
});
