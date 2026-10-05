import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

/**
 * Branding footer shared by every exported share card (design.md §39): `वेदांश़` ·
 * tagline · store line over a 1 px `divider` rule. One component so the verse card
 * and the prose card (§39.4) cannot drift; its height is `shareCardMetrics.footerBlock`.
 */
export default function ShareBrandFooter() {
  const { colors, typography } = useTheme();
  return (
    <View style={[styles.footer, { borderTopColor: colors.divider }]}>
      <Text
        style={[styles.wordmarkHi, { color: colors.ink, fontFamily: typography.readerTitle.fontFamily }]}
      >
        वेदांश़
      </Text>
      <Text
        style={[
          styles.wordmarkLatin,
          { color: colors.saffronDeep, fontFamily: typography.cardLatin.fontFamily },
        ]}
      >
        Vedansh — Sacred Texts, Daily Reading
      </Text>
      <Text
        style={[styles.storeLine, { color: colors.inkMuted, fontFamily: typography.cardLatin.fontFamily }]}
      >
        Now available on iOS & Android
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  wordmarkHi: {
    // no tracking on the Devanagari wordmark — it splits the shirorekha
    fontSize: 18,
    includeFontPadding: false,
  },
  wordmarkLatin: {
    fontSize: 12,
    letterSpacing: 1.2,
    marginTop: 3,
    fontStyle: 'italic',
    includeFontPadding: false,
  },
  storeLine: {
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 6,
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
});
