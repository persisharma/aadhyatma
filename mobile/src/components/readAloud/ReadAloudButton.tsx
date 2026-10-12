import React, { useCallback } from 'react';
import AppIcon from '@/components/AppIcon';
import { Alert, Linking, Platform, Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { radii } from '@/theme/spacing';
import { LANGUAGES, useGitaLanguage, type Lang } from '@/data/gita/language';
import { pick } from '@/utils/localize';
import type { ReadAloudControl } from '@/screens/_useReaderReadAloud';

/**
 * The language's own name, in its own script — the string to interpolate when telling
 * the user which voice to install. Shared with `ReadAloudSettingsSheet`.
 */
export function languageName(lang: Lang): string {
  return (LANGUAGES.find((l) => l.value === lang) ?? LANGUAGES[0]).nativeLabel;
}

/**
 * The reader read-aloud control, rendered on the language-toggle row pinned to its
 * right edge — below the header/progress bar, not in `ReaderHeader` (design.md §56.2).
 *
 * A labelled pill so the affordance is legible rather than a bare glyph: a play/pause
 * icon plus a short label in the reading language. Three states:
 *   • idle        → ▶ + "सुनें / Listen"  (saffron-tint pill)
 *   • speaking    → ❚❚ + "रोकें / Pause"
 *   • unavailable → ▶ + "सुनें / Listen", muted + disabled; tapping explains why
 * The muted state is deliberate — hiding the control would leave the user with no way
 * to learn why read-aloud never appears.
 *
 * Playback uses the shared AppIcon play/pause symbols. The visible label is
 * localized, while the English accessibility labels stay stable for Maestro.
 * READ_ALOUD_GLYPH remains exported for compatibility with earlier callers.
 */
export const READ_ALOUD_GLYPH = '♪︎';
export default function ReadAloudButton({
  control,
  compact = false,
}: {
  control: ReadAloudControl;
  /**
   * Icon-only (no text label) for width-constrained headers. Used on the Chalisa
   * reader when a recorded `▶` is also present — the counter + `▶` + a labelled pill
   * would otherwise crush the centred title. Everywhere else the label shows.
   */
  compact?: boolean;
}) {
  const { colors } = useTheme();
  const { lang } = useGitaLanguage();

  const explainUnavailable = useCallback(() => {
    const title = pick(lang, {
      hi: 'आवाज़ उपलब्ध नहीं',
      en: 'Voice unavailable',
      gu: 'આવાજ ઉપલબ્ધ નથી',
      kn: 'ಧ್ವನಿ ಲಭ್ಯವಿಲ್ಲ',
    });
    // Names the language the user is actually reading in — read-aloud never
    // substitutes another one, so this is the voice they need to install.
    const name = languageName(lang);
    const body = pick(lang, {
      hi: `इस उपकरण में ${name} की आवाज़ नहीं है। उपकरण की सेटिंग्स में ${name} वाणी डाउनलोड करें।`,
      en: `This device has no ${name} voice installed. Add ${name} speech data in your device's settings.`,
      gu: `આ ઉપકરણમાં ${name} આવાજ નથી. ઉપકરણની સેટિંગ્સમાં ${name} વાણી ડાઉનલોડ કરો.`,
      kn: `ಈ ಸಾಧನದಲ್ಲಿ ${name} ಧ್ವನಿ ಇಲ್ಲ. ಸಾಧನದ ಸೆಟ್ಟಿಂಗ್‌ಗಳಲ್ಲಿ ${name} ವಾಣಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ.`,
    });
    const close = pick(lang, { hi: 'ठीक है', en: 'OK', gu: 'ઠીક છે', kn: 'ಸರಿ' });

    if (Platform.OS === 'android') {
      // iOS has no deep link to Settings → Accessibility → Spoken Content, so the
      // escape hatch is Android-only; there the intent lands directly on TTS settings.
      Alert.alert(title, body, [
        { text: close, style: 'cancel' },
        {
          text: pick(lang, {
            hi: 'सेटिंग्स खोलें',
            en: 'Open settings',
            gu: 'સેટિંગ્સ ખોલો',
            kn: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳನ್ನು ತೆರೆಯಿರಿ',
          }),
          onPress: () => {
            Linking.sendIntent('com.android.settings.TTS_SETTINGS').catch(() => {
              Linking.openSettings().catch(() => undefined);
            });
          },
        },
      ]);
      return;
    }
    Alert.alert(title, body, [{ text: close }]);
  }, [lang]);

  if (!control.visible) return null;

  const speaking = control.isSpeaking;
  // Visible label follows the reading language; the accessibilityLabel below stays
  // English and un-localized (Maestro taps it literally; default reading lang is hi).
  const label = speaking
    ? pick(lang, { hi: 'रोकें', en: 'Pause', gu: 'થોભો', kn: 'ವಿರಾಮ' })
    : pick(lang, { hi: 'सुनें', en: 'Listen', gu: 'સાંભળો', kn: 'ಕೇಳಿ' });
  const a11yLabel = control.unavailable
    ? 'Read aloud unavailable'
    : speaking
      ? 'Pause reading aloud'
      : 'Read aloud';
  const tint = control.unavailable ? colors.inkMuted : colors.saffronDeep;

  return (
    <Pressable
      onPress={control.unavailable ? explainUnavailable : control.toggle}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      accessibilityState={{ disabled: control.unavailable }}
      hitSlop={10}
      style={({ pressed }) => [
        styles.pill,
        {
          backgroundColor: control.unavailable ? colors.parchmentSoft : colors.saffronTint,
          borderColor: control.unavailable ? colors.divider : colors.cardActiveBorder,
        },
        pressed && { opacity: 0.6 },
      ]}
    >
      <AppIcon name={speaking ? "pause" : "play"} size={14} color={tint} weight="fill" />
      {!compact && (
        <Text style={[styles.label, { color: tint }]} numberOfLines={1}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  icon: { fontSize: 12, includeFontPadding: false },
  label: { fontSize: 13, includeFontPadding: false },
});
