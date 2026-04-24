import { useCallback, useEffect, useState } from 'react';

import { cmToStepsPerMile, STRIDE_FALLBACK } from '../constants/stride';
import { getProfile, getStepHistory, getTodaySteps } from '../services/fitbit';
import { clearTokens, getTokens } from '../storage/secureStore';
import { clearUser, setUser } from '../storage/userStore';

// Read-only Fitbit hook for the Today tab. The OAuth flow itself lives
// in the FitbitConnect screen (useAuthRequest needs a user-gesture
// promptAsync, and we don't want every consumer of this hook to take
// the auth-session dependency).
//
// Module-level cache: tab switches re-mount this hook, but we don't
// want to hammer the API on every mount. 60s TTL is long enough to
// elide round-trips during normal navigation, short enough that a
// real-step update lands quickly when the user pulls forward.

const TTL_MS = 60_000;

let cache = null;
let inflight = null;
const subscribers = new Set();

function snapshot() {
  if (!cache) return null;
  return { ...cache.data, fetchedAt: cache.fetchedAt };
}

function publish() {
  const s = snapshot();
  subscribers.forEach((cb) => cb(s));
}

function todayISO(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

function average(arr) {
  if (!arr.length) return 0;
  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
}

async function fetchAll() {
  if (inflight) return inflight;
  inflight = (async () => {
    const [profile, today, history] = await Promise.all([
      getProfile(),
      getTodaySteps(),
      getStepHistory(todayISO(), 30),
    ]);
    const stride = cmToStepsPerMile(profile.strideLengthCm);
    const dailyAverage = average(history);
    const dailyAveragePct = dailyAverage > 0
      ? Math.min(100, Math.round((today.steps / dailyAverage) * 100))
      : 0;
    const data = {
      strideStepsPerMile: stride,
      todaySteps: today.steps,
      dailyAverage,
      dailyAveragePct,
    };
    cache = { data, fetchedAt: Date.now() };
    // Persist stride so StrideConfirm can read it without going through
    // a network round-trip.
    await setUser({ strideStepsPerMile: stride });
    publish();
    return data;
  })();
  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}

export function _resetCacheForTests() {
  cache = null;
  inflight = null;
}

export default function useFitbit() {
  const [, setTick] = useState(0);
  const [connected, setConnected] = useState(null); // null = unknown, then bool
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cb = () => setTick((n) => n + 1);
    subscribers.add(cb);
    return () => {
      subscribers.delete(cb);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const tokens = await getTokens();
      if (cancelled) return;
      if (!tokens) {
        setConnected(false);
        setLoading(false);
        return;
      }
      setConnected(true);
      if (cache && Date.now() - cache.fetchedAt < TTL_MS) {
        setLoading(false);
        return;
      }
      try {
        await fetchAll();
        if (!cancelled) setLoading(false);
      } catch (e) {
        if (!cancelled) {
          setError(e);
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      cache = null;
      await fetchAll();
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    cache = null;
    await Promise.all([clearTokens(), clearUser()]);
    setConnected(false);
    publish();
  }, []);

  const data = snapshot();
  return {
    connected: connected === true,
    loading,
    error,
    todaySteps: data?.todaySteps ?? null,
    dailyAverage: data?.dailyAverage ?? null,
    dailyAveragePct: data?.dailyAveragePct ?? null,
    strideStepsPerMile: data?.strideStepsPerMile ?? STRIDE_FALLBACK,
    refresh,
    disconnect,
  };
}
