import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage, type GitaLang } from '@/data/gita/language';

type Option = {
  value: GitaLang;
  labelDevanagari?: string;
  labelLatin?: string;
};

const OPTIONS: readonly Option[] = [
  { value: 'hi', labelDevanagari: 'हिन्दी' },
  { value: 'en', labelLatin: 'English' },
];

export default function LanguageToggle() {
  const { colors, typography, radii } = useTheme();
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
      {OPTIONS.map((opt) => {
        const selected = lang === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => setLang(opt.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={opt.value === 'hi' ? 'Hindi' : 'English'}
            testID={opt.value === 'hi' ? 'lang-toggle-hi' : 'lang-toggle-en'}
            hitSlop={8}
            style={({ pressed }) => [
              styles.half,
              { borderRadius: radii.pill },
              selected && { backgroundColor: colors.saffronTint },
              pressed && !selected && { opacity: 0.7 },
            ]}
          >
            {opt.labelDevanagari ? (
              <Text
                style={[
                  styles.labelDevanagari,
                  {
                    color: selected ? colors.saffronDeep : colors.inkMuted,
                    fontFamily: typography.cardHindi.fontFamily,
                    fontSize: 15,
                  },
                ]}
              >
                {opt.labelDevanagari}
              </Text>
            ) : null}
            {opt.labelLatin ? (
              <Text
                style={[
                  styles.labelLatin,
                  {
                    color: selected ? colors.saffronDeep : colors.inkMuted,
                    fontFamily: typography.cardLatin.fontFamily,
                    fontSize: 14,
                    fontStyle: 'italic',
                  },
                ]}
              >
                {opt.labelLatin}
              </Text>
            ) : null}
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
  half: {
    paddingVertical: 11,
    paddingHorizontal: 22,
    minWidth: 96,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelDevanagari: {
    includeFontPadding: false,
  },
  labelLatin: {
    includeFontPadding: false,
  },
});
