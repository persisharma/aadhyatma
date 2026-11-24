import {
  authoredByLang,
  commentaryByLang,
  contentByLang,
  isDevanagariLang,
  isRescriptLang,
  meaningByLang,
  verseLinesByLang,
} from '../localize';
import { LANGUAGES, LANG_VALUES, scriptOf } from '@/data/gita/language';
import { storyText } from '@/data/kidsStories';
import { comicLanguage } from '@/data/comicBooks';
import { widgetLines, widgetLocale, widgetText } from '@/widgets/contract';

describe('Marathi and Telugu reading languages', () => {
  test('are registered with their own script and self-named labels', () => {
    expect(LANG_VALUES).toEqual(['hi', 'en', 'gu', 'kn', 'mr', 'te']);
    expect(scriptOf('mr')).toBe('devanagari');
    expect(scriptOf('te')).toBe('telugu');
    expect(LANGUAGES.find((l) => l.value === 'mr')?.nativeLabel).toBe('मराठी');
    expect(LANGUAGES.find((l) => l.value === 'te')?.nativeLabel).toBe('తెలుగు');
  });

  test('script classification', () => {
    expect(isDevanagariLang('mr')).toBe(true);
    expect(isDevanagariLang('te')).toBe(false);
    expect(isRescriptLang('te')).toBe(true);
    expect(isRescriptLang('mr')).toBe(false);
  });

  test('content strings: mr keeps the Devanagari, te re-scripts it', () => {
    expect(contentByLang('mr', 'हनुमान चालीसा', 'Hanuman Chalisa')).toBe('हनुमान चालीसा');
    expect(contentByLang('te', 'हनुमान चालीसा', 'Hanuman Chalisa')).toBe('హనుమాన చాలీసా');
  });

  test('verse lines: mr reads the Devanagari lines, te re-scripts them (never the romanization)', () => {
    const deva = ['जय हनुमान ज्ञान गुण सागर'];
    const latin = ['jaya hanumāna jñāna guṇa sāgara'];
    expect(verseLinesByLang('mr', deva, latin)).toEqual(deva);
    expect(verseLinesByLang('te', deva, latin)).toEqual(['జయ హనుమాన జ్ఞాన గుణ సాగర']);
  });

  test('meaning prefers verified native prose, else falls back by script', () => {
    expect(meaningByLang('mr', 'अर्थ', 'meaning')).toBe('अर्थ');
    expect(meaningByLang('te', 'अर्थ', 'meaning')).toBe('అర్థ');
    expect(meaningByLang('mr', 'अर्थ', 'meaning', { mr: 'मराठी अर्थ' })).toBe('मराठी अर्थ');
    expect(meaningByLang('te', 'अर्थ', 'meaning', { te: 'తెలుగు అర్థం' })).toBe('తెలుగు అర్థం');
    expect(meaningByLang('te', 'अर्थ', 'meaning', { te: '' })).toBe('అర్థ');
    expect(commentaryByLang('te', ['राम'], ['Rama'])).toEqual(['రామ']);
    expect(commentaryByLang('mr', ['राम'], ['Rama'])).toEqual(['राम']);
  });

  test('authored labels: explicit mr/te win, else Hindi (mr) or re-scripted Hindi (te)', () => {
    const s = { hi: 'बालकाण्ड', en: 'Bala Kanda', gu: 'બાલકાંડ', kn: 'ಬಾಲಕಾಂಡ' };
    expect(authoredByLang('mr', s)).toBe('बालकाण्ड');
    expect(authoredByLang('te', s)).toBe('బాలకాణ్డ');
    expect(authoredByLang('te', { ...s, te: 'బాలకాండ' })).toBe('బాలకాండ');
    expect(authoredByLang('kn', s)).toBe('ಬಾಲಕಾಂಡ');
  });

  test('kids-story narrative falls back to authored text, never re-scripted Hindi', () => {
    const text = { hi: 'कृष्ण का जन्म', en: 'Krishna is born', gu: 'કૃષ્ણનો જન્મ', kn: 'ಕೃಷ್ಣನ ಜನನ' };
    expect(storyText(text, 'mr')).toBe('कृष्ण का जन्म');
    expect(storyText(text, 'te')).toBe('Krishna is born');
    expect(storyText({ ...text, te: 'కృష్ణుని జననం' }, 'te')).toBe('కృష్ణుని జననం');
  });

  test('comics read an authored edition: mr → Hindi, te → English', () => {
    expect(comicLanguage('mr')).toBe('hi');
    expect(comicLanguage('te')).toBe('en');
    expect(comicLanguage('kn')).toBe('kn');
  });

  test('native widget payload stays on its four validated locales', () => {
    expect(widgetLocale('mr')).toBe('hi');
    expect(widgetLocale('te')).toBe('hi');
    expect(widgetLocale('gu')).toBe('gu');
    const v = { hi: 'आज का श्लोक', en: "Today's verse", gu: 'આજનો શ્લોક', kn: 'ಇಂದಿನ ಶ್ಲೋಕ' };
    expect(widgetText(v, 'mr')).toBe('आज का श्लोक');
    expect(widgetText(v, 'te')).toBe('ఆజ కా శ్లోక');
    expect(widgetLines({ hi: ['राम'], en: ['Rama'], gu: ['રામ'], kn: ['ರಾಮ'] }, 'te')).toEqual(['రామ']);
  });
});
