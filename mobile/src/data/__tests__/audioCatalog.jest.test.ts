// Jest suite (`.jest.test.ts` suffix — see jest.config.js). Must run under Jest,
// not tsx: it require()s the bundled MP3s via @assets/audio-library, which the
// react-native preset's moduleNameMapper stubs (plain `tsx --test` can't parse
// a .mp3).
//
// Catalog↔registry contract for the audio library: a track surfaces in the UI
// ONLY when hasRealAudio() is true (see assets/audio-library/index.ts), so every
// bundled recording must also have a catalog entry (title/deity/duration), or it
// plays with no metadata. Guards new audio shipping without its catalog row, and
// pins the hare-rama swap + its japam bead-count calibration.
import { AUDIO_TRACKS, getTrackById } from '@/data/audio/tracks';
import { getAudioSource, hasRealAudio } from '@assets/audio-library';

describe('audio library catalog ↔ registry', () => {
  const bundledIds = [
    'gayatri-mantra',
    'hare-rama',
    'govinda-hari-govinda',
    'har-har-bhole',
    'mahamrityunjay-mantra',
    'govind-bolo',
    'om-gam-ganapataye-namah',
    'narayan-hari-hari',
    'jai-nandlal-ki',
    'krishnaya-vasudevaya',
  ];

  test.each(bundledIds)('%s has a real recording and a catalog entry', (id) => {
    expect(hasRealAudio(id)).toBe(true);
    expect(getAudioSource(id)).not.toBeNull();
    expect(getTrackById(id)).toBeDefined();
  });

  test('newly added tracks carry the expected metadata', () => {
    expect(getTrackById('govinda-hari-govinda')).toMatchObject({
      deity: 'krishna',
      kind: 'standalone',
      durationSec: 128,
    });
    expect(getTrackById('har-har-bhole')).toMatchObject({
      deity: 'shiva',
      kind: 'standalone',
      durationSec: 153,
    });
    expect(getTrackById('mahamrityunjay-mantra')).toMatchObject({
      deity: 'shiva',
      kind: 'standalone',
      durationSec: 103,
    });
  });

  test('the five new bhajans carry the expected metadata', () => {
    expect(getTrackById('govind-bolo')).toMatchObject({
      deity: 'krishna',
      kind: 'standalone',
      durationSec: 109,
    });
    expect(getTrackById('om-gam-ganapataye-namah')).toMatchObject({
      deity: 'ganesha',
      kind: 'standalone',
      durationSec: 153,
    });
    expect(getTrackById('narayan-hari-hari')).toMatchObject({
      deity: 'vishnu',
      kind: 'standalone',
      durationSec: 92,
    });
    expect(getTrackById('jai-nandlal-ki')).toMatchObject({
      deity: 'krishna',
      kind: 'standalone',
      durationSec: 153,
    });
    expect(getTrackById('krishnaya-vasudevaya')).toMatchObject({
      deity: 'krishna',
      kind: 'standalone',
      durationSec: 134,
    });
  });

  test('hare-rama duration matches the 2:14 rendition it now ships', () => {
    // Guards the swap from the old 8-min kirtan (480s) to the 134s recording;
    // the japam bead count (repetitions: 4) is calibrated to this length.
    expect(getTrackById('hare-rama')?.durationSec).toBe(134);
  });

  test('every catalog track with real audio is playable (no dangling ids)', () => {
    for (const track of AUDIO_TRACKS) {
      if (hasRealAudio(track.id)) {
        expect(getAudioSource(track.id)).not.toBeNull();
      }
    }
  });
});
