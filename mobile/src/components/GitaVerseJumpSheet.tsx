import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, findNodeHandle, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import AppIcon from './AppIcon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { gitaChaptersManifest } from '@/data/gita';
import { useGitaLanguage } from '@/data/gita/language';
import { useTheme } from '@/theme/ThemeContext';
import { cardFontByLang } from '@/utils/langType';
import { contentByLang, pick } from '@/utils/localize';

export const JUMP_LABEL = { hi: 'श्लोक पर जाएँ', en: 'Go to verse', gu: 'શ્લોક પર જાઓ', kn: 'ಶ್ಲೋಕಕ್ಕೆ ಹೋಗಿ' };
const CHAPTER = { hi: 'अध्याय', en: 'Chapter', gu: 'અધ્યાય', kn: 'ಅಧ್ಯಾಯ' };
const VERSE = { hi: 'श्लोक', en: 'Verse', gu: 'શ્લોક', kn: 'ಶ್ಲೋಕ' };

/** Accept keyboard and pasted numerals in all four reading scripts, never partial numbers. */
export function parseVerseNumber(value: string, maximum: number): number | null {
  const normalized = value.trim().replace(/[०-९૦-૯೦-೯]/g, digit => {
    const code = digit.charCodeAt(0);
    const zero = code >= 0x0ce6 ? 0x0ce6 : code >= 0x0ae6 ? 0x0ae6 : 0x0966;
    return String(code - zero);
  });
  if (!/^[0-9]+$/.test(normalized)) return null;
  const number = Number(normalized);
  return Number.isSafeInteger(number) && number >= 1 && number <= maximum ? number : null;
}

