import React, { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { navigationRef } from '@/notifications/deepLink';
import { startTargetToNavigateAction } from '@/navigation/startTarget';
import { EXPLORE_SECTIONS } from '@/data/discovery/sections';
import { resetExploreHistory, setExploreVisible } from '@/data/discovery/store';
import { useGitaLanguage } from '@/data/gita/language';
import { pick } from '@/utils/localize';
import ExploreSheet from './ExploreSheet';

/** Viewing replay never writes cadence; resetting history requires confirmation. */
export default function ExplorePreview({ onClose }: { onClose: () => void }) {
  const { lang } = useGitaLanguage();
  const mounted = useRef(true), resetInFlight = useRef(false);
  const [resetStatus, setResetStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
  useEffect(() => {
    mounted.current = true;
    setExploreVisible(true);
    return () => { mounted.current = false; setExploreVisible(false); };
  }, []);
  const [index, setIndex] = useState(0);
  const section = EXPLORE_SECTIONS[index];
  const next = () => {
    if (index + 1 < EXPLORE_SECTIONS.length) setIndex(index + 1);
    else onClose();
  };
  const reset = () => {
    if (resetInFlight.current) return;
    Alert.alert(
      pick(lang, { hi: 'देखे गए भागों का इतिहास मिटाएँ?', en: 'Reset visit history?', gu: 'જોયેલા વિભાગોનો ઇતિહાસ સાફ કરવો?', kn: 'ಭೇಟಿ ಇತಿಹಾಸವನ್ನು ತೆರವುಗೊಳಿಸಬೇಕೇ?', mr: 'पाहिलेल्या विभागांचा इतिहास पुसायचा?', te: 'సందర్శన చరిత్రను తొలగించాలా?' }),
      pick(lang, {
        hi: 'भागों को देखने और सुझावों को टालने का इतिहास मिटेगा। शुरुआती 24 घंटे की प्रतीक्षा भी हटेगी। आपकी साधना, प्रगति और रिमाइंडर सुरक्षित रहेंगे। प्रतिदिन एक पॉपअप की सीमा लागू रहेगी।',
        en: 'This clears section visits and suggestion cooldowns, including the initial 24-hour wait. Your practices, progress and reminders stay saved. The one-popup-per-day limit still applies.',
        gu: 'વિભાગોની મુલાકાતો અને સૂચનોનો વિરામ સાફ થશે, શરૂઆતની 24 કલાકની રાહ પણ દૂર થશે. તમારી સાધના, પ્રગતિ અને રિમાઇન્ડર સચવાશે. રોજ એક પોપઅપની મર્યાદા લાગુ રહેશે.',
        kn: 'ವಿಭಾಗಗಳ ಭೇಟಿ ಇತಿಹಾಸ, ಸಲಹೆಗಳ ವಿರಾಮ ಮತ್ತು ಆರಂಭದ 24 ಗಂಟೆಗಳ ಕಾಯುವಿಕೆ ತೆರವುಗೊಳ್ಳುತ್ತವೆ. ನಿಮ್ಮ ಸಾಧನೆ, ಪ್ರಗತಿ ಮತ್ತು ಜ್ಞಾಪನೆಗಳು ಉಳಿಯುತ್ತವೆ. ದಿನಕ್ಕೆ ಒಂದು ಪಾಪ್ಅಪ್ ಮಿತಿ ಅನ್ವಯಿಸುತ್ತದೆ.',
        mr: 'विभागांच्या भेटींचा आणि सूचनांच्या विरामाचा इतिहास पुसला जाईल, सुरुवातीची 24 तासांची प्रतीक्षाही हटेल. तुमची साधना, प्रगती आणि स्मरणपत्रे सुरक्षित राहतील. दिवसाला एका पॉपअपची मर्यादा लागू राहील.',
        te: 'విభాగాల సందర్శనలు, సూచనల విరామం మరియు ప్రారంభ 24 గంటల నిరీక్షణ తొలగిపోతాయి. మీ సాధన, ప్రగతి మరియు రిమైండర్‌లు భద్రంగా ఉంటాయి. రోజుకు ఒక పాపప్ పరిమితి వర్తిస్తుంది.',
      }),
      [
        { text: pick(lang, { hi: 'रद्द करें', en: 'Cancel', gu: 'રદ કરો', kn: 'ರದ್ದುಮಾಡಿ', mr: 'रद्द करा', te: 'రద్దు చేయండి' }), style: 'cancel' },
        { text: pick(lang, { hi: 'इतिहास मिटाएँ', en: 'Reset history', gu: 'ઇતિહાસ સાફ કરો', kn: 'ಇತಿಹಾಸ ತೆರವುಗೊಳಿಸಿ', mr: 'इतिहास पुसा', te: 'చరిత్రను తొలగించండి' }), style: 'destructive', onPress: async () => {
          if (!mounted.current || resetInFlight.current) return;
          resetInFlight.current = true;
          setResetStatus('saving');
          try {
            const saved = await resetExploreHistory();
            if (mounted.current) setResetStatus(saved ? 'done' : 'error');
          } catch {
            if (mounted.current) setResetStatus('error');
          } finally {
            // A failed store write fails automatic discovery closed, but this
            // explicit replay is still mounted and must block other prompts.
            if (mounted.current) setExploreVisible(true);
            resetInFlight.current = false;
          }
        } },
      ],
    );
  };
  const resetMessage = resetStatus === 'done' ? pick(lang, {
    hi: 'इतिहास मिट गया। ऐप पूरी तरह बंद करके उसके आइकन से फिर खोलें और होम पर रुकें। आज कोई पॉपअप दिख चुका है तो अगले दिन कोशिश करें। अन्य लॉन्च संदेश पहले आ सकते हैं।',
    en: 'History reset. Fully close Vedansh, reopen from its icon and stay on Home. If a popup already appeared today, try tomorrow. Other launch messages may take priority.',
    gu: 'ઇતિહાસ સાફ થયો. વેદાંશ સંપૂર્ણ બંધ કરી તેના આઇકનથી ફરી ખોલો અને હોમ પર રહો. આજે પોપઅપ દેખાયો હોય તો કાલે પ્રયાસ કરો. અન્ય સંદેશાઓને પ્રાથમિકતા મળી શકે છે.',
    kn: 'ಇತಿಹಾಸ ತೆರವುಗೊಂಡಿದೆ. ವೇದಾಂಶವನ್ನು ಸಂಪೂರ್ಣ ಮುಚ್ಚಿ, ಅದರ ಐಕಾನ್ ಮೂಲಕ ಮತ್ತೆ ತೆರೆದು ಹೋಮ್‌ನಲ್ಲಿ ಇರಿ. ಇಂದು ಪಾಪ್ಅಪ್ ಕಂಡಿದ್ದರೆ ನಾಳೆ ಪ್ರಯತ್ನಿಸಿ. ಇತರ ಆರಂಭಿಕ ಸಂದೇಶಗಳಿಗೆ ಆದ್ಯತೆ ಇರಬಹುದು.',
    mr: 'इतिहास पुसला गेला. वेदांश पूर्ण बंद करून त्याच्या आयकॉनवरून पुन्हा उघडा आणि होमवर थांबा. आज पॉपअप दिसला असेल तर उद्या प्रयत्न करा. इतर लॉन्च संदेश आधी येऊ शकतात.',
    te: 'చరిత్ర తొలగించబడింది. వేదాంశ్‌ను పూర్తిగా మూసివేసి, దాని ఐకాన్ నుండి మళ్లీ తెరిచి హోమ్‌లో ఉండండి. ఈరోజు పాపప్ కనిపించి ఉంటే రేపు ప్రయత్నించండి. ఇతర ప్రారంభ సందేశాలకు ప్రాధాన్యం ఉండవచ్చు.',
  }) : resetStatus === 'error' ? pick(lang, {
    hi: 'इतिहास मिटाया नहीं जा सका। ऐप फिर खोलकर दोबारा कोशिश करें।', en: 'Could not reset history. Reopen the app and try again.',
    gu: 'ઇતિહાસ સાફ થઈ શક્યો નહીં. એપ ફરી ખોલી પ્રયાસ કરો.', kn: 'ಇತಿಹಾಸ ತೆರವುಗೊಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಆ್ಯಪ್ ಮತ್ತೆ ತೆರೆದು ಪ್ರಯತ್ನಿಸಿ.', mr: 'इतिहास पुसता आला नाही. ॲप पुन्हा उघडून प्रयत्न करा.', te: 'చరిత్రను తొలగించలేకపోయాం. యాప్‌ను మళ్లీ తెరిచి ప్రయత్నించండి.',
  }) : undefined;
  return <ExploreSheet key={section.id} section={section} onDismiss={onClose} onNext={next} onReset={reset} resetting={resetStatus === 'saving'} resetMessage={resetMessage} onOpen={name => {
    onClose();
    const target = section.id === 'suvichar'
      ? { ...section.target, params: { exploreDraft: { name, deity: 'ram-darbar' } } }
      : section.target;
    navigationRef.dispatch(CommonActions.navigate(startTargetToNavigateAction(target)));
  }} />;
}

