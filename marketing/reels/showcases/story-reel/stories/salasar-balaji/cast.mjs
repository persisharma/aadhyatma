// Original jointed figures for the Salasar Balaji reel (puppet style). The murti follows Salasar's darshan form:
// a sindoor face with large silver-rimmed eyes, beard and moustache, Vaishnav tilak and gold mukut, in a silver arch
// with mirror inlay under a golden chhatra (app text: svarup). Mohandas Ji, the bearded sadhu form, the Asota farmer
// and his wife, the Thakur, a Nagauri bullock with plough and cart, masons, dhuni, coconuts and Savamani laddoos.
import '../diwali-ig/cast.mjs';
import {CHARACTERS, PALETTES} from '../../cast.mjs';
import {ell, rr, poly, s, flat, eye, limb, mirror} from '../../../story-styles/characters.mjs';

const COLORS = {sindoor: '#E4571E', sindoorDk: '#B83A12', silver: '#C8CDD5', saffron: '#E8771E', bull: '#EEE7D8', bullDk: '#CFC6B3', horn: '#9A3A1E',
  wood: '#8A5428', wheelIn: '#3A1508', coco: '#7A4A26', cocoDk: '#5A3418', laddoo: '#E9A23B', turban: '#D4352A', turban2: '#E8B22E', safa: '#E8771E',
  ghaghra: '#C2306B', odhni: '#E0662A', kurta: '#F2E8D2', cloud: '#F3EEDD', mohan: '#D99A66', farmerSkin: '#B97A4C', thakurSkin: '#C98B5A',
  grayHair: '#DCD6C8', halo: '#FFD36B', marigold: '#F59A1B', rudra: '#6E3A1A', mud: '#4A2A12', brick: '#B5482A', mirrorBlue: '#2E6FB0'};
Object.assign(PALETTES.puppet, COLORS);
Object.assign(PALETTES.patta, COLORS);

const both = shape => [shape, {...shape, d: mirror(shape.d)}];
const rot = (pts, a) => pts.map(([x, y]) => [Math.round(x * Math.cos(a) - y * Math.sin(a)), Math.round(x * Math.sin(a) + y * Math.cos(a))]);
const rays = (n, r0, r1, r2) => Array.from({length: n}, (_, k) => { const a = k * 2 * Math.PI / n, p = (r, t) => [Math.round(r * Math.cos(t)), Math.round(r * Math.sin(t))];
  return s(poly(p(r0, a - 0.12), p(k % 2 ? r1 : r2, a), p(r0, a + 0.12)), k % 2 ? 'gold' : 'halo', flat); });

// Salasar Balaji's face, centred on (0,0): spans y -175 (forehead) to 205 (beard).
const face = [
  ...[-1, 1].flatMap(k => [s(ell(168 * k, 0, 26, 40), 'sindoor'), s(ell(172 * k, 52, 14, 20), 'gold', flat)]), // ears with kundal (mirror() would flip arc flags)
  s(ell(0, 0, 165, 175), 'sindoor'),
  ...both(s('M18,-72 Q62,-104 110,-68 Q62,-86 18,-62Z', 'black', flat)),
  ...[-62, 62].flatMap(x => [s(ell(x, -25, 48, 35), 'silver'), s(ell(x, -25, 40, 27), 'white', flat), s(ell(x, -22, 17, 17), 'black', flat), s(ell(x - 6, -28, 5, 5), 'white', flat)]),
  s('M-26,-150 L-10,-50 Q0,-38 10,-50 L26,-150 L14,-150 L4,-62 Q0,-56 -4,-62 L-14,-150Z', 'white', flat), s(rr(-4, -148, 8, 82, 3), 'red', flat),
  s('M0,-18 L-20,42 Q0,54 20,42Z', 'sindoorDk', flat),
  s('M-160,30 C-160,150 -80,205 0,205 C80,205 160,150 160,30 C130,100 70,135 0,135 C-70,135 -130,100 -160,30Z', 'black'),
  ...both(s('M0,72 C40,60 90,62 118,78 C132,86 136,62 124,48 C140,60 142,94 116,98 C80,104 40,90 0,92Z', 'black')),
  s(ell(0, 114, 22, 9), 'red', flat),
];
const mukut = [ // three tiers: pearl band, lobed gold band with gems, domed top with kalash
  s('M-100,-212 Q-100,-322 0,-348 Q100,-322 100,-212Z', 'gold'), s('M-70,-226 Q-70,-300 0,-318 Q70,-300 70,-226Z', 'red', flat), s(ell(0, -268, 16, 20), 'green', flat),
  s(poly([-8, -346], [8, -346], [0, -390]), 'gold'), s(ell(0, -352, 16, 12), 'gold'),
  s('M-156,-160 L-156,-212 Q-125,-246 -94,-212 Q-62,-252 -31,-212 Q0,-258 31,-212 Q62,-252 94,-212 Q125,-246 156,-212 L156,-160Z', 'gold'),
  ...[-125, -62, 0, 62, 125].map((x, k) => s(ell(x, -205, 9, 11), k % 2 ? 'green' : 'red', flat)),
  s(rr(-164, -170, 328, 30, 10), 'red'), ...[-128, -96, -64, -32, 0, 32, 64, 96, 128].map(x => s(ell(x, -155, 7, 7), 'white', flat)),
];
const bead = (n, rx, ry, y0, r, cols) => Array.from({length: n}, (_, k) => { const t = k * Math.PI / (n - 1); return s(ell(Math.round(rx * Math.cos(t)), Math.round(y0 + ry * Math.sin(t)), r, r), cols[k % cols.length], flat); });
const garland = [...bead(21, 238, 215, -40, 16, ['red', 'pink']), ...bead(17, 205, 175, -10, 17, ['marigold', 'gold'])]; // rose and marigold malas

// Murti in its silver arch: y from -690 (chhatra) to 150 (throne). Face centre at (0,-190).
const archDots = [...Array.from({length: 9}, (_, k) => [-277, 110 - k * 58]), ...Array.from({length: 9}, (_, k) => [277, 110 - k * 58]),
  ...Array.from({length: 11}, (_, k) => { const t = Math.PI + (k + 1) * Math.PI / 12; return [Math.round(277 * Math.cos(t)), Math.round(-420 + 235 * Math.sin(t))]; })];
const balajiMurti = [
  {id: 'frame', at: [0, 0], shapes: [
    s('M-300,140 L-300,-420 Q-300,-660 0,-685 Q300,-660 300,-420 L300,140Z', 'silver'),
    ...archDots.map(([x, y], k) => s(ell(x, y, 10, 10), ['mirrorBlue', 'green', 'red'][k % 3], flat)),
    s('M-255,120 L-255,-410 Q-255,-610 0,-632 Q255,-610 255,-410 L255,120Z', 'maroon'),
    s('M-205,-572 Q0,-725 205,-572Z', 'gold'), ...Array.from({length: 14}, (_, k) => s(ell(-195 + k * 30, -566, 9, 12), k % 2 ? 'red' : 'gold', flat)),
    s(rr(-5, -705, 10, 70, 3), 'gold'), s(ell(0, -708, 12, 14), 'gold'),
    s(rr(-275, 92, 550, 58, 12), 'gold'), s(rr(-275, 92, 550, 14, 6), 'silver', flat)]},
  {id: 'face', parent: 'frame', at: [0, -190], amp: 0.6, freq: 0.35, shapes: [...face, ...mukut]},
  {id: 'garland', parent: 'frame', at: [0, -190], amp: 1, freq: 0.5, shapes: garland},
];
// Face alone with a glow (the field revelation, the dreams): no crown, which came with the shrine.
const balajiReveal = [
  {id: 'halo', at: [0, 0], spin: 12, shapes: [...rays(18, 200, 255, 290), s(ell(0, 10, 212, 222), 'halo')]},
  {id: 'face', at: [0, 0], amp: 1, freq: 0.4, shapes: face},
];

