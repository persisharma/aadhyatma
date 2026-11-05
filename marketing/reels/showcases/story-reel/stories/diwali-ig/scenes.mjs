// Instagram cut of the five-day Diwali reel: curiosity hook, fast cuts, kinetic captions (format "ig").
// Reuses the ../diwali compositions for the five days. [character, x, y, scale, rotate, flip, motion, options]
import {FOLK as D} from '../diwali/scenes.mjs';
const xs = [140, 340, 540, 740, 940];
const noLabels = sc => ({...sc, labels: []});
export const FOLK = {
  hook: {bg: 'night', shake: [0.05], cast: [['yama', 210, 1330, 1.0, 0, 1, 'popAt', {t0: -0.2}], ['narakasura', 540, 1330, 1.1, 0, 1, 'popAt', {t0: -0.2}], ['indra', 870, 1330, 1.0, 0, -1, 'popAt', {t0: -0.2}]]},
  why: {bg: 'home', cast: xs.map((x, k) => ['diya', x, 1500, 1.5, 0, 1, 'popAt', {t0: 0.05 + 0.12 * k}]),
    labels: ['धनतेरस', 'नरक चतुर्दशी', 'दीपावली', 'गोवर्धन', 'भाई दूज'].map((t, k) => [xs[k], 1630, t, 30, 0.05 + 0.12 * k])},
  day1: noLabels(D.day1),
  day2: {...noLabels(D.day2), shake: [0.6]},
  day3: noLabels(D.day3),
  day4: {...noLabels(D.day4), shake: [0.1]},
  day5: noLabels(D.day5),
  cta: {bg: 'home', fx: ['petals'], cast: xs.map(x => ['diya', x, 1500, 1.5, 0, 1, 'idle'])},
};
