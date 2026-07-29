import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import KundaliOverview from '@/components/KundaliOverview';
import TextField from '@/components/TextField';
import JyotishPracticeCard from '@/components/JyotishPracticeCard';
import JyotishShareCard from '@/components/JyotishShareCard';
import JyotishShareSheet from '@/components/JyotishShareSheet';
import JyotishStateCard from '@/components/JyotishStateCard';
import NorthIndianChart from '@/components/NorthIndianChart';
import { useGitaLanguage, type Lang } from '@/data/gita/language';
import { library } from '@/data/texts';
import { buildEntryStartTarget } from '@/navigation/entryRoutes';
import type { PanchangStackParamList } from '@/navigation/types';
import {
  DASHA_YEARS,
  GRAHA_NAMES_EN,
  GRAHA_NAMES_HI,
  getCurrentDasha,
  RASHI_NAMES_EN,
  RASHI_NAMES_HI,
  RASHI_NAMES_WESTERN,
  type KundaliChart,
  type KundaliResultTab,
} from '@/panchang/kundali';
import { CITIES, getCityById, type City } from '@/panchang/locations';
import { NAKSHATRA_NAMES_EN, NAKSHATRA_NAMES_HI } from '@/panchang/names';
import {
  useKundali,
  validateBirthProfile,
  type BirthProfile,
  type BirthProfileErrors,
} from '@/panchang/useKundali';
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

function formatDegrees(value: number): string {
  const degrees = Math.floor(value);
  const minutes = Math.floor((value - degrees) * 60);
  return `${degrees}° ${String(minutes).padStart(2, '0')}′`;
}

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
  return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
}

