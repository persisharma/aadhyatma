import React, { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { GestureResponderEvent } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { library } from '@/data/texts';
import { buildEntryStartTarget } from '@/navigation/entryRoutes';
import { buildCalendarMonth, dateKey } from '@/panchang/calendarGrid';
import { searchObservances } from '@/panchang/festivalEngine';
import { KATHA_CATALOG } from '@/panchang/festivals';
import {
  usePanchangCalendarSystem,
  usePanchangForSelection,
  usePanchangMonthObservances,
} from '@/panchang/usePanchang';
import type { CalendarSystem, ObservanceCategory, ObservanceRule, PanchangElement, ResolvedObservance } from '@/panchang/types';

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_FULL_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_HI = ['जन', 'फ़र', 'मार्च', 'अप्रै', 'मई', 'जून', 'जुल', 'अग', 'सित', 'अक्टू', 'नवं', 'दिसं'];
const MONTHS_FULL_HI = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
const WEEKDAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS_HI = ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];
type ObservanceCalendarTag = 'vrat' | 'festival' | 'mixed';
const KATHA_BY_ID = new Map(KATHA_CATALOG.map((item) => [item.id, item] as const));

function formatTime12(date: Date | null): string {
  if (!date) return '';
  const h = date.getHours();
  const m = date.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

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

function formatShortDate(date: Date, isHindi: boolean): string {
  const months = isHindi ? MONTHS_HI : MONTHS_EN;
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

function formatFullDate(date: Date, isHindi: boolean): string {
  const months = isHindi ? MONTHS_FULL_HI : MONTHS_FULL_EN;
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function formatMonthTitle(date: Date, isHindi: boolean): string {
  const months = isHindi ? MONTHS_FULL_HI : MONTHS_FULL_EN;
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

function calendarSystemLabel(calendarSystem: CalendarSystem, isHindi: boolean): string {
  if (calendarSystem === 'amanta') return isHindi ? 'अमान्त' : 'Amanta';
  return isHindi ? 'पूर्णिमांत' : 'Purnimant';
}

function calendarTagLabel(tag: ObservanceCalendarTag, isHindi: boolean): string {
  if (tag === 'vrat') return isHindi ? 'व्रत' : 'Vrat';
  if (tag === 'festival') return isHindi ? 'पर्व' : 'Fest';
  return isHindi ? 'व्रत+' : 'Both';
}

function calendarTagForRule(rule: ResolvedObservance['rule']): ObservanceCalendarTag {
  return rule.category === 'festival' ? 'festival' : 'vrat';
}

function categoryLabel(category: ObservanceCategory, isHindi: boolean): string {
  if (category === 'festival') return isHindi ? 'पर्व' : 'Festival';
  if (category === 'upavas') return isHindi ? 'उपवास' : 'Upavas';
  if (category === 'katha') return isHindi ? 'कथा' : 'Katha';
  if (category === 'regional') return isHindi ? 'क्षेत्रीय' : 'Regional';
  return isHindi ? 'व्रत' : 'Vrat';
}

function isVratLike(rule: ObservanceRule): boolean {
  return rule.category !== 'festival';
}

export default function PanchangScreen() {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const isHindi = lang === 'hi';
  const rootNav = useNavigation<any>();
  const todayKey = new Date().toDateString();
  const today = useMemo(() => startOfLocalDay(new Date(todayKey)), [todayKey]);
  const [selectedDate, setSelectedDate] = useState(() => startOfLocalDay(new Date()));
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));
  const [calendarExpanded, setCalendarExpanded] = useState(false);
  const [observanceSearch, setObservanceSearch] = useState('');
  const calendarSwipeStart = useRef<{ x: number; y: number } | null>(null);
  const [calendarSystem, setCalendarSystem] = usePanchangCalendarSystem();
  const { panchang: p, observances, upcoming } = usePanchangForSelection(selectedDate, calendarSystem);
  const monthObservances = usePanchangMonthObservances(visibleMonth, calendarSystem);
  const monthObservanceTags = useMemo(() => {
    const tags = new Map<string, ObservanceCalendarTag>();
    monthObservances.forEach((item) => {
      const key = dateKey(item.date);
      const nextTag = calendarTagForRule(item.rule);
      const currentTag = tags.get(key);
      tags.set(key, currentTag && currentTag !== nextTag ? 'mixed' : nextTag);
    });
    return tags;
  }, [monthObservances]);
  const upcomingVrats = useMemo(
    () => upcoming.filter((item) => isVratLike(item.rule)).slice(0, 8),
    [upcoming]
  );
  const monthListing = useMemo(
    () => monthObservances.slice(0, 24),
    [monthObservances]
  );
  const searchResults = useMemo(() => {
    if (!observanceSearch.trim()) return [];
    return searchObservances(observanceSearch, { includeHidden: true }).slice(0, 12);
  }, [observanceSearch]);
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

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing.xxl }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Slim system header — the tab bar already names this screen "पंचांग",
              so the redundant title/subtitle/pill are gone. Only the calendar
              system control + Ujjain reference remain. */}
          <View style={styles.titleArea}>
            <CalendarSystemToggle
              value={calendarSystem}
              onChange={setCalendarSystem}
              isHindi={isHindi}
              colors={colors}
              radii={radii}
              typography={typography}
            />
            <Text style={{ fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 10, color: colors.inkMuted, textAlign: 'center', marginTop: 5 }}>
              {isHindi
                ? `संदर्भ: उज्जैन, भारत · ${calendarSystemLabel(calendarSystem, true)}`
                : `Reference: Ujjain, India · ${calendarSystemLabel(calendarSystem, false)}`}
            </Text>
          </View>

          <View
            style={[styles.calendarCard, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg }]}
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
                  <Text style={{ fontFamily: typography.readerTitle.fontFamily, fontSize: 15, color: colors.ink, textAlign: 'center' }}>
                    {formatFullDate(selectedDate, isHindi)}
                  </Text>
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 10, color: colors.saffronDeep, marginTop: 2 }}>
                    {calendarExpanded
                      ? (isHindi ? 'माह छिपाएँ' : 'Hide month')
                      : (isHindi ? 'माह देखें' : 'Month view')}
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
              <Text style={{ fontFamily: typography.meaning.fontFamily, fontSize: 11, color: colors.inkMuted, flex: 1 }}>
                {formatMonthTitle(selectedDate, isHindi)}
              </Text>
              <Pressable
                onPress={handleToday}
                accessibilityRole="button"
                accessibilityLabel="Today"
                style={({ pressed }) => [styles.todayButton, styles.compactTodayButton, { borderColor: colors.divider }, pressed && { opacity: 0.7 }]}
              >
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: colors.saffronDeep }}>
                  {isHindi ? 'आज' : 'Today'}
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
                  <Text style={{ fontFamily: typography.readerTitle.fontFamily, fontSize: 15, color: colors.ink }}>
                    {formatMonthTitle(visibleMonth, isHindi)}
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
                  {(isHindi ? WEEKDAYS_HI : WEEKDAYS_EN).map((day) => (
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
                        accessibilityLabel={`Select ${formatFullDate(cell.date, false)}${observanceTag ? ` ${calendarTagLabel(observanceTag, false)}` : ''}`}
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
                              {calendarTagLabel(observanceTag, isHindi)}
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
            <Text style={{ fontFamily: typography.readerTitle.fontFamily, fontSize: 15, color: colors.saffronDeep }}>
              {isHindi ? p.vara.nameHi : p.vara.nameEn}
              <Text style={{ fontFamily: 'CormorantGaramond_500Medium', fontSize: 12, color: colors.inkSoft }}>
                {'  '}{formatFullDate(p.date, isHindi)} · {isHindi ? `विक्रम संवत् ${p.vikramSamvat}` : `Vikram Samvat ${p.vikramSamvat}`}
              </Text>
            </Text>
            <Text style={{ fontFamily: typography.meaning.fontFamily, fontSize: 11, color: colors.inkMuted, marginTop: 2 }}>
              {isHindi
                ? `${p.lunarMonth.nameHi}${p.lunarMonth.isAdhik ? ' (अधिक)' : ''} · ${p.tithi.paksha === 'shukla' ? 'शुक्ल पक्ष' : 'कृष्ण पक्ष'}`
                : `${p.lunarMonth.nameEn}${p.lunarMonth.isAdhik ? ' (Adhik)' : ''} · ${p.tithi.paksha === 'shukla' ? 'Shukla Paksha' : 'Krishna Paksha'}`}
            </Text>
          </View>

          <View style={[styles.detailCard, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg }]}>
            <PanchangRow label={isHindi ? 'तिथि' : 'Tithi'} element={p.tithi} isHindi={isHindi} colors={colors} typography={typography} />
            <PanchangRow label={isHindi ? 'नक्षत्र' : 'Nakshatra'} element={p.nakshatra} isHindi={isHindi} colors={colors} typography={typography} />
            <PanchangRow label={isHindi ? 'योग' : 'Yoga'} element={p.yoga} isHindi={isHindi} colors={colors} typography={typography} />
            <PanchangRow label={isHindi ? 'करण' : 'Karana'} element={p.karana} isHindi={isHindi} colors={colors} typography={typography} isLast />
          </View>

          <View style={[styles.timesCard, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg }]}>
            <View style={styles.timesRow}>
              <TimeCell icon="☀" label={isHindi ? 'सूर्योदय' : 'Sunrise'} value={formatTime12(p.sunrise)} colors={colors} />
              <TimeCell icon="☀" label={isHindi ? 'सूर्यास्त' : 'Sunset'} value={formatTime12(p.sunset)} colors={colors} />
            </View>
            <View style={[styles.timesRow, { marginTop: 8 }]}>
              <TimeCell icon="☽" label={isHindi ? 'चंद्रोदय' : 'Moonrise'} value={formatTime12(p.moonrise)} colors={colors} />
              <TimeCell icon="☽" label={isHindi ? 'ब्रह्म मुहूर्त' : 'Brahma Muhurta'} value={`${formatTime12(p.brahmaMuhurta.start)} - ${formatTime12(p.brahmaMuhurta.end)}`} colors={colors} />
            </View>
          </View>
            </>
          ) : (
            <View style={{ paddingVertical: 72, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator color={colors.saffron} />
            </View>
          )}

          <View style={styles.observanceSection}>
            <Text style={{ fontFamily: typography.readerTitle.fontFamily, fontSize: 14, color: colors.ink, marginBottom: 10 }}>
              {isHindi ? 'व्रत और पर्व' : 'Vrat & Observances'}
            </Text>
            {observances.length > 0 ? (
              observances.map((item) => (
                <ObservanceCard
                  key={item.rule.id}
                  item={item}
                  isHindi={isHindi}
                  colors={colors}
                  typography={typography}
                  radii={radii}
                  onOpenLink={openLinkedSection}
                />
              ))
            ) : (
              <Text style={{ fontFamily: typography.meaning.fontFamily, fontSize: 12, lineHeight: 18, color: colors.inkMuted }}>
                {isHindi ? 'इस तिथि पर बंडल सूची में कोई प्रमुख व्रत या पर्व नहीं है।' : 'No major vrat or festival in the bundled list for this date.'}
              </Text>
            )}
          </View>

          {upcomingVrats.length > 0 && (
            <View style={styles.upcomingSection}>
              <Text style={{ fontFamily: typography.readerTitle.fontFamily, fontSize: 14, color: colors.ink, marginBottom: 10 }}>
                {isHindi ? 'आगामी व्रत' : 'Upcoming Vrats'}
              </Text>
              {upcomingVrats.map((item, i) => (
                <View key={`${dateKey(item.date)}:${item.rule.id}`} style={[styles.upcomingRow, { borderBottomColor: i < upcomingVrats.length - 1 ? colors.divider : 'transparent' }]}>
                  <View style={[styles.upcomingDot, { backgroundColor: markerColor(item.rule.marker, colors) }]} />
                  <Text style={{ fontFamily: 'CormorantGaramond_500Medium', fontSize: 12, color: colors.inkMuted, width: 50 }}>
                    {formatShortDate(item.date, isHindi)}
                  </Text>
                  <Text style={{ fontFamily: typography.meaning.fontFamily, fontSize: 13, color: colors.ink, flex: 1 }}>
                    {isHindi ? item.rule.nameHi : item.rule.nameEn}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.monthListingSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={{ fontFamily: typography.readerTitle.fontFamily, fontSize: 14, color: colors.ink }}>
                {isHindi ? 'माहवार सूची' : 'Month-wise Listing'}
              </Text>
              <Text style={{ fontFamily: 'CormorantGaramond_500Medium', fontSize: 12, color: colors.inkMuted }}>
                {formatMonthTitle(visibleMonth, isHindi)}
              </Text>
            </View>
            {monthListing.map((item, i) => (
              <View key={`${dateKey(item.date)}:${item.rule.id}`} style={[styles.monthListRow, { borderBottomColor: i < monthListing.length - 1 ? colors.divider : 'transparent' }]}>
                <Text style={{ fontFamily: 'CormorantGaramond_500Medium', fontSize: 12, color: colors.inkMuted, width: 50 }}>
                  {formatShortDate(item.date, isHindi)}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: typography.meaning.fontFamily, fontSize: 13, color: colors.ink }}>
                    {isHindi ? item.rule.nameHi : item.rule.nameEn}
                  </Text>
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 9, color: colors.saffronDeep, marginTop: 2 }}>
                    {categoryLabel(item.rule.category, isHindi)}
                    {item.rule.kathaId ? ` · ${isHindi ? 'कथा' : 'Katha'}` : ''}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.searchSection}>
            <Text style={{ fontFamily: typography.readerTitle.fontFamily, fontSize: 14, color: colors.ink, marginBottom: 8 }}>
              {isHindi ? 'व्रत खोज' : 'Vrat Search'}
            </Text>
            <TextInput
              value={observanceSearch}
              onChangeText={setObservanceSearch}
              placeholder={isHindi ? 'व्रत, कथा, पर्व' : 'Vrat, katha, festival'}
              placeholderTextColor={colors.inkMuted}
              autoCorrect={false}
              style={[
                styles.searchInput,
                {
                  backgroundColor: colors.parchmentSoft,
                  borderColor: colors.divider,
                  borderRadius: radii.md,
                  color: colors.ink,
                  fontFamily: typography.meaning.fontFamily,
                },
              ]}
            />
            {searchResults.length > 0 && (
              <View style={[styles.searchResults, { borderColor: colors.divider, borderRadius: radii.md }]}>
                {searchResults.map((rule, i) => (
                  <CatalogResultRow
                    key={rule.id}
                    rule={rule}
                    isHindi={isHindi}
                    colors={colors}
                    typography={typography}
                    radii={radii}
                    isLast={i === searchResults.length - 1}
                  />
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function markerColor(marker: ResolvedObservance['rule']['marker'], colors: any): string {
  if (marker === 'star') return colors.saffron;
  if (marker === 'halfmoon') return colors.ink;
  return colors.gold;
}

function CalendarSystemToggle({ value, onChange, isHindi, colors, radii, typography }: {
  value: CalendarSystem;
  onChange: (next: CalendarSystem) => void;
  isHindi: boolean;
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
              fontFamily: typography.readerTitle.fontFamily,
              fontSize: 12,
              color: selected ? colors.saffronDeep : colors.inkMuted,
            }}>
              {isHindi ? option.labelHi : option.labelEn}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function PanchangRow({ label, element, isHindi, colors, typography, isLast }: {
  label: string;
  element: PanchangElement;
  isHindi: boolean;
  colors: any;
  typography: any;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.pRow, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider }]}>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
          <Text style={{ fontFamily: typography.readerTitle.fontFamily, fontSize: 14, color: colors.ink }}>
            {isHindi ? element.nameHi : element.nameEn}
          </Text>
          <Text style={{ fontSize: 9, color: colors.inkMuted, fontFamily: 'CormorantGaramond_500Medium', textTransform: 'uppercase' }}>
            {label}
          </Text>
        </View>
        <Text style={{ fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 10, color: colors.inkMuted, marginTop: 1 }}>
          {isHindi ? element.nameEn : element.nameHi}
        </Text>
      </View>
      {element.endTime && (
        <Text style={{ fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 11, color: colors.inkSoft }}>
          {isHindi ? 'तक ' : 'till '}{formatTime12(element.endTime)}
        </Text>
      )}
    </View>
  );
}

function TimeCell({ icon, label, value, colors }: { icon: string; label: string; value: string; colors: any }) {
  return (
    <View style={styles.timeCell}>
      <Text style={{ fontSize: 14 }}>{icon}</Text>
      <View style={{ marginLeft: 6 }}>
        <Text style={{ fontFamily: 'CormorantGaramond_500Medium', fontSize: 10, color: colors.inkMuted }}>{label}</Text>
        <Text style={{ fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 13, color: colors.ink }}>{value}</Text>
      </View>
    </View>
  );
}

function ObservanceCard({ item, isHindi, colors, typography, radii, onOpenLink }: {
  item: ResolvedObservance;
  isHindi: boolean;
  colors: any;
  typography: any;
  radii: any;
  onOpenLink: (sectionId: string) => void;
}) {
  const linkedEntry = item.rule.linkSectionId
    ? library.find((entry) => entry.id === item.rule.linkSectionId)
    : null;
  const katha = item.rule.kathaId ? KATHA_BY_ID.get(item.rule.kathaId) : null;

  return (
    <View style={[styles.observanceCard, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.md }]}>
      <View style={styles.observanceTop}>
        <View style={[styles.categoryPill, { backgroundColor: item.rule.category === 'vrat' ? colors.goldTint : colors.saffronTint, borderRadius: radii.pill }]}>
          <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 10, color: colors.saffronDeep }}>
            {categoryLabel(item.rule.category, isHindi)}
          </Text>
        </View>
        <Text style={{ fontFamily: 'CormorantGaramond_500Medium', fontSize: 12, color: colors.inkMuted }}>
          {isHindi ? item.rule.deityHi : item.rule.deityEn}
        </Text>
      </View>
      <Text style={{ fontFamily: typography.readerTitle.fontFamily, fontSize: 15, color: colors.ink }}>
        {isHindi ? item.rule.nameHi : item.rule.nameEn}
      </Text>
      <Text style={{ fontFamily: typography.meaning.fontFamily, fontSize: 12, lineHeight: 18, color: colors.inkMuted, marginTop: 4 }}>
        {isHindi ? item.rule.shortDescriptionHi : item.rule.shortDescriptionEn}
      </Text>
      {katha && (
        <View style={[styles.kathaPill, { backgroundColor: colors.goldTint, borderRadius: radii.pill }]}>
          <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 10, color: colors.saffronDeep }}>
            {isHindi ? `कथा: ${katha.nameHi}` : `Katha: ${katha.nameEn}`}
          </Text>
        </View>
      )}
      {linkedEntry && (
        <Pressable
          onPress={() => onOpenLink(linkedEntry.id)}
          accessibilityRole="button"
          accessibilityLabel={`Open ${linkedEntry.nameEn}`}
          style={({ pressed }) => [styles.linkButton, { borderColor: colors.divider }, pressed && { opacity: 0.7 }]}
        >
          <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: colors.saffronDeep }}>
            {isHindi ? `पढ़ें: ${linkedEntry.nameHi}` : `Read: ${linkedEntry.nameEn}`}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

function CatalogResultRow({ rule, isHindi, colors, typography, radii, isLast }: {
  rule: ObservanceRule;
  isHindi: boolean;
  colors: any;
  typography: any;
  radii: any;
  isLast: boolean;
}) {
  const katha = rule.kathaId ? KATHA_BY_ID.get(rule.kathaId) : null;
  const hiddenLabel = rule.visibility === 'default'
    ? ''
    : ` · ${rule.visibility === 'regional' ? (isHindi ? 'क्षेत्रीय' : 'Regional') : (isHindi ? 'उन्नत' : 'Advanced')}`;

  return (
    <View style={[styles.catalogRow, !isLast && { borderBottomColor: colors.divider, borderBottomWidth: StyleSheet.hairlineWidth }]}>
      <View style={[styles.categoryPill, { backgroundColor: isVratLike(rule) ? colors.goldTint : colors.saffronTint, borderRadius: radii.pill, alignSelf: 'flex-start' }]}>
        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 9, color: colors.saffronDeep }}>
          {categoryLabel(rule.category, isHindi)}{hiddenLabel}
        </Text>
      </View>
      <Text style={{ fontFamily: typography.meaning.fontFamily, fontSize: 13, color: colors.ink, marginTop: 5 }}>
        {isHindi ? rule.nameHi : rule.nameEn}
      </Text>
      {katha && (
        <Text style={{ fontFamily: 'CormorantGaramond_500Medium', fontSize: 11, color: colors.inkMuted, marginTop: 2 }}>
          {isHindi ? katha.nameHi : katha.nameEn}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingTop: 12, paddingBottom: 24 },
  titleArea: { marginBottom: 6, alignItems: 'center' },
  schoolPill: { alignSelf: 'center', paddingHorizontal: 14, paddingVertical: 6 },
  systemToggle: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: 10,
    padding: 3,
    borderWidth: 1,
  },
  systemOption: {
    minWidth: 104,
    minHeight: 38,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarCard: { borderWidth: 1, padding: 10, marginTop: 12 },
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
  dateHeader: { marginTop: 12, paddingBottom: 8, borderBottomWidth: StyleSheet.hairlineWidth, marginBottom: 8 },
  detailCard: { borderWidth: 1, padding: 10 },
  pRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7 },
  timesCard: { borderWidth: 1, padding: 10, marginTop: 8 },
  timesRow: { flexDirection: 'row', justifyContent: 'space-around' },
  timeCell: { flexDirection: 'row', alignItems: 'center', width: '45%' },
  observanceSection: { marginTop: 12 },
  observanceCard: { borderWidth: 1, padding: 10, marginBottom: 8 },
  observanceTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 },
  categoryPill: { paddingHorizontal: 9, paddingVertical: 4 },
  kathaPill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, marginTop: 8 },
  linkButton: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7, marginTop: 8 },
  upcomingSection: { marginTop: 12 },
  upcomingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, gap: 6 },
  upcomingDot: { width: 5, height: 5, borderRadius: 2.5 },
  monthListingSection: { marginTop: 14 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, marginBottom: 8 },
  monthListRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 7, borderBottomWidth: StyleSheet.hairlineWidth, gap: 8 },
  searchSection: { marginTop: 14 },
  searchInput: { borderWidth: 1, minHeight: 42, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13 },
  searchResults: { borderWidth: 1, marginTop: 8, overflow: 'hidden' },
  catalogRow: { paddingHorizontal: 10, paddingVertical: 9 },
});
