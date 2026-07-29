import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { elevation } from '@/theme/elevation';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { scriptBodyFont, pillTextStyle } from '@/utils/langType';
import { orderTitlesByLanguage } from '@/utils/titleByLanguage';
import { RoutineShell } from '@/components/RoutineShell';
import { getRandomDeityBackground } from '@/data/backgrounds';
import { useSadhana } from '@/contexts/SadhanaContext';
import { SADHANA_PROGRAMS } from '@/data/sadhana/programs';
import { completedDayCount, programDayCount } from '@/data/sadhana/progress';
import type { SadhanaProgram, SadhanaEnrollment } from '@/data/sadhana/types';
import type { HomeStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'SadhanaPrograms'>;

/**
 * One program row on the sankalp listing — the same active-card language as
 * `LibraryCard` (design.md §8): a warm gradient surface with a first-glyph
 * gradient thumb, both reading languages ordered by the active one, a status
 * pill, and a saffron chevron. Every program is startable, so all cards read as
 * active (no dormant/"coming" variant); the pill carries the day-count / state.
 */
function ProgramCard({
  program,
  enrollment,
  onPress,
}: {
  program: SadhanaProgram;
  enrollment?: SadhanaEnrollment;
  onPress: () => void;
}) {
  const { colors, typography, radii } = useTheme();
  const { lang } = useGitaLanguage();

  const total = programDayCount(program);
  const done = enrollment ? completedDayCount(enrollment) : 0;
  const isDone = enrollment?.status === 'completed';
  const isActive = enrollment?.status === 'active';

  const { primary, secondary } = orderTitlesByLanguage(lang, program.titleHi, program.titleEn, {
    devPrimary: 17,
    devSecondary: 13,
    latPrimary: 19,
    latSecondary: 12,
  });

  const badge = isDone
    ? contentByLang(lang, '✓ पूर्ण', '✓ Complete')
    : isActive
      ? contentByLang(lang, `दिन ${done} / ${total}`, `Day ${done} / ${total}`)
      : contentByLang(lang, `${total} दिन`, `${total} days`);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${program.titleEn}. ${program.subtitleEn}. Tap to open.`}
      style={({ pressed }) => [
        styles.card,
        {
          borderRadius: radii.lg,
          borderColor: colors.cardActiveBorder,
          borderWidth: 1,
          ...elevation.raised,
          opacity: isDone ? 0.9 : 1,
        },
        pressed && styles.cardPressed,
      ]}
    >
      <LinearGradient
        colors={[colors.cardActiveFrom, colors.cardActiveTo]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.cardBg, { borderRadius: radii.lg }]}
      />

      <LinearGradient
        colors={[colors.cardThumbActiveFrom, colors.cardThumbActiveTo]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.thumb, { borderRadius: radii.md }]}
      >
        <Text
          style={{ color: colors.parchmentSoft, fontFamily: typography.thumb.fontFamily, fontSize: typography.thumb.fontSize }}
        >
          {program.thumb}
        </Text>
      </LinearGradient>

      <View style={styles.meta}>
        <Text
          style={{
            color: colors.ink,
            fontFamily: primary.fontFamily,
            fontSize: primary.fontSize,
            fontStyle: primary.fontStyle,
            letterSpacing: primary.letterSpacing,
            marginBottom: 2,
          }}
        >
          {primary.text}
        </Text>
        <Text
          style={{
            color: colors.inkMuted,
            fontFamily: secondary.fontFamily,
            fontSize: secondary.fontSize,
            fontStyle: secondary.fontStyle,
          }}
        >
          {secondary.text}
        </Text>
      </View>

      <View style={styles.tail}>
        <View
          style={[
            styles.badge,
            { backgroundColor: colors.parchmentHighlight, borderColor: colors.goldTint, borderRadius: radii.pill },
          ]}
        >
          <Text style={[pillTextStyle(lang, typography.cardMeta), { color: colors.saffronDeep }]}>
            {badge}
          </Text>
        </View>
        <Text style={[styles.chev, { color: colors.saffron }]}>›</Text>
      </View>
    </Pressable>
  );
}

export default function SadhanaProgramListScreen({ navigation }: Props) {
  const { colors, typography, spacing } = useTheme();
  const { lang } = useGitaLanguage();
  const { enrollmentFor } = useSadhana();
  // Multi-deity index (like the "By Deity" screen) — a stable random deity
  // backdrop per mount so the sankalp catalog sits on the sepia sketch, not flat.
  const background = useMemo(() => getRandomDeityBackground(), []);

  const withStatus = SADHANA_PROGRAMS.map((p) => ({ p, e: enrollmentFor(p.id) }));
  const inProgress = withStatus.filter((x) => x.e?.status === 'active');
  const completed = withStatus.filter((x) => x.e?.status === 'completed');
  const available = withStatus.filter((x) => x.e?.status !== 'active' && x.e?.status !== 'completed');

  const Section = ({ titleHi, titleEn, rows }: { titleHi: string; titleEn: string; rows: typeof withStatus }) =>
    rows.length === 0 ? null : (
      <>
        <Text
          style={[
            pillTextStyle(lang, typography.sectionLabel),
            { color: colors.inkMuted, marginTop: spacing.md, marginBottom: spacing.sm },
          ]}
        >
          {contentByLang(lang, titleHi, titleEn)}
        </Text>
        {rows.map(({ p, e }) => (
          <ProgramCard
            key={p.id}
            program={p}
            enrollment={e}
            onPress={() => navigation.navigate('SadhanaProgramDetail', { programId: p.id })}
          />
        ))}
      </>
    );

  return (
    <RoutineShell titleHi="संकल्प" titleEn="Sadhana Programs" background={background} onBack={() => navigation.goBack()}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.xxl, paddingTop: 8, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{
            fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
            fontSize: typography.meaning.fontSize,
            color: colors.inkSoft,
            lineHeight: typography.meaning.lineHeight,
            marginBottom: spacing.lg,
          }}
        >
          {contentByLang(
            lang,
            'एक तैयार संकल्प चुनें — नियत दिनों तक प्रतिदिन का पाठ, पूर्ण होने तक।',
            'Choose a ready sankalp — a daily reading for a set number of days, all the way to completion.'
          )}
        </Text>

        <Section titleHi="चल रहा है" titleEn="In progress" rows={inProgress} />
        <Section titleHi="उपलब्ध" titleEn="Available" rows={available} />
        <Section titleHi="पूर्ण संकल्प" titleEn="Completed sankalps" rows={completed} />
      </ScrollView>
    </RoutineShell>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    padding: 18,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    overflow: 'hidden',
  },
  cardBg: { ...StyleSheet.absoluteFillObject },
  cardPressed: { opacity: 0.85 },
  thumb: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center' },
  meta: { flex: 1, minWidth: 0 },
  tail: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1 },
  chev: { fontSize: 26, marginLeft: 2 },
});
