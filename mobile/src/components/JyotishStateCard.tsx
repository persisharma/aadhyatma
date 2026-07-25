import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import type { Lang } from '@/data/gita/language';
import { useTheme } from '@/theme/ThemeContext';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';

type Props = {
  kind: 'loading' | 'error';
  lang: Lang;
  titleHi: string;
  titleEn: string;
  bodyHi: string;
  bodyEn: string;
  actionHi?: string;
  actionEn?: string;
  actionAccessibilityLabel?: string;
  onAction?: () => void;
};

export default function JyotishStateCard({
  kind,
  lang,
  titleHi,
  titleEn,
  bodyHi,
  bodyEn,
  actionHi,
  actionEn,
  actionAccessibilityLabel,
  onAction,
}: Props) {
  const { colors, typography, radii, elevation } = useTheme();
  return (
    <View
      accessibilityRole={kind === 'loading' ? undefined : 'alert'}
      accessibilityLabel={titleEn}
      style={[
        styles.card,
        {
          backgroundColor: colors.parchmentSoft,
          borderColor: colors.divider,
          borderRadius: radii.lg,
        },
        elevation.card,
      ]}
    >
      {kind === 'loading' ? (
        <ActivityIndicator color={colors.saffron} size="large" />
      ) : (
        <View
          style={[
            styles.errorMark,
            { backgroundColor: colors.avoidTint, borderRadius: radii.pill },
          ]}
        >
          <Text style={{ color: colors.avoidDeep, fontFamily: 'Inter_600SemiBold' }}>!</Text>
        </View>
      )}
      <Text
        style={{
          color: colors.ink,
          fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
          fontSize: 18,
          marginTop: 12,
          textAlign: 'center',
        }}
      >
        {contentByLang(lang, titleHi, titleEn)}
      </Text>
      <Text
        style={{
          color: colors.inkMuted,
          fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
          fontSize: 12,
          lineHeight: 18,
          marginTop: 5,
          textAlign: 'center',
        }}
      >
        {meaningByLang(lang, bodyHi, bodyEn)}
      </Text>
      {kind === 'loading' ? (
        <View style={styles.skeletons}>
          <View style={[styles.skeleton, styles.medium, { backgroundColor: colors.divider }]} />
          <View style={[styles.skeleton, { backgroundColor: colors.divider }]} />
          <View style={[styles.skeleton, styles.short, { backgroundColor: colors.divider }]} />
        </View>
      ) : onAction && actionHi && actionEn ? (
        <Pressable
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionAccessibilityLabel ?? actionEn}
          style={({ pressed }) => [
            styles.action,
            { backgroundColor: colors.saffronDeep, borderRadius: radii.pill },
            pressed && { opacity: 0.72 },
          ]}
        >
          <Text style={[styles.actionText, { color: colors.onPrimary }]}>
            {contentByLang(lang, actionHi, actionEn)}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 22,
    alignItems: 'center',
  },
  errorMark: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skeletons: {
    width: '100%',
    marginTop: 12,
  },
  skeleton: {
    width: '100%',
    height: 8,
    marginTop: 8,
    borderRadius: 999,
  },
  medium: {
    width: '76%',
  },
  short: {
    width: '48%',
  },
  action: {
    minHeight: 42,
    marginTop: 16,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
  },
});
