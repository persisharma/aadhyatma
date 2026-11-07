// Figures for the Kartik Hanuman Jayanti reel (puppet style): Sita in Ashok Vatika (sad, and blessing), the
// Ashoka tree, Rama's ring (mudrika), and an open Hanuman Chalisa. Hanuman and the diya come from the shared casts.
import '../diwali-ig/cast.mjs';
import {CHARACTERS, PALETTES} from '../../cast.mjs';
import {ell, rr, poly, s, flat, eye, limb} from '../../../story-styles/characters.mjs';

const COLORS = {sitaSkin: '#E0A070', sitaSaree: '#E3B23C', ashoka: '#2F5A2A', ashoka2: '#3E7A35', ashokaFl: '#E8551E', bark: '#5A2A12', glow: '#FFD36B', glowIn: '#9A4416', hole: '#1E0A04', page: '#F6E7C1'};
Object.assign(PALETTES.puppet, COLORS);
Object.assign(PALETTES.patta, COLORS);

const rays = (n, r0, r1, r2) => Array.from({length: n}, (_, k) => { const a = k * 2 * Math.PI / n, p = (r, t) => [Math.round(r * Math.cos(t)), Math.round(r * Math.sin(t))];
  return s(poly(p(r0, a - 0.12), p(k % 2 ? r1 : r2, a), p(r0, a + 0.12)), k % 2 ? 'gold' : 'glow', flat); });

// Sita in captivity: plain yellow saree with a red border, no crown; head bowed when sad, palm raised to bless.
function sita({sad, bless}) {
  return [
    {id: 'bun', parent: 'head', at: [0, 0], first: true, shapes: [s(ell(-30, -66, 26, 24), 'hair'), s('M-40,-60 C-70,0 -66,80 -50,140 L-30,140 C-44,80 -46,10 -26,-50Z', 'hair')]},
    {id: 'armBack', parent: 'body', at: [-36, -120], base: sad ? 30 : 18, amp: 4, freq: 0.6, first: true, shapes: limb(95, 24, 'sitaSkin')},
    {id: 'body', at: [0, 0], amp: 2, freq: 0.6, shapes: [
      s(ell(0, -140, 46, 34), 'red'), s('M-50,-128 L50,-128 L80,170 L-80,170Z', 'sitaSaree'),
      s('M-50,-150 L22,-150 L-58,60 L-82,40Z', 'sitaSaree'), s('M-82,40 L-58,60 L-52,48 L-76,30Z', 'red', flat), s('M-80,150 L80,150 L80,170 L-80,170Z', 'red'),
      s(ell(-25, 176, 22, 10), 'sitaSkin'), s(ell(30, 176, 22, 10), 'sitaSkin')]},
    {id: 'head', parent: 'body', at: [0, -170], base: sad ? 10 : 0, amp: 3, freq: 0.5, shapes: [
      s(ell(0, -48, 40, 46), 'sitaSkin'),
      ...(sad ? [-14, 14].map(x => s(`M${x - 10},-50 Q${x},-44 ${x + 10},-50 Q${x},-47 ${x - 10},-50Z`, 'black', flat)) : [...eye(-14, -52, 10, 4), ...eye(14, -52, 10, 4)]),
      s(ell(0, -74, 4, 4), 'red', flat), s('M-42,-58 Q0,-112 42,-58 Q30,-84 0,-88 Q-30,-84 -42,-58Z', 'hair'),
      s('M-44,-62 Q0,-120 44,-62 L40,-56 Q0,-108 -40,-56Z', 'sitaSaree', flat)]},
    {id: 'armFront', parent: 'body', at: [36, -120], base: bless ? -150 : sad ? 25 : -40, amp: bless ? 3 : 5, freq: 0.7, phase: 1,
      shapes: [...limb(95, 24, 'sitaSkin'), ...(bless ? [s(ell(0, 104, 22, 26), 'sitaSkin'), s(ell(0, 104, 7, 7), 'red', flat)] : [])]},
  ];
}

Object.assign(CHARACTERS, {
  sitaSad: sita({sad: true}),
  sitaBless: sita({bless: true}),
  sitaLook: sita({}),
  ashokaTree: [{id: 'body', at: [0, 0], amp: 1, freq: 0.4, shapes: [
    s('M-40,300 C-50,150 -20,40 -60,-80 L-20,-90 C10,20 20,120 40,300Z', 'bark'), s('M-30,-40 C-90,-80 -150,-90 -200,-150 L-180,-170 C-130,-120 -80,-110 -20,-80Z', 'bark'),
    ...[[-180, -230, 130, 90, 'ashoka'], [40, -300, 170, 120, 'ashoka'], [180, -200, 130, 90, 'ashoka'], [-60, -380, 140, 100, 'ashoka2'], [100, -160, 110, 70, 'ashoka2'], [-150, -140, 100, 60, 'ashoka2']]
      .map(([x, y, rx, ry, c]) => s(ell(x, y, rx, ry), c)),
    ...[[-220, -250], [-120, -180], [-60, -400], [20, -330], [110, -260], [200, -210], [60, -180], [-180, -120], [150, -340], [-20, -250], [240, -150], [-100, -320]]
      .flatMap(([x, y]) => [s(ell(x, y, 16, 14), 'ashokaFl', flat), s(ell(x + 14, y + 10, 10, 9), 'gold', flat)])]}],
  mudrika: [
    {id: 'glow', at: [0, 0], spin: 25, shapes: rays(16, 70, 110, 130)},
    {id: 'ring', at: [0, 0], amp: 4, freq: 0.8, shapes: [s(ell(0, 0, 56, 56), 'gold'), s(ell(0, 0, 36, 36), 'hole', flat), s(poly([-24, -50], [24, -50], [14, -86], [-14, -86]), 'gold'), s(ell(0, -76, 18, 16), 'red', flat)]},
  ],
  chalisa: [
    {id: 'glow', at: [0, -40], spin: 10, shapes: [...rays(20, 230, 300, 340), s(ell(0, 0, 236, 236), 'glowIn', flat)]},
    {id: 'body', at: [0, 0], amp: 1.5, freq: 0.5, shapes: [
      s('M-250,40 L-250,-150 Q-125,-190 0,-150 Q125,-190 250,-150 L250,40 Q125,0 0,40 Q-125,0 -250,40Z', 'red'),
      s('M-230,20 L-230,-140 Q-115,-170 -4,-136 L-4,30 Q-115,-6 -230,20Z', 'page'), s('M230,20 L230,-140 Q115,-170 4,-136 L4,30 Q115,-6 230,20Z', 'page'),
      ...[-1, 1].flatMap(k => [0, 1, 2, 3, 4, 5].map(r => s(rr(k > 0 ? 30 : -200, -110 + r * 22 - (r === 0 ? 0 : 0), 170, 6, 3), r === 0 ? 'red' : 'maroon', flat))),
      s(rr(-40, 40, 80, 30, 6), 'gold'), s(ell(0, 55, 10, 8), 'red', flat)]},
  ],
});
export {CHARACTERS, PALETTES};
