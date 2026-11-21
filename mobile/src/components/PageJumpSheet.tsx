import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, findNodeHandle, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGitaLanguage } from '@/data/gita/language';
import { useTheme } from '@/theme/ThemeContext';
import { cardFontByLang } from '@/utils/langType';
import { pick } from '@/utils/localize';
import { parseVerseNumber } from './GitaVerseJumpSheet';

export const PAGE_JUMP_LABEL = { hi: 'पृष्ठ पर जाएँ', en: 'Go to page', gu: 'પૃષ્ઠ પર જાઓ', kn: 'ಪುಟಕ್ಕೆ ಹೋಗಿ' };
const PAGE = { hi: 'पृष्ठ', en: 'Page', gu: 'પૃષ્ઠ', kn: 'ಪುಟ' };

/**
 * The page picker every paged reader opens from its counter (design.md §94).
 * It is the Gita verse sheet without the chapter field: choose a page from the
 * grid or type its number, then open it. A reader whose pages have names (a
 * short prose lesson) passes `titles` and gets one named row per page instead.
 *
 * Mounted per opening, so a cancelled draft never leaks into a later visit.
 */
export default function PageJumpSheet({ current, total, titles, onClose, onOpen }: {
  /** 1-based page on screen. */
  current: number;
  total: number;
  /** Already localized, one per page. Ignored unless there is one for every page. */
  titles?: string[];
  onClose: () => void;
  /** Called with a 1-based page. */
  onOpen: (page: number) => void;
}) {
  const { lang } = useGitaLanguage();
  const { colors, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const [input, setInput] = useState(String(current));
  const titleRef = useRef<Text>(null);
  const gridRef = useRef<ScrollView>(null);
  const positions = useRef(new Map<number, number>());
  const named = titles != null && titles.length === total;
  const selected = parseVerseNumber(input, total);
  const revealSelection = useCallback(() => {
    const y = selected == null ? undefined : positions.current.get(selected);
    if (y != null) gridRef.current?.scrollTo({ y: Math.max(0, y - 60), animated: false });
  }, [selected]);
  useEffect(revealSelection, [revealSelection]);
  const body = { ...typography.catalogBody, fontFamily: cardFontByLang(lang), color: colors.ink };
  const label = { ...body, color: colors.inkMuted };
  const openLabel = selected == null ? pick(lang, PAGE_JUMP_LABEL) : pick(lang, {
    hi: `पृष्ठ ${selected} खोलें`, en: `Open page ${selected}`, gu: `પૃષ્ઠ ${selected} ખોલો`, kn: `ಪುಟ ${selected} ತೆರೆಯಿರಿ`,
  });
  const open = () => { if (selected != null) onOpen(selected); };

  return <Modal transparent animationType="fade" onRequestClose={onClose} onShow={() => {
    const node = findNodeHandle(titleRef.current);
    if (node != null) AccessibilityInfo.setAccessibilityFocus(node);
  }}>
    <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Pressable testID="page-jump-backdrop" accessible={false} onPress={onClose} style={[StyleSheet.absoluteFill, { backgroundColor: colors.modalBackdrop }]} />
      <View testID="page-jump-sheet" accessibilityViewIsModal onAccessibilityEscape={onClose} style={[styles.sheet, { backgroundColor: colors.parchmentHighlight, borderColor: colors.divider, marginTop: insets.top + 12, paddingBottom: Math.max(insets.bottom, 12) }]}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          <Text ref={titleRef} accessible accessibilityRole="header" style={[body, typography.catalogTitle, styles.heading]}>{pick(lang, PAGE_JUMP_LABEL)}</Text>
          {!named && <View>
            <Text style={label}>{pick(lang, PAGE)} · 1–{total}</Text>
            <TextInput testID="page-jump-input" accessibilityLabel={pick(lang, PAGE)} value={input} onChangeText={setInput} keyboardType="number-pad" returnKeyType="done" onSubmitEditing={open} maxLength={8} style={[body, styles.control, { borderColor: colors.saffronDeep }]} />
          </View>}
          {selected == null && <Text accessibilityLiveRegion="polite" style={[body, { color: colors.avoidDeep }]}>{pick(lang, {
            hi: `1 से ${total} तक पृष्ठ संख्या डालें।`, en: `Enter a page from 1 to ${total}.`,
            gu: `1 થી ${total} સુધીનો પૃષ્ઠ નંબર લખો.`, kn: `1 ರಿಂದ ${total} ರವರೆಗಿನ ಪುಟ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ.`,
          })}</Text>}
          <ScrollView ref={gridRef} nestedScrollEnabled keyboardShouldPersistTaps="handled" style={styles.choices} onContentSizeChange={revealSelection}><View style={styles.grid}>
            {Array.from({ length: total }, (_, index) => index + 1).map(number => {
              const active = selected === number;
              return <Pressable key={number} testID={`page-jump-page-${number}`}
                onLayout={event => { positions.current.set(number, event.nativeEvent.layout.y); if (active) revealSelection(); }}
                accessibilityRole="button" accessibilityLabel={named ? `${pick(lang, PAGE)} ${number}. ${titles[number - 1]}` : `${pick(lang, PAGE)} ${number}`}
                accessibilityState={{ selected: active }} onPress={() => setInput(String(number))}
                style={[named ? styles.row : styles.cell, { borderColor: colors.divider, backgroundColor: active ? colors.saffronDeep : colors.parchmentSoft }]}>
                <Text style={[body, { color: active ? colors.onPrimary : colors.ink }]}>{named ? `${number} · ${titles[number - 1]}` : number}</Text>
              </Pressable>;
            })}
          </View></ScrollView>
          <Pressable testID="page-jump-open" accessibilityRole="button" accessibilityState={{ disabled: selected == null }} disabled={selected == null} onPress={open} style={[styles.action, { backgroundColor: colors.saffronDeep, opacity: selected == null ? 0.5 : 1 }]}>
            <Text style={[body, { color: colors.onPrimary, textAlign: 'center' }]}>{openLabel}</Text>
          </Pressable>
          <Pressable testID="page-jump-cancel" accessibilityRole="button" onPress={onClose} style={styles.action}>
            <Text style={[body, { color: colors.saffronDeep }]}>{pick(lang, { hi: 'रद्द करें', en: 'Cancel', gu: 'રદ કરો', kn: 'ರದ್ದುಮಾಡಿ' })}</Text>
          </Pressable>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  </Modal>;
}

// Same geometry as GitaVerseJumpSheet, so the two pickers read as one control.
const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', padding: 16 },
  sheet: { maxHeight: '90%', borderWidth: 1, borderRadius: 22 },
  content: { padding: 18, gap: 12 },
  heading: { textAlign: 'center' },
  control: { minHeight: 48, borderWidth: 1, borderRadius: 14, padding: 12, justifyContent: 'center', marginTop: 4 },
  choices: { maxHeight: 240 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cell: { minWidth: 48, minHeight: 48, flexBasis: '21%', flexGrow: 1, padding: 8, borderWidth: 1, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  row: { minHeight: 48, flexBasis: '100%', padding: 12, borderWidth: 1, borderRadius: 10, justifyContent: 'center' },
  action: { minHeight: 48, padding: 12, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
