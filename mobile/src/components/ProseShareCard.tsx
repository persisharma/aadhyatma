import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import type { Lang } from '@/data/gita/language';
import { pick } from '@/utils/localize';
import {
  bodyHeightFor,
  bodyWidthFor,
  cardMetricsFor,
  pictureCardMetrics,
  proseCardMetrics,
  proseScript,
  proseType,
  type ProsePage,
  type ShareCardLayout,
} from '@/utils/shareCardPages';
import { kidsStoryArtRetainedHeight } from '@/utils/kidsStoryArtFrame';
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
  illustrationUri?: string;
  onIllustrationReady?: (ready: boolean) => void;
  /** `picture` → the 540×960 picture-story card; defaults to the 540×675 prose card. */
  layout?: ShareCardLayout;
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
 *
 * The `picture` layout (design.md §76) is the same chrome on a 540×960 (9:16) card: the
 * complete artwork at the body's full width in the box the paginator left for it
 * (`illustration.heightDp`), then the reader's caption box — title, narration, a
 * dialogue `quote` in its tinted box — and, on the last card, the app `link`. Captured
 * at 1080×1920 so a shared scene looks like the reader page.
 */
const ProseShareCard = React.forwardRef<View, ProseShareCardProps>(function ProseShareCard(
  props,
  ref
) {
  const { colors, typography } = useTheme();
  const faces = proseType[proseScript(props.lang)];
  const layout = props.layout ?? 'prose';
  const metrics = cardMetricsFor(layout);
  const picture = layout === 'picture';
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
          width: metrics.width,
          height: metrics.height,
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

      <View style={[styles.body, { height: bodyHeightFor(layout) }]}>
        {props.page.illustration ? (
          <IllustratedScene illustration={props.page.illustration} uri={props.illustrationUri} onReady={props.onIllustrationReady} layout={layout} />
        ) : null}
        <View
          testID="share-caption"
          style={picture ? [styles.caption, { backgroundColor: colors.parchmentSoft }] : undefined}
        >
          {props.page.title ? (
            <Text
              style={[
                styles.title,
                {
                  color: picture ? colors.saffronDeep : colors.ink,
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
            ) : block.kind === 'quote' ? (
              <View
                key={i}
                testID="share-quote"
                style={[styles.quote, i > 0 && { marginTop: proseCardMetrics.paraGap }, { backgroundColor: colors.goldTint }]}
              >
                {block.speaker ? (
                  <Text
                    style={{
                      color: colors.inkSoft,
                      fontFamily: boldFont(props.lang),
                      fontSize: faces.heading.fontSize,
                      lineHeight: faces.heading.lineHeight,
                    }}
                  >
                    {block.speaker}
                  </Text>
                ) : null}
                <Text
                  style={{
                    color: colors.ink,
                    fontFamily: bodyFont(props.lang),
                    fontSize: faces.body.fontSize,
                    lineHeight: faces.body.lineHeight,
                  }}
                >
                  {block.continued ? `…${block.text}` : block.text}
                </Text>
              </View>
            ) : block.kind === 'link' ? (
              <View
                key={i}
                testID="share-app-link"
                style={[styles.link, i > 0 && { marginTop: proseCardMetrics.paraGap }, { backgroundColor: colors.goldTint }]}
              >
                <Text
                  style={{
                    textAlign: 'center',
                    color: colors.saffronDeep,
                    fontFamily: boldFont(props.lang),
                    fontSize: faces.heading.fontSize,
                    lineHeight: faces.heading.lineHeight,
                  }}
                >
                  {block.text}
                </Text>
                <Text
                  style={{
                    textAlign: 'center',
                    color: colors.ink,
                    fontFamily: typography.cardLatin.fontFamily,
                    fontSize: 16,
                    lineHeight: pictureCardMetrics.linkLineHeight,
                    letterSpacing: 0.4,
                    includeFontPadding: false,
                  }}
                >
                  {(block.url ?? '').replace(/^https?:\/\//, '')}
                </Text>
              </View>
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
  // The picture card's caption box, as the reader draws it (§76); plain on the prose card.
  caption: {
    borderRadius: 12,
    paddingHorizontal: pictureCardMetrics.captionPaddingHorizontal,
    paddingVertical: pictureCardMetrics.captionPaddingVertical,
  },
  quote: { borderRadius: 10, padding: pictureCardMetrics.quotePadding },
  link: { borderRadius: 10, padding: pictureCardMetrics.linkPadding },
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

/** Asset modules load only when a scene card is actually rendered. */
function IllustratedScene({ illustration, uri, onReady, layout }: {
  illustration: { art: string; label: string; heightDp: number }; uri?: string; onReady?: (ready: boolean) => void; layout: ShareCardLayout;
}) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { default: KidsStoryArt } = require('./KidsStoryArt') as typeof import('./KidsStoryArt');
  // The paginator fixed the box height; the width keeps the complete reviewed 4:5 scene inside it.
  const width = Math.min(bodyWidthFor(layout), illustration.heightDp / (1.25 * kidsStoryArtRetainedHeight(illustration.art)));
  return <View testID="share-scene-art" style={{ height: illustration.heightDp, marginBottom: proseCardMetrics.illustrationGap, alignItems: 'center', justifyContent: 'flex-end' }}>
    <View style={{ width }}>
      <KidsStoryArt art={illustration.art} label={illustration.label} resolvedUri={uri}
        onLoad={() => onReady?.(true)} onError={() => onReady?.(false)} />
    </View>
  </View>;
}
