import AsyncStorage from '@react-native-async-storage/async-storage';

// Single active goal at a time. Phase 1 (M6) only writes drafts; status
// flips to 'active' in Phase 3 once a route is chosen and confirmed.
// Phase 2 will populate `route`.
//
// Goal shape:
//   { origin: PlaceObject, destination: PlaceObject | null,
//     route: RouteObject | null, status: 'draft' | 'active' | 'completed',
//     createdAt: ISOString }
//
// PlaceObject shape (shared with onboarding intake — see BACKLOG.md):
//   { name, address, lat, lng, placeId }
//
// `@goal_lastOrigin` separately stores just the last origin the user
// picked, used to pre-fill the Origin screen on next goal creation.
// It outlives the goal lifecycle — clearing the active goal does not
// clear lastOrigin.

const ACTIVE_KEY = '@goal_active';
const LAST_ORIGIN_KEY = '@goal_lastOrigin';

export async function getActiveGoal() {
  const raw = await AsyncStorage.getItem(ACTIVE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function setActiveGoal(goal) {
  await AsyncStorage.setItem(ACTIVE_KEY, JSON.stringify(goal));
  return goal;
}

// Read → shallow-merge `route` → write. Used by Phase 2's RouteSelect
// screen so picking a route doesn't reset the rest of the draft.
export async function setActiveGoalRoute(route) {
  const current = (await getActiveGoal()) ?? {};
  const next = { ...current, route };
  await AsyncStorage.setItem(ACTIVE_KEY, JSON.stringify(next));
  return next;
}

// Flip status from 'draft' → 'active'. Phase 3's GoalConfirm calls this
// once the user has approved the summary. Throws if there's no goal in
// storage — callers shouldn't reach this state in practice.
export async function activateGoal() {
  const current = await getActiveGoal();
  if (!current) throw new Error('No active goal to activate');
  const next = { ...current, status: 'active' };
  await AsyncStorage.setItem(ACTIVE_KEY, JSON.stringify(next));
  return next;
}

export async function clearActiveGoal() {
  await AsyncStorage.removeItem(ACTIVE_KEY);
}

export async function getLastOrigin() {
  const raw = await AsyncStorage.getItem(LAST_ORIGIN_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function setLastOrigin(place) {
  await AsyncStorage.setItem(LAST_ORIGIN_KEY, JSON.stringify(place));
  return place;
}
