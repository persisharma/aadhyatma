import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import type { Lang } from '@/data/gita/language';
import {
  formatIndianNumber,
  normalizeSankalpAmount,
  parseSankalpInput,
  sankalpProgress,
  SANKALP_MALA_BEADS,
  SANKALP_MAX,
  SANKALP_PRESETS,
  SANKALP_STEP,
  type JapaSankalp,
  type JapaSankalpUnit,
} from '@/data/japam/sankalp';
import { pick } from '@/utils/localize';
import { isLatinLang, scriptBodyFont, scriptTitleFont } from '@/utils/langType';
import { RoutineButton } from '@/components/RoutineShell';
import {
  SANKALP_COPY,
  sankalpConversion,
  sankalpEyebrow,
  sankalpHeadline,
  sankalpRangeHint,
  sankalpSoFar,
} from './japaSankalpCopy';

const DEFAULT_UNIT: JapaSankalpUnit = 'mala';
const DEFAULT_AMOUNT = 11;

/** Converts the typed target when the unit changes, so the same vow carries over. */
function convertAmount(from: JapaSankalpUnit, to: JapaSankalpUnit, amount: number | null): number {
  if (amount === null || from === to) return amount ?? (to === 'mala' ? DEFAULT_AMOUNT : DEFAULT_AMOUNT * SANKALP_MALA_BEADS);
  if (to === 'japa') return Math.min(SANKALP_MAX.japa, amount * SANKALP_MALA_BEADS);
  return Math.min(SANKALP_MAX.mala, Math.max(1, Math.round(amount / SANKALP_MALA_BEADS)));
}

/**
 * The japa sankalp sheet (design.md §35.2): take a vow of N malas or N japa for
 * this mantra, change its target, or set it aside. Picking the primary action
 * acts at once; setting an active vow aside asks for native confirmation.
 */
