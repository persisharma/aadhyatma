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
