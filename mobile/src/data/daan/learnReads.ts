/**
 * The three read cards on the दान-पुण्य home (design.md §73); each opens the
 * five-step Learn guide at its step. Kept tiny and
 * separate from `learn.ts` because the More stack imports DaanPunyaScreen
 * eagerly (launchGraph.test.ts): the teaching itself loads with DaanLearn.
 */
export type Bi = { hi: string; en: string };

export type DaanLearnReadId = 1 | 2 | 3;

/** The five steps of the Learn guide (design: "Step N of 5"). */
export type DaanLearnStep = 1 | 2 | 3 | 4 | 5;

export interface DaanLearnRead {
  id: DaanLearnReadId;
  /** The guide step this card opens — the design links the reads to steps 1, 2 and 5. */
  step: DaanLearnStep;
  title: Bi;
  /** One line under the title in the read header. */
  lede: Bi;
  /** The line on the home's read card. */
  card: Bi;
}

export const DAAN_LEARN_READS: readonly DaanLearnRead[] = [
  {
    id: 1,
    step: 1,
    title: { hi: 'दान क्या है', en: 'What daan is' },
    lede: { hi: 'जो आपके पास है, उसका एक भाग बाँटना', en: 'Sharing a part of what you have' },
    card: { hi: 'जो आपके पास है उसका एक भाग देना, बदले में कुछ न चाहना।', en: 'Giving a part of what you have, wanting nothing back.' },
  },
  {
    id: 2,
    step: 2,
    title: { hi: 'कैसे दें', en: 'How to give' },
    lede: { hi: 'श्रद्धा से, सामर्थ्य के अनुसार, विनम्रता से', en: 'With faith, by your means, with humility' },
    card: { hi: 'उपनिषद् के छह वचन, और गीता की तीन बातें।', en: 'Six words of the Upanishad, and the Gita’s three checks.' },
  },
  {
    id: 3,
    step: 5,
    title: { hi: 'चुपचाप याद रखें', en: 'Remember it quietly' },
    lede: { hi: 'आपका खाता, और गुप्त दान', en: 'Your register, and gupt daan' },
    card: { hi: 'आपका खाता, और गुप्त दान पहले क्यों।', en: 'Your register, and why gupt daan comes first.' },
  },
];
