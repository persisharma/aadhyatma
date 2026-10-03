import type { Lang } from '@/data/gita/language';

/**
 * One declaration of "which content is offered at which OS widget size", mirrored
 * by the native surfaces: iOS `supportedFamilies` in `VedanshWidgets.swift` and the
 * Android `appwidget-provider` target cells in `plugins/home-widgets/android/res/xml/`.
 *
 * Every content type is its own widget kind, so the size is the *user's* choice at
 * add time instead of a hard-coded mapping: the verse used to be locked to the small
 * square (where a shloka truncates after ~4 words) and the Panchang to the wide
 * rectangle (where a one-word tithi floats in empty parchment). `recommended` is the
 * size the content actually reads best at, and the gallery labels it.
 */
export type WidgetContent = 'verse' | 'panchang' | 'japam';
export type WidgetSize = 'small' | 'medium' | 'large' | 'lock';

export type WidgetCatalogEntry = {
  content: WidgetContent;
  /** iOS widget kind (`StaticConfiguration(kind:)`) — the identity WidgetKit persists per placed widget. */
  iosKind: string;
  /** Android `AppWidgetProvider` receiver, or undefined where the platform has no provider yet. */
  androidProvider?: string;
  /** Every size a user may choose for this content, in gallery order. */
  sizes: WidgetSize[];
  /** The size this content reads best at — labelled in the in-app gallery. */
  recommended: WidgetSize;
};

export const WIDGET_CATALOG: readonly WidgetCatalogEntry[] = [
  {
    content: 'verse',
    iosKind: 'VedanshVerseWidget',
    androidProvider: 'VedanshVerseWidgetProvider',
    sizes: ['medium', 'large', 'small'],
    recommended: 'medium',
  },
  {
    content: 'panchang',
    iosKind: 'VedanshPanchangWidget',
    androidProvider: 'VedanshPanchangWidgetProvider',
    sizes: ['small', 'medium', 'large', 'lock'],
    recommended: 'small',
  },
  {
    content: 'japam',
    iosKind: 'VedanshJapamWidget',
    sizes: ['small', 'medium', 'lock'],
    recommended: 'small',
  },
];

/**
 * Faded sketch art behind each home-screen widget, one pre-cropped plate per
 * (content, size) so no platform ever stretches a square onto a wide cell. Lock
 * Screen families get none — the system draws those monochrome/vibrant.
 *
 * The plates are generated (`scripts/build-widget-backgrounds.mts`) from the app's
 * own `assets/backgrounds/` sketches, already washed onto `parchmentSoft`, so they
 * are opaque and every token text colour keeps its contrast without a runtime
 * overlay. Both native surfaces treat the art as optional: a missing, undecodable
 * or over-budget plate renders the flat parchment card exactly as before.
 *
 * `dimensions` are the exact pixel sizes of the plates AND the iOS decode budget
 * (`WidgetArt.maxPixels` in `VedanshWidgets.swift`). WidgetKit drops the whole
 * render when an image exceeds the cell's pixel area, so each size stays under the
 * smallest iOS 16 cell of that family at @2x (iPhone SE / iPad mini).
 */
export type WidgetBackgroundSize = Exclude<WidgetSize, 'lock'>;

export const WIDGET_BACKGROUND_DIMENSIONS: Record<WidgetBackgroundSize, readonly [number, number]> = {
  small: [256, 256],
  medium: [560, 260],
  large: [560, 560],
};

/** The source sketch (in `assets/backgrounds/`) each content's plates are cut from, and where its subject sits vertically. */
export const WIDGET_BACKGROUND_SOURCES: Record<WidgetContent, { file: string; focusY: number }> = {
  verse: { file: 'deity-krishna-bansuri.webp', focusY: 0.32 },
  panchang: { file: 'panchang-celestial-almanac.webp', focusY: 0.34 },
  japam: { file: 'category-japam-mala.webp', focusY: 0.55 },
};

/** Resource basename shared by the Android drawable, the iOS extension bundle file, and the gallery asset. */
export function widgetBackgroundName(content: WidgetContent, size: WidgetBackgroundSize): string {
  return `vedansh_widget_bg_${content}_${size}`;
}

/** Every plate the catalog needs: each content at each non-Lock-Screen size it offers. */
export function widgetBackgroundPlates(): { content: WidgetContent; size: WidgetBackgroundSize; name: string }[] {
  return WIDGET_CATALOG.flatMap((entry) =>
    entry.sizes
      .filter((size): size is WidgetBackgroundSize => size !== 'lock')
      .map((size) => ({ content: entry.content, size, name: widgetBackgroundName(entry.content, size) }))
  );
}

export function widgetCatalogEntry(content: WidgetContent): WidgetCatalogEntry {
  const entry = WIDGET_CATALOG.find((item) => item.content === content);
  if (!entry) throw new Error(`Unknown widget content: ${content}`);
  return entry;
}

const SIZE_LABELS: Record<WidgetSize, Record<Lang, string>> = {
  small: { hi: 'छोटा', en: 'Small', gu: 'નાનું', kn: 'ಚಿಕ್ಕದು' },
  medium: { hi: 'चौड़ा', en: 'Wide', gu: 'પહોળું', kn: 'ಅಗಲ' },
  large: { hi: 'बड़ा', en: 'Large', gu: 'મોટું', kn: 'ದೊಡ್ಡದು' },
  lock: { hi: 'लॉक स्क्रीन', en: 'Lock Screen', gu: 'લોક સ્ક્રીન', kn: 'ಲಾಕ್ ಸ್ಕ್ರೀನ್' },
};

export function widgetSizeLabel(size: WidgetSize, lang: Lang): string {
  return SIZE_LABELS[size][lang];
}
