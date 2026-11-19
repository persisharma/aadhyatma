import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useGitaLanguage } from '@/data/gita/language';
import { useTheme } from '@/theme/ThemeContext';
import { pick } from '@/utils/localize';
import AppIcon from './AppIcon';
import PageJumpSheet, { PAGE_JUMP_LABEL } from './PageJumpSheet';

/**
 * The `n / total` counter in a reader's top bar (design.md §94, RULEBOOK §3
 * "Reader page counter"). It is a button: tapping it opens the page picker so a
 * reader can go straight to any page, as the Gita reader does for verses.
 *
 * Every paged reader renders this instead of its own counter `<Text>`:
 *  - `onJump` — the built-in picker; the reader moves to the 1-based page.
 *  - `onPress` — the reader's own picker (Gita: chapter + verse).
 * With neither, or with a single page, it is plain text: nothing to jump to.
 *
 * The accessibility label is the counter text itself and the action is the
 * hint. Deliberate: the Maestro flows assert `"3 / 12"` literally in every
 * reader, and a label that replaced the text would hide it from them on iOS.
 */
export default function ReaderPageCounter({ current, total, onJump, onOpen, onPress, titles, testID = 'reader-page-counter', accessibilityLabel, accessibilityValueText }: {
  /** 1-based page on screen. */
  current: number;
  total: number;
  /** Move the reader to this 1-based page. */
  onJump?: (page: number) => void;
  /** Runs before the built-in picker opens: stop read-aloud and auto-slide here. */
  onOpen?: () => void;
  /** Open the reader's own picker instead of the built-in one. */
  onPress?: () => void;
  /** Already localized page names for the built-in picker, one per page. */
  titles?: string[];
  testID?: string;
  accessibilityLabel?: string;
  accessibilityValueText?: string;
}) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const [open, setOpen] = useState(false);
  const counter = `${current} / ${total}`;
  const text = <Text style={[styles.counter, { color: colors.inkMuted, fontFamily: typography.pageCounter.fontFamily, fontSize: typography.pageCounter.fontSize }]}>{counter}</Text>;
  if (!onPress && (!onJump || total <= 1)) return <View testID={testID} style={styles.target}>{text}</View>;
  return <>
    <Pressable testID={testID} accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? counter}
      accessibilityHint={accessibilityLabel ? undefined : pick(lang, PAGE_JUMP_LABEL)}
      accessibilityValue={accessibilityValueText ? { text: accessibilityValueText } : undefined}
      onPress={() => { if (onPress) { onPress(); return; } onOpen?.(); setOpen(true); }}
      style={({ pressed }) => [styles.target, pressed && { opacity: 0.7 }]}>
      {text}
      <AppIcon name="caretDown" size={12} color={colors.saffronDeep} />
    </Pressable>
    {open && <PageJumpSheet current={current} total={total} titles={titles} onClose={() => setOpen(false)}
      onOpen={page => { setOpen(false); onJump?.(page); }} />}
  </>;
}

const styles = StyleSheet.create({
  target: { minHeight: 48, minWidth: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  counter: { includeFontPadding: false, textAlign: 'right', fontStyle: 'italic' },
});
