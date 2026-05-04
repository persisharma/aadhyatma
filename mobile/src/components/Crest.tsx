import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

export default function Crest() {
  const { colors, typography } = useTheme();
  return (
    <View style={styles.row}>
      <View style={[styles.rule, { backgroundColor: colors.saffron }]} />
      <View style={[styles.mark, { borderColor: colors.saffron }]}>
        <Text
          style={[
            styles.markText,
            {
              color: colors.saffron,
              fontFamily: typography.thumb.fontFamily,
            },
          ]}
        >
          ॐ
        </Text>
      </View>
      <View style={[styles.rule, { backgroundColor: colors.saffron }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginVertical: 14,
  },
  rule: {
    width: 40,
    height: 1,
    opacity: 0.6,
  },
  mark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markText: {
    fontSize: 18,
    lineHeight: 28,
    includeFontPadding: false,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
});
