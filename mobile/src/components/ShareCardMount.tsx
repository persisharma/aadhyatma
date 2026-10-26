import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { Lang } from '@/data/gita/language';
import { SMART_LINK } from '@/data/shareLinks';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { pick } from '@/utils/localize';
import { titleFontByLang } from '@/utils/langType';
import type { ShareableCard } from '@/utils/shareVerse';

const brandMark = require('@assets/branding/brand-mark.png');

/** The printed link, without the scheme: the caption carries the tappable one. */
const PRINTED_LINK = SMART_LINK.replace(/^https?:\/\//, '');

/**
 * Brand + download strip under every card the provider shares (design.md §39.10):
 * the app mark, वेदांश, and a localized "download" line ending in vedansh.app/get, so
 * a forwarded image still says where it came from and how to get the app.
 */
export function ShareCardBrandStrip({ lang, onPainted }: { lang: Lang; onPainted?: () => void }) {
  const { colors } = useTheme();
  return (
    <View testID="share-card-brand-strip" style={[styles.strip, { borderTopColor: colors.divider, backgroundColor: colors.parchment }]}>
      <View style={styles.brandRow}>
        {/* A bundled mark that fails to decode still leaves the wordmark, so it never blocks sharing. */}
        <Image accessible={false} source={brandMark} style={styles.mark} onLoad={onPainted} onError={onPainted} />
        {/* Full 1.65 leading: a tighter line box clips the matras on iOS (वेदांश → वदाश). */}
        <Text allowFontScaling={false} style={[styles.wordmark, { color: colors.saffronDeep, fontFamily: fontFamilies.devanagariBold }]}>वेदांश</Text>
      </View>
      <Text allowFontScaling={false} style={[styles.cta, { color: colors.inkSoft, fontFamily: titleFontByLang(lang) }]}>
        {pick(lang, {
          hi: 'ऐसे और कार्ड के लिए वेदांश ऐप डाउनलोड करें',
          en: 'Get the Vedansh app for more cards like this',
          gu: 'આવા વધુ કાર્ડ માટે વેદાંશ ઍપ ડાઉનલોડ કરો',
          kn: 'ಇಂತಹ ಇನ್ನಷ್ಟು ಕಾರ್ಡ್‌ಗಳಿಗೆ ವೇದಾಂಶ ಆ್ಯಪ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ',
        })}
      </Text>
      <Text allowFontScaling={false} style={[styles.link, { color: colors.saffronDeep, fontFamily: fontFamilies.latinSemiBold }]}>{PRINTED_LINK}</Text>
    </View>
  );
}

type MountProps = {
  content: ShareableCard;
  lang: Lang;
  /** Natural height once the card (and its brand strip) has painted and laid out. */
  onHeight?: (height: number) => void;
  /** True once the whole mount is ready to capture. */
  onReady?: (ready: boolean) => void;
};

/**
 * One capture mount of a `ShareableCard`: the caller's card at its natural width, the
 * brand strip under it (unless the card prints its own), and a single readiness signal.
 * Ready means the card's own artwork reported ready (when it has any), the bundled
 * mark decoded, and the root has a laid-out height — the provider captures nothing earlier.
 */
export default function ShareCardMount({ content, lang, onHeight, onReady }: MountProps) {
  const { colors } = useTheme();
  const [artReady, setArtReady] = useState(!content.awaitsArt);
  const [markReady, setMarkReady] = useState(!!content.branded);
  const [height, setHeight] = useState(0);
  const reported = useRef(false);
  const onCardReady = useCallback((ready: boolean) => setArtReady(ready), []);
  const onMark = useCallback(() => setMarkReady(true), []);
  useEffect(() => {
    if (!artReady || !markReady || height <= 0) return;
    if (reported.current) return;
    reported.current = true;
    onHeight?.(height);
    onReady?.(true);
  }, [artReady, markReady, height, onHeight, onReady]);
  return (
    <View
      testID="share-card-mount"
      collapsable={false}
      onLayout={(e) => {
        const h = Math.ceil(e.nativeEvent.layout.height);
        if (Number.isFinite(h) && h > 0) setHeight(h);
      }}
      style={{ width: content.width, backgroundColor: colors.parchment }}
    >
      {content.render({ lang, onReady: onCardReady })}
      {content.branded ? null : <ShareCardBrandStrip lang={lang} onPainted={onMark} />}
    </View>
  );
}

/** Sheet preview: the same mount, scaled down to fit a 216 × 380 box. Never captured. */
export function ShareCardPreview({ content, lang }: { content: ShareableCard; lang: Lang }) {
  const [height, setHeight] = useState(0);
  const scale = height > 0 ? Math.min(216 / content.width, 380 / height) : 216 / content.width;
  return (
    <View
      testID={height > 0 ? 'share-card-preview-ready' : 'share-card-preview-loading'}
      accessibilityLabel={content.previewLabel}
      style={[styles.clip, { width: content.width * scale, height: Math.max(1, height * scale) }]}
    >
      <View pointerEvents="none" style={{ width: content.width, transform: [{ scale }], transformOrigin: 'top left' }}>
        <ShareCardMount content={content} lang={lang} onHeight={setHeight} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: { borderTopWidth: 1, paddingTop: 10, paddingBottom: 14, paddingHorizontal: 18, alignItems: 'center', gap: 2 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  mark: { width: 20, height: 20, borderRadius: 10 },
  wordmark: { fontSize: 15, lineHeight: 15 * 1.65 },
  cta: { fontSize: 12, lineHeight: 20, textAlign: 'center' },
  link: { fontSize: 14, lineHeight: 20, letterSpacing: 0.4 },
  clip: { overflow: 'hidden' },
});
