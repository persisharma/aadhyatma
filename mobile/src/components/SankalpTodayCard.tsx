import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { scriptTitleFont, scriptBodyFont } from '@/utils/langType';
import { RoutineButton } from '@/components/RoutineShell';
import PracticeSeal from '@/components/PracticeSeal';
import { useSadhana } from '@/contexts/SadhanaContext';
import { offeredTail } from '@/data/routine/practiceView';
import { navigateToRoutineItem } from '@/navigation/entryRoutes';
import type { SadhanaTodayCard as CardData } from '@/data/sadhana/useSadhanaToday';
import type { HomeStackParamList } from '@/navigation/types';

/**
 * One enrolled sankalp's card in the Today's Practice screen. Shows the current
 * day's unit when open, auto-commits the day when its reading/japa is done
 * today, and plays a पूर्णाहुति seal when the whole vow completes.
 */
export default function SankalpTodayCard({ card }: { card: CardData }) {
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const { commitDay, markCelebrated, wasCelebrated } = useSadhana();
  const nav = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();

  const { program, status, items, allItemsDoneToday, autoVia } = card;

  // Auto-commit: once every item of today's open day is genuinely done today,
  // record the day so the vow advances (and unlocks the next day tomorrow).
  useEffect(() => {
    if (status.kind === 'active' && allItemsDoneToday) {
      commitDay(program.id, status.dayIndex, autoVia);
    }
  }, [status, allItemsDoneToday, autoVia, program.id, commitDay]);

  // पूर्णाहुति celebration guard — play the seal once per completed program.
  const isCompleted = status.kind === 'completed';
  useEffect(() => {
    if (isCompleted && !wasCelebrated(program.id)) markCelebrated(program.id);
  }, [isCompleted, program.id, wasCelebrated, markCelebrated]);

  const title = contentByLang(lang, program.titleHi, program.titleEn);
  const dayLabel =
    status.kind === 'completed'
      ? contentByLang(lang, 'पूर्णाहुति', 'Sankalp complete')
      : contentByLang(
          lang,
          `संकल्प · दिन ${status.dayIndex} / ${status.totalDays}`,
          `Sankalp · Day ${status.dayIndex} / ${status.totalDays}`
        );

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.parchmentSoft, borderColor: colors.saffron, borderRadius: radii.lg, padding: spacing.lg },
        elevation.card,
      ]}
    >
      <Text style={{ fontFamily: typography.cardLatin.fontFamily, fontSize: 12, color: colors.saffronDeep, letterSpacing: 0.5 }}>
        {dayLabel.toUpperCase()}
      </Text>
      <Text
        style={{
          fontFamily: scriptTitleFont(lang, typography.cardHindi.fontFamily),
          fontSize: 20,
          color: colors.ink,
          marginTop: 2,
        }}
      >
        {title}
      </Text>

      {status.kind === 'completed' && (
        <View style={{ alignItems: 'center', marginTop: spacing.md }}>
          <PracticeSeal size={64} />
          <Text
            style={{
              fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
              fontSize: 14,
              color: colors.inkSoft,
              textAlign: 'center',
              marginTop: spacing.sm,
            }}
          >
            {meaningByLang(
              lang,
              `${status.totalDays} दिनों का संकल्प पूर्ण हुआ। 🙏`,
              `Your ${status.totalDays}-day sankalp is complete. 🙏`
            )}
          </Text>
        </View>
      )}

      {status.kind === 'done-today' && (
        <Text
          style={{
            fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
            fontSize: 14,
            color: colors.inkSoft,
            marginTop: spacing.sm,
          }}
        >
          {meaningByLang(
            lang,
            'आज का पाठ पूर्ण। कल पुनः पधारें 🌅',
            "Today's reading is done. Come back tomorrow 🌅"
          )}
        </Text>
      )}

      {status.kind === 'active' && (
        <>
          <View style={{ marginTop: spacing.md }}>
            {items.map((it, i) => {
              const tail = offeredTail(it.done, it.doneAt, lang);
              const titleMain = contentByLang(lang, it.display.titleHi, it.display.titleEn);
              return (
                <Pressable
                  key={it.key}
                  onPress={() => navigateToRoutineItem(nav, it.item)}
                  style={[
                    styles.itemRow,
                    { borderTopColor: colors.divider, borderTopWidth: i === 0 ? 0 : 1 },
                  ]}
                >
                  <View
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 13,
                      borderWidth: 2,
                      borderColor: colors.saffron,
                      backgroundColor: it.done ? colors.saffron : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {it.done && <Text style={{ color: colors.onPrimary, fontSize: 13 }}>✓</Text>}
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      style={{
                        fontFamily: scriptTitleFont(lang, typography.cardHindi.fontFamily),
                        fontSize: 16,
                        color: it.done ? colors.inkMuted : colors.ink,
                      }}
                    >
                      {titleMain}
                    </Text>
                    <Text style={{ fontFamily: typography.cardLatin.fontFamily, fontSize: 12, color: colors.saffronDeep, marginTop: 2 }}>
                      {contentByLang(lang, it.display.subHi, it.display.subEn)} · {tail}
                    </Text>
                  </View>
                  <Text style={{ color: colors.saffron, fontSize: 18 }}>›</Text>
                </Pressable>
              );
            })}
          </View>

          {!allItemsDoneToday && (
            <RoutineButton
              label={contentByLang(lang, 'आज का पाठ अर्पित करें', "Mark today's practice done")}
              variant="ghost"
              onPress={() => commitDay(program.id, status.dayIndex, 'marked')}
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, marginBottom: 16 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
});
