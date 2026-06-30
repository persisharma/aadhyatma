import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { useFontScale } from '@/contexts/FontScaleContext';
import { pick } from '@/utils/localize';
import { verseToken } from '@/utils/langType';
import { type FontScale } from '@/theme/fontScale';
import { type Lang } from '@/data/gita/language';

/**
 * More-tab control for reader font size (PRD-04, slice 2). Two presets only —
 * Standard (M) / Large (L) — mirroring the Language card. The sample line below
 * the pills uses the same verse token the readers do, so it grows/shrinks live
 * as the size changes. Only reading text scales; this card's own chrome is fixed.
 */

const OPTIONS: ReadonlyArray<{
  value: FontScale;
  label: { hi: string; en: string; gu: string; kn: string };
  a11y: string;
}> = [
  { value: 'M', label: { hi: 'मानक', en: 'Standard', gu: 'માનક', kn: 'ಪ್ರಮಾಣಿತ' }, a11y: 'Standard' },
  { value: 'L', label: { hi: 'बड़ा', en: 'Large', gu: 'મોટું', kn: 'ದೊಡ್ಡ' }, a11y: 'Large' },
];

const SAMPLE: Record<Lang, string> = {
  hi: 'श्री राम जय राम',
  en: 'Śrī Rāma jaya Rāma',
  gu: 'શ્રી રામ જય રામ',
  kn: 'ಶ್ರೀ ರಾಮ ಜಯ ರಾಮ',
};

export default function ReadingSizeCard() {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const { scale, setScale } = useFontScale();
  const verseTok = verseToken(lang, typography);

  return (
    <View
      style={[
        styles.section,
        { backgroundColor: colors.parchmentSoft, borderColor: colors.divider },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.icon, { backgroundColor: colors.gold }]}>
          <Text style={styles.iconGlyph}>Aa</Text>
        </View>
        <View>
          <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.ink }}>
            {pick(lang, { hi: 'पढ़ने का आकार', en: 'Reading size', gu: 'વાંચન કદ', kn: 'ಓದುವ ಗಾತ್ರ' })}
          </Text>
          <Text
            style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: colors.inkMuted, marginTop: 1 }}
          >
            {pick(lang, {
              hi: 'श्लोक व अर्थ के अक्षरों का आकार',
              en: 'Verse & meaning text size',
              gu: 'શ્લોક અને અર્થનું કદ',
              kn: 'ಶ್ಲೋಕ ಮತ್ತು ಅರ್ಥದ ಗಾತ್ರ',
            })}
          </Text>
        </View>
      </View>

      <View
        style={styles.row}
        accessibilityRole="radiogroup"
        accessibilityLabel={pick(lang, {
          hi: 'पढ़ने का आकार',
          en: 'Reading size',
          gu: 'વાંચન કદ',
          kn: 'ಓದುವ ಗಾತ್ರ',
        })}
      >
        {OPTIONS.map((opt) => {
          const selected = scale === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => setScale(opt.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={opt.a11y}
              style={[
                styles.pill,
                { borderColor: selected ? colors.saffron : colors.divider },
                selected && { backgroundColor: 'rgba(184, 98, 27, 0.1)' },
              ]}
            >
              {selected && <Text style={[styles.check, { color: colors.saffron }]}>✓</Text>}
              <Text
                style={[
                  styles.pillLabel,
                  {
                    // factor only scales reading styles; pill text is chrome → fixed
                    color: selected ? colors.saffronDeep : colors.ink,
                  },
                ]}
              >
                {pick(lang, opt.label)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text
        testID="reading-size-sample"
        style={{
          fontFamily: verseTok.fontFamily,
          fontSize: verseTok.fontSize,
          lineHeight: verseTok.lineHeight,
          color: colors.ink,
          marginTop: 14,
        }}
      >
        {SAMPLE[lang]}
      </Text>
    </View>
  );
}

// Mirrors MoreScreen's section/langRow shell so the card sits flush with the Language card.
const styles = StyleSheet.create({
  section: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  icon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  iconGlyph: { color: '#fff', fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  check: { fontSize: 13 },
  pillLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
});
