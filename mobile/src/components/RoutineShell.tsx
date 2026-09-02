import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang, pick } from '@/utils/localize';
import { titleFontByLang, scriptTitleFont } from '@/utils/langType';
import BackgroundLayer from '@/components/BackgroundLayer';

/** Screen shell with a back top-bar. Title swaps per the language toggle
 * (RULEBOOK §3 top-bar rule). Defaults to the flat parchment gradient; pass a
 * `background` image source for content surfaces that should sit on the sepia
 * sketch backdrop like the rest of the catalog (design.md §6). */
export function RoutineShell({
  titleHi,
  titleEn,
  onBack,
  right,
  background,
  children,
}: {
  titleHi: string;
  titleEn: string;
  onBack: () => void;
  right?: React.ReactNode;
  background?: number | null;
  children: React.ReactNode;
}) {
  const { colors, typography, spacing } = useTheme();
  const { lang } = useGitaLanguage();
  return (
    <View style={styles.root}>
      <BackgroundLayer source={background} />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={[styles.topBar, { paddingHorizontal: spacing.xxl }]}>
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel={pick(lang, { hi: 'वापस', en: 'Back', gu: 'પાછા', kn: 'ಹಿಂದೆ' })}
            hitSlop={16}
            style={[styles.backBtn, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider }]}
          >
            <Text style={{ color: colors.inkSoft, fontSize: 18 }}>‹</Text>
          </Pressable>
          <Text
            style={{ flex: 1, fontFamily: titleFontByLang(lang), fontSize: 16, color: colors.ink }}
          >
            {contentByLang(lang, titleHi, titleEn)}
          </Text>
          {right}
        </View>
        {children}
      </SafeAreaView>
    </View>
  );
}

export function RoutineButton({
  label,
  onPress,
  variant = 'solid',
  disabled,
}: {
  label: string;
  onPress: () => void;
  variant?: 'solid' | 'ghost';
  disabled?: boolean;
}) {
  const { colors, spacing, radii, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const ghost = variant === 'ghost';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={{
        backgroundColor: ghost ? 'transparent' : colors.saffron,
        borderWidth: ghost ? 1 : 0,
        borderColor: colors.goldTint,
        borderRadius: radii.md,
        paddingVertical: spacing.md,
        alignItems: 'center',
        marginTop: spacing.md,
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <Text
        style={{
          fontFamily:
            lang === 'en'
              ? typography.verseLatin.fontFamily
              : scriptTitleFont(lang, typography.cardHindi.fontFamily),
          fontSize: 16,
          // ≥1.5× — RN clips Devanagari top matras (ें ैं) below ~1.45×.
          lineHeight: 24,
          color: ghost ? colors.saffron : colors.onPrimary,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  backBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
