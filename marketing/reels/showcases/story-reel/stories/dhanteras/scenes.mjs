// Folk-style choreography for धनतेरस · धन्वंतरि कथा: [character, x, y, scale, rotate, flip, motion, options]
import './cast.mjs';
const sea = [['waves', 540, 1430, 1, 0, 1, 'drift', {phase: 0}], ['waves2', 540, 1530, 1, 0, -1, 'drift', {phase: 2}]];
const lamps = [['diya', 170, 1600, 1, 0, 1, 'idle'], ['diya', 910, 1600, 1, 0, 1, 'idle']];
export const FOLK = {
  hook: {bg: 'ocean', cast: [['dhanvantari', 540, 1300, 1.35, 0, 1, 'emergeFast'], ...sea, ...lamps]},
  manthan: {bg: 'ocean', cast: [['mandara', 540, 1260, 1.05, 0, 1, 'churn'], ['kurma', 540, 1590, 0.95, 0, 1, 'idle'], ['vasuki', 540, 1200, 1.0, 0, 1, 'tug'],
    ['asura', 130, 1300, 0.95, 0, 1, 'tug'], ['asura', 260, 1330, 0.9, 0, 1, 'tug'], ['devaPull', 950, 1300, 0.95, 0, -1, 'tug'], ['devaPull', 820, 1330, 0.9, 0, -1, 'tug'], ...sea]},
  ratna: {bg: 'ocean', cast: [['kamadhenu', 300, 1250, 0.95, 0, 1, 'popAt', {t0: 0.08}], ['airavata', 790, 1280, 0.6, 0, -1, 'popAt', {t0: 0.3}],
    ['kaustubha', 300, 860, 1.1, 0, 1, 'popAt', {t0: 0.5}], ['lakshmi', 730, 1000, 0.95, 0, 1, 'popAt', {t0: 0.68}], ...sea]},
  dhanvantari: {bg: 'ocean', cast: [['devaPull', 140, 1380, 0.8, 0, 1, 'idle'], ['devaPull', 940, 1380, 0.8, 0, -1, 'idle'], ['dhanvantari', 540, 1300, 1.4, 0, 1, 'emerge'], ...sea]},
  tithi: {bg: 'night', cast: [['moon', 780, 780, 1.1, -20, 1, 'idle'], ['dhanvantari', 330, 1320, 1.2, 0, 1, 'idle'], ['diya', 720, 1600, 1, 0, 1, 'idle'], ['diya', 900, 1600, 1, 0, 1, 'idle']]},
  custom: {bg: 'home', cast: [['anjana', 230, 1330, 1.15, 0, 1, 'idle'], ['pots', 640, 1460, 1.15, 0, 1, 'popAt', {t0: 0.15}], ['coins', 880, 1560, 1, 0, 1, 'popAt', {t0: 0.4}], ...lamps]},
  message: {bg: 'home', fx: ['petals'], cast: [['dhanvantari', 540, 1310, 1.35, 0, 1, 'idle'], ...lamps]},
  cta: {bg: 'home', cast: [['dhanvantari', 300, 1460, 1.05, 0, 1, 'idle'], ['diya', 760, 1600, 1, 0, 1, 'idle'], ['diya', 900, 1600, 1, 0, 1, 'idle']]},
};
