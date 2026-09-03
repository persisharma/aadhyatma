import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { useGitaLanguage, type Lang } from '@/data/gita/language';
import { getVidhiById } from '@/data/vidhi';
import { useNotificationPreferences } from '@/contexts/NotificationPreferencesContext';
import {
  ARC_DURATION_CHOICES,
  arcDateKey,
  arcDayFor,
  dayDiff,
  prepareActive,
  resolveArcOccurrenceForRule,
  visarjanSlot,
  type ArcDurationDays,
  type ArcOccurrence,
  type ArcSlot,
} from '@/panchang/arcs';
import { arcChoiceFor, clearArcChoice, saveArcChoice } from '@/panchang/arcChoiceStore';
import { useArcChoices } from '@/panchang/useArcChoices';
import { formatShortDate } from '@/panchang/muhuratFormat';
import { VARA_NAMES_EN, VARA_NAMES_HI } from '@/panchang/names';
import type { CalendarSystem, ObservanceRule } from '@/panchang/types';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { pillTextStyle, scriptBodyFont, scriptTitleFont } from '@/utils/langType';

/**
 * पर्व-अर्क strip (PRD-28, design.md §65.2) — where today sits in a multi-day
 * festival, what is done, what remains; for chooser arcs the duration chooser
 * and the family's solved visarjan; the preparation hand-off a day before it
 * is needed; and the visarjan vidhi door on the concluding day.
 *
 * Renders NOTHING for rules outside any arc, so every other Observance Detail
 * is byte-for-byte unchanged. Defaults to no duration and never nags: an
 * unchosen chooser arc shows sthapana + the chooser and no presumed visarjan.
 */

const DEVANAGARI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

function scriptNumber(n: number, lang: Lang): string {
  const latin = `${n}`;
  if (lang === 'en') return latin;
  const deva = [...latin].map((ch) => DEVANAGARI_DIGITS[Number(ch)] ?? ch).join('');
  return contentByLang(lang, deva, latin);
}

function durationLabel(d: ArcDurationDays, lang: Lang): string {
  if (d === 1.5) return contentByLang(lang, 'डेढ़ दिन', '1½ days');
  return contentByLang(lang, `${scriptNumber(d, 'hi')} दिन`, `${d} days`);
}

function weekdayDate(date: Date, lang: Lang): string {
  const vara = contentByLang(lang, VARA_NAMES_HI[date.getDay()], VARA_NAMES_EN[date.getDay()]);
  return `${vara} · ${formatShortDate(date, lang)}`;
}

/**
 * Which ordinals the strip draws: first, last, every rule-bound or labelled
 * day, and today — with a "…" between non-adjacent picks so a 12-day arc
 * fits one row (the prototype's compressed strip).
 */
export function pickStripOrdinals(occ: ArcOccurrence, todayOrdinal: number | null): (number | 'gap')[] {
  const keep = new Set<number>([1, occ.totalDays]);
  for (const slot of occ.slots) if (slot.ruleId || slot.labelHi) keep.add(slot.ordinal);
  if (todayOrdinal != null && todayOrdinal >= 1 && todayOrdinal <= occ.totalDays) keep.add(todayOrdinal);
  const ordered = [...keep].sort((a, b) => a - b);
  const out: (number | 'gap')[] = [];
  ordered.forEach((ordinal, i) => {
    if (i > 0 && ordinal - (ordered[i - 1] as number) > 1) out.push('gap');
    out.push(ordinal);
  });
  return out;
}

type Props = {
  rule: ObservanceRule;
  calendarSystem: CalendarSystem;
  /** Injected for deterministic tests; defaults to now. */
  today?: Date;
  onOpenRule: (ruleId: string) => void;
  onOpenVidhi: (vidhiId: string, dateMs: number) => void;
  testID?: string;
};

