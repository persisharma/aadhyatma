import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { pick } from '@/utils/localize';
import { fontFamilies } from '@/theme/typography';
import { useRatingPrompt } from '@/contexts/RatingPromptContext';

/**
 * "Enjoying Vedansh?" — the app-rating ask (design.md §54).
 *
 * Centered parchment card over a dimmed backdrop, matching `UpdateReadyModal`
 * rather than the pageSheet modals: this is a short interruption the user can
 * wave off, not a screen to work in.
 *
 * Two exits, both explicit — primary (store hand-off) and "Maybe later", which
 * closes and lets the 5-day cadence bring the card back. There is deliberately
 * NO permanent opt-out button (product decision, Aug 2026: "only now and
 * later"); the only terminal state a user can reach from this card is rating.
 *
 * Because of that, `outcome: 'declined'` is no longer reachable from the UI. It
 * stays in the model (`data/ratingPrompt.ts`) so a state written by an earlier
 * build is still honoured and a future Settings-side opt-out has a home — see
 * RULEBOOK §6.2 for the risk posture this creates.
 *
 * Visibility and persistence are owned by `RatingPromptContext`; this component
 * is pure presentation plus two callbacks.
 */
export default function RatingPromptSheet() {
  const { colors, typography, radii, spacing } = useTheme();
  const { lang } = useGitaLanguage();
  const { visible, rate, dismiss } = useRatingPrompt();

  // gu/kn need their own serif or the script renders as tofu; hi/en keep the
  // faces the other modals use (Cormorant carries no Devanagari, so hi never
  // falls back to it — see design.md §3).
  const scriptSerif = lang === 'gu' ? fontFamilies.gujarati : lang === 'kn' ? fontFamilies.kannada : null;
  const scriptSerifBold =
    lang === 'gu' ? fontFamilies.gujaratiBold : lang === 'kn' ? fontFamilies.kannadaBold : null;
  const titleFont = scriptSerifBold ?? typography.readerTitle.fontFamily;
  const bodyFont = scriptSerif ?? typography.meaning.fontFamily;
  const labelFont =
    scriptSerif ?? (lang === 'hi' ? typography.meaning.fontFamily : typography.cardLatin.fontFamily);

  const rateLabel = pick(lang, {
    hi: 'रेटिंग दें',
    en: 'Rate Vedansh',
    gu: 'રેટિંગ આપો',
    kn: 'ರೇಟಿಂಗ್ ನೀಡಿ',
  });
  const laterLabel = pick(lang, {
    hi: 'बाद में',
    en: 'Maybe later',
    gu: 'પછી',
    kn: 'ನಂತರ',
  });
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={dismiss}>
      <View style={[styles.backdrop, { backgroundColor: colors.modalBackdrop }]}>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.parchment, borderRadius: radii.lg, padding: spacing.xxl },
          ]}
        >
          {/* Decorative — the stars say "rating" faster than any sentence can.
              Not interactive and hidden from a11y so it never reads as a control. */}
          <Text
            style={[styles.stars, { color: colors.gold }]}
            accessibilityElementsHidden
            importantForAccessibility="no"
          >
            ★★★★★
          </Text>

          <Text accessibilityRole="header" style={[styles.title, { color: colors.ink, fontFamily: titleFont }]}>
            {pick(lang, {
              hi: 'Vedansh आपको कैसा लगा?',
              en: 'Enjoying Vedansh?',
              gu: 'Vedansh કેવું લાગ્યું?',
              kn: 'Vedansh ಹೇಗಿದೆ?',
            })}
          </Text>

          <Text style={[styles.body, { color: colors.inkSoft, fontFamily: bodyFont }]}>
            {pick(lang, {
              hi: 'यदि यह ऐप आपकी साधना में सहायक रहा है, तो स्टोर पर दी गई एक छोटी रेटिंग इसे और साधकों तक पहुँचाती है। एक मिनट लगेगा।',
              en: 'If the app has helped your daily practice, a short rating on the store helps other seekers find it. It takes a minute.',
              gu: 'જો આ ઍપ તમારી સાધનામાં ઉપયોગી રહી હોય, તો સ્ટોર પર આપેલી એક નાની રેટિંગ તેને બીજા સાધકો સુધી પહોંચાડે છે. એક મિનિટ લાગશે.',
              kn: 'ಈ ಆ್ಯಪ್ ನಿಮ್ಮ ಸಾಧನೆಗೆ ಸಹಾಯ ಮಾಡಿದ್ದರೆ, ಸ್ಟೋರ್‌ನಲ್ಲಿ ನೀಡಿದ ಒಂದು ಸಣ್ಣ ರೇಟಿಂಗ್ ಅದನ್ನು ಇತರ ಸಾಧಕರಿಗೆ ತಲುಪಿಸುತ್ತದೆ. ಒಂದು ನಿಮಿಷ ಸಾಕು.',
            })}
          </Text>

          <Pressable
            onPress={rate}
            accessibilityRole="button"
            accessibilityLabel="Rate Vedansh on the store"
            style={({ pressed }) => [
              styles.primary,
              { backgroundColor: colors.saffron, borderRadius: radii.md, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={[styles.primaryText, { color: colors.onPrimary, fontFamily: titleFont }]}>
              {rateLabel}
            </Text>
          </Pressable>

          <Pressable
            onPress={dismiss}
            accessibilityRole="button"
            accessibilityLabel="Maybe later"
            style={({ pressed }) => [styles.secondary, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Text
              style={[
                styles.secondaryText,
                { color: colors.inkMuted, fontFamily: labelFont },
                // Latin tracking + uppercase split the shirorekha on Indic labels.
                lang !== 'en' && styles.indicLabelReset,
              ]}
            >
              {laterLabel}
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
    gap: 12,
  },
  stars: {
    fontSize: 22,
    letterSpacing: 3,
    textAlign: 'center',
    includeFontPadding: false,
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    includeFontPadding: false,
  },
  body: {
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
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
    paddingTop: 12,
    paddingBottom: 4,
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
  indicLabelReset: {
    letterSpacing: 0,
    textTransform: 'none',
  },
});
