import AsyncStorage from '@react-native-async-storage/async-storage';

import { getJSON, setJSON, STORAGE_KEYS } from './storage';

describe('storage', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('round-trips a JSON value', async () => {
    await setJSON(STORAGE_KEYS.theme, 'dark');
    expect(await getJSON<string>(STORAGE_KEYS.theme)).toBe('dark');
  });

  it('returns null for a missing key', async () => {
    expect(await getJSON(STORAGE_KEYS.theme)).toBeNull();
  });

  it('returns null (instead of throwing) when the stored value is not valid JSON', async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.theme, 'not-json{');
    expect(await getJSON(STORAGE_KEYS.theme)).toBeNull();
  });
});
