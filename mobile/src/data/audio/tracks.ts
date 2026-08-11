import type { Deity } from '@/data/texts';

/**
 * The audio library's track catalog.
 *
 * Two kinds:
 *  - `recitation` — audio for an existing text section; `linkedTextId` points at
 *    a `LibraryEntry.id` so a reader can offer "play this" and the library can
 *    deep-link back into the text.
 *  - `standalone` — bhajans / aartis / discourses with no text counterpart;
 *    they carry their own title/deity/artist metadata.
 *
 * Audio bytes are resolved separately via `getAudioSource(track.id)`
 * (`@assets/audio-library`) so this catalog stays pure data and the delivery
 * mechanism (bundled now, streamed later) can change without touching it.
 *
 * PROTOTYPE: this is a representative dummy catalog; every track plays the same
 * placeholder recording (see the registry). Phase 2 curates the real set.
 */
export type AudioTrackKind = 'recitation' | 'standalone';

export type AudioTrack = {
  id: string;
  titleHi: string;
  titleEn: string;
  /** First Devanagari grapheme for the card thumb avatar (mirrors LibraryEntry.thumb). */
  thumb: string;
  /** Reciter / artist, shown on the now-playing screen when known. */
  artistEn?: string;
  deity?: Deity;
  kind: AudioTrackKind;
  /** For `recitation` tracks: the `LibraryEntry.id` this audio belongs to. */
  linkedTextId?: string;
  /** Nominal length in seconds (display only until real audio lands). */
  durationSec?: number;
};

