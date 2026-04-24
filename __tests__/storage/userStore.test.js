import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearUser, getUser, setUser } from '../../storage/userStore';

beforeEach(() => AsyncStorage.clear());

describe('userStore', () => {
  it('returns null when no user is set', async () => {
    expect(await getUser()).toBeNull();
  });

  it('setUser writes a JSON blob and getUser parses it', async () => {
    await setUser({ strideStepsPerMile: 2117 });
    expect(await getUser()).toEqual({ strideStepsPerMile: 2117 });
  });

  it('setUser merges (does not replace)', async () => {
    await setUser({ strideStepsPerMile: 2117, hometown: 'Somerville, MA' });
    await setUser({ strideStepsPerMile: 2200 });
    expect(await getUser()).toEqual({
      strideStepsPerMile: 2200,
      hometown: 'Somerville, MA',
    });
  });

  it('clearUser removes the entry', async () => {
    await setUser({ strideStepsPerMile: 2117 });
    await clearUser();
    expect(await getUser()).toBeNull();
  });
});
