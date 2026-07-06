import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import type { Lang } from '@/data/gita/language';
import { pick } from '@/utils/localize';
import { titleFontByLang } from '@/utils/langType';

type Props = {
  onPress: () => void;
  lang: Lang;
};

/**
 * Floating "back to the first verse" pill for the readers. Anchored to the
 * bottom-right of the verse pager (clear of the centred page dots and the
 * top-bar title), it gives a one-tap return to verse 1 after a subsection
 * auto-jump — without swiping back through every page. Rendered only when the
 * reader is past the first verse.
 */
export default function JumpToStartButton({ onPress, lang }: Props) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel="Jump to beginning"
      style={({ pressed }) => [
        styles.pill,
        {
          backgroundColor: colors.parchmentSoft,
          borderColor: colors.cardActiveBorder,
        },
        pressed && { opacity: 0.7 },
      ]}
    >
      <Text style={[styles.glyph, { color: colors.saffronDeep }]}>⇤</Text>
      <Text
        style={[
          styles.label,
          {
            color: colors.saffronDeep,
            fontFamily: titleFontByLang(lang),
            fontStyle: lang === 'en' ? 'italic' : 'normal',
          },
        ]}
      >
        {pick(lang, { hi: 'आरंभ', en: 'Start', gu: 'આરંભ', kn: 'ಆರಂಭ' })}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    shadowColor: '#3c1e0a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },
  glyph: {
    fontSize: 15,
    includeFontPadding: false,
  },
  label: {
    fontSize: 13,
    includeFontPadding: false,
  },
});