export const AUDIO_TRACKS: readonly AudioTrack[] = [
  // ── Recitations (linked to text sections) ──────────────────────────────
  {
    id: 'hanuman-chalisa-recitation',
    titleHi: 'हनुमान चालीसा',
    titleEn: 'Hanuman Chalisa',
    thumb: 'ह',
    artistEn: 'Traditional',
    deity: 'hanuman',
    kind: 'recitation',
    linkedTextId: 'hanuman-chalisa',
    durationSec: 494,
  },
  {
    id: 'shiv-chalisa-recitation',
    titleHi: 'शिव चालीसा',
    titleEn: 'Shiv Chalisa',
    thumb: 'शि',
    artistEn: 'Traditional',
    deity: 'shiva',
    kind: 'recitation',
    linkedTextId: 'shiv-chalisa',
    durationSec: 362,
  },
  {
    id: 'durga-chalisa-recitation',
    titleHi: 'दुर्गा चालीसा',
    titleEn: 'Durga Chalisa',
    thumb: 'दु',
    artistEn: 'Traditional',
    deity: 'durga',
    kind: 'recitation',
    linkedTextId: 'durga-chalisa',
    durationSec: 401,
  },
  {
    id: 'ganesh-chalisa-recitation',
    titleHi: 'गणेश चालीसा',
    titleEn: 'Ganesh Chalisa',
    thumb: 'ग',
    artistEn: 'Traditional',
    deity: 'ganesha',
    kind: 'recitation',
    linkedTextId: 'ganesh-chalisa',
    durationSec: 338,
  },
  {
    id: 'sundarkand-recitation',
    titleHi: 'सुन्दरकाण्ड',
    titleEn: 'Sundarkand',
    thumb: 'सु',
    artistEn: 'Traditional',
    deity: 'hanuman',
    kind: 'recitation',
    linkedTextId: 'sundarkand',
    durationSec: 1920,
  },
  // ── Standalone (bhajans / aartis / mantras) ───────────────────────────
  {
    id: 'achyutam-keshavam',
    titleHi: 'अच्युतम् केशवम्',
    titleEn: 'Achyutam Keshavam',
    thumb: 'अ',
    artistEn: 'Bhajan',
    deity: 'krishna',
    kind: 'standalone',
    durationSec: 251,
  },
  {
    id: 'om-jai-jagdish-hare',
    titleHi: 'ॐ जय जगदीश हरे',
    titleEn: 'Om Jai Jagdish Hare',
    thumb: 'ॐ',
    artistEn: 'Aarti',
    deity: 'vishnu',
    kind: 'standalone',
    durationSec: 210,
  },
  {
    id: 'aarti-hanuman',
    titleHi: 'आरती कीजै हनुमान लला की',
    titleEn: 'Aarti — Hanuman Lala Ki',
    thumb: 'आ',
    artistEn: 'Aarti',
    deity: 'hanuman',
    kind: 'standalone',
    durationSec: 198,
  },
  {
    id: 'gayatri-mantra',
    titleHi: 'गायत्री मंत्र',
    titleEn: 'Gayatri Mantra',
    thumb: 'गा',
    artistEn: 'Mantra',
    deity: 'savitr',
    kind: 'standalone',
    durationSec: 193,
  },
  {
    id: 'hare-rama',
    titleHi: 'हरे राम',
    titleEn: 'Hare Rama',
    thumb: 'ह',
    artistEn: 'Mahamantra',
    deity: 'rama',
    kind: 'standalone',
    durationSec: 134,
  },
  {
    id: 'govinda-hari-govinda',
    titleHi: 'गोविन्दा हरि गोविन्दा',
    titleEn: 'Govinda Hari Govinda',
    thumb: 'गो',
    artistEn: 'Bhajan',
    deity: 'krishna',
    kind: 'standalone',
    durationSec: 128,
  },
  {
    id: 'har-har-bhole',
    titleHi: 'हर हर भोले',
    titleEn: 'Har Har Bhole',
    thumb: 'ह',
    artistEn: 'Bhajan',
    deity: 'shiva',
    kind: 'standalone',
    durationSec: 153,
  },
  {
    id: 'mahamrityunjay-mantra',
    titleHi: 'महामृत्युंजय मंत्र',
    titleEn: 'Mahamrityunjay Mantra',
    thumb: 'म',
    artistEn: 'Mantra',
    deity: 'shiva',
    kind: 'standalone',
    durationSec: 103,
  },
  {
    id: 'govind-bolo',
    titleHi: 'गोविन्द बोलो',
    titleEn: 'Govind Bolo',
    thumb: 'गो',
    artistEn: 'Bhajan',
    deity: 'krishna',
    kind: 'standalone',
    durationSec: 109,
  },
  {
    id: 'om-gam-ganapataye-namah',
    titleHi: 'ॐ गं गणपतये नमः',
    titleEn: 'Om Gam Ganapataye Namah',
    thumb: 'ॐ',
    artistEn: 'Mantra',
    deity: 'ganesha',
    kind: 'standalone',
    durationSec: 153,
  },
  {
    id: 'narayan-hari-hari',
    titleHi: 'नारायण हरि हरि',
    titleEn: 'Narayan Hari Hari',
    thumb: 'ना',
    artistEn: 'Bhajan',
    deity: 'vishnu',
    kind: 'standalone',
    durationSec: 92,
  },
  {
    id: 'jai-nandlal-ki',
    titleHi: 'जय नंदलाल की',
    titleEn: 'Jai Nandlal Ki',
    thumb: 'ज',
    artistEn: 'Bhajan',
    deity: 'krishna',
    kind: 'standalone',
    durationSec: 153,
  },
  {
    id: 'krishnaya-vasudevaya',
    titleHi: 'कृष्णाय वासुदेवाय',
    titleEn: 'Krishnaya Vasudevaya',
    thumb: 'कृ',
    artistEn: 'Shloka',
    deity: 'krishna',
    kind: 'standalone',
    durationSec: 134,
  },
];

export function getTrackById(id: string): AudioTrack | undefined {
  return AUDIO_TRACKS.find((t) => t.id === id);
}

/** The recitation track linked to a given text section, if any. */
export function getTrackForText(textId: string): AudioTrack | undefined {
  return AUDIO_TRACKS.find((t) => t.linkedTextId === textId);
}
