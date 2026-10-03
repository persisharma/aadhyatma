import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import ReaderHeader from '@/components/ReaderHeader';
import PanchangTimelineRow from '@/components/PanchangTimelineRow';
import { useGitaLanguage } from '@/data/gita/language';
import { usePitruSmaran } from '@/contexts/PitruSmaranContext';
import {
  getPitruLessons,
  hasPitruShiksha,
  type PitruFortnightDay,
  type PitruLessonEntry,
} from '@/data/pitru';
import { getVidhiById } from '@/data/vidhi';
import { addDays } from '@/panchang/calendarGrid';
import { computeTithiAndMonth } from '@/panchang/engine';
import { TITHI_NAMES_EN, TITHI_NAMES_HI } from '@/panchang/names';
import { pakshaShraddhaDay, pitruPakshaWindow } from '@/panchang/pitruSmaran';
import { entryDisplayName, shortDate, startOfLocalDay } from '@/panchang/pitruSmaranDisplay';
import { useTheme } from '@/theme/ThemeContext';
import { commentaryByLang, contentByLang } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';
import type { MoreStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<MoreStackParamList, 'PitruPakshaOverview'>;

type FamilyMember = {
  id: string;
  /** Display name in the reading language. */
  name: string;
  /** English display name — the a11y label is an English constant (Maestro-stable). */
  nameEn: string;
};

type FortnightRow = {
  key: string;
  date: Date;
  labelHi: string;
  labelEn: string;
  /** The row title without its qualifier clause — the hero can only carry this much. */
  heroHi: string;
  heroEn: string;
  /** Family entries whose shraddha day this is — id kept so a name can open its person. */
  family: FamilyMember[];
  /**
   * Which day of the fortnight this civil date is, so the row can carry the
   * §74 tithi teaching for it. A kshaya row takes its sunrise tithi's day.
   */
  fortnightDay: PitruFortnightDay | null;
};

/**
 * Where today sits relative to the fortnight. `next` means this calendar year's
 * paksha has finished and the table below is the FOLLOWING year's — the screen
 * says so rather than letting a bare numeral in the title carry it.
 */
type Standing =
  | { kind: 'before'; daysUntil: number }
  | { kind: 'during'; dayNumber: number; total: number; row: FortnightRow }
  | { kind: 'next'; previousEnd: Date };

type OverviewState = {
  year: number;
  start: Date;
  end: Date;
  rows: FortnightRow[];
  standing: Standing;
  /** Index into `rows` of the row that is today, or -1 outside the fortnight. */
  todayIndex: number;
};

/** Sticky action bar height — the scroll content pads by this so nothing hides under it. */
const ACTION_BAR_HEIGHT = 74;

function rowKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/**
 * पितृ पक्ष overview (PRD-17) — the fortnight as §33.6 "आगामी · Upcoming" rows:
 * 8 px marker dot (saffron for family-matched days, gold default), short date,
 * tithi-shraddha name, and the matched person's name beneath in saffron-deep.
 * Unknown-tithi entries collect on सर्वपितृ अमावस्या.
 *
 * Sept 2026 UX review: the screen now answers "where am I in this?" before it
 * answers "what are the dates". The hero carries today's tithi and दिन N / M
 * during the paksha, a countdown before it, and an explicit अगले वर्ष once the
 * year has rolled; a strip names the days that are the family's (or, with an
 * empty ledger, opens पितृ स्मरण); today's row opens in place as a card; and
 * both standing doors — परिचय (PRD-44) and the tila-tarpana guide — sit in a
 * sticky bar rather than at the two far ends of a fifteen-row scroll.
 *
 * Every tap is one step: the family strip OPENS the first family day; a name
 * on an open day opens that person's own page; `किस दिन किसका ›` opens the
 * paged परिचय reader on the lesson that answers it; openable rows carry a
 * chevron and rows holding nothing read quieter and carry none.
 */
export default function PitruPakshaOverviewScreen({ navigation }: Props) {
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const { entries } = usePitruSmaran();

  const todayMs = startOfLocalDay(new Date()).getTime();
  const [state, setState] = useState<OverviewState | null>(null);
  const scrollRef = useRef<ScrollView | null>(null);
  const familyOffset = useRef<number | null>(null);

  // The fortnight table needs ~17 memoised sunrise solves plus one shraddha-day
  // solve per entry — assembled off the render path.
  useEffect(() => {
    let cancelled = false;
    const handle = setTimeout(() => {
      try {
        const today = new Date(todayMs);
        let year = today.getFullYear();
        let window = pitruPakshaWindow(year);
        // The year this table belongs to has finished — roll forward, and keep
        // the end we rolled past so the hero can say which paksha is over.
        let previousEnd: Date | null = null;
        if (window && window.end.getTime() < today.getTime()) {
          previousEnd = window.end;
          year += 1;
          window = pitruPakshaWindow(year);
        }
        if (!window) {
          if (!cancelled) setState(null);
          return;
        }

        // Family mapping: each entry's tithi projected onto its shraddha day.
        const familyByDay = new Map<string, FamilyMember[]>();
        for (const entry of entries) {
          const day = pakshaShraddhaDay(entry.tithiRule, year);
          if (!day) continue;
          const key = rowKey(day);
          const members = familyByDay.get(key) ?? [];
          members.push({ id: entry.id, name: entryDisplayName(entry, lang), nameEn: entryDisplayName(entry, 'en') });
          familyByDay.set(key, members);
        }

        // One row per civil day, purnima through amavasya, named by its sunrise
        // tithi; a kshaya day (sunrise index jumps by 2) carries both names, the
        // same combined form published shraddha calendars use.
        const rows: FortnightRow[] = [];
        for (let d = new Date(window.purnima); d.getTime() <= window.end.getTime(); d = addDays(d, 1)) {
          const isLast = d.getTime() === window.end.getTime();
          const key = rowKey(d);
          let labelHi: string;
          let labelEn: string;
          let heroHi: string;
          let heroEn: string;
          let fortnightDay: PitruFortnightDay | null;
          if (d.getTime() === window.purnima.getTime()) {
            labelHi = heroHi = 'पूर्णिमा श्राद्ध';
            labelEn = heroEn = 'Purnima Shraddha';
            fortnightDay = 'purnima';
          } else if (isLast) {
            heroHi = 'सर्वपितृ अमावस्या';
            heroEn = 'Sarvapitri Amavasya';
            labelHi = 'सर्वपितृ अमावस्या — अज्ञात तिथियों हेतु';
            labelEn = 'Sarvapitri Amavasya — for unknown tithis';
            fortnightDay = 'amavasya';
          } else {
            const { tithiIndex } = computeTithiAndMonth(d, { calendarSystem: 'purnimant' });
            const nextIndex = computeTithiAndMonth(addDays(d, 1), { calendarSystem: 'purnimant' }).tithiIndex;
            const kshayaIndex = (tithiIndex + 2) % 30 === nextIndex ? (tithiIndex + 1) % 30 : null;
            labelHi = heroHi = kshayaIndex !== null
              ? `${TITHI_NAMES_HI[tithiIndex]} व ${TITHI_NAMES_HI[kshayaIndex]} श्राद्ध`
              : `${TITHI_NAMES_HI[tithiIndex]} श्राद्ध`;
            labelEn = heroEn = kshayaIndex !== null
              ? `${TITHI_NAMES_EN[tithiIndex]} & ${TITHI_NAMES_EN[kshayaIndex]} Shraddha`
              : `${TITHI_NAMES_EN[tithiIndex]} Shraddha`;
            // Krishna tithis sit at 15–29; day 1 is प्रतिपदा at index 15.
            fortnightDay = tithiIndex >= 15 && tithiIndex <= 28 ? ((tithiIndex - 14) as PitruFortnightDay) : null;
          }
          rows.push({
            key,
            date: new Date(d),
            labelHi,
            labelEn,
            heroHi,
            heroEn,
            fortnightDay,
            family: familyByDay.get(key) ?? [],
          });
        }

        const todayIndex = rows.findIndex((row) => row.date.getTime() === todayMs);
        const standing: Standing = previousEnd !== null
          ? { kind: 'next', previousEnd }
          : todayIndex >= 0
            ? { kind: 'during', dayNumber: todayIndex + 1, total: rows.length, row: rows[todayIndex] }
            : { kind: 'before', daysUntil: Math.round((window.purnima.getTime() - todayMs) / 86400000) };

        if (!cancelled) setState({ year, start: window.start, end: window.end, rows, standing, todayIndex });
      } catch {
        if (!cancelled) setState(null);
      }
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [entries, lang, todayMs]);

  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);
  const titleFont = scriptTitleFont(lang, typography.readerTitle.fontFamily);
  const shraddhaVidhi = getVidhiById('shraddha-tarpan-vidhi');
  const showShiksha = hasPitruShiksha();
  const familyRows = state?.rows.filter((row) => row.family.length > 0) ?? [];
  const todayRow = state && state.todayIndex >= 0 ? state.rows[state.todayIndex] : null;

  /**
   * §74's verified tithi teachings, keyed by the day they describe. The fortnight
   * is ONE list and it is this one: the teaching meets the dated day it belongs
   * to instead of living in a parallel sixteen-row list on the परिचय screen.
   */
  const tithiLessons = useMemo(() => {
    const byDay = new Map<PitruFortnightDay, PitruLessonEntry>();
    if (!showShiksha) return byDay;
    for (const lesson of getPitruLessons('tithi')) {
      if (lesson.fortnightDay !== undefined) byDay.set(lesson.fortnightDay, lesson);
    }
    return byDay;
  }, [showShiksha]);

  // Today opens by default; any other day that HAS something opens on tap, and
  // tapping the open one closes it. `undefined` means "nobody has chosen yet".
  const [chosenKey, setChosenKey] = useState<string | null | undefined>(undefined);
  const openKey = chosenKey === undefined ? todayRow?.key ?? null : chosenKey;
  const openRow = state?.rows.find((row) => row.key === openKey) ?? null;
  // ONE guide door, in the bar, and it follows the day in view: the open day,
  // else today while the paksha runs, else the first family-matched day, else
  // the fortnight's start. The open day's card used to carry its own dated
  // copy — the same door twice whenever today was open.
  const vidhiOccurrence = openRow?.date ?? todayRow?.date ?? familyRows[0]?.date ?? state?.start ?? null;

  const heroTitle = (() => {
    if (!state) return '';
    const { standing } = state;
    if (standing.kind === 'during') return contentByLang(lang, standing.row.heroHi, standing.row.heroEn);
    if (standing.kind === 'before') return contentByLang(lang, 'पितृ पक्ष आरम्भ', 'The paksha begins');
    return contentByLang(lang, `पितृ पक्ष ${state.year}`, `Pitru Paksha ${state.year}`);
  })();

  const heroStanding = (() => {
    if (!state) return '';
    const { standing } = state;
    if (standing.kind === 'during') {
      return contentByLang(
        lang,
        `दिन ${standing.dayNumber} / ${standing.total} · आज`,
        `Day ${standing.dayNumber} of ${standing.total} · today`
      );
    }
    if (standing.kind === 'before') {
      const start = shortDate(state.rows[0].date, lang);
      return standing.daysUntil === 1
        ? contentByLang(lang, `कल से · ${start}`, `From tomorrow · ${start}`)
        : contentByLang(lang, `${standing.daysUntil} दिन शेष · ${start}`, `In ${standing.daysUntil} days · ${start}`);
    }
    return contentByLang(lang, `अगले वर्ष · ${shortDate(state.start, lang)} से`, `Next year · from ${shortDate(state.start, lang)}`);
  })();

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ReaderHeader
          variant="index"
          title={contentByLang(lang, `पितृ पक्ष ${state?.year ?? ''}`.trim(), `Pitru Paksha ${state?.year ?? ''}`.trim())}
          onBack={() => navigation.goBack()}
        />
        {state === null ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.saffron} />
          </View>
        ) : (
          <>
            <ScrollView
              ref={scrollRef}
              contentContainerStyle={[
                styles.scroll,
                { paddingHorizontal: spacing.xxl, paddingBottom: spacing.xxl + ACTION_BAR_HEIGHT },
              ]}
              showsVerticalScrollIndicator={false}
            >
              {/* The standing hero — what today IS in this fortnight, before the dates. */}
              <View style={styles.hero} testID="pitru-paksha-standing">
                <Text style={{ fontFamily: titleFont, fontSize: 21, lineHeight: 32, color: colors.ink, textAlign: 'center' }}>
                  {heroTitle}
                </Text>
                <View
                  style={[
                    styles.standPill,
                    {
                      backgroundColor: state.standing.kind === 'next' ? colors.goldTint : colors.saffronTint,
                      borderRadius: radii.pill,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontFamily: bodyFont,
                      fontSize: 11.5,
                      color: state.standing.kind === 'next' ? colors.inkMuted : colors.saffronDeep,
                    }}
                  >
                    {heroStanding}
                  </Text>
                </View>
                <Text style={{ fontFamily: bodyFont, fontSize: 12, lineHeight: 18, color: colors.inkSoft, textAlign: 'center', marginTop: 8 }}>
                  {contentByLang(lang, 'भाद्रपद कृष्ण पक्ष', 'The Mahalaya fortnight')} · {shortDate(state.start, lang)} – {shortDate(state.end, lang)}
                </Text>
                {state.standing.kind === 'next' && (
                  <Text style={{ fontFamily: bodyFont, fontSize: 12, lineHeight: 18, color: colors.inkMuted, textAlign: 'center', marginTop: 3 }}>
                    {contentByLang(
                      lang,
                      `इस वर्ष का पक्ष ${shortDate(state.standing.previousEnd, lang)} को पूर्ण हुआ`,
                      `This year’s paksha ended ${shortDate(state.standing.previousEnd, lang)}`
                    )}
                  </Text>
                )}
              </View>

              {/* One strip: the days that are the family's, or — with nothing
                  saved — the door that makes the table personal at all. */}
              {familyRows.length > 0 ? (
                <Pressable
                  testID="pitru-paksha-family-strip"
                  accessibilityRole="button"
                  accessibilityLabel="Open the first family shraddha day"
                  onPress={() => {
                    setChosenKey(familyRows[0].key);
                    if (familyOffset.current !== null) {
                      scrollRef.current?.scrollTo({ y: Math.max(0, familyOffset.current - 24), animated: true });
                    }
                  }}
                  style={({ pressed }) => [
                    styles.strip,
                    { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.md },
                    pressed && { opacity: 0.75 },
                  ]}
                >
                  <View style={[styles.stripDot, { backgroundColor: colors.saffron }]} />
                  <View style={styles.stripMain}>
                    <Text style={{ fontFamily: titleFont, fontSize: 14, color: colors.ink }}>
                      {contentByLang(
                        lang,
                        `आपके परिवार के ${familyRows.length} दिन`,
                        familyRows.length === 1 ? 'Your family’s day' : `Your family’s ${familyRows.length} days`
                      )}
                    </Text>
                    <Text style={{ fontFamily: bodyFont, fontSize: 11.5, lineHeight: 17, color: colors.inkMuted, marginTop: 1 }}>
                      {familyRows.map((row) => shortDate(row.date, lang)).join(' · ')}
                    </Text>
                  </View>
                  <Text style={{ color: colors.inkSoft, fontSize: 17 }}>›</Text>
                </Pressable>
              ) : (
                <Pressable
                  testID="pitru-paksha-smaran-door"
                  accessibilityRole="button"
                  accessibilityLabel="Open Pitru Smaran list"
                  onPress={() => navigation.navigate('PitruSmaranList')}
                  style={({ pressed }) => [
                    styles.strip,
                    { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.md },
                    pressed && { opacity: 0.75 },
                  ]}
                >
                  <View style={[styles.stripDot, { backgroundColor: colors.gold }]} />
                  <View style={styles.stripMain}>
                    <Text style={{ fontFamily: titleFont, fontSize: 14, color: colors.ink }}>
                      {contentByLang(lang, 'अपने पितरों की तिथियाँ जोड़ें', 'Add your ancestors’ tithis')}
                    </Text>
                    <Text style={{ fontFamily: bodyFont, fontSize: 11.5, lineHeight: 17, color: colors.inkMuted, marginTop: 1 }}>
                      {contentByLang(lang, 'तिथि सहेजने पर उनका दिन यहाँ चिह्नित होगा', 'A saved tithi marks their day in this table')}
                    </Text>
                  </View>
                  <Text style={{ color: colors.inkSoft, fontSize: 17 }}>›</Text>
                </Pressable>
              )}

              {state.rows.map((row, i) => {
                const isFamily = row.family.length > 0;
                const isToday = i === state.todayIndex;
                const lesson = row.fortnightDay !== null ? tithiLessons.get(row.fortnightDay) : undefined;
                // A day is worth opening when it holds something: a teaching the
                // registry can give, or someone this family remembers on it.
                // Today is always open — it is the day the screen is about, and
                // the card still carries its dated guide when it holds neither.
                const openable = lesson !== undefined || isFamily || isToday;
                const open = openable && openKey === row.key;
                const anchor = isFamily && row === familyRows[0]
                  ? (e: { nativeEvent: { layout: { y: number } } }) => {
                      familyOffset.current = e.nativeEvent.layout.y;
                    }
                  : undefined;

                if (open) {
                  const paragraphs = lesson ? commentaryByLang(lang, lesson.bodyHi, lesson.bodyEn) : [];
                  return (
                    <View
                      key={row.key}
                      onLayout={anchor}
                      testID={isToday ? 'pitru-paksha-today' : `pitru-paksha-day-${row.key}`}
                      style={[styles.dayCard, { backgroundColor: colors.parchmentSoft, borderColor: colors.saffron, borderRadius: radii.md }]}
                    >
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Close day ${shortDate(row.date, 'en')}`}
                        onPress={() => setChosenKey(null)}
                        style={styles.dayHead}
                      >
                        <Text style={{ fontFamily: titleFont, fontSize: 15.5, lineHeight: 23, color: colors.ink, flex: 1 }}>
                          {contentByLang(lang, row.heroHi, row.heroEn)}
                        </Text>
                        <Text style={{ fontFamily: bodyFont, fontSize: 11, color: colors.saffronDeep }}>
                          {isToday ? `${contentByLang(lang, 'आज', 'today')} · ` : ''}{shortDate(row.date, lang)}
                        </Text>
                      </Pressable>
                      {row.family.map((member) => (
                        <Pressable
                          key={member.id}
                          testID={`pitru-paksha-person-${member.id}`}
                          accessibilityRole="button"
                          accessibilityLabel={`Open smaran ${member.nameEn}`}
                          onPress={() => navigation.navigate('PitruSmaranDetail', { entryId: member.id })}
                          style={({ pressed }) => [
                            styles.person,
                            { borderColor: colors.divider, backgroundColor: colors.parchmentHighlight, borderRadius: radii.sm },
                            pressed && { opacity: 0.75 },
                          ]}
                        >
                          <Text style={{ flex: 1, fontFamily: bodyFont, fontSize: 13.5, lineHeight: 21, color: colors.saffronDeep }}>
                            ॥ {member.name}
                          </Text>
                          <Text style={{ color: colors.inkSoft, fontSize: 16 }}>›</Text>
                        </Pressable>
                      ))}
                      {paragraphs.map((paragraph, idx) => (
                        <Text
                          key={idx}
                          style={{ fontFamily: bodyFont, fontSize: 13, lineHeight: 21, color: colors.inkSoft, marginTop: idx === 0 ? 8 : 6 }}
                        >
                          {paragraph}
                        </Text>
                      ))}
                      <View style={styles.dayActions}>
                        {/* The guide for this day is the bar's filled door, which
                            follows the open day. The card carries only the question
                            a dated day raises — answered by the lesson that explains
                            the mapping, opened ON that lesson. */}
                        {showShiksha && (
                          <Pressable
                            testID="pitru-paksha-day-shiksha"
                            accessibilityRole="button"
                            accessibilityLabel="Open the lesson on how a tithi is matched"
                            onPress={() => navigation.navigate('PitruParichayReader', { lessonId: 'kis-din-kiska' })}
                            style={({ pressed }) => [
                              styles.dayAction,
                              { borderColor: colors.gold, backgroundColor: colors.goldTint, borderRadius: radii.sm },
                              pressed && { opacity: 0.75 },
                            ]}
                          >
                            <Text style={{ fontFamily: titleFont, fontSize: 12.5, color: colors.saffronDeep }}>
                              {contentByLang(lang, 'किस दिन किसका ›', 'Whose day is which ›')}
                            </Text>
                          </Pressable>
                        )}
                      </View>
                    </View>
                  );
                }

                const rowNode = (
                  <PanchangTimelineRow
                    markerColor={isFamily ? colors.saffron : colors.gold}
                    dateLabel={shortDate(row.date, lang)}
                    title={contentByLang(lang, row.labelHi, row.labelEn)}
                    secondary={row.family.map((member) => `॥ ${member.name}`)}
                    density="comfortable"
                    showDivider={i < state.rows.length - 1}
                    muted={!openable}
                    trailing={openable ? <Text style={{ color: colors.inkSoft, fontSize: 17 }}>›</Text> : undefined}
                    accessibilityLabel={
                      openable
                        ? undefined
                        : `${shortDate(row.date, 'en')}, ${row.labelEn}${isFamily ? `, ${row.family.map((m) => m.nameEn).join(', ')}` : ''}`
                    }
                  />
                );

                return (
                  <View key={row.key} onLayout={anchor}>
                    {openable ? (
                      <Pressable
                        testID={`pitru-paksha-row-${row.key}`}
                        accessibilityRole="button"
                        accessibilityLabel={`Open day ${shortDate(row.date, 'en')}`}
                        onPress={() => setChosenKey(row.key)}
                        style={({ pressed }) => (pressed ? { opacity: 0.7 } : undefined)}
                      >
                        {rowNode}
                      </Pressable>
                    ) : (
                      rowNode
                    )}
                  </View>
                );
              })}
            </ScrollView>

            {/* Both standing doors, one tap from any row — §73's daan-home-actions
                pattern. They used to sit at the two far ends of the scroll. */}
            <View
              testID="pitru-paksha-actions"
              style={[
                styles.actionBar,
                { backgroundColor: colors.parchmentHighlight, borderTopColor: colors.divider, paddingHorizontal: spacing.xxl },
                elevation.lifted,
              ]}
            >
              {showShiksha && (
                <Pressable
                  testID="pitru-paksha-shiksha-door"
                  accessibilityRole="button"
                  accessibilityLabel="Open Pitru Paksha introduction"
                  onPress={() => navigation.navigate('PitruPakshaShiksha')}
                  style={({ pressed }) => [
                    styles.actionBtn,
                    { flex: 1, borderColor: colors.saffron, borderRadius: radii.pill },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text style={{ fontFamily: titleFont, fontSize: 15, color: colors.saffronDeep }}>
                    {contentByLang(lang, 'परिचय', 'Introduction')}
                  </Text>
                </Pressable>
              )}
              {shraddhaVidhi && vidhiOccurrence && (
                <Pressable
                  testID="pitru-paksha-vidhi-door"
                  accessibilityRole="button"
                  accessibilityLabel="Open Tila-Tarpana remembrance guide"
                  onPress={() => navigation.navigate('VidhiDetail', {
                    vidhiId: shraddhaVidhi.id,
                    dateMs: vidhiOccurrence.getTime(),
                  })}
                  style={({ pressed }) => [
                    styles.actionBtn,
                    { flex: 1.3, backgroundColor: colors.saffron, borderColor: colors.saffron, borderRadius: radii.pill },
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Text style={{ fontFamily: titleFont, fontSize: 15, color: colors.onPrimary }}>
                    ॥ {contentByLang(lang, 'तिल-तर्पण', 'Tila-tarpana')}
                    {openRow ? ` · ${shortDate(openRow.date, lang)}` : ''}
                  </Text>
                </Pressable>
              )}
            </View>
          </>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingTop: 4 },
  hero: { marginTop: 4, marginBottom: 12, alignItems: 'center' },
  standPill: { marginTop: 8, paddingHorizontal: 12, paddingVertical: 3 },
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 8,
    minHeight: 52,
  },
  stripDot: { width: 8, height: 8, borderRadius: 4 },
  stripMain: { flex: 1, minWidth: 0 },
  dayCard: { borderWidth: 1, paddingHorizontal: 12, paddingVertical: 12, marginVertical: 8 },
  dayHead: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  dayActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  person: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, marginTop: 8, paddingHorizontal: 10, minHeight: 44 },
  dayAction: { flex: 1, borderWidth: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  actionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: ACTION_BAR_HEIGHT,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionBtn: { height: 50, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
});
