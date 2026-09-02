import React, { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Updates from 'expo-updates';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { pick } from '@/utils/localize';
import { fontFamilies } from '@/theme/typography';

/**
 * "A fresh update is ready" prompt.
 *
 * We keep expo-updates' default flow untouched: on launch it checks the
 * `production` branch and downloads any new OTA bundle in the background,
 * applying it on the *next* cold start. That alone means users only see new
 * content after they happen to relaunch.
 *
 * This modal closes that gap without blocking startup. `useUpdates()` exposes
 * `isUpdatePending`, which flips true once a background download has finished
 * and is staged for the next launch. When that happens we offer a one-tap
 * `reloadAsync()` so the user gets the new content immediately. Tapping
 * "Later" simply falls back to the default behaviour — the staged update still
 * applies on the next natural relaunch.
 *
 * Guards:
 *  - `Updates.isEnabled` is false in dev clients / Expo Go, where
 *    `reloadAsync()` throws. We never show the modal there.
 *  - Dismissal is per-pending-update: once dismissed we don't nag again until a
 *    newer update is staged.
 */
export default function UpdateReadyModal() {
  const { colors, typography, radii, spacing } = useTheme();
  const { lang } = useGitaLanguage();
  const scriptSerif = lang === 'gu' ? fontFamilies.gujarati : lang === 'kn' ? fontFamilies.kannada : null;
  const scriptSerifBold =
    lang === 'gu' ? fontFamilies.gujaratiBold : lang === 'kn' ? fontFamilies.kannadaBold : null;

  const { isUpdatePending } = Updates.useUpdates();
  const [dismissed, setDismissed] = useState(false);
  const [busy, setBusy] = useState(false);

  // Reset the dismissal latch whenever a fresh update is staged so a *new*
  // download re-prompts even if a prior one was dismissed this session.
  useEffect(() => {
    if (isUpdatePending) setDismissed(false);
  }, [isUpdatePending]);

  const visible = Updates.isEnabled && isUpdatePending && !dismissed;

  const onLater = useCallback(() => setDismissed(true), []);

  const onUpdate = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      await Updates.reloadAsync();
    } catch {
      // reloadAsync can reject (e.g. transient native error); fall back to the
      // default behaviour — the update still applies on the next launch.
      setBusy(false);
      setDismissed(true);
    }
  }, [busy]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onLater}>
      <View style={[styles.backdrop, { backgroundColor: colors.modalBackdrop }]}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.parchment,
              borderRadius: radii.lg,
              padding: spacing.xxl,
            },
          ]}
        >
          <Text
            style={[
              styles.title,
              { color: colors.ink, fontFamily: scriptSerifBold ?? typography.readerTitle.fontFamily },
            ]}
          >
            {pick(lang, {
              hi: 'नया अपडेट तैयार है',
              en: 'A fresh update is ready',
              gu: 'નવું અપડેટ તૈયાર છે',
              kn: 'ಹೊಸ ಅಪ್‌ಡೇಟ್ ಸಿದ್ಧವಾಗಿದೆ',
            })}
          </Text>
          <Text
            style={[
              styles.body,
              { color: colors.inkSoft, fontFamily: scriptSerif ?? typography.meaning.fontFamily },
            ]}
          >
            {pick(lang, {
              hi: 'नई सामग्री और सुधार डाउनलोड हो चुके हैं। अभी लागू करें, या ऐप दोबारा खोलने पर अपने आप लागू हो जाएँगे।',
              en: 'New content and improvements have been downloaded. Apply them now, or they’ll apply automatically next time you open the app.',
              gu: 'નવી સામગ્રી અને સુધારા ડાઉનલોડ થઈ ગયા છે. હમણાં લાગુ કરો, અથવા ઍપ ફરી ખોલતાં આપમેળે લાગુ થશે.',
              kn: 'ಹೊಸ ವಿಷಯ ಮತ್ತು ಸುಧಾರಣೆಗಳು ಡೌನ್‌ಲೋಡ್ ಆಗಿವೆ. ಈಗ ಅನ್ವಯಿಸಿ, ಅಥವಾ ಆ್ಯಪ್ ಮತ್ತೆ ತೆರೆದಾಗ ತಾನಾಗಿಯೇ ಅನ್ವಯವಾಗುತ್ತದೆ.',
            })}
          </Text>

          <Pressable
            onPress={onUpdate}
            accessibilityRole="button"
            accessibilityLabel={pick(lang, { hi: 'अभी अपडेट करें', en: 'Update now', gu: 'હમણાં અપડેટ કરો', kn: 'ಈಗ ಅಪ್‌ಡೇಟ್ ಮಾಡಿ' })}
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
                { color: colors.onPrimary, fontFamily: scriptSerifBold ?? typography.readerTitle.fontFamily },
              ]}
            >
              {pick(lang, { hi: 'अभी अपडेट करें', en: 'Update now', gu: 'હમણાં અપડેટ કરો', kn: 'ಈಗ ಅಪ್‌ಡೇಟ್ ಮಾಡಿ' })}
            </Text>
          </Pressable>

          <Pressable
            onPress={onLater}
            accessibilityRole="button"
            accessibilityLabel={pick(lang, { hi: 'बाद में', en: 'Later', gu: 'પછી', kn: 'ನಂತರ' })}
            disabled={busy}
            style={({ pressed }) => [styles.secondary, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Text
              style={[
                styles.secondaryText,
                {
                  color: colors.inkMuted,
                  // hi must not fall back to Cormorant (no Devanagari glyphs)
                  fontFamily: scriptSerif ?? (lang === 'hi' ? typography.meaning.fontFamily : typography.cardLatin.fontFamily),
                },
                // tracking splits the shirorekha on Indic labels
                lang !== 'en' && { letterSpacing: 0 },
              ]}
            >
              {pick(lang, { hi: 'बाद में', en: 'Later', gu: 'પછી', kn: 'ನಂತರ' })}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    gap: 14,
  },
  title: {
    fontSize: 20,
    includeFontPadding: false,
  },
  body: {
    fontSize: 15,
    lineHeight: 23,
    includeFontPadding: false,
  },
  primary: {
    marginTop: 8,
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
    paddingVertical: 12,
    minHeight: 44,
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
