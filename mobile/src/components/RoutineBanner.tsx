import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { useRoutineToday } from '@/data/routine/useRoutineToday';

/**
 * Docked routine banner (PRD-07 §6.1). Pinned just above the tab bar on Home
 * and Daily Bhakti. Two states: nudge (no routine) and progress (routine set).
 * Tapping opens routine creation or today's practice. Renders nothing while
 * loading so it never flashes the wrong state.
 */
export default function RoutineBanner() {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { hasRoutine, doneCount, total } = useRoutineToday();

  const isHi = lang === 'hi';
  const open = (screen: 'RoutineToday' | 'RoutineCreate') =>
    navigation.navigate('HomeTab', { screen });

  const base = {
    position: 'absolute' as const,
    left: spacing.lg,
    right: spacing.lg,
    bottom: insets.bottom + spacing.sm,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.parchmentSoft,
    shadowColor: colors.ink,
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 6,
  };

  if (!hasRoutine) {
    return (
      <Pressable
        onPress={() => open('RoutineCreate')}
        accessibilityRole="button"
        accessibilityLabel={isHi ? 'अपनी नित्य साधना बनाएँ' : 'Set your daily practice'}
        style={({ pressed }) => [
          base,
          styles.row,
          { borderWidth: 1, borderColor: colors.gold, borderStyle: 'dashed' },
          pressed && { opacity: 0.85 },
        ]}
      >
        <Glyph colors={colors} typography={typography} />
        <View style={styles.textCol}>
          <Text style={{ fontFamily: typography.cardHindi.fontFamily, fontSize: 14, color: colors.ink }}>
            {isHi ? 'अपनी नित्य साधना बनाएँ' : 'Set your daily practice'}
          </Text>
          <Text
            style={{
              fontFamily: typography.cardLatin.fontFamily,
              fontSize: 12,
              color: colors.inkMuted,
              marginTop: 1,
            }}
          >
            {isHi ? 'Set your daily practice' : 'अपनी नित्य साधना बनाएँ'}
          </Text>
        </View>
        <Text style={{ color: colors.saffron, fontSize: 18 }}>›</Text>
      </Pressable>
    );
  }

  const pct = total > 0 ? doneCount / total : 0;
  const complete = total > 0 && doneCount === total;

  return (
    <Pressable
      onPress={() => open('RoutineToday')}
      accessibilityRole="button"
      accessibilityLabel={isHi ? 'आज की साधना' : "Today's practice"}
      style={({ pressed }) => [
        base,
        { borderWidth: 1, borderColor: colors.goldTint },
        pressed && { opacity: 0.85 },
      ]}
    >
      <View style={styles.row}>
        <View
          style={[
            styles.badge,
            { backgroundColor: colors.saffronTint, borderRadius: radii.pill },
          ]}
        >
          <Text style={{ fontFamily: typography.cardLatin.fontFamily, fontSize: 13, color: colors.saffronDeep }}>
            {doneCount}/{total}
          </Text>
        </View>
        <View style={styles.textCol}>
          <Text style={{ fontFamily: typography.cardHindi.fontFamily, fontSize: 14, color: colors.ink }}>
            {isHi ? 'नित्य साधना · आज' : 'Daily Routine · Today'}
          </Text>
          <Text
            style={{
              fontFamily: typography.cardLatin.fontFamily,
              fontSize: 12,
              color: colors.inkMuted,
              marginTop: 1,
            }}
          >
            {complete
              ? isHi
                ? 'आज की साधना पूर्ण'
                : 'Complete for today'
              : isHi
                ? "आज का पाठ"
                : "Today's practice"}
          </Text>
        </View>
        <Text style={{ color: colors.saffron, fontSize: 18 }}>›</Text>
      </View>
      <View
        style={[styles.track, { backgroundColor: colors.divider, borderRadius: radii.pill, marginTop: spacing.sm }]}
      >
        <View
          style={{
            width: `${Math.round(pct * 100)}%`,
            height: '100%',
            backgroundColor: colors.saffron,
            borderRadius: radii.pill,
          }}
        />
      </View>
    </Pressable>
  );
}

function Glyph({
  colors,
  typography,
}: {
  colors: ReturnType<typeof useTheme>['colors'];
  typography: ReturnType<typeof useTheme>['typography'];
}) {
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: colors.saffronTint, borderRadius: 999 },
      ]}
    >
      <Text style={{ fontFamily: typography.cardHindi.fontFamily, fontSize: 16, color: colors.saffronDeep }}>
        नि
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  textCol: { flex: 1, minWidth: 0 },
  badge: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  track: { height: 5, width: '100%', overflow: 'hidden' },
});
