# Vrat bell saves and reminder preference reuse

The bell is the single save/reminder action across Upcoming, search, lists and detail. Save in the first setup adds the Vrat to My Vrat and stores its own reminder preference. Later additions reuse that preference without another setup popup. My Vrat's gear changes per-Vrat timing; a second primary bell tap removes the favourite and its scheduled notices. Daily Bhakti times and enablement are untouched.

See [design-qa.md](design-qa.md) for native evidence, fixture checks and verification limits. Screenshots were captured during 27 October testing; documentation/PR closeout is 28 October. The existing strip/carousel fixes are documented separately in `../vrat-strip-content-2026-10-27/`.

To repeat native flows, start the worktree's development build, set the app's language/text-size state described by each flow, and seed an isolated simulator with no Vrat preference. Run `maestro --device <owned-test-device> test native-first-use.yaml`; `native-large.yaml` uses English/XXXL and fresh Vrat storage. Screenshots use relative output names. Do not clear an unrelated device's preferences.

Native setup: saved 2-day/08:00 preference once; next Ganesh bell skipped setup; My Vrat contained both. Then Ahoi list and Masik Kalashtami detail actions added two more favourites without setup. English XXXL checked cancel, save and subsequent reuse. `native-preference-proof.json` contains only the controlled test fixture.
