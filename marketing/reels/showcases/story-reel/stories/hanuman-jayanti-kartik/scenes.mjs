// Kartik Hanuman Jayanti: "हनुमान जी का दूसरा जन्मदिन?" — Sita's blessing in Ashok Vatika (Ramcharitmanas, Sundar Kand),
// popularly held to have been on Kartik Krishna Chaturdashi. [character, x, y, scale, rotate, flip, motion, options]
import './cast.mjs';
const tree = ['ashokaTree', 770, 1340, 1.0, 0, 1, 'idle'];
const row = [130, 335, 540, 745, 950];
export const FOLK = {
  hook: {bg: 'night', cast: [['diya', 270, 1600, 1.2, 0, 1, 'idle'], ['diya', 810, 1600, 1.2, 0, 1, 'idle'], ['hanuman', 540, 1330, 1.3, 0, 1, 'idle']],
    labels: [[540, 830, 'दूसरा जन्मदिन?', 64, 0]]},
  vatika: {bg: 'night', cast: [tree, ['sitaSad', 320, 1330, 1.05, 0, 1, 'sigh']], labels: [[540, 800, 'अशोक वाटिका · लंका', 52, 0.05]]},
  ring: {bg: 'night', cast: [tree, ['sitaLook', 320, 1330, 1.05, 0, 1, 'idle'], ['mudrika', 540, 1540, 0.7, 0, 1, 'dropIn', {t0: 0.12, y0: 950, spinIn: 360}]],
    labels: [[540, 1740, 'श्रीराम की मुद्रिका', 44, 0.35]]},
  hanuman: {bg: 'night', cast: [tree, ['sitaLook', 320, 1330, 1.05, 0, 1, 'idle'], ['mudrika', 520, 1560, 0.5, 0, 1, 'idle'],
    ['hanuman', 720, 1532, 0.6, 0, -1, 'dropIn', {t0: 0.05, y0: 1000}]]},
  giant: {bg: 'night', shake: [0.6], cast: [['sitaLook', 250, 1330, 1.0, 0, 1, 'idle'], ['hanuman', 720, 1532, 0.6, 0, -1, 'grow', {t0: 0.55, s2: 2.0, ground: 1640, foot: 180}]]},
  blessing: {bg: 'night', fx: ['petals'], cast: [tree, ['sitaBless', 330, 1330, 1.05, 0, 1, 'idle'], ['hanuman', 640, 1532, 0.6, 0, -1, 'idle']],
    labels: [[540, 820, 'अजर · अमर', 60, 0.45]]},
  chalisa: {bg: 'home', cast: [['chalisa', 540, 1360, 1.2, 0, 1, 'popAt', {t0: 0}]], labels: [[540, 820, 'अष्ट सिद्धि · नव निधि', 54, 0.3]]},
  day: {bg: 'home', cast: [['hanuman', 540, 1380, 1.1, 0, 1, 'idle'], ...row.map((x, k) => ['diya', x, 1630, 0.8, 0, 1, 'popAt', {t0: 0.3 + 0.08 * k}])],
    labels: [[540, 830, 'कार्तिक कृष्ण चतुर्दशी', 54, 0.05]]},
  cta: {bg: 'home', fx: ['petals'], cast: [['chalisa', 540, 1400, 0.9, 0, 1, 'idle'], ...row.map(x => ['diya', x, 1690, 0.75, 0, 1, 'idle'])]},
};
