import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { GestureResponderEvent } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { backgroundImages } from '@assets/backgrounds';
import BackgroundLayer from '@/components/BackgroundLayer';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage, type Lang } from '@/data/gita/language';
import { library } from '@/data/texts';
import { buildEntryStartTarget, moreTabTarget } from '@/navigation/entryRoutes';
import LocationPickerModal from '@/components/LocationPickerModal';
import MuhuratGlanceCard from '@/components/MuhuratGlanceCard';
import MuhuratFinderDoor from '@/components/MuhuratFinderDoor';
import ShubhYogaCard from '@/components/ShubhYogaCard';
import PanchangTimelineRow from '@/components/PanchangTimelineRow';
import PitruSmaranDayChip from '@/components/PitruSmaranDayChip';
import PitruPakshaDayChip from '@/components/PitruPakshaDayChip';
import TextField from '@/components/TextField';
import { formatClock as formatTime12, formatEndInstant } from '@/panchang/muhuratFormat';
import { usePanchangLocation } from '@/contexts/PanchangLocationContext';
import { buildCalendarMonth, calendarWeeks, dateKey } from '@/panchang/calendarGrid';
import { getEventRule } from '@/panchang/eventMuhurat';
import {
  NAKSHATRA_NAMES_EN,
  NAKSHATRA_NAMES_HI,
  PAKSHA_NAMES_EN,
  PAKSHA_NAMES_HI,
} from '@/panchang/names';
import {
  usePanchangCalendarSystem,
  usePanchangForSelection,
  usePanchangMonthObservances,
} from '@/panchang/usePanchang';
import { useShubhYoga } from '@/panchang/useShubhYoga';
import type { CalendarSystem, PanchangElement, ResolvedObservance } from '@/panchang/types';
import { getKathaContent } from '@/panchang/kathaContent';
import { getUpcomingObservances, searchObservances } from '@/panchang/festivalEngine';
import { successorTithiToday } from '@/panchang/prevailingTithi';
import { sankashtiOccurrenceName } from '@/panchang/sankashtiNames';
import { getCategoryCounts, getKathaCount, type BrowseCategory } from '@/panchang/vratCatalog';
import { VIDHI_ENTRIES, getVidhiById } from '@/data/vidhi';
import { useVratFollows } from '@/contexts/VratFollowContext';
import { usePitruSmaran } from '@/contexts/PitruSmaranContext';
import { nextObservanceForEntry } from '@/panchang/pitruSmaran';
import { shortDate as shortSmaranDate } from '@/panchang/pitruSmaranDisplay';
import { captionFont } from '@/utils/scriptFont';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { pillTextStyle, scriptBodyFont, scriptTitleFont } from '@/utils/langType';
import { useTourTarget } from '@/components/tour/tourTargets';
import { fontFamilies } from '@/theme/typography';
import { transliterateDevanagari } from '@/utils/transliterate';
import CategoryIcon from '@/components/CategoryIcon';
import JyotishGuidanceRows from '@/components/JyotishGuidanceRows';
import JyotishPracticeCard from '@/components/JyotishPracticeCard';
import JyotishShareCard from '@/components/JyotishShareCard';
import JyotishShareSheet from '@/components/JyotishShareSheet';
import JyotishStateCard from '@/components/JyotishStateCard';
import { computePersonalGuidance } from '@/panchang/gochar';
import {
  getCurrentDasha,
  GRAHA_NAMES_EN,
  GRAHA_NAMES_HI,
  RASHI_NAMES_EN,
  RASHI_NAMES_HI,
  RASHI_NAMES_WESTERN,
  type KundaliChart,
} from '@/panchang/kundali';
import {
  MAX_PEOPLE,
  useKundali,
  type BirthProfile,
  type KundaliLoadState,
  type PersonProfile,
} from '@/panchang/useKundali';
import PersonChips from '@/components/PersonChips';
import { getCityById } from '@/panchang/locations';
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
  const [selectedDate, setSelectedDate] = useState(() => startOfLocalDay(route.params?.dateMs ? new Date(route.params.dateMs) : new Date()));
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
  const {
    profile: kundaliProfile,
    chart: kundaliChart,
    loadState: kundaliLoadState,
    reloadProfile,
    people: kundaliPeople,
    activeId: kundaliActiveId,
    canAddPerson: canAddKundaliPerson,
    selectPerson: selectKundaliPerson,
  } = useKundali();
  const { panchang: p, observances, upcoming } = usePanchangForSelection(selectedDate, calendarSystem);
  // The day's one-line identity (vara · masa paksha · Vikram Samvat), shared by
  // the date card's visible subtitle and the date button's a11y label — the
  // explicit label would otherwise hide the subtitle from screen readers.
  const dayIdentityHi = p
    ? `${p.vara.nameHi} · ${p.lunarMonth.nameHi}${p.lunarMonth.isAdhik ? ' (अधिक)' : ''} ${PAKSHA_NAMES_HI[p.tithi.paksha]} पक्ष · विक्रम संवत् ${p.vikramSamvat}`
    : null;
  const dayIdentityEn = p
    ? `${p.vara.nameEn} · ${p.lunarMonth.nameEn}${p.lunarMonth.isAdhik ? ' (Adhik)' : ''} ${PAKSHA_NAMES_EN[p.tithi.paksha]} Paksha · Vikram Samvat ${p.vikramSamvat}`
    : null;
  // PRD-27: the day's शुभ योग windows — store-backed (no private cache), []
  // while the solve is in flight and on days with none, so the card below
  // renders zero chrome for the absent case.
  const shubhYogas = useShubhYoga(selectedDate, calendarSystem);
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
  // PRD-16 month-view overlay: ring an occasion's muhurat days on the same
  // grid (one calendar vocabulary — the finder marks it, it doesn't fork it).
  // Contextual: exists only while the param is set; ✕ clears it.
  const muhuratOverlay = route.params?.muhuratOverlay;
  const overlayKeys = useMemo(
    () => new Set((muhuratOverlay?.days ?? []).map((ms) => dateKey(new Date(ms)))),
    [muhuratOverlay]
  );
  const overlayRule = muhuratOverlay ? getEventRule(muhuratOverlay.occasionId) : null;
  // The rings live on the month grid — arriving with an overlay must open it,
  // or the chip and rings would sit behind a collapsed "Month view".
  useEffect(() => {
    if (muhuratOverlay) setCalendarExpanded(true);
  }, [muhuratOverlay]);

  const calendarCells = useMemo(
    () => buildCalendarMonth({
      visibleMonth,
      selectedDate,
      today,
      observanceDates: monthObservances.map((item) => item.date),
    }),
    [visibleMonth, selectedDate, today, monthObservances]
  );
  // Weeks, not one wrapping 42-cell row — see `calendarWeeks`. The column a date
  // lands in is then its position in its own week, never a rounding outcome.
  const calendarRows = useMemo(() => calendarWeeks(calendarCells), [calendarCells]);

  useEffect(() => {
    if (route.params?.initialTab) setPanchangTab(route.params.initialTab);
  }, [route.params?.initialTab]);

  useEffect(() => {
    if (route.params?.dateMs == null || !Number.isFinite(route.params.dateMs)) return;
    const represented = startOfLocalDay(new Date(route.params.dateMs));
    setSelectedDate(represented);
    setVisibleMonth(startOfMonth(represented));
    setPanchangTab('calendar');
  }, [route.params?.dateMs]);

  useFocusEffect(
    useCallback(() => {
      if (panchangTab === 'jyotish') void reloadProfile();
    }, [panchangTab, reloadProfile])
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

  // PRD-19: the vidhi opens FOR the selected festival date — the samagri
  // checklist persists per that occurrence, not per calendar day of entry.
  const openVidhi = (vidhiId: string, dateMs: number) => {
    rootNav.navigate('VidhiDetail', { vidhiId, dateMs });
  };
  const openVidhiCatalog = () => rootNav.navigate('VidhiCatalog');

  const openObservanceDetail = (ruleId: string) => rootNav.navigate('ObservanceDetail', { ruleId });
  const openCategory = (category: BrowseCategory) => rootNav.navigate('ObservanceList', { category });
  const openKathaLibrary = () => rootNav.navigate('KathaLibrary');
  const openMyVrat = () => rootNav.navigate('MyVrat');
  const openPitruSmaran = () => rootNav.navigate('MoreTab', moreTabTarget('PitruSmaranList'));
  const openKundali = (editing = false) =>
    rootNav.navigate('Kundali', editing ? { editing: true } : undefined);
  const openAddPerson = () => rootNav.navigate('Kundali', { newPerson: true });
  const openRashifal = () => rootNav.navigate('Rashifal');
  const openGochar = () => rootNav.navigate('Gochar');
  const openKundaliReport = () => rootNav.navigate('KundaliReport');
  const openGunaMilan = () => rootNav.navigate('GunaMilan');
  const openNamkaran = () => rootNav.navigate('Namkaran');

  return (
    <View style={styles.root}>
      <BackgroundLayer source={backgroundImages.panchang_celestial_almanac} />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing.xxl }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Keep the primary mode switch first in every mode. Contextual
              Panchang controls render below it so selecting Jyotish does not
              make this segmented control jump vertically. */}
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

          {/* Slim system header — relevant to Panchang and Vrat only. The
              location, lunar calendar system, and My Vrat controls stay out of
              Jyotish while preserving a stable primary-navigation position. */}
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
                  style={{ flexShrink: 1, fontFamily: lang === 'en' ? fontFamilies.latin : scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 12, color: colors.inkSoft }}
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
                {/* The date block toggles the month grid like the माह देखें
                    button below — a large, natural tap target. Its a11y label is
                    the date plus the day identity line; 'Expand calendar' stays
                    unique to the button (the smoke flows full-string match on it). */}
                <Pressable
                  onPress={() => setCalendarExpanded((expanded) => !expanded)}
                  accessibilityRole="button"
                  accessibilityLabel={dayIdentityEn ? `${formatFullDate(selectedDate, 'en')}. ${dayIdentityEn}` : formatFullDate(selectedDate, 'en')}
                  style={({ pressed }) => [styles.datePagerPage, pressed && { opacity: 0.7 }]}
                >
                  <Text style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 15, color: colors.ink, textAlign: 'center' }}>
                    {formatFullDate(selectedDate, lang)}
                  </Text>
                  {/* The day's panchang identity folded into the card (the
                      separate date-header block below the card is gone): vara ·
                      lunar month + paksha · Vikram Samvat, one line. Renders a
                      space while the day solves so the card height is stable. */}
                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.75}
                    style={{ fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 11, color: colors.inkMuted, marginTop: 2, textAlign: 'center' }}
                  >
                    {dayIdentityHi && dayIdentityEn ? contentByLang(lang, dayIdentityHi, dayIdentityEn) : ' '}
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
            {/* Bottom action row: the month-view toggle (left — the redundant
                "<Month> <Year>" label it replaces already lives in the big date
                line above and in the expanded grid's own header) and the आज
                return-to-today button (right). */}
            <View style={styles.compactActions}>
              <Pressable
                onPress={() => setCalendarExpanded((expanded) => !expanded)}
                accessibilityRole="button"
                accessibilityLabel={calendarExpanded ? 'Collapse calendar' : 'Expand calendar'}
                hitSlop={8}
                style={({ pressed }) => [styles.monthViewButton, pressed && { opacity: 0.7 }]}
              >
                <Text style={{ fontFamily: fontFamilies.interSemiBold, fontSize: 11, color: colors.saffronDeep }}>
                  {calendarExpanded
                    ? contentByLang(lang, 'माह छिपाएँ', 'Hide month')
                    : contentByLang(lang, 'माह देखें', 'Month view')}
                </Text>
              </Pressable>
              <Pressable
                onPress={handleToday}
                accessibilityRole="button"
                accessibilityLabel="Today"
                style={({ pressed }) => [styles.todayButton, styles.compactTodayButton, { borderColor: colors.divider }, pressed && { opacity: 0.7 }]}
              >
                <Text style={{ fontFamily: fontFamilies.interSemiBold, fontSize: 12, color: colors.saffronDeep }}>
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
                {overlayRule && (
                  <View
                    testID="muhurat-overlay-chip"
                    style={[styles.overlayChip, { backgroundColor: colors.goldTint, borderColor: colors.divider, borderRadius: radii.md }]}
                  >
                    <Text style={{ flex: 1, fontFamily: scriptTitleFont(lang, typography.cardHindi.fontFamily), fontSize: 12.5, color: colors.saffronDeep, lineHeight: 20 }}>
                      {contentByLang(lang, overlayRule.nameHi, overlayRule.nameEn)}
                      {contentByLang(lang, ' — शुभ दिन घेरे में', ' — muhurat days ringed')}
                    </Text>
                    <Pressable
                      testID="muhurat-overlay-clear"
                      accessibilityRole="button"
                      accessibilityLabel={contentByLang(lang, 'घेरा हटाएँ', 'Clear muhurat overlay')}
                      hitSlop={12}
                      onPress={() => rootNav.setParams({ muhuratOverlay: undefined })}
                    >
                      <Text style={{ color: colors.saffron, fontSize: 15 }}>✕</Text>
                    </Pressable>
                  </View>
                )}
                <View style={styles.weekdayRow}>
                  {(lang === 'en' ? WEEKDAYS_EN : lang === 'hi' ? WEEKDAYS_HI : WEEKDAYS_HI.map((d) => transliterateDevanagari(d, lang))).map((day) => (
                    <Text key={day} style={[styles.weekdayText, { color: colors.inkMuted }]}>
                      {day}
                    </Text>
                  ))}
                </View>
                {calendarRows.map((week, weekIndex) => (
                  <View key={week[0].key} testID={`calendar-week-${weekIndex}`} style={styles.dateWeekRow}>
                  {week.map((cell) => {
                    const observanceTag = monthObservanceTags.get(cell.key);
                    return (
                      <Pressable
                        key={cell.key}
                        onPress={() => handleSelectDate(cell.date)}
                        accessibilityRole="button"
                        accessibilityLabel={`Select ${formatFullDate(cell.date, 'en')}${observanceTag ? ` ${calendarTagLabel(observanceTag, 'en')}` : ''}${overlayKeys.has(cell.key) ? ' Muhurat day.' : ''}`}
                        style={({ pressed }) => [
                          styles.dateCell,
                          overlayKeys.has(cell.key) && { backgroundColor: colors.goldTint, borderColor: colors.gold, borderWidth: 1.5 },
                          cell.isSelected && { backgroundColor: colors.saffronTint, borderColor: colors.saffron },
                          !cell.isSelected && cell.isToday && { borderColor: colors.gold },
                          pressed && { opacity: 0.7 },
                        ]}
                      >
                        <Text
                          style={{
                            fontFamily: fontFamilies.interSemiBold,
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
                            <Text
                              style={[
                                pillTextStyle(lang, typography.versePill),
                                styles.dateTagText,
                                { color: colors.saffronDeep },
                              ]}
                            >
                              {calendarTagLabel(observanceTag, lang)}
                            </Text>
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                  </View>
                ))}
              </View>
            )}
          </View>

          {p ? (
            <>
          {/* The old standalone date-header block (vara · date · संवत् · paksha)
              is gone — that identity now lives as the calendar card's subtitle
              line, so the date is stated once and the day panel starts with the
              live muhurat card. */}

          {/* Daily Muhurat — Choghadiya / Rahu Kaal glance card (PRD-14). Promoted
              to lead the day panel, above the anga grid: "is now auspicious?" is
              the live, time-sensitive question users open Panchang for. */}
          <View ref={muhuratCardRef} collapsable={false} style={{ marginTop: 12 }}>
            <MuhuratGlanceCard
              date={selectedDate}
              calendarSystem={calendarSystem}
              onViewAll={() => rootNav.navigate('MuhuratDetail', { dateMs: selectedDate.getTime() })}
            />
          </View>

          {/* Event Muhurat Finder door (PRD-16) — between the glance card and the
              anga grid: the "is now auspicious?" reader is the user with a date
              decision to make. Additive; nothing above or below moves. */}
          <MuhuratFinderDoor onPress={() => rootNav.navigate('MuhuratFinder')} />

          {/* Two-tier anga grid: Tithi + Nakshatra lead (the two anchors users read
              first) on elevated off-white cards; Yoga + Karana sit as a quieter,
              flatter secondary row. */}
          <View style={styles.angaGrid}>
            <PanchangTile label={contentByLang(lang, 'तिथि', 'Tithi')} element={p.tithi} kshaya={p.kshayaTithi} successor={successorTithiToday(p)} panchangDate={p.date} lang={lang} colors={colors} typography={typography} radii={radii} elevation={elevation} />
            <PanchangTile label={contentByLang(lang, 'नक्षत्र', 'Nakshatra')} element={p.nakshatra} kshaya={p.kshayaNakshatra} panchangDate={p.date} lang={lang} colors={colors} typography={typography} radii={radii} elevation={elevation} />
          </View>
          <View style={styles.angaGridSecondary}>
            {/* नित्य योग, never bare योग — the 27-cycle Sun+Moon yoga must stay
                distinguishable from the PRD-27 शुभ योग chips below (one nitya
                yoga is literally named सिद्धि; RULEBOOK §24 naming rule). */}
            <PanchangTile label={contentByLang(lang, 'नित्य योग', 'Nitya Yoga')} element={p.yoga} panchangDate={p.date} lang={lang} colors={colors} typography={typography} radii={radii} elevation={elevation} />
            <PanchangTile label={contentByLang(lang, 'करण', 'Karana')} element={p.karana} panchangDate={p.date} lang={lang} colors={colors} typography={typography} radii={radii} elevation={elevation} />
          </View>

          {/* PRD-27: the day's शुभ योग — present-or-absent with its window,
              annotation only (design.md §69). Absent days render nothing. */}
          <ShubhYogaCard yogas={shubhYogas} referenceDay={p.date} />

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
                  moonrise={p?.moonrise ?? null}
                  lang={lang}
                  colors={colors}
                  typography={typography}
                  radii={radii}
                  elevation={elevation}
                  onOpenLink={openLinkedSection}
                  onOpenKatha={openKatha}
                  onOpenVidhi={openVidhi}
                />
              ))
            ) : (
              <Text style={{ fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 12, lineHeight: 18, color: colors.inkMuted }}>
                {meaningByLang(lang, 'इस तिथि पर कोई व्रत या पर्व नहीं है।', 'No vrat or festival falls on this date.')}
              </Text>
            )}
            {/* PRD-17: the private ॥ स्मरण chip — renders only on a saved
                observance date, muted gold register, device-only. */}
            <PitruPakshaDayChip date={selectedDate} />
            <PitruSmaranDayChip date={selectedDate} />
          </View>

          {upcoming.length > 0 && (
            <View style={styles.upcomingSection}>
              <Text style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 14, color: colors.ink, marginBottom: 10 }}>
                {contentByLang(lang, 'आगामी', 'Upcoming')}
              </Text>
              {upcoming.map((item, i) => (
                <PanchangTimelineRow
                  key={`${item.rule.id}-${item.date.toDateString()}`}
                  markerColor={markerColor(item.rule.marker, colors)}
                  dateLabel={formatShortDate(item.date, lang)}
                  title={contentByLang(lang, item.rule.nameHi, item.rule.nameEn)}
                  showDivider={i < upcoming.length - 1}
                  accessibilityLabel={`${formatShortDate(item.date, 'en')}, ${item.rule.nameEn}`}
                />
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
              onOpenVidhiCatalog={openVidhiCatalog}
              onOpenMyVrat={openMyVrat}
              onOpenPitruSmaran={openPitruSmaran}
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
              today={today}
              loadState={kundaliLoadState}
              profile={kundaliProfile}
              chart={kundaliChart}
              people={kundaliPeople}
              activeId={kundaliActiveId}
              canAddPerson={canAddKundaliPerson}
              onSelectPerson={(id) => { void selectKundaliPerson(id); }}
              onAddPerson={openAddPerson}
              onOpenKundali={() => openKundali(false)}
              onEditKundali={() => openKundali(true)}
              onOpenRashifal={openRashifal}
              onOpenGochar={openGochar}
              onOpenReport={openKundaliReport}
              onOpenGunaMilan={openGunaMilan}
              onOpenNamkaran={openNamkaran}
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
  today,
  loadState,
  profile,
  chart,
  people,
  activeId,
  canAddPerson,
  onSelectPerson,
  onAddPerson,
  onOpenKundali,
  onEditKundali,
  onOpenRashifal,
  onOpenGochar,
  onOpenReport,
  onOpenGunaMilan,
  onOpenNamkaran,
  onOpenNavagraha,
}: {
  lang: Lang;
  colors: any;
  typography: any;
  radii: any;
  elevation: any;
  today: Date;
  loadState: KundaliLoadState;
  profile: BirthProfile | null;
  chart: KundaliChart | null;
  people: readonly PersonProfile[];
  activeId: string | null;
  canAddPerson: boolean;
  onSelectPerson: (id: string) => void;
  onAddPerson: () => void;
  onOpenKundali: () => void;
  onEditKundali: () => void;
  onOpenRashifal: () => void;
  onOpenGochar: () => void;
  onOpenReport: () => void;
  onOpenGunaMilan: () => void;
  onOpenNamkaran: () => void;
  onOpenNavagraha: () => void;
}) {
  const [shareVisible, setShareVisible] = useState(false);
  const moon = chart?.grahas.find((position) => position.graha === 'moon');
  const guidance = useMemo(
    () => (chart ? computePersonalGuidance(chart, today) : null),
    [chart, today]
  );
  const currentDasha = chart ? getCurrentDasha(chart, today) : null;
  const city = profile ? getCityById(profile.cityId) : null;

  const sectionLabel = (hi: string, en: string) => (
    <Text
      style={[
        pillTextStyle(lang, typography.sectionLabel),
        styles.jyotishSectionLabel,
        { color: colors.inkMuted },
      ]}
    >
      {contentByLang(lang, hi, en)}
    </Text>
  );

  if (loadState === 'loading') {
    return (
      <View accessibilityLabel="Jyotish tools landing">
        <View style={styles.jyotishIntro}>
          <Text
            style={[
              pillTextStyle(lang, typography.sectionLabel),
              { color: colors.saffronDeep, fontSize: 10 },
            ]}
          >
            {contentByLang(lang, 'ज्योतिष', 'Jyotish')}
          </Text>
          <Text
            style={{
              color: colors.ink,
              fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
              fontSize: 25,
              marginTop: 4,
            }}
          >
            {contentByLang(lang, 'आपका दृश्य तैयार हो रहा है', 'Preparing your view')}
          </Text>
          <Text
            style={{
              color: colors.inkMuted,
              fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
              fontSize: 12,
              lineHeight: 18,
              marginTop: 4,
            }}
          >
            {meaningByLang(
              lang,
              'सहेजे गए जन्म विवरण पढ़े जा रहे हैं।',
              'Loading your saved birth details.'
            )}
          </Text>
        </View>
        <JyotishStateCard
          kind="loading"
          lang={lang}
          titleHi="आपकी कुंडली बन रही है"
          titleEn="Calculating your chart"
          bodyHi="कुंडली तैयार होते ही आज का चन्द्र-राशि मार्गदर्शन पहले दिखाई देगा।"
          bodyEn="Today’s Moon-sign guidance will lead as soon as the chart is ready."
        />
      </View>
    );
  }

  if (loadState === 'error') {
    return (
      <View accessibilityLabel="Jyotish tools landing">
        <View style={styles.jyotishIntro}>
          <Text
            style={[
              pillTextStyle(lang, typography.sectionLabel),
              { color: colors.saffronDeep, fontSize: 10 },
            ]}
          >
            {contentByLang(lang, 'ज्योतिष', 'Jyotish')}
          </Text>
          <Text
            style={{
              color: colors.ink,
              fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
              fontSize: 25,
              marginTop: 4,
            }}
          >
            {contentByLang(lang, 'अपना दृश्य फिर से बनाएँ', 'Let’s restore your view')}
          </Text>
          <Text
            style={{
              color: colors.inkMuted,
              fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
              fontSize: 12,
              lineHeight: 18,
              marginTop: 4,
            }}
          >
            {meaningByLang(
              lang,
              'जन्म विवरण ठीक होने तक पंचांग उपलब्ध रहेगा।',
              'Your Panchang remains available while birth details are repaired.'
            )}
          </Text>
        </View>
        <JyotishStateCard
          kind="error"
          lang={lang}
          titleHi="जन्म विवरण पढ़े नहीं जा सके"
          titleEn="We couldn’t read your birth details"
          bodyHi="कुछ हटाया नहीं गया। कुंडली फिर बनाने के लिए विवरण दोबारा भरें।"
          bodyEn="Nothing was deleted. Re-enter the details to rebuild your Kundali."
          actionHi="जन्म विवरण फिर भरें"
          actionEn="Re-enter birth details"
          onAction={onOpenKundali}
        />
        {sectionLabel('अभी उपलब्ध', 'Available now')}
        <JyotishToolCard
          titleHi="चन्द्र राशि स्वयं चुनें"
          titleEn="Choose a Moon sign manually"
          bodyHi="कुंडली उपलब्ध न होने पर भी दैनिक मार्गदर्शन पढ़ें।"
          bodyEn="Daily guidance still works while your chart is unavailable."
          glyph="रा"
          onPress={onOpenRashifal}
          accessibilityLabel="Open Daily Rashifal"
          lang={lang}
          colors={colors}
          typography={typography}
          radii={radii}
          elevation={elevation}
        />
        <JyotishToolCard
          titleHi="अष्टकूट मिलान"
          titleEn="Guna Milan"
          bodyHi="वर-वधू के ३६ गुण—हर कूट का स्पष्ट और निजी हिसाब।"
          bodyEn="A private 36-point match with every koota explained."
          badge="NEW"
          glyph="मि"
          onPress={onOpenGunaMilan}
          accessibilityLabel="Open Guna Milan"
          lang={lang}
          colors={colors}
          typography={typography}
          radii={radii}
          elevation={elevation}
        />
        <JyotishToolCard
          titleHi="नामकरण"
          titleEn="Namkaran"
          bodyHi="नवजात के जन्म-चन्द्र से नामाक्षर पाएँ, या नक्षत्र से बिना जन्म विवरण के देखें।"
          bodyEn="Find a newborn's namakshar from the birth Moon, or browse by nakshatra without birth details."
          badge="NEW"
          glyph="ना"
          onPress={onOpenNamkaran}
          accessibilityLabel="Open Namkaran"
          lang={lang}
          colors={colors}
          typography={typography}
          radii={radii}
          elevation={elevation}
        />
      </View>
    );
  }

  if (loadState === 'saved' && profile && chart && moon && guidance && city) {
    const lagnaPrimary = contentByLang(
      lang,
      RASHI_NAMES_HI[chart.lagnaRashiIndex],
      RASHI_NAMES_EN[chart.lagnaRashiIndex]
    );
    const lagnaSecondary =
      lang === 'en'
        ? `${RASHI_NAMES_WESTERN[chart.lagnaRashiIndex]} rising`
        : RASHI_NAMES_EN[chart.lagnaRashiIndex];
    const moonPrimary = contentByLang(
      lang,
      RASHI_NAMES_HI[moon.rashiIndex],
      RASHI_NAMES_EN[moon.rashiIndex]
    );
    const moonSecondary =
      lang === 'en' ? RASHI_NAMES_WESTERN[moon.rashiIndex] : RASHI_NAMES_EN[moon.rashiIndex];

    return (
      <View accessibilityLabel="Jyotish tools landing, saved profile">
        <View style={styles.jyotishIntro}>
          <Text
            style={[
              pillTextStyle(lang, typography.sectionLabel),
              { color: colors.saffronDeep, fontSize: 10 },
            ]}
          >
            {formatFullDate(today, lang)}
          </Text>
          <Text
            style={{
              color: colors.ink,
              fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
              fontSize: 26,
              marginTop: 4,
            }}
          >
            {contentByLang(lang, 'आज आपका ज्योतिष', 'Your Jyotish today')}
          </Text>
          <Text
            style={{
              color: colors.inkMuted,
              fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
              fontSize: 12,
              lineHeight: 18,
              marginTop: 3,
            }}
          >
            {meaningByLang(
              lang,
              'आज का मार्गदर्शन आपकी पूरी कुंडली से; चार्ट स्वयं एक स्पर्श दूर।',
              'Today’s guidance reads your full chart; the chart itself stays one tap away.'
            )}
          </Text>
        </View>

        {/* Whose day this is, above the guidance it changes. Everything below —
            Rashifal, the chart glance, the share card — follows this selection,
            and so does the muhurat finder's आपके लिए strip (design.md §51a). */}
        <PersonChips
          people={people}
          activeId={activeId}
          lang={lang}
          onSelect={onSelectPerson}
          onAdd={onAddPerson}
          canAdd={canAddPerson}
          labelHi="किसका ज्योतिष"
          labelEn="Whose Jyotish"
          selectAccessibilityLabel={(label) => `Show Jyotish for ${label}`}
          addAccessibilityLabel="Add another person"
          fullMessageHi={`${MAX_PEOPLE} लोग तक सहेजे जा सकते हैं।`}
          fullMessageEn={`Up to ${MAX_PEOPLE} people can be saved.`}
        />

        {sectionLabel('आज का राशिफल', 'Today’s Rashifal')}
        <View
          style={[
            styles.jyotishGuidanceBlock,
            {
              borderColor: colors.cardActiveBorder,
              backgroundColor: colors.cardActiveFrom,
              borderRadius: radii.lg,
            },
            elevation.card,
          ]}
        >
          <View
            style={[
              styles.jyotishGuidanceHead,
              {
                backgroundColor: colors.cardActiveFrom,
                borderBottomColor: colors.divider,
              },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  pillTextStyle(lang, typography.sectionLabel),
                  { color: colors.saffronDeep, fontSize: 10 },
                ]}
              >
                {/* With more than one person saved, "your" would be a guess —
                    name whose chart this guidance came from. PRD-20 reads the
                    FULL chart, not the Moon sign alone. */}
                {people.length > 1 && profile.name
                  ? contentByLang(
                    lang,
                    `${profile.name} की पूरी कुंडली से`,
                    `From ${profile.name}’s full chart`
                  )
                  : contentByLang(
                    lang,
                    'आपकी पूरी कुंडली से',
                    'From your full chart'
                  )}
              </Text>
              <Text
                style={{
                  color: colors.ink,
                  fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
                  fontSize: 21,
                  marginTop: 3,
                }}
              >
                {moonPrimary}
                <Text style={[styles.jyotishTranslation, { color: colors.inkMuted }]}>
                  {' '}· {moonSecondary}
                </Text>
              </Text>
              <Text style={[styles.jyotishGuidanceDate, { color: colors.inkMuted }]}>
                {formatFullDate(today, lang)}
              </Text>
            </View>
            <Pressable
              onPress={() => setShareVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="Share today’s Rashifal"
              style={({ pressed }) => [
                styles.jyotishSharePill,
                {
                  borderColor: colors.divider,
                  backgroundColor: colors.parchmentSoft,
                  borderRadius: radii.pill,
                },
                pressed && { opacity: 0.65 },
              ]}
            >
              <Text style={[styles.jyotishShareText, { color: colors.saffronDeep }]}>
                ↗ {contentByLang(lang, 'साझा करें', 'Share')}
              </Text>
            </Pressable>
          </View>
          <JyotishGuidanceRows guidance={guidance} lang={lang} showContext />
          <View
            style={[
              styles.jyotishGuidanceFooter,
              { backgroundColor: colors.cardActiveFrom },
            ]}
          >
            <Pressable
              onPress={onOpenRashifal}
              accessibilityRole="button"
              accessibilityLabel="Open Daily Rashifal"
            >
              <Text style={[styles.jyotishInlineLink, { color: colors.saffronDeep }]}>
                {contentByLang(lang, 'पूरा राशिफल खोलें', 'Open Daily Rashifal')} ›
              </Text>
            </Pressable>
          </View>
        </View>

        {sectionLabel('आपकी कुंडली', 'Your Kundali')}
        <View
          style={[
            styles.jyotishPersonalCard,
            {
              borderColor: colors.divider,
              backgroundColor: colors.parchmentSoft,
              borderRadius: radii.lg,
            },
            elevation.card,
          ]}
        >
          <View style={styles.jyotishPersonalHead}>
            <View>
              <Text
                style={[
                  pillTextStyle(lang, typography.sectionLabel),
                  { color: colors.saffronDeep, fontSize: 10 },
                ]}
              >
                {contentByLang(lang, 'कुंडली की एक झलक', 'Chart at a glance')}
              </Text>
              <Text
                style={{
                  color: colors.ink,
                  fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
                  fontSize: 17,
                  marginTop: 3,
                }}
              >
                {profile.name || contentByLang(lang, 'आपकी जन्म कुंडली', 'Your birth chart')}
              </Text>
            </View>
            <View
              style={[
                styles.jyotishSavedPill,
                {
                  borderColor: colors.divider,
                  backgroundColor: colors.cardSurface,
                  borderRadius: radii.pill,
                },
              ]}
            >
              <Text style={[styles.jyotishSavedText, { color: colors.inkMuted }]}>
                {contentByLang(lang, 'विवरण सहेजे गए', 'Details saved')}
              </Text>
            </View>
          </View>
          <View style={styles.jyotishFactGrid}>
            {[
              {
                labelHi: 'लग्न',
                labelEn: 'Lagna',
                value: lagnaPrimary,
                detail: lagnaSecondary,
              },
              {
                labelHi: 'चन्द्र राशि',
                labelEn: 'Moon sign',
                value: moonPrimary,
                detail: moonSecondary,
              },
              {
                labelHi: 'नक्षत्र',
                labelEn: 'Nakshatra',
                value: contentByLang(
                  lang,
                  NAKSHATRA_NAMES_HI[moon.nakshatraIndex],
                  NAKSHATRA_NAMES_EN[moon.nakshatraIndex]
                ),
                detail: contentByLang(lang, `पद ${moon.pada}`, `Pada ${moon.pada}`),
              },
              {
                labelHi: 'वर्तमान दशा',
                labelEn: 'Current period',
                value: currentDasha
                  ? contentByLang(
                    lang,
                    GRAHA_NAMES_HI[currentDasha.maha.lord],
                    GRAHA_NAMES_EN[currentDasha.maha.lord]
                  )
                  : '—',
                detail: contentByLang(lang, 'महादशा', 'Mahadasha'),
              },
            ].map((fact) => (
              <View
                key={fact.labelEn}
                style={[
                  styles.jyotishFact,
                  {
                    borderColor: colors.divider,
                    backgroundColor: colors.cardSurface,
                    borderRadius: radii.md,
                  },
                ]}
              >
                <Text
                  style={[
                    pillTextStyle(lang, typography.sectionLabel),
                    styles.jyotishFactLabel,
                    { color: colors.inkMuted },
                  ]}
                >
                  {contentByLang(lang, fact.labelHi, fact.labelEn)}
                </Text>
                <Text
                  numberOfLines={1}
                  style={{
                    color: colors.ink,
                    fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
                    fontSize: 14,
                    marginTop: 3,
                  }}
                >
                  {fact.value}
                </Text>
                <Text style={[styles.jyotishFactDetail, { color: colors.inkMuted }]}>
                  {fact.detail}
                </Text>
              </View>
            ))}
          </View>
          {guidance.sadeSatiPhase !== 'none' && (
            <Pressable
              onPress={onOpenGochar}
              accessibilityRole="button"
              accessibilityLabel="Sade Sati is running. Open Gochar"
              style={({ pressed }) => [
                styles.jyotishTeaser,
                {
                  borderColor: colors.divider,
                  backgroundColor: colors.goldTint,
                  borderRadius: radii.md,
                },
                pressed && { opacity: 0.72 },
              ]}
            >
              <Text
                style={{
                  flex: 1,
                  color: colors.inkSoft,
                  fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
                  fontSize: 11,
                  lineHeight: 16,
                }}
              >
                {meaningByLang(
                  lang,
                  'साढ़े साती का पारम्परिक काल चल रहा है — गोचर में देखें।',
                  'A traditional Sade Sati period is running — see it in Gochar.'
                )}
              </Text>
              <Text style={{ color: colors.saffronDeep, fontSize: 16 }}>›</Text>
            </Pressable>
          )}
          <View style={styles.jyotishActions}>
            <Pressable
              onPress={onOpenKundali}
              accessibilityRole="button"
              accessibilityLabel="Open Kundali"
              style={({ pressed }) => [
                styles.jyotishPrimary,
                { backgroundColor: colors.saffronDeep, borderRadius: radii.pill },
                pressed && { opacity: 0.72 },
              ]}
            >
              <Text style={[styles.jyotishPrimaryText, { color: colors.onPrimary }]}>
                {contentByLang(lang, 'कुंडली खोलें', 'Open Kundali')}
              </Text>
            </Pressable>
            <Pressable
              onPress={onEditKundali}
              accessibilityRole="button"
              accessibilityLabel="Edit birth details"
              style={({ pressed }) => [
                styles.jyotishSecondary,
                {
                  borderColor: colors.divider,
                  backgroundColor: colors.parchmentSoft,
                  borderRadius: radii.pill,
                },
                pressed && { opacity: 0.72 },
              ]}
            >
              <Text style={[styles.jyotishSecondaryText, { color: colors.saffronDeep }]}>
                {contentByLang(lang, 'विवरण बदलें', 'Edit details')}
              </Text>
            </Pressable>
          </View>
          <Pressable
            onPress={onOpenReport}
            accessibilityRole="button"
            accessibilityLabel="Open full Kundali reading"
            style={({ pressed }) => [
              styles.jyotishReportLink,
              pressed && { opacity: 0.65 },
            ]}
          >
            <Text style={[styles.jyotishInlineLink, { color: colors.saffronDeep }]}>
              {contentByLang(lang, 'पूर्ण कुंडली विवेचन खोलें', 'Open the full chart reading')} ›
            </Text>
          </Pressable>
        </View>

        {sectionLabel('गोचर', 'Transits')}
        <JyotishToolCard
          titleHi="गोचर"
          titleEn="Gochar"
          bodyHi="आज के नौ ग्रह आपकी कुंडली में—साढ़े साती और आगामी राशि-प्रवेश सहित।"
          bodyEn="Today's nine grahas in your chart—with Sade Sati and upcoming sign changes."
          badge="NEW"
          glyph="गो"
          onPress={onOpenGochar}
          accessibilityLabel="Open Gochar"
          lang={lang}
          colors={colors}
          typography={typography}
          radii={radii}
          elevation={elevation}
        />
        {sectionLabel('मिलान', 'Compatibility')}
        <JyotishToolCard
          titleHi="अष्टकूट मिलान"
          titleEn="Guna Milan"
          bodyHi="वर-वधू के ३६ गुण—हर कूट का स्पष्ट और निजी हिसाब।"
          bodyEn="A private 36-point match with every koota explained."
          badge="NEW"
          glyph="मि"
          onPress={onOpenGunaMilan}
          accessibilityLabel="Open Guna Milan"
          lang={lang}
          colors={colors}
          typography={typography}
          radii={radii}
          elevation={elevation}
        />
        <JyotishToolCard
          titleHi="नामकरण"
          titleEn="Namkaran"
          bodyHi="नवजात के जन्म-चन्द्र से नामाक्षर पाएँ, या नक्षत्र से बिना जन्म विवरण के देखें।"
          bodyEn="Find a newborn's namakshar from the birth Moon, or browse by nakshatra without birth details."
          badge="NEW"
          glyph="ना"
          onPress={onOpenNamkaran}
          accessibilityLabel="Open Namkaran"
          lang={lang}
          colors={colors}
          typography={typography}
          radii={radii}
          elevation={elevation}
        />
        {sectionLabel('साधना', 'Practice')}
        <JyotishPracticeCard
          subtitleHi="आज के चन्द्र-राशि मार्गदर्शन के साथ"
          subtitleEn="Suggested alongside today’s Moon-sign guidance"
          onPress={onOpenNavagraha}
        />
        <JyotishShareSheet
          visible={shareVisible}
          lang={lang}
          titleHi={`आज का ${RASHI_NAMES_HI[moon.rashiIndex]} राशिफल साझा करें`}
          titleEn={`Share today’s ${RASHI_NAMES_EN[moon.rashiIndex]} Rashifal`}
          privacyHi="केवल चन्द्र-राशि मार्गदर्शन साझा होगा। नाम या जन्म विवरण शामिल नहीं हैं।"
          privacyEn="Only Moon-sign guidance is shared. No name or birth details are included."
          onClose={() => setShareVisible(false)}
          renderCard={(width) => (
            <JyotishShareCard
              kind="rashifal"
              width={width}
              lang={lang}
              guidance={guidance}
              rashiIndex={moon.rashiIndex}
              practiceHi="नवग्रह स्तोत्रम्"
              practiceEn="Navagraha Stotram"
              date={today}
            />
          )}
        />
      </View>
    );
  }

  return (
    <View accessibilityLabel="Jyotish tools landing">
      <View
        style={[
          styles.jyotishHero,
          {
            backgroundColor: colors.cardActiveFrom,
            borderColor: colors.cardActiveBorder,
            borderRadius: radii.lg,
          },
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

      {sectionLabel('अपने लिए', 'For you')}
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
      <JyotishToolCard
        titleHi="अष्टकूट मिलान"
        titleEn="Guna Milan"
        bodyHi="वर-वधू के ३६ गुण—हर कूट का स्पष्ट और निजी हिसाब।"
        bodyEn="A private 36-point match with every koota explained."
        badge="NEW"
        glyph="मि"
        onPress={onOpenGunaMilan}
        accessibilityLabel="Open Guna Milan"
        lang={lang}
        colors={colors}
        typography={typography}
        radii={radii}
        elevation={elevation}
      />
      <JyotishToolCard
        titleHi="नामकरण"
        titleEn="Namkaran"
        bodyHi="नवजात के जन्म-चन्द्र से नामाक्षर पाएँ, या नक्षत्र से बिना जन्म विवरण के देखें।"
        bodyEn="Find a newborn's namakshar from the birth Moon, or browse by nakshatra without birth details."
        badge="NEW"
        glyph="ना"
        onPress={onOpenNamkaran}
        accessibilityLabel="Open Namkaran"
        lang={lang}
        colors={colors}
        typography={typography}
        radii={radii}
        elevation={elevation}
      />

      <View style={styles.jyotishMicroNote}>
        <View
          style={[
            styles.jyotishInfoMark,
            { borderColor: colors.divider, borderRadius: radii.pill },
          ]}
        >
          <Text style={[styles.jyotishInfoText, { color: colors.saffronDeep }]}>i</Text>
        </View>
        <Text
          style={{
            flex: 1,
            color: colors.inkMuted,
            fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
            fontSize: 11,
            lineHeight: 16,
          }}
        >
          {meaningByLang(
            lang,
            'पारम्परिक मार्गदर्शन चिंतन का सहारा है, निश्चित भविष्यवाणी नहीं।',
            'Traditional guidance is a reflection aid, not a certain prediction.'
          )}
        </Text>
      </View>
      {sectionLabel('साधना', 'Practice')}
      <JyotishPracticeCard onPress={onOpenNavagraha} />
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
        <Text style={{ color: colors.saffronDeep, fontFamily: fontFamilies.devanagariBold, fontSize: 18 }}>
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

function PanchangTile({ label, element, kshaya, successor, panchangDate, lang, colors, typography, radii, elevation }: {
  label: string;
  element: PanchangElement;
  // Kshaya anga (skipped at every sunrise) — rendered as a second, smaller row so
  // days like 10 Jul 2026 read "दशमी तक 8:16 AM · एकादशी तक 5:22 AM, 11 जुल".
  kshaya?: PanchangElement | null;
  // The anga that takes over later the SAME day (tithi tile only). "तृतीया तक
  // 8:51 AM" alone leaves the rest of the day unnamed, which is what made a
  // Chaturthi vrat look like it belonged to the next date instead of this one.
  successor?: { nameHi: string; nameEn: string } | null;
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
          fontSize: 10,
          color: colors.saffronDeep,
          // English keeps the tracked uppercase Cormorant tag; Indic uses its own
          // script serif with no tracking (letterSpacing splits the shirorekha).
          fontFamily: lang === 'en' ? fontFamilies.latinSemiBold : scriptTitleFont(lang, typography.cardHindi.fontFamily),
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
            <Text style={{ fontFamily: lang === 'en' ? fontFamilies.latinSemiBold : scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 11, color: colors.inkSoft, marginTop: i === 0 ? 5 : 3 }}>
              {contentByLang(lang, 'तक ', 'till ')}{formatEndInstant(row.endTime, panchangDate, lang)}
            </Text>
          )}
        </React.Fragment>
      ))}
      {/* Handover line — quieter than the तक line above it, since the tile's
          headline stays the sunrise (udaya) anga the almanac names the day by. */}
      {successor && (
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
          style={{ fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 11, color: colors.inkMuted, marginTop: 3 }}
        >
          {contentByLang(lang, `फिर ${successor.nameHi} — शेष दिन`, `then ${successor.nameEn} — rest of day`)}
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
        <Text style={{ fontFamily: lang === 'en' ? fontFamilies.latin : scriptBodyFont(lang, fontFamilies.devanagari), fontSize: 10, color: colors.inkMuted }}>{label}</Text>
        <Text style={{ fontFamily: fontFamilies.latinSemiBold, fontSize: 13, color: colors.ink }}>{value}</Text>
      </View>
    </View>
  );
}

function ObservanceCard({ item, moonrise, lang, colors, typography, radii, elevation, onOpenLink, onOpenKatha, onOpenVidhi }: {
  item: ResolvedObservance;
  // This date's moonrise, when the day is solved. Only read for a chandrodaya
  // rule, whose observance day IS the day whose moonrise its tithi covers.
  moonrise: Date | null;
  lang: Lang;
  colors: any;
  typography: any;
  radii: any;
  elevation: any;
  onOpenLink: (sectionId: string) => void;
  onOpenKatha: (kathaId: string) => void;
  onOpenVidhi: (vidhiId: string, dateMs: number) => void;
}) {
  const linkedEntry = item.rule.linkSectionId
    ? library.find((entry) => entry.id === item.rule.linkSectionId)
    : null;
  const katha = item.rule.kathaId ? getKathaContent(item.rule.kathaId) : null;
  // PRD-19: the vidhi pill renders only when the rule's vidhiId resolves to a
  // published vidhi — the identical hook mechanism as kathaId.
  const vidhi = item.rule.vidhiId ? getVidhiById(item.rule.vidhiId) : null;
  // A moonrise vrat is kept through a night, not a calendar box: its tithi
  // usually ends the next morning, so the card states the instant the fast is
  // actually broken rather than leaving the reader to reconcile "व्रत" with a
  // तिथि line that ends before noon.
  const chandrodaya = item.rule.dayRule === 'chandrodaya' ? moonrise : null;
  // The one generic monthly rule whose occurrences carry PUBLISHED names: the
  // Bhadrapada Sankashti is the Heramba day, an adhik lunation is Vibhuvana, a
  // Tuesday is अंगारकी — the rule name alone hid all of that. Occurrence-titled
  // here only; list/search/detail surfaces keep the rule's own name.
  const sankashtiName = React.useMemo(() => {
    if (item.rule.id !== 'sankashti-chaturthi-vrat') return null;
    try {
      return sankashtiOccurrenceName(item.date);
    } catch {
      return null;
    }
  }, [item.rule.id, item.date]);
  const titleHi = sankashtiName
    ? `${sankashtiName.nameHi}${sankashtiName.isAngarki ? ' (अंगारकी)' : ''} व्रत`
    : item.rule.nameHi;
  const titleEn = sankashtiName
    ? `${sankashtiName.nameEn}${sankashtiName.isAngarki ? ' (Angarki)' : ''} Vrat`
    : item.rule.nameEn;

  return (
    <View style={[styles.observanceCard, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.md }, elevation.card]}>
      <View style={styles.observanceTop}>
        <View style={[styles.categoryPill, { backgroundColor: item.rule.category === 'vrat' ? colors.goldTint : colors.saffronTint, borderRadius: radii.pill }]}>
          <Text style={{ fontFamily: lang === 'en' ? fontFamilies.interSemiBold : scriptBodyFont(lang, typography.cardHindi.fontFamily), fontSize: 10, color: colors.saffronDeep }}>
            {item.rule.category === 'vrat' ? contentByLang(lang, 'व्रत', 'Vrat') : contentByLang(lang, 'पर्व', 'Festival')}
          </Text>
        </View>
        <Text style={{ fontFamily: lang === 'en' ? fontFamilies.latin : scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 12, color: colors.inkMuted }}>
          {contentByLang(lang, item.rule.deityHi, item.rule.deityEn)}
        </Text>
      </View>
      <Text style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 15, color: colors.ink }}>
        {contentByLang(lang, titleHi, titleEn)}
      </Text>
      <Text style={{ fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 12, lineHeight: 18, color: colors.inkMuted, marginTop: 4 }}>
        {meaningByLang(lang, item.rule.shortDescriptionHi, item.rule.shortDescriptionEn)}
      </Text>
      {chandrodaya && (
        <Text style={{ fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 12, lineHeight: 18, color: colors.saffronDeep, marginTop: 6 }}>
          {contentByLang(
            lang,
            `व्रत इसी रात्रि — चंद्रोदय ${formatTime12(chandrodaya)}, दर्शन व अर्घ्य के बाद पारण`,
            `Kept this night — moonrise ${formatTime12(chandrodaya)}, parana after darshan and arghya`
          )}
        </Text>
      )}
      <View style={styles.linkRow}>
        {vidhi && (
          <Pressable
            onPress={() => onOpenVidhi(vidhi.id, item.date.getTime())}
            testID={`observance-vidhi-${item.rule.id}`}
            accessibilityRole="button"
            accessibilityLabel={contentByLang(
              lang,
              `${vidhi.titleHi} पूजा विधि`,
              `Puja vidhi for ${vidhi.titleEn}`
            )}
            style={({ pressed }) => [styles.kathaButton, { backgroundColor: colors.saffron, borderRadius: radii.pill }, pressed && { opacity: 0.7 }]}
          >
            <Text style={{ fontFamily: lang === 'en' ? fontFamilies.interSemiBold : scriptBodyFont(lang, typography.cardHindi.fontFamily), fontSize: 12, color: colors.parchment }}>
              ॥ {contentByLang(lang, 'पूजा विधि', 'Puja Vidhi')}
            </Text>
          </Pressable>
        )}
        {katha && item.rule.kathaId && (
          <Pressable
            onPress={() => onOpenKatha(item.rule.kathaId as string)}
            accessibilityRole="button"
            accessibilityLabel={`Read katha ${katha.titleEn}`}
            style={({ pressed }) => [styles.kathaButton, { backgroundColor: colors.goldTint, borderRadius: radii.pill }, pressed && { opacity: 0.7 }]}
          >
            <Text style={{ fontFamily: fontFamilies.interSemiBold, fontSize: 12, color: colors.saffronDeep }}>
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
            <Text style={{ fontFamily: fontFamilies.interSemiBold, fontSize: 12, color: colors.saffronDeep }}>
              {contentByLang(lang, `पढ़ें: ${linkedEntry.nameHi}`, `Read: ${linkedEntry.nameEn}`)}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function PitruSmaranCatalogRow({
  lang, colors, typography, radii, elevation, onPress,
}: {
  lang: Lang;
  colors: any;
  typography: any;
  radii: any;
  elevation: any;
  onPress: () => void;
}) {
  const { entries } = usePitruSmaran();
  const [soonest, setSoonest] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;
    const handle = setTimeout(() => {
      const today = startOfLocalDay(new Date());
      const dates = entries
        .map((entry) => {
          try { return nextObservanceForEntry(entry, today); } catch { return null; }
        })
        .filter((date): date is Date => date !== null)
        .sort((a, b) => a.getTime() - b.getTime());
      if (!cancelled) setSoonest(dates[0] ?? null);
    }, 0);
    return () => { cancelled = true; clearTimeout(handle); };
  }, [entries]);

  const subtitle = entries.length > 0
    ? contentByLang(
        lang,
        `${entries.length} स्मरण${soonest ? ` · अगला: ${shortSmaranDate(soonest, lang)}` : ''}`,
        `${entries.length} remembrance${entries.length === 1 ? '' : 's'}${soonest ? ` · Next: ${shortSmaranDate(soonest, lang)}` : ''}`
      )
    : contentByLang(lang, 'अपने पितरों की तिथियाँ जोड़ें', 'Add your ancestors’ tithis');

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Pitru Smaran. ${entries.length > 0 ? `${entries.length} entries` : 'Add remembrance dates'}`}
      style={({ pressed }) => [
        styles.myVratRow,
        styles.pitruLedgerRow,
        { backgroundColor: colors.goldTint, borderColor: colors.gold, borderRadius: radii.lg },
        elevation.card,
        pressed && { opacity: 0.8 },
      ]}
    >
      <Text style={{ fontSize: 18, color: colors.gold, marginRight: 10 }}>॥</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 15, color: colors.ink }}>
          {contentByLang(lang, 'पितृ स्मरण', 'Pitru Smaran')}
        </Text>
        <Text style={{ ...captionFont(subtitle), fontSize: 12, color: colors.inkMuted, marginTop: 2 }}>
          {subtitle}
        </Text>
      </View>
      <Text style={{ fontSize: 20, color: colors.inkMuted }}>›</Text>
    </Pressable>
  );
}

function CatalogLanding({
  lang, today, calendarSystem, query, onChangeQuery,
  colors, typography, radii, elevation,
  onOpenDetail, onOpenCategory, onOpenKathaLibrary, onOpenVidhiCatalog, onOpenMyVrat, followCount, reminderCount,
  onOpenPitruSmaran,
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
  onOpenVidhiCatalog: () => void;
  onOpenMyVrat: () => void;
  onOpenPitruSmaran: () => void;
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
  // Same glyph vocabulary as the "Browse by type" tiles (ॐ / ☾ / ✺), reused on the
  // upcoming cards so they read as devotional, not as a plain list of text.
  const categoryGlyph = (category: string): string =>
    category === 'vrat' ? 'ॐ' : category === 'upavas' ? '☾' : '✺';

  return (
    <View style={{ marginTop: 12 }}>
      <TextField
        value={query}
        onChangeText={onChangeQuery}
        placeholder={contentByLang(lang, 'व्रत, पर्व, उपवास, कथा खोजें…', 'Search vrat, festival, upvas, katha…')}
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
          <PitruSmaranCatalogRow
            lang={lang}
            colors={colors}
            typography={typography}
            radii={radii}
            elevation={elevation}
            onPress={onOpenPitruSmaran}
          />
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
                      <Text style={{ fontFamily: typography.readerTitle.fontFamily, fontSize: 14, color: colors.saffron }}>
                        {categoryGlyph(item.rule.category)}
                      </Text>
                      <Text style={{ fontFamily: fontFamilies.interSemiBold, fontSize: 10, color: colors.saffronDeep, letterSpacing: 0.4 }}>
                        {formatShortDate(item.date, lang).toUpperCase()}
                      </Text>
                    </View>
                    <Text numberOfLines={1} style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 14, color: colors.ink, marginTop: 6 }}>
                      {contentByLang(lang, item.rule.nameHi, item.rule.nameEn)}
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
                    style={({ pressed }) => [styles.tile, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.md }, elevation.card, pressed && { opacity: 0.8 }]}
                  >
                    <View style={[styles.tileGlyph, { backgroundColor: colors.saffronTint }]}>
                      <Text style={{ fontFamily: typography.readerTitle.fontFamily, fontSize: 17, color: colors.saffron }}>{meta.glyph}</Text>
                    </View>
                    <View style={styles.tileInfo}>
                      <Text style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 15, color: colors.ink }}>
                        {contentByLang(lang, meta.hi, meta.en)}
                      </Text>
                      <Text style={{ fontFamily: fontFamilies.interSemiBold, fontSize: 11, color: colors.saffronDeep, marginTop: 1 }}>
                        {count} {contentByLang(lang, 'व्रत-पर्व', 'observances')}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
              <Pressable
                onPress={onOpenKathaLibrary}
                accessibilityRole="button"
                accessibilityLabel={`Katha library, ${kathaCount}`}
                style={({ pressed }) => [styles.tile, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.md }, elevation.card, pressed && { opacity: 0.8 }]}
              >
                <View style={[styles.tileGlyph, { backgroundColor: colors.saffronTint }]}>
                  <Text style={{ fontFamily: typography.readerTitle.fontFamily, fontSize: 17, color: colors.saffron }}>॥</Text>
                </View>
                <View style={styles.tileInfo}>
                  <Text style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 15, color: colors.ink }}>
                    {contentByLang(lang, 'कथा', 'Katha')}
                  </Text>
                  <Text style={{ fontFamily: fontFamilies.interSemiBold, fontSize: 11, color: colors.saffronDeep, marginTop: 1 }}>
                    {kathaCount} {contentByLang(lang, 'कथाएँ', 'stories')}
                  </Text>
                </View>
              </Pressable>
            </View>
            <View style={styles.finalTileRow}>
              <Pressable
                onPress={onOpenVidhiCatalog}
                testID="vidhi-catalog-tile"
                accessibilityRole="button"
                accessibilityLabel={contentByLang(
                  lang,
                  `पूजा विधि सूची, ${VIDHI_ENTRIES.length}`,
                  `Puja vidhi catalog, ${VIDHI_ENTRIES.length}`
                )}
                style={({ pressed }) => [styles.tile, styles.finalTile, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.md }, elevation.card, pressed && { opacity: 0.8 }]}
              >
                <View style={[styles.tileGlyph, { backgroundColor: colors.saffronTint }]}>
                  <Text style={{ fontFamily: typography.readerTitle.fontFamily, fontSize: 17, color: colors.saffron }}>॥</Text>
                </View>
                <View style={styles.tileInfo}>
                  <Text style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 15, color: colors.ink }}>
                    {contentByLang(lang, 'पूजा विधि', 'Puja Vidhi')}
                  </Text>
                  <Text style={{ fontFamily: fontFamilies.interSemiBold, fontSize: 11, color: colors.saffronDeep, marginTop: 1 }}>
                    {contentByLang(
                      lang,
                      `${VIDHI_ENTRIES.length} ${VIDHI_ENTRIES.length === 1 ? 'विधि' : 'विधियाँ'}`,
                      `${VIDHI_ENTRIES.length} ${VIDHI_ENTRIES.length === 1 ? 'vidhi' : 'vidhis'}`
                    )}
                  </Text>
                </View>
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
  systemHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
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
  starBadge: { position: 'absolute', top: -2, right: -3, minWidth: 16, height: 16, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  starBadgeText: { fontFamily: fontFamilies.interSemiBold, fontSize: 10, lineHeight: 13 },
  myVratRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, padding: 14, marginTop: 12 },
  pitruLedgerRow: { marginTop: 10 },
  segmented: { flexDirection: 'row', padding: 3, borderWidth: 1, marginTop: 10 },
  segmentOption: { flex: 1, minHeight: 38, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  jyotishHero: { borderWidth: 1, padding: 16, marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 13 },
  jyotishHeroIcon: { width: 58, height: 58, alignItems: 'center', justifyContent: 'center' },
  jyotishIntro: { paddingHorizontal: 1, paddingTop: 12, paddingBottom: 5 },
  jyotishSectionLabel: { fontSize: 10, marginTop: 18, marginBottom: 8 },
  jyotishToolCard: { minHeight: 98, borderWidth: 1, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  jyotishToolGlyph: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center' },
  jyotishBadge: { paddingHorizontal: 7, paddingVertical: 3 },
  jyotishBadgeText: { fontFamily: fontFamilies.interSemiBold, fontSize: 10, letterSpacing: 1.1 },
  jyotishPractice: { minHeight: 72, borderWidth: 1, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  jyotishPracticeGlyph: { fontFamily: fontFamilies.devanagariBold, fontSize: 24 },
  jyotishMicroNote: { marginHorizontal: 4, marginTop: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 9 },
  jyotishInfoMark: { width: 18, height: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  jyotishInfoText: { fontFamily: fontFamilies.interSemiBold, fontSize: 10 },
  jyotishGuidanceBlock: { borderWidth: 1, overflow: 'hidden' },
  jyotishGuidanceHead: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', alignItems: 'center', gap: 10 },
  jyotishTranslation: { fontFamily: fontFamilies.inter, fontSize: 10 },
  jyotishGuidanceDate: { fontFamily: fontFamilies.inter, fontSize: 10, marginTop: 2 },
  jyotishSharePill: { minHeight: 38, paddingHorizontal: 11, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  jyotishShareText: { fontFamily: fontFamilies.interSemiBold, fontSize: 10 },
  jyotishGuidanceFooter: { paddingHorizontal: 13, paddingVertical: 11, alignItems: 'flex-end' },
  jyotishInlineLink: { fontFamily: fontFamilies.interSemiBold, fontSize: 10 },
  jyotishPersonalCard: { borderWidth: 1, padding: 14 },
  jyotishPersonalHead: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 9 },
  jyotishSavedPill: { paddingHorizontal: 8, paddingVertical: 5, borderWidth: 1 },
  jyotishSavedText: { fontFamily: fontFamilies.interSemiBold, fontSize: 10 },
  jyotishFactGrid: { marginTop: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  jyotishFact: { width: '48.7%', minHeight: 62, paddingHorizontal: 10, paddingVertical: 9, borderWidth: 1 },
  jyotishFactLabel: { fontSize: 10 },
  jyotishFactDetail: { fontFamily: fontFamilies.inter, fontSize: 10, marginTop: 1 },
  jyotishActions: { marginTop: 12, flexDirection: 'row', gap: 8 },
  jyotishReportLink: {
    minHeight: 44,
    marginTop: 2,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  jyotishTeaser: {
    marginTop: 10,
    minHeight: 44,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  jyotishPrimary: { minHeight: 42, flex: 1, paddingHorizontal: 15, alignItems: 'center', justifyContent: 'center' },
  jyotishPrimaryText: { fontFamily: fontFamilies.interSemiBold, fontSize: 11 },
  jyotishSecondary: { minHeight: 42, flex: 1, paddingHorizontal: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  jyotishSecondaryText: { fontFamily: fontFamilies.interSemiBold, fontSize: 11 },
  resultRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth },
  // Compact upcoming card (design.md § catalog view): date + glyph top row and a
  // one-line name — the category caption is dropped, the ॐ/☾/✺ glyph carries it.
  upCard: { width: 136, height: 72, borderWidth: 1, paddingVertical: 10, paddingHorizontal: 12 },
  upCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tileGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  // Explicit two-column width keeps the paired rows stable. The odd final tile
  // lives in its own row below so ScrollView measures it on every renderer.
  // Slim half-tile (design.md § catalog view): glyph roundel inline-left, title +
  // count in one column, no secondary-language echo — the primary language stays
  // in focus and the section costs ~60% less height than the old 104pt tiles.
  tile: { width: '48%', height: 60, borderWidth: 1, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  finalTileRow: { marginTop: 12 },
  finalTile: { width: '100%' },
  // Circular tinted roundel: the category glyphs (ॐ ✺ ☾ ॥) come from different
  // fonts with different line metrics; centring them in a fixed 34pt circle keeps
  // every tile's leading edge aligned. The glyph renders at its natural line
  // height (no tight lineHeight, which clipped the tall ॐ).
  tileGlyph: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  tileInfo: { flex: 1, minWidth: 0 },
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
  compactActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 8 },
  // Text-only affordance, so padding (with the row's height) carries it to the
  // 44pt floor; hitSlop tops it up.
  monthViewButton: { minHeight: 32, justifyContent: 'center', paddingHorizontal: 6, paddingVertical: 6 },
  expandedCalendar: { marginTop: 10, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth },
  monthHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  // Deliberately 34, not the 44 used for back controls: a calendar month stepper
  // is a different control class and 44 would crowd the month header. The
  // hitSlop={10} at the call site takes the real touch target to 54, clearing
  // the 44 minimum — the size exception is visual only (design.md §12).
  monthButton: { width: 34, height: 34, borderWidth: 1, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  overlayChip: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 8, minHeight: 38 },
  // Seven `flex: 1` columns in a fixed row — never a percentage width inside a
  // wrapping row. Yoga resolves percentages in 32-bit float, so `100 / 7` can sum
  // to just over the container (320.000008 pt inside 320 pt on a 390 dp iPhone)
  // and drop the seventh cell onto the next line, sliding every date one or more
  // columns off its weekday. `flex: 1` divides the same row exactly, at any width.
  weekdayRow: { flexDirection: 'row', marginBottom: 4 },
  weekdayText: { flex: 1, textAlign: 'center', fontFamily: fontFamilies.interSemiBold, fontSize: 10 },
  dateWeekRow: { flexDirection: 'row' },
  dateCell: {
    flex: 1,
    minHeight: 38,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginVertical: 1,
    paddingVertical: 3,
  },
  // Grown from 24×12 to fit the 10px type floor: the tag label can be Devanagari
  // ("व्रत"), whose matras clip below ~1.4× leading, so the box follows the
  // 14pt line box rather than the old 10pt one.
  dateTag: { minWidth: 28, minHeight: 16, borderRadius: 8, paddingHorizontal: 5, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  dateTagText: { fontSize: 10, lineHeight: 14 },
  todayButton: { alignSelf: 'center', marginTop: 8, borderWidth: 1, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 },
  compactTodayButton: { marginTop: 0, paddingHorizontal: 14, paddingVertical: 7 },
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
});
