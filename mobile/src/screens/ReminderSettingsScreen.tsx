import React, { useCallback } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { pick } from '@/utils/localize';
import { fontFamilies } from '@/theme/typography';
import { useNotificationPreferences } from '@/contexts/NotificationPreferencesContext';
import { MAX_REMINDER_TIMES, type TimeOfDay } from '@/notifications/pure';
import TimeStepper from '@/components/TimeStepper';
import { orderTitlesByLanguage } from '@/utils/titleByLanguage';
import type { MoreStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<MoreStackParamList, 'Reminders'>;

const DEFAULT_NEW_TIME: TimeOfDay = { hour: 18, minute: 0 };

export default function ReminderSettingsScreen({ navigation }: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const {
    prefs,
    permissionStatus,
    isLoading,
    setDailyVerseEnabled,
    setTimes,
  } = useNotificationPreferences();

  const scriptSerifBold =
    lang === 'gu' ? fontFamilies.gujaratiBold : lang === 'kn' ? fontFamilies.kannadaBold : null;
  const screenTitle = orderTitlesByLanguage(lang, 'स्मरण', 'Reminders', {
    devPrimary: 22,
    devSecondary: 14,
    latPrimary: 22,
    latSecondary: 14,
  });

  const onToggle = useCallback(
    async (next: boolean) => {
      await setDailyVerseEnabled(next);
    },
    [setDailyVerseEnabled]
  );

  const onOpenSystemSettings = useCallback(() => {
    Linking.openSettings().catch(() => undefined);
  }, []);

  const updateAt = useCallback(
    async (index: number, time: TimeOfDay) => {
      const next = prefs.times.map((t, i) => (i === index ? time : t));
      await setTimes(next);
    },
    [prefs.times, setTimes]
  );

  const removeAt = useCallback(
    async (index: number) => {
      const next = prefs.times.filter((_, i) => i !== index);
      await setTimes(next);
    },
    [prefs.times, setTimes]
  );

  const addTime = useCallback(async () => {
    // Suggest a time that doesn't collide with an existing reminder. Fall back
    // to the default; setTimes will dedupe if the user already has it set.
    const existing = new Set(prefs.times.map((t) => t.hour * 60 + t.minute));
    let candidate: TimeOfDay = DEFAULT_NEW_TIME;
    if (existing.has(candidate.hour * 60 + candidate.minute)) {
      for (let h = 0; h < 24; h += 1) {
        const trial = { hour: h, minute: 0 };
        if (!existing.has(trial.hour * 60 + trial.minute)) {
          candidate = trial;
          break;
        }
      }
    }
    await setTimes([...prefs.times, candidate]);
  }, [prefs.times, setTimes]);

  const canAdd = prefs.times.length < MAX_REMINDER_TIMES;
  const canRemove = prefs.times.length > 1;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={16}
            style={({ pressed }) => [
              styles.back,
              { backgroundColor: colors.parchmentSoft, borderColor: colors.divider },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={[styles.backGlyph, { color: colors.inkSoft }]}>‹</Text>
          </Pressable>
          <View style={styles.titleBlock}>
            <Text
              style={[
                styles.titleHi,
                {
                  color: colors.ink,
                  fontFamily: screenTitle.primary.fontFamily,
                  fontSize: screenTitle.primary.fontSize,
                  fontStyle: screenTitle.primary.fontStyle,
                },
              ]}
            >
              {screenTitle.primary.text}
            </Text>
            <Text
              style={[
                styles.titleEn,
                {
                  color: colors.inkMuted,
                  fontFamily: screenTitle.secondary.fontFamily,
                  fontSize: screenTitle.secondary.fontSize,
                  fontStyle: screenTitle.secondary.fontStyle,
                },
              ]}
            >
              {screenTitle.secondary.text}
            </Text>
          </View>
          <View style={styles.backSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingHorizontal: spacing.xxl, paddingBottom: spacing.xxl * 2 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Daily verse toggle */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.parchmentSoft,
                borderColor: colors.divider,
                borderRadius: radii.lg,
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardTextBlock}>
                <Text
                  style={[
                    styles.cardTitle,
                    { color: colors.ink, fontFamily: scriptSerifBold ?? typography.readerTitle.fontFamily },
                  ]}
                >
                  {pick(lang, { hi: 'दैनिक श्लोक', en: 'Daily verse', gu: 'દૈનિક શ્લોક', kn: 'ದೈನಿಕ ಶ್ಲೋಕ' })}
                </Text>
                <Text
                  style={[
                    styles.cardSub,
                    {
                      color: colors.inkMuted,
                      fontFamily: typography.meaning.fontFamily,
                    },
                  ]}
                >
                  {pick(lang, { hi: 'चुने हुए समयों पर श्लोक स्क्रीन पर आएँगे।', en: 'A verse at every time you choose.', gu: 'પસંદ કરેલા સમયે શ્લોક સ્ક્રીન પર આવશે.', kn: 'ಆಯ್ಕೆಮಾಡಿದ ಸಮಯಗಳಲ್ಲಿ ಶ್ಲೋಕ ಪರದೆಯಲ್ಲಿ ಬರುತ್ತದೆ.' })}
                </Text>
              </View>
              <Switch
                value={prefs.dailyVerseEnabled}
                onValueChange={onToggle}
                disabled={isLoading}
                trackColor={{ false: colors.divider, true: colors.saffron }}
                thumbColor={colors.parchment}
                ios_backgroundColor={colors.divider}
                accessibilityLabel={pick(lang, { hi: 'दैनिक श्लोक चालू / बंद', en: 'Toggle daily verse', gu: 'દૈનિક શ્લોક ચાલુ / બંધ', kn: 'ದೈನಿಕ ಶ್ಲೋಕ ಆನ್ / ಆಫ್' })}
              />
            </View>

            {permissionStatus === 'denied' && (
              <Pressable
                onPress={onOpenSystemSettings}
                accessibilityRole="button"
                accessibilityLabel="Open iOS settings"
                style={({ pressed }) => [
                  styles.permissionBanner,
                  {
                    backgroundColor: colors.parchmentDeep,
                    borderColor: colors.divider,
                    borderRadius: radii.sm,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.permissionText,
                    {
                      color: colors.inkSoft,
                      fontFamily: typography.meaning.fontFamily,
                    },
                  ]}
                >
                  {pick(lang, { hi: 'सूचना अनुमति बंद है — सेटिंग्स में जाकर खोलें।', en: 'Notifications are disabled. Tap to open Settings.', gu: 'સૂચના પરવાનગી બંધ છે — સેટિંગ્સમાં જઈને ખોલો.', kn: 'ಅಧಿಸೂಚನೆ ಅನುಮತಿ ಆಫ್ ಆಗಿದೆ — ಸೆಟ್ಟಿಂಗ್ಸ್ ತೆರೆಯಲು ಟ್ಯಾಪ್ ಮಾಡಿ.' })}
                </Text>
              </Pressable>
            )}
          </View>

          {/* Times picker — supports multiple reminders */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.parchmentSoft,
                borderColor: colors.divider,
                borderRadius: radii.lg,
              },
            ]}
          >
            <Text
              style={[
                styles.cardTitle,
                { color: colors.ink, fontFamily: scriptSerifBold ?? typography.readerTitle.fontFamily },
              ]}
            >
              {pick(lang, { hi: 'समय', en: 'Times', gu: 'સમય', kn: 'ಸಮಯ' })}
            </Text>
            <Text
              style={[
                styles.cardSub,
                { color: colors.inkMuted, fontFamily: typography.meaning.fontFamily },
              ]}
            >
              {pick(lang, { hi: `जब आप रोज़ श्लोक प्राप्त करना चाहें। अधिकतम ${MAX_REMINDER_TIMES} समय जोड़ सकते हैं।`, en: `When the daily verse arrives. Add up to ${MAX_REMINDER_TIMES}.`, gu: `તમે રોજ શ્લોક મેળવવા માગો ત્યારે. વધુમાં વધુ ${MAX_REMINDER_TIMES} સમય ઉમેરી શકો.`, kn: `ನೀವು ಪ್ರತಿದಿನ ಶ್ಲೋಕ ಪಡೆಯಲು ಬಯಸಿದಾಗ. ಗರಿಷ್ಠ ${MAX_REMINDER_TIMES} ಸಮಯ ಸೇರಿಸಬಹುದು.` })}
            </Text>

            <View style={styles.timesList}>
              {prefs.times.map((t, index) => (
                <View key={`${t.hour}-${t.minute}-${index}`} style={styles.timeRow}>
                  <TimeStepper
                    value={t}
                    taken={
                      new Set(
                        prefs.times
                          .filter((_, i) => i !== index)
                          .map((o) => o.hour * 60 + o.minute)
                      )
                    }
                    onChange={(next) => {
                      updateAt(index, next);
                    }}
                  />
                  {canRemove && (
                    <Pressable
                      onPress={() => removeAt(index)}
                      accessibilityRole="button"
                      accessibilityLabel={
                        pick(lang, { hi: `समय हटाएँ ${index + 1}`, en: `Remove reminder ${index + 1}`, gu: `સમય દૂર કરો ${index + 1}`, kn: `ಸಮಯ ತೆಗೆದುಹಾಕಿ ${index + 1}` })
                      }
                      hitSlop={10}
                      style={({ pressed }) => [
                        styles.removeBtn,
                        {
                          borderColor: colors.divider,
                          backgroundColor: colors.parchmentDeep,
                          borderRadius: radii.sm,
                          opacity: pressed ? 0.6 : 1,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.removeGlyph,
                          { color: colors.inkSoft },
                        ]}
                      >
                        ✕
                      </Text>
                    </Pressable>
                  )}
                </View>
              ))}
            </View>

            {canAdd && (
              <Pressable
                onPress={addTime}
                accessibilityRole="button"
                accessibilityLabel={pick(lang, { hi: 'समय जोड़ें', en: 'Add reminder', gu: 'સમય ઉમેરો', kn: 'ಸಮಯ ಸೇರಿಸಿ' })}
                style={({ pressed }) => [
                  styles.addBtn,
                  {
                    borderColor: colors.saffron,
                    borderRadius: radii.sm,
                    opacity: pressed ? 0.65 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.addBtnText,
                    {
                      color: colors.saffronDeep,
                      fontFamily: typography.cardLatin.fontFamily,
                    },
                  ]}
                >
                  {pick(lang, { hi: '+ समय जोड़ें', en: '+ Add reminder', gu: '+ સમય ઉમેરો', kn: '+ ಸಮಯ ಸೇರಿಸಿ' })}
                </Text>
              </Pressable>
            )}
            {!canAdd && (
              <Text
                style={[
                  styles.note,
                  { color: colors.inkMuted, fontFamily: typography.cardLatin.fontFamily },
                ]}
              >
                {pick(lang, { hi: `अधिकतम ${MAX_REMINDER_TIMES} समय जोड़े जा सकते हैं।`, en: `Up to ${MAX_REMINDER_TIMES} reminders.`, gu: `વધુમાં વધુ ${MAX_REMINDER_TIMES} સમય ઉમેરી શકાય.`, kn: `ಗರಿಷ್ಠ ${MAX_REMINDER_TIMES} ಸಮಯ ಸೇರಿಸಬಹುದು.` })}
              </Text>
            )}
          </View>

          <Text
            style={[
              styles.footnote,
              { color: colors.inkMuted, fontFamily: typography.cardLatin.fontFamily },
            ]}
          >
            {pick(lang, { hi: 'सूचनाएँ इस उपकरण पर ही बनती हैं — सर्वर पर कुछ नहीं जाता।', en: 'Notifications are scheduled on this device. Nothing leaves your phone.', gu: 'સૂચનાઓ આ ઉપકરણ પર જ બને છે — સર્વર પર કંઈ જતું નથી.', kn: 'ಅಧಿಸೂಚನೆಗಳು ಈ ಸಾಧನದಲ್ಲೇ ರಚಿಸಲ್ಪಡುತ್ತವೆ — ಸರ್ವರ್‌ಗೆ ಏನೂ ಹೋಗುವುದಿಲ್ಲ.' })}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topBar: {
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backGlyph: {
    fontSize: 22,
    lineHeight: 24,
    marginTop: -2,
    includeFontPadding: false,
  },
  backSpacer: {
    width: 44,
    height: 44,
  },
  titleBlock: {
    flex: 1,
    alignItems: 'center',
  },
  titleHi: {
    fontSize: 18,
    textAlign: 'center',
    includeFontPadding: false,
  },
  titleEn: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 2,
    fontStyle: 'italic',
    includeFontPadding: false,
  },
  scroll: {
    paddingTop: 6,
    gap: 14,
  },
  card: {
    borderWidth: 1,
    padding: 18,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTextBlock: {
    flex: 1,
    paddingRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    includeFontPadding: false,
  },
  cardSub: {
    fontSize: 13,
    lineHeight: 20,
    includeFontPadding: false,
    marginTop: 2,
  },
  timesList: {
    marginTop: 4,
    gap: 12,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeGlyph: {
    fontSize: 14,
    lineHeight: 16,
    includeFontPadding: false,
  },
  addBtn: {
    marginTop: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
  },
  addBtnText: {
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  permissionBanner: {
    marginTop: 12,
    padding: 12,
    borderWidth: 1,
  },
  permissionText: {
    fontSize: 13,
    lineHeight: 20,
    includeFontPadding: false,
  },
  note: {
    fontSize: 11,
    letterSpacing: 1.4,
    marginTop: 6,
    includeFontPadding: false,
  },
  footnote: {
    fontSize: 11,
    letterSpacing: 1.4,
    textAlign: 'center',
    marginTop: 18,
    includeFontPadding: false,
  },
});
