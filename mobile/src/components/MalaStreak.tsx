import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { malaBeads, malaLabel } from '@/data/routine/practiceView';

/**
 * The streak rendered as a mala — a string of prayer beads filling toward a
 * larger gold meru bead (PRD-10 §5.2). This is the product's streak metaphor
 * (not a fitness flame). View+gradient vector art, no SVG (design.md §30).
 *
 * Motion: none. Per design.md §11 ("avoid scale effects") the mala is static —
 * the most-recent lit bead is distinguished by a *static* soft ring, not a
 * pulse. Reusable: the Home "Today" surface can adopt it later
 * (vedansh-home-handoff.md).
 *
 * `streak` is the authoritative number (from `UserActivityContext.currentStreak`);
 * the bead strip caps at `capacity` so a long streak never overflows the row.
 */
export default function MalaStreak({
  streak,
  capacity = 7,
  beadSize = 11,
  showLabel = true,
}: {
  streak: number;
  capacity?: number;
  beadSize?: number;
  showLabel?: boolean;
}) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();

  const { lit, capacity: cap, todayIndex, empty } = malaBeads(streak, capacity);
  const label = malaLabel(streak, lang);
  const meruSize = Math.round(beadSize * 1.3);

  return (
    <View style={styles.row} accessible accessibilityLabel={label} accessibilityRole="image">
      <View style={styles.beads} importantForAccessibility="no-hide-descendants">
        {Array.from({ length: cap }).map((_, i) => (
          <React.Fragment key={i}>
            <Bead size={beadSize} lit={i < lit} today={i === todayIndex} colors={colors} />
            <View style={[styles.thread, { backgroundColor: colors.gold, opacity: 0.5 }]} />
          </React.Fragment>
        ))}
        {/* meru — the head bead the mala terminates at */}
        <LinearGradient
          colors={[colors.cardThumbActiveFrom, colors.gold]}
          start={{ x: 0.3, y: 0.2 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: meruSize,
            height: meruSize,
            borderRadius: meruSize,
            borderWidth: 1,
            borderColor: colors.gold,
          }}
        />
      </View>
      {showLabel && (
        <Text
          style={{
            fontFamily: typography.cardLatin.fontFamily,
            fontSize: 14,
            color: empty ? colors.inkMuted : colors.inkSoft,
            marginLeft: 10,
            flexShrink: 1,
          }}
          numberOfLines={1}
        >
          {label}
        </Text>
      )}
    </View>
  );
}

function Bead({
  size,
  lit,
  today,
  colors,
}: {
  size: number;
  lit: boolean;
  today: boolean;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* today's bead carries a STATIC soft ring (no animation — design.md §11) */}
      {today && (
        <View
          style={{
            position: 'absolute',
            width: size + 6,
            height: size + 6,
            borderRadius: size + 6,
            borderWidth: 1,
            borderColor: colors.saffron,
            opacity: 0.35,
          }}
        />
      )}
      {lit ? (
        <LinearGradient
          colors={[colors.saffron, colors.saffronDeep]}
          start={{ x: 0.3, y: 0.2 }}
          end={{ x: 1, y: 1 }}
          style={{ width: size, height: size, borderRadius: size, borderWidth: 1, borderColor: colors.saffronDeep }}
        />
      ) : (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size,
            backgroundColor: colors.parchmentDeep,
            borderWidth: 1,
            borderColor: colors.gold,
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  beads: { flexDirection: 'row', alignItems: 'center' },
  thread: { width: 5, height: 1.5 },
});
