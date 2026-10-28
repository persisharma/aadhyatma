import { PixelRatio } from 'react-native';
import { spacing } from '../theme/spacing';

/** Home reflows its controls, never the illustrated subjects, as space changes. */
export function homeLayout(windowWidth: number, fontScale = 1, pixelRatio = PixelRatio.get()) {
  const contentWidth = Math.min(windowWidth, 800);
  const gridPadding = spacing.lg;
  const gridGap = 10;
  const largeText = fontScale > 1.2;
  const columns = contentWidth >= 640 ? (largeText ? 3 : 5) : (largeText ? 2 : 3);
  const gridWidth = contentWidth - 2 * gridPadding;
  const exactTileWidth = (gridWidth - (columns - 1) * gridGap) / columns;
  return {
    contentWidth,
    gridPadding,
    gridGap,
    columns,
    gridWidth,
    // An exact-fit track wraps its last tile on some Android densities: Yoga's
    // float32 line-break sees the row overflow by a hair. Each tile gives up
    // under one physical pixel, so the row always fits with invisible slack.
    tileWidth: (Math.ceil(exactTileWidth * pixelRatio) - 1) / pixelRatio,
    // At enlarged text the whole artwork canvas clears the filled badge row.
    // Every tile has the same height, including tiles without a badge.
    launcherHeight: largeText ? Math.ceil(63 + 2 * (13 * fontScale + 6)) : 72,
    largeText,
  };
}
