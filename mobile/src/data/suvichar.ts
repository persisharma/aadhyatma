import { assetBaseUrl, remoteAssetRequest } from './assetManifest';
import manifest from './suvicharManifest.json';

export const suvicharDeities = [
  {
    "id": "krishna",
    "hi": "श्रीकृष्ण",
    "en": "Shri Krishna"
  },
  {
    "id": "rama",
    "hi": "श्रीराम",
    "en": "Shri Ram"
  },
  {
    "id": "hanuman",
    "hi": "श्रीहनुमान",
    "en": "Shri Hanuman"
  },
  {
    "id": "shiva",
    "hi": "भगवान शिव",
    "en": "Bhagwan Shiva"
  },
  {
    "id": "ganesha",
    "hi": "श्रीगणेश",
    "en": "Shri Ganesh"
  },
  {
    "id": "durga",
    "hi": "माँ दुर्गा",
    "en": "Maa Durga"
  },
  {
    "id": "lakshmi",
    "hi": "माँ लक्ष्मी",
    "en": "Maa Lakshmi"
  },
  {
    "id": "saraswati",
    "hi": "माँ सरस्वती",
    "en": "Maa Saraswati"
  },
  {
    "id": "vishnu",
    "hi": "भगवान विष्णु",
    "en": "Bhagwan Vishnu"
  },
  {
    "id": "radha-krishna",
    "hi": "राधा–कृष्ण",
    "en": "Radha–Krishna"
  },
  {
    "id": "ram-darbar",
    "hi": "राम दरबार",
    "en": "Ram Darbar"
  },
  {
    "id": "salasar-balaji",
    "hi": "सालासर बालाजी दरबार",
    "en": "Salasar Balaji"
  },
  {
    "id": "khatu-shyam",
    "hi": "खाटू श्याम जी",
    "en": "Khatu Shyam ji"
  },
  {
    "id": "tirupati-balaji",
    "hi": "तिरुपति बालाजी",
    "en": "Tirupati Balaji"
  },
  { "id": "sanwariya-seth", "hi": "सांवरिया सेठ", "en": "Sanwariya Seth" },
  { "id": "jagannath", "hi": "भगवान जगन्नाथ", "en": "Lord Jagannath" }
] as const;
export const suvicharFrames = [
  {
    "id": "mandir-jharokha",
    "hi": "मंदिर झरोखा",
    "en": "Temple arch"
  },
  {
    "id": "pushp-aangan",
    "hi": "पुष्प आँगन",
    "en": "Lotus garden"
  },
  {
    "id": "bhakti-patra",
    "hi": "भक्ति पत्र",
    "en": "Devotional letter"
  }
] as const;
export type SuvicharDeity = typeof suvicharDeities[number]['id'];
export type SuvicharFrame = typeof suvicharFrames[number]['id'];
export const NAME_LIMIT = 48;
export const MESSAGE_LIMIT = 280;
/** Preserve user script and combining marks. Only remove line breaks/control characters. */
export function cleanSender(value: string): string {
  return value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
}
/** `vaar` marks a weekday card: its title is always the current day's, so a saved card never names a past day. */
export type SuvicharFavorite = { deity: SuvicharDeity; frame: SuvicharFrame; message: string; name: string; vaar?: true };
export const initialSuvichar = { deity: 'krishna' as SuvicharDeity, frame: 'mandir-jharokha' as SuvicharFrame,
  name: '', message: '', vaar: false, favorites: [] as SuvicharFavorite[] };
export type SuvicharPreferences = typeof initialSuvichar;
export function parseSuvicharPreferences(raw: string | null): SuvicharPreferences {
  try {
    const p = JSON.parse(raw ?? '{}');
    return {
      deity: suvicharDeities.some(d => d.id === p.deity) ? p.deity : initialSuvichar.deity,
      frame: suvicharFrames.some(f => f.id === p.frame) ? p.frame : initialSuvichar.frame,
      name: typeof p.name === 'string' ? p.name.slice(0, NAME_LIMIT) : '',
      message: typeof p.message === 'string' ? p.message.slice(0, MESSAGE_LIMIT) : '',
      vaar: p.vaar === true,
      favorites: Array.isArray(p.favorites) ? p.favorites.filter((f: SuvicharFavorite) => f &&
        suvicharDeities.some(d => d.id === f.deity) && suvicharFrames.some(s => s.id === f.frame) &&
        typeof f.name === 'string' && f.name.length <= NAME_LIMIT && typeof f.message === 'string' &&
        f.message.length <= MESSAGE_LIMIT).slice(0, 50).map((f: SuvicharFavorite) => ({ deity: f.deity, frame: f.frame, message: f.message, name: f.name, ...(f.vaar === true ? { vaar: true as const } : {}) })) : [],
    };
  } catch { return { ...initialSuvichar, favorites: [] }; }
}
export function suvicharArtKey(deity: SuvicharDeity, frame: SuvicharFrame): string { return `${deity}--${frame}`; }
/** Only published and byte-verified assets belong in the runtime manifest. No deity fallback. */
export function suvicharArtRequest(deity: SuvicharDeity, frame: SuvicharFrame) {
  return remoteAssetRequest(manifest, suvicharArtKey(deity, frame), assetBaseUrl());
}
/** Newly authored reflection, never presented as a scripture quotation. */
export const defaultSuvichar = { hi: 'मन में श्रद्धा, वाणी में मधुरता और कर्म में सेवा रखिए। हर दिन सुंदर बन जाएगा।',
  en: 'Let faith guide your heart, kindness guide your words, and service guide your actions. Each day will grow brighter.' };

