// Figures for "दिवाली पर लक्ष्मी-गणेश पूजन क्यों?": Parvati, a standing Lakshmi for the folk-tale scenes,
// child Ganesha (two-armed), and a chowki. Reuses the Diwali / Dhanteras casts.
import '../diwali-ig/cast.mjs';
import {CHARACTERS, PALETTES} from '../../cast.mjs';
import {ell, rr, poly, s, flat, eye, limb} from '../../../story-styles/characters.mjs';

Object.assign(PALETTES.puppet, {parvati: '#E0A070', saree5: '#2F8A3B', snow: '#F3EEDD', chowki: '#B8261B'});
Object.assign(PALETTES.patta, {parvati: '#E7A06A', saree5: '#3E7A35', snow: '#FFF9EC', chowki: '#C2301F'});

function goddess(skin, saree, item) {
  return [
    {id: 'bun', parent: 'head', at: [0, 0], first: true, shapes: [s(ell(-30, -66, 26, 24), 'hair')]},
    {id: 'armBack', parent: 'body', at: [-36, -120], base: 18, amp: 5, freq: 0.8, first: true, shapes: limb(95, 24, skin)},
    {id: 'body', at: [0, 0], amp: 2, freq: 0.7, shapes: [
      s(ell(0, -140, 46, 34), 'red'), s('M-50,-128 L50,-128 L80,170 L-80,170Z', saree),
      s('M-50,-150 L22,-150 L-58,60 L-82,40Z', 'gold'), s('M-80,150 L80,150 L80,170 L-80,170Z', 'gold'),
      s(ell(-25, 176, 22, 10), skin), s(ell(30, 176, 22, 10), skin)]},
    {id: 'head', parent: 'body', at: [0, -170], amp: 3, freq: 0.6, shapes: [
      s(ell(0, -48, 40, 46), skin), ...eye(-14, -52, 10, 4), ...eye(14, -52, 10, 4), s(ell(0, -74, 4, 4), 'red', flat),
      s('M-42,-58 Q0,-112 42,-58 Q30,-84 0,-88 Q-30,-84 -42,-58Z', 'hair'),
      s(poly([-36, -84], [36, -84], [26, -118], [0, -150], [-26, -118]), 'gold'), s(rr(-38, -92, 76, 12, 5), 'red'),
      s(ell(-40, -36, 5, 7), 'gold', flat), s(ell(40, -36, 5, 7), 'gold', flat)]},
    {id: 'armFront', parent: 'body', at: [36, -120], base: -45, amp: 7, freq: 0.8, phase: 1, shapes: [...limb(95, 24, skin), ...(item || [])]},
  ];
}
const lotus = [s(ell(0, 110, 16, 24), 'lotus'), s(ell(-12, 106, 10, 18), 'lotus'), s(ell(12, 106, 10, 18), 'lotus')];
Object.assign(CHARACTERS, {
  parvati: goddess('parvati', 'saree5'),
  lakshmiStand: goddess('lakshmi', 'saree2', lotus),
  balGanesha: CHARACTERS.ganesha.filter(p => p.id !== 'armUL' && p.id !== 'armUR'),
  chowki: [{id: 'body', at: [0, 0], shapes: [s(rr(-230, -30, 460, 60, 10), 'chowki'), s(rr(-230, -30, 460, 14, 6), 'gold'), s(rr(-200, 30, 30, 70, 6), 'rock'), s(rr(170, 30, 30, 70, 6), 'rock')]}],
});
export {CHARACTERS, PALETTES};
