import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

export default function Ornament() {
  const { colors, typography } = useTheme();
  return (
    <View style={styles.row} accessibilityElementsHidden importantForAccessibility="no">
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
