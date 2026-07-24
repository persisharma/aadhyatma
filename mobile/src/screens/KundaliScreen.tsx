import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import KundaliOverview from '@/components/KundaliOverview';
import NorthIndianChart from '@/components/NorthIndianChart';
import { useGitaLanguage, type Lang } from '@/data/gita/language';
import { library } from '@/data/texts';
import { buildEntryStartTarget } from '@/navigation/entryRoutes';
import type { PanchangStackParamList } from '@/navigation/types';
import {
  GRAHA_NAMES_EN,
  GRAHA_NAMES_HI,
  getCurrentDasha,
  RASHI_NAMES_EN,
  RASHI_NAMES_HI,
  type KundaliChart,
  type KundaliResultTab,
} from '@/panchang/kundali';
import { CITIES, getCityById, type City } from '@/panchang/locations';
import {
  DEFAULT_BIRTH_CITY_ID,
  useKundali,
  validateBirthProfile,
  type BirthProfile,
  type BirthProfileErrors,
} from '@/panchang/useKundali';
import { useTheme } from '@/theme/ThemeContext';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';

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
  cityId: DEFAULT_BIRTH_CITY_ID,
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

function devotionalTarget(sourceId: string) {
  const entry = library.find((candidate) => candidate.id === sourceId);
  return entry ? buildEntryStartTarget(entry) : null;
}

