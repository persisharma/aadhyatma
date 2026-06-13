import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

/**
 * Home brand lockup: a compact single-row crest — ॐ on both sides of the
 * वेदांश़ wordmark, flanked by thin saffron rules — over the Latin tagline.
 * Replaces the old stacked crest + 34px title, reclaiming ~50dp of hero height
 * without losing the reverent, centered essence (design.md §5/§18).
 */
export default function HomeWordmark() {
  const { colors, typography } = useTheme();

  const renderMark = () => (
    <View style={[styles.mark, { borderColor: colors.saffron }]}>
      <Text style={[styles.markText, { color: colors.saffron, fontFamily: typography.thumb.fontFamily }]}>
        ॐ
      </Text>
    </View>
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.lockup}>
        <View style={[styles.rule, { backgroundColor: colors.saffron }]} />
        {renderMark()}
        <Text
          style={[
            styles.title,
            {
              color: colors.ink,
              fontFamily: typography.screenTitle.fontFamily,
              letterSpacing: typography.screenTitle.letterSpacing,
            },
          ]}
        >
          वेदांश़
        </Text>
        {renderMark()}
        <View style={[styles.rule, { backgroundColor: colors.saffron }]} />
      </View>
      <Text
        style={[
          styles.subtitle,
          {
            color: colors.inkSoft,
            fontFamily: typography.subtitle.fontFamily,
            letterSpacing: typography.subtitle.letterSpacing,
          },
        ]}
      >
        Sacred Texts · Daily Reading
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  lockup: { height: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 11 },
  rule: { width: 22, height: 1, opacity: 0.6 },
  mark: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markText: {
    fontSize: 19,
    lineHeight: 30,
    includeFontPadding: false,
    textAlign: 'center',
    transform: [{ translateY: 1.5 }],
  },
  title: {
    fontSize: 27,
    // A full line box keeps the top matra/nukta visible while the lockup row,
    // then a slight optical nudge centers वेदांश़ against the Om circles.
    lineHeight: 42,
    includeFontPadding: false,
    transform: [{ translateY: 4 }],
  },
  subtitle: {
    marginTop: 5,
    fontSize: 14,
    fontStyle: 'italic',
    includeFontPadding: false,
  },
});
