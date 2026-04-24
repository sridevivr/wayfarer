# Wayfarer

A personal iOS walking-motivation app. Fitbit step data becomes a virtual journey on a map with AI-generated story cards that mark the trip.

**Stack:** React Native + Expo (SDK 54), JavaScript, React Navigation v6, react-native-maps, AsyncStorage, Anthropic API, Fitbit OAuth2.
**Target:** iOS on a personal device — not App Store.

## Reference docs

All design and spec docs live in [`docs/`](./docs):

- `wayfarer_prd.docx` — product requirements
- `wayfarer_tech_spec.docx` — technical spec (§8 folder layout, §9 milestones)
- `wayfarer_wireframes.jsx` — grayscale wireframes
- `wayfarer_visual_design.jsx` — colors, typography, animated mockups

## Folder layout (tech spec §8)

```
app/
  navigation.js   root stack + tabs + nested onboarding/goal/completion stacks
  (tabs)/         bottom-tab screens: today, journey, explore
  onboarding/     5 onboarding screens
  goal/           destination search, route select, confirm
  completion/     celebration, photo upload, share card
  journey/        journey sub-screens: story card reader, stats
  explore/        explore sub-screens: monthly summary
components/       reusable UI: Button, Card, Tag, OnboardingBar, PlaceholderScreen (MapView/StoryCard later)
services/         fitbit.js, maps.js, storytelling.js
storage/          AsyncStorage helpers
constants/        colors.js, fonts.js (endpoints land later)
hooks/            useFitbit, useGoal, useStoryCards
assets/           fonts, icons, images
docs/             PRD, tech spec, wireframes, visual design
```

Empty directories carry a `.gitkeep` until their milestone fills them in.

## Navigation map (M2)

Root native-stack → initial route `Main` (bottom tabs). Secondary flows are modal stacks pushed on top of the tabs.

- **Tabs**: Today · Journey · Explore
- **Onboarding stack** (modal): Splash → FitbitConnect → StrideConfirm → OnboardHome → OnboardPlaces
- **Goal stack** (modal): DestSearch → RouteSelect → GoalConfirm
- **Completion stack** (modal): Celebration → PhotoUpload → ShareCard
- **Root-level**: StoryCard (modal), JourneyStats, MonthlySummary

Every screen is a placeholder rendered by `components/PlaceholderScreen.js` — each lists nav links to its neighbours so you can walk the whole graph on device.

## Run it on your iPhone

From M5 onward Wayfarer runs in a **custom development client built locally through Xcode**, not in Expo Go. Fitbit OAuth rejects `exp://IP:PORT/path` redirect URIs, so Expo Go is a dead end for any flow that talks to Fitbit, Google Maps, or Anthropic. The dev client is a thin native binary that owns the `wayfarer://` scheme and otherwise behaves exactly like Expo Go — same QR-scan workflow, same JS reload, just on a binary you signed yourself with a free Apple ID.

Prereqs: Xcode, CocoaPods, Node 24, iPhone + cable, free Apple ID.

### One-time: generate the native project and install to device

```bash
npm install
npm run prebuild            # expo prebuild --platform ios
#   Reads app.json (scheme: "wayfarer", bundle id com.wayfarer.app)
#   and generates an ios/ directory. Gitignored — regenerate when
#   app.json native config changes.
cd ios && pod install && cd ..
open ios/Wayfarer.xcworkspace
```

In Xcode:

1. **Enable Developer Mode on the iPhone** — Settings → Privacy & Security → Developer Mode → on → reboot.
2. **Select the `Wayfarer` target** in the project navigator, then **Signing & Capabilities**.
3. Tick **Automatically manage signing**. For **Team**, click the dropdown and **Add an Account…** — sign in with your free Apple ID. Your personal team ("Your Name (Personal Team)") appears. Select it.
4. If Xcode complains "com.wayfarer.app is already in use" (rare for that specific id, but possible), change the **Bundle Identifier** to something unique, e.g. `com.yourname.wayfarer`. The `scheme` in app.json stays `wayfarer` either way — that's what Fitbit redirects to.
5. Plug in the iPhone. Pick it in the run-target dropdown (top bar, next to the Wayfarer scheme).
6. Hit **⌘R**. First build takes a few minutes. Xcode compiles, installs, launches.
7. **Trust the developer profile** on the iPhone: Settings → General → VPN & Device Management → tap your Apple ID profile → Trust.

