import { getTokens, saveTokens, clearTokens } from '../storage/secureStore';

// Pure network layer for the Fitbit Web API. No React, no hooks. The
// `withAuth` wrapper reads tokens from SecureStore, calls the function
// with the access token, and on a 401 it once attempts a refresh +
// retry. If refresh fails we clear tokens and rethrow — `useFitbit`
// observes the empty store and surfaces a "not connected" state.
//
// Endpoints (tech spec §5):
//   POST   https://api.fitbit.com/oauth2/token
//   GET    /1/user/-/profile.json
//   GET    /1/user/-/activities/date/{YYYY-MM-DD}.json
//   GET    /1/user/-/activities/steps/date/{start}/{end}.json
//
// Fitbit used to accept the literal string "today" as a date token, but
// now rejects with 400 "invalid date: today" on both endpoints. Every
// date we send is an explicit YYYY-MM-DD formatted in the user's local
// timezone (so the "today" the server sees matches the day on the
// user's wrist, not UTC).

export const FITBIT_BASE = 'https://api.fitbit.com';
export const FITBIT_TOKEN_URL = `${FITBIT_BASE}/oauth2/token`;
export const FITBIT_AUTH_URL = 'https://www.fitbit.com/oauth2/authorize';
export const FITBIT_SCOPES = ['activity', 'profile'];

const CLIENT_ID = process.env.EXPO_PUBLIC_FITBIT_CLIENT_ID ?? '';

// Local-calendar YYYY-MM-DD. Not toISOString().slice(0,10) — that's UTC
// and would report tomorrow's date for users behind UTC late at night.
export function localISODate(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(d, delta) {
  const next = new Date(d);
  next.setDate(d.getDate() + delta);
  return next;
}

class FitbitError extends Error {
  constructor(status, body) {
    super(`Fitbit ${status}: ${typeof body === 'string' ? body : JSON.stringify(body)}`);
    this.status = status;
    this.body = body;
  }
}

async function postForm(url, params) {
  const body = new URLSearchParams(params).toString();
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new FitbitError(res.status, json);
  return json;
}

// PKCE-only token exchange. No client_secret on the wire.
export async function exchangeCode({ code, codeVerifier, redirectUri }) {
  const json = await postForm(FITBIT_TOKEN_URL, {
    client_id: CLIENT_ID,
    grant_type: 'authorization_code',
    code,
    code_verifier: codeVerifier,
    redirect_uri: redirectUri,
  });
  return { access: json.access_token, refresh: json.refresh_token, expiresIn: json.expires_in };
}

export async function refreshAccessToken(refreshToken) {
  const json = await postForm(FITBIT_TOKEN_URL, {
    client_id: CLIENT_ID,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });
  return { access: json.access_token, refresh: json.refresh_token, expiresIn: json.expires_in };
}

async function authedGet(path, accessToken) {
  const url = `${FITBIT_BASE}${path}`;
  if (__DEV__) console.log('[fitbit] GET', url);
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (__DEV__) console.log('[fitbit] GET', url, '→', res.status);
  if (res.status === 401) {
    const err = new FitbitError(401, await res.text().catch(() => ''));
    throw err;
  }
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    if (__DEV__) console.log('[fitbit] error body:', JSON.stringify(json));
    throw new FitbitError(res.status, json);
  }
  return json;
}

// Wraps a function-of-access-token. On 401, refresh + retry once.
export async function withAuth(fn) {
  const tokens = await getTokens();
  if (!tokens) throw new Error('Not connected to Fitbit');
  try {
    return await fn(tokens.access);
  } catch (err) {
    if (err?.status !== 401 || !tokens.refresh) throw err;
    let next;
    try {
      next = await refreshAccessToken(tokens.refresh);
    } catch (refreshErr) {
      await clearTokens();
      throw refreshErr;
    }
    await saveTokens({ access: next.access, refresh: next.refresh ?? tokens.refresh });
    return fn(next.access);
  }
}

// Returns { strideLengthCm, displayName }. strideLengthWalking comes
// in cm (Fitbit docs); we keep it raw and convert in useFitbit so
// formula changes only happen in one place.
export async function getProfile() {
  const json = await withAuth((t) => authedGet('/1/user/-/profile.json', t));
  const u = json?.user ?? {};
  return {
    strideLengthCm: typeof u.strideLengthWalking === 'number' ? u.strideLengthWalking : null,
    displayName: u.displayName ?? null,
  };
}

export async function getTodaySteps() {
  const date = localISODate();
  const json = await withAuth((t) => authedGet(`/1/user/-/activities/date/${date}.json`, t));
  const steps = json?.summary?.steps ?? 0;
  if (__DEV__) console.log('[fitbit] daily summary', date, '→ summary.steps =', steps);
  return { steps };
}

// Returns an array of step counts in chronological order, `days` entries
// ending on `endDate` (YYYY-MM-DD local). Used by useFitbit to compute
// the 30-day daily average.
//
// Uses the explicit `{start}/{end}.json` form rather than the legacy
// `{date}/{period}.json` form — same data, but Fitbit's validator is
// stricter about the period variant.
export async function getStepHistory(endDate, days = 30) {
  const end = new Date(`${endDate}T00:00:00`);
  const startDate = localISODate(addDays(end, -(days - 1)));
  const json = await withAuth((t) =>
    authedGet(`/1/user/-/activities/steps/date/${startDate}/${endDate}.json`, t)
  );
  const series = json?.['activities-steps'] ?? [];
  const parsed = series.map((d) => Number(d.value) || 0);
  if (__DEV__) console.log('[fitbit] history', startDate, '→', endDate, 'length =', parsed.length, 'last 3 =', parsed.slice(-3));
  return parsed;
}

export { FitbitError };
