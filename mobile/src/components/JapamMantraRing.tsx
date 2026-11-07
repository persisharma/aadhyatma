import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { layoutRing, ringSeparator, ringWords } from './japamMantraRingLayout';

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
  testID?: string;
};

// Widths are measured once at this size and scaled to each ring's size.
const MEASURE_SIZE = 20;

/** Concentric rings of the mantra's words, each turning slowly round one centre. */
export default function JapamMantraRing({ text, fontFamily, cx, cy, rings, animate, testID }: Props) {
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
          fontFamily={fontFamily} animate={animate} />
      ))}
    </View>
  );
}

function Ring({ ring, words, separator, widths, cx, cy, fontFamily, animate }: {
  ring: MantraRingSpec; words: string[]; separator: string; widths: Record<string, number>; cx: number; cy: number;
  fontFamily: string; animate: boolean;
}) {
  const { radius, fontSize, color, opacity, direction, periodMs } = ring;
  const scale = fontSize / MEASURE_SIZE;
  const tokens = useMemo(
    () => layoutRing(words, separator, (token) => (widths[token] === undefined ? undefined : widths[token] * scale), radius, fontSize * 0.7),
    [words, separator, widths, scale, radius, fontSize],
  );
  const turn = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!animate || tokens.length === 0) return;
    let live = true;
    let animation: Animated.CompositeAnimation | undefined;
    const run = (from: number) => {
      if (!live) return;
      animation = Animated.timing(turn, {
        toValue: 1, duration: Math.max(1, Math.round(periodMs * (1 - from))), easing: Easing.linear, useNativeDriver: true,
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
  const lineHeight = Math.round(fontSize * 1.9);
  const rotate = turn.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${direction * 360}deg`] });
  return (
    <Animated.View testID="japam-mantra-ring" style={[styles.ring, {
      left: cx - box / 2, top: cy - box / 2, width: box, height: box, opacity, transform: [{ rotate }],
    }]}>
      {tokens.map((token) => {
        const a = (token.angleDeg * Math.PI) / 180;
        const x = box / 2 + radius * Math.sin(a);
        const y = box / 2 - radius * Math.cos(a);
        const width = Math.ceil(token.width * 1.06) + 4; // rounding slack: never ellipsize a word
        return (
          <Text key={token.key} allowFontScaling={false} numberOfLines={1}
            style={[styles.word, {
              left: x - width / 2, top: y - lineHeight / 2, width, lineHeight, fontSize, fontFamily, color,
              transform: [{ rotate: `${token.angleDeg}deg` }],
            }]}>
            {token.text}
          </Text>
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
