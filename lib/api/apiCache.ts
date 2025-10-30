/**
 * API Cache Utility
 * Implements 24-hour caching for API responses using localStorage
 */

import type { CacheEntry } from '../types';

const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_KEY_PREFIX = 'api-cache:';

/**
 * Get cached data if it exists and hasn't expired
 */
export function getCachedData<T>(key: string): T | null {
  if (typeof window === 'undefined') {
    return null; // SSR safety
  }

  try {
    const cacheKey = `${CACHE_KEY_PREFIX}${key}`;
    const cached = localStorage.getItem(cacheKey);

    if (!cached) {
      return null;
    }

    const entry: CacheEntry<T> = JSON.parse(cached);
    const now = new Date().toISOString();

    // Check if cache has expired
    if (now > entry.expiresAt) {
      // Clear expired cache
      localStorage.removeItem(cacheKey);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.warn('[API Cache] Error reading cache:', error);
    return null;
  }
}

/**
 * Set cached data with expiration
 */
export function setCachedData<T>(key: string, data: T, version = '1.0.0'): void {
  if (typeof window === 'undefined') {
    return; // SSR safety
  }

  try {
    const cacheKey = `${CACHE_KEY_PREFIX}${key}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + CACHE_DURATION_MS);

    const entry: CacheEntry<T> = {
      data,
      timestamp: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      version,
    };

    localStorage.setItem(cacheKey, JSON.stringify(entry));
  } catch (error) {
    console.warn('[API Cache] Error writing cache:', error);
    // Handle quota exceeded errors gracefully
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error('[API Cache] localStorage quota exceeded');
    }
  }
}

/**
 * Clear specific cache entry
 */
export function clearCache(key: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const cacheKey = `${CACHE_KEY_PREFIX}${key}`;
    localStorage.removeItem(cacheKey);
  } catch (error) {
    console.warn('[API Cache] Error clearing cache:', error);
  }
}

/**
 * Clear all API caches
 */
export function clearAllCaches(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(CACHE_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('[API Cache] Error clearing all caches:', error);
  }
}

/**
 * Get cache status (exists, age, time until expiration)
 */
export function getCacheStatus(key: string): {
  exists: boolean;
  age: number; // milliseconds
  expiresIn: number; // milliseconds
  isExpired: boolean;
} | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const cacheKey = `${CACHE_KEY_PREFIX}${key}`;
    const cached = localStorage.getItem(cacheKey);

    if (!cached) {
      return { exists: false, age: 0, expiresIn: 0, isExpired: true };
    }

    const entry: CacheEntry = JSON.parse(cached);
    const now = new Date();
    const timestamp = new Date(entry.timestamp);
    const expiresAt = new Date(entry.expiresAt);

    const age = now.getTime() - timestamp.getTime();
    const expiresIn = expiresAt.getTime() - now.getTime();
    const isExpired = expiresIn <= 0;

    return {
      exists: true,
      age,
      expiresIn: Math.max(0, expiresIn),
      isExpired,
    };
  } catch (error) {
    console.warn('[API Cache] Error getting cache status:', error);
    return null;
  }
}
