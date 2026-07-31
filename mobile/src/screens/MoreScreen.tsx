import React, { useState } from 'react';
import { Alert, Linking, Modal, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { radii } from '@/theme/spacing';
import { useTheme } from '@/theme/ThemeContext';
import { elevation } from '@/theme/elevation';
import { useBookmarks } from '@/contexts/BookmarksContext';
import { useGitaLanguage, LANGUAGES, type Lang } from '@/data/gita/language';
import { fontFamilies } from '@/theme/typography';
import { scriptTitleFont, scriptBodyFont } from '@/utils/langType';
import { pick } from '@/utils/localize';
import { helpContent, buildDiscrepancyMailto, SUPPORT_EMAIL } from '@/data/help/content';
import { buildAppShareMessage, INSTAGRAM_HANDLE, INSTAGRAM_URL } from '@/data/shareLinks';
import { useUserActivity } from '@/contexts/UserActivityContext';
import { useNotificationPreferences } from '@/contexts/NotificationPreferencesContext';
import { useTour } from '@/contexts/TourContext';
import { useJapamAlarms } from '@/contexts/JapamAlarmsContext';
import { useFontScale } from '@/contexts/FontScaleContext';
import LanguagePickerSheet from '@/components/LanguagePickerSheet';
import ReadingSizePickerSheet, { readingSizeLabel } from '@/components/ReadingSizePickerSheet';
import { useTourTarget, scrollNodeIntoView } from '@/components/tour/tourTargets';
import type { TimeOfDay } from '@/notifications/pure';
import type { MoreStackParamList } from '@/navigation/types';

function formatReminderTimes(times: TimeOfDay[]): string {
  if (times.length === 0) return '';
  return times
    .map((t) => `${`${t.hour}`.padStart(2, '0')}:${`${t.minute}`.padStart(2, '0')}`)
    .join(', ');
}

/** Native-script face for a language's own name (used in the Language row state). */
function nativeNameFont(lang: Lang, devanagariFallback: string): string {
  if (lang === 'en') return fontFamilies.latin;
  if (lang === 'gu') return fontFamilies.gujaratiBold;
  if (lang === 'kn') return fontFamilies.kannadaBold;
  return devanagariFallback;
}

type RowProps = {
  icon: string;
  iconBg: string;
  iconFontFamily?: string;
  iconFontSize?: number;
  label: string;
  labelFontFamily: string;
  state?: string;
  stateFontFamily?: string;
  onPress: () => void;
  accessibilityLabel: string;
  first?: boolean;
};

/** One inset settings row: [icon tile] [label] … [state] [chevron]. */
function SettingsRow({
  icon,
  iconBg,
  iconFontFamily,
  iconFontSize = 17,
  label,
  labelFontFamily,
  state,
  stateFontFamily,
  onPress,
  accessibilityLabel,
  first,
}: RowProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.row,
        !first && { borderTopWidth: 1, borderTopColor: colors.divider },
        pressed && { backgroundColor: colors.saffronTint },
      ]}
    >
      <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>
        <Text style={{ color: colors.onPrimary, fontSize: iconFontSize, fontFamily: iconFontFamily }}>{icon}</Text>
      </View>
      <Text style={[styles.rowLabel, { color: colors.ink, fontFamily: labelFontFamily }]} numberOfLines={1}>
        {label}
      </Text>
      {state ? (
        <Text
          style={[styles.rowState, { color: colors.inkMuted, fontFamily: stateFontFamily ?? fontFamilies.inter }]}
          numberOfLines={1}
        >
          {state}
        </Text>
      ) : null}
      <Text style={[styles.chevron, { color: colors.gold }]}>›</Text>
    </Pressable>
  );
}

type Props = NativeStackScreenProps<MoreStackParamList, 'MoreHome'>;

