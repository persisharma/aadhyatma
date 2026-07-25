import React from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useGitaLanguage } from '@/data/gita/language';
import { radii, spacing } from '@/theme/spacing';
import { useTheme } from '@/theme/ThemeContext';
import { isLatinLang, titleFontByLang } from '@/utils/langType';

/**
 * The canonical reader/chapter top bar: `[back] [centred title] [right slot]`.
 *
 * Every reader and chapters screen used to carry its own copy of this block, and
 * the copies had drifted — paddingHorizontal 16/22, paddingBottom 4/10/12, back
 * buttons at 40 as well as 44, one title hard-coded to 18 instead of the
 * `readerTitle` token. This component fixes the spec in one place (design.md §7);
 * screens supply content, not geometry.
 *
 * Spec: 22pt reading gutter · 8/12 vertical padding · 44×44 circular back control
 * with hitSlop 16 (the app-wide minimum, design.md §12) · title in the language's
 * title face at `typography.readerTitle.fontSize`, italic for English only.
 */
export default function ReaderHeader({
  title,
  onBack,
  backAccessibilityLabel,
  right,
  sideWidth,
  variant = 'reader',
  style,
}: {
  /** Already localized — pass `contentByLang(lang, hi, en)`. */
  title: string;
  onBack: () => void;
  /**
   * Defaults to `"Back"`. Deliberately English and un-localized: the Maestro
   * flows tap this label literally (`deity-browse-smoke`, `vrat-catalog-smoke`),
   * and the default reading language is `hi`, so localizing it here would break
   * e2e. Override when the destination is worth naming ("Back to chapters").
   */
  backAccessibilityLabel?: string;
  /** Trailing content: page counter, audio button, actions. */
  right?: React.ReactNode;
  /**
   * Width of the two balancing side columns. The title is centred in the space
   * between them, so both sides must clear the widest side's content. Defaults to
   * 120 when a `right` slot is present (counter + audio button) and to the bare
   * 44pt control width when it is not.
   */
  sideWidth?: number;
  /**
   * Title scale. `reader` (default) is the compact 16pt reader top bar. `index`
   * is the larger landing-page title the chapters/index screens use — 22, or 20
   * for Latin, whose smaller x-height needs less nominal size to match. Two
   * named scales rather than a loose number so the hierarchy stays a decision.
   */
  variant?: 'reader' | 'index';
  style?: StyleProp<ViewStyle>;
}) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const latin = isLatinLang(lang);
  const side = sideWidth ?? (right ? 120 : 44);
  const titleFontSize =
    variant === 'index' ? (latin ? 20 : 22) : typography.readerTitle.fontSize;

  return (
    <View style={[styles.topBar, style]}>
      <View style={[styles.side, { width: side }]}>
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel={backAccessibilityLabel ?? 'Back'}
          hitSlop={16}
          style={({ pressed }) => [
            styles.back,
            { backgroundColor: colors.parchmentSoft, borderColor: colors.divider },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={[styles.backGlyph, { color: colors.inkSoft }]}>‹</Text>
        </Pressable>
      </View>

      <Text
        style={[
          styles.title,
          {
            color: colors.ink,
            fontFamily: titleFontByLang(lang),
            fontSize: titleFontSize,
            fontStyle: latin ? 'italic' : 'normal',
          },
        ]}
        numberOfLines={1}
      >
        {title}
      </Text>

      <View style={[styles.side, styles.sideRight, { width: side }]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    paddingHorizontal: spacing.readingGutter,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  side: { flexDirection: 'row', alignItems: 'center' },
  sideRight: { justifyContent: 'flex-end' },
  back: {
    width: 44,
    height: 44,
    borderRadius: radii.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backGlyph: { fontSize: 22, lineHeight: 24, marginTop: -2, includeFontPadding: false },
  title: { flex: 1, textAlign: 'center', includeFontPadding: false, marginHorizontal: 4 },
});
