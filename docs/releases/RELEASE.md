# Production release runbook (iOS)

How to cut a production App Store release of Vedansh from this repo. Two moving parts:

- **`./release.sh`** (repo root) — build the store binary, submit it, optionally push listing
  metadata + git-tag. Companion to **`./push.sh`** (OTA JS updates, no store review).
- **`mobile/store.config.json`** — the App Store listing text (name/subtitle/description/keywords/
  promo/release-notes/categories/age-rating), pushed by `eas metadata:push`.

Auth: EAS uses `EXPO_TOKEN` (or `eas login`) as **prashant.sharma**. Git/GitHub uses the
**persisharma** account (`gh auth switch --user persisharma` before any tag push).

---

## One-time setup

### 1. App Store Connect API key (powers `eas submit` + `eas metadata`)
1. App Store Connect → **Users and Access → Integrations → App Store Connect API** → generate a
   team key with the **App Manager** role. Download the `AuthKey_XXXX.p8` **once**.
2. First submit stores it with EAS so later runs are non-interactive:
   ```bash
   cd mobile && npx eas-cli submit --platform ios --profile production --latest
   ```
   When prompted, choose *App Store Connect API Key* → provide the `.p8`, **Key ID**, and
   **Issuer ID**. EAS saves it to the project; you won't be asked again.
   - Alternative (CI / no prompt): keep the key out of git under `mobile/credentials/` (already
     gitignored) and set `ascApiKeyPath` / `ascApiKeyId` / `ascApiKeyIssuerId` in
     `eas.json → submit.production.ios`, **or** export `EXPO_ASC_API_KEY_PATH`,
     `EXPO_ASC_API_KEY_ID`, `EXPO_ASC_API_KEY_ISSUER_ID`.
   - **Never commit the `.p8`, Key ID or Issuer ID files.** `*.p8` and `credentials/` are gitignored.

### 2. Confirm listing URLs
`store.config.json` uses `https://persisharma.github.io/get-vedansh` for marketing/support and
`.../privacy` for the privacy policy. App Store **requires a reachable privacy-policy URL** — make
sure that page exists before `metadata:push`, or edit the URLs.

---

## Per-release steps

1. **Bump the version.** Edit `mobile/app.json → expo.version` (e.g. `1.4.3` → `1.4.4`) for any new
   marketing version. The iOS **buildNumber auto-increments** on build (eas.json
   `production.autoIncrement: true`) — don't bump it by hand. Commit the version bump.
   > Runtime note: `runtimeVersion.policy = appVersion`, so a new version = a new OTA runtime.
   > After the store build ships, OTA pushes (`push.sh`) reach that new runtime — see the
   > `ota-runtime-version-mismatch` memory.

2. **Refresh store assets** (if UI/features changed): regenerate screenshots + preview per
   `.context/appstore-<ver>/README.md` (`make-appstore.js ios|ipad`, `make-video.js`) and update
   the copy in `store.config.json` (release notes + promo at minimum).

3. **Release.** From repo root:
   ```bash
   ./release.sh                 # tests → build → submit  (asks to confirm each irreversible step)
   ./release.sh --metadata      # also push store.config.json listing text
   ./release.sh --metadata --tag  # + git tag v<version> and push it
   ./release.sh --dry-run ...   # print the commands without running them
   ```
   Other modes: `--build-only`, `--submit-only`, `--metadata-only`, `--skip-tests`.

4. **Screenshots (automated).** `eas metadata` pushes text only, so screenshots go via the App
   Store Connect API with `scripts/asc-upload-screenshots.mjs` (self-contained Node; no fastlane).
   - **One-time key setup** (key never enters git): App Store Connect → Users and Access →
     Integrations → App Store Connect API → download the `AuthKey_XXXX.p8`. Put it at
     `mobile/credentials/asc-api-key.p8` (gitignored) and export its ids:
     ```bash
     export ASC_KEY_ID=XXXXXXXXXX ASC_ISSUER_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
     ```
     (Or point `ASC_KEY_PATH` / `ASC_KEY` elsewhere.) This is the *same* key EAS already uses for
     submit — it just isn't downloadable from EAS, so keep your own copy locally.
   - **Dry-run first** (auth + finds the editable version, uploads nothing):
     `./release.sh --screenshots-only --dry-run`  (or `node scripts/asc-upload-screenshots.mjs --dry-run`)
   - **Upload**: `./release.sh --screenshots-only` — replaces the 6.9" + iPad-13" sets from
     `.context/appstore-<ver>/frames/{ios,ipad}` in filename order. `--only ios|ipad` and `--keep`
     (append instead of replace) are supported on the script.
   - **App preview video** still isn't covered by the API upload — drag
     `video/vedansh-preview-6.9.mp4` into the 6.9" preview well in the ASC UI.

5. **Finish in App Store Connect**:
   - **Attach the build** to the version (Build section) — `eas submit` delivers it; you pick it here.
   - **App Privacy**: keep **Data Not Collected** (see `docs/releases/<ver>-app-review.md`).
   - **Submit for Review** (unless `release.automaticRelease`). `phasedRelease` is on, so an
     approved build rolls out over 7 days.

**Choosing the build:** `--submit-only` is *interactive* — EAS lists existing builds and you pick
one; it never builds a new binary. Add `--latest` only if you want the newest build non-interactively.

---

## Quick reference

| Task | Command |
|---|---|
| OTA JS update (no review) | `./push.sh "message"` |
| Full store release | `./release.sh --metadata --screenshots` |
| Build only | `./release.sh --build-only` |
| Submit existing build (pick it) | `./release.sh --submit-only` |
| Submit latest build | `./release.sh --submit-only --latest` |
| Push listing text only | `./release.sh --metadata-only` |
| Upload screenshots only | `./release.sh --screenshots-only` |
| Screenshot dry-run | `./release.sh --screenshots-only --dry-run` |
| Validate listing config | `cd mobile && npx eas-cli metadata:lint` |
| Preview the flow | `./release.sh --dry-run --submit-only --metadata --screenshots` |
