/**
 * साधना — one Home card carrying the whole daily-practice loop (TRD-42 §5.1).
 *
 * Before this, the same state had three doors on one screen: the inline
 * `RoutineBanner`, a full-width नित्य साधना launcher tile, and two Discover
 * cards (नित्य साधना again, and संकल्प). A user could tap three different
 * things and land in the same place, while the japa streak — the one number
 * that actually rewards a daily habit — was not on Home at all.
 *
 * Three cells, each reading a hook that already mounts on Home today, so this
 * adds no startup work (TRD-42 §7).
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang, pick } from '@/utils/localize';
import { scriptTitleFont, scriptBodyFont } from '@/utils/langType';
import { useRoutineToday } from '@/data/routine/useRoutineToday';
import { useSadhanaToday } from '@/data/sadhana/useSadhanaToday';
import { useUserActivity, toDateKey } from '@/contexts/UserActivityContext';
import { computeJapaStreak } from '@/data/japaStreak';
import { useTilePress } from '@/contexts/TilePressContext';
import RoutineBanner from '@/components/RoutineBanner';
import type { SadhanaTodayStatus } from '@/data/sadhana/progress';

/**
 * One height for every variant — three cells, two cells, and the empty-state
 * banner. Home's first painted frame must be its final frame (design.md §64),
 * and all three data sources hydrate from AsyncStorage *after* that frame, so a
 * row that sized itself to its content would shove the उपकरण grid down a
 * beat later. This is the same fix `RoutineBanner` already applies at 57.
 */
const ROW_MIN_HEIGHT = 62;

