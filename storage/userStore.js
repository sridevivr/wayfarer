import AsyncStorage from '@react-native-async-storage/async-storage';

// Non-sensitive user profile (stride steps/mile, hometown, aspirational
// places). Lives in AsyncStorage under a single `@user` key as a JSON
// blob — small, atomic, easy to merge.

const KEY = '@user';

export async function getUser() {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function setUser(partial) {
  const current = (await getUser()) ?? {};
  const next = { ...current, ...partial };
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export async function clearUser() {
  await AsyncStorage.removeItem(KEY);
}
