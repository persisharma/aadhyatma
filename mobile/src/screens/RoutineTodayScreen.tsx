import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang, meaningByLang, pick } from '@/utils/localize';
import { scriptBodyFont } from '@/utils/langType';
import { useRoutines } from '@/contexts/RoutineContext';
import { useUserActivity } from '@/contexts/UserActivityContext';
import { useRoutineToday } from '@/data/routine/useRoutineToday';
import { useSadhanaToday } from '@/data/sadhana/useSadhanaToday';
import { practiceSummary, offeredTail } from '@/data/routine/practiceView';
import { navigateToRoutineItem } from '@/navigation/entryRoutes';
import { RoutineShell, RoutineButton } from '@/components/RoutineShell';
import SankalpTodayCard from '@/components/SankalpTodayCard';
import MalaStreak from '@/components/MalaStreak';
import PracticeSeal from '@/components/PracticeSeal';
import PracticeHero from '@/components/PracticeHero';
import PracticeItemRow from '@/components/PracticeItemRow';
import type { HomeStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'RoutineToday'>;

export default function RoutineTodayScreen({ navigation }: Props) {
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const { markManualDone, unmarkManualDone } = useRoutines();
  const { currentStreak } = useUserActivity();
  const { entries, doneCount, total } = useRoutineToday();
  const sadhanaCards = useSadhanaToday();
  // General-typed nav for the centralized routing helper (this screen has no
  // route params, which is incompatible with the helper's route-agnostic Nav).
  const itemNav = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const streak = currentStreak();
  const summary = practiceSummary(doneCount, total, lang);
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  const right = (
    <Pressable
      onPress={() => navigation.navigate('RoutineList')}
      accessibilityRole="button"
      accessibilityLabel={contentByLang(lang, 'सभी साधनाएँ', 'All routines')}
      hitSlop={12}
    >
      <Text style={{ color: colors.saffron, fontSize: 22 }}>≡</Text>
    </Pressable>
  );

  return (
    <RoutineShell
      titleHi="आज की साधना"
      titleEn="Today's Practice"
      onBack={() => navigation.goBack()}
      right={right}
    >
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: 8, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <PracticeHero doneCount={doneCount} total={total} />
        {total === 0 ? (
          sadhanaCards.length === 0 ? (
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: colors.parchmentSoft,
                borderColor: colors.goldTint,
                borderRadius: radii.lg,
              },
              elevation.card,
            ]}
          >
            <Text style={{ fontFamily: typography.readerTitle.fontFamily, fontSize: 30, color: colors.inkMuted, opacity: 0.4 }}>
              ॥
            </Text>
            <Text
              style={{
                fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
                fontSize: 14,
                color: colors.inkMuted,
                textAlign: 'center',
                marginTop: 12,
              }}
            >
              {meaningByLang(lang, 'आज के लिए कोई पाठ निर्धारित नहीं', 'Nothing scheduled for today')}
            </Text>
            <RoutineButton
              label={contentByLang(lang, 'साधना जोड़ें', 'Add a routine')}
              variant="ghost"
              onPress={() => navigation.navigate('RoutineList')}
            />
          </View>
          ) : null
        ) : (
          <>
            <View style={[styles.summary, { backgroundColor: colors.parchmentSoft, borderColor: colors.goldTint,
              borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.lg }]}>
              <MalaStreak streak={streak} />
              {summary.allDone ? <PracticeSeal size={48} /> : (
                <View style={[styles.track, { backgroundColor: colors.parchmentDeep, borderRadius: radii.pill, marginTop: spacing.md }]}>
                  <LinearGradient colors={[colors.gold, colors.saffron]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={{ width: `${pct}%`, height: '100%', borderRadius: radii.pill }} />
                </View>
              )}
            </View>
            {entries.map(e => {
              const title = contentByLang(lang, e.display.titleHi, e.display.titleEn);
              const auto = e.done && e.doneMode !== 'manual';
              return <PracticeItemRow key={e.key} item={e.item} title={title} done={e.done}
                subtitle={`${contentByLang(lang, e.display.subHi, e.display.subEn)} · ${offeredTail(e.done, e.doneAt, lang)}`}
                onRead={() => navigateToRoutineItem(itemNav, e.item)}
                onOffer={() => e.done ? unmarkManualDone(e.key) : markManualDone(e.key)}
                offerDisabled={auto}
                offerLabel={auto
                  ? contentByLang(lang, 'पढ़ने से स्वतः अर्पित', 'Offered automatically by reading')
                  : e.done ? contentByLang(lang, 'अर्पित — चिह्न हटाएँ', 'Offered — tap to undo')
                    : contentByLang(lang, 'अर्पित चिह्नित करें', 'Mark offered')} />;
            })}
          </>
        )}

        {/* Prebuilt sankalps sit below the daily routine. The top gap only
            applies when a daily routine is present above them; with no routine
            the ScrollView's own paddingTop handles the spacing. */}
        {sadhanaCards.length > 0 && (
          <View style={{ marginTop: total > 0 ? spacing.xl : 0 }}>
            {sadhanaCards.map((c) => (
              <SankalpTodayCard key={c.program.id} card={c} />
            ))}
          </View>
        )}

        {/* Discovery: the prebuilt-sankalp catalog must stay reachable outside
            the create-routine chooser (its only other entry point). */}
        <RoutineButton
          label={pick(lang, {
            hi: 'तैयार संकल्प चुनें',
            en: 'Browse sankalps',
            gu: 'તૈયાર સંકલ્પ પસંદ કરો',
            kn: 'ಸಿದ್ಧ ಸಂಕಲ್ಪ ಆರಿಸಿ',
          })}
          variant="ghost"
          onPress={() => navigation.navigate('SadhanaPrograms')}
        />
      </ScrollView>
    </RoutineShell>
  );
}

const styles = StyleSheet.create({
  emptyCard: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20, borderWidth: 1 },
  summary: { alignItems: 'center', borderWidth: 1 },
  track: { height: 5, width: '100%', overflow: 'hidden' },
});
