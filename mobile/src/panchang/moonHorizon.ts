import { Body, Observer, SearchRiseSet } from 'astronomy-engine';
import type { GeoLocation } from './types';

export type MoonHorizon = {
  previousRise: Date | null;
  previousSet: Date | null;
  nextRise: Date | null;
  nextSet: Date | null;
  /** The rise belonging to the moon visible/upcoming at this night's start. */
  nightRise: Date | null;
};

const cache = new Map<string, MoonHorizon>();

export function moonHorizonKey(start: Date, location: GeoLocation): string {
  return `${start.getTime()}|${location.latitude}|${location.longitude}|${location.elevation}`;
}

export function cachedMoonHorizon(key: string): MoonHorizon | null {
  return cache.get(key) ?? null;
}

/** Run off render, once per night/location. No persisted Panchang schema changes. */
export function computeMoonHorizon(start: Date, location: GeoLocation): MoonHorizon {
  const key = moonHorizonKey(start, location);
  const cached = cache.get(key);
  if (cached) return cached;
  const observer = new Observer(location.latitude, location.longitude, location.elevation);
  // Direction selects rise/set; the sign of limitDays selects past/future.
  // Searching across midnight also handles civil dates with no moonrise.
  const event = (direction: 1 | -1, days: number) => SearchRiseSet(Body.Moon, observer, direction, start, days)?.date ?? null;
  const previousRise = event(1, -2);
  const previousSet = event(-1, -2);
  const nextRise = event(1, 2);
  const nextSet = event(-1, 2);
  const aboveAtStart = previousRise != null && (previousSet == null || previousRise > previousSet);
  const result = { previousRise, previousSet, nextRise, nextSet, nightRise: aboveAtStart ? previousRise : nextRise };
  if (cache.size >= 32) cache.delete(cache.keys().next().value!);
  cache.set(key, result);
  return result;
}

export function moonHorizonState(data: MoonHorizon | null, at: number): 'above' | 'not-risen' | 'set' | 'unavailable' {
  if (!data) return 'unavailable';
  const events = [
    { time: data.previousRise, rise: true }, { time: data.previousSet, rise: false },
    { time: data.nextRise, rise: true }, { time: data.nextSet, rise: false },
  ].filter((event): event is { time: Date; rise: boolean } => event.time != null && event.time.getTime() <= at)
    .sort((a, b) => a.time.getTime() - b.time.getTime());
  const latest = events[events.length - 1];
  if (!latest) return 'unavailable';
  if (latest.rise) return 'above';
  return data.nightRise != null && at < data.nightRise.getTime() ? 'not-risen' : 'set';
}
