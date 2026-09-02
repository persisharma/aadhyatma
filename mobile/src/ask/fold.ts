/**
 * Query folding for जिज्ञासा (PRD-41 §13.1).
 *
 * Devanagari, IAST and Latin/Hinglish all fold to ONE ASCII key so the two
 * halves of the lexicon — and the user's typing — can meet. Pure, no I/O.
 *
 * The two things that broke the first spike, both pinned by `fold.test.ts`:
 *  - Devanagari is an abugida: a bare consonant carries an inherent "a".
 *    Skip it and मंदिर folds to `mndir`, which never matches `mandir`.
 *  - Hindi deletes the WORD-FINAL inherent vowel; Sanskrit keeps it. मंदिर =
 *    `mandir`, but दिशा = `disha` (that final ā is written, not inherent).
 *    Anusvara/visarga do not suppress the inherent vowel — मं = `man`.
 */

const DEVA: Readonly<Record<string, string>> = {
  क: 'k', ख: 'kh', ग: 'g', घ: 'gh', ङ: 'n', च: 'ch', छ: 'chh', ज: 'j', झ: 'jh', ञ: 'n',
  ट: 't', ठ: 'th', ड: 'd', ढ: 'dh', ण: 'n', त: 't', थ: 'th', द: 'd', ध: 'dh', न: 'n',
  प: 'p', फ: 'ph', ब: 'b', भ: 'bh', म: 'm', य: 'y', र: 'r', ल: 'l', व: 'v', श: 'sh',
  ष: 'sh', स: 's', ह: 'h', ळ: 'l',
  // nukta forms
  क़: 'k', ख़: 'kh', ग़: 'g', ज़: 'j', ड़: 'd', ढ़: 'dh', फ़: 'ph', य़: 'y',
  अ: 'a', आ: 'a', इ: 'i', ई: 'i', उ: 'u', ऊ: 'u', ऋ: 'ri', ए: 'e', ऐ: 'ai', ओ: 'o', औ: 'au',
  ऑ: 'o', ऍ: 'e',
  'ा': 'a', 'ि': 'i', 'ी': 'i', 'ु': 'u', 'ू': 'u', 'ृ': 'ri', 'े': 'e', 'ै': 'ai', 'ो': 'o',
  'ौ': 'au', 'ॉ': 'o', 'ॅ': 'e',
  'ं': 'n', 'ँ': 'n', 'ः': 'h', '्': '', '़': '', ऽ: '', '।': ' ', '॥': ' ',
  '०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
};

const IAST: Readonly<Record<string, string>> = {
  ā: 'a', ī: 'i', ū: 'u', ṛ: 'ri', ṝ: 'ri', ḷ: 'l', ṅ: 'n', ñ: 'n', ṭ: 't', ḍ: 'd', ṇ: 'n',
  ś: 'sh', ṣ: 'sh', ḥ: 'h', ṁ: 'm', ṃ: 'm', ĕ: 'e', ŏ: 'o',
};

/** Consonants that carry an inherent vowel (ka…ha + nukta forms). */
const CONSONANT = /[क-हक़-य़]/;
/** Vowel signs + virama: the marks that REPLACE the inherent vowel. */
const VOWEL_SIGN_OR_VIRAMA = /[ा-्]/;
/** Placeholder for the inherent vowel while we decide whether to keep it. */
const SCHWA = '\u0001';
const SCHWA_AT_WORD_END = new RegExp(`${SCHWA}(?=\\s|$)`, 'g');

function foldDevanagari(s: string): string {
  const chars = [...s];
  let out = '';
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    // Nukta is a combining mark; the composed form (if any) was normalised
    // away by NFC. A stray one is dropped by the DEVA table.
    const mapped = DEVA[c] ?? c;
    if (CONSONANT.test(c)) {
      // A consonant followed by a vowel sign / virama carries no inherent
      // vowel. A following nukta must be looked past first.
      let j = i + 1;
      while (chars[j] === '़') j++;
      const next = chars[j] ?? '';
      out += VOWEL_SIGN_OR_VIRAMA.test(next) ? mapped : mapped + SCHWA;
    } else {
      out += mapped;
    }
  }
  return out.replace(SCHWA_AT_WORD_END, '').replaceAll(SCHWA, 'a');
}

/**
 * Fold any script to the resolver's ASCII key. Idempotent: fold(fold(x)) === fold(x).
 */
export function fold(input: string): string {
  const lowered = input.normalize('NFC').toLowerCase();
  const iast = lowered.replace(/[āīūṛṝḷṅñṭḍṇśṣḥṁṃĕŏ]/g, (c) => IAST[c] ?? c);
  const deva = foldDevanagari(iast);
  return (
    deva
      .replace(/[^a-z0-9 ]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      // Hinglish spelling noise: doubled vowels/consonants, w/v, z/j, ph/f.
      .replace(/aa/g, 'a').replace(/ee/g, 'i').replace(/oo/g, 'u')
      .replace(/(.)\1+/g, '$1')
      .replace(/w/g, 'v')
      .replace(/z/g, 'j')
      .replace(/f/g, 'ph')
      .replace(/(.)\1+/g, '$1')
  );
}

/**
 * Strip the honorific / inflection tail Hinglish adds to names: ganeshji,
 * hanumanji, shivji → ganesh, hanuman, shiv. Also lets `ganesha` ≡ `ganesh`.
 */
export function stem(word: string): string {
  return word.replace(/(ji|ni|ya|a|i)$/, '');
}

/**
 * Generic devotional vocabulary that must never establish an entity on its
 * own (PRD-41 §13.3 specificity floor). "vrat" may narrow a match; it may not
 * pick a vrat. "kaal" is here because राहु काल stems into `kali`.
 */
export const GENERIC_TOKENS: ReadonlySet<string> = new Set([
  'vrat', 'kal', 'kaal', 'puja', 'pooja', 'din', 'katha', 'dev', 'devi', 'mata', 'ji',
  'shri', 'shree', 'bhagvan', 'bhagavan', 'bhagvaan', 'ki', 'ka', 'ke', 'ko', 'me', 'mein',
  'kya', 'kab', 'kaise', 'hai', 'hain', 'the', 'is', 'for', 'to', 'of', 'what', 'when',
  'how', 'which', 'aj', 'aaj', 'kaun', 'kon', 'koi', 'aur', 'or', 'and', 'ya', 'mantra',
  'path', 'paath', 'jap', 'japa', 'stotra', 'chalisa', 'aarti', 'arti',
]);

/** Words shorter than this cannot establish an entity via stem equality. */
export const MIN_STEM_WORD = 5;
