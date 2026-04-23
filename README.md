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
components/       reusable UI (PlaceholderScreen today; Card/Button/MapView/... later)
services/         fitbit.js, maps.js, storytelling.js
storage/          AsyncStorage helpers
constants/        colors.js (fonts, endpoints land later)
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

## Run it on your iPhone (Expo Go)

Prereqs on the Mac: Node 24, Expo CLI, EAS CLI, iPhone on the same Wi-Fi. Install Expo Go from the App Store.

```bash
npm install
npx expo start
```

Scan the QR in the terminal with the iPhone Camera app and tap the Expo Go prompt. If the phone and Mac can't see each other, use `npx expo start --tunnel`.

## Environment variables

Copy `.env.example` to `.env` and fill in. Not needed until Milestone 5+.

```
FITBIT_CLIENT_ID=
FITBIT_CLIENT_SECRET=
GOOGLE_MAPS_API_KEY=
ANTHROPIC_API_KEY=
```

`.env` is git-ignored.

## Milestone progress

Build order is fixed by the tech spec (§9). Always leave the app working.

- [x] **M1 — Environment setup.** Blank Wayfarer splash on the phone via Expo Go.
- [x] **M2 — Navigation skeleton.** Three tabs switch on device; every PRD screen exists as a reachable placeholder.
- [ ] M3 — Onboarding UI. 5 onboarding screens with the visual design applied.
- [ ] M4 — Today + Journey UI. Dummy-data version of the core loop.
- [ ] M5 — Fitbit integration. Real OAuth + step count.
- [ ] M6 — Goal setup + maps. Destination search, Directions API, real route on a map.
- [ ] M7 — Progress tracking. Daily sync, marker moves.
- [ ] M8 — Storytelling engine. Places API + Anthropic-generated story cards.
- [ ] M9 — Completion + share. Celebration, photo, share card.
- [ ] M10 — Polish. Explore tab, monthly summary, edge cases.