export default function SadhanaRow({ rowRef }: { rowRef?: React.Ref<View> } = {}) {
  const { colors, radii, spacing, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const navigation = useNavigation<any>();
  const { beginTilePress, finishTilePress, activateTile } = useTilePress();

  const { hasRoutine, doneCount, total } = useRoutineToday();
  const sadhanaCards = useSadhanaToday();
  const { activity } = useUserActivity();

  const sankalp = sadhanaCards[0];
  const japaStreak = React.useMemo(
    () => computeJapaStreak(activity, toDateKey(new Date())),
    [activity]
  );

  // Nothing to report yet: no routine, no sankalp, no japa. The banner already
  // says the right thing ("अपनी नित्य साधना बनाएँ") and is already wired to the
  // create flow, so don't invent a second empty state.
  if (!hasRoutine && !sankalp && japaStreak === 0) {
    return <RoutineBanner variant="inline" bannerRef={rowRef} />;
  }

  const titleFont = lang === 'en' ? fontFamilies.latinBold : scriptTitleFont(lang, fontFamilies.devanagariBold);
  const labelFont = scriptBodyFont(lang, fontFamilies.devanagari);

  const open = (screen: 'RoutineToday' | 'SadhanaPrograms' | 'JapamCounter') => () =>
    navigation.navigate(screen);

  const progressPct = total > 0 ? Math.min(1, doneCount / total) : 0;
  const sankalpDay = sankalp ? sankalpDayNumber(sankalp.status) : 0;
  const sankalpTotal = sankalp?.status.totalDays ?? 0;

  const a11y = [
    hasRoutine ? `Daily practice ${doneCount} of ${total}` : 'Daily practice not set',
    sankalp ? `Sankalp day ${sankalpDay} of ${sankalpTotal}` : null,
    `Japa streak ${japaStreak} days`,
  ]
    .filter(Boolean)
    .join('. ');

  return (
    <View
      ref={rowRef}
      collapsable={false}
      accessibilityRole="summary"
      accessibilityLabel={a11y}
      style={[
        styles.row,
        {
          minHeight: ROW_MIN_HEIGHT,
          borderRadius: radii.lg,
          backgroundColor: colors.parchmentSoft,
          borderColor: colors.divider,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm + 2,
        },
        elevation.card,
      ]}
    >
      <Cell
        label={contentByLang(lang, 'नित्य साधना', 'Daily practice')}
        onPress={open('RoutineToday')}
        first
      >
        <Text style={[styles.value, { color: colors.ink, fontFamily: titleFont }]} numberOfLines={1}>
          {hasRoutine ? `${doneCount}/${total}` : pick(lang, { hi: 'बनाएँ', en: 'Set up', gu: 'સેટ કરો', kn: 'ಹೊಂದಿಸಿ' })}
        </Text>
        {hasRoutine ? (
          <View style={[styles.track, { backgroundColor: colors.divider }]}>
            <View style={[styles.fill, { width: `${progressPct * 100}%`, backgroundColor: colors.saffron }]} />
          </View>
        ) : null}
      </Cell>

      {sankalp ? (
        <Cell label={contentByLang(lang, 'संकल्प', 'Sankalp')} onPress={open('SadhanaPrograms')}>
          <Text style={[styles.value, { color: colors.ink, fontFamily: titleFont }]} numberOfLines={1}>
            {contentByLang(lang, `दिन ${sankalpDay}/${sankalpTotal}`, `Day ${sankalpDay}/${sankalpTotal}`)}
          </Text>
          <Text style={[styles.sub, { color: colors.inkSoft, fontFamily: labelFont }]} numberOfLines={1}>
            {contentByLang(lang, sankalp.program.titleHi, sankalp.program.titleEn)}
          </Text>
        </Cell>
      ) : null}

      <Cell label={contentByLang(lang, 'जप', 'Japa')} onPress={open('JapamCounter')}>
        <Text style={[styles.value, { color: colors.ink, fontFamily: titleFont }]} numberOfLines={1}>
          {contentByLang(lang, `${japaStreak} दिन`, `${japaStreak} days`)}
        </Text>
        <Text style={[styles.sub, { color: colors.inkSoft, fontFamily: labelFont }]} numberOfLines={1}>
          {contentByLang(lang, 'श्रृंखला', 'streak')}
        </Text>
      </Cell>
    </View>
  );

  function Cell({
    label,
    children,
    onPress,
    first,
  }: {
    label: string;
    children: React.ReactNode;
    onPress: () => void;
    first?: boolean;
  }) {
    return (
      <Pressable
        onPress={() => activateTile(onPress)}
        onPressIn={() => beginTilePress(onPress)}
        onPressOut={finishTilePress}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={({ pressed }) => [
          styles.cell,
          !first && { borderLeftWidth: 1, borderLeftColor: colors.divider, paddingLeft: spacing.sm + 2 },
          pressed && { opacity: 0.75 },
        ]}
      >
        <Text style={[styles.label, { color: colors.inkMuted, fontFamily: labelFont }]} numberOfLines={1}>
          {label}
        </Text>
        {children}
      </Pressable>
    );
  }
}

/**
 * The day number to show for a running sankalp.
 *
 * `dayIndex` only exists while a day is live or already offered. A vow that is
 * waiting (a weekday-gated cadence between its days) has no current day, so
 * show the one it is waiting FOR — completed + 1 — rather than dropping to a
 * blank or re-showing the last finished day. A finished vow shows its total.
 *
 * Exported for the unit test: the waiting branch is the one a reader gets wrong.
 */
export function sankalpDayNumber(status: SadhanaTodayStatus): number {
  switch (status.kind) {
    case 'active':
    case 'done-today':
      return status.dayIndex;
    case 'waiting':
      return status.doneCount + 1;
    case 'completed':
      return status.totalDays;
    default:
      return 0;
  }
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'stretch', borderWidth: 1, marginTop: 16 },
  cell: { flex: 1, minWidth: 0, justifyContent: 'center' },
  label: { fontSize: 10.5 },
  value: { fontSize: 15, marginTop: 1, lineHeight: 20 },
  sub: { fontSize: 10.5, marginTop: 1 },
  track: { height: 4, borderRadius: 2, marginTop: 6, overflow: 'hidden' },
  fill: { height: '100%' },
});
