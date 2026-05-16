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
import { useNotificationPreferences } from '@/contexts/NotificationPreferencesContext';
import { applyQuietHours } from '@/notifications/pure';
import TimeStepper from '@/components/TimeStepper';
import type { MoreStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<MoreStackParamList, 'Reminders'>;

export default function ReminderSettingsScreen({ navigation }: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const {
    prefs,
    permissionStatus,
    isLoading,
    setDailyVerseEnabled,
    setTime,
    setQuietHours,
  } = useNotificationPreferences();

  const isHi = lang === 'hi';

  const onToggle = useCallback(
    async (next: boolean) => {
      await setDailyVerseEnabled(next);
    },
    [setDailyVerseEnabled]
  );

  const onOpenSystemSettings = useCallback(() => {
    Linking.openSettings().catch(() => undefined);
  }, []);

  // Compute the time we'll actually fire (after quiet-hours clamp) so the user
  // sees the truth instead of their nominal time when the two collide.
  const adjusted = applyQuietHours(prefs.time, prefs.quietStart, prefs.quietEnd);
  const clamped =
    adjusted.hour !== prefs.time.hour || adjusted.minute !== prefs.time.minute;

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
                { color: colors.ink, fontFamily: typography.readerTitle.fontFamily },
              ]}
            >
              {isHi ? 'स्मरण' : 'Reminders'}
            </Text>
            <Text
              style={[
                styles.titleEn,
                {
                  color: colors.inkMuted,
                  fontFamily: 'CormorantGaramond_400Regular_Italic',
                },
              ]}
            >
              {isHi ? 'Reminders' : 'स्मरण'}
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
                    { color: colors.ink, fontFamily: typography.readerTitle.fontFamily },
                  ]}
                >
                  {isHi ? 'दैनिक श्लोक' : 'Daily verse'}
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
                  {isHi
                    ? 'चुने हुए समय पर एक श्लोक स्क्रीन पर आएगा।'
                    : 'One verse at the time you choose.'}
                </Text>
              </View>
              <Switch
                value={prefs.dailyVerseEnabled}
                onValueChange={onToggle}
                disabled={isLoading}
                trackColor={{ false: colors.divider, true: colors.saffron }}
                thumbColor={colors.parchment}
                ios_backgroundColor={colors.divider}
                accessibilityLabel={isHi ? 'दैनिक श्लोक चालू / बंद' : 'Toggle daily verse'}
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
                  {isHi
                    ? 'सूचना अनुमति बंद है — सेटिंग्स में जाकर खोलें।'
                    : 'Notifications are disabled. Tap to open Settings.'}
                </Text>
              </Pressable>
            )}
          </View>

          {/* Time picker */}
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
                { color: colors.ink, fontFamily: typography.readerTitle.fontFamily },
              ]}
            >
              {isHi ? 'समय' : 'Time'}
            </Text>
            <Text
              style={[
                styles.cardSub,
                { color: colors.inkMuted, fontFamily: typography.meaning.fontFamily },
              ]}
            >
              {isHi
                ? 'जब आप रोज़ श्लोक प्राप्त करना चाहें।'
                : 'When the daily verse arrives.'}
            </Text>
            <View style={styles.timeRow}>
              <TimeStepper value={prefs.time} onChange={setTime} />
            </View>
            {clamped && (
              <Text
                style={[
                  styles.note,
                  { color: colors.saffronDeep, fontFamily: typography.cardLatin.fontFamily },
                ]}
              >
                {isHi
                  ? `यह समय शांत घंटों में है — सूचना ${pad(adjusted.hour)}:${pad(adjusted.minute)} पर आएगी।`
                  : `Inside quiet hours — notification will fire at ${pad(adjusted.hour)}:${pad(adjusted.minute)}.`}
              </Text>
            )}
          </View>

          {/* Quiet hours */}
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
                { color: colors.ink, fontFamily: typography.readerTitle.fontFamily },
              ]}
            >
              {isHi ? 'शांत घंटे' : 'Quiet hours'}
            </Text>
            <Text
              style={[
                styles.cardSub,
                { color: colors.inkMuted, fontFamily: typography.meaning.fontFamily },
              ]}
            >
              {isHi
                ? 'इन घंटों में सूचना नहीं आएगी।'
                : 'No notifications inside this window.'}
            </Text>
            <View style={styles.quietRow}>
              <View style={styles.quietCol}>
                <Text
                  style={[
                    styles.quietLabel,
                    {
                      color: colors.inkMuted,
                      fontFamily: typography.cardLatin.fontFamily,
                    },
                  ]}
                >
                  {isHi ? 'से' : 'From'}
                </Text>
                <TimeStepper
                  value={prefs.quietStart}
                  onChange={(t) => setQuietHours(t, prefs.quietEnd)}
                />
              </View>
              <View style={styles.quietCol}>
                <Text
                  style={[
                    styles.quietLabel,
                    {
                      color: colors.inkMuted,
                      fontFamily: typography.cardLatin.fontFamily,
                    },
                  ]}
                >
                  {isHi ? 'तक' : 'Until'}
                </Text>
                <TimeStepper
                  value={prefs.quietEnd}
                  onChange={(t) => setQuietHours(prefs.quietStart, t)}
                />
              </View>
            </View>
          </View>

          <Text
            style={[
              styles.footnote,
              { color: colors.inkMuted, fontFamily: typography.cardLatin.fontFamily },
            ]}
          >
            {isHi
              ? 'सूचनाएँ इस उपकरण पर ही बनती हैं — सर्वर पर कुछ नहीं जाता।'
              : 'Notifications are scheduled on this device. Nothing leaves your phone.'}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function pad(n: number): string {
  return `${n}`.padStart(2, '0');
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
  timeRow: {
    marginTop: 4,
    alignItems: 'flex-start',
  },
  quietRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  quietCol: {
    gap: 6,
  },
  quietLabel: {
    fontSize: 10,
    letterSpacing: 2.4,
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
