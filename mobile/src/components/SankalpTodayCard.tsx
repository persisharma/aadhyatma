import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { scriptTitleFont, scriptBodyFont, pillTextStyle } from '@/utils/langType';
import PracticeSeal from '@/components/PracticeSeal';
import { useSadhana } from '@/contexts/SadhanaContext';
import { completedDayCount } from '@/data/sadhana/progress';
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

  // The line items collapse by default and drop down when the card header is
  // tapped — the same tap-to-expand affordance the user knows from a routine
  // card, so a sankalp with several units stays a compact ledger row until
  // opened. Only `active` (to-do) and `waiting`-with-items (read-ahead preview)
  // days carry units; `done-today`/`completed` have nothing to drop down, so
  // the header is not tappable there.
  const hasItems = items.length > 0 && (status.kind === 'active' || status.kind === 'waiting');
  const [expanded, setExpanded] = useState(false);

  const title = contentByLang(lang, program.titleHi, program.titleEn);
  // The eyebrow is a *days-completed* progress counter, so finishing today's day
  // visibly ticks it (0/N → 1/N) and it agrees with the List/Detail surfaces,
  // which already read `completedDayCount` (design.md §46). It must NOT use
  // `status.dayIndex`: that is the day you are *on* (= done + 1), so a fresh day 1
  // would show "1 / N" before anything is done and stay "1 / N" after completing
  // it — the counter would never move on completion ("still 0/N after reading").
  const daysDone = completedDayCount(card.enrollment);
  // Overall multi-day vow progress, mirroring the routine ledger's summary bar
  // (§31 / design.md §46). The eyebrow carries the `n / N` count; this gives the
  // same count a visual, so a sankalp reads as an in-progress commitment at a
  // glance — not just today's unit.
  const dayPct = status.totalDays > 0 ? Math.round((daysDone / status.totalDays) * 100) : 0;
  const dayLabel =
    status.kind === 'completed'
      ? contentByLang(lang, 'पूर्णाहुति', 'Sankalp complete')
      : contentByLang(
          lang,
          `संकल्प · ${daysDone} / ${status.totalDays}`,
          `Sankalp · ${daysDone} / ${status.totalDays}`
        );

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.parchmentSoft, borderColor: colors.saffron, borderRadius: radii.lg, padding: spacing.lg },
        elevation.card,
      ]}
    >
      {/* Tappable header — eyebrow, title, progress bar and any resting prose.
          Tapping it toggles the units dropdown (see `hasItems`). It stays a
          plain, non-interactive block on days with no units to reveal. */}
      <Pressable
        onPress={hasItems ? () => setExpanded((v) => !v) : undefined}
        disabled={!hasItems}
        accessibilityRole={hasItems ? 'button' : undefined}
        accessibilityState={hasItems ? { expanded } : undefined}
        accessibilityHint={
          hasItems
            ? expanded
              ? contentByLang(lang, 'पंक्तियाँ छिपाने के लिए टैप करें', 'Tap to hide the readings')
              : contentByLang(lang, 'पंक्तियाँ देखने के लिए टैप करें', 'Tap to see the readings')
            : undefined
        }
      >
        <View style={styles.headerRow}>
          <View style={{ flex: 1, minWidth: 0 }}>
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
          </View>
          {/* Dropdown caret — the › rotates to point down when collapsed and up
              once open, mirroring an accordion. Only shown when there is
              something to expand. */}
          {hasItems && (
            <Text
              style={[
                styles.expandChev,
                { color: colors.saffron, transform: [{ rotate: expanded ? '-90deg' : '90deg' }] },
              ]}
            >
              ›
            </Text>
          )}
        </View>

        {/* Multi-day progress bar — same gradient track as the §31 routine summary
            card, so an enrolled sankalp shows its overall advance, not only today's
            unit. Hidden once complete: the पूर्णाहुति seal below is the terminal
            state and a full bar would be redundant. */}
        {status.kind !== 'completed' && (
          <View
            style={[
              styles.track,
              { backgroundColor: colors.parchmentDeep, borderRadius: radii.pill, marginTop: spacing.sm },
            ]}
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: status.totalDays, now: daysDone }}
          >
            <LinearGradient
              colors={[colors.gold, colors.saffron]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ width: `${dayPct}%`, height: '100%', borderRadius: radii.pill }}
            />
          </View>
        )}

        {status.kind === 'completed' && (
          <View style={{ alignItems: 'center', marginTop: spacing.md }}>
            <PracticeSeal size={64} />
            <Text
              style={{
                // caption scale — the reading-body size (20/34) made the card
                // read as a prose block instead of a ledger card
                fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
                fontSize: 14,
                lineHeight: 21,
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
              lineHeight: 21,
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
              fontSize: 14,
              lineHeight: 21,
              color: colors.inkSoft,
              marginTop: spacing.sm,
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

      </Pressable>

      {/* Units dropdown — hidden until the header is tapped. The rows match the
          §31 daily-routine ledger exactly (28 px offering ring, 16/24 title,
          `cardMeta` sub-line, 18/24 chevron, `flex-start` alignment, bottom
          dividers) so a sankalp's practice reads identically to the everyday
          routine once opened. A top hairline sets it off from the header. */}
      {hasItems && expanded && (
        <View
          style={[
            styles.itemsSheet,
            { borderTopColor: colors.divider, marginTop: spacing.md, paddingTop: spacing.xs },
          ]}
        >
          {items.map((it, i) => {
            // Only an active day is committable — the offering checkbox is a
            // completion affordance and belongs to `active` alone. On a waiting
            // day the unit is a read-ahead *preview* (design.md §46; the day is
            // not committable until the gate opens), so we drop the check circle
            // and label the row as a preview rather than a to-do — otherwise the
            // empty circle promises progress a rest-day read can never deliver
            // (the "still 0/4 after reading" confusion).
            const committable = status.kind === 'active';
            const titleMain = contentByLang(lang, it.display.titleHi, it.display.titleEn);
            const tail = committable
              ? offeredTail(it.done, it.doneAt, lang)
              : contentByLang(lang, 'झलक · पढ़ने के लिए टैप करें', 'Preview · Tap to read');
            const last = i === items.length - 1;
            return (
              <View
                key={it.key}
                style={[
                  styles.itemRow,
                  { borderBottomColor: colors.divider, borderBottomWidth: last ? 0 : 1 },
                ]}
              >
                {/* The check circle exists only on an ACTIVE day — a waiting
                    (calendar-gated) preview is read-only, and a dead circle
                    reads as a broken control. Label names the item so it
                    never collides with the routine rows' generic circles. */}
                {committable && (
                  <Pressable
                    onPress={it.done ? undefined : () => commitDay(program.id, status.dayIndex, 'marked')}
                    accessibilityRole="button"
                    accessibilityState={{ checked: it.done }}
                    accessibilityLabel={
                      it.done
                        ? contentByLang(lang, `अर्पित — ${titleMain}`, `Offered — ${titleMain}`)
                        : contentByLang(lang, `अर्पित चिह्नित करें — ${titleMain}`, `Mark offered — ${titleMain}`)
                    }
                    hitSlop={10}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      borderWidth: 2,
                      borderColor: colors.saffron,
                      backgroundColor: it.done ? colors.saffron : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                      // optically centres the 28 px circle on the 24 px title line
                      marginTop: -2,
                    }}
                  >
                    {it.done && <Text style={{ color: colors.onPrimary, fontSize: 14 }}>✓</Text>}
                  </Pressable>
                )}
                <Pressable style={{ flex: 1, minWidth: 0 }} onPress={() => navigateToRoutineItem(nav, it.item)}>
                  <Text
                    style={{
                      fontFamily: scriptTitleFont(lang, typography.cardHindi.fontFamily),
                      fontSize: 16,
                      lineHeight: 24,
                      color: it.done ? colors.inkMuted : colors.ink,
                    }}
                  >
                    {titleMain}
                  </Text>
                  <Text
                    style={{
                      fontFamily:
                        lang === 'en'
                          ? typography.cardMeta.fontFamily
                          : scriptBodyFont(lang, typography.meaning.fontFamily),
                      fontSize: typography.cardMeta.fontSize,
                      color: it.done ? colors.inkMuted : colors.saffronDeep,
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
  // Eyebrow+title on the left, the dropdown caret pinned to the right.
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  // The header caret — a › rotated to point down (collapsed) / up (expanded).
  expandChev: { fontSize: 22, lineHeight: 22 },
  // Matches the §31 routine summary track (7 px, pill, clipped fill).
  track: { height: 7, width: '100%', overflow: 'hidden' },
  // The dropped-down units block, set off from the header by a top hairline.
  itemsSheet: { borderTopWidth: 1 },
  // Mirrors §31's daily-routine item row exactly (gap 14, 14 px vertical
  // padding, flex-start so the ring/chevron pin to the title's first line
  // instead of drifting to the middle of a wrapped two-line block).
  itemRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, paddingVertical: 14 },
  chev: { fontSize: 18, lineHeight: 24 },
});
