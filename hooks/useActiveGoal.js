import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';

import { getStepHistory, localISODate } from '../services/fitbit';
import { getActiveGoal } from '../storage/goalStore';
import useFitbit from './useFitbit';

// Composes the active goal from storage with Fitbit's step history to
// derive cumulative progress. Refreshes the goal-from-storage read on
// focus (cheap) and the step-history fetch via a 60s module-level cache
// (network).
//
// Cumulative steps are computed on the fly from Fitbit's history endpoint
// (Phase 3 design call) — M7 will replace this with a persisted +
// incremented daily counter once background sync lands.
//
// Output shape:
//   { goal, isActive, loading, error,
//     daysActive, cumulativeSteps, totalSteps, remainingSteps,
//     pctComplete, daysRemaining,
//     refresh }
//
// Render-time guard: when `isActive` is false (no goal, or status is
// draft/completed), the derived numbers are all null and the screen
// should fall back to its empty state.

const TTL_MS = 60_000;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const METERS_PER_MILE = 1609.34;

let historyCache = null;
let historyInflight = null;

export function _resetCacheForTests() {
  historyCache = null;
  historyInflight = null;
}

async function fetchCumulativeSteps(daysActive, cacheKey) {
  if (
    historyCache &&
    historyCache.cacheKey === cacheKey &&
    Date.now() - historyCache.fetchedAt < TTL_MS
  ) {
    return historyCache.sum;
  }
  if (historyInflight && historyInflight.cacheKey === cacheKey) {
    return historyInflight.promise;
  }
  const promise = (async () => {
    const history = await getStepHistory(localISODate(), daysActive);
    const sum = history.reduce((a, b) => a + b, 0);
    historyCache = { sum, cacheKey, fetchedAt: Date.now() };
    return sum;
  })();
  historyInflight = { cacheKey, promise };
  try {
    return await promise;
  } finally {
    if (historyInflight && historyInflight.cacheKey === cacheKey) historyInflight = null;
  }
}

function daysSince(createdAt) {
  if (!createdAt) return 0;
  const then = new Date(createdAt).getTime();
  if (Number.isNaN(then)) return 0;
  const diff = Date.now() - then;
  return Math.max(1, Math.ceil(diff / MS_PER_DAY));
}

function clampPct(n) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

export default function useActiveGoal() {
  const fb = useFitbit();
  const [goal, setGoal] = useState(null);
  const [cumulativeSteps, setCumulativeSteps] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const g = await getActiveGoal();
      setGoal(g);
      if (!g || g.status !== 'active') {
        setCumulativeSteps(null);
        setLoading(false);
        return;
      }
      const daysActive = daysSince(g.createdAt);
      const cacheKey = `${g.createdAt}-${daysActive}`;
      const sum = await fetchCumulativeSteps(daysActive, cacheKey);
      setCumulativeSteps(sum);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  // useFocusEffect runs on first focus (mount under a navigator) and on
  // every subsequent focus, so a separate mount-time useEffect would
  // double-load.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    historyCache = null;
    await load();
  }, [load]);

  const isActive = !!goal && goal.status === 'active';
  const daysActive = isActive ? daysSince(goal.createdAt) : null;
  const totalMiles = isActive && goal.route?.distanceMeters
    ? goal.route.distanceMeters / METERS_PER_MILE
    : null;
  const totalSteps = isActive && totalMiles != null && fb.strideStepsPerMile
    ? Math.round(totalMiles * fb.strideStepsPerMile)
    : null;
  const remainingSteps = isActive && totalSteps != null && cumulativeSteps != null
    ? Math.max(0, totalSteps - cumulativeSteps)
    : null;
  const pctComplete = isActive && totalSteps != null && cumulativeSteps != null
    ? clampPct((cumulativeSteps / totalSteps) * 100)
    : null;
  const daysRemaining = isActive && remainingSteps != null && fb.dailyAverage > 0
    ? Math.ceil(remainingSteps / fb.dailyAverage)
    : null;

  return {
    goal,
    isActive,
    loading: loading || (isActive && fb.loading),
    error: error ?? fb.error,
    daysActive,
    cumulativeSteps,
    totalSteps,
    remainingSteps,
    pctComplete,
    daysRemaining,
    refresh,
  };
}
