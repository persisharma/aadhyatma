import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import AppIcon from './AppIcon';

/**
 * Fixed pager footer for a short paged lesson (design.md §87): the readers'
 * pager dots, flanked by round previous / next buttons so turning a page never
 * depends on finding a swipe or scrolling to the end of a page.
 *
 * Same control class as the ReaderHeader back button: a 44pt circle in a 48pt
 * target. On the last page the next button becomes the filled "finish" action.
 * The bar has no fill of its own: it sits on the reader's paper, under a rule.
 */
export default function PagerNavBar({ page, total, onPrevious, onNext, previousLabel, nextLabel, finishLabel, pageLabel, nextTestID }: {
  /** 0-based current page. */
  page: number;
  total: number;
  onPrevious: () => void;
  /** Called for both "next page" and, on the last page, "finish". */
  onNext: () => void;
  /** Already localized accessibility labels. */
  previousLabel: string;
  nextLabel: string;
  finishLabel: string;
  pageLabel: string;
  nextTestID?: string;
}) {
  const { colors, spacing } = useTheme();
  const first = page <= 0;
  const last = page >= total - 1;
  return (
    <View testID="pager-nav-bar" style={[styles.bar, { paddingHorizontal: spacing.readingGutter, borderTopColor: colors.divider }]}>
      <Pressable testID="pager-previous" onPress={onPrevious} disabled={first} accessibilityRole="button"
        accessibilityLabel={previousLabel} accessibilityState={{ disabled: first }}
        style={({ pressed }) => [styles.target, first && { opacity: 0.4 }, pressed && { opacity: 0.7 }]}>
        <View style={[styles.round, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider }]}>
          <View style={styles.mirrored}><AppIcon name="next" size={20} color={colors.iconInk} /></View>
        </View>
      </Pressable>
      <View testID="pager-dots" accessible accessibilityRole="text" accessibilityLabel={pageLabel} style={styles.dots}>
        {Array.from({ length: total }, (_, index) => (
          <View key={index} style={index === page
            ? [styles.dotCurrent, { backgroundColor: colors.saffronDeep }]
            : [styles.dot, { backgroundColor: colors.dotRest }]} />
        ))}
      </View>
      <Pressable testID={nextTestID ?? 'pager-next'} onPress={onNext} accessibilityRole="button"
        accessibilityLabel={last ? finishLabel : nextLabel}
        style={({ pressed }) => [styles.target, pressed && { opacity: 0.7 }]}>
        <View style={[styles.round, last
          ? { backgroundColor: colors.saffronDeep, borderColor: colors.saffronDeep }
          : { backgroundColor: colors.parchmentSoft, borderColor: colors.divider }]}>
          <AppIcon name={last ? 'check' : 'next'} size={20} color={last ? colors.brandIvory : colors.iconInk} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 6, paddingBottom: 6, borderTopWidth: 1 },
  target: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  round: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  mirrored: { transform: [{ scaleX: -1 }] },
  dots: { flex: 1, minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotCurrent: { width: 18, height: 6, borderRadius: 999 },
});
