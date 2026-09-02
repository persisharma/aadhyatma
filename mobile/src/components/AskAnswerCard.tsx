/**
 * जिज्ञासा answer + abstain cards (PRD-25 Phase 1, design.md §67).
 *
 * The answer card is the whole feature's face: an eyebrow tag, the answer as a
 * headline, label·value rows (निषेध rows in the warm `avoid` tone), a collapsed
 * "गणना देखें" working trail (§51's no-opaque-verdict rule generalised), the
 * registry's own tradition note and provenance line, and ≤ 3 actions of which
 * the first is primary. The abstain card is deliberately as designed as the
 * answer: below the threshold the app says so plainly and offers did-you-mean
 * chips; a stance-guard decline gets its own copy.
 */
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import type { Lang } from '@/data/gita/language';
import { contentByLang, pick } from '@/utils/localize';
import { eyebrowTextStyle, scriptBodyFont, scriptTitleFont } from '@/utils/langType';
import type { AskAnswer, AskSuggestion, AskTarget, Localized } from '@/ask/types';

function loc(lang: Lang, l: Localized): string {
  return contentByLang(lang, l.hi, l.en);
}

type AnswerProps = {
  answer: AskAnswer;
  lang: Lang;
  onAction: (target: AskTarget) => void;
  /** Phase 2 briefing renders several cards; `compact` tightens the padding. */
  compact?: boolean;
};

