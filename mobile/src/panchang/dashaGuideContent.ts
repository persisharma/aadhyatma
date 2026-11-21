import type { DashaLord } from './kundali';

/**
 * Mahadasha guide copy — the plain-language teaching around the reviewed
 * tables (RULEBOOK §14.3, design.md §51e).
 *
 * Everything prescriptive on the guide still comes from `GRAHA_UPAY` through
 * `buildDashaPractice` (§14.3.5); everything that reads THIS chart comes from
 * the reviewed graha cards and narrative cells. What lives here is only the
 * explaining: what a Mahadasha is, what each of the lord's three traditional
 * keywords means in everyday words, what daan / seva / a mantra / a mala are,
 * and why the practice is the one it is. None of it names an event, a date of
 * an event, a fate or a fix; the §14.3.7 scans cover this file.
 *
 * Status: draft explanatory copy written for the guide (Nov 2026). It is not
 * part of the jyotishi sign-off recorded for `GRAHA_UPAY` or the narrative
 * cells, and is listed as pending editorial review in the PR.
 */

export type GuideLine = { hi: string; en: string };

/**
 * One everyday sentence per keyword, index-aligned with
 * `DASHA_LORD_KEYWORDS_HI/EN` (split on ", "): the keyword itself is the
 * reviewed word; this is only what it means to a reader with no Jyotish.
 */
export const DASHA_LORD_LESSONS: Readonly<Record<DashaLord, readonly [GuideLine, GuideLine, GuideLine]>> = {
  ketu: [
    { hi: 'कम में खुश रहना, और जीवन को सादा रखना।', en: 'Being happy with less, and keeping life uncluttered.' },
    { hi: 'चीज़ों और नतीजों को बहुत कसकर न पकड़ना।', en: 'Not holding on too tightly to things or results.' },
    { hi: 'शांत समय में भीतर देखना — प्रार्थना और मनन।', en: 'Spending quiet time looking within — prayer and reflection.' },
  ],
  venus: [
    { hi: 'अपने क़रीबी लोगों का ध्यान रखना।', en: 'Caring for the people close to you.' },
    { hi: 'संगीत, रंग और सुंदर चीज़ों को समय देना।', en: 'Making room for music, colour and beautiful things.' },
    { hi: 'बिना अति किए, सहजता से जीवन का आनंद लेना।', en: 'Enjoying life gently, without overdoing it.' },
  ],
  sun: [
    { hi: 'मन में तेज और उत्साह बनाए रखना।', en: 'Keeping your spirit bright and eager.' },
    { hi: 'अपना काम पूरे मन से और समय पर करना।', en: 'Doing what is yours to do, fully and on time.' },
    { hi: 'जो कहना है, साफ़ कहना और वैसा ही करना।', en: 'Saying plainly what you mean, and doing what you say.' },
  ],
  moon: [
    { hi: 'अपने मन की बात समझना, और उसे शांत रखना।', en: 'Noticing how you feel, and keeping your mind calm.' },
    { hi: 'दूसरों का ध्यान रखना, और उन्हें अपना ध्यान रखने देना।', en: 'Looking after others, and letting them look after you.' },
    { hi: 'भावनाओं को चन्द्रमा की तरह घटने-बढ़ने का समय देना।', en: 'Giving feelings time to rise and settle, like the Moon.' },
  ],
  mars: [
    { hi: 'अपनी शक्ति को अच्छे काम में लगाना।', en: 'Using your strength for useful work.' },
    { hi: 'शांत मन से सही बात के लिए खड़े होना।', en: 'Standing up for what is right, calmly.' },
    { hi: 'संयम और साफ़ लक्ष्य के साथ मेहनत करना।', en: 'Working hard, with self-control and a clear aim.' },
  ],
  rahu: [
    { hi: 'नए विचारों और नए तरीक़ों के लिए खुले रहना।', en: 'Being open to new ideas and new ways.' },
    { hi: 'ऊँचा लक्ष्य रखना, और रास्ते में ईमानदार रहना।', en: 'Aiming high, and staying honest on the way.' },
    { hi: 'अनजानी राहों को धैर्य और समझ से परखना।', en: 'Trying the unknown with patience and good sense.' },
  ],
  jupiter: [
    { hi: 'पढ़ना, प्रश्न पूछना, नई बातें सीखना।', en: 'Reading, asking questions, learning new things.' },
    { hi: 'बढ़ना — ज्ञान में, मन में और बाँटने में।', en: 'Growing — in knowledge, in heart, and in what you share.' },
    { hi: 'श्रद्धा के साथ सही काम करना।', en: 'Doing what is right, with faith.' },
  ],
  saturn: [
    { hi: 'अपना काम रोज़, समय पर करना।', en: 'Doing your work on time, every day.' },
    { hi: 'फल देर से मिले, तब भी हार न मानना।', en: 'Not giving up when results come slowly.' },
    { hi: 'बदले में कुछ माँगे बिना दूसरों की मदद करना।', en: 'Helping others without asking for anything back.' },
  ],
  mercury: [
    { hi: 'करने से पहले बात को अच्छी तरह सोचना।', en: 'Thinking things through before acting.' },
    { hi: 'मीठा और साफ़ बोलना, और ध्यान से सुनना।', en: 'Speaking kindly and clearly, and listening well.' },
    { hi: 'बारीक बातों को ध्यान से देखना।', en: 'Looking closely at the details.' },
  ],
};