/** Reusable authored wishes. Occasion selection is explicit; never infer lunar festival dates. */
export const suvicharWishes = [
  { id: 'morning', hi: 'सुप्रभात', en: 'Good morning', deity: 'krishna', messageHi: 'सुप्रभात! आपका दिन प्रेम, शांति और अच्छे कर्मों से भरा रहे।', messageEn: 'Good morning! May your day be filled with love, peace and kind deeds.' },
  { id: 'diwali', hi: 'दीपावली', en: 'Diwali', deity: 'lakshmi', messageHi: 'दीपावली की हार्दिक शुभकामनाएँ। आपके घर में सुख, सद्भाव और समृद्धि का प्रकाश बना रहे।', messageEn: 'Happy Diwali! May your home shine with happiness, harmony and prosperity.' },
  { id: 'holi', hi: 'होली', en: 'Holi', deity: 'radha-krishna', messageHi: 'होली की शुभकामनाएँ। प्रेम के रंग आपके रिश्तों में मिठास और जीवन में आनंद भर दें।', messageEn: 'Happy Holi! May the colours of love bring sweetness to your relationships and joy to your life.' },
  { id: 'ram-navami', hi: 'राम नवमी', en: 'Ram Navami', deity: 'ram-darbar', messageHi: 'राम नवमी की शुभकामनाएँ। श्रीराम की कृपा से आपके परिवार में प्रेम, साहस और सद्भाव बना रहे।', messageEn: 'Happy Ram Navami! May Shri Ram bless your family with love, courage and harmony.' },
  { id: 'janmashtami', hi: 'जन्माष्टमी', en: 'Janmashtami', deity: 'krishna', messageHi: 'जन्माष्टमी की शुभकामनाएँ। श्रीकृष्ण की कृपा आपके घर में आनंद और मन में प्रेम भर दे।', messageEn: 'Happy Janmashtami! May Shri Krishna fill your home with joy and your heart with love.' },
  { id: 'shivratri', hi: 'महाशिवरात्रि', en: 'Mahashivratri', deity: 'shiva', messageHi: 'महाशिवरात्रि की शुभकामनाएँ। महादेव की कृपा से मन शांत और जीवन मंगलमय रहे।', messageEn: 'Wishing you a blessed Mahashivratri. May Mahadev bring peace to your heart and blessings to your life.' },
  { id: 'navratri', hi: 'नवरात्रि', en: 'Navratri', deity: 'durga', messageHi: 'नवरात्रि की हार्दिक शुभकामनाएँ। माँ दुर्गा आपके परिवार को शक्ति, साहस और सुख प्रदान करें।', messageEn: 'Happy Navratri! May Maa Durga bless your family with strength, courage and happiness.' },
] as const;

