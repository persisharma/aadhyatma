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

`./push.sh` publishes a JS-only update via `eas update`. Notifying users is
opt-in per push:

```bash
./push.sh "small typo fix"                              # silent
./push.sh -n "New chapter added"                        # notify (body = message)
./push.sh -n -t "नया अध्याय" -b "Open to read" "..."   # notify with custom copy
```

`-n` fires **two** notification paths:

1. **Remote push** via Expo's free push service to every device registered
   in Supabase — reaches users even with the app closed, so they can tap to
   open. Requires `.env` set up (see below).
2. **Local fallback** baked into the bundle itself
   (`mobile/src/data/otaRelease.json`) — fires on the next cold start in
   case the remote push didn't land (offline, expired token, etc.). The
   in-app received-listener dedupes against the remote push.

### One-time push setup ($0, no credit card)

1. Create a free Supabase project at https://supabase.com.
2. In the SQL editor, run `scripts/supabase-schema.sql` to create the
   `push_tokens` table + RLS policies.
3. Project Settings → API: copy the **Project URL**, **anon** key, and
   **service_role** key.
4. Fill in `mobile/app.json` → `expo.extra.supabaseUrl` +
   `expo.extra.supabaseAnonKey` (these are safe to commit — RLS protects
   the table from the anon key).
5. `cp .env.example .env` at the repo root and paste in your
   `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (this stays local, never
   commit). `.env` is git-ignored.
6. Ship a new binary so devices start registering their push tokens. After
   that, every `./push.sh -n "..."` will fan out via Expo Push.

Without `.env` configured, `-n` still works — it just skips the remote
push and only ships the local fallback.

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
