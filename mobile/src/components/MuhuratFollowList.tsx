import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage, type Lang } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { scriptTitleFont, scriptBodyFont } from '@/utils/langType';
import { fontFamilies } from '@/theme/typography';
import { usePanchangLocation } from '@/contexts/PanchangLocationContext';
import { usePanchangCalendarSystem } from '@/panchang/usePanchang';
import {
  useMuhuratFollows,
  dateFromFollowKey,
  DEFAULT_MUHURAT_REMINDER,
} from '@/contexts/MuhuratFollowContext';
import { getEventRule, TIER_LABELS, type MuhuratTier, type OccasionId } from '@/panchang/eventMuhurat';
import { verdictForDate } from '@/panchang/muhuratFinderScan';
import { formatClock } from '@/panchang/muhuratFormat';
import { transliterateDevanagari } from '@/utils/transliterate';

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_HI = ['जन', 'फ़र', 'मार्च', 'अप्रै', 'मई', 'जून', 'जुल', 'अग', 'सित', 'अक्टू', 'नवं', 'दिसं'];

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function shortDate(date: Date, lang: Lang): string {
  const months =
    lang === 'en' ? MONTHS_EN : lang === 'hi' ? MONTHS_HI : MONTHS_HI.map((m) => transliterateDevanagari(m, lang));
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

function relativeLabel(date: Date, from: Date, lang: Lang): string {
  const days = Math.round((startOfLocalDay(date).getTime() - startOfLocalDay(from).getTime()) / 86400000);
  if (days <= 0) return contentByLang(lang, 'आज', 'today');
  if (days === 1) return contentByLang(lang, 'कल', '1d');
  return contentByLang(lang, `${days}द`, `${days}d`);
}

type Row = {
  occasionId: OccasionId;
  dateKey: string;
  date: Date;
  nameHi: string;
  nameEn: string;
  tier: MuhuratTier;
  windowStart: Date | null;
  windowNameHi: string | null;
  windowNameEn: string | null;
  advanceDays: number;
  dayOf: boolean;
};

/**
 * अनुसरण किए मुहूर्त — the muhurat half of the ★ follow inventory (PRD-16 §6.7).
 *
 * A section inside the shipped `MyVratScreen` rather than a screen of its own:
 * the star already means "things I follow", and splitting it would make the
 * user check two places for one idea. What differs from the vrat rows above it
 * is that these are DATED ONE-SHOTS — each carries its own date and countdown,
 * and they disappear on their own once past.
 *
 * Each row re-solves its day (deferred, almost always a cache hit) so a follow
 * whose day re-graded after a location change says so IN WORDS (§12 — never
 * colour alone) instead of silently keeping a reminder that will not fire.
 */
export default function MuhuratFollowList({
  onOpen,
}: {
  onOpen: (occasionId: OccasionId, dateMs: number) => void;
}) {
  const { colors, typography, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const { follows } = useMuhuratFollows();
  const { location } = usePanchangLocation();
  const [calendarSystem] = usePanchangCalendarSystem();
  const [rows, setRows] = useState<Row[]>([]);

  const followKey = follows.map((f) => `${f.occasionId}:${f.dateKey}`).join(',');

  useEffect(() => {
    let cancelled = false;
    // Off the render path: the list can hold several days, and each may need a
    // solve on a cold start.
    const id = setTimeout(() => {
      const out: Row[] = [];
      for (const f of follows) {
        let rule;
        try {
          rule = getEventRule(f.occasionId);
        } catch {
          continue; // occasion retired from EVENT_RULES
        }
        const date = dateFromFollowKey(f.dateKey);
        const solved = verdictForDate(rule, date, { calendarSystem, location });
        const pref = f.reminder ?? DEFAULT_MUHURAT_REMINDER;
        const best = solved?.verdict.windows[0] ?? null;
        out.push({
          occasionId: rule.id,
          dateKey: f.dateKey,
          date,
          nameHi: rule.nameHi,
          nameEn: rule.nameEn,
          tier: solved?.verdict.tier ?? 'excluded',
          windowStart: best?.start ?? null,
          windowNameHi: best?.nameHi ?? null,
          windowNameEn: best?.nameEn ?? null,
          advanceDays: pref.advanceDays,
          dayOf: pref.dayOf,
        });
      }
      if (!cancelled) setRows(out);
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [followKey, calendarSystem, location]);

  if (follows.length === 0) return null;

  const today = startOfLocalDay(new Date());
  const titleFont = scriptTitleFont(lang, typography.readerTitle.fontFamily);
  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);

  return (
    <View testID="muhurat-follow-list">
      <Text style={[styles.heading, { color: colors.ink, fontFamily: titleFont }]}>
        {contentByLang(lang, 'अनुसरण किए मुहूर्त', 'Followed muhurats')}
      </Text>

      {rows.map((r) => {
        const drifted = r.tier === 'excluded';
        const notices = !drifted && (r.dayOf || r.advanceDays > 0);
        const detail = drifted
          ? contentByLang(lang, 'स्थान बदला — अब उपयुक्त नहीं', 'Location changed — no longer suitable')
          : notices
            ? [
                r.advanceDays > 0
                  ? contentByLang(lang, `${r.advanceDays} दिन पहले`, `${r.advanceDays}d before`)
                  : null,
                r.dayOf && r.windowStart
                  ? `${contentByLang(lang, r.windowNameHi ?? '', r.windowNameEn ?? '')} ${formatClock(r.windowStart)}`
                  : null,
              ]
                .filter(Boolean)
                .join(' · ')
            : contentByLang(lang, 'कोई सूचना नहीं', 'No notices');
        return (
          <Pressable
            key={`${r.occasionId}:${r.dateKey}`}
            testID={`muhurat-follow-row-${r.occasionId}`}
            accessibilityRole="button"
            accessibilityLabel={`${contentByLang(lang, r.nameHi, r.nameEn)} ${shortDate(r.date, lang)}. ${detail}`}
            onPress={() => onOpen(r.occasionId, r.date.getTime())}
            style={({ pressed }) => [
              styles.row,
              { borderColor: colors.border, backgroundColor: colors.surface, borderRadius: radii.md },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={{ fontFamily: typography.thumb.fontFamily, fontSize: 14, color: colors.gold, lineHeight: 22 }}>★</Text>
            <View style={styles.body}>
              <Text numberOfLines={1} style={{ fontFamily: titleFont, fontSize: 14, color: colors.ink, lineHeight: 22 }}>
                {contentByLang(lang, r.nameHi, r.nameEn)}
                {r.tier !== 'excluded' && (
                  <Text style={{ color: colors.inkMuted }}>
                    {' · '}
                    {contentByLang(lang, TIER_LABELS[r.tier].hi, TIER_LABELS[r.tier].en)}
                  </Text>
                )}
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  fontFamily: bodyFont,
                  fontSize: 12.5,
                  color: drifted ? colors.avoidDeep : colors.inkSoft,
                  lineHeight: 19,
                }}
              >
                {detail}
              </Text>
            </View>
            <View style={styles.when}>
              <Text
                style={{
                  fontFamily: lang === 'en' ? fontFamilies.interSemiBold : bodyFont,
                  fontSize: 13,
                  color: colors.saffronDeep,
                  fontVariant: ['tabular-nums'],
                }}
              >
                {shortDate(r.date, lang)}
              </Text>
              <Text style={{ fontFamily: bodyFont, fontSize: 11, color: colors.inkMuted }}>
                {relativeLabel(r.date, today, lang)}
              </Text>
            </View>
          </Pressable>
        );
      })}

      <Text style={{ fontFamily: bodyFont, fontSize: 11.5, color: colors.inkMuted, textAlign: 'center', marginTop: 8, lineHeight: 18 }}>
        {contentByLang(lang, 'बीत चुके मुहूर्त स्वतः हट जाते हैं।', 'Muhurats drop off on their own once past.')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 15, marginTop: 22, marginBottom: 10 },
  row: {
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 56,
  },
  body: { flex: 1, minWidth: 0 },
  when: { alignItems: 'flex-end', flexShrink: 0 },
});
