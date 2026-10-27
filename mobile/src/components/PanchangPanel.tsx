import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { eyebrowTextStyle, scriptBodyFont } from '@/utils/langType';

/**
 * The card every Panchang section below the Muhurat card sits in (design.md
 * §33): the same warm `cardActiveFrom → parchmentGradientEnd` register as the
 * observance ribbon and the share card's anga block, a `goldChipBg` hairline,
 * and the Muhurat card's eyebrow — one card per subject instead of a box per
 * value. `meta` is a quiet right-aligned fact for the eyebrow row.
 */
export default function PanchangPanel({
  title,
  meta,
  testID,
  style,
  children,
}: {
  title: string;
  meta?: string | null;
  testID?: string;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  const { colors, typography, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  return (
    <LinearGradient
      testID={testID}
      colors={[colors.cardActiveFrom, colors.parchmentGradientEnd]}
      style={[styles.card, { borderColor: colors.goldChipBg, borderRadius: radii.lg }, elevation.card, style]}
    >
      <View style={styles.head}>
        <Text style={[eyebrowTextStyle(lang, 12), { color: colors.saffronDeep }]}>{title}</Text>
        {meta ? (
          <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 11.5, color: colors.inkMuted }}>
            {meta}
          </Text>
        ) : null}
      </View>
      {children}
    </LinearGradient>
  );
}

/**
 * A 2-column grid of cells split by hairlines (no box per cell), the layout the
 * anga, vaas and sun/moon panels share. Odd counts leave the last row's right
 * cell empty.
 */
export function PanelGrid({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  const cells = React.Children.toArray(children);
  const rows: React.ReactNode[][] = [];
  for (let i = 0; i < cells.length; i += 2) rows.push(cells.slice(i, i + 2));
  return (
    <View style={styles.grid}>
      {rows.map((row, r) => (
        <View key={r} style={[styles.gridRow, r > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.divider }]}>
          <View style={styles.cell}>{row[0]}</View>
          <View style={[styles.rule, { backgroundColor: colors.divider }]} />
          <View style={styles.cell}>{row[1] ?? null}</View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, paddingTop: 12, paddingBottom: 6, paddingHorizontal: 14, marginTop: 10 },
  head: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, marginBottom: 2 },
  grid: { marginHorizontal: -14 },
  gridRow: { flexDirection: 'row', alignItems: 'stretch' },
  cell: { flex: 1, minWidth: 0, paddingVertical: 10, paddingHorizontal: 14 },
  rule: { width: StyleSheet.hairlineWidth, marginVertical: 10 },
});
