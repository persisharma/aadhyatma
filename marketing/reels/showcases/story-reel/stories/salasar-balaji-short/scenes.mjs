// 35 s Instagram re-cut of Salasar Balaji: frame 1 is an extreme close-up of the murti's eyes pulling back to the
// bearded face; bigger figures; the "why bearded?" question is answered only at the end.
// [character, x, y, scale, rotate, flip, motion, options]; labels: [x, y, text, size, t0]
import '../salasar-balaji/cast.mjs';
export const FOLK = {
  hook: {bg: 'sanctum', cast: [['balajiMurti', 540, 1650, 1.05, 0, 1, 'zoomOut', {s0: 3.0, y0: 1745, dur: 1.5}]], labels: [[540, 1810, 'दाढ़ी-मूँछ वाले हनुमान?!', 76, 0]]},
  plough: {bg: 'field', shake: [0.72], cast: [['ploughTeam', 720, 1340, 1.35, 0, 1, 'cartStop', {dist: 420, t1: 0.7}], ['farmer', 175, 1361, 1.0, 0, 1, 'cartStop', {dist: 420, t1: 0.7}],
    ['stone', 270, 1550, 0.4, 0, 1, 'popAt', {t0: 0.72}]], labels: [[540, 1780, 'आसोटा, राजस्थान', 50, 0.05]]},
  wipe: {bg: 'field', fx: ['petals'], cast: [['wife', 290, 1300, 1.25, 0, 1, 'idle'],
    ['balajiReveal', 700, 1400, 0.72, 0, 1, 'fadeIn', {t0: 0.35, dur: 0.45}], ['stone', 700, 1430, 1.3, 0, 1, 'fadeAway', {t0: 0.35, dur: 0.45}]]},
  dream: {bg: 'night', cast: [['thakur', 300, 1300, 1.25, 0, 1, 'sigh'], ['cloud', 700, 960, 1.15, 0, 1, 'popAt', {t0: 0.05}], ['balajiReveal', 700, 958, 0.34, 0, 1, 'popAt', {t0: 0.05}]]},
  cart: {bg: 'desert', cast: [['cart', 650, 1365, 1.2, 0, 1, 'cartStop', {dist: 1100, t1: 0.6}]], labels: [[540, 1780, 'सालासर', 64, 0.62]]},
  payoff: {bg: 'sanctum', fx: ['petals'], cast: [['balajiSadhu', 290, 1300, 1.25, 0, 1, 'fadeIn', {t0: 0, dur: 0.4}], ['balajiMurti', 775, 1630, 0.68, 0, 1, 'idle']],
    labels: [[290, 1780, 'साधु रूप', 46, 0.35], [775, 1780, 'सालासर बालाजी', 46, 0.45]]},
  cta: {bg: 'sanctum', fx: ['petals'], cast: [['balajiMurti', 540, 1680, 1.1, 0, 1, 'idle']]},
};
