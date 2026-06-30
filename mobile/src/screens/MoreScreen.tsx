import React, { useState } from 'react';
import { Alert, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { useBookmarks } from '@/contexts/BookmarksContext';
import { useGitaLanguage, LANGUAGES } from '@/data/gita/language';
import { fontFamilies } from '@/theme/typography';
import { scriptBodyFont } from '@/utils/langType';
import ReadingSizeCard from '@/components/ReadingSizeCard';
import { pick, contentByLang } from '@/utils/localize';
import { helpContent, buildDiscrepancyMailto } from '@/data/help/content';
import { useUserActivity } from '@/contexts/UserActivityContext';
import { useNotificationPreferences } from '@/contexts/NotificationPreferencesContext';
import { useJapamAlarms } from '@/contexts/JapamAlarmsContext';
import { usePanchangLocation } from '@/contexts/PanchangLocationContext';
import type { TimeOfDay } from '@/notifications/pure';
import { orderTitlesByLanguage } from '@/utils/titleByLanguage';
import type { MoreStackParamList } from '@/navigation/types';

function formatReminderTimes(times: TimeOfDay[]): string {
  if (times.length === 0) return '';
  return times
    .map(
      (t) => `${`${t.hour}`.padStart(2, '0')}:${`${t.minute}`.padStart(2, '0')}`
    )
    .join(', ');
}

type Props = NativeStackScreenProps<MoreStackParamList, 'MoreHome'>;

export default function MoreScreen({ navigation }: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const { bookmarks } = useBookmarks();
  const { lang: defaultLang, setLang: setDefaultLang } = useGitaLanguage();
  const { location: panchangLocation } = usePanchangLocation();
  const { lifetimeTotals, currentStreak } = useUserActivity();
  const { prefs: notifPrefs } = useNotificationPreferences();
  const { alarms: japamAlarms } = useJapamAlarms();
  const activeJapamAlarms = japamAlarms.filter((a) => a.enabled);
  const [disclaimerVisible, setDisclaimerVisible] = useState(false);
  const hi = helpContent.hi;
  const en = helpContent.en;
  const profileTotals = lifetimeTotals();
  const streak = currentStreak();
  const screenTitle = orderTitlesByLanguage(defaultLang, 'अन्य', 'More', {
    devPrimary: 22,
    devSecondary: 14,
    latPrimary: 22,
    latSecondary: 14,
  });
  const profileCardTitle = orderTitlesByLanguage(
    defaultLang,
    'साधक प्रोफ़ाइल',
    'Sadhak Profile · Insights',
    { devPrimary: 18, devSecondary: 13, latPrimary: 18, latSecondary: 13 }
  );

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
          {/* Title */}
          <View style={styles.titleArea}>
            <Text style={{ fontFamily: screenTitle.primary.fontFamily, fontSize: screenTitle.primary.fontSize, fontStyle: screenTitle.primary.fontStyle, color: colors.ink, textAlign: 'center' }}>
              {screenTitle.primary.text}
            </Text>
            <Text style={{ fontFamily: screenTitle.secondary.fontFamily, fontSize: screenTitle.secondary.fontSize, fontStyle: screenTitle.secondary.fontStyle, color: colors.inkMuted, textAlign: 'center', marginTop: 4 }}>
              {screenTitle.secondary.text}
            </Text>
          </View>

          {/* Profile Card with insights snapshot */}
          <Pressable
            onPress={() => navigation.navigate('Profile')}
            accessibilityRole="button"
            accessibilityLabel="Open Sadhak profile"
            style={({ pressed }) => [
              styles.profileCard,
              {
                borderColor: colors.cardActiveBorder,
                borderRadius: radii.lg,
                opacity: pressed ? 0.92 : 1,
              },
            ]}
          >
            <LinearGradient
              colors={[colors.cardActiveFrom, colors.cardActiveTo]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[StyleSheet.absoluteFill, { borderRadius: radii.lg }]}
            />
            <View style={styles.profileTopRow}>
              <View style={[styles.profileCrest, { backgroundColor: colors.saffron }]}>
                <Text
                  style={{
                    color: colors.onPrimary,
                    fontFamily: typography.readerTitle.fontFamily,
                    fontSize: 22,
                  }}
                >
                  ॐ
                </Text>
              </View>
              <View style={styles.profileTitleBlock}>
                <Text
                  style={{
                    fontFamily: profileCardTitle.primary.fontFamily,
                    fontSize: profileCardTitle.primary.fontSize,
                    fontStyle: profileCardTitle.primary.fontStyle,
                    color: colors.ink,
                  }}
                >
                  {profileCardTitle.primary.text}
                </Text>
                <Text
                  style={{
                    fontFamily: profileCardTitle.secondary.fontFamily,
                    fontSize: profileCardTitle.secondary.fontSize,
                    fontStyle: profileCardTitle.secondary.fontStyle,
                    color: colors.inkMuted,
                    marginTop: 2,
                  }}
                >
                  {profileCardTitle.secondary.text}
                </Text>
              </View>
              <Text style={{ color: colors.saffron, fontSize: 22 }}>›</Text>
            </View>

            <View style={[styles.profileDivider, { backgroundColor: colors.divider }]} />

            <View style={styles.profileStatsRow}>
              <View style={styles.profileStatCell}>
                <Text
                  style={[
                    styles.profileStatValue,
                    {
                      color: colors.saffronDeep,
                      fontFamily: typography.readerTitle.fontFamily,
                    },
                  ]}
                >
                  {profileTotals.totalReads}
                </Text>
                <Text style={[styles.profileStatLabel, { color: colors.inkMuted }]}>
                  {pick(defaultLang, { hi: 'श्लोक', en: 'VERSES', gu: 'શ્લોક', kn: 'ಶ್ಲೋಕ' })}
                </Text>
              </View>
              <View style={[styles.profileStatRule, { backgroundColor: colors.divider }]} />
              <View style={styles.profileStatCell}>
                <Text
                  style={[
                    styles.profileStatValue,
                    {
                      color: colors.saffronDeep,
                      fontFamily: typography.readerTitle.fontFamily,
                    },
                  ]}
                >
                  {profileTotals.totalRounds}
                </Text>
                <Text style={[styles.profileStatLabel, { color: colors.inkMuted }]}>
                  {pick(defaultLang, { hi: 'आवृत्ति', en: 'ROUNDS', gu: 'આવૃત્તિ', kn: 'ಆವೃತ್ತಿ' })}
                </Text>
              </View>
              <View style={[styles.profileStatRule, { backgroundColor: colors.divider }]} />
              <View style={styles.profileStatCell}>
                <Text
                  style={[
                    styles.profileStatValue,
                    {
                      color: colors.saffronDeep,
                      fontFamily: typography.readerTitle.fontFamily,
                    },
                  ]}
                >
                  {streak}
                </Text>
                <Text style={[styles.profileStatLabel, { color: colors.inkMuted }]}>
                  {pick(defaultLang, { hi: 'श्रृंखला', en: 'STREAK', gu: 'શ્રેણી', kn: 'ಸರಣಿ' })}
                </Text>
              </View>
            </View>
          </Pressable>

          {/* Wishlist Card */}
          <Pressable
            onPress={() => navigation.navigate('Wishlist')}
            accessibilityRole="button"
            accessibilityLabel={`Wishlist, ${bookmarks.length} verse${bookmarks.length !== 1 ? 's' : ''} saved`}
            style={({ pressed }) => [
              styles.section,
              { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <View style={[styles.sectionIcon, { backgroundColor: colors.saffron }]}>
              <Text style={{ color: '#fff', fontSize: 16 }}>♥</Text>
            </View>
            <View style={styles.sectionMeta}>
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.ink }}>
                Wishlist
              </Text>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: colors.inkMuted, marginTop: 1 }}>
                {bookmarks.length} verse{bookmarks.length !== 1 ? 's' : ''} saved
              </Text>
            </View>
            <Text style={{ color: colors.saffron, fontSize: 20 }}>›</Text>
          </Pressable>

          {/* Reminders Card */}
          <Pressable
            onPress={() => navigation.navigate('Reminders')}
            accessibilityRole="button"
            accessibilityLabel={
              notifPrefs.dailyVerseEnabled
                ? `Reminders, daily verse on at ${formatReminderTimes(notifPrefs.times)}`
                : 'Reminders, daily verse off'
            }
            style={({ pressed }) => [
              styles.section,
              { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <View style={[styles.sectionIcon, { backgroundColor: colors.gold }]}>
              <Text style={{ color: colors.onPrimary, fontFamily: typography.readerTitle.fontFamily, fontSize: 18 }}>
                ॐ
              </Text>
            </View>
            <View style={styles.sectionMeta}>
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.ink }}>
                Reminders
              </Text>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: colors.inkMuted, marginTop: 1 }}>
                {notifPrefs.dailyVerseEnabled
                  ? `Daily verse at ${formatReminderTimes(notifPrefs.times)}`
                  : 'Daily verse off'}
              </Text>
            </View>
            <Text style={{ color: colors.saffron, fontSize: 20 }}>›</Text>
          </Pressable>

          {/* Japam Alarms Card */}
          <Pressable
            onPress={() => navigation.navigate('JapamAlarms')}
            accessibilityRole="button"
            accessibilityLabel={
              activeJapamAlarms.length > 0
                ? `Japam alarms, ${activeJapamAlarms.length} active`
                : 'Japam alarms, none set'
            }
            style={({ pressed }) => [
              styles.section,
              { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <View style={[styles.sectionIcon, { backgroundColor: colors.saffronDeep }]}>
              <Text style={{ color: colors.onPrimary, fontSize: 18 }}>⏰</Text>
            </View>
            <View style={styles.sectionMeta}>
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.ink }}>
                Japam Alarms
              </Text>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: colors.inkMuted, marginTop: 1 }}>
                {activeJapamAlarms.length > 0
                  ? `${activeJapamAlarms.length} alarm${activeJapamAlarms.length !== 1 ? 's' : ''} at ${formatReminderTimes(activeJapamAlarms.map((a) => a.time))}`
                  : 'Wake to a mantra you love'}
              </Text>
            </View>
            <Text style={{ color: colors.saffron, fontSize: 20 }}>›</Text>
          </Pressable>

          {/* Language Card */}
          <View style={[styles.section, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, flexDirection: 'column', alignItems: 'stretch' }]}>
            <View
              accessibilityRole="header"
              style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}
            >
              <View style={[styles.sectionIcon, { backgroundColor: colors.gold }]}>
                <Text style={{ color: '#fff', fontSize: 14 }}>अ</Text>
              </View>
              <View>
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.ink }}>
                  Language
                </Text>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: colors.inkMuted, marginTop: 1 }}>
                  Default reading language
                </Text>
              </View>
            </View>

            <View style={styles.langRow} accessibilityRole="radiogroup" accessibilityLabel="Default reading language">
              {LANGUAGES.map((opt) => {
                const selected = defaultLang === opt.value;
                const family =
                  opt.script === 'devanagari'
                    ? typography.readerTitle.fontFamily
                    : opt.script === 'latin'
                      ? fontFamilies.latin
                      : opt.script === 'gujarati'
                        ? fontFamilies.gujaratiBold
                        : fontFamilies.kannadaBold;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => setDefaultLang(opt.value)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    accessibilityLabel={opt.a11yLabel}
                    style={[
                      styles.langOption,
                      { borderColor: selected ? colors.saffron : colors.divider },
                      selected && { backgroundColor: 'rgba(184, 98, 27, 0.1)' },
                    ]}
                  >
                    {selected && <Text style={[styles.langCheck, { color: colors.saffron }]}>✓</Text>}
                    <Text style={[styles.langLabel, { fontFamily: family, color: selected ? colors.saffronDeep : colors.ink }]}>
                      {opt.nativeLabel}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Reading size (PRD-04 slice 2) */}
          <ReadingSizeCard />

          {/* Panchang Disclosure */}
          <View style={[styles.section, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, flexDirection: 'column', alignItems: 'stretch' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <View style={[styles.sectionIcon, { backgroundColor: colors.gold }]}>
                <Text style={{ color: '#fff', fontSize: 14 }}>☽</Text>
              </View>
              <View>
                <Text style={{ fontFamily: defaultLang === 'en' ? 'Inter_600SemiBold' : scriptBodyFont(defaultLang, fontFamilies.devanagari), fontSize: 14, color: colors.ink }}>
                  {pick(defaultLang, { hi: 'पंचांग', en: 'Panchang', gu: 'પંચાંગ', kn: 'ಪಂಚಾಂಗ' })}
                </Text>
                <Text style={{ fontFamily: defaultLang === 'en' ? fontFamilies.devanagari : 'Inter_500Medium', fontSize: 11, color: colors.inkMuted, marginTop: 1 }}>
                  {defaultLang === 'en' ? 'पंचांग पद्धति' : 'Panchang School'}
                </Text>
              </View>
            </View>
            <Text style={{ fontFamily: defaultLang === 'en' ? 'CormorantGaramond_400Regular_Italic' : scriptBodyFont(defaultLang, typography.meaning.fontFamily), fontSize: 12, lineHeight: 18, color: colors.inkMuted }}>
              {pick(defaultLang, {
                hi: `पंचांग · ${panchangLocation.labelHi}, भारत · पूर्णिमांत/अमान्त चयन\nतिथि की गणना सूर्य सिद्धांत + आधुनिक खगोलीय सुधार के अनुसार होती है। स्थान पंचांग टैब से बदलें।`,
                en: `Panchang · ${panchangLocation.labelEn}, India · Purnimant/Amanta selectable\nTithi follows Surya Siddhanta with modern corrections. Change the location from the Panchang tab.`,
                gu: `પંચાંગ · ${contentByLang(defaultLang, panchangLocation.labelHi, panchangLocation.labelEn)}, ભારત · પૂર્ણિમાંત/અમાન્ત પસંદગી\nતિથિની ગણતરી સૂર્ય સિદ્ધાંત + આધુનિક ખગોળીય સુધારા મુજબ થાય છે. સ્થાન પંચાંગ ટૅબમાંથી બદલો.`,
                kn: `ಪಂಚಾಂಗ · ${contentByLang(defaultLang, panchangLocation.labelHi, panchangLocation.labelEn)}, ಭಾರತ · ಪೂರ್ಣಿಮಾಂತ/ಅಮಾಂತ ಆಯ್ಕೆ\nತಿಥಿ ಲೆಕ್ಕಾಚಾರ ಸೂರ್ಯ ಸಿದ್ಧಾಂತ + ಆಧುನಿಕ ಖಗೋಳ ಸುಧಾರಣೆ ಪ್ರಕಾರ. ಸ್ಥಳವನ್ನು ಪಂಚಾಂಗ ಟ್ಯಾಬ್‌ನಿಂದ ಬದಲಿಸಿ.`,
              })}
            </Text>
          </View>

          {/* Links */}
          <View style={[styles.section, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, flexDirection: 'column', alignItems: 'stretch', paddingVertical: 4, paddingHorizontal: 16 }]}>
            <Pressable
              onPress={() => setDisclaimerVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="About and disclaimer"
              style={[styles.linkRow, { borderBottomColor: colors.divider }]}
            >
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: colors.ink }}>About & Disclaimer</Text>
              <Text style={{ color: colors.inkMuted, fontSize: 16 }}>›</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                const url = buildDiscrepancyMailto();
                Linking.canOpenURL(url).then((supported) => {
                  if (supported) {
                    Linking.openURL(url);
                  } else {
                    Alert.alert('Email', 'Please email us at incardible.app@gmail.com');
                  }
                });
              }}
              accessibilityRole="button"
              accessibilityLabel="Report an error"
              style={({ pressed }) => [styles.linkRowLast, pressed && { opacity: 0.6 }]}
            >
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: colors.ink }}>Report an Error</Text>
              <Text style={{ color: colors.inkMuted, fontSize: 16 }}>›</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>

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
                onPress={() => {
                const url = buildDiscrepancyMailto();
                Linking.canOpenURL(url).then((supported) => {
                  if (supported) {
                    Linking.openURL(url);
                  } else {
                    Alert.alert('Email', 'Please email us at incardible.app@gmail.com');
                  }
                });
              }}
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
  scroll: { paddingTop: 20, paddingBottom: 40, gap: 14 },
  titleArea: { marginBottom: 8 },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#3c1e0a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionMeta: { flex: 1 },
  langRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  langOption: {
    flexGrow: 1,
    flexBasis: '46%',
    height: 52,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  langLabel: {
    fontSize: 17,
    includeFontPadding: false,
    textAlign: 'center',
  },
  langCheck: {
    position: 'absolute',
    top: 4,
    right: 6,
    fontSize: 12,
    fontWeight: '600',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  linkRowLast: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
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
  profileCard: {
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    overflow: 'hidden',
    shadowColor: '#3c1e0a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileCrest: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileTitleBlock: {
    flex: 1,
  },
  profileDivider: {
    height: 1,
    opacity: 0.55,
    marginTop: 14,
    marginBottom: 12,
  },
  profileStatsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  profileStatCell: {
    flex: 1,
    alignItems: 'center',
  },
  profileStatRule: {
    width: 1,
    opacity: 0.5,
  },
  profileStatValue: {
    fontSize: 20,
    includeFontPadding: false,
  },
  profileStatLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginTop: 4,
  },
});
