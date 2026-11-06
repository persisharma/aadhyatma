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
import OccasionHeroArtwork from './OccasionHeroArtwork';

/** One occasion per festive hero. Live type and complete dated windows grow
 * naturally; the four Shivaratri prahars are never squeezed or truncated. */
export default function OccasionShareCard({ items, date, dated = true, placeHi, placeEn, lang, onReady }: {
  onReady?: (ready: boolean) => void; items: readonly OccasionTiming[]; date: Date; dated?: boolean;
  placeHi: string; placeEn: string; lang: Lang;
}) {
  // A late load from an earlier preview must not release a changed card.
  const identity = `${lang}:${+date}:${dated}:${placeHi}:${placeEn}:${items.map(i => `${i.id}:${+i.date}`).join('|')}`;
  return <Hero key={identity} {...{ items, date, dated, placeHi, placeEn, lang, onReady }} />;
}
function Hero({ items, date, dated, placeHi, placeEn, lang, onReady }: {
  items: readonly OccasionTiming[]; date: Date; dated: boolean; placeHi: string; placeEn: string; lang: Lang; onReady?: (ready: boolean) => void;
}) {
  const [painted, setPainted] = useState<ReadonlySet<string>>(new Set());
  const mark = useCallback((slot: string, ready = true) => setPainted(old => {
    if (old.has(slot) === ready) return old;
    const next = new Set(old); if (ready) next.add(slot); else next.delete(slot); return next;
  }), []);
  const ready = items.length > 0 && ['left', 'right', ...items.map((_, i) => `hero-${i}`)].every(slot => painted.has(slot));
  useEffect(() => { onReady?.(ready); }, [onReady, ready]);
  const { colors, typography } = useTheme();
  const body = scriptBodyFont(lang, typography.meaning.fontFamily), title = scriptTitleFont(lang, typography.readerTitle.fontFamily);
  const hasClocks = items.some(i => i.windows.length > 0);
  return <LinearGradient testID="occasion-share-export" colors={[colors.brandIvory, colors.parchmentGradientEnd]} style={{ width: 540, minHeight: 675, padding: 24, paddingTop: 32, gap: 14, borderWidth: 2, borderColor: colors.gold }}>
    <FestiveCorners size={100} onLoad={mark} />
    <View style={{ alignItems: 'center', gap: 10 }}>
      <VedanshWordmark lang={lang} compact showTagline={false} fixedExport />
      {dated && <Text allowFontScaling={false} style={{ fontFamily: body, fontSize: 16, color: colors.inkMuted }}>{date.getDate()}/{date.getMonth() + 1}/{date.getFullYear()} · {contentByLang(lang, placeHi, placeEn)}</Text>}
    </View>
    {items.map((item, index) => <View key={`${item.id}:${+item.date}`} style={{ gap: 12, alignItems: 'center' }}>
      <Text allowFontScaling={false} style={{ fontFamily: title, fontSize: 32, lineHeight: 48, textAlign: 'center', color: colors.festivalInk }}>{contentByLang(lang, item.nameHi, item.nameEn)}</Text>
      <OccasionHeroArtwork item={item} width={488} height={300} onPaint={ready => mark(`hero-${index}`, ready)} />
      {item.windows.map((w, i) => <View key={i} style={{ alignSelf: 'stretch', alignItems: 'center', gap: 5, paddingVertical: 12, paddingHorizontal: 10, borderRadius: 16, borderWidth: 1, borderColor: colors.gold, backgroundColor: colors.parchmentSoft }}>
        <Text allowFontScaling={false} style={{ fontFamily: body, fontSize: 17, lineHeight: 27, textAlign: 'center', color: colors.inkSoft }}>{contentByLang(lang, w.labelHi, w.labelEn)}</Text>
        <Text allowFontScaling={false} style={{ fontFamily: body, fontSize: item.windows.length === 1 ? 34 : 27, lineHeight: item.windows.length === 1 ? 49 : 41, textAlign: 'center', color: colors.festivalInk }}>{occasionRange(w, date, lang)}</Text>
      </View>)}
      {!!item.noteHi && <Text allowFontScaling={false} style={{ fontFamily: body, fontSize: 16, lineHeight: 27, textAlign: 'center', color: colors.inkMuted }}>{contentByLang(lang, item.noteHi, item.noteEn ?? '')}</Text>}
    </View>)}
    <View style={{ flex: 1, minHeight: 4 }} />
    {hasClocks && <Text allowFontScaling={false} style={{ fontFamily: body, fontSize: 14, lineHeight: 23, textAlign: 'center', color: colors.inkMuted }}>{contentByLang(lang, 'समय चुने हुए स्थान के अनुसार है।', 'Timings are for the selected location.')}</Text>}
    <Text allowFontScaling={false} style={{ fontFamily: body, fontSize: 18, textAlign: 'center', color: colors.saffronDeep }}>{SMART_LINK.replace(/^https:\/\//, '')}</Text>
  </LinearGradient>;
}
