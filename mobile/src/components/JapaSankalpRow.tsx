import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import type { Lang } from '@/data/gita/language';
import { formatIndianNumber, sankalpProgress, type JapaSankalp } from '@/data/japam/sankalp';
import { isLatinLang, scriptBodyFont } from '@/utils/langType';
import { sankalpA11yLabel, sankalpRowLabel } from './japaSankalpCopy';

/**
 * An active japa sankalp in the counter's count bar (design.md §35.2): the vow's
 * own count replaces the all-time tray — "3 / 11 माला पूर्ण · संकल्प" over a thin
 * progress bar — and the whole row opens the sheet. It is the same height as the
 * tray row (content ≤ 44 inside the bar's 56), so taking or clearing a vow never
 * moves anything above it.
 */
export default function JapaSankalpRow({
  sankalp,
  lang,
  onPress,
  disabled,
}: {
  sankalp: JapaSankalp;
  lang: Lang;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { colors, radii } = useTheme();
  const p = sankalpProgress(sankalp);
  const done = sankalp.unit === 'mala' ? p.malasDone : p.done;
  const pct = Math.round(p.fraction * 1000) / 10;
  return (
    <Pressable
      testID="japa-sankalp-row"
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`${sankalpA11yLabel(sankalp)}. Change or set aside the sankalp.`}
      accessibilityState={disabled ? { disabled: true } : undefined}
      hitSlop={6}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
    >
      <View style={styles.line}>
        <Text style={[styles.done, { color: colors.saffronDeep }]}>{formatIndianNumber(done)}</Text>
        <Text style={[styles.total, { color: colors.inkSoft }]}>/ {formatIndianNumber(sankalp.amount)}</Text>
        <Text
          numberOfLines={1}
          style={[
            styles.label,
            {
              color: colors.inkMuted,
              fontFamily: isLatinLang(lang) ? fontFamilies.latinItalic : scriptBodyFont(lang, fontFamilies.devanagari),
            },
          ]}
        >
          {sankalpRowLabel(lang, sankalp)}
        </Text>
        <Text style={[styles.chevron, { color: colors.saffron }]}>›</Text>
      </View>
      <View style={[styles.track, { backgroundColor: colors.parchmentDeep, borderRadius: radii.pill }]}>
        <LinearGradient
          colors={[colors.gold, colors.saffron]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ width: `${pct}%`, height: '100%', borderRadius: radii.pill }}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flex: 1, minWidth: 0, justifyContent: 'center', gap: 4, minHeight: 44 },
  line: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  // Numbers never shrink or truncate; only the secondary label may ellipsize.
  done: { fontFamily: fontFamilies.latinBold, fontSize: 28, lineHeight: 32, includeFontPadding: false, flexShrink: 0 },
  total: { fontFamily: fontFamilies.inter, fontSize: 15, flexShrink: 0 },
  label: { flexShrink: 1, fontSize: 12, lineHeight: 18 },
  chevron: { marginLeft: 'auto', fontSize: 22, lineHeight: 22, includeFontPadding: false, flexShrink: 0 },
  track: { height: 4, overflow: 'hidden' },
});
