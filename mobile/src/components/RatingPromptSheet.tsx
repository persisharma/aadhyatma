import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { InstagramLogoIcon } from 'phosphor-react-native/src/icons/InstagramLogo';
import { FacebookLogoIcon } from 'phosphor-react-native/src/icons/FacebookLogo';
import { pendingSocialPlatforms } from '@/data/engagementPrompts';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { pick } from '@/utils/localize';
import { fontFamilies } from '@/theme/typography';
import { useRatingPrompt } from '@/contexts/RatingPromptContext';
import { STORE_MIN_STARS, feedbackEmail } from '@/data/ratingPrompt';

const STAR_VALUES = [1, 2, 3, 4, 5] as const;

/**
 * "Enjoying Vedansh?" — the app-rating ask (design.md §54).
 *
 * Centered parchment card over a dimmed backdrop, matching `UpdateReadyModal`
 * rather than the pageSheet modals: this is a short interruption the user can
 * wave off, not a screen to work in.
 *
 * Two steps. The asking step offers five stars and "Maybe later". A 4–5★ tap
 * hands straight off to the store's review page and advances to social following after the next completed action. A 1–3★ tap stays on the card's
 * thank-you step, which offers "Write to us" (when a feedback inbox is set), a
 * smaller store link, and Close. The store link is deliberate: hiding the store
 * from unhappy users is review gating (product decision, Oct 2026).
 *
 * There is deliberately NO permanent opt-out (product decision, Aug 2026: "only
 * now and later"), so `outcome: 'declined'` is not reachable from the UI. It
 * stays in the model (`data/ratingPrompt.ts`) so a state written by an earlier
 * build is still honoured and a future Settings-side opt-out has a home — see
 * RULEBOOK §6.2 for the risk posture this creates.
 *
 * Visibility and persistence are owned by `RatingPromptContext`; this component
 * holds only which step is showing.
 */
