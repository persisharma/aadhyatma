/**
 * Live compass heading for the दिशा चक्र (PRD-24 §4; Phase 2 §A1/§A2). The
 * source ladder, top rung first (RULEBOOK §22 rule 11):
 *
 * - `fused` — the OS's own heading (expo-location `watchHeadingAsync`):
 *   tilt-compensated sensor fusion, and TRUE north directly when the OS knows
 *   the location. `trueHeading` is −1 without location permission — then the
 *   OS's magnetic heading + the bundled declination. The permission is only
 *   ever QUERIED, never requested (the Panchang flow owns that prompt);
 *   Android rejects `watchHeadingAsync` without it, so the rung is skipped
 *   there. A fused subscription that never emits (iOS simulator) falls down
 *   the ladder after a short watchdog — a silent rung must not hold the dial
 *   at `starting`.
 * - `magnetometer` — the shipped Phase-1 path: raw samples smoothed with the
 *   wrap-aware filter, declination from the coords-first grid lookup. Extra
 *   honesty states live here only (the OS fusion already compensates):
 *   `unreliable` when the field magnitude leaves Earth's plausible band, and
 *   `tilted` (outranks `unreliable`) when the accelerometer says the phone has
 *   left the flat pose the math assumes — >20° sustained for 5 samples. The
 *   dial keeps moving through both; the UI shows the warning.
 * - `none` → `unavailable` — the screen opens manual mode; guidance never
 *   depends on the sensor (RULEBOOK §22.6).
 */
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { usePanchangLocation } from '@/contexts/PanchangLocationContext';
import { getDeclination } from '@/data/vastu/declination';
import {
  applyDeclination,
  headingFromSample,
  isFieldPlausible,
  isTilted,
  smoothHeading,
  tiltDegreesFromAccel,
} from './compass';

export type CompassStatus = 'starting' | 'ok' | 'unreliable' | 'tilted' | 'unavailable';
export type CompassSource = 'fused' | 'magnetometer' | 'none';

export type CompassHeading = {
  status: CompassStatus;
  /** True-north heading in [0, 360), null until the first sample (or forever when unavailable). */
  heading: number | null;
  source: CompassSource;
};

const UPDATE_INTERVAL_MS = 100;
/** Readings outside the plausible band must persist this many samples before the
 * status flips — a single pass near a door frame shouldn't flash the warning. */
const UNRELIABLE_AFTER = 5;
/** Tilt must persist the same way — lifting the phone to read it isn't a state. */
const TILTED_AFTER = 5;
/** The OS fusion smooths internally, so the app-side filter follows faster. */
const FUSED_ALPHA = 0.5;
/** A fused subscription that stays silent this long is treated as absent. */
const FUSED_FIRST_SAMPLE_MS = 2000;

type MagnetometerModule = typeof import('expo-sensors').Magnetometer;
type AccelerometerModule = typeof import('expo-sensors').Accelerometer;
type LocationModule = typeof import('expo-location');

/**
 * Lazy AND probed: a runtime whose binary predates expo-sensors (a stale dev
 * client) must degrade to `unavailable`, the same honest state a sensorless
 * device reports. The probe matters — requiring the expo-sensors barrel
 * initialises EVERY sensor class, so on such a runtime the import itself
 * throws (dev clients redbox it) before any `isAvailableAsync` runs.
 */
function loadSensors(): { Magnetometer: MagnetometerModule; Accelerometer: AccelerometerModule } | null {
  try {
    const { requireOptionalNativeModule } =
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('expo-modules-core') as typeof import('expo-modules-core');
    // The barrel also inits Pedometer/Gyroscope/…, so probe for the whole
    // sensor family this binary would need before touching it.
    const present = ['ExponentMagnetometer', 'ExponentPedometer'].every((name) =>
      requireOptionalNativeModule(name)
    );
    if (!present) return null;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const sensors = require('expo-sensors') as typeof import('expo-sensors');
    return { Magnetometer: sensors.Magnetometer, Accelerometer: sensors.Accelerometer };
  } catch {
    return null;
  }
}

/** Same stale-binary honesty for expo-location (the fused rung). */
function loadLocation(): LocationModule | null {
  try {
    const { requireOptionalNativeModule } =
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('expo-modules-core') as typeof import('expo-modules-core');
    if (!requireOptionalNativeModule('ExpoLocation')) return null;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Location = require('expo-location') as LocationModule;
    return typeof Location.watchHeadingAsync === 'function' ? Location : null;
  } catch {
    return null;
  }
}

