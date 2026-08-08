import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system/legacy';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import PalmGuideOverlay, {
  PALM_GUIDE_ORDER,
  usePalmGuideColors,
} from '@/components/PalmGuideOverlay';
import { useGitaLanguage } from '@/data/gita/language';
import type { PanchangStackParamList } from '@/navigation/types';
import {
  PALM_LINES,
  type PalmLineId,
  type PalmProfile,
} from '@/panchang/hastRekha';
import { palmSuggestionProvider } from '@/panchang/palmSuggestions';
import { radii } from '@/theme/spacing';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { contentByLang, meaningByLang } from '@/utils/localize';
import {
  pillTextStyle,
  scriptBodyFont,
  scriptTitleFont,
} from '@/utils/langType';

type Props = NativeStackScreenProps<PanchangStackParamList, 'HastRekhaCamera'>;

type Selections = Partial<PalmProfile>;

function isComplete(selections: Selections): selections is PalmProfile {
  return Boolean(
    selections.heart && selections.head && selections.life && selections.fate
  );
}

// The photo stays a cache-directory temp file for the lifetime of this screen
// and is deleted on retake, confirm, and unmount. It is never written to app
// storage, never uploaded, and never part of the saved palm profile.
async function discardPhoto(uri: string | null): Promise<void> {
  if (!uri) return;
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch {
    // Cache files are OS-reclaimed anyway; deletion is best-effort.
  }
}

