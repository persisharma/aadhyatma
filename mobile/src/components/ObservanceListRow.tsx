import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type AccessibilityRole,
} from 'react-native';

import { useTheme } from '@/theme/ThemeContext';

/**
 * Shared flat-ledger row used by observance lists. A separately interactive
 * leading control (such as Follow) stays outside the main row press target;
 * decorative leading content is included in the row target.
 */
export default function ObservanceListRow({
  leading,
  leadingAction,
  title,
  caption,
  trailing,
  onPress,
  accessibilityLabel,
  accessibilityRole = 'button',
  testID,
}: {
  leading?: React.ReactNode;
  leadingAction?: React.ReactNode;
  title: React.ReactNode;
  caption?: React.ReactNode;
  trailing?: React.ReactNode;
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityRole?: AccessibilityRole;
  testID?: string;
}) {
  const { colors } = useTheme();

  const contents = (
    <>
      <View style={styles.meta}>
        {title}
        {caption}
      </View>
      {trailing}
    </>
  );

  if (leadingAction != null) {
    return (
      <View testID={testID} style={[styles.row, { borderBottomColor: colors.divider }]}>
        {leadingAction}
        <Pressable
          onPress={onPress}
          accessibilityRole={accessibilityRole}
          accessibilityLabel={accessibilityLabel}
          style={({ pressed }) => [styles.mainPress, pressed && styles.pressed]}
        >
          {contents}
        </Pressable>
      </View>
    );
  }

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.row,
        styles.wholeRowPress,
        { borderBottomColor: colors.divider },
        pressed && styles.pressed,
      ]}
    >
      {leading != null && <View style={styles.leading}>{leading}</View>}
      {contents}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 56,
  },
  wholeRowPress: { paddingVertical: 13 },
  mainPress: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingVertical: 13 },
  leading: { marginRight: 12 },
  meta: { flex: 1, minWidth: 0 },
  pressed: { opacity: 0.6 },
});
