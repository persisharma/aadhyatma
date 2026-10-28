import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useVratFollows } from '@/contexts/VratFollowContext';
import type { Lang } from '@/data/gita/language';
import type { ResolvedObservance } from '@/panchang/types';
import { sankashtiOccurrenceName } from '@/panchang/sankashtiNames';
import { contentByLang } from '@/utils/localize';
import ObservancePreviewCard from './ObservancePreviewCard';
import { useVratReminderAction } from './useVratReminderAction';

/** Next civil day's observances; the selected day remains in the top ribbon. */
export default function PanchangNextDayCard({ items, lang, isToday, onOpen }: {
  items: ResolvedObservance[];
  lang: Lang;
  isToday: boolean;
  onOpen: (ruleId: string) => void;
}) {
  const { isFollowing } = useVratFollows();
  const { toggleReminder, reminderSheet, reminderOnFor } = useVratReminderAction();
  if (items.length === 0) return null;
  const dayLabel = contentByLang(lang, isToday ? 'कल' : 'अगले दिन', isToday ? 'Tomorrow' : 'Next day');
  return (
    <View testID="panchang-next-day-card" style={styles.card}>
      {items.map((item) => {
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
          <ObservancePreviewCard
            key={`${item.rule.id}-${item.date.getTime()}`}
            testID={`panchang-next-day-${item.rule.id}`}
            accessibilityLabel={`${isToday ? 'Tomorrow' : 'Next day'}, ${nameEn}. Opens details.`}
            rule={item.rule}
            title={{ hi: nameHi, en: nameEn }}
            lang={lang}
            countdown={dayLabel}
            following={isFollowing(item.rule.id)}
            reminderOn={reminderOnFor(item.rule.id)}
            onToggleReminder={() => toggleReminder(item.rule)}
            onPress={() => onOpen(item.rule.id)}
          />
        );
      })}
      {reminderSheet}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 12 },
});
