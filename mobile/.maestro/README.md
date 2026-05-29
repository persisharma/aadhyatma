# Maestro UI Tests — Vedansh

End-to-end UI tests for the Vedansh app. Runs against the iOS Simulator or Android Emulator using [Maestro](https://maestro.mobile.dev).

## Why Maestro

Per `RULEBOOK.md` §9 (Cross-platform verification), every section must be tested on both iOS and Android before merge. These flows automate that check.

## Setup (one-time)

```bash
# 1. Install Java Runtime (Maestro is a JVM tool)
brew install --cask temurin

# 2. Install Maestro CLI
curl -Ls "https://get.maestro.mobile.dev" | bash

# 3. Verify install
maestro --version
```

If `maestro --version` fails with "Unable to locate a Java Runtime", step 1 was skipped or the JDK isn't on `JAVA_HOME`. Reopen the terminal after installing Temurin.

## Running flows

The dev server (`npx expo start`) must be running and the app must already be installed in your simulator. Then:

```bash
# Run a single flow
maestro test .maestro/sanskar-smoke.yaml

# Run all flows
maestro test .maestro/

# Run with video recording
maestro test --debug-output ./maestro-debug .maestro/sanskar-smoke.yaml
```

## Flow conventions

- **Filename**: `{feature}-{intent}.yaml` (e.g., `sanskar-smoke.yaml`, `search-navigation.yaml`)
- **App ID**: Always `com.prashantsharma.vedansh` (matches `app.json` `ios.bundleIdentifier` / `android.package`)
- **Element selection priority** (per Maestro best practice):
  1. Visible text (`tapOn: "संस्कार"`) — preferred because the app is already bilingual and text-rich
  2. `accessibilityLabel` (`tapOn: "Hindi"`) — preferred for icon-only buttons (already set on Back, Bookmark, Share, Language toggle radio buttons)
  3. `testID` — only when the above don't apply
  4. **NEVER** use `point: x%, y%` coordinates — these break across device sizes
- **Wait between actions**: Use `waitForAnimationToEnd` after navigation, not fixed sleeps

## Available flows

| Flow | Purpose |
|---|---|
| `_launch.yaml` | **Shared subflow** — boots Expo Go, opens Vedansh, waits for Home. Used by every category smoke via `runFlow: _launch.yaml`. |
| `granth-smoke.yaml` | Granth: 3 sections (Bhagavad Gītā, Sundarkand, Ramcharitmanas). Opens Sundarkand. |
| `stotram-smoke.yaml` | Stotram: 7 sections. Opens Bajrang Baan (matches the jest smoke test). |
| `chalisa-smoke.yaml` | Chalisa: 4 sections. Opens Hanuman Chalisa (guards against PR #31 multi-instance regression). |
| `japam-smoke.yaml` | Japam: 4 mantras. Opens Gayatri Mantra (`JapamCounterScreen`, no language toggle). |
| `aarti-smoke.yaml` | Aarti: 7 sections. Opens Om Jai Jagdish Hare (multi-instance dispatch check). |
| `sanskar-smoke.yaml` | Sanskar: 7 sections. Verifies intro page, step indicator (Surya Namaskar), language toggle. |

Run a single flow: `maestro test --config .maestro/config.yaml .maestro/<category>-smoke.yaml`
Run all flows: `npm run test:e2e` (which runs `maestro test .maestro/`).

## Adding a new section — the per-category smoke MUST be updated

When you add a section to any existing category, append assertions to that category's smoke flow:
1. Add `- assertVisible: "<NameEn>"` to the CategoryList block.
2. If the new section uses a novel reader (intro page, step indicator, vidhi section, etc.), add a verifying step.
3. Run the flow locally before committing.

When you add a new **category**, follow the template established by `sanskar-smoke.yaml`:
1. Create `.maestro/<category>-smoke.yaml`.
2. Start with `- runFlow: _launch.yaml`.
3. Assert the new category tile is visible on Home (use `<NameEn>` substring).
4. Tap the tile via `"<NameEn>. Tap to open."` (CategoryCard's accessibilityLabel).
5. In CategoryList, assert every section's `nameEn` is visible.
6. Open one representative section, verify language toggle and back navigation.
7. Add a row to the table above documenting what the flow covers.

## Element selection rules (recap)

Maestro `tapOn` and `assertVisible` use regex matching against:
- Visible `<Text>` content
- `accessibilityLabel` props (so "Sacred Books. Tap to open." matches a CategoryCard with `accessibilityLabel={`${nameEn}. Tap to open.`}`)
- Visible non-empty text inside the accessibility tree

For multi-instance readers (Chalisa, Aarti, Sanskar), `LibraryCard` uses `${nameEn}. ${sub}. Tap to open.` — match on just the `nameEn` substring (e.g., `"Hanuman Chalisa"`).

**Do NOT use:**
- `point: <x%>, <y%>` (pixel coordinates) — breaks across device sizes.
- Raw Devanagari `<Text>` content matching at top level — the visible text is often inside a parent with the accessibility label.

## Caveats

- **Expo dev menu sheet:** `config.yaml` sets `snapshotKeyHonorModalViews: false` so Maestro can read the RN view tree behind iOS native sheets. Without it, the dev menu blocks every flow.
- **Bundle must be loaded:** Metro must be running (`npm start` in `mobile/`) AND Expo Go's "Recently opened" must show Vedansh. If the dev server changes ports (e.g., 8083 in use), update Expo Go's Recents by tapping Vedansh once after Metro boots.
- **First-launch state:** The very first time you tap into Vedansh from a fresh Expo Go install, the dev-menu info modal appears. Subsequent runs of `_launch.yaml` reuse the same state.
