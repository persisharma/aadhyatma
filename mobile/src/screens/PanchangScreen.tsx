import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { GestureResponderEvent } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { backgroundImages } from '@assets/backgrounds';
import BackgroundLayer from '@/components/BackgroundLayer';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage, type Lang } from '@/data/gita/language';
import { library } from '@/data/texts';
import { buildEntryStartTarget } from '@/navigation/entryRoutes';
import LocationPickerModal from '@/components/LocationPickerModal';
import MuhuratGlanceCard from '@/components/MuhuratGlanceCard';
import { formatClock as formatTime12, formatEndInstant } from '@/panchang/muhuratFormat';
import { usePanchangLocation } from '@/contexts/PanchangLocationContext';
import { buildCalendarMonth, dateKey } from '@/panchang/calendarGrid';
import { PAKSHA_NAMES_HI, PAKSHA_NAMES_EN } from '@/panchang/names';
import {
  usePanchangCalendarSystem,
  usePanchangForSelection,
  usePanchangMonthObservances,
} from '@/panchang/usePanchang';
import type { CalendarSystem, PanchangElement, ResolvedObservance } from '@/panchang/types';
import { getKathaContent } from '@/panchang/kathaContent';
import { getUpcomingObservances, searchObservances } from '@/panchang/festivalEngine';
import { getCategoryCounts, getKathaCount, type BrowseCategory } from '@/panchang/vratCatalog';
import { useVratFollows } from '@/contexts/VratFollowContext';
import { captionFont } from '@/utils/scriptFont';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { scriptTitleFont, scriptBodyFont } from '@/utils/langType';
import { useTourTarget } from '@/components/tour/tourTargets';
import { fontFamilies } from '@/theme/typography';
import { transliterateDevanagari } from '@/utils/transliterate';
import CategoryIcon from '@/components/CategoryIcon';
import type { PanchangHomeMode, PanchangStackParamList } from '@/navigation/types';

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_FULL_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_HI = ['जन', 'फ़र', 'मार्च', 'अप्रै', 'मई', 'जून', 'जुल', 'अग', 'सित', 'अक्टू', 'नवं', 'दिसं'];
const MONTHS_FULL_HI = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
const WEEKDAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS_HI = ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];
type ObservanceCalendarTag = 'vrat' | 'festival' | 'mixed';
type Props = NativeStackScreenProps<PanchangStackParamList, 'PanchangHome'>;

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function formatShortDate(date: Date, lang: Lang): string {
  const months =
    lang === 'en' ? MONTHS_EN : lang === 'hi' ? MONTHS_HI : MONTHS_HI.map((m) => transliterateDevanagari(m, lang));
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

function formatFullDate(date: Date, lang: Lang): string {
  const months =
    lang === 'en'
      ? MONTHS_FULL_EN
      : lang === 'hi'
        ? MONTHS_FULL_HI
        : MONTHS_FULL_HI.map((m) => transliterateDevanagari(m, lang));
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function formatMonthTitle(date: Date, lang: Lang): string {
  const months =
    lang === 'en'
      ? MONTHS_FULL_EN
      : lang === 'hi'
        ? MONTHS_FULL_HI
        : MONTHS_FULL_HI.map((m) => transliterateDevanagari(m, lang));
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

function calendarTagLabel(tag: ObservanceCalendarTag, lang: Lang): string {
  if (tag === 'vrat') return contentByLang(lang, 'व्रत', 'Vrat');
  if (tag === 'festival') return contentByLang(lang, 'पर्व', 'Fest');
  return contentByLang(lang, 'व्रत+', 'Both');
}

export default function PanchangScreen({ route }: Props) {
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  // Feature-tour spotlight anchors (design.md §47): the Choghadiya/Muhurat glance
  // card and the [Calendar | Vrat & Parv] segment.
  const muhuratCardRef = useTourTarget('muhuratCard');
  const panchangSegmentRef = useTourTarget('panchangSegment');
  const rootNav = useNavigation<any>();
  const { followCount, reminderCount } = useVratFollows();
  const todayKey = new Date().toDateString();
  const today = useMemo(() => startOfLocalDay(new Date(todayKey)), [todayKey]);
  const [selectedDate, setSelectedDate] = useState(() => startOfLocalDay(new Date()));
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));
  const [calendarExpanded, setCalendarExpanded] = useState(false);
  const [panchangTab, setPanchangTab] = useState<PanchangHomeMode>(
    route.params?.initialTab ?? 'calendar'
  );
  const [catalogQuery, setCatalogQuery] = useState('');
  const calendarSwipeStart = useRef<{ x: number; y: number } | null>(null);
  const [calendarSystem, setCalendarSystem] = usePanchangCalendarSystem();
  const { location } = usePanchangLocation();
  const [locationPickerVisible, setLocationPickerVisible] = useState(false);
  const { panchang: p, observances, upcoming } = usePanchangForSelection(selectedDate, calendarSystem);
  const monthObservances = usePanchangMonthObservances(visibleMonth, calendarSystem);
  const monthObservanceTags = useMemo(() => {
    const tags = new Map<string, ObservanceCalendarTag>();
    monthObservances.forEach((item) => {
      const key = dateKey(item.date);
      const nextTag: ObservanceCalendarTag = item.rule.category === 'vrat' ? 'vrat' : 'festival';
      const currentTag = tags.get(key);
      tags.set(key, currentTag && currentTag !== nextTag ? 'mixed' : nextTag);
    });
    return tags;
  }, [monthObservances]);
  const calendarCells = useMemo(
    () => buildCalendarMonth({
      visibleMonth,
      selectedDate,
      today,
      observanceDates: monthObservances.map((item) => item.date),
    }),
    [visibleMonth, selectedDate, today, monthObservances]
  );

  useEffect(() => {
    if (route.params?.initialTab) setPanchangTab(route.params.initialTab);
  }, [route.params?.initialTab]);

  const shiftSelectedDate = (days: number) => {
    setSelectedDate((current) => {
      const next = startOfLocalDay(addDays(current, days));
      setVisibleMonth(startOfMonth(next));
      return next;
    });
    setCalendarExpanded(false);
  };

  const handleCalendarTouchStart = (event: GestureResponderEvent) => {
    const { pageX, pageY } = event.nativeEvent;
    calendarSwipeStart.current = { x: pageX, y: pageY };
  };

  const handleCalendarTouchEnd = (event: GestureResponderEvent) => {
    const start = calendarSwipeStart.current;
    calendarSwipeStart.current = null;
    if (!start) return;

    const { pageX, pageY } = event.nativeEvent;
    const dx = pageX - start.x;
    const dy = pageY - start.y;
    if (Math.abs(dx) > 54 && Math.abs(dx) > Math.abs(dy) * 1.35) {
      shiftSelectedDate(dx > 0 ? -1 : 1);
    }
  };

  const handleSelectDate = (date: Date) => {
    const next = startOfLocalDay(date);
    setSelectedDate(next);
    setVisibleMonth(startOfMonth(next));
    setCalendarExpanded(false);
  };

  const handleToday = () => {
    setSelectedDate(today);
    setVisibleMonth(startOfMonth(today));
    setCalendarExpanded(false);
  };

  const openLinkedSection = (sectionId: string) => {
    const entry = library.find((item) => item.id === sectionId);
    const target = entry ? buildEntryStartTarget(entry) : null;
    if (target) rootNav.navigate('HomeTab', target);
  };

  const openKatha = (kathaId: string) => {
    rootNav.navigate('HomeTab', { screen: 'VratKathaReader', params: { kathaId } });
  };

  const openObservanceDetail = (ruleId: string) => rootNav.navigate('ObservanceDetail', { ruleId });
  const openCategory = (category: BrowseCategory) => rootNav.navigate('ObservanceList', { category });
  const openKathaLibrary = () => rootNav.navigate('KathaLibrary');
  const openMyVrat = () => rootNav.navigate('MyVrat');
  const openKundali = () => rootNav.navigate('Kundali');
  const openRashifal = () => rootNav.navigate('Rashifal');

  return (
    <View style={styles.root}>
      <BackgroundLayer source={backgroundImages.panchang_celestial_almanac} />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing.xxl }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Slim system header — one compact row. The calendar-system toggle and
              the tappable location reference share a line (the toggle already names
              the system, so it is dropped from the location text), with the My Vrat
              star at the trailing edge. This reclaims the vertical space the old
              stacked toggle-over-location header took. */}
          {panchangTab !== 'jyotish' && <View style={styles.systemHeader}>
            {/* Equal-width flex sides keep the calendar-system toggle centred on
                screen regardless of how wide the location chip / star are. */}
            <View style={styles.headerSide}>
              {/* Location selector — a drawn pin + city name in a bordered chip.
                  Explicit accessibilityLabel "Location: <city>" keeps it readable
                  for screen readers and stable for .maestro/panchang*-smoke. */}
              <Pressable
                onPress={() => setLocationPickerVisible(true)}
                accessibilityRole="button"
                accessibilityLabel={contentByLang(lang, `स्थान: ${location.labelHi}`, `Location: ${location.labelEn}`)}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.locationChip,
                  { borderColor: colors.divider, backgroundColor: colors.parchmentSoft, borderRadius: radii.pill },
                  pressed && { opacity: 0.6 },
                ]}
              >
                <View style={[styles.pin, { backgroundColor: colors.saffron }]}>
                  <View style={[styles.pinHole, { backgroundColor: colors.parchmentSoft }]} />
                </View>
                <Text
                  numberOfLines={1}
                  style={{ flexShrink: 1, fontFamily: lang === 'en' ? 'CormorantGaramond_500Medium' : scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 12, color: colors.inkSoft }}
                >
                  {contentByLang(lang, location.labelHi, location.labelEn)}
                </Text>
              </Pressable>
            </View>
            {/* Calendar system (centre) */}
            <CalendarSystemToggle
              value={calendarSystem}
              onChange={setCalendarSystem}
              lang={lang}
              colors={colors}
              radii={radii}
              typography={typography}
            />
            {/* My Vrat (right) — a circular icon button so the star reads as
                tappable and distinct from the location chip. */}
            <View style={[styles.headerSide, styles.headerSideRight]}>
              <Pressable
                onPress={openMyVrat}
                accessibilityRole="button"
                accessibilityLabel={followCount > 0 ? `My Vrat, ${followCount} following` : 'My Vrat'}
                hitSlop={10}
                style={({ pressed }) => [
                  styles.myVratButton,
                  { borderColor: colors.divider, backgroundColor: colors.parchmentSoft, borderRadius: radii.pill },
                  pressed && { opacity: 0.6 },
                ]}
              >
                <Text style={{ fontSize: 16, color: colors.gold }}>★</Text>
                {followCount > 0 && (
                  <View style={[styles.starBadge, { backgroundColor: colors.saffron, borderColor: colors.parchment }]}>
                    <Text style={[styles.starBadgeText, { color: colors.parchment }]}>{followCount}</Text>
                  </View>
                )}
              </Pressable>
            </View>
          </View>}

          <View ref={panchangSegmentRef} collapsable={false} style={[styles.segmented, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.pill }]}>
            {(['calendar', 'catalog', 'jyotish'] as const).map((tab) => {
              const selected = panchangTab === tab;
              const labels = {
                calendar: { hi: 'पंचांग', en: 'Panchang' },
                catalog: { hi: 'व्रत-पर्व', en: 'Vrat & Parv' },
                jyotish: { hi: 'ज्योतिष', en: 'Jyotish' },
              } as const;
              return (
                <Pressable
                  key={tab}
                  onPress={() => setPanchangTab(tab)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected }}
                  accessibilityLabel={labels[tab].en}
                  style={({ pressed }) => [
                    styles.segmentOption,
                    { borderRadius: radii.pill },
                    selected && { backgroundColor: colors.saffronTint },
                    pressed && !selected && { opacity: 0.7 },
                  ]}
                >
                  <Text style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 13, color: selected ? colors.saffronDeep : colors.inkMuted }}>
                    {contentByLang(lang, labels[tab].hi, labels[tab].en)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {panchangTab === 'calendar' ? (
            <>
          <View
            style={[styles.calendarCard, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg }, elevation.card]}
            onTouchStart={handleCalendarTouchStart}
            onTouchEnd={handleCalendarTouchEnd}
          >
            <View style={styles.compactDateNav}>
              <Pressable
                onPress={() => shiftSelectedDate(-1)}
                accessibilityRole="button"
                accessibilityLabel="Previous date"
                hitSlop={10}
                style={({ pressed }) => [styles.dateNavButton, { borderColor: colors.divider }, pressed && { opacity: 0.6 }]}
              >
                <Text style={{ color: colors.inkSoft, fontSize: 18 }}>‹</Text>
              </Pressable>
              <View
                testID="panchang-selected-date"
                style={styles.selectedDateButton}
              >
                <Pressable
                  onPress={() => setCalendarExpanded((expanded) => !expanded)}
                  accessibilityRole="button"
                  accessibilityLabel={calendarExpanded ? 'Collapse calendar' : 'Expand calendar'}
                  style={({ pressed }) => [styles.datePagerPage, pressed && { opacity: 0.7 }]}
                >
                  <Text style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 15, color: colors.ink, textAlign: 'center' }}>
                    {formatFullDate(selectedDate, lang)}
                  </Text>
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 10, color: colors.saffronDeep, marginTop: 2 }}>
                    {calendarExpanded
                      ? contentByLang(lang, 'माह छिपाएँ', 'Hide month')
                      : contentByLang(lang, 'माह देखें', 'Month view')}
                  </Text>
                </Pressable>
              </View>
              <Pressable
                onPress={() => shiftSelectedDate(1)}
                accessibilityRole="button"
                accessibilityLabel="Next date"
                hitSlop={10}
                style={({ pressed }) => [styles.dateNavButton, { borderColor: colors.divider }, pressed && { opacity: 0.6 }]}
              >
                <Text style={{ color: colors.inkSoft, fontSize: 18 }}>›</Text>
              </Pressable>
            </View>
            <View style={styles.compactActions}>
              <Text style={{ fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 11, color: colors.inkMuted, flex: 1 }}>
                {formatMonthTitle(selectedDate, lang)}
              </Text>
              <Pressable
                onPress={handleToday}
                accessibilityRole="button"
                accessibilityLabel="Today"
                style={({ pressed }) => [styles.todayButton, styles.compactTodayButton, { borderColor: colors.divider }, pressed && { opacity: 0.7 }]}
              >
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: colors.saffronDeep }}>
                  {contentByLang(lang, 'आज', 'Today')}
                </Text>
              </Pressable>
            </View>

            {calendarExpanded && (
              <View style={[styles.expandedCalendar, { borderTopColor: colors.divider }]}>
                <View style={styles.monthHeader}>
                  <Pressable
                    onPress={() => setVisibleMonth((current) => addMonths(current, -1))}
                    accessibilityRole="button"
                    accessibilityLabel="Previous month"
                    hitSlop={10}
                    style={({ pressed }) => [styles.monthButton, { borderColor: colors.divider }, pressed && { opacity: 0.6 }]}
                  >
                    <Text style={{ color: colors.inkSoft, fontSize: 18 }}>‹</Text>
                  </Pressable>
                  <Text style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 15, color: colors.ink }}>
                    {formatMonthTitle(visibleMonth, lang)}
                  </Text>
                  <Pressable
                    onPress={() => setVisibleMonth((current) => addMonths(current, 1))}
                    accessibilityRole="button"
                    accessibilityLabel="Next month"
                    hitSlop={10}
                    style={({ pressed }) => [styles.monthButton, { borderColor: colors.divider }, pressed && { opacity: 0.6 }]}
                  >
                    <Text style={{ color: colors.inkSoft, fontSize: 18 }}>›</Text>
                  </Pressable>
                </View>
                <View style={styles.weekdayRow}>
                  {(lang === 'en' ? WEEKDAYS_EN : lang === 'hi' ? WEEKDAYS_HI : WEEKDAYS_HI.map((d) => transliterateDevanagari(d, lang))).map((day) => (
                    <Text key={day} style={[styles.weekdayText, { color: colors.inkMuted }]}>
                      {day}
                    </Text>
                  ))}
                </View>
                <View style={styles.dateGrid}>
                  {calendarCells.map((cell) => {
                    const observanceTag = monthObservanceTags.get(cell.key);
                    return (
                      <Pressable
                        key={cell.key}
                        onPress={() => handleSelectDate(cell.date)}
                        accessibilityRole="button"
                        accessibilityLabel={`Select ${formatFullDate(cell.date, 'en')}${observanceTag ? ` ${calendarTagLabel(observanceTag, 'en')}` : ''}`}
                        style={({ pressed }) => [
                          styles.dateCell,
                          cell.isSelected && { backgroundColor: colors.saffronTint, borderColor: colors.saffron },
                          !cell.isSelected && cell.isToday && { borderColor: colors.gold },
                          pressed && { opacity: 0.7 },
                        ]}
                      >
                        <Text
                          style={{
                            fontFamily: 'Inter_600SemiBold',
                            fontSize: 12,
                            color: cell.isCurrentMonth ? colors.ink : colors.inkMuted,
                            opacity: cell.isCurrentMonth ? 1 : 0.45,
                          }}
                        >
                          {cell.date.getDate()}
                        </Text>
                        {observanceTag && (
                          <View
                            style={[
                              styles.dateTag,
                              { backgroundColor: observanceTag === 'festival' ? colors.saffronTint : colors.goldTint },
                            ]}
                          >
                            <Text style={[styles.dateTagText, { color: colors.saffronDeep }]}>
                              {calendarTagLabel(observanceTag, lang)}
                            </Text>
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}
          </View>

          {p ? (
            <>
          <View style={[styles.dateHeader, { borderBottomColor: colors.divider }]}>
            <Text style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 15, color: colors.saffronDeep }}>
              {contentByLang(lang, p.vara.nameHi, p.vara.nameEn)}
              <Text style={{ fontFamily: lang === 'en' ? 'CormorantGaramond_500Medium' : scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 12, color: colors.inkSoft }}>
                {'  '}{formatFullDate(p.date, lang)} · {contentByLang(lang, `विक्रम संवत् ${p.vikramSamvat}`, `Vikram Samvat ${p.vikramSamvat}`)}
              </Text>
            </Text>
            <Text style={{ fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 11, color: colors.inkMuted, marginTop: 2 }}>
              {contentByLang(
                lang,
                `${p.lunarMonth.nameHi}${p.lunarMonth.isAdhik ? ' (अधिक)' : ''} · ${PAKSHA_NAMES_HI[p.tithi.paksha]} पक्ष`,
                `${p.lunarMonth.nameEn}${p.lunarMonth.isAdhik ? ' (Adhik)' : ''} · ${PAKSHA_NAMES_EN[p.tithi.paksha]} Paksha`
              )}
            </Text>
          </View>

          {/* Daily Muhurat — Choghadiya / Rahu Kaal glance card (PRD-14). Promoted
              to sit directly under the date header, above the anga grid: "is now
              auspicious?" is the live, time-sensitive question users open Panchang
              for, so it leads the day panel rather than trailing the times card. */}
          <View ref={muhuratCardRef} collapsable={false}>
            <MuhuratGlanceCard
              date={selectedDate}
              calendarSystem={calendarSystem}
              onViewAll={() => rootNav.navigate('MuhuratDetail', { dateMs: selectedDate.getTime() })}
            />
          </View>

          {/* Two-tier anga grid: Tithi + Nakshatra lead (the two anchors users read
              first) on elevated off-white cards; Yoga + Karana sit as a quieter,
              flatter secondary row. */}
          <View style={styles.angaGrid}>
            <PanchangTile label={contentByLang(lang, 'तिथि', 'Tithi')} element={p.tithi} kshaya={p.kshayaTithi} panchangDate={p.date} lang={lang} colors={colors} typography={typography} radii={radii} elevation={elevation} />
            <PanchangTile label={contentByLang(lang, 'नक्षत्र', 'Nakshatra')} element={p.nakshatra} kshaya={p.kshayaNakshatra} panchangDate={p.date} lang={lang} colors={colors} typography={typography} radii={radii} elevation={elevation} />
          </View>
          <View style={styles.angaGridSecondary}>
            <PanchangTile label={contentByLang(lang, 'योग', 'Yoga')} element={p.yoga} panchangDate={p.date} lang={lang} colors={colors} typography={typography} radii={radii} elevation={elevation} />
            <PanchangTile label={contentByLang(lang, 'करण', 'Karana')} element={p.karana} panchangDate={p.date} lang={lang} colors={colors} typography={typography} radii={radii} elevation={elevation} />
          </View>

          <View style={[styles.timesCard, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg }, elevation.card]}>
            <View style={styles.timesRow}>
              <TimeCell icon="☀" label={contentByLang(lang, 'सूर्योदय', 'Sunrise')} value={formatTime12(p.sunrise)} lang={lang} colors={colors} />
              <TimeCell icon="☀" label={contentByLang(lang, 'सूर्यास्त', 'Sunset')} value={formatTime12(p.sunset)} lang={lang} colors={colors} />
            </View>
            <View style={[styles.timesRow, { marginTop: 12 }]}>
              <TimeCell icon="☽" label={contentByLang(lang, 'चंद्रोदय', 'Moonrise')} value={formatTime12(p.moonrise)} lang={lang} colors={colors} />
              <TimeCell icon="☽" label={contentByLang(lang, 'ब्रह्म मुहूर्त', 'Brahma Muhurta')} value={`${formatTime12(p.brahmaMuhurta.start)} - ${formatTime12(p.brahmaMuhurta.end)}`} lang={lang} colors={colors} />
            </View>
          </View>
            </>
          ) : (
            <View style={{ paddingVertical: 72, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator color={colors.saffron} />
            </View>
          )}

          <View style={styles.observanceSection}>
            <Text style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 14, color: colors.ink, marginBottom: 10 }}>
              {contentByLang(lang, 'व्रत और पर्व', 'Vrat & Observances')}
            </Text>
            {observances.length > 0 ? (
              observances.map((item, i) => (
                <ObservanceCard
                  key={`${item.rule.id}-${i}`}
                  item={item}
                  lang={lang}
                  colors={colors}
                  typography={typography}
                  radii={radii}
                  elevation={elevation}
                  onOpenLink={openLinkedSection}
                  onOpenKatha={openKatha}
                />
              ))
            ) : (
              <Text style={{ fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 12, lineHeight: 18, color: colors.inkMuted }}>
                {meaningByLang(lang, 'इस तिथि पर कोई व्रत या पर्व नहीं है।', 'No vrat or festival falls on this date.')}
              </Text>
            )}
          </View>

          {upcoming.length > 0 && (
            <View style={styles.upcomingSection}>
              <Text style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 14, color: colors.ink, marginBottom: 10 }}>
                {contentByLang(lang, 'आगामी', 'Upcoming')}
              </Text>
              {upcoming.map((item, i) => (
                <View key={`${item.rule.id}-${item.date.toDateString()}`} style={[styles.upcomingRow, { borderBottomColor: i < upcoming.length - 1 ? colors.divider : 'transparent' }]}>
                  <View style={[styles.upcomingDot, { backgroundColor: markerColor(item.rule.marker, colors) }]} />
                  <Text style={{ fontFamily: lang === 'en' ? 'CormorantGaramond_500Medium' : scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 12, color: colors.inkMuted, width: 50 }}>
                    {formatShortDate(item.date, lang)}
                  </Text>
                  <Text style={{ fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 13, color: colors.ink, flex: 1 }}>
                    {contentByLang(lang, item.rule.nameHi, item.rule.nameEn)}
                  </Text>
                </View>
              ))}
            </View>
          )}
            </>
          ) : panchangTab === 'catalog' ? (
            <CatalogLanding
              lang={lang}
              today={today}
              calendarSystem={calendarSystem}
              query={catalogQuery}
              onChangeQuery={setCatalogQuery}
              colors={colors}
              typography={typography}
              radii={radii}
              elevation={elevation}
              onOpenDetail={openObservanceDetail}
              onOpenCategory={openCategory}
              onOpenKathaLibrary={openKathaLibrary}
              onOpenMyVrat={openMyVrat}
              followCount={followCount}
              reminderCount={reminderCount}
            />
          ) : (
            <JyotishLanding
              lang={lang}
              colors={colors}
              typography={typography}
              radii={radii}
              elevation={elevation}
              onOpenKundali={openKundali}
              onOpenRashifal={openRashifal}
              onOpenNavagraha={() => openLinkedSection('navagraha-stotram')}
            />
          )}
        </ScrollView>
      </SafeAreaView>
      <LocationPickerModal visible={locationPickerVisible} onClose={() => setLocationPickerVisible(false)} />
    </View>
  );
}