export default function HastRekhaCameraScreen({ navigation }: Props) {
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const guideColors = usePalmGuideColors();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [selections, setSelections] = useState<Selections>({});
  const [busy, setBusy] = useState(false);
  const [captureFailed, setCaptureFailed] = useState(false);

  const photoRef = useRef<string | null>(null);
  photoRef.current = photoUri;
  useEffect(
    () => () => {
      void discardPhoto(photoRef.current);
    },
    []
  );

  const activeLine: PalmLineId | null = useMemo(() => {
    for (const line of PALM_GUIDE_ORDER) {
      if (!selections[line]) return line;
    }
    return null;
  }, [selections]);

  const capture = useCallback(async () => {
    const camera = cameraRef.current;
    if (!camera || busy) return;
    setBusy(true);
    setCaptureFailed(false);
    try {
      const photo = await camera.takePictureAsync({ quality: 0.7 });
      setPhotoUri(photo.uri);
      // Suggestions are an assist, never a verdict: they pre-select options
      // the user still confirms line by line. v1's provider returns null.
      const suggestions = await palmSuggestionProvider(photo.uri);
      if (suggestions) {
        setSelections((current) => ({ ...suggestions, ...current }));
      }
    } catch {
      setCaptureFailed(true);
    } finally {
      setBusy(false);
    }
  }, [busy]);

  const retake = useCallback(() => {
    const uri = photoUri;
    setPhotoUri(null);
    setSelections({});
    void discardPhoto(uri);
  }, [photoUri]);

  const confirm = useCallback(() => {
    if (!isComplete(selections)) return;
    const uri = photoUri;
    setPhotoUri(null);
    void discardPhoto(uri);
    navigation.navigate('HastRekha', { prefill: selections });
  }, [navigation, photoUri, selections]);

  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);
  const titleFont = scriptTitleFont(lang, typography.readerTitle.fontFamily);

  return (
    <View style={[styles.root, { backgroundColor: colors.ink }]}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <View style={[styles.topBar, { paddingHorizontal: spacing.xxl }]}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Back"
            style={({ pressed }) => [
              styles.backButton,
              { borderColor: colors.inkSoft, backgroundColor: colors.inkSoft },
              pressed && { opacity: 0.6 },
            ]}
          >
            <Text style={{ color: colors.parchment, fontSize: 20 }}>‹</Text>
          </Pressable>
          <View style={styles.headerCopy}>
            <Text
              accessibilityLabel="Palm camera guide"
              style={{ color: colors.parchment, fontFamily: titleFont, fontSize: 18 }}
            >
              {contentByLang(lang, 'हथेली कैमरा गाइड', 'Palm camera guide')}
            </Text>
            <Text style={[styles.caption, { color: colors.parchmentDeep }]}>
              {contentByLang(lang, 'हस्तरेखा दर्शन', 'Palm Reading')}
            </Text>
          </View>
        </View>

        {!permission ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.saffron} />
          </View>
        ) : !permission.granted ? (
          <View style={[styles.permissionWrap, { paddingHorizontal: spacing.xxl }]}>
            <View
              style={[
                styles.permissionCard,
                {
                  backgroundColor: colors.parchmentSoft,
                  borderColor: colors.divider,
                  borderRadius: radii.lg,
                },
                elevation.card,
              ]}
            >
              <Text
                style={[
                  pillTextStyle(lang, typography.sectionLabel),
                  { color: colors.saffronDeep, fontSize: 12 },
                ]}
              >
                {contentByLang(lang, 'कैमरा अनुमति', 'Camera permission')}
              </Text>
              <Text
                style={{
                  color: colors.ink,
                  fontFamily: bodyFont,
                  fontSize: 13,
                  lineHeight: 21,
                  marginTop: 6,
                }}
              >
                {meaningByLang(
                  lang,
                  'कैमरा केवल आपकी हथेली देखने में सहायता के लिए है। फ़ोटो इसी उपकरण पर रहती है—न सहेजी जाती है, न कहीं भेजी जाती है।',
                  'The camera only helps you observe your palm. Photos stay on this device—never saved, never uploaded.'
                )}
              </Text>
              <Pressable
                onPress={() => {
                  void requestPermission();
                }}
                accessibilityRole="button"
                accessibilityLabel="Allow camera access"
                style={({ pressed }) => [
                  styles.primaryBtn,
                  { backgroundColor: colors.saffronDeep, borderRadius: radii.pill },
                  pressed && { opacity: 0.72 },
                ]}
              >
                <Text style={[styles.primaryBtnText, { color: colors.onPrimary }]}>
                  {contentByLang(lang, 'कैमरा अनुमति दें', 'Allow camera access')}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => navigation.goBack()}
                accessibilityRole="button"
                accessibilityLabel="Choose manually instead"
                style={({ pressed }) => [
                  styles.secondaryBtn,
                  {
                    borderColor: colors.divider,
                    backgroundColor: colors.parchmentSoft,
                    borderRadius: radii.pill,
                  },
                  pressed && { opacity: 0.72 },
                ]}
              >
                <Text style={[styles.secondaryBtnText, { color: colors.saffronDeep }]}>
                  {contentByLang(lang, 'बिना कैमरे के चुनें', 'Choose manually instead')}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : photoUri ? (
          /* ---- Review: confirm each line against the captured photo ---- */
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: spacing.xxl,
              paddingBottom: spacing.xxl,
            }}
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.photoBox, { borderRadius: radii.lg }]}>
              <Image
                source={{ uri: photoUri }}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
                accessibilityLabel="Your captured palm photo with line guides"
              />
              <PalmGuideOverlay highlight={activeLine} />
            </View>
            <Text
              style={{
                color: colors.parchmentDeep,
                fontFamily: bodyFont,
                fontSize: 11,
                lineHeight: 16,
                marginTop: 8,
              }}
            >
              {meaningByLang(
                lang,
                'रेखा-चिह्न सांकेतिक हैं। हर रेखा के लिए वही रूप चुनें जो आपकी हथेली में दिखे।',
                'The guides are indicative. For each line, confirm the form you actually see on your palm.'
              )}
            </Text>

            {PALM_LINES.map((spec) => (
              <View key={spec.line} style={styles.lineBlock}>
                <View style={styles.lineHead}>
                  <View
                    style={[styles.lineDot, { backgroundColor: guideColors[spec.line] }]}
                  />
                  <Text
                    style={[
                      pillTextStyle(lang, typography.sectionLabel),
                      { color: colors.parchment, fontSize: 12 },
                    ]}
                  >
                    {contentByLang(lang, spec.nameHi, spec.nameEn)}
                  </Text>
                </View>
                <View
                  accessibilityRole="radiogroup"
                  accessibilityLabel={`Confirm your ${spec.nameEn} form`}
                  style={styles.optionRow}
                >
                  {spec.options.map((option) => {
                    const selected = selections[spec.line] === option.id;
                    return (
                      <Pressable
                        key={option.id}
                        testID={`hastrekha-cam-${spec.line}-${option.id}`}
                        onPress={() =>
                          setSelections((current) => ({
                            ...current,
                            [spec.line]: option.id,
                          }))
                        }
                        accessibilityRole="radio"
                        accessibilityState={{ selected }}
                        accessibilityLabel={`${spec.nameEn}: ${option.labelEn}`}
                        style={({ pressed }) => [
                          styles.optionChip,
                          {
                            borderColor: selected ? colors.saffron : colors.inkSoft,
                            backgroundColor: selected
                              ? colors.saffronTint
                              : 'transparent',
                            borderRadius: radii.pill,
                          },
                          pressed && { opacity: 0.7 },
                        ]}
                      >
                        <Text
                          style={{
                            color: selected ? colors.saffron : colors.parchment,
                            fontFamily: titleFont,
                            fontSize: 13,
                          }}
                        >
                          {contentByLang(lang, option.labelHi, option.labelEn)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}

            <View style={styles.reviewActions}>
              <Pressable
                onPress={retake}
                accessibilityRole="button"
                accessibilityLabel="Retake photo"
                style={({ pressed }) => [
                  styles.secondaryBtn,
                  {
                    borderColor: colors.inkSoft,
                    backgroundColor: 'transparent',
                    borderRadius: radii.pill,
                    flex: 1,
                  },
                  pressed && { opacity: 0.72 },
                ]}
              >
                <Text style={[styles.secondaryBtnText, { color: colors.parchment }]}>
                  {contentByLang(lang, 'फिर से लें', 'Retake photo')}
                </Text>
              </Pressable>
              <Pressable
                onPress={confirm}
                disabled={!isComplete(selections)}
                accessibilityRole="button"
                accessibilityLabel="Use these line choices"
                accessibilityState={{ disabled: !isComplete(selections) }}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  {
                    backgroundColor: isComplete(selections)
                      ? colors.saffronDeep
                      : colors.inkSoft,
                    borderRadius: radii.pill,
                    flex: 1.4,
                    marginTop: 0,
                  },
                  pressed && { opacity: 0.72 },
                ]}
              >
                <Text style={[styles.primaryBtnText, { color: colors.onPrimary }]}>
                  {contentByLang(lang, 'ये चयन उपयोग करें', 'Use these line choices')}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        ) : (
          /* ---- Capture: live preview with the framing overlay ---- */
          <View style={[styles.captureWrap, { paddingHorizontal: spacing.xxl }]}>
            <View style={[styles.photoBox, { borderRadius: radii.lg }]}>
              <CameraView
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                facing="back"
              />
              <PalmGuideOverlay />
            </View>
            <Text
              style={{
                color: colors.parchmentDeep,
                fontFamily: bodyFont,
                fontSize: 11,
                lineHeight: 16,
                marginTop: 8,
              }}
            >
              {meaningByLang(
                lang,
                'अच्छे प्रकाश में अपने सक्रिय (प्रमुख) हाथ की हथेली रेखा-चित्र के भीतर रखें। फ़ोटो इसी उपकरण पर रहती है—न सहेजी जाती है, न कहीं भेजी जाती है।',
                'In good light, fit the palm of your active (dominant) hand inside the outline. Photos stay on this device—never saved, never uploaded.'
              )}
            </Text>
            {captureFailed && (
              <Text
                accessibilityRole="alert"
                style={{
                  color: colors.parchment,
                  fontFamily: bodyFont,
                  fontSize: 11,
                  lineHeight: 16,
                  marginTop: 6,
                }}
              >
                {meaningByLang(
                  lang,
                  'फ़ोटो नहीं ली जा सकी। फिर से प्रयास करें।',
                  'The photo couldn’t be taken. Try again.'
                )}
              </Text>
            )}
            <View style={styles.captureRow}>
              <Pressable
                onPress={() => {
                  void capture();
                }}
                disabled={busy}
                accessibilityRole="button"
                accessibilityLabel="Capture palm photo"
                accessibilityState={{ disabled: busy }}
                style={({ pressed }) => [
                  styles.shutter,
                  { borderColor: colors.parchment, backgroundColor: colors.saffronDeep },
                  (pressed || busy) && { opacity: 0.72 },
                ]}
              >
                {busy ? (
                  <ActivityIndicator color={colors.onPrimary} />
                ) : (
                  <View
                    style={[styles.shutterCore, { backgroundColor: colors.onPrimary }]}
                  />
                )}
              </Pressable>
            </View>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topBar: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    // 44 to match every other back control (design.md §12).
    width: 44,
    height: 44,
    borderRadius: radii.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: { flex: 1 },
  caption: {
    fontFamily: fontFamilies.inter,
    fontSize: 12,
    lineHeight: 18,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  permissionWrap: { flex: 1, justifyContent: 'center' },
  permissionCard: { padding: 16, borderWidth: 1 },
  primaryBtn: {
    minHeight: 44,
    marginTop: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontFamily: fontFamilies.interSemiBold,
    fontSize: 12,
  },
  secondaryBtn: {
    minHeight: 44,
    marginTop: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontFamily: fontFamilies.interSemiBold,
    fontSize: 12,
  },
  captureWrap: { flex: 1 },
  photoBox: {
    aspectRatio: 3 / 4,
    width: '100%',
    overflow: 'hidden',
  },
  captureRow: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutter: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterCore: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  lineBlock: { marginTop: 14 },
  lineHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 7,
  },
  lineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  optionChip: {
    minHeight: 38,
    paddingHorizontal: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewActions: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 18,
  },
});
