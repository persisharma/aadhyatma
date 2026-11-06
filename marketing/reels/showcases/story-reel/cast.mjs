// Extra original figures for the Hanuman-and-the-Sun story reel, in the same jointed-part format as
// ../story-styles/characters.mjs (pivot `at`, angle = base + amp·sin(2π·freq·t + phase) + spin·t).
import {CHARACTERS, PALETTES, ell, rr, poly, s, flat, eye, limb} from '../story-styles/characters.mjs';

Object.assign(PALETTES.puppet, {anjana: '#D98B55', vayu: '#6FA7CF', indra: '#E1A35E', brahma: '#D9873F', rahu: '#3A2A4E', elephant: '#ECE6D6', saree: '#2F8A3B', hair: '#1A0E08', beard: '#F3EEDD', cave: '#1E0A04'});
Object.assign(PALETTES.patta, {anjana: '#E7A06A', vayu: '#86BCE0', indra: '#F2BE7C', brahma: '#E59A4E', rahu: '#2B2244', elephant: '#FFF9EC', saree: '#3E7A35', hair: '#120B06', beard: '#FFF9EC', cave: '#14100C'});

export function deva({skin, robe = 'red', item, beard, scarf, sideHeads}) {
  const parts = [];
  if (scarf) parts.push({id: 'scarf', parent: 'body', at: [-40, -160], amp: 14, freq: 0.9, first: true, shapes: [s('M0,0 C-40,-30 -70,10 -110,-10 C-150,-30 -170,10 -210,-6 C-190,26 -160,34 -130,22 C-95,8 -70,44 -30,30 C-15,26 -5,22 0,24Z', scarf)]});
  parts.push({id: 'armBack', parent: 'body', at: [-48, -150], base: 14, amp: 5, freq: 0.7, first: true, shapes: limb(100, 28, skin)});
  if (sideHeads) for (const [n, x] of [[0, -58], [1, 58]]) parts.push({id: `side${n}`, parent: 'body', at: [x, -205], amp: 2, freq: 0.5, phase: n, first: true, shapes: [
    s(ell(0, -40, 34, 40), skin), s(poly([-30, -70], [30, -70], [20, -100], [0, -124], [-20, -100]), 'gold'), ...eye(-11, -44, 8, 4), ...eye(11, -44, 8, 4),
    ...(beard ? [s('M-28,-26 Q0,40 28,-26 Q0,-6 -28,-26Z', 'beard', flat)] : [])]});
  parts.push({id: 'body', at: [0, 0], amp: 1.5, freq: 0.5, shapes: [
    s(ell(0, -150, 60, 42), skin),
    s('M-58,-140 L58,-140 L88,170 L-88,170Z', robe),
    s('M-88,150 L88,150 L88,170 L-88,170Z', 'gold'),
    s(rr(-58, -62, 116, 20, 6), 'gold'),
    s('M-48,-178 Q0,-130 48,-178 L44,-164 Q0,-118 -44,-164Z', 'gold'),
    s(ell(-34, 176, 28, 11), skin), s(ell(38, 176, 28, 11), skin)]});
  parts.push({id: 'head', parent: 'body', at: [0, -190], amp: 3, freq: 0.5, shapes: [
    s(ell(0, -50, 46, 54), skin), ...eye(-16, -56, 12, 5), ...eye(16, -56, 12, 5),
    s('M-20,-24 C-10,-31 10,-31 20,-24 C10,-27 -10,-27 -20,-24Z', 'black', flat),
    ...(beard ? [s('M-40,-34 Q0,50 40,-34 Q0,-10 -40,-34Z', 'beard')] : []),
    s(poly([-44, -95], [44, -95], [34, -140], [0, -188], [-34, -140]), 'gold'), s(rr(-47, -106, 94, 16, 6), 'red'), s(ell(0, -130, 8, 8), 'green', flat)]});
  const hand = [];
  if (item === 'vajra') hand.push(s(rr(-6, 60, 12, 90, 4), 'gold'), s(ell(0, 56, 17, 17), 'gold'), s(ell(0, 154, 17, 17), 'gold'));
  if (item === 'book') hand.push(s(rr(-32, 88, 64, 42, 6), 'red'), s(rr(-28, 92, 56, 6, 2), 'gold', flat));
  if (item === 'bless') hand.push(s(ell(0, 108, 20, 24), skin), s(ell(0, 108, 6, 6), 'red', flat));
  parts.push({id: 'armFront', parent: 'body', at: [48, -150], base: item === 'vajra' ? -150 : -55, amp: 5, freq: 0.7, phase: 1, shapes: [...limb(100, 28, skin), ...hand]});
  return parts;
}

