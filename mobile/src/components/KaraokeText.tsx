import React, { memo, useMemo } from 'react';
import { Animated, StyleSheet, View, type TextStyle } from 'react-native';
import { useReducedMotion } from '@/utils/useReducedMotion';
import { buildKaraokeTimeline, type KaraokeWordWeight } from './karaokeTiming';

export type KaraokeTextProps = {
  lines: readonly string[];
  referenceLines?: readonly string[];
  wordWeight?: KaraokeWordWeight;
  /** One host-owned 0–1 phase for the whole passage, not a scroll-step timer.
   * Freeze it to pause, reset it for new content, and change the host's duration
   * for speed. Sharing the host clock prevents drift and duplicate counts.
   */
  progress: Animated.Value | Animated.AnimatedInterpolation<number>;
  color: string;
  highlightColor: string;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  fontStyle?: TextStyle['fontStyle'];
  includeFontPadding?: boolean;
  lineGap?: number;
};

/** Reusable word colouring for Infinity now and reader स्वतः integration later.
 * Native Text colour interpolation uses the existing host clock; no per-frame
 * JS listener, interval, speech tracking, navigation or counting lives here.
 */
export default memo(function KaraokeText({
  lines, referenceLines, wordWeight, progress, color, highlightColor,
  fontFamily, fontSize, lineHeight, fontStyle = 'normal', includeFontPadding = true, lineGap = 0,
}: KaraokeTextProps) {
  const reduced = useReducedMotion();
  const timeline = useMemo(() => buildKaraokeTimeline(lines, { referenceLines, wordWeight }),
    [lines, referenceLines, wordWeight]);
  const fills = useMemo(() => timeline.map(line => line.words.map(word => {
    if (reduced) return color;
    // Zero-weight punctuation changes at its boundary without an invalid range.
    const start = Math.min(word.start, 1 - 0.000001);
    const end = Math.max(word.end, start + 0.000001);
    return progress.interpolate({ inputRange: [start, end], outputRange: [color, highlightColor], extrapolate: 'clamp' });
  })), [timeline, progress, color, highlightColor, reduced]);
  return (
    <View testID="karaoke-text" style={styles.root} accessible accessibilityRole="text" accessibilityLabel={lines.join('\n')}>
      {timeline.map((line, lineIndex) => (
        <View key={lineIndex} testID={`karaoke-line-${lineIndex}`} style={[styles.line, { marginTop: lineGap }]}>
          {line.words.length === 0 ? <View style={{ height: lineHeight }} /> : line.words.map((word, wordIndex) => (
            <Animated.Text key={wordIndex} testID={`karaoke-word-${lineIndex}-${wordIndex}`}
              accessible={false} importantForAccessibility="no"
              style={[styles.word, { color: fills[lineIndex][wordIndex], fontFamily, fontSize, lineHeight, fontStyle, includeFontPadding }]}>
              {word.text}
            </Animated.Text>
          ))}
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  root: { width: '100%' },
  line: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start' },
  word: { maxWidth: '100%' },
});
