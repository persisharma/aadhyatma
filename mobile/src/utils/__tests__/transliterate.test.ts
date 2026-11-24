import { toGujarati, toKannada, toTelugu, transliterateDevanagari } from '../transliterate';

/**
 * Golden pairs verified against standard Brahmi-script correspondence (the same
 * mapping Aksharamukha/ITRANS use). The engine must be a pure codepoint map:
 * non-Devanagari input passes through untouched.
 */

describe('toGujarati', () => {
  test('section titles (Sanskrit proper nouns)', () => {
    expect(toGujarati('भगवद् गीता')).toBe('ભગવદ્ ગીતા');
    expect(toGujarati('हनुमान चालीसा')).toBe('હનુમાન ચાલીસા');
    expect(toGujarati('सुन्दरकाण्ड')).toBe('સુન્દરકાણ્ડ');
  });

  test('verse line with conjuncts (Gita 1.1 opening)', () => {
    expect(toGujarati('धृतराष्ट्र उवाच')).toBe('ધૃતરાષ્ટ્ર ઉવાચ');
  });

  test('Awadhi chaupai (Hanuman Chalisa)', () => {
    expect(toGujarati('जय हनुमान ज्ञान गुण सागर')).toBe('જય હનુમાન જ્ઞાન ગુણ સાગર');
  });

  test('om ligature maps to Gujarati om', () => {
    expect(toGujarati('ॐ नमः शिवाय')).toBe('ૐ નમઃ શિવાય');
  });

  test('pill label with Devanagari digits and middle dot', () => {
    expect(toGujarati('श्लोक · १.१')).toBe('શ્લોક · ૧.૧');
    expect(toGujarati('चौपाई · ९')).toBe('ચૌપાઈ · ૯');
  });

  test('candrabindu \u2192 \u0A81 and nukta \u2192 \u0ABC preserved (Gujarati has both)', () => {
    expect(toGujarati('\u0906\u0901\u0917\u0928')).toBe('\u0A86\u0A81\u0A97\u0AA8'); // candrabindu \u0901 \u2192 \u0A81
    expect(toGujarati('\u095B\u0930\u093E')).toBe('\u0A9C\u0ABC\u0AB0\u0ABE'); // precomposed \u095B \u2192 \u0A9C + nukta
    expect(toGujarati('\u091C\u093C\u0930\u093E')).toBe('\u0A9C\u0ABC\u0AB0\u0ABE'); // decomposed \u2192 same
    expect(toGujarati('\u095D\u0947\u0902')).toBe('\u0AA2\u0ABC\u0AC7\u0A82'); // precomposed \u095D \u2192 \u0AA2 + nukta
  });

  test('dandas and Vedic punctuation pass through', () => {
    expect(toGujarati('महावीर विक्रम बजरंगी ॥')).toBe('મહાવીર વિક્રમ બજરંગી ॥');
    expect(toGujarati('सीतावर रामचन्द्र पद जय शरणं ।')).toBe('સીતાવર રામચન્દ્ર પદ જય શરણં ।');
  });

  test('mixed Latin/Devanagari strings convert only the Devanagari', () => {
    expect(toGujarati('Vedansh ऐप पर पढ़ें: https://x')).toBe('Vedansh ઐપ પર પઢ઼ેં: https://x');
  });
});

describe('toKannada', () => {
  test('section titles', () => {
    expect(toKannada('भगवद् गीता')).toBe('ಭಗವದ್ ಗೀತಾ');
    expect(toKannada('हनुमान चालीसा')).toBe('ಹನುಮಾನ ಚಾಲೀಸಾ');
  });

  test('verse line with conjuncts', () => {
    expect(toKannada('धृतराष्ट्र उवाच')).toBe('ಧೃತರಾಷ್ಟ್ರ ಉವಾಚ');
  });

  test('Awadhi chaupai', () => {
    expect(toKannada('जय हनुमान ज्ञान गुण सागर')).toBe('ಜಯ ಹನುಮಾನ ಜ್ಞಾನ ಗುಣ ಸಾಗರ');
  });

  test('om expands to O + anusvara (no single Kannada om codepoint)', () => {
    expect(toKannada('ॐ नमः शिवाय')).toBe('ಓಂ ನಮಃ ಶಿವಾಯ');
  });

  test('pill label with Devanagari digits', () => {
    expect(toKannada('श्लोक · १.१')).toBe('ಶ್ಲೋಕ · ೧.೧');
  });

  test('candrabindu \u2192 \u0C81 and nukta \u2192 \u0CBC preserved (faithful, matches sanscript)', () => {
    expect(toKannada('\u0906\u0901\u0917\u0928')).toBe('\u0C86\u0C81\u0C97\u0CA8'); // candrabindu \u0901 \u2192 \u0C81 (not anusvara)
    expect(toKannada('\u095B\u0930\u093E')).toBe('\u0C9C\u0CBC\u0CB0\u0CBE'); // precomposed \u095B \u2192 \u0C9C + nukta
    expect(toKannada('\u091C\u093C\u0930\u093E')).toBe('\u0C9C\u0CBC\u0CB0\u0CBE'); // decomposed \u2192 same
    expect(toKannada('\u095D\u0947\u0902')).toBe('\u0CA2\u0CBC\u0CC7\u0C82'); // precomposed \u095D \u2192 \u0CA2 + nukta
  });

  test('panchang Sanskrit terms', () => {
    expect(toKannada('प्रतिपदा')).toBe('ಪ್ರತಿಪದಾ');
    expect(toKannada('रविवार')).toBe('ರವಿವಾರ');
    expect(toKannada('पूर्णिमा')).toBe('ಪೂರ್ಣಿಮಾ');
  });

  test('dandas pass through', () => {
    expect(toKannada('सागर ॥')).toBe('ಸಾಗರ ॥');
  });

  test('mixed Latin/Devanagari strings convert only the Devanagari', () => {
    expect(toKannada('Read on Vedansh: ऐप')).toBe('Read on Vedansh: ಐಪ');
  });
});

