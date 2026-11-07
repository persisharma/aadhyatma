import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { layoutRing, ringSeparator, ringWordFade, ringWords, wordClearanceDeg, type VisibleArc } from './japamMantraRingLayout';

export type MantraRingSpec = {
  radius: number;
  fontSize: number;
  color: string;
  opacity: number;
  /** 1 = clockwise, -1 = anticlockwise. */
  direction: 1 | -1;
  periodMs: number;
};

type Props = {
  text: string;
  fontFamily: string;
  /** Ring centre in the parent's coordinates. */
  cx: number;
  cy: number;
  rings: readonly MantraRingSpec[];
  /** Rotate (foreground, focused, motion allowed); otherwise the rings rest. */
  animate: boolean;
  /**
   * The part of each ring the clipping stage shows. Words fade out whole before
   * they reach its ends, so the clip edge never cuts through a word.
   */
  visibleArc?: VisibleArc;
  testID?: string;
};

// Widths are measured once at this size and scaled to each ring's size.
const MEASURE_SIZE = 20;
/** Extra angle kept between a word and the clip edge, beyond its own half-width. */
const EDGE_MARGIN_DEG = 3;
/** Fade length as a word enters or leaves the visible arc (≈1.6 s at 48 s a turn). */
const EDGE_FADE_DEG = 12;

/** Concentric rings of the mantra's words, each turning slowly round one centre. */
export default function JapamMantraRing({ text, fontFamily, cx, cy, rings, animate, visibleArc, testID }: Props) {
  const words = useMemo(() => ringWords(text), [text]);
  const separator = ringSeparator(text);
  const unique = useMemo(() => Array.from(new Set([...words, separator])), [words, separator]);
  // Callers key this component by text + font, so widths never go stale.
  const [widths, setWidths] = useState<Record<string, number>>({});
  const measured = unique.every((token) => widths[token] !== undefined);
  return (
    <View testID={testID} pointerEvents="none" style={StyleSheet.absoluteFill}>
      {!measured && unique.map((token) => (
        // Decorative geometry: drawn at a fixed size, so system text scaling is
        // off here only (the ring is hidden from screen readers).
        <Text key={token} allowFontScaling={false} style={[styles.measure, { fontFamily, fontSize: MEASURE_SIZE }]}
          onLayout={(e) => {
            const width = e.nativeEvent.layout.width;
            setWidths((prev) => (prev[token] === width ? prev : { ...prev, [token]: width }));
          }}>
          {token}
        </Text>
      ))}
      {measured && rings.map((ring, i) => (
        <Ring key={`${i}-${ring.radius}`} ring={ring} words={words} separator={separator} widths={widths} cx={cx} cy={cy}
          fontFamily={fontFamily} animate={animate} visibleArc={visibleArc} />
      ))}
    </View>
  );
}

function Ring({ ring, words, separator, widths, cx, cy, fontFamily, animate, visibleArc }: {
  ring: MantraRingSpec; words: string[]; separator: string; widths: Record<string, number>; cx: number; cy: number;
  fontFamily: string; animate: boolean; visibleArc?: VisibleArc;
}) {
  const { radius, fontSize, color, opacity, direction, periodMs } = ring;
  const scale = fontSize / MEASURE_SIZE;
  const tokens = useMemo(
    () => layoutRing(words, separator, (token) => (widths[token] === undefined ? undefined : widths[token] * scale), radius, fontSize * 0.7),
    [words, separator, widths, scale, radius, fontSize],
  );
  const turn = useRef(new Animated.Value(0)).current;
  const lineHeight = Math.round(fontSize * 1.9);
  // One native opacity node per word, driven by the same turn as the rotation,
  // built once per layout (never per count update or animation frame).
  const fades = useMemo(() => (visibleArc ? tokens.map((token) => turn.interpolate({
    ...ringWordFade(token.angleDeg, wordClearanceDeg(token.width, lineHeight / 2, radius) + EDGE_MARGIN_DEG, direction, visibleArc, EDGE_FADE_DEG),
    extrapolate: 'clamp',
  })) : null), [tokens, turn, visibleArc, lineHeight, radius, direction]);
  useEffect(() => {
    if (!animate || tokens.length === 0) return;
    let live = true;
    let animation: Animated.CompositeAnimation | undefined;
    const run = (from: number) => {
      if (!live) return;
      animation = Animated.timing(turn, {
        toValue: 1, duration: Math.max(1, Math.round(periodMs * (1 - from))), easing: Easing.linear, useNativeDriver: true, isInteraction: false,
      });
      animation.start(({ finished }) => {
        if (!live || !finished) return;
        turn.setValue(0); // 360° ≡ 0°, so the wrap is invisible.
        run(0);
      });
    };
    turn.stopAnimation((value) => run(Number.isFinite(value) ? Math.max(0, Math.min(1, value)) % 1 : 0));
    return () => {
      live = false;
      animation?.stop();
      turn.stopAnimation(); // Rest where it is; the next start continues from here.
    };
  }, [animate, tokens.length, periodMs, turn]);
  if (tokens.length === 0) return null;
  const box = 2 * (radius + fontSize * 2);
  const rotate = turn.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${direction * 360}deg`] });
  return (
    <Animated.View testID="japam-mantra-ring" style={[styles.ring, {
      left: cx - box / 2, top: cy - box / 2, width: box, height: box, opacity, transform: [{ rotate }],
    }]}>
      {tokens.map((token, i) => {
        const a = (token.angleDeg * Math.PI) / 180;
        const x = box / 2 + radius * Math.sin(a);
        const y = box / 2 - radius * Math.cos(a);
        const width = Math.ceil(token.width * 1.06) + 4; // rounding slack: never ellipsize a word
        return (
          <Animated.Text key={token.key} allowFontScaling={false} numberOfLines={1}
            style={[styles.word, {
              left: x - width / 2, top: y - lineHeight / 2, width, lineHeight, fontSize, fontFamily, color,
              transform: [{ rotate: `${token.angleDeg}deg` }],
            }, fades ? { opacity: fades[i] } : null]}>
            {token.text}
          </Animated.Text>
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  measure: { position: 'absolute', left: 0, top: 0, opacity: 0 },
  ring: { position: 'absolute' },
  word: { position: 'absolute', textAlign: 'center', includeFontPadding: false },
});
