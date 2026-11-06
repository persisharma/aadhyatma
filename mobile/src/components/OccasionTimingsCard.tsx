import FestiveCorners from './FestiveCorners';
import { useShare } from '@/utils/shareVerse';
import ObservanceArtwork from './ObservanceArtwork';
import { OBSERVANCE_RULES } from '@/panchang/festivals';
import { occasionShareText } from '@/panchang/occasionTimingFormat';
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang, pick } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';
import { occasionRange } from '@/panchang/occasionTimingFormat';
import type { OccasionTiming } from '@/panchang/occasionTimings';
import FestivalMotif from './FestivalMotif';
import { useFontScale } from '@/contexts/FontScaleContext';

export default function OccasionTimingsCard({ items, date, dated = true, place, placeEn = place, error = false, onRetry }: { items: readonly OccasionTiming[]; date: Date; dated?: boolean; place: string; placeEn?: string; error?: boolean; onRetry?: () => void }) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const { share, busy } = useShare();
  const { factor } = useFontScale();
  const body = scriptBodyFont(lang, typography.meaning.fontFamily), title = scriptTitleFont(lang, typography.readerTitle.fontFamily);
  if (!items.length && !error) return null;
  return <LinearGradient testID="occasion-timings-card" colors={[colors.brandIvory, colors.parchmentGradientEnd]} style={{ marginTop: 10, padding: 16, paddingTop: 28, borderWidth: 1.2, borderColor: colors.gold, borderRadius: 18, gap: 12 }}>
    <FestiveCorners size={80} />
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><View style={{ height: 1, flex: 1, backgroundColor: colors.goldChipBg }} /><Text accessibilityRole="header" style={{ fontFamily: title, fontSize: 17, flexShrink: 1, textAlign: 'center', color: colors.saffronDeep }}>{pick(lang, { hi: 'पर्व व व्रत', en: 'Festivals & vrats', gu: 'પર્વ અને વ્રત', kn: 'ಹಬ್ಬ ಮತ್ತು ವ್ರತ' })}</Text><View style={{ height: 1, flex: 1, backgroundColor: colors.goldChipBg }} /></View>
    <Text style={{ fontFamily: body, fontSize: 13, textAlign: 'center', color: colors.inkMuted }}>{contentByLang(lang, place, placeEn)}</Text>
    {error && <Pressable accessibilityRole="button" onPress={onRetry} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={{ fontFamily: body, color: colors.saffronDeep }}>{pick(lang, { hi: 'समय प्राप्त नहीं हुआ · फिर प्रयास करें', en: 'Timings unavailable · Retry', gu: 'સમય મળ્યો નથી · ફરી પ્રયાસ કરો', kn: 'ಸಮಯ ಲಭ್ಯವಿಲ್ಲ · ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ' })}</Text></Pressable>}
    {items.map((item, index) => <View key={`${item.id}:${+item.date}`} style={{ gap: 8, borderTopWidth: 1, borderTopColor: colors.divider, paddingTop: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>{item.id.endsWith('-holika') || item.id.endsWith('-vijaya') ? <FestivalMotif motif={item.motif} /> : <ObservanceArtwork size={58} rule={OBSERVANCE_RULES.find(r => r.id === item.ruleId)!} />}<Text style={{ flex: 1, fontFamily: title, fontSize: 20, color: colors.festivalInk }}>{contentByLang(lang, item.nameHi, item.nameEn)}</Text></View>
      {item.windows.map((w, i) => <View key={i} style={{ padding: 10, borderRadius: 10, borderWidth: 1, borderColor: colors.goldChipBg, backgroundColor: colors.parchmentSoft, gap: 4 }}><Text style={{ fontFamily: body, fontSize: 13, color: colors.inkSoft }}>{contentByLang(lang, w.labelHi, w.labelEn)}</Text><Text style={{ fontFamily: body, fontSize: Math.round(21 * factor), color: colors.festivalInk }}>{occasionRange(w, date, lang)}</Text></View>)}
      {item.noteHi && <Text style={{ fontFamily: body, fontSize: Math.round(13 * factor), lineHeight: Math.round(23 * factor), color: colors.inkMuted }}>{contentByLang(lang, item.noteHi, item.noteEn ?? '')}</Text>}
    <Pressable testID={index === 0 ? "occasion-share" : `occasion-share-${item.id}`} accessibilityLabel={contentByLang(lang, `${item.nameHi} साझा करें`, `Share ${item.nameEn}`)} accessibilityRole="button" disabled={busy} style={{ minHeight: 44, justifyContent: 'center', alignItems: 'center', borderRadius: 12, backgroundColor: colors.saffronTint }} onPress={() => { void share({ kind: 'card', sourceId: 'panchang.occasion', width: 540, branded: true, awaitsArt: true, languages: true, tagNameHi: 'पर्व व व्रत', tagNameEn: 'Festival & vrat', caption: exportLang => ({ sectionName: contentByLang(exportLang, item.nameHi, item.nameEn), label: contentByLang(exportLang, place, placeEn), firstLine: '' }), title: { hi: 'कार्ड साझा करें', en: 'Share occasion card', gu: 'કાર્ડ શેર કરો', kn: 'ಕಾರ್ಡ್ ಹಂಚಿ' }, render: ({ lang: exportLang, onReady }) => { const OccasionShareCard = require('./OccasionShareCard').default as typeof import('./OccasionShareCard').default; return <OccasionShareCard onReady={onReady} items={[item]} dated={dated} date={date} placeHi={place} placeEn={placeEn} lang={exportLang} />; }, text: exportLang => `${contentByLang(exportLang, place, placeEn)}\n${occasionShareText([item], date, exportLang)}` }, lang); }}><Text style={{ fontFamily: title, fontSize: 14, color: colors.saffronDeep }}>{pick(lang, { hi: 'कार्ड साझा करें', en: 'Share occasion card', gu: 'કાર્ડ શેર કરો', kn: 'ಕಾರ್ಡ್ ಹಂಚಿ' })}</Text></Pressable>
    </View>)}

  </LinearGradient>;
}
