/**
 * Bottom-bar geometry, in a LEAF module with no imports.
 *
 * `MiniPlayer` docks directly above the bar and `FeatureTour` rings its slots,
 * so both need this number — but neither should pull in the navigator graph to
 * get it. `AppTabBar` imports `@react-navigation/*`, which ships untranspiled
 * ESM that Jest cannot even parse, so importing the constant from there made a
 * leaf component's suite fail to load (the same reason `tabBarIcons` is its own
 * leaf module). Keep this file dependency-free.
 */

/** The bar's own height, excluding the safe-area inset it adds as padding. */
export const TAB_BAR_BASE_HEIGHT = 60;

/** Buttons on the bar: होम · भक्ति · पंचांग · व्रत · ज्योतिष. */
export const TAB_BAR_SLOT_COUNT = 5;
