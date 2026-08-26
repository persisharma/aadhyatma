# Maestro UI Tests — Vedansh

End-to-end UI tests for the Vedansh app. Runs against the iOS Simulator or Android Emulator using [Maestro](https://maestro.mobile.dev).

> **Verifying on a machine that runs several Conductor worktrees?** Use the isolated-simulator recipe (dedicated sim + this worktree's own Metro port + `--device`) in `wiki/runbooks/e2e-verification.md` — the shared sim's ambiguous "Vedansh" project can silently load the wrong worktree's bundle.

## Why Maestro

Per `RULEBOOK.md` §8 (Cross-platform verification), every section must be tested on both iOS and Android before merge. These flows automate that check.

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
| `_launch.yaml` | **Shared subflow** — boots Expo Go, opens Vedansh, waits for Home, and dismisses the first-launch feature tour if it auto-appeared (optional `Skip` tap — a no-op once the tour has been seen). Used by every category smoke via `runFlow: _launch.yaml`. |
| `granth-smoke.yaml` | Granth: 4 sections (Bhagavad Gītā, Sundarkand, Ramcharitmanas, Valmiki Ramayan). Verifies all 7 Valmiki kāṇḍas and opens Uttara Kāṇḍa. |
| `gita-smoke.yaml` | Bhagavad Gītā **chaptered reader** — the path `granth-smoke` skips. Home → Sacred Books → Bhagavad Gītā → chapter index → Chapter 1 reader; exercises horizontal verse paging and the `JumpToStartButton` "back to verse 1" pill (PR #97). Auto-advance to the next chapter (PR #29) is scroll-velocity driven (~47 swipes), so it's unit-tested in `src/screens/__tests__/gitaAutoAdvance.test.tsx` instead. |
| `stotram-smoke.yaml` | Stotram: 7 sections. Opens Bajrang Baan (matches the jest smoke test). |
| `chalisa-smoke.yaml` | Chalisa: 4 sections. Opens Hanuman Chalisa (guards against PR #31 multi-instance regression). |
| `japam-smoke.yaml` | Japam: 4 mantras. Opens the Gayatri Mantra `JapamCounterScreen` and taps the bead area to drive the count 0 → 3 (PR #40/#93). The Reset/Clear confirm modal's accessible backdrop collapses its buttons in the a11y tree, so the reset path isn't driven — the flow expects a clean counter from the suite baseline. |
| `aarti-smoke.yaml` | Aarti: 7 sections. Opens Om Jai Jagdish Hare (multi-instance dispatch check). |
| `sanskar-smoke.yaml` | Sanskar: 7 sections. Verifies intro page, step indicator (Surya Namaskar), language toggle. |
| `kavacham-smoke.yaml` | Kavacham (PRD-A, multi-instance form). Home → Kavacham tile → CategoryList (Rama Raksha Stotra) → reader → language toggle → back. First text: Rama Raksha Stotra (source-verified, 38 shlokas). |
| `stuti-smoke.yaml` | Stuti (PRD-A, multi-instance form) — **filed under Stotram, not its own tile** (स्तुति ≈ स्तोत्रम्). Home → Stotram (Hymns & Praise) tile → CategoryList → scroll to Krishna Stuti → reader (StutiReader) → language toggle. First text: Krishna Stuti (source-verified, 12 verses). |
| `ashtakam-smoke.yaml` | Ashtakam. Home → Ashtakam tile → CategoryList asserts **all 15 sections** (Sankat Mochan Hanuman Ashtak, Lingashtakam, Madhurashtakam, Achyutashtakam + the 10 PRD-A §A.4.2 deity-expansion ashtakams + Rudrashtakam, scrolled in library order) → Lingashtakam reader → language toggle → back. Multi-instance entries use AshtakamReader; the pre-existing Hanuman Ashtak keeps its dedicated reader. |
| `suktam-smoke.yaml` | Suktam (PRD-A, multi-instance form). Home → Suktam tile → CategoryList (Tantrokta Devi Suktam) → reader → language toggle → back. First text: Tantrokta Devi Suktam (source-verified, 30 verses). Purusha/Narayana Suktam BLOCKED (Vedic recension divergence). |
| `panchang-smoke.yaml` | Panchang **tab** (not a Home category). Switches language to English, opens the tab, asserts the astronomy block (Sunrise/Sunset/Moonrise/Brahma Muhurta), Drik Panchang/Ujjain header, Purnimant/Amanta toggle, inline calendar selection, and Vrat/Upcoming observance sections. |
| `kundali-smoke.yaml` | PRD-C Kundali + Daily Rashifal against the **native iOS app** (`com.prashantsharma.vedansh`, not Expo Go). Clears app state, launches the development build with native `RCT_jsLocation=127.0.0.1:8084`, switches to English, uses the permanent Home Kundali launcher, enters the Ujjain golden-fixture birth profile, checks beginner overview + North Indian chart + grahas + Vimshottari Dasha, then opens deterministic Daily Rashifal. Build/install first with `npx expo run:ios --device <UDID> --port 8084`. |
| `muhurat-finder-smoke.yaml` | **PRD-16 Event Muhurat Finder.** Both entries — Home मुहूर्त tile (after कुंडली) and the Panchang-tab door — then occasion picker (all 6 occasions + abujh door) → Vehicle Purchase ranked results → day detail (DrikPanchang provenance line, Why-this-date evidence, doshas) → "Day's full timings" into the shipped MuhuratDetail → Abujh (special auspicious days) calendar. Native build; English chrome via the More→Language recipe. |
| `panchang-day-cache-smoke.yaml` | **Persistent panchang day-cache** (design.md §60). Warms the finder + Abujh scans on a fresh install, then relaunches WITHOUT `clearState` — a real cold start with AsyncStorage intact — and asserts Home's Today strip, the Panchang tab, the finder results and the Abujh list all re-render from the hydrated store inside a 20 s budget (vs the 60 s first-run solve). Native build; the regression it guards is re-solving the same days on every app open. |
| `guna-milan-smoke.yaml` | PRD-16 platform-neutral iOS + Android flow. Creates a real saved Kundali, opens Guna Milan inside the Panchang stack, autofills the device owner into both directional roles, verifies the exact result and an expanded accessible row, inspects the privacy-safe share preview, then changes one time to unknown and verifies a full-IST-day score range with no exact-share action. Run the same file separately on both platforms. |
| `vidhi-smoke.yaml` | **PRD-19 Puja Vidhi (Phase 1).** Panchang tab → Vrat & Parv → पूजा विधि tile → vidhi catalog → Satyanarayan detail (duration-only header, routine-style samagri summary/checklist, तैयारी/पूजा segments) → "Begin puja" conduct mode → swipes to the dhyana reading card and back → exits with state saved. Provenance remains private; bottom reader dots replace previous/next controls and swipe-helper copy. The ObservanceCard's vidhi pill is date-dependent (purnima), so the deterministic door is the catalog tile; the pill itself is unit-tested in `VidhiScreens.test.tsx` + the vidhiId hook in `vidhiContent.test.ts`. |
| `daily-bhakti-smoke.yaml` | Daily Bhakti **tab** (the screen daily reminders land on). Switches language to English, opens the tab, asserts the verse card ("Daily Verse"/"Meaning"), and exercises the "↻ next" control. The notification-tap deep-link can't be driven by Maestro, so it's unit-tested in `src/notifications/__tests__/` instead. |
| `new-content-badge-smoke.yaml` | NEW badge — stotram **CategoryList** path. Dev-seeds the upgrader state, asserts the stotram tile + Krishna/Bajrang/Ram Stuti cards show NEW (Shiva doesn't), then taps one (markSeen) and confirms the badge stays cleared across a restart. |
| `new-content-badge-home-smoke.yaml` | NEW badge — **Home category tiles**. Asserts `hasNewInCategory` scoping (only the stotram tile lights up; every other category + By Deity renders plain), then marks all three stotram debut-new entries seen and confirms the tile's badge clears. |
| `new-content-badge-deity-smoke.yaml` | NEW badge — **By-Deity** surface. Opens Shri Krishna, asserts Krishna Stotram shows NEW in the deity list, then taps it (markSeen from `DeityListScreen`) and confirms the badge clears on return. |
| `deity-browse-smoke.yaml` | **By-Deity** general browse (independent of the NEW badge). Home → By Deity → asserts the deity grid (Rama/Krishna/Vishnu) → opens Shri Vishnu and asserts "Vishnu Sahasranama" is listed (PR #99 deity tagging, verified on-screen) → opens the entry and returns. |
| `deity-expansion-smoke.yaml` | **PRD-A §A.4.2 deity expansion (9 → 21).** Home → By Deity → scrolls through all 12 new deity cards (Maa Lakshmi … Navagraha, registry order) → Shani Dev → Shani Ashtakam in AshtakamReader (guards the registry-derived `entryRoutes` routing) → back → Navagraha → Navagraha Stotram in StutiReader → language toggle on both readers. |
| `discovery-purpose-smoke.yaml` | **Intent discovery** (PRD-B). Home → By Purpose → purpose grid → Protection list → opens Rama Raksha Stotra and asserts the first-page "When to Recite" panel. |
| `single-chapter-open-smoke.yaml` | **Single-chapter texts open in one tap** (design.md §38). Opens Bajrang Baan from the Hymns & Praise list and asserts the reader is up, that no `Section 1 …` chapter row was interposed, and that ONE Back returns to the list. Guards the regression where a one-chapter text routed through a one-row Chapters index, costing a second tap on every entry surface (Home आज के लिए row, By-Purpose lists, search, category/deity lists). |
| `routine-smoke.yaml` | Daily Routine (Nitya Sadhana, PRD-07) — **Daily** mode. Full lifecycle from the docked `RoutineBanner`: create a Daily routine (name + mode), add Hanuman Chalisa (by its `Add <NameEn>` toggle label), see it in "Today's Practice", flip the check-off `0/1 → 1/1` — which fires the **app-wide completion pushpa-varsha** (asserts its "Complete for today" caption on the Today screen, proving the shower is global and not docked to Home's banner) — confirm it lists with the `DAILY` pill, then delete it (single pop back to "My Routines" → "No routines yet"; also resets state for re-runs). Also screenshots the Home `ॐ वेदांश़ ॐ` wordmark to `/tmp/vedansh-home-wordmark.png` for header-alignment review. ✅ verified on iOS sim. |
| `routine-weekday-smoke.yaml` | Daily Routine — **Weekday** mode + deep interactions. Creates a weekday routine, asserts the deity-of-day `SUGGESTED` chip, adds Hanuman Chalisa (by its `Add <NameEn>` toggle label — deterministic regardless of the day's suggestion), marks an item done **and un-marks it** (`0/1 → 1/1 → 0/1`), **opens the item into its reader** (ChalisaReader) and returns, confirms the `WEEKDAY` pill, **removes the item** (→ "No items added yet"), then deletes (→ "No routines yet"). ✅ verified on iOS sim. |
| `sadhana-sankalp-smoke.yaml` | Sadhana Programs (संकल्प, PRD-11 #167) — prebuilt multi-day vows clubbed into routine creation. From the docked `RoutineBanner`: RoutineCreate 'choose' fork → **Choose a prebuilt sankalp** → opens the `consecutive` "Hanuman Chalisa — 41 Days" program (date-independent, unlike the festival/weekday sankalps) → **Begin this sankalp** enrols and lands on "Today's Practice", where the `SankalpTodayCard` shows `SANKALP · 0 / 41` (a days-completed counter — 0 done on a freshly begun vow) + the day's item → committing the day ticks it to `1 / 41` and flips the card to the "Today's reading is done" resting state → Back to the now-active Detail → **Set this sankalp aside** abandons it, returning the program to the **Available** shelf (badge reverts to "41 days") so back-to-back runs stay clean. The list/detail now sit on the deity sketch background with warm `LibraryCard`-style cards (gradient thumb + both languages + status pill + chevron), so the card assertions match on the title substring (cards carry an explicit `<titleEn>. <subtitleEn>. Tap to open.` a11y label) and the Today eyebrow reads `Sankalp · 0 / 41`. ✅ verified on iOS sim. |
| `sadhana-calendar-preview-smoke.yaml` | Sadhana calendar-gated preview (PRD-11 #167 follow-up). Guards the dead-end regression: enrolls the `festival-window` **Navratri — Nine Days of Durga** while its window is closed (true on ~every run date) and asserts Today's Practice shows the resting copy (`Your sankalp begins …`) **plus** the day-1 unit as a tap-to-read preview (`Durga Chalisa … Tap to read`) — never an empty card — then sets it aside to stay clean. ✅ verified on iOS sim. |
| `search-smoke.yaml` | Library search (PRD-03, #57). Opens search from the floating ⌕ button, asserts the Popular shortcuts, types a query and asserts matching Sections, clears it, checks the zero-results state, and opens a popular shortcut into its reader. ✅ verified on iOS sim (was RED while the ⌕ FAB sat behind the docked `RoutineBanner` and the tap opened RoutineCreate; fixed by lifting the FAB above the banner). |
| `wishlist-smoke.yaml` | Wishlist / bookmarks (#46/#51/#55). Bookmarks a Sundarkand verse in the reader, opens the Wishlist from the More tab, asserts the saved verse appears, exercises the remove-confirm modal (Cancel), taps the card to navigate back to the verse, and un-bookmarks to clean up. |
| `reminders-smoke.yaml` | Reminder settings (PRD-01 #53; multiple times #70; default-enabled #75; festive reminders). Opens Reminders from the More tab, adds a second reminder time and confirms a remove control appears, then removes it, then scrolls to the default-on **Festival reminders** card. Both on/off toggles are omitted (native permission dialog) — they're unit-tested instead. |
| `more-smoke.yaml` | **More tab** hub — asserts the Wishlist/Reminders/Language cards, opens the **Sadhak Profile** insights screen and exercises its Lifetime/Monthly/Daily range toggle (PR #33), and opens the **About & Disclaimer** modal (`helpContent`). |
| `pitru-smaran.yaml` | **पितृ स्मरण** (PRD-17 Phase 1). More → पितृ स्मरण row → reverent empty state → add flow through the month/paksha/tithi pickers (माघ कृष्ण अष्टमी) → list row with the solved next date → detail hero + गीता पाठ rows → delete confirm sheet → back to the empty state (net zero). The date→tithi derivation, the Pitru Paksha overview, and the Panchang day chip are calendar-dependent and are pinned by unit tests instead (`src/panchang/__tests__/pitruSmaran.test.ts`, `PitruSmaranScreens.test.tsx`, `PitruSmaranDayChip.test.tsx`). |
| `resume-reading-smoke.yaml` | **Resume reading** (PR #97). Reads into Bhagavad Gītā Ch.1 v2, leaves, re-opens the entry → asserts the `ResumeReadingSheet` pops with the saved location ("Chapter 1 · Verse 2") → taps **Resume** → confirms it lands back mid-chapter (the JumpToStart pill is showing). |
| `home-today-smoke.yaml` | **Home today-first redesign** (design.md §18/§48). Flips to English (Devanagari is unreadable to Maestro's iOS tree), asserts the "आज · Today" strip renders on Home, opens the **व्रत (Vrat & Parv)** launcher tile into the Panchang stack's ObservanceList and backs out onto PanchangHome (guards the `panchangTabTarget`/`initial: false` lazy-mount route bug). (The Continue-reading card leg was dropped when the card was retired, July 2026 — resume is covered by `resume-reading-smoke.yaml`.) |
| `feature-tour-e2e.yaml` | **First-launch feature tour** (in-context **spotlight** walkthrough — measured saffron ring on each step's element/tab, compact card, design.md §47). Driven via the replay affordance (More → "Show App Tour") for determinism against a persisted simulator: waits for the tour control, walks all 9 steps forward (Home → Panchang → Today's Practice → Bhajan → Bhakti → Japa → Wishlist → Reminder → Share) asserting each step's subtitle, exercises **Back**, and finishes with **Done**, asserting the overlay is gone. Controls expose only their a11y label and Maestro full-string-matches, so the flow selects `Skip tour` / `Next step` / `Previous step` / `Done` (not `Skip`). The auto-show-on-first-launch path is the same overlay; `_launch.yaml` dismisses it (`Skip tour`) for every other flow. ✅ verified on iOS sim. |
| `language-smoke.yaml` | **Gujarati & Kannada reading languages.** More → select **Gujarati** → asserts the More chrome re-scripts (`પંચાંગ`) → opens Hanuman Chalisa and asserts the title in Gujarati script (`હનુમાન ચાલીસા`) → switches to **Kannada** via the in-reader 4-way toggle (`ಹನುಮಾನ ಚಾಲೀಸಾ`) → restores **Hindi** (`हनुमान चालीसा`). gu/kn script is derived at runtime by transliterating the bundled Devanagari (`utils/transliterate.ts`); the exact asserted strings are pinned by `src/utils/__tests__/transliterate.test.ts`. ✅ verified on iOS sim. |
| `rating-prompt-smoke.yaml` | **App rating prompt** (design.md §54) via its manual entry point. More → English → scrolls to **Rate the App** → asserts the sheet ("Enjoying Vedansh?") → **Maybe later** closes it → reopens and takes **Don't ask again**, confirming the row survives the permanent opt-out (which silences only the auto-ask). The primary button is never tapped — it hands off to the store via `Linking` and the flow couldn't return, same as the Instagram row in `more-smoke.yaml`. |

| `share-target-smoke.yaml` | **Verse share target picker** (design.md §39.1/§39.2). Hanuman Chalisa reader → `Share verse` → asserts the in-app picker (`Share to other apps`, `Share on Instagram` 4:5, `Share as Instagram story or reel` 9:16, `Cancel`) and that the hashtag preview is built from *this* verse (`#HanumanChalisa`, `#JaiHanuman`), then cancels. The flow stops at the picker on purpose: past it is a native share sheet Maestro can't drive and that would leave Instagram in the foreground for the next flow. Caption + tag content is pinned by `utils/__tests__/shareHashtags.test.ts` and `shareVerseTarget.test.tsx`. |

| `read-aloud-smoke.yaml` | **Read Aloud (पाठ सुनें) — on-device TTS** (design.md §53). **Native build only** — `expo-speech` is a native module, unavailable in Expo Go. Two halves: the deterministic More → **Read Aloud** settings sheet (asserts the `पाठ सुनें` header, steps the rate 1.0 → 1.2 → 1.0 via `Faster`/`Slower`, toggles `Read commentary` on and off, restores every preference so the persisted state doesn't leak into other flows), then the in-reader control on Hanuman Chalisa. The reader half asserts the control is present as **either** `Read aloud` or `Read aloud unavailable`, but marks the play/pause transition `optional: true`: a CI emulator with no Hindi voice data renders the muted state by design, and that is not a failure. |

Run a single flow: `maestro test --config .maestro/config.yaml .maestro/<category>-smoke.yaml`
Run all flows: `npm run test:e2e` (which runs `maestro test .maestro/`).

### Covered by unit tests instead of Maestro

Some primary behaviours can't be driven deterministically from Maestro on the iOS
simulator; they're covered by Jest/tsx suites instead:

| Behaviour | Why not Maestro | Unit test |
|---|---|---|
| Auto-advance to next chapter (PR #29) | Scroll-velocity driven; needs ~47 exact page-swipes to reach the chapter end | `src/screens/__tests__/gitaAutoAdvance.test.tsx` |
| OTA "update ready" popup (PR #92) | `expo-updates` is disabled in Expo Go, so the modal never mounts on the sim | `src/components/__tests__/UpdateReadyModal.test.tsx`, `src/utils/__tests__/semverCompare.test.ts` |
| Notification-tap deep link (PR #97) | Maestro can't schedule + tap a real OS notification | `src/notifications/__tests__/deepLink.jest.test.tsx` |
| Share-verse card | Tapping Share opens the OS share sheet, which Maestro can't inspect (and the Gita verse page collapses the share button under its `accessible` ScrollView) | `src/components/__tests__/shareCardFit.test.tsx` |
| Japam Reset/Clear confirm | The confirm modal's accessible backdrop collapses its buttons in the a11y tree (see `japam-smoke.yaml`) | counter logic exercised via the increment path in `japam-smoke.yaml` |
| Read-aloud page auto-advance, chapter-boundary stop, and pause/resume chunk bookkeeping | Needs a device with Hindi TTS voice data plus real utterance timing; `onDone` cannot be driven from Maestro | `src/contexts/__tests__/ReadAloudContext.test.tsx`, `src/screens/__tests__/readerReadAloud.test.tsx` |
| Read-aloud "no voice installed" recovery (Android TTS-settings hop) | Leaves the app for system Settings, which Maestro can't drive back deterministically | `src/components/__tests__/ReadAloudSettingsSheet.test.tsx` (unavailable state + retry re-probe) |
| First-run notification-permission ask, incl. the Android "never requested reads back as denied" case (design.md §38) | The OS permission dialog is native and non-deterministic on CI, and `_launch.yaml` runs `clearState: true` without resetting the OS-level grant | `src/notifications/__tests__/permissionState.jest.test.ts`, `src/contexts/__tests__/NotificationPreferencesContext.test.tsx` |
| Rating prompt **auto**-open (design.md §54) | The gate needs 5 cold starts, 3 active days, and 20 verse reads; `_launch.yaml` runs `clearState: true`, so a flow can never satisfy it. The manual path IS covered — see `rating-prompt-smoke.yaml`. | `src/data/__tests__/ratingPrompt.jest.test.ts`, `src/components/__tests__/RatingPromptSheet.test.tsx` |

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
