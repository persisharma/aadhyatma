import ScaledShareCard from '@/components/ScaledShareCard';
import type { BackgroundImage } from '@/data/backgroundAsset';
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Alert, Clipboard, Platform, Share, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import ShareCard from '@/components/ShareCard';
import ShareStoryCanvas from '@/components/ShareStoryCanvas';
import ShareStoryFrame from '@/components/ShareStoryFrame';
import type { ShareFitFrameProps } from '@/components/ShareFitFrame';
import { ArtworkCaptureContext, createArtworkPaintBarrier, type ArtworkPaintBarrier } from '@/components/ArtworkCaptureContext';
import ProseShareCard from '@/components/ProseShareCard';
import type ShareTargetSheetComponent from '@/components/ShareTargetSheet';
import type { ShareSeriesView } from '@/components/ShareTargetSheet';
import { buildInstagramCaption, buildShareCaption, withShareLinks } from '@/data/shareLinks';
import {
  buildVerseHashtags,
  formatHashtags,
  type TimelyContext,
} from '@/data/shareHashtags';
import {
  STORY_OUTPUT_HEIGHT,
  STORY_OUTPUT_WIDTH,
  storyCanvas,
  storySafeInsets,
} from '@/utils/shareStoryLayout';
import { contentByLang, pick, type LocalizedStrings } from '@/utils/localize';
import {
  MAX_SHARE_PAGES,
  cardMetricsFor,
  paginateProse,
  splitSentences,
  type ProsePage,
  type ProsePagination,
  type ShareCardLayout,
} from '@/utils/shareCardPages';
import { isMultiShareAvailable, shareFiles } from '@/utils/multiShare';
import { capturePixelSize } from '@/utils/captureSize';
import { buildProseShareText, buildVerseShareText } from '@/utils/shareText';
import { useRatingAsk } from '@/contexts/ratingAsk';
import type { Lang } from '@/data/gita/language';

export type ShareableVerse = {
  sourceId: string;
  /**
   * Reader-background subsection key (optional) — the kāṇḍa/stanza number
   * `getReaderBackground` uses for sources whose plate varies per subsection
   * (Valmiki Ramayan, Sundarkand). Readers pass the verse's own `stanza`;
   * Daily Bhakti passes the pool verse's `chapter` (kāṇḍa for Valmiki, a close
   * proxy for Sundarkand). Absent, the source-level plate is used.
   */
  stanza?: number;
  sectionNameHi: string;
  sectionNameEn: string;
  verseLabelHi: string;
  verseLabelEn: string;
  linesHi: string[];
  linesEn: string[];
  meaningHi?: string;
  meaningEn?: string;
  /** Verified native meaning overrides; when present, gu/kn use these instead of transliterating meaningHi. */
  meaningGu?: string;
  meaningKn?: string;
  /** Title line above the meaning (Gita Saar's theme line); see `ShareCardProps`. */
  meaningTitleHi?: string;
  meaningTitleEn?: string;
};

/** One block of shareable prose; `en` may be empty, in which case `hi` is used. */
export type ShareableProseBlock = { kind: 'heading' | 'para'; hi: string; en: string };

/**
 * One choice of how much to share — "this part" or "the whole katha" (design.md §39.5).
 * The sheet's scope segment switches between them and re-paginates.
 */
export type ShareableProseScope = {
  id: string;
  /** Segment label in the sheet (`यह प्रसंग` / `This part`). */
  labelHi: string;
  labelEn: string;
  /** Right half of the card's header band and the caption label (`छठ पूजा कथा · प्रसंग 1/4`). */
  headerHi: string;
  headerEn: string;
  /** Page-1 title. */
  titleHi?: string;
  titleEn?: string;
  blocks: ShareableProseBlock[];
  /** Authored four-language illustrated series, already paginated into complete parts. */
  prepared?: Record<Lang, { label: string; header: string; firstLine: string; pages: ProsePage[] }>;
};

/**
 * Long prose — a katha, a Theerth reading, a lesson — shared as one or more cards
 * (PRD-45, design.md §39.4). Always opens the target sheet: the reader picks pages.
 */
export type ShareableProse = {
  kind: 'prose';
  /** Hashtag / registry key (a `LibraryEntry.id` when one exists, else a namespaced id). */
  sourceId: string;
  /** Resolved plate behind the card; null → the plain parchment gradient. */
  background: BackgroundImage | null;
  /**
   * `picture` lays every page out on the 540×960 picture card and exports 1080×1920 for
   * every target (kids stories, design.md §76); absent, the 540×675 prose card.
   */
  layout?: ShareCardLayout;
  /** Left half of the header band and the caption heading (`व्रत कथा`). */
  sectionNameHi: string;
  sectionNameEn: string;
  sectionName?: LocalizedStrings;
  /** What the hashtags name (`Chhath Puja Katha`); defaults to the section name. */
  tagNameHi?: string;
  tagNameEn?: string;
  /** Sheet title override; defaults to "Share this katha". */
  sheetTitle?: LocalizedStrings;
  /** At least one; the first is the default scope. */
  scopes: ShareableProseScope[];
};

/** What a card's renderer receives: the card language and its artwork-readiness callback. */
export type ShareCardRenderProps = { lang: Lang; onReady: (ready: boolean) => void };

/**
 * Any self-drawn card — Panchang, a Muhurat day, a Jyotish card, a Suvichar — shared
 * through the same picker, capture and delivery as the Daily Bhakti card (design.md
 * §39.10): the system share keeps the whole tall image, Instagram post / story scale it
 * whole into 4:5 / 9:16, the caption carries the download link, and the provider adds
 * the brand + download strip under the card unless the card prints its own.
 */
export type ShareableCard = {
  kind: 'card';
  /** Hashtag / registry key (namespaced when no library entry exists: `panchang.today`). */
  sourceId: string;
  /** Natural layout width in dp; the exported image is 1080 px wide whatever it is. */
  width: number;
  /** The card at `width`. Called for the preview and for every capture mount. */
  render: (p: ShareCardRenderProps) => React.ReactNode;
  /** The card paints remote/local artwork and calls `onReady(true)` once all of it decoded. */
  awaitsArt?: boolean;
  /** The card prints its own brand + download line (Suvichar); otherwise the strip is added. */
  branded?: boolean;
  /** Paper behind the card inside the Instagram frames; null → plain parchment. */
  background?: BackgroundImage | null;
  /** Story/Reel: dp kept clear each side (`storyRailInset`) when the card's text runs near its edges. */
  storyInset?: number;
  /** Sheet heading, in the reader's language. */
  title: LocalizedStrings;
  /** One muted line under the preview (Jyotish privacy statement), already localized. */
  note?: string;
  /** The renderer honours `lang`, so the sheet offers card-language chips. */
  languages?: boolean;
  /** Caption heading, label and quoted line in the card language. */
  caption: (lang: Lang) => { sectionName: string; label: string; firstLine: string };
  /** What the hashtags name. */
  tagNameHi: string;
  tagNameEn: string;
  /** Replaces the system caption (Suvichar's one-line invite); it must carry the link. */
  message?: (lang: Lang) => string;
  /** "Send as text": the card as one plain message; the download lines are appended. */
  text?: (lang: Lang) => string;
  /** "Send as text" handled by the caller (the Kundali report hand-off). */
  onShareText?: () => void;
  /** Overrides the text row's title/sub-label, already localized (the report's full-text hand-off). */
  textRow?: { title: string; sub?: string; accessibilityLabel?: string };
  /** Accessibility label of the sheet's card preview. */
  previewLabel?: string;
  /** Right before the image reaches the OS sheet (Guna Milan's share metric). */
  onShared?: () => void;
  /** The flow ended: cancelled, sent, or failed. */
  onClose?: () => void;
};

