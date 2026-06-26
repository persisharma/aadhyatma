import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Platform, Share, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import ShareCard from '@/components/ShareCard';
import { buildShareCaption } from '@/data/shareLinks';
import type { Lang } from '@/data/gita/language';

export type ShareableVerse = {
  sourceId: string;
  sectionNameHi: string;
  sectionNameEn: string;
  verseLabelHi: string;
  verseLabelEn: string;
  linesHi: string[];
  linesEn: string[];
  meaningHi?: string;
  meaningEn?: string;
};

type ShareMode = 'card' | 'screenshot';

type ShareOptions = {
  mode?: ShareMode;
  /** Used by mode='screenshot'; defaults to the off-screen card. */
  screenshotRef?: React.RefObject<View | null>;
};

type ShareContextValue = {
  /** Compose the verse card, then open the OS share sheet. */
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

export function ShareProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<{
    verse: ShareableVerse;
    lang: Lang;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const inFlightRef = useRef(false);
  const cardRef = useRef<View>(null);

  const share = useCallback(
    async (verse: ShareableVerse, lang: Lang, opts?: ShareOptions) => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;
      setBusy(true);
      const mode: ShareMode = opts?.mode ?? 'card';
      let captureTarget = opts?.screenshotRef ?? null;

      try {
        if (mode === 'card') {
          setPending({ verse, lang });
          await waitForLayout();
          captureTarget = cardRef as React.RefObject<View | null>;
        }

        let fileUri: string | null = null;
        if (captureTarget?.current) {
          try {
            fileUri = await captureRef(captureTarget.current, {
              format: 'png',
              quality: 1,
              result: 'tmpfile',
              width: mode === 'card' ? OUTPUT_WIDTH : undefined,
              height: mode === 'card' ? OUTPUT_HEIGHT : undefined,
            });
          } catch {
            fileUri = null;
          }
        }

        const caption = buildShareCaption({
          sectionNameHi: verse.sectionNameHi,
          sectionNameEn: verse.sectionNameEn,
          verseLabelHi: verse.verseLabelHi,
          verseLabelEn: verse.verseLabelEn,
          firstLineHi: verse.linesHi[0] ?? '',
          firstLineEn: verse.linesEn[0] ?? verse.linesHi[0] ?? '',
          lang,
        });

        if (fileUri) {
          if (Platform.OS === 'ios') {
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

  const value = useMemo<ShareContextValue>(() => ({ share, busy }), [share, busy]);

  return (
    <ShareContext.Provider value={value}>
      {children}
      {pending ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: -10000,
            top: -10000,
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
          }}
        >
          <View
            ref={cardRef}
            collapsable={false}
            style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
          >
            <ShareCard
              sectionNameHi={pending.verse.sectionNameHi}
              sectionNameEn={pending.verse.sectionNameEn}
              verseLabelHi={pending.verse.verseLabelHi}
              verseLabelEn={pending.verse.verseLabelEn}
              linesHi={pending.verse.linesHi}
              linesEn={pending.verse.linesEn}
              meaningHi={pending.verse.meaningHi}
              meaningEn={pending.verse.meaningEn}
              lang={pending.lang}
              width={CARD_WIDTH}
              height={CARD_HEIGHT}
            />
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
