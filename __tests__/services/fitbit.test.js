import * as SecureStore from 'expo-secure-store';
import {
  exchangeCode,
  FITBIT_BASE,
  FITBIT_TOKEN_URL,
  getProfile,
  getStepHistory,
  getTodaySteps,
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
    expect(url).toBe(`${FITBIT_BASE}/1/user/-/activities/date/today.json`);
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
  it('hits the dated 30d endpoint and maps to numeric array', async () => {
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
    expect(fetch.mock.calls[0][0]).toBe(
      `${FITBIT_BASE}/1/user/-/activities/steps/date/2026-04-30/30d.json`
    );
  });
});
