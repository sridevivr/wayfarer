import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import FitbitConnectScreen from '../../../app/onboarding/fitbit-connect';
import * as fitbit from '../../../services/fitbit';
import { getTokens } from '../../../storage/secureStore';
import { getUser } from '../../../storage/userStore';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock('../../../services/fitbit', () => ({
  __esModule: true,
  exchangeCode: jest.fn(),
  getProfile: jest.fn(),
  FITBIT_AUTH_URL: 'https://www.fitbit.com/oauth2/authorize',
  FITBIT_TOKEN_URL: 'https://api.fitbit.com/oauth2/token',
  FITBIT_SCOPES: ['activity', 'profile'],
}));

const expoAuth = require('expo-auth-session');

beforeEach(() => {
  mockNavigate.mockClear();
  fitbit.exchangeCode.mockReset();
  fitbit.getProfile.mockReset();
  expoAuth.useAuthRequest.mockReset();
  process.env.EXPO_PUBLIC_FITBIT_CLIENT_ID = 'test-client-id';
});

describe('FitbitConnectScreen', () => {
  it('renders step label and the three access items', () => {
    expoAuth.useAuthRequest.mockReturnValue([
      { codeVerifier: 'V' },
      null,
      jest.fn(),
    ]);
    const { getByText } = render(<FitbitConnectScreen />);
    expect(getByText('Step 1 of 5')).toBeTruthy();
    expect(getByText('Connect your Fitbit')).toBeTruthy();
    expect(getByText('Daily step count')).toBeTruthy();
    expect(getByText('Stride length')).toBeTruthy();
    expect(getByText('30-day step history')).toBeTruthy();
  });

  it('Connect CTA fires promptAsync', async () => {
    const promptAsync = jest.fn(() => Promise.resolve({ type: 'cancel' }));
    expoAuth.useAuthRequest.mockReturnValue([{ codeVerifier: 'V' }, null, promptAsync]);
    const { getByText } = render(<FitbitConnectScreen />);
    await act(async () => {
      fireEvent.press(getByText('Connect Fitbit'));
    });
    expect(promptAsync).toHaveBeenCalled();
  });

  it('on successful auth: exchanges, saves tokens + stride, navigates to StrideConfirm', async () => {
    fitbit.exchangeCode.mockResolvedValue({ access: 'A', refresh: 'R', expiresIn: 28800 });
    fitbit.getProfile.mockResolvedValue({ strideLengthCm: 71.6, displayName: 'Test User' });

    // First render: response is null. Second render after promptAsync:
    // response.type === 'success'. We control by re-mocking + re-rendering.
    expoAuth.useAuthRequest.mockReturnValueOnce([{ codeVerifier: 'V' }, null, jest.fn()]);
    const { rerender } = render(<FitbitConnectScreen />);

    expoAuth.useAuthRequest.mockReturnValue([
      { codeVerifier: 'V' },
      { type: 'success', params: { code: 'CODE' } },
      jest.fn(),
    ]);
    await act(async () => {
      rerender(<FitbitConnectScreen />);
    });

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('StrideConfirm'));
    expect(fitbit.exchangeCode).toHaveBeenCalledWith({
      code: 'CODE',
      codeVerifier: 'V',
      redirectUri: 'wayfarer://fitbit-auth',
    });
    expect(await getTokens()).toEqual({ access: 'A', refresh: 'R' });
    const u = await getUser();
    expect(u.strideStepsPerMile).toBe(Math.round(160934 / 71.6));
    expect(u.fitbitDisplayName).toBe('Test User');
  });

  it('shows an inline error if exchange fails', async () => {
    fitbit.exchangeCode.mockRejectedValue(new Error('boom'));
    expoAuth.useAuthRequest.mockReturnValueOnce([{ codeVerifier: 'V' }, null, jest.fn()]);
    const { rerender, findByText } = render(<FitbitConnectScreen />);

    expoAuth.useAuthRequest.mockReturnValue([
      { codeVerifier: 'V' },
      { type: 'success', params: { code: 'C' } },
      jest.fn(),
    ]);
    await act(async () => {
      rerender(<FitbitConnectScreen />);
    });

    expect(await findByText(/Could not connect to Fitbit/i)).toBeTruthy();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows an env-var error when EXPO_PUBLIC_FITBIT_CLIENT_ID is missing', async () => {
    delete process.env.EXPO_PUBLIC_FITBIT_CLIENT_ID;
    const promptAsync = jest.fn();
    expoAuth.useAuthRequest.mockReturnValue([{ codeVerifier: 'V' }, null, promptAsync]);
    const { getByText, findByText } = render(<FitbitConnectScreen />);
    await act(async () => {
      fireEvent.press(getByText('Connect Fitbit'));
    });
    expect(await findByText(/Missing EXPO_PUBLIC_FITBIT_CLIENT_ID/i)).toBeTruthy();
    expect(promptAsync).not.toHaveBeenCalled();
  });
});
