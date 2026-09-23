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
import ProseShareCard from '@/components/ProseShareCard';
import ShareTargetSheet, { type ShareSeriesView } from '@/components/ShareTargetSheet';
import { buildInstagramCaption, buildShareCaption } from '@/data/shareLinks';
import {
  buildVerseHashtags,
  formatHashtags,
  type TimelyContext,
} from '@/data/shareHashtags';
import {
  STORY_OUTPUT_HEIGHT,
  STORY_OUTPUT_WIDTH,
  storyCanvas,
} from '@/utils/shareStoryLayout';
import { contentByLang, pick, type LocalizedStrings } from '@/utils/localize';
import {
  MAX_SHARE_PAGES,
  paginateProse,
  splitSentences,
  type ProsePage,
  type ProsePagination,
} from '@/utils/shareCardPages';
import { isMultiShareAvailable, shareFiles } from '@/utils/multiShare';
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
  background: number | null;
  /** Left half of the header band and the caption heading (`व्रत कथा`). */
  sectionNameHi: string;
  sectionNameEn: string;
  /** What the hashtags name (`Chhath Puja Katha`); defaults to the section name. */
  tagNameHi?: string;
  tagNameEn?: string;
  /** Sheet title override; defaults to "Share this katha". */
  sheetTitle?: LocalizedStrings;
  /** At least one; the first is the default scope. */
  scopes: ShareableProseScope[];
};

/** Anything a share button can hand the provider. Verse callers are unchanged. */
export type ShareableContent = ShareableVerse | ShareableProse;

