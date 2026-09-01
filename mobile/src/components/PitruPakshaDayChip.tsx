import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { useGitaLanguage } from '@/data/gita/language';
import { pitruPakshaObservanceForDate, type PitruPakshaDayObservance } from '@/panchang/pitruSmaran';
import { useTheme } from '@/theme/ThemeContext';
import { contentByLang } from '@/utils/localize';
import { scriptBodyFont } from '@/utils/langType';
import { moreTabTarget } from '@/navigation/entryRoutes';
import type { TabParamList } from '@/navigation/types';
import { getVidhiById } from '@/data/vidhi';

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
  const shraddhaVidhi = observance.isSarvapitri
    ? getVidhiById('shraddha-tarpan-vidhi')
    : null;
  return (
    <View style={styles.row}>
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
      {shraddhaVidhi && (
        <Pressable
          onPress={() => navigation.navigate('MoreTab', moreTabTarget('VidhiDetail', {
            vidhiId: shraddhaVidhi.id,
            dateMs,
          }))}
          testID="sarvapitri-vidhi-door"
          accessibilityRole="button"
          accessibilityLabel="Open Tila-Tarpana remembrance guide"
          style={({ pressed }) => [
            styles.chip,
            { backgroundColor: colors.goldTint, borderColor: colors.gold, borderRadius: radii.pill },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={{ fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 12, color: colors.inkSoft }}>
            ॥ {contentByLang(lang, 'तिल-तर्पण विधि', 'Tila-Tarpana guide')}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  chip: { alignSelf: 'flex-start', borderWidth: 1, minHeight: 32, paddingHorizontal: 12, justifyContent: 'center' },
});
