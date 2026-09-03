// Toy of src/ask/: lexicon generated from the repo's real registries, then a
// deterministic resolver. No model, no network. ~150 lines.
import { readFileSync } from 'node:fs';
const SRC = '/home/user/aadhyatma/mobile/src/';
const read = (p) => readFileSync(SRC + p, 'utf8');

/* ---------- 1. LEXICON, generated from code (never hand-listed) ---------- */
const grab = (text, re) => [...text.matchAll(re)];
const lexicon = []; // { type, id, form }
const add = (type, id, form) => form && lexicon.push({ type, id, form });

// deities (21)
for (const m of grab(read('data/deities.ts'), /id: '([a-z-]+)',\s*\n?\s*nameHi: '([^']+)',\s*\n?\s*nameEn: '([^']+)'/g)) {
  add('deity', m[1], m[2]); add('deity', m[1], m[3]); add('deity', m[1], m[1].replace(/-/g, ' '));
}
// muhurat occasions (13)
for (const m of grab(read('panchang/eventMuhurat.ts'), /id: '([a-z-]+)',[\s\S]{0,600}?nameHi: '([^']+)',\s*\n\s*nameEn: '([^']+)'/g)) {
  add('occasion', m[1], m[2]); add('occasion', m[1], m[3]); add('occasion', m[1], m[1].replace(/-/g, ' '));
}
// the 8 dik, straight out of DISHA_LABELS (PRD-24's one-vocabulary rule)
for (const m of grab(read('panchang/eventMuhurat.ts'), /^  (\w+): \{ hi: '([^']+)', en: '([^']+)' \},$/gm)) {
  add('disha', m[1], m[2]); add('disha', m[1], m[3]);
}
// observances — sample the festival/vrat rule names
for (const m of grab(read('panchang/festivals.ts'), /id: '([a-z0-9-]+)', nameHi: '([^']+)', nameEn: '([^']+)'/g)) {
  add('observance', m[1], m[2]); add('observance', m[1], m[3]);
}

/* ---------- 2. NORMALIZE: Devanagari + IAST + Latin all fold to one key ---------- */
const DEVA = { 'क':'k','ख':'kh','ग':'g','घ':'gh','ङ':'n','च':'ch','छ':'chh','ज':'j','झ':'jh','ञ':'n',
 'ट':'t','ठ':'th','ड':'d','ढ':'dh','ण':'n','त':'t','थ':'th','द':'d','ध':'dh','न':'n','प':'p','फ':'ph',
 'ब':'b','भ':'bh','म':'m','य':'y','र':'r','ल':'l','व':'v','श':'sh','ष':'sh','स':'s','ह':'h','ळ':'l',
 'अ':'a','आ':'a','इ':'i','ई':'i','उ':'u','ऊ':'u','ऋ':'ri','ए':'e','ऐ':'ai','ओ':'o','औ':'au',
 'ा':'a','ि':'i','ी':'i','ु':'u','ू':'u','ृ':'ri','े':'e','ै':'ai','ो':'o','ौ':'au','ं':'n','ँ':'n','ः':'h','्':'','़':'','ऽ':'' };
const CONS = /[\u0915-\u0939\u0958-\u095f]/;      // ka..ha
const MATRA = /[\u093e-\u094d]/;                    // vowel signs + virama only
// Devanagari is an abugida: a bare consonant carries an inherent 'a'. Skipping this
// is why मंदिर folds to 'mndir' and never matches the Latin 'mandir'.
const SCHWA = '\u0001';                             // inherent 'a', marked so it stays droppable
const deva = (s) => [...s].map((c, i) => {
  const t = DEVA[c] ?? c;
  return CONS.test(c) && !MATRA.test(s[i + 1] ?? '') ? t + SCHWA : t;
}).join('')
  // Hindi deletes the word-final inherent vowel, Sanskrit keeps it: मंदिर = mandir,
  // दिशा = disha (that final ā is explicit, not inherent). Both spellings must land
  // on one key or the Devanagari and Latin halves of the lexicon never meet.
  .replace(new RegExp(SCHWA + '(?=\\s|$)', 'g'), '')
  .replaceAll(SCHWA, 'a');
const fold = (s) => deva(s.normalize('NFC').toLowerCase()
  .replace(/[āīūṛṝḷṅñṭḍṇśṣḥṁṃ]/g, (c) => ({'ā':'a','ī':'i','ū':'u','ṛ':'ri','ṝ':'ri','ḷ':'l','ṅ':'n','ñ':'n','ṭ':'t','ḍ':'d','ṇ':'n','ś':'sh','ṣ':'sh','ḥ':'h','ṁ':'m','ṃ':'m'}[c])))
  .replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()
  // spelling-noise collapse: the Hinglish long tail is mostly this
  .replace(/aa|ee|oo/g, (m) => m[0]).replace(/(.)\1+/g, '$1').replace(/w/g, 'v').replace(/z/g, 'j');