Object.assign(CHARACTERS, {
  anjana: [
    {id: 'bun', parent: 'head', at: [0, 0], first: true, shapes: [s(ell(-30, -66, 26, 24), 'hair')]},
    {id: 'armBack', parent: 'body', at: [-36, -120], base: 18, amp: 8, freq: 0.9, first: true, shapes: limb(95, 24, 'anjana')},
    {id: 'body', at: [0, 0], amp: 2, freq: 0.9, shapes: [
      s(ell(0, -140, 46, 34), 'red'),
      s('M-50,-128 L50,-128 L80,170 L-80,170Z', 'saree'),
      s('M-50,-150 L22,-150 L-58,60 L-82,40Z', 'gold'),
      s('M-80,150 L80,150 L80,170 L-80,170Z', 'gold'),
      s(ell(-25, 176, 22, 10), 'anjana'), s(ell(30, 176, 22, 10), 'anjana')]},
    {id: 'head', parent: 'body', at: [0, -170], amp: 3, freq: 0.6, shapes: [
      s(ell(0, -48, 40, 46), 'anjana'), ...eye(-14, -52, 10, 4), ...eye(14, -52, 10, 4),
      s(ell(0, -74, 4, 4), 'red', flat),
      s('M-42,-58 Q0,-112 42,-58 Q30,-84 0,-88 Q-30,-84 -42,-58Z', 'hair'),
      s(ell(-40, -36, 5, 7), 'gold', flat), s(ell(40, -36, 5, 7), 'gold', flat)]},
    {id: 'armFront', parent: 'body', at: [36, -120], base: -38, amp: 6, freq: 0.9, phase: 1, shapes: [
      ...limb(95, 24, 'anjana'), s('M-42,100 Q0,152 42,100Z', 'gold'),
      s(ell(-16, 96, 11, 11), 'red', flat), s(ell(6, 92, 11, 11), 'sunIn', flat), s(ell(24, 98, 10, 10), 'green', flat)]},
  ],
  vayu: deva({skin: 'vayu', robe: 'blue', scarf: 'sunIn'}),
  indra: deva({skin: 'indra', robe: 'red', item: 'vajra'}),
  indraBless: deva({skin: 'indra', robe: 'red', item: 'bless'}),
  brahma: deva({skin: 'brahma', robe: 'gold', item: 'book', beard: true, sideHeads: true}),
  rahu: [
    {id: 'trail', parent: 'head', at: [0, 0], amp: 8, freq: 1.4, first: true, shapes: [s('M60,10 C160,40 220,-30 300,20 C220,70 150,70 60,50Z', 'rahu')]},
    {id: 'head', at: [0, 0], amp: 4, freq: 0.9, shapes: [
      s(ell(0, 0, 95, 90), 'rahu'),
      s(poly([-70, -60], [70, -60], [55, -110], [0, -150], [-55, -110]), 'gold'),
      ...eye(-34, -12, 24, 10), ...eye(34, -12, 24, 10),
      s('M-46,34 Q0,64 46,34 Q0,46 -46,34Z', 'maroon', flat),
      s(poly([-30, 40], [-21, 70], [-12, 42]), 'white', flat), s(poly([12, 42], [21, 70], [30, 40]), 'white', flat)]},
  ],
  airavata: [
    {id: 'legsBack', parent: 'body', at: [0, 0], first: true, shapes: [s(rr(-120, 40, 46, 130, 16), 'elephant'), s(rr(70, 40, 46, 130, 16), 'elephant')]},
    {id: 'body', at: [0, 0], amp: 1.2, freq: 0.6, shapes: [
      s(ell(0, 0, 170, 110), 'elephant'),
      s(rr(-95, -112, 190, 64, 20), 'red'), s(rr(-95, -60, 190, 14, 6), 'gold'),
      s(rr(-80, 50, 48, 130, 16), 'elephant'), s(rr(110, 50, 48, 130, 16), 'elephant')]},
    {id: 'ear', parent: 'body', at: [150, -70], amp: 8, freq: 1.1, first: false, shapes: [s('M0,-30 C-70,-50 -90,40 -40,80 C-15,95 0,60 0,40Z', 'elephant'), s('M-10,-14 C-55,-28 -68,30 -36,60 C-20,70 -10,48 -10,32Z', 'pink', flat)]},
    {id: 'head', parent: 'body', at: [175, -40], amp: 2, freq: 0.6, shapes: [s(ell(0, 0, 80, 76), 'elephant'), ...eye(18, -20, 12, 5), s(poly([30, -78], [-30, -78], [0, -118]), 'gold')]},
    {id: 'tusk', parent: 'head', at: [40, 40], shapes: [s(poly([0, 0], [55, 30], [8, 16]), 'white')]},
    {id: 'trunk', parent: 'head', at: [45, 20], amp: 8, freq: 0.7, shapes: [s('M-22,0 C-10,80 40,140 80,130 C98,126 96,106 80,108 C50,112 22,60 24,0Z', 'elephant')]},
  ],
});
export {CHARACTERS, PALETTES};
