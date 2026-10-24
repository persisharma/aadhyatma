import React, { useEffect, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { androidBoxShadow } from '@/theme/elevation';
import { fontFamilies } from '@/theme/typography';
import type { Lang } from '@/data/gita/language';
import { meaningToken, titleFontByLang } from '@/utils/langType';
import { contentByLang, pick } from '@/utils/localize';
import { suvicharArtRequest, suvicharDeities } from '@/data/suvichar';
import { suvicharVaarFor } from '@/data/suvicharVaar';
import { peekBackgroundAsset } from '@/utils/backgroundAssetCache';
import AppIcon from './AppIcon';

/** Daily Bhakti's door to the Suvichar composer; the miniature shows a named card before the tap (design.md §82).
 * On a weekday with a card it names the day and its deity, and shows that painting once the composer has cached it. */
export default function SuvicharEntryCard({ lang, onPress }: { lang: Lang; onPress: () => void }) {
  const { colors, spacing, radii, typography } = useTheme();
  const vaar = suvicharVaarFor(new Date());
  const deity = vaar ? suvicharDeities.find(d => d.id === vaar.deities[0])! : null;
  const title = vaar ? pick(lang, { hi: `${vaar.hi} भेजें`, en: `Send ${vaar.en}`, gu: `${contentByLang('gu', vaar.hi, vaar.en)} મોકલો`, kn: `${contentByLang('kn', vaar.hi, vaar.en)} ಕಳುಹಿಸಿ` })
    : pick(lang, { hi: 'आज का सुविचार भेजें', en: "Send today's wish", gu: 'આજનો સુવિચાર મોકલો', kn: 'ಇಂದಿನ ಸುವಿಚಾರ ಕಳುಹಿಸಿ' });
  const detail = deity ? pick(lang, { hi: `${deity.hi} का आज का कार्ड, आपके नाम के साथ`, en: `Today's ${deity.en} card, with your name`,
    gu: `${contentByLang('gu', deity.hi, deity.en)}નું આજનું કાર્ડ, તમારા નામ સાથે`, kn: `${contentByLang('kn', deity.hi, deity.en)} ಅವರ ಇಂದಿನ ಕಾರ್ಡ್, ನಿಮ್ಮ ಹೆಸರಿನೊಂದಿಗೆ` })
    : pick(lang, { hi: 'अपने नाम के साथ, परिवार और मित्रों को', en: 'With your name, to family and friends', gu: 'તમારા નામ સાથે, પરિવાર અને મિત્રોને', kn: 'ನಿಮ್ಮ ಹೆಸರಿನೊಂದಿಗೆ, ಕುಟುಂಬ ಮತ್ತು ಸ್ನೇಹಿತರಿಗೆ' });
  // Cache only: Daily Bhakti never downloads a master for this decoration.
  const request = deity ? suvicharArtRequest(deity.id, 'mandir-jharokha') : null;
  const [art, setArt] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    setArt(null);
    if (request) void peekBackgroundAsset(request).then(uri => { if (active) setArt(uri); });
    return () => { active = false; };
  }, [request?.remoteUrl]); // eslint-disable-line react-hooks/exhaustive-deps
  return <Pressable testID="open-suvichar" accessibilityRole="button" accessibilityLabel={`${title}. ${detail}`} onPress={onPress}
    style={({ pressed }) => [{ width: '100%', maxWidth: 540, minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: spacing.md,
      paddingVertical: spacing.md, paddingLeft: spacing.lg, paddingRight: spacing.md, marginBottom: spacing.md, borderRadius: radii.md,
      borderWidth: 1, borderColor: colors.cardActiveBorder, backgroundColor: colors.cardActiveFrom,
      shadowColor: colors.saffronDeep, shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
      ...androidBoxShadow(2, 8, 'rgba(138, 62, 11, 0.08)') }, pressed && { opacity: 0.85 }]}>
    <View accessible={false} importantForAccessibility="no-hide-descendants" style={{ width: 46, height: 60, borderRadius: 6, borderWidth: 1,
      borderColor: colors.gold, backgroundColor: colors.parchmentSoft, overflow: 'hidden', transform: [{ rotate: '-4deg' }] }}>
      {art ? <Image testID="open-suvichar-art" source={{ uri: art }} resizeMode="cover" style={{ width: '100%', height: '100%' }} onError={() => setArt(null)} /> : <>
        <View style={{ height: 32, backgroundColor: colors.cardThumbActiveTo, alignItems: 'center', justifyContent: 'center' }}>
          <Text allowFontScaling={false} style={{ fontFamily: fontFamilies.devanagariBold, fontSize: 16, lineHeight: 24, color: colors.saffronDeep }}>ॐ</Text>
        </View>
        <View style={{ padding: 5, gap: 3 }}>
          <View style={{ height: 3, borderRadius: 2, backgroundColor: colors.gold }} />
          <View style={{ height: 3, width: '70%', borderRadius: 2, backgroundColor: colors.gold }} />
          <View style={{ height: 3, width: '50%', marginTop: 2, alignSelf: 'flex-end', borderRadius: 2, backgroundColor: colors.saffronDeep }} />
        </View>
      </>}
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
