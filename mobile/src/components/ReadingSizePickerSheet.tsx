import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { useGitaLanguage, type Lang } from '@/data/gita/language';
import { useFontScale } from '@/contexts/FontScaleContext';
import { pick } from '@/utils/localize';
import { verseToken, cardFontByLang } from '@/utils/langType';
import { type FontScale } from '@/theme/fontScale';

/**
 * Bottom sheet for the reader font size (PRD-04). Replaces the old inline
 * ReadingSizeCard — the More row now shows the current preset as state text and
 * opens this sheet on tap. Two presets only — Standard (M) / Large (L). The
 * sample line uses the same verse token the readers do, so it grows/shrinks live
 * as the size changes; selecting a size keeps the sheet open so the change is
 * visible in the preview. Only reading text scales; the sheet chrome is fixed.
 */

const OPTIONS: readonly {
  value: FontScale;
  label: { hi: string; en: string; gu: string; kn: string };
  a11y: string;
}[] = [
  { value: 'M', label: { hi: 'मानक', en: 'Standard', gu: 'માનક', kn: 'ಪ್ರಮಾಣಿತ' }, a11y: 'Standard' },
  { value: 'L', label: { hi: 'बड़ा', en: 'Large', gu: 'મોટું', kn: 'ದೊಡ್ಡ' }, a11y: 'Large' },
];

const SAMPLE: Record<Lang, string> = {
  hi: 'श्री राम जय राम',
  en: 'Śrī Rāma jaya Rāma',
  gu: 'શ્રી રામ જય રામ',
  kn: 'ಶ್ರೀ ರಾಮ ಜಯ ರಾಮ',
};

/** Localized label for a preset — reused by the More row to render its state text. */
export function readingSizeLabel(scale: FontScale, lang: Lang): string {
  const opt = OPTIONS.find((o) => o.value === scale) ?? OPTIONS[0];
  return pick(lang, opt.label);
}

type Props = { visible: boolean; onClose: () => void };

export default function ReadingSizePickerSheet({ visible, onClose }: Props) {
  const { colors, typography, spacing } = useTheme();
  const { lang } = useGitaLanguage();
  const { scale, setScale } = useFontScale();
  const verseTok = verseToken(lang, typography);

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
          style={[styles.sheet, { backgroundColor: colors.parchmentHighlight, paddingHorizontal: spacing.xxl }]}
        >
          <View style={[styles.grabber, { backgroundColor: colors.divider }]} />
          <Text
            accessibilityRole="header"
            style={{ fontFamily: cardFontByLang(lang), fontSize: 18, color: colors.ink, textAlign: 'center' }}
          >
            {pick(lang, { hi: 'पाठ का आकार', en: 'Reading size', gu: 'વાંચન કદ', kn: 'ಓದುವ ಗಾತ್ರ' })}
          </Text>
          <Text
            style={{ fontFamily: cardFontByLang(lang), fontSize: 12, color: colors.inkMuted, textAlign: 'center', marginTop: 2, marginBottom: spacing.md }}
          >
            {pick(lang, {
              hi: 'श्लोक व अर्थ के अक्षरों का आकार',
              en: 'Verse & meaning text size',
              gu: 'શ્લોક અને અર્થનું કદ',
              kn: 'ಶ್ಲೋಕ ಮತ್ತು ಅರ್ಥದ ಗಾತ್ರ',
            })}
          </Text>

          <View
            style={styles.pillRow}
            accessibilityRole="radiogroup"
            accessibilityLabel={pick(lang, { hi: 'पाठ का आकार', en: 'Reading size', gu: 'વાંચન કદ', kn: 'ಓದುವ ಗಾತ್ರ' })}
          >
            {OPTIONS.map((opt) => {
              const selected = scale === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => setScale(opt.value)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={opt.a11y}
                  style={[
                    styles.pill,
                    { borderColor: selected ? colors.saffron : colors.divider },
                    selected && { backgroundColor: colors.saffronTint },
                  ]}
                >
                  {selected && <Text style={[styles.check, { color: colors.saffron }]}>✓</Text>}
                  <Text style={[styles.pillLabel, { color: selected ? colors.saffronDeep : colors.ink }]}>
                    {pick(lang, opt.label)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text
            testID="reading-size-sample"
            style={{ fontFamily: verseTok.fontFamily, fontSize: verseTok.fontSize, lineHeight: verseTok.lineHeight, color: colors.ink, marginTop: 16, textAlign: 'center' }}
          >
            {SAMPLE[lang]}
          </Text>

          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={pick(lang, { hi: 'हो गया', en: 'Done', gu: 'થઈ ગયું', kn: 'ಮುಗಿಯಿತು' })}
            style={({ pressed }) => [styles.done, { backgroundColor: colors.saffron }, pressed && { opacity: 0.85 }]}
          >
            <Text style={{ color: colors.onPrimary, fontFamily: cardFontByLang(lang), fontSize: 15 }}>
              {pick(lang, { hi: 'हो गया', en: 'Done', gu: 'થઈ ગયું', kn: 'ಮುಗಿಯಿತು' })}
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingTop: 10, paddingBottom: 28 },
  grabber: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  pillRow: { flexDirection: 'row', justifyContent: 'center', gap: 12 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  check: { fontSize: 13 },
  pillLabel: { fontFamily: fontFamilies.interSemiBold, fontSize: 14 },
  done: {
    marginTop: 20,
    borderRadius: 12,
    paddingVertical: 13,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
