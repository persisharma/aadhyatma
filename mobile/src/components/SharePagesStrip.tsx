import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import type { Lang } from '@/data/gita/language';
import { pick } from '@/utils/localize';
import { eyebrowTextStyle, indicSafeTag } from '@/utils/langType';
import { MAX_SHARE_PAGES } from '@/utils/shareCardPages';
import ScaledShareCard from './ScaledShareCard';

export type ShareScopeOption = { label: string; pageCount: number };

type Props = {
  lang: Lang;
  pageCount: number;
  selected: readonly boolean[];
  highlighted: number;
  renderPage: (index: number) => React.ReactNode;
  onHighlight: (index: number) => void;
  onToggle: (index: number) => void;
  onPreview: () => void;
  scopes: readonly ShareScopeOption[];
  scopeIndex: number;
  onScope: (index: number) => void;
  disabled?: boolean;
};

const THUMB_WIDTH = 72;

/** Localised digits are not used: page numbers stay Western, as the card prints them. */
function pagesWord(lang: Lang, n: number): string {
  return pick(lang, {
    hi: `${n} पृष्ठ`,
    en: n === 1 ? '1 page' : `${n} pages`,
    gu: `${n} પૃષ્ઠ`,
    kn: `${n} ಪುಟ`,
  });
}

/**
 * The pages strip of the share sheet (design.md §39.5) — shown only when the content
 * paginates to more than one card. Tap a thumbnail to highlight it (the page the
 * single-page rows export); tap the highlighted one again to drop it from, or add it
 * back to, the series. The scope segment (this part | whole katha) re-paginates.
 */
