// Original jointed figures for the five-day Diwali reel (puppet style), reusing the Dhanteras cast.
// Iconography follows the app's kathas: Krishna with chakra (Narakasura) and lifting Govardhan on his finger,
// Satyabhama beside him, Rama returning with Sita and Hanuman, Yamuna's aarti and tilak for Yama.
import '../dhanteras/cast.mjs';
import {CHARACTERS, PALETTES, deva} from '../../cast.mjs';
import {ell, rr, poly, s, flat, eye, limb} from '../../../story-styles/characters.mjs';

Object.assign(PALETTES.puppet, {krishna: '#2F5FA8', rama: '#3D7A8C', woman: '#D98B55', saree3: '#1F6FB0', saree4: '#C2306B', yamaSkin: '#2F5E4E', food: '#E8C27A', narak: '#5B2C6F'});
Object.assign(PALETTES.patta, {krishna: '#2C5AA0', rama: '#3D7A8C', woman: '#E7A06A', saree3: '#22569E', saree4: '#C2306B', yamaSkin: '#2F5E4E', food: '#F0C982', narak: '#5B2C6F'});

const feather = {id: 'feather', parent: 'head', at: [18, -150], base: 18, amp: 6, freq: 0.9, shapes: [
  s('M0,0 C-10,-40 6,-80 20,-96 C34,-80 40,-40 10,0Z', 'green'), s(ell(20, -66, 12, 16), 'blue', flat), s(ell(20, -66, 5, 7), 'gold', flat)]};

function woman({skin = 'woman', saree, pallu = 'gold', crown, frontItem, backItem, frontBase = -40, backBase = 18}) {
  return [
    {id: 'bun', parent: 'head', at: [0, 0], first: true, shapes: [s(ell(-30, -66, 26, 24), 'hair')]},
    {id: 'armBack', parent: 'body', at: [-36, -120], base: backBase, amp: 6, freq: 0.8, first: true, shapes: [...limb(95, 24, skin), ...(backItem || [])]},
    {id: 'body', at: [0, 0], amp: 2, freq: 0.7, shapes: [
      s(ell(0, -140, 46, 34), 'red'), s('M-50,-128 L50,-128 L80,170 L-80,170Z', saree),
      s('M-50,-150 L22,-150 L-58,60 L-82,40Z', pallu), s('M-80,150 L80,150 L80,170 L-80,170Z', 'gold'),
      s(ell(-25, 176, 22, 10), skin), s(ell(30, 176, 22, 10), skin)]},
    {id: 'head', parent: 'body', at: [0, -170], amp: 3, freq: 0.6, shapes: [
      s(ell(0, -48, 40, 46), skin), ...eye(-14, -52, 10, 4), ...eye(14, -52, 10, 4), s(ell(0, -74, 4, 4), 'red', flat),
      s('M-42,-58 Q0,-112 42,-58 Q30,-84 0,-88 Q-30,-84 -42,-58Z', 'hair'),
      ...(crown ? [s(poly([-36, -84], [36, -84], [26, -118], [0, -150], [-26, -118]), 'gold'), s(rr(-38, -92, 76, 12, 5), 'red')] : []),
      s(ell(-40, -36, 5, 7), 'gold', flat), s(ell(40, -36, 5, 7), 'gold', flat)]},
    {id: 'armFront', parent: 'body', at: [36, -120], base: frontBase, amp: 8, freq: 0.9, phase: 1, shapes: [...limb(95, 24, skin), ...(frontItem || [])]},
  ];
}
const bow = [s('M0,40 C70,70 70,190 0,220', 'gold', {...flat}), s(rr(-2, 40, 4, 180, 2), 'cream', flat)];
const thali = [s(ell(0, 104, 46, 12), 'gold'), s('M-18,98 Q0,118 18,98Z', 'gold', flat), s('M0,62 Q12,84 0,96 Q-12,84 0,62Z', '#FFB43A', flat), s(ell(-30, 100, 6, 6), 'red', flat), s(ell(30, 100, 6, 6), 'red', flat)];

