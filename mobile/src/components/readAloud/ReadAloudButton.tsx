import React, { useCallback } from 'react';
import { Alert, Linking, Platform, Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { pick } from '@/utils/localize';
import type { ReadAloudControl } from '@/screens/_useReaderReadAloud';

/**
 * The reader top-bar read-aloud control, rendered in `ReaderHeader`'s `right` slot
 * beside the page counter and the recorded-audio ▶ (design.md §53).
 *
 * Three states: ♪ idle · ❚❚ speaking · muted-and-disabled when the device has no
 * voice for the reading language. The muted state is deliberate — hiding the control
 * would leave the user with no way to learn why read-aloud never appears.
 *
 * `♪` carries the trailing U+FE0E text variation selector so it renders monochrome
 * rather than as a colour emoji — RULEBOOK §3 "no emoji", same treatment as the
 * Panchang ☀/☽ glyphs (design.md §33). It reads as read-aloud everywhere in the app,
 * distinct from the `▶` that plays a human recitation.
 */
export const READ_ALOUD_GLYPH = '♪︎';
const PAUSE_GLYPH = '❚❚';
export default function ReadAloudButton({ control }: { control: ReadAloudControl }) {
  const { colors } = useTheme();
  const { lang } = useGitaLanguage();

  const explainUnavailable = useCallback(() => {
    const title = pick(lang, {
      hi: 'आवाज़ उपलब्ध नहीं',
      en: 'Voice unavailable',
      gu: 'આવાજ ઉપલબ્ધ નથી',
      kn: 'ಧ್ವನಿ ಲಭ್ಯವಿಲ್ಲ',
    });
    const body = pick(lang, {
      hi: 'इस उपकरण में हिन्दी की आवाज़ नहीं है। उपकरण की सेटिंग्स में हिन्दी वाणी डाउनलोड करें।',
      en: "This device has no Hindi voice installed. Add Hindi speech data in your device's settings.",
      gu: 'આ ઉપકરણમાં હિન્દી આવાજ નથી. ઉપકરણની સેટિંગ્સમાં હિન્દી વાણી ડાઉનલોડ કરો.',
      kn: 'ಈ ಸಾಧನದಲ್ಲಿ ಹಿಂದಿ ಧ್ವನಿ ಇಲ್ಲ. ಸಾಧನದ ಸೆಟ್ಟಿಂಗ್‌ಗಳಲ್ಲಿ ಹಿಂದಿ ವಾಣಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ.',
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
  // English and un-localized, same rule as ReaderHeader's back label: the Maestro
  // flows tap these strings literally and the default reading language is `hi`.
  const a11yLabel = control.unavailable
    ? 'Read aloud unavailable'
    : speaking
      ? 'Pause reading aloud'
      : 'Read aloud';

  return (
    <Pressable
      onPress={control.unavailable ? explainUnavailable : control.toggle}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      accessibilityState={{ disabled: control.unavailable }}
      hitSlop={10}
      style={({ pressed }) => [styles.press, pressed && { opacity: 0.6 }]}
    >
      <Text
        style={[
          styles.glyph,
          { color: control.unavailable ? colors.inkMuted : colors.saffronDeep },
        ]}
      >
        {speaking ? PAUSE_GLYPH : READ_ALOUD_GLYPH}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  glyph: {
    fontSize: 15,
    includeFontPadding: false,
  },
});
