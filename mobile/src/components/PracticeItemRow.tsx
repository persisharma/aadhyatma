import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { scriptTitleFont, scriptBodyFont } from '@/utils/langType';
import type { RoutineItem } from '@/data/routine/types';
import PracticePortrait from './PracticePortrait';
import AppIcon from './AppIcon';

type Props = {
  item: RoutineItem; title: string; subtitle: string; done: boolean;
  onRead: () => void; onOffer?: () => void; offerLabel?: string; offerDisabled?: boolean;
};

/** Opening a reading and offering it are separate, actual 48dp targets. */
export default function PracticeItemRow({ item, title, subtitle, done, onRead, onOffer, offerLabel, offerDisabled }: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  return (
    <View style={[styles.row, { padding: spacing.sm, marginBottom: spacing.sm, borderColor: colors.goldTint,
      borderRadius: radii.md, backgroundColor: colors.parchmentSoft }]}>
      <Pressable onPress={onRead} accessibilityRole="button" accessibilityLabel={`${title} · ${subtitle}`} style={styles.read}>
        <PracticePortrait item={item} />
        <View style={styles.copy}>
          <Text style={{ ...typography.practiceItemTitle, fontFamily: scriptTitleFont(lang, typography.cardHindi.fontFamily), color: done ? colors.inkMuted : colors.ink }}>{title}</Text>
          <Text style={{ ...typography.practiceItemMeta, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), color: done ? colors.inkMuted : colors.saffronDeep }}>{subtitle}</Text>
        </View>
        <AppIcon name="next" size={18} color={colors.saffron} />
      </Pressable>
      {offerLabel && (
        <Pressable onPress={onOffer} disabled={offerDisabled} accessibilityRole="button"
          accessibilityState={{ checked: done, disabled: !!offerDisabled }} accessibilityLabel={offerLabel} style={styles.offer}>
          <View style={[styles.ring, { borderColor: colors.saffron, backgroundColor: done ? colors.saffron : 'transparent' }]}>
            {done && <Text style={{ color: colors.onPrimary, fontSize: 14 }}>✓</Text>}
          </View>
        </Pressable>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: 1 },
  read: { flex: 1, minWidth: 0, minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 10 },
  copy: { flex: 1, minWidth: 0, gap: 3 },
  offer: { width: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  ring: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