/** Anything a share button can hand the provider. Verse callers are unchanged. */
export type ShareableContent = ShareableVerse | ShareableProse | ShareableCard;

export function isShareableProse(c: ShareableContent): c is ShareableProse {
  return (c as ShareableProse).kind === 'prose';
}

export function isShareableCard(c: ShareableContent): c is ShareableCard {
  return (c as ShareableCard).kind === 'card';
}

type ShareMode = 'card' | 'screenshot';

/**
 * Where the share is going.
 *
 * - `system`    — the OS share sheet with the short WhatsApp-style caption.
 * - `instagram` — the same 1080×1350 card, but the caption carries a hashtag block
 *   derived from this verse and is copied to the clipboard first, because Instagram
 *   accepts no pre-filled caption from a share intent (design.md §39).
 */
export type ShareTarget = 'system' | 'instagram';

/**
 * Aspect of the exported image.
 *
 * - `post`  — 1080×1350 (4:5), the tallest a feed post shows whole.
 * - `story` — 1080×1920 (9:16) with the card inside the Story/Reel safe area.
 *   A 4:5 image posted to a Story or Reel gets scaled up to fill the frame and
 *   cropped top and bottom, which eats the card's header and branding footer
 *   (design.md §39.3).
 */
export type ShareFormat = 'post' | 'story';

type ShareOptions = {
  mode?: ShareMode;
  /** Used by mode='screenshot'; defaults to the off-screen card. */
  screenshotRef?: React.RefObject<View | null>;
  /**
   * Skip the target picker and go straight to this destination. Omitted (the
   * reader default), `share()` opens the picker so Instagram is one tap away.
   */
  target?: ShareTarget;
  /** Export aspect; defaults to `post`. Only meaningful with `target`. */
  format?: ShareFormat;
};

type ShareContextValue = {
  /**
   * Compose the card, then open the target picker (or, for a verse, the given
   * `target`). Prose always opens the picker — the reader chooses pages there.
   */
  share: (content: ShareableContent, lang: Lang, opts?: ShareOptions) => Promise<void>;
  /**
   * Close the picker opened for this card without sending — the caller's own state moved
   * on (a Rashifal day change). No-op once a capture is running or another card is open.
   */
  dismiss: (content: ShareableCard) => void;
  /** True while a capture/share is in flight (debounces tap). */
  busy: boolean;
};

const ShareContext = createContext<ShareContextValue | null>(null);

/** Render size of the off-screen card (in dp). Larger = crisper text in the captured PNG. */
const CARD_WIDTH = 540;
const CARD_HEIGHT = 675;

/** Output PNG dimensions handed to WhatsApp / share sheet. */
const OUTPUT_WIDTH = 1080;
const OUTPUT_HEIGHT = 1350;

/** Date-free default: the tag block falls back to exactly its pre-timely form. */
const EMPTY_TIMELY: TimelyContext = {};

type TimelyResolverProps = { onResolve: (t: TimelyContext) => void };
let resolverComponent: React.ComponentType<TimelyResolverProps> | null = null;

/**
 * Mounts the festival/vaar resolver, loading its module on first render rather
 * than at import time.
 *
 * A static `import` would pull the panchang engine, the precomputed observance
 * tables and `astronomy-engine` into the import graph of every screen that mounts
 * this provider — which is all of them. Measured at ~10 % on every reader test
 * suite (13.8 s → 15.2 s for one suite, cold cache), enough to push unrelated
 * timing-sensitive suites past their 5 s timeouts and turn CI red.
 *
 * A deferred `require` keeps the module in Metro's graph — no bundle change, this
 * still ships over OTA — while deferring its *execution* to the moment the picker
 * opens. `React.lazy` + `import()` would express the same thing, but Jest cannot
 * run a real dynamic import without `--experimental-vm-modules`, and the resolver
 * renders `null` so there is nothing for a Suspense boundary to do anyway.
 */
function TimelyTagsResolver(props: TimelyResolverProps) {
  if (!resolverComponent) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    resolverComponent = require('@/components/TimelyTagsResolver')
      .default as React.ComponentType<TimelyResolverProps>;
  }
  const Resolver = resolverComponent;
  return <Resolver {...props} />;
}

/**
 * Deferred-require wrapper for the Instagram fit frame. It is only mounted while a
 * share is in flight, so a static import would pull it (and its deps) into every
 * screen's launch graph — `data/__tests__/launchGraph.test.ts` fails if it does.
 * The `require` keeps it in Metro's graph (ships over OTA) but off the cold start.
 */
let shareFitFrameComponent: React.ComponentType<ShareFitFrameProps> | null = null;
function ShareFitFrame(props: ShareFitFrameProps) {
  if (!shareFitFrameComponent) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    shareFitFrameComponent = require('@/components/ShareFitFrame').default as React.ComponentType<ShareFitFrameProps>;
  }
  const Frame = shareFitFrameComponent;
  return <Frame {...props} />;
}

/**
 * Deferred-require wrappers for the card mount and its preview — mounted only while a
 * card share is open, so they stay off the launch graph like the fit frame above.
 */
type CardMountModule = typeof import('@/components/ShareCardMount');
let cardMountModule: CardMountModule | null = null;
function cardMount(): CardMountModule {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  if (!cardMountModule) cardMountModule = require('@/components/ShareCardMount') as CardMountModule;
  return cardMountModule;
}
function ShareCardMount(props: React.ComponentProps<CardMountModule['default']>) {
  const Mount = cardMount().default;
  return <Mount {...props} />;
}
function ShareCardPreview(props: React.ComponentProps<CardMountModule['ShareCardPreview']>) {
  const Preview = cardMount().ShareCardPreview;
  return <Preview {...props} />;
}

/**
 * Deferred-require wrapper for the share target picker. The sheet (~30 KB) is only
 * mounted after the reader taps share, so a static import would put it on every
 * screen's cold start — `data/__tests__/launchGraph.test.ts` guards against that.
 * `m.default ?? m` tolerates both the real ES module and the bare-string jest mocks.
 */
let shareTargetSheet: typeof ShareTargetSheetComponent | null = null;
function ShareTargetSheet(props: React.ComponentProps<typeof ShareTargetSheetComponent>) {
  if (!shareTargetSheet) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const m = require('@/components/ShareTargetSheet');
    shareTargetSheet = (m.default ?? m) as typeof ShareTargetSheetComponent;
  }
  const Sheet = shareTargetSheet;
  return <Sheet {...props} />;
}

/** One prose page, resolved for capture: everything `ProseShareCard` needs. */
type ProseCardSpec = {
  background: BackgroundImage | null;
  header: string;
  page: ProsePage;
  pageIndex: number;
  pageCount: number;
  lang: Lang;
  illustrationUri?: string;
  layout?: ShareCardLayout;
};

