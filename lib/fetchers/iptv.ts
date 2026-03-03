import type { StreamChannel } from "../types";
import { getCache, setCache } from "../cache";
import { fetchAndParseM3U } from "../parsers/m3u";

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24h

// iptv-org raw playlist URLs (jsDelivr CDN mirror works in browser)
const IPTV_INDEX_URL =
  "https://iptv-org.github.io/iptv/index.m3u";

const COUNTRY_PLAYLIST_BASE =
  "https://iptv-org.github.io/iptv/countries/";

export async function fetchIPTVIndex(): Promise<StreamChannel[]> {
  const cacheKey = "iptv_index";
  const cached = getCache<StreamChannel[]>(cacheKey);
  if (cached) return cached;

  try {
    const channels = await fetchAndParseM3U(IPTV_INDEX_URL);
    setCache(cacheKey, channels, CACHE_TTL);
    return channels;
  } catch {
    // Try fallback sample data
    const resp = await fetch("/sample-data/streams.json");
    if (resp.ok) {
      const data = await resp.json();
      return data as StreamChannel[];
    }
    throw new Error("IPTV index unavailable");
  }
}

export async function fetchIPTVByCountry(
  countryCode: string
): Promise<StreamChannel[]> {
  const cc = countryCode.toLowerCase();
  const cacheKey = `iptv_country_${cc}`;
  const cached = getCache<StreamChannel[]>(cacheKey);
  if (cached) return cached;

  try {
    const channels = await fetchAndParseM3U(
      `${COUNTRY_PLAYLIST_BASE}${cc}.m3u`
    );
    setCache(cacheKey, channels, CACHE_TTL);
    return channels;
  } catch {
    return [];
  }
}

export async function fetchIPTVFallback(): Promise<StreamChannel[]> {
  try {
    const resp = await fetch("/sample-data/streams.json");
    if (resp.ok) return resp.json();
  } catch {}
  return [];
}
