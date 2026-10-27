import StoryIcon, { type StoryIconName } from '@/components/StoryIcon';
import ObservancePreviewCard from '@/components/ObservancePreviewCard';
import ObservanceArtwork from '@/components/ObservanceArtwork';
import ObservanceTodaySummary from '@/components/ObservanceTodaySummary';
import { observanceCountdown } from '@/panchang/observancePresentation';
import AppIcon from '@/components/AppIcon';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, InteractionManager, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { GestureResponderEvent } from 'react-native';
import { useFocusEffect, useIsFocused, useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { backgroundImages } from '@assets/backgrounds';
import BackgroundLayer from '@/components/BackgroundLayer';
import { JyotishChakraSeal, PanchangChakraBackground } from '@/components/CelestialChakra';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage, type Lang } from '@/data/gita/language';
import { library } from '@/data/texts';
import { buildEntryStartTarget, moreTabTarget } from '@/navigation/entryRoutes';
import LocationPickerModal from '@/components/LocationPickerModal';
// Lazy: a sheet that only exists after a tap has no business on the launch
// graph (`launchGraph.test.ts`), and `React.lazy` is the same treatment
// `TabNavigator` gives the Panchang stack.
const LensPickerSheet = React.lazy(() => import('@/components/LensPickerSheet'));
import MuhuratGlanceCard from '@/components/MuhuratGlanceCard';
import MuhuratFinderDoor from '@/components/MuhuratFinderDoor';
import ObservanceNowRibbon from '@/components/ObservanceNowRibbon';
import PanchangSky, { MonthGlyph, type SkyInk } from '@/components/PanchangSky';
import { useMuhurat } from '@/panchang/useMuhurat';
import { usePanchangShare } from '@/utils/panchangShare';
import ShubhYogaCard from '@/components/ShubhYogaCard';
import PanchangPanel from '@/components/PanchangPanel';
import PanchangAngaCard from '@/components/PanchangAngaCard';
import SunMoonCard from '@/components/SunMoonCard';
import PitruSmaranDayChip from '@/components/PitruSmaranDayChip';
import PitruPakshaDayChip from '@/components/PitruPakshaDayChip';
import TextField from '@/components/TextField';
import { formatClock as formatTime12 } from '@/panchang/muhuratFormat';
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
  useObservancesForDate,
  usePanchangCalendarSystem,
  usePanchangForSelection,
  usePanchangMonthObservances,
} from '@/panchang/usePanchang';
import { useShubhYoga } from '@/panchang/useShubhYoga';
import type { CalendarSystem, ResolvedObservance } from '@/panchang/types';
import { getKathaContent } from '@/panchang/kathaContent';
import { getUpcomingObservances, searchObservances } from '@/panchang/festivalEngine';
import { getLensDefinition, serializeLenses, type ObservanceLens } from '@/panchang/lenses';
import { useLenses } from '@/panchang/useLenses';
import { seedFromLocationOnce } from '@/panchang/lensStore';
import { observanceDayNote, type ObservanceDaySolve } from '@/panchang/observanceDayNote';
import { sankashtiOccurrenceName } from '@/panchang/sankashtiNames';
import { getCategoryCounts, getKathaCount, getLensAdditions, getNextOccurrence, type BrowseCategory } from '@/panchang/vratCatalog';
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
import JyotishGuidanceRows from '@/components/JyotishGuidanceRows';
import JyotishPracticeCard from '@/components/JyotishPracticeCard';
import JyotishShareCard from '@/components/JyotishShareCard';
import JyotishShareSheet from '@/components/JyotishShareSheet';
import JyotishStateCard from '@/components/JyotishStateCard';
import JyotishToolTile from '@/components/JyotishToolTile';
import DayVaasCards from '@/components/DayVaasCards';
import { computePersonalGuidance, SADE_SATI_PHASE_SHORT } from '@/panchang/gochar';
import {
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
  const { colors, typography, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  // Feature-tour spotlight anchors (design.md §47): the Choghadiya/Muhurat glance
  // card and the [Calendar | Vrat & Parv] segment.
  // Panchang and Vrat mount independent instances; only the focused screen
  // may own these shared tour anchors.
  const isFocused = useIsFocused();
  const muhuratCardRef = useTourTarget('muhuratCard', undefined, isFocused);
  const panchangSegmentRef = useTourTarget('panchangSegment', undefined, isFocused);
  const rootNav = useNavigation<any>();
  const { followCount } = useVratFollows();
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
  // Before sunrise the Hindu day is still yesterday's, so a festival kept last
  // night is the one running — the ribbon above the Muhurat card carries it over.
  // Read once per render, not ticked: the screen re-renders on any selection.
  const preDawnToday = p != null && selectedDate.getTime() === today.getTime() && Date.now() < p.sunrise.getTime();
  const carryOverDate = useMemo(() => addDays(selectedDate, -1), [selectedDate]);
  const carryOver = useObservancesForDate(preDawnToday ? carryOverDate : selectedDate, calendarSystem);
  const ribbonTonight = preDawnToday && carryOver.length > 0;
  // The पूर्ण पंचांग share (design.md §33a) from the sky header. `live: false`:
  // the card needs only the day's windows, never the minute tick, so this
  // 2,500-line screen does not re-render every minute for it.
  const { muhurat: shareMd } = useMuhurat(selectedDate, calendarSystem, { live: false });
  const { share: sharePanchang, busy: shareBusy } = usePanchangShare();
  const shareUnavailable = shareBusy || !p || !shareMd;
  const shareDay = useCallback(() => {
    if (!p || !shareMd) return;
    void sharePanchang({ p, md: shareMd, observances, placeHi: location.labelHi, placeEn: location.labelEn, calendarSystem, lang });
  }, [p, shareMd, sharePanchang, observances, location.labelHi, location.labelEn, calendarSystem, lang]);
  // The Panchang sky header (design.md §33) starts under the status bar, so it
  // needs the inset.
  const insets = useSafeAreaInsets();
  const isSelectedToday = selectedDate.getTime() === today.getTime();
  const [lensSheetVisible, setLensSheetVisible] = useState(false);
  const { lenses, availableCount: lensAvailableCount } = useLenses();
  // The one line PRD-42 §4.2 allows about seeding, named per city and dismissible.
  const [seededLenses, setSeededLenses] = useState<readonly ObservanceLens[]>([]);

  // SEEDING — silent, post-launch, once per install, and only when the user has
  // never chosen for themselves. It runs here rather than in the launch prefetch
  // because it is a WRITE, and the launch path may not grow one; `InteractionManager`
  // keeps it off the first paint of the tab it is mounted on. The three deliberate
  // holes (Ujjain, Delhi, Chandigarh) and both tradition lenses return nothing,
  // so for most users this effect is a single read that changes no pixel.
  useEffect(() => {
    let cancelled = false;
    const handle = InteractionManager.runAfterInteractions(() => {
      void seedFromLocationOnce({
        cityId: location.cityId,
        isTehsil: getCityById(location.cityId)?.districtEn != null,
        labelEn: location.labelEn,
      }).then((seeded) => {
        if (!cancelled && seeded.length > 0) setSeededLenses(seeded);
      });
    });
    return () => {
      cancelled = true;
      handle.cancel();
    };
  }, [location.cityId, location.labelEn]);
  // The day's full identity (vara · masa paksha · Vikram Samvat) for the date
  // button's a11y label — the explicit label would otherwise hide the visible
  // line from screen readers, so it must carry at least what the sky shows.
  const dayIdentityEn = p
    ? `${p.vara.nameEn} · ${p.lunarMonth.nameEn}${p.lunarMonth.isAdhik ? ' (Adhik)' : ''} ${PAKSHA_NAMES_EN[p.tithi.paksha]} Paksha · Vikram Samvat ${p.vikramSamvat}`
    : null;
  // The sky's shorter visible line names the day's tithi in place of the संवत्
  // (vara · masa paksha tithi); the full identity stays in the a11y label.
  const daySkyLineHi = p
    ? `${p.vara.nameHi} · ${p.lunarMonth.nameHi}${p.lunarMonth.isAdhik ? ' (अधिक)' : ''} ${PAKSHA_NAMES_HI[p.tithi.paksha]} ${p.tithi.nameHi}`
    : null;
  const daySkyLineEn = p
    ? `${p.vara.nameEn} · ${p.lunarMonth.nameEn}${p.lunarMonth.isAdhik ? ' (Adhik)' : ''} ${PAKSHA_NAMES_EN[p.tithi.paksha]} ${p.tithi.nameEn}`
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
  const openKundali = () => rootNav.navigate('Kundali');
  const openAddPerson = () => rootNav.navigate('Kundali', { newPerson: true });
  const openManagePerson = () => rootNav.navigate('Kundali', { editing: true });
  const openRashifal = () => rootNav.navigate('Rashifal');
  const openGochar = () => rootNav.navigate('Gochar');
  const openPrashna = () => rootNav.navigate('Prashna');
  const openGunaMilan = () => rootNav.navigate('GunaMilan');
  const openNamkaran = () => rootNav.navigate('Namkaran');

  // The mode switch and the location · calendar-system · My Vrat row render
  // either on the parchment (Vrat & Parv, Jyotish) or on the Panchang sky, where
  // `ink` re-tones them for the night or day sky.
  const renderModeSwitch = (sky: SkyInk | null) => (
    <View
      ref={panchangSegmentRef}
      collapsable={false}
      style={[
        styles.segmented,
        { backgroundColor: sky ? sky.glass : colors.parchmentSoft, borderColor: sky ? sky.glassBorder : colors.divider, borderRadius: radii.pill },
      ]}
    >
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
              selected && { backgroundColor: sky ? sky.glassActive : colors.saffronTint },
              pressed && !selected && { opacity: 0.7 },
            ]}
          >
            <Text
              style={{
                fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
                fontSize: 13,
                color: selected ? (sky ? sky.glassActiveText : colors.saffronDeep) : (sky ? sky.inkSoft : colors.inkMuted),
              }}
            >
              {contentByLang(lang, labels[tab].hi, labels[tab].en)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  // Slim system header — relevant to Panchang and Vrat only. The location,
  // lunar calendar system, and My Vrat controls stay out of Jyotish while
  // preserving a stable primary-navigation position.
  const renderSystemHeader = (sky: SkyInk | null) => {
    const surface = { backgroundColor: sky ? sky.glass : colors.parchmentSoft, borderColor: sky ? sky.glassBorder : colors.divider };
    // The pin's hole and the badge ring are cut in the colour behind them.
    const behind = sky ? (sky.tone === 'night' ? colors.skyNightLower : colors.skyDayLower) : colors.parchment;
    const locationChip = (
      <Pressable
        onPress={() => setLocationPickerVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={contentByLang(lang, `स्थान: ${location.labelHi}`, `Location: ${location.labelEn}`)}
        hitSlop={8}
        style={({ pressed }) => [
          styles.locationChip,
          sky ? styles.skyLocation : [surface, { borderRadius: radii.pill }],
          pressed && { opacity: 0.6 },
        ]}
      >
        <View style={[styles.pin, { backgroundColor: sky ? sky.accent : colors.saffron }]}>
          <View style={[styles.pinHole, { backgroundColor: sky ? behind : colors.parchmentSoft }]} />
        </View>
        <Text
          numberOfLines={1}
          style={{ flexShrink: 1, fontFamily: lang === 'en' ? fontFamilies.latin : scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 12, color: sky ? sky.ink : colors.inkSoft }}
        >
          {contentByLang(lang, location.labelHi, location.labelEn)}
        </Text>
      </Pressable>
    );
    const myVrat = (
      <Pressable
        onPress={openMyVrat}
        accessibilityRole="button"
        accessibilityLabel={followCount > 0 ? `My Vrat, ${followCount} following` : 'My Vrat'}
        hitSlop={10}
        style={({ pressed }) => [styles.myVratButton, surface, { borderRadius: radii.pill }, pressed && { opacity: 0.6 }]}
      >
        <Text style={{ fontSize: 16, color: sky ? sky.accent : colors.gold }}>★</Text>
        {followCount > 0 && (
          <View style={[styles.starBadge, { backgroundColor: colors.saffron, borderColor: behind }]}>
            <Text style={[styles.starBadgeText, { color: colors.parchment }]}>{followCount}</Text>
          </View>
        )}
      </Pressable>
    );
    // On the sky the row reads as the preview drew it: city and calendar system
    // as ONE glass chip (still two controls — the location button and the
    // Purnimant/Amanta radios the smoke flows tap), then the month button and
    // My Vrat on the right.
    if (sky) {
      return (
        <View style={styles.skyChipRow}>
          <View style={[styles.skyChipGroup, surface, { borderRadius: radii.pill }]}>
            {locationChip}
            <View style={[styles.skyChipDivider, { backgroundColor: sky.glassBorder }]} />
            <CalendarSystemToggle
              value={calendarSystem}
              onChange={setCalendarSystem}
              lang={lang}
              colors={colors}
              radii={radii}
              typography={typography}
              sky={sky}
              bare
            />
          </View>
          <View style={styles.skyChipActions}>
            <Pressable
              onPress={() => setCalendarExpanded((expanded) => !expanded)}
              accessibilityRole="button"
              accessibilityLabel={calendarExpanded ? 'Collapse calendar' : 'Expand calendar'}
              hitSlop={6}
              style={({ pressed }) => [styles.myVratButton, surface, { borderRadius: radii.pill }, calendarExpanded && { backgroundColor: sky.glassActive }, pressed && { opacity: 0.6 }]}
            >
              <MonthGlyph color={calendarExpanded ? sky.glassActiveText : sky.ink} size={16} />
            </Pressable>
            {myVrat}
          </View>
        </View>
      );
    }
    return (
      <View style={styles.systemHeader}>
        {/* Equal-width flex sides keep the calendar-system toggle centred on
            screen regardless of how wide the location chip / star are. */}
        <View style={styles.headerSide}>
          {/* Location selector — a drawn pin + city name in a bordered chip.
              Explicit accessibilityLabel "Location: <city>" keeps it readable
              for screen readers and stable for .maestro/panchang*-smoke. */}
          {locationChip}
        </View>
        {/* Calendar system (centre) */}
        <CalendarSystemToggle
          value={calendarSystem}
          onChange={setCalendarSystem}
          lang={lang}
          colors={colors}
          radii={radii}
          typography={typography}
          sky={null}
        />
        {/* My Vrat (right) — a circular icon button so the star reads as
            tappable and distinct from the location chip. */}
        <View style={[styles.headerSide, styles.headerSideRight]}>
          {myVrat}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      {panchangTab === 'calendar'
        ? <PanchangChakraBackground />
        : panchangTab === 'catalog' ? <BackgroundLayer />
        : <BackgroundLayer source={backgroundImages.panchang_celestial_almanac} />}
      <SafeAreaView style={styles.safe} edges={panchangTab === 'calendar' ? ['left', 'right'] : ['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingHorizontal: 14 }, panchangTab === 'calendar' && { paddingTop: 0 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Keep the primary mode switch first in every mode. Contextual
              Panchang controls render below it so selecting Jyotish does not
              make this segmented control jump vertically. In Panchang mode it
              rides the sky header, which starts under the status bar and pads
              by exactly that inset plus the scroll's own top padding — the
              switch sits at the same height in all three modes. */}
          {panchangTab === 'calendar' ? (
            <PanchangSky
              date={selectedDate}
              calendarSystem={calendarSystem}
              topInset={insets.top + SCROLL_TOP}
              focused={isFocused}
              style={styles.skyBleed}
              action={(ink) => (
                // Share the day as the पूर्ण पंचांग card (design.md §33a).
                <Pressable
                  onPress={shareDay}
                  disabled={shareUnavailable}
                  accessibilityRole="button"
                  accessibilityLabel="Share panchang"
                  accessibilityState={{ disabled: shareUnavailable, busy: shareBusy }}
                  hitSlop={6}
                  style={({ pressed }) => [
                    styles.myVratButton,
                    { backgroundColor: ink.glass, borderColor: ink.glassBorder, borderRadius: radii.pill },
                    shareUnavailable && { opacity: 0.5 },
                    pressed && { opacity: 0.6 },
                  ]}
                >
                  <AppIcon name="share" size={16} color={ink.ink} />
                </Pressable>
              )}
            >
              {(ink) => (
                <>
                  {renderModeSwitch(ink)}
                  {/* Day stepper on the sky: ‹ date ›. The date block also
                      toggles the month grid — a large, natural tap target; its
                      a11y label is the date plus the day identity line, while
                      'Expand calendar' stays unique to the month button in the row
                      below (the smoke flows full-string match on it). A horizontal
                      swipe here steps the day, as it did on the old calendar card. */}
                  <View style={styles.skyDateRow} onTouchStart={handleCalendarTouchStart} onTouchEnd={handleCalendarTouchEnd}>
                    <Pressable
                      onPress={() => shiftSelectedDate(-1)}
                      accessibilityRole="button"
                      accessibilityLabel="Previous date"
                      hitSlop={6}
                      style={({ pressed }) => [styles.skyChevron, pressed && { opacity: 0.6 }]}
                    >
                      <Text style={{ color: ink.ink, fontSize: 22 }}>‹</Text>
                    </Pressable>
                    <Pressable
                      testID="panchang-selected-date"
                      onPress={() => setCalendarExpanded((expanded) => !expanded)}
                      accessibilityRole="button"
                      accessibilityLabel={dayIdentityEn ? `${formatFullDate(selectedDate, 'en')}. ${dayIdentityEn}` : formatFullDate(selectedDate, 'en')}
                      style={({ pressed }) => [styles.skyDateBlock, pressed && { opacity: 0.7 }]}
                    >
                      <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85} style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 20, color: ink.ink, textAlign: 'center' }}>
                        {formatFullDate(selectedDate, lang)}
                      </Text>
                      {/* The day's identity (vara · masa paksha tithi) — a space
                          while the day solves so the row height is stable. */}
                      <Text
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.75}
                        style={{ fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 11.5, color: ink.inkSoft, marginTop: 1, textAlign: 'center' }}
                      >
                        {daySkyLineHi && daySkyLineEn ? contentByLang(lang, daySkyLineHi, daySkyLineEn) : ' '}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => shiftSelectedDate(1)}
                      accessibilityRole="button"
                      accessibilityLabel="Next date"
                      hitSlop={6}
                      style={({ pressed }) => [styles.skyChevron, pressed && { opacity: 0.6 }]}
                    >
                      <Text style={{ color: ink.ink, fontSize: 22 }}>›</Text>
                    </Pressable>
                  </View>
                  {/* आज appears only once the day has moved off today — on
                      today it would do nothing. */}
                  {!isSelectedToday && (
                    <Pressable
                      onPress={handleToday}
                      accessibilityRole="button"
                      accessibilityLabel="Today"
                      hitSlop={8}
                      style={({ pressed }) => [
                        styles.skyTodayButton,
                        { backgroundColor: ink.glass, borderColor: ink.glassBorder },
                        pressed && { opacity: 0.6 },
                      ]}
                    >
                      <Text style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 12.5, color: ink.ink }}>
                        {contentByLang(lang, 'आज', 'Today')}
                      </Text>
                    </Pressable>
                  )}
                  {renderSystemHeader(ink)}
                </>
              )}
            </PanchangSky>
          ) : (
            <>
              {renderModeSwitch(null)}
              {panchangTab !== 'jyotish' && renderSystemHeader(null)}
            </>
          )}

          {panchangTab === 'calendar' ? (
            <>
          {/* The month grid opens under the sky, from the date or the month
              button; picking a day folds it away again. */}
          {calendarExpanded && (
            <View style={[styles.calendarCard, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg }, elevation.card]}>
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


          {p ? (
            <>
          {/* The old standalone date-header block (vara · date · संवत् · paksha)
              is gone — that identity now lives as the calendar card's subtitle
              line, so the date is stated once and the day panel starts with the
              live muhurat card. */}

          {/* The day's observance (or last night's, before sunrise) above the
              fold — the व्रत और पर्व section below stays the full list. */}
          {(ribbonTonight || observances.length > 0) && (
            <View style={{ marginTop: 8 }}>
              <ObservanceNowRibbon
                items={ribbonTonight ? carryOver : observances}
                tonight={ribbonTonight}
                sunrise={p.sunrise}
                tithiIndex={p.tithi.index}
                onOpen={openObservanceDetail}
              />
            </View>
          )}

          {/* Daily Muhurat — Choghadiya / Rahu Kaal card (PRD-14). Promoted
              to lead the day panel, above the anga grid: "is now auspicious?" is
              the live, time-sensitive question users open Panchang for. */}
          <View ref={muhuratCardRef} collapsable={false} style={{ marginTop: 8 }}>
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

          {/* The panchang proper, one panel per subject in the Muhurat card's
              register (design.md §33): the four angas, the day's शुभ योग (PRD-27,
              annotation only — absent days render nothing), the rashi · direction
              · vaas readings, then sun and moon. */}
          <PanchangAngaCard p={p} />
          <ShubhYogaCard yogas={shubhYogas} referenceDay={p.date} />
          <DayVaasCards p={p} lang={lang} />
          <SunMoonCard p={p} />
            </>
          ) : (
            <View style={{ paddingVertical: 72, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator color={colors.saffron} />
            </View>
          )}

          {/* A city seeded its calendar — say so once, where the new dates appear,
              never as a modal and never as a question about the person. The copy
              names the CITY's calendar, not the user. Dismissing is local state:
              the seeding itself already recorded that it ran. */}
          {seededLenses.length > 0 && (
            <Pressable
              onPress={() => setLensSheetVisible(true)}
              accessibilityRole="button"
              accessibilityLabel={`${seededLenses
                .map((id) => getLensDefinition(id)?.nameEn ?? id)
                .join(', ')} calendar added for ${location.labelEn}. Opens regional calendars.`}
              style={({ pressed }) => [
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  marginTop: 12,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  backgroundColor: colors.goldTint,
                  borderWidth: 1,
                  borderColor: colors.divider,
                  borderRadius: radii.md,
                },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={{ fontSize: 14, color: colors.gold }}>❖</Text>
              <Text style={{ flex: 1, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 11.5, lineHeight: 17, color: colors.inkSoft }}>
                {contentByLang(
                  lang,
                  `${contentByLang(lang, location.labelHi, location.labelEn)} का ${seededLenses
                    .map((id) => getLensDefinition(id)?.nameHi ?? id)
                    .join(' · ')} पंचांग जोड़ा गया — बदलें`,
                  `Added the ${seededLenses
                    .map((id) => getLensDefinition(id)?.nameEn ?? id)
                    .join(' · ')} calendar for ${location.labelEn} — change`
                )}
              </Text>
              <Pressable
                onPress={() => setSeededLenses([])}
                accessibilityRole="button"
                accessibilityLabel="Dismiss"
                hitSlop={12}
              >
                <Text style={{ fontSize: 14, color: colors.inkMuted }}>✕</Text>
              </Pressable>
            </Pressable>
          )}

          {/* The day's observances share one panel (design.md §33 item 5): each
              is a hairline-split row in it, not a card of its own. */}
          <PanchangPanel testID="panchang-observance-panel" title={contentByLang(lang, 'व्रत और पर्व', 'Vrat & Observances')} style={styles.sectionPanel}>
            {observances.length > 0 ? (
              observances.map((item, i) => (
                <ObservanceCard
                  key={`${item.rule.id}-${i}`}
                  inPanel
                  first={i === 0}
                  item={item}
                  daySolve={p ? { sunrise: p.sunrise, sunset: p.sunset, moonrise: p.moonrise, tithiIndex: p.tithi.index, tithiEnd: p.tithi.endTime } : null}
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
              <>
                <Text style={{ fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 13, lineHeight: 19, color: colors.inkMuted, marginTop: 6 }}>
                  {meaningByLang(lang, 'इस तिथि पर कोई व्रत या पर्व नहीं है।', 'No vrat or festival falls on this date.')}
                </Text>
                {/* The quiet-day doorway. The क्षेत्र row's HOME is the व्रत-पर्व
                    ledger, but that is the other segment — and this is the one the
                    tab opens on and the one a lens actually changes, so a user who
                    never taps व्रत-पर्व would never learn the feature exists. It
                    appears ONLY on a day with nothing on it: on a day that has
                    something to say, this card is exactly what shipped before.
                    Hidden entirely when no calendar has content to offer. */}
                {lensAvailableCount > 0 && (
                  <LensDiscoveryRow
                    lang={lang}
                    colors={colors}
                    typography={typography}
                    radii={radii}
                    availableCount={lensAvailableCount}
                    onPress={() => setLensSheetVisible(true)}
                  />
                )}
              </>
            )}
            {/* PRD-17: the private ॥ स्मरण chip — renders only on a saved
                observance date, muted gold register, device-only. */}
            <PitruPakshaDayChip date={selectedDate} />
            <PitruSmaranDayChip date={selectedDate} />
          </PanchangPanel>

          {/* आगामी — an agenda in one panel: the date once per day, each row
              opening its observance (design.md §33 item 6). */}
          {upcoming.length > 0 && (
            <PanchangPanel testID="panchang-upcoming-panel" title={contentByLang(lang, 'आगामी', 'Upcoming')} style={styles.sectionPanel}>
              {upcoming.map((item, i) => (
                <UpcomingRow
                  key={`${item.rule.id}-${item.date.toDateString()}`}
                  item={item}
                  showDate={i === 0 || upcoming[i - 1].date.toDateString() !== item.date.toDateString()}
                  divider={i > 0}
                  lang={lang}
                  colors={colors}
                  typography={typography}
                  onPress={() => openObservanceDetail(item.rule.id)}
                />
              ))}
            </PanchangPanel>
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
              onOpenLenses={() => setLensSheetVisible(true)}
              lenses={lenses}
              lensAvailableCount={lensAvailableCount}
              followCount={followCount}
              todaySolve={p && selectedDate.getTime() === today.getTime() ? { sunrise: p.sunrise, sunset: p.sunset, moonrise: p.moonrise, tithiIndex: p.tithi.index, tithiEnd: p.tithi.endTime } : null}
              onOpenLink={openLinkedSection}
              onOpenKatha={openKatha}
              onOpenVidhi={openVidhi}
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
              onManagePerson={openManagePerson}
              onOpenKundali={openKundali}
              onOpenRashifal={openRashifal}
              onOpenGochar={openGochar}
              onOpenPrashna={openPrashna}
              onOpenGunaMilan={openGunaMilan}
              onOpenNamkaran={openNamkaran}
              onOpenNavagraha={() => openLinkedSection('navagraha-stotram')}
            />
          )}
        </ScrollView>
      </SafeAreaView>
      <LocationPickerModal visible={locationPickerVisible} onClose={() => setLocationPickerVisible(false)} />
      {lensSheetVisible && (
        <React.Suspense fallback={null}>
          <LensPickerSheet visible onClose={() => setLensSheetVisible(false)} />
        </React.Suspense>
      )}
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
  onManagePerson,
  onOpenKundali,
  onOpenRashifal,
  onOpenGochar,
  onOpenPrashna,
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
  onManagePerson: () => void;
  onOpenKundali: () => void;
  onOpenRashifal: () => void;
  onOpenGochar: () => void;
  onOpenPrashna: () => void;
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
        <View style={styles.jyotishTileGrid}>
          <JyotishToolTile
            titleHi="चन्द्र राशि स्वयं चुनें"
            titleEn="Choose a Moon sign"
            bodyHi="कुंडली उपलब्ध न होने पर भी दैनिक मार्गदर्शन पढ़ें।"
            bodyEn="Daily guidance still works while your chart is unavailable."
            glyph="रा"
            onPress={onOpenRashifal}
            accessibilityLabel="Open Daily Rashifal"
            lang={lang}
          />
          <JyotishToolTile
            titleHi="अष्टकूट मिलान"
            titleEn="Guna Milan"
            bodyHi="वर-वधू के ३६ गुण—हर कूट का निजी हिसाब।"
            bodyEn="A private 36-point match with every koota explained."
            badge="NEW"
            glyph="मि"
            onPress={onOpenGunaMilan}
            accessibilityLabel="Open Guna Milan"
            lang={lang}
          />
          <JyotishToolTile
            titleHi="नामकरण"
            titleEn="Namkaran"
            bodyHi="नवजात के नामाक्षर, जन्म-चन्द्र या नक्षत्र से।"
            bodyEn="A newborn's namakshar, from the birth Moon or a nakshatra."
            badge="NEW"
            glyph="ना"
            onPress={onOpenNamkaran}
            accessibilityLabel="Open Namkaran"
            lang={lang}
          />
        </View>
      </View>
    );
  }

  if (loadState === 'saved' && profile && chart && moon && guidance && city) {
    const lagnaPrimary = contentByLang(
      lang,
      RASHI_NAMES_HI[chart.lagnaRashiIndex],
      RASHI_NAMES_EN[chart.lagnaRashiIndex]
    );
    const moonPrimary = contentByLang(
      lang,
      RASHI_NAMES_HI[moon.rashiIndex],
      RASHI_NAMES_EN[moon.rashiIndex]
    );
    const moonSecondary =
      lang === 'en' ? RASHI_NAMES_WESTERN[moon.rashiIndex] : RASHI_NAMES_EN[moon.rashiIndex];
    // Read off the phase the guidance already solved — never a second
    // `computeSadeSati`, whose default 1,200-day ingress scan has no business
    // running for a tile subtitle.
    const sadeSatiValue =
      guidance.sadeSatiPhase === 'none'
        ? null
        : SADE_SATI_PHASE_SHORT[guidance.sadeSatiPhase];

    return (
      <View accessibilityLabel="Jyotish tools landing, saved profile" style={styles.jyotishSavedLanding}>
        {/* Whose day this is, ABOVE everything it changes. The chips no longer
            govern only the guidance card: every tile in the grid below reads out
            of this same active person, so a switch has to re-answer the whole
            screen on one render (design.md §51c). `birthProfileStore` keeps the
            single active selection that makes that true. */}
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
          onManage={onManagePerson}
          fullMessageHi={`${MAX_PEOPLE} लोग तक सहेजे जा सकते हैं।`}
          fullMessageEn={`Up to ${MAX_PEOPLE} people can be saved.`}
        />

        {/* The day's reading, and the only thing on this screen that leads.
            No page title and no date: the landing only ever shows today, the
            card's own eyebrow says whose chart it came from, and the date was
            being printed three times inside 300 dp (design.md §51c). */}
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
                  fontSize: 25,
                  marginTop: 3,
                }}
              >
                {moonPrimary}
                <Text style={[styles.jyotishTranslation, { color: colors.inkMuted }]}>
                  {' '}· {moonSecondary}
                </Text>
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
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <AppIcon name="share" size={15} />
                <Text style={[styles.jyotishShareText, { color: colors.saffronDeep }]}>{contentByLang(lang, 'साझा करें', 'Share')}</Text>
              </View>
            </Pressable>
          </View>
          {/* One आधार line, not a chip per row — Favour and Reflect share a
              graha often enough that two of the three chips were identical. */}
          <JyotishGuidanceRows guidance={guidance} lang={lang} showContext="summary" />
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

        {/* The four doors as ONE object, each answering for this person. This is
            what replaces the deleted chart-glance card: लग्न and नक्षत्र moved
            onto the कुंडली tile, and the साढ़े साती teaser onto the गोचर tile,
            instead of a 2×2 fact grid restating numbers the doors needed anyway.
            Open Kundali, Edit details and the full reading all live on
            KundaliScreen, which is one tap away and already offers all three. */}
        {sectionLabel(
          profile.name ? `${profile.name} के लिए` : 'आपके लिए',
          profile.name ? `For ${profile.name}` : 'For you'
        )}
        {/* प्रश्न leads the doors as a full-width card, not a fifth tile: the
            grid answers "what does my chart say", this answers "what should I
            do about X" — the question people actually bring (design.md §72). */}
        <Pressable
          onPress={onOpenPrashna}
          accessibilityRole="button"
          accessibilityLabel="Open Prashna"
          testID="jyotish-prashna-door"
          style={({ pressed }) => [
            styles.prashnaDoor,
            {
              borderColor: colors.cardActiveBorder,
              backgroundColor: colors.cardActiveFrom,
              borderRadius: radii.lg,
            },
            elevation.card,
            pressed && { opacity: 0.8 },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: colors.ink,
                fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
                fontSize: 15,
              }}
            >
              {contentByLang(lang, 'प्रश्न · अपनी कुंडली से पूछें', 'Prashna · ask your chart')}
              <Text style={[styles.prashnaNew, { color: colors.newBadgeText }]}>  NEW</Text>
            </Text>
            <Text
              style={{
                color: colors.inkMuted,
                fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
                fontSize: 11,
                lineHeight: 16,
                marginTop: 3,
              }}
            >
              {meaningByLang(
                lang,
                'विद्या · व्यापार · नौकरी · धन · स्वास्थ्य — नौ विषय, हर उत्तर अपने आधार के साथ',
                'Study · business · work · money · constitution — nine purposes, every answer with its basis'
              )}
            </Text>
          </View>
          <Text style={{ color: colors.saffronDeep, fontSize: 18 }}>›</Text>
        </Pressable>
        <View style={styles.jyotishTileGrid}>
          <JyotishToolTile
            titleHi="कुंडली"
            titleEn="Kundali"
            bodyHi="लग्न, ग्रह, भाव और दशा।"
            bodyEn="Lagna, grahas, houses and Dasha."
            value={{
              hi: `${lagnaPrimary} लग्न · ${NAKSHATRA_NAMES_HI[moon.nakshatraIndex]} ${moon.pada}`,
              en: `${lagnaPrimary} Lagna · ${NAKSHATRA_NAMES_EN[moon.nakshatraIndex]} ${moon.pada}`,
            }}
            glyph="कु"
            onPress={onOpenKundali}
            accessibilityLabel="Open Kundali"
            lang={lang}
          />
          <JyotishToolTile
            titleHi="गोचर"
            titleEn="Gochar"
            bodyHi="आज के नौ ग्रह आपकी कुंडली में।"
            bodyEn="Today’s nine grahas in your chart."
            // The one tile that can be LIVE: a running Sade Sati is a fact about
            // this person today, and it used to sit 700 dp down the page as a
            // teaser inside the chart card.
            value={sadeSatiValue}
            live={guidance.sadeSatiPhase !== 'none'}
            badge="NEW"
            glyph="गो"
            onPress={onOpenGochar}
            accessibilityLabel="Open Gochar"
            lang={lang}
          />
          <JyotishToolTile
            titleHi="अष्टकूट मिलान"
            titleEn="Guna Milan"
            bodyHi="वर-वधू के ३६ गुण।"
            bodyEn="A private 36-point match."
            // The saved person's own Moon sign and nakshatra ARE one side of a
            // match, so naming them is a true reading, not a decoration.
            value={{
              hi: `${moonPrimary} · ${NAKSHATRA_NAMES_HI[moon.nakshatraIndex]} से`,
              en: `From ${moonPrimary} · ${NAKSHATRA_NAMES_EN[moon.nakshatraIndex]}`,
            }}
            badge="NEW"
            glyph="मि"
            onPress={onOpenGunaMilan}
            accessibilityLabel="Open Guna Milan"
            lang={lang}
          />
          <JyotishToolTile
            titleHi="नामकरण"
            titleEn="Namkaran"
            // Deliberately DESCRIPTIVE where the other three read out a value:
            // Namkaran answers for a newborn, not for the selected person, so a
            // personalised line here would be a category error. Today's namakshar
            // is also gated content (NAMAKSHAR_SOURCE.verified is false), and the
            // landing is not where an unverified syllable gets promoted.
            bodyHi="नवजात के नामाक्षर, जन्म-चन्द्र या नक्षत्र से।"
            bodyEn="A newborn’s namakshar, from the birth Moon or a nakshatra."
            badge="NEW"
            glyph="ना"
            onPress={onOpenNamkaran}
            accessibilityLabel="Open Namkaran"
            lang={lang}
          />
        </View>
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
          captionHi={`आज का ${RASHI_NAMES_HI[moon.rashiIndex]} राशिफल`}
          captionEn={`Today’s ${RASHI_NAMES_EN[moon.rashiIndex]} Rashifal`}
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
          <JyotishChakraSeal />
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

      {/* The same grid as the saved landing (design.md §51c), with every tile
          on its descriptive fallback — a guest has no chart, so no tile has a
          reading. One geometry for both states, not a guest-only layout. */}
      {sectionLabel('अपने लिए', 'For you')}
      <View style={styles.jyotishTileGrid}>
        <JyotishToolTile
          titleHi="जन्म कुंडली"
          titleEn="Create Kundali"
          bodyHi="लग्न, ग्रह, भाव और दशा—सरल सार के साथ।"
          bodyEn="Lagna, grahas, houses and Dasha—with plain-language insights."
          badge="NEW"
          glyph="कु"
          onPress={onOpenKundali}
          accessibilityLabel="Create Kundali"
          lang={lang}
        />
        <JyotishToolTile
          titleHi="आज का राशिफल"
          titleEn="Daily Rashifal"
          bodyHi="चन्द्र राशि और आज के गोचर से चिंतन-संकेत।"
          bodyEn="Reflection prompts from your Moon sign and today's transits."
          glyph="रा"
          onPress={onOpenRashifal}
          accessibilityLabel="Open Daily Rashifal"
          lang={lang}
        />
        <JyotishToolTile
          titleHi="अष्टकूट मिलान"
          titleEn="Guna Milan"
          bodyHi="वर-वधू के ३६ गुण—हर कूट का निजी हिसाब।"
          bodyEn="A private 36-point match with every koota explained."
          badge="NEW"
          glyph="मि"
          onPress={onOpenGunaMilan}
          accessibilityLabel="Open Guna Milan"
          lang={lang}
        />
        <JyotishToolTile
          titleHi="नामकरण"
          titleEn="Namkaran"
          bodyHi="नवजात के नामाक्षर, जन्म-चन्द्र या नक्षत्र से।"
          bodyEn="A newborn's namakshar, from the birth Moon or a nakshatra."
          badge="NEW"
          glyph="ना"
          onPress={onOpenNamkaran}
          accessibilityLabel="Open Namkaran"
          lang={lang}
        />
      </View>

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

function markerColor(marker: ResolvedObservance['rule']['marker'], colors: any): string {
  if (marker === 'star') return colors.saffron;
  if (marker === 'halfmoon') return colors.ink;
  return colors.gold;
}

function CalendarSystemToggle({ value, onChange, lang, colors, radii, typography, sky, bare }: {
  value: CalendarSystem;
  onChange: (next: CalendarSystem) => void;
  lang: Lang;
  colors: any;
  radii: any;
  typography: any;
  /** Set when the toggle rides the Panchang sky — glass instead of parchment. */
  sky: SkyInk | null;
  /** Drop its own pill when it sits inside another one (the sky's city chip). */
  bare?: boolean;
}) {
  const options: { value: CalendarSystem; labelHi: string; labelEn: string }[] = [
    { value: 'purnimant', labelHi: 'पूर्णिमांत', labelEn: 'Purnimant' },
    { value: 'amanta', labelHi: 'अमान्त', labelEn: 'Amanta' },
  ];

  return (
    <View
      style={[
        styles.systemToggle,
        bare ? styles.systemToggleBare : { backgroundColor: sky ? sky.glass : colors.parchmentSoft, borderColor: sky ? sky.glassBorder : colors.divider, borderRadius: radii.pill },
      ]}
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
              selected && { backgroundColor: sky ? sky.glassActive : colors.saffronTint },
              pressed && !selected && { opacity: 0.7 },
            ]}
          >
            <Text style={{
              fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
              fontSize: 12,
              color: selected ? (sky ? sky.glassActiveText : colors.saffronDeep) : (sky ? sky.inkSoft : colors.inkMuted),
            }}>
              {contentByLang(lang, option.labelHi, option.labelEn)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/**
 * One आगामी agenda row (design.md §33 item 6): the date as a calendar leaf (day
 * over month) on the first row of each date only, the tier dot, the name over
 * `weekday · deity`, and a chevron — the row opens the observance. The weekday,
 * not a countdown, because the list runs from the selected date, not today.
 */
function UpcomingRow({ item, showDate, divider, lang, colors, typography, onPress }: {
  item: ResolvedObservance;
  showDate: boolean;
  divider: boolean;
  lang: Lang;
  colors: any;
  typography: any;
  onPress: () => void;
}) {
  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);
  const months = lang === 'en' ? MONTHS_EN : lang === 'hi' ? MONTHS_HI : MONTHS_HI.map((m) => transliterateDevanagari(m, lang));
  const weekdays = lang === 'en' ? WEEKDAYS_EN : lang === 'hi' ? WEEKDAYS_HI : WEEKDAYS_HI.map((d) => transliterateDevanagari(d, lang));
  const meta = [weekdays[item.date.getDay()], contentByLang(lang, item.rule.deityHi, item.rule.deityEn)].filter(Boolean).join(' · ');
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${formatShortDate(item.date, 'en')}, ${item.rule.nameEn}. Opens details.`}
      style={({ pressed }) => [styles.upcomingRow, pressed && { opacity: 0.6 }]}
    >
      <View style={styles.upcomingDate}>
        {showDate && (
          <>
            <Text style={{ fontFamily: fontFamilies.latinSemiBold, fontSize: 19, lineHeight: 22, color: colors.ink, fontVariant: ['lining-nums', 'tabular-nums'] }}>
              {item.date.getDate()}
            </Text>
            <Text style={{ fontFamily: lang === 'en' ? fontFamilies.latin : bodyFont, fontSize: 11, color: colors.inkMuted }}>
              {months[item.date.getMonth()]}
            </Text>
          </>
        )}
      </View>
      <View style={[styles.upcomingMain, divider && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.divider }]}>
        <View style={[styles.upcomingDot, { backgroundColor: markerColor(item.rule.marker, colors) }]} />
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={{ fontFamily: scriptTitleFont(lang, typography.cardHindi.fontFamily), fontSize: 14.5, color: colors.ink }}>
            {contentByLang(lang, item.rule.nameHi, item.rule.nameEn)}
          </Text>
          <Text numberOfLines={1} style={{ fontFamily: bodyFont, fontSize: 11.5, color: colors.inkMuted, marginTop: 1 }}>
            {meta}
          </Text>
        </View>
        <Text style={{ fontSize: 18, color: colors.inkMuted }}>›</Text>
      </View>
    </Pressable>
  );
}

function ObservanceCard({ item, daySolve, lang, colors, typography, radii, elevation, onOpenLink, onOpenKatha, onOpenVidhi, compact = false, inPanel = false, first = false }: {
  compact?: boolean;
  /** A row inside the day panel's व्रत और पर्व panel: no card of its own, a
   * hairline above every row but the first. */
  inPanel?: boolean;
  first?: boolean;
  item: ResolvedObservance;
  // This date's solved panchang, narrowed to what a day note can read (null
  // until the day's solve lands). Which rules read which field is
  // `observanceDayNote`'s business, not the card's.
  daySolve: ObservanceDaySolve | null;
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
  // A vrat is not a calendar box, so the card states what THIS day is for: the
  // moonrise that breaks a chandrodaya fast, the aparahna दर्श अमावस्या is fixed
  // by, the snan-daan morning of the udaya अमावस्या row. Pure helper, so the copy
  // and the day logic are test-pinned away from the render path.
  const dayNote = observanceDayNote(item.rule, daySolve, formatTime12);
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
    <View
      style={
        inPanel
          ? [styles.observanceRow, !first && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.divider }]
          : [styles.observanceCard, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.md }, elevation.card]
      }
    >
      <View style={styles.observanceTop}>
        <View style={[styles.categoryPill, { backgroundColor: item.rule.category === 'vrat' ? colors.goldTint : colors.saffronTint, borderRadius: radii.pill }]}>
          <Text style={{ fontFamily: lang === 'en' ? fontFamilies.interSemiBold : scriptBodyFont(lang, typography.cardHindi.fontFamily), fontSize: 10, color: colors.saffronDeep }}>
            {item.rule.category === 'vrat' ? contentByLang(lang, 'व्रत', 'Vrat') : contentByLang(lang, 'पर्व', 'Festival')}
          </Text>
        </View>
        {!compact && <Text style={{ fontFamily: lang === 'en' ? fontFamilies.latin : scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 12, color: colors.inkMuted }}>
          {contentByLang(lang, item.rule.deityHi, item.rule.deityEn)}
        </Text>}
      </View>
      {compact ? (
        <ObservanceTodaySummary rule={item.rule} titleHi={titleHi} titleEn={titleEn} lang={lang} />
      ) : (
        <>
          <Text style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 15, color: colors.ink }}>
            {contentByLang(lang, titleHi, titleEn)}
          </Text>
          <Text style={{ fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 12, lineHeight: 18, color: colors.inkMuted, marginTop: 4 }}>
            {meaningByLang(lang, item.rule.shortDescriptionHi, item.rule.shortDescriptionEn)}
          </Text>
        </>
      )}
      {dayNote && (
        <Text style={{ fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 12, lineHeight: 18, color: colors.saffronDeep, marginTop: 6 }}>
          {contentByLang(lang, dayNote.hi, dayNote.en)}
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

/**
 * The quiet-day doorway to the lens sheet (PRD-42 entry study, pattern B).
 *
 * Rendered ONLY where the day card would otherwise say "nothing falls on this
 * date", which is both where the space is free and the moment a user is most
 * likely to want more dates. Deliberately NOT dismissible: the dismissible seed
 * line was the original bridge and it disappears forever on one tap, leaving the
 * feature invisible from the segment that its own result lives on. Muted gold
 * register, no badge and no count, so it reads as part of the almanac rather than
 * as something being sold.
 */
function LensDiscoveryRow({
  lang,
  colors,
  typography,
  radii,
  availableCount,
  onPress,
}: {
  lang: Lang;
  colors: any;
  typography: any;
  radii: any;
  availableCount: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Add a regional calendar. ${availableCount} available`}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          minHeight: 48,
          marginTop: 10,
          marginBottom: 8,
          paddingVertical: 10,
          paddingHorizontal: 12,
          backgroundColor: colors.goldTint,
          borderWidth: 1,
          borderColor: colors.goldChipBg,
          borderRadius: radii.md,
        },
        pressed && { opacity: 0.8 },
      ]}
    >
      <Text style={{ fontSize: 15, color: colors.gold, marginRight: 10 }}>❖</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 13, color: colors.ink }}>
          {contentByLang(lang, 'क्षेत्रीय पंचांग जोड़ें', 'Add a regional calendar')}
        </Text>
        <Text style={{ fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 11, color: colors.inkMuted, marginTop: 2 }}>
          {contentByLang(
            lang,
            `अपने क्षेत्र या परंपरा की तिथियाँ · ${availableCount} उपलब्ध`,
            `Your region’s or tradition’s days · ${availableCount} available`
          )}
        </Text>
      </View>
      <Text style={{ fontSize: 18, color: colors.inkMuted }}>›</Text>
    </Pressable>
  );
}

