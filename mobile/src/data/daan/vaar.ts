/**
 * Vaar-daan — the weekly giving table (PRD-26 §10.1 Tier 3), shared vocabulary
 * with PRD-21's graha practice: one table, whichever feature reads it. Rows
 * state the traditional items with the graha they honour; the register is
 * नित्य-परम्परा, never remediation-for-fear (no dosha language — pinned by the
 * copy-guard test). Weekday indices are JS getDay(): 0 = Sunday.
 */
import type { DaanSource, DaanVaarEntry } from './types';

/** One shared source block: the table is a single traditional enumeration. */
export const DAAN_VAAR_SOURCE: DaanSource = {
  referenceUrls: [
    'https://www.newsnationtv.com/religion/dharm/know-what-to-donate-from-monday-to-sunday-386797.html',
    'https://www.bhaktvatsal.com/blog/ravivar-ke-din-kya-daan-karna-chahiye',
  ],
  verificationNote:
    '2026-09-01: the weekday table (Sun wheat/gud/copper · Mon milk/rice/white · Tue masoor/gud/red · Wed moong/green · Thu chana dal/haldi/yellow · Fri rice/ghee/white · Sat til/oil/iron/black) checked concordant across both Hindi references; stated as tradition, no fruit-claims.',
  variantNote: 'Some lists add gau-daan to Sunday and urad to Saturday; the shared core above is what ships.',
};

export const DAAN_VAAR_ENTRIES: readonly DaanVaarEntry[] = [
  {
    weekday: 0,
    vaarHi: 'रविवार', vaarEn: 'Sunday',
    grahaHi: 'सूर्य', grahaEn: 'Surya',
    itemsHi: 'गेहूँ, गुड़, ताँबे के पात्र में जल',
    itemsEn: 'wheat, jaggery, water in a copper vessel',
  },
  {
    weekday: 1,
    vaarHi: 'सोमवार', vaarEn: 'Monday',
    grahaHi: 'चन्द्र', grahaEn: 'Chandra',
    itemsHi: 'दूध, चावल, मिश्री — श्वेत वस्तु',
    itemsEn: 'milk, rice, mishri — white things',
  },
  {
    weekday: 2,
    vaarHi: 'मंगलवार', vaarEn: 'Tuesday',
    grahaHi: 'मंगल', grahaEn: 'Mangal',
    itemsHi: 'मसूर, गुड़, लाल वस्त्र — और श्रम-सेवा का संकल्प',
    itemsEn: 'masoor, jaggery, red cloth — and a vow of seva',
  },
  {
    weekday: 3,
    vaarHi: 'बुधवार', vaarEn: 'Wednesday',
    grahaHi: 'बुध', grahaEn: 'Budha',
    itemsHi: 'मूँग, हरा चारा (गौ-ग्रास)',
    itemsEn: 'moong, green fodder (gau-gras)',
  },
  {
    weekday: 4,
    vaarHi: 'गुरुवार', vaarEn: 'Thursday',
    grahaHi: 'बृहस्पति', grahaEn: 'Brihaspati',
    itemsHi: 'चना दाल, हल्दी, केला, पुस्तकें — विद्या-दान का वार',
    itemsEn: 'chana dal, haldi, banana, books — the vaar of vidya-daan',
  },
  {
    weekday: 5,
    vaarHi: 'शुक्रवार', vaarEn: 'Friday',
    grahaHi: 'शुक्र', grahaEn: 'Shukra',
    itemsHi: 'चावल, घी, श्वेत वस्त्र — अन्नपूर्णा-भाव से',
    itemsEn: 'rice, ghee, white cloth — in the Annapurna bhaav',
  },
  {
    weekday: 6,
    vaarHi: 'शनिवार', vaarEn: 'Saturday',
    grahaHi: 'शनि', grahaEn: 'Shani',
    itemsHi: 'तिल, तेल, काला वस्त्र, लोहा',
    itemsEn: 'til, oil, black cloth, iron',
  },
];

export function getDaanVaarEntry(weekday: number): DaanVaarEntry {
  const normalized = ((weekday % 7) + 7) % 7;
  // The table is total over weekdays, so the lookup cannot miss.
  return DAAN_VAAR_ENTRIES.find((entry) => entry.weekday === normalized) ?? DAAN_VAAR_ENTRIES[0];
}
