import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, type NavigationProp } from '@react-navigation/native';

import { useGitaLanguage } from '@/data/gita/language';
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
export default function PitruSmaranDayChip({ date }: { date: Date }) {
  const { colors, typography, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const navigation = useNavigation<NavigationProp<TabParamList>>();
  const matches = usePitruSmaranForDate(date);

  if (matches.length === 0) return null;

  return (
    <View style={styles.row}>
      {matches.map((entry) => (
        <Pressable
          key={entry.id}
          onPress={() =>
            navigation.navigate('MoreTab', {
              screen: 'PitruSmaranDetail',
              params: { entryId: entry.id },
            })
          }
          accessibilityRole="button"
          accessibilityLabel={`Smaran, ${entryDisplayName(entry, 'en')}`}
          style={({ pressed }) => [
            styles.chip,
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
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  chip: {
    borderWidth: 1,
    paddingHorizontal: 12,
    minHeight: 32,
    justifyContent: 'center',
  },
});
