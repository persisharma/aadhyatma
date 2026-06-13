import { completionSignature, shouldCelebrateCompletion } from '@/components/routineCelebrationView';

describe('completionSignature', () => {
  it('is order-independent for the same set of keys', () => {
    expect(completionSignature(['r1:b', 'r1:a'])).toBe(completionSignature(['r1:a', 'r1:b']));
  });

  it('changes when a new item key joins the set', () => {
    const before = completionSignature(['r1:a', 'r1:b']);
    const after = completionSignature(['r1:a', 'r1:b', 'r1:c']);
    expect(after).not.toBe(before);
  });

  it('is empty for no scheduled items', () => {
    expect(completionSignature([])).toBe('');
  });
});

describe('shouldCelebrateCompletion', () => {
  it('fires on the first completion of the day (nothing celebrated yet)', () => {
    expect(shouldCelebrateCompletion('complete', 'r1:a|r1:b', null, true)).toBe(true);
  });

  it('does not re-fire while still complete with the same set (navigation / reopen)', () => {
    expect(shouldCelebrateCompletion('complete', 'r1:a|r1:b', 'r1:a|r1:b', true)).toBe(false);
  });

  it('fires again after a new section is added and the routine is re-completed', () => {
    expect(shouldCelebrateCompletion('complete', 'r1:a|r1:b|r1:c', 'r1:a|r1:b', true)).toBe(true);
  });

  it('does not fire on uncheck-then-recheck of the same set', () => {
    // recheck returns to the identical signature already celebrated today
    expect(shouldCelebrateCompletion('complete', 'r1:a|r1:b', 'r1:a|r1:b', true)).toBe(false);
  });

  it('does not fire when the routine is not complete', () => {
    expect(shouldCelebrateCompletion('progress', 'r1:a', null, true)).toBe(false);
    expect(shouldCelebrateCompletion('nudge', '', null, true)).toBe(false);
  });

  it('holds while still loading, even for a complete-but-uncelebrated set', () => {
    // During hydration celebratedSig is a transient null; firing here is what
    // replayed the shower on every launch of an already-complete day.
    expect(shouldCelebrateCompletion('complete', 'r1:a|r1:b', null, false)).toBe(false);
  });
});
