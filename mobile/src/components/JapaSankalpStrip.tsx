import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import type { Lang } from '@/data/gita/language';
import { sankalpProgress, type JapaSankalp } from '@/data/japam/sankalp';
import { eyebrowTextStyle, isLatinLang, scriptBodyFont } from '@/utils/langType';
import { sankalpA11yLabel, sankalpEyebrow, sankalpHeadline } from './japaSankalpCopy';

/**
 * The counter's japa-sankalp progress line (design.md §35.2): a fixed strip above
 * the stats row, shown only while a sankalp exists. Its height does not change
 * as japa is counted, so the mala never re-fits mid-japa. Tap opens the sheet.
 */
export default function JapaSankalpStrip({
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
  const progress = sankalpProgress(sankalp);
  const pct = Math.round(progress.fraction * 1000) / 10;
  return (
    <Pressable
      testID="japa-sankalp-strip"
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`${sankalpA11yLabel(sankalp)}. Change or set aside the sankalp.`}
      accessibilityState={disabled ? { disabled: true } : undefined}
      hitSlop={4}
      style={({ pressed }) => [styles.strip, { borderTopColor: colors.divider }, pressed && { opacity: 0.7 }]}
    >
      <View style={styles.row}>
        <Text style={[eyebrowTextStyle(lang, 13), styles.eyebrow, { color: colors.saffronDeep }]}>
          {sankalpEyebrow(lang, progress.complete)}
        </Text>
        <Text
          style={[
            styles.headline,
            {
              color: colors.ink,
              fontFamily: isLatinLang(lang) ? fontFamilies.latinSemiBold : scriptBodyFont(lang, fontFamilies.devanagari),
            },
          ]}
        >
          {sankalpHeadline(lang, sankalp)}
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
  strip: {
    borderTopWidth: 1,
    paddingLeft: 20,
    paddingRight: 16,
    paddingTop: 6,
    paddingBottom: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    columnGap: 10,
  },
  eyebrow: {
    // ≥1.5× leading so Devanagari matras are never clipped.
    lineHeight: 20,
  },
  headline: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'right',
  },
  chevron: {
    fontSize: 22,
    lineHeight: 22,
    includeFontPadding: false,
  },
  track: {
    height: 5,
    marginTop: 4,
    overflow: 'hidden',
  },
});
