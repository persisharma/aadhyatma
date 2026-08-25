import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Clipboard, Platform, Share, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import ShareCard from '@/components/ShareCard';
import ShareStoryCanvas from '@/components/ShareStoryCanvas';
import ShareTargetSheet from '@/components/ShareTargetSheet';
import { buildInstagramCaption, buildShareCaption } from '@/data/shareLinks';
import {
  buildVerseHashtags,
  formatHashtags,
  type TimelyContext,
} from '@/data/shareHashtags';
import { deityForWeekday } from '@/data/routine/vaar';
import { usePanchangCalendarSystem, useObservancesForDate } from '@/panchang/usePanchang';
import { useTodayKey } from '@/utils/useTodayKey';
import {
  STORY_OUTPUT_HEIGHT,
  STORY_OUTPUT_WIDTH,
  storyCanvas,
} from '@/utils/shareStoryLayout';
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
  /** Compose the verse card, then open the target picker (or the given `target`). */
  share: (verse: ShareableVerse, lang: Lang, opts?: ShareOptions) => Promise<void>;
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

/**
 * Resolves the share date's observances + vaar deity and hands them up.
 *
 * Renders nothing, and is mounted **only while the target picker is open**. That
 * placement is load-bearing: `useObservancesForDate` runs a whole-year observance
 * solve on a cold cache, and `ShareProvider` wraps the entire app — putting these
 * hooks in the provider body made every app start (and every reader unit test that
 * mounts the provider) pay for a solve nobody had asked for. Gated behind the
 * picker, the cost lands only when someone is actually about to share, by which
 * point Home's Today strip has almost always warmed the same year already.
 *
 * The resolve is `InteractionManager`-deferred, so on a genuinely cold cache the
 * first paint of the picker shows the date-free block and the occasion tags appear
 * a beat later. The resolved value is kept after the picker closes — it stays valid
 * for the rest of the day, so a second share is instant.
 */
function TimelyTagsResolver({ onResolve }: { onResolve: (t: TimelyContext) => void }) {
  const [calendarSystem] = usePanchangCalendarSystem();
  const todayKey = useTodayKey();
  const today = useMemo(() => new Date(todayKey), [todayKey]);
  const observances = useObservancesForDate(today, calendarSystem);

  useEffect(() => {
    onResolve({
      occasions: observances.map((o) => ({
        nameHi: o.rule.nameHi,
        nameEn: o.rule.nameEn,
        deityEn: o.rule.deityEn,
      })),
      year: today.getFullYear(),
      weekday: today.getDay(),
      weekdayDeity: deityForWeekday(today.getDay()),
    });
  }, [observances, today, onResolve]);

  return null;
}

export function ShareProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<{
    verse: ShareableVerse;
    lang: Lang;
    format: ShareFormat;
  } | null>(null);
  const [chooser, setChooser] = useState<{
    verse: ShareableVerse;
    lang: Lang;
    opts?: ShareOptions;
  } | null>(null);
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
      let captureTarget = opts?.screenshotRef ?? null;

      try {
        if (mode === 'card') {
          setPending({ verse, lang, format });
          await waitForLayout();
          captureTarget = cardRef as React.RefObject<View | null>;
        }
        const outWidth = format === 'story' ? STORY_OUTPUT_WIDTH : OUTPUT_WIDTH;
        const outHeight = format === 'story' ? STORY_OUTPUT_HEIGHT : OUTPUT_HEIGHT;

        let fileUri: string | null = null;
        if (captureTarget?.current) {
          try {
            fileUri = await captureRef(captureTarget.current, {
              format: 'png',
              quality: 1,
              result: 'tmpfile',
              width: mode === 'card' ? outWidth : undefined,
              height: mode === 'card' ? outHeight : undefined,
            });
          } catch {
            fileUri = null;
          }
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
                format,
                timely: timelyRef.current,
              })
            : buildShareCaption(captionParams);

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
        } else {
          // Image capture failed — share text-only so the user still gets something.
          await Share.share({ message: caption }, { dialogTitle: 'Share verse' });
        }
      } catch {
        // Share sheet dismissal or any other failure: swallow. The user dismissed.
      } finally {
        setPending(null);
        setBusy(false);
        inFlightRef.current = false;
      }
    },
    []
  );

  const share = useCallback(
    async (verse: ShareableVerse, lang: Lang, opts?: ShareOptions) => {
      if (inFlightRef.current) return;
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

  const hashtagPreview = useMemo(
    () =>
      chooser
        ? formatHashtags(
            buildVerseHashtags({
              sourceId: chooser.verse.sourceId,
              sectionNameHi: chooser.verse.sectionNameHi,
              sectionNameEn: chooser.verse.sectionNameEn,
              verseLabelEn: chooser.verse.verseLabelEn,
              lang: chooser.lang,
              timely,
            })
          )
        : '',
    [chooser, timely]
  );

  const pickTarget = useCallback(
    (target: ShareTarget, format: ShareFormat) => {
      if (!chooser) return;
      const { verse, lang, opts } = chooser;
      setChooser(null);
      void run(verse, lang, opts, target, format);
    },
    [chooser, run]
  );

  return (
    <ShareContext.Provider value={value}>
      {children}
      {chooser ? <TimelyTagsResolver onResolve={onTimelyResolved} /> : null}
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
      {pending ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: -10000,
            top: -10000,
            width: pending.format === 'story' ? storyCanvas.width : CARD_WIDTH,
            height: pending.format === 'story' ? storyCanvas.height : CARD_HEIGHT,
          }}
        >
          <View
            ref={cardRef}
            collapsable={false}
            style={{
              width: pending.format === 'story' ? storyCanvas.width : CARD_WIDTH,
              height: pending.format === 'story' ? storyCanvas.height : CARD_HEIGHT,
            }}
          >
            {pending.format === 'story' ? (
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