The dev client is now on your home screen.

### Free Apple ID limitations

- **7-day provisioning profile.** The app silently expires a week after install. Repeat step 6 (⌘R in Xcode) to re-sign and re-install — takes 30 seconds.
- **Max 10 app IDs per 7-day window.** Plenty for one project; just don't churn through bundle ids.
- **No push notifications or background sync entitlements.** Not needed for Wayfarer's current milestones — M7 (background sync) would be the first milestone that runs into this.

### Daily dev loop

```bash
npm start            # = expo start --dev-client
```

On the phone: open the Wayfarer dev client from the home screen. It prompts you to enter a URL or scan a QR — scan the one in the Metro terminal with the Camera app, or tap "Enter URL manually" and paste the Metro URL. JS reloads live from then on.

`npm run start:go` still boots a classic Expo Go session (non-Fitbit screens work there; Fitbit OAuth doesn't).

### When to rebuild via Xcode

Only when native config changes:
- adding an Expo plugin that pulls in a native module (`expo install some-native-dep`)
- changing `scheme`, `bundleIdentifier`, `ios.infoPlist`, `plugins`, or anything else in `app.json` that affects the Xcode project
- the weekly 7-day resign

All JS changes hot-reload through Metro — no rebuild.

## Tests

Jest + React Native Testing Library. `__tests__/` mirrors the source tree —
`components/Button.js` → `__tests__/components/Button.test.js`, and so on.

```bash
npm test            # one-shot
npm run test:watch  # watch mode
```

Each milestone ships with tests covering rendering, navigation intents, and
pure logic (step calculations, matchers, reducers). New components and
services don't land without a corresponding `*.test.js`.

## Environment variables

Copy `.env.example` to `.env` and fill in.

```
EXPO_PUBLIC_FITBIT_CLIENT_ID=
FITBIT_CLIENT_SECRET=
GOOGLE_MAPS_API_KEY=
ANTHROPIC_API_KEY=
```

The Fitbit client id uses the `EXPO_PUBLIC_` prefix so Expo bundles it
into the client. That's safe because Fitbit OAuth runs as a public
client with PKCE — the secret never leaves Fitbit's servers, so
`FITBIT_CLIENT_SECRET` is unused in the app (kept in `.env.example`
for completeness only).

`.env` is git-ignored.

### Fitbit dev-console redirect URIs

Register both at dev.fitbit.com → your app → Settings → Redirect URL:

- `wayfarer://fitbit-auth` — for standalone EAS builds
- `exp://<your-LAN-IP>:8081/--/fitbit-auth` — for Expo Go (LAN IP is
  printed by `npx expo start`; if it changes between sessions,
  re-register)

## Milestone progress

Build order is fixed by the tech spec (§9). Always leave the app working.

- [x] **M1 — Environment setup.** Blank Wayfarer splash on the phone via Expo Go.
- [x] **M2 — Navigation skeleton.** Three tabs switch on device; every PRD screen exists as a reachable placeholder.
- [x] **M3 — Onboarding UI.** All 5 onboarding screens rendered with the visual design, Lora + DM Sans loaded, reusable Button / Card / Tag / OnboardingBar.
- [x] **M4 — Today + Journey UI.** Dummy-data Today (active + empty), Journey map preview, StoryCard reader, JourneyStats. New reusable components: ProgressBar, MapPlaceholder, StatTile, StoryRow. All numbers route through `constants/mockData.js`, swapped for AsyncStorage in M5.
- [x] **M5 — Fitbit integration.** Real Fitbit OAuth (PKCE, public client) via `expo-auth-session`. Tokens in `expo-secure-store`, profile in `AsyncStorage`. New `services/fitbit.js`, `hooks/useFitbit.js` (60s in-memory cache), `storage/secureStore.js` + `userStore.js`, `constants/stride.js`. Today tab shows real steps + 30d-average ratio when connected; falls back to mock + "Tap to connect Fitbit →" link otherwise. StrideConfirm reads real stride from storage.
- [ ] M6 — Goal setup + maps. Destination search, Directions API, real route on a map.
- [ ] M7 — Progress tracking. Daily sync, marker moves.
- [ ] M8 — Storytelling engine. Places API + Anthropic-generated story cards.
- [ ] M9 — Completion + share. Celebration, photo, share card.
- [ ] M10 — Polish. Explore tab, monthly summary, edge cases.
