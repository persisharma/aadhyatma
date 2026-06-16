// Card elevation tokens — implements design.md §4 "Elevation" for React Native.
// The warm parchment palette has very low figure-ground contrast (cards, the
// background, and toggles all sit within a couple shades of cream), so cards
// get a soft shadow to read as lifted off the page rather than floating
// invisibly. Shadow colour is the warm rgba(60,30,10) from the spec; both iOS
// (shadow*) and Android (elevation) props are set so a single spread works
// cross-platform. The card must have a solid (non-transparent) background — the
// parchmentSoft card surface is opaque — for the shadow to render on Android.
export const elevation = {
  // Default card — lifts an off-white surface off the parchment background.
  card: {
    shadowColor: '#3C1E0A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  // Emphasised card — the one focal element on a screen (e.g. the Tithi/Nakshatra
  // tiles, the My Vrat door).
  raised: {
    shadowColor: '#3C1E0A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 5,
  },
} as const;

export type ElevationScale = typeof elevation;
