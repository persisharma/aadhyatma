import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { pick } from '@/utils/localize';

/** Inline "reset done · Undo" row shown where the cleared progress was (design.md §84). */
export default function ResetUndoPill({ onUndo }: { onUndo: () => void }) {
  const { colors, radii } = useTheme();
  const { lang } = useGitaLanguage();
  return (
    <View style={styles.row}>
      <Text style={[styles.status, { color: colors.inkMuted }]}>
        {pick(lang, { hi: 'प्रगति रीसेट हुई', en: 'Progress reset', gu: 'પ્રગતિ રીસેટ થઈ', kn: 'ಪ್ರಗತಿ ಮರುಹೊಂದಿಸಲಾಗಿದೆ' })}
      </Text>
      <Pressable
        onPress={onUndo}
        accessibilityRole="button"
        accessibilityLabel="Undo reset"
        testID="progress-reset-undo"
        hitSlop={10}
        style={({ pressed }) => [
          styles.undo,
          { borderColor: colors.cardActiveBorder, borderRadius: radii.pill },
          pressed && { opacity: 0.7 },
        ]}
      >
        <Text style={[styles.undoText, { color: colors.saffronDeep }]}>
          {pick(lang, { hi: 'पूर्ववत करें', en: 'Undo', gu: 'પૂર્વવત્ કરો', kn: 'ರದ್ದುಗೊಳಿಸಿ' })}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  status: {
    fontSize: 13,
    flexShrink: 1,
  },
  undo: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  undoText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
