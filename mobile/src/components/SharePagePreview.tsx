import React from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { elevation } from '@/theme/elevation';
import type { Lang } from '@/data/gita/language';
import { pick } from '@/utils/localize';
import { cardFontByLang, eyebrowTextStyle } from '@/utils/langType';
import ScaledShareCard from './ScaledShareCard';

type Props = {
  lang: Lang;
  index: number;
  count: number;
  included: boolean;
  renderPage: (index: number) => React.ReactNode;
  onStep: (delta: -1 | 1) => void;
  onToggle: () => void;
  onDone: () => void;
};

/**
 * Full-size look at one page of a share series (design.md §39.5): a 72 dp thumbnail is
 * not a decision. Rendered in place of the target rows inside the same sheet — a second
 * RN Modal on top of the first misbehaves on iOS.
 */
export default function SharePagePreview(props: Props) {
  const { colors, radii } = useTheme();
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(300, width - 96);
  const circle = [styles.circle, { borderColor: colors.divider, backgroundColor: colors.parchmentSoft }];

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Pressable onPress={props.onDone} accessibilityRole="button" accessibilityLabel="Back to share options" style={circle}>
          <Text style={[styles.glyph, { color: colors.saffron }]}>‹</Text>
        </Pressable>
        <Text style={{ fontFamily: cardFontByLang(props.lang), fontSize: 16, color: colors.ink }}>
          {pick(props.lang, { hi: 'पृष्ठ', en: 'Page', gu: 'પૃષ્ઠ', kn: 'ಪುಟ' })} {props.index + 1} / {props.count}
        </Text>
        <Pressable
          onPress={props.onToggle}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: props.included }}
          accessibilityLabel="Include this page"
          style={[circle, props.included && { backgroundColor: colors.saffron, borderColor: colors.saffron }]}
        >
          <Text style={[styles.glyph, { color: props.included ? colors.onPrimary : colors.inkMuted, fontSize: 15 }]}>
            {props.included ? '✓' : '○'}
          </Text>
        </Pressable>
      </View>

      <View style={[styles.cardShadow, { borderRadius: radii.sm }, elevation.raised]}>
        <ScaledShareCard width={cardWidth}>{props.renderPage(props.index)}</ScaledShareCard>
      </View>

      <View style={styles.nav}>
        <Pressable
          onPress={() => props.onStep(-1)}
          disabled={props.index === 0}
          accessibilityRole="button"
          accessibilityLabel="Previous page"
          style={[circle, props.index === 0 && styles.dim]}
        >
          <Text style={[styles.glyph, { color: colors.saffron }]}>‹</Text>
        </Pressable>
        <Text style={[eyebrowTextStyle(props.lang, 12), { color: colors.inkMuted }]}>
          {props.included
            ? pick(props.lang, { hi: 'शृंखला में शामिल', en: 'In the series', gu: 'શ્રેણીમાં સામેલ', kn: 'ಸರಣಿಯಲ್ಲಿದೆ' })
            : pick(props.lang, { hi: 'छोड़ा गया', en: 'Left out', gu: 'છોડી દીધું', kn: 'ಬಿಡಲಾಗಿದೆ' })}
        </Text>
        <Pressable
          onPress={() => props.onStep(1)}
          disabled={props.index === props.count - 1}
          accessibilityRole="button"
          accessibilityLabel="Next page"
          style={[circle, props.index === props.count - 1 && styles.dim]}
        >
          <Text style={[styles.glyph, { color: colors.saffron }]}>›</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={props.onDone}
        accessibilityRole="button"
        accessibilityLabel="Done previewing"
        style={({ pressed }) => [
          styles.done,
          { borderColor: colors.cardActiveBorder, backgroundColor: colors.cardActiveFrom, borderRadius: radii.md },
          pressed && { opacity: 0.7 },
        ]}
      >
        <Text style={{ fontFamily: cardFontByLang(props.lang), fontSize: 15, color: colors.saffronDeep }}>
          {pick(props.lang, {
            hi: 'इस पृष्ठ के साथ आगे',
            en: 'Continue with this page',
            gu: 'આ પૃષ્ઠ સાથે આગળ',
            kn: 'ಈ ಪುಟದೊಂದಿಗೆ ಮುಂದುವರಿಸಿ',
          })}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 12 },
  head: { alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  circle: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  glyph: { fontSize: 18, fontWeight: '600', includeFontPadding: false },
  dim: { opacity: 0.35 },
  cardShadow: { overflow: 'hidden' },
  nav: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  done: { alignSelf: 'stretch', minHeight: 44, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
