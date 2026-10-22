import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { pick } from '@/utils/localize';
import { titleFontByLang } from '@/utils/langType';

type Props = {
  visible: boolean;
  /** What is being reset, already localized — a chapter tag + title, or the text's name. */
  targetLabel: string;
  /** How many read marks the reset clears. */
  readCount: number;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Confirmation before clearing read marks (design.md §84). States exactly what
 * goes — the read marks — and what stays: the पाठ count and the saved reading
 * position. The caller offers an undo afterwards.
 */
export default function ProgressResetDialog({ visible, targetLabel, readCount, onConfirm, onCancel }: Props) {
  const { colors, radii, spacing } = useTheme();
  const { lang } = useGitaLanguage();
  const titleFont = titleFontByLang(lang);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onCancel}>
      <Pressable
        accessible={false}
        style={[styles.backdrop, { backgroundColor: colors.modalBackdrop }]}
        onPress={onCancel}
      >
        <Pressable
          accessible={false}
          onPress={(e) => e.stopPropagation()}
          style={[
            styles.sheet,
            {
              backgroundColor: colors.parchmentSoft,
              borderColor: colors.cardActiveBorder,
              borderRadius: radii.lg,
              paddingHorizontal: spacing.xxl,
            },
          ]}
        >
          <Text style={[styles.title, { color: colors.ink, fontFamily: titleFont }]}>
            {pick(lang, {
              hi: 'प्रगति रीसेट करें?',
              en: 'Reset progress?',
              gu: 'પ્રગતિ રીસેટ કરવી છે?',
              kn: 'ಪ್ರಗತಿಯನ್ನು ಮರುಹೊಂದಿಸಬೇಕೇ?',
            })}
          </Text>
          <Text style={[styles.target, { color: colors.inkMuted }]} numberOfLines={2}>
            {targetLabel}
          </Text>
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <Text style={[styles.body, { color: colors.inkSoft }]}>
            {pick(lang, {
              hi: `${readCount} पठित चिह्न मिट जाएँगे। पूर्ण पाठ की गिनती और अंतिम पठित स्थान वैसे ही रहेंगे।`,
              en: `${readCount} read marks will be cleared. Your completed readings and last-read place stay.`,
              gu: `${readCount} વાંચેલાં ચિહ્નો ભૂંસાઈ જશે. પૂર્ણ પાઠની ગણતરી અને છેલ્લું વાંચેલું સ્થાન એમ જ રહેશે.`,
              kn: `${readCount} ಓದಿದ ಗುರುತುಗಳು ಅಳಿಸಲ್ಪಡುತ್ತವೆ. ಪೂರ್ಣ ಪಾಠಗಳ ಎಣಿಕೆ ಮತ್ತು ಕೊನೆಯ ಓದಿದ ಸ್ಥಳ ಹಾಗೆಯೇ ಇರುತ್ತದೆ.`,
            })}
          </Text>
          <Pressable
            onPress={onConfirm}
            accessibilityRole="button"
            accessibilityLabel="Reset progress"
            testID="progress-reset-confirm"
            style={({ pressed }) => [
              styles.confirmBtn,
              { backgroundColor: colors.avoidDeep, borderRadius: radii.md },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={[styles.confirmText, { color: colors.onPrimary, fontFamily: titleFont }]}>
              {pick(lang, { hi: 'रीसेट करें', en: 'Reset', gu: 'રીસેટ કરો', kn: 'ಮರುಹೊಂದಿಸಿ' })}
            </Text>
          </Pressable>
          <Pressable
            onPress={onCancel}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
            hitSlop={12}
            style={styles.cancelBtn}
          >
            <Text style={[styles.cancelText, { color: colors.inkMuted }]}>
              {pick(lang, { hi: 'रहने दें', en: 'Cancel', gu: 'રહેવા દો', kn: 'ರದ್ದುಮಾಡಿ' })}
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  sheet: {
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    paddingTop: 22,
    paddingBottom: 12,
  },
  title: {
    fontSize: 19,
    textAlign: 'center',
  },
  target: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  divider: {
    height: 1,
    opacity: 0.6,
    marginVertical: 16,
  },
  body: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 18,
  },
  confirmBtn: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 15,
  },
  cancelBtn: {
    marginTop: 6,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 14,
  },
});
