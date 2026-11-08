// "दिवाली पर लक्ष्मी-गणेश पूजन क्यों?" — Instagram format, puppet style.
// [character, x, y, scale, rotate, flip, motion, options]; labels: [x, y, text, size, appearAtFraction]
import './cast.mjs';
const xs = [140, 340, 540, 740, 940];
export const FOLK = {
  hook: {bg: 'home', cast: [['rama', 230, 1330, 1.05, 0, 1, 'idle'], ['chowki', 720, 1600, 0.95, 0, 1, 'idle'], ['lakshmi', 620, 1300, 0.72, 0, 1, 'idle'], ['ganesha', 860, 1400, 0.66, 0, 1, 'idle']],
    labels: [[540, 800, 'श्रीराम का पर्व, पूजा लक्ष्मी-गणेश की?', 54, 0]]},
  return: {bg: 'palace', cast: [['rama', 200, 1330, 1.0, 0, 1, 'walkIn'], ['sita', 360, 1350, 0.95, 0, 1, 'walkIn'], ['lakshmana', 520, 1335, 0.97, 0, 1, 'walkIn'], ['hanuman', 690, 1450, 0.85, 0, 1, 'walkIn'],
    ...[120, 290, 460, 630, 800, 960].map((x, k) => ['diya', x, 1615, 0.85, 0, 1, 'popAt', {t0: 0.35 + 0.06 * k}])]},
  lakshmi: {bg: 'ocean', cast: [['lakshmi', 540, 1180, 1.0, 0, 1, 'emerge'], ['waves', 540, 1430, 1, 0, 1, 'drift', {phase: 0}], ['waves2', 540, 1530, 1, 0, -1, 'drift', {phase: 2}]],
    labels: [[540, 820, 'कार्तिक अमावस्या', 54, 0.62]]},
  folk1: {bg: 'kailash', cast: [['lakshmiStand', 0, 1330, 1.1, 0, 1, 'walkTo', {x: 330}], ['parvati', 760, 1330, 1.1, 0, -1, 'idle'], ['balGanesha', 900, 1480, 0.55, 0, -1, 'idle']]},
  folk2: {bg: 'kailash', fx: ['petals'], cast: [['lakshmiStand', 330, 1330, 1.1, 0, 1, 'idle'], ['parvati', 780, 1330, 1.1, 0, -1, 'idle'], ['balGanesha', 900, 1480, 0.55, 0, 1, 'slideTo', {x: 560, t0: 0.15}]]},
  secret: {bg: 'home', cast: [['lakshmi', 540, 1300, 0.95, 0, 1, 'idle'], ...[[300, 0.35], [780, 0.45], [380, 0.6], [700, 0.7]].map(([x, t0]) => ['coins', x, 1580, 0.6, 0, 1, 'popAt', {t0}])],
    labels: [[540, 860, 'चंचला', 64, 0.45]]},
  meaning: {bg: 'home', cast: [['chowki', 540, 1600, 1.15, 0, 1, 'idle'], ['lakshmi', 400, 1300, 0.78, 0, 1, 'idle'], ['ganesha', 700, 1400, 0.74, 0, 1, 'idle'], ['coins', 540, 1560, 0.8, 0, 1, 'popAt', {t0: 0.6}]],
    labels: [[700, 940, 'बुद्धि · विवेक', 50, 0.05], [540, 820, 'स्थायी समृद्धि', 56, 0.75]]},
  rama: {bg: 'palace', cast: [['rama', 380, 1330, 1.1, 0, 1, 'idle'], ['sita', 680, 1350, 1.05, 0, -1, 'idle']],
    labels: [[380, 860, 'विष्णु अवतार', 48, 0.3], [680, 860, 'लक्ष्मी अवतार', 48, 0.6]]},
  close: {bg: 'home', fx: ['petals'], labels: [[600, 920, 'धन', 46, 0.15], [840, 1030, 'बुद्धि', 46, 0.3], [200, 880, 'प्रेरणा', 46, 0.45]], cast: [['rama', 200, 1330, 0.95, 0, 1, 'idle'], ['chowki', 700, 1600, 0.95, 0, 1, 'idle'], ['lakshmi', 600, 1300, 0.7, 0, 1, 'idle'], ['ganesha', 840, 1400, 0.64, 0, 1, 'idle'],
    ...xs.map(x => ['diya', x, 1720, 0.8, 0, 1, 'idle'])]},
};
