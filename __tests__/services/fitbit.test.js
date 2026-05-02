import * as SecureStore from 'expo-secure-store';
import {
  _resetRefreshPromiseForTests,
  exchangeCode,
  FITBIT_BASE,
  FITBIT_TOKEN_URL,
  getProfile,
  getStepHistory,
  getTodaySteps,
  localISODate,
  refreshAccessToken,
} from '../../services/fitbit';
import { clearTokens, getTokens, saveTokens } from '../../storage/secureStore';

function jsonResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(typeof body === 'string' ? body : JSON.stringify(body)),
  };
}

beforeEach(() => {
  SecureStore.__reset();
  _resetRefreshPromiseForTests();
  global.fetch = jest.fn();
});

afterEach(() => {
  delete global.fetch;
});

describe('exchangeCode', () => {
  it('POSTs to the token endpoint with PKCE params and returns tokens', async () => {
    fetch.mockResolvedValueOnce(
      jsonResponse({ access_token: 'A', refresh_token: 'R', expires_in: 28800 })
    );
    const tokens = await exchangeCode({
      code: 'CODE',
      codeVerifier: 'V',
      redirectUri: 'wayfarer://fitbit-auth',
    });
    expect(tokens).toEqual({ access: 'A', refresh: 'R', expiresIn: 28800 });

    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe(FITBIT_TOKEN_URL);
    expect(init.method).toBe('POST');
    expect(init.headers['Content-Type']).toBe('application/x-www-form-urlencoded');
    expect(init.body).toContain('grant_type=authorization_code');
    expect(init.body).toContain('code=CODE');
    expect(init.body).toContain('code_verifier=V');
    expect(init.body).not.toContain('client_secret');
  });

  it('throws a FitbitError on non-2xx', async () => {
    fetch.mockResolvedValueOnce(jsonResponse({ errors: [{ message: 'invalid' }] }, 400));
    await expect(
      exchangeCode({ code: 'X', codeVerifier: 'V', redirectUri: 'r' })
    ).rejects.toMatchObject({ status: 400 });
  });
});

describe('refreshAccessToken', () => {
  it('returns new access + refresh tokens', async () => {
    fetch.mockResolvedValueOnce(
      jsonResponse({ access_token: 'A2', refresh_token: 'R2', expires_in: 28800 })
    );
    const out = await refreshAccessToken('R1');
    expect(out).toEqual({ access: 'A2', refresh: 'R2', expiresIn: 28800 });
    expect(fetch.mock.calls[0][1].body).toContain('grant_type=refresh_token');
    expect(fetch.mock.calls[0][1].body).toContain('refresh_token=R1');
  });
});

describe('getTodaySteps + auth wrapper', () => {
  it('throws when not connected', async () => {
    await expect(getTodaySteps()).rejects.toThrow(/Not connected/);
  });

  it('returns steps from summary.steps on a happy GET', async () => {
    await saveTokens({ access: 'A', refresh: 'R' });
    fetch.mockResolvedValueOnce(jsonResponse({ summary: { steps: 7421 } }));
    const out = await getTodaySteps();
    expect(out).toEqual({ steps: 7421 });

    const [url, init] = fetch.mock.calls[0];
    // Uses the real local date (YYYY-MM-DD) rather than the literal
    // "today" string Fitbit no longer accepts.
    expect(url).toBe(`${FITBIT_BASE}/1/user/-/activities/date/${localISODate()}.json`);
    expect(url).not.toMatch(/\/today\.json$/);
    expect(init.headers.Authorization).toBe('Bearer A');
  });

  it('on 401 refreshes the token and retries once', async () => {
    await saveTokens({ access: 'OLD', refresh: 'R' });
    fetch
      .mockResolvedValueOnce(jsonResponse({ errors: [] }, 401))
      .mockResolvedValueOnce(jsonResponse({ access_token: 'NEW', refresh_token: 'R2', expires_in: 28800 }))
      .mockResolvedValueOnce(jsonResponse({ summary: { steps: 8000 } }));

    const out = await getTodaySteps();
    expect(out).toEqual({ steps: 8000 });
    expect(fetch.mock.calls[2][1].headers.Authorization).toBe('Bearer NEW');
    expect((await getTokens()).access).toBe('NEW');
  });

  it('clears tokens and rethrows when refresh itself fails', async () => {
    await saveTokens({ access: 'OLD', refresh: 'BAD' });
    fetch
      .mockResolvedValueOnce(jsonResponse({}, 401))
      .mockResolvedValueOnce(jsonResponse({ errors: ['invalid_grant'] }, 400));

    await expect(getTodaySteps()).rejects.toBeDefined();
    expect(await getTokens()).toBeNull();
  });

  it('serializes parallel 401s through a single refresh request', async () => {
    // Reproduces the M5 fetchAll bug: useFitbit fires three calls in
    // Promise.all. When the access token has expired, all three see
    // 401 and each used to fire its own refresh — Fitbit returns 409
    // Concurrent refresh token requests on the losers. After the fix,
    // exactly one refresh goes out and every retry uses the same new
    // access token.
    await saveTokens({ access: 'OLD', refresh: 'R1' });
    fetch
      // Two parallel first attempts both 401.
      .mockResolvedValueOnce(jsonResponse({}, 401))
      .mockResolvedValueOnce(jsonResponse({}, 401))
      // Single refresh response shared by both.
      .mockResolvedValueOnce(
        jsonResponse({ access_token: 'NEW', refresh_token: 'R2', expires_in: 28800 })
      )
      // Both retries succeed.
      .mockResolvedValueOnce(jsonResponse({ summary: { steps: 100 } }))
      .mockResolvedValueOnce(jsonResponse({ summary: { steps: 200 } }));

    const [a, b] = await Promise.all([getTodaySteps(), getTodaySteps()]);

    expect(a).toEqual({ steps: 100 });
    expect(b).toEqual({ steps: 200 });

    const tokenCalls = fetch.mock.calls.filter(([url]) => url === FITBIT_TOKEN_URL);
    expect(tokenCalls).toHaveLength(1);

    // Both retries used the new access token.
    const retryAuthHeaders = fetch.mock.calls
      .filter(([url]) => url !== FITBIT_TOKEN_URL)
      .slice(2) // skip the two original 401s
      .map(([, init]) => init.headers.Authorization);
    expect(retryAuthHeaders).toEqual(['Bearer NEW', 'Bearer NEW']);
    expect((await getTokens()).access).toBe('NEW');
  });

  it('clears the refresh slot after failure so the next attempt can refresh again', async () => {
    // First attempt: refresh fails, tokens cleared, error surfaced.
    await saveTokens({ access: 'OLD', refresh: 'BAD' });
    fetch
      .mockResolvedValueOnce(jsonResponse({}, 401))
      .mockResolvedValueOnce(jsonResponse({ errors: ['invalid_grant'] }, 400));
    await expect(getTodaySteps()).rejects.toBeDefined();
    expect(await getTokens()).toBeNull();

    // User reconnects. The next 401 must initiate a brand new refresh —
    // if the failed promise lingered, the call would hang or rethrow
    // the previous error instead of trying again.
    await saveTokens({ access: 'OLD2', refresh: 'R3' });
    fetch
      .mockResolvedValueOnce(jsonResponse({}, 401))
      .mockResolvedValueOnce(
        jsonResponse({ access_token: 'NEW2', refresh_token: 'R4', expires_in: 28800 })
      )
      .mockResolvedValueOnce(jsonResponse({ summary: { steps: 5000 } }));

    const out = await getTodaySteps();
    expect(out).toEqual({ steps: 5000 });
    expect((await getTokens()).access).toBe('NEW2');
  });
});

