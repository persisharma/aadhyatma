let interactionCount = 0;
/** Keep automatic usage asks away from share pickers, capture and native sheets. */
export function beginRatingInteraction(): () => void {
  interactionCount += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    interactionCount -= 1;
  };
}
export function isRatingInteractionActive(): boolean {
  return interactionCount > 0;
}