/** Preview uses the measured complete card, so a long meaning is never clipped. */
export function DevotionalPreview({ card }: { card: ProseCardSpec }) {
  const [height, setHeight] = useState(CARD_HEIGHT);
  const identity = JSON.stringify([card.header, card.lang, card.page.devotional]);
  const [painted, setPainted] = useState<string | null>(null);
  const onReady = useCallback((ready: boolean) => setPainted(ready ? identity : null), [identity]);
  return <View testID={painted === identity ? 'devotional-preview-ready' : 'devotional-preview-loading'}>
    <ScaledShareCard width={216} metrics={{ width: CARD_WIDTH, height }}>
      <ProseShareCard {...card} onHeight={setHeight} onIllustrationReady={onReady} />
    </ScaledShareCard>
  </View>;
}

/** The picture card is already 9:16: it is captured at the story size and never framed. */
const isPictureCapture = (spec: PendingCapture) => spec.kind === 'prose' && spec.card.layout === 'picture';

type PendingCapture = (
  | { kind: 'verse'; verse: ShareableVerse; lang: Lang; format: ShareFormat; captureId?: number; measuredHeight?: number }
  | { kind: 'prose'; card: ProseCardSpec; format: ShareFormat; captureId?: number; measuredHeight?: number }
  | { kind: 'card'; card: ShareableCard; lang: Lang; format: ShareFormat; captureId?: number; measuredHeight?: number }
) & { target?: ShareTarget; backgroundPaint?: ArtworkPaintBarrier };

/** A long devotional card — and every self-drawn card — is scaled whole into the 4:5 /
 *  9:16 frame for Instagram so Instagram never crops it. System/WhatsApp keep the full
 *  tall image (shown whole). */
const isFitCapture = (spec: PendingCapture) =>
  spec.target === 'instagram' &&
  (spec.kind === 'card' || (spec.kind === 'prose' && !!spec.card.page.devotional && !isPictureCapture(spec)));

/** Natural width of the mounted card; the export is 1080 px wide whatever it is. */
const naturalWidth = (spec: PendingCapture) => (spec.kind === 'card' ? spec.card.width : CARD_WIDTH);

type ProseChooser = {
  content: ShareableProse;
  /** Card language (§39.8): pages, caption and hashtags. Starts as `uiLang`. */
  lang: Lang;
  /** The reader's language — the sheet's own chrome and alerts. */
  uiLang: Lang;
  scopeIndex: number;
  selected: boolean[];
  highlighted: number;
  view: ShareSeriesView;
  progress?: { done: number; total: number };
  /** Carousel pages already rendered, waiting for the reader's "Continue". */
  readyUris?: string[];
};

type ResolvedScope = {
  raw: ShareableProseScope;
  /** Full header band in the reading language. */
  header: string;
  labelText: string;
  /** Caption's quoted line: the title, else the first sentence (raw hi/en). */
  firstLineHi: string;
  firstLineEn: string;
  pagination: ProsePagination;
};

/** The modal's dismissal animation must finish before the OS sheet presents over it. */
const SHEET_DISMISS_MS = 350;

type ShareMoment = 'verse-shared' | 'prose-shared';

/**
 * The §54 rating moment a dispatched prose share reports. Devotional pages are
 * verses on the prose card (Daily Bhakti), so they keep the verse moment; every
 * other prose card (katha, Theerth, story, listing, Ask) reports its own.
 */
const proseShareMoment = (page: ProsePage | undefined): ShareMoment =>
  page?.devotional ? 'verse-shared' : 'prose-shared';

const pageWord = (n: number, m: number): { hi: string; en: string } => ({
  hi: `पृष्ठ ${n}/${m}`,
  en: `page ${n}/${m}`,
});

function defaultSelection(count: number): boolean[] {
  return Array.from({ length: count }, (_, i) => i < MAX_SHARE_PAGES);
}

