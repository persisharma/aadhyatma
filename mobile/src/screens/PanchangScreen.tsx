import React, { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { GestureResponderEvent } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { backgroundImages } from '@assets/backgrounds';
import BackgroundLayer from '@/components/BackgroundLayer';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage, type Lang } from '@/data/gita/language';
import { library } from '@/data/texts';
import { buildEntryStartTarget } from '@/navigation/entryRoutes';
import LocationPickerModal from '@/components/LocationPickerModal';
import MuhuratGlanceCard from '@/components/MuhuratGlanceCard';
import { formatClock as formatTime12 } from '@/panchang/muhuratFormat';
import { usePanchangLocation } from '@/contexts/PanchangLocationContext';
import { buildCalendarMonth, dateKey } from '@/panchang/calendarGrid';
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
import { fontFamilies } from '@/theme/typography';
import { transliterateDevanagari } from '@/utils/transliterate';

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_FULL_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_HI = ['जन', 'फ़र', 'मार्च', 'अप्रै', 'मई', 'जून', 'जुल', 'अग', 'सित', 'अक्टू', 'नवं', 'दिसं'];
const MONTHS_FULL_HI = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
const WEEKDAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS_HI = ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];
type ObservanceCalendarTag = 'vrat' | 'festival' | 'mixed';

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

export default function PanchangScreen() {
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const rootNav = useNavigation<any>();
  const { followCount, reminderCount } = useVratFollows();
  const todayKey = new Date().toDateString();
  const today = useMemo(() => startOfLocalDay(new Date(todayKey)), [todayKey]);
  const [selectedDate, setSelectedDate] = useState(() => startOfLocalDay(new Date()));
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));
  const [calendarExpanded, setCalendarExpanded] = useState(false);
  const [panchangTab, setPanchangTab] = useState<'calendar' | 'catalog'>('calendar');
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
          <View style={styles.systemHeader}>
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
          </View>

          <View style={[styles.segmented, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.pill }]}>
            {(['calendar', 'catalog'] as const).map((tab) => {
              const selected = panchangTab === tab;
              return (
                <Pressable
                  key={tab}
                  onPress={() => setPanchangTab(tab)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected }}
                  accessibilityLabel={tab === 'calendar' ? 'Calendar' : 'Vrat and Parv'}
                  style={({ pressed }) => [
                    styles.segmentOption,
                    { borderRadius: radii.pill },
                    selected && { backgroundColor: colors.saffronTint },
                    pressed && !selected && { opacity: 0.7 },
                  ]}
                >
                  <Text style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 13, color: selected ? colors.saffronDeep : colors.inkMuted }}>
                    {tab === 'calendar' ? contentByLang(lang, 'पंचांग', 'Calendar') : contentByLang(lang, 'व्रत-पर्व', 'Vrat & Parv')}
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
                `${p.lunarMonth.nameHi}${p.lunarMonth.isAdhik ? ' (अधिक)' : ''} · ${p.tithi.paksha === 'shukla' ? 'शुक्ल पक्ष' : 'कृष्ण पक्ष'}`,
                `${p.lunarMonth.nameEn}${p.lunarMonth.isAdhik ? ' (Adhik)' : ''} · ${p.tithi.paksha === 'shukla' ? 'Shukla Paksha' : 'Krishna Paksha'}`
              )}
            </Text>
          </View>

          {/* Two-tier anga grid: Tithi + Nakshatra lead (the two anchors users read
              first) on elevated off-white cards; Yoga + Karana sit as a quieter,
              flatter secondary row. */}
          <View style={styles.angaGrid}>
            <PanchangTile prominent label={contentByLang(lang, 'तिथि', 'Tithi')} element={p.tithi} lang={lang} colors={colors} typography={typography} radii={radii} elevation={elevation} />
            <PanchangTile prominent label={contentByLang(lang, 'नक्षत्र', 'Nakshatra')} element={p.nakshatra} lang={lang} colors={colors} typography={typography} radii={radii} elevation={elevation} />
          </View>
          <View style={styles.angaGridSecondary}>
            <PanchangTile label={contentByLang(lang, 'योग', 'Yoga')} element={p.yoga} lang={lang} colors={colors} typography={typography} radii={radii} elevation={elevation} />
            <PanchangTile label={contentByLang(lang, 'करण', 'Karana')} element={p.karana} lang={lang} colors={colors} typography={typography} radii={radii} elevation={elevation} />
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

          {/* Daily Muhurat — Choghadiya / Rahu Kaal glance card (PRD-14). Reads the
              selected day; opens the full reverent readout. */}
          <MuhuratGlanceCard
            date={selectedDate}
            calendarSystem={calendarSystem}
            onViewAll={() => rootNav.navigate('MuhuratDetail', { dateMs: selectedDate.getTime() })}
          />
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
          ) : (
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
          )}
        </ScrollView>
      </SafeAreaView>
      <LocationPickerModal visible={locationPickerVisible} onClose={() => setLocationPickerVisible(false)} />
    </View>
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

function PanchangTile({ label, element, lang, colors, typography, radii, elevation, prominent }: {
  label: string;
  element: PanchangElement;
  lang: Lang;
  colors: any;
  typography: any;
  radii: any;
  elevation: any;
  prominent?: boolean;
}) {
  return (
    <View
      style={[
        prominent ? styles.angaTile : styles.angaTileSecondary,
        prominent
          ? { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.md, ...elevation.card }
          : { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.md },
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
      <Text
        numberOfLines={1}
        style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: prominent ? 20 : 15, color: colors.ink, marginTop: prominent ? 4 : 3 }}
      >
        {contentByLang(lang, element.nameHi, element.nameEn)}
      </Text>
      <Text
        numberOfLines={1}
        style={{ ...captionFont(lang === 'en' ? element.nameHi : element.nameEn), fontSize: 12, color: colors.inkMuted, marginTop: 2 }}
      >
        {lang === 'en' ? element.nameHi : element.nameEn}
      </Text>
      {element.endTime && (
        <Text style={{ fontFamily: lang === 'en' ? 'CormorantGaramond_600SemiBold' : scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 11, color: colors.inkSoft, marginTop: 5 }}>
          {contentByLang(lang, 'तक ', 'till ')}{formatTime12(element.endTime)}
        </Text>
      )}
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
  dateHeader: { marginTop: 10, paddingBottom: 8, borderBottomWidth: StyleSheet.hairlineWidth, marginBottom: 8 },
  angaGrid: { flexDirection: 'row', gap: 8 },
  angaGridSecondary: { flexDirection: 'row', gap: 8, marginTop: 8 },
  angaTile: { flexGrow: 1, flexBasis: '47%', borderWidth: 1, paddingVertical: 14, paddingHorizontal: 14 },
  angaTileSecondary: { flexGrow: 1, flexBasis: '47%', borderWidth: 1, paddingVertical: 9, paddingHorizontal: 12 },
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
