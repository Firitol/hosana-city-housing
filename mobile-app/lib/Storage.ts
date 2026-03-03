import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system';

// Secure storage keys
export const STORAGE_KEYS = {
  TOKEN: 'hosana_token',
  USER: 'hosana_user',
  LANGUAGE: 'hosana_language',
  CACHED_DATA: 'hosana_cached_data',
  LAST_SYNC: 'hosana_last_sync',
} as const;

// User type
export type User = {
  id: string;
  username: string;
  role: string;
  fullName: string;
  assignedMender?: string;
};

// Cached data type
export type CachedData = {
  householders: any[];
  timestamp: number;
};

/**
 * Store authentication token securely
 */
export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(STORAGE_KEYS.TOKEN, token);
}

/**
 * Get authentication token
 */
export async function getToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(STORAGE_KEYS.TOKEN);
}

/**
 * Delete authentication token
 */
export async function deleteToken(): Promise<void> {
  await SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN);
}

/**
 * Store user data securely
 */
export async function setUser(user: User): Promise<void> {
  await SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(user));
}

/**
 * Get user data
 */
export async function getUser(): Promise<User | null> {
  const userStr = await SecureStore.getItemAsync(STORAGE_KEYS.USER);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Delete user data
 */
export async function deleteUser(): Promise<void> {
  await SecureStore.deleteItemAsync(STORAGE_KEYS.USER);
}

/**
 * Store language preference
 */
export async function setLanguage(language: 'en' | 'am'): Promise<void> {
  await SecureStore.setItemAsync(STORAGE_KEYS.LANGUAGE, language);
}

/**
 * Get language preference
 */
export async function getLanguage(): Promise<'en' | 'am'> {
  const lang = await SecureStore.getItemAsync(STORAGE_KEYS.LANGUAGE);
  return (lang as 'en' | 'am') || 'en';
}

/**
 * Cache data for offline access
 */
export async function cacheData(data: CachedData): Promise<void> {
  try {
    const filePath = FileSystem.documentDirectory + 'cached_data.json';
    await FileSystem.writeAsStringAsync(filePath, JSON.stringify(data));
  } catch (error) {
    console.error('Cache write error:', error);
  }
}

/**
 * Get cached data
 */
export async function getCachedData(): Promise<CachedData | null> {
  try {
    const filePath = FileSystem.documentDirectory + 'cached_data.json';
    const fileInfo = await FileSystem.getInfoAsync(filePath);

    if (!fileInfo.exists) {
      return null;
    }

    const content = await FileSystem.readAsStringAsync(filePath);
    return JSON.parse(content);
  } catch (error) {
    console.error('Cache read error:', error);
    return null;
  }
}

/**
 * Clear cached data
 */
export async function clearCache(): Promise<void> {
  try {
    const filePath = FileSystem.documentDirectory + 'cached_data.json';
    const fileInfo = await FileSystem.getInfoAsync(filePath);

    if (fileInfo.exists) {
      await FileSystem.deleteAsync(filePath);
    }
  } catch (error) {
    console.error('Cache clear error:', error);
  }
}

/**
 * Set last sync timestamp
 */
export async function setLastSync(timestamp: number): Promise<void> {
  await SecureStore.setItemAsync(STORAGE_KEYS.LAST_SYNC, timestamp.toString());
}

/**
 * Get last sync timestamp
 */
export async function getLastSync(): Promise<number> {
  const timestamp = await SecureStore.getItemAsync(STORAGE_KEYS.LAST_SYNC);
  return timestamp ? parseInt(timestamp, 10) : 0;
}

/**
 * Check if data is stale (older than 1 hour)
 */
export async function isDataStale(): Promise<boolean> {
  const lastSync = await getLastSync();
  const oneHour = 60 * 60 * 1000;
  return Date.now() - lastSync > oneHour;
}

/**
 * Clear all secure storage (logout)
 */
export async function clearAll(): Promise<void> {
  await deleteToken();
  await deleteUser();
  await clearCache();
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getToken();
  return !!token;
}

/**
 * Get auth headers for API requests
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getToken();
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  };
}