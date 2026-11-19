// Original jointed figures for the Dhanteras / Dhanvantari katha reel (puppet style), in the part format of
// ../../../story-styles/characters.mjs. Iconography follows the app's dhanteras-legends.ts text: dark-bodied
// Dhanvantari in yellow, four arms with conch and discus, the amrit kalash held before him.
import {CHARACTERS, PALETTES} from '../../cast.mjs';
import {ell, rr, poly, s, flat, eye, limb} from '../../../story-styles/characters.mjs';

Object.assign(PALETTES.puppet, {shyam: '#2E4C8C', pitambar: '#E8B22E', asura: '#3B6B3A', deva: '#E1A35E', naga: '#2E7D6B', rock: '#6B3B1C', shell: '#3E7A35', turtle: '#7FA35A',
  cow: '#F1EBDD', lotus: '#E8889A', lakshmi: '#E0A070', saree2: '#B8264E', brass: '#D99A2B', copper: '#C0642A', sea: '#1D4F66', sea2: '#2E7D9A', moon: '#F6EBC8'});
Object.assign(PALETTES.patta, {shyam: '#2B4A86', pitambar: '#F0B53C', asura: '#3E7A35', deva: '#F2BE7C', naga: '#2E7D6B', rock: '#7A4A24', shell: '#3E7A35', turtle: '#8DB066',
  cow: '#FFF9EC', lotus: '#F0A0B0', lakshmi: '#E7A06A', saree2: '#C2306B', brass: '#F0B53C', copper: '#D0743A', sea: '#22356F', sea2: '#3D5FA0', moon: '#FFF4D6'});

const wave = (w, h) => { let d = `M${-w / 2},0`; for (let x = -w / 2; x < w / 2; x += 100) d += ` a50,38 0 0 1 100,0`; return d + ` L${w / 2},${h} L${-w / 2},${h}Z`; };
function puller(skin, demon) {
  return [
    {id: 'armBack', parent: 'body', at: [-20, -150], base: -95, amp: 4, freq: 1.2, first: true, shapes: limb(100, 28, skin)},
    {id: 'body', at: [0, 0], shapes: [
      s(ell(0, -150, 58, 40), skin),
      s('M-56,-140 L56,-140 L82,170 L-82,170Z', demon ? 'black' : 'red'),
      s('M-82,150 L82,150 L82,170 L-82,170Z', 'gold'), s(rr(-56, -62, 112, 20, 6), 'gold'),
      s(ell(-30, 176, 28, 11), skin), s(ell(36, 176, 28, 11), skin)]},
    {id: 'head', parent: 'body', at: [0, -190], amp: 3, freq: 0.8, shapes: [
      s(ell(0, -50, 44, 52), skin), ...eye(-15, -56, 12, 5), ...eye(15, -56, 12, 5),
      ...(demon
        ? [s(poly([-40, -88], [-62, -138], [-22, -98]), 'white'), s(poly([40, -88], [62, -138], [22, -98]), 'white'),
          s('M-30,-24 C-12,-36 12,-36 30,-24 C38,-12 26,-14 18,-20 C8,-24 -8,-24 -18,-20 C-26,-14 -38,-12 -30,-24Z', 'black', flat),
          s(poly([-14, -14], [-8, 4], [-2, -14]), 'white', flat), s(poly([2, -14], [8, 4], [14, -14]), 'white', flat)]
        : [s('M-20,-24 C-10,-31 10,-31 20,-24 C10,-27 -10,-27 -20,-24Z', 'black', flat),
          s(poly([-42, -95], [42, -95], [32, -138], [0, -182], [-32, -138]), 'gold'), s(rr(-45, -106, 90, 16, 6), 'red')])]},
    {id: 'armFront', parent: 'body', at: [40, -150], base: -88, amp: 4, freq: 1.2, phase: 0.6, shapes: limb(100, 28, skin)},
  ];
}

Object.assign(CHARACTERS, {
  dhanvantari: [
    {id: 'halo', parent: 'body', at: [0, -250], spin: 10, first: true, shapes: [
      s(ell(0, 0, 96, 96), 'gold'), s(ell(0, 0, 80, 80), 'sunIn'),
      ...Array.from({length: 16}, (_, k) => { const a = k * Math.PI / 8; return s(ell(Math.round(88 * Math.cos(a)), Math.round(88 * Math.sin(a)), 5, 5), 'cream', flat); })]},
    {id: 'armUL', parent: 'body', at: [-55, -170], base: 140, amp: 5, freq: 0.7, first: true, shapes: [
      ...limb(90, 26, 'shyam'), s('M0,96 C24,62 60,74 54,104 C48,132 14,136 2,120 C-8,110 -6,100 0,96Z', 'white'), s('M12,104 C24,92 38,98 34,110', 'white', flat)]},
    {id: 'armUR', parent: 'body', at: [55, -170], base: -140, amp: 5, freq: 0.7, phase: 1.4, first: true, shapes: limb(90, 26, 'shyam')},
    {id: 'chakra', parent: 'armUR', at: [0, 112], spin: 90, shapes: [
      s(ell(0, 0, 34, 34), 'gold'),
      ...[0, 1, 2, 3].map(k => { const a = k * Math.PI / 4, c = Math.cos(a), n = Math.sin(a), q = (x, y) => [Math.round(x * c - y * n), Math.round(x * n + y * c)];
        return s(poly(q(-3, -30), q(3, -30), q(3, 30), q(-3, 30)), 'red', flat); }),
      s(ell(0, 0, 10, 10), 'red', flat)]},
    {id: 'body', at: [0, 0], amp: 1.5, freq: 0.5, shapes: [
      s(ell(0, -150, 64, 44), 'shyam'),
      s('M-60,-140 L60,-140 L92,172 L-92,172Z', 'pitambar'),
      s('M-92,150 L92,150 L92,172 L-92,172Z', 'red'),
      s('M-50,-182 Q0,-130 50,-182 L46,-166 Q0,-118 -46,-166Z', 'gold'),
      s('M-64,-128 C-20,-60 20,-60 64,-128 L58,-108 C20,-44 -20,-44 -58,-108Z', 'green', flat),
      s(ell(-34, 178, 30, 11), 'shyam'), s(ell(38, 178, 30, 11), 'shyam')]},
    {id: 'head', parent: 'body', at: [0, -192], amp: 3, freq: 0.5, shapes: [
      s(ell(0, -50, 48, 55), 'shyam'), ...eye(-16, -56, 12, 5), ...eye(16, -56, 12, 5),
      s('M-14,-26 Q0,-16 14,-26 Q0,-22 -14,-26Z', 'red', flat), s('M0,-90 L-7,-74 L7,-74Z', 'red', flat),
      s(poly([-46, -96], [46, -96], [36, -142], [0, -194], [-36, -142]), 'gold'), s(rr(-49, -108, 98, 16, 6), 'red'), s(ell(0, -134, 9, 9), 'green', flat)]},
    {id: 'armLL', parent: 'body', at: [-52, -150], base: -32, amp: 2, freq: 0.6, shapes: limb(82, 26, 'shyam')},
    {id: 'armLR', parent: 'body', at: [52, -150], base: 32, amp: 2, freq: 0.6, phase: 0.3, shapes: limb(82, 26, 'shyam')},
    {id: 'kalash', parent: 'body', at: [0, -28], amp: 3, freq: 0.8, shapes: [
      s('M-30,-52 C-50,-90 -10,-96 0,-70 C10,-96 50,-90 30,-52Z', 'green'),
      s(rr(-26, -50, 52, 16, 6), 'gold'), s(ell(0, -4, 50, 44), 'gold'), s(ell(0, -4, 28, 10), 'red', flat), s(ell(0, -56, 18, 8), 'cream', flat)]},
  ],
  asura: puller('asura', true),
  devaPull: puller('deva', false),
  mandara: [{id: 'body', at: [0, 0], shapes: [
    s('M-150,300 L-62,-250 Q0,-318 62,-250 L150,300Z', 'rock'),
    s(ell(-40, -80, 22, 14), 'maroon', flat), s(ell(50, 40, 26, 16), 'maroon', flat), s(ell(-60, 160, 30, 16), 'maroon', flat), s(ell(30, -190, 16, 10), 'maroon', flat)]}],
  vasuki: [{id: 'body', at: [0, 0], shapes: [
    s('M-430,-14 C-300,-40 -180,12 -60,-14 L60,-14 C180,-40 300,12 400,-10 L430,0 C300,30 180,-20 60,16 L-60,16 C-180,40 -300,-12 -430,16Z', 'naga'),
    s(poly([-90, -90], [-40, -110], [90, 70], [40, 90]), 'naga'), s(poly([-90, 60], [-40, 80], [90, -80], [40, -100]), 'naga'),
    s(ell(-450, 0, 46, 34), 'naga'), s(ell(-462, -6, 8, 8), 'gold', flat), s('M-494,4 L-530,-6 L-520,4 L-530,14Z', 'red', flat)]}],
  kurma: [{id: 'body', at: [0, 0], amp: 1, freq: 0.4, shapes: [
    s(ell(-190, 10, 36, 26), 'turtle'), s(ell(-210, 4, 5, 5), 'black', flat),
    s(ell(-120, 60, 30, 20), 'turtle'), s(ell(120, 60, 30, 20), 'turtle'),
    s('M-170,40 C-170,-80 170,-80 170,40Z', 'shell'),
    ...[-100, -34, 34, 100].map(x => s(ell(x, -4, 26, 20), 'turtle', flat))]}],
  waves: [{id: 'body', at: [0, 0], shapes: [s(wave(1500, 400), 'sea')]}],
  waves2: [{id: 'body', at: [0, 0], shapes: [s(wave(1500, 400), 'sea2')]}],
  kamadhenu: [
    {id: 'body', at: [0, 0], amp: 1.5, freq: 0.6, shapes: [
      s(rr(-90, 30, 26, 100, 10), 'cow'), s(rr(56, 30, 26, 100, 10), 'cow'),
      s(ell(0, 0, 112, 62), 'cow'), s(rr(-70, -48, 140, 40, 14), 'red'), s(rr(-70, -14, 140, 8, 4), 'gold', flat),
      s(rr(-60, 34, 26, 104, 10), 'cow'), s(rr(80, 34, 26, 104, 10), 'cow'),
      s('M-110,-10 C-150,10 -150,70 -136,90 L-128,86 C-138,60 -134,20 -104,6Z', 'cow')]},
    {id: 'head', parent: 'body', at: [104, -30], amp: 4, freq: 0.7, shapes: [
      s('M10,-50 C0,-90 -20,-96 -26,-80 C-14,-78 -6,-66 0,-46Z', 'gold'), s('M40,-50 C50,-90 70,-96 76,-80 C64,-78 56,-66 50,-46Z', 'gold'),
      s(ell(26, -10, 40, 46), 'cow'), s(ell(30, 24, 26, 18), 'lotus'), ...eye(14, -18, 10, 4), ...eye(40, -18, 10, 4), s(ell(26, -54, 7, 7), 'red', flat)]},
  ],
  kaustubha: [{id: 'rays', at: [0, 0], spin: 25, shapes: Array.from({length: 12}, (_, k) => {
    const a = k * Math.PI / 6, p = (r, t) => [Math.round(r * Math.cos(t)), Math.round(r * Math.sin(t))];
    return s(poly(p(46, a - 0.12), p(k % 2 ? 80 : 98, a), p(46, a + 0.12)), 'gold'); })},
    {id: 'gem', at: [0, 0], amp: 4, freq: 1, shapes: [s(poly([0, -54], [44, -16], [30, 46], [-30, 46], [-44, -16]), 'red'), s(poly([0, -54], [16, -16], [0, 46], [-16, -16]), 'saree2', flat)]}],
  lakshmi: [
    {id: 'body', at: [0, 0], amp: 1.5, freq: 0.5, shapes: [
      ...[-120, -70, -20, 30, 80, 120].map((x, k) => s(ell(x, 150, 44, 26), k % 2 ? 'lotus' : 'cream')),
      s('M-120,150 C-60,110 60,110 120,150 C60,176 -60,176 -120,150Z', 'lotus'),
      s(ell(0, -140, 46, 34), 'red'), s('M-50,-128 L50,-128 L96,138 L-96,138Z', 'saree2'),
      s('M-50,-150 L22,-150 L-62,60 L-86,40Z', 'gold'), s('M-96,120 L96,120 L96,138 L-96,138Z', 'gold')]},
    {id: 'head', parent: 'body', at: [0, -170], amp: 2, freq: 0.5, shapes: [
      s(ell(0, -48, 40, 46), 'lakshmi'), ...eye(-14, -52, 10, 4), ...eye(14, -52, 10, 4), s(ell(0, -74, 4, 4), 'red', flat),
      s(poly([-40, -86], [40, -86], [30, -126], [0, -168], [-30, -126]), 'gold'), s(rr(-42, -96, 84, 14, 6), 'red')]},
    {id: 'armL', parent: 'body', at: [-38, -120], base: 150, amp: 4, freq: 0.6, shapes: [...limb(80, 24, 'lakshmi'), s(ell(0, 104, 16, 24), 'lotus'), s(ell(-12, 100, 10, 18), 'lotus'), s(ell(12, 100, 10, 18), 'lotus')]},
    {id: 'armR', parent: 'body', at: [38, -120], base: -40, amp: 4, freq: 0.6, phase: 1, shapes: [...limb(80, 24, 'lakshmi'),
      ...[0, 1, 2, 3].map(k => s(ell(-6 + k * 7, 120 + k * 26, 11, 6), 'gold', flat))]},
  ],
  moon: [{id: 'body', at: [0, 0], amp: 2, freq: 0.3, shapes: [s('M0,-90 A90,90 0 1,0 0,90 A64,90 0 1,1 0,-90Z', 'moon')]}],
  diya: [
    {id: 'flame', parent: 'base', at: [0, -6], amp: 7, freq: 2.6, shapes: [s('M0,-62 Q24,-16 0,0 Q-24,-16 0,-62Z', '#FFB43A'), s(ell(0, -16, 6, 11), '#FFF3C4', flat)]},
    {id: 'base', at: [0, 0], shapes: [s('M-54,0 Q0,50 54,0Z', 'gold')]},
  ],
  pots: [{id: 'body', at: [0, 0], amp: 1, freq: 0.6, shapes: [
    s(ell(-150, 40, 70, 64), 'copper'), s(rr(-180, -40, 60, 22, 8), 'copper'), s(ell(-150, -42, 40, 10), 'copper'),
    s(ell(0, 30, 92, 84), 'brass'), s(rr(-40, -70, 80, 26, 10), 'brass'), s(ell(0, -72, 52, 12), 'brass'),
    s('M-34,-80 C-56,-130 -10,-136 0,-104 C10,-136 56,-130 34,-80Z', 'green'),
    s(ell(160, 70, 74, 22), 'brass'), s(ell(160, 62, 60, 14), 'gold', flat),
    s(ell(0, 30, 30, 12), 'red', flat)]}],
  coins: [{id: 'body', at: [0, 0], shapes: [0, 1, 2, 3, 4, 5].map(k => s(ell((k % 2) * 8, -k * 16, 46, 14), 'gold')).concat([s(ell(70, 0, 40, 12), 'gold'), s(ell(70, -14, 40, 12), 'gold')])}],
});

export {CHARACTERS, PALETTES};
