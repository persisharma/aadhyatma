// glyphs.mjs — the deity emblems on the carousel, drawn rather than photographed.
//
// They follow the app's own glyph convention (design.md §42, mobile/src/components/
// deityGlyphs/): an ATTRIBUTE of the deity — chakra, shankha, trishul, modak — painted
// in the baked illustration palette on the fixed warm medallion, never an emoji and
// never a depiction of the deity's face. The palette constants below are copied from
// `deityGlyphs/palette.ts`; keep them in step if that file moves.
//
// Each emblem is authored in a 100×100 viewBox so the card can scale it freely.

export const P = {
  ink: '#733207',
  gold: '#D49A35',
  goldSoft: '#F4C872',
  cream: '#FFF7E7',
  flame: '#E0701F',
  deepBlue: '#064D5E',
  teal: '#0B7D82',
};

const S = (body) => `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;

/** Sudarshan chakra — Vishnu, and the ten avatars the Dashavatara vrat counts. */
const chakra = () => {
  const teeth = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2;
    const x = 50 + Math.cos(a) * 40, y = 50 + Math.sin(a) * 40;
    return `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="3.4" fill="${P.ink}"/>`;
  }).join('');
  const spokes = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    return `<line x1="${(50 + Math.cos(a) * 9).toFixed(2)}" y1="${(50 + Math.sin(a) * 9).toFixed(2)}"
      x2="${(50 + Math.cos(a) * 31).toFixed(2)}" y2="${(50 + Math.sin(a) * 31).toFixed(2)}"
      stroke="${P.ink}" stroke-width="2.6" stroke-linecap="round"/>`;
  }).join('');
  return S(`
    <circle cx="50" cy="50" r="40" fill="none" stroke="${P.ink}" stroke-width="3"/>
    <circle cx="50" cy="50" r="32" fill="none" stroke="${P.gold}" stroke-width="2.4"/>
    ${teeth}${spokes}
    <circle cx="50" cy="50" r="9" fill="${P.ink}"/>
    <circle cx="50" cy="50" r="4" fill="${P.goldSoft}"/>`);
};

/** Shankha on a lotus — Vishnu asleep on Shesha, who turns on Parivartini Ekadashi. */
const shankha = () => S(`
  <path d="M18 78 C24 70 26 60 25 51 C23 38 28 26 38 18 C46 12 56 11 62 16
           C70 23 72 36 68 50 C64 64 54 74 42 79 C34 82 24 82 18 78 Z"
        fill="${P.cream}" stroke="${P.ink}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M60 18 C56 22 56 27 59 29 C62 31 66 29 66 25 C66 21 63 18 60 18 Z"
        fill="none" stroke="${P.ink}" stroke-width="2.4"/>
  <path d="M54 22 C48 32 45 44 46 56 C47 64 45 70 40 76"
        fill="none" stroke="${P.gold}" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M62 34 C57 44 55 54 56 62" fill="none" stroke="${P.gold}" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M25 51 C20 54 16 60 16 66 C22 65 25 61 27 57" fill="${P.goldSoft}" stroke="${P.ink}" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M14 88 C22 82 34 79 50 79 C66 79 78 82 86 88 C74 93 60 94 50 94 C40 94 26 93 14 88 Z"
        fill="${P.goldSoft}" stroke="${P.ink}" stroke-width="2.8" stroke-linejoin="round"/>
  <path d="M34 87 C40 83 45 82 50 82 C55 82 60 83 66 87" fill="none" stroke="${P.ink}" stroke-width="2"/>`);

/** Chhatra, danda and kamandalu — Vamana the brahmachari who asked for three paces. */
const chhatra = () => S(`
  <path d="M16 40 C22 22 36 13 50 13 C64 13 78 22 84 40 Z" fill="${P.flame}" stroke="${P.ink}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M16 40 C28 45 38 45 50 40 C62 45 72 45 84 40" fill="none" stroke="${P.ink}" stroke-width="2.6"/>
  <path d="M50 13 C44 24 42 32 42 40 M50 13 C56 24 58 32 58 40" fill="none" stroke="${P.ink}" stroke-width="2"/>
  <circle cx="50" cy="11" r="4" fill="${P.gold}" stroke="${P.ink}" stroke-width="2"/>
  <line x1="50" y1="40" x2="50" y2="84" stroke="${P.ink}" stroke-width="4" stroke-linecap="round"/>
  <path d="M22 66 C22 58 28 54 33 54 C38 54 44 58 44 66 C44 76 38 82 33 82 C28 82 22 76 22 66 Z"
        fill="${P.cream}" stroke="${P.ink}" stroke-width="3"/>
  <path d="M29 54 C29 48 37 48 37 54" fill="none" stroke="${P.ink}" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M24 64 C30 68 36 68 42 64" fill="none" stroke="${P.gold}" stroke-width="2.4"/>
  <circle cx="68" cy="72" r="5" fill="none" stroke="${P.gold}" stroke-width="2.4"/>
  <circle cx="78" cy="62" r="3.4" fill="none" stroke="${P.gold}" stroke-width="2"/>`);

/** Trishul and damaru — Shiva, worshipped in the pradosh twilight. */
const trishul = () => S(`
  <path d="M30 20 L25 20 L30 2 L35 20 Z" fill="${P.ink}"/>
  <path d="M70 20 L65 20 L70 2 L75 20 Z" fill="${P.ink}"/>
  <path d="M50 18 L44 18 L50 -2 L56 18 Z" fill="${P.ink}"/>
  <line x1="30" y1="18" x2="30" y2="38" stroke="${P.ink}" stroke-width="4.4" stroke-linecap="round"/>
  <line x1="70" y1="18" x2="70" y2="38" stroke="${P.ink}" stroke-width="4.4" stroke-linecap="round"/>
  <line x1="28" y1="38" x2="72" y2="38" stroke="${P.ink}" stroke-width="4.6" stroke-linecap="round"/>
  <line x1="50" y1="16" x2="50" y2="94" stroke="${P.ink}" stroke-width="5" stroke-linecap="round"/>
  <circle cx="50" cy="30" r="3.6" fill="${P.gold}"/>
  <path d="M36 62 L64 76 M64 62 L36 76" stroke="${P.gold}" stroke-width="3.2" stroke-linecap="round"/>
  <path d="M36 62 L36 76 M64 62 L64 76" stroke="${P.gold}" stroke-width="2.8" stroke-linecap="round"/>
  <path d="M92 52 A11 11 0 1 0 92 70 A8.5 8.5 0 1 1 92 52 Z"
        fill="${P.cream}" stroke="${P.ink}" stroke-width="2" stroke-linejoin="round"/>`);

/** The fourteen-knot anant sutra over water — Anant Chaturdashi and the visarjan. */
const anant = () => S(`
  <ellipse cx="50" cy="42" rx="26" ry="20" fill="none" stroke="${P.ink}" stroke-width="4.4"/>
  <ellipse cx="50" cy="42" rx="26" ry="20" fill="none" stroke="${P.gold}" stroke-width="1.8"/>\n  <circle cx="50.0" cy="22.0" r="3.1" fill="${P.goldSoft}" stroke="${P.ink}" stroke-width="1.5"/>\n  <circle cx="61.3" cy="24.0" r="3.1" fill="${P.goldSoft}" stroke="${P.ink}" stroke-width="1.5"/>\n  <circle cx="70.3" cy="29.5" r="3.1" fill="${P.goldSoft}" stroke="${P.ink}" stroke-width="1.5"/>\n  <circle cx="75.3" cy="37.5" r="3.1" fill="${P.goldSoft}" stroke="${P.ink}" stroke-width="1.5"/>\n  <circle cx="75.3" cy="46.5" r="3.1" fill="${P.goldSoft}" stroke="${P.ink}" stroke-width="1.5"/>\n  <circle cx="70.3" cy="54.5" r="3.1" fill="${P.goldSoft}" stroke="${P.ink}" stroke-width="1.5"/>\n  <circle cx="61.3" cy="60.0" r="3.1" fill="${P.goldSoft}" stroke="${P.ink}" stroke-width="1.5"/>\n  <circle cx="50.0" cy="62.0" r="3.1" fill="${P.goldSoft}" stroke="${P.ink}" stroke-width="1.5"/>\n  <circle cx="38.7" cy="60.0" r="3.1" fill="${P.goldSoft}" stroke="${P.ink}" stroke-width="1.5"/>\n  <circle cx="29.7" cy="54.5" r="3.1" fill="${P.goldSoft}" stroke="${P.ink}" stroke-width="1.5"/>\n  <circle cx="24.7" cy="46.5" r="3.1" fill="${P.goldSoft}" stroke="${P.ink}" stroke-width="1.5"/>\n  <circle cx="24.7" cy="37.5" r="3.1" fill="${P.goldSoft}" stroke="${P.ink}" stroke-width="1.5"/>\n  <circle cx="29.7" cy="29.5" r="3.1" fill="${P.goldSoft}" stroke="${P.ink}" stroke-width="1.5"/>\n  <circle cx="38.7" cy="24.0" r="3.1" fill="${P.goldSoft}" stroke="${P.ink}" stroke-width="1.5"/>
  <path d="M43 61 C41 68 37 72 31 74 M57 61 C59 68 63 72 69 74"
        fill="none" stroke="${P.ink}" stroke-width="3.4" stroke-linecap="round"/>
  <path d="M45 60 C47 64 53 64 55 60" fill="none" stroke="${P.ink}" stroke-width="3.4" stroke-linecap="round"/>
  <path d="M8 84 C16 78 24 90 32 84 C40 78 48 90 56 84 C64 78 72 90 80 84 C84 81 88 82 92 84"
        fill="none" stroke="${P.teal}" stroke-width="3.6" stroke-linecap="round"/>
  <path d="M8 94 C16 88 24 100 32 94 C40 88 48 100 56 94 C64 88 72 100 80 94 C84 91 88 92 92 94"
        fill="none" stroke="${P.deepBlue}" stroke-width="3.2" stroke-linecap="round"/>`);

/** The full moon beside a kalash — the purnima and the Satyanarayan katha. */
const purnima = () => S(`
  <circle cx="70" cy="26" r="19" fill="${P.cream}" stroke="${P.ink}" stroke-width="2.8"/>
  <circle cx="63" cy="21" r="3.2" fill="${P.gold}" opacity="0.7"/>
  <circle cx="75" cy="31" r="4.2" fill="${P.gold}" opacity="0.55"/>
  <circle cx="72" cy="15" r="2.2" fill="${P.gold}" opacity="0.5"/>
  <path d="M38 54 L38 48 M38 48 C33 43 26 43 23 47 M38 48 C43 43 50 43 53 47"
        fill="none" stroke="${P.ink}" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M20 58 L56 58" stroke="${P.ink}" stroke-width="3.6" stroke-linecap="round"/>
  <path d="M24 58 C18 66 18 82 25 90 C31 96 45 96 51 90 C58 82 58 66 52 58 Z"
        fill="${P.goldSoft}" stroke="${P.ink}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M22 74 C29 70 47 70 54 74" fill="none" stroke="${P.ink}" stroke-width="2.2" opacity="0.8"/>
  <path d="M30 84 C34 81 42 81 46 84" fill="none" stroke="${P.gold}" stroke-width="2.2"/>`);

/** Jalanjali over kusha grass — the tarpana that opens Pitru Paksha. */
const tarpan = () => S(`
  <path d="M30 20 C34 26 36 32 36 38 C36 46 32 52 28 56 C24 52 20 46 20 38 C20 32 24 26 30 20 Z"
        fill="none" stroke="${P.ink}" stroke-width="2.6" stroke-linejoin="round"/>
  <path d="M30 24 L30 56" stroke="${P.ink}" stroke-width="2"/>
  <path d="M62 54 C56 58 52 64 52 70 C52 80 60 88 70 88 C80 88 88 80 88 70 C88 64 84 58 78 54 Z"
        fill="${P.goldSoft}" stroke="${P.ink}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M58 54 L82 54" stroke="${P.ink}" stroke-width="3.2" stroke-linecap="round"/>
  <path d="M58 72 C64 69 76 69 82 72" fill="none" stroke="${P.gold}" stroke-width="2.4"/>
  <path d="M46 14 C52 22 54 28 54 33 C54 39 50 43 46 43 C42 43 38 39 38 33 C38 28 40 22 46 14 Z"
        fill="${P.teal}" stroke="${P.ink}" stroke-width="2.6" stroke-linejoin="round"/>
  <circle cx="34" cy="62" r="3.6" fill="${P.teal}"/>
  <circle cx="44" cy="74" r="3" fill="${P.teal}" opacity="0.8"/>
  <circle cx="30" cy="80" r="2.4" fill="${P.teal}" opacity="0.65"/>`);

/** Modak under the rising moon — Sankashti ends at the chandrodaya, not at sunset. */
const modak = () => S(`
  <path d="M90 16 A18 18 0 1 0 90 44 A13.8 13.8 0 1 1 90 16 Z"
        fill="${P.cream}" stroke="${P.ink}" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M20 80 C20 62 33 50 50 50 C67 50 80 62 80 80 Z"
        fill="${P.goldSoft}" stroke="${P.ink}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M41 54 C43 42 46 33 50 22 C54 33 57 42 59 54 Z"
        fill="${P.goldSoft}" stroke="${P.ink}" stroke-width="3" stroke-linejoin="round"/>
  <circle cx="50" cy="19" r="3.4" fill="${P.gold}" stroke="${P.ink}" stroke-width="1.8"/>
  <path d="M50 52 C42 60 36 70 33 80 M50 52 L50 80 M50 52 C58 60 64 70 67 80"
        fill="none" stroke="${P.ink}" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M14 80 C26 75 74 75 86 80 C76 87 24 87 14 80 Z"
        fill="${P.cream}" stroke="${P.ink}" stroke-width="2.8" stroke-linejoin="round"/>`);

/** Three pindas on a leaf plate — the shraddha tithis of the fortnight. */
const pinda = () => S(`
  <path d="M10 62 C10 48 24 40 44 40 C66 40 84 48 94 62 C84 78 66 86 44 86
           C24 86 10 78 10 62 Z"
        fill="${P.cream}" stroke="${P.ink}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M12 62 C34 56 64 54 92 62" fill="none" stroke="${P.gold}" stroke-width="2.2"/>
  <path d="M28 48 C32 54 34 60 34 66 M48 43 C52 50 54 57 54 64 M68 46 C72 52 74 58 74 64"
        fill="none" stroke="${P.gold}" stroke-width="1.8" opacity="0.75"/>
  <path d="M10 62 L2 62" stroke="${P.ink}" stroke-width="3" stroke-linecap="round"/>
  <circle cx="34" cy="60" r="11" fill="${P.goldSoft}" stroke="${P.ink}" stroke-width="2.8"/>
  <circle cx="58" cy="57" r="11" fill="${P.goldSoft}" stroke="${P.ink}" stroke-width="2.8"/>
  <circle cx="46" cy="74" r="11" fill="${P.goldSoft}" stroke="${P.ink}" stroke-width="2.8"/>
  <path d="M72 16 C74 22 74 27 72 31 M82 14 C84 20 84 25 82 29 M62 19 C64 24 64 28 62 32"
        fill="none" stroke="${P.gold}" stroke-width="2.4" stroke-linecap="round"/>`);

export const GLYPHS = { chakra, shankha, chhatra, trishul, anant, purnima, tarpan, modak, pinda };

export function glyphSvg(name) {
  const draw = GLYPHS[name];
  if (!draw) throw new Error(`unknown glyph "${name}" — add it to glyphs.mjs`);
  return draw();
}