function person({skin, robe, shawl, beard, moustache, hair = 'hair', jata, turban, kalgi, halo, sleep, tilak, mala, bigEyes, frontItem = [], frontBase = -55, frontAmp = 5, frontFreq = 0.7}) {
  const parts = [];
  if (halo) parts.push({id: 'halo', parent: 'head', at: [0, -50], spin: 18, first: true, shapes: [...rays(14, 70, 108, 128), s(ell(0, 0, 78, 78), 'halo')]});
  parts.push({id: 'armBack', parent: 'body', at: [-48, -150], base: 14, amp: 5, freq: 0.7, first: true, shapes: limb(100, 28, skin)});
  parts.push({id: 'body', at: [0, 0], amp: 1.5, freq: 0.5, shapes: [
    s(ell(0, -150, 60, 42), skin), s('M-58,-140 L58,-140 L88,170 L-88,170Z', robe),
    ...(shawl ? [s('M-58,-160 L34,-160 L-62,70 L-88,50Z', shawl)] : []),
    ...(mala ? Array.from({length: 11}, (_, k) => { const t = k * Math.PI / 10; return s(ell(Math.round(40 * Math.cos(t)), Math.round(-172 + 74 * Math.sin(t)), 6, 6), 'rudra', flat); }) : []),
    s(ell(-34, 176, 28, 11), skin), s(ell(38, 176, 28, 11), skin)]});
  const eyes = sleep ? [-16, 16].map(x => s(`M${x - 12},-54 Q${x},-46 ${x + 12},-54 Q${x},-50 ${x - 12},-54Z`, 'black', flat))
    : bigEyes ? [-17, 17].flatMap(x => [s(ell(x, -56, 15, 11), 'silver', flat), s(ell(x, -56, 12, 8), 'white', flat), s(ell(x, -55, 6, 6), 'black', flat)])
    : [...eye(-16, -56, 12, 5), ...eye(16, -56, 12, 5)];
  parts.push({id: 'head', parent: 'body', at: [0, -190], amp: 3, freq: 0.5, shapes: [
    ...(turban ? [s('M-46,-80 C-80,-60 -86,0 -70,40 L-56,36 C-66,0 -62,-50 -40,-70Z', turban)] : []),
    ...(jata ? [s(ell(0, -112, 26, 22), hair), s(rr(-26, -106, 52, 8, 3), 'rudra', flat)] : []),
    s(ell(0, -50, 46, 54), skin), ...eyes,
    ...(beard ? [s('M-44,-40 C-48,30 -20,60 0,64 C20,60 48,30 44,-40 C30,-18 16,-12 0,-12 C-16,-12 -30,-18 -44,-40Z', beard)] : []),
    ...(moustache ? both(s('M0,-22 C14,-30 32,-30 44,-20 C50,-14 52,-28 46,-34 C56,-26 56,-8 42,-8 C28,-8 14,-14 0,-14Z', moustache, flat)) : []),
    ...(turban ? [s('M-52,-64 C-66,-112 -30,-140 6,-138 C46,-136 66,-108 54,-64 C20,-80 -20,-80 -52,-64Z', turban), s('M-54,-86 C-10,-108 30,-108 58,-86 L58,-78 C30,-98 -10,-98 -54,-78Z', 'gold', flat)]
      : [s('M-46,-60 Q0,-118 46,-60 Q34,-92 0,-96 Q-34,-92 -46,-60Z', hair)]),
    ...(kalgi ? [s('M30,-128 C40,-170 60,-182 64,-168 C52,-160 46,-146 42,-126Z', 'white'), s(ell(32, -124, 7, 7), 'red', flat)] : []),
    ...(tilak ? [s('M-10,-90 L-5,-66 Q0,-62 5,-66 L10,-90 L5,-90 L2,-70 Q0,-68 -2,-70 L-5,-90Z', 'white', flat), s(rr(-1.5, -88, 3, 20, 1), 'red', flat)] : [])]});
  parts.push({id: 'armFront', parent: 'body', at: [48, -150], base: frontBase, amp: frontAmp, freq: frontFreq, phase: 1, shapes: [...limb(100, 28, skin), ...frontItem]});
  return parts;
}
const bless = skin => [s(ell(0, 108, 20, 24), skin), s(ell(0, 108, 6, 6), 'red', flat)];

