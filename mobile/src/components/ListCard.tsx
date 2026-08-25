import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type AccessibilityRole,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';
import { elevation } from '@/theme/elevation';

/**
 * The app's canonical list-item card — the "library card" grammar (see
 * `LibraryCard`): a separate rounded card with the active `cardActiveFrom→To`
 * gradient, a leading thumb, a title/subtitle column, and a trailing chevron.
 *
 * Extracted so lists that aren't the content library (e.g. the Muhurat Finder's
 * occasion + results lists, design.md §60) reuse ONE card design instead of
 * forking their own — every list card in the app reads the same. Presentational
 * only: callers pass a `leading` node (usually `<CardThumb>`) and their own
 * styled title/subtitle so section-specific typography stays their concern,
 * while the shell (radius, gradient, elevation, padding, chevron) is fixed here.
 * There is deliberately no add-to-routine `+`; that is `LibraryCard`-specific.
 */
export function CardThumb({ children }: { children: React.ReactNode }) {
  const { colors, radii } = useTheme();
  return (
    <LinearGradient
      colors={[colors.cardThumbActiveFrom, colors.cardThumbActiveTo]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.thumb, { borderRadius: radii.md }]}
    >
      {children}
    </LinearGradient>
  );
}

export default function ListCard({
  leading,
  children,
  right,
  onPress,
  accessibilityLabel,
  accessibilityRole = 'button',
  testID,
  style,
  variant = 'active',
}: {
  leading?: React.ReactNode;
  /** The title/subtitle column — caller-styled so section typography stays local. */
  children: React.ReactNode;
  /** Trailing content; defaults to the standard saffron chevron. */
  right?: React.ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
  testID?: string;
  style?: StyleProp<ViewStyle>;
  /**
   * 'active' — the cardActive gradient shell (default). 'flat' — plain
   * `parchment-soft` on a `divider` border, for rows that must NOT compete with
   * an adjacent gradient card (e.g. the Muhurat Finder door under the glance
   * card, design.md §33): the gradient stays reserved for the live surface.
   */
  variant?: 'active' | 'flat';
}) {
  const { colors, radii } = useTheme();
  const flat = variant === 'flat';
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.card,
        {
          borderRadius: radii.lg,
          borderColor: flat ? colors.divider : colors.cardActiveBorder,
          // Opaque base so the Android shadow renders; the gradient carries its
          // own radius rather than overflow:'hidden', which clips the iOS shadow
          // (design.md §4 — same pattern as LibraryCard/CategoryCard).
          backgroundColor: flat ? colors.parchmentSoft : colors.cardActiveFrom,
        },
        elevation.card,
        pressed && styles.pressed,
        style,
      ]}
    >
      {!flat && (
        <LinearGradient
          colors={[colors.cardActiveFrom, colors.cardActiveTo]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: radii.lg }]}
        />
      )}
      {leading != null && <View style={styles.leading}>{leading}</View>}
      <View style={styles.meta}>{children}</View>
      {right ?? <Text style={[styles.chev, { color: colors.saffron }]}>›</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  pressed: { opacity: 0.85 },
  leading: { flexShrink: 0 },
  meta: { flex: 1, minWidth: 0 },
  thumb: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center' },
  chev: { fontSize: 26, marginLeft: 4, flexShrink: 0 },
});