describe('getProfile', () => {
  it('extracts strideLengthWalking and displayName', async () => {
    await saveTokens({ access: 'A', refresh: 'R' });
    fetch.mockResolvedValueOnce(
      jsonResponse({ user: { strideLengthWalking: 71.6, displayName: 'Test' } })
    );
    const out = await getProfile();
    expect(out).toEqual({ strideLengthCm: 71.6, displayName: 'Test' });
  });

  it('returns null stride when missing', async () => {
    await saveTokens({ access: 'A', refresh: 'R' });
    fetch.mockResolvedValueOnce(jsonResponse({ user: { displayName: 'Anon' } }));
    const out = await getProfile();
    expect(out).toEqual({ strideLengthCm: null, displayName: 'Anon' });
  });
});

describe('getStepHistory', () => {
  it('hits the explicit {start}/{end} endpoint (not /30d.json)', async () => {
    await saveTokens({ access: 'A', refresh: 'R' });
    fetch.mockResolvedValueOnce(
      jsonResponse({
        'activities-steps': [
          { dateTime: '2026-04-01', value: '5400' },
          { dateTime: '2026-04-02', value: '6800' },
        ],
      })
    );
    const out = await getStepHistory('2026-04-30', 30);
    expect(out).toEqual([5400, 6800]);
    // 30 days ending 2026-04-30 → starts on 2026-04-01 (inclusive).
    expect(fetch.mock.calls[0][0]).toBe(
      `${FITBIT_BASE}/1/user/-/activities/steps/date/2026-04-01/2026-04-30.json`
    );
    expect(fetch.mock.calls[0][0]).not.toMatch(/30d\.json$/);
  });

  it('handles a 7-day window correctly', async () => {
    await saveTokens({ access: 'A', refresh: 'R' });
    fetch.mockResolvedValueOnce(jsonResponse({ 'activities-steps': [] }));
    await getStepHistory('2026-04-30', 7);
    expect(fetch.mock.calls[0][0]).toBe(
      `${FITBIT_BASE}/1/user/-/activities/steps/date/2026-04-24/2026-04-30.json`
    );
  });
});

describe('localISODate', () => {
  it('returns YYYY-MM-DD in the local timezone, not UTC', () => {
    expect(localISODate(new Date(2026, 3, 24, 23, 30))).toBe('2026-04-24');
    expect(localISODate(new Date(2026, 0, 1, 0, 0))).toBe('2026-01-01');
    expect(localISODate(new Date(2026, 11, 31, 12, 0))).toBe('2026-12-31');
  });

  it('zero-pads single-digit months and days', () => {
    expect(localISODate(new Date(2026, 4, 5))).toBe('2026-05-05');
  });
});
