import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import type { Lang } from '@/data/gita/language';
import type { ResolvedObservance } from '@/panchang/types';
import { sankashtiOccurrenceName } from '@/panchang/sankashtiNames';
import { contentByLang } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';
import AppIcon from './AppIcon';
import StoryIcon from './StoryIcon';
import PanchangDaySurface from './PanchangDaySurface';

/** Next civil day's observances; the selected day remains in the top ribbon. */
export default function PanchangNextDayCard({ items, lang, isToday, onOpen }: {
  items: ResolvedObservance[];
  lang: Lang;
  isToday: boolean;
  onOpen: (ruleId: string) => void;
}) {
  const { colors, typography } = useTheme();
  if (items.length === 0) return null;
  const titleFont = scriptTitleFont(lang, typography.readerTitle.fontFamily);
  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);
  const dayLabel = contentByLang(lang, isToday ? 'कल' : 'अगले दिन', isToday ? 'Tomorrow' : 'Next day');
  return (
    <PanchangDaySurface testID="panchang-next-day-card" style={styles.card}>
      {items.map((item, index) => {
        let nameHi = item.rule.nameHi;
        let nameEn = item.rule.nameEn;
        if (item.rule.id === 'sankashti-chaturthi-vrat') {
          try {
            const name = sankashtiOccurrenceName(item.date);
            nameHi = `${name.nameHi}${name.isAngarki ? ' (अंगारकी)' : ''} व्रत`;
            nameEn = `${name.nameEn}${name.isAngarki ? ' (Angarki)' : ''} Vrat`;
          } catch {
            // The rule name remains usable if an occurrence cannot be resolved.
          }
        }
        return (
          <Pressable
            key={`${item.rule.id}-${item.date.getTime()}`}
            testID={`panchang-next-day-${item.rule.id}`}
            accessibilityRole="button"
            accessibilityLabel={`${isToday ? 'Tomorrow' : 'Next day'}, ${nameEn}. Opens details.`}
            onPress={() => onOpen(item.rule.id)}
            style={({ pressed }) => [styles.row, index > 0 && { borderTopWidth: 1, borderTopColor: colors.panchangTileBorder }, pressed && { opacity: 0.8 }]}
          >
            <StoryIcon name="vrat" size={42} />
            <View style={styles.copy}>
              <Text style={[styles.pill, { fontFamily: bodyFont, backgroundColor: colors.goldChipBg, color: colors.saffronDeep }]}>{dayLabel}</Text>
              <Text style={{ fontFamily: titleFont, fontSize: 15, color: colors.ink }}>{contentByLang(lang, nameHi, nameEn)}</Text>
              <Text style={{ fontFamily: bodyFont, fontSize: 12, color: colors.inkMuted }}>{contentByLang(lang, item.rule.deityHi, item.rule.deityEn)}</Text>
            </View>
            <AppIcon name="next" size={18} color={colors.saffronDeep} />
          </Pressable>
        );
      })}
    </PanchangDaySurface>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 12, paddingHorizontal: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 48, paddingVertical: 10 },
  copy: { flex: 1, minWidth: 0, gap: 2 },
  pill: { alignSelf: 'flex-start', fontSize: 11, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, overflow: 'hidden' },
});
