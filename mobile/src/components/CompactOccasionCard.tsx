import React from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { useFontScale } from '@/contexts/FontScaleContext';
import { fontFamilies } from '@/theme/typography';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';
import { contentByLang, pick } from '@/utils/localize';
import { occasionRange } from '@/panchang/occasionTimingFormat';
import type { OccasionTiming } from '@/panchang/occasionTimings';
import { isSameLocalDay } from '@/panchang/muhuratFormat';
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
  const title = scriptTitleFont(lang, typography.readerTitle.fontFamily);
  const body = scriptBodyFont(lang, typography.meaning.fontFamily);
  const windows = items.flatMap(item => item.windows.map((window, index) => ({ item, window, index })));
  if (!items.length && !error) return null;
  const stack = width < 380 || factor > 1 || fontScale > 1.1;
  return <LinearGradient testID="compact-occasion-card" colors={[colors.brandIvory, colors.parchmentGradientEnd]}
    style={{ marginTop: 10, padding: 16, paddingTop: 24, borderRadius: 18, borderWidth: 1.2, borderColor: colors.gold }}>
    <FestiveCorners size={54} />
    <View style={{ paddingHorizontal: 28, paddingBottom: 12 }}>
      <Text accessibilityRole="header" style={{ fontFamily: title, fontSize: 19 * factor, lineHeight: 32 * factor, textAlign: 'center', color: colors.festivalInk }}>
        {pick(lang, { hi: 'पर्व के शुभ मुहूर्त', en: 'Occasion muhurats', gu: 'પર્વના શુભ મુહૂર્ત', kn: 'ಹಬ್ಬದ ಶುಭ ಮುಹೂರ್ತಗಳು' })}
      </Text>
      <Text style={{ fontFamily: body, fontSize: 12 * factor, lineHeight: 20 * factor, textAlign: 'center', color: colors.inkMuted }}>
        {pick(lang, { hi: 'सभी पूजा समय एक जगह', en: 'All ritual times together', gu: 'પૂજાના બધા સમય એક જ સ્થળે', kn: 'ಎಲ್ಲ ಪೂಜಾ ಸಮಯಗಳು ಒಂದೇ ಕಡೆ' })}
      </Text>
    </View>
    {error && <Pressable testID="compact-occasion-retry" accessibilityRole="button" onPress={onRetry} style={{ minHeight: 44, justifyContent: 'center' }}>
      <Text style={{ fontFamily: body, fontSize: 13 * factor, lineHeight: 22 * factor, color: colors.saffronDeep }}>{pick(lang, { hi: 'समय प्राप्त नहीं हुआ · फिर प्रयास करें', en: 'Timings unavailable · Retry', gu: 'સમય મળ્યો નથી · ફરી પ્રયાસ કરો', kn: 'ಸಮಯ ಲಭ್ಯವಿಲ್ಲ · ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ' })}</Text>
    </Pressable>}
    {windows.map(({ item, window, index }) => {
      const crossingDate = !isSameLocalDay(window.start, date) || !isSameLocalDay(window.end, date);
      const rowStack = stack || crossingDate;
      return <View key={`${item.id}:${+item.date}:${index}`} testID={`compact-occasion-window-${item.id}-${index}`}
        style={{ borderTopWidth: 1, borderTopColor: colors.goldChipBg, paddingVertical: 12, flexDirection: 'row', gap: 10 }}>
        <FestivalMotif motif={item.motif} size={36} />
        <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
          <View testID="compact-occasion-row-layout" style={{ flexDirection: rowStack ? 'column' : 'row', alignItems: rowStack ? 'flex-start' : 'baseline', gap: 5 }}>
            <Text style={{ flex: rowStack ? undefined : 1, flexShrink: 1, fontFamily: title, fontSize: 15 * factor, lineHeight: 25 * factor, color: colors.festivalInk }}>
              {contentByLang(lang, item.nameHi, item.nameEn)}
            </Text>
            <Text testID="compact-occasion-time" style={{ flexShrink: 1, fontFamily: fontFamilies.latin, fontSize: 25 * factor, lineHeight: 34 * factor, color: colors.festivalInk }}>
              {occasionRange(window, date, lang)}
            </Text>
          </View>
          <Text style={{ fontFamily: body, fontSize: 12 * factor, lineHeight: 20 * factor, color: colors.inkMuted }}>{contentByLang(lang, window.labelHi, window.labelEn)}</Text>
        </View>
      </View>;
    })}
    {!windows.length && !error && <Text style={{ fontFamily: body, fontSize: 13 * factor, lineHeight: 22 * factor, color: colors.inkMuted, paddingVertical: 10 }}>
      {pick(lang, { hi: 'इस दिन के पर्व व परंपराएँ व्रत में देखें।', en: 'See this day’s observances and traditions in Vrat.', gu: 'આ દિવસનાં પર્વ અને પરંપરાઓ વ્રતમાં જુઓ.', kn: 'ಈ ದಿನದ ಆಚರಣೆಗಳು ಮತ್ತು ಸಂಪ್ರದಾಯಗಳನ್ನು ವ್ರತದಲ್ಲಿ ನೋಡಿ.' })}
    </Text>}
    <Pressable testID="compact-occasion-open-vrat" accessibilityRole="button" onPress={onOpenVrat}
      style={{ marginTop: 3, minHeight: 44, padding: 12, borderRadius: 10, backgroundColor: colors.goldTint, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Text style={{ flex: 1, fontFamily: title, fontSize: 13 * factor, lineHeight: 22 * factor, color: colors.saffronDeep }}>{pick(lang, { hi: 'व्रत व पर्व में पूरे कार्ड देखें', en: 'View full cards in Vrat', gu: 'વ્રત અને પર્વમાં સંપૂર્ણ કાર્ડ જુઓ', kn: 'ವ್ರತದಲ್ಲಿ ಪೂರ್ಣ ಕಾರ್ಡ್‌ಗಳನ್ನು ನೋಡಿ' })}</Text>
      <Text accessible={false} style={{ fontSize: 20, color: colors.saffronDeep }}>›</Text>
    </Pressable>
  </LinearGradient>;
}
