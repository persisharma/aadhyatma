import React, { useRef, useState } from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { useFontScale } from '@/contexts/FontScaleContext';
import { fontFamilies } from '@/theme/typography';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';
import { contentByLang, pick } from '@/utils/localize';
import { compactOccasionRange, occasionRange } from '@/panchang/occasionTimingFormat';
import type { OccasionTiming } from '@/panchang/occasionTimings';
import FestiveCorners from './FestiveCorners';
import FestivalMotif from './FestivalMotif';

/** One light, bundled-art summary. No hero renderer, remote art or share provider.
 * Every calculated window stays visible; guidance-only entries live in Vrat. */
export default function CompactOccasionCard({ items, date, error = false, onRetry, onOpenVrat }: {
  items: readonly OccasionTiming[]; date: Date; error?: boolean;
  onRetry?: () => void; onOpenVrat: () => void;
}) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const { factor } = useFontScale();
  const { width, fontScale = 1 } = useWindowDimensions();
  const [contentWidth, setContentWidth] = useState(0);
  const measuredWidth = useRef(0);
  const title = scriptTitleFont(lang, typography.readerTitle.fontFamily);
  const body = scriptBodyFont(lang, typography.meaning.fontFamily);
  const timedItems = items.filter(item => item.windows.length > 0);
  if (!items.length && !error) return null;
  const stack = contentWidth < 280 || factor > 1 || fontScale > 1.1;
  const endpointMin = Math.min(contentWidth || width, 55 * factor * fontScale);
  return <LinearGradient testID="compact-occasion-card" colors={[colors.brandIvory, colors.parchmentGradientEnd]}
    onLayout={event => {
      const next = Math.max(0, event.nativeEvent.layout.width - 30.4);
      if (Math.abs(measuredWidth.current - next) > 0.5) {
        measuredWidth.current = next;
        setContentWidth(next);
      }
    }}
    style={{ marginTop: 10, padding: 14, paddingTop: 16, borderRadius: 18, borderWidth: 1.2, borderColor: colors.gold }}>
    <FestiveCorners size={42} />
    <View style={{ paddingHorizontal: 28, paddingBottom: 6 }}>
      <Text accessibilityRole="header" style={{ fontFamily: title, fontSize: 17 * factor, lineHeight: 29 * factor, textAlign: 'center', color: colors.festivalInk }}>
        {pick(lang, { hi: 'पर्व के शुभ मुहूर्त', en: 'Occasion muhurats', gu: 'પર્વના શુભ મુહૂર્ત', kn: 'ಹಬ್ಬದ ಶುಭ ಮುಹೂರ್ತಗಳು' })}
      </Text>
    </View>
    {error && <Pressable testID="compact-occasion-retry" accessibilityRole="button" onPress={onRetry} style={{ minHeight: 44, justifyContent: 'center' }}>
      <Text style={{ fontFamily: body, fontSize: 13 * factor, lineHeight: 22 * factor, color: colors.saffronDeep }}>{pick(lang, { hi: 'समय प्राप्त नहीं हुआ · फिर प्रयास करें', en: 'Timings unavailable · Retry', gu: 'સમય મળ્યો નથી · ફરી પ્રયાસ કરો', kn: 'ಸಮಯ ಲಭ್ಯವಿಲ್ಲ · ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ' })}</Text>
    </Pressable>}
    {timedItems.map(item => <View key={`${item.id}:${+item.date}`} testID={`compact-occasion-group-${item.id}`}
      style={{ borderTopWidth: 1, borderTopColor: colors.goldChipBg, paddingVertical: 8, gap: 4 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <FestivalMotif motif={item.motif} size={28} />
        <Text accessibilityRole="header" style={{ flex: 1, minWidth: 0, fontFamily: title, fontSize: 14 * factor, lineHeight: 24 * factor, color: colors.festivalInk }}>{contentByLang(lang, item.nameHi, item.nameEn)}</Text>
      </View>
      {item.windows.map((window, index) => {
        const parts = compactOccasionRange(window, date, lang);
        return <View key={index} testID={`compact-occasion-window-${item.id}-${index}`}>
          <View testID="compact-occasion-row-layout" style={{ flexDirection: stack ? 'column' : 'row', alignItems: 'flex-start', gap: 4 }}>
            <Text style={{ flex: stack ? undefined : 1, minWidth: 0, fontFamily: body, fontSize: 11 * factor, lineHeight: 19 * factor, color: colors.inkMuted }}>{contentByLang(lang, window.labelHi, window.labelEn)}</Text>
            <View testID="compact-occasion-time" accessible accessibilityLabel={occasionRange(window, date, lang)}
              style={{ width: stack ? '100%' : 132, maxWidth: '100%', flexShrink: 0, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: stack ? 'flex-start' : 'flex-end', columnGap: 4, rowGap: 2 }}>
              <View style={{ minWidth: endpointMin, maxWidth: '43%' }}>
                <Text testID="compact-occasion-clock" style={{ fontFamily: fontFamilies.interSemiBold, fontSize: 18 * factor, lineHeight: 26 * factor, color: colors.festivalInk }}>{parts.start}</Text>
                {parts.startDate && <Text testID="compact-occasion-date" style={{ fontFamily: body, fontSize: 11 * factor, lineHeight: 19 * factor, color: colors.inkMuted }}>{parts.startDate}</Text>}
              </View>
              {parts.end && <>
                <Text accessible={false} style={{ fontFamily: fontFamilies.interSemiBold, fontSize: 18 * factor, lineHeight: 26 * factor, color: colors.festivalInk }}>–</Text>
                <View style={{ minWidth: endpointMin, maxWidth: '43%' }}>
                  <Text testID="compact-occasion-clock" style={{ fontFamily: fontFamilies.interSemiBold, fontSize: 18 * factor, lineHeight: 26 * factor, color: colors.festivalInk }}>{parts.end}</Text>
                  {parts.endDate && <Text testID="compact-occasion-date" style={{ fontFamily: body, fontSize: 11 * factor, lineHeight: 19 * factor, color: colors.inkMuted }}>{parts.endDate}</Text>}
                </View>
              </>}
            </View>
          </View>
        </View>;
      })}
    </View>)}
    {!timedItems.length && !error && <Text style={{ fontFamily: body, fontSize: 13 * factor, lineHeight: 22 * factor, color: colors.inkMuted, paddingVertical: 10 }}>
      {pick(lang, { hi: 'इस दिन के पर्व व परंपराएँ व्रत में देखें।', en: 'See this day’s observances and traditions in Vrat.', gu: 'આ દિવસનાં પર્વ અને પરંપરાઓ વ્રતમાં જુઓ.', kn: 'ಈ ದಿನದ ಆಚರಣೆಗಳು ಮತ್ತು ಸಂಪ್ರದಾಯಗಳನ್ನು ವ್ರತದಲ್ಲಿ ನೋಡಿ.' })}
    </Text>}
    <Pressable testID="compact-occasion-open-vrat" accessibilityRole="button" onPress={onOpenVrat}
      style={{ marginTop: 3, minHeight: 44, padding: 12, borderRadius: 10, backgroundColor: colors.goldTint, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Text style={{ flex: 1, fontFamily: title, fontSize: 13 * factor, lineHeight: 22 * factor, color: colors.saffronDeep }}>{pick(lang, { hi: 'व्रत व पर्व में पूरे कार्ड देखें', en: 'View full cards in Vrat', gu: 'વ્રત અને પર્વમાં સંપૂર્ણ કાર્ડ જુઓ', kn: 'ವ್ರತದಲ್ಲಿ ಪೂರ್ಣ ಕಾರ್ಡ್‌ಗಳನ್ನು ನೋಡಿ' })}</Text>
      <Text accessible={false} style={{ fontSize: 20, color: colors.saffronDeep }}>›</Text>
    </Pressable>
  </LinearGradient>;
}