function resolveScopes(content: ShareableProse, lang: Lang): ResolvedScope[] {
  const t = (hi: string, en?: string) => contentByLang(lang, hi, en?.trim() ? en : hi);
  const section = t(content.sectionNameHi, content.sectionNameEn);
  return content.scopes.map((scope) => {
    const firstPara = scope.blocks.find((b) => b.kind === 'para');
    const fallbackHi = firstPara ? (splitSentences(firstPara.hi)[0] ?? '') : '';
    const fallbackEn = firstPara ? (splitSentences(firstPara.en || firstPara.hi)[0] ?? '') : '';
    const prepared = scope.prepared?.[lang];
    return {
      raw: scope,
      header: prepared ? `${(content.sectionName ? pick(lang, content.sectionName) : contentByLang(lang, content.sectionNameHi, content.sectionNameEn))} · ${prepared.header}` : `${section} · ${t(scope.headerHi, scope.headerEn)}`,
      labelText: prepared?.label ?? t(scope.labelHi, scope.labelEn),
      firstLineHi: scope.titleHi ?? fallbackHi,
      firstLineEn: scope.titleEn?.trim() ? scope.titleEn : (scope.titleHi ?? fallbackEn),
      pagination: prepared ? { pages: prepared.pages, truncated: false, budgetDp: 0 } : paginateProse({
        title: scope.titleHi ? t(scope.titleHi, scope.titleEn) : null,
        blocks: scope.blocks.map((b) => ({ kind: b.kind, text: t(b.hi, b.en) })),
        lang,
      }),
    };
  });
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export function ShareProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<PendingCapture | null>(null);
  const [chooser, setChooser] = useState<{
    verse: ShareableVerse;
    /** The reader's language — the sheet's chrome and alerts. */
    lang: Lang;
    /** What the card + caption are written in (§39.8); starts as `lang`. */
    cardLang: Lang;
    opts?: ShareOptions;
  } | null>(null);
  const [prose, setProse] = useState<ProseChooser | null>(null);
  const [cardChooser, setCardChooser] = useState<{
    content: ShareableCard;
    /** The reader's language — the sheet's chrome and alerts. */
    lang: Lang;
    /** What the card + caption are written in; switchable only when `content.languages`. */
    cardLang: Lang;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const inFlightRef = useRef(false);
  const cardRef = useRef<View>(null);
  const imageReady = useRef<{ id: number; resolve: (ready: boolean) => void } | null>(null);
  const verseLayout = useRef<{ id: number; resolve: (height: number) => void } | null>(null);
  const captureSequence = useRef(0);

  // A dispatched share is a "good moment" the rating ask may ride on (§54). Read
  // through a ref so `run`'s empty-dep callback identity never churns, and from
  // the light `contexts/ratingAsk.ts` module so this provider stays testable
  // standalone (no expo-notifications pulled in). Outside the provider it no-ops.
  const requestRatingAsk = useRatingAsk();
  const requestRatingAskRef = useRef(requestRatingAsk);
  requestRatingAskRef.current = requestRatingAsk;

  // Timely tags (design.md §39.2). Resolved by `TimelyTagsResolver`, which mounts
  // ONLY while the picker is open — see the note on that component for why this
  // must not live in the always-mounted provider body.
  const [timely, setTimely] = useState<TimelyContext>(EMPTY_TIMELY);
  const timelyRef = useRef(timely);
  timelyRef.current = timely;
  const onTimelyResolved = useCallback((next: TimelyContext) => {
    timelyRef.current = next;
    setTimely(next);
  }, []);

  const onVerseHeight = useCallback((id: number | undefined, height: number) => {
    const current = verseLayout.current;
    if (current && current.id === id && Number.isFinite(height) && height > 0) {
      current.resolve(Math.ceil(height));
    }
  }, []);

  /** Mount `spec` off-screen, let it lay out, and capture it. Null on failure. */
  const capture = useCallback(
    async (spec: PendingCapture, mode: ShareMode, screenshotRef?: React.RefObject<View | null> | null) => {
      let captureTarget = screenshotRef ?? null;
      if (mode === 'card') {
        let painted: Promise<boolean> | null = null;
        let verseMeasured: Promise<number> | null = null;
        if (spec.kind === 'verse') {
          const id = ++captureSequence.current;
          spec = { ...spec, captureId: id };
          verseMeasured = new Promise(resolve => { verseLayout.current = { id, resolve }; });
        }
        if (spec.kind === 'card') {
          // The mount reports its height only once the card's art and the brand mark painted.
          const id = ++captureSequence.current;
          spec = { ...spec, captureId: id };
          verseMeasured = new Promise(resolve => { verseLayout.current = { id, resolve }; });
        }
        if (spec.kind === 'prose' && spec.card.page.devotional) {
          const id = ++captureSequence.current;
          painted = new Promise<boolean>(resolve => { imageReady.current = { id, resolve }; });
          verseMeasured = new Promise(resolve => { verseLayout.current = { id, resolve }; });
          spec = { ...spec, captureId: id };
        }
        if (spec.kind === 'prose' && spec.card.page.illustration) {
          // Load the asset cache only for illustrated captures. Verse/prose-only tests and startup stay light.
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const { kidsStoryArtRequest } = require('@/components/KidsStoryArt') as typeof import('@/components/KidsStoryArt');
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const { cachedAssetUri } = require('@/utils/assetCache') as typeof import('@/utils/assetCache');
          const request = kidsStoryArtRequest(spec.card.page.illustration.art);
          if (!request) return null;
          try {
            const uri = await withTimeout(cachedAssetUri(request), 15000);
            const id = ++captureSequence.current;
            painted = new Promise<boolean>((resolve) => { imageReady.current = { id, resolve }; });
            spec = { ...spec, captureId: id, card: { ...spec.card, illustrationUri: uri } };
          } catch {
            return null;
          }
        }
        const backgroundPaint = createArtworkPaintBarrier();
        spec = { ...spec, backgroundPaint };
        setPending(spec);
        await waitForLayout();
        if (verseMeasured) {
          try {
            const measuredHeight = await withTimeout(verseMeasured, 5000);
            spec = { ...spec, measuredHeight };
            // Instagram: the fit frame remounts the card, so the measuring mount's
            // paint no longer counts — wait for the remounted card's own artwork.
            const fitId = spec.captureId;
            if (isFitCapture(spec) && fitId !== undefined) {
              painted = new Promise<boolean>(resolve => { imageReady.current = { id: fitId, resolve }; });
            }
            setPending(spec);
          } catch { imageReady.current = null; return null; }
          finally { verseLayout.current = null; }
          await waitForLayout();
        }
        if (painted) {
          try { if (!await withTimeout(painted, 15000)) return null; }
          catch { return null; }
          finally { imageReady.current = null; }
          await waitForLayout();
        }
        // Every captured backdrop must finish its native paint (or offline
        // fallback). This includes both the story frame and its inner card.
        if (await backgroundPaint.wait()) await waitForLayout();
        captureTarget = cardRef as React.RefObject<View | null>;
      }
      const tall = spec.format === 'story' || isPictureCapture(spec);
      const outWidth = tall || isFitCapture(spec) ? STORY_OUTPUT_WIDTH : OUTPUT_WIDTH; // all 1080
      const outHeight = isFitCapture(spec)
        // Instagram: fixed-aspect frame, card scaled to fit — never cropped.
        // Feed is 4:5 — the same 1080×1350 as OUTPUT_WIDTH×OUTPUT_HEIGHT.
        ? spec.format === 'story' ? STORY_OUTPUT_HEIGHT : OUTPUT_HEIGHT
        : spec.measuredHeight
        ? Math.round(spec.measuredHeight * (OUTPUT_WIDTH / naturalWidth(spec)))
        : tall ? STORY_OUTPUT_HEIGHT : OUTPUT_HEIGHT;
      if (!captureTarget?.current) return null;
      try {
        return await captureRef(captureTarget.current, {
          format: 'png',
          quality: 1,
          result: 'tmpfile',
          // UIKit captures point dimensions at the screen's scale; Android uses pixels.
          ...(mode === 'card' ? capturePixelSize(outWidth, outHeight) : null),
        });
      } catch {
        return null;
      }
    },
    []
  );

  /**
   * Hand one PNG (or, failing capture, the caption) to its destination. Resolves
   * whether a share sheet was actually presented — false only for the
   * Instagram-without-image alert.
   */
  const deliver = useCallback(
    async (
      fileUri: string | null,
      caption: string,
      target: ShareTarget,
      format: ShareFormat,
      /** Alert language — the reader's, not the card's. */
      lang: Lang
    ): Promise<boolean> => {
      if (target === 'instagram') {
        // Instagram's share intent ignores any text handed to it, so the caption
        // goes to the clipboard for the reader to paste. Deprecated RN API, but
        // the one already in use app-wide (NameDetailSheet) — no native dep, so
        // this whole feature still ships over OTA.
        try {
          Clipboard.setString(caption);
        } catch {
          // Clipboard is best-effort: the card itself still carries the branding.
        }
      }

      if (fileUri) {
        if (target === 'instagram') {
          // Always the expo-sharing route: on iOS the RN Share `message` would
          // ride along uselessly (Instagram drops it) and on some builds pushes
          // Instagram out of the activity list in favour of text-capable targets.
          const canShare = await Sharing.isAvailableAsync();
          if (canShare) {
            await Sharing.shareAsync(fileUri, {
              mimeType: 'image/png',
              UTI: 'public.png',
              dialogTitle:
                format === 'story' ? 'Share to Instagram story' : 'Share on Instagram',
            });
          } else {
            await Share.share(
              { message: caption },
              {
                dialogTitle:
                  format === 'story' ? 'Share to Instagram story' : 'Share on Instagram',
              }
            );
          }
        } else if (Platform.OS === 'ios') {
          // iOS UIActivityViewController accepts file + caption together; WhatsApp
          // populates the caption field automatically.
          await Share.share(
            { message: caption, url: fileUri },
            { dialogTitle: 'Share verse' }
          );
        } else if (await shareFiles([fileUri], { message: caption, title: 'Share' })) {
          // Android's RN Share drops file URIs; react-native-share carries the image
          // and the caption (with the download link) together, as on iOS.
        } else {
          // A binary without react-native-share: expo-sharing takes the image only (the
          // link is still printed on the card).
          const canShare = await Sharing.isAvailableAsync();
          if (canShare) {
            await Sharing.shareAsync(fileUri, {
              mimeType: 'image/png',
              dialogTitle: 'Share verse',
            });
          } else {
            await Share.share({ message: caption }, { dialogTitle: 'Share verse' });
          }
        }
      } else if (target === 'instagram') {
        // Instagram takes an image or nothing: a text-only sheet would simply not
        // list it, which reads as "the button did nothing". Say so instead of
        // opening a sheet the reader cannot use.
        alertCouldNotShare(lang);
        return false;
      } else {
        // Image capture failed — share text-only so the user still gets something.
        await Share.share({ message: caption }, { dialogTitle: 'Share verse' });
      }
      return true;
    },
    []
  );

  const run = useCallback(
    async (
      verse: ShareableVerse,
      lang: Lang,
      opts: ShareOptions | undefined,
      target: ShareTarget,
      format: ShareFormat,
      uiLang: Lang = lang
    ) => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;
      setBusy(true);
      const mode: ShareMode = opts?.mode ?? 'card';

      try {
        const fileUri = await capture({ kind: 'verse', verse, lang, format }, mode, opts?.screenshotRef);
        if (!fileUri && mode === 'card') {
          alertCouldNotShare(uiLang);
          return;
        }

        const captionParams = {
          sectionNameHi: verse.sectionNameHi,
          sectionNameEn: verse.sectionNameEn,
          verseLabelHi: verse.verseLabelHi,
          verseLabelEn: verse.verseLabelEn,
          firstLineHi: verse.linesHi[0] ?? '',
          firstLineEn: verse.linesEn[0] ?? verse.linesHi[0] ?? '',
          lang,
        };
        const caption =
          target === 'instagram'
            ? buildInstagramCaption({
                ...captionParams,
                sourceId: verse.sourceId,
                timely: timelyRef.current,
              })
            : buildShareCaption(captionParams);

        const dispatched = await deliver(fileUri, caption, target, format, uiLang);
        // Report the moment once the sheet has closed (the awaits in deliver have
        // resolved). The rating gate + 1200 ms settle delay live in the provider;
        // here we only say "a verse share just happened" (§54).
        if (dispatched) requestRatingAskRef.current('verse-shared');
      } catch {
        // Share sheet dismissal or any other failure: swallow. The user dismissed.
      } finally {
        setPending(null);
        setBusy(false);
        inFlightRef.current = false;
      }
    },
    [capture, deliver]
  );

  // ─── Prose (design.md §39.4–§39.6) ────────────────────────────────────────

  const proseScopes = useMemo(
    () => (prose ? resolveScopes(prose.content, prose.lang) : []),
    // Scopes depend only on the content and language — not on selection/view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [prose?.content, prose?.lang]
  );
  const activeScope = prose ? proseScopes[prose.scopeIndex] : undefined;

  const cardSpec = useCallback(
    (content: ShareableProse, scope: ResolvedScope, lang: Lang, index: number): ProseCardSpec => ({
      background: content.background,
      header: scope.header,
      page: scope.pagination.pages[index],
      pageIndex: index,
      pageCount: scope.pagination.pages.length,
      lang,
      layout: content.layout,
    }),
    []
  );

  const proseCaption = useCallback(
    (
      content: ShareableProse,
      scope: ResolvedScope,
      lang: Lang,
      target: ShareTarget,
      label: { hi: string; en: string } | null
    ) => {
      const raw = scope.raw;
      // Raw hi/en in, as for a verse: buildShareCaption resolves the language once.
      const params = {
        sectionNameHi: content.sectionNameHi,
        sectionNameEn: content.sectionNameEn || content.sectionNameHi,
        verseLabelHi: label ? `${raw.headerHi} · ${label.hi}` : raw.headerHi,
        verseLabelEn: `${raw.headerEn || raw.headerHi}${label ? ` · ${label.en}` : ''}`,
        firstLineHi: scope.firstLineHi,
        firstLineEn: scope.firstLineEn,
        lang,
        resolved: raw.prepared?.[lang] ? {
          sectionName: (content.sectionName ? pick(lang, content.sectionName) : contentByLang(lang, content.sectionNameHi, content.sectionNameEn)),
          verseLabel: raw.prepared[lang].header + (label ? ` · ${contentByLang(lang, label.hi, label.en)}` : ''),
          firstLine: raw.prepared[lang].firstLine,
        } : undefined,
      };
      return target === 'instagram'
        ? buildInstagramCaption({
            ...params,
            sourceId: content.sourceId,
            timely: timelyRef.current,
            tagNameHi: content.tagNameHi ?? content.sectionNameHi,
            tagNameEn: content.tagNameEn ?? content.sectionNameEn,
          })
        : buildShareCaption(params);
    },
    []
  );

  const runProsePage = useCallback(
    async (target: ShareTarget, format: ShareFormat) => {
      if (!prose || !activeScope || inFlightRef.current) return;
      const { content, lang, uiLang, highlighted } = prose;
      const scope = activeScope;
      setProse(null);
      inFlightRef.current = true;
      setBusy(true);
      try {
        const spec = cardSpec(content, scope, lang, highlighted);
        const fileUri = await capture({ kind: 'prose', card: spec, format, target }, 'card');
        if ((spec.page.illustration || spec.page.devotional) && !fileUri) { alertCouldNotShare(uiLang); return; }
        const label = spec.pageCount > 1 ? pageWord(highlighted + 1, spec.pageCount) : null;
        const caption = proseCaption(content, scope, lang, target, label);
        const dispatched = await deliver(fileUri, caption, target, format, uiLang);
        if (dispatched) requestRatingAskRef.current(proseShareMoment(spec.page));
      } catch {
        // Dismissal or failure: swallow, as the verse path does.
      } finally {
        setPending(null);
        setBusy(false);
        inFlightRef.current = false;
      }
    },
    [prose, activeScope, cardSpec, capture, proseCaption, deliver]
  );

  /** Render every selected page, one mount at a time (never N bitmaps at once). */
  const captureSeries = useCallback(
    async (state: ProseChooser, scope: ResolvedScope): Promise<string[] | null> => {
      const indices = state.selected.flatMap((on, i) => (on ? [i] : []));
      const uris: string[] = [];
      for (let k = 0; k < indices.length; k++) {
        setProse((p) => (p ? { ...p, view: 'progress', progress: { done: k, total: indices.length } } : p));
        const spec = cardSpec(state.content, scope, state.lang, indices[k]);
        const uri = await capture({ kind: 'prose', card: spec, format: 'post' }, 'card');
        if (!uri) return null;
        uris.push(uri);
      }
      setPending(null);
      return uris;
    },
    [cardSpec, capture]
  );

  const runSeries = useCallback(
    async (target: ShareTarget) => {
      if (!prose || !activeScope || inFlightRef.current) return;
      const state = prose;
      const scope = activeScope;
      inFlightRef.current = true;
      setBusy(true);
      try {
        const uris = await captureSeries(state, scope);
        if (!uris) {
          setProse(null);
          alertCouldNotShare(state.uiLang);
          return;
        }
        const label = { hi: `${uris.length} पृष्ठ`, en: `${uris.length} pages` };
        const caption = proseCaption(state.content, scope, state.lang, target, label);
        if (target === 'instagram') {
          try {
            Clipboard.setString(caption);
          } catch {
            // best-effort, as above
          }
          // Pause on the hand-off steps: the reader needs them before the OS sheet.
          setProse((p) => (p ? { ...p, view: 'carouselReady', readyUris: uris, progress: { done: uris.length, total: uris.length } } : p));
          return;
        }
        setProse(null);
        await wait(SHEET_DISMISS_MS);
        const dispatched = await shareFiles(uris, { message: caption, title: 'Share pages' });
        if (dispatched) requestRatingAskRef.current(proseShareMoment(scope.pagination.pages[0]));
      } catch {
        // Dismissal or failure: swallow.
      } finally {
        setPending(null);
        setBusy(false);
        inFlightRef.current = false;
      }
    },
    [prose, activeScope, captureSeries, proseCaption]
  );

  const continueCarousel = useCallback(async () => {
    const uris = prose?.readyUris;
    if (!uris || inFlightRef.current) return;
    inFlightRef.current = true;
    setBusy(true);
    setProse(null);
    try {
      await wait(SHEET_DISMISS_MS);
      const dispatched = await shareFiles(uris, { title: 'Share on Instagram' });
      if (dispatched) requestRatingAskRef.current(proseShareMoment(activeScope?.pagination.pages[0]));
    } catch {
      // Dismissal or failure: swallow.
    } finally {
      setBusy(false);
      inFlightRef.current = false;
    }
  }, [prose, activeScope]);

  /**
   * "Send as text" (§39.8): one plain message to the OS sheet. No capture, so the
   * sheet's dismissal has to be waited out explicitly before the OS sheet presents.
   */
  const sendText = useCallback(async (message: string, moment: ShareMoment) => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setBusy(true);
    try {
      await wait(SHEET_DISMISS_MS);
      const result = await Share.share({ message }, { dialogTitle: 'Share' });
      if (result.action === Share.sharedAction) requestRatingAskRef.current(moment);
    } catch {
      // Dismissal or failure: swallow, as the image paths do.
    } finally {
      setBusy(false);
      inFlightRef.current = false;
    }
  }, []);

  const runProseText = useCallback(() => {
    if (!prose || !activeScope || inFlightRef.current) return;
    const message = buildProseShareText({
      header: activeScope.header,
      pages: activeScope.pagination.pages,
      indices: prose.selected.flatMap((on, i) => (on ? [i] : [])),
      lang: prose.lang,
    });
    setProse(null);
    void sendText(message, proseShareMoment(activeScope.pagination.pages[0]));
  }, [prose, activeScope, sendText]);

  // ─── Self-drawn cards (design.md §39.10) ────────────────────────────────────

  const cardCaption = useCallback((content: ShareableCard, lang: Lang, target: ShareTarget) => {
    const resolved = content.caption(lang);
    if (target === 'system' && content.message) return content.message(lang);
    const params = {
      sectionNameHi: content.tagNameHi,
      sectionNameEn: content.tagNameEn,
      verseLabelHi: '',
      verseLabelEn: '',
      firstLineHi: resolved.firstLine,
      firstLineEn: resolved.firstLine,
      lang,
      resolved: { sectionName: resolved.sectionName, verseLabel: resolved.label, firstLine: resolved.firstLine },
    };
    return target === 'instagram'
      ? buildInstagramCaption({ ...params, sourceId: content.sourceId, timely: timelyRef.current })
      : buildShareCaption(params);
  }, []);

  const runCard = useCallback(
    async (target: ShareTarget, format: ShareFormat) => {
      if (!cardChooser || inFlightRef.current) return;
      const { content, lang: uiLang, cardLang } = cardChooser;
      setCardChooser(null);
      inFlightRef.current = true;
      setBusy(true);
      try {
        const fileUri = await capture({ kind: 'card', card: content, lang: cardLang, format, target }, 'card');
        // Never a text-only fallback: the card is the share.
        if (!fileUri) { alertCouldNotShare(uiLang); return; }
        content.onShared?.();
        const dispatched = await deliver(fileUri, cardCaption(content, cardLang, target), target, format, uiLang);
        if (dispatched) requestRatingAskRef.current('prose-shared');
      } catch {
        // Dismissal or failure: swallow, as the verse path does.
      } finally {
        setPending(null);
        setBusy(false);
        inFlightRef.current = false;
        content.onClose?.();
      }
    },
    [cardChooser, capture, deliver, cardCaption]
  );

  const runCardText = useCallback(() => {
    if (!cardChooser || inFlightRef.current) return;
    const { content, cardLang } = cardChooser;
    setCardChooser(null);
    if (content.onShareText) {
      const handoff = content.onShareText;
      void wait(SHEET_DISMISS_MS).then(() => { handoff(); content.onClose?.(); });
      return;
    }
    if (!content.text) return;
    const message = withShareLinks(content.text(cardLang), cardLang);
    void sendText(message, 'prose-shared').finally(() => content.onClose?.());
  }, [cardChooser, sendText]);

  const share = useCallback(
    async (content: ShareableContent, lang: Lang, opts?: ShareOptions) => {
      if (inFlightRef.current) {
        if (isShareableCard(content)) content.onClose?.();
        return;
      }
      if (isShareableCard(content)) {
        setCardChooser({ content, lang, cardLang: lang });
        return;
      }
      if (isShareableProse(content)) {
        if (!content.scopes.length) return;
        const first = resolveScopes(content, lang)[0];
        setProse({
          content,
          lang,
          uiLang: lang,
          scopeIndex: 0,
          selected: defaultSelection(first.pagination.pages.length),
          highlighted: 0,
          view: 'targets',
        });
        return;
      }
      const verse = content;
      // No explicit target → let the reader pick, so "Share on Instagram" is
      // discoverable from every share button without a second control.
      if (!opts?.target) {
        setChooser({ verse, lang, cardLang: lang, opts });
        return;
      }
      await run(verse, lang, opts, opts.target, opts.format ?? 'post');
    },
    [run]
  );

  const dismiss = useCallback((content: ShareableCard) => {
    setCardChooser((c) => (c && c.content === content && !inFlightRef.current ? null : c));
  }, []);

  const value = useMemo<ShareContextValue>(() => ({ share, dismiss, busy }), [share, dismiss, busy]);

  const hashtagPreview = useMemo(() => {
    if (chooser) {
      return formatHashtags(
        buildVerseHashtags({
          sourceId: chooser.verse.sourceId,
          sectionNameHi: chooser.verse.sectionNameHi,
          sectionNameEn: chooser.verse.sectionNameEn,
          verseLabelEn: chooser.verse.verseLabelEn,
          lang: chooser.cardLang,
          timely,
        })
      );
    }
    if (cardChooser) {
      const c = cardChooser.content;
      return formatHashtags(
        buildVerseHashtags({
          sourceId: c.sourceId,
          sectionNameHi: c.tagNameHi,
          sectionNameEn: c.tagNameEn,
          verseLabelEn: '',
          lang: cardChooser.cardLang,
          timely,
        })
      );
    }
    if (prose && activeScope) {
      const c = prose.content;
      return formatHashtags(
        buildVerseHashtags({
          sourceId: c.sourceId,
          sectionNameHi: c.tagNameHi ?? c.sectionNameHi,
          sectionNameEn: c.tagNameEn ?? c.sectionNameEn,
          verseLabelEn: activeScope.raw.headerEn || activeScope.raw.headerHi,
          lang: prose.lang,
          timely,
        })
      );
    }
    return '';
  }, [chooser, cardChooser, prose, activeScope, timely]);

  const pickTarget = useCallback(
    (target: ShareTarget, format: ShareFormat) => {
      if (!chooser) return;
      const { verse, lang, cardLang, opts } = chooser;
      setChooser(null);
      void run(verse, cardLang, opts, target, format, lang);
    },
    [chooser, run]
  );

  const pickText = useCallback(() => {
    if (!chooser || inFlightRef.current) return;
    const message = buildVerseShareText(chooser.verse, chooser.cardLang);
    setChooser(null);
    void sendText(message, 'verse-shared');
  }, [chooser, sendText]);

  /** Re-language the prose series; page count can change, so selection resets. */
  const setProseCardLang = useCallback((next: Lang) => {
    setProse((p) => {
      if (!p || p.lang === next) return p;
      const scope = resolveScopes(p.content, next)[p.scopeIndex];
      return { ...p, lang: next, highlighted: 0, selected: defaultSelection(scope.pagination.pages.length) };
    });
  }, []);

  const renderProsePage = useCallback(
    (index: number) =>
      prose && activeScope ? (
        <ProseShareCard {...cardSpec(prose.content, activeScope, prose.lang, index)} />
      ) : null,
    [prose, activeScope, cardSpec]
  );

  const series =
    prose && activeScope
      ? {
          pageCount: activeScope.pagination.pages.length,
          selected: prose.selected,
          highlighted: prose.highlighted,
          renderPage: renderProsePage,
          onHighlight: (i: number) => setProse((p) => (p ? { ...p, highlighted: i } : p)),
          onToggle: (i: number) =>
            setProse((p) => {
              if (!p) return p;
              const next = [...p.selected];
              // Keep at least one page in the series.
              if (next[i] && next.filter(Boolean).length === 1) return p;
              next[i] = !next[i];
              return { ...p, selected: next };
            }),
          scopes: proseScopes.map((s) => ({ label: s.labelText, pageCount: s.pagination.pages.length })),
          scopeIndex: prose.scopeIndex,
          onScope: (i: number) =>
            setProse((p) =>
              p
                ? {
                    ...p,
                    scopeIndex: i,
                    highlighted: 0,
                    selected: defaultSelection(proseScopes[i].pagination.pages.length),
                  }
                : p
            ),
          multiShareAvailable: isMultiShareAvailable(),
          onShareAll: () => void runSeries('system'),
          onInstagramCarousel: () => void runSeries('instagram'),
          view: prose.view,
          onView: (view: ShareSeriesView) => setProse((p) => (p ? { ...p, view } : p)),
          onPreviewStep: (delta: -1 | 1) =>
            setProse((p) =>
              p
                ? {
                    ...p,
                    highlighted: Math.max(
                      0,
                      Math.min(activeScope.pagination.pages.length - 1, p.highlighted + delta)
                    ),
                  }
                : p
            ),
          progress: prose.progress,
          onContinueCarousel: () => void continueCarousel(),
        }
      : undefined;

  const pendingSize = (spec: PendingCapture) =>
    spec.kind === 'card'
      ? !spec.measuredHeight
        ? { width: spec.card.width } // Let the card and its strip lay out at their own height.
        : isFitCapture(spec)
        // Instagram: the fit frame's canvas at the card's own width (4:5 / 9:16).
        ? { width: spec.card.width, height: spec.card.width * (spec.format === 'story' ? storyCanvas.height / storyCanvas.width : CARD_HEIGHT / CARD_WIDTH) }
        : { width: spec.card.width, height: spec.measuredHeight }
      : (spec.kind === 'verse' || spec.card.page.devotional) && !spec.measuredHeight
      ? { width: CARD_WIDTH } // Let native text measure without a fixed-height ancestor.
      : isPictureCapture(spec)
      ? { width: cardMetricsFor('picture').width, height: cardMetricsFor('picture').height }
      : isFitCapture(spec)
      // Instagram: the card is scaled to fit the fixed-aspect frame (ShareFitFrame).
      ? spec.format === 'story'
        ? { width: storyCanvas.width, height: storyCanvas.height }
        : { width: CARD_WIDTH, height: CARD_HEIGHT } // 4:5 feed canvas (540×675)
      : {
          width: spec.format === 'story' ? storyCanvas.width : CARD_WIDTH,
          height: spec.measuredHeight
            ? spec.measuredHeight
            : spec.format === 'story' ? storyCanvas.height : CARD_HEIGHT,
        };

  return (
    <ShareContext.Provider value={value}>
      {children}
      {chooser || prose || cardChooser ? <TimelyTagsResolver onResolve={onTimelyResolved} /> : null}
      {cardChooser ? (
        <ShareTargetSheet
          visible
          wholeCard
          lang={cardChooser.lang}
          title={pick(cardChooser.lang, cardChooser.content.title)}
          note={cardChooser.content.note}
          hashtagPreview={hashtagPreview}
          busy={busy}
          onShareSystem={() => void runCard('system', 'post')}
          onShareInstagramPost={() => void runCard('instagram', 'post')}
          onShareInstagramStory={() => void runCard('instagram', 'story')}
          onShareText={cardChooser.content.text || cardChooser.content.onShareText ? runCardText : undefined}
          textTitle={cardChooser.content.textRow?.title}
          textSub={cardChooser.content.textRow?.sub}
          textA11y={cardChooser.content.textRow?.accessibilityLabel}
          cardLang={cardChooser.content.languages ? cardChooser.cardLang : undefined}
          onCardLang={cardChooser.content.languages ? (next) => setCardChooser((c) => (c ? { ...c, cardLang: next } : c)) : undefined}
          onClose={() => {
            if (inFlightRef.current) return;
            const closing = cardChooser.content;
            setCardChooser(null);
            closing.onClose?.();
          }}
          singleCardPreview={<ShareCardPreview key={cardChooser.cardLang} content={cardChooser.content} lang={cardChooser.cardLang} />}
        />
      ) : null}
      {chooser ? (
        <ShareTargetSheet
          visible
          fullVerseImage
          lang={chooser.lang}
          hashtagPreview={hashtagPreview}
          busy={busy}
          onShareSystem={() => pickTarget('system', 'post')}
          onShareInstagramPost={() => pickTarget('instagram', 'post')}
          onShareInstagramStory={() => pickTarget('instagram', 'story')}
          onShareText={pickText}
          cardLang={chooser.cardLang}
          onCardLang={(next) => setChooser((c) => (c ? { ...c, cardLang: next } : c))}
          onClose={() => setChooser(null)}
        />
      ) : null}
      {prose ? (
        <ShareTargetSheet
          visible
          lang={prose.uiLang}
          title={pick(
            prose.uiLang,
            prose.content.sheetTitle ?? {
              hi: 'कथा साझा करें',
              en: 'Share this katha',
              gu: 'કથા શેર કરો',
              kn: 'ಕಥೆ ಹಂಚಿಕೊಳ್ಳಿ',
            }
          )}
          hashtagPreview={hashtagPreview}
          busy={busy}
          onShareSystem={() => void runProsePage('system', 'post')}
          onShareInstagramPost={() => void runProsePage('instagram', 'post')}
          onShareInstagramStory={() => void runProsePage('instagram', 'story')}
          onShareText={runProseText}
          cardLang={prose.lang}
          onCardLang={setProseCardLang}
          onClose={() => {
            if (!inFlightRef.current) setProse(null);
          }}
          series={series}
          cardLayout={prose.content.layout}
          fullVerseImage={!!activeScope?.pagination.pages[0]?.devotional}
          singleCardPreview={activeScope?.pagination.pages.length === 1 && activeScope.pagination.pages[0].devotional ? <DevotionalPreview key={prose.lang} card={cardSpec(prose.content, activeScope, prose.lang, 0)} /> : undefined}
        />
      ) : null}
      {pending ? (
        <ArtworkCaptureContext.Provider value={pending.backgroundPaint ?? null}>
        <View
          pointerEvents="none"
          style={{ position: 'absolute', left: -10000, top: -10000, ...pendingSize(pending) }}
        >
          <View ref={cardRef} collapsable={false} style={pendingSize(pending)}>
            {pending.kind === 'card' ? (
              isFitCapture(pending) && pending.measuredHeight ? (
                <ShareFitFrame format={pending.format} background={pending.card.background ?? null}
                  cardWidth={pending.card.width} cardHeight={pending.measuredHeight} canvasWidth={pending.card.width} storyInset={pending.card.storyInset}>
                  <ShareCardMount key={pending.captureId ?? 'card'} content={pending.card} lang={pending.lang}
                    onReady={(ready) => {
                      const current = imageReady.current;
                      if (current && current.id === pending.captureId) current.resolve(ready);
                    }} />
                </ShareFitFrame>
              ) : (
                <ShareCardMount key={pending.captureId ?? 'card'} content={pending.card} lang={pending.lang}
                  onHeight={height => onVerseHeight(pending.captureId, height)} />
              )
            ) : pending.kind === 'prose' ? (
              // Instagram: once measured, scale the whole devotional card to fit the
              // 4:5 / 9:16 frame so Instagram never crops it (design.md §39.3).
              isFitCapture(pending) && pending.measuredHeight ? (
                <ShareFitFrame format={pending.format} background={pending.card.background}
                  cardWidth={CARD_WIDTH} cardHeight={pending.measuredHeight}>
                  <ProseShareCard key={pending.captureId ?? 'prose'} {...pending.card}
                    onIllustrationReady={(ready) => {
                      const current = imageReady.current;
                      if (current && current.id === pending.captureId) current.resolve(ready);
                    }} />
                </ShareFitFrame>
              ) : pending.format === 'story' && !isPictureCapture(pending) && !pending.card.page.devotional ? (
                <ShareStoryFrame background={pending.card.background} contentSized={false}>
                  <ProseShareCard key={pending.captureId ?? 'prose'} {...pending.card}
                    onHeight={height => onVerseHeight(pending.captureId, Math.max(storyCanvas.height, height + storySafeInsets.top + storySafeInsets.bottom))}
                    onIllustrationReady={(ready) => {
                      const current = imageReady.current;
                      if (current && current.id === pending.captureId) current.resolve(ready);
                    }} />
                </ShareStoryFrame>
              ) : (
                <ProseShareCard key={pending.captureId ?? 'prose'} {...pending.card}
                    onHeight={height => onVerseHeight(pending.captureId, height)}
                    onIllustrationReady={(ready) => {
                      const current = imageReady.current;
                      if (current && current.id === pending.captureId) current.resolve(ready);
                    }} />
              )
            ) : pending.format === 'story' ? (
              <ShareStoryCanvas
                sourceId={pending.verse.sourceId}
                stanza={pending.verse.stanza}
                sectionNameHi={pending.verse.sectionNameHi}
                sectionNameEn={pending.verse.sectionNameEn}
                verseLabelHi={pending.verse.verseLabelHi}
                verseLabelEn={pending.verse.verseLabelEn}
                linesHi={pending.verse.linesHi}
                linesEn={pending.verse.linesEn}
                meaningHi={pending.verse.meaningHi}
                meaningEn={pending.verse.meaningEn}
                meaningGu={pending.verse.meaningGu}
                meaningKn={pending.verse.meaningKn}
                meaningTitleHi={pending.verse.meaningTitleHi}
                meaningTitleEn={pending.verse.meaningTitleEn}
                lang={pending.lang}
                onHeight={height => onVerseHeight(pending.captureId, height)}
              />
            ) : (
              <ShareCard
                sourceId={pending.verse.sourceId}
                stanza={pending.verse.stanza}
                sectionNameHi={pending.verse.sectionNameHi}
                sectionNameEn={pending.verse.sectionNameEn}
                verseLabelHi={pending.verse.verseLabelHi}
                verseLabelEn={pending.verse.verseLabelEn}
                linesHi={pending.verse.linesHi}
                linesEn={pending.verse.linesEn}
                meaningHi={pending.verse.meaningHi}
                meaningEn={pending.verse.meaningEn}
                meaningGu={pending.verse.meaningGu}
                meaningKn={pending.verse.meaningKn}
                meaningTitleHi={pending.verse.meaningTitleHi}
                meaningTitleEn={pending.verse.meaningTitleEn}
                lang={pending.lang}
                width={CARD_WIDTH}
                height={CARD_HEIGHT}
                onHeight={height => onVerseHeight(pending.captureId, height)}
              />
            )}
          </View>
        </View>
        </ArtworkCaptureContext.Provider>
      ) : null}
    </ShareContext.Provider>
  );
}

