# Wayfarer Backlog

Deferred work that's been decided on but not yet implemented. Pull items into a milestone when ready to build.

## Onboarding intake (deferred from M6)

The M3 onboarding screens are visual only — they don't actually collect or persist user data. The following needs to happen before onboarding is functionally complete:

- Replace the hometown free-text field with a Google Places autocomplete picker. Save the selected place (name, formatted address, lat/lng, place_id) to AsyncStorage.
- Add an "aspirational destinations" intake step (or repurpose the existing screen). Same Google Places picker pattern. User can add multiple destinations. Save as an array to AsyncStorage.
- Storage shape (proposed): `@user.hometown = { name, address, lat, lng, placeId }` and `@user.aspirationalDestinations = [{ name, address, lat, lng, placeId }, ...]`.
- Once persisted, M6's destination picker should surface these as the primary quick-picks above region-based suggestions.
