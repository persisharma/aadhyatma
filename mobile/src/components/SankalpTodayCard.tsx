import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { scriptTitleFont, scriptBodyFont, pillTextStyle } from '@/utils/langType';
import PracticeSeal from '@/components/PracticeSeal';
import { useSadhana } from '@/contexts/SadhanaContext';
import { offeredTail } from '@/data/routine/practiceView';
import { navigateToRoutineItem } from '@/navigation/entryRoutes';
import type { SadhanaTodayCard as CardData } from '@/data/sadhana/useSadhanaToday';
import type { HomeStackParamList } from '@/navigation/types';

/**
 * One enrolled sankalp's card in the Today's Practice screen. Shows the current
 * day's unit when open. The root-mounted SadhanaCompletionOverlay owns
 * auto-commit and पूर्णाहुति celebration so completion works from any screen.
 */
export default function SankalpTodayCard({ card }: { card: CardData }) {
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const { commitDay } = useSadhana();
  const nav = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();

  const { program, status, items } = card;

  const title = contentByLang(lang, program.titleHi, program.titleEn);
  let dayLabel: string;
  if (status.kind === 'completed') {
    dayLabel = contentByLang(lang, 'पूर्णाहुति', 'Sankalp complete');
  } else if (status.kind === 'waiting') {
    dayLabel = contentByLang(
      lang,
      `संकल्प · ${status.doneCount} / ${status.totalDays}`,
      `Sankalp · ${status.doneCount} / ${status.totalDays}`
    );
  } else {
    dayLabel = contentByLang(
      lang,
      `संकल्प · दिन ${status.dayIndex} / ${status.totalDays}`,
      `Sankalp · Day ${status.dayIndex} / ${status.totalDays}`
    );
  }

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.parchmentSoft, borderColor: colors.saffron, borderRadius: radii.lg, padding: spacing.lg },
        elevation.card,
      ]}
    >
      <Text style={[pillTextStyle(lang, typography.sectionLabel), { color: colors.saffronDeep }]}>
        {dayLabel}
      </Text>
      <Text
        style={{
          fontFamily: scriptTitleFont(lang, typography.cardHindi.fontFamily),
          fontSize: typography.cardHindi.fontSize + 3,
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
              fontSize: typography.meaning.fontSize,
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
            fontSize: typography.meaning.fontSize,
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

      {status.kind === 'waiting' && (
        <Text
          style={{
            fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
            fontSize: typography.meaning.fontSize,
            color: colors.inkSoft,
            marginTop: spacing.sm,
            lineHeight: typography.meaning.lineHeight,
          }}
        >
          {status.reason === 'window-upcoming'
            ? meaningByLang(
                lang,
                status.whenKey
                  ? `संकल्प ${formatShortDate(status.whenKey, lang)} से आरम्भ। 🪔`
                  : 'संकल्प उत्सव आरम्भ होते ही जागृत होगा। 🪔',
                status.whenKey
                  ? `Your sankalp begins ${formatShortDate(status.whenKey, lang)}. 🪔`
                  : 'Your sankalp awakens when the festival begins. 🪔'
              )
            : meaningByLang(
                lang,
                status.whenKey
                  ? `आज विश्राम — अगला पाठ ${formatShortDate(status.whenKey, lang)}। 🌙`
                  : 'आज विश्राम — अगले नियत दिन पर। 🌙',
                status.whenKey
                  ? `Resting today — your next practice is ${formatShortDate(status.whenKey, lang)}. 🌙`
                  : 'Resting today — until the next eligible day. 🌙'
              )}
        </Text>
      )}

      {(status.kind === 'active' || (status.kind === 'waiting' && items.length > 0)) && (
        <>
          <View style={{ marginTop: spacing.md }}>
            {items.map((it, i) => {
              const tail = offeredTail(it.done, it.doneAt, lang);
              const titleMain = contentByLang(lang, it.display.titleHi, it.display.titleEn);
              const canMark = status.kind === 'active' && !it.done;
              return (
                <View
                  key={it.key}
                  style={[
                    styles.itemRow,
                    { borderTopColor: colors.divider, borderTopWidth: i === 0 ? 0 : 1 },
                  ]}
                >
                  <Pressable
                    onPress={canMark ? () => commitDay(program.id, status.dayIndex, 'marked') : undefined}
                    accessibilityRole="button"
                    accessibilityState={{ checked: it.done }}
                    accessibilityLabel={
                      it.done
                        ? contentByLang(lang, 'अर्पित', 'Offered')
                        : contentByLang(lang, 'अर्पित चिह्नित करें', 'Mark offered')
                    }
                    hitSlop={10}
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
                  </Pressable>
                  <Pressable style={{ flex: 1, minWidth: 0 }} onPress={() => navigateToRoutineItem(nav, it.item)}>
                    <Text
                      style={{
                        fontFamily: scriptTitleFont(lang, typography.cardHindi.fontFamily),
                        fontSize: typography.cardHindi.fontSize,
                        color: it.done ? colors.inkMuted : colors.ink,
                      }}
                    >
                      {titleMain}
                    </Text>
                    <Text
                      style={{
                        fontFamily: scriptBodyFont(lang, typography.cardMeta.fontFamily),
                        fontSize: typography.cardMeta.fontSize,
                        color: colors.saffronDeep,
                        marginTop: 2,
                      }}
                    >
                      {contentByLang(lang, it.display.subHi, it.display.subEn)} · {tail}
                    </Text>
                  </Pressable>
                  <Pressable onPress={() => navigateToRoutineItem(nav, it.item)} hitSlop={8}>
                    <Text style={[styles.chev, { color: colors.saffron }]}>›</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>

        </>
      )}
    </View>
  );
}

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_HI = ['जन', 'फ़र', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुल', 'अग', 'सित', 'अक्तू', 'नव', 'दिस'];

/** 'YYYY-MM-DD' → a short readable date like "14 Jul" / "14 जुल". */
function formatShortDate(key: string, lang: string): string {
  const [, m, d] = key.split('-').map((n) => parseInt(n, 10));
  if (!m || !d) return key;
  const months = lang === 'en' ? MONTHS_EN : MONTHS_HI;
  return `${d} ${months[m - 1] ?? ''}`.trim();
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, marginBottom: 16 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  chev: { fontSize: 26 },
});
