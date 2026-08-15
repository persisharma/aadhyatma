import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { useGitaLanguage } from '@/data/gita/language';
import { pitruPakshaObservanceForDate, type PitruPakshaDayObservance } from '@/panchang/pitruSmaran';
import { useTheme } from '@/theme/ThemeContext';
import { contentByLang } from '@/utils/localize';
import { scriptBodyFont } from '@/utils/langType';
import { moreTabTarget } from '@/navigation/entryRoutes';
import type { TabParamList } from '@/navigation/types';

/** Public, seasonal counterpart to the private family chip. */
export default function PitruPakshaDayChip({ date }: { date: Date }) {
  const { colors, typography, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const navigation = useNavigation<NavigationProp<TabParamList>>();
  const dateMs = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const [observance, setObservance] = React.useState<PitruPakshaDayObservance | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    const handle = setTimeout(() => {
      let result: PitruPakshaDayObservance | null = null;
      try { result = pitruPakshaObservanceForDate(new Date(dateMs)); } catch { result = null; }
      if (!cancelled) setObservance(result);
    }, 0);
    return () => { cancelled = true; clearTimeout(handle); };
  }, [dateMs]);

  if (!observance) return null;
  return (
    <Pressable
      onPress={() => navigation.navigate('MoreTab', moreTabTarget('PitruPakshaOverview'))}
      accessibilityRole="button"
      accessibilityLabel={observance.labelEn}
      style={({ pressed }) => [
        styles.chip,
        { backgroundColor: colors.saffronTint, borderColor: colors.cardActiveBorder, borderRadius: radii.pill },
        pressed && { opacity: 0.7 },
      ]}
    >
      <Text style={{ fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 12, color: colors.saffronDeep }}>
        {contentByLang(lang, observance.labelHi, observance.labelEn)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { alignSelf: 'flex-start', borderWidth: 1, minHeight: 32, paddingHorizontal: 12, justifyContent: 'center', marginTop: 8 },
});
