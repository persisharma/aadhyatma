/** Home reflows its controls, never the illustrated subjects, as space changes. */
export function homeLayout(windowWidth: number, fontScale = 1) {
  const contentWidth = Math.min(windowWidth, 800);
  const gridPadding = 24;
  const gridGap = 10;
  const largeText = fontScale > 1.2;
  const columns = contentWidth >= 640 ? (largeText ? 3 : 5) : (largeText ? 2 : 3);
  const gridWidth = contentWidth - 2 * gridPadding;
  return {
    contentWidth,
    gridPadding,
    gridGap,
    columns,
    gridWidth,
    tileWidth: (gridWidth - (columns - 1) * gridGap) / columns,
    // At enlarged text the whole artwork canvas clears the filled badge row.
    // Every tile has the same height, including tiles without a badge.
    launcherHeight: largeText ? Math.ceil(63 + 2 * (13 * fontScale + 6)) : 72,
    largeText,
  };
}