const KEYED = lexicon.map((e) => ({ ...e, key: fold(e.form) })).filter((e) => e.key.length > 2);
// hand-curated aliases — the only hand-maintained file in the system
for (const [form, ref] of [['bajrangbali','deity:hanuman'],['hanumanji','deity:hanuman'],['shivji','deity:shiva'],
  ['ganpati','deity:ganesha'],['gruh pravesh','occasion:griha-pravesh'],['house warming','occasion:griha-pravesh'],
  ['mandir','room:puja'],['puja room','room:puja']]) {
  const [type, id] = ref.split(':'); KEYED.push({ type, id, form, key: fold(form) });
}

/* ---------- 3. INTENTS: each one calls an engine that already ships ---------- */
const I = (id, triggers, slots, engine) => ({ id, triggers: triggers.map(fold), slots, engine });
const INTENTS = [
  I('observance.next', ['kab hai','hai kya','kab aa','when is','kb hai','kab padegi','kitni tarikh'], ['observance'], 'festivalEngine.nextOccurrence()'),
  I('muhurat.event',   ['muhurat','muhurt','shubh din','auspicious'], ['occasion'], 'eventMuhurat.scan() → MuhuratFinder(prefilled)'),
  I('bhog.offer',      ['kya chadhaye','kya chadhaen','bhog','naivedya','what to offer','kya arpan'], ['deity'], 'bhogContent.forDeity()'),
  I('bhog.avoid',      ['kya nahi chadha','nahi chadha','must not offer','nishedh','varjit'], ['deity'], 'bhogContent.prohibited()'),
  I('vastu.direction', ['kis disha','which direction','disha me','disha mein'], ['room','disha'], 'data/vastu.roomGuidance()'),
  I('muhurat.now',     ['rahu kal','rahukal','rahu kaal','choghadiya','abhi shubh'], [], 'muhurat.forNow()'),
  I('vrat.how',        ['vrat kaise','kaise kare','vrat vidhi','how to fast'], ['observance'], 'upvasContent.forRule()'),
  I('panchang.day',    ['aaj kya','kaun si tithi','tithi kya','whats today','nakshatra kya'], [], 'panchang.forDate()'),
];

/* ---------- 4. RESOLVE ---------- */
const stem = (w) => w.replace(/(ji|ni|ya|a|i)$/, '');
function resolve(q) {
  const key = fold(q);
  const found = {};
  const words = key.split(' ');
  for (const e of KEYED) {                       // longest-match entity tagging, stem-tolerant
    const head = e.key.split(' ').pop();         // 'shri ganesha' -> 'ganesha'
    const hit = key.includes(e.key) || words.some((w) => stem(w) === stem(head));
    if (hit && (!found[e.type] || e.key.length > found[e.type].key.length)) found[e.type] = e;
  }
  let best = null;
  for (const it of INTENTS) {
    const trig = it.triggers.find((t) => key.includes(t));
    if (!trig) continue;
    const filled = it.slots.filter((s) => found[s]);
    const score = trig.length + filled.length * 10 + (it.slots.length && !filled.length ? -8 : 0);
    if (!best || score > best.score) best = { it, score, slots: filled.map((s) => `${s}=${found[s].id}`) };
  }
  if (!best || best.score < 6) return { ok: false, fallback: 'did-you-mean chips + content search' };
  return { ok: true, intent: best.it.id, slots: best.slots, engine: best.it.engine };
}

/* ---------- 5. RUN ---------- */
console.log(`lexicon: ${KEYED.length} surface forms generated from code + ${8} hand aliases\n`);
for (const q of ['कल एकादशी है क्या','ekadashi kab hai','when is ekadashi','गणेश जी को क्या चढ़ाएँ',
  'ganpati ko kya chadhaye','ganesh ji ko kya nahi chadhana chahiye','गृह प्रवेश का मुहूर्त','gruh pravesh muhurt kab hai',
  'house warming auspicious date','मंदिर किस दिशा में','mandir kis disha me hona chahiye','rahu kaal kab hai',
  'राहु काल','aaj kaun si tithi hai','holi kab hai','shiv ji ko kya nahi chadhana','कल राहु काल कब है','शिवरात्रि कब है','vahan kharidne ka muhurat','sone ki disha konsi honi chahiye','kya mujhe naukri milegi','what is karma','mera bhavishya kya hai']) {
  const r = resolve(q);
  console.log((r.ok ? '  ✓ ' : '  ✗ ') + q.padEnd(42) + (r.ok ? `${r.intent} ${r.slots.join(' ')} → ${r.engine}` : `abstain → ${r.fallback}`));
}