/** One column of the ledger bar: glyph over label over one short line of state.
    Its own button, so each ledger keeps a full-height 48 dp target. */
function CatalogLedgerCell({
  lang, colors, typography, glyph, label, state, accessibilityLabel, onPress, divided,
}: {
  lang: Lang;
  colors: any;
  typography: any;
  glyph: string;
  label: string;
  state: string;
  accessibilityLabel: string;
  onPress: () => void;
  divided: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.ledgerCell,
        divided && { borderLeftWidth: 1, borderLeftColor: colors.divider },
        pressed && { opacity: 0.6 },
      ]}
    >
      <AppIcon name={glyph === "★" ? "star" : glyph === "॥" ? "remembrance" : "regional"} size={20} color={colors.iconInk} weight="duotone" />
      <Text
        style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 14, color: colors.ink, marginTop: 3 }}
      >
        {label}
      </Text>
      <Text style={{ ...captionFont(state), fontSize: 11, color: colors.saffronDeep, marginTop: 2 }}>
        {state}
      </Text>
    </Pressable>
  );
}

/** मेरा व्रत · पितृ स्मरण · क्षेत्र as ONE summary bar.
    These were three stacked full-width cards (~190 dp — roughly a third of the
    first fold), which pushed आगामी low and the श्रेणी grid off-screen entirely.
    Same three destinations and the same live state in ~72 dp: one card, three
    hairline-divided columns, each its own button. The state lines are compressed
    to what a ~106 dp column holds — a count, the soonest smaran date, and for
    क्षेत्र the FIRST calendar's name plus +N rather than a bare count, because a
    count still does not tell a user where their extra dates came from (§42).
    The accessibility labels stay full sentences: the compression is visual. */
