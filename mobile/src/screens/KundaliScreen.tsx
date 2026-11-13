import AppIcon from '@/components/AppIcon';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  InteractionManager,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import CalendarDatePicker from '@/components/CalendarDatePicker';
import ClockTimePicker from '@/components/ClockTimePicker';
import KundaliOverview from '@/components/KundaliOverview';
import TextField from '@/components/TextField';
import GrahaUpayPanel from '@/components/GrahaUpayPanel';
import JyotishPracticeCard from '@/components/JyotishPracticeCard';
import JyotishShareCard from '@/components/JyotishShareCard';
import JyotishShareSheet from '@/components/JyotishShareSheet';
import JyotishStateCard from '@/components/JyotishStateCard';
import { KundaliExplorer } from '@/components/KundaliLearning';
import KundaliArtwork from '@/components/KundaliArtwork';
import { useFontScale } from '@/contexts/FontScaleContext';
import { useGitaLanguage, type Lang } from '@/data/gita/language';
import { GRAHA_BEEJ_JAPA_ID } from '@/data/japam/grahaBeej';
import { library } from '@/data/texts';
import { buildEntryStartTarget } from '@/navigation/entryRoutes';
import type { PanchangStackParamList } from '@/navigation/types';
import { buildDashaPractice } from '@/panchang/dashaPractice';
import { buildDashaReading } from '@/panchang/dashaReading';
import {
  DASHA_YEARS,
  GRAHA_NAMES_EN,
  GRAHA_NAMES_HI,
  getCurrentDasha,
  RASHI_NAMES_EN,
  RASHI_NAMES_HI,
  RASHI_NAMES_WESTERN,
  type Graha,
  type KundaliChart,
  type KundaliResultTab,
} from '@/panchang/kundali';
import {
  pincodeCityId,
  toDevanagariDigits,
  warmPincodeTable,
  warmPlaceIndex,
  type PincodeEntry,
} from '@/panchang/pincodes';
import {
  buildLocationSearchRows,
  labelIsPlace,
  locationSearchRowKey,
  placesSummary,
} from '@/panchang/locationSearch';
import {
  MAX_PEOPLE,
  birthCity,
  birthPlaceFromPincode,
  useKundali,
  validateBirthProfile,
  type BirthPlace,
  type BirthProfile,
  type BirthProfileErrors,
} from '@/panchang/useKundali';
import PersonChips from '@/components/PersonChips';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { pillTextStyle, scriptBodyFont, scriptTitleFont } from '@/utils/langType';

type Props = NativeStackScreenProps<PanchangStackParamList, 'Kundali'>;

const RESULT_TABS: { id: KundaliResultTab; hi: string; en: string }[] = [
  { id: 'overview', hi: 'सार', en: 'Overview' },
  { id: 'chart', hi: 'कुंडली', en: 'Chart' },
  { id: 'grahas', hi: 'ग्रह', en: 'Grahas' },
  { id: 'dasha', hi: 'दशा', en: 'Dasha' },
];

const EMPTY_PROFILE: BirthProfile = {
  date: '',
  time: '',
  cityId: '',
};

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
const DEFAULT_BIRTH_TIME = '06:00';

