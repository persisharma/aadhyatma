# Maestro flows — Vedansh

Device-level smoke tests run against **Expo Go** on an iOS simulator.

## Files

| File | Purpose |
|---|---|
| `config.yaml` | Workspace config (`snapshotKeyHonorModalViews: false` so Maestro can read past the Expo dev-menu sheet). |
| `_launch.yaml` | Shared boot subflow: launch Expo Go → open **Vedansh** → wait for the Home canary. |
| `theerth-smoke.yaml` | PRD-08 Theerth flow: Home → Pilgrimage → Famous Theerths → real-map pin → detail → back → By-State view. |

## Running

Requires a **free, booted iOS simulator** and Metro for *this* worktree.

```bash
# 1. From mobile/, start Metro for THIS branch (use a dedicated port if 8081
#    is taken by another Conductor worktree):
npx expo start --port 8081        # or --port 8082 if 8081 is in use

# 2. Load this project into Expo Go on the simulator (press `i`, or):
xcrun simctl openurl booted exp://127.0.0.1:8081

# 3. Run the flow:
maestro test .maestro/theerth-smoke.yaml
```

## Notes / gotchas

- **One simulator, many worktrees.** Conductor runs parallel agents; the sim and
  port 8081 may be in use by another worktree. Use a distinct `--port` and only
  run when the sim is free, or the flow will exercise the wrong branch's bundle.
- Back-to-back full runs can flake on the Expo Go dev-menu sheet — reboot the
  sim (`xcrun simctl shutdown booted && xcrun simctl boot <id>`) between runs.
- Category/section taps use the **English** `nameEn` accessibility label
  (`"<name>. Tap to open."`) regardless of UI language. In-screen taps (pins,
  view toggle) follow the active language, so `theerth-smoke.yaml` switches to
  English first to keep taps deterministic.
