import type { RadioStation } from "../types";
import { getCache, setCache } from "../cache";
import { generateId } from "../utils";

const CACHE_TTL = 60 * 60 * 1000; // 1h

// Known stable Radio Browser instances
const INSTANCES = [
  "https://de1.api.radio-browser.info",
  "https://nl1.api.radio-browser.info",
  "https://at1.api.radio-browser.info",
];

interface RBStation {
  stationuuid: string;
  name: string;
  country: string;
  countrycode: string;
  language: string;
  tags: string;
  url_resolved: string;
  favicon: string;
  bitrate: number;
  codec: string;
  votes: number;
  clickcount: number;
}

function normalizeStation(s: RBStation): RadioStation {
  return {
    id: s.stationuuid || generateId(s.url_resolved),
    name: s.name || "Unknown Station",
    country: s.country || "",
    countryCode: s.countrycode || "",
    language: s.language || undefined,
    tags: s.tags ? s.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    streamUrl: s.url_resolved || "",
    favicon: s.favicon || undefined,
    bitrate: s.bitrate || undefined,
    codec: s.codec || undefined,
    votes: s.votes || 0,
    clickCount: s.clickcount || 0,
  };
}

async function getWorkingInstance(): Promise<string> {
  for (const instance of INSTANCES) {
    try {
      const resp = await fetch(`${instance}/json/stats`, {
        signal: AbortSignal.timeout(3000),
      });
      if (resp.ok) return instance;
    } catch {}
  }
  throw new Error("No Radio Browser instance available");
}

export interface RadioSearchParams {
  name?: string;
  country?: string;
  countrycode?: string;
  language?: string;
  tag?: string;
  limit?: number;
  offset?: number;
  order?: string;
  reverse?: boolean;
}

export async function searchRadioStations(
  params: RadioSearchParams = {}
): Promise<RadioStation[]> {
  const {
    name,
    country,
    countrycode,
    language,
    tag,
    limit = 40,
    offset = 0,
    order = "votes",
    reverse = true,
  } = params;

  const cacheKey = `radio_search_${JSON.stringify(params)}`;
  const cached = getCache<RadioStation[]>(cacheKey);
  if (cached) return cached;

  try {
    const instance = await getWorkingInstance();
    const query = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
      order,
      reverse: String(reverse),
      hidebroken: "true",
    });

    if (name) query.set("name", name);
    if (country) query.set("country", country);
    if (countrycode) query.set("countrycode", countrycode);
    if (language) query.set("language", language);
    if (tag) query.set("tag", tag);

    const resp = await fetch(
      `${instance}/json/stations/search?${query.toString()}`,
      {
        headers: { "User-Agent": "Quozix/1.0 (https://quozix.app)" },
        signal: AbortSignal.timeout(8000),
      }
    );

    if (!resp.ok) throw new Error(`Radio Browser error: ${resp.status}`);
    const data: RBStation[] = await resp.json();
    const stations = data
      .filter((s) => s.url_resolved)
      .map(normalizeStation);

    setCache(cacheKey, stations, CACHE_TTL);
    return stations;
  } catch {
    // Fallback to sample data
    return fetchRadioFallback();
  }
}

export async function getTopStations(limit = 40): Promise<RadioStation[]> {
  const cacheKey = `radio_top_${limit}`;
  const cached = getCache<RadioStation[]>(cacheKey);
  if (cached) return cached;

  try {
    const instance = await getWorkingInstance();
    const resp = await fetch(
      `${instance}/json/stations/topvote/${limit}?hidebroken=true`,
      {
        headers: { "User-Agent": "Quozix/1.0 (https://quozix.app)" },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!resp.ok) throw new Error(`Radio Browser error: ${resp.status}`);
    const data: RBStation[] = await resp.json();
    const stations = data.filter((s) => s.url_resolved).map(normalizeStation);
    setCache(cacheKey, stations, CACHE_TTL);
    return stations;
  } catch {
    return fetchRadioFallback();
  }
}

export async function fetchRadioFallback(): Promise<RadioStation[]> {
  try {
    const resp = await fetch("/sample-data/radio.json");
    if (resp.ok) return resp.json();
  } catch {}
  return [];
}