// Asota farmer's wife: ghaghra and odhni; her front arm wipes with the odhni's edge.
const wife = [
  {id: 'veil', parent: 'head', at: [0, 0], first: true, shapes: [s('M-50,-60 C-70,0 -80,80 -60,140 L-20,140 C-40,60 -40,0 -30,-50Z', 'odhni')]},
  {id: 'armBack', parent: 'body', at: [-36, -120], base: 18, amp: 5, freq: 0.8, first: true, shapes: limb(95, 24, 'farmerSkin')},
  {id: 'body', at: [0, 0], amp: 2, freq: 0.7, shapes: [
    s(ell(0, -140, 46, 34), 'red'), s('M-46,-70 L46,-70 L104,170 L-104,170Z', 'ghaghra'), s('M-104,150 L104,150 L104,170 L-104,170Z', 'gold'),
    s('M-50,-150 L30,-150 L-70,60 L-98,40Z', 'odhni'), ...[[-40, 40], [0, 100], [50, 60], [-60, 130], [70, 130]].map(([x, y]) => s(ell(x, y, 7, 7), 'gold', flat)),
    s(ell(-25, 176, 22, 10), 'farmerSkin'), s(ell(30, 176, 22, 10), 'farmerSkin')]},
  {id: 'head', parent: 'body', at: [0, -170], amp: 3, freq: 0.6, shapes: [
    s(ell(0, -48, 40, 46), 'farmerSkin'), ...eye(-14, -52, 10, 4), ...eye(14, -52, 10, 4), s(ell(0, -74, 4, 4), 'red', flat), s(ell(9, -30, 6, 6), 'gold', flat),
    s('M-52,-30 C-62,-118 62,-118 52,-30 L44,-40 C40,-96 -40,-96 -44,-40Z', 'odhni'), s(ell(-40, -34, 5, 7), 'gold', flat)]},
  {id: 'armFront', parent: 'body', at: [36, -120], base: -62, amp: 16, freq: 1.5, phase: 1, shapes: [...limb(95, 24, 'farmerSkin'), s(ell(0, 108, 24, 15), 'odhni')]},
];

// Nagauri bullock facing right (feet at y +146), used by the plough and the cart.
const bull = (extraFirst = [], extraBody = []) => [
  ...extraFirst,
  ...[[95, 1.6], [-70, 0.2]].map(([x, ph], k) => ({id: `legFar${k}`, parent: 'body', at: [x, 30], amp: 18, freq: 1.3, phase: ph, first: true, shapes: limb(110, 26, 'bullDk')})),
  {id: 'tail', parent: 'body', at: [-128, -14], amp: 10, freq: 0.9, first: true, shapes: [s('M0,0 C-20,30 -24,80 -14,110 L-6,108 C-14,80 -10,34 6,6Z', 'bull'), s(ell(-12, 116, 8, 12), 'black', flat)]},
  {id: 'body', at: [0, 0], amp: 1, freq: 0.6, shapes: [
    s(ell(70, -58, 36, 28), 'bull'), s(ell(0, 0, 132, 64), 'bull'),
    s('M-80,-52 C-30,-68 30,-68 50,-52 L42,22 C0,32 -50,32 -86,22Z', 'red'), s('M-86,14 C-50,24 0,24 42,14 L42,22 C0,32 -50,32 -86,22Z', 'gold', flat), ...extraBody]},
  ...[[78, 0.1], [-88, 1.7]].map(([x, ph], k) => ({id: `leg${k}`, parent: 'body', at: [x, 30], amp: 18, freq: 1.3, phase: ph, shapes: limb(110, 26, 'bull')})),
  {id: 'head', parent: 'body', at: [118, -42], amp: 3, freq: 0.6, shapes: [
    s('M-40,-6 C0,-40 40,-24 50,10 L22,52 C0,42 -30,42 -42,30Z', 'bull'),
    s('M38,-22 C30,-58 46,-76 62,-72 C50,-64 48,-48 52,-24Z', 'horn'),
    s('M20,-20 C60,-30 100,0 105,30 C108,48 90,56 74,50 C50,42 30,30 20,10Z', 'bull'), s(ell(96, 36, 14, 12), 'pink', flat),
    s('M24,-10 C0,-22 -14,-4 -4,4 C6,6 16,0 24,-4Z', 'bullDk'), s(ell(56, 2, 5, 5), 'black', flat), s(ell(18, 52, 10, 12), 'gold')]},
];
const ploughTeam = bull(
  [{id: 'pole', at: [0, 0], first: true, shapes: [s(poly([104, -44], [104, -30], [-330, 92], [-330, 78]), 'wood'), s(poly([-342, 82], [-328, 82], [-380, -64], [-394, -64]), 'wood'), s(poly([-352, 76], [-300, 84], [-332, 150]), 'rock')]}],
  [s(rr(98, -74, 26, 52, 8), 'wood')]);