export function isShareableProse(c: ShareableContent): c is ShareableProse {
  return (c as ShareableProse).kind === 'prose';
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

/** One prose page, resolved for capture: everything `ProseShareCard` needs. */
type ProseCardSpec = {
  background: number | null;
  header: string;
  page: ProsePage;
  pageIndex: number;
  pageCount: number;
  lang: Lang;
};

type PendingCapture =
  | { kind: 'verse'; verse: ShareableVerse; lang: Lang; format: ShareFormat }
  | { kind: 'prose'; card: ProseCardSpec; format: ShareFormat };

type ProseChooser = {
  content: ShareableProse;
  lang: Lang;
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
    return {
      raw: scope,
      header: `${section} · ${t(scope.headerHi, scope.headerEn)}`,
      labelText: t(scope.labelHi, scope.labelEn),
      firstLineHi: scope.titleHi ?? fallbackHi,
      firstLineEn: scope.titleEn?.trim() ? scope.titleEn : (scope.titleHi ?? fallbackEn),
      pagination: paginateProse({
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
    lang: Lang;
    opts?: ShareOptions;
  } | null>(null);
  const [prose, setProse] = useState<ProseChooser | null>(null);
  const [busy, setBusy] = useState(false);
  const inFlightRef = useRef(false);
  const cardRef = useRef<View>(null);

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

  /** Mount `spec` off-screen, let it lay out, and capture it. Null on failure. */
  const capture = useCallback(
    async (spec: PendingCapture, mode: ShareMode, screenshotRef?: React.RefObject<View | null> | null) => {
      let captureTarget = screenshotRef ?? null;
      if (mode === 'card') {
        setPending(spec);
        await waitForLayout();
        captureTarget = cardRef as React.RefObject<View | null>;
      }
      const outWidth = spec.format === 'story' ? STORY_OUTPUT_WIDTH : OUTPUT_WIDTH;
      const outHeight = spec.format === 'story' ? STORY_OUTPUT_HEIGHT : OUTPUT_HEIGHT;
      if (!captureTarget?.current) return null;
      try {
        return await captureRef(captureTarget.current, {
          format: 'png',
          quality: 1,
          result: 'tmpfile',
          width: mode === 'card' ? outWidth : undefined,
          height: mode === 'card' ? outHeight : undefined,
        });
      } catch {
        return null;
      }
    },
    []
  );

  /** Hand one PNG (or, failing capture, the caption) to its destination. */
  const deliver = useCallback(
    async (fileUri: string | null, caption: string, target: ShareTarget, format: ShareFormat, lang: Lang) => {
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
        } else {
          // Android's RN Share drops file URIs. Use expo-sharing for the image; the
          // user types the caption in WhatsApp (the link is also printed on the card).
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
      } else {
        // Image capture failed — share text-only so the user still gets something.
        await Share.share({ message: caption }, { dialogTitle: 'Share verse' });
      }
    },
    []
  );

  const run = useCallback(
    async (
      verse: ShareableVerse,
      lang: Lang,
      opts: ShareOptions | undefined,
      target: ShareTarget,
      format: ShareFormat
    ) => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;
      setBusy(true);
      const mode: ShareMode = opts?.mode ?? 'card';

      try {
        const fileUri = await capture({ kind: 'verse', verse, lang, format }, mode, opts?.screenshotRef);

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

        await deliver(fileUri, caption, target, format, lang);
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
      const { content, lang, highlighted } = prose;
      const scope = activeScope;
      setProse(null);
      inFlightRef.current = true;
      setBusy(true);
      try {
        const spec = cardSpec(content, scope, lang, highlighted);
        const fileUri = await capture({ kind: 'prose', card: spec, format }, 'card');
        const label = spec.pageCount > 1 ? pageWord(highlighted + 1, spec.pageCount) : null;
        const caption = proseCaption(content, scope, lang, target, label);
        await deliver(fileUri, caption, target, format, lang);
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
          alertCouldNotShare(state.lang);
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
        await shareFiles(uris, { message: caption, title: 'Share pages' });
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
      await shareFiles(uris, { title: 'Share on Instagram' });
    } catch {
      // Dismissal or failure: swallow.
    } finally {
      setBusy(false);
      inFlightRef.current = false;
    }
  }, [prose]);

  const share = useCallback(
    async (content: ShareableContent, lang: Lang, opts?: ShareOptions) => {
      if (inFlightRef.current) return;
      if (isShareableProse(content)) {
        if (!content.scopes.length) return;
        const first = resolveScopes(content, lang)[0];
        setProse({
          content,
          lang,
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
        setChooser({ verse, lang, opts });
        return;
      }
      await run(verse, lang, opts, opts.target, opts.format ?? 'post');
    },
    [run]
  );

  const value = useMemo<ShareContextValue>(() => ({ share, busy }), [share, busy]);

  const hashtagPreview = useMemo(() => {
    if (chooser) {
      return formatHashtags(
        buildVerseHashtags({
          sourceId: chooser.verse.sourceId,
          sectionNameHi: chooser.verse.sectionNameHi,
          sectionNameEn: chooser.verse.sectionNameEn,
          verseLabelEn: chooser.verse.verseLabelEn,
          lang: chooser.lang,
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
  }, [chooser, prose, activeScope, timely]);

  const pickTarget = useCallback(
    (target: ShareTarget, format: ShareFormat) => {
      if (!chooser) return;
      const { verse, lang, opts } = chooser;
      setChooser(null);
      void run(verse, lang, opts, target, format);
    },
    [chooser, run]
  );

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

  const pendingSize = (format: ShareFormat) => ({
    width: format === 'story' ? storyCanvas.width : CARD_WIDTH,
    height: format === 'story' ? storyCanvas.height : CARD_HEIGHT,
  });

  return (
    <ShareContext.Provider value={value}>
      {children}
      {chooser || prose ? <TimelyTagsResolver onResolve={onTimelyResolved} /> : null}
      {chooser ? (
        <ShareTargetSheet
          visible
          lang={chooser.lang}
          hashtagPreview={hashtagPreview}
          busy={busy}
          onShareSystem={() => pickTarget('system', 'post')}
          onShareInstagramPost={() => pickTarget('instagram', 'post')}
          onShareInstagramStory={() => pickTarget('instagram', 'story')}
          onClose={() => setChooser(null)}
        />
      ) : null}
      {prose ? (
        <ShareTargetSheet
          visible
          lang={prose.lang}
          title={pick(
            prose.lang,
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
          onClose={() => {
            if (!inFlightRef.current) setProse(null);
          }}
          series={series}
        />
      ) : null}
      {pending ? (
        <View
          pointerEvents="none"
          style={{ position: 'absolute', left: -10000, top: -10000, ...pendingSize(pending.format) }}
        >
          <View ref={cardRef} collapsable={false} style={pendingSize(pending.format)}>
            {pending.kind === 'prose' ? (
              pending.format === 'story' ? (
                <ShareStoryFrame background={pending.card.background}>
                  <ProseShareCard {...pending.card} />
                </ShareStoryFrame>
              ) : (
                <ProseShareCard {...pending.card} />
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
                lang={pending.lang}
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
                lang={pending.lang}
                width={CARD_WIDTH}
                height={CARD_HEIGHT}
              />
            )}
          </View>
        </View>
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