export default function AskAnswerCard({ answer, lang, onAction, compact }: AnswerProps) {
  const { colors, spacing, radii, elevation } = useTheme();
  const [showWorking, setShowWorking] = useState(false);
  const titleFont = scriptTitleFont(lang, fontFamilies.devanagariBold);
  const bodyFont = scriptBodyFont(lang, fontFamilies.devanagari);

  return (
    <LinearGradient
      colors={[colors.cardActiveFrom, colors.cardActiveTo]}
      style={[
        styles.card,
        { borderColor: colors.cardActiveBorder, borderRadius: radii.lg, padding: compact ? spacing.md : spacing.lg },
        elevation.card,
      ]}
      accessibilityRole="summary"
      accessibilityLabel={`Answer. ${answer.headline.en}`}
      testID="ask-answer-card"
    >
      <View style={[styles.tag, { backgroundColor: colors.goldChipBg, borderRadius: radii.pill }]}>
        <Text style={[eyebrowTextStyle(lang, 10.5, 0.9), { color: colors.saffronDeep }]}>{loc(lang, answer.tag)}</Text>
      </View>

      <Text style={[styles.headline, { color: colors.ink, fontFamily: titleFont }]}>{loc(lang, answer.headline)}</Text>
      {answer.sub ? (
        <Text style={[styles.sub, { color: colors.inkSoft, fontFamily: lang === 'en' ? fontFamilies.latinItalic : bodyFont }]}>
          {loc(lang, answer.sub)}
        </Text>
      ) : null}

      <View style={[styles.rows, { marginTop: spacing.md }]}>
        {answer.lines.map((line, i) => {
          const avoid = line.tone === 'avoid';
          return (
            <View key={`${i}-${line.label.en}`} style={styles.row}>
              <Text
                style={[
                  styles.rowLabel,
                  eyebrowTextStyle(lang, 10.5, 0.5),
                  { color: avoid ? colors.avoid : colors.inkMuted },
                ]}
                numberOfLines={2}
              >
                {loc(lang, line.label)}
              </Text>
              <Text style={[styles.rowValue, { color: avoid ? colors.avoidDeep : colors.ink, fontFamily: bodyFont }]}>
                {loc(lang, line.value)}
              </Text>
            </View>
          );
        })}
      </View>

      {answer.working.length > 0 ? (
        <View style={[styles.working, { borderTopColor: colors.divider, marginTop: spacing.md, paddingTop: spacing.sm }]}>
          <Pressable
            onPress={() => setShowWorking((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={pick(lang, { hi: 'गणना देखें', en: 'Show the working', gu: 'ગણતરી જુઓ', kn: 'ಲೆಕ್ಕಾಚಾರ ನೋಡಿ' })}
            hitSlop={8}
          >
            <Text style={[styles.workingToggle, { color: colors.saffron, fontFamily: fontFamilies.interSemiBold }]}>
              {showWorking ? '▾ ' : '▸ '}
              {pick(lang, { hi: 'गणना देखें', en: 'Show the working', gu: 'ગણતરી જુઓ', kn: 'ಲೆಕ್ಕಾಚಾರ ನೋಡಿ' })}
            </Text>
          </Pressable>
          {showWorking
            ? answer.working.map((w, i) => (
                <Text key={i} style={[styles.workingLine, { color: colors.inkMuted }]}>
                  {w}
                </Text>
              ))
            : null}
        </View>
      ) : null}

      {answer.note ? (
        <Text style={[styles.note, { color: colors.inkMuted, fontFamily: bodyFont, marginTop: spacing.sm }]}>{loc(lang, answer.note)}</Text>
      ) : null}
      {answer.provenance ? (
        <Text style={[styles.provenance, { color: colors.inkSoft, fontFamily: fontFamilies.inter, marginTop: spacing.xs }]}>
          {loc(lang, answer.provenance)}
        </Text>
      ) : null}

      {answer.actions.length > 0 ? (
        <View style={[styles.actions, { marginTop: spacing.md, gap: spacing.sm }]}>
          {answer.actions.slice(0, 3).map((a, i) => {
            const primary = i === 0;
            return (
              <Pressable
                key={`${i}-${a.label.en}`}
                onPress={() => onAction(a.target)}
                accessibilityRole="button"
                accessibilityLabel={a.label.en}
                style={({ pressed }) => [
                  styles.action,
                  {
                    borderRadius: radii.md,
                    backgroundColor: primary ? colors.saffron : 'transparent',
                    borderColor: primary ? colors.saffron : colors.cardActiveBorder,
                    opacity: pressed ? 0.75 : 1,
                  },
                ]}
              >
                <Text style={[styles.actionText, { color: primary ? colors.onPrimary : colors.saffronDeep, fontFamily: titleFont }]}>
                  {loc(lang, a.label)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </LinearGradient>
  );
}

type AbstainProps = {
  kind: 'none' | 'declined';
  suggestions: readonly AskSuggestion[];
  lang: Lang;
  onSuggestion: (question: string) => void;
  /** True when the library search below found nothing either. */
  libraryEmpty: boolean;
};

export function AskAbstainCard({ kind, suggestions, lang, onSuggestion, libraryEmpty }: AbstainProps) {
  const { colors, spacing, radii } = useTheme();
  const titleFont = scriptTitleFont(lang, fontFamilies.devanagariBold);
  const bodyFont = scriptBodyFont(lang, fontFamilies.devanagari);
  const primary =
    kind === 'declined'
      ? pick(lang, {
          hi: 'यह प्रश्न भविष्य या व्यक्तिगत निर्णय का है — वेदांश़ इसका उत्तर नहीं देता।',
          en: 'That asks about the future or a personal decision — Vedansh does not answer those.',
          gu: 'આ પ્રશ્ન ભવિષ્ય કે વ્યક્તિગત નિર્ણયનો છે — વેદાંશ તેનો ઉત્તર આપતું નથી.',
          kn: 'ಇದು ಭವಿಷ್ಯ ಅಥವಾ ವೈಯಕ್ತಿಕ ನಿರ್ಧಾರದ ಪ್ರಶ್ನೆ — ವೇದಾಂಶ ಇದಕ್ಕೆ ಉತ್ತರಿಸುವುದಿಲ್ಲ.',
        })
      : pick(lang, {
          hi: 'इसका उत्तर अभी नहीं दे सकते।',
          en: "We can't answer that one yet.",
          gu: 'આનો ઉત્તર હમણાં આપી શકતા નથી.',
          kn: 'ಇದಕ್ಕೆ ಈಗ ಉತ್ತರಿಸಲಾಗುತ್ತಿಲ್ಲ.',
        });
  const secondary =
    kind === 'declined'
      ? pick(lang, {
          hi: 'आज की तिथि, व्रत, भोग, विधि या मुहूर्त पूछिए।',
          en: "Ask about today's tithi, a vrat, a bhog, a vidhi or a muhurat.",
          gu: 'આજની તિથિ, વ્રત, ભોગ, વિધિ કે મુહૂર્ત પૂછો.',
          kn: 'ಇಂದಿನ ತಿಥಿ, ವ್ರತ, ಭೋಗ, ವಿಧಿ ಅಥವಾ ಮುಹೂರ್ತ ಕೇಳಿ.',
        })
      : libraryEmpty
        ? pick(lang, {
            hi: 'पुस्तकालय में भी कुछ नहीं मिला — नीचे के प्रश्न आज़माएँ।',
            en: 'The library found nothing either — try one of the questions below.',
            gu: 'પુસ્તકાલયમાં પણ કંઈ મળ્યું નહીં — નીચેના પ્રશ્નો અજમાવો.',
            kn: 'ಗ್ರಂಥಾಲಯದಲ್ಲೂ ಏನೂ ಸಿಗಲಿಲ್ಲ — ಕೆಳಗಿನ ಪ್ರಶ್ನೆಗಳನ್ನು ಪ್ರಯತ್ನಿಸಿ.',
          })
        : pick(lang, {
            hi: 'नीचे पुस्तकालय से मिले परिणाम हैं।',
            en: "Here's what the library found instead.",
            gu: 'નીચે પુસ્તકાલયમાંથી મળેલાં પરિણામો છે.',
            kn: 'ಕೆಳಗೆ ಗ್ರಂಥಾಲಯದಿಂದ ದೊರೆತ ಫಲಿತಾಂಶಗಳಿವೆ.',
          });

  return (
    <View
      style={[styles.abstain, { backgroundColor: colors.parchmentSoft, borderColor: colors.cardActiveBorder, borderRadius: radii.lg, padding: spacing.md }]}
      accessibilityRole="summary"
      accessibilityLabel={kind === 'declined' ? 'Question declined' : 'No answer'}
      testID="ask-abstain-card"
    >
      <Text style={[styles.abstainPrimary, { color: colors.inkSoft, fontFamily: titleFont }]}>{primary}</Text>
      <Text style={[styles.abstainSecondary, { color: colors.inkMuted, fontFamily: lang === 'en' ? fontFamilies.latinItalic : bodyFont }]}>{secondary}</Text>
      {suggestions.length > 0 ? (
        <>
          <Text style={[eyebrowTextStyle(lang, 10.5, 1), { color: colors.inkMuted, marginTop: spacing.md, marginBottom: spacing.xs }]}>
            {pick(lang, { hi: 'शायद आप यह पूछना चाहते हैं', en: 'Perhaps you meant', gu: 'કદાચ તમે આ પૂછવા માગો છો', kn: 'ಬಹುಶಃ ನೀವು ಇದನ್ನು ಕೇಳಲು ಬಯಸಿದ್ದೀರಿ' })}
          </Text>
          <View style={[styles.chips, { gap: spacing.sm }]}>
            {suggestions.map((s) => (
              <Pressable
                key={s.question.en}
                onPress={() => onSuggestion(loc(lang, s.question))}
                accessibilityRole="button"
                accessibilityLabel={`Ask: ${s.question.en}`}
                style={({ pressed }) => [
                  styles.chip,
                  { backgroundColor: colors.saffronTint, borderColor: colors.cardActiveBorder, borderRadius: radii.pill, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text style={[styles.chipText, { color: colors.saffronDeep, fontFamily: bodyFont }]}>{loc(lang, s.question)}</Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1 },
  tag: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, marginBottom: 8 },
  headline: { fontSize: 19, lineHeight: 28 },
  sub: { fontSize: 14, lineHeight: 20, marginTop: 2 },
  rows: { gap: 7 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  rowLabel: { width: 78, paddingTop: 3 },
  rowValue: { flex: 1, fontSize: 14.5, lineHeight: 22 },
  working: { borderTopWidth: StyleSheet.hairlineWidth },
  workingToggle: { fontSize: 12 },
  workingLine: { fontFamily: undefined, fontSize: 11, lineHeight: 17, marginTop: 4 },
  note: { fontSize: 12.5, lineHeight: 19 },
  provenance: { fontSize: 11, lineHeight: 16 },
  actions: { flexDirection: 'row', flexWrap: 'wrap' },
  action: { borderWidth: 1, paddingHorizontal: 13, paddingVertical: 8 },
  actionText: { fontSize: 13.5 },
  abstain: { borderWidth: 1, borderStyle: 'dashed' },
  abstainPrimary: { fontSize: 15.5, lineHeight: 23 },
  abstainSecondary: { fontSize: 13, lineHeight: 19, marginTop: 3 },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { borderWidth: 1, paddingHorizontal: 11, paddingVertical: 6 },
  chipText: { fontSize: 13 },
});
