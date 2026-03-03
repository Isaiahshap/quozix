import type { AircraftPosition } from "../types";
import { getCache, setCache } from "../cache";

const CACHE_TTL = 2 * 60 * 1000; // 2 min

// OpenSky public endpoint - no key required, may have CORS issues
const OPENSKY_URL = "https://opensky-network.org/api/states/all";

interface OpenSkyResponse {
  states?: (string | number | boolean | null)[][];
}

function normalizeState(state: (string | number | boolean | null)[]): AircraftPosition | null {
  const icao24 = state[0] as string;
  const callsign = (state[1] as string || "").trim() || undefined;
  const originCountry = state[2] as string || "";
  const lng = state[5] as number | null;
  const lat = state[6] as number | null;
  const altitude = state[7] as number | null;
  const onGround = state[8] as boolean || false;
  const velocity = state[9] as number | null;
  const heading = state[10] as number | null;

  if (lat === null || lng === null || isNaN(lat) || isNaN(lng)) return null;
  if (onGround) return null;

  return {
    icao24,
    callsign,
    originCountry,
    latitude: lat,
    longitude: lng,
    altitude: altitude || undefined,
    velocity: velocity || undefined,
    heading: heading || undefined,
    onGround,
  };
}

export async function fetchAircraft(
  bounds?: { minLat: number; maxLat: number; minLng: number; maxLng: number }
): Promise<AircraftPosition[]> {
  const cacheKey = bounds ? `opensky_bounds_${JSON.stringify(bounds)}` : "opensky_all";
  const cached = getCache<AircraftPosition[]>(cacheKey);
  if (cached) return cached;

  try {
    const params = new URLSearchParams();
    if (bounds) {
      params.set("lamin", String(bounds.minLat));
      params.set("lamax", String(bounds.maxLat));
      params.set("lomin", String(bounds.minLng));
      params.set("lomax", String(bounds.maxLng));
    }

    const url = bounds
      ? `${OPENSKY_URL}?${params.toString()}`
      : OPENSKY_URL;

    const resp = await fetch(url, {
      signal: AbortSignal.timeout(10000),
    });

    if (!resp.ok) throw new Error(`OpenSky error: ${resp.status}`);

    const data: OpenSkyResponse = await resp.json();
    const positions = (data.states || [])
      .map(normalizeState)
      .filter((p): p is AircraftPosition => p !== null)
      .slice(0, 200); // limit for performance

    setCache(cacheKey, positions, CACHE_TTL);
    return positions;
  } catch {
    return fetchAircraftFallback();
  }
}

export async function fetchAircraftFallback(): Promise<AircraftPosition[]> {
  try {
    const resp = await fetch("/sample-data/air.json");
    if (resp.ok) return resp.json();
  } catch {}
  return [];
}
