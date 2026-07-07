import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage, LANGUAGES } from '@/data/gita/language';
import type { LangScript } from '@/data/gita/language';
import { fontFamilies } from '@/theme/typography';
import { pick } from '@/utils/localize';
import { cardFontByLang } from '@/utils/langType';

/**
 * Bottom sheet for the app-wide default reading language (More hub §37). Replaces
 * the old inline 2×2 radio grid — the More row now shows the current language as
 * state text and opens this sheet on tap. Same persisted state as every Language
 * Toggle (`useGitaLanguage`). Picking a language applies it and closes the sheet.
 */

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

type Props = { visible: boolean; onClose: () => void };

export default function LanguagePickerSheet({ visible, onClose }: Props) {
  const { colors, typography, spacing } = useTheme();
  const { lang, setLang } = useGitaLanguage();

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
            style={{ fontFamily: cardFontByLang(lang), fontSize: 18, color: colors.ink, textAlign: 'center', marginBottom: spacing.md }}
          >
            {pick(lang, { hi: 'पढ़ने की भाषा', en: 'Reading language', gu: 'વાંચનની ભાષા', kn: 'ಓದುವ ಭಾಷೆ' })}
          </Text>

          <View accessibilityRole="radiogroup">
            {LANGUAGES.map((opt, i) => {
              const selected = lang === opt.value;
              const family = familyFor(opt.script, typography.readerTitle.fontFamily);
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => {
                    setLang(opt.value);
                    onClose();
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={opt.a11yLabel}
                  style={({ pressed }) => [
                    styles.row,
                    i < LANGUAGES.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.divider },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text style={{ flex: 1, fontFamily: family, fontSize: 18, color: selected ? colors.saffronDeep : colors.ink }}>
                    {opt.nativeLabel}
                  </Text>
                  {selected && <Text style={{ color: colors.saffron, fontSize: 16 }}>✓</Text>}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingTop: 10, paddingBottom: 28 },
  grabber: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, gap: 12 },
});