export default function JapaSankalpSheet({
  visible,
  lang,
  mantraName,
  sankalp,
  onTake,
  onRelease,
  onClose,
}: {
  visible: boolean;
  lang: Lang;
  mantraName: string;
  sankalp: JapaSankalp | null;
  onTake: (unit: JapaSankalpUnit, amount: number) => void;
  onRelease: () => void;
  onClose: () => void;
}) {
  const { colors, typography, radii } = useTheme();
  const [unit, setUnit] = useState<JapaSankalpUnit>(DEFAULT_UNIT);
  const [text, setText] = useState(String(DEFAULT_AMOUNT));

  // Every opening starts from the stored vow (or the default), never a stale draft.
  // Only the opening resets the draft: Infinity/audio keep counting behind the
  // sheet, and live progress must not overwrite a target being typed.
  const sankalpRef = useRef(sankalp);
  sankalpRef.current = sankalp;
  useEffect(() => {
    if (!visible) return;
    const stored = sankalpRef.current;
    const active = stored && stored.completedAt === undefined ? stored : null;
    setUnit(active?.unit ?? stored?.unit ?? DEFAULT_UNIT);
    setText(String(active?.amount ?? (stored?.unit === 'japa' ? DEFAULT_AMOUNT * SANKALP_MALA_BEADS : DEFAULT_AMOUNT)));
  }, [visible]);

  const parsed = parseSankalpInput(text);
  const amount = parsed === null ? null : normalizeSankalpAmount(unit, parsed);
  const complete = sankalp?.completedAt !== undefined;
  const active = sankalp !== null && !complete;
  const step = SANKALP_STEP[unit];

  const latin = isLatinLang(lang);
  const titleFont = latin ? typography.readerTitle.fontFamily : scriptTitleFont(lang, typography.readerTitle.fontFamily);
  const bodyFont = latin ? typography.cardLatin.fontFamily : scriptBodyFont(lang, fontFamilies.devanagari);

  const selectUnit = (next: JapaSankalpUnit) => {
    if (next === unit) return;
    setText(String(convertAmount(unit, next, amount)));
    setUnit(next);
  };
  const stepBy = (dir: 1 | -1) => {
    const base = parsed ?? 0;
    const next = dir > 0 ? Math.floor(base / step) * step + step : Math.ceil(base / step) * step - step;
    setText(String(Math.min(SANKALP_MAX[unit], Math.max(step, next))));
  };
  const confirmRelease = () => {
    if (!active) {
      onRelease();
      return;
    }
    Alert.alert(pick(lang, SANKALP_COPY.setAsideTitle), pick(lang, SANKALP_COPY.setAsideBody), [
      { text: pick(lang, SANKALP_COPY.cancel), style: 'cancel' },
      { text: pick(lang, SANKALP_COPY.setAside), style: 'destructive', onPress: onRelease },
    ]);
  };

  const conversion = amount === null ? null : sankalpConversion(lang, unit, amount);
  const progress = sankalp ? sankalpProgress(sankalp) : null;
  const primaryLabel = pick(lang, active ? SANKALP_COPY.update : complete ? SANKALP_COPY.takeNew : SANKALP_COPY.take);
  const primaryA11y = active ? 'Update sankalp target' : complete ? 'Take a new sankalp' : 'Take this sankalp';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Not an accessible element itself, so the controls inside stay reachable
            for screen readers and e2e (an accessible backdrop collapses them). */}
        <Pressable
          style={[styles.backdrop, { backgroundColor: colors.modalBackdrop }]}
          onPress={onClose}
          accessible={false}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            accessible={false}
            testID="japa-sankalp-sheet"
            style={[
              styles.sheet,
              {
                backgroundColor: colors.parchment,
                borderColor: colors.cardActiveBorder,
                borderTopLeftRadius: radii.lg,
                borderTopRightRadius: radii.lg,
              },
            ]}
          >
            <SafeAreaView edges={['bottom']}>
              <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <View style={[styles.grip, { backgroundColor: colors.dotRest }]} />
                <Text style={[styles.title, { color: colors.ink, fontFamily: titleFont }]} accessibilityRole="header">
                  {pick(lang, SANKALP_COPY.title)}
                </Text>
                <Text style={[styles.mantra, { color: colors.inkMuted, fontFamily: bodyFont }, latin && styles.italic]}>
                  {mantraName}
                </Text>

                {sankalp && progress ? (
                  <View
                    style={[styles.progressCard, { backgroundColor: colors.parchmentSoft, borderColor: colors.goldTint, borderRadius: radii.md }]}
                  >
                    <Text style={[styles.progressEyebrow, { color: colors.saffronDeep, fontFamily: latin ? fontFamilies.latinItalic : scriptTitleFont(lang, fontFamilies.devanagariBold) }]}>
                      {sankalpEyebrow(lang, progress.complete)}
                    </Text>
                    <Text style={[styles.progressHeadline, { color: colors.ink, fontFamily: latin ? fontFamilies.latinSemiBold : scriptTitleFont(lang, fontFamilies.devanagariBold) }]}>
                      {sankalpHeadline(lang, sankalp)}
                    </Text>
                    <View
                      style={[styles.track, { backgroundColor: colors.parchmentDeep, borderRadius: radii.pill }]}
                      accessibilityRole="progressbar"
                      accessibilityValue={{ min: 0, max: progress.target, now: progress.done }}
                    >
                      <LinearGradient
                        colors={[colors.gold, colors.saffron]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ width: `${Math.round(progress.fraction * 1000) / 10}%`, height: '100%', borderRadius: radii.pill }}
                      />
                    </View>
                    <Text style={[styles.caption, { color: colors.inkSoft, fontFamily: bodyFont }]}>
                      {progress.complete ? pick(lang, SANKALP_COPY.completeLine) : sankalpSoFar(lang, sankalp)}
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.caption, styles.intro, { color: colors.inkSoft, fontFamily: bodyFont }]}>
                    {pick(lang, SANKALP_COPY.intro)}
                  </Text>
                )}

                <Text style={[styles.label, { color: colors.inkMuted, fontFamily: bodyFont }]}>
                  {pick(lang, sankalp ? SANKALP_COPY.newTarget : SANKALP_COPY.target)}
                </Text>
                <View style={styles.units} accessibilityRole="radiogroup">
                  {(['mala', 'japa'] as const).map((u) => {
                    const selected = unit === u;
                    const label = pick(lang, u === 'mala' ? SANKALP_COPY.unitMala : SANKALP_COPY.unitJapa);
                    return (
                      <Pressable
                        key={u}
                        testID={`japa-sankalp-unit-${u}`}
                        onPress={() => selectUnit(u)}
                        accessibilityRole="radio"
                        accessibilityLabel={u === 'mala' ? 'Count in malas' : 'Count in japa'}
                        accessibilityState={{ selected, checked: selected }}
                        style={({ pressed }) => [
                          styles.unit,
                          {
                            backgroundColor: selected ? colors.saffronTint : colors.parchmentSoft,
                            borderColor: selected ? colors.saffronDeep : colors.divider,
                            opacity: pressed ? 0.7 : 1,
                          },
                        ]}
                      >
                        <Text style={[styles.unitText, { color: selected ? colors.saffronDeep : colors.inkMuted, fontFamily: bodyFont }]}>
                          {label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <View style={styles.presets}>
                  {SANKALP_PRESETS[unit].map((n) => {
                    const selected = amount === n;
                    return (
                      <Pressable
                        key={`${unit}-${n}`}
                        testID={`japa-sankalp-preset-${n}`}
                        onPress={() => setText(String(n))}
                        accessibilityRole="button"
                        accessibilityLabel={`${n} ${unit === 'mala' ? (n === 1 ? 'mala' : 'malas') : 'japa'}`}
                        accessibilityState={{ selected }}
                        style={({ pressed }) => [
                          styles.chip,
                          {
                            backgroundColor: selected ? colors.goldChipBg : colors.parchmentSoft,
                            borderColor: selected ? colors.gold : colors.divider,
                            opacity: pressed ? 0.7 : 1,
                          },
                        ]}
                      >
                        <Text style={[styles.chipText, { color: selected ? colors.saffronDeep : colors.ink, fontFamily: fontFamilies.inter }]}>
                          {formatIndianNumber(n)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <View style={styles.stepper}>
                  <Pressable
                    onPress={() => stepBy(-1)}
                    disabled={parsed === null || parsed <= step}
                    accessibilityRole="button"
                    accessibilityLabel="Decrease target"
                    accessibilityState={{ disabled: parsed === null || parsed <= step }}
                    style={({ pressed }) => [
                      styles.stepBtn,
                      { borderColor: colors.cardActiveBorder, backgroundColor: colors.parchmentSoft },
                      pressed && { opacity: 0.7 },
                      (parsed === null || parsed <= step) && { opacity: 0.4 },
                    ]}
                  >
                    <Text style={[styles.stepGlyph, { color: colors.saffronDeep }]}>−</Text>
                  </Pressable>
                  <TextInput
                    testID="japa-sankalp-amount"
                    value={text}
                    onChangeText={setText}
                    keyboardType="number-pad"
                    returnKeyType="done"
                    maxLength={9}
                    selectTextOnFocus
                    accessibilityLabel={unit === 'mala' ? 'Number of malas' : 'Number of japa'}
                    style={[
                      styles.input,
                      {
                        color: colors.ink,
                        borderColor: amount === null ? colors.avoid : colors.divider,
                        backgroundColor: colors.parchmentSoft,
                        borderRadius: radii.sm,
                        // Inter's lining figures: Cormorant's old-style "11" reads as "ıı".
                        fontFamily: fontFamilies.interSemiBold,
                      },
                    ]}
                  />
                  <Pressable
                    onPress={() => stepBy(1)}
                    disabled={parsed !== null && parsed >= SANKALP_MAX[unit]}
                    accessibilityRole="button"
                    accessibilityLabel="Increase target"
                    style={({ pressed }) => [
                      styles.stepBtn,
                      { borderColor: colors.cardActiveBorder, backgroundColor: colors.parchmentSoft },
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <Text style={[styles.stepGlyph, { color: colors.saffronDeep }]}>+</Text>
                  </Pressable>
                </View>
                <Text
                  style={[styles.conversion, { color: amount === null ? colors.avoidDeep : colors.inkMuted, fontFamily: bodyFont }]}
                  accessibilityLiveRegion="polite"
                >
                  {amount === null ? sankalpRangeHint(lang, SANKALP_MAX[unit]) : conversion ?? ' '}
                </Text>

                <RoutineButton
                  label={primaryLabel}
                  accessibilityLabel={primaryA11y}
                  testID="japa-sankalp-confirm"
                  disabled={amount === null}
                  onPress={() => {
                    if (amount !== null) onTake(unit, amount);
                  }}
                />
                {sankalp ? (
                  <RoutineButton
                    variant="ghost"
                    label={pick(lang, active ? SANKALP_COPY.setAside : SANKALP_COPY.clearDone)}
                    accessibilityLabel={active ? 'Set this sankalp aside' : 'Clear completed sankalp'}
                    testID="japa-sankalp-release"
                    onPress={confirmRelease}
                  />
                ) : null}
                <Pressable onPress={onClose} style={styles.cancel} hitSlop={8} accessibilityRole="button" accessibilityLabel="Cancel">
                  <Text style={[styles.cancelText, { color: colors.inkMuted, fontFamily: bodyFont }, latin && styles.italic]}>
                    {pick(lang, SANKALP_COPY.cancel)}
                  </Text>
                </Pressable>
              </ScrollView>
            </SafeAreaView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    borderTopWidth: 1,
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 8,
    maxHeight: '88%',
  },
  grip: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 14 },
  title: { fontSize: 18, lineHeight: 27, textAlign: 'center' },
  mantra: { fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 2 },
  italic: { fontStyle: 'italic' },
  intro: { textAlign: 'center', marginTop: 10 },
  progressCard: { borderWidth: 1, padding: 14, marginTop: 12 },
  progressEyebrow: { fontSize: 13, lineHeight: 20 },
  progressHeadline: { fontSize: 22, lineHeight: 33, marginTop: 2 },
  track: { height: 7, marginTop: 8, overflow: 'hidden' },
  caption: { fontSize: 14, lineHeight: 21, marginTop: 8 },
  label: { fontSize: 13, lineHeight: 20, marginTop: 16, marginBottom: 6 },
  units: { flexDirection: 'row', gap: 8 },
  unit: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
  },
  unitText: { fontSize: 15, lineHeight: 23, textAlign: 'center' },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  chip: {
    minHeight: 44,
    minWidth: 52,
    paddingHorizontal: 14,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: { fontSize: 14 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepGlyph: { fontSize: 22, lineHeight: 26, includeFontPadding: false },
  input: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 20,
    textAlign: 'center',
  },
  conversion: { fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 6 },
  cancel: { marginTop: 4, paddingVertical: 12, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  cancelText: { fontSize: 13, lineHeight: 20, opacity: 0.85 },
});
