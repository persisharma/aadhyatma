// Salasar Balaji: hook "why is this Hanuman bearded?", answered at the end (he came in the sadhu form shown to
// Mohandas Ji). [character, x, y, scale, rotate, flip, motion, options]; labels: [x, y, text, size, t0]
import './cast.mjs';
export const FOLK = {
  hook: {bg: 'sanctum', cast: [['balajiMurti', 540, 1610, 1.0, 0, 1, 'idle']], labels: [[540, 722, 'दाढ़ी-मूँछ वाले हनुमान जी?', 52, 0]]},
  salasar: {bg: 'desert', cast: [['dhuni', 760, 1560, 0.9, 0, 1, 'idle'], ['mohandas', 400, 1330, 1.05, 0, 1, 'idle']], labels: [[540, 830, 'सालासर, राजस्थान', 56, 0.05]]},
  vision: {bg: 'desert', fx: ['dim'], cast: [['mohandas', 300, 1330, 1.0, 0, 1, 'idle'], ['balajiSadhu', 780, 1310, 1.05, 0, -1, 'fadeIn', {t0: 0.1, hover: 1}]]},
  plough: {bg: 'field', shake: [0.8], cast: [['ploughTeam', 640, 1380, 1.1, 0, 1, 'cartStop', {dist: 480, t1: 0.78}], ['farmer', 165, 1400, 0.82, 0, 1, 'cartStop', {dist: 480, t1: 0.78}],
    ['stone', 275, 1560, 0.32, 0, 1, 'popAt', {t0: 0.8}]], labels: [[540, 830, 'आसोटा गाँव', 56, 0.05]]},
  wipe: {bg: 'field', cast: [['farmerWatch', 940, 1330, 0.95, 0, -1, 'idle'], ['wife', 360, 1340, 1.0, 0, 1, 'idle'],
    ['balajiReveal', 650, 1430, 0.55, 0, 1, 'fadeIn', {t0: 0.48, dur: 0.5}], ['stone', 650, 1450, 1.0, 0, 1, 'fadeAway', {t0: 0.48, dur: 0.5}]]},
  dreams: {bg: 'night', cast: [['thakur', 240, 1330, 1.0, 0, 1, 'sigh'], ['mohandasSleep', 840, 1330, 1.0, 0, -1, 'sigh'],
    ['cloud', 420, 960, 0.9, 0, 1, 'popAt', {t0: 0.06}], ['balajiReveal', 420, 958, 0.27, 0, 1, 'popAt', {t0: 0.06}],
    ['cloud', 660, 960, 0.9, 0, -1, 'popAt', {t0: 0.55}], ['balajiReveal', 660, 958, 0.27, 0, 1, 'popAt', {t0: 0.55}]],
    labels: [[240, 1740, 'आसोटा के ठाकुर', 40, 0.06], [840, 1740, 'मोहनदास जी', 40, 0.55]]},
  cart: {bg: 'desert', cast: [['cart', 640, 1390, 0.95, 0, 1, 'cartStop', {dist: 1000, t1: 0.62}]], labels: [[540, 830, 'सालासर', 64, 0.66]]},
  sthapana: {bg: 'sanctum', fx: ['petals'], cast: [['balajiMurti', 540, 1610, 1.0, 0, 1, 'popAt', {t0: 0}]], labels: [[540, 722, 'श्रावण शुक्ल नवमी · संवत 1811', 44, 0.3]]},
  traditions: {bg: 'sanctum', cast: [['dhuni', 560, 1560, 1.4, 0, 1, 'idle']], labels: [[540, 1760, 'अखंड धूनी', 48, 0.1]]},
  payoff: {bg: 'sanctum', fx: ['petals'], cast: [['balajiSadhu', 300, 1320, 0.95, 0, 1, 'idle'], ['balajiMurti', 770, 1570, 0.52, 0, 1, 'popAt', {t0: 0.12}]],
    labels: [[300, 1740, 'साधु रूप', 42, 0.05], [770, 1740, 'सालासर बालाजी', 42, 0.15]]},
};
