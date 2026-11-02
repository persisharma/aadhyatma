// Reviewed dark-letter bounds in the approved transparent crops. Decorative
// flute/feather pixels stay intact but do not set the name's optical height.
export function homeWordmarkFrame(lang, width, height) {
  const [letteringTop, letteringBottom] = lang === 'hi' ? [46, 388] : [37, 416];
  const letteringHeight = 30; // same visible height as Home's Om circles
  const scale = letteringHeight / (letteringBottom - letteringTop);
  return {
    width: Math.ceil(width * scale), height: 36,
    artworkWidth: width * scale,
    translateY: (height / 2 - (letteringTop + letteringBottom) / 2) * scale,
    letteringTop, letteringBottom, letteringHeight,
  };
}
