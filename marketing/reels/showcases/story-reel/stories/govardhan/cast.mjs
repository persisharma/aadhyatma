// Figures for the Govardhan Puja reel (puppet style), reusing the Diwali (Krishna, Govardhan, annakut), Dhanteras
// (cow, diya), Hanuman-Surya (Indra, Airavata) and Salasar (gopi, turbaned elder) casts.
import '../diwali-ig/cast.mjs';
import {person} from '../salasar-balaji/cast.mjs';
import {CHARACTERS, PALETTES} from '../../cast.mjs';
import {s, flat, poly} from '../../../story-styles/characters.mjs';

Object.assign(PALETTES.puppet, {bolt: '#FFF3B0'});
Object.assign(PALETTES.patta, {bolt: '#FFF3B0'});
Object.assign(CHARACTERS, {
  krishnaPoint: CHARACTERS.krishnaChakra.filter(p => p.id !== 'chakra'),
  nanda: person({skin: 'thakurSkin', robe: 'white', shawl: 'gold', beard: 'beard', moustache: 'beard', turban: 'turban2', frontBase: -40}),
  gopi: CHARACTERS.wife.map(p => p.id === 'armFront' ? {...p, base: -30, amp: 6, freq: 0.7} : p),
  indraBow: CHARACTERS.indraBless,
  bolt: [{id: 'body', at: [0, 0], shapes: [s(poly([0, -260], [60, -260], [10, -90], [70, -90], [-40, 140], [-5, -40], [-60, -40]), 'bolt'), s(poly([20, -230], [40, -230], [0, -100], [10, -100]), 'white', flat)]}],
});
export {CHARACTERS, PALETTES};