/** Fixed screen copy — titles, ledes and the four definitions. */
export const DASHA_GUIDE_COPY = {
  promise: {
    hi: 'पाँच छोटे चरण: पहले इस अवधि को समझिए, फिर जानिए क्या करें और क्यों।',
    en: 'Five short steps: understand the period first, then what to do and why.',
  },
  analogy: {
    hi: 'अपने जीवन को एक लम्बी पाठशाला समझिए, जिसमें नौ शिक्षक हैं — नौ ग्रह। हर ग्रह बारी-बारी से कुछ तय वर्षों तक पढ़ाता है। जिस ग्रह की बारी चल रही हो, उन वर्षों को उसकी महादशा कहते हैं।',
    en: 'Think of your life as a long school with nine teachers — the nine grahas. Each one teaches for a fixed number of years, one after another. The years of one graha’s turn are called its Mahadasha.',
  },
  howQ: { hi: 'ये तिथियाँ कैसे निकलती हैं?', en: 'How are these dates found?' },
  howA: {
    hi: 'आपके जन्म के समय चन्द्रमा जिस नक्षत्र में था, वहीं से गिनती शुरू होती है। यह अवधियों का कैलेंडर है — किसी घटना की भविष्यवाणी नहीं।',
    en: 'The count starts from the nakshatra the Moon was in when you were born. It is a calendar of periods — not a forecast of events.',
  },
  antarQ: { hi: 'इसके भीतर छोटे हिस्से भी होते हैं', en: 'Inside it are smaller parts' },
  antarA: {
    hi: 'हर महादशा नौ छोटी अवधियों में बँटी होती है, जिन्हें अन्तर्दशा कहते हैं।',
    en: 'Every Mahadasha is split into nine shorter periods called Antardashas.',
  },
  standsLede: {
    hi: 'पहले ग्रह को जानिए, फिर उसकी अवधि समझ आएगी।',
    en: 'Know the graha first; then its period makes sense.',
  },
  daanHelp: {
    hi: 'दान का अर्थ है किसी ज़रूरतमंद को देना — जितना आप चाहें, उतना।',
    en: 'Daan means giving to someone in need — as much or as little as you choose.',
  },
  sevaHelp: {
    hi: 'सेवा का अर्थ है बिना कुछ चाहे किसी की मदद करना।',
    en: 'Seva means helping without expecting anything back.',
  },
  mantraHelp: {
    hi: 'मंत्र कुछ पवित्र शब्द हैं, जिन्हें शांत मन से दोहराया जाता है।',
    en: 'A mantra is a few sacred words, repeated with a calm mind.',
  },
  dwaarHelp: {
    hi: 'इस वार के दान से जुड़े सेवा-क्षेत्र नीचे हैं। दान-पुण्य में इनके बारे में पढ़ें और सत्यापित संस्थाएँ देखें — ऐप कोई भुगतान नहीं लेता।',
    en: 'These are the causes this day’s daan serves. Read about them and see verified organisations in Daan-Punya — the app takes no payment.',
  },
  chartCaveat: {
    hi: 'यह आपकी कुंडली की एक प्रवृत्ति है — इसमें किसी तिथि या घटना का दावा नहीं।',
    en: 'This describes a tendency in your chart — it names no date and claims no event.',
  },
} as const satisfies Record<string, GuideLine>;
