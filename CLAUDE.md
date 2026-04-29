# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project shape

Wayfarer is a personal iOS walking-motivation app (not App Store) built on React Native + Expo SDK 54, plain JavaScript (no TypeScript). Real Fitbit step data drives a virtual journey on a map with AI-generated story cards. Single-developer, single-device target. The PRD, tech spec (§8 layout, §9 milestones), wireframes, and visual design live in `docs/`.

## Commands

```bash
npm start                # Metro for the custom dev client (= expo start --dev-client). Required for any Fitbit/Maps/Anthropic flow.
npm run start:go         # Classic Expo Go. Non-Fitbit screens only — Fitbit OAuth rejects exp:// redirects.
npm run prebuild         # expo prebuild --platform ios. Regenerates the gitignored ios/ from app.json.
npm run prebuild:clean   # Same, --clean (when ios/ is wedged).

npm test                 # Jest one-shot.
npm run test:watch       # Watch mode.
npm test -- __tests__/components/Button.test.js   # Single file.
npm test -- -t "renders the hero card"            # Single test by name pattern.
```

There is no lint or typecheck script — Jest is the only CI gate.

## Running on device

M5+ requires a **custom dev client** built once via Xcode (`npm run prebuild` → `cd ios && pod install` → open `ios/Wayfarer.xcworkspace` → ⌘R). Free Apple ID provisioning expires every 7 days; re-build via Xcode to resign. Only rebuild via Xcode when native config changes (Expo plugins, `scheme`, `bundleIdentifier`, `ios.infoPlist`) or for the weekly resign — all JS changes hot-reload through Metro. Full setup steps are in `README.md`.

## Architecture

### Navigation (`app/navigation.js`)

A single root native-stack owns everything. `Main` (bottom tabs: Today / Journey / Explore) is the initial route; `Onboarding`, `GoalSetup`, and `Completion` are nested native-stacks pushed as modals; `StoryCard`, `JourneyStats`, and `MonthlySummary` are root-level modal screens. All theming (dark, ochre primary) is centralized here via a `navTheme` and a shared `stackScreenOptions`.

Screens are organized under `app/` to mirror tech spec §8 — `app/(tabs)/`, `app/onboarding/`, `app/goal/`, `app/completion/`, `app/journey/`, `app/explore/`. **The `(tabs)` parens are a naming convention, not Expo Router.** This project uses plain `@react-navigation/native-stack` + `bottom-tabs`; routing happens in `navigation.js`, not via filesystem conventions.

### Fitbit integration (M5)

Three layers, in dependency order:

- **`storage/secureStore.js`** — OAuth tokens via `expo-secure-store` (iOS keychain). Refresh tokens are long-lived bearer credentials and must never touch AsyncStorage.
- **`storage/userStore.js`** — Non-sensitive profile (stride, hometown, places) as a single JSON blob under `@user` in AsyncStorage. `setUser(partial)` does a shallow merge.
- **`services/fitbit.js`** — Pure network layer, no React. `withAuth(fn)` wraps a function-of-access-token: on 401 it refreshes once and retries; on refresh failure it clears tokens and rethrows so the UI sees a "not connected" state. All dates use `localISODate()` (not `toISOString().slice(0,10)`) — Fitbit rejects the literal `"today"` and UTC slicing leaks tomorrow's date for users behind UTC late at night.
- **`hooks/useFitbit.js`** — React-side cache. Module-level `cache` + 60s TTL + pub/sub `subscribers` set so tab switches don't re-fetch. `error` is explicitly reset to `null` on mount (matching the `refresh` path) so stale errors don't survive Metro fast refresh. Exports `_resetCacheForTests()` for tests that need a fresh module state.

OAuth itself runs in `app/onboarding/fitbit-connect.js` via `expo-auth-session`'s `useAuthRequest` (PKCE, public client — `EXPO_PUBLIC_FITBIT_CLIENT_ID` is intentionally bundled into the client; `FITBIT_CLIENT_SECRET` is unused). The hook is read-only because `promptAsync` needs a user-gesture binding.

### Stride conversion (`constants/stride.js`)

Fitbit returns `strideLengthWalking` in cm. Always convert via `cmToStepsPerMile()`; use `STRIDE_FALLBACK` when the profile field is missing. Keep formula changes confined to this file.

### Mock data (`constants/mockData.js`)

Single source of truth for non-Fitbit numbers (goal, hero copy, story cards, suggestions, monthly stats). Real data swaps in milestone-by-milestone — M5 replaced today's steps + 30-day average; M6 will replace `goal.*`. When wiring real data, leave a `// TODO: M<n> — replace with real <field> from storage` comment so the swap is greppable.

### Fonts and theming

`App.js` loads Lora (serif) + DM Sans (sans) via `@expo-google-fonts/*` and gates `RootNavigation` on `fontsLoaded` to avoid a font flash. Colors live in `constants/colors.js`, font families + scale in `constants/fonts.js` (`type.h1`, `type.label`, `type.bodySmall`, etc.).

## Tests

Jest with the `jest-expo` preset. Test tree mirrors the source tree exactly: `components/Foo.js` → `__tests__/components/Foo.test.js`. New components and services don't land without a co-located `*.test.js`.

`jest.setup.js` stubs every native-only module the suite touches: `@expo/vector-icons`, `react-native-safe-area-context`, `expo-secure-store` (in-memory `Map` with a `__reset` escape hatch), `@react-native-async-storage/async-storage` (official jest mock), `expo-auth-session`, `expo-web-browser`, `expo-constants`, `react-native-svg`. Keep this file tiny — per-test mocks belong next to the test, not in setup.

## Environment

`.env` is gitignored. Copy from `.env.example` and fill in. Two keys use the `EXPO_PUBLIC_` prefix so Expo bundles them into the client:

- `EXPO_PUBLIC_FITBIT_CLIENT_ID` — Fitbit OAuth runs as a public client with PKCE; the bundled id is the public half of that flow.
- `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` — read by `PlaceAutocomplete` to call the Google Places Autocomplete + Details endpoints on-device. Restrict the key by iOS bundle id in the GCP console; that's what keeps it safe to bundle.

Register both Fitbit redirect URIs at dev.fitbit.com:

- `wayfarer://fitbit-auth` (dev client)
- `exp://<LAN-IP>:8081/--/fitbit-auth` (Expo Go — re-register if the LAN IP changes)

## Milestones

Build order is fixed by tech spec §9. M1–M5 are complete (env, navigation skeleton, onboarding UI, Today/Journey UI on mock data, Fitbit integration). M6 (goal + maps) is next. The standing rule: **always leave the app working** — every milestone ships a usable build.
