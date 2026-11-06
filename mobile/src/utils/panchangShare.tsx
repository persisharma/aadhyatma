import { occasionShareText } from '@/panchang/occasionTimingFormat';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { Lang } from '@/data/gita/language';
import { buildPanchangShareMessage } from '@/data/shareLinks';
import { contentByLang } from '@/utils/localize';
import { useShare, type ShareableCard } from '@/utils/shareVerse';
import PanchangShareCard, { PANCHANG_SHARE_WIDTH } from '@/components/PanchangShareCard';
import { buildPanchangShareModel } from '@/panchang/panchangShareModel';
import { buildPanchangShareText } from '@/panchang/panchangShareText';
import { isSameLocalDay } from '@/panchang/muhuratFormat';
import { storyRailInset } from '@/utils/shareStoryLayout';
import { resolveShareBrand, shareBrandTextLine } from '@/data/shareBrand';
import { getShareBrand, hydrateShareBrand, useShareBrand } from '@/utils/shareBrandStore';
import type ShareBrandControlsComponent from '@/components/ShareBrandControls';

// The brand mark is a bundled asset, so it decodes in a frame or two; never
// hold the share longer than this for it.
const ICON_WAIT_MS = 1500;

type ShareInput = Parameters<typeof buildPanchangShareModel>[0];

/**
 * The card in `lang`, ready once the sharer's saved co-branding is read and its brand mark
 * decoded — or ICON_WAIT_MS after mounting, never later for the mark. Preview and every
 * capture mount read the same live profile, so the image is what the sheet showed.
 */
function ReadyCard({ input, lang, onReady }: { input: ShareInput; lang: Lang; onReady: (ready: boolean) => void }) {
  const model = useMemo(() => buildPanchangShareModel({ ...input, lang }), [input, lang]);
  const { brand, hydrated } = useShareBrand();
  const resolved = useMemo(() => resolveShareBrand(brand), [brand]);
  const [markDone, setMarkDone] = useState(false);
  const [painted, setPainted] = useState<ReadonlySet<string>>(new Set());
  const onFestivalArtLoad = useCallback((slot: string) => {
    setPainted(old => old.has(slot) ? old : new Set([...old, slot]));
  }, []);
  const needsArt = model.occasionTimings?.some(i => i.windows.length || i.noteHi);
  const artReady = !needsArt || ['left', 'right', 'motif'].every(slot => painted.has(slot));
  useEffect(() => {
    const timer = setTimeout(() => setMarkDone(true), ICON_WAIT_MS);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (markDone && hydrated && artReady) onReady(true);
  }, [markDone, hydrated, artReady, onReady]);
  return <PanchangShareCard model={model} lang={lang} brand={resolved} onFestivalArtLoad={onFestivalArtLoad} onIconLoad={() => setMarkDone(true)} />;
}

// The co-branding settings load only when a share sheet opens.
let brandControls: typeof ShareBrandControlsComponent | null = null;
function BrandControls(props: React.ComponentProps<typeof ShareBrandControlsComponent>) {
  if (!brandControls) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const m = require('@/components/ShareBrandControls');
    brandControls = (m.default ?? m) as typeof ShareBrandControlsComponent;
  }
  const Controls = brandControls;
  return <Controls {...props} />;
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
    // Its text runs 12–14 dp from the edges, under the Reel's button column at full width.
    storyInset: storyRailInset,
    languages: true,
    title: { hi: 'पंचांग साझा करें', en: 'Share panchang', gu: 'પંચાંગ શેર કરો', kn: 'ಪಂಚಾಂಗ ಹಂಚಿ' },
    tagNameHi: 'पंचांग',
    tagNameEn: 'Panchang',
    render: ({ lang, onReady }) => <ReadyCard input={input} lang={lang} onReady={onReady} />,
    // A pandit's own name / title / contact on the card (§33a Co-branding); off → the plain card.
    controls: ({ lang, busy }) => <BrandControls lang={lang} busy={busy} />,
    caption: (lang) => {
      const m = model(lang);
      return { sectionName: title(lang), label: `${m.date} · ${m.place}`, firstLine: '' };
    },
    message: (lang) => {
      const m = model(lang);
      return buildPanchangShareMessage(lang, `${title(lang)} · ${m.date} · ${m.place}`);
    },
    text: (lang) => {
      const body = buildPanchangShareText({
        p: input.p,
        md: input.md,
        lang,
        cityLabel: contentByLang(lang, input.placeHi, input.placeEn),
        isToday: isSameLocalDay(input.p.date, new Date()),
      });
      // The sender's line closes the text like it signs the card; never the caption.
      const rituals = occasionShareText(input.occasionTimings ?? [], input.p.date, lang);
      const complete = rituals ? `${body}\n\n${rituals}` : body;
      const sender = shareBrandTextLine(resolveShareBrand(getShareBrand()));
      return sender ? `${complete}\n\n${sender}` : complete;
    },
  };
}

/**
 * The पूर्ण पंचांग share, used by the Panchang sky header and the Muhurat detail
 * screen. `share(input)` opens the shared provider's picker on the card; the
 * provider mounts, captures and delivers it, and nothing stays mounted after.
 */
export function usePanchangShare(): { share: (input: ShareInput) => Promise<void>; busy: boolean } {
  const { share, busy } = useShare();
  // The saved co-branding is read before the sheet opens, so Send as text and the first
  // capture never run ahead of it (a local read: a few ms on the first share of a run).
  const sharePanchang = useCallback(
    (input: ShareInput) => hydrateShareBrand().then(() => share(panchangShareable(input), input.lang)),
    [share],
  );
  return { share: sharePanchang, busy };
}
