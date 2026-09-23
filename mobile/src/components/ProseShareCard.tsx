import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import type { Lang } from '@/data/gita/language';
import { pick } from '@/utils/localize';
import {
  proseBodyHeight,
  proseCardMetrics,
  proseScript,
  proseType,
  type ProsePage,
} from '@/utils/shareCardPages';
import BackgroundLayer from './BackgroundLayer';
import ShareBrandFooter from './ShareBrandFooter';

export type ProseShareCardProps = {
  /** Resolved plate (reader / Theerth / deity sketch); null → the plain parchment gradient. */
  background: number | null;
  /** Header band, already in the reading language (`व्रत कथा · छठ पूजा कथा`). */
  header: string;
  page: ProsePage;
  pageIndex: number;
  pageCount: number;
  lang: Lang;
};

function bodyFont(lang: Lang): string {
  if (lang === 'gu') return fontFamilies.gujarati;
  if (lang === 'kn') return fontFamilies.kannada;
  if (lang === 'en') return fontFamilies.latin;
  return fontFamilies.devanagari;
}

function boldFont(lang: Lang): string {
  if (lang === 'gu') return fontFamilies.gujaratiBold;
  if (lang === 'kn') return fontFamilies.kannadaBold;
  if (lang === 'en') return fontFamilies.latinSemiBold;
  return fontFamilies.devanagariBold;
}

/**
 * One page of a prose share series (design.md §39.4) — a katha passage, a Theerth
 * reading, a lesson. Same 540×675 chrome as the verse card (header band, sketch,
 * branding footer) with a fixed-size body the paginator (`utils/shareCardPages.ts`)
 * has already filled: sizes are constants, never auto-fit, and the body box is exactly
 * `proseBodyHeight` so the estimate and the render share one geometry.
 *
 * A series (`pageCount > 1`) adds the page row: a continuation cue on the left
 * (`आगे →` / `॥ इति ॥` on the last page) and dots + `n / m` on the right. The row's
 * height is reserved on a single page too, so the geometry never changes.
 */
const ProseShareCard = React.forwardRef<View, ProseShareCardProps>(function ProseShareCard(
  props,
  ref
) {
  const { colors, typography } = useTheme();
  const faces = proseType[proseScript(props.lang)];
  const latin = props.lang === 'en';
  const series = props.pageCount > 1;
  const isLast = props.pageIndex === props.pageCount - 1;

  return (
    <View
      ref={ref}
      collapsable={false}
      style={[
        styles.card,
        {
          width: proseCardMetrics.width,
          height: proseCardMetrics.height,
          backgroundColor: colors.parchment,
          borderColor: colors.divider,
        },
      ]}
    >
      <BackgroundLayer source={props.background} />

      <View style={styles.headerBand}>
        <Text
          numberOfLines={1}
          style={[
            styles.headerText,
            {
              color: colors.saffronDeep,
              fontFamily: latin ? typography.cardLatin.fontFamily : bodyFont(props.lang),
            },
            !latin && { letterSpacing: 0 },
          ]}
        >
          {latin ? props.header.toUpperCase() : props.header}
        </Text>
      </View>

      <View style={[styles.body, { height: proseBodyHeight }]}>
        {props.page.title ? (
          <Text
            style={[
              styles.title,
              {
                color: colors.ink,
                fontFamily: boldFont(props.lang),
                fontSize: faces.title.fontSize,
                lineHeight: faces.title.lineHeight,
              },
            ]}
          >
            {props.page.title}
          </Text>
        ) : null}
        {props.page.blocks.map((block, i) =>
          block.kind === 'heading' ? (
            <Text
              key={i}
              style={[
                styles.heading,
                i > 0 && { marginTop: proseCardMetrics.headingMarginTop },
                {
                  color: colors.saffronDeep,
                  fontFamily: boldFont(props.lang),
                  fontSize: faces.heading.fontSize,
                  lineHeight: faces.heading.lineHeight,
                },
              ]}
            >
              {block.text}
            </Text>
          ) : (
            <Text
              key={i}
              style={[
                i > 0 && { marginTop: proseCardMetrics.paraGap },
                {
                  color: colors.ink,
                  fontFamily: bodyFont(props.lang),
                  fontSize: faces.body.fontSize,
                  lineHeight: faces.body.lineHeight,
                },
              ]}
            >
              {block.continued ? `…${block.text}` : block.text}
            </Text>
          )
        )}
      </View>

      <View style={styles.pageRow}>
        {series ? (
          <>
            <Text
              style={[
                styles.cue,
                { color: colors.inkMuted, fontFamily: latin ? typography.cardLatin.fontFamily : bodyFont(props.lang) },
              ]}
            >
              {isLast
                ? '॥ इति ॥'
                : pick(props.lang, { hi: 'आगे पढ़ें →', en: 'continues →', gu: 'આગળ વાંચો →', kn: 'ಮುಂದೆ ಓದಿ →' })}
            </Text>
            <View style={styles.index}>
              <View style={styles.dots}>
                {Array.from({ length: props.pageCount }, (_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      { backgroundColor: i === props.pageIndex ? colors.saffron : colors.dotRest },
                    ]}
                  />
                ))}
              </View>
              <Text style={[styles.count, { color: colors.saffronDeep, fontFamily: typography.cardLatin.fontFamily }]}>
                {props.pageIndex + 1} / {props.pageCount}
              </Text>
            </View>
          </>
        ) : null}
      </View>

      <ShareBrandFooter />
    </View>
  );
});

export default ProseShareCard;

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    overflow: 'hidden',
    paddingTop: proseCardMetrics.paddingTop,
    paddingBottom: proseCardMetrics.paddingBottom,
    paddingHorizontal: proseCardMetrics.paddingHorizontal,
  },
  headerBand: { alignItems: 'center', marginBottom: 18, height: proseCardMetrics.headerBlock - 18, justifyContent: 'center' },
  headerText: { fontSize: 13, letterSpacing: 2.4, includeFontPadding: false },
  // Fixed height = the paginator's body box; overflow hidden is a backstop only.
  body: { overflow: 'hidden', justifyContent: 'flex-start' },
  title: { marginBottom: proseCardMetrics.titleMarginBottom },
  heading: { textAlign: 'center', marginBottom: proseCardMetrics.headingMarginBottom },
  pageRow: {
    height: proseCardMetrics.pageRowBlock,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  cue: { fontSize: 13, includeFontPadding: false },
  index: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dots: { flexDirection: 'row', gap: 4 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  count: { fontSize: 13, letterSpacing: 0.6, includeFontPadding: false },
});
