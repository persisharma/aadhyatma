// Extra figures for the Instagram Diwali cut: Lakshmana, and the four-sided lamp lit for Yama on Naraka Chaturdashi.
import '../diwali/cast.mjs';
import {CHARACTERS, PALETTES, deva} from '../../cast.mjs';
import {ell, s, flat} from '../../../story-styles/characters.mjs';

Object.assign(PALETTES.puppet, {lakshmana: '#E3B07A'});
Object.assign(PALETTES.patta, {lakshmana: '#EDBF8A'});
const bow = [s('M0,40 C70,70 70,190 0,220', 'gold', {...flat}), s('M-2,40 L2,40 L2,220 L-2,220Z', 'cream', flat)];
const flame = (id, x, phase) => ({id, parent: 'base', at: [x, -10], amp: 7, freq: 2.6, phase, shapes: [s('M0,-56 Q22,-14 0,0 Q-22,-14 0,-56Z', '#FFB43A'), s(ell(0, -14, 5, 10), '#FFF3C4', flat)]});
Object.assign(CHARACTERS, {
  lakshmana: (() => { const p = deva({skin: 'lakshmana', robe: 'gold'}); p.push({id: 'bow', parent: 'armBack', at: [0, 0], shapes: bow}); return p; })(),
  chaumukha: [flame('f1', -44, 0), flame('f2', 44, 1.3), flame('f3', -15, 2.1), flame('f4', 15, 0.7),
    {id: 'base', at: [0, 0], shapes: [s('M-70,-6 Q0,50 70,-6Z', 'gold'), s(ell(0, -6, 70, 14), 'gold')]}],
});
export {CHARACTERS, PALETTES};
