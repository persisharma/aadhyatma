import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

/** `compact` trims the 26 px vertical margins for a screen that must fit one viewport. */
export default function Ornament({ compact = false }: { compact?: boolean } = {}) {
  const { colors, typography } = useTheme();
  return (
    <View
      style={[styles.row, compact && styles.rowCompact]}
      accessibilityElementsHidden
      importantForAccessibility="no"
    >
      <View style={[styles.rule, { backgroundColor: colors.saffron }]} />
      <Text
        style={[
          styles.glyph,
          {
            color: colors.saffron,
            fontFamily: typography.verse.fontFamily,
          },
        ]}
      >
        ॥
      </Text>
      <View style={[styles.rule, { backgroundColor: colors.saffron }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    alignSelf: 'center',
    marginVertical: 26,
    opacity: 0.6,
  },
  rowCompact: {
    marginVertical: 6,
  },
  rule: {
    flex: 1,
    height: 1,
  },
  glyph: {
    fontSize: 14,
    paddingHorizontal: 8,
    includeFontPadding: false,
  },
});
