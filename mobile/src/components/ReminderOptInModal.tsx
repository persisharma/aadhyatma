import React, { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { fontFamilies } from '@/theme/typography';
import { pick } from '@/utils/localize';
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
    setTimes,
    markOptInPromptShown,
  } = useNotificationPreferences();
  const [visible, setVisible] = useState(false);
  const [chosenTime, setChosenTime] = useState(prefs.times[0]);
  const [busy, setBusy] = useState(false);
  const [dismissedThisSession, setDismissedThisSession] = useState(false);

  // Sync visible when the gate flips on; reset chosenTime when we open.
  useEffect(() => {
    if (!shouldShowOptIn) {
      setDismissedThisSession(false);
      return;
    }
    if (!visible && !dismissedThisSession) {
      setChosenTime(prefs.times[0]);
      setVisible(true);
    }
  }, [shouldShowOptIn, visible, dismissedThisSession, prefs.times]);

  const close = useCallback(() => {
    setDismissedThisSession(true);
    setVisible(false);
    void markOptInPromptShown();
  }, [markOptInPromptShown]);

  const onEnable = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      await setTimes([chosenTime]);
      await setDailyVerseEnabled(true);
    } finally {
      setBusy(false);
      setDismissedThisSession(true);
      setVisible(false);
      void markOptInPromptShown();
    }
  }, [busy, chosenTime, setTimes, setDailyVerseEnabled, markOptInPromptShown]);

  // gu/kn need their own serif or the script renders as tofu; hi/en keep their
  // original faces exactly (English prose has always rendered in the Devanagari
  // serifs here, which carry Latin glyphs).
  const headingFont =
    lang === 'gu'
      ? fontFamilies.gujaratiBold
      : lang === 'kn'
        ? fontFamilies.kannadaBold
        : typography.readerTitle.fontFamily;
  const ledeFont =
    lang === 'gu'
      ? fontFamilies.gujarati
      : lang === 'kn'
        ? fontFamilies.kannada
        : typography.meaning.fontFamily;
  const labelFont =
    lang === 'gu'
      ? fontFamilies.gujarati
      : lang === 'kn'
        ? fontFamilies.kannada
        : lang === 'hi'
          ? typography.meaning.fontFamily // Cormorant has no Devanagari glyphs
          : typography.cardLatin.fontFamily;
  // Tracking/uppercase split the shirorekha on Indic labels — Latin-only.
  const indicLabelReset = lang !== 'en' && ({ letterSpacing: 0, textTransform: 'none' } as const);

  const notNow = pick(lang, { hi: 'अभी नहीं', en: 'Not now', gu: 'હમણાં નહીં', kn: 'ಈಗ ಬೇಡ' });

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
                { color: colors.ink, fontFamily: headingFont },
              ]}
            >
              {pick(lang, { hi: 'दैनिक श्लोक', en: 'Daily Verse', gu: 'દૈનિક શ્લોક', kn: 'ದೈನಿಕ ಶ್ಲೋಕ' })}
            </Text>
            <Pressable
              onPress={close}
              accessibilityRole="button"
              accessibilityLabel={notNow}
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
                  fontFamily: headingFont,
                  fontSize: 22,
                },
              ]}
            >
              {pick(lang, {
                hi: 'हर प्रातः एक श्लोक',
                en: 'A verse every morning',
                gu: 'દરરોજ સવારે એક શ્લોક',
                kn: 'ಪ್ರತಿ ಬೆಳಗ್ಗೆ ಒಂದು ಶ್ಲೋಕ',
              })}
            </Text>
            <Text
              style={[
                styles.lede,
                {
                  color: colors.inkSoft,
                  fontFamily: ledeFont,
                  fontSize: 15,
                  lineHeight: 24,
                },
              ]}
            >
              {pick(lang, {
                hi: 'अपनी पसंद के समय पर एक श्लोक स्क्रीन पर आएगा — खोलते ही वही श्लोक पढ़ने को मिलेगा। आप कभी भी बंद कर सकते हैं।',
                en: 'One verse arrives at the time you choose. Tap to open it, or dismiss. You can turn this off any time.',
                gu: 'તમે પસંદ કરેલા સમયે એક શ્લોક આવશે. ખોલવા માટે ટૅપ કરો, અથવા બંધ કરો. તમે આને ગમે ત્યારે બંધ કરી શકો છો.',
                kn: 'ನೀವು ಆಯ್ಕೆಮಾಡಿದ ಸಮಯದಲ್ಲಿ ಒಂದು ಶ್ಲೋಕ ಬರುತ್ತದೆ. ತೆರೆಯಲು ಟ್ಯಾಪ್ ಮಾಡಿ, ಅಥವಾ ಮುಚ್ಚಿ. ನೀವು ಇದನ್ನು ಯಾವಾಗ ಬೇಕಾದರೂ ಆಫ್ ಮಾಡಬಹುದು.',
              })}
            </Text>

            <View style={styles.timeBlock}>
              <Text
                style={[
                  styles.timeLabel,
                  {
                    color: colors.inkMuted,
                    fontFamily: labelFont,
                  },
                  indicLabelReset,
                ]}
              >
                {pick(lang, { hi: 'समय चुनें', en: 'Choose time', gu: 'સમય પસંદ કરો', kn: 'ಸಮಯ ಆಯ್ಕೆಮಾಡಿ' })}
              </Text>
              <TimeStepper value={chosenTime} onChange={setChosenTime} />
            </View>

            <Pressable
              onPress={onEnable}
              accessibilityRole="button"
              accessibilityLabel={pick(lang, {
                hi: 'सक्षम करें',
                en: 'Enable daily verse',
                gu: 'દૈનિક શ્લોક સક્ષમ કરો',
                kn: 'ದೈನಿಕ ಶ್ಲೋಕ ಸಕ್ರಿಯಗೊಳಿಸಿ',
              })}
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
                  { fontFamily: headingFont, color: colors.onPrimary },
                ]}
              >
                {pick(lang, { hi: 'सक्षम करें', en: 'Enable', gu: 'સક્ષમ કરો', kn: 'ಸಕ್ರಿಯಗೊಳಿಸಿ' })}
              </Text>
            </Pressable>

            <Pressable
              onPress={close}
              accessibilityRole="button"
              accessibilityLabel={notNow}
              style={({ pressed }) => [
                styles.secondary,
                { opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <Text
                style={[
                  styles.secondaryText,
                  { color: colors.inkMuted, fontFamily: labelFont },
                  indicLabelReset,
                ]}
              >
                {notNow}
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
  lead: {},
  lede: {},
  timeBlock: {
    marginTop: 8,
    gap: 10,
  },
  timeLabel: {
    fontSize: 11,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
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
  },
});
