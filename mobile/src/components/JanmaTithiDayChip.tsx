import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, type NavigationProp } from '@react-navigation/native';

import { useGitaLanguage } from '@/data/gita/language';
import { useTilePress } from '@/contexts/TilePressContext';
import { useJanmaTithiForDate } from '@/panchang/useJanmaTithi';
import { personLabel } from '@/components/PersonChips';
import { useTheme } from '@/theme/ThemeContext';
import { contentByLang } from '@/utils/localize';
import { scriptBodyFont } from '@/utils/langType';
import { moreTabTarget } from '@/navigation/entryRoutes';
import type { TabParamList } from '@/navigation/types';

/**
 * The private "✦ जन्म तिथि — <label>" chip (PRD-29 §3.4) — the living sibling of
 * `PitruSmaranDayChip`, same muted-gold register, NEVER the festive saffron
 * style: the day is devotional, not social. Renders only on a matching day,
 * only on this device. Tap → that person's जन्म तिथि detail in the More stack.
 */
export default function JanmaTithiDayChip({ date, compact = false }: { date: Date; compact?: boolean }) {
  const { colors, typography, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const navigation = useNavigation<NavigationProp<TabParamList>>();
  const { beginTilePress, finishTilePress, activateTile } = useTilePress();
  const matches = useJanmaTithiForDate(date);

  if (matches.length === 0) return null;

  return (
    <View style={[styles.row, compact && styles.compactRow]}>
      {matches.map(({ person }) => {
        const openDetail = () =>
          navigation.navigate('MoreTab', moreTabTarget('JanmaTithiDetail', { personId: person.id }));
        return (
          <Pressable
            key={person.id}
            onPress={() => activateTile(openDetail)}
            onPressIn={() => beginTilePress(openDetail)}
            onPressOut={finishTilePress}
            accessibilityRole="button"
            accessibilityLabel={`Janma tithi, ${personLabel(person)}`}
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
              ✦ {contentByLang(lang, 'जन्म तिथि', 'Janma Tithi')} — {personLabel(person)}
            </Text>
          </Pressable>
        );
      })}
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
