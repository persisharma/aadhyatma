// Instagram cut of the five-day Diwali reel: hook "दीपावली से यमराज का क्या रिश्ता?", answered three times
// (Dhanteras yamadeep, Naraka Chaturdashi four-sided lamp, Bhai Dooj), with a counter. Format "ig".
// [character, x, y, scale, rotate, flip, motion, options]; labels: [x, y, text, size, appearAtFraction]
import {FOLK as D} from '../diwali/scenes.mjs';
import './cast.mjs';
const xs = [140, 340, 540, 740, 940];
const noLabels = sc => ({...sc, labels: []});
export const FOLK = {
  hook: {bg: 'night', cast: [['diya', 470, 1500, 2.6, 0, 1, 'idle'], ['yama', 800, 1330, 1.15, 0, -1, 'idle']],
    labels: [[540, 800, 'पाँच दिन · तीन बार यमराज', 64, 0.42]]},
  why: {bg: 'home', cast: xs.map((x, k) => ['diya', x, 1500, 1.5, 0, 1, 'popAt', {t0: 0.05 + 0.12 * k}]),
    labels: ['धनतेरस', 'नरक चतुर्दशी', 'दीपावली', 'गोवर्धन', 'भाई दूज'].map((t, k) => [xs[k], 1630, t, 30, 0.05 + 0.12 * k])},
  day1: {...noLabels(D.day1), cast: [...D.day1.cast, ['diya', 900, 1250, 1.7, 0, 1, 'popAt', {t0: 0.6}]], labels: [[900, 1150, 'यमदीप', 46, 0.6]]},
  day2: {...noLabels(D.day2), shake: [0.45], cast: [['krishnaChakra', 230, 1330, 1.05, 0, 1, 'idle'], ['satyabhama', 430, 1350, 0.98, 0, 1, 'idle'],
    ['narakasura', 790, 1330, 1.15, 0, -1, 'defeat'], ['chaumukha', 820, 1560, 1.5, 0, 1, 'popAt', {t0: 0.62}]], labels: [[820, 1680, 'यम का चौमुखा दीप', 40, 0.62]]},
  day3: {bg: 'palace', cast: [
    ['rama', 200, 1330, 1.0, 0, 1, 'walkIn'], ['sita', 360, 1350, 0.95, 0, 1, 'walkIn'], ['lakshmana', 520, 1335, 0.97, 0, 1, 'walkIn'], ['hanuman', 680, 1450, 0.85, 0, 1, 'walkIn'],
    ['lakshmi', 870, 1010, 0.78, 0, 1, 'popAt', {t0: 0.6}],
    ...[120, 290, 460, 630, 800, 960].map((x, k) => ['diya', x, 1615, 0.85, 0, 1, 'popAt', {t0: 0.3 + 0.05 * k}])]},
  day4: {...noLabels(D.day4), shake: [0.1]},
  day5: noLabels(D.day5),
  cta: {bg: 'home', fx: ['petals'], cast: xs.map(x => ['diya', x, 1500, 1.5, 0, 1, 'idle'])},
};
