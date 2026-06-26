import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';

/** Parchment-gradient screen shell with a back top-bar. Title swaps Hi/En per
 * the language toggle (RULEBOOK §3 top-bar rule). */
export function RoutineShell({
  titleHi,
  titleEn,
  onBack,
  right,
  children,
}: {
  titleHi: string;
  titleEn: string;
  onBack: () => void;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { colors, typography, spacing } = useTheme();
  const { lang } = useGitaLanguage();
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={[styles.topBar, { paddingHorizontal: spacing.xxl }]}>
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel={lang === 'hi' ? 'वापस' : 'Back'}
            hitSlop={16}
            style={[styles.backBtn, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider }]}
          >
            <Text style={{ color: colors.inkSoft, fontSize: 18 }}>‹</Text>
          </Pressable>
          <Text
            style={{ flex: 1, fontFamily: typography.readerTitle.fontFamily, fontSize: 16, color: colors.ink }}
          >
            {lang === 'hi' ? titleHi : titleEn}
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
  const isHi = lang === 'hi';
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
          fontFamily: isHi ? typography.cardHindi.fontFamily : typography.verseLatin.fontFamily,
          fontSize: 16,
          lineHeight: 22,
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
