// Puppet figures for the Chhath reel (used until the AI images arrive): King Priyavrat (grieving and crowned),
// the infant, Devi Shashthi (Chhathi Maiya) with a halo, a vrati holding up the soop, the river front and a havan.
import '../salasar-balaji/cast.mjs';
import '../hanuman-jayanti-kartik/cast.mjs';
import {person} from '../salasar-balaji/cast.mjs';
import {deva, CHARACTERS, PALETTES} from '../../cast.mjs';
import {ell, rr, poly, s, flat, eye, limb} from '../../../story-styles/characters.mjs';

const COLORS = {vratiSaree: '#F2B632', deviSaree: '#C0262B', infant: '#E7B08A', bamboo: '#C8964A', river: '#2E6F8E', river2: '#4C93AE', thekua: '#B8742E'};
Object.assign(PALETTES.puppet, COLORS);
Object.assign(PALETTES.patta, COLORS);
const rays = (n, r0, r1, r2) => Array.from({length: n}, (_, k) => { const a = k * 2 * Math.PI / n, p = (r, t) => [Math.round(r * Math.cos(t)), Math.round(r * Math.sin(t))];
  return s(poly(p(r0, a - 0.12), p(k % 2 ? r1 : r2, a), p(r0, a + 0.12)), k % 2 ? 'gold' : 'glow', flat); });

function lady({skin, saree, crown, halo, frontBase = -40, backBase = 18, frontItem = [], sindoor}) {
  const parts = [];
  if (halo) parts.push({id: 'halo', parent: 'head', at: [0, -50], spin: 14, first: true, shapes: [...rays(16, 70, 110, 132), s(ell(0, 0, 80, 80), 'halo')]});
  parts.push(
    {id: 'bun', parent: 'head', at: [0, 0], first: true, shapes: [s(ell(-30, -66, 26, 24), 'hair')]},
    {id: 'armBack', parent: 'body', at: [-36, -120], base: backBase, amp: 4, freq: 0.7, first: true, shapes: limb(95, 24, skin)},
    {id: 'body', at: [0, 0], amp: 2, freq: 0.6, shapes: [
      s(ell(0, -140, 46, 34), 'red'), s('M-50,-128 L50,-128 L80,170 L-80,170Z', saree),
      s('M-50,-150 L22,-150 L-58,60 L-82,40Z', saree), s('M-82,40 L-58,60 L-52,48 L-76,30Z', 'red', flat), s('M-80,150 L80,150 L80,170 L-80,170Z', crown ? 'gold' : 'red'),
      s(ell(-25, 176, 22, 10), skin), s(ell(30, 176, 22, 10), skin)]},
    {id: 'head', parent: 'body', at: [0, -170], amp: 3, freq: 0.5, shapes: [
      s(ell(0, -48, 40, 46), skin), ...eye(-14, -52, 10, 4), ...eye(14, -52, 10, 4),
      ...(sindoor ? [s(rr(-2.5, -98, 5, 52, 2), 'sindoor', flat), s(ell(10, -30, 6, 6), 'gold', flat)] : [s(ell(0, -74, 4, 4), 'red', flat)]),
      s('M-42,-58 Q0,-112 42,-58 Q30,-84 0,-88 Q-30,-84 -42,-58Z', 'hair'),
      ...(crown ? [s(poly([-36, -84], [36, -84], [26, -118], [0, -150], [-26, -118]), 'gold'), s(rr(-38, -92, 76, 12, 5), 'red')] : [s('M-44,-62 Q0,-120 44,-62 L40,-56 Q0,-108 -40,-56Z', saree, flat)]),
      s(ell(-40, -36, 5, 7), 'gold', flat), s(ell(40, -36, 5, 7), 'gold', flat)]},
    {id: 'armFront', parent: 'body', at: [36, -120], base: frontBase, amp: 3, freq: 0.6, phase: 1, shapes: [...limb(95, 24, skin), ...frontItem]});
  return parts;
}
const soop = [s('M-80,110 Q0,70 80,110 L66,150 Q0,176 -66,150Z', 'bamboo'), s('M-70,120 Q0,90 70,120', 'thekua', flat),
  ...[[-44, 112, 'thekua'], [-14, 104, 'gold'], [20, 106, 'thekua'], [48, 114, 'green']].map(([x, y, c]) => s(ell(x, y, 13, 10), c, flat)),
  s(rr(56, 40, 8, 80, 3), 'green'), s('M0,64 Q12,84 0,96 Q-12,84 0,64Z', '#FFB43A', flat)];
const infantShapes = (glow) => [...(glow ? rays(14, 60, 90, 104) : []), s(ell(0, 0, 54, 32), 'white'), s('M-50,0 Q-10,-20 30,-6', 'cream', flat), s(ell(34, -6, 20, 19), 'infant'),
  s('M26,-8 Q30,-5 34,-8', 'black', flat), s('M38,-8 Q42,-5 46,-8', 'black', flat)];

Object.assign(CHARACTERS, {
  kingGrief: person({skin: 'thakurSkin', robe: 'maroon', shawl: 'gold', beard: 'black', moustache: 'black', hair: 'black', sleep: true, frontBase: -62, frontAmp: 2}),
  king: deva({skin: 'thakurSkin', robe: 'maroon', beard: true, item: 'bless'}),
  kingJoy: person({skin: 'thakurSkin', robe: 'maroon', shawl: 'gold', beard: 'black', moustache: 'black', hair: 'black', frontBase: -150, frontAmp: 10, frontFreq: 1.2}),
  crownFallen: [{id: 'body', at: [0, 0], shapes: [s(poly([-40, 20], [40, 20], [30, -16], [0, -46], [-30, -16]), 'gold'), s(rr(-42, 10, 84, 14, 5), 'red')]}],
  infant: [{id: 'body', at: [0, 0], amp: 2, freq: 0.6, shapes: infantShapes(false)}],
  infantGlow: [{id: 'glow', at: [0, 0], spin: 20, shapes: rays(14, 70, 110, 130)}, {id: 'body', at: [0, 0], amp: 4, freq: 1.4, shapes: infantShapes(false)}],
  devi: lady({skin: 'sitaSkin', saree: 'deviSaree', crown: true, halo: true, frontBase: -40}),
  deviBless: lady({skin: 'sitaSkin', saree: 'deviSaree', crown: true, halo: true, frontBase: -95, frontItem: [s(ell(0, 104, 22, 26), 'sitaSkin'), s(ell(0, 104, 7, 7), 'red', flat)]}),
  vrati: lady({skin: 'farmerSkin', saree: 'vratiSaree', sindoor: true, frontBase: -168, backBase: 160, frontItem: soop}),
  riverFront: [{id: 'body', at: [0, 0], amp: 1.5, freq: 0.5, shapes: [s(rr(-620, 0, 1240, 340, 0), 'river'),
    ...Array.from({length: 9}, (_, k) => s(`M${-560 + k * 140},18 q35,-22 70,0 q35,22 70,0`, 'river2', flat))]}],
  havan: CHARACTERS.dhuni.filter(p => p.id !== 'trishul').map(p => p.id === 'base' ? {...p, shapes: [s(rr(-130, -10, 260, 60, 6), 'brick'), s(rr(-130, -10, 260, 14, 4), 'gold', flat)]} : p),
});
export {CHARACTERS, PALETTES};
