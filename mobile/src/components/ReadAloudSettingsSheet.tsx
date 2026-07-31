import React from 'react';
import { Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { radii } from '@/theme/spacing';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { useGitaLanguage, type Lang } from '@/data/gita/language';
import { useReadAloudPrefs } from '@/contexts/ReadAloudPrefsContext';
import { useReadAloud } from '@/contexts/ReadAloudContext';
import { pick } from '@/utils/localize';
import { cardFontByLang } from '@/utils/langType';
import {
  MAX_SPEECH_RATE,
  MIN_SPEECH_RATE,
  SPEECH_RATE_STEP,
  type ReadAloudPrefs,
} from '@/readAloud/prefs';
import type { VoiceAvailability } from '@/readAloud/voices';
import RateStepper from './RateStepper';
import { READING_SIZE_SAMPLE } from './ReadingSizePickerSheet';

/**
 * Bottom sheet for read-aloud: voice, speed, and what gets spoken (design.md §53).
 * Structural clone of `ReadingSizePickerSheet` — same modal/backdrop/grabber/pill
 * language, and like that sheet it stays open on selection so the live preview is
 * usable. Only the preview speaks; nothing here plays automatically.
 */

/** Maximum probed voices offered, beyond "Automatic". More is noise, not choice. */
const MAX_VOICE_OPTIONS = 4;

/**
 * Localized state text for the More row — exported so the row and this sheet cannot
 * drift, the same trick `readingSizeLabel` uses.
 */
export function readAloudRowLabel(
  prefs: ReadAloudPrefs,
  lang: Lang,
  availability: VoiceAvailability
): string {
  if (availability === 'unavailable') {
    return pick(lang, {
      hi: 'उपलब्ध नहीं',
      en: 'Unavailable',
      gu: 'ઉપલબ્ધ નથી',
      kn: 'ಲಭ್ಯವಿಲ್ಲ',
    });
  }
  const meaning = prefs.readMeaning
    ? pick(lang, { hi: 'श्लोक व अर्थ', en: 'Verse & meaning', gu: 'શ્લોક અને અર્થ', kn: 'ಶ್ಲೋಕ ಮತ್ತು ಅರ್ಥ' })
    : pick(lang, { hi: 'केवल श्लोक', en: 'Verse only', gu: 'ફક્ત શ્લોક', kn: 'ಶ್ಲೋಕ ಮಾತ್ರ' });
  return `${meaning} · ${prefs.rate.toFixed(1)}×`;
}

type Props = { visible: boolean; onClose: () => void };

export default function ReadAloudSettingsSheet({ visible, onClose }: Props) {
  const { colors, spacing } = useTheme();
  const { lang } = useGitaLanguage();
  const { prefs, setRate, setVoice, setReadMeaning, setReadCommentary } = useReadAloudPrefs();
  const { availability, candidateVoices, target, speakPreview, refreshVoices } = useReadAloud();

  const chromeFont = cardFontByLang(lang);
  const selectedVoice = prefs.voiceByTarget[target];
  const voiceOptions = candidateVoices.slice(0, MAX_VOICE_OPTIONS);

  const doneLabel = pick(lang, { hi: 'हो गया', en: 'Done', gu: 'થઈ ગયું', kn: 'ಮುಗಿಯಿತು' });

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable
        accessible={false}
        style={[styles.backdrop, { backgroundColor: colors.modalBackdrop }]}
        onPress={onClose}
      >
        <Pressable
          accessible={false}
          onPress={(e) => e.stopPropagation()}
          style={[
            styles.sheet,
            { backgroundColor: colors.parchmentHighlight, paddingHorizontal: spacing.xxl },
          ]}
        >
          <View style={[styles.grabber, { backgroundColor: colors.divider }]} />

          <Text
            accessibilityRole="header"
            style={{ fontFamily: chromeFont, fontSize: 18, color: colors.ink, textAlign: 'center' }}
          >
            {pick(lang, { hi: 'पाठ सुनें', en: 'Read aloud', gu: 'પાઠ સાંભળો', kn: 'ಪಾಠ ಕೇಳಿ' })}
          </Text>
          <Text
            style={{
              fontFamily: chromeFont,
              fontSize: 12,
              color: colors.inkMuted,
              textAlign: 'center',
              marginTop: 2,
              marginBottom: spacing.md,
            }}
          >
            {pick(lang, {
              hi: 'उपकरण की आवाज़ से — मानव पाठ नहीं',
              en: "Your device's voice — not a human recitation",
              gu: 'ઉપકરણની આવાજથી — માનવ પાઠ નથી',
              kn: 'ಸಾಧನದ ಧ್ವನಿಯಿಂದ — ಮಾನವ ಪಾಠವಲ್ಲ',
            })}
          </Text>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {availability === 'unavailable' ? (
              <UnavailableBlock lang={lang} onRetry={refreshVoices} />
            ) : (
              <>
                <SectionLabel
                  text={pick(lang, { hi: 'आवाज़', en: 'Voice', gu: 'આવાજ', kn: 'ಧ್ವನಿ' })}
                  font={chromeFont}
                />
                <View
                  style={styles.optionColumn}
                  accessibilityRole="radiogroup"
                  accessibilityLabel="Read aloud voice"
                >
                  <VoicePill
                    label={pick(lang, { hi: 'स्वतः', en: 'Automatic', gu: 'સ્વતઃ', kn: 'ಸ್ವಯಂ' })}
                    a11y="Automatic voice"
                    selected={!selectedVoice}
                    onPress={() => setVoice(target, undefined)}
                  />
                  {voiceOptions.map((v) => (
                    <VoicePill
                      key={v.identifier}
                      label={v.name}
                      sublabel={v.quality === 'Enhanced' ? 'Enhanced' : undefined}
                      a11y={`Voice ${v.name}`}
                      selected={selectedVoice === v.identifier}
                      onPress={() => setVoice(target, v.identifier)}
                    />
                  ))}
                </View>

                {/* gu/kn read their own script but hear Hindi: their verse text is a
                    runtime transliteration of Devanagari that no Hindi voice can
                    pronounce, so the speech path uses the Devanagari source
                    (voices.ts). Say so rather than letting it surprise them. */}
                {lang === 'gu' || lang === 'kn' ? (
                  <Text style={[styles.note, { color: colors.inkMuted, fontFamily: chromeFont }]}>
                    {lang === 'gu'
                      ? 'શ્લોક અને અર્થ હિન્દી આવાજમાં બોલાય છે.'
                      : 'ಶ್ಲೋಕ ಮತ್ತು ಅರ್ಥ ಹಿಂದಿ ಧ್ವನಿಯಲ್ಲಿ ಹೇಳಲಾಗುತ್ತದೆ.'}
                  </Text>
                ) : null}
              </>
            )}

            <SectionLabel
              text={pick(lang, { hi: 'गति', en: 'Speed', gu: 'ગતિ', kn: 'ಗತಿ' })}
              font={chromeFont}
            />
            <RateStepper
              value={prefs.rate}
              onChange={setRate}
              min={MIN_SPEECH_RATE}
              max={MAX_SPEECH_RATE}
              step={SPEECH_RATE_STEP}
              style={styles.stepper}
            />

            <SectionLabel
              text={pick(lang, { hi: 'क्या पढ़ें', en: 'What to read', gu: 'શું વાંચવું', kn: 'ಏನು ಓದಬೇಕು' })}
              font={chromeFont}
            />
            <View style={styles.optionColumn}>
              <TogglePill
                label={pick(lang, { hi: 'अर्थ भी', en: 'Meaning too', gu: 'અર્થ પણ', kn: 'ಅರ್ಥವೂ' })}
                a11y="Read meaning"
                on={prefs.readMeaning}
                onPress={() => setReadMeaning(!prefs.readMeaning)}
              />
              <TogglePill
                label={pick(lang, { hi: 'व्याख्या भी', en: 'Commentary too', gu: 'વ્યાખ્યા પણ', kn: 'ವ್ಯಾಖ್ಯಾನವೂ' })}
                a11y="Read commentary"
                on={prefs.readCommentary}
                onPress={() => setReadCommentary(!prefs.readCommentary)}
              />
            </View>

            {availability !== 'unavailable' ? (
              <Pressable
                onPress={() => speakPreview(READING_SIZE_SAMPLE[lang])}
                accessibilityRole="button"
                accessibilityLabel="Preview voice"
                style={({ pressed }) => [
                  styles.preview,
                  { borderColor: colors.cardActiveBorder },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={{ color: colors.saffronDeep, fontFamily: chromeFont, fontSize: 14 }}>
                  {pick(lang, { hi: 'सुनकर देखें', en: 'Preview', gu: 'સાંભળી જુઓ', kn: 'ಕೇಳಿ ನೋಡಿ' })}
                </Text>
              </Pressable>
            ) : null}
          </ScrollView>

          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={doneLabel}
            style={({ pressed }) => [
              styles.done,
              { backgroundColor: colors.saffron },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={{ color: colors.onPrimary, fontFamily: chromeFont, fontSize: 15 }}>
              {doneLabel}
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function SectionLabel({ text, font }: { text: string; font: string }) {
  const { colors } = useTheme();
  return (
    <Text style={[styles.sectionLabel, { color: colors.saffronDeep, fontFamily: font }]}>
      {text}
    </Text>
  );
}

function VoicePill({
  label,
  sublabel,
  a11y,
  selected,
  onPress,
}: {
  label: string;
  sublabel?: string;
  a11y: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={a11y}
      style={[
        styles.pill,
        { borderColor: selected ? colors.saffron : colors.divider },
        selected && { backgroundColor: colors.saffronTint },
      ]}
    >
      {selected && <Text style={[styles.check, { color: colors.saffron }]}>✓</Text>}
      <Text
        style={[styles.pillLabel, { color: selected ? colors.saffronDeep : colors.ink }]}
        numberOfLines={1}
      >
        {label}
      </Text>
      {sublabel ? (
        <Text style={[styles.pillSub, { color: colors.inkMuted }]}>{sublabel}</Text>
      ) : null}
    </Pressable>
  );
}

function TogglePill({
  label,
  a11y,
  on,
  onPress,
}: {
  label: string;
  a11y: string;
  on: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      accessibilityLabel={a11y}
      style={[
        styles.pill,
        { borderColor: on ? colors.saffron : colors.divider },
        on && { backgroundColor: colors.saffronTint },
      ]}
    >
      {on && <Text style={[styles.check, { color: colors.saffron }]}>✓</Text>}
      <Text style={[styles.pillLabel, { color: on ? colors.saffronDeep : colors.ink }]}>
        {label}
      </Text>
    </Pressable>
  );
}

/**
 * Shown when the probe found no voice for the reading language. Android gets a
 * direct hop to system TTS settings; iOS has no deep link to Settings →
 * Accessibility → Spoken Content, so it gets the path in words.
 */
function UnavailableBlock({ lang, onRetry }: { lang: Lang; onRetry: () => void }) {
  const { colors } = useTheme();
  const chromeFont = cardFontByLang(lang);

  return (
    <View style={styles.unavailableBlock}>
      <Text style={[styles.note, { color: colors.ink, fontFamily: chromeFont, marginTop: 0 }]}>
        {Platform.OS === 'android'
          ? pick(lang, {
              hi: 'इस उपकरण में हिन्दी की आवाज़ नहीं है। सेटिंग्स में हिन्दी वाणी डाउनलोड करके लौटें।',
              en: "This device has no Hindi voice installed. Add Hindi speech data in settings, then come back.",
              gu: 'આ ઉપકરણમાં હિન્દી આવાજ નથી. સેટિંગ્સમાં હિન્દી વાણી ડાઉનલોડ કરીને પરત આવો.',
              kn: 'ಈ ಸಾಧನದಲ್ಲಿ ಹಿಂದಿ ಧ್ವನಿ ಇಲ್ಲ. ಸೆಟ್ಟಿಂಗ್‌ಗಳಲ್ಲಿ ಹಿಂದಿ ವಾಣಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ ಹಿಂತಿರುಗಿ.',
            })
          : pick(lang, {
              hi: 'इस उपकरण में हिन्दी की आवाज़ नहीं है। Settings › Accessibility › Spoken Content › Voices में हिन्दी जोड़ें।',
              en: 'This device has no Hindi voice installed. Add one in Settings › Accessibility › Spoken Content › Voices.',
              gu: 'આ ઉપકરણમાં હિન્દી આવાજ નથી. Settings › Accessibility › Spoken Content › Voices માં હિન્દી ઉમેરો.',
              kn: 'ಈ ಸಾಧನದಲ್ಲಿ ಹಿಂದಿ ಧ್ವನಿ ಇಲ್ಲ. Settings › Accessibility › Spoken Content › Voices ನಲ್ಲಿ ಹಿಂದಿ ಸೇರಿಸಿ.',
            })}
      </Text>

      <View style={styles.unavailableActions}>
        {Platform.OS === 'android' ? (
          <Pressable
            onPress={() => {
              Linking.sendIntent('com.android.settings.TTS_SETTINGS').catch(() => {
                Linking.openSettings().catch(() => undefined);
              });
            }}
            accessibilityRole="button"
            accessibilityLabel="Open TTS settings"
            style={({ pressed }) => [
              styles.preview,
              { borderColor: colors.cardActiveBorder, marginTop: 0 },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={{ color: colors.saffronDeep, fontFamily: chromeFont, fontSize: 14 }}>
              {pick(lang, {
                hi: 'TTS सेटिंग्स खोलें',
                en: 'Open TTS settings',
                gu: 'TTS સેટિંગ્સ ખોલો',
                kn: 'TTS ಸೆಟ್ಟಿಂಗ್‌ಗಳನ್ನು ತೆರೆಯಿರಿ',
              })}
            </Text>
          </Pressable>
        ) : null}

        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Check again for voices"
          style={({ pressed }) => [
            styles.preview,
            { borderColor: colors.divider, marginTop: 0 },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={{ color: colors.inkSoft, fontFamily: chromeFont, fontSize: 14 }}>
            {pick(lang, {
              hi: 'फिर देखें',
              en: 'Check again',
              gu: 'ફરી તપાસો',
              kn: 'ಮತ್ತೆ ಪರಿಶೀಲಿಸಿ',
            })}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingTop: 10,
    paddingBottom: 28,
    maxHeight: '88%',
  },
  scroll: { flexGrow: 0 },
  grabber: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  sectionLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 16,
    marginBottom: 8,
  },
  optionColumn: { gap: 8 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: radii.md,
    borderWidth: 1,
    minHeight: 44,
  },
  check: { fontSize: 13 },
  pillLabel: { fontFamily: fontFamilies.interSemiBold, fontSize: 14, flexShrink: 1 },
  pillSub: { fontFamily: fontFamilies.inter, fontSize: 11 },
  stepper: { alignSelf: 'flex-start' },
  note: { fontSize: 12, lineHeight: 18, marginTop: 10 },
  unavailableBlock: { marginTop: 4 },
  unavailableActions: { gap: 8, marginTop: 12 },
  preview: {
    marginTop: 18,
    borderRadius: radii.md,
    borderWidth: 1,
    paddingVertical: 12,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  done: {
    marginTop: 20,
    borderRadius: radii.md,
    paddingVertical: 13,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
