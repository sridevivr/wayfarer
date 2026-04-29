# Wayfarer Backlog

Deferred work that's been decided on but not yet implemented. Pull items into a milestone when ready to build.

## Onboarding intake (deferred from M6)

The M3 onboarding screens are visual only — they don't actually collect or persist user data. The following needs to happen before onboarding is functionally complete:

- Replace the hometown free-text field with a Google Places autocomplete picker. Save the selected place (name, formatted address, lat/lng, place_id) to AsyncStorage.
- Add an "aspirational destinations" intake step (or repurpose the existing screen). Same Google Places picker pattern. User can add multiple destinations. Save as an array to AsyncStorage.
- Storage shape (proposed): `@user.hometown = { name, address, lat, lng, placeId }` and `@user.aspirationalDestinations = [{ name, address, lat, lng, placeId }, ...]`.
- Once persisted, M6's destination picker should surface these as the primary quick-picks above region-based suggestions.

## Empty state cleanup (deferred from M6 Phase 1)

The Today tab has an alternative empty state (triggered by a "Show Empty State →" debug toggle) with design baggage from M3/M4 we've since rejected:

- "Curated routes" section with Pacific Coast Highway and Blue Ridge Parkway — explicitly dropped during M6 design discussions in favor of region-based suggestions.
- "Walk home to Hanover" hardcoded suggestion that assumes hometown was set during onboarding (which it wasn't — see "Onboarding intake" entry above).
- "Suggested for you" list overlaps with the suggestions logic now in M6 Phase 1's Destination screen.

Decisions to make when revisiting:
- Delete the empty state entirely (M6's "Set a destination →" CTA on the standard Today tab covers this purpose).
- Or strip it back to a minimal "no active goal" state.
