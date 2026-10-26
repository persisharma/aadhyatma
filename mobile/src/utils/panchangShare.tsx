import React, { useCallback, useEffect, useMemo } from 'react';
import type { Lang } from '@/data/gita/language';
import { buildPanchangShareMessage } from '@/data/shareLinks';
import { contentByLang } from '@/utils/localize';
import { useShare, type ShareableCard } from '@/utils/shareVerse';
import PanchangShareCard, { PANCHANG_SHARE_WIDTH } from '@/components/PanchangShareCard';
import { buildPanchangShareModel } from '@/panchang/panchangShareModel';
import { buildPanchangShareText } from '@/panchang/panchangShareText';
import { isSameLocalDay } from '@/panchang/muhuratFormat';

// The brand mark is a bundled asset, so it decodes in a frame or two; never
// hold the share longer than this for it.
const ICON_WAIT_MS = 1500;

type ShareInput = Parameters<typeof buildPanchangShareModel>[0];

/** The card in `lang`, ready once its brand mark decoded — or after ICON_WAIT_MS, never later. */
function ReadyCard({ input, lang, onReady }: { input: ShareInput; lang: Lang; onReady: (ready: boolean) => void }) {
  const model = useMemo(() => buildPanchangShareModel({ ...input, lang }), [input, lang]);
  useEffect(() => {
    const timer = setTimeout(() => onReady(true), ICON_WAIT_MS);
    return () => clearTimeout(timer);
  }, [onReady]);
  return <PanchangShareCard model={model} lang={lang} onIconLoad={() => onReady(true)} />;
}

/**
 * The पूर्ण पंचांग card (design.md §33a) as a provider card (§39.10): the 540×675
 * card prints its own brand footer and download link, exports at 1080×1350, and
 * gets the Daily Bhakti picker — WhatsApp with the two-line caption, Instagram
 * post / story, card-language chips and Send as text.
 */
export function panchangShareable(input: ShareInput): ShareableCard {
  const model = (lang: Lang) => buildPanchangShareModel({ ...input, lang });
  const title = (lang: Lang) => contentByLang(lang, 'पूर्ण पंचांग', 'Full Panchang');
  return {
    kind: 'card',
    sourceId: 'panchang.today',
    width: PANCHANG_SHARE_WIDTH,
    awaitsArt: true,
    branded: true,
    languages: true,
    title: { hi: 'पंचांग साझा करें', en: 'Share panchang', gu: 'પંચાંગ શેર કરો', kn: 'ಪಂಚಾಂಗ ಹಂಚಿ' },
    tagNameHi: 'पंचांग',
    tagNameEn: 'Panchang',
    render: ({ lang, onReady }) => <ReadyCard input={input} lang={lang} onReady={onReady} />,
    caption: (lang) => {
      const m = model(lang);
      return { sectionName: title(lang), label: `${m.date} · ${m.place}`, firstLine: '' };
    },
    message: (lang) => {
      const m = model(lang);
      return buildPanchangShareMessage(lang, `${title(lang)} · ${m.date} · ${m.place}`);
    },
    text: (lang) =>
      buildPanchangShareText({
        p: input.p,
        md: input.md,
        lang,
        cityLabel: contentByLang(lang, input.placeHi, input.placeEn),
        isToday: isSameLocalDay(input.p.date, new Date()),
      }),
  };
}

/**
 * The पूर्ण पंचांग share, used by the Panchang sky header and the Muhurat detail
 * screen. `share(input)` opens the shared provider's picker on the card; the
 * provider mounts, captures and delivers it, and nothing stays mounted after.
 */
export function usePanchangShare(): { share: (input: ShareInput) => Promise<void>; busy: boolean } {
  const { share, busy } = useShare();
  const sharePanchang = useCallback((input: ShareInput) => share(panchangShareable(input), input.lang), [share]);
  return { share: sharePanchang, busy };
}