export default function RatingPromptSheet() {
  const { colors, typography, radii, spacing } = useTheme();
  const { lang } = useGitaLanguage();
  const { visible, state, promptKind, socialLinkError, follow, confirmFollowing, rate, dismiss, recordLowRating, writeToUs } = useRatingPrompt();
  /** Stars from a 1–3★ tap on this opening; 0 = still on the asking step. */
  const [lowStars, setLowStars] = useState(0);

  // Every opening starts on the asking step. Reset during render, not in an
  // effect: an effect would paint the last thank-you step for a frame on reopen,
  // and resetting on close would swap steps mid fade-out.
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setLowStars(0);
  }

  const chooseStars = (stars: number) => {
    if (stars >= STORE_MIN_STARS) {
      rate(stars);
      return;
    }
    setLowStars(stars);
    recordLowRating();
  };

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
  // Latin tracking + uppercase split the shirorekha on Indic labels.
  const secondaryText = [
    styles.secondaryText,
    { color: colors.inkMuted, fontFamily: labelFont },
    lang !== 'en' && styles.indicLabelReset,
  ];

  const email = feedbackEmail();

  const askStep = (
    <>
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

      <View style={styles.starRow}>
        {STAR_VALUES.map((stars) => (
          <Pressable
            key={stars}
            onPress={() => chooseStars(stars)}
            accessibilityRole="button"
            accessibilityLabel={stars === 1 ? 'Rate 1 star' : `Rate ${stars} stars`}
            style={styles.starButton}
          >
            {({ pressed }) => (
              <Text style={[styles.star, { color: colors.gold }]}>{pressed ? '★' : '☆'}</Text>
            )}
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={dismiss}
        accessibilityRole="button"
        accessibilityLabel="Maybe later"
        style={({ pressed }) => [styles.secondary, { opacity: pressed ? 0.6 : 1 }]}
      >
        <Text style={secondaryText}>
          {pick(lang, { hi: 'बाद में', en: 'Maybe later', gu: 'પછી', kn: 'ನಂತರ' })}
        </Text>
      </Pressable>
    </>
  );

  const thanksStep = (
    <>
      {/* The user's own choice, echoed back. Not interactive, so hidden from a11y. */}
      <Text
        style={[styles.star, styles.starEcho, { color: colors.gold }]}
        accessibilityElementsHidden
        importantForAccessibility="no"
      >
        {'★'.repeat(lowStars) + '☆'.repeat(5 - lowStars)}
      </Text>

      <Text accessibilityRole="header" style={[styles.title, { color: colors.ink, fontFamily: titleFont }]}>
        {pick(lang, {
          hi: 'रेटिंग के लिए धन्यवाद',
          en: 'Thank you for rating',
          gu: 'રેટિંગ બદલ આભાર',
          kn: 'ರೇಟಿಂಗ್‌ಗೆ ಧನ್ಯವಾದಗಳು',
        })}
      </Text>

      {email ? (
        <>
          <Text style={[styles.body, { color: colors.inkSoft, fontFamily: bodyFont }]}>
            {pick(lang, {
              hi: 'बताइए क्या ठीक नहीं लगा, हम उसे सुधारेंगे।',
              en: "Tell us what isn't working and we'll fix it.",
              gu: 'શું બરાબર ન લાગ્યું તે જણાવો, અમે તેને સુધારીશું.',
              kn: 'ಏನು ಸರಿಯಿಲ್ಲ ಎಂದು ತಿಳಿಸಿ, ನಾವು ಅದನ್ನು ಸರಿಪಡಿಸುತ್ತೇವೆ.',
            })}
          </Text>
          <Pressable
            onPress={() => writeToUs(lowStars)}
            accessibilityRole="button"
            accessibilityLabel="Write to Vedansh"
            style={({ pressed }) => [
              styles.primary,
              { backgroundColor: colors.saffron, borderRadius: radii.md, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={[styles.primaryText, { color: colors.onPrimary, fontFamily: titleFont }]}>
              {pick(lang, { hi: 'हमें लिखें', en: 'Write to us', gu: 'અમને લખો', kn: 'ನಮಗೆ ಬರೆಯಿರಿ' })}
            </Text>
          </Pressable>
        </>
      ) : null}

      <Pressable
        onPress={() => rate(lowStars)}
        accessibilityRole="button"
        accessibilityLabel="Rate Vedansh on the store"
        style={({ pressed }) => [styles.storeLink, { opacity: pressed ? 0.6 : 1 }]}
      >
        <Text style={[styles.storeLinkText, { color: colors.inkSoft, fontFamily: bodyFont }]}>
          {pick(lang, {
            hi: 'स्टोर पर रेटिंग दें',
            en: 'Rate on the store',
            gu: 'સ્ટોર પર રેટિંગ આપો',
            kn: 'ಸ್ಟೋರ್‌ನಲ್ಲಿ ರೇಟಿಂಗ್ ನೀಡಿ',
          })}
        </Text>
      </Pressable>

      <Pressable
        onPress={dismiss}
        accessibilityRole="button"
        accessibilityLabel="Close"
        style={({ pressed }) => [styles.secondary, { opacity: pressed ? 0.6 : 1 }]}
      >
        <Text style={secondaryText}>
          {pick(lang, { hi: 'बंद करें', en: 'Close', gu: 'બંધ કરો', kn: 'ಮುಚ್ಚಿ' })}
        </Text>
      </Pressable>
    </>
  );

  const socialStep = (
    <>
      <Text accessibilityRole="header" style={[styles.title, { color: colors.ink, fontFamily: titleFont }]}>
        {pick(lang, { hi: 'भक्ति से जुड़े रहें', en: 'Stay connected with Vedansh',
          gu: 'ભક્તિ સાથે જોડાયેલા રહો', kn: 'ಭಕ್ತಿಯೊಂದಿಗೆ ಸಂಪರ್ಕದಲ್ಲಿರಿ' })}
      </Text>
      <Text style={[styles.body, { color: colors.inkSoft, fontFamily: bodyFont }]}>
        {pick(lang, { hi: 'रोज़ के सुविचार, पर्व की कहानियाँ और भक्ति के लिए हमारे पेज फ़ॉलो करें।',
          en: 'Follow our pages for daily thoughts, festival stories and devotion.',
          gu: 'રોજના સુવિચાર, પર્વની વાર્તાઓ અને ભક્તિ માટે અમારા પેજ ફૉલો કરો.',
          kn: 'ದಿನದ ಸುವಿಚಾರಗಳು, ಹಬ್ಬದ ಕಥೆಗಳು ಮತ್ತು ಭಕ್ತಿಗಾಗಿ ನಮ್ಮ ಪುಟಗಳನ್ನು ಫಾಲೋ ಮಾಡಿ.' })}
      </Text>
      {pendingSocialPlatforms(state.social).map((platform) => {
        const name = platform === 'instagram' ? 'Instagram' : 'Facebook';
        const Icon = platform === 'instagram' ? InstagramLogoIcon : FacebookLogoIcon;
        return (
          <View key={platform} style={[styles.socialRow, { borderColor: colors.divider, borderRadius: radii.md }]}>
            {/* Filled like "Write to us": the follow link is the row's primary action, so it
                must outweigh the underlined "Already following" text link beneath it. */}
            <Pressable accessibilityRole="link" accessibilityLabel={`Follow Vedansh on ${name}`}
              onPress={() => { void follow(platform); }}
              style={({ pressed }) => [styles.socialFollow,
                { backgroundColor: colors.saffron, borderRadius: radii.md, opacity: pressed ? 0.85 : 1 }]}>
              <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                <Icon size={24} color={colors.onPrimary} />
              </View>
              <Text style={[styles.primaryText, styles.socialLabel, { color: colors.onPrimary, fontFamily: titleFont }]}>
                {pick(lang, { hi: `${name} पर फ़ॉलो करें`, en: `Follow on ${name}`,
                  gu: `${name} પર ફૉલો કરો`, kn: `${name} ನಲ್ಲಿ ಫಾಲೋ ಮಾಡಿ` })}
              </Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel={`I already follow Vedansh on ${name}`}
              onPress={() => confirmFollowing(platform)} style={styles.storeLink}>
              <Text style={[styles.storeLinkText, { color: colors.inkSoft, fontFamily: bodyFont }]}>
                {pick(lang, { hi: 'पहले से फ़ॉलो करते हैं', en: 'Already following',
                  gu: 'પહેલેથી ફૉલો કરું છું', kn: 'ಈಗಾಗಲೇ ಫಾಲೋ ಮಾಡುತ್ತಿದ್ದೇನೆ' })}
              </Text>
            </Pressable>
          </View>
        );
      })}
      {socialLinkError && <Text accessibilityRole="alert" style={[styles.body, { color: colors.inkSoft, fontFamily: bodyFont }]}>
        {pick(lang, { hi: 'पेज नहीं खुला। फिर कोशिश करें।', en: 'Could not open the page. Please try again.',
          gu: 'પેજ ખુલ્યું નહીં. ફરી પ્રયાસ કરો.', kn: 'ಪುಟ ತೆರೆಯಲಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.' })}
      </Text>}
      <Pressable onPress={dismiss} accessibilityRole="button" accessibilityLabel="Maybe later" style={styles.secondary}>
        <Text style={secondaryText}>{pick(lang, { hi: 'बाद में', en: 'Maybe later', gu: 'પછી', kn: 'ನಂತರ' })}</Text>
      </Pressable>
    </>
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={dismiss}>
      <View style={[styles.backdrop, { backgroundColor: colors.modalBackdrop }]}>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.parchment, borderRadius: radii.lg },
          ]}
        >
          <ScrollView bounces={false} contentContainerStyle={{ padding: spacing.xxl, gap: 12 }}>
            {promptKind === 'social' ? socialStep : lowStars > 0 ? thanksStep : askStep}
          </ScrollView>
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
    paddingVertical: 40,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    maxHeight: '100%',
    overflow: 'hidden',
  },
  socialRow: { borderWidth: 1, paddingHorizontal: 12, paddingTop: 12, paddingBottom: 2 },
  socialFollow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  socialLabel: { flexShrink: 1, textAlign: 'center' },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    marginTop: 4,
  },
  starButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  star: {
    fontSize: 34,
    textAlign: 'center',
    includeFontPadding: false,
  },
  starEcho: {
    fontSize: 22,
    letterSpacing: 3,
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
  storeLink: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeLinkText: {
    fontSize: 14,
    textDecorationLine: 'underline',
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