export default function SharePagesStrip(props: Props) {
  const { colors, radii } = useTheme();
  const selectedCount = props.selected.filter(Boolean).length;
  const eyebrow = [indicSafeTag(props.lang, 1.6), { fontSize: 10, color: colors.inkMuted }];

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Text style={eyebrow}>
          {pick(props.lang, { hi: 'पृष्ठ', en: 'PAGES', gu: 'પૃષ્ઠ', kn: 'ಪುಟಗಳು' })} · {props.pageCount}
        </Text>
        {props.scopes.length > 1 ? (
          <View style={[styles.segment, { borderColor: colors.divider, borderRadius: radii.pill }]}>
            {props.scopes.map((scope, i) => {
              const on = i === props.scopeIndex;
              return (
                <Pressable
                  key={i}
                  onPress={() => props.onScope(i)}
                  disabled={props.disabled || on}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={`Scope: ${scope.label}, ${scope.pageCount} pages`}
                  style={[styles.segmentItem, on && { backgroundColor: colors.saffronTint }]}
                >
                  <Text
                    style={[
                      eyebrowTextStyle(props.lang, 11),
                      { color: on ? colors.saffronDeep : colors.inkMuted },
                    ]}
                  >
                    {scope.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip}>
        {Array.from({ length: props.pageCount }, (_, i) => {
          const on = props.selected[i];
          const hi = i === props.highlighted;
          return (
            <Pressable
              key={i}
              disabled={props.disabled}
              onPress={() => (hi ? props.onToggle(i) : props.onHighlight(i))}
              accessibilityRole="button"
              accessibilityLabel={`Page ${i + 1}`}
              accessibilityState={{ selected: on }}
              accessibilityHint={
                hi ? (on ? 'Leaves this page out of the series' : 'Adds this page back') : 'Highlights this page'
              }
              style={[
                styles.thumb,
                {
                  borderColor: hi ? colors.saffron : colors.divider,
                  opacity: on ? 1 : 0.45,
                },
              ]}
            >
              <ScaledShareCard width={THUMB_WIDTH}>{props.renderPage(i)}</ScaledShareCard>
              <Text style={[styles.num, { color: colors.saffronDeep, backgroundColor: colors.parchmentSoft }]}>
                {i + 1}
              </Text>
              <View
                style={[
                  styles.tick,
                  on
                    ? { backgroundColor: colors.saffron }
                    : { borderWidth: 1.5, borderColor: colors.divider, backgroundColor: colors.parchmentSoft },
                ]}
              >
                {on ? <Text style={[styles.tickGlyph, { color: colors.onPrimary }]}>✓</Text> : null}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.meta}>
        <Text style={[eyebrowTextStyle(props.lang, 11.5), { color: colors.inkMuted, flex: 1 }]}>
          {pick(props.lang, {
            hi: `${selectedCount} चुने · पृष्ठ ${props.highlighted + 1} पर`,
            en: `${selectedCount} selected · page ${props.highlighted + 1} highlighted`,
            gu: `${selectedCount} પસંદ · પૃષ્ઠ ${props.highlighted + 1} પર`,
            kn: `${selectedCount} ಆಯ್ಕೆ · ಪುಟ ${props.highlighted + 1}`,
          })}
        </Text>
        <Pressable
          onPress={props.onPreview}
          disabled={props.disabled}
          accessibilityRole="button"
          accessibilityLabel="Preview page"
          hitSlop={8}
        >
          <Text style={[eyebrowTextStyle(props.lang, 11.5), { color: colors.saffronDeep }]}>
            {pick(props.lang, { hi: 'बड़ा देखें ›', en: 'Preview ›', gu: 'મોટું જુઓ ›', kn: 'ದೊಡ್ಡದಾಗಿ ›' })}
          </Text>
        </Pressable>
      </View>

      {selectedCount <= MAX_SHARE_PAGES && props.pageCount > MAX_SHARE_PAGES ? (
        <Text style={[eyebrowTextStyle(props.lang, 11.5), styles.warn, { color: colors.inkSoft, backgroundColor: colors.goldTint, borderRadius: radii.sm }]}>
          {pick(props.lang, {
            hi: `सभी पृष्ठ एक साथ अधिकतम ${MAX_SHARE_PAGES} — पहले ${MAX_SHARE_PAGES} चुने हैं। बाकी के लिए कुछ पृष्ठ हटाकर दूसरे चुनें।`,
            en: `All-pages sharing takes up to ${MAX_SHARE_PAGES} — the first ${MAX_SHARE_PAGES} are selected. Swap pages to send the rest.`,
            gu: `એકસાથે વધુમાં વધુ ${MAX_SHARE_PAGES} — પહેલાં ${MAX_SHARE_PAGES} પસંદ છે.`,
            kn: `ಒಮ್ಮೆಗೆ ಗರಿಷ್ಠ ${MAX_SHARE_PAGES} — ಮೊದಲ ${MAX_SHARE_PAGES} ಆಯ್ಕೆಯಾಗಿವೆ.`,
          })}
        </Text>
      ) : null}
      {selectedCount > MAX_SHARE_PAGES ? (
        <Text
          accessibilityRole="alert"
          style={[
            eyebrowTextStyle(props.lang, 11.5),
            styles.warn,
            { color: colors.avoidDeep, backgroundColor: colors.avoidTint, borderRadius: radii.sm },
          ]}
        >
          {pick(props.lang, {
            hi: `एक साथ अधिकतम ${MAX_SHARE_PAGES} पृष्ठ — कुछ पृष्ठ हटाएँ या एक प्रसंग चुनें। अभी ${pagesWord(props.lang, selectedCount)} चुने हैं।`,
            en: `Up to ${MAX_SHARE_PAGES} pages at once — leave some out or pick one part. ${pagesWord(props.lang, selectedCount)} selected.`,
            gu: `એકસાથે વધુમાં વધુ ${MAX_SHARE_PAGES} પૃષ્ઠ — કેટલાક કાઢો અથવા એક પ્રસંગ પસંદ કરો.`,
            kn: `ಒಮ್ಮೆಗೆ ಗರಿಷ್ಠ ${MAX_SHARE_PAGES} ಪುಟಗಳು — ಕೆಲವನ್ನು ಬಿಡಿ ಅಥವಾ ಒಂದು ಭಾಗ ಆರಿಸಿ.`,
          })}
        </Text>
      ) : null}
    </View>
  );
}

export { pagesWord };

const styles = StyleSheet.create({
  wrap: { marginBottom: 4 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, gap: 8 },
  segment: { flexDirection: 'row', borderWidth: 1, overflow: 'hidden' },
  segmentItem: { paddingHorizontal: 10, paddingVertical: 5, minHeight: 28, justifyContent: 'center' },
  strip: { gap: 8, paddingVertical: 4, paddingHorizontal: 2 },
  thumb: { borderWidth: 1.5, borderRadius: 6, overflow: 'hidden' },
  num: {
    position: 'absolute',
    left: 4,
    top: 4,
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: 'hidden',
  },
  tick: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickGlyph: { fontSize: 10, fontWeight: '700', includeFontPadding: false },
  meta: { flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: 8 },
  warn: { marginTop: 6, paddingHorizontal: 10, paddingVertical: 8 },
});
