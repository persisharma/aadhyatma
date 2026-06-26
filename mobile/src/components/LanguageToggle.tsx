import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage, LANGUAGES, type LanguageMeta } from '@/data/gita/language';
import { fontFamilies } from '@/theme/typography';

/**
 * Segmented reading-language pill (design.md §16). One segment per entry in
 * LANGUAGES, each labelled in its own script. Full native names are load-bearing:
 * the Maestro flows tap the visible "English" / "हिन्दी" text.
 */

function segmentFont(meta: LanguageMeta): { fontFamily: string; fontSize: number } {
  switch (meta.script) {
    case 'devanagari':
      return { fontFamily: fontFamilies.devanagariBold, fontSize: 15 };
    case 'latin':
      return { fontFamily: fontFamilies.latinItalic, fontSize: 14 };
    case 'gujarati':
      return { fontFamily: fontFamilies.gujaratiBold, fontSize: 14 };
    case 'kannada':
      return { fontFamily: fontFamilies.kannadaBold, fontSize: 13 };
  }
}

export default function LanguageToggle() {
  const { colors, radii } = useTheme();
  const { lang, setLang } = useGitaLanguage();

  return (
    <View
      style={[
        styles.group,
        {
          backgroundColor: colors.parchmentSoft,
          borderColor: colors.divider,
          borderRadius: radii.pill,
        },
      ]}
      accessibilityRole="radiogroup"
      accessibilityLabel="Reading language"
    >
      {LANGUAGES.map((opt) => {
        const selected = lang === opt.value;
        const font = segmentFont(opt);
        return (
          <Pressable
            key={opt.value}
            onPress={() => setLang(opt.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={opt.a11yLabel}
            testID={`lang-toggle-${opt.value}`}
            hitSlop={8}
            style={({ pressed }) => [
              styles.segment,
              { borderRadius: radii.pill },
              selected && { backgroundColor: colors.saffronTint },
              pressed && !selected && { opacity: 0.7 },
            ]}
          >
            <Text
              style={[
                styles.label,
                {
                  color: selected ? colors.saffronDeep : colors.inkMuted,
                  fontFamily: font.fontFamily,
                  fontSize: font.fontSize,
                  fontStyle: opt.script === 'latin' ? 'italic' : 'normal',
                },
              ]}
            >
              {opt.nativeLabel}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    flexDirection: 'row',
    alignSelf: 'center',
    padding: 3,
    borderWidth: 1,
  },
  segment: {
    paddingVertical: 11,
    paddingHorizontal: 10,
    minWidth: 56,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    includeFontPadding: false,
  },
});