describe('shared properties', () => {
  test('non-Devanagari input is returned unchanged (idempotence on own output)', () => {
    const gu = toGujarati('जय श्री राम');
    const kn = toKannada('जय श्री राम');
    expect(toGujarati(gu)).toBe(gu);
    expect(toKannada(kn)).toBe(kn);
    expect(toGujarati('Hanuman Chalisa 108')).toBe('Hanuman Chalisa 108');
    expect(toKannada('Hanuman Chalisa 108')).toBe('Hanuman Chalisa 108');
    expect(toGujarati('')).toBe('');
    expect(toKannada('')).toBe('');
  });

  test('transliterateDevanagari dispatches by target script', () => {
    expect(transliterateDevanagari('राम', 'gu')).toBe('રામ');
    expect(transliterateDevanagari('राम', 'kn')).toBe('ರಾಮ');
  });

  test('every Devanagari char in real corpus lines maps (no Devanagari residue)', () => {
    const lines = [
      'श्रीगुरु चरन सरोज रज निज मनु मुकुरु सुधारि',
      'बरनउँ रघुबर बिमल जसु जो दायकु फल चारि',
      'नमस्ते सदा वत्सले मातृभूमे',
      'त्वमेव माता च पिता त्वमेव',
    ];
    const deva = /[ऀ-ॣ०-ॿ]/; // Devanagari minus the two dandas
    for (const line of lines) {
      expect(toGujarati(line)).not.toMatch(deva);
      expect(toKannada(line)).not.toMatch(deva);
    }
  });
});

describe('toTelugu', () => {
  test('section titles', () => {
    expect(toTelugu('भगवद् गीता')).toBe('భగవద్ గీతా');
    expect(toTelugu('हनुमान चालीसा')).toBe('హనుమాన చాలీసా');
    expect(toTelugu('सुन्दरकाण्ड')).toBe('సున్దరకాణ్డ');
  });

  test('verse line with conjuncts (Gita 1.1 opening)', () => {
    expect(toTelugu('धृतराष्ट्र उवाच')).toBe('ధృతరాష్ట్ర ఉవాచ');
  });

  test('Awadhi chaupai (Hanuman Chalisa)', () => {
    expect(toTelugu('जय हनुमान ज्ञान गुण सागर')).toBe('జయ హనుమాన జ్ఞాన గుణ సాగర');
  });

  test('om has no single Telugu codepoint → O + anusvara', () => {
    expect(toTelugu('ॐ नमः शिवाय')).toBe('ఓం నమః శివాయ');
  });

  test('Devanagari ए/ओ (long) map to long ఏ/ఓ; short ऎ/ऒ to short ఎ/ఒ', () => {
    expect(toTelugu('एक')).toBe('ఏక');
    expect(toTelugu('ओज')).toBe('ఓజ');
    expect(toTelugu('\u090E\u0912')).toBe('\u0C0E\u0C12');
    expect(toTelugu('मे')).toBe('మే');
  });

  test('candrabindu → ఁ and nukta → ఼ (precomposed decomposes)', () => {
    expect(toTelugu('\u0906\u0901\u0917\u0928')).toBe('\u0C06\u0C01\u0C17\u0C28');
    expect(toTelugu('\u095B\u0930\u093E')).toBe('\u0C1C\u0C3C\u0C30\u0C3E');
    expect(toTelugu('\u091C\u093C\u0930\u093E')).toBe('\u0C1C\u0C3C\u0C30\u0C3E');
    expect(toTelugu('पड़ी')).toBe('పడ఼ీ');
  });

  test('digits, dandas and mixed Latin', () => {
    expect(toTelugu('श्लोक · १.१')).toBe('శ్లోక · ౧.౧');
    expect(toTelugu('महावीर विक्रम बजरंगी ॥')).toBe('మహావీర విక్రమ బజరంగీ ॥');
    expect(toTelugu('Vedansh ऐप')).toBe('Vedansh ఐప');
  });

  test('idempotent on own output and passes non-Devanagari through', () => {
    const te = toTelugu('जय श्री राम');
    expect(toTelugu(te)).toBe(te);
    expect(toTelugu('Hanuman Chalisa 108')).toBe('Hanuman Chalisa 108');
    expect(toTelugu('')).toBe('');
  });

  test('no Devanagari residue on real corpus lines', () => {
    const deva = /[ऀ-ॣ०-ॿ]/;
    for (const line of ['श्रीगुरु चरन सरोज रज निज मनु मुकुरु सुधारि', 'बरनउँ रघुबर बिमल जसु जो दायकु फल चारि', 'त्वमेव माता च पिता त्वमेव']) {
      expect(toTelugu(line)).not.toMatch(deva);
    }
  });
});

describe('transliterateDevanagari for the newer reading languages', () => {
  test('te re-scripts; mr is the identity (Marathi is Devanagari)', () => {
    expect(transliterateDevanagari('राम', 'te')).toBe('రామ');
    expect(transliterateDevanagari('राम', 'mr')).toBe('राम');
    expect(transliterateDevanagari('श्रीगणेशाय नमः', 'mr')).toBe('श्रीगणेशाय नमः');
  });
});