/** Starter reflections authored for sharing; these are not scripture quotations. */
export const suvicharReflections = [
  {
    "hi": "हर सुबह एक नया अवसर है। आज किसी के जीवन में थोड़ी खुशी जोड़िए।",
    "en": "Every morning offers a new beginning. Bring a little happiness to someone today."
  },
  {
    "hi": "श्रद्धा मन को सहारा देती है, सेवा जीवन को अर्थ देती है।",
    "en": "Faith steadies the heart; service gives life meaning."
  },
  {
    "hi": "छोटी-सी दया भी किसी का पूरा दिन सुंदर बना सकती है।",
    "en": "One small kindness can brighten someone’s whole day."
  },
  {
    "hi": "अपने कर्म में ईमानदारी रखिए और अपने व्यवहार में विनम्रता।",
    "en": "Bring honesty to your work and humility to your conduct."
  },
  {
    "hi": "मन को शांत करने के लिए थोड़ा ठहरिए, थोड़ा सुनिए और थोड़ा मुस्कुराइए।",
    "en": "Pause, listen and smile. Give your heart a moment of peace."
  },
  {
    "hi": "अपनों के लिए समय निकालिए। स्नेह का सबसे सुंदर उपहार आपका साथ है।",
    "en": "Make time for those you love. Your presence is a beautiful gift."
  },
  {
    "hi": "किसी की सहायता के लिए बड़ा अवसर नहीं, संवेदनशील मन चाहिए।",
    "en": "Helping someone begins with a caring heart."
  },
  {
    "hi": "आज जो अच्छा कर सकते हैं, उसे कल के लिए मत टालिए।",
    "en": "Do the good you can today. Let kindness begin now."
  },
  {
    "hi": "वाणी में मिठास रखिए। कोमल शब्द रिश्तों को सहेजते हैं।",
    "en": "Speak gently. Kind words help relationships flourish."
  },
  {
    "hi": "हर दिन कुछ सीखिए और हर दिन थोड़ा प्रेम बाँटिए।",
    "en": "Learn a little and share a little love every day."
  },
  {
    "hi": "प्रार्थना में शांति खोजिए और कर्म में अपना उत्तर।",
    "en": "Seek peace in prayer and purpose in your actions."
  },
  {
    "hi": "धैर्य रखिए। छोटे-छोटे सच्चे प्रयास भी आगे बढ़ाते हैं।",
    "en": "Be patient. Small, sincere efforts help you move forward."
  },
  {
    "hi": "कृतज्ञता का एक क्षण साधारण दिन को भी खास बना देता है।",
    "en": "A moment of gratitude can make an ordinary day feel special."
  },
  {
    "hi": "दूसरों की बात ध्यान से सुनना भी सेवा का एक सुंदर रूप है।",
    "en": "Listening with care is a beautiful form of service."
  },
  {
    "hi": "अपने घर को प्रेम से भरिए। सुख की शुरुआत अपनापन महसूस करने से होती है।",
    "en": "Fill your home with love. Happiness begins with a sense of belonging."
  },
  {
    "hi": "भक्ति के साथ करुणा जोड़िए। किसी का दुःख समझना भी साधना है।",
    "en": "Let compassion accompany devotion. Understanding another’s sorrow is a practice of care."
  },
  {
    "hi": "अच्छे विचारों को अच्छे कर्मों में बदलने की शुरुआत आज से कीजिए।",
    "en": "Begin turning good thoughts into kind actions today."
  },
  {
    "hi": "तुलना से थोड़ा दूर रहिए। अपने जीवन में मिली छोटी खुशियों को पहचानिए।",
    "en": "Step back from comparison and notice the small joys in your own life."
  },
  {
    "hi": "सच्चे मन से किया गया छोटा कार्य भी मूल्यवान होता है।",
    "en": "Even a small act has value when it comes from a sincere heart."
  },
  {
    "hi": "दिन की शुरुआत शुभ भावना से और अंत कृतज्ञता से कीजिए।",
    "en": "Begin the day with goodwill and end it with gratitude."
  }
] as const;

/** Reviewed painting-to-paper bounds; floral scenes and the tall Tirupati shrine need more room. */
export function suvicharHeroFraction(deity: SuvicharDeity, frame: SuvicharFrame): number {
  return frame === 'pushp-aangan' ? .64 : deity === 'tirupati-balaji' && frame === 'mandir-jharokha' ? .62 : .60;
}

/**
 * Painted footer strip, as fractions of master height, measured on all 14 masters per frame:
 * `start` sits just above the divider rule, the text window between the rule and the bottom border.
 * The card renders this slice unstretched so the footer line never crosses painted rules.
 */
export function suvicharFooterBand(frame: SuvicharFrame): { start: number; textTop: number; textBottom: number } {
  return frame === 'mandir-jharokha' ? { start: .908, textTop: .92, textBottom: .982 }
    : frame === 'pushp-aangan' ? { start: .898, textTop: .909, textBottom: .979 }
    : { start: .891, textTop: .904, textBottom: .972 };
}

/**
 * Blank top space each frame paints for the brand badge (fractions of master height, measured on all 14 masters);
 * the badge centres in it: the jharokha cartouche, the floral frame's paper band, and the letter frame's margin,
 * whose rule (≈ .031) the opaque badge covers. Slots leave room above the badge and end above the painting.
 */
export function suvicharBrandSlot(frame: SuvicharFrame): { top: number; bottom: number } {
  return frame === 'mandir-jharokha' ? { top: .008, bottom: .076 }
    : frame === 'pushp-aangan' ? { top: .01, bottom: .058 }
    : { top: .01, bottom: .058 };
}

