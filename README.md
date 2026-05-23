# Aadhyatma

Umbrella repo. Currently houses a single React Native app for the **Vedansh** experience.

## Layout

```
.
├── mobile/     # Expo SDK 54 React Native app (TypeScript)
└── README.md
```

## Mobile app — quick start

```bash
cd mobile
npm install
npx expo start
```

Then press `i` for iOS simulator or `a` for Android emulator, or scan the QR with Expo Go on a device.

## Stack

- Expo SDK 54
- React Native 0.81, React 19
- TypeScript strict, path alias `@/*` → `src/*`
- React Navigation 7 (native-stack)
- Theming via `ThemeContext` + `useTheme()` hook (light only for now)

## OTA updates

`./push.sh` publishes a JS-only update via `eas update`. Notifying users about
the new bundle is opt-in per push (local notification fired on the next launch
after the bundle applies — no push server, no tokens):

```bash
./push.sh "small typo fix"                              # silent
./push.sh -n "New chapter added"                        # notify (body = message)
./push.sh -n -t "नया अध्याय" -b "Open to read" "..."   # notify with custom copy
```

The notification metadata lives in `mobile/src/data/otaRelease.json`. The
script rewrites it (notify=true) just before `eas update`, then `git checkout`s
it back so the committed default stays notify=false.

## Roadmap (deferred)

- Dark mode + persisted theme
- Auth + AuthContext
- API layer (TanStack Query)
- Onboarding + first-run gate
- Bottom tab navigation
- Reanimated-based transitions
- SDK 54 → 55 migration (once Expo Go stores catch up)
- Jest + React Native Testing Library
- EAS build profiles + OTA update scripts
