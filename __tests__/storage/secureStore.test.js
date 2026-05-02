import * as SecureStore from 'expo-secure-store';
import { clearTokens, getTokens, saveTokens } from '../../storage/secureStore';

beforeEach(() => SecureStore.__reset());

describe('secureStore', () => {
  it('returns null when nothing is saved', async () => {
    expect(await getTokens()).toBeNull();
  });

  it('saves and reads back access + refresh tokens', async () => {
    await saveTokens({ access: 'a-1', refresh: 'r-1' });
    expect(await getTokens()).toEqual({ access: 'a-1', refresh: 'r-1' });
  });

  it('omits refresh when not provided (refresh stays undefined)', async () => {
    await saveTokens({ access: 'a-1' });
    const t = await getTokens();
    expect(t.access).toBe('a-1');
    expect(t.refresh ?? null).toBeNull();
  });

  it('clearTokens wipes both keys', async () => {
    await saveTokens({ access: 'a-1', refresh: 'r-1' });
    await clearTokens();
    expect(await getTokens()).toBeNull();
  });
});