/** Mounted per opening so cancelled drafts never leak into a later visit. Manifest only. */
export default function GitaVerseJumpSheet({ chapter, verse, onClose, onOpen }: {
  chapter: number;
  verse: number;
  onClose: () => void;
  onOpen: (chapter: number, verse: number) => boolean;
}) {
  const { lang } = useGitaLanguage();
  const { colors, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedChapter, setSelectedChapter] = useState(chapter);
  const [input, setInput] = useState(String(verse));
  const [choosingChapter, setChoosingChapter] = useState(false);
  const [failed, setFailed] = useState(false);
  const submitted = useRef(false);
  const titleRef = useRef<Text>(null);
  const gridRef = useRef<ScrollView>(null);
  const versePositions = useRef(new Map<number, number>());
  const summary = gitaChaptersManifest.find(item => item.chapter === selectedChapter)!;
  const selectedVerse = parseVerseNumber(input, summary.verseCount);
  const revealSelection = useCallback(() => {
    const y = selectedVerse == null ? undefined : versePositions.current.get(selectedVerse);
    if (y != null) gridRef.current?.scrollTo({ y: Math.max(0, y - 60), animated: false });
  }, [selectedVerse]);
  useEffect(revealSelection, [revealSelection, selectedChapter, choosingChapter]);
  const body = { ...typography.catalogBody, fontFamily: cardFontByLang(lang), color: colors.ink };
  const label = { ...body, color: colors.inkMuted };
  const openLabel = selectedVerse == null ? pick(lang, JUMP_LABEL) : pick(lang, {
    hi: `श्लोक ${selectedChapter}.${selectedVerse} खोलें`, en: `Open verse ${selectedChapter}.${selectedVerse}`,
    gu: `શ્લોક ${selectedChapter}.${selectedVerse} ખોલો`, kn: `ಶ್ಲೋಕ ${selectedChapter}.${selectedVerse} ತೆರೆಯಿರಿ`,
  });
  const open = () => {
    if (selectedVerse == null || submitted.current) return;
    submitted.current = true;
    if (!onOpen(selectedChapter, selectedVerse)) {
      submitted.current = false;
      setFailed(true);
    }
  };

  return <Modal transparent animationType="fade" onRequestClose={onClose} onShow={() => {
    const node = findNodeHandle(titleRef.current);
    if (node != null) AccessibilityInfo.setAccessibilityFocus(node);
  }}>
    <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Pressable testID="gita-jump-backdrop" accessible={false} onPress={onClose} style={[StyleSheet.absoluteFill, { backgroundColor: colors.modalBackdrop }]} />
      <View accessibilityViewIsModal onAccessibilityEscape={onClose} style={[styles.sheet, { backgroundColor: colors.parchmentHighlight, borderColor: colors.divider, marginTop: insets.top + 12, paddingBottom: Math.max(insets.bottom, 12) }]}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          <Text ref={titleRef} accessible accessibilityRole="header" style={[body, typography.catalogTitle, styles.heading]}>{pick(lang, JUMP_LABEL)}</Text>
          <View style={styles.fields}>
            <View style={styles.field}>
              <Text style={label}>{pick(lang, CHAPTER)}</Text>
              <Pressable testID="gita-jump-chapter" accessibilityRole="button" accessibilityLabel={`${pick(lang, CHAPTER)} ${selectedChapter}`} accessibilityState={{ expanded: choosingChapter }} onPress={() => setChoosingChapter(value => !value)} style={[styles.control, { borderColor: colors.divider }]}>
                <View style={styles.chapterValue}><Text style={body}>{selectedChapter}</Text><AppIcon name="caretDown" size={16} color={colors.saffronDeep} /></View>
              </Pressable>
            </View>
            <View style={styles.field}>
              <Text style={label}>{pick(lang, VERSE)}</Text>
              <TextInput testID="gita-jump-input" accessibilityLabel={pick(lang, VERSE)} value={input} onChangeText={value => { setInput(value); setFailed(false); }} keyboardType="number-pad" returnKeyType="done" onSubmitEditing={open} maxLength={8} style={[body, styles.control, { borderColor: colors.saffronDeep }]} />
            </View>
          </View>
          {choosingChapter ? <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled" style={styles.choices}>
            {gitaChaptersManifest.map(item => <Pressable key={item.chapter} testID={`gita-jump-chapter-${item.chapter}`} accessibilityRole="button" accessibilityState={{ selected: item.chapter === selectedChapter }} onPress={() => {
              setSelectedChapter(item.chapter);
              setInput('1');
              setChoosingChapter(false);
              setFailed(false);
            }} style={[styles.control, { borderColor: colors.divider, marginBottom: 8 }]}>
              <Text style={body}>{item.chapter} · {contentByLang(lang, item.titleHi, item.titleEn)}</Text>
            </Pressable>)}
          </ScrollView> : <>
            <Text style={[label, styles.context]}>{contentByLang(lang, summary.titleHi, summary.titleEn)} · 1–{summary.verseCount}</Text>
            {selectedVerse == null && <Text accessibilityLiveRegion="polite" style={[body, { color: colors.avoidDeep }]}>{pick(lang, {
              hi: `1 से ${summary.verseCount} तक श्लोक संख्या डालें।`, en: `Enter a verse from 1 to ${summary.verseCount}.`,
              gu: `1 થી ${summary.verseCount} સુધીનો શ્લોક નંબર લખો.`, kn: `1 ರಿಂದ ${summary.verseCount} ರವರೆಗಿನ ಶ್ಲೋಕ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ.`,
            })}</Text>}
            <ScrollView ref={gridRef} nestedScrollEnabled keyboardShouldPersistTaps="handled" style={styles.choices} onContentSizeChange={revealSelection}><View style={styles.grid}>
              {Array.from({ length: summary.verseCount }, (_, index) => index + 1).map(number => <Pressable key={number} testID={`gita-jump-verse-${number}`} onLayout={event => { versePositions.current.set(number, event.nativeEvent.layout.y); if (number === selectedVerse) revealSelection(); }} accessibilityRole="button" accessibilityLabel={`${pick(lang, VERSE)} ${selectedChapter}.${number}`} accessibilityState={{ selected: selectedVerse === number }} onPress={() => { setInput(String(number)); setFailed(false); }} style={[styles.cell, { borderColor: colors.divider, backgroundColor: selectedVerse === number ? colors.saffronDeep : colors.parchmentSoft }]}>
                <Text style={[body, { color: selectedVerse === number ? colors.onPrimary : colors.ink }]}>{number}</Text>
              </Pressable>)}
            </View></ScrollView>
          </>}
          {failed && <Text accessibilityRole="alert" style={[body, { color: colors.avoidDeep }]}>{pick(lang, {
            hi: 'अध्याय नहीं खुला। फिर कोशिश करें।', en: 'Could not open this chapter. Please try again.',
            gu: 'અધ્યાય ખૂલી શક્યો નહીં. ફરી પ્રયાસ કરો.', kn: 'ಅಧ್ಯಾಯ ತೆರೆಯಲಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
          })}</Text>}
          <Pressable testID="gita-jump-open" accessibilityRole="button" accessibilityState={{ disabled: selectedVerse == null }} disabled={selectedVerse == null} onPress={open} style={[styles.action, { backgroundColor: colors.saffronDeep, opacity: selectedVerse == null ? 0.5 : 1 }]}>
            <Text style={[body, { color: colors.onPrimary, textAlign: 'center' }]}>{openLabel}</Text>
          </Pressable>
          <Pressable testID="gita-jump-cancel" accessibilityRole="button" onPress={onClose} style={styles.action}>
            <Text style={[body, { color: colors.saffronDeep }]}>{pick(lang, { hi: 'रद्द करें', en: 'Cancel', gu: 'રદ કરો', kn: 'ರದ್ದುಮಾಡಿ' })}</Text>
          </Pressable>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  </Modal>;
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', padding: 16 },
  sheet: { maxHeight: '90%', borderWidth: 1, borderRadius: 22 },
  content: { padding: 18, gap: 12 },
  heading: { textAlign: 'center' },
  fields: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  field: { flexGrow: 1, flexBasis: 110 },
  control: { minHeight: 48, borderWidth: 1, borderRadius: 14, padding: 12, justifyContent: 'center' },
  chapterValue: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  context: { marginVertical: 4 },
  choices: { maxHeight: 240 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cell: { minWidth: 48, minHeight: 48, flexBasis: '21%', flexGrow: 1, padding: 8, borderWidth: 1, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  action: { minHeight: 48, padding: 12, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
