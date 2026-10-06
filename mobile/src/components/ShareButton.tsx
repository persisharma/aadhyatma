import React from 'react';
import AppIcon from './AppIcon';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

type Props = {
  onPress: () => void;
  onLongPress?: () => void;
  busy?: boolean;
  /** Defaults to the reader's "Share verse"; override for non-verse surfaces (e.g. Panchang). */
  accessibilityLabel?: string;
  /** Defaults to the long-press screenshot hint; pass undefined where no long-press exists. */
  accessibilityHint?: string;
};

export default function ShareButton({
  onPress,
  onLongPress,
  busy,
  accessibilityLabel = 'Share verse',
  accessibilityHint = 'Long-press to share a screenshot of this reader instead',
}: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={400}
      disabled={busy}
      style={styles.target}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
    >
      <View style={[styles.circle, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, opacity: busy ? 0.5 : 1 }]}>
        <AppIcon name="share" size={20} color={colors.iconInk} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  target: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  circle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