function JyotishLanding({
  lang,
  colors,
  typography,
  radii,
  elevation,
  onOpenKundali,
  onOpenRashifal,
  onOpenNavagraha,
}: {
  lang: Lang;
  colors: any;
  typography: any;
  radii: any;
  elevation: any;
  onOpenKundali: () => void;
  onOpenRashifal: () => void;
  onOpenNavagraha: () => void;
}) {
  return (
    <View accessibilityLabel="Jyotish tools landing">
      <View
        style={[
          styles.jyotishHero,
          { borderColor: colors.cardActiveBorder, borderRadius: radii.lg },
          elevation.card,
        ]}
      >
        <View style={[styles.jyotishHeroIcon, { backgroundColor: colors.saffronTint, borderRadius: radii.lg }]}>
          <CategoryIcon iconKey="insight" />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.ink,
              fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
              fontSize: 22,
            }}
          >
            {contentByLang(lang, 'ज्योतिष को समझें', 'Understand Jyotish')}
          </Text>
          <Text
            style={{
              color: colors.inkMuted,
              fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
              fontSize: 12,
              lineHeight: 18,
              marginTop: 5,
            }}
          >
            {meaningByLang(
              lang,
              'पंचांग की खगोलीय गणना से जन्म कुंडली और दैनिक राशि-मार्गदर्शन—सरल अर्थ के साथ।',
              'Birth charts and daily rashi guidance from the same astronomy foundation as Panchang—explained in plain language.'
            )}
          </Text>
        </View>
      </View>

      <Text style={[styles.jyotishSectionLabel, { color: colors.inkMuted }]}>
        {contentByLang(lang, 'अपने लिए', 'FOR YOU')}
      </Text>
      <JyotishToolCard
        titleHi="जन्म कुंडली"
        titleEn="Create Kundali"
        bodyHi="लग्न, ग्रह, भाव और दशा—पहले सरल सार, फिर पूरा चार्ट।"
        bodyEn="Lagna, grahas, houses, and Dasha—with beginner insights before the full chart."
        badge="NEW"
        glyph="कु"
        onPress={onOpenKundali}
        accessibilityLabel="Create Kundali"
        lang={lang}
        colors={colors}
        typography={typography}
        radii={radii}
        elevation={elevation}
      />
      <JyotishToolCard
        titleHi="आज का राशिफल"
        titleEn="Daily Rashifal"
        bodyHi="चन्द्र राशि और आज के गोचर से पारम्परिक चिंतन-संकेत।"
        bodyEn="Traditional reflection prompts from your Moon sign and today's transits."
        glyph="रा"
        onPress={onOpenRashifal}
        accessibilityLabel="Open Daily Rashifal"
        lang={lang}
        colors={colors}
        typography={typography}
        radii={radii}
        elevation={elevation}
      />

      <Text style={[styles.jyotishSectionLabel, { color: colors.inkMuted }]}>
        {contentByLang(lang, 'कुंडली से साधना तक', 'FROM CHART TO PRACTICE')}
      </Text>
      <Pressable
        onPress={onOpenNavagraha}
        accessibilityRole="button"
        accessibilityLabel="Open Navagraha Stotram"
        style={({ pressed }) => [
          styles.jyotishPractice,
          { borderColor: colors.divider, backgroundColor: colors.goldTint, borderRadius: radii.lg },
          pressed && { opacity: 0.7 },
        ]}
      >
        <Text style={[styles.jyotishPracticeGlyph, { color: colors.gold }]}>ॐ</Text>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.ink,
              fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
              fontSize: 15,
            }}
          >
            {contentByLang(lang, 'नवग्रह स्तोत्रम्', 'Navagraha Stotram')}
          </Text>
          <Text
            style={{
              color: colors.inkMuted,
              fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
              fontSize: 11,
              marginTop: 2,
            }}
          >
            {meaningByLang(
              lang,
              'ऐप में पहले से उपलब्ध पारम्परिक पाठ',
              'An existing traditional practice in your library'
            )}
          </Text>
        </View>
        <Text style={{ color: colors.saffronDeep, fontSize: 18 }}>›</Text>
      </Pressable>

      <Text
        style={{
          color: colors.inkMuted,
          fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
          fontSize: 11,
          lineHeight: 17,
          textAlign: 'center',
          marginTop: 14,
        }}
      >
        {meaningByLang(
          lang,
          'पारम्परिक मार्गदर्शन; निश्चित भविष्यवाणी या पेशेवर सलाह नहीं। v1 भारत/IST तक सीमित है।',
          'Traditional guidance, not deterministic prediction or professional advice. v1 is India/IST only.'
        )}
      </Text>
    </View>
  );
}