const wheel = Array.from({length: 4}, (_, k) => s(poly(...rot([[-5, -62], [5, -62], [5, 62], [-5, 62]], k * Math.PI / 4)), 'wood', flat));
const cart = bull(
  [{id: 'shaft', at: [0, 0], first: true, shapes: [s(poly([104, -46], [104, -32], [-200, 34], [-200, 20]), 'wood')]},
   {id: 'bed', at: [0, 0], first: true, shapes: [
     s(rr(-480, -12, 300, 36, 8), 'wood'), s(rr(-480, -64, 10, 56, 3), 'wood'), s(rr(-190, -64, 10, 56, 3), 'wood'),
     s('M-410,-12 Q-335,-200 -255,-12Z', 'red'), s('M-404,-24 Q-335,-40 -262,-24 L-260,-14 Q-335,-28 -406,-14Z', 'gold', flat),
     ...Array.from({length: 7}, (_, k) => s(ell(-380 + k * 15, -80 - Math.round(40 * Math.sin(k * Math.PI / 6)), 9, 9), k % 2 ? 'gold' : 'marigold', flat)),
     s(rr(-338, -250, 6, 110, 2), 'wood'), s(poly([-332, -250], [-262, -228], [-332, -206]), 'saffron')]},
   {id: 'wheel', parent: 'bed', at: [-330, 76], spin: 57.3 / 70, shapes: [s(ell(0, 0, 70, 70), 'wood'), s(ell(0, 0, 54, 54), 'wheelIn'), ...wheel, s(ell(0, 0, 13, 13), 'gold')]}],
  [s(rr(98, -76, 26, 52, 8), 'wood')]);

const temple = [
  {id: 'flag', parent: 'body', at: [0, -560], amp: 8, freq: 1.2, shapes: [s(rr(-3, -150, 6, 150, 2), 'wood'), s(poly([3, -150], [110, -122], [3, -94]), 'saffron')]},
  {id: 'body', at: [0, 0], shapes: [
    s(rr(-280, -20, 560, 60, 8), 'cream'),
    s('M-120,-240 Q-120,-460 0,-540 Q120,-460 120,-240Z', 'white'), ...[-60, 0, 60].map(x => s(rr(x - 3, -480 + Math.abs(x) * 0.9, 6, 230 - Math.abs(x), 2), 'cream', flat)),
    s(ell(0, -548, 16, 22), 'gold'),
    s(rr(-240, -250, 480, 232, 10), 'white'),
    ...[-200, 200].flatMap(x => [s(`M${x - 50},-250 Q${x - 50},-330 ${x},-350 Q${x + 50},-330 ${x + 50},-250Z`, 'white'), s(ell(x, -356, 8, 10), 'gold', flat)]),
    s('M-70,-18 L-70,-150 Q-70,-210 0,-215 Q70,-210 70,-150 L70,-18Z', 'silver'), s('M-50,-18 L-50,-140 Q-50,-190 0,-194 Q50,-190 50,-140 L50,-18Z', 'maroon'),
    s(ell(0, -120, 26, 30), 'sindoor', flat),
    ...[-170, -120, 120, 170].map(x => s(`M${x - 18},-60 L${x - 18},-140 Q${x},-170 ${x + 18},-140 L${x + 18},-60Z`, 'maroon', flat))]},
];

