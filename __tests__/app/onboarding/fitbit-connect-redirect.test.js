import Constants from 'expo-constants';
import { buildRedirectUri } from '../../../app/onboarding/fitbit-connect';

function resetConstants() {
  Constants.executionEnvironment = null;
  Constants.expoGoConfig = null;
  Constants.expoConfig = null;
  Constants.manifest = null;
  Constants.manifest2 = null;
}

beforeEach(resetConstants);

describe('buildRedirectUri', () => {
  it('returns wayfarer://path in a dev client or standalone build', () => {
    Constants.executionEnvironment = 'standalone';
    // Even with a hostUri present (Metro running), dev client must
    // use the custom scheme because Expo Go is not the target.
    Constants.expoConfig = { hostUri: '192.168.0.30:8081' };
    expect(buildRedirectUri('fitbit-auth')).toBe('wayfarer://fitbit-auth');
  });

  it('returns the exp://LAN/--/path form when running under Expo Go', () => {
    Constants.executionEnvironment = 'storeClient';
    Constants.expoGoConfig = { hostUri: '192.168.0.30:8081' };
    expect(buildRedirectUri('fitbit-auth')).toBe('exp://192.168.0.30:8081/--/fitbit-auth');
  });

  it('falls back through expoGoConfig → expoConfig → manifest in Expo Go', () => {
    Constants.executionEnvironment = 'storeClient';
    Constants.expoConfig = { hostUri: '10.0.0.5:8081' };
    expect(buildRedirectUri('fitbit-auth')).toBe('exp://10.0.0.5:8081/--/fitbit-auth');

    Constants.expoConfig = null;
    Constants.manifest = { hostUri: '10.0.0.5:8081' };
    expect(buildRedirectUri('fitbit-auth')).toBe('exp://10.0.0.5:8081/--/fitbit-auth');
  });

  it('falls through to the custom scheme if Expo Go has no hostUri', () => {
    Constants.executionEnvironment = 'storeClient';
    expect(buildRedirectUri('fitbit-auth')).toBe('wayfarer://fitbit-auth');
  });
});
