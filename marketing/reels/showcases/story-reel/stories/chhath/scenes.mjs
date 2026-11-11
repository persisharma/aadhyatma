// Puppet version of the Chhath reel (same script as the AI-image version). Frame 1: the grieving king, punch-in zoom.
// [character, x, y, scale, rotate, flip, motion, options]; labels: [x, y, text, size, t0]; zoom: [from, to, secs, focusX, focusY]
import './cast.mjs';
const row = [130, 335, 540, 745, 950];
export const FOLK = {
  hook: {bg: 'night', fx: ['dim'], zoom: [1.45, 1.0, 1.2, 560, 1150], cast: [['crownFallen', 820, 1610, 1.0, 12, 1, 'idle'],
    ['kingGrief', 520, 1310, 1.45, 0, 1, 'sigh'], ['infant', 575, 1125, 1.1, -12, 1, 'idle']]},
  yagya: {bg: 'home', cast: [['mohandas', 230, 1330, 1.15, 0, 1, 'idle'], ['havan', 540, 1590, 1.1, 0, 1, 'idle'], ['king', 850, 1330, 1.15, 0, -1, 'idle'],
    ['infant', 850, 1080, 0.6, 0, 1, 'popAt', {t0: 0.7}]], labels: [[850, 920, 'पर मृत', 52, 0.72]]},
  devi: {bg: 'night', fx: ['petals'], cast: [['kingGrief', 280, 1320, 1.2, 0, 1, 'sigh'], ['infant', 325, 1170, 0.9, -12, 1, 'idle'],
    ['devi', 760, 1290, 1.25, 0, -1, 'dropIn', {t0: 0.35, y0: 560, dur: 1.4}]]},
  alive: {bg: 'night', fx: ['petals'], zoom: [1.25, 1.0, 0.8, 540, 1200], cast: [['kingJoy', 260, 1320, 1.2, 0, 1, 'idle'],
    ['deviBless', 780, 1290, 1.25, 0, -1, 'idle'], ['infantGlow', 540, 1250, 1.0, 0, 1, 'popAt', {t0: 0.05}]]},
  vow: {bg: 'ocean', cast: [['surya', 760, 900, 0.85, 0, 1, 'sunPulse'], ['vrati', 330, 1300, 1.25, 0, 1, 'idle'], ['riverFront', 540, 1350, 1, 0, 1, 'idle'],
    ['vrati', 700, 1320, 1.0, 0, -1, 'idle'], ['riverFront', 540, 1420, 1, 0, -1, 'idle']], labels: [[540, 1760, 'डूबते और उगते सूर्य को अर्घ्य', 46, 0.45]]},
  reveal: {bg: 'heaven', fx: ['petals'], zoom: [1.3, 1.0, 1.0, 540, 1100], cast: [['devi', 540, 1290, 1.45, 0, 1, 'idle'], ...row.map(x => ['diya', x, 1690, 0.75, 0, 1, 'idle'])],
    labels: [[540, 1790, 'छठी मैया', 72, 0.35]]},
  cta: {bg: 'ocean', fx: ['petals'], cast: [['surya', 760, 900, 0.85, 0, 1, 'sunPulse'], ['vrati', 400, 1300, 1.3, 0, 1, 'idle'], ['riverFront', 540, 1360, 1, 0, 1, 'idle']]},
};
