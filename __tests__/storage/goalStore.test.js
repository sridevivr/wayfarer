import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  activateGoal,
  clearActiveGoal,
  getActiveGoal,
  getLastOrigin,
  setActiveGoal,
  setActiveGoalRoute,
  setLastOrigin,
} from '../../storage/goalStore';

beforeEach(() => AsyncStorage.clear());

const place = (overrides = {}) => ({
  name: 'Boston',
  address: 'Boston, MA, USA',
  lat: 42.3601,
  lng: -71.0589,
  placeId: 'boston-id',
  ...overrides,
});

describe('goalStore — active goal', () => {
  it('returns null when no goal is set', async () => {
    expect(await getActiveGoal()).toBeNull();
  });

  it('round-trips a draft goal', async () => {
    const goal = {
      origin: place(),
      destination: null,
      route: null,
      status: 'draft',
      createdAt: '2026-04-29T12:00:00.000Z',
    };
    await setActiveGoal(goal);
    expect(await getActiveGoal()).toEqual(goal);
  });

  it('setActiveGoal replaces (not merges) — single active goal at a time', async () => {
    const first = { origin: place({ name: 'A' }), destination: null, status: 'draft' };
    const second = { origin: place({ name: 'B' }), destination: null, status: 'draft' };
    await setActiveGoal(first);
    await setActiveGoal(second);
    const out = await getActiveGoal();
    expect(out.origin.name).toBe('B');
  });

  it('clearActiveGoal removes the entry', async () => {
    await setActiveGoal({ origin: place(), status: 'draft' });
    await clearActiveGoal();
    expect(await getActiveGoal()).toBeNull();
  });
});

describe('goalStore — setActiveGoalRoute', () => {
  it('merges route onto an existing draft without resetting other fields', async () => {
    await setActiveGoal({
      origin: place({ name: 'O' }),
      destination: place({ name: 'D' }),
      route: null,
      status: 'draft',
      createdAt: '2026-04-29T00:00:00.000Z',
    });
    const route = { label: 'Fastest', distanceMeters: 100, durationSeconds: 60, polyline: [] };
    await setActiveGoalRoute(route);
    const goal = await getActiveGoal();
    expect(goal.route).toEqual(route);
    expect(goal.origin.name).toBe('O');
    expect(goal.destination.name).toBe('D');
    expect(goal.status).toBe('draft');
    expect(goal.createdAt).toBe('2026-04-29T00:00:00.000Z');
  });

  it('creates a goal with only the route field when none exists yet', async () => {
    const route = { label: 'Fastest', distanceMeters: 100 };
    await setActiveGoalRoute(route);
    expect(await getActiveGoal()).toEqual({ route });
  });
});

describe('goalStore — activateGoal', () => {
  it('flips status from draft to active without touching other fields', async () => {
    await setActiveGoal({
      origin: place({ name: 'O' }),
      destination: place({ name: 'D' }),
      route: { label: 'Fastest', distanceMeters: 100 },
      status: 'draft',
      createdAt: '2026-04-29T00:00:00.000Z',
    });
    const out = await activateGoal();
    expect(out.status).toBe('active');
    const goal = await getActiveGoal();
    expect(goal.status).toBe('active');
    expect(goal.origin.name).toBe('O');
    expect(goal.destination.name).toBe('D');
    expect(goal.route.label).toBe('Fastest');
    expect(goal.createdAt).toBe('2026-04-29T00:00:00.000Z');
  });

  it('throws when no goal exists', async () => {
    await expect(activateGoal()).rejects.toThrow(/No active goal/);
  });
});

describe('goalStore — lastOrigin', () => {
  it('returns null on first run', async () => {
    expect(await getLastOrigin()).toBeNull();
  });

  it('round-trips the last origin', async () => {
    await setLastOrigin(place());
    expect(await getLastOrigin()).toEqual(place());
  });

  it('survives clearActiveGoal — lastOrigin outlives the goal lifecycle', async () => {
    await setLastOrigin(place());
    await setActiveGoal({ origin: place(), status: 'draft' });
    await clearActiveGoal();
    expect(await getLastOrigin()).toEqual(place());
  });
});