function JyotishToolCard({
  titleHi,
  titleEn,
  bodyHi,
  bodyEn,
  badge,
  glyph,
  onPress,
  accessibilityLabel,
  lang,
  colors,
  typography,
  radii,
  elevation,
}: {
  titleHi: string;
  titleEn: string;
  bodyHi: string;
  bodyEn: string;
  badge?: string;
  glyph: string;
  onPress: () => void;
  accessibilityLabel: string;
  lang: Lang;
  colors: any;
  typography: any;
  radii: any;
  elevation: any;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.jyotishToolCard,
        {
          borderColor: colors.cardActiveBorder,
          backgroundColor: colors.parchmentSoft,
          borderRadius: radii.lg,
        },
        elevation.card,
        pressed && { opacity: 0.72 },
      ]}
    >
      <View style={[styles.jyotishToolGlyph, { backgroundColor: colors.saffronTint, borderRadius: radii.md }]}>
        <Text style={{ color: colors.saffronDeep, fontFamily: 'NotoSansDevanagari_600SemiBold', fontSize: 18 }}>
          {glyph}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
          <Text
            style={{
              color: colors.ink,
              fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
              fontSize: 17,
            }}
          >
            {contentByLang(lang, titleHi, titleEn)}
          </Text>
          {badge && (
            <View style={[styles.jyotishBadge, { backgroundColor: colors.newBadgeBg, borderRadius: radii.pill }]}>
              <Text style={[styles.jyotishBadgeText, { color: colors.newBadgeText }]}>{badge}</Text>
            </View>
          )}
        </View>
        <Text
          style={{
            color: colors.inkMuted,
            fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
            fontSize: 12,
            lineHeight: 18,
            marginTop: 4,
          }}
        >
          {meaningByLang(lang, bodyHi, bodyEn)}
        </Text>
      </View>
      <Text style={{ color: colors.saffronDeep, fontSize: 20 }}>›</Text>
    </Pressable>
  );
}

