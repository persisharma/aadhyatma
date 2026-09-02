import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { scriptTitleFont } from '@/utils/langType';
import VratReminderSheet, { type DayOfOption } from '@/components/VratReminderSheet';
import {
  useMuhuratFollows,
  followDateKey,
  DEFAULT_MUHURAT_REMINDER,
  type MuhuratReminderPref,
} from '@/contexts/MuhuratFollowContext';
import { clampDayOf, ADVANCE_HOUR } from '@/notifications/muhuratReminderPure';
import { formatClock, formatRangeCompact } from '@/panchang/muhuratFormat';
import { VARA_NAMES_EN, VARA_NAMES_HI } from '@/panchang/names';
import { transliterateDevanagari } from '@/utils/transliterate';
import type { OccasionId, MuhuratWindow } from '@/panchang/eventMuhurat';
import type { Lang } from '@/data/gita/language';

/**
 * The follow affordance for one graded day (PRD-16 §6.7, design.md §60).
 *
 * Lives in the day detail's ACTION band — above the evidence, below the answer
 * — so Answer → Action → Evidence survives. Two states:
 *
 *   not followed → one primary pill.
 *   followed     → a quiet status row that STATES THE RESOLVED FIRE TIMES.
 *
 * Stating the times (rather than "Reminder on") is deliberate. Every window is
 * sunrise-derived, so a city change moves them; the only way a user can notice
 * that is if the surface shows what will actually happen. The times here are
 * computed by the SAME pure helpers the scheduler plans with, so the screen
 * cannot promise a time the planner would not fire.
 */

/** Muhurat day-of choices: the window-anchored one first, then wall-clock. */
export const MUHURAT_DAY_OF_OPTIONS: readonly DayOfOption[] = [
  { key: 'window', hour: 7, minute: 0, hi: 'मुहूर्त से 30 मिनट पहले', en: '30 min before', atWindow: true },
  { key: '0700', hour: 7, minute: 0, hi: '07:00', en: '07:00' },
  { key: '0800', hour: 8, minute: 0, hi: '08:00', en: '08:00' },
] as const;

function shortWeekday(d: Date, lang: Lang): string {
  const hi = VARA_NAMES_HI[d.getDay()];
  if (lang === 'en') return VARA_NAMES_EN[d.getDay()].slice(0, 3);
  if (lang === 'hi') return hi;
  return transliterateDevanagari(hi, lang);
}

