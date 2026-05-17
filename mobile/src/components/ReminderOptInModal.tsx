import React, { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { useNotificationPreferences } from '@/contexts/NotificationPreferencesContext';
import TimeStepper from './TimeStepper';

/**
 * First-run opt-in sheet for daily verse notifications (PRD-01 §5).
 *
 * Self-mounts based on `useNotificationPreferences().shouldShowOptIn`. The
 * provider gates this on the third app open so we earn the ask, never ambush.
 */
export default function ReminderOptInModal() {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const {
    shouldShowOptIn,
    prefs,
    setDailyVerseEnabled,
    setTime,
    markOptInPromptShown,
  } = useNotificationPreferences();
  const [visible, setVisible] = useState(false);
  const [chosenTime, setChosenTime] = useState(prefs.time);
  const [busy, setBusy] = useState(false);

  // Sync visible when the gate flips on; reset chosenTime when we open.
  useEffect(() => {
    if (shouldShowOptIn && !visible) {
      setChosenTime(prefs.time);
      setVisible(true);
    }
  }, [shouldShowOptIn, visible, prefs.time]);

  const close = useCallback(async () => {
    setVisible(false);
    await markOptInPromptShown();
  }, [markOptInPromptShown]);

  const onEnable = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      await setTime(chosenTime);
      await setDailyVerseEnabled(true);
    } finally {
      setBusy(false);
      await markOptInPromptShown();
      setVisible(false);
    }
  }, [busy, chosenTime, setTime, setDailyVerseEnabled, markOptInPromptShown]);

  const isHi = lang === 'hi';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={close}
    >
      <View style={[styles.root, { backgroundColor: colors.parchment }]}>
        <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
          <View style={[styles.header, { borderBottomColor: colors.divider }]}>
            <Text
              style={[
                styles.title,
                { color: colors.ink, fontFamily: typography.readerTitle.fontFamily },
              ]}
            >
              {isHi ? 'दैनिक श्लोक' : 'Daily Verse'}
            </Text>
            <Pressable
              onPress={close}
              accessibilityRole="button"
              accessibilityLabel={isHi ? 'अभी नहीं' : 'Not now'}
              hitSlop={16}
              style={({ pressed }) => [styles.close, pressed && { opacity: 0.7 }]}
            >
              <Text style={[styles.closeGlyph, { color: colors.saffron }]}>✕</Text>
            </Pressable>
          </View>

          <View
            style={[
              styles.body,
              { paddingHorizontal: spacing.xxl, paddingTop: spacing.xxl },
            ]}
          >
            <Text
              style={[
                styles.lead,
                {
                  color: colors.ink,
                  fontFamily: typography.readerTitle.fontFamily,
                  fontSize: 22,
                },
              ]}
            >
              {isHi
                ? 'हर प्रातः एक श्लोक'
                : 'A verse every morning'}
            </Text>
            <Text
              style={[
                styles.lede,
                {
                  color: colors.inkSoft,
                  fontFamily: typography.meaning.fontFamily,
                  fontSize: 15,
                  lineHeight: 24,
                },
              ]}
            >
              {isHi
                ? 'अपनी पसंद के समय पर एक श्लोक स्क्रीन पर आएगा — खोलते ही वही श्लोक पढ़ने को मिलेगा। आप कभी भी बंद कर सकते हैं।'
                : 'One verse arrives at the time you choose. Tap to open it, or dismiss. You can turn this off any time.'}
            </Text>

            <View style={styles.timeBlock}>
              <Text
                style={[
                  styles.timeLabel,
                  {
                    color: colors.inkMuted,
                    fontFamily: typography.cardLatin.fontFamily,
                  },
                ]}
              >
                {isHi ? 'समय चुनें' : 'Choose time'}
              </Text>
              <TimeStepper value={chosenTime} onChange={setChosenTime} />
            </View>

            <Pressable
              onPress={onEnable}
              accessibilityRole="button"
              accessibilityLabel={isHi ? 'सक्षम करें' : 'Enable daily verse'}
              disabled={busy}
              style={({ pressed }) => [
                styles.primary,
                {
                  backgroundColor: colors.saffron,
                  borderRadius: radii.md,
                  opacity: busy ? 0.6 : pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.primaryText,
                  { fontFamily: typography.readerTitle.fontFamily, color: colors.onPrimary },
                ]}
              >
                {isHi ? 'सक्षम करें' : 'Enable'}
              </Text>
            </Pressable>

            <Pressable
              onPress={close}
              accessibilityRole="button"
              accessibilityLabel={isHi ? 'अभी नहीं' : 'Not now'}
              style={({ pressed }) => [
                styles.secondary,
                { opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <Text
                style={[
                  styles.secondaryText,
                  { color: colors.inkMuted, fontFamily: typography.cardLatin.fontFamily },
                ]}
              >
                {isHi ? 'अभी नहीं' : 'Not now'}
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    includeFontPadding: false,
  },
  close: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeGlyph: {
    fontSize: 20,
    fontWeight: '600',
  },
  body: {
    flex: 1,
    gap: 18,
  },
  lead: {
    includeFontPadding: false,
  },
  lede: {
    includeFontPadding: false,
  },
  timeBlock: {
    marginTop: 8,
    gap: 10,
  },
  timeLabel: {
    fontSize: 11,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  primary: {
    marginTop: 12,
    paddingVertical: 14,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    fontSize: 16,
    includeFontPadding: false,
  },
  secondary: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    fontSize: 13,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
});
