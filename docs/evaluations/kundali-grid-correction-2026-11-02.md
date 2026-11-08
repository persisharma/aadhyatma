# Kundali layout correction

The prior responsive implementation changed the approved nine-card Graha grid to one/two columns. Its tests asserted that incorrect behaviour. This correction makes the contract explicit: exactly three rows and three columns at all supported sizes, in Sun/Moon/Mars, Mercury/Jupiter/Venus, Saturn/Rahu/Ketu order. Text wraps and row height grows; no reading text is shrunk or clamped. Tiles keep artwork, name, house and sign; longer meaning/relationship content stays in the existing sheet.

Interactive chart cells also retain the short form of every occupant, including shared houses. English uses Su/Mo/Ma/Me/Ju/Ve/Sa/Ra/Ke; Indic short forms preserve vowel signs and conjuncts rather than slicing UTF-16 characters. Counts never replace occupants.

## Browser verification without a simulator

`mobile/visual/kundali` renders the actual production KundaliExplorer/NorthIndianChart components through React Native Web. Playwright checks six viewports (320×568, 360×800, 390×844, 430×932, 768×1024 and 844×390 landscape) × four languages × Standard/Large for grid and chart (96 browser cases). It captures screenshots and checks actual three-column geometry, horizontal overflow, app-font/artwork loading, visible bounds for all 36 chart labels, short forms, sheet opening and the Done button staying within the viewport. CI uploads the screenshots and results as `kundali-browser-visuals`. These are browser viewport checks, not physical device runs or enlarged OS-font tests.

The browser harness uses the app’s installed font files and shipped paintings. Environment adapters use in-memory storage, zero browser safe-area insets and browser Image sources for static PNG require calls. An SVG group adapter preserves the actual `g` element, role, label, click and keyboard action: RN Web’s semantic-element conversion otherwise turns the group into an HTML button and prevents its SVG children from painting. Other SVG elements use the installed library’s web implementation. Browser screenshots verify the production chart’s geometry/content through this adapter; they do not establish native SVG hit testing or screen-reader behaviour. Test-only packages are isolated from the app dependency lockfile. Native OS text metrics, safe areas and accessibility remain device checks.

## Remaining design reference

The owner also reports Jeevan ke Vishay differs from the approved design. Retrieved conversation context confirms topics such as घर, पढ़ाई and रिश्ते and Chart picture as first/default, but does not contain the exact approved arrangement, icons or dimensions. The original prototype could not be recovered from available files/context. The existing vertical list must not be represented as an approved restoration; request the approved screen/prototype and match it directly.

## Evidence

Unit and browser checks are authored; record their executed final-head results in the PR. No native verification, merge or release is implied. Preserve this correction remotely before cleanup. Canonical design/RULEBOOK/wiki corrections are prepared locally, but their upload was blocked by automatic approval review and requires explicit approval; the existing published text still contains the previous grid/count assumptions.
