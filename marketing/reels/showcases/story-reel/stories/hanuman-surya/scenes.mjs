// Folk-style choreography for हनुमान और सूर्य: [character, x, y, scale, rotate, flip, motion, options]
import '../../cast.mjs';
export const FOLK = {
  hook: {bg: 'sky', cast: [['surya', 800, 780, 1.5, 0, 1, 'sunPulse'], ['hanuman', 0, 0, 1.7, -28, 1, 'flyIn']]},
  anjana: {bg: 'forest', cast: [['anjana', 430, 1330, 1.35, 0, -1, 'walkLeft'], ['hanuman', 770, 1430, 1.0, 0, 1, 'hungry']]},
  sunrise: {bg: 'sky', cast: [['surya', 720, 0, 1.6, 0, 1, 'sunRise'], ['hanuman', 300, 1430, 1.15, 0, 1, 'reach']]},
  leap: {bg: 'sky', fx: ['wind'], cast: [['surya', 840, 700, 1.15, 0, 1, 'sunPulse'], ['vayu', 0, 0, 1.0, -15, 1, 'follow'], ['hanuman', 0, 0, 1.55, -30, 1, 'flyIn2']]},
  rahu: {bg: 'sky', cast: [['surya', 760, 760, 1.3, 0, 1, 'sunPulse'], ['rahu', 0, 0, 1.2, 0, 1, 'rahuPass'], ['indra', 240, 1330, 1.2, 0, 1, 'appearLate']]},
  vajra: {bg: 'heaven', fx: ['flash'], cast: [['airavata', 650, 1390, 1.0, 0, 1, 'idle'], ['indra', 600, 1150, 0.95, 0, 1, 'idle'], ['hanuman', 0, 0, 1.3, -25, 1, 'fall']]},
  vayu: {bg: 'cave', fx: ['dim'], cast: [['vayu', 400, 1330, 1.3, 0, 1, 'grieve'], ['hanuman', 520, 1270, 0.9, 82, 1, 'grieve'], ['brahma', 840, 1330, 1.15, 0, -1, 'appearLate']]},
  blessing: {bg: 'heaven', fx: ['petals'], cast: [['surya', 820, 760, 0.95, 0, 1, 'sunPulse'], ['brahma', 280, 1330, 1.15, 0, 1, 'idle'], ['hanuman', 560, 1440, 1.05, 0, 1, 'revive'], ['indraBless', 840, 1330, 1.1, 0, -1, 'idle']]},
  cta: {bg: 'sky', cast: [['surya', 790, 1000, 1.25, 0, 1, 'sunPulse'], ['hanuman', 300, 1480, 1.45, -28, 1, 'hover']]},
};