function alertCouldNotShare(lang: Lang) {
  Alert.alert(
    pick(lang, {
      hi: 'अभी शेयर नहीं हो पाया',
      en: "Couldn't share just now",
      gu: 'અત્યારે શેર ન થઈ શક્યું',
      kn: 'ಈಗ ಹಂಚಿಕೊಳ್ಳಲಾಗಲಿಲ್ಲ',
    }),
    pick(lang, {
      hi: 'कृपया दोबारा कोशिश करें।',
      en: 'Please try again.',
      gu: 'કૃપા કરીને ફરી પ્રયાસ કરો.',
      kn: 'ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    })
  );
}

export function useShare(): ShareContextValue {
  const ctx = useContext(ShareContext);
  if (!ctx) {
    throw new Error('useShare() must be used inside <ShareProvider>.');
  }
  return ctx;
}

async function waitForLayout() {
  // One animation frame so the off-screen card has measured + fonts resolved.
  await new Promise<void>((resolve) =>
    requestAnimationFrame(() => resolve())
  );
  await new Promise<void>((resolve) => setTimeout(resolve, 60));
}

/** Bound both asset fetch and native image decode; never capture an illustrated placeholder. */
async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  try {
    return await Promise.race([promise, new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('Illustration timed out')), ms);
    })]);
  } finally { clearTimeout(timer!); }
}
