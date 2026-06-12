import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { useRoutineToday } from '@/data/routine/useRoutineToday';
import { useRoutines } from '@/contexts/RoutineContext';
import { bannerStatus, bannerLine, shouldCelebrate } from './routineBannerView';
import RoutineCelebration from './RoutineCelebration';
import LotusMark from './LotusMark';

/**
 * Docked routine banner (PRD-07 §6.1). Pinned just above the tab bar on Home
 * and Daily Bhakti. Single language-aware line. Three states: nudge (no
 * routine), progress (partial), and complete — which shows a lotus "पूर्ण"
 * achievement badge and plays a one-shot pushpa-varsha the first time it's
 * seen completed each day. Renders nothing while loading so it never flashes
 * the wrong state.
 */
export default function RoutineBanner() {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { hasRoutine, doneCount, total } = useRoutineToday();
  const { celebratedToday, markCelebratedToday } = useRoutines();

  const isHi = lang === 'hi';
  const status = bannerStatus({ hasRoutine, doneCount, total });
  const line = bannerLine(status, isHi);
  const open = (screen: 'RoutineToday' | 'RoutineCreate') =>
    navigation.navigate('HomeTab', { screen });

  // Play the pushpa-varsha once per day, only while the completed chip is on
  // screen. `markCelebratedToday` flips the gate immediately; local `showPetals`
  // keeps the overlay mounted until the animation finishes.
  const [showPetals, setShowPetals] = useState(false);
  const celebrate = shouldCelebrate(status, isFocused, celebratedToday);
  useEffect(() => {
    if (!celebrate) return;
    setShowPetals(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    markCelebratedToday();
  }, [celebrate, markCelebratedToday]);

  // Docked just above the tab bar. The tab bar already owns the bottom
  // safe-area inset (height: 60 + insets.bottom), so adding it here too
  // double-counted it and left a ~inset-sized gap below the chip.
  const base = {
    position: 'absolute' as const,
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.sm,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.parchmentSoft,
    shadowColor: colors.ink,
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 6,
  };

  const lineStyle = {
    flex: 1,
    minWidth: 0,
    fontFamily: typography.cardHindi.fontFamily,
    fontSize: 14,
    color: colors.ink,
  };
  const chevron = <Text style={{ color: colors.saffron, fontSize: 18 }}>›</Text>;

  if (status === 'nudge') {
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
        <Disc colors={colors} radii={radii}>
          <Text style={{ fontFamily: typography.cardHindi.fontFamily, fontSize: 15, color: colors.saffronDeep }}>
            नि
          </Text>
        </Disc>
        <Text numberOfLines={1} style={lineStyle}>
          {line}
        </Text>
        {chevron}
      </Pressable>
    );
  }

  if (status === 'complete') {
    return (
      <>
        <Pressable
          onPress={() => open('RoutineToday')}
          accessibilityRole="button"
          accessibilityLabel={isHi ? 'आज की साधना पूर्ण' : "Today's practice complete"}
          style={({ pressed }) => [
            base,
            styles.row,
            { borderWidth: 1, borderColor: colors.goldTint },
            pressed && { opacity: 0.85 },
          ]}
        >
          <View style={styles.lotusSlot}>
            <LotusMark size={30} />
          </View>
          <Text numberOfLines={1} style={lineStyle}>
            {line}
          </Text>
          {chevron}
        </Pressable>
        {showPetals && (
          <RoutineCelebration
            left={spacing.lg}
            right={spacing.lg}
            bottom={spacing.sm}
            onDone={() => setShowPetals(false)}
          />
        )}
      </>
    );
  }

  // progress
  const pct = total > 0 ? doneCount / total : 0;
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
        <Disc colors={colors} radii={radii}>
          <Text style={{ fontFamily: typography.cardLatin.fontFamily, fontSize: 13, color: colors.saffronDeep }}>
            {doneCount}/{total}
          </Text>
        </Disc>
        <Text numberOfLines={1} style={lineStyle}>
          {line}
        </Text>
        {chevron}
      </View>
      <View style={[styles.track, { backgroundColor: colors.divider, borderRadius: radii.pill, marginTop: spacing.sm - 1 }]}>
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

function Disc({
  colors,
  radii,
  children,
}: {
  colors: ReturnType<typeof useTheme>['colors'];
  radii: ReturnType<typeof useTheme>['radii'];
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.disc, { backgroundColor: colors.saffronTint, borderRadius: radii.pill }]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  disc: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  lotusSlot: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  track: { height: 4, width: '100%', overflow: 'hidden' },
});
