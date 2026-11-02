# Kundali layout correction

The prior responsive implementation changed the approved nine-card Graha grid to one/two columns. Its tests asserted that incorrect behaviour. This correction makes the contract explicit: exactly three rows and three columns at all supported sizes, in Sun/Moon/Mars, Mercury/Jupiter/Venus, Saturn/Rahu/Ketu order. Text wraps and row height grows; no reading text is shrunk or clamped. Tiles keep artwork, name, house and sign; longer meaning/relationship content stays in the existing sheet.

Interactive chart cells also retain the short form of every occupant, including shared houses. English uses Su/Mo/Ma/Me/Ju/Ve/Sa/Ra/Ke; Indic short forms preserve vowel signs and conjuncts rather than slicing UTF-16 characters. Counts never replace occupants.

## Browser verification without a simulator

`mobile/visual/kundali` renders the actual production KundaliExplorer/NorthIndianChart components through React Native Web. Playwright checks 320/390/430 widths × four languages × Standard/Large for grid and chart (48 browser cases), captures screenshots, checks actual three-column geometry, horizontal overflow, app-font loading, chart short forms and sheet opening. CI uploads the screenshots and results as `kundali-browser-visuals`.

The browser harness uses the app’s installed font files and shipped paintings. Only environment boundaries are adapted: storage is in-memory, browser safe-area insets are zero and static PNG require calls become browser Image sources. Test-only packages are installed without changing the app dependency lockfile. Native OS text metrics, safe areas and accessibility remain device checks; browser screenshots do establish the requested grid/label structure without a simulator.

## Remaining design reference

The owner also reports Jeevan ke Vishay differs from the approved design. Retrieved conversation context confirms topics such as घर, पढ़ाई and रिश्ते and Chart picture as first/default, but does not contain the exact approved arrangement, icons or dimensions. The original prototype could not be recovered from available files/context. The existing vertical list must not be represented as an approved restoration; request the approved screen/prototype and match it directly.

## Evidence

Unit and browser checks are authored; record their executed final-head results in the PR. No native verification, merge or release is implied. Preserve this correction remotely before cleanup. Canonical design/RULEBOOK/wiki corrections are prepared locally, but their upload was blocked by automatic approval review and requires explicit approval; the existing published text still contains the previous grid/count assumptions.
