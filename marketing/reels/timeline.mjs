// timeline.mjs — PURE timing math for a reel. No I/O, fully unit-tested.
//
// Given a reel and the measured VO clip durations, compute the absolute timeline of the
// finished video: intro card, per-beat app-video segments, and the CTA card.
//
// Model (see spec §3.1): the app footage is one continuous capture. Each beat = an action
// (tap/swipe + settle) followed by a dwell during which its VO + caption play. We assume a
// fixed action budget per beat; small real-vs-estimate drift stays well inside each multi-second
// dwell, so the VO always lands while the correct screen is showing.

export const TIMING = {
  TAIL_MS: 700, // trailing silence after a VO line, before the beat ends
  MIN_INTRO_MS: 1800, // floor for the intro card
  MIN_CTA_MS: 2600, // floor for the CTA card
  EST_ACTION_MS: 1300, // assumed on-screen time for a beat's tap/swipe + settle
  EST_HOLD_MS: 300, // assumed lead-in for a no-action ("hold") beat
};

/** Estimated pre-VO action time for a beat (ms). */
export function beatActionMs(beat, t = TIMING) {
  const hasAction = Array.isArray(beat.action) && beat.action.length > 0;
  return hasAction ? t.EST_ACTION_MS : t.EST_HOLD_MS;
}

/**
 * @param reel      the reel definition ({ beats, ... })
 * @param durations { hook:ms, cta:ms, beats:[ms per beat] } — measured VO clip lengths
 * @returns { introDur, appVideoDur, ctaDur, total, hook, beats[], cta }  (all ms)
 */
export function computeTimeline(reel, durations, t = TIMING) {
  if (!durations || !Array.isArray(durations.beats)) {
    throw new Error('computeTimeline: durations.beats[] is required');
  }
  if (durations.beats.length !== reel.beats.length) {
    throw new Error(
      `computeTimeline: durations.beats has ${durations.beats.length} entries, reel has ${reel.beats.length} beats`,
    );
  }

  const introDur = Math.max(t.MIN_INTRO_MS, (durations.hook || 0) + t.TAIL_MS);
  const ctaDur = Math.max(t.MIN_CTA_MS, (durations.cta || 0) + t.TAIL_MS);

  const beats = [];
  let cursor = introDur; // absolute start of the app-video region
  for (let i = 0; i < reel.beats.length; i++) {
    const action = beatActionMs(reel.beats[i], t);
    const voDur = durations.beats[i] || 0;
    const dwell = Math.max(reel.beats[i].minHoldMs || 0, voDur + t.TAIL_MS);
    const segStart = cursor;
    const voStart = cursor + action; // VO plays after the action settles
    const segEnd = cursor + action + dwell;
    beats.push({
      index: i,
      segStart,
      segEnd,
      action,
      dwell,
      voStart,
      voDur,
      captionStart: voStart,
      captionEnd: segEnd,
    });
    cursor = segEnd;
  }

  const appVideoDur = cursor - introDur;
  const total = cursor + ctaDur;
  return {
    introDur,
    appVideoDur,
    ctaDur,
    total,
    hook: { voStart: 0, voDur: durations.hook || 0 },
    beats,
    cta: { start: cursor, voStart: cursor, voDur: durations.cta || 0 },
  };
}
