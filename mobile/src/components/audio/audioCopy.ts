import type { Lang } from '@/data/gita/language';
import type { PlaybackNotice } from '@/contexts/AudioPlayerContext';
import { pick } from '@/utils/localize';

/** Why the current track is silent, in the reading language. */
export function playbackNoticeText(lang: Lang, notice: PlaybackNotice): string {
  return notice === 'noAudio'
    ? pick(lang, {
        hi: 'इस ट्रैक का ऑडियो अभी उपलब्ध नहीं है',
        en: 'Audio for this track isn’t available yet',
        gu: 'આ ટ્રૅકનું ઑડિયો હજી ઉપલબ્ધ નથી',
        kn: 'ಈ ಟ್ರ್ಯಾಕ್‌ನ ಆಡಿಯೋ ಇನ್ನೂ ಲಭ್ಯವಿಲ್ಲ',
        mr: 'या ट्रॅकचा ऑडिओ अजून उपलब्ध नाही',
        te: 'ఈ ట్రాక్ ఆడియో ఇంకా అందుబాటులో లేదు',
      })
    : pick(lang, {
        hi: 'यह ट्रैक लोड नहीं हो सका। कनेक्शन जाँचकर फिर प्रयास करें',
        en: 'Couldn’t load this track. Check your connection and try again',
        gu: 'ટ્રૅક લોડ થઈ શક્યો નહીં. કનેક્શન તપાસીને ફરી પ્રયાસ કરો',
        kn: 'ಟ್ರ್ಯಾಕ್ ಲೋಡ್ ಆಗಲಿಲ್ಲ. ಸಂಪರ್ಕ ಪರಿಶೀಲಿಸಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
        mr: 'हा ट्रॅक लोड होऊ शकला नाही. कनेक्शन तपासून पुन्हा प्रयत्न करा',
        te: 'ట్రాక్ లోడ్ కాలేదు. కనెక్షన్ తనిఖీ చేసి మళ్లీ ప్రయత్నించండి',
      });
}

export function retryLabel(lang: Lang): string {
  return pick(lang, { hi: 'पुनः प्रयास', en: 'Retry', gu: 'ફરી પ્રયાસ', kn: 'ಮರುಪ್ರಯತ್ನ', mr: 'पुन्हा प्रयत्न', te: 'మళ్లీ ప్రయత్నించండి' });
}

/**
 * Now Playing control labels. The play/pause button is deliberately NOT here: its
 * English "Play"/"Pause"/"Loading" label is the Maestro contract shared with the
 * mini-player (bhajan-audio-smoke.yaml), as with the read-aloud pill.
 */
export function nowPlayingLabels(lang: Lang, skipSeconds: number) {
  return {
    minimize: pick(lang, { hi: 'प्लेयर छोटा करें', en: 'Minimize player', gu: 'પ્લેયર નાનું કરો', kn: 'ಪ್ಲೇಯರ್ ಚಿಕ್ಕದಾಗಿಸಿ', mr: 'प्लेअर लहान करा', te: 'ప్లేయర్‌ను చిన్నది చేయండి' }),
    seek: pick(lang, { hi: 'ट्रैक में आगे-पीछे जाएँ', en: 'Seek', gu: 'ટ્રૅકમાં આગળ-પાછળ જાઓ', kn: 'ಟ್ರ್ಯಾಕ್‌ನಲ್ಲಿ ಮುಂದೆ-ಹಿಂದೆ ಹೋಗಿ', mr: 'ट्रॅकमध्ये पुढे-मागे जा', te: 'ట్రాక్‌లో ముందుకు-వెనక్కి వెళ్లండి' }),
    rewind: pick(lang, {
      hi: `${skipSeconds} सेकंड पीछे`,
      en: `Rewind ${skipSeconds} seconds`,
      gu: `${skipSeconds} સેકન્ડ પાછળ`,
      kn: `${skipSeconds} ಸೆಕೆಂಡ್ ಹಿಂದೆ`,
      mr: `${skipSeconds} सेकंद मागे`,
      te: `${skipSeconds} సెకన్లు వెనక్కి`,
    }),
    forward: pick(lang, {
      hi: `${skipSeconds} सेकंड आगे`,
      en: `Forward ${skipSeconds} seconds`,
      gu: `${skipSeconds} સેકન્ડ આગળ`,
      kn: `${skipSeconds} ಸೆಕೆಂಡ್ ಮುಂದೆ`,
      mr: `${skipSeconds} सेकंद पुढे`,
      te: `${skipSeconds} సెకన్లు ముందుకు`,
    }),
    previous: pick(lang, { hi: 'पिछला ट्रैक', en: 'Previous track', gu: 'પાછલો ટ્રૅક', kn: 'ಹಿಂದಿನ ಟ್ರ್ಯಾಕ್', mr: 'मागील ट्रॅक', te: 'మునుపటి ట్రాక్' }),
    next: pick(lang, { hi: 'अगला ट्रैक', en: 'Next track', gu: 'આગલો ટ્રૅક', kn: 'ಮುಂದಿನ ಟ್ರ್ಯಾಕ್', mr: 'पुढील ट्रॅक', te: 'తదుపరి ట్రాక్' }),
    loop: pick(lang, { hi: 'दोहराना चालू/बंद करें', en: 'Toggle loop', gu: 'પુનરાવર્તન ચાલુ/બંધ કરો', kn: 'ಪುನರಾವರ್ತನೆ ಆನ್/ಆಫ್ ಮಾಡಿ', mr: 'पुनरावृत्ती चालू/बंद करा', te: 'పునరావృతం ఆన్/ఆఫ్ చేయండి' }),
  };
}
