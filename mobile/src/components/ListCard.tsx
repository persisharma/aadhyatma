import React, { createContext, useContext } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type AccessibilityActionEvent,
  type AccessibilityActionInfo,
  type AccessibilityRole,
  type AccessibilityState,
  type AccessibilityValue,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';
import { elevation } from '@/theme/elevation';
import { useRoutineSheet } from '@/contexts/RoutineSheetContext';
import { metaFont } from '@/utils/scriptFont';
import type { OrderedTitlePart, TitleSizeScale } from '@/utils/titleByLanguage';

/**
 * The app's one list-row card (design.md §8). Every list row — library entries,
 * sadhana programs, vidhis, audio tracks, chapter indexes, Muhurat/Namkaran rows,
 * Theerth and deity browse rows — renders this shell, so rows can't drift apart
 * again (an Oct 2026 audit found ten hand-rolled copies at four paddings, five
 * thumb sizes and three shadow tiers).
 *
 * Two sizes, fixed here:
 * - `regular` — content rows: padding 18, gap 14, 52dp thumb; title · second-
 *   language name · meta.
 * - `compact` — browse/group rows (Theerth groups, deities): padding 14, gap 12,
 *   44dp thumb; title · meta.
 *
 * Two surfaces: the active `cardActive` gradient on a `lifted` shadow, or
 * `disabled` (a "coming soon" entry) — flat `cardSurface`, divider border,
 * `subtle` shadow, not pressable. There is no other surface.
 *
 * Callers own only the slots: `leading` (usually `<CardThumb>`), the text column
 * (usually `<CardTitles>`, then any read-progress row beneath it), `right`
 * (defaults to the › chevron) and `overlay` (an absolutely-positioned
 * NEW/SOON badge). The trailing slot follows the
 * behaviour rule: › opens · ＋ › opens and can be added to a routine · ▶ plays
 * in place · pill › opens and shows progress · SOON is disabled. Compact rows
 * never carry ＋ — groups are not routine items.
 */
export type ListCardSize = 'regular' | 'compact';

/** Title sizes every row passes to `orderTitlesByLanguage` (design.md §8). */
export const CARD_TITLE_SIZES: TitleSizeScale = {
  devPrimary: 17,
  devSecondary: 13,
  latPrimary: 19,
  latSecondary: 12,
};

const SHELL = {
  regular: { padding: 18, gap: 14, thumb: 52 },
  compact: { padding: 14, gap: 12, thumb: 44 },
} as const;

const SizeContext = createContext<ListCardSize>('regular');
const DisabledContext = createContext(false);

/**
 * The gradient thumb tile; sized by the enclosing card, muted when it is
 * disabled. `done` fills it solid `saffron-deep` — a finished chapter's ✓
 * (design.md §84).
 */
export function CardThumb({ children, done = false, testID }: { children: React.ReactNode; done?: boolean; testID?: string }) {
  const { colors, radii } = useTheme();
  const size = SHELL[useContext(SizeContext)].thumb;
  const disabled = useContext(DisabledContext);
  const box = { width: size, height: size, borderRadius: radii.md };
  if (done) {
    return <View testID={testID} style={[styles.thumb, box, { backgroundColor: colors.saffronDeep }]}>{children}</View>;
  }
  if (disabled) {
    return (
      <View style={[styles.thumb, box, styles.thumbRest, { backgroundColor: colors.cardThumbRest, borderColor: colors.divider }]}>
        <View style={styles.muted}>{children}</View>
      </View>
    );
  }
  return (
    <LinearGradient
      colors={[colors.cardThumbActiveFrom, colors.cardThumbActiveTo]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.thumb, box]}
    >
      {children}
    </LinearGradient>
  );
}

type TitleLine = Pick<OrderedTitlePart, 'text' | 'fontFamily' | 'fontSize' | 'fontStyle' | 'letterSpacing'>;

/** A row's meta line: 11, script serif for Indic text, Inter + tracking for Latin. */
export function CardMeta({ children }: { children: string }) {
  const { colors, typography } = useTheme();
  return (
    <Text style={[styles.meta, { color: colors.inkMuted, fontSize: typography.cardMeta.fontSize, ...metaFont(children) }]}>
      {children}
    </Text>
  );
}

/**
 * The text column: primary title (wraps — never clamped, a cut Devanagari title
 * can lose its meaning), optional second-language name, optional meta.
 */
export function CardTitles({ primary, secondary, meta }: { primary: TitleLine; secondary?: TitleLine; meta?: string }) {
  const { colors } = useTheme();
  const compact = useContext(SizeContext) === 'compact';
  const dim = useContext(DisabledContext) ? styles.muted : null;
  const line = (part: TitleLine) => ({
    fontFamily: part.fontFamily,
    fontSize: part.fontSize,
    fontStyle: part.fontStyle,
    letterSpacing: part.letterSpacing,
  });
  return (
    <>
      <Text style={[line(primary), { color: colors.ink }, secondary || meta ? styles.afterTitle : null, dim]}>
        {primary.text}
      </Text>
      {secondary ? (
        <Text
          style={[line(secondary), { color: colors.inkMuted }, meta ? (compact ? styles.afterTitle : styles.beforeMeta) : null, dim]}
        >
          {secondary.text}
        </Text>
      ) : null}
      {meta ? <CardMeta>{meta}</CardMeta> : null}
    </>
  );
}