function CatalogLedgerBar({
  lang, colors, typography, radii, elevation, followCount, lenses, lensAvailableCount,
  onOpenMyVrat, onOpenPitruSmaran, onOpenLenses,
}: {
  lang: Lang;
  colors: any;
  typography: any;
  radii: any;
  elevation: any;
  followCount: number;
  lenses: ReadonlySet<ObservanceLens>;
  /** Calendars this build offers; 0 collapses the bar to two columns. */
  lensAvailableCount: number;
  onOpenMyVrat: () => void;
  onOpenPitruSmaran: () => void;
  onOpenLenses: () => void;
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

  const vratState = followCount > 0
    ? contentByLang(lang, `${followCount} फ़ॉलो`, `${followCount} following`)
    : contentByLang(lang, 'जोड़ें', 'Add');

  const smaranState = entries.length === 0
    ? contentByLang(lang, 'जोड़ें', 'Add')
    : soonest
      ? contentByLang(lang, `अगला ${shortSmaranDate(soonest, lang)}`, `Next ${shortSmaranDate(soonest, lang)}`)
      : contentByLang(lang, `${entries.length} स्मरण`, `${entries.length} saved`);

  const lensNames = [...lenses]
    .map((id) => getLensDefinition(id))
    .filter((def): def is NonNullable<typeof def> => def != null)
    .map((def) => contentByLang(lang, def.nameHi, def.nameEn));
  // `सभी n` once every offered calendar is on — `जैन +1` would name one calendar
  // as if it were the choice, when the choice was "everything".
  const lensState = lensNames.length === 0
    ? contentByLang(lang, `${lensAvailableCount} उपलब्ध`, `${lensAvailableCount} available`)
    : lensNames.length === lensAvailableCount
      ? contentByLang(lang, `सभी ${lensAvailableCount}`, `All ${lensAvailableCount}`)
      : lensNames.length === 1
        ? lensNames[0]
        : `${lensNames[0]} +${lensNames.length - 1}`;

  return (
    <View
      style={[
        styles.ledgerBar,
        { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg },
        elevation.card,
      ]}
    >
      <CatalogLedgerCell
        lang={lang}
        colors={colors}
        typography={typography}
        glyph="★"
        label={contentByLang(lang, 'मेरा व्रत', 'My Vrat')}
        state={vratState}
        accessibilityLabel={followCount > 0 ? `My Vrat, ${followCount} following` : 'My Vrat'}
        onPress={onOpenMyVrat}
        divided={false}
      />
      <CatalogLedgerCell
        lang={lang}
        colors={colors}
        typography={typography}
        glyph="॥"
        label={contentByLang(lang, 'पितृ स्मरण', 'Pitru Smaran')}
        state={smaranState}
        accessibilityLabel={`Pitru Smaran. ${entries.length > 0 ? `${entries.length} entries` : 'Add remembrance dates'}`}
        onPress={onOpenPitruSmaran}
        divided
      />
      {/* No calendar with content ⇒ no column: a filter that can choose nothing
          is not a filter. Comes back by itself when the first lensed rule ships. */}
      {lensAvailableCount > 0 && (
        <CatalogLedgerCell
          lang={lang}
          colors={colors}
          typography={typography}
          glyph="❖"
          label={contentByLang(lang, 'क्षेत्र', 'Regional')}
          state={lensState}
          accessibilityLabel={
            lensNames.length === lensAvailableCount
              ? `Regional calendars, all ${lensAvailableCount} on`
              : lensNames.length > 0
                ? `Regional calendars, ${lensNames.length} on`
                : 'Regional calendars, none selected'
          }
          onPress={onOpenLenses}
          divided
        />
      )}
    </View>
  );
}

/**
 * आपके पंचांग से — what the active क्षेत्रीय पंचांग actually added (PRD-42 §4.1,
 * design.md §73).
 *
 * The additive contract puts a lensed day among the universal ones with nothing
 * marking it, so a user who turned जैन on and looked at the calendar saw "the same
 * list as before, plus a day they could not point to". This section is the
 * pointer: one group per active calendar, in registry order, each rule a row that
 * opens its detail with its next date beside it. A calendar that adds nothing in
 * this build says so in one muted line rather than vanishing — silence here would
 * read as "your tap did nothing", which is the report in the first place.
 *
 * Rendered only with at least one lens on: with none, the ledger column already
 * says `22 उपलब्ध` and there is nothing to list.
 */
function LensAdditionsSection({
  lang, today, calendarSystem, lenses, colors, typography, radii, elevation, onOpenDetail, onOpenLenses,
}: {
  lang: Lang;
  today: Date;
  calendarSystem: CalendarSystem;
  lenses: ReadonlySet<ObservanceLens>;
  colors: any;
  typography: any;
  radii: any;
  elevation: any;
  onOpenDetail: (ruleId: string) => void;
  onOpenLenses: () => void;
}) {
  const lensKey = serializeLenses(lenses);
  const groups = useMemo(
    () =>
      getLensAdditions(lenses).map((group) => ({
        ...group,
        def: getLensDefinition(group.lens),
        rules: group.rules.map((rule) => ({ rule, next: getNextOccurrence(rule.id, today, calendarSystem) })),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lensKey, today, calendarSystem]
  );
  if (groups.length === 0) return null;
  const addedCount = groups.reduce((sum, group) => sum + group.rules.length, 0);

  return (
    <View
      testID="lens-additions"
      style={[
        styles.additionsCard,
        { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.md },
        elevation.card,
      ]}
    >
      <View style={styles.additionsHead}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 14, color: colors.ink }}>
            {contentByLang(lang, 'आपके पंचांग से', 'From your calendars')}
          </Text>
          <Text style={{ fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 11, color: colors.inkMuted, marginTop: 2 }}>
            {addedCount === 0
              ? contentByLang(lang, 'चुने हुए पंचांग अभी कोई विशेष तिथि नहीं जोड़ते', 'Your chosen calendars add no dates of their own yet')
              : contentByLang(
                  lang,
                  `${addedCount} ${addedCount === 1 ? 'तिथि' : 'तिथियाँ'} जो केवल इन पंचांगों से आती ${addedCount === 1 ? 'है' : 'हैं'}`,
                  `${addedCount} ${addedCount === 1 ? 'observance' : 'observances'} that only these calendars bring`
                )}
          </Text>
        </View>
        <Pressable
          onPress={onOpenLenses}
          accessibilityRole="button"
          accessibilityLabel="Change regional calendars"
          hitSlop={8}
          style={({ pressed }) => [pressed && { opacity: 0.6 }]}
        >
          <Text style={{ fontFamily: fontFamilies.interSemiBold, fontSize: 12, color: colors.saffronDeep }}>
            {contentByLang(lang, 'बदलें', 'Change')}
          </Text>
        </Pressable>
      </View>
      {groups.map(({ lens, def, rules }) => (
        <View key={lens} style={{ marginTop: 8 }}>
          <Text
            style={{
              fontFamily: typography.subtitle.fontFamily,
              fontSize: 10,
              letterSpacing: 1,
              textTransform: 'uppercase',
              color: colors.inkMuted,
              marginBottom: 2,
            }}
          >
            {def ? contentByLang(lang, def.nameHi, def.nameEn) : lens}
          </Text>
          {rules.length === 0 ? (
            <Text style={{ fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 12, color: colors.inkMuted, paddingVertical: 6 }}>
              {contentByLang(lang, 'अभी कोई विशेष तिथि नहीं — आगामी अद्यतन में', 'No dates of its own yet — coming in a later update')}
            </Text>
          ) : (
            rules.map(({ rule, next }) => (
              <Pressable
                key={rule.id}
                onPress={() => onOpenDetail(rule.id)}
                accessibilityRole="button"
                accessibilityLabel={`${rule.nameEn}${next ? `, next ${formatShortDate(next.date, 'en')}` : ''}`}
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
                {next && (
                  <Text style={{ fontFamily: fontFamilies.interSemiBold, fontSize: 11, color: colors.saffronDeep, letterSpacing: 0.4, marginRight: 8 }}>
                    {formatShortDate(next.date, lang).toUpperCase()}
                  </Text>
                )}
                <Text style={{ fontSize: 18, color: colors.inkMuted }}>›</Text>
              </Pressable>
            ))
          )}
        </View>
      ))}
    </View>
  );
}

function CatalogLanding({
  lang, today, calendarSystem, query, onChangeQuery,
  colors, typography, radii, elevation,
  onOpenDetail, onOpenCategory, onOpenKathaLibrary, onOpenVidhiCatalog, onOpenMyVrat, followCount,
  onOpenPitruSmaran, onOpenLenses, lenses, lensAvailableCount,
  todaySolve, onOpenLink, onOpenKatha, onOpenVidhi,
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
  onOpenLenses: () => void;
  lenses: ReadonlySet<ObservanceLens>;
  lensAvailableCount: number;
  followCount: number;
  // Today's solve for the day note, or null when the calendar is on another day.
  todaySolve: ObservanceDaySolve | null;
  onOpenLink: (sectionId: string) => void;
  onOpenKatha: (kathaId: string) => void;
  onOpenVidhi: (vidhiId: string, dateMs: number) => void;
}) {
  const { isFollowing, follow, unfollow } = useVratFollows();
  const trimmed = query.trim();
  // Search stays lens-blind on purpose — see `searchObservances`.
  const results = useMemo(() => (trimmed ? searchObservances(trimmed) : []), [trimmed]);
  const lensKey = serializeLenses(lenses);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const upcomingWindow = useMemo(() => getUpcomingObservances(today, 12, calendarSystem, 150, undefined, lenses), [today, calendarSystem, lensKey]);
  // Today's observances are lifted out of the rail into their own आज card: an
  // item dated today sitting as one more "upcoming" chip is what today looks
  // like when nothing is in focus.
  const todayItems = useMemo(() => upcomingWindow.filter((o) => o.date.getTime() === today.getTime()), [upcomingWindow, today]);
  const upcoming = useMemo(() => upcomingWindow.filter((o) => o.date.getTime() !== today.getTime()).slice(0, 6), [upcomingWindow, today]);
  const counts = useMemo(() => getCategoryCounts(), []);
  const kathaCount = getKathaCount();

  const tileMeta: Record<BrowseCategory, { art: StoryIconName; hi: string; en: string }> = {
    vrat: { art: 'vrat', hi: 'व्रत', en: 'Vrat' },
    festival: { art: 'aarti', hi: 'पर्व', en: 'Festivals' },
    upavas: { art: 'practice', hi: 'उपवास', en: 'Upvas' },
  };
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
                <View style={{ marginRight: 12 }}><ObservanceArtwork rule={rule} size={48} /></View>
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
          {/* Same occurrence names, day notes and reading actions as the calendar;
              the catalog opts into an illustrated, expandable introduction. */}
          {todayItems.length > 0 && (
            <View testID="catalog-today" style={{ marginBottom: 12 }}>
              <View style={styles.todayHead}>
                <Text style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 15, color: colors.ink }}>
                  {contentByLang(lang, 'आज', 'Today')}
                </Text>
                <Text style={{ fontFamily: fontFamilies.interSemiBold, fontSize: 10, color: colors.saffronDeep, letterSpacing: 0.4, marginLeft: 8 }}>
                  {formatShortDate(today, lang).toUpperCase()}
                </Text>
              </View>
              {todayItems.map((item) => (
                <ObservanceCard
                  compact
                  key={`today-${item.rule.id}`}
                  item={item}
                  daySolve={todaySolve}
                  lang={lang}
                  colors={colors}
                  typography={typography}
                  radii={radii}
                  elevation={elevation}
                  onOpenLink={onOpenLink}
                  onOpenKatha={onOpenKatha}
                  onOpenVidhi={onOpenVidhi}
                />
              ))}
            </View>
          )}
          {/* The personal ledgers — one bar, three columns. See CatalogLedgerBar. */}
          <CatalogLedgerBar
            lang={lang}
            colors={colors}
            typography={typography}
            radii={radii}
            elevation={elevation}
            followCount={followCount}
            lenses={lenses}
            lensAvailableCount={lensAvailableCount}
            onOpenMyVrat={onOpenMyVrat}
            onOpenPitruSmaran={onOpenPitruSmaran}
            onOpenLenses={onOpenLenses}
          />
          {/* What the active calendars added — the answer the ledger column's
              `जैन` alone cannot give. Nothing rendered with no lens on. */}
          <LensAdditionsSection
            lang={lang}
            today={today}
            calendarSystem={calendarSystem}
            lenses={lenses}
            colors={colors}
            typography={typography}
            radii={radii}
            elevation={elevation}
            onOpenDetail={onOpenDetail}
            onOpenLenses={onOpenLenses}
          />
          {upcoming.length > 0 && (
            <View style={{ marginTop: 14 }}>
              <Text style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 14, color: colors.ink, marginBottom: 8 }}>
                {contentByLang(lang, 'आगामी', 'Upcoming')}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 8 }}>
                {upcoming.map((item) => (
                  <ObservancePreviewCard
                    key={`${item.rule.id}-${item.date.toDateString()}`}
                    layout="tile"
                    rule={item.rule}
                    lang={lang}
                    dateLabel={formatShortDate(item.date, lang)}
                    countdown={observanceCountdown(item.date, today, lang)}
                    following={isFollowing(item.rule.id)}
                    onToggleFollow={() => isFollowing(item.rule.id) ? unfollow(item.rule.id) : follow(item.rule.id)}
                    onPress={() => onOpenDetail(item.rule.id)}
                  />
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
                      <StoryIcon name={meta.art} size={42} />
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
                  <StoryIcon name="granth" size={42} />
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
                  <StoryIcon name="vrat" size={42} />
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

// The scroll's top padding; the Panchang sky adds it to the status-bar inset so
// the mode switch sits at one height in every mode.
const SCROLL_TOP = 8;

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingTop: SCROLL_TOP, paddingBottom: 24 },
  // Full-bleed: undo the scroll's 14 pt side padding; the sky pads its controls back in.
  skyBleed: { marginHorizontal: -14 },
  skyDateRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10 },
  skyChevron: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  skyDateBlock: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  skyTodayButton: { alignSelf: 'center', minWidth: 52, height: 30, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, marginTop: 4 },
  skyChipRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  skyChipGroup: { flexDirection: 'row', alignItems: 'center', flexShrink: 1, borderWidth: 1, padding: 3 },
  // Inside the group the chip drops its own pill; the group draws it.
  skyLocation: { borderWidth: 0, paddingVertical: 0, minHeight: 34 },
  skyChipDivider: { width: 1, height: 20, marginHorizontal: 2 },
  skyChipActions: { flexDirection: 'row', gap: 8, marginLeft: 'auto' },
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
  ledgerBar: { flexDirection: 'row', alignItems: 'stretch', borderWidth: 1, paddingVertical: 12, paddingHorizontal: 4, marginTop: 12 },
  ledgerCell: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  segmented: { flexDirection: 'row', padding: 3, borderWidth: 1, marginTop: 10 },
  segmentOption: { flex: 1, minHeight: 38, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  jyotishHero: { borderWidth: 1, padding: 16, marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 13 },
  jyotishHeroIcon: { width: 58, height: 58, alignItems: 'center', justifyContent: 'center' },
  jyotishIntro: { paddingHorizontal: 1, paddingTop: 12, paddingBottom: 5 },
  // The §51c intro block used to supply this gap; without it the switcher label
  // sat flush under the segmented control, closer to it than to its own chips.
  jyotishSavedLanding: { paddingTop: 18 },
  jyotishSectionLabel: { fontSize: 10, marginTop: 18, marginBottom: 8 },
  jyotishPractice: { minHeight: 72, borderWidth: 1, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  jyotishPracticeGlyph: { fontFamily: fontFamilies.devanagariBold, fontSize: 24 },
  jyotishMicroNote: { marginHorizontal: 4, marginTop: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 9 },
  jyotishInfoMark: { width: 18, height: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  jyotishInfoText: { fontFamily: fontFamilies.interSemiBold, fontSize: 10 },
  jyotishGuidanceBlock: { borderWidth: 1, overflow: 'hidden' },
  jyotishGuidanceHead: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', alignItems: 'center', gap: 10 },
  jyotishTranslation: { fontFamily: fontFamilies.inter, fontSize: 10 },
  jyotishSharePill: { minHeight: 38, paddingHorizontal: 11, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  jyotishShareText: { fontFamily: fontFamilies.interSemiBold, fontSize: 10 },
  jyotishGuidanceFooter: { paddingHorizontal: 13, paddingVertical: 11, alignItems: 'flex-end' },
  jyotishInlineLink: { fontFamily: fontFamilies.interSemiBold, fontSize: 10 },
  // The 2x2 door grid (design.md 51c) — it replaced the stacked tool cards AND
  // the chart-glance fact grid. Wrapping keeps the 3-tile state (the error
  // branch) honest as 2 + 1 rather than forcing a fixed 2x2.
  jyotishTileGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  prashnaDoor: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 13, borderWidth: 1, marginBottom: 8, minHeight: 64 },
  prashnaNew: { fontFamily: fontFamilies.interSemiBold, fontSize: 10, letterSpacing: 0.8 },
  resultRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth },
  // आपके पंचांग से — same card register as the upcoming cards and the tiles.
  additionsCard: { marginTop: 12, borderWidth: 1, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 6 },
  additionsHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  // Catalog artwork cards live in ObservancePreviewCard; their height follows text.
  todayHead: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 8 },
  tileGrid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: '4%', rowGap: 12 },
  // Explicit two-column width keeps the paired rows stable. The odd final tile
  // lives in its own row below so ScrollView measures it on every renderer.
  // Painted subjects and wrapping text retain a two-column grid on narrow screens.
  tile: { width: '48%', minHeight: 80, borderWidth: 1, paddingVertical: 12, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  finalTileRow: { marginTop: 12 },
  finalTile: { width: '100%' },
  // The existing painted category subjects share a 44pt roundel.
  tileGlyph: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  tileInfo: { flex: 1, minWidth: 0 },
  systemToggle: {
    flexDirection: 'row',
    alignSelf: 'center',
    padding: 3,
    borderWidth: 1,
  },
  systemToggleBare: { borderWidth: 0, padding: 0 },
  systemOption: {
    minWidth: 54,
    minHeight: 34,
    paddingHorizontal: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarCard: { borderWidth: 1, padding: 10, marginTop: 10 },
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
  dateTagText: { fontSize: 10, lineHeight: 15 },
  // व्रत और पर्व / आगामी panels sit a step further from the day's readings.
  sectionPanel: { marginTop: 16, paddingBottom: 8 },
  observanceCard: { borderWidth: 1, padding: 10, marginBottom: 8 },
  observanceRow: { paddingVertical: 10 },
  observanceTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 },
  categoryPill: { paddingHorizontal: 9, paddingVertical: 4 },
  linkButton: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7, marginTop: 8 },
  linkRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  kathaButton: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 7, marginTop: 8 },
  upcomingRow: { flexDirection: 'row', alignItems: 'stretch', minHeight: 48 },
  upcomingDate: { width: 40, alignItems: 'center', paddingTop: 8 },
  upcomingMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, marginLeft: 6 },
  upcomingDot: { width: 7, height: 7, borderRadius: 3.5 },
});