export default function MoreScreen({ navigation }: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const { bookmarks } = useBookmarks();
  const { lang } = useGitaLanguage();
  const { lifetimeTotals, currentStreak } = useUserActivity();
  const { prefs: notifPrefs } = useNotificationPreferences();
  const { resetTour } = useTour();
  const { alarms: japamAlarms } = useJapamAlarms();
  const { scale } = useFontScale();
  const activeJapamAlarms = japamAlarms.filter((a) => a.enabled);
  // Feature-tour spotlight targets (§47) — both rows sit in the "App" group,
  // below the fold on smaller devices, so each declares a reveal that scrolls
  // it on-screen before the tour measures it.
  const moreScrollRef = React.useRef<ScrollView>(null);
  const languageRowRef = useTourTarget('languageRow', (ref) => scrollNodeIntoView(moreScrollRef, ref));
  const readingSizeRowRef = useTourTarget('readingSizeRow', (ref) => scrollNodeIntoView(moreScrollRef, ref));
  const [disclaimerVisible, setDisclaimerVisible] = useState(false);
  const [langSheet, setLangSheet] = useState(false);
  const [sizeSheet, setSizeSheet] = useState(false);

  const hi = helpContent.hi;
  const en = helpContent.en;
  const profileTotals = lifetimeTotals();
  const streak = currentStreak();

  const isEn = lang === 'en';
  const titleFont = isEn ? fontFamilies.latinBold : scriptTitleFont(lang, fontFamilies.devanagariBold);
  const labelFont = isEn ? fontFamilies.interSemiBold : scriptTitleFont(lang, fontFamilies.devanagariBold);
  const chromeFont = isEn ? fontFamilies.inter : scriptBodyFont(lang, fontFamilies.devanagari);

  const currentLang = LANGUAGES.find((l) => l.value === lang) ?? LANGUAGES[0];

  const shareApp = () => {
    Share.share(
      { message: buildAppShareMessage(lang) },
      { dialogTitle: pick(lang, { hi: 'Vedansh साझा करें', en: 'Share Vedansh', gu: 'Vedansh શેર કરો', kn: 'Vedansh ಹಂಚಿಕೊಳ್ಳಿ' }) }
    ).catch(() => {
      // Share sheet dismissed or unavailable — nothing to recover.
    });
  };

  const openInstagram = () => {
    Linking.openURL(INSTAGRAM_URL).catch(() =>
      Alert.alert('Instagram', `@${INSTAGRAM_HANDLE}`)
    );
  };

  const reportError = () => {
    const url = buildDiscrepancyMailto();
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Email', `Please email us at ${SUPPORT_EMAIL}`);
        }
      })
      .catch(() => Alert.alert('Email', `Please email us at ${SUPPORT_EMAIL}`));
  };

  const remindersState = notifPrefs.dailyVerseEnabled
    ? formatReminderTimes(notifPrefs.times) || pick(lang, { hi: 'चालू', en: 'On', gu: 'ચાલુ', kn: 'ಆನ್' })
    : pick(lang, { hi: 'बंद', en: 'Off', gu: 'બંધ', kn: 'ಆಫ್' });

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ScrollView
          ref={moreScrollRef}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Header — single line, left-aligned, selected language only */}
          <View style={styles.header}>
            <Text style={{ fontFamily: titleFont, fontSize: 30, color: colors.ink }}>
              {pick(lang, { hi: 'अन्य', en: 'More', gu: 'અન્ય', kn: 'ಇನ್ನಷ್ಟು' })}
            </Text>
          </View>

          <View style={styles.groups}>
            {/* ── Group 1: साधना / Practice ── */}
            <View style={styles.group}>
              <Text style={[styles.groupLabel, { color: colors.saffronDeep }, isEn ? styles.groupLabelLatin : { fontFamily: chromeFont }]}>
                {pick(lang, { hi: 'साधना', en: 'Practice', gu: 'સાધના', kn: 'ಸಾಧನೆ' })}
              </Text>
              <View style={[styles.list, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider }]}>
                {/* Compact profile hero row */}
                <Pressable
                  onPress={() => navigation.navigate('Profile')}
                  accessibilityRole="button"
                  accessibilityLabel="Open Sadhak profile"
                  style={({ pressed }) => [styles.profileRow, pressed && { opacity: 0.9 }]}
                >
                  <LinearGradient
                    colors={[colors.cardActiveFrom, colors.cardActiveTo]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={[styles.profileBadge, { backgroundColor: colors.saffron }]}>
                    <Text style={{ color: colors.onPrimary, fontFamily: typography.readerTitle.fontFamily, fontSize: 26 }}>ॐ</Text>
                  </View>
                  <View style={styles.profileMeta}>
                    <Text style={{ fontFamily: labelFont, fontSize: 18, color: colors.ink }} numberOfLines={1}>
                      {pick(lang, { hi: 'साधक प्रोफ़ाइल', en: 'Sadhak Profile', gu: 'સાધક પ્રોફાઇલ', kn: 'ಸಾಧಕ ಪ್ರೊಫೈಲ್' })}
                    </Text>
                    <Text style={{ marginTop: 3, fontFamily: chromeFont, fontSize: 14, color: colors.inkMuted }} numberOfLines={1}>
                      <Text style={{ color: colors.saffron, fontFamily: fontFamilies.interSemiBold }}>{profileTotals.totalReads}</Text>
                      {' '}
                      {pick(lang, { hi: 'श्लोक', en: 'verses', gu: 'શ્લોક', kn: 'ಶ್ಲೋಕ' })}
                      {'    ·    '}
                      <Text style={{ color: colors.saffron, fontFamily: fontFamilies.interSemiBold }}>{streak}</Text>
                      {' '}
                      {pick(lang, { hi: 'श्रृंखला', en: 'day streak', gu: 'શ્રેણી', kn: 'ಸರಣಿ' })}
                    </Text>
                  </View>
                  <Text style={[styles.chevron, { color: colors.gold }]}>›</Text>
                </Pressable>

                <SettingsRow
                  icon="♥"
                  iconBg={colors.saffron}
                  label={pick(lang, { hi: 'संग्रह', en: 'Wishlist', gu: 'સંગ્રહ', kn: 'ಸಂಗ್ರಹ' })}
                  labelFontFamily={labelFont}
                  state={`${bookmarks.length}`}
                  onPress={() => navigation.navigate('Wishlist')}
                  accessibilityLabel={`Wishlist, ${bookmarks.length} verse${bookmarks.length !== 1 ? 's' : ''} saved`}
                />
                <SettingsRow
                  icon="ॐ"
                  iconBg={colors.gold}
                  iconFontFamily={typography.readerTitle.fontFamily}
                  iconFontSize={18}
                  label={pick(lang, { hi: 'स्मरण', en: 'Reminders', gu: 'સ્મરણ', kn: 'ಸ್ಮರಣೆ' })}
                  labelFontFamily={labelFont}
                  state={remindersState}
                  stateFontFamily={notifPrefs.dailyVerseEnabled ? fontFamilies.inter : chromeFont}
                  onPress={() => navigation.navigate('Reminders')}
                  accessibilityLabel={
                    notifPrefs.dailyVerseEnabled
                      ? `Reminders, daily verse on at ${formatReminderTimes(notifPrefs.times)}`
                      : 'Reminders, daily verse off'
                  }
                />
                <SettingsRow
                  icon="⏰"
                  iconBg={colors.saffronDeep}
                  iconFontSize={18}
                  label={pick(lang, { hi: 'जप अलार्म', en: 'Japam Alarms', gu: 'જપ અલાર્મ', kn: 'ಜಪ ಅಲಾರಂ' })}
                  labelFontFamily={labelFont}
                  state={activeJapamAlarms.length > 0 ? `${activeJapamAlarms.length}` : undefined}
                  onPress={() => navigation.navigate('JapamAlarms')}
                  accessibilityLabel={
                    activeJapamAlarms.length > 0 ? `Japam alarms, ${activeJapamAlarms.length} active` : 'Japam alarms, none set'
                  }
                />
              </View>
            </View>

            {/* ── Group 2: ऐप / App ── */}
            <View style={styles.group}>
              <Text style={[styles.groupLabel, { color: colors.saffronDeep }, isEn ? styles.groupLabelLatin : { fontFamily: chromeFont }]}>
                {pick(lang, { hi: 'ऐप', en: 'App', gu: 'ઍપ', kn: 'ಆ್ಯಪ್' })}
              </Text>
              <View style={[styles.list, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider }]}>
                {/* Tour targets: wrapped in measurable views so FeatureTour can
                    ring these two rows (§47 steps 23–24). */}
                <View ref={languageRowRef} collapsable={false}>
                  <SettingsRow
                    first
                    icon="अ"
                    iconBg={colors.gold}
                    iconFontFamily={typography.readerTitle.fontFamily}
                    iconFontSize={16}
                    label={pick(lang, { hi: 'भाषा', en: 'Language', gu: 'ભાષા', kn: 'ಭಾಷೆ' })}
                    labelFontFamily={labelFont}
                    state={currentLang.nativeLabel}
                    stateFontFamily={nativeNameFont(lang, typography.readerTitle.fontFamily)}
                    onPress={() => setLangSheet(true)}
                    accessibilityLabel={`Language, ${currentLang.a11yLabel}`}
                  />
                </View>
                <View ref={readingSizeRowRef} collapsable={false}>
                  <SettingsRow
                    icon="Aa"
                    iconBg={colors.saffron}
                    iconFontFamily={fontFamilies.interSemiBold}
                    iconFontSize={14}
                    label={pick(lang, { hi: 'पाठ का आकार', en: 'Reading Size', gu: 'વાંચન કદ', kn: 'ಓದುವ ಗಾತ್ರ' })}
                    labelFontFamily={labelFont}
                    state={readingSizeLabel(scale, lang)}
                    stateFontFamily={chromeFont}
                    onPress={() => setSizeSheet(true)}
                    accessibilityLabel={`Reading size, ${scale === 'L' ? 'Large' : 'Standard'}`}
                  />
                </View>
                <SettingsRow
                  icon="↗"
                  iconBg={colors.saffron}
                  label={pick(lang, { hi: 'ऐप साझा करें', en: 'Share the App', gu: 'ઍપ શેર કરો', kn: 'ಆ್ಯಪ್ ಹಂಚಿಕೊಳ್ಳಿ' })}
                  labelFontFamily={labelFont}
                  onPress={shareApp}
                  accessibilityLabel={pick(lang, {
                    hi: 'Vedansh ऐप साझा करें',
                    en: 'Share Vedansh app',
                    gu: 'Vedansh ઍપ શેર કરો',
                    kn: 'Vedansh ಆ್ಯಪ್ ಹಂಚಿಕೊಳ್ಳಿ',
                  })}
                />
                {/* Leaves the app for the public @vedansh.app profile (§37). */}
                <SettingsRow
                  icon="◉"
                  iconBg={colors.saffronDeep}
                  iconFontSize={19}
                  label={pick(lang, {
                    hi: 'Instagram पर फ़ॉलो करें',
                    en: 'Follow on Instagram',
                    gu: 'Instagram પર ફોલો કરો',
                    kn: 'Instagram ನಲ್ಲಿ ಫಾಲೋ ಮಾಡಿ',
                  })}
                  labelFontFamily={labelFont}
                  state={`@${INSTAGRAM_HANDLE}`}
                  onPress={openInstagram}
                  accessibilityLabel="Follow on Instagram"
                />
              </View>
            </View>

            {/* ── Group 3: जानकारी / Info ── */}
            <View style={styles.group}>
              <Text style={[styles.groupLabel, { color: colors.saffronDeep }, isEn ? styles.groupLabelLatin : { fontFamily: chromeFont }]}>
                {pick(lang, { hi: 'जानकारी', en: 'Info', gu: 'માહિતી', kn: 'ಮಾಹಿತಿ' })}
              </Text>
              <View style={[styles.list, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider }]}>
                <SettingsRow
                  first
                  icon="ⓘ"
                  iconBg={colors.inkMuted}
                  label={pick(lang, { hi: 'परिचय व अस्वीकरण', en: 'About & Disclaimer', gu: 'પરિચય અને અસ્વીકરણ', kn: 'ಪರಿಚಯ ಮತ್ತು ಹಕ್ಕುನಿರಾಕರಣೆ' })}
                  labelFontFamily={labelFont}
                  onPress={() => setDisclaimerVisible(true)}
                  accessibilityLabel="About and disclaimer"
                />
                <SettingsRow
                  icon="⚑"
                  iconBg={colors.inkMuted}
                  label={pick(lang, { hi: 'त्रुटि सूचित करें', en: 'Report an Error', gu: 'ભૂલ જણાવો', kn: 'ದೋಷ ವರದಿ ಮಾಡಿ' })}
                  labelFontFamily={labelFont}
                  onPress={reportError}
                  accessibilityLabel="Report an error"
                />
                {/* Replay the first-launch feature tour on demand (design.md §37/§47). */}
                <SettingsRow
                  icon="↻"
                  iconBg={colors.gold}
                  label={pick(lang, { hi: 'ऐप भ्रमण फिर देखें', en: 'Show App Tour', gu: 'ઍપ પરિચય ફરી જુઓ', kn: 'ಆ್ಯಪ್ ಪ್ರವಾಸ ಮತ್ತೆ ನೋಡಿ' })}
                  labelFontFamily={labelFont}
                  onPress={() => resetTour()}
                  accessibilityLabel="Show App Tour"
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      <LanguagePickerSheet visible={langSheet} onClose={() => setLangSheet(false)} />
      <ReadingSizePickerSheet visible={sizeSheet} onClose={() => setSizeSheet(false)} />

      {/* Disclaimer Modal */}
      <Modal
        visible={disclaimerVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setDisclaimerVisible(false)}
      >
        <View style={[styles.modalRoot, { backgroundColor: colors.parchment }]}>
          <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.divider }]}>
              <Text
                accessibilityRole="header"
                accessibilityLabel={`${en.title}. ${hi.title}.`}
                style={{ fontFamily: typography.readerTitle.fontFamily, fontSize: 20, color: colors.ink }}
              >
                {en.title} / {hi.title}
              </Text>
              <Pressable
                onPress={() => setDisclaimerVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Close"
                hitSlop={16}
                style={({ pressed }) => [styles.modalClose, pressed && { opacity: 0.7 }]}
              >
                <Text style={{ fontSize: 20, fontWeight: '600', color: colors.saffron }}>✕</Text>
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.xxl, paddingTop: 24, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
              <Text style={{ fontFamily: typography.readerTitle.fontFamily, fontSize: 16, color: colors.ink, marginBottom: 12 }}>
                {en.disclaimerHeading}
              </Text>
              {en.disclaimerParagraphs.map((para: string, i: number) => (
                <Text key={`en-${i}`} style={{ fontFamily: typography.meaning.fontFamily, fontSize: 14, lineHeight: 24, color: colors.inkSoft, marginBottom: 14 }}>
                  {para}
                </Text>
              ))}
              <View style={{ borderBottomWidth: 1, borderBottomColor: colors.divider, marginVertical: 20, opacity: 0.5 }} />
              <Text style={{ fontFamily: typography.readerTitle.fontFamily, fontSize: 16, color: colors.ink, marginBottom: 12 }}>
                {hi.disclaimerHeading}
              </Text>
              {hi.disclaimerParagraphs.map((para: string, i: number) => (
                <Text key={`hi-${i}`} style={{ fontFamily: typography.meaning.fontFamily, fontSize: 14, lineHeight: 24, color: colors.inkSoft, marginBottom: 14 }}>
                  {para}
                </Text>
              ))}
              <View style={{ borderBottomWidth: 1, borderBottomColor: colors.divider, marginVertical: 20, opacity: 0.5 }} />
              <Text
                accessibilityRole="header"
                accessibilityLabel={`${en.reportHeading}. ${hi.reportHeading}.`}
                style={{ fontFamily: typography.readerTitle.fontFamily, fontSize: 16, color: colors.ink, marginBottom: 12 }}
              >
                {en.reportHeading} / {hi.reportHeading}
              </Text>
              <Text style={{ fontFamily: typography.meaning.fontFamily, fontSize: 14, lineHeight: 24, color: colors.inkSoft, marginBottom: 14 }}>
                {en.reportIntro}
              </Text>
              <Text style={{ fontFamily: typography.meaning.fontFamily, fontSize: 14, lineHeight: 24, color: colors.inkSoft, marginBottom: 14 }}>
                {hi.reportIntro}
              </Text>
              <Pressable
                onPress={reportError}
                accessibilityRole="button"
                accessibilityLabel={`${en.reportButtonLabel}. ${hi.reportButtonLabel}.`}
                style={{ backgroundColor: colors.saffron, borderRadius: radii.md, paddingVertical: 14, minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: 16 }}
              >
                <Text style={{ color: '#fff', fontFamily: typography.readerTitle.fontFamily, fontSize: 15 }}>
                  {en.reportButtonLabel} / {hi.reportButtonLabel}
                </Text>
              </Pressable>
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingTop: 12, paddingBottom: 40, paddingHorizontal: 16 },
  header: { paddingHorizontal: 4, paddingBottom: 8, marginBottom: 12 },
  groups: { gap: 22 },
  group: { flexDirection: 'column' },
  groupLabel: {
    fontSize: 13,
    paddingHorizontal: 10,
    paddingBottom: 8,
  },
  groupLabelLatin: {
    fontFamily: fontFamilies.interSemiBold,
    fontSize: 12,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  list: {
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
    ...elevation.subtle,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { flex: 1, fontSize: 18 },
  rowState: { fontSize: 15 },
  chevron: { fontSize: 19 },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  profileBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileMeta: { flex: 1 },
  modalRoot: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalClose: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
