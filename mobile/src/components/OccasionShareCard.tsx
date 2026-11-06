import React, { useCallback, useEffect, useState } from 'react';
import FestiveCorners from './FestiveCorners';
import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Lang } from '@/data/gita/language';
import type { OccasionTiming } from '@/panchang/occasionTimings';
import { occasionRange } from '@/panchang/occasionTimingFormat';
import { contentByLang } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';
import { useTheme } from '@/theme/ThemeContext';
import { SMART_LINK } from '@/data/shareLinks';
import VedanshWordmark from './VedanshWordmark';
import FestivalMotif from './FestivalMotif';

/** Focused occasion export grows with every ritual window; it never truncates
 * the four Shivaratri prahars or a next-day date to fit a fixed-height poster. */
export default function OccasionShareCard({ items, date, placeHi, placeEn, lang, onReady }: { onReady?: (ready: boolean) => void; items: readonly OccasionTiming[]; date: Date; placeHi: string; placeEn: string; lang: Lang }) {
  const [painted, setPainted] = useState<ReadonlySet<string>>(new Set());
  const onPaint = useCallback((slot: string) => setPainted(old => old.has(slot) ? old : new Set([...old, slot])), []);
  const ready = ['left', 'right', ...items.map((_, i) => `motif-${i}`)].every(slot => painted.has(slot));
  useEffect(() => { onReady?.(ready); }, [onReady, ready]);
  const { colors, typography } = useTheme();
  const body = scriptBodyFont(lang, typography.meaning.fontFamily), title = scriptTitleFont(lang, typography.readerTitle.fontFamily);
  return <LinearGradient testID="occasion-share-export" colors={[colors.brandIvory, colors.parchmentGradientEnd]} style={{ width: 540, minHeight: 675, padding: 24, paddingTop: 40, gap: 16, borderWidth: 2, borderColor: colors.gold }}>
    <FestiveCorners size={112} onLoad={onPaint} />
    <View style={{ alignItems: 'center', gap: 12 }}><VedanshWordmark lang={lang} compact showTagline={false} fixedExport /><Text allowFontScaling={false} style={{ fontFamily: body, fontSize: 18, color: colors.inkMuted }}>{date.getDate()}/{date.getMonth() + 1}/{date.getFullYear()} · {contentByLang(lang, placeHi, placeEn)}</Text></View>
    {items.map((item, itemIndex) => <View key={`${item.id}:${+item.date}`} style={{ gap: 12, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.goldChipBg }}>
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}><FestivalMotif motif={item.motif} size={72} onLoad={() => onPaint(`motif-${itemIndex}`)} /><Text allowFontScaling={false} style={{ flex: 1, fontFamily: title, fontSize: 25, color: colors.festivalInk }}>{contentByLang(lang, item.nameHi, item.nameEn)}</Text></View>
      {item.windows.map((w, i) => <View key={i} style={{ gap: 5 }}><Text allowFontScaling={false} style={{ fontFamily: body, fontSize: 16, color: colors.inkSoft }}>{contentByLang(lang, w.labelHi, w.labelEn)}</Text><Text allowFontScaling={false} style={{ fontFamily: body, fontSize: 25, color: colors.festivalInk }}>{occasionRange(w, date, lang)}</Text></View>)}
      {!!item.noteHi && <Text allowFontScaling={false} style={{ fontFamily: body, fontSize: 15, lineHeight: 26, color: colors.inkMuted }}>{contentByLang(lang, item.noteHi, item.noteEn ?? '')}</Text>}
    </View>)}
    <View style={{ flex: 1 }} /><Text allowFontScaling={false} style={{ fontFamily: body, fontSize: 15, textAlign: 'center', color: colors.inkMuted }}>{contentByLang(lang, 'समय चुने हुए स्थान के अनुसार है।', 'Timings are for the selected location.')}</Text><Text allowFontScaling={false} style={{ fontFamily: body, fontSize: 18, textAlign: 'center', color: colors.saffronDeep }}>{SMART_LINK.replace(/^https:\/\//, '')}</Text>
  </LinearGradient>;
}