function formatPeriodDate(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatBirthDate(value: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'UTC',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00.000Z`));
}

function formatBirthTime(value: string): string {
  const [hour, minute] = value.split(':').map(Number);
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function formatDuration(milliseconds: number, roundUp = false): string {
  const round = roundUp ? Math.ceil : Math.floor;
  const totalMonths = Math.max(0, round(milliseconds / (365.2425 / 12 * 86_400_000)));
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  if (years && months) return `${years} y ${months} m`;
  if (years) return `${years} y`;
  // Antardashas are as short as ~3.6 months, so their edges need day
  // granularity — "0 m elapsed" would read as a stopped clock.
  if (!months) return `${Math.max(0, round(milliseconds / 86_400_000))} d`;
  return `${months} m`;
}

function devotionalTarget(sourceId: string) {
  const entry = library.find((candidate) => candidate.id === sourceId);
  return entry ? buildEntryStartTarget(entry) : null;
}

export default function KundaliScreen({ navigation, route }: Props) {
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const rootNav = useNavigation<any>();
  const {
    profile,
    chart,
    hydrated,
    loadState,
    people,
    activeId,
    canAddPerson,
    saveProfile,
    clearProfile,
    selectPerson,
    addPerson,
  } = useKundali();
  const [draft, setDraft] = useState<BirthProfile>(EMPTY_PROFILE);
  const [errors, setErrors] = useState<BirthProfileErrors>({});
  const [editing, setEditing] = useState(true);
  // A SECOND, additive mode beside `editing`: entering a new person must not
  // write over the person currently on screen, so the create form is its own
  // state rather than "edit with the fields blanked".
  const [creating, setCreating] = useState(route.params?.newPerson === true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [activeTab, setActiveTab] = useState<KundaliResultTab>('overview');
  const [cityPickerVisible, setCityPickerVisible] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);
  const openInEditMode = useRef(route.params?.editing === true);
  const contentScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!hydrated) return;
    // While creating, the draft belongs to nobody yet — the active person's
    // details must not be copied into it.
    if (creating) return;
    if (profile) {
      setDraft(profile);
      setEditing(openInEditMode.current);
      openInEditMode.current = false;
    } else if (loadState === 'guest') {
      setEditing(true);
    } else if (loadState === 'error') {
      setEditing(false);
    }
  }, [creating, hydrated, loadState, profile]);

  useEffect(() => {
    if (!hydrated || editing || !chart) return;
    contentScrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [activeTab, chart, editing, hydrated]);

  const handleGenerate = async () => {
    Keyboard.dismiss();
    const nextErrors = validateBirthProfile(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setSaveError('');
    setSaving(true);
    try {
      if (creating) {
        const added = await addPerson(draft);
        // At the cap the roster refuses the add; say so instead of quietly
        // dropping the details the user just entered.
        if (!added) {
          setSaveError(
            contentByLang(
              lang,
              `${MAX_PEOPLE} लोग तक सहेजे जा सकते हैं। नया जोड़ने के लिए किसी को हटाएँ।`,
              `Up to ${MAX_PEOPLE} people can be saved. Remove someone to add another.`
            )
          );
          return;
        }
        setCreating(false);
      } else {
        await saveProfile(draft);
      }
      setActiveTab('overview');
      setEditing(false);
    } catch {
      setSaveError(
        contentByLang(
          lang,
          'जन्म विवरण सुरक्षित नहीं हो सके। कृपया फिर प्रयास करें।',
          'Birth details could not be saved. Please try again.'
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const openPractice = (sourceId = 'navagraha-stotram') => {
    const target = devotionalTarget(sourceId);
    if (target) rootNav.navigate('HomeTab', target);
  };

  const handleTabChange = (tab: KundaliResultTab) => {
    setActiveTab(tab);
  };

  const beginNewPerson = () => {
    Keyboard.dismiss();
    setCreating(true);
    setEditing(false);
    setDraft(EMPTY_PROFILE);
    setErrors({});
    setSaveError('');
  };

  const cancelNewPerson = () => {
    setCreating(false);
    setDraft(profile ?? EMPTY_PROFILE);
    setErrors({});
    setSaveError('');
  };

  const handleSelectPerson = async (id: string) => {
    if (id === activeId && !creating) return;
    setCreating(false);
    setErrors({});
    setSaveError('');
    setActiveTab('overview');
    setEditing(false);
    try {
      await selectPerson(id);
    } catch {
      setSaveError(
        contentByLang(
          lang,
          'व्यक्ति नहीं बदला जा सका। कृपया फिर प्रयास करें।',
          'The person could not be switched. Please try again.'
        )
      );
    }
  };

  const startOver = async () => {
    // Removing one of several people returns to the NEXT person's chart; only
    // removing the last one empties the screen back to the blank form.
    const wasLast = people.length <= 1;
    try {
      await clearProfile();
      setActiveTab('overview');
      setSaveError('');
      setCreating(false);
      if (wasLast) {
        setDraft(EMPTY_PROFILE);
        setEditing(true);
      } else {
        setEditing(false);
      }
    } catch {
      setSaveError(
        contentByLang(
          lang,
          'सुरक्षित विवरण हट नहीं सके। कृपया फिर प्रयास करें।',
          'Saved details could not be removed. Please try again.'
        )
      );
    }
  };

  // Removal is one tap from a form that also holds Save, and it cannot be
  // undone — so it names whose details go before anything is deleted.
  const confirmRemove = () => {
    const name = profile?.name?.trim();
    Alert.alert(
      name
        ? contentByLang(lang, `${name} के जन्म विवरण हटाएँ?`, `Remove ${name}'s birth details?`)
        : contentByLang(lang, 'जन्म विवरण हटाएँ?', 'Remove these birth details?'),
      contentByLang(
        lang,
        'इनकी कुंडली और जन्म तिथि इस फ़ोन से हट जाएँगी। यह वापस नहीं होगा।',
        'Their Kundali and Janma Tithi will be removed from this phone. This cannot be undone.'
      ),
      [
        { text: contentByLang(lang, 'रहने दें', 'Keep'), style: 'cancel' },
        {
          text: contentByLang(lang, 'हटाएँ', 'Remove'),
          style: 'destructive',
          onPress: () => {
            void startOver();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={[styles.topBar, { paddingHorizontal: spacing.xxl }]}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={12}
            style={({ pressed }) => [
              styles.backButton,
              { borderColor: colors.divider, backgroundColor: colors.parchmentSoft },
              pressed && { opacity: 0.6 },
            ]}
          >
            <Text style={{ color: colors.inkSoft, fontSize: 20 }}>‹</Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: colors.ink,
                fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
                fontSize: 18,
              }}
            >
              {contentByLang(lang, 'जन्म कुंडली', 'Birth Kundali')}
            </Text>
            <Text style={[styles.caption, { color: colors.inkMuted }]}>
              {contentByLang(lang, 'लाहिरी · पूर्ण राशि भाव · IST', 'Lahiri · Whole-sign houses · IST')}
            </Text>
          </View>
          {chart && profile && !editing && !creating ? (
            <View style={styles.headerActions}>
              <Pressable
                onPress={() => setShareVisible(true)}
                accessibilityRole="button"
                accessibilityLabel="Share your Kundali"
                style={({ pressed }) => [
                  styles.sharePill,
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
                <Text style={[styles.shareText, { color: colors.saffronDeep }]}>{contentByLang(lang, 'साझा करें', 'Share')}</Text>
              </View>
              </Pressable>
              <Pressable
                onPress={() => setEditing(true)}
                accessibilityRole="button"
                accessibilityLabel="Edit birth details"
                hitSlop={10}
              >
                <Text style={[styles.actionText, { color: colors.saffronDeep }]}>
                  {contentByLang(lang, 'बदलें', 'Edit')}
                </Text>
              </Pressable>
            </View>
          ) : (
            <View style={{ width: 36 }} />
          )}
        </View>

        {!hydrated ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.saffron} />
          </View>
        ) : (
          <ScrollView
            ref={contentScrollRef}
            contentContainerStyle={[
              styles.scroll,
              { paddingHorizontal: spacing.xxl, paddingBottom: spacing.xxl * 2 },
            ]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
            {/* The switcher sits above every state, so who a chart belongs to is
                never a guess — and adding a second person is one tap from the
                first person's own chart (design.md §51a). */}
            <PersonChips
              people={people}
              activeId={creating ? null : activeId}
              lang={lang}
              onSelect={handleSelectPerson}
              onAdd={beginNewPerson}
              canAdd={canAddPerson}
              labelHi="किसकी कुंडली"
              labelEn="Whose chart"
              selectAccessibilityLabel={(label) => `Show Kundali for ${label}`}
              addAccessibilityLabel="Add another person"
              fullMessageHi={`${MAX_PEOPLE} लोग तक सहेजे जा सकते हैं। नया जोड़ने के लिए किसी को हटाएँ।`}
              fullMessageEn={`Up to ${MAX_PEOPLE} people can be saved. Remove someone to add another.`}
            />
            {loadState === 'error' && !editing ? (
              <JyotishStateCard
                kind="error"
                lang={lang}
                titleHi="कुंडली फिर नहीं बन सकी"
                titleEn="Your chart couldn’t be rebuilt"
                bodyHi="जन्म विवरण अधूरे हो सकते हैं। नई गणना के लिए उन्हें दोबारा भरें।"
                bodyEn="The saved birth details may be incomplete. Re-enter them for a fresh calculation."
                actionHi="जन्म विवरण फिर भरें"
                actionEn="Re-enter birth details"
                actionAccessibilityLabel="Re-enter birth details"
                onAction={startOver}
              />
            ) : creating || editing || !chart ? (
              <BirthInput
                draft={draft}
                errors={errors}
                saving={saving}
                saveError={saveError}
                lang={lang}
                creating={creating}
                onChange={setDraft}
                onChooseCity={() => {
                  Keyboard.dismiss();
                  setCityPickerVisible(true);
                }}
                onGenerate={handleGenerate}
                onCancel={creating ? cancelNewPerson : chart ? () => setEditing(false) : undefined}
                onDelete={!creating && profile ? confirmRemove : undefined}
                colors={colors}
                typography={typography}
                radii={radii}
                elevation={elevation}
              />
            ) : (
              <KundaliResult
                chart={chart}
                profile={profile!}
                activeTab={activeTab}
                lang={lang}
                onChangeTab={handleTabChange}
                onOpenPractice={() => openPractice()}
                onOpenJapa={openPractice}
                onManageDetails={() => setEditing(true)}
                onOpenReport={() => navigation.navigate('KundaliReport')}
                onOpenGrahaReference={(focusGraha) => navigation.navigate('GrahaReference', focusGraha ? { focusGraha } : undefined)}
                colors={colors}
                typography={typography}
                radii={radii}
                elevation={elevation}
              />
            )}
          </ScrollView>
        )}
      </SafeAreaView>
      <CityPicker
        visible={cityPickerVisible}
        selected={draft}
        lang={lang}
        onSelect={({ cityId, place }) => {
          Keyboard.dismiss();
          setDraft((current) => ({ ...current, cityId, place }));
          setErrors((current) => ({ ...current, cityId: undefined }));
          setCityPickerVisible(false);
        }}
        onClose={() => {
          Keyboard.dismiss();
          setCityPickerVisible(false);
        }}
      />
      {chart && profile && (
        <JyotishShareSheet
          visible={shareVisible}
          lang={lang}
          titleHi="अपनी कुंडली साझा करें"
          titleEn="Share your Kundali"
          captionHi="जन्म कुंडली"
          captionEn="Kundali"
          privacyHi="इस कार्ड में नाम, जन्म तिथि, समय और नगर शामिल हैं। साझा करने से पहले जाँच लें।"
          privacyEn="This card includes the chart name, birth date, time, and city. Review it before sharing."
          onClose={() => setShareVisible(false)}
          renderCard={(width) => (
            <JyotishShareCard
              kind="kundali"
              width={width}
              lang={lang}
              chart={chart}
              profile={profile}
              city={birthCity(profile)!}
            />
          )}
        />
      )}
    </View>
  );
}

function BirthInput({
  draft,
  errors,
  saving,
  saveError,
  lang,
  creating = false,
  onChange,
  onChooseCity,
  onGenerate,
  onCancel,
  onDelete,
  colors,
  typography,
  radii,
  elevation,
}: {
  draft: BirthProfile;
  errors: BirthProfileErrors;
  saving: boolean;
  saveError: string;
  lang: Lang;
  /** Adding a person beside the existing ones, not editing the current one. */
  creating?: boolean;
  onChange: (profile: BirthProfile) => void;
  onChooseCity: () => void;
  onGenerate: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
  colors: any;
  typography: any;
  radii: any;
  elevation: any;
}) {
  const city = birthCity(draft);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const timeKnownValid = TIME_PATTERN.test(draft.time);
  const openDate = () => {
    Keyboard.dismiss();
    setDatePickerVisible(true);
  };
  const openTime = () => {
    Keyboard.dismiss();
    if (!timeKnownValid) {
      onChange({ ...draft, time: DEFAULT_BIRTH_TIME });
      setTimeOpen(true);
      return;
    }
    setTimeOpen((open) => !open);
  };
  return (
    <>
      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: colors.cardActiveFrom,
            borderColor: colors.cardActiveBorder,
            borderRadius: radii.lg,
          },
          elevation.card,
        ]}
      >
        <Text
          style={{
            color: colors.ink,
            fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
            fontSize: 21,
          }}
        >
          {creating
            ? contentByLang(lang, 'नई कुंडली जोड़ें', 'Add another Kundali')
            : contentByLang(lang, 'अपनी कुंडली बनाएँ', 'Create your Kundali')}
        </Text>
        <Text
          style={{
            color: colors.inkMuted,
            fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
            fontSize: 13,
            lineHeight: 20,
            marginTop: 7,
          }}
        >
          {creating
            ? meaningByLang(
              lang,
              'पहले सहेजी कुंडलियाँ यथावत रहेंगी। नाम देने से बाद में चुनना आसान होता है।',
              'The charts you already saved stay as they are. A name makes switching easier later.'
            )
            : meaningByLang(
              lang,
              'सटीक समय से लग्न और भाव की गणना सबसे विश्वसनीय होती है।',
              'An exact time gives the most reliable Lagna and house calculation.'
            )}
        </Text>
      </View>

      <FieldLabel hi="नाम (वैकल्पिक)" en="Name (optional)" lang={lang} colors={colors} typography={typography} />
      <TextField
        variant="form"
        testID="kundali-name-input"
        accessibilityLabel="Birth name"
        value={draft.name ?? ''}
        onChangeText={(name) => onChange({ ...draft, name })}
        placeholder={creating ? 'Name' : 'Your name'}
        autoCapitalize="words"
      />

      <View style={styles.inputRow}>
        <View style={{ flex: 1 }}>
          <FieldLabel hi="जन्म तिथि" en="Birth date" lang={lang} colors={colors} typography={typography} />
          <Pressable
            testID="kundali-date-input"
            onPress={openDate}
            accessibilityRole="button"
            accessibilityLabel="Birth date"
            style={({ pressed }) => [
              styles.pickerField,
              { backgroundColor: colors.parchmentSoft, borderColor: errors.date ? colors.avoid : colors.divider, borderRadius: radii.md },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={{ color: draft.date ? colors.ink : colors.inkMuted, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 15 }}>
              {draft.date ? formatBirthDate(draft.date) : contentByLang(lang, 'तिथि', 'Select')}
            </Text>
            <Text style={{ color: colors.saffronDeep, fontSize: 16 }}>▾</Text>
          </Pressable>
          {errors.date && <Text style={[styles.error, { color: colors.avoidDeep }]}>{errors.date}</Text>}
        </View>
        <View style={{ flex: 0.82 }}>
          <FieldLabel hi="समय" en="Time" lang={lang} colors={colors} typography={typography} />
          <Pressable
            testID="kundali-time-input"
            onPress={openTime}
            accessibilityRole="button"
            accessibilityLabel="Birth time"
            style={({ pressed }) => [
              styles.pickerField,
              { backgroundColor: colors.parchmentSoft, borderColor: errors.time ? colors.avoid : colors.divider, borderRadius: radii.md },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={{ color: timeKnownValid ? colors.ink : colors.inkMuted, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 15 }}>
              {timeKnownValid ? formatBirthTime(draft.time) : contentByLang(lang, 'समय', 'Select')}
            </Text>
            <Text style={{ color: colors.saffronDeep, fontSize: 16 }}>{timeOpen ? '▴' : '▾'}</Text>
          </Pressable>
          {errors.time && <Text style={[styles.error, { color: colors.avoidDeep }]}>{errors.time}</Text>}
        </View>
      </View>
      {timeOpen && timeKnownValid && (
        <View style={styles.timePickerHost}>
          <ClockTimePicker value={draft.time} onChange={(time) => onChange({ ...draft, time })} label="Birth time" />
        </View>
      )}
      <CalendarDatePicker
        visible={datePickerVisible}
        value={draft.date}
        lang={lang}
        onSelect={(date) => onChange({ ...draft, date })}
        onClose={() => setDatePickerVisible(false)}
      />

      <FieldLabel hi="जन्म नगर" en="Birth city" lang={lang} colors={colors} typography={typography} />
      <Pressable
        testID="kundali-city-button"
        onPress={onChooseCity}
        accessibilityRole="button"
        accessibilityLabel={`Birth city, ${city?.nameEn ?? 'not selected'}`}
        style={({ pressed }) => [
          styles.cityButton,
          {
            backgroundColor: colors.parchmentSoft,
            borderColor: errors.cityId ? colors.avoid : colors.divider,
            borderRadius: radii.md,
          },
          pressed && { opacity: 0.7 },
        ]}
      >
        <View>
          <Text
            style={{
              color: city ? colors.ink : colors.inkMuted,
              fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
              fontSize: 15,
            }}
          >
            {city
              ? contentByLang(lang, city.nameHi, city.nameEn)
              : contentByLang(lang, 'भारत का जन्म नगर चुनें', 'Choose an Indian city')}
          </Text>
          {city && (
            <Text style={[styles.caption, { color: colors.inkMuted }]}>
              {city.nameEn} · IST (UTC+5:30)
            </Text>
          )}
        </View>
        <Text style={{ color: colors.saffronDeep, fontSize: 18 }}>⌄</Text>
      </Pressable>
      {errors.cityId && (
        <Text style={[styles.error, { color: colors.avoidDeep }]}>{errors.cityId}</Text>
      )}

      <View
        style={[
          styles.note,
          { backgroundColor: colors.goldTint, borderColor: colors.divider, borderRadius: radii.md },
        ]}
      >
        <Text style={[styles.noteMark, { color: colors.gold }]}>i</Text>
        <Text
          style={{
            flex: 1,
            color: colors.inkSoft,
            fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
            fontSize: 12,
            lineHeight: 18,
          }}
        >
          {meaningByLang(
            lang,
            'कुंडली की गणना अभी भारत के जन्म स्थानों के लिए उपलब्ध है। चुने हुए स्थान का स्थानीय समय भरें (IST, UTC+5:30)।',
            'Birth-chart calculation currently supports birth places in India. Enter the local time at the selected place (IST, UTC+5:30).'
          )}
        </Text>
      </View>

      <Pressable
        testID="kundali-generate-button"
        onPress={onGenerate}
        disabled={saving}
        accessibilityRole="button"
        accessibilityLabel="Generate Kundali"
        style={({ pressed }) => [
          styles.primaryButton,
          { backgroundColor: colors.saffronDeep, borderRadius: radii.pill },
          (pressed || saving) && { opacity: 0.72 },
        ]}
      >
        {saving ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <Text style={[styles.primaryButtonText, { color: colors.onPrimary }]}>
            {contentByLang(lang, 'कुंडली बनाएँ', 'Generate Kundali')}
          </Text>
        )}
      </Pressable>
      {!!saveError && (
        <Text
          accessibilityRole="alert"
          style={[styles.saveError, { color: colors.avoidDeep }]}
        >
          {saveError}
        </Text>
      )}
      {onCancel && (
        <Pressable
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel="Cancel editing"
          style={styles.secondaryAction}
        >
          <Text style={[styles.actionText, { color: colors.saffronDeep }]}>
            {contentByLang(lang, 'रद्द करें', 'Cancel')}
          </Text>
        </Pressable>
      )}
      {onDelete && (
        <Pressable
          onPress={onDelete}
          accessibilityRole="button"
          accessibilityLabel="Remove saved birth details"
          style={styles.secondaryAction}
        >
          <Text style={[styles.actionText, { color: colors.avoidDeep }]}>
            {contentByLang(lang, 'सुरक्षित जन्म विवरण हटाएँ', 'Remove saved birth details')}
          </Text>
        </Pressable>
      )}
    </>
  );
}

function FieldLabel({
  hi,
  en,
  lang,
  colors,
  typography,
}: {
  hi: string;
  en: string;
  lang: Lang;
  colors: any;
  typography: any;
}) {
  return (
    <Text
      style={{
        color: colors.inkSoft,
        fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
        fontSize: 12,
        marginTop: 14,
        marginBottom: 6,
      }}
    >
      {contentByLang(lang, hi, en)}
    </Text>
  );
}

function KundaliResult({
  chart,
  profile,
  activeTab,
  lang,
  onChangeTab,
  onOpenPractice,
  onOpenJapa,
  onManageDetails,
  onOpenReport,
  onOpenGrahaReference,
  colors,
  typography,
  radii,
  elevation,
}: {
  chart: KundaliChart;
  profile: BirthProfile;
  activeTab: KundaliResultTab;
  lang: Lang;
  onChangeTab: (tab: KundaliResultTab) => void;
  onOpenPractice: () => void;
  /** Opens a library entry by id — the Mahadasha lord's beej-mantra counter, or its upay paath. */
  onOpenJapa: (sourceId: string) => void;
  onManageDetails: () => void;
  onOpenReport: () => void;
  onOpenGrahaReference: (graha?: Graha) => void;
  colors: any;
  typography: any;
  radii: any;
  elevation: any;
}) {
  const { factor } = useFontScale();
  const { width, fontScale } = useWindowDimensions();
  const compact = width < 360 || factor > 1 || fontScale > 1.2;
  const resultStyles = useMemo(() => Object.fromEntries(Object.entries(styles).map(([key, value]) => {
    const item: Record<string, unknown> = { ...StyleSheet.flatten(value) };
    if ('fontSize' in item && typeof item.fontSize === 'number') item.fontSize *= factor;
    if ('lineHeight' in item && typeof item.lineHeight === 'number') item.lineHeight *= factor;
    if ('fontFamily' in item && lang !== 'en') {
      item.fontFamily = scriptBodyFont(lang, fontFamilies.devanagari);
      if ('letterSpacing' in item) item.letterSpacing = 0;
    }
    return [key, item];
  })) as typeof styles, [factor, lang]);
  const city = birthCity(profile)!;
  const now = new Date();
  const currentDasha = getCurrentDasha(chart, now);
  // Which timeline rows have their Mahadasha's upay open. The nine lords are
  // distinct within the 120-year cycle, so the lord names the row.
  const [openPractices, setOpenPractices] = useState<ReadonlySet<string>>(() => new Set());
  const togglePractice = (lord: string) => setOpenPractices((current) => {
    const next = new Set(current);
    if (next.has(lord)) next.delete(lord);
    else next.add(lord);
    return next;
  });
  // Both nested periods are running at once, so the card shows each one —
  // Mahadasha and Antardasha — with its own dates, progress bar and
  // elapsed/remaining readings; neither level speaks for the other. The
  // Antardasha entry is absent only when float accumulation in the engine
  // leaves `now` outside all nine sub-periods at a boundary.
  const currentWindows = currentDasha
    ? [
      { key: 'maha', labelHi: 'महादशा', labelEn: 'Mahadasha', period: currentDasha.maha },
      ...(currentDasha.antar
        ? [{ key: 'antar', labelHi: 'अन्तर्दशा', labelEn: 'Antardasha', period: currentDasha.antar }]
        : []),
    ]
    : [];
  return (
    <>
      <View
        style={[
          resultStyles.resultHeader,
          compact && { flexDirection: 'column', alignItems: 'stretch' },
          { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg },
          elevation.card,
        ]}
      >
        <View style={compact ? undefined : { flex: 1 }}>
          <Text
            accessibilityLabel="Kundali result"
            style={{
              color: colors.ink,
              fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
              fontSize: 20 * factor,
            }}
          >
            {profile.name || contentByLang(lang, 'जन्म कुंडली', 'Birth Kundali')}
          </Text>
          <Text style={[resultStyles.caption, { color: colors.inkMuted, marginTop: 4 }]}>
            {formatBirthDate(profile.date)} · {formatBirthTime(profile.time)} ·{' '}
            {contentByLang(lang, city.nameHi, city.nameEn)}
          </Text>
        </View>
        <View style={[resultStyles.lagnaPill, compact && { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, { backgroundColor: colors.saffronTint, borderRadius: radii.pill }]}>
          <Text style={[resultStyles.lagnaLabel, { color: colors.saffronDeep }]}>
            {contentByLang(lang, 'लग्न', 'Lagna')}
          </Text>
          <Text style={[resultStyles.lagnaValue, { color: colors.ink }]}>
            {contentByLang(
              lang,
              RASHI_NAMES_HI[chart.lagnaRashiIndex],
              RASHI_NAMES_EN[chart.lagnaRashiIndex]
            )}
          </Text>
          <Text style={[resultStyles.lagnaTranslation, { color: colors.inkMuted }]}>
            {lang === 'en'
              ? RASHI_NAMES_WESTERN[chart.lagnaRashiIndex]
              : RASHI_NAMES_EN[chart.lagnaRashiIndex]}
          </Text>
        </View>
      </View>

      <View
        accessibilityRole="tablist"
        style={[
          resultStyles.resultTabs,
          compact && { flexWrap: 'wrap', gap: 4 },
          { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: compact ? radii.lg : radii.pill },
        ]}
      >
        {RESULT_TABS.map((tab) => {
          const selected = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              testID={`kundali-tab-${tab.id}`}
              onPress={() => onChangeTab(tab.id)}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={`${tab.en} tab`}
              style={[
                resultStyles.resultTab,
                compact && { flexBasis: '48%', flexGrow: 1, flexShrink: 0 },
                selected && { backgroundColor: colors.saffronTint, borderRadius: radii.pill },
              ]}
            >
              <Text style={[resultStyles.resultTabText, { color: selected ? colors.saffronDeep : colors.inkMuted }]}>
                {contentByLang(lang, tab.hi, tab.en)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {activeTab === 'overview' && (
        <View>
          <KundaliOverview
            chart={chart}
            at={new Date()}
            onOpenTab={onChangeTab}
          />
          <Pressable
            onPress={onOpenReport}
            accessibilityRole="button"
            accessibilityLabel="Open full Kundali reading"
            style={({ pressed }) => [
              resultStyles.reportCta,
              {
                borderColor: colors.cardActiveBorder,
                backgroundColor: colors.cardActiveFrom,
                borderRadius: radii.lg,
              },
              pressed && { opacity: 0.72 },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: colors.ink,
                  fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
                  fontSize: 15 * factor,
                }}
              >
                {contentByLang(lang, 'पूर्ण कुंडली विवेचन', 'Full chart reading')}
              </Text>
              <Text
                style={{
                  color: colors.inkMuted,
                  fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
                  fontSize: 11 * factor,
                  lineHeight: 16 * factor,
                  marginTop: 3,
                }}
              >
                {meaningByLang(
                  lang,
                  'लग्न, चन्द्र, जीवन-क्षेत्र और दशा-क्रम — एक संकलित पाठ।',
                  'Lagna, Moon, life areas, and the dasha sequence — one compiled reading.'
                )}
              </Text>
            </View>
            <Text style={{ color: colors.saffronDeep, fontSize: 20 * factor }}>›</Text>
          </Pressable>
        </View>
      )}
      {(activeTab === 'chart' || activeTab === 'grahas') && (
        <KundaliExplorer key={activeTab} chart={chart} mode={activeTab} onReference={onOpenGrahaReference} />
      )}
      {activeTab === 'dasha' && (
        <View>
          <SectionIntro
            hi="विम्शोत्तरी दशा"
            en="Vimshottari Dasha"
            bodyHi="चन्द्र नक्षत्र से गणना की गई ग्रह-अवधियाँ। वर्तमान अवधि, उसकी प्रगति और आगे का क्रम देखें।"
            bodyEn="Planetary periods calculated from the Moon’s nakshatra. Explore the current period, its progress, and the timeline ahead."
            lang={lang}
            colors={colors}
            typography={typography}
          />
          {currentDasha && (
            <View
              accessible
              accessibilityLabel={[
                `Current Dasha, ${GRAHA_NAMES_EN[currentDasha.maha.lord]} Mahadasha`,
                currentDasha.antar
                  ? `${GRAHA_NAMES_EN[currentDasha.antar.lord]} Antardasha`
                  : null,
                ...currentWindows.map((window) =>
                  `${window.labelEn} ${formatPeriodDate(window.period.start)} to ${formatPeriodDate(window.period.end)}, ${formatDuration(now.getTime() - window.period.start.getTime())} elapsed, ${formatDuration(window.period.end.getTime() - now.getTime(), true)} left`),
              ]
                .filter(Boolean)
                .join(', ')}
              style={[
                resultStyles.currentDasha,
                {
                  backgroundColor: colors.goldTint,
                  borderColor: colors.cardActiveBorder,
                  borderRadius: radii.lg,
                },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <KundaliArtwork name={currentDasha.maha.lord} size={72} />
                {currentDasha.antar && <KundaliArtwork name={currentDasha.antar.lord} size={48} />}
              </View>
              <Text style={[resultStyles.eyebrowText, { color: colors.saffronDeep }]}>
                {contentByLang(lang, 'वर्तमान अवधि', 'CURRENT PERIOD')}
              </Text>
              <Text style={[resultStyles.currentDashaTitle, { color: colors.ink }]}>
                {contentByLang(
                  lang,
                  GRAHA_NAMES_HI[currentDasha.maha.lord],
                  GRAHA_NAMES_EN[currentDasha.maha.lord]
                )}{' '}
                {contentByLang(lang, 'महादशा', 'Mahadasha')}
                {currentDasha.antar
                  ? ` · ${contentByLang(
                    lang,
                    GRAHA_NAMES_HI[currentDasha.antar.lord],
                    GRAHA_NAMES_EN[currentDasha.antar.lord]
                  )} ${contentByLang(lang, 'अन्तर्दशा', 'Antardasha')}`
                  : ''}
              </Text>
              {currentWindows.map((window) => {
                const elapsed = now.getTime() - window.period.start.getTime();
                const remaining = window.period.end.getTime() - now.getTime();
                const progress = Math.max(
                  0,
                  Math.min(
                    1,
                    elapsed
                      / (window.period.end.getTime() - window.period.start.getTime())
                  )
                );
                return (
                  <View key={window.key} style={{ marginTop: window.key === 'maha' ? 4 : 10 }}>
                    <Text style={[resultStyles.caption, { color: colors.inkMuted }]}>
                      {contentByLang(lang, window.labelHi, window.labelEn)}{' '}
                      {formatPeriodDate(window.period.start)} — {formatPeriodDate(window.period.end)}
                    </Text>
                    <View
                      testID={`dasha-progress-${window.key}`}
                      accessibilityRole="progressbar"
                      accessibilityValue={{
                        min: 0,
                        max: 100,
                        now: Math.round(progress * 100),
                      }}
                      style={[
                        resultStyles.progressTrack,
                        { backgroundColor: colors.divider, borderRadius: radii.pill },
                      ]}
                    >
                      <View
                        style={[
                          resultStyles.progressFill,
                          {
                            width: `${progress * 100}%`,
                            backgroundColor: colors.saffron,
                            borderRadius: radii.pill,
                          },
                        ]}
                      />
                    </View>
                    <View testID={`dasha-progress-labels-${window.key}`} style={[resultStyles.progressCaptions, compact && { flexDirection: 'column', alignItems: 'flex-start' }]}>
                      <Text style={[resultStyles.progressCaption, { color: colors.inkMuted }]}>
                        {formatDuration(elapsed)} {contentByLang(lang, 'पूरे', 'elapsed')}
                      </Text>
                      <Text style={[resultStyles.progressCaption, { color: colors.inkMuted }]}>
                        {formatDuration(remaining, true)} {contentByLang(lang, 'शेष', 'left')}
                      </Text>
                    </View>
                  </View>
                );
              })}
              <Text style={[resultStyles.caption, { color: colors.inkMuted, marginTop: 10 }]}>
                {contentByLang(
                  lang,
                  'इस महादशा की नौ अन्तर्दशाएँ',
                  'The nine Antardashas within this Mahadasha'
                )}
              </Text>
              <View style={resultStyles.antarChips}>
                {currentDasha.maha.antardashas.map((antar) => {
                  const selected = antar === currentDasha.antar;
                  return (
                    <View
                      key={`${antar.lord}-${antar.start.toISOString()}`}
                      accessible
                      accessibilityLabel={`${GRAHA_NAMES_EN[antar.lord]}${selected ? ', Now' : ''}`}
                      style={[
                        resultStyles.antarChip,
                        {
                          borderColor: selected ? colors.saffron : colors.divider,
                          backgroundColor: selected
                            ? colors.saffronTint
                            : colors.parchmentSoft,
                          borderRadius: radii.pill,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          resultStyles.antarChipText,
                          { color: selected ? colors.saffronDeep : colors.inkMuted },
                        ]}
                      >
                        {contentByLang(
                          lang,
                          GRAHA_NAMES_HI[antar.lord],
                          GRAHA_NAMES_EN[antar.lord]
                        )}
                        {selected ? ` · ${contentByLang(lang, 'अब', 'Now')}` : ''}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
          {currentDasha && (() => {
            // The Mahadasha lord's beej mantra — its GRAHA_UPAY text — on the
            // japam counter. Outside the grouped card so it stays a button.
            const beej = library.find((entry) => entry.id === GRAHA_BEEJ_JAPA_ID[currentDasha.maha.lord]);
            if (!beej) return null;
            return (
              <Pressable
                testID="dasha-beej-japa"
                onPress={() => onOpenJapa(beej.id)}
                accessibilityRole="button"
                accessibilityLabel={`Chant ${beej.nameEn} on the mala, for the ${GRAHA_NAMES_EN[currentDasha.maha.lord]} Mahadasha`}
                style={({ pressed }) => [
                  resultStyles.beejJapaLink,
                  { borderColor: colors.cardActiveBorder, backgroundColor: colors.saffronTint, borderRadius: radii.pill },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={[resultStyles.beejJapaText, { color: colors.saffronDeep }]}>
                  {contentByLang(lang, `${beej.nameHi} · माला पर जप करें`, `${beej.nameEn} · Chant on the mala`)} ›
                </Text>
              </Pressable>
            );
          })()}
          {currentDasha && (() => {
            // What to do in this Mahadasha: the lord's own GRAHA_UPAY row
            // (RULEBOOK §14.3.5). Adults only — null for a minor, who keeps
            // the pill above and nothing instructive. The counter pill stays
            // above the card, so the panel offers the paath alone.
            const practice = buildDashaPractice(chart, currentDasha.maha, now);
            if (!practice) return null;
            return (
              <View
                testID="dasha-practice"
                style={[
                  resultStyles.dashaReading,
                  {
                    borderColor: colors.divider,
                    backgroundColor: colors.parchmentSoft,
                    borderRadius: radii.lg,
                  },
                ]}
              >
                <Text
                  style={[
                    pillTextStyle(lang, typography.sectionLabel),
                    { color: colors.saffronDeep, fontSize: 10 * factor },
                  ]}
                >
                  {contentByLang(lang, 'इस महादशा में क्या करें', 'What to do in this Mahadasha')}
                </Text>
                <Text
                  style={{
                    color: colors.ink,
                    fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
                    fontSize: 15 * factor,
                    marginTop: 4,
                  }}
                >
                  {contentByLang(lang, practice.titleHi, practice.titleEn)}
                </Text>
                <Text style={[resultStyles.dashaReadingBody, { color: colors.inkSoft, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily) }]}>
                  {meaningByLang(lang, practice.introHi, practice.introEn)}
                </Text>
                <GrahaUpayPanel
                  testID="dasha-practice-upay"
                  graha={practice.lord}
                  upay={practice.upay}
                  lang={lang}
                  onPractice={onOpenJapa}
                  showJapa={false}
                  scale={factor}
                  stacked={compact}
                />
                <Text style={[resultStyles.dashaReadingBody, { color: colors.inkMuted, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily) }]}>
                  {meaningByLang(lang, practice.noteHi, practice.noteEn)}
                </Text>
              </View>
            );
          })()}
          {(() => {
            const reading = buildDashaReading(chart, now);
            if (!reading) return null;
            return (
              <View
                accessible
                accessibilityLabel={`Dasha reading. ${reading.titleEn}. ${reading.themeEn} ${reading.placementEn}${reading.antarEn ? ` ${reading.antarEn}` : ''}`}
                style={[
                  resultStyles.dashaReading,
                  {
                    borderColor: colors.divider,
                    backgroundColor: colors.parchmentSoft,
                    borderRadius: radii.lg,
                  },
                ]}
              >
                <Text
                  style={[
                    pillTextStyle(lang, typography.sectionLabel),
                    { color: colors.saffronDeep, fontSize: 10 * factor },
                  ]}
                >
                  {contentByLang(lang, 'इस अवधि का पाठ', 'Reading this period')}
                </Text>
                <Text
                  style={{
                    color: colors.ink,
                    fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
                    fontSize: 15 * factor,
                    marginTop: 4,
                  }}
                >
                  {contentByLang(lang, reading.titleHi, reading.titleEn)}
                </Text>
                <Text style={[resultStyles.dashaReadingBody, { color: colors.inkSoft, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily) }]}>
                  {meaningByLang(lang, reading.themeHi, reading.themeEn)}
                </Text>
                <Text style={[resultStyles.dashaReadingBody, { color: colors.inkSoft, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily) }]}>
                  {meaningByLang(lang, reading.placementHi, reading.placementEn)}
                </Text>
                {reading.antarHi && reading.antarEn && (
                  <Text style={[resultStyles.dashaReadingBody, { color: colors.inkMuted, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily) }]}>
                    {meaningByLang(lang, reading.antarHi, reading.antarEn)}
                  </Text>
                )}
              </View>
            );
          })()}
          <Text
            style={[
              resultStyles.eyebrowText,
              { color: colors.saffronDeep, marginTop: 18, marginBottom: 8 },
            ]}
          >
            {contentByLang(lang, 'महादशा समयरेखा', 'MAHADASHA TIMELINE')}
          </Text>
          <View accessibilityLabel="Full Mahadasha timeline">
            {chart.vimshottari.map((period, index) => {
              const selected = period === currentDasha?.maha;
              const birthWithin =
                chart.input.date.getTime() >= period.start.getTime()
                && chart.input.date.getTime() < period.end.getTime();
              const durationLabel = birthWithin
                ? `${formatDuration(period.end.getTime() - chart.input.date.getTime(), true)} ${contentByLang(lang, 'जन्म पर शेष', 'left at birth')}`
                : `${DASHA_YEARS[period.lord]} ${contentByLang(lang, 'वर्ष', 'years')}`;
              // Each Mahadasha still ahead keeps its upay behind its own
              // toggle. The running one is the card above, so its row does not
              // repeat it, and a period that has ended asks for nothing now.
              const ended = period.end.getTime() <= now.getTime();
              const rowPractice = selected || ended ? null : buildDashaPractice(chart, period, now);
              const practiceOpen = openPractices.has(period.lord);
              return (
                <View
                  key={`${period.lord}-${period.start.toISOString()}`}
                  style={resultStyles.dashaRow}
                >
                  <View style={resultStyles.timelineRail}>
                    <View
                      style={[
                        resultStyles.timelineDot,
                        {
                          backgroundColor: selected
                            ? colors.saffron
                            : colors.divider,
                        },
                      ]}
                    />
                    {index < chart.vimshottari.length - 1 && (
                      <View
                        style={[
                          resultStyles.timelineLine,
                          { backgroundColor: colors.divider },
                        ]}
                      />
                    )}
                  </View>
                  <View
                    style={[
                      resultStyles.dashaCard,
                      {
                        borderColor: selected ? colors.saffron : colors.divider,
                        backgroundColor: selected
                          ? colors.cardActiveFrom
                          : colors.parchmentSoft,
                        borderRadius: radii.md,
                      },
                    ]}
                  >
                    <View style={resultStyles.dashaTitleRow}>
                      <Text style={[resultStyles.tablePrimary, { color: colors.ink }]}>
                        {contentByLang(
                          lang,
                          GRAHA_NAMES_HI[period.lord],
                          GRAHA_NAMES_EN[period.lord]
                        )}{' '}
                        {contentByLang(lang, 'महादशा', 'Mahadasha')}
                      </Text>
                      {selected && (
                        <View
                          style={[
                            resultStyles.nowTag,
                            {
                              backgroundColor: colors.saffronTint,
                              borderRadius: radii.pill,
                            },
                          ]}
                        >
                          <Text style={[resultStyles.nowTagText, { color: colors.saffronDeep }]}>
                            {contentByLang(lang, 'अब', 'Now')}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={[resultStyles.caption, { color: colors.inkMuted, marginTop: 3 }]}>
                      {formatPeriodDate(period.start)} — {formatPeriodDate(period.end)} ·{' '}
                      {durationLabel}
                    </Text>
                    {rowPractice && (
                      <Pressable
                        testID={`dasha-timeline-practice-${period.lord}`}
                        onPress={() => togglePractice(period.lord)}
                        accessibilityRole="button"
                        accessibilityLabel={`${practiceOpen ? 'Hide' : 'Show'} what to do in the ${GRAHA_NAMES_EN[period.lord]} Mahadasha`}
                        accessibilityState={{ expanded: practiceOpen }}
                        style={({ pressed }) => [resultStyles.timelinePracticeToggle, pressed && { opacity: 0.7 }]}
                      >
                        <Text style={[resultStyles.timelinePracticeText, { color: colors.saffronDeep }]}>
                          {practiceOpen
                            ? contentByLang(lang, 'उपाय छिपाएँ', 'Hide the upay')
                            : contentByLang(lang, 'इस महादशा में क्या करें', 'What to do in this Mahadasha')}{' '}
                          {practiceOpen ? '▴' : '▾'}
                        </Text>
                      </Pressable>
                    )}
                    {rowPractice && practiceOpen && (
                      <GrahaUpayPanel
                        testID={`dasha-timeline-upay-${period.lord}`}
                        graha={rowPractice.lord}
                        upay={rowPractice.upay}
                        lang={lang}
                        onPractice={onOpenJapa}
                        scale={factor}
                        stacked={compact}
                      />
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      <Text
        style={[
          pillTextStyle(lang, typography.sectionLabel),
          resultStyles.practiceLabel,
          { color: colors.inkMuted },
        ]}
      >
        {contentByLang(lang, 'साधना', 'Practice')}
      </Text>
      <JyotishPracticeCard onPress={onOpenPractice} />

      <Pressable
        testID="graha-reference-card"
        onPress={() => onOpenGrahaReference()}
        accessibilityRole="button"
        accessibilityLabel="Know the nine grahas"
        style={({ pressed }) => [
          resultStyles.referenceCard,
          { borderColor: colors.divider, backgroundColor: colors.parchmentSoft, borderRadius: radii.lg },
          pressed && { opacity: 0.72 },
        ]}
      >
        <Text style={[resultStyles.referenceGlyph, { color: colors.gold }]}>✦</Text>
        <View style={{ flex: 1 }}>
          <Text style={[pillTextStyle(lang, typography.sectionLabel), { color: colors.saffronDeep, fontSize: lang === 'en' ? 10 : 12 }]}>
            {contentByLang(lang, 'जानें', 'Learn')}
          </Text>
          <Text
            style={{
              color: colors.ink,
              fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
              fontSize: 15 * factor,
              marginTop: 2,
            }}
          >
            {contentByLang(lang, 'नवग्रह — परिचय', 'Know the nine grahas')}
          </Text>
          <Text
            style={{
              color: colors.inkMuted,
              fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
              fontSize: 11 * factor,
              marginTop: 2,
            }}
          >
            {contentByLang(lang, 'हर ग्रह किसका कारक है', 'What each graha stands for')}
          </Text>
        </View>
        <Text style={{ color: colors.saffron, fontSize: 18 * factor }}>›</Text>
      </Pressable>

      <Pressable
        onPress={onManageDetails}
        accessibilityRole="button"
        accessibilityLabel="Manage birth details"
        style={resultStyles.secondaryAction}
      >
        <Text style={[resultStyles.actionText, { color: colors.saffronDeep }]}>
          {contentByLang(lang, 'जन्म विवरण सँभालें', 'Manage birth details')}
        </Text>
      </Pressable>
    </>
  );
}

function SectionIntro({
  hi,
  en,
  bodyHi,
  bodyEn,
  lang,
  colors,
  typography,
}: {
  hi: string;
  en: string;
  bodyHi: string;
  bodyEn: string;
  lang: Lang;
  colors: any;
  typography: any;
}) {
  const { factor } = useFontScale();
  return (
    <View style={styles.sectionIntro}>
      <Text
        style={{
          color: colors.ink,
          fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
          fontSize: 18 * factor,
        }}
      >
        {contentByLang(lang, hi, en)}
      </Text>
      <Text
        style={{
          color: colors.inkMuted,
          fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
          fontSize: 12 * factor,
          lineHeight: 18 * factor,
          marginTop: 4,
        }}
      >
        {meaningByLang(lang, bodyHi, bodyEn)}
      </Text>
    </View>
  );
}

type BirthPlaceSelection = { cityId: string; place?: BirthPlace };

const DEVANAGARI = /[\u0900-\u097F]/;

/**
 * The birth-place sheet. Rows come from `buildLocationSearchRows` — the SAME search as
 * the Panchang location sheet — so a town, village or 6-digit pincode is findable here
 * too, not just the bundled city list. A city row stores its id; a pincode or town row
 * stores `pin-<pincode>` plus a self-describing `place` (`birthPlaceFromPincode`).
 */
function CityPicker({
  visible,
  selected,
  lang,
  onSelect,
  onClose,
}: {
  visible: boolean;
  selected: BirthPlaceSelection;
  lang: Lang;
  onSelect: (selection: BirthPlaceSelection) => void;
  onClose: () => void;
}) {
  const { colors, typography, spacing, radii } = useTheme();
  const [query, setQuery] = useState('');
  const rows = useMemo(() => buildLocationSearchRows(query), [query]);

  useEffect(() => {
    if (visible) setQuery('');
  }, [visible]);

  // Parse the pincode tables once the sheet is open, so the first pincode or town typed
  // resolves instantly; they stay off the launch path either way (lazy requires).
  useEffect(() => {
    if (!visible) return;
    const handle = InteractionManager.runAfterInteractions(() => {
      warmPincodeTable();
      warmPlaceIndex();
    });
    return () => handle.cancel();
  }, [visible]);

  const pickPincode = (entry: PincodeEntry, placeName?: string) => onSelect(birthPlaceFromPincode(entry, placeName));
  const rowStyle = ({ pressed }: { pressed: boolean }) => [
    styles.cityRow,
    { borderBottomColor: colors.divider, paddingHorizontal: spacing.xxl },
    pressed && { backgroundColor: colors.saffronTint },
  ];
  const messageStyle = {
    color: colors.inkMuted,
    fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
    fontSize: 12,
    lineHeight: 18,
    paddingHorizontal: spacing.xxl,
    paddingVertical: 12,
  };
  const check = <Text style={{ color: colors.saffronDeep, fontSize: 16 }}>✓</Text>;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      onDismiss={Keyboard.dismiss}
      accessibilityViewIsModal
    >
      <View style={[styles.modalBackdrop, { backgroundColor: colors.modalBackdrop }]}>
        <SafeAreaView
          edges={['bottom']}
          style={[
            styles.modalSheet,
            { backgroundColor: colors.parchment, borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg },
          ]}
        >
          <View style={[styles.modalHeader, { paddingHorizontal: spacing.xxl, borderBottomColor: colors.divider }]}>
            <Text
              style={{
                color: colors.ink,
                fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
                fontSize: 18,
                flex: 1,
                minWidth: 0,
              }}
            >
              {contentByLang(lang, 'जन्म नगर चुनें', 'Choose birth city')}
            </Text>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close city picker">
              <Text style={{ color: colors.saffronDeep, fontSize: 24 }}>×</Text>
            </Pressable>
          </View>
          <View style={{ paddingHorizontal: spacing.xxl }}>
            <TextField
              variant="form"
              testID="kundali-city-search"
              accessibilityLabel="Search birth city, village or pincode"
              value={query}
              onChangeText={setQuery}
              placeholder={contentByLang(lang, 'शहर, गाँव या पिनकोड खोजें…', 'Search city, village or pincode…')}
              style={styles.modalSearch}
            />
          </View>
          {/* FlatList, not a mapped ScrollView: the list is ~390 rows once the
              Rajasthan tehsils are in, and mounting all of them stalled the sheet. */}
          <FlatList
            data={rows}
            keyExtractor={locationSearchRowKey}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item: row }) => {
              if (row.kind === 'header') {
                return (
                  <Text
                    style={[
                      styles.groupHeader,
                      {
                        color: colors.inkMuted,
                        fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
                        paddingHorizontal: spacing.xxl,
                      },
                    ]}
                  >
                    {contentByLang(lang, row.hi, row.en)}
                  </Text>
                );
              }
              if (row.kind === 'pincode-missing') {
                return (
                  <Text style={messageStyle}>
                    {meaningByLang(
                      lang,
                      `पिनकोड ${toDevanagariDigits(row.query)} नहीं मिला — कृपया जाँचें, या सूची से निकटतम शहर चुनें।`,
                      `Pincode ${row.query} was not found — check the digits, or pick the nearest city from the list.`
                    )}
                  </Text>
                );
              }
              if (row.kind === 'no-match') {
                // The directory is Latin-only, so a Devanagari query that found no city
                // is told exactly that rather than left looking at an empty sheet.
                return (
                  <Text style={messageStyle}>
                    {DEVANAGARI.test(row.query)
                      ? meaningByLang(
                          lang,
                          'कस्बों व गाँवों के नाम अंग्रेज़ी अक्षरों में खोजें (जैसे “Shahupuri”), या पिनकोड लिखें।',
                          'Search towns and villages in English letters (e.g. “Shahupuri”), or type the pincode.'
                        )
                      : meaningByLang(
                          lang,
                          'यह स्थान नहीं मिला — वर्तनी जाँचें, निकट का कस्बा खोजें, या पिनकोड लिखें।',
                          'No place found — check the spelling, try a nearby town, or type the pincode.'
                        )}
                  </Text>
                );
              }
              if (row.kind === 'place') {
                const { place } = row;
                const { entry } = place;
                const isSelected =
                  selected.cityId === pincodeCityId(entry.pincode) && labelIsPlace(selected.place?.labelEn, place.name);
                return (
                  <Pressable
                    onPress={() => pickPincode(entry, place.name)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={`Select ${place.name}, ${entry.districtEn}, ${entry.stateEn}, pincode ${entry.pincode} birth place`}
                    style={rowStyle}
                  >
                    <View style={{ flex: 1 }}>
                      {/* Latin in every language: the post-office directory has no
                          Devanagari names, and guessing a spelling would be worse. */}
                      <Text numberOfLines={1} style={{ color: colors.ink, fontFamily: typography.meaning.fontFamily, fontSize: 15 }}>
                        {`${place.name} · ${entry.districtEn}`}
                      </Text>
                      <Text style={[styles.caption, { color: colors.inkMuted }]}>
                        {`${entry.pincode} · ${entry.stateEn}`}
                      </Text>
                    </View>
                    {isSelected && check}
                  </Pressable>
                );
              }
              if (row.kind === 'pincode') {
                const { entry } = row;
                const isSelected = selected.cityId === pincodeCityId(entry.pincode);
                const served = placesSummary(entry.pincode);
                const covers = served ? `${entry.districtEn} · ${served}` : entry.districtEn;
                return (
                  <Pressable
                    onPress={() => pickPincode(entry)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={`Select pincode ${entry.pincode}, ${covers}, ${entry.stateEn} birth place`}
                    style={rowStyle}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.ink, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 15 }}>
                        {contentByLang(lang, `${toDevanagariDigits(entry.pincode)} · ${entry.stateHi}`, `${entry.pincode} · ${entry.stateEn}`)}
                      </Text>
                      <Text style={[styles.caption, { color: colors.inkMuted }]}>{covers}</Text>
                    </View>
                    {isSelected && check}
                  </Pressable>
                );
              }
              const { city } = row;
              const isSelected = city.id === selected.cityId;
              return (
                <Pressable
                  onPress={() => onSelect({ cityId: city.id })}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`Select ${city.nameEn}${city.districtEn ? `, ${city.districtEn} district` : ''} birth city`}
                  style={rowStyle}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: colors.ink,
                        fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
                        fontSize: 15,
                      }}
                    >
                      {contentByLang(lang, city.nameHi, city.nameEn)}
                    </Text>
                    {/* Caption is a Latin face (§3.0), so it stays English-only. */}
                    <Text style={[styles.caption, { color: colors.inkMuted }]}>
                      {city.districtEn ? `${city.nameEn} · ${city.districtEn}` : city.nameEn}
                    </Text>
                  </View>
                  {isSelected && check}
                </Pressable>
              );
            }}
          />
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topBar: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 12 },
  // 44 to match the back control on every other screen (design.md §12). The 40
  // here was a local drift; the hitSlop already cleared the touch minimum, but
  // the control read visibly smaller than its counterparts.
  backButton: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sharePill: { minHeight: 34, paddingHorizontal: 9, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  shareText: { fontFamily: fontFamilies.interSemiBold, fontSize: 10 },
  scroll: { paddingTop: 8 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  caption: { fontFamily: fontFamilies.inter, fontSize: 12, lineHeight: 18 },
  actionText: { fontFamily: fontFamilies.interSemiBold, fontSize: 12 },
  heroCard: { borderWidth: 1, padding: 18 },
  inputRow: { flexDirection: 'row', gap: 12 },
  pickerField: { minHeight: 48, borderWidth: 1, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timePickerHost: { marginTop: 10, alignItems: 'flex-start' },
  error: { fontFamily: fontFamilies.inter, fontSize: 12, marginTop: 4 },
  saveError: { fontFamily: fontFamilies.inter, fontSize: 12, lineHeight: 18, marginTop: 8, textAlign: 'center' },
  cityButton: { minHeight: 56, borderWidth: 1, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  note: { flexDirection: 'row', gap: 10, borderWidth: 1, padding: 12, marginTop: 16 },
  noteMark: { fontFamily: fontFamilies.latinSemiBold, fontSize: 19 },
  primaryButton: { minHeight: 50, marginTop: 18, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { fontFamily: fontFamilies.interSemiBold, fontSize: 14 },
  secondaryAction: { minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  resultHeader: { minHeight: 76, borderWidth: 1, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  lagnaPill: { minWidth: 72, paddingVertical: 7, paddingHorizontal: 10, alignItems: 'center' },
  lagnaLabel: { fontFamily: fontFamilies.interSemiBold, fontSize: 12, letterSpacing: 1 },
  lagnaValue: { fontFamily: fontFamilies.latinSemiBold, fontSize: 15, marginTop: 2 },
  lagnaTranslation: { fontFamily: fontFamilies.inter, fontSize: 12, marginTop: 1 },
  resultTabs: { flexDirection: 'row', padding: 3, borderWidth: 1, marginVertical: 14 },
  resultTab: { flex: 1, minHeight: 48, paddingHorizontal: 4, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
  resultTabText: { fontFamily: fontFamilies.interSemiBold, fontSize: 12 },
  sectionIntro: { marginBottom: 14 },
  chartCard: { borderWidth: 1, padding: 13 },
  chartNote: { marginTop: 9, paddingHorizontal: 10, paddingVertical: 9 },
  table: { borderWidth: 1, overflow: 'hidden' },
  tableRow: { minHeight: 62, borderBottomWidth: StyleSheet.hairlineWidth, paddingHorizontal: 13, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  tablePrimary: { fontFamily: fontFamilies.interSemiBold, fontSize: 14 },
  tableTranslation: { fontFamily: fontFamilies.inter, fontSize: 12 },
  eyebrowText: { fontFamily: fontFamilies.interSemiBold, fontSize: 12, letterSpacing: 1.3 },
  currentDasha: { borderWidth: 1, padding: 14, marginBottom: 14 },
  reportCta: {
    minHeight: 60,
    marginTop: 4,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dashaReading: { borderWidth: 1, padding: 14, marginBottom: 14 },
  dashaReadingBody: { fontSize: 12, lineHeight: 19, marginTop: 6 },
  currentDashaTitle: { fontFamily: fontFamilies.interSemiBold, fontSize: 14, marginTop: 5 },
  beejJapaLink: { minHeight: 44, maxWidth: '100%', marginBottom: 14, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, alignSelf: 'flex-start', justifyContent: 'center' },
  beejJapaText: { fontFamily: fontFamilies.interSemiBold, fontSize: 13 },
  progressTrack: { height: 6, marginTop: 10, overflow: 'hidden' },
  progressFill: { height: '100%' },
  progressCaptions: { marginTop: 5, flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  progressCaption: { fontFamily: fontFamilies.inter, fontSize: 12, maxWidth: '100%' },
  antarChips: { marginTop: 9, flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  antarChip: { maxWidth: '100%', paddingHorizontal: 7, paddingVertical: 4, borderWidth: 1 },
  antarChipText: { fontFamily: fontFamilies.interSemiBold, fontSize: 11 },
  dashaRow: { flexDirection: 'row', minHeight: 68 },
  timelineRail: { width: 22, alignItems: 'center' },
  timelineDot: { width: 9, height: 9, borderRadius: 4.5, marginTop: 19 },
  timelineLine: { width: 1, flex: 1 },
  dashaCard: { flex: 1, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 8 },
  dashaTitleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  nowTag: { paddingHorizontal: 7, paddingVertical: 3 },
  nowTagText: { fontFamily: fontFamilies.interSemiBold, fontSize: 11 },
  timelinePracticeToggle: { minHeight: 44, alignSelf: 'flex-start', justifyContent: 'center', marginTop: 2 },
  timelinePracticeText: { fontFamily: fontFamilies.interSemiBold, fontSize: 12 },
  practiceLabel: { fontSize: 12, marginTop: 18, marginBottom: 8 },
  referenceCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderWidth: 1, marginTop: 10 },
  referenceGlyph: { fontSize: 22, width: 24, textAlign: 'center' },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end' },
  modalSheet: { height: '78%', overflow: 'hidden' },
  modalHeader: { minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth },
  modalSearch: { marginVertical: 12 },
  cityRow: { minHeight: 58, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', alignItems: 'center' },
  groupHeader: { fontSize: 12, lineHeight: 18, letterSpacing: 0.4, paddingTop: 14, paddingBottom: 4, includeFontPadding: false },
});

