import React, { useEffect, useRef, useState } from 'react';
import { Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGitaLanguage } from '@/data/gita/language';
import { useTheme } from '@/theme/ThemeContext';
import { pick } from '@/utils/localize';
import { meaningToken, titleFontByLang } from '@/utils/langType';
import { APP_STORE_URL, PLAY_STORE_URL } from '@/data/shareLinks';
import { STORE_UPDATE_VERSION } from '@/data/storeUpdate';

/** Optional store upgrade, separate from the staged-OTA reload prompt. */
export default function StoreUpdateSheet({ onClose }: { onClose: () => void }) {
  const { lang } = useGitaLanguage();
  const { colors, typography, radii, spacing } = useTheme();
  const [busy, setBusy] = useState(false), [failed, setFailed] = useState(false);
  const opening = useRef(false), mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const later = pick(lang, { hi: 'बाद में', en: 'Later', gu: 'પછી', kn: 'ನಂತರ' });
  const update = pick(lang, { hi: 'अभी अपडेट करें', en: 'Update now', gu: 'હમણાં અપડેટ કરો', kn: 'ಈಗ ಅಪ್‌ಡೇಟ್ ಮಾಡಿ' });
  const body = { color: colors.inkSoft, fontFamily: meaningToken(lang, typography).fontFamily, fontSize: typography.meaning.fontSize, lineHeight: typography.meaning.lineHeight };
  const openStore = async () => {
    if (opening.current) return;
    opening.current = true; setBusy(true); setFailed(false);
    try {
      await Linking.openURL(Platform.OS === 'ios' ? APP_STORE_URL : PLAY_STORE_URL);
      if (mounted.current) onClose();
    } catch {
      if (mounted.current) { setFailed(true); setBusy(false); }
    } finally { opening.current = false; }
  };
  return <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
    <SafeAreaView style={[styles.root, { backgroundColor: colors.parchment }]} edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={{ padding: spacing.xxl, gap: spacing.lg }}>
        <Text accessibilityRole="header" testID="store-update-heading" style={{ color: colors.ink, fontFamily: titleFontByLang(lang), fontSize: typography.readerTitle.fontSize }}>
          {pick(lang, { hi: 'वेदांश में नया क्या है', en: 'New in Vedansh', gu: 'વેદાંશમાં નવું શું છે', kn: 'ವೇದಾಂಶದಲ್ಲಿ ಹೊಸದೇನು' })}
        </Text>
        <Text style={[body, { color: colors.saffron }]}>v{STORE_UPDATE_VERSION}</Text>
        <Text style={body}>{pick(lang, {
          hi: 'नया अपडेट उपलब्ध है। जब चाहें अपडेट करें और नई सुविधाएँ पाएँ।',
          en: 'A new update is available. Update whenever you’re ready to enjoy the new features.',
          gu: 'નવું અપડેટ ઉપલબ્ધ છે. જ્યારે અનુકૂળ હોય ત્યારે અપડેટ કરીને નવી સુવિધાઓ મેળવો.',
          kn: 'ಹೊಸ ಅಪ್‌ಡೇಟ್ ಲಭ್ಯವಿದೆ. ನಿಮಗೆ ಅನುಕೂಲವಾದಾಗ ಅಪ್‌ಡೇಟ್ ಮಾಡಿ ಹೊಸ ಸೌಲಭ್ಯಗಳನ್ನು ಪಡೆಯಿರಿ.',
        })}</Text>
        <View style={{ gap: spacing.md }}>
          <Text style={[body, { color: colors.ink, fontFamily: titleFontByLang(lang) }]}>{pick(lang, {
            hi: 'सुविचार · भक्ति संदेश कार्ड', en: 'Suvichar · devotional message cards', gu: 'સુવિચાર · ભક્તિ સંદેશ કાર્ડ', kn: 'ಸುವಿಚಾರ · ಭಕ್ತಿ ಸಂದೇಶ ಕಾರ್ಡ್‌ಗಳು',
          })}</Text>
          <Text style={body}>{pick(lang, {
            hi: 'सुंदर देवता कार्ड और दिन-विशेष शुभकामनाएँ बनाएँ, अपनी फ़ोटो जोड़ें और अपनों से साझा करें।',
            en: 'Create beautiful deity cards and weekday greetings, add your own photo, and share with loved ones.',
            gu: 'સુંદર દેવતા કાર્ડ અને દિવસ પ્રમાણે શુભેચ્છાઓ બનાવો, તમારો ફોટો ઉમેરો અને સ્વજનો સાથે શેર કરો.',
            kn: 'ಸುಂದರ ದೇವತಾ ಕಾರ್ಡ್‌ಗಳು ಮತ್ತು ದಿನದ ಶುಭಾಶಯಗಳನ್ನು ರಚಿಸಿ, ನಿಮ್ಮ ಫೋಟೋ ಸೇರಿಸಿ ಮತ್ತು ಪ್ರೀತಿಪಾತ್ರರೊಂದಿಗೆ ಹಂಚಿಕೊಳ್ಳಿ.',
          })}</Text>
        </View>
        {failed && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={body}>{pick(lang, {
          hi: 'स्टोर नहीं खुल पाया। फिर कोशिश करें या बाद में अपडेट करें।', en: 'Couldn’t open the store. Try again or update later.', gu: 'સ્ટોર ખૂલી શક્યો નહીં. ફરી પ્રયાસ કરો અથવા પછી અપડેટ કરો.', kn: 'ಸ್ಟೋರ್ ತೆರೆಯಲಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ ಅಥವಾ ನಂತರ ಅಪ್‌ಡೇಟ್ ಮಾಡಿ.',
        })}</Text>}
      </ScrollView>
      <View style={{ padding: spacing.xxl, gap: spacing.sm }}>
        <Pressable testID="store-update-now" accessibilityRole="button" accessibilityLabel={update} accessibilityState={{ disabled: busy }} disabled={busy} onPress={() => { void openStore(); }} style={({ pressed }) => [styles.button, { backgroundColor: colors.saffron, borderRadius: radii.md, opacity: busy || pressed ? 0.65 : 1 }]}>
          <Text style={[body, { color: colors.onPrimary, fontFamily: titleFontByLang(lang) }]}>{update}</Text>
        </Pressable>
        <Pressable testID="store-update-later" accessibilityRole="button" accessibilityLabel={later} onPress={onClose} style={styles.button}>
          <Text style={body}>{later}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  </Modal>;
}
const styles = StyleSheet.create({ root: { flex: 1 }, button: { minHeight: 48, paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' } });
