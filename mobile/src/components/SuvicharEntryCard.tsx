import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { androidBoxShadow } from '@/theme/elevation';
import { fontFamilies } from '@/theme/typography';
import type { Lang } from '@/data/gita/language';
import { meaningToken, titleFontByLang } from '@/utils/langType';
import { pick } from '@/utils/localize';
import AppIcon from './AppIcon';

/** Daily Bhakti's door to the Suvichar composer; the miniature shows a named card before the tap (design.md §82). */
export default function SuvicharEntryCard({ lang, onPress }: { lang: Lang; onPress: () => void }) {
  const { colors, spacing, radii, typography } = useTheme();
  const title = pick(lang, { hi: 'आज का सुविचार भेजें', en: "Send today's wish", gu: 'આજનો સુવિચાર મોકલો', kn: 'ಇಂದಿನ ಸುವಿಚಾರ ಕಳುಹಿಸಿ' });
  const detail = pick(lang, { hi: 'अपने नाम के साथ, परिवार और मित्रों को', en: 'With your name, to family and friends', gu: 'તમારા નામ સાથે, પરિવાર અને મિત્રોને', kn: 'ನಿಮ್ಮ ಹೆಸರಿನೊಂದಿಗೆ, ಕುಟುಂಬ ಮತ್ತು ಸ್ನೇಹಿತರಿಗೆ' });
  return <Pressable testID="open-suvichar" accessibilityRole="button" accessibilityLabel={`${title}. ${detail}`} onPress={onPress}
    style={({ pressed }) => [{ width: '100%', maxWidth: 540, minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: spacing.md,
      paddingVertical: spacing.md, paddingLeft: spacing.lg, paddingRight: spacing.md, marginBottom: spacing.md, borderRadius: radii.md,
      borderWidth: 1, borderColor: colors.cardActiveBorder, backgroundColor: colors.cardActiveFrom,
      shadowColor: colors.saffronDeep, shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
      ...androidBoxShadow(2, 8, 'rgba(138, 62, 11, 0.08)') }, pressed && { opacity: 0.85 }]}>
    <View accessible={false} importantForAccessibility="no-hide-descendants" style={{ width: 46, height: 60, borderRadius: 6, borderWidth: 1,
      borderColor: colors.gold, backgroundColor: colors.parchmentSoft, overflow: 'hidden', transform: [{ rotate: '-4deg' }] }}>
      <View style={{ height: 32, backgroundColor: colors.cardThumbActiveTo, alignItems: 'center', justifyContent: 'center' }}>
        <Text allowFontScaling={false} style={{ fontFamily: fontFamilies.devanagariBold, fontSize: 16, lineHeight: 24, color: colors.saffronDeep }}>ॐ</Text>
      </View>
      <View style={{ padding: 5, gap: 3 }}>
        <View style={{ height: 3, borderRadius: 2, backgroundColor: colors.gold }} />
        <View style={{ height: 3, width: '70%', borderRadius: 2, backgroundColor: colors.gold }} />
        <View style={{ height: 3, width: '50%', marginTop: 2, alignSelf: 'flex-end', borderRadius: 2, backgroundColor: colors.saffronDeep }} />
      </View>
    </View>
    <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
      <Text style={{ fontFamily: titleFontByLang(lang), fontSize: typography.readerTitle.fontSize, lineHeight: typography.readerTitle.fontSize * 1.5, color: colors.ink }}>{title}</Text>
      <Text style={{ fontFamily: meaningToken(lang, typography).fontFamily, fontSize: typography.listingEyebrow.fontSize, lineHeight: typography.listingEyebrow.lineHeight, color: colors.inkMuted }}>{detail}</Text>
    </View>
    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.saffronDeep, alignItems: 'center', justifyContent: 'center' }}>
      <AppIcon name="next" size={18} color={colors.parchmentSoft} />
    </View>
  </Pressable>;
}
