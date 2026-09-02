import React, { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { elevation } from '@/theme/elevation';
import { fontFamilies } from '@/theme/typography';
import { useTour } from '@/contexts/TourContext';
import { useGitaLanguage, LANGUAGES, type LangScript } from '@/data/gita/language';
import { useFontScale } from '@/contexts/FontScaleContext';
import { verseToken } from '@/utils/langType';
import { FONT_SCALES, type FontScale } from '@/theme/fontScale';
import { READING_SIZE_SAMPLE } from '@/components/ReadingSizePickerSheet';

/**
 * First-run setup sheet — the step *after* the feature tour (design.md §47).
 *
 * The walkthrough's last two steps ring the More hub's **Language** and
 * **Reading Size** rows; this sheet is where the user actually picks them, so a
 * fresh install never has to hunt for either setting to read comfortably. Both
 * choices apply **live** (same `useGitaLanguage()` / `useFontScale()` state every
 * other surface uses) and the sample line re-renders in the chosen script at the
 * chosen size, so the sheet is its own preview.
 *
 * **Bilingual chrome, always** — like the tour, this runs *before* a reading
 * language exists, so every label renders Hindi over English and nothing
 * branches on `lang` (§47 "bilingual, always"; wiki `concepts/languages`
 * ternary hazard). The language options need no translation: each is written in
 * its own script.
 *
 * Self-mounts when `useTour().shouldShowOnboardingSetup` is true.
 */

const SIZE_OPTIONS: readonly { value: FontScale; hi: string; en: string }[] = [
  { value: 'M', hi: 'मानक', en: 'Standard' },
  { value: 'L', hi: 'बड़ा', en: 'Large' },
];

// Compile-time sanity: the pills cover every preset in FONT_SCALES (§43).
type _SizeCoverage = keyof typeof FONT_SCALES extends (typeof SIZE_OPTIONS)[number]['value']
  ? true
  : never;
const _sizeCoverage: _SizeCoverage = true;
void _sizeCoverage;

/** Native face for a language's own name, so no option renders as tofu. */
function familyFor(script: LangScript, devanagariFallback: string): string {
  switch (script) {
    case 'latin':
      return fontFamilies.latin;
    case 'gujarati':
      return fontFamilies.gujaratiBold;
    case 'kannada':
      return fontFamilies.kannadaBold;
    default:
      return devanagariFallback;
  }
}

export default function OnboardingSetupSheet() {
  const { colors, typography, spacing, radii } = useTheme();
  const { shouldShowOnboardingSetup, markOnboardingSetupCompleted } = useTour();
  const { lang, setLang } = useGitaLanguage();
  const { scale, setScale } = useFontScale();

  const [visible, setVisible] = useState(false);
  // Rising-edge guard: open once per "should show" episode, keyed on the gate
  // alone (never on `visible`), so the optimistic hide in finish() can't be
  // misread as "not shown yet" and re-open before the gate flips off. Mirrors
  // FeatureTour's guard.
  const openedRef = useRef(false);
  useEffect(() => {
    if (shouldShowOnboardingSetup) {
      if (!openedRef.current) {
        openedRef.current = true;
        setVisible(true);
      }
    } else {
      openedRef.current = false;
    }
  }, [shouldShowOnboardingSetup]);

  const finish = () => {
    setVisible(false);
    void markOnboardingSetupCompleted();
  };

  if (!visible) return null;

  const verseTok = verseToken(lang, typography);

  return (
    <Modal visible animationType="slide" transparent onRequestClose={finish}>
      {/* No backdrop dismissal: this is a one-time setup with an explicit
          "Begin" — a stray tap outside must not skip the language choice. */}
      <View style={[styles.backdrop, { backgroundColor: colors.modalBackdrop }]}>
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.parchmentHighlight,
              paddingHorizontal: spacing.xxl,
              borderTopLeftRadius: 22,
              borderTopRightRadius: 22,
            },
          ]}
        >
          <View style={[styles.grabber, { backgroundColor: colors.divider }]} />

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text
              style={[styles.eyebrow, { color: colors.saffronDeep, fontFamily: typography.readerTitle.fontFamily }]}
            >
              स्वागत है · Welcome
            </Text>
            <Text
              accessibilityRole="header"
              style={[styles.titleHi, { color: colors.ink, fontFamily: typography.readerTitle.fontFamily }]}
            >
              भाषा चुनें
            </Text>
            <Text style={[styles.titleEn, { color: colors.inkMuted, fontFamily: typography.subtitle.fontFamily }]}>
              Choose your reading language
            </Text>
            <Text style={[styles.note, { color: colors.inkSoft, fontFamily: typography.meaning.fontFamily }]}>
              बाद में कभी भी “अधिक” से बदल सकते हैं।{'\n'}
              You can change this any time from More.
            </Text>

            <View
              accessibilityRole="radiogroup"
              accessibilityLabel="Reading language"
              style={[styles.list, { borderColor: colors.divider, borderRadius: radii.lg, backgroundColor: colors.parchmentSoft }]}
            >
              {LANGUAGES.map((opt, i) => {
                const selected = lang === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => setLang(opt.value)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    accessibilityLabel={opt.a11yLabel}
                    style={({ pressed }) => [
                      styles.row,
                      i > 0 && { borderTopWidth: 1, borderTopColor: colors.divider },
                      selected && { backgroundColor: colors.saffronTint },
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <Text
                      style={{
                        flex: 1,
                        fontFamily: familyFor(opt.script, typography.readerTitle.fontFamily),
                        fontSize: 19,
                        color: selected ? colors.saffronDeep : colors.ink,
                      }}
                    >
                      {opt.nativeLabel}
                    </Text>
                    <Text style={[styles.rowEn, { color: colors.inkMuted }]}>{opt.a11yLabel}</Text>
                    {selected && <Text style={{ color: colors.saffron, fontSize: 16 }}>✓</Text>}
                  </Pressable>
                );
              })}
            </View>

            <Text
              style={[styles.sectionHi, { color: colors.ink, fontFamily: typography.readerTitle.fontFamily }]}
            >
              पाठ का आकार
            </Text>
            <Text style={[styles.sectionEn, { color: colors.inkMuted, fontFamily: typography.subtitle.fontFamily }]}>
              Reading size
            </Text>

            <View style={styles.pillRow} accessibilityRole="radiogroup" accessibilityLabel="Reading size">
              {SIZE_OPTIONS.map((opt) => {
                const selected = scale === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => setScale(opt.value)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    // Qualified label, not a bare "Standard"/"Large": Maestro's
                    // snapshotKeyHonorModalViews:false reads the More rows
                    // *behind* this sheet, whose reading-size state text is the
                    // bare word — a bare label would be ambiguous in e2e.
                    accessibilityLabel={`${opt.en} reading size`}
                    style={[
                      styles.pill,
                      { borderColor: selected ? colors.saffron : colors.divider, borderRadius: radii.md },
                      selected && { backgroundColor: colors.saffronTint },
                    ]}
                  >
                    {selected && <Text style={[styles.check, { color: colors.saffron }]}>✓</Text>}
                    <Text
                      style={[
                        styles.pillLabel,
                        { color: selected ? colors.saffronDeep : colors.ink, fontFamily: typography.readerTitle.fontFamily },
                      ]}
                    >
                      {opt.hi} · {opt.en}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Live preview — the reader's own verse token, so it re-renders in
                the chosen script at the chosen size. */}
            <Text
              testID="onboarding-setup-sample"
              style={{
                fontFamily: verseTok.fontFamily,
                fontSize: verseTok.fontSize,
                lineHeight: verseTok.lineHeight,
                color: colors.ink,
                textAlign: 'center',
                marginTop: 18,
              }}
            >
              {READING_SIZE_SAMPLE[lang]}
            </Text>
          </ScrollView>

          <Pressable
            onPress={finish}
            accessibilityRole="button"
            accessibilityLabel="Begin"
            style={({ pressed }) => [
              styles.begin,
              { backgroundColor: colors.saffron, borderRadius: radii.md },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={{ color: colors.onPrimary, fontFamily: typography.readerTitle.fontFamily, fontSize: 16 }}>
              आरंभ करें · Begin
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  sheet: { paddingTop: 10, paddingBottom: 28, maxHeight: '88%', ...elevation.overlay },
  grabber: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  scroll: { flexGrow: 0 },
  scrollContent: { paddingBottom: 4 },
  eyebrow: { fontSize: 13, textAlign: 'center', includeFontPadding: false },
  titleHi: { fontSize: 24, textAlign: 'center', marginTop: 4, includeFontPadding: false },
  titleEn: { fontSize: 14, fontStyle: 'italic', textAlign: 'center', marginTop: 2, includeFontPadding: false },
  note: { fontSize: 12, lineHeight: 19, textAlign: 'center', marginTop: 10, opacity: 0.9 },
  list: { borderWidth: 1, marginTop: 16, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14, paddingHorizontal: 14, minHeight: 48 },
  rowEn: { fontFamily: fontFamilies.inter, fontSize: 12 },
  sectionHi: { fontSize: 18, textAlign: 'center', marginTop: 22, includeFontPadding: false },
  sectionEn: { fontSize: 12, fontStyle: 'italic', textAlign: 'center', marginTop: 1, includeFontPadding: false },
  pillRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 12 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 11,
    minHeight: 44,
    borderWidth: 1,
  },
  check: { fontSize: 13 },
  pillLabel: { fontSize: 15, includeFontPadding: false },
  begin: { marginTop: 18, paddingVertical: 14, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
});
