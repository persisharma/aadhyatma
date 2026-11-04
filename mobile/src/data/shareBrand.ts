import type { Lang } from '@/data/gita/language';

/**
 * The sharer's own branding on the पूर्ण पंचांग card (design.md §33a *Co-branding*,
 * RULEBOOK *Panchang share co-branding*): a pandit, temple or astrologer prints a name in the card's header
 * and an optional title · contact line in its footer. Vedansh's icon, wordmark and
 * download pill never change. Off, or without a name, the card is exactly the plain one.
 * The profile prints on the card (and in Send as text) only — never in the caption,
 * hashtags, analytics or any network request.
 */
export const SHARE_BRAND_KEY = '@vedansh/share-brand/v1';
/** Fit-tested on the 540 dp card beside a long city chip and inside the footer line. */
export const BRAND_NAME_LIMIT = 28;
export const BRAND_TITLE_LIMIT = 28;
export const BRAND_CONTACT_LIMIT = 20;

export type ShareBrand = { on: boolean; name: string; title: string; contact: string };
export const initialShareBrand: ShareBrand = { on: false, name: '', title: '', contact: '' };

/** What the card prints: the header name, and the footer line when a title or contact exists. */
export type ResolvedShareBrand = { name: string; line: string | null };

/** Keeps the person's script and combining marks; only control characters and runs of spaces go. */
export function cleanBrandText(value: string): string {
  return value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
}

const text = (value: unknown, limit: number) => (typeof value === 'string' ? value.slice(0, limit) : '');

export function parseShareBrand(raw: string | null): ShareBrand {
  try {
    const p = JSON.parse(raw ?? '{}') ?? {};
    const name = text(p.name, BRAND_NAME_LIMIT);
    return {
      // Branding can only be on with a name to print.
      on: p.on === true && cleanBrandText(name) !== '',
      name,
      title: text(p.title, BRAND_TITLE_LIMIT),
      contact: text(p.contact, BRAND_CONTACT_LIMIT),
    };
  } catch {
    return { ...initialShareBrand };
  }
}

/**
 * Field-by-field fallback (design.md §33a): off or nameless → null (the plain card);
 * a name alone → header chip only, the footer keeps the feature line; a title and/or
 * contact → they replace the feature line. A title or contact without a name is ignored.
 */
export function resolveShareBrand(brand: ShareBrand): ResolvedShareBrand | null {
  if (!brand.on) return null;
  const name = cleanBrandText(brand.name);
  if (!name) return null;
  const parts = [cleanBrandText(brand.title), cleanBrandText(brand.contact)].filter(Boolean);
  return { name, line: parts.length ? parts.join(' · ') : null };
}

/** The script the person typed in, so the card draws it in a face that has its glyphs. */
export function brandTextLang(value: string): Lang {
  if (/[઀-૿]/.test(value)) return 'gu';
  if (/[ಀ-೿]/.test(value)) return 'kn';
  if (/[ऀ-ॿ]/.test(value)) return 'hi';
  return 'en';
}

/** Send as text: one closing line naming the sender, or nothing. */
export function shareBrandTextLine(brand: ResolvedShareBrand | null): string | null {
  if (!brand) return null;
  return brand.line ? `${brand.name} · ${brand.line}` : brand.name;
}
