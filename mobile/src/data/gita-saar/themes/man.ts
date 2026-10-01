/**
 * मन — the restless mind, chapter 6 nearly whole.
 * Refs resolved against the bundled corpus on 2026-09-27.
 */
import type { GitaSaarTheme } from '../types';

const GITA_CORPUS = 'repo:mobile/src/data/gita/';
const GITA_HOLY = 'https://www.holy-bhagavad-gita.org/chapter/';

export const MAN_THEME: GitaSaarTheme = {
  id: 'man',
  titleHi: 'मन',
  titleEn: 'The restless mind',
  ledeHi:
    'मन भटकता है, टिकता नहीं — क्या करें? छठे अध्याय में अर्जुन यही शिकायत करते हैं, और कृष्ण उसे झुठलाते नहीं। वे मन को शत्रु भी कहते हैं और मित्र भी, और फिर उसे लौटाने का तरीका देते हैं।',
  ledeEn:
    "The mind wanders and will not settle. In the sixth chapter Arjuna makes exactly this complaint, and Krishna does not dismiss it. He calls the mind both enemy and friend, and then gives the way to bring it back.",
  groups: [
    {
      id: 'mitra-ya-shatru',
      titleHi: 'मित्र या शत्रु',
      titleEn: 'Friend or enemy',
      introHi: 'मन दोनों हो सकता है। कौन-सा होगा, यह तुम पर है।',
      introEn: 'The mind can be either. Which one it is depends on you.',
      verses: [
        {
          ref: { chapter: 6, verse: 5 },
          themeHi: 'अपने से अपना उद्धार',
          themeEn: 'Lift yourself by yourself',
          saarHi: 'अपने द्वारा अपना उद्धार करो, अपना पतन मत करो। तुम ही अपने मित्र हो और तुम ही अपने शत्रु।',
          saarEn: 'Raise yourself by your own self; do not let yourself sink. You are your own friend, and you are your own enemy.',
        },
        {
          ref: { chapter: 6, verse: 6 },
          themeHi: 'जीता हुआ मन मित्र',
          themeEn: 'A conquered mind is a friend',
          saarHi: 'जिसने अपने को अपने से जीत लिया, उसके लिए मन मित्र है। जिसने नहीं जीता, उसके लिए वही मन शत्रु की तरह बर्ताव करता है।',
          saarEn: 'For the one who has mastered themselves, the mind is a friend. For the one who has not, that same mind behaves like an enemy.',
        },
      ],
    },
    {
      id: 'santulan',
      titleHi: 'संतुलन',
      titleEn: 'Measure',
      introHi: 'मन को साधने से पहले शरीर की दिनचर्या साधनी पड़ती है।',
      introEn: "Before the mind is steadied, the body's day has to be.",
      verses: [
        {
          ref: { chapter: 6, verse: 16 },
          themeHi: 'न अधिक, न बिलकुल नहीं',
          themeEn: 'Neither too much nor none',
          saarHi: 'योग न अधिक खाने वाले का सधता है, न बिलकुल न खाने वाले का; न अधिक सोने वाले का, न सदा जागने वाले का।',
          saarEn: 'Yoga is not for one who eats too much, nor for one who does not eat; not for one who sleeps too much, nor for one who never sleeps.',
        },
        {
          ref: { chapter: 6, verse: 17 },
          themeHi: 'यथायोग्य',
          themeEn: 'In right measure',
          saarHi: 'जो आहार, विहार, कर्म, नींद और जागने में यथायोग्य संतुलन रखता है, उसका योग दुःखों का नाश करने वाला बनता है।',
          saarEn: 'For the one who keeps right measure in food, rest, effort, sleep and waking, yoga becomes the ender of sorrow.',
        },
      ],
    },
    {
      id: 'wapas-lao',
      titleHi: 'वापस लाओ',
      titleEn: 'Bring it back',
      introHi: 'पूरी विधि एक श्लोक में।',
      introEn: 'The whole method in one verse.',
      verses: [
        {
          ref: { chapter: 6, verse: 26 },
          themeHi: 'जहाँ-जहाँ भटके',
          themeEn: 'Wherever it wanders',
          saarHi: 'यह अस्थिर, चंचल मन जहाँ-जहाँ भटके, वहाँ-वहाँ से उसे हटाकर एक परमात्मा में लगाओ। बार-बार। यही अभ्यास है।',
          saarEn: 'Wherever this unsteady, restless mind wanders, draw it back from there and settle it on the One. Again and again. That is the practice.',
        },
      ],
    },
    {
      id: 'arjun-aur-uttar',
      titleHi: 'अर्जुन और उत्तर',
      titleEn: 'Arjuna and the answer',
      introHi: 'अर्जुन की शिकायत, और कृष्ण का स्वीकार सहित उत्तर।',
      introEn: "Arjuna's complaint, and Krishna's answer, which begins by agreeing.",
      verses: [
        {
          ref: { chapter: 6, verse: 33 },
          themeHi: 'मुझे यह टिकता नहीं दिखता',
          themeEn: 'I do not see it holding',
          saarHi: 'अर्जुन कहते हैं: आपने समता का जो योग बताया, मन की चंचलता के कारण मुझे उसकी स्थिर स्थिति दिखती ही नहीं।',
          saarEn: 'Arjuna says: this yoga of evenness you have taught, I cannot see it lasting, because the mind is so restless.',
        },
        {
          ref: { chapter: 6, verse: 34 },
          themeHi: 'हवा की तरह',
          themeEn: 'Like the wind',
          saarHi: 'मन चंचल है, मथ देने वाला, ज़िद्दी और बलवान। उसे रोकना मुझे हवा को रोकने जितना कठिन लगता है।',
          saarEn: 'The mind is restless, churning, obstinate and strong. Holding it seems to me as hard as holding the wind.',
        },
        {
          ref: { chapter: 6, verse: 35 },
          themeHi: 'ठीक कहते हो — पर',
          themeEn: 'True, and yet',
          saarHi: 'कृष्ण कहते हैं: निःसंदेह मन चंचल है और उसे रोकना कठिन है। पर अभ्यास और वैराग्य से उसे वश में किया जाता है।',
          saarEn: 'Krishna says: without doubt the mind is restless and hard to hold. And yet by practice and by letting go it is brought under control.',
        },
        {
          ref: { chapter: 6, verse: 36 },
          themeHi: 'उपाय से सम्भव',
          themeEn: 'Possible with method',
          saarHi: 'जिसका मन वश में नहीं, उसके लिए योग कठिन है। पर जो उपाय से यत्न करता है और अपने को साध लेता है, उसे योग मिल सकता है।',
          saarEn: 'For one whose mind is unrestrained, yoga is hard. But for one who strives with method and steadies themselves, it can be reached.',
        },
      ],
    },
  ],
  closingHi: 'मन को दबाओ मत, लौटाओ — हर बार।',
  closingEn: 'Do not force the mind. Bring it back, every time.',
  status: 'verified',
  source: {
    referenceUrls: [`${GITA_CORPUS}chapter-06.json`, `${GITA_HOLY}6`],
    verificationNote:
      '2026-09-27: every ref opened in the bundled corpus JSON (all chapter 6); saar lines paraphrase the bundled meanings and add nothing the verse does not say.',
  },
};