function formatDuration(milliseconds: number, roundUp = false): string {
  const totalMonths = Math.max(
    0,
    roundUp
      ? Math.ceil(milliseconds / (365.2425 / 12 * 86_400_000))
      : Math.floor(milliseconds / (365.2425 / 12 * 86_400_000))
  );
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  if (years && months) return `${years} y ${months} m`;
  if (years) return `${years} y`;
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
    saveProfile,
    clearProfile,
  } = useKundali();
  const [draft, setDraft] = useState<BirthProfile>(EMPTY_PROFILE);
  const [errors, setErrors] = useState<BirthProfileErrors>({});
  const [editing, setEditing] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [activeTab, setActiveTab] = useState<KundaliResultTab>('overview');
  const [cityPickerVisible, setCityPickerVisible] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);
  const openInEditMode = useRef(route.params?.editing === true);
  const contentScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (profile) {
      setDraft(profile);
      setEditing(openInEditMode.current);
      openInEditMode.current = false;
    } else if (loadState === 'guest') {
      setEditing(true);
    } else if (loadState === 'error') {
      setEditing(false);
    }
  }, [hydrated, loadState, profile]);

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
      await saveProfile(draft);
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

  const startOver = async () => {
    try {
      await clearProfile();
      setDraft(EMPTY_PROFILE);
      setActiveTab('overview');
      setSaveError('');
      setEditing(true);
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
          {chart && profile && !editing ? (
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
                <Text style={[styles.shareText, { color: colors.saffronDeep }]}>
                  ↗ {contentByLang(lang, 'साझा करें', 'Share')}
                </Text>
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
            ) : editing || !chart ? (
              <BirthInput
                draft={draft}
                errors={errors}
                saving={saving}
                saveError={saveError}
                lang={lang}
                onChange={setDraft}
                onChooseCity={() => {
                  Keyboard.dismiss();
                  setCityPickerVisible(true);
                }}
                onGenerate={handleGenerate}
                onCancel={chart ? () => setEditing(false) : undefined}
                onDelete={profile ? startOver : undefined}
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
                onManageDetails={() => setEditing(true)}
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
        selectedCityId={draft.cityId}
        lang={lang}
        onSelect={(city) => {
          Keyboard.dismiss();
          setDraft((current) => ({ ...current, cityId: city.id }));
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
              city={getCityById(profile.cityId)!}
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
  const city = getCityById(draft.cityId);
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
          {contentByLang(lang, 'अपनी कुंडली बनाएँ', 'Create your Kundali')}
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
          {meaningByLang(
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
        placeholder="Your name"
        autoCapitalize="words"
      />

      <View style={styles.inputRow}>
        <View style={{ flex: 1 }}>
          <FieldLabel hi="जन्म तिथि" en="Birth date" lang={lang} colors={colors} typography={typography} />
          <TextField
            variant="form"
            testID="kundali-date-input"
            accessibilityLabel="Birth date YYYY-MM-DD"
            value={draft.date}
            onChangeText={(date) => onChange({ ...draft, date })}
            placeholder="YYYY-MM-DD"
            keyboardType="numbers-and-punctuation"
            maxLength={10}
            style={errors.date ? { borderColor: colors.avoid } : undefined}
          />
          {errors.date && <Text style={[styles.error, { color: colors.avoidDeep }]}>{errors.date}</Text>}
        </View>
        <View style={{ flex: 0.72 }}>
          <FieldLabel hi="समय" en="Time" lang={lang} colors={colors} typography={typography} />
          <TextField
            variant="form"
            testID="kundali-time-input"
            accessibilityLabel="Birth time HH:mm"
            value={draft.time}
            onChangeText={(time) => onChange({ ...draft, time })}
            placeholder="HH:mm"
            keyboardType="numbers-and-punctuation"
            maxLength={5}
            style={errors.time ? { borderColor: colors.avoid } : undefined}
          />
          {errors.time && <Text style={[styles.error, { color: colors.avoidDeep }]}>{errors.time}</Text>}
        </View>
      </View>

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
      <Text
        style={{
          color: colors.inkMuted,
          fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
          fontSize: 12,
          textAlign: 'center',
          marginTop: 9,
        }}
      >
        {contentByLang(
          lang,
          'जन्म विवरण इसी उपकरण पर रहते हैं।',
          'Your birth details stay on this device.'
        )}
      </Text>
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
  onManageDetails,
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
  onManageDetails: () => void;
  colors: any;
  typography: any;
  radii: any;
  elevation: any;
}) {
  const city = getCityById(profile.cityId)!;
  const now = new Date();
  const currentDasha = getCurrentDasha(chart, now);
  const currentElapsed = currentDasha
    ? now.getTime() - currentDasha.maha.start.getTime()
    : 0;
  const currentRemaining = currentDasha
    ? currentDasha.maha.end.getTime() - now.getTime()
    : 0;
  const currentProgress = currentDasha
    ? Math.max(
      0,
      Math.min(
        1,
        currentElapsed
          / (currentDasha.maha.end.getTime() - currentDasha.maha.start.getTime())
      )
    )
    : 0;
  return (
    <>
      <View
        style={[
          styles.resultHeader,
          { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg },
          elevation.card,
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text
            accessibilityLabel="Kundali result"
            style={{
              color: colors.ink,
              fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
              fontSize: 20,
            }}
          >
            {profile.name || contentByLang(lang, 'जन्म कुंडली', 'Birth Kundali')}
          </Text>
          <Text style={[styles.caption, { color: colors.inkMuted, marginTop: 4 }]}>
            {formatBirthDate(profile.date)} · {formatBirthTime(profile.time)} ·{' '}
            {contentByLang(lang, city.nameHi, city.nameEn)}
          </Text>
        </View>
        <View style={[styles.lagnaPill, { backgroundColor: colors.saffronTint, borderRadius: radii.pill }]}>
          <Text style={[styles.lagnaLabel, { color: colors.saffronDeep }]}>
            {contentByLang(lang, 'लग्न', 'Lagna')}
          </Text>
          <Text style={[styles.lagnaValue, { color: colors.ink }]}>
            {contentByLang(
              lang,
              RASHI_NAMES_HI[chart.lagnaRashiIndex],
              RASHI_NAMES_EN[chart.lagnaRashiIndex]
            )}
          </Text>
          <Text style={[styles.lagnaTranslation, { color: colors.inkMuted }]}>
            {lang === 'en'
              ? RASHI_NAMES_WESTERN[chart.lagnaRashiIndex]
              : RASHI_NAMES_EN[chart.lagnaRashiIndex]}
          </Text>
        </View>
      </View>

      <View
        accessibilityRole="tablist"
        style={[
          styles.resultTabs,
          { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.pill },
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
                styles.resultTab,
                selected && { backgroundColor: colors.saffronTint, borderRadius: radii.pill },
              ]}
            >
              <Text style={[styles.resultTabText, { color: selected ? colors.saffronDeep : colors.inkMuted }]}>
                {contentByLang(lang, tab.hi, tab.en)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {activeTab === 'overview' && (
          <KundaliOverview
            chart={chart}
            at={new Date()}
            onOpenTab={onChangeTab}
          />
      )}
      {activeTab === 'chart' && (
        <View>
          <SectionIntro
            hi="उत्तर भारतीय कुंडली"
            en="North Indian chart"
            bodyHi="भाव स्थिर हैं; प्रथम भाव ऊपर है। छोटी संख्या उस भाव की राशि दिखाती है।"
            bodyEn="Houses stay fixed, with the first house at the top. The small number identifies its rashi."
            lang={lang}
            colors={colors}
            typography={typography}
          />
          <View
            style={[
              styles.chartCard,
              {
                backgroundColor: colors.parchmentSoft,
                borderColor: colors.divider,
                borderRadius: radii.lg,
              },
            ]}
          >
            <NorthIndianChart chart={chart} />
            <View
              style={[
                styles.chartNote,
                { backgroundColor: colors.saffronTint, borderRadius: radii.md },
              ]}
            >
              <Text
                style={{
                  color: colors.inkSoft,
                  fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
                  fontSize: 12,
                  lineHeight: 18,
                  textAlign: 'center',
                }}
              >
                {contentByLang(
                  lang,
                  `प्रथम भाव उभारा गया है: जन्म के समय ${RASHI_NAMES_HI[chart.lagnaRashiIndex]} राशि उदित थी।`,
                  `House 1 is highlighted: ${RASHI_NAMES_EN[chart.lagnaRashiIndex]} · ${RASHI_NAMES_WESTERN[chart.lagnaRashiIndex]} was rising at birth.`
                )}
              </Text>
            </View>
          </View>
        </View>
      )}
      {activeTab === 'grahas' && (
        <View>
          <SectionIntro
            hi="ग्रह स्थिति"
            en="Graha positions"
            bodyHi="राशि, अंश, नक्षत्र और भाव—एक ही गणना के अलग संकेत।"
            bodyEn="Rashi, degrees, nakshatra, and house are different views of the same calculation."
            lang={lang}
            colors={colors}
            typography={typography}
          />
          <View style={[styles.table, { borderColor: colors.divider, borderRadius: radii.lg }]}>
            {chart.grahas.map((position, index) => (
              <View
                key={position.graha}
                style={[
                  styles.tableRow,
                  { borderBottomColor: index < chart.grahas.length - 1 ? colors.divider : 'transparent' },
                ]}
              >
                <View style={{ flex: 1.05 }}>
                  <Text style={[styles.tablePrimary, { color: colors.ink }]}>
                    {contentByLang(lang, GRAHA_NAMES_HI[position.graha], GRAHA_NAMES_EN[position.graha])}
                    {position.retrograde ? ' ℞' : ''}
                  </Text>
                  <Text style={[styles.caption, { color: colors.inkMuted }]}>
                    {contentByLang(lang, `भाव ${position.house}`, `House ${position.house}`)}
                  </Text>
                </View>
                <View style={{ flex: 1.25, alignItems: 'flex-end' }}>
                  <Text style={[styles.tablePrimary, { color: colors.ink }]}>
                    {contentByLang(
                      lang,
                      RASHI_NAMES_HI[position.rashiIndex],
                      RASHI_NAMES_EN[position.rashiIndex]
                    )}
                    <Text style={[styles.tableTranslation, { color: colors.inkMuted }]}>
                      {' '}· {lang === 'en'
                        ? RASHI_NAMES_WESTERN[position.rashiIndex]
                        : RASHI_NAMES_EN[position.rashiIndex]}
                    </Text>
                    {' '}
                    {formatDegrees(position.degreeInRashi)}
                  </Text>
                  <Text style={[styles.caption, { color: colors.inkMuted }]}>
                    {contentByLang(
                      lang,
                      `${NAKSHATRA_NAMES_HI[position.nakshatraIndex]} · पद ${position.pada}`,
                      `${NAKSHATRA_NAMES_EN[position.nakshatraIndex]} · Pada ${position.pada}`
                    )}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
      {activeTab === 'dasha' && (
        <View>
          <SectionIntro
            hi="विम्शोत्तरी दशा"
            en="Vimshottari Dasha"
            bodyHi="चन्द्र नक्षत्र से निकली ग्रह-अवधियाँ। ये समय पर चिंतन का पारम्परिक ढाँचा हैं, घटना की गारंटी नहीं।"
            bodyEn="Planetary periods derived from the Moon's nakshatra. They are a traditional timing lens, not an event guarantee."
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
                `${formatPeriodDate(currentDasha.maha.start)} to ${formatPeriodDate(currentDasha.maha.end)}`,
                `${formatDuration(currentElapsed)} elapsed`,
                `${formatDuration(currentRemaining, true)} left`,
              ]
                .filter(Boolean)
                .join(', ')}
              style={[
                styles.currentDasha,
                {
                  backgroundColor: colors.goldTint,
                  borderColor: colors.cardActiveBorder,
                  borderRadius: radii.lg,
                },
              ]}
            >
              <Text style={[styles.eyebrowText, { color: colors.saffronDeep }]}>
                {contentByLang(lang, 'वर्तमान अवधि', 'CURRENT PERIOD')}
              </Text>
              <Text style={[styles.currentDashaTitle, { color: colors.ink }]}>
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
              <Text style={[styles.caption, { color: colors.inkMuted, marginTop: 4 }]}>
                {formatPeriodDate(currentDasha.maha.start)} — {formatPeriodDate(currentDasha.maha.end)}
              </Text>
              <View
                testID="dasha-progress"
                accessibilityRole="progressbar"
                accessibilityValue={{
                  min: 0,
                  max: 100,
                  now: Math.round(currentProgress * 100),
                }}
                style={[
                  styles.progressTrack,
                  { backgroundColor: colors.divider, borderRadius: radii.pill },
                ]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${currentProgress * 100}%`,
                      backgroundColor: colors.saffron,
                      borderRadius: radii.pill,
                    },
                  ]}
                />
              </View>
              <View style={styles.progressCaptions}>
                <Text style={[styles.progressCaption, { color: colors.inkMuted }]}>
                  {formatDuration(currentElapsed)} {contentByLang(lang, 'पूरे', 'elapsed')}
                </Text>
                <Text style={[styles.progressCaption, { color: colors.inkMuted }]}>
                  {formatDuration(currentRemaining, true)} {contentByLang(lang, 'शेष', 'left')}
                </Text>
              </View>
              <View
                accessibilityLabel="Antardasha timeline"
                style={styles.antarChips}
              >
                {currentDasha.maha.antardashas.map((antar) => {
                  const selected = antar === currentDasha.antar;
                  return (
                    <View
                      key={`${antar.lord}-${antar.start.toISOString()}`}
                      style={[
                        styles.antarChip,
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
                          styles.antarChipText,
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
          <View accessibilityLabel="Full Mahadasha timeline">
            {chart.vimshottari.map((period, index) => {
              const selected = period === currentDasha?.maha;
              const birthWithin =
                chart.input.date.getTime() >= period.start.getTime()
                && chart.input.date.getTime() < period.end.getTime();
              const durationLabel = birthWithin
                ? `${formatDuration(period.end.getTime() - chart.input.date.getTime(), true)} ${contentByLang(lang, 'जन्म पर शेष', 'left at birth')}`
                : `${DASHA_YEARS[period.lord]} ${contentByLang(lang, 'वर्ष', 'years')}`;
              return (
                <View
                  key={`${period.lord}-${period.start.toISOString()}`}
                  style={styles.dashaRow}
                >
                  <View style={styles.timelineRail}>
                    <View
                      style={[
                        styles.timelineDot,
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
                          styles.timelineLine,
                          { backgroundColor: colors.divider },
                        ]}
                      />
                    )}
                  </View>
                  <View
                    style={[
                      styles.dashaCard,
                      {
                        borderColor: selected ? colors.saffron : colors.divider,
                        backgroundColor: selected
                          ? colors.cardActiveFrom
                          : colors.parchmentSoft,
                        borderRadius: radii.md,
                      },
                    ]}
                  >
                    <View style={styles.dashaTitleRow}>
                      <Text style={[styles.tablePrimary, { color: colors.ink }]}>
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
                            styles.nowTag,
                            {
                              backgroundColor: colors.saffronTint,
                              borderRadius: radii.pill,
                            },
                          ]}
                        >
                          <Text style={[styles.nowTagText, { color: colors.saffronDeep }]}>
                            {contentByLang(lang, 'अब', 'Now')}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.caption, { color: colors.inkMuted, marginTop: 3 }]}>
                      {formatPeriodDate(period.start)} — {formatPeriodDate(period.end)} ·{' '}
                      {durationLabel}
                    </Text>
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
          styles.practiceLabel,
          { color: colors.inkMuted },
        ]}
      >
        {contentByLang(lang, 'साधना', 'Practice')}
      </Text>
      <JyotishPracticeCard onPress={onOpenPractice} />
      <Pressable
        onPress={onManageDetails}
        accessibilityRole="button"
        accessibilityLabel="Manage birth details"
        style={styles.secondaryAction}
      >
        <Text style={[styles.actionText, { color: colors.saffronDeep }]}>
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
  return (
    <View style={styles.sectionIntro}>
      <Text
        style={{
          color: colors.ink,
          fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
          fontSize: 18,
        }}
      >
        {contentByLang(lang, hi, en)}
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
        {meaningByLang(lang, bodyHi, bodyEn)}
      </Text>
    </View>
  );
}

function CityPicker({
  visible,
  selectedCityId,
  lang,
  onSelect,
  onClose,
}: {
  visible: boolean;
  selectedCityId: string;
  lang: Lang;
  onSelect: (city: City) => void;
  onClose: () => void;
}) {
  const { colors, typography, spacing, radii } = useTheme();
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return CITIES;
    return CITIES.filter((city) =>
      `${city.nameEn} ${city.nameHi}`.toLowerCase().includes(normalized)
    );
  }, [query]);

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
              }}
            >
              {contentByLang(lang, 'जन्म नगर चुनें', 'Choose birth city')}
            </Text>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close city picker">
              <Text style={{ color: colors.saffronDeep, fontSize: 24 }}>×</Text>
            </Pressable>
          </View>
          <TextField
            variant="form"
            testID="kundali-city-search"
            accessibilityLabel="Search birth cities"
            value={query}
            onChangeText={setQuery}
            placeholder="Search Indian cities…"
            style={[styles.modalSearch, { marginHorizontal: spacing.xxl }]}
          />
          <ScrollView keyboardShouldPersistTaps="handled">
            {filtered.map((city) => {
              const selected = city.id === selectedCityId;
              return (
                <Pressable
                  key={city.id}
                  onPress={() => onSelect(city)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`Select ${city.nameEn} birth city`}
                  style={({ pressed }) => [
                    styles.cityRow,
                    { borderBottomColor: colors.divider, paddingHorizontal: spacing.xxl },
                    pressed && { backgroundColor: colors.saffronTint },
                  ]}
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
                    <Text style={[styles.caption, { color: colors.inkMuted }]}>{city.nameEn}</Text>
                  </View>
                  {selected && <Text style={{ color: colors.saffronDeep, fontSize: 16 }}>✓</Text>}
                </Pressable>
              );
            })}
          </ScrollView>
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
  error: { fontFamily: fontFamilies.inter, fontSize: 12, marginTop: 4 },
  saveError: { fontFamily: fontFamilies.inter, fontSize: 12, lineHeight: 17, marginTop: 8, textAlign: 'center' },
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
  resultTab: { flex: 1, minHeight: 38, alignItems: 'center', justifyContent: 'center' },
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
  currentDashaTitle: { fontFamily: fontFamilies.interSemiBold, fontSize: 14, marginTop: 5 },
  progressTrack: { height: 6, marginTop: 10, overflow: 'hidden' },
  progressFill: { height: '100%' },
  progressCaptions: { marginTop: 5, flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  progressCaption: { fontFamily: fontFamilies.inter, fontSize: 12 },
  antarChips: { marginTop: 9, flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  antarChip: { paddingHorizontal: 7, paddingVertical: 4, borderWidth: 1 },
  antarChipText: { fontFamily: fontFamilies.interSemiBold, fontSize: 11 },
  dashaRow: { flexDirection: 'row', minHeight: 68 },
  timelineRail: { width: 22, alignItems: 'center' },
  timelineDot: { width: 9, height: 9, borderRadius: 4.5, marginTop: 19 },
  timelineLine: { width: 1, flex: 1 },
  dashaCard: { flex: 1, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 8 },
  dashaTitleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  nowTag: { paddingHorizontal: 7, paddingVertical: 3 },
  nowTagText: { fontFamily: fontFamilies.interSemiBold, fontSize: 11 },
  practiceLabel: { fontSize: 12, marginTop: 18, marginBottom: 8 },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end' },
  modalSheet: { height: '78%', overflow: 'hidden' },
  modalHeader: { minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth },
  modalSearch: { marginVertical: 12 },
  cityRow: { minHeight: 58, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', alignItems: 'center' },
});