export function useCompassHeading(enabled: boolean): CompassHeading {
  const { location } = usePanchangLocation();
  const declination = getDeclination(location);

  const [state, setState] = useState<CompassHeading>({ status: 'starting', heading: null, source: 'none' });
  const smoothed = useRef<number | null>(null);
  const implausibleRun = useRef(0);
  const tiltRun = useRef(0);
  const declinationRef = useRef(declination);
  declinationRef.current = declination;

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const subscriptions: { remove: () => void }[] = [];
    let watchdog: ReturnType<typeof setTimeout> | null = null;

    const startMagnetometer = async () => {
      const sensors = loadSensors();
      const available = sensors
        ? await sensors.Magnetometer.isAvailableAsync().catch(() => false)
        : false;
      if (cancelled) return;
      if (!sensors || !available) {
        setState({ status: 'unavailable', heading: null, source: 'none' });
        return;
      }
      const { Magnetometer, Accelerometer } = sensors;
      // Tilt honesty (§A2) — magnetometer rung only: the flat-pose assumption
      // is this rung's, not the OS fusion's. Debounced like the field check.
      try {
        if (await Accelerometer.isAvailableAsync().catch(() => false)) {
          if (cancelled) return;
          Accelerometer.setUpdateInterval(UPDATE_INTERVAL_MS);
          subscriptions.push(
            Accelerometer.addListener((sample) => {
              tiltRun.current = isTilted(tiltDegreesFromAccel(sample)) ? tiltRun.current + 1 : 0;
            })
          );
        }
      } catch {
        // No accelerometer → no tilt state; the field check still stands.
      }
      if (cancelled) return;
      Magnetometer.setUpdateInterval(UPDATE_INTERVAL_MS);
      subscriptions.push(
        Magnetometer.addListener((sample) => {
          smoothed.current = smoothHeading(smoothed.current, headingFromSample(sample));
          if (isFieldPlausible(sample)) {
            implausibleRun.current = 0;
          } else {
            implausibleRun.current += 1;
          }
          const status: CompassStatus =
            tiltRun.current >= TILTED_AFTER
              ? 'tilted'
              : implausibleRun.current >= UNRELIABLE_AFTER
                ? 'unreliable'
                : 'ok';
          setState({
            status,
            heading: applyDeclination(smoothed.current, declinationRef.current),
            source: 'magnetometer',
          });
        })
      );
    };

    (async () => {
      const Location = loadLocation();
      if (Location) {
        try {
          // Query only — the prompt belongs to the Panchang flow (US-01).
          const permission = await Location.getForegroundPermissionsAsync();
          if (cancelled) return;
          // Android rejects watchHeadingAsync without the permission; iOS
          // serves heading regardless (trueHeading is simply −1 then).
          const canFuse = Platform.OS === 'ios' || permission.granted === true;
          if (canFuse) {
            let gotSample = false;
            const subscription = await Location.watchHeadingAsync((h) => {
              gotSample = true;
              if (cancelled) return;
              const raw =
                h.trueHeading >= 0
                  ? h.trueHeading
                  : applyDeclination(h.magHeading, declinationRef.current);
              smoothed.current = smoothHeading(smoothed.current, raw, FUSED_ALPHA);
              setState({
                // expo-location accuracy is the compass calibration level 0–3.
                status: h.accuracy <= 1 ? 'unreliable' : 'ok',
                heading: smoothed.current,
                source: 'fused',
              });
            });
            if (cancelled) {
              subscription.remove();
              return;
            }
            subscriptions.push(subscription);
            // iOS simulator resolves the subscription and then never emits —
            // fall down the ladder instead of hanging at `starting`.
            watchdog = setTimeout(() => {
              if (gotSample || cancelled) return;
              subscription.remove();
              subscriptions.length = 0;
              smoothed.current = null;
              void startMagnetometer();
            }, FUSED_FIRST_SAMPLE_MS);
            return;
          }
        } catch {
          // Fused rung refused (permission model, stale binary) — fall through.
        }
      }
      if (!cancelled) await startMagnetometer();
    })();

    return () => {
      cancelled = true;
      if (watchdog != null) clearTimeout(watchdog);
      subscriptions.forEach((subscription) => subscription.remove());
      smoothed.current = null;
      implausibleRun.current = 0;
      tiltRun.current = 0;
    };
  }, [enabled]);

  return state;
}
