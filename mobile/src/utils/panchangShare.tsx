import React, { useCallback, useRef, useState } from 'react';
import { PixelRatio, Platform, Share, StyleSheet, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import type { Lang } from '@/data/gita/language';
import { buildPanchangShareMessage } from '@/data/shareLinks';
import { contentByLang, pick } from '@/utils/localize';
import { shareFiles } from '@/utils/multiShare';
import PanchangShareCard, { PANCHANG_SHARE_HEIGHT, PANCHANG_SHARE_WIDTH } from '@/components/PanchangShareCard';
import { buildPanchangShareModel, type PanchangShareModel } from '@/panchang/panchangShareModel';

const OUTPUT_WIDTH = 1080;
const OUTPUT_HEIGHT = 1350;
// The brand mark is a bundled asset, so it decodes in a frame or two; never
// hold the share longer than this for it.
const ICON_WAIT_MS = 1500;

async function waitForLayout() {
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  await new Promise<void>((resolve) => setTimeout(resolve, 60));
}

/**
 * Hand the PNG to the OS sheet WITH the caption, so the recipient gets the
 * download link as text too (design.md §33a). iOS takes file + message in one
 * activity sheet; Android's RN Share drops files, so it goes through the
 * native-gated `react-native-share` (`shareFiles`), and only an older binary
 * without it falls back to expo-sharing — image only, the link still printed on
 * the card's footer.
 */
async function deliver(uri: string, message: string, title: string): Promise<void> {
  if (Platform.OS === 'ios') {
    await Share.share({ message, url: uri }, { dialogTitle: title });
    return;
  }
  if (await shareFiles([uri], { message, title })) return;
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: title });
    return;
  }
  await Share.share({ message }, { dialogTitle: title });
}

type ShareInput = Parameters<typeof buildPanchangShareModel>[0];

/**
 * The पूर्ण पंचांग share (design.md §33a), used by the Panchang sky header and
 * the Muhurat detail screen. `share(input)` builds the card's text, mounts the
 * 540×675 card off-screen, captures it at 1080×1350 and opens the sheet; render
 * `layer` anywhere in the screen. Nothing is mounted between shares.
 */
export function usePanchangShare(): { share: (input: ShareInput) => Promise<void>; busy: boolean; layer: React.ReactNode } {
  const [card, setCard] = useState<{ model: PanchangShareModel; lang: Lang } | null>(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const shotRef = useRef<View>(null);
  const iconLoaded = useRef<() => void>(() => {});

  const share = useCallback(async (input: ShareInput) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    try {
      const model = buildPanchangShareModel(input);
      const icon = new Promise<void>((resolve) => {
        iconLoaded.current = resolve;
        setTimeout(resolve, ICON_WAIT_MS);
      });
      setCard({ model, lang: input.lang });
      await icon;
      await waitForLayout();
      if (!shotRef.current) return;
      // UIKit captures point dimensions at the screen's scale; Android uses pixels.
      const scale = Platform.OS === 'ios' ? PixelRatio.get() : 1;
      const uri = await captureRef(shotRef.current, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
        width: OUTPUT_WIDTH / scale,
        height: OUTPUT_HEIGHT / scale,
      });
      const lang = input.lang;
      const headline = `${contentByLang(lang, 'पूर्ण पंचांग', 'Full Panchang')} · ${model.date} · ${model.place}`;
      await deliver(uri, buildPanchangShareMessage(lang, headline), pick(lang, { hi: 'पंचांग साझा करें', en: 'Share panchang', gu: 'પંચાંગ શેર કરો', kn: 'ಪಂಚಾಂಗ ಹಂಚಿ' }));
    } catch {
      /* capture/share unavailable — non-fatal, same as the reader share path */
    } finally {
      busyRef.current = false;
      setBusy(false);
      setCard(null);
    }
  }, []);

  const layer = card ? (
    <View style={styles.captureLayer} pointerEvents="none">
      <View ref={shotRef} collapsable={false}>
        <PanchangShareCard model={card.model} lang={card.lang} onIconLoad={() => iconLoaded.current()} />
      </View>
    </View>
  ) : null;

  return { share, busy, layer };
}

const styles = StyleSheet.create({
  // Fully off-screen: the card is taller than many viewports' free space and an
  // on-screen capture would clip (same rule as MuhuratDetailScreen's old card).
  captureLayer: { position: 'absolute', left: -10000, top: -10000, width: PANCHANG_SHARE_WIDTH, height: PANCHANG_SHARE_HEIGHT },
});
