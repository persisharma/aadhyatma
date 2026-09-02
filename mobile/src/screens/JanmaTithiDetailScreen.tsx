import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import ReaderHeader from '@/components/ReaderHeader';
import ObservanceDetailHero from '@/components/ObservanceDetailHero';
import { personLabel } from '@/components/PersonChips';
import { useGitaLanguage } from '@/data/gita/language';
import { useNotificationPreferences } from '@/contexts/NotificationPreferencesContext';
import { library, type LibraryEntry } from '@/data/texts';
import { janmaNakshatraIndex, nakshatraName } from '@/panchang/janmaTithi';
import { setJanmaReminder } from '@/panchang/janmaTithiPrefs';
import { useJanmaPrefs, useJanmaTithiDetailSolve, useJanmaTithiPeople } from '@/panchang/useJanmaTithi';
import { tithiRuleLabel } from '@/panchang/pitruSmaran';
import { useKulRecord } from '@/panchang/kulParamparaStore';
import { getCityById } from '@/panchang/locations';
import { fullDate, inDaysLabel, startOfLocalDay } from '@/panchang/pitruSmaranDisplay';
import { VARA_NAMES_EN, VARA_NAMES_HI } from '@/panchang/names';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { contentByLang } from '@/utils/localize';
import { transliterateDevanagari } from '@/utils/transliterate';
import { scriptBodyFont } from '@/utils/langType';
import { buildEntryStartTarget, navigateToHomeStackTarget, panchangTabTarget } from '@/navigation/entryRoutes';
import type { MoreStackParamList, TabParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<MoreStackParamList, 'JanmaTithiDetail'>;

// The dirghayu paath every janma tithi traditionally carries; already shipped.
const DIRGHAYU_PAATH_ID = 'vishnu-sahasranama';
// At most this many kuldev texts join it — the day is quiet, not a catalog.
const MAX_KULDEV_ROWS = 2;

/**
 * Person जन्म तिथि detail (PRD-29 §3.3) — the profile's four lines (birth ·
 * tithi · this year · nakshatra), the day's traditional practice pointing only
 * at shipped sections, and the per-person reminder opt-in. Deliberately no
 * greeting card, no share action, no age arithmetic (§6: devotional, never
 * social). Birth details stay Kundali's to edit (RULEBOOK §14.5).
 */
export default function JanmaTithiDetailScreen({ navigation, route }: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const rootNav = useNavigation<NavigationProp<TabParamList>>();
  // For reader targets: same shape VidhiConductScreen uses — push in place when
  // this stack owns the route, cross-tab to Home otherwise.
  const readerNav = useNavigation<never>();
  const { people } = useJanmaTithiPeople();
  const { prefs } = useJanmaPrefs();
  const { permissionStatus, requestPermission } = useNotificationPreferences();
  const { record } = useKulRecord();

  const match = people.find(({ person }) => person.id === route.params.personId) ?? null;
  const person = match?.person ?? null;
  const rule = match?.rule ?? null;

  const today = startOfLocalDay(new Date());
  const todayMs = today.getTime();
  const solved = useJanmaTithiDetailSolve(rule, todayMs);

  const nakshatraIndex = useMemo(
    () => (person ? janmaNakshatraIndex(person) : null),
    [person]
  );

  const practiceRows = useMemo<LibraryEntry[]>(() => {
    const rows: LibraryEntry[] = [];
    const paath = library.find((entry) => entry.id === DIRGHAYU_PAATH_ID && !entry.hidden);
    if (paath && buildEntryStartTarget(paath)) rows.push(paath);
    const kuldevId = record.kuldev?.deityId;
    if (kuldevId) {
      library
        .filter(
          (entry) =>
            !entry.hidden
            && entry.id !== DIRGHAYU_PAATH_ID
            && entry.deities.includes(kuldevId)
            && buildEntryStartTarget(entry) !== null
        )
        .slice(0, MAX_KULDEV_ROWS)
        .forEach((entry) => rows.push(entry));
    }
    return rows;
  }, [record.kuldev?.deityId]);

  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);

  const tithiCaption = rule
    ? lang === 'en'
      ? tithiRuleLabel(rule, 'en')
      : lang === 'hi'
        ? tithiRuleLabel(rule, 'hi')
        : transliterateDevanagari(tithiRuleLabel(rule, 'hi'), lang)
    : contentByLang(lang, 'तिथि नहीं निकल सकी', 'Tithi could not be derived');

  const weekdayName = (d: Date): string =>
    contentByLang(lang, VARA_NAMES_HI[d.getDay()], VARA_NAMES_EN[d.getDay()]);

  const city = person ? getCityById(person.cityId) : undefined;
  const birthLine = person
    ? `${person.date} · ${person.time}${city ? ` · ${contentByLang(lang, city.nameHi, city.nameEn)}` : ''}`
    : '';

  const reminderOn = person ? prefs.reminders[person.id] === true : false;

  const setReminderEnabled = async (enabled: boolean) => {
    if (!person) return;
    const liveIds = people.map((p) => p.person.id);
    if (!enabled) {
      await setJanmaReminder(person.id, false, liveIds).catch(() => undefined);
      return;
    }
    const status = permissionStatus === 'granted' ? 'granted' : await requestPermission();
    await setJanmaReminder(person.id, status === 'granted', liveIds).catch(() => undefined);
  };

  const openPractice = (entry: LibraryEntry) => {
    const target = buildEntryStartTarget(entry);
    if (target) navigateToHomeStackTarget(readerNav, target);
  };

  const openKundali = () =>
    rootNav.navigate('PanchangTab', panchangTabTarget('Kundali', undefined));

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ReaderHeader
          variant="index"
          title={contentByLang(lang, 'जन्म तिथि', 'Janma Tithi')}
          onBack={() => navigation.goBack()}
          right={
            person ? (
              <Pressable
                onPress={openKundali}
                accessibilityRole="button"
                accessibilityLabel="Edit birth details in Kundali"
                hitSlop={12}
                style={({ pressed }) => pressed && { opacity: 0.6 }}
              >
                <Text style={{ fontFamily: fontFamilies.interSemiBold, fontSize: 12, color: colors.saffron }}>
                  {contentByLang(lang, 'सम्पादन', 'Edit')}
                </Text>
              </Pressable>
            ) : undefined
          }
          sideWidth={64}
        />

        {!person ? (
          <View style={styles.centered}>
            <Text style={{ fontFamily: bodyFont, fontSize: 14, color: colors.inkMuted }}>
              {contentByLang(lang, 'यह व्यक्ति नहीं मिला।', 'Person not found.')}
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing.xxl }]}
            showsVerticalScrollIndicator={false}
          >
            <ObservanceDetailHero
              style={styles.hero}
              layout="smaran"
              leading={(
                <Text style={{ fontFamily: typography.readerTitle.fontFamily, fontSize: 14, color: colors.gold, letterSpacing: 6 }}>
                  ✦ ॐ ✦
                </Text>
              )}
              title={personLabel(person)}
              caption={(
                <Text style={{ fontFamily: bodyFont, fontSize: 13, color: colors.inkSoft, textAlign: 'center' }}>
                  {contentByLang(lang, 'जन्म तिथि:', 'Janma tithi:')} {tithiCaption}
                </Text>
              )}
              nextLabel={solved.next
                ? `${contentByLang(lang, 'इस वर्ष', 'This year')} · ${fullDate(solved.next, lang)} · ${inDaysLabel(solved.next, today, lang)}`
                : null}
            />

            {/* Birth details — read-only here; Kundali owns the edit. */}
            <View style={[styles.row, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.md }]}>
              <View style={styles.rowMain}>
                <Text style={[styles.rowLabel, { color: colors.inkMuted }]}>
                  {contentByLang(lang, 'जन्म', 'BIRTH')}
                </Text>
                <Text style={{ fontFamily: bodyFont, fontSize: 14, color: colors.ink, marginTop: 2 }}>
                  {birthLine}
                </Text>
                <Text style={{ fontFamily: fontFamilies.latinItalic, fontSize: 11, lineHeight: 17, color: colors.inkMuted, marginTop: 3 }}>
                  {contentByLang(
                    lang,
                    'तिथि जन्म-दिनांक की सूर्योदय तिथि है (उज्जैन · पूर्णिमान्त)',
                    'The tithi is the birth date’s sunrise tithi (Ujjain · purnimant)'
                  )}
                </Text>
              </View>
            </View>

            {/* This year / next year */}
            {solved.following && (
              <View style={[styles.row, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.md }]}>
                <View style={styles.rowMain}>
                  <Text style={[styles.rowLabel, { color: colors.inkMuted }]}>
                    {contentByLang(lang, 'अगले वर्ष', 'NEXT YEAR')}
                  </Text>
                  <Text style={{ fontFamily: bodyFont, fontSize: 14, color: colors.ink, marginTop: 2 }}>
                    {weekdayName(solved.following)}, {fullDate(solved.following, lang)}
                  </Text>
                </View>
              </View>
            )}

            {/* Janma nakshatra */}
            {nakshatraIndex !== null && (
              <View style={[styles.row, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.md }]}>
                <View style={styles.rowMain}>
                  <Text style={[styles.rowLabel, { color: colors.inkMuted }]}>
                    {contentByLang(lang, 'जन्म नक्षत्र', 'JANMA NAKSHATRA')}
                  </Text>
                  <Text style={{ fontFamily: bodyFont, fontSize: 14, color: colors.ink, marginTop: 2 }}>
                    {lang === 'en'
                      ? nakshatraName(nakshatraIndex, 'en')
                      : lang === 'hi'
                        ? nakshatraName(nakshatraIndex, 'hi')
                        : transliterateDevanagari(nakshatraName(nakshatraIndex, 'hi'), lang)}
                  </Text>
                </View>
              </View>
            )}

            {/* Reminder — default OFF, per person, persisted only after the OS grant. */}
            <View style={[styles.row, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.md }]}>
              <View style={styles.rowMain}>
                <Text style={[styles.rowLabel, { color: colors.inkMuted }]}>
                  {contentByLang(lang, 'स्मरण', 'REMINDER')}
                </Text>
                <Text style={{ fontFamily: bodyFont, fontSize: 13, lineHeight: 19, color: colors.inkSoft, marginTop: 3 }}>
                  {contentByLang(lang, 'एक दिन पहले, सायं 6 बजे', 'The evening before, at 6 pm')}
                </Text>
              </View>
              <Switch
                value={reminderOn}
                onValueChange={setReminderEnabled}
                trackColor={{ false: colors.divider, true: colors.gold }}
                thumbColor={colors.parchmentHighlight}
                accessibilityRole="switch"
                accessibilityLabel="Janma tithi reminder"
                accessibilityValue={{ text: reminderOn ? 'On' : 'Off' }}
                accessibilityHint="Notifies the evening before this janma tithi"
              />
            </View>

            {/* इस दिन की परम्परा — shipped sections only. */}
            {practiceRows.length > 0 && (
              <Text style={[styles.sectionHead, { color: colors.inkMuted }]}>
                {contentByLang(lang, 'इस दिन की परम्परा', 'TRADITION FOR THE DAY')}
              </Text>
            )}
            {practiceRows.map((entry, i) => (
              <Pressable
                key={entry.id}
                onPress={() => openPractice(entry)}
                accessibilityRole="button"
                accessibilityLabel={`Open ${entry.nameEn}`}
                style={({ pressed }) => [
                  styles.row,
                  { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.md },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <View style={styles.rowMain}>
                  <Text style={{ fontFamily: bodyFont, fontSize: 14, color: colors.ink }}>
                    {contentByLang(lang, entry.nameHi, entry.nameEn)}
                  </Text>
                  <Text style={{ fontFamily: bodyFont, fontSize: 12, lineHeight: 18, color: colors.inkMuted, marginTop: 2 }}>
                    {i === 0 && entry.id === DIRGHAYU_PAATH_ID
                      ? contentByLang(lang, 'दीर्घायु हेतु पारम्परिक पाठ', 'The traditional dirghayu paath')
                      : contentByLang(lang, 'कुलदेव का पाठ', 'The kuldev’s paath')}
                  </Text>
                </View>
                <Text style={{ fontSize: 17, color: colors.saffron }}>›</Text>
              </Pressable>
            ))}

            <Text style={{ fontFamily: fontFamilies.latinItalic, fontSize: 12, lineHeight: 19, color: colors.inkMuted, textAlign: 'center', marginTop: 14 }}>
              {contentByLang(
                lang,
                'तिथि हर वर्ष अलग अंग्रेज़ी तारीख़ पर आती है — यही कारण है कि यह भूल जाती है।',
                'The tithi falls on a different civil date each year — which is exactly why it gets forgotten.'
              )}
            </Text>
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  scroll: { paddingTop: 4, paddingBottom: 40 },
  hero: { marginTop: 4, marginBottom: 16 },
  sectionHead: { fontFamily: fontFamilies.interSemiBold, fontSize: 11, letterSpacing: 0.7, marginTop: 8, marginBottom: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 10,
    minHeight: 44,
  },
  rowMain: { flex: 1 },
  rowLabel: { fontFamily: fontFamilies.interSemiBold, fontSize: 11, letterSpacing: 0.5 },
});
