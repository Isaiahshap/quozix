import type { CacheEntry } from "./types";

const PREFIX = "quozix_cache_";

export function setCache<T>(key: string, data: T, ttlMs: number): void {
  if (typeof window === "undefined") return;
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    };
    localStorage.setItem(PREFIX + key, JSON.stringify(entry));
  } catch {
    // localStorage may be full; silently fail
  }
}

export function getCache<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.timestamp > entry.ttl) {
      localStorage.removeItem(PREFIX + key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

export function clearCache(key?: string): void {
  if (typeof window === "undefined") return;
  if (key) {
    localStorage.removeItem(PREFIX + key);
    return;
  }
  const keys = Object.keys(localStorage).filter((k) => k.startsWith(PREFIX));
  keys.forEach((k) => localStorage.removeItem(k));
}

export function getCacheKeys(): string[] {
  if (typeof window === "undefined") return [];
  return Object.keys(localStorage)
    .filter((k) => k.startsWith(PREFIX))
    .map((k) => k.replace(PREFIX, ""));
}

export function getCacheSizeBytes(): number {
  if (typeof window === "undefined") return 0;
  let total = 0;
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith(PREFIX)) {
      total += (localStorage.getItem(key) || "").length * 2;
    }
  }
  return total;
}

export function isCacheExpired(key: string): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return true;
    const entry: CacheEntry<unknown> = JSON.parse(raw);
    return Date.now() - entry.timestamp > entry.ttl;
  } catch {
    return true;
  }
}

// Favorites
const FAV_PREFIX = "quozix_fav_";

export function getFavorites(type: "stream" | "radio"): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAV_PREFIX + type);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleFavorite(type: "stream" | "radio", id: string): boolean {
  const favs = getFavorites(type);
  const idx = favs.indexOf(id);
  if (idx >= 0) {
    favs.splice(idx, 1);
  } else {
    favs.push(id);
  }
  try {
    localStorage.setItem(FAV_PREFIX + type, JSON.stringify(favs));
  } catch {}
  return idx < 0;
}

export function isFavorite(type: "stream" | "radio", id: string): boolean {
  return getFavorites(type).includes(id);
}
