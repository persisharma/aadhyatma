/** Sampled from the approved Design 2 painting; shared by reader and export. */
export const devotionalFrameColors = {
  paper: '#FAE7BE', paperClear: 'rgba(250, 231, 190, 0)',
  centerClear: 'rgba(255, 248, 224, 0)', center: 'rgba(255, 248, 224, 0.45)',
  panel: 'rgba(255, 248, 224, 0.28)', ink: '#2B1608', meaning: '#674021',
  maroon: '#801C0D', gold: '#AF731D', goldLight: '#DAB36C',
};

/** Bhakti tab Hindi verse leading for a reading size: 36 at the 23pt default (1.57em),
 * clear of the 1.55em mark extent, so a chaupai shown one charan per row adds 27pt, not 39. */
export function devotionalReaderVerseLeading(fontSize: number): number {
  return Math.ceil(fontSize * 36 / 23);
}

/** Native metrics calibrated against the same-content approved reference. */
export const devotionalFrameType = { bodyFace: 'VedanshDevotionalText', verseFace: 'NotoSerifDevanagari_600SemiBold', sourceSize: 17.7, verseSize: 28.5, verseLeading: 42, meaningSize: 22.5, meaningLeading: 29, commentarySize: 21, commentaryLeading: 27.5 };
