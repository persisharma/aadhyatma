import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { SMART_LINK } from '@/data/shareLinks';
import type { Lang } from '@/data/gita/language';
import VedanshWordmark from './VedanshWordmark';

/** The download link printed on every card; the caption carries the tappable one. */
const PRINTED_LINK = SMART_LINK.replace(/^https?:\/\//, '');

/**
 * Branding footer shared by every exported share card (design.md §39): localized Vedansh name ·
 * tagline · store line with the vedansh.app/get download link over a 1 px `divider` rule. One component so the verse card
 * and the prose card (§39.4) cannot drift.
 */
export default function ShareBrandFooter({ lang = 'hi' }: { lang?: Lang }) {
  const { colors, typography } = useTheme();
  return (
    <View style={[styles.footer, { borderTopColor: colors.divider }]}>
      <VedanshWordmark lang={lang} compact fixedExport />
      <Text
        style={[styles.storeLine, { color: colors.inkMuted, fontFamily: typography.cardLatin.fontFamily }]}
      >
        {`Free on iOS & Android · ${PRINTED_LINK}`}
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
  storeLine: {
    fontSize: 10,
    letterSpacing: 1,
    marginTop: 6,
    // Not uppercased: the link's path is case-sensitive.
    includeFontPadding: false,
  },
});