function withFeather(parts) { return [...parts, feather]; }
function raiseArm(parts, base) { return parts.map(p => p.id === 'armFront' ? {...p, base, amp: 2} : p); }

const krishnaChakra = withFeather(deva({skin: 'krishna', robe: 'gold'}));
krishnaChakra.push({id: 'chakra', parent: 'armFront', at: [0, 112], spin: 160, shapes: [
  s(ell(0, 0, 34, 34), 'gold'), ...[0, 1, 2, 3].map(k => { const a = k * Math.PI / 4, c = Math.cos(a), n = Math.sin(a), q = (x, y) => [Math.round(x * c - y * n), Math.round(x * n + y * c)];
    return s(poly(q(-3, -30), q(3, -30), q(3, 30), q(-3, 30)), 'red', flat); }), s(ell(0, 0, 10, 10), 'red', flat)]});

Object.assign(CHARACTERS, {
  krishnaChakra: raiseArm(krishnaChakra, -150),
  krishnaLift: raiseArm(withFeather(deva({skin: 'krishna', robe: 'gold'})), -178).map(p => p.id === 'armFront' ? {...p, amp: 1, shapes: limb(215, 28, 'krishna')} : p),
  rama: (() => { const p = deva({skin: 'rama', robe: 'gold'}); p.push({id: 'bow', parent: 'armBack', at: [0, 0], shapes: bow}); return p; })(),
  satyabhama: woman({saree: 'saree4', crown: true, frontItem: bow, frontBase: -60}),
  sita: woman({saree: 'red', pallu: 'gold', crown: true, frontBase: -20}),
  yamuna: woman({saree: 'saree3', frontItem: thali, frontBase: -70}),
  yama: deva({skin: 'yamaSkin', robe: 'black', item: 'bless'}),
  narakasura: [
    ...CHARACTERS.asura.map(p => p.id === 'body' ? {...p, shapes: p.shapes.map(sh => sh.c === 'black' ? {...sh, c: 'narak'} : sh)} : p),
    {id: 'club', parent: 'armFront', at: [0, 106], base: 30, shapes: [s(rr(-7, -120, 14, 150, 6), 'rock'), s(ell(0, -130, 26, 34), 'rock')]},
  ],
  giri: [{id: 'body', at: [0, 0], amp: 2, freq: 0.6, shapes: [
    s('M-330,40 L-260,-50 L-200,-10 L-120,-160 L-50,-70 L30,-220 L110,-90 L190,-150 L270,-40 L330,40 C200,70 -200,70 -330,40Z', 'rock'),
    s('M-300,30 L-240,-30 L-180,0 L-110,-110 L-40,-40 L30,-160 L100,-60 L180,-100 L250,-20 L300,30Z', '#4E7A34', flat),
    ...[[-210, -40], [-120, -95], [-60, -20], [20, -120], [90, -40], [170, -70], [240, -10], [-260, 10], [140, 10], [-10, 10]].map(([x, y]) => s(poly([x, y - 34], [x + 16, y], [x - 16, y]), '#1F5A2A', flat)),
    s(ell(-150, 30, 24, 10), 'maroon', flat), s(ell(80, 34, 30, 10), 'maroon', flat)]}],
  annakut: [{id: 'body', at: [0, 0], amp: 1, freq: 0.6, shapes: [
    s(ell(0, 30, 160, 26), 'gold'),
    s('M-130,30 C-110,-60 -40,-130 0,-140 C40,-130 110,-60 130,30Z', 'food'),
    ...[[-60, -10, 'red'], [10, -60, 'green'], [60, -10, 'red'], [-20, -100, 'sunIn'], [0, 0, 'green'], [-80, 10, 'sunIn'], [80, 14, 'sunIn']].map(([x, y, c]) => s(ell(x, y, 14, 12), c, flat))]}],
});
export {CHARACTERS, PALETTES};