export default function KundaliScreen({ navigation }: Props) {
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const rootNav = useNavigation<any>();
  const { profile, chart, hydrated, saveProfile, clearProfile } = useKundali();
  const [draft, setDraft] = useState<BirthProfile>(EMPTY_PROFILE);
  const [errors, setErrors] = useState<BirthProfileErrors>({});
  const [editing, setEditing] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<KundaliResultTab>('overview');
  const [cityPickerVisible, setCityPickerVisible] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (profile) {
      setDraft(profile);
      setEditing(false);
    }
  }, [hydrated, profile]);

  const handleGenerate = async () => {
    const nextErrors = validateBirthProfile(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setSaving(true);
    try {
      await saveProfile(draft);
      setActiveTab('overview');
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const openPractice = (sourceId = 'navagraha-stotram') => {
    const target = devotionalTarget(sourceId);
    if (target) rootNav.navigate('HomeTab', target);
  };

  const startOver = async () => {
    await clearProfile();
    setDraft(EMPTY_PROFILE);
    setActiveTab('overview');
    setEditing(true);
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
          {chart && !editing ? (
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
            contentContainerStyle={[
              styles.scroll,
              { paddingHorizontal: spacing.xxl, paddingBottom: spacing.xxl * 2 },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {editing || !chart ? (
              <BirthInput
                draft={draft}
                errors={errors}
                saving={saving}
                lang={lang}
                onChange={setDraft}
                onChooseCity={() => setCityPickerVisible(true)}
                onGenerate={handleGenerate}
                onCancel={chart ? () => setEditing(false) : undefined}
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
                onChangeTab={setActiveTab}
                onOpenPractice={() => openPractice()}
                onStartOver={startOver}
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
          setDraft((current) => ({ ...current, cityId: city.id }));
          setErrors((current) => ({ ...current, cityId: undefined }));
          setCityPickerVisible(false);
        }}
        onClose={() => setCityPickerVisible(false)}
      />
    </View>
  );
}

function BirthInput({
  draft,
  errors,
  saving,
  lang,
  onChange,
  onChooseCity,
  onGenerate,
  onCancel,
  colors,
  typography,
  radii,
  elevation,
}: {
  draft: BirthProfile;
  errors: BirthProfileErrors;
  saving: boolean;
  lang: Lang;
  onChange: (profile: BirthProfile) => void;
  onChooseCity: () => void;
  onGenerate: () => void;
  onCancel?: () => void;
  colors: any;
  typography: any;
  radii: any;
  elevation: any;
}) {
  const city = getCityById(draft.cityId) ?? CITIES[0];
  const inputStyle = [
    styles.input,
    {
      color: colors.ink,
      backgroundColor: colors.parchmentSoft,
      borderColor: colors.divider,
      borderRadius: radii.md,
    },
  ];

  return (
    <>
      <View
        style={[
          styles.heroCard,
          { borderColor: colors.cardActiveBorder, borderRadius: radii.lg },
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
            'जन्म समय और नगर से लग्न, ग्रह, भाव और विम्शोत्तरी दशा की पारम्परिक गणना। जानकारी इसी उपकरण पर रहती है।',
            'Use birth time and city to calculate Lagna, grahas, houses, and Vimshottari Dasha. Your profile stays on this device.'
          )}
        </Text>
      </View>

      <FieldLabel hi="नाम (वैकल्पिक)" en="Name (optional)" lang={lang} colors={colors} typography={typography} />
      <TextInput
        testID="kundali-name-input"
        accessibilityLabel="Birth name"
        value={draft.name ?? ''}
        onChangeText={(name) => onChange({ ...draft, name })}
        placeholder="Your name"
        placeholderTextColor={colors.inkMuted}
        autoCapitalize="words"
        style={inputStyle}
      />

      <View style={styles.inputRow}>
        <View style={{ flex: 1 }}>
          <FieldLabel hi="जन्म तिथि" en="Birth date" lang={lang} colors={colors} typography={typography} />
          <TextInput
            testID="kundali-date-input"
            accessibilityLabel="Birth date YYYY-MM-DD"
            value={draft.date}
            onChangeText={(date) => onChange({ ...draft, date })}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.inkMuted}
            keyboardType="numbers-and-punctuation"
            maxLength={10}
            style={[inputStyle, errors.date && { borderColor: colors.avoid }]}
          />
          {errors.date && <Text style={[styles.error, { color: colors.avoidDeep }]}>{errors.date}</Text>}
        </View>
        <View style={{ flex: 0.72 }}>
          <FieldLabel hi="समय" en="Time" lang={lang} colors={colors} typography={typography} />
          <TextInput
            testID="kundali-time-input"
            accessibilityLabel="Birth time HH:mm"
            value={draft.time}
            onChangeText={(time) => onChange({ ...draft, time })}
            placeholder="HH:mm"
            placeholderTextColor={colors.inkMuted}
            keyboardType="numbers-and-punctuation"
            maxLength={5}
            style={[inputStyle, errors.time && { borderColor: colors.avoid }]}
          />
          {errors.time && <Text style={[styles.error, { color: colors.avoidDeep }]}>{errors.time}</Text>}
        </View>
      </View>

      <FieldLabel hi="जन्म नगर" en="Birth city" lang={lang} colors={colors} typography={typography} />
      <Pressable
        testID="kundali-city-button"
        onPress={onChooseCity}
        accessibilityRole="button"
        accessibilityLabel={`Birth city, ${city.nameEn}`}
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
              color: colors.ink,
              fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
              fontSize: 15,
            }}
          >
            {contentByLang(lang, city.nameHi, city.nameEn)}
          </Text>
          <Text style={[styles.caption, { color: colors.inkMuted }]}>India · IST (UTC+5:30)</Text>
        </View>
        <Text style={{ color: colors.saffronDeep, fontSize: 18 }}>⌄</Text>
      </Pressable>

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
            'v1 भारत/IST के लिए है। सही जन्म समय लग्न और भावों के लिए महत्वपूर्ण है।',
            'v1 is for India/IST. An accurate birth time matters for Lagna and houses.'
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
  onStartOver,
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
  onStartOver: () => void;
  colors: any;
  typography: any;
  radii: any;
  elevation: any;
}) {
  const city = getCityById(profile.cityId)!;
  const currentDasha = getCurrentDasha(chart, new Date());
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
            {profile.date} · {profile.time} IST · {contentByLang(lang, city.nameHi, city.nameEn)}
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
          onOpenPractice={onOpenPractice}
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
          <NorthIndianChart chart={chart} />
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
                    )}{' '}
                    {formatDegrees(position.degreeInRashi)}
                  </Text>
                  <Text style={[styles.caption, { color: colors.inkMuted }]}>
                    {contentByLang(lang, `नक्षत्र ${position.nakshatraIndex + 1} · पद ${position.pada}`, `Nakshatra ${position.nakshatraIndex + 1} · Pada ${position.pada}`)}
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
              accessibilityLabel={`Current Dasha, ${GRAHA_NAMES_EN[currentDasha.maha.lord]} Mahadasha${currentDasha.antar ? `, ${GRAHA_NAMES_EN[currentDasha.antar.lord]} Antardasha` : ''}`}
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
            </View>
          )}
          {chart.vimshottari.map((period, index) => (
            <View key={`${period.lord}-${period.start.toISOString()}`} style={styles.dashaRow}>
              <View style={styles.timelineRail}>
                <View style={[styles.timelineDot, { backgroundColor: colors.saffron }]} />
                {index < chart.vimshottari.length - 1 && (
                  <View style={[styles.timelineLine, { backgroundColor: colors.divider }]} />
                )}
              </View>
              <View
                style={[
                  styles.dashaCard,
                  { borderColor: colors.divider, backgroundColor: colors.parchmentSoft, borderRadius: radii.md },
                ]}
              >
                <Text style={[styles.tablePrimary, { color: colors.ink }]}>
                  {contentByLang(lang, GRAHA_NAMES_HI[period.lord], GRAHA_NAMES_EN[period.lord])}{' '}
                  {contentByLang(lang, 'महादशा', 'Mahadasha')}
                </Text>
                <Text style={[styles.caption, { color: colors.inkMuted, marginTop: 3 }]}>
                  {formatPeriodDate(period.start)} — {formatPeriodDate(period.end)}
                </Text>
                <Text style={[styles.caption, { color: colors.saffronDeep, marginTop: 6 }]}>
                  {contentByLang(lang, 'अन्तर्दशाएँ', 'Antardashas')}: {' '}
                  {period.antardashas.map((antar) => GRAHA_NAMES_EN[antar.lord]).join(' · ')}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <Pressable
        onPress={onStartOver}
        accessibilityRole="button"
        accessibilityLabel="Delete saved birth profile and start over"
        style={styles.secondaryAction}
      >
        <Text style={[styles.actionText, { color: colors.avoidDeep }]}>
          {contentByLang(lang, 'सहेजी जानकारी मिटाएँ', 'Delete saved profile')}
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
          <TextInput
            testID="kundali-city-search"
            accessibilityLabel="Search birth cities"
            value={query}
            onChangeText={setQuery}
            placeholder="Search Indian cities…"
            placeholderTextColor={colors.inkMuted}
            style={[
              styles.modalSearch,
              {
                color: colors.ink,
                borderColor: colors.divider,
                backgroundColor: colors.parchmentSoft,
                borderRadius: radii.md,
                marginHorizontal: spacing.xxl,
              },
            ]}
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
  backButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingTop: 8 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  caption: { fontFamily: 'Inter_500Medium', fontSize: 10, lineHeight: 14 },
  actionText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  heroCard: { backgroundColor: '#FFF5E0', borderWidth: 1, padding: 18 },
  inputRow: { flexDirection: 'row', gap: 12 },
  input: { height: 48, borderWidth: 1, paddingHorizontal: 13, fontFamily: 'Inter_500Medium', fontSize: 14 },
  error: { fontFamily: 'Inter_500Medium', fontSize: 10, marginTop: 4 },
  cityButton: { minHeight: 56, borderWidth: 1, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  note: { flexDirection: 'row', gap: 10, borderWidth: 1, padding: 12, marginTop: 16 },
  noteMark: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 19 },
  primaryButton: { minHeight: 50, marginTop: 18, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  secondaryAction: { minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  resultHeader: { minHeight: 76, borderWidth: 1, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  lagnaPill: { minWidth: 72, paddingVertical: 7, paddingHorizontal: 10, alignItems: 'center' },
  lagnaLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 8, letterSpacing: 1 },
  lagnaValue: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 14, marginTop: 2 },
  resultTabs: { flexDirection: 'row', padding: 3, borderWidth: 1, marginVertical: 14 },
  resultTab: { flex: 1, minHeight: 38, alignItems: 'center', justifyContent: 'center' },
  resultTabText: { fontFamily: 'Inter_600SemiBold', fontSize: 10 },
  sectionIntro: { marginBottom: 14 },
  table: { borderWidth: 1, overflow: 'hidden' },
  tableRow: { minHeight: 62, borderBottomWidth: StyleSheet.hairlineWidth, paddingHorizontal: 13, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  tablePrimary: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  eyebrowText: { fontFamily: 'Inter_600SemiBold', fontSize: 9, letterSpacing: 1.3 },
  currentDasha: { borderWidth: 1, padding: 14, marginBottom: 14 },
  currentDashaTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14, marginTop: 5 },
  dashaRow: { flexDirection: 'row', minHeight: 92 },
  timelineRail: { width: 22, alignItems: 'center' },
  timelineDot: { width: 9, height: 9, borderRadius: 4.5, marginTop: 19 },
  timelineLine: { width: 1, flex: 1 },
  dashaCard: { flex: 1, borderWidth: 1, padding: 13, marginBottom: 10 },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end' },
  modalSheet: { height: '78%', overflow: 'hidden' },
  modalHeader: { minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth },
  modalSearch: { height: 46, borderWidth: 1, paddingHorizontal: 13, marginVertical: 12, fontFamily: 'Inter_500Medium', fontSize: 14 },
  cityRow: { minHeight: 58, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', alignItems: 'center' },
});
