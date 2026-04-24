import * as SecureStore from 'expo-secure-store';

// Tokens live in the iOS keychain via expo-secure-store. They never
// touch AsyncStorage — that's plain UserDefaults and would survive
// app deletion / be readable by other tooling. Refresh tokens in
// particular are long-lived bearer credentials.

const ACCESS_KEY = 'wayfarer_fitbit_access_token';
const REFRESH_KEY = 'wayfarer_fitbit_refresh_token';

export async function saveTokens({ access, refresh }) {
  await SecureStore.setItemAsync(ACCESS_KEY, access);
  if (refresh) await SecureStore.setItemAsync(REFRESH_KEY, refresh);
}

export async function getTokens() {
  const [access, refresh] = await Promise.all([
    SecureStore.getItemAsync(ACCESS_KEY),
    SecureStore.getItemAsync(REFRESH_KEY),
  ]);
  if (!access) return null;
  return { access, refresh };
}

export async function clearTokens() {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_KEY),
    SecureStore.deleteItemAsync(REFRESH_KEY),
  ]);
}