export default function MuhuratFollowControl({
  occasionId,
  occasionNameHi,
  occasionNameEn,
  date,
  tier,
  bestWindow,
}: {
  occasionId: OccasionId;
  occasionNameHi: string;
  occasionNameEn: string;
  date: Date;
  tier: 'shreshtha' | 'madhyam' | 'excluded';
  bestWindow: MuhuratWindow | null;
}) {
  const { colors, typography, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const { isFollowing, getFollow, follow, unfollow, setReminder } = useMuhuratFollows();
  const [sheetOpen, setSheetOpen] = useState(false);

  const dateKey = followDateKey(date);
  const followed = isFollowing(occasionId, dateKey);
  const pref: MuhuratReminderPref = getFollow(occasionId, dateKey)?.reminder ?? DEFAULT_MUHURAT_REMINDER;
  const titleFont = scriptTitleFont(lang, typography.cardHindi.fontFamily);

  // An excluded day offers no follow at all — there is nothing to be reminded
  // of, and a reminder for a barred day is exactly the harm §9.7 warns about.
  if (tier === 'excluded') return null;

  const onPrimary = () => {
    if (!followed) follow(occasionId, dateKey, DEFAULT_MUHURAT_REMINDER);
    setSheetOpen(true);
  };

  const onSave = (next: MuhuratReminderPref) => {
    // Turning both notices off is how a user unfollows from inside the sheet.
    if (!next.dayOf && next.advanceDays === 0) unfollow(occasionId, dateKey);
    else setReminder(occasionId, dateKey, next);
  };

  // The resolved fire times, computed exactly as the planner will.
  const advanceDate = (() => {
    if (!pref.advanceDays) return null;
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate() - pref.advanceDays);
    d.setHours(ADVANCE_HOUR, 0, 0, 0);
    return d;
  })();
  const dayOfDate = pref.dayOf
    ? clampDayOf(
        date,
        pref.dayOfTime ?? { hour: 7, minute: 0 },
        bestWindow?.start ?? null,
        Boolean(pref.dayOfAtWindow)
      )
    : null;

  const when = [
    advanceDate ? `${shortWeekday(advanceDate, lang)} ${formatClock(advanceDate)}` : null,
    dayOfDate ? `${shortWeekday(dayOfDate, lang)} ${formatClock(dayOfDate)}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const sheetSubtitle = [
    contentByLang(lang, occasionNameHi, occasionNameEn),
    `${shortWeekday(date, lang)} ${date.getDate()}`,
    bestWindow
      ? `${contentByLang(lang, bestWindow.nameHi, bestWindow.nameEn)} ${formatRangeCompact(bestWindow.start, bestWindow.end)}`
      : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <>
      {followed ? (
        <View
          testID="muhurat-followed"
          accessibilityRole="summary"
          accessibilityLabel={`Reminder set. ${when}`}
          style={[
            styles.followed,
            { borderColor: colors.cardActiveBorder, backgroundColor: colors.saffronTint, borderRadius: radii.md },
          ]}
        >
          <Text style={{ fontFamily: typography.thumb.fontFamily, fontSize: 15, color: colors.gold, lineHeight: 22 }}>★</Text>
          <View style={styles.followedBody}>
            <Text style={{ fontFamily: titleFont, fontSize: 14, color: colors.ink, lineHeight: 22 }}>
              {contentByLang(lang, 'अनुसरण किया', 'Following')}
            </Text>
            <Text
              numberOfLines={1}
              style={{
                fontFamily: typography.cardLatin.fontFamily,
                fontSize: 12.5,
                color: colors.inkSoft,
                lineHeight: 19,
                fontVariant: ['tabular-nums'],
              }}
            >
              {when || contentByLang(lang, 'कोई सूचना नहीं', 'No notices')}
            </Text>
          </View>
          <Pressable
            testID="muhurat-follow-edit"
            accessibilityRole="button"
            accessibilityLabel={contentByLang(lang, 'अनुस्मारक बदलें', 'Change reminders')}
            hitSlop={10}
            onPress={() => setSheetOpen(true)}
          >
            <Text style={{ fontFamily: titleFont, fontSize: 13.5, color: colors.saffronDeep, lineHeight: 22 }}>
              {contentByLang(lang, 'बदलें', 'Change')}
            </Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          testID="muhurat-follow-cta"
          accessibilityRole="button"
          accessibilityLabel={contentByLang(lang, 'इस मुहूर्त का अनुसरण करें', 'Follow this muhurat')}
          onPress={onPrimary}
          style={({ pressed }) => [
            styles.cta,
            { backgroundColor: colors.saffron, borderRadius: radii.pill },
            elevation.card,
            pressed && { opacity: 0.85 },
          ]}
        >
          <Text style={{ fontFamily: titleFont, fontSize: 15, color: colors.onPrimary, lineHeight: 23 }}>
            ☆ {contentByLang(lang, 'इस मुहूर्त का अनुसरण करें', 'Follow this muhurat')}
          </Text>
        </Pressable>
      )}

      <VratReminderSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        testID="muhurat-reminder-sheet"
        titleName={contentByLang(lang, occasionNameHi, occasionNameEn)}
        subtitle={sheetSubtitle}
        initial={pref}
        onSave={onSave}
        dayOfOptions={MUHURAT_DAY_OF_OPTIONS}
        dayOfLabel={{ hi: 'मुहूर्त के दिन', en: 'On the day' }}
        footnote={
          bestWindow
            ? contentByLang(
                lang,
                `सूचना मुहूर्त से पहले ही आएगी — यहाँ मुहूर्त ${formatClock(bestWindow.start)} है।`,
                `The notice always lands before the window — here it opens at ${formatClock(bestWindow.start)}.`
              )
            : undefined
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  cta: { minHeight: 46, alignItems: 'center', justifyContent: 'center', marginTop: 12, paddingHorizontal: 16 },
  followed: {
    borderWidth: 1,
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 46,
  },
  followedBody: { flex: 1, minWidth: 0 },
});
