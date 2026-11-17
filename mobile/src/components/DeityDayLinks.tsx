import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/navigation/types';
import { useTodayKey } from '@/utils/useTodayKey';
import { deityDayEntries, weekdayReadingDeities } from '@/data/deityDayLinks';
import { getDeityMeta } from '@/data/deities';
import { categories } from '@/data/categories';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { useTheme } from '@/theme/ThemeContext';
import { scriptBodyFont } from '@/utils/langType';
import { navigateToEntryStart } from '@/navigation/entryRoutes';

export default function DeityDayLinks() {
  const todayKey = useTodayKey();
  const day = new Date(todayKey).getDay();
  const entries = React.useMemo(() => deityDayEntries(day), [day]);
  const deity = getDeityMeta(weekdayReadingDeities[day]);
  const { lang } = useGitaLanguage();
  const { colors, typography } = useTheme();
  const nav = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const fontFamily = scriptBodyFont(lang, typography.meaning.fontFamily);
  if (!deity || !entries.length) return null;
  const button = { minHeight: 44, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: colors.divider, borderRadius: 18, backgroundColor: colors.parchmentSoft };
  return <View testID="deity-day-links" style={{ gap: 10, paddingVertical: 12 }}>
    <Text accessibilityRole="header" style={{ fontFamily, fontSize: 17, lineHeight: 27, color: colors.ink }}>{contentByLang(lang, `आज का स्मरण · ${deity.nameHi}`, `Today's devotion · ${deity.nameEn}`)}</Text>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {entries.map((entry) => {
        const category = categories.find((item) => item.id === entry.category)!;
        return <Pressable key={entry.id} accessibilityRole="button" accessibilityLabel={contentByLang(lang, entry.nameHi, entry.nameEn)} onPress={() => navigateToEntryStart(nav, entry)} style={button}>
          <Text style={{ fontFamily, fontSize: 14, lineHeight: 23, color: colors.ink }}>{contentByLang(lang, category.nameHi, category.nameEn)}</Text>
        </Pressable>;
      })}
      <Pressable accessibilityRole="button" onPress={() => nav.navigate('VratKathaReader', { kathaId: 'weekday-vrat-katha' })} style={button}>
        <Text style={{ fontFamily, fontSize: 14, lineHeight: 23, color: colors.ink }}>{contentByLang(lang, 'वार-व्रत परिचय', 'Weekday vrat guide')}</Text>
      </Pressable>
    </View>
  </View>;
}
