import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, type NavigationProp } from '@react-navigation/native';

import { useGitaLanguage } from '@/data/gita/language';
import { useTilePress } from '@/contexts/TilePressContext';
import { usePitruSmaranForDate } from '@/panchang/usePitruSmaranForDate';
import { entryDisplayName } from '@/panchang/pitruSmaranDisplay';
import { useTheme } from '@/theme/ThemeContext';
import { contentByLang } from '@/utils/localize';
import { scriptBodyFont } from '@/utils/langType';
import type { TabParamList } from '@/navigation/types';

/**
 * The private "॥ स्मरण — <relation>" chip on the Panchang day panel (PRD-17 §3.5).
 * Renders only on a saved observance date, only on this device, and only in the
 * muted register — goldTint fill, ink-soft text, NEVER the festive saffron style.
 * Tap → the person's detail in the More stack. This component plus its hook is
 * the entire Panchang integration; the day panel is otherwise unchanged.
 */
export default function PitruSmaranDayChip({ date, compact = false }: { date: Date; compact?: boolean }) {
  const { colors, typography, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const navigation = useNavigation<NavigationProp<TabParamList>>();
  const { beginTilePress, finishTilePress, activateTile } = useTilePress();
  const matches = usePitruSmaranForDate(date);

  if (matches.length === 0) return null;

  return (
    <View style={[styles.row, compact && styles.compactRow]}>
      {matches.map((entry) => {
        const openDetail = () =>
            navigation.navigate('MoreTab', {
              screen: 'PitruSmaranDetail',
              params: { entryId: entry.id },
            });
        return (
        <Pressable
          key={entry.id}
          onPress={() => activateTile(openDetail)}
          onPressIn={() => beginTilePress(openDetail)}
          onPressOut={finishTilePress}
          accessibilityRole="button"
          accessibilityLabel={`Smaran, ${entryDisplayName(entry, 'en')}`}
          style={({ pressed }) => [
            styles.chip,
            compact && styles.compactChip,
            {
              backgroundColor: colors.goldTint,
              borderColor: colors.gold,
              borderRadius: radii.pill,
            },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text
            style={{
              fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
              fontSize: 12,
              color: colors.inkSoft,
            }}
            numberOfLines={1}
          >
            ॥ {contentByLang(lang, 'स्मरण', 'Smaran')} — {entryDisplayName(entry, lang)}
          </Text>
        </Pressable>
      );})}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  compactRow: { flexWrap: 'nowrap', marginTop: 0, gap: 6 },
  chip: {
    borderWidth: 1,
    paddingHorizontal: 12,
    minHeight: 32,
    justifyContent: 'center',
  },
  compactChip: { minHeight: 24, paddingHorizontal: 10 },
});
