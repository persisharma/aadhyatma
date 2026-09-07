import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/theme/ThemeContext';
import { androidBoxShadow } from '@/theme/elevation';
import { useGitaLanguage } from '@/data/gita/language';
import { pick } from '@/utils/localize';
import { useRoutineToday } from '@/data/routine/useRoutineToday';
import { useTilePress } from '@/contexts/TilePressContext';
import { bannerStatus, bannerLine } from './routineBannerView';
import LotusMark from './LotusMark';

/**
 * Routine banner (PRD-07 §6.1). Single language-aware line. Three states: nudge
 * (no routine), progress (partial), and complete — which shows a lotus "पूर्ण"
 * achievement badge as a persistent status chip. The completion pushpa-varsha
 * itself fires app-wide from RoutineCelebrationOverlay (mounted at the nav
 * root), so it plays on whatever screen completion happens — not just here.
 *
 * Two layouts via `variant`:
 * - `docked` (default) — a floating chip pinned just above the tab bar. Used on
 *   Daily Bhakti.
 * - `inline` — flows in the Home scroll between the Today strip and CATEGORIES,
 *   so it no longer overlays (and clips) the content beneath it.
 */
export default function RoutineBanner({
  bannerRef,
  variant = 'docked',
}: { bannerRef?: React.Ref<View>; variant?: 'docked' | 'inline' } = {}) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const navigation = useNavigation<any>();
  const { hasRoutine, doneCount, total } = useRoutineToday();
  const { beginTilePress, finishTilePress, activateTile } = useTilePress();

  const status = bannerStatus({ hasRoutine, doneCount, total });
  const line = bannerLine(status, lang);
  const open = (screen: 'RoutineToday' | 'RoutineCreate') => () =>
    navigation.navigate('HomeTab', { screen });

  // Docked: floating chip just above the tab bar. The tab bar already owns the
  // bottom safe-area inset (height: 60 + insets.bottom), so adding it here too
  // double-counted it and left a ~inset-sized gap below the chip. Its shadow
  // lifts UPWARD (offset -4) to read as hovering off the bar.
  // Inline: flows in the page, so no absolute positioning; its shadow drops
  // DOWNWARD (offset +3), the way the other Home cards cast, so it reads as a
  // card in the layout rather than a floating overlay.
  const base =
    variant === 'inline'
      ? {
          borderRadius: radii.lg,
          minHeight: 57,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.sm,
          backgroundColor: colors.parchmentSoft,
          shadowColor: colors.ink,
          shadowOpacity: 0.1,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
          // Android ignores shadow*; give it the same soft ink lift via
          // boxShadow (no integer `elevation`, which draws a boxy grey box).
          ...androidBoxShadow(3, 8, 'rgba(26, 14, 3, 0.1)'),
        }
      : {
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
          // Upward soft lift on Android too (no boxy integer `elevation`).
          ...androidBoxShadow(-4, 12, 'rgba(26, 14, 3, 0.16)'),
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
        ref={bannerRef}
        collapsable={false}
        onPress={() => activateTile(open('RoutineCreate'))}
        onPressIn={() => beginTilePress(open('RoutineCreate'))}
        onPressOut={finishTilePress}
        accessibilityRole="button"
        accessibilityLabel={pick(lang, { hi: 'अपनी नित्य साधना बनाएँ', en: 'Set your daily practice', gu: 'તમારી નિત્ય સાધના સેટ કરો', kn: 'ನಿಮ್ಮ ನಿತ್ಯ ಸಾಧನೆ ಹೊಂದಿಸಿ' })}
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
      <Pressable
        ref={bannerRef}
        collapsable={false}
        onPress={() => activateTile(open('RoutineToday'))}
        onPressIn={() => beginTilePress(open('RoutineToday'))}
        onPressOut={finishTilePress}
        accessibilityRole="button"
        accessibilityLabel={pick(lang, { hi: 'आज की साधना पूर्ण', en: "Today's practice complete", gu: 'આજની સાધના પૂર્ણ', kn: 'ಇಂದಿನ ಸಾಧನೆ ಪೂರ್ಣ' })}
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
    );
  }

  // progress
  const pct = total > 0 ? doneCount / total : 0;
  return (
    <Pressable
      ref={bannerRef}
      collapsable={false}
      onPress={() => activateTile(open('RoutineToday'))}
      onPressIn={() => beginTilePress(open('RoutineToday'))}
      onPressOut={finishTilePress}
      accessibilityRole="button"
      accessibilityLabel={pick(lang, { hi: 'आज की साधना', en: "Today's practice", gu: 'આજની સાધના', kn: 'ಇಂದಿನ ಸಾಧನೆ' })}
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
