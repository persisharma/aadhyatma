# Actual Daan form browser verification

Run `npm ci` here after installing mobile dependencies, then `node build.mjs` and `node capture.cjs`. Playwright Chromium is required (`npx playwright install chromium`). Optional `CHROMIUM_PATH` selects a system binary.

The production DaanEntryScreen, TextField, theme and DaanLedgerProvider render through react-native-web. Language and font-scale settings, safe areas and today's Panchang stamp are deterministic browser adapters. AsyncStorage uses browser localStorage. Navigation records a flag; it does not verify native Back. No native build, OTA or payment is performed. Captures cover invalid/corrected input in hi/en/gu/kn at Standard 390px and Large 320px. This does not verify native keyboards, accessibility announcements or enlarged OS text.

Local Chromium was blocked by the environment's socket restriction. The dedicated GitHub browser job captures and checks the matrix; inspect its result before claiming a pass.
