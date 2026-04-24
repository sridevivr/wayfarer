import Constants from 'expo-constants';
import { buildRedirectUri } from '../../../app/onboarding/fitbit-connect';

describe('buildRedirectUri', () => {
  it('returns the custom-scheme URI in standalone builds (no hostUri)', () => {
    Constants.expoGoConfig = null;
    Constants.expoConfig = null;
    Constants.manifest = null;
    Constants.manifest2 = null;
    expect(buildRedirectUri('fitbit-auth')).toBe('wayfarer://fitbit-auth');
  });

  it('returns the exp://LAN/--/path form when Expo Go exposes hostUri', () => {
    Constants.expoGoConfig = { hostUri: '192.168.0.30:8081' };
    Constants.expoConfig = null;
    expect(buildRedirectUri('fitbit-auth')).toBe('exp://192.168.0.30:8081/--/fitbit-auth');
  });

  it('falls back through expoGoConfig → expoConfig → manifest lookups', () => {
    Constants.expoGoConfig = null;
    Constants.expoConfig = { hostUri: '10.0.0.5:8081' };
    expect(buildRedirectUri('fitbit-auth')).toBe('exp://10.0.0.5:8081/--/fitbit-auth');

    Constants.expoConfig = null;
    Constants.manifest = { hostUri: '10.0.0.5:8081' };
    expect(buildRedirectUri('fitbit-auth')).toBe('exp://10.0.0.5:8081/--/fitbit-auth');
  });
});