Object.assign(CHARACTERS, {
  balajiMurti, balajiReveal,
  mohandas: person({skin: 'mohan', robe: 'cream', shawl: 'saffron', beard: 'beard', moustache: 'beard', hair: 'grayHair', jata: true, tilak: true, mala: true, frontItem: bless('mohan')}),
  mohandasSleep: person({skin: 'mohan', robe: 'cream', shawl: 'saffron', beard: 'beard', moustache: 'beard', hair: 'grayHair', jata: true, tilak: true, mala: true, sleep: true, frontBase: -20}),
  balajiSadhu: person({skin: 'sindoor', robe: 'saffron', shawl: 'red', beard: 'black', moustache: 'black', hair: 'black', jata: true, tilak: true, mala: true, halo: true, bigEyes: true, frontItem: bless('sindoor')}),
  thakur: person({skin: 'thakurSkin', robe: 'white', shawl: 'red', moustache: 'black', turban: 'safa', kalgi: true, sleep: true, frontBase: -20}),
  farmer: person({skin: 'farmerSkin', robe: 'kurta', moustache: 'black', turban: 'turban', frontBase: -78, frontAmp: 3}),
  farmerWatch: person({skin: 'farmerSkin', robe: 'kurta', moustache: 'black', turban: 'turban', frontBase: -30}),
  wife,
  mason: person({skin: 'farmerSkin', robe: 'kurta', moustache: 'black', turban: 'turban', frontItem: [s(rr(-5, 70, 10, 80, 3), 'wood'), s(rr(-26, 140, 52, 22, 6), 'rock')], frontBase: -115, frontAmp: 26, frontFreq: 1.6}),
  mason2: person({skin: 'thakurSkin', robe: 'kurta', shawl: 'blue', moustache: 'black', turban: 'turban2', frontItem: [s(rr(-28, 96, 56, 30, 4), 'brick')], frontBase: -70, frontAmp: 12, frontFreq: 1}),
  ploughTeam, cart, temple,
  stone: [{id: 'body', at: [0, 0], shapes: [
    s('M-130,130 C-150,20 -120,-120 -10,-140 C96,-150 150,-40 140,66 C136,120 108,140 -130,130Z', 'rock'),
    ...[[-60, -60, 34, 22], [40, 20, 46, 26], [-50, 70, 40, 20], [70, -80, 24, 16]].map(([x, y, rx, ry]) => s(ell(x, y, rx, ry), 'mud', flat))]}],
  cloud: [{id: 'body', at: [0, 0], amp: 2, freq: 0.5, shapes: [
    s(ell(-150, 120, 22, 18), 'cloud'), s(ell(-196, 170, 14, 12), 'cloud'),
    s(ell(-100, 10, 80, 62), 'cloud'), s(ell(100, 10, 80, 62), 'cloud'), s(ell(0, -30, 110, 84), 'cloud'), s(ell(0, 40, 140, 58), 'cloud')]}],
  dhuni: [
    {id: 'trishul', at: [0, 0], first: true, shapes: [s(rr(-110, -300, 8, 330, 3), 'black'), s('M-136,-300 Q-106,-270 -76,-300 L-80,-330 Q-106,-290 -132,-330Z', 'gold'), s(poly([-112, -300], [-100, -300], [-106, -350]), 'gold'), s(rr(-118, -250, 32, 26, 4), 'red', flat)]},
    {id: 'flame', parent: 'base', at: [0, -10], amp: 6, freq: 2.2, shapes: [s('M-60,0 C-70,-60 -30,-90 -20,-150 C0,-100 30,-120 20,-170 C70,-110 70,-40 60,0Z', '#FFB43A'), s('M-30,0 C-30,-40 0,-60 4,-100 C30,-60 34,-30 30,0Z', '#FFF3C4', flat)]},
    {id: 'base', at: [0, 0], shapes: [s('M-150,40 Q0,-40 150,40Z', 'rock'), s(ell(0, 30, 120, 18), 'mud', flat)]},
  ],
  coconuts: [{id: 'body', at: [0, 0], amp: 1.5, freq: 0.6, shapes: [
    s(rr(-470, -12, 940, 22, 8), 'wood'), s(rr(-430, 170, 860, 20, 8), 'wood'),
    ...[[0, 0], [1, 182]].flatMap(([row, y]) => Array.from({length: row ? 9 : 10}, (_, k) => { const x = -420 + k * 93 + row * 46, h = 34 + ((k + row) % 3) * 22;
      return [s(rr(x - 2, y + 8, 4, h, 2), 'red', flat), s(ell(x, y + h + 34, 30, 36), 'coco'), s(ell(x, y + h + 8, 14, 9), 'cocoDk', flat), s(rr(x - 30, y + h + 28, 60, 7, 3), 'red', flat)]; }).flat())]}],
  savamani: [{id: 'body', at: [0, 0], shapes: [
    s(ell(0, 30, 190, 34), 'gold'), s(ell(0, 22, 160, 20), 'brass', flat),
    ...[6, 5, 4, 3, 2, 1].flatMap((n, row) => Array.from({length: n}, (_, k) => s(ell(Math.round((k - (n - 1) / 2) * 46), 0 - row * 38, 24, 22), 'laddoo'))),
    s(ell(0, -232, 10, 10), 'green', flat)]}],
});
export {CHARACTERS, PALETTES};
