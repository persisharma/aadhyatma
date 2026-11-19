// Story version: Lakshmi is चंचला; through the folk tale of her ममता for child Ganesha she vows to stay where
// Ganesha (बुद्धि) is honoured. [character, x, y, scale, rotate, flip, motion, options]; labels: [x, y, text, size, t0]
import './cast.mjs';
const xs = [140, 340, 540, 740, 940];
export const FOLK = {
  hook: {bg: 'home', cast: [['rama', 230, 1330, 1.05, 0, 1, 'idle'], ['chowki', 720, 1600, 0.95, 0, 1, 'idle'], ['lakshmi', 620, 1300, 0.72, 0, 1, 'idle'], ['ganesha', 860, 1400, 0.66, 0, 1, 'idle']]},
  return: {bg: 'palace', cast: [['rama', 200, 1330, 1.0, 0, 1, 'walkIn'], ['sita', 360, 1350, 0.95, 0, 1, 'walkIn'], ['lakshmana', 520, 1335, 0.97, 0, 1, 'walkIn'], ['hanuman', 690, 1450, 0.85, 0, 1, 'walkIn'],
    ...[120, 290, 460, 630, 800, 960].map((x, k) => ['diya', x, 1615, 0.85, 0, 1, 'popAt', {t0: 0.35 + 0.06 * k}])]},
  lakshmi: {bg: 'ocean', cast: [['lakshmi', 540, 1180, 1.0, 0, 1, 'emerge'], ['waves', 540, 1430, 1, 0, 1, 'drift', {phase: 0}], ['waves2', 540, 1530, 1, 0, -1, 'drift', {phase: 2}]]},
  chanchala: {bg: 'night', cast: [['lakshmiStand', 0, 1330, 1.05, 0, 1, 'wander'],
    ...[[220, 0.15], [540, 0.4], [860, 0.65]].map(([x, t0]) => ['coins', x, 1600, 0.6, 0, 1, 'blink', {t0}])], labels: [[540, 860, 'चंचला', 66, 0.4]]},
  longing: {bg: 'home', cast: [['lakshmiStand', 540, 1330, 1.15, 0, 1, 'sigh']], labels: [[540, 860, 'ममता', 66, 0.5]]},
  kailash: {bg: 'kailash', cast: [['lakshmiStand', 0, 1330, 1.1, 0, 1, 'walkTo', {x: 300}], ['parvati', 780, 1330, 1.1, 0, -1, 'idle'], ['balGanesha', 600, 1480, 0.55, 0, 1, 'play']]},
  parvati: {bg: 'kailash', cast: [['lakshmiStand', 300, 1330, 1.1, 0, 1, 'idle'], ['parvati', 780, 1330, 1.1, 0, -1, 'idle'], ['balGanesha', 600, 1480, 0.55, 0, 1, 'play']]},
  embrace: {bg: 'kailash', fx: ['petals'], cast: [['lakshmiStand', 360, 1330, 1.1, 0, 1, 'idle'], ['parvati', 800, 1330, 1.05, 0, -1, 'idle'], ['balGanesha', 600, 1480, 0.55, 0, -1, 'slideTo', {x: 430, t0: 0.05}]]},
  vow: {bg: 'home', cast: [['lakshmiStand', 400, 1330, 1.1, 0, 1, 'idle'], ['balGanesha', 680, 1470, 0.6, 0, -1, 'idle'], ['coins', 680, 1610, 0.7, 0, 1, 'popAt', {t0: 0.65}]],
    labels: [[540, 860, 'जहाँ गणेश, वहाँ लक्ष्मी', 54, 0.62]]},
  payoff: {bg: 'home', cast: [['chowki', 540, 1600, 1.15, 0, 1, 'idle'], ['lakshmi', 400, 1300, 0.78, 0, 1, 'idle'], ['ganesha', 700, 1400, 0.74, 0, 1, 'idle'], ['coins', 540, 1560, 0.8, 0, 1, 'popAt', {t0: 0.6}]],
    labels: [[700, 940, 'बुद्धि · विवेक', 50, 0.05], [540, 820, 'धन टिकता है', 56, 0.6]]},
  rama: {bg: 'palace', cast: [['rama', 380, 1330, 1.1, 0, 1, 'idle'], ['sita', 680, 1350, 1.05, 0, -1, 'idle']],
    labels: [[380, 860, 'विष्णु अवतार', 48, 0.3], [680, 860, 'लक्ष्मी अवतार', 48, 0.55]]},
  close: {bg: 'home', fx: ['petals'], labels: [[200, 880, 'राम', 46, 0.15], [600, 920, 'लक्ष्मी', 46, 0.3], [840, 1030, 'गणेश', 46, 0.4]], cast: [['rama', 200, 1330, 0.95, 0, 1, 'idle'], ['chowki', 700, 1600, 0.95, 0, 1, 'idle'], ['lakshmi', 600, 1300, 0.7, 0, 1, 'idle'], ['ganesha', 840, 1400, 0.64, 0, 1, 'idle'],
    ...xs.map(x => ['diya', x, 1720, 0.8, 0, 1, 'idle'])]},
};
