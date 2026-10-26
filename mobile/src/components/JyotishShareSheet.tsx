import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';

import type { Lang } from '@/data/gita/language';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { useShare, type ShareableCard } from '@/utils/shareVerse';

type Props = {
  visible: boolean;
  lang: Lang;
  titleHi: string;
  titleEn: string;
  privacyHi: string;
  privacyEn: string;
  /** What the caption and hashtags call the card (`कुंडली`, `मेष राशिफल`) — never personal data. */
  captionHi: string;
  captionEn: string;
  renderCard: (width: number) => React.ReactNode;
  onClose: () => void;
  onShareSheetOpened?: () => void;
  /** Optional second share action — the sheet's "Send as text" row (PRD-20: the
   * report's full-text handoff). The privacy line is the shared warning surface for
   * BOTH actions — callers passing this must name the text export's contents in
   * privacyHi/En. */
  detailTitleHi?: string;
  detailTitleEn?: string;
  detailSubtitleHi?: string;
  detailSubtitleEn?: string;
  onShareDetail?: () => void;
};

/** Natural width of a Jyotish card; it keeps its designed 4:5 face and exports 1080×1350. */
const CARD_WIDTH = 334;

/**
 * Jyotish share (Kundali, Rashifal, Guna Milan, Namakshar) through the one share
 * provider (design.md §39.10): the same picker as the Daily Bhakti card — WhatsApp
 * with the download caption, Instagram post / story, the brand + download strip — with
 * the caller's privacy line under the preview. Renders nothing itself; opening is
 * driven by `visible`, and the provider reports the end of the flow through `onClose`.
 */
export default function JyotishShareSheet(props: Props) {
  // Mount the opener only while visible, so a screen that never shares needs no provider.
  return props.visible ? <JyotishShareOpener {...props} /> : null;
}

function JyotishShareOpener(props: Props) {
  const { share, dismiss } = useShare();
  const latest = useRef(props);
  latest.current = props;
  useEffect(() => {
    const p = latest.current;
    const detail = p.onShareDetail && p.detailTitleHi && p.detailTitleEn
      ? {
          title: contentByLang(p.lang, p.detailTitleHi, p.detailTitleEn),
          sub: p.detailSubtitleHi && p.detailSubtitleEn ? meaningByLang(p.lang, p.detailSubtitleHi, p.detailSubtitleEn) : undefined,
          accessibilityLabel: 'Share the full reading as text',
        }
      : undefined;
    const content: ShareableCard = {
      kind: 'card',
      sourceId: 'jyotish',
      width: CARD_WIDTH,
      previewLabel: `${p.titleEn} image preview`,
      title: { hi: p.titleHi, en: p.titleEn, gu: contentByLang('gu', p.titleHi, p.titleEn), kn: contentByLang('kn', p.titleHi, p.titleEn) },
      note: meaningByLang(p.lang, p.privacyHi, p.privacyEn),
      tagNameHi: p.captionHi,
      tagNameEn: p.captionEn,
      render: () => (
        <View style={{ width: CARD_WIDTH, aspectRatio: 4 / 5 }}>{latest.current.renderCard(CARD_WIDTH)}</View>
      ),
      caption: (lang) => ({ sectionName: contentByLang(lang, p.captionHi, p.captionEn), label: '', firstLine: '' }),
      onShareText: p.onShareDetail ? () => latest.current.onShareDetail?.() : undefined,
      textRow: detail,
      onShared: () => latest.current.onShareSheetOpened?.(),
      onClose: () => latest.current.onClose(),
    };
    void share(content, p.lang);
    // Opens once per `visible`; the provider owns the sheet from here. Hidden by the
    // caller (a Rashifal day change) → the open picker closes with it.
    return () => dismiss(content);
  }, [share, dismiss]);
  return null;
}
