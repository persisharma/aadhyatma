# Maestro flows — Vedansh

Device-level smoke tests run against **Expo Go** on an iOS simulator.

## Files

| File | Purpose |
|---|---|
| `config.yaml` | Workspace config (`snapshotKeyHonorModalViews: false`) so Maestro can read past the Expo dev-menu sheet. |
| `theerth-smoke.yaml` | PRD-08 Theerth flow: Home → Pilgrimage → Famous Theerths → real-map pin → detail (§10.3 placeholder) → back → By-State view. **Verified passing.** |

## Running

Requires a **booted iOS simulator** with Expo Go installed, and Metro for *this*
worktree.

```bash
# 1. From mobile/, start Metro. Use a distinct port if another Conductor
#    worktree already holds 8081 (Expo's default):
npx expo start --port 8081          # or 8083, etc.

# 2. (Once) edit the `openLink` line in theerth-smoke.yaml to match your port.

# 3. Run the flow:
maestro test .maestro/theerth-smoke.yaml
```

The flow uses `openLink: exp://127.0.0.1:<port>` to load **this** worktree's
bundle directly, rather than tapping a "Vedansh" entry in Expo Go's project
list — because every worktree serves a dev server named "Vedansh", the
project-list tap is ambiguous when agents run in parallel. `stopApp` at the top
guarantees a cold launch to Home.

## Gotchas (learned the hard way)

- **Maestro anchors a text selector to an element's FULL text.** A bare
  `"RULEBOOK"` will NOT match the element whose text is *"… Placeholder per
  RULEBOOK §10.3."* — use `".*RULEBOOK.*"`. Likewise a `LibraryCard` carries a
  subtitle, so match `"Famous Theerths\\..*Tap to open\\."`, not
  `"Famous Theerths. Tap to open."`.
- **Category/section taps use the English `nameEn`** accessibility label
  (`"<name>. Tap to open."`) regardless of UI language. In-screen taps (pins,
  view toggle) follow the active language, so the flow switches to English
  first to keep taps deterministic.
- **Detail-screen prose needs `extendedWaitUntil`**, not `assertVisible` — the
  ScrollView text lays out a beat after the navigation animation ends.
- **One simulator, many worktrees.** Only run when the sim is free; back-to-back
  runs can flake on the dev-menu sheet — reboot the sim
  (`xcrun simctl shutdown booted && xcrun simctl boot <id>`) between runs.