function markerColor(marker: ResolvedObservance['rule']['marker'], colors: any): string {
  if (marker === 'star') return colors.saffron;
  if (marker === 'halfmoon') return colors.ink;
  return colors.gold;
}

function CalendarSystemToggle({ value, onChange, lang, colors, radii, typography }: {
  value: CalendarSystem;
  onChange: (next: CalendarSystem) => void;
  lang: Lang;
  colors: any;
  radii: any;
  typography: any;
}) {
  const options: { value: CalendarSystem; labelHi: string; labelEn: string }[] = [
    { value: 'purnimant', labelHi: 'पूर्णिमांत', labelEn: 'Purnimant' },
    { value: 'amanta', labelHi: 'अमान्त', labelEn: 'Amanta' },
  ];

  return (
    <View
      style={[styles.systemToggle, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.pill }]}
      accessibilityRole="radiogroup"
      accessibilityLabel="Calendar system"
    >
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={`${option.labelEn} calendar system`}
            style={({ pressed }) => [
              styles.systemOption,
              { borderRadius: radii.pill },
              selected && { backgroundColor: colors.saffronTint },
              pressed && !selected && { opacity: 0.7 },
            ]}
          >
            <Text style={{
              fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
              fontSize: 12,
              color: selected ? colors.saffronDeep : colors.inkMuted,
            }}>
              {contentByLang(lang, option.labelHi, option.labelEn)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function PanchangTile({ label, element, kshaya, panchangDate, lang, colors, typography, radii, elevation }: {
  label: string;
  element: PanchangElement;
  // Kshaya anga (skipped at every sunrise) — rendered as a second, smaller row so
  // days like 10 Jul 2026 read "दशमी तक 8:16 AM · एकादशी तक 5:22 AM, 11 जुल".
  kshaya?: PanchangElement | null;
  panchangDate: Date;
  lang: Lang;
  colors: any;
  typography: any;
  radii: any;
  elevation: any;
}) {
  const rows = kshaya ? [element, kshaya] : [element];
  return (
    <View
      style={[
        styles.angaTile,
        { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.md, ...elevation.card },
      ]}
    >
      {/* The type label leads in the active language (TITHI / तिथि …) — same
          source as the old row, kept uppercase so it reads as a quiet tag. */}
      <Text
        style={{
          fontSize: 9,
          color: colors.saffronDeep,
          // English keeps the tracked uppercase Cormorant tag; Indic uses its own
          // script serif with no tracking (letterSpacing splits the shirorekha).
          fontFamily: lang === 'en' ? 'CormorantGaramond_600SemiBold' : scriptTitleFont(lang, typography.cardHindi.fontFamily),
          letterSpacing: lang === 'en' ? 1 : 0,
          textTransform: lang === 'en' ? 'uppercase' : 'none',
        }}
      >
        {label}
      </Text>
      {rows.map((row, i) => (
        <React.Fragment key={i}>
          {/* Single-language value. adjustsFontSizeToFit shrinks the longest names
              (e.g. "Uttara Bhadrapada") to one line so every card keeps equal height. */}
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
            style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: i === 0 ? 18 : 15, color: colors.ink, marginTop: i === 0 ? 4 : 6 }}
          >
            {contentByLang(lang, row.nameHi, row.nameEn)}
          </Text>
          {/* formatEndInstant appends a short date when the end falls past
              midnight — a bare "तक 2:04 AM" would read as this morning. */}
          {row.endTime && (
            <Text style={{ fontFamily: lang === 'en' ? 'CormorantGaramond_600SemiBold' : scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 11, color: colors.inkSoft, marginTop: i === 0 ? 5 : 3 }}>
              {contentByLang(lang, 'तक ', 'till ')}{formatEndInstant(row.endTime, panchangDate, lang)}
            </Text>
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

function TimeCell({ icon, label, value, lang, colors }: { icon: string; label: string; value: string; lang: Lang; colors: any }) {
  return (
    <View style={styles.timeCell}>
      {/* ︎ forces text (monochrome) presentation so ☀ doesn't render as a
          colour emoji on iOS while ☽ stays a plain glyph — design.md is "no emoji".
          All four metrics now share one filled-with-accent (gold) glyph style. */}
      <Text style={{ fontSize: 17, color: colors.gold, width: 22, textAlign: 'center' }}>{`${icon}︎`}</Text>
      <View style={{ marginLeft: 9, flex: 1 }}>
        <Text style={{ fontFamily: lang === 'en' ? 'CormorantGaramond_500Medium' : scriptBodyFont(lang, fontFamilies.devanagari), fontSize: 10, color: colors.inkMuted }}>{label}</Text>
        <Text style={{ fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 13, color: colors.ink }}>{value}</Text>
      </View>
    </View>
  );
}

function ObservanceCard({ item, lang, colors, typography, radii, elevation, onOpenLink, onOpenKatha }: {
  item: ResolvedObservance;
  lang: Lang;
  colors: any;
  typography: any;
  radii: any;
  elevation: any;
  onOpenLink: (sectionId: string) => void;
  onOpenKatha: (kathaId: string) => void;
}) {
  const linkedEntry = item.rule.linkSectionId
    ? library.find((entry) => entry.id === item.rule.linkSectionId)
    : null;
  const katha = item.rule.kathaId ? getKathaContent(item.rule.kathaId) : null;

  return (
    <View style={[styles.observanceCard, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.md }, elevation.card]}>
      <View style={styles.observanceTop}>
        <View style={[styles.categoryPill, { backgroundColor: item.rule.category === 'vrat' ? colors.goldTint : colors.saffronTint, borderRadius: radii.pill }]}>
          <Text style={{ fontFamily: lang === 'en' ? 'Inter_600SemiBold' : scriptBodyFont(lang, typography.cardHindi.fontFamily), fontSize: 10, color: colors.saffronDeep }}>
            {item.rule.category === 'vrat' ? contentByLang(lang, 'व्रत', 'Vrat') : contentByLang(lang, 'पर्व', 'Festival')}
          </Text>
        </View>
        <Text style={{ fontFamily: lang === 'en' ? 'CormorantGaramond_500Medium' : scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 12, color: colors.inkMuted }}>
          {contentByLang(lang, item.rule.deityHi, item.rule.deityEn)}
        </Text>
      </View>
      <Text style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 15, color: colors.ink }}>
        {contentByLang(lang, item.rule.nameHi, item.rule.nameEn)}
      </Text>
      <Text style={{ fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 12, lineHeight: 18, color: colors.inkMuted, marginTop: 4 }}>
        {meaningByLang(lang, item.rule.shortDescriptionHi, item.rule.shortDescriptionEn)}
      </Text>
      <View style={styles.linkRow}>
        {katha && item.rule.kathaId && (
          <Pressable
            onPress={() => onOpenKatha(item.rule.kathaId as string)}
            accessibilityRole="button"
            accessibilityLabel={`Read katha ${katha.titleEn}`}
            style={({ pressed }) => [styles.kathaButton, { backgroundColor: colors.goldTint, borderRadius: radii.pill }, pressed && { opacity: 0.7 }]}
          >
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: colors.saffronDeep }}>
              {contentByLang(lang, 'कथा पढ़ें', 'Read Katha')}
            </Text>
          </Pressable>
        )}
        {linkedEntry && (
          <Pressable
            onPress={() => onOpenLink(linkedEntry.id)}
            accessibilityRole="button"
            accessibilityLabel={`Open ${linkedEntry.nameEn}`}
            style={({ pressed }) => [styles.linkButton, { borderColor: colors.divider }, pressed && { opacity: 0.7 }]}
          >
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: colors.saffronDeep }}>
              {contentByLang(lang, `पढ़ें: ${linkedEntry.nameHi}`, `Read: ${linkedEntry.nameEn}`)}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function CatalogLanding({
  lang, today, calendarSystem, query, onChangeQuery,
  colors, typography, radii, elevation,
  onOpenDetail, onOpenCategory, onOpenKathaLibrary, onOpenMyVrat, followCount, reminderCount,
}: {
  lang: Lang;
  today: Date;
  calendarSystem: CalendarSystem;
  query: string;
  onChangeQuery: (q: string) => void;
  colors: any;
  typography: any;
  radii: any;
  elevation: any;
  onOpenDetail: (ruleId: string) => void;
  onOpenCategory: (category: BrowseCategory) => void;
  onOpenKathaLibrary: () => void;
  onOpenMyVrat: () => void;
  followCount: number;
  reminderCount: number;
}) {
  const trimmed = query.trim();
  const results = useMemo(() => (trimmed ? searchObservances(trimmed) : []), [trimmed]);
  const upcoming = useMemo(() => getUpcomingObservances(today, 6, calendarSystem, 150), [today, calendarSystem]);
  const counts = useMemo(() => getCategoryCounts(), []);
  const kathaCount = getKathaCount();

  const tileMeta: Record<BrowseCategory, { glyph: string; hi: string; en: string }> = {
    vrat: { glyph: 'ॐ', hi: 'व्रत', en: 'Vrat' },
    festival: { glyph: '✺', hi: 'पर्व', en: 'Festivals' },
    upavas: { glyph: '☾', hi: 'उपवास', en: 'Upvas' },
  };
  const categoryShort = (category: string): string =>
    category === 'vrat' ? contentByLang(lang, 'व्रत', 'Vrat')
      : category === 'upavas' ? contentByLang(lang, 'उपवास', 'Upvas')
        : contentByLang(lang, 'पर्व', 'Festival');
  // Same glyph vocabulary as the "Browse by type" tiles (ॐ / ☾ / ✺), reused on the
  // upcoming cards so they read as devotional, not as a plain list of text.
  const categoryGlyph = (category: string): string =>
    category === 'vrat' ? 'ॐ' : category === 'upavas' ? '☾' : '✺';

  return (
    <View style={{ marginTop: 12 }}>
      <TextInput
        value={query}
        onChangeText={onChangeQuery}
        placeholder={contentByLang(lang, 'व्रत, पर्व, उपवास, कथा खोजें…', 'Search vrat, festival, upvas, katha…')}
        placeholderTextColor={colors.inkMuted}
        style={[styles.catalogSearch, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.md, color: colors.ink }]}
      />

      {trimmed ? (
        results.length > 0 ? (
          <View style={{ marginTop: 4 }}>
            {results.map((rule) => (
              <Pressable
                key={rule.id}
                onPress={() => onOpenDetail(rule.id)}
                accessibilityRole="button"
                accessibilityLabel={contentByLang(lang, rule.nameHi, rule.nameEn)}
                style={({ pressed }) => [styles.resultRow, { borderBottomColor: colors.divider }, pressed && { opacity: 0.6 }]}
              >
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 15, color: colors.ink }}>
                    {contentByLang(lang, rule.nameHi, rule.nameEn)}
                  </Text>
                  <Text style={{ ...captionFont(lang === 'en' ? rule.nameHi : rule.nameEn), fontSize: 13, color: colors.inkMuted, marginTop: 2 }}>
                    {lang === 'en' ? rule.nameHi : rule.nameEn}
                  </Text>
                </View>
                <Text style={{ fontSize: 18, color: colors.inkMuted }}>›</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <Text style={{ fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 13, color: colors.inkMuted, marginTop: 24, textAlign: 'center' }}>
            {meaningByLang(lang, 'कोई परिणाम नहीं।', 'No matches.')}
          </Text>
        )
      ) : (
        <>
          {/* My Vrat — pinned at the top of the catalog as the personal entry point. */}
          <Pressable
            onPress={onOpenMyVrat}
            accessibilityRole="button"
            accessibilityLabel={followCount > 0 ? `My Vrat, ${followCount} following` : 'My Vrat'}
            style={({ pressed }) => [styles.myVratRow, { backgroundColor: colors.goldTint, borderColor: colors.gold, borderRadius: radii.lg }, elevation.card, pressed && { opacity: 0.8 }]}
          >
            <Text style={{ fontSize: 18, color: colors.gold, marginRight: 10 }}>★</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 15, color: colors.ink }}>
                {contentByLang(lang, 'मेरा व्रत', 'My Vrat')}
              </Text>
              {(() => {
                const subtitle =
                  followCount > 0
                    ? contentByLang(
                        lang,
                        `${followCount} फ़ॉलो किए · ${reminderCount} अनुस्मारक`,
                        `${followCount} following · ${reminderCount} reminders on`
                      )
                    : contentByLang(lang, 'अपने व्रत यहाँ रखें', 'Keep your vrats here');
                return (
                  <Text style={{ ...captionFont(subtitle), fontSize: 12, color: colors.inkMuted, marginTop: 2 }}>
                    {subtitle}
                  </Text>
                );
              })()}
            </View>
            <Text style={{ fontSize: 20, color: colors.inkMuted }}>›</Text>
          </Pressable>
          {upcoming.length > 0 && (
            <View style={{ marginTop: 14 }}>
              <Text style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 14, color: colors.ink, marginBottom: 8 }}>
                {contentByLang(lang, 'आगामी', 'Upcoming')}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 8 }}>
                {upcoming.map((item) => (
                  <Pressable
                    key={`${item.rule.id}-${item.date.toDateString()}`}
                    onPress={() => onOpenDetail(item.rule.id)}
                    accessibilityRole="button"
                    accessibilityLabel={contentByLang(lang, item.rule.nameHi, item.rule.nameEn)}
                    style={({ pressed }) => [styles.upCard, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.md }, elevation.card, pressed && { opacity: 0.75 }]}
                  >
                    <View style={styles.upCardTop}>
                      <Text style={{ fontFamily: typography.readerTitle.fontFamily, fontSize: 20, color: colors.saffron }}>
                        {categoryGlyph(item.rule.category)}
                      </Text>
                      <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 10, color: colors.saffronDeep, letterSpacing: 0.4 }}>
                        {formatShortDate(item.date, lang).toUpperCase()}
                      </Text>
                    </View>
                    <Text numberOfLines={2} style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 14, color: colors.ink, marginTop: 8 }}>
                      {contentByLang(lang, item.rule.nameHi, item.rule.nameEn)}
                    </Text>
                    <Text style={{ ...captionFont(categoryShort(item.rule.category)), fontSize: 12, color: colors.inkMuted, marginTop: 2 }}>
                      {categoryShort(item.rule.category)}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={{ marginTop: 18 }}>
            <Text style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 14, color: colors.ink, marginBottom: 10 }}>
              {contentByLang(lang, 'श्रेणी से देखें', 'Browse by type')}
            </Text>
            <View style={styles.tileGrid}>
              {counts.map(({ category, count }) => {
                const meta = tileMeta[category];
                return (
                  <Pressable
                    key={category}
                    onPress={() => onOpenCategory(category)}
                    accessibilityRole="button"
                    accessibilityLabel={`${meta.en}, ${count}`}
                    style={({ pressed }) => [styles.tile, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg }, elevation.card, pressed && { opacity: 0.8 }]}
                  >
                    <View style={styles.tileGlyph}>
                      <Text style={{ fontFamily: typography.readerTitle.fontFamily, fontSize: 22, color: colors.saffron }}>{meta.glyph}</Text>
                    </View>
                    <Text style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 16, color: colors.ink, marginTop: 8 }}>
                      {contentByLang(lang, meta.hi, meta.en)}
                    </Text>
                    <Text style={{ ...captionFont(lang === 'en' ? meta.hi : meta.en), fontSize: 12, color: colors.inkMuted }}>
                      {lang === 'en' ? meta.hi : meta.en}
                    </Text>
                    <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 11, color: colors.saffronDeep, marginTop: 8 }}>
                      {count} {contentByLang(lang, 'व्रत-पर्व', 'observances')}
                    </Text>
                  </Pressable>
                );
              })}
              <Pressable
                onPress={onOpenKathaLibrary}
                accessibilityRole="button"
                accessibilityLabel={`Katha library, ${kathaCount}`}
                style={({ pressed }) => [styles.tile, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg }, elevation.card, pressed && { opacity: 0.8 }]}
              >
                <View style={styles.tileGlyph}>
                  <Text style={{ fontFamily: typography.readerTitle.fontFamily, fontSize: 22, color: colors.saffron }}>॥</Text>
                </View>
                <Text style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 16, color: colors.ink, marginTop: 8 }}>
                  {contentByLang(lang, 'कथा', 'Katha')}
                </Text>
                <Text style={{ ...captionFont(lang === 'en' ? 'कथा संग्रह' : 'Katha library'), fontSize: 12, color: colors.inkMuted }}>
                  {lang === 'en' ? 'कथा संग्रह' : 'Katha library'}
                </Text>
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 11, color: colors.saffronDeep, marginTop: 8 }}>
                  {kathaCount} {contentByLang(lang, 'कथाएँ', 'stories')}
                </Text>
              </Pressable>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingTop: 8, paddingBottom: 24 },
  systemHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  // Equal-width sides → the centre toggle is screen-centred. alignItems keeps the
  // chip hugging the left edge and the star the right.
  headerSide: { flex: 1, alignItems: 'flex-start' },
  headerSideRight: { alignItems: 'flex-end' },
  locationChip: { flexDirection: 'row', alignItems: 'center', flexShrink: 1, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6, minHeight: 34 },
  // Drawn map pin (no emoji, per design.md): a teardrop — a square with three
  // rounded corners and one sharp (bottom-left), rotated -45° so the sharp point
  // swings straight DOWN (the canonical CSS map-pin recipe). +45° would lay it on
  // its side. A chip-coloured dot punches the hole in the round head.
  pin: {
    width: 11,
    height: 11,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    borderBottomLeftRadius: 0,
    transform: [{ rotate: '-45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  // Counter-rotate the hole so it stays visually upright inside the tilted head.
  pinHole: { width: 4, height: 4, borderRadius: 2, transform: [{ rotate: '45deg' }] },
  myVratButton: { width: 34, height: 34, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  starBadge: { position: 'absolute', top: -2, right: -3, minWidth: 15, height: 15, borderRadius: 7.5, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  starBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 9, lineHeight: 13 },
  myVratRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, padding: 14, marginTop: 12 },
  segmented: { flexDirection: 'row', padding: 3, borderWidth: 1, marginTop: 10 },
  segmentOption: { flex: 1, minHeight: 38, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  jyotishHero: { backgroundColor: '#FFF5E0', borderWidth: 1, padding: 16, marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 13 },
  jyotishHeroIcon: { width: 58, height: 58, alignItems: 'center', justifyContent: 'center' },
  jyotishSectionLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 9, letterSpacing: 1.5, marginTop: 18, marginBottom: 8 },
  jyotishToolCard: { minHeight: 98, borderWidth: 1, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  jyotishToolGlyph: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center' },
  jyotishBadge: { paddingHorizontal: 7, paddingVertical: 3 },
  jyotishBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 7, letterSpacing: 1.1 },
  jyotishPractice: { minHeight: 72, borderWidth: 1, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  jyotishPracticeGlyph: { fontFamily: 'NotoSansDevanagari_600SemiBold', fontSize: 24 },
  catalogSearch: { width: '100%', height: 44, borderWidth: 1, paddingHorizontal: 14, fontFamily: 'CormorantGaramond_500Medium', fontSize: 15 },
  resultRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth },
  upCard: { width: 150, borderWidth: 1, padding: 12 },
  upCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tileGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: { flexGrow: 1, flexBasis: '45%', borderWidth: 1, padding: 14, minHeight: 104 },
  // Fixed-height glyph box: the category glyphs (ॐ ✺ ☾ ॥) come from different
  // fonts with different line metrics; pinning the box height keeps the title and
  // caption rows aligned across every tile. The glyph renders at its natural line
  // height (no tight lineHeight, which clipped the tall ॐ) centred in this box.
  tileGlyph: { height: 34, justifyContent: 'center', alignItems: 'flex-start' },
  systemToggle: {
    flexDirection: 'row',
    alignSelf: 'center',
    padding: 3,
    borderWidth: 1,
  },
  systemOption: {
    minWidth: 54,
    minHeight: 34,
    paddingHorizontal: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarCard: { borderWidth: 1, padding: 10, marginTop: 10 },
  compactDateNav: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateNavButton: { width: 36, height: 36, borderWidth: 1, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  selectedDateButton: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  datePagerPage: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  compactActions: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  expandedCalendar: { marginTop: 10, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth },
  monthHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  monthButton: { width: 34, height: 34, borderWidth: 1, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  weekdayRow: { flexDirection: 'row', marginBottom: 4 },
  weekdayText: { width: `${100 / 7}%`, textAlign: 'center', fontFamily: 'Inter_600SemiBold', fontSize: 9 },
  dateGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dateCell: {
    width: `${100 / 7}%`,
    minHeight: 38,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginVertical: 1,
    paddingVertical: 3,
  },
  dateTag: { minWidth: 24, minHeight: 12, borderRadius: 6, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  dateTagText: { fontFamily: 'Inter_600SemiBold', fontSize: 7, lineHeight: 10 },
  todayButton: { alignSelf: 'center', marginTop: 8, borderWidth: 1, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 },
  compactTodayButton: { marginTop: 0, paddingHorizontal: 14, paddingVertical: 7 },
  dateHeader: { marginTop: 10, paddingBottom: 8, borderBottomWidth: StyleSheet.hairlineWidth, marginBottom: 12 },
  angaGrid: { flexDirection: 'row', gap: 8, marginTop: 12 },
  angaGridSecondary: { flexDirection: 'row', gap: 8, marginTop: 8 },
  angaTile: { flexGrow: 1, flexBasis: '47%', borderWidth: 1, paddingVertical: 12, paddingHorizontal: 14 },
  timesCard: { borderWidth: 1, padding: 14, marginTop: 10 },
  timesRow: { flexDirection: 'row', justifyContent: 'space-between' },
  timeCell: { flexDirection: 'row', alignItems: 'center', width: '47%', paddingVertical: 4 },
  observanceSection: { marginTop: 12 },
  observanceCard: { borderWidth: 1, padding: 10, marginBottom: 8 },
  observanceTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 },
  categoryPill: { paddingHorizontal: 9, paddingVertical: 4 },
  linkButton: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7, marginTop: 8 },
  linkRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  kathaButton: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 7, marginTop: 8 },
  upcomingSection: { marginTop: 12 },
  upcomingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, gap: 6 },
  upcomingDot: { width: 5, height: 5, borderRadius: 2.5 },
});
