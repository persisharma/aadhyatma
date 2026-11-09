// Govardhan Puja from the app's govardhan-puja-katha: Krishna asks why Indra is worshipped, Vraj worships Govardhan
// and the cows, Indra's deluge, Krishna lifts the hill for seven days, Indra bows; payoff: the 56 bhog (popular belief).
// [character, x, y, scale, rotate, flip, motion, options]; labels: [x, y, text, size, t0]
import './cast.mjs';
const row = [130, 335, 540, 745, 950];
const lift = [['krishnaLift', 540, 1340, 1.1, 0, 1, 'idle'], ['giri', 595, 868, 0.95, 0, 1, 'idle']];
export const FOLK = {
  hook: {bg: 'sky', cast: [['giri', 540, 1300, 1.25, 0, 1, 'idle'], ['annakut', 540, 1600, 0.95, 0, 1, 'idle']], labels: [[540, 830, 'पहाड़ की पूजा?', 64, 0]]},
  indraPuja: {bg: 'home', cast: [['nanda', 330, 1330, 1.05, 0, 1, 'idle'], ['pots', 560, 1600, 0.7, 0, 1, 'idle'], ['krishnaPoint', 790, 1340, 1.0, 0, -1, 'idle']],
    labels: [[540, 830, 'इंद्र की पूजा', 52, 0.05]]},
  reason: {bg: 'sky', cast: [['giri', 720, 1380, 0.85, 0, 1, 'idle'], ['kamadhenu', 600, 1560, 0.6, 0, 1, 'idle'], ['krishnaPoint', 230, 1340, 1.0, 0, 1, 'idle']],
    labels: [[720, 1020, 'गोवर्धन', 52, 0.2]]},
  puja: {bg: 'sky', fx: ['petals'], cast: [['giri', 540, 1300, 0.9, 0, 1, 'idle'], ['gopi', 170, 1340, 0.95, 0, 1, 'idle'], ['gopi', 910, 1340, 0.95, 0, -1, 'idle'],
    ['annakut', 540, 1600, 0.85, 0, 1, 'popAt', {t0: 0.3}], ['kamadhenu', 300, 1600, 0.5, 0, 1, 'idle']]},
  indra: {bg: 'heaven', shake: [0.55], cast: [['airavata', 560, 1390, 1.0, 0, 1, 'idle'], ['indra', 510, 1150, 0.95, 0, 1, 'idle'],
    ['bolt', 220, 1000, 1.0, 0, 1, 'blink', {t0: 0.5}], ['bolt', 870, 950, 0.8, 0, -1, 'blink', {t0: 0.62}]]},
  rain: {bg: 'sky', fx: ['rain', 'dim'], shake: [0.2], cast: [['gopi', 220, 1340, 0.95, 0, 1, 'sigh'], ['kamadhenu', 520, 1560, 0.55, 0, 1, 'hungry'], ['gopi', 860, 1340, 0.95, 0, -1, 'sigh'],
    ['bolt', 540, 900, 0.9, 0, 1, 'blink', {t0: 0.1}]]},
  lift: {bg: 'sky', fx: ['rain'], cast: [['gopi', 230, 1360, 0.8, 0, 1, 'idle'], ['kamadhenu', 860, 1560, 0.55, 0, -1, 'idle'], ...lift.map(c => c[0] === 'giri' ? [...c.slice(0, 6), 'popAt', {t0: 0.25}] : c)],
    labels: [[540, 1760, 'गिरधारी', 50, 0.4]]},
  seven: {bg: 'sky', cast: [...lift, ['indraBow', 900, 1380, 0.85, 0, -1, 'appearLate'], ['gopi', 200, 1360, 0.8, 0, 1, 'idle']],
    labels: [[540, 1760, 'सात दिन · सात रात', 48, 0.02]]},
  bhog: {bg: 'home', cast: [['annakut', 540, 1560, 1.3, 0, 1, 'popAt', {t0: 0.6}], ...row.map(x => ['diya', x, 1700, 0.7, 0, 1, 'idle'])],
    labels: [[330, 860, '8 बार × 7 दिन', 50, 0.25], [760, 860, '= 56 भोग', 60, 0.62]]},
  cta: {bg: 'home', fx: ['petals'], cast: [['giri', 540, 1200, 0.7, 0, 1, 'idle'], ['annakut', 540, 1580, 1.0, 0, 1, 'idle'], ...row.map(x => ['diya', x, 1700, 0.7, 0, 1, 'idle'])]},
};