/**
 * The ＋ › trailing pair for rows that can join a routine: ＋ opens the
 * add-to-routine sheet for `sourceId` (its own 30dp target, 12dp hit slop); the
 * card itself still opens the item.
 */
export function CardRoutineTail({ sourceId, nameEn }: { sourceId: string; nameEn: string }) {
  const { colors, radii } = useTheme();
  const { openAddToRoutine } = useRoutineSheet();
  return (
    <View style={styles.tail}>
      <Pressable
        onPress={() => openAddToRoutine(sourceId)}
        accessibilityRole="button"
        accessibilityLabel={`Add ${nameEn} to a routine`}
        hitSlop={12}
        style={({ pressed }) => [
          styles.addBtn,
          { borderColor: colors.gold, borderRadius: radii.pill },
          pressed && { opacity: 0.6 },
        ]}
      >
        <Text style={{ color: colors.saffron, fontSize: 18, lineHeight: 20 }}>＋</Text>
      </Pressable>
      <Text style={[styles.chev, { color: colors.saffron }]}>›</Text>
    </View>
  );
}

export default function ListCard({
  leading,
  children,
  right,
  overlay,
  size = 'regular',
  disabled = false,
  onPress,
  onPressIn,
  onLongPress,
  accessibilityLabel,
  accessibilityRole = 'button',
  accessibilityState,
  accessibilityValue,
  accessibilityActions,
  onAccessibilityAction,
  testID,
  style,
}: {
  leading?: React.ReactNode;
  /** The text column — usually `<CardTitles>`. */
  children: React.ReactNode;
  /** Trailing content; defaults to the saffron chevron (none when disabled). */
  right?: React.ReactNode;
  /** Absolutely-positioned extras drawn over the card (NEW / SOON badges). */
  overlay?: React.ReactNode;
  size?: ListCardSize;
  /** A "coming soon" row: muted surface, not pressable. */
  disabled?: boolean;
  onPress?: () => void;
  onPressIn?: () => void;
  /** Read-coverage reset (design.md §84). */
  onLongPress?: () => void;
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
  /** Read progress rides here so the label stays the stable e2e selector. */
  accessibilityValue?: AccessibilityValue;
  accessibilityActions?: AccessibilityActionInfo[];
  onAccessibilityAction?: (event: AccessibilityActionEvent) => void;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors, radii } = useTheme();
  const shell = SHELL[size];
  const frame = [
    styles.card,
    { padding: shell.padding, gap: shell.gap, borderRadius: radii.lg },
  ];
  const content = (
    <SizeContext.Provider value={size}>
      <DisabledContext.Provider value={disabled}>
        {leading != null && <View style={styles.leading}>{leading}</View>}
        <View style={styles.text}>{children}</View>
        {right !== undefined ? right : disabled ? null : <Text style={[styles.chev, { color: colors.saffron }]}>›</Text>}
        {overlay}
      </DisabledContext.Provider>
    </SizeContext.Provider>
  );

  if (disabled) {
    return (
      <View
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ ...accessibilityState, disabled: true }}
        style={[frame, { backgroundColor: colors.cardSurface, borderColor: colors.divider }, elevation.subtle, style]}
      >
        {content}
      </View>
    );
  }

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      onPressIn={onPressIn}
      onLongPress={onLongPress}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityState}
      accessibilityValue={accessibilityValue}
      accessibilityActions={accessibilityActions}
      onAccessibilityAction={onAccessibilityAction}
      style={({ pressed }) => [
        frame,
        // Opaque base so the Android shadow renders; the gradient carries its
        // own radius rather than overflow:'hidden', which clips the iOS shadow
        // (design.md §4).
        { backgroundColor: colors.cardActiveFrom, borderColor: colors.cardActiveBorder },
        elevation.lifted,
        pressed && styles.pressed,
        style,
      ]}
    >
      <LinearGradient
        colors={[colors.cardActiveFrom, colors.cardActiveTo]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: radii.lg }]}
      />
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 12,
  },
  pressed: { opacity: 0.85 },
  leading: { flexShrink: 0 },
  text: { flex: 1, minWidth: 0 },
  thumb: { alignItems: 'center', justifyContent: 'center' },
  thumbRest: { borderWidth: 1 },
  muted: { opacity: 0.55 },
  afterTitle: { marginBottom: 2 },
  beforeMeta: { marginBottom: 6 },
  meta: { opacity: 0.9 },
  chev: { fontSize: 26, marginLeft: 4, flexShrink: 0 },
  tail: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 0 },
  addBtn: { width: 30, height: 30, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
