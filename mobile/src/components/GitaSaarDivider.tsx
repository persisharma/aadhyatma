import React from 'react';
import { StyleSheet, View } from 'react-native';
import { FlowerLotusIcon } from 'phosphor-react-native/src/icons/FlowerLotus';
import { useTheme } from '@/theme/ThemeContext';

/** The selected Gita Saar manuscript's fine gold rule and lotus. */
export default function GitaSaarDivider() {
  const { colors } = useTheme();
  return (
    <View style={styles.row} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={[styles.rule, { backgroundColor: colors.gold }]} />
      <FlowerLotusIcon size={20} weight="light" color={colors.gold} />
      <View style={[styles.rule, { backgroundColor: colors.gold }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 24 },
  rule: { flex: 1, height: StyleSheet.hairlineWidth },
});
