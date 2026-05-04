import type { ChalisaImageKey } from '@assets/chalisa';
import raw from './sundarkand.hi-en.json';

export type SundarkandReading = {
  id: string;
  number: number;
  label: string;
  labelEn: string;
  imageKey: ChalisaImageKey;
  lines: string[];
  transliteration: string[];
  meaningHi: string;
  meaningEn: string;
  commentaryHi: string[];
  commentaryEn: string[];
};

type RawSundarkand = {
  title: string;
  titleEn: string;
  source: string;
  readings: SundarkandReading[];
};

const data = raw as RawSundarkand;

export const sundarkandTitle = data.title;
export const sundarkandTitleEn = data.titleEn;
export const sundarkandSource = data.source;
export const sundarkandReadings: readonly SundarkandReading[] = data.readings;
export const sundarkandTotal = sundarkandReadings.length;

(function assertSundarkandInvariants() {
  if (sundarkandTotal === 0) {
    throw new Error('sundarkand: expected at least one reading');
  }
  if (sundarkandTotal !== 121) {
    throw new Error(`sundarkand: expected 121 readings, got ${sundarkandTotal}`);
  }

  const seenIds = new Set<string>();
  for (const [index, reading] of sundarkandReadings.entries()) {
    if (reading.number !== index + 1) {
      throw new Error(
        `sundarkand: reading at index ${index} has number ${reading.number}, expected ${index + 1}`
      );
    }
    if (seenIds.has(reading.id)) {
      throw new Error(`sundarkand: duplicate reading id '${reading.id}'`);
    }
    seenIds.add(reading.id);
    if (
      reading.lines.length === 0 ||
      reading.transliteration.length === 0 ||
      !reading.meaningHi.trim() ||
      !reading.meaningEn.trim()
    ) {
      throw new Error(`sundarkand: reading '${reading.id}' has incomplete content`);
    }
  }
})();
