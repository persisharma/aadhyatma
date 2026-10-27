import { PixelRatio, Platform } from 'react-native';

/** UIKit renders view-shot's width/height as points at the screen scale; Android takes pixels. */
export function captureScale(): number {
  return Platform.OS === 'ios' ? PixelRatio.get() : 1;
}

/**
 * captureRef `width`/`height` options for a PNG of exactly `widthPx`×`heightPx`.
 * Passing pixels straight through on a 3x iPhone triples both sides — a tall
 * Panchang card came out ~2040×6000 and WhatsApp refused it ("This item cannot
 * be shared").
 */
export function capturePixelSize(widthPx: number, heightPx: number, scale = captureScale()) {
  return { width: widthPx / scale, height: heightPx / scale };
}