export default function ArcStrip({ rule, calendarSystem, today: todayProp, onOpenRule, onOpenVidhi, testID }: Props) {
  const { colors, typography, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const { permissionStatus } = useNotificationPreferences();
  const { choices } = useArcChoices();
  const today = useMemo(() => todayProp ?? new Date(), [todayProp]);

  const occ = useMemo(
    () =>
      resolveArcOccurrenceForRule(rule, today, calendarSystem, (key) =>
        rule.arcId ? arcChoiceFor(choices, rule.arcId, key) : null
      ),
    [rule, today, calendarSystem, choices]
  );
  if (!occ) return null;

  const { arc } = occ;
  const day = arcDayFor(occ, today);
  const todayOrdinal = day.phase === 'during' ? day.ordinal : null;
  const ordinals = pickStripOrdinals(occ, todayOrdinal);
  const visarjan = visarjanSlot(occ);
  const anchorKey = arcDateKey(occ.startDate);
  const chosen = occ.durationDays;
  const titleFont = scriptTitleFont(lang, typography.readerTitle.fontFamily);
  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);
  const arcName = contentByLang(lang, arc.nameHi, arc.nameEn);

  // Verified-only: a draft visarjan vidhi resolves to null and the door is absent.
  const visarjanVidhi = arc.visarjanVidhiId ? getVidhiById(arc.visarjanVidhiId) : null;
  const showVisarjanVidhi =
    Boolean(visarjanVidhi && visarjan) && day.phase === 'during' && visarjan != null && dayDiff(today, visarjan.date) <= 1;
  const showPrepare = day.phase === 'during' && prepareActive(occ, today);

  const statusLine = (() => {
    if (day.phase === 'before') {
      const when = day.daysUntilStart === 1
        ? contentByLang(lang, 'कल से', 'from tomorrow')
        : contentByLang(lang, `${scriptNumber(day.daysUntilStart, lang)} दिन में`, `in ${day.daysUntilStart} days`);
      return `${contentByLang(lang, 'प्रारम्भ', 'Begins')} · ${weekdayDate(occ.startDate, lang)} · ${when}`;
    }
    if (day.phase === 'during') {
      const parts = [
        occ.open
          ? contentByLang(lang, `आज दिन ${scriptNumber(day.ordinal, lang)}`, `Today is day ${day.ordinal}`)
          : contentByLang(
              lang,
              `आज दिन ${scriptNumber(day.ordinal, lang)} / ${scriptNumber(occ.totalDays, lang)}`,
              `Today is day ${day.ordinal} of ${occ.totalDays}`
            ),
      ];
      if (day.daysRemaining != null && day.daysRemaining > 0) {
        parts.push(contentByLang(lang, `${scriptNumber(day.daysRemaining, lang)} दिन शेष`, `${day.daysRemaining} left`));
      }
      if (visarjan) {
        parts.push(
          day.daysRemaining === 0
            ? contentByLang(lang, 'आज विसर्जन', 'Visarjan today')
            : `${contentByLang(lang, 'विसर्जन', 'Visarjan')} ${weekdayDate(visarjan.date, lang)}`
        );
      }
      return parts.join(' · ');
    }
    return null;
  })();

  const slotLabel = (slot: ArcSlot): string | null => {
    if (slot.labelHi && slot.labelEn) return contentByLang(lang, slot.labelHi, slot.labelEn);
    if (slot.role === 'visarjan') return contentByLang(lang, 'विसर्जन', 'Visarjan');
    return null;
  };

  return (
    <View
      testID={testID ?? 'observance-arc-strip'}
      accessibilityLabel={`Festival arc ${arc.nameEn}`}
      style={[styles.card, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg }, elevation.card]}
    >
      <View style={styles.headRow}>
        <Text
          maxFontSizeMultiplier={1.25}
          style={[pillTextStyle(lang, { fontFamily: fontFamilies.interSemiBold, fontSize: 11, letterSpacing: 0.6 }), { color: colors.saffronDeep }]}
        >
          {contentByLang(lang, 'पर्व-अर्क', 'Festival arc')}
        </Text>
        <Text style={{ flex: 1, fontFamily: titleFont, fontSize: 15, color: colors.ink }} numberOfLines={1}>
          {arcName}
        </Text>
        {day.phase === 'during' && (
          <View style={[styles.dayChip, { backgroundColor: colors.saffronTint, borderRadius: radii.pill }]}>
            <Text
              maxFontSizeMultiplier={1.15}
              style={[pillTextStyle(lang, { fontFamily: fontFamilies.interSemiBold, fontSize: 11 }), { color: colors.saffronDeep }]}
            >
              {contentByLang(lang, `दिन ${scriptNumber(day.ordinal, lang)}`, `Day ${day.ordinal}`)}
            </Text>
          </View>
        )}
      </View>

      {/* The strip: one circle per drawn ordinal, connectors between. */}
      <View style={styles.strip} accessibilityRole="none">
        {ordinals.map((item, index) => {
          if (item === 'gap') {
            return (
              <View key={`gap-${index}`} style={styles.gapStep}>
                <View style={[styles.connector, { backgroundColor: colors.divider }]} />
                <Text style={{ fontFamily: fontFamilies.interSemiBold, fontSize: 11, color: colors.inkMuted }}>…</Text>
              </View>
            );
          }
          const slot = occ.slots[item - 1];
          const isNow = todayOrdinal === item;
          const isDone = todayOrdinal != null ? item < todayOrdinal : day.phase === 'after';
          const label = slotLabel(slot);
          const tappable = Boolean(slot.ruleId) && slot.ruleId !== rule.id;
          const circle = (
            <View
              style={[
                styles.circle,
                {
                  borderColor: isNow || isDone ? 'transparent' : colors.divider,
                  backgroundColor: isNow ? colors.saffron : isDone ? colors.gold : colors.parchment,
                },
                isNow && { shadowColor: colors.saffron, shadowOpacity: 0.35, shadowRadius: 4, shadowOffset: { width: 0, height: 0 } },
              ]}
            >
              <Text
                maxFontSizeMultiplier={1.15}
                style={{ fontFamily: fontFamilies.interSemiBold, fontSize: 11, color: isNow ? colors.onPrimary : isDone ? colors.ink : colors.inkMuted }}
              >
                {scriptNumber(item, lang)}
              </Text>
            </View>
          );
          const body = (
            <>
              {index > 0 && <View style={[styles.connector, { backgroundColor: isDone || isNow ? colors.gold : colors.divider }]} />}
              {circle}
              <Text
                numberOfLines={2}
                maxFontSizeMultiplier={1.15}
                style={{ fontFamily: bodyFont, fontSize: 10, lineHeight: 13, color: isNow ? colors.saffronDeep : colors.inkMuted, textAlign: 'center', marginTop: 4, minHeight: 24 }}
              >
                {isNow && !label ? contentByLang(lang, 'आज', 'Today') : label ?? ''}
              </Text>
            </>
          );
          const a11y = `${slot.labelEn ?? (slot.role === 'visarjan' ? 'Visarjan' : `Day ${item}`)}, day ${item}${isNow ? ', today' : ''}`;
          return tappable ? (
            <Pressable
              key={item}
              onPress={() => slot.ruleId && onOpenRule(slot.ruleId)}
              accessibilityRole="button"
              accessibilityLabel={a11y}
              testID={`arc-slot-${item}`}
              style={({ pressed }) => [styles.step, pressed && { opacity: 0.7 }]}
            >
              {body}
            </Pressable>
          ) : (
            <View key={item} accessibilityLabel={a11y} testID={`arc-slot-${item}`} style={styles.step}>
              {body}
            </View>
          );
        })}
      </View>

      {statusLine && (
        <Text testID="arc-status" style={{ fontFamily: bodyFont, fontSize: 12.5, lineHeight: 18, color: colors.inkSoft, textAlign: 'center', marginTop: 6 }}>
          {statusLine}
        </Text>
      )}

      {/* Duration chooser — chooser arcs only, offered on the sthapana rule's
          page. No option is pre-selected: the choice is the family's. */}
      {arc.durationChoices && rule.arcRole === 'sthapana' && day.phase !== 'after' && (
        <View style={[styles.section, { borderTopColor: colors.divider }]} testID="arc-duration-chooser">
          <Text style={{ fontFamily: titleFont, fontSize: 15, color: colors.ink }}>
            {contentByLang(lang, 'कितने दिन विराजेंगे?', 'How many days will the murti stay?')}
          </Text>
          <Text style={{ fontFamily: bodyFont, fontSize: 12, lineHeight: 18, color: colors.inkMuted, marginTop: 3 }}>
            {meaningByLang(
              lang,
              'परिवार और क्षेत्र के अनुसार भिन्न — जो आपके घर की परम्परा है, वही चुनें। ऐप केवल तिथि निकालता है, सुझाव नहीं देता।',
              'Varies by family and region — choose what your household keeps. The app only computes the date; it never recommends one.'
            )}
          </Text>
          <View style={styles.durGrid}>
            {ARC_DURATION_CHOICES.map((d) => {
              const on = chosen === d;
              return (
                <Pressable
                  key={d}
                  onPress={() => (on ? void clearArcChoice(arc.id) : void saveArcChoice(arc.id, anchorKey, d))}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={`${d === 1.5 ? '1.5' : d} days`}
                  testID={`arc-duration-${d}`}
                  style={({ pressed }) => [
                    styles.durTile,
                    { borderColor: on ? 'transparent' : colors.goldTint, backgroundColor: on ? colors.saffron : 'transparent', borderRadius: radii.md },
                    on && elevation.raised,
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Text maxFontSizeMultiplier={1.2} style={{ fontFamily: titleFont, fontSize: 13, color: on ? colors.onPrimary : colors.ink }}>
                    {durationLabel(d, lang)}
                  </Text>
                  {d === 10 && (
                    <Text maxFontSizeMultiplier={1.2} style={{ fontFamily: bodyFont, fontSize: 10, color: on ? colors.parchment : colors.inkMuted, marginTop: 2 }}>
                      {contentByLang(lang, 'अनन्त चतुर्दशी', 'Anant Chaturdashi')}
                    </Text>
                  )}
                </Pressable>
              );
            })}
            <Pressable
              onPress={() => void clearArcChoice(arc.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: false }}
              accessibilityLabel="Decide later"
              testID="arc-duration-later"
              style={({ pressed }) => [styles.durTile, { borderColor: colors.goldTint, borderRadius: radii.md }, pressed && { opacity: 0.8 }]}
            >
              <Text maxFontSizeMultiplier={1.2} style={{ fontFamily: titleFont, fontSize: 13, color: colors.inkMuted }}>
                {contentByLang(lang, 'बाद में', 'Decide later')}
              </Text>
            </Pressable>
          </View>

          {visarjan && (
            <View testID="arc-visarjan-row" style={[styles.kv, { borderColor: colors.divider, borderRadius: radii.md, backgroundColor: colors.goldTint }]}>
              <View style={styles.kvRow}>
                <Text style={{ fontFamily: bodyFont, fontSize: 12.5, color: colors.inkMuted }}>{contentByLang(lang, 'स्थापना', 'Sthapana')}</Text>
                <Text style={{ fontFamily: titleFont, fontSize: 13.5, color: colors.ink }}>{weekdayDate(occ.startDate, lang)}</Text>
              </View>
              <View style={[styles.kvRow, { marginTop: 6 }]}>
                <Text style={{ fontFamily: bodyFont, fontSize: 12.5, color: colors.inkMuted }}>{contentByLang(lang, 'आपका विसर्जन', 'Your visarjan')}</Text>
                <Text style={{ fontFamily: titleFont, fontSize: 13.5, color: colors.saffronDeep }}>{weekdayDate(visarjan.date, lang)}</Text>
              </View>
              {permissionStatus === 'granted' && (
                <Text style={{ fontFamily: bodyFont, fontSize: 11, lineHeight: 16, color: colors.inkMuted, marginTop: 8 }}>
                  {meaningByLang(
                    lang,
                    'स्मरण: एक दिन पहले सायं 6 बजे और उस दिन प्रातः 7 बजे।',
                    'Reminder: 6 PM the evening before and 7 AM on the day.'
                  )}
                </Text>
              )}
            </View>
          )}
        </View>
      )}

      {/* Preparation hand-off (Navratri → Kanya Pujan): PRD-23's shipped bhog
          list and grocery checklist, surfaced when the shopping happens. */}
      {showPrepare && arc.prepare && (
        <Pressable
          onPress={() => arc.prepare && onOpenVidhi(arc.prepare.vidhiId, occ.startDate.getTime())}
          accessibilityRole="button"
          accessibilityLabel={`${arc.prepare.labelEn}. Open bhog list and kitchen shopping`}
          testID="arc-prepare-row"
          style={({ pressed }) => [styles.row, { borderColor: colors.gold, backgroundColor: colors.goldTint, borderRadius: radii.md }, pressed && { opacity: 0.8 }]}
        >
          <Text style={{ fontSize: 18, color: colors.saffronDeep, marginRight: 10 }}>॥</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: titleFont, fontSize: 14, color: colors.ink }}>
              {contentByLang(lang, arc.prepare.labelHi, arc.prepare.labelEn)}
            </Text>
            <Text style={{ fontFamily: bodyFont, fontSize: 12, lineHeight: 17, color: colors.inkSoft, marginTop: 2 }}>
              {meaningByLang(lang, arc.prepare.noteHi, arc.prepare.noteEn)}
            </Text>
          </View>
          <Text style={{ fontSize: 18, color: colors.saffron }}>›</Text>
        </Pressable>
      )}

      {/* Visarjan vidhi door — the concluding rite, on its eve and its day. */}
      {showVisarjanVidhi && visarjanVidhi && visarjan && (
        <Pressable
          onPress={() => onOpenVidhi(visarjanVidhi.id, visarjan.date.getTime())}
          accessibilityRole="button"
          accessibilityLabel={`Open ${visarjanVidhi.titleEn} vidhi`}
          testID="arc-visarjan-vidhi"
          style={({ pressed }) => [styles.row, { borderColor: colors.divider, backgroundColor: colors.parchment, borderRadius: radii.md }, pressed && { opacity: 0.8 }]}
        >
          <Text style={{ fontSize: 18, color: colors.saffron, marginRight: 10 }}>॥</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: titleFont, fontSize: 14, color: colors.ink }}>
              {contentByLang(lang, visarjanVidhi.titleHi, visarjanVidhi.titleEn)}
            </Text>
            <Text style={{ fontFamily: bodyFont, fontSize: 12, color: colors.inkMuted, marginTop: 2 }}>
              {contentByLang(
                lang,
                `${visarjanVidhi.steps.length} चरण · लगभग ${visarjanVidhi.durationHintMin} मिनट`,
                `${visarjanVidhi.steps.length} steps · About ${visarjanVidhi.durationHintMin} min`
              )}
            </Text>
          </View>
          <Text style={{ fontSize: 18, color: colors.inkMuted }}>›</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 12, marginTop: 14 },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dayChip: { paddingHorizontal: 9, paddingVertical: 3, minHeight: 22, justifyContent: 'center' },
  strip: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 12 },
  step: { flex: 1, alignItems: 'center', minHeight: 44 },
  gapStep: { width: 22, alignItems: 'center', paddingTop: 6 },
  circle: { width: 26, height: 26, borderRadius: 13, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  connector: { position: 'absolute', top: 12, left: -50, right: '50%', height: 2, zIndex: -1 },
  section: { borderTopWidth: 1, marginTop: 12, paddingTop: 12 },
  durGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  durTile: { flexBasis: '30%', flexGrow: 1, minHeight: 44, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 9, paddingHorizontal: 4 },
  kv: { marginTop: 12, padding: 12, borderWidth: 1 },
  kvRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, paddingHorizontal: 12, paddingVertical: 11, marginTop: 12, minHeight: 48 },
});
