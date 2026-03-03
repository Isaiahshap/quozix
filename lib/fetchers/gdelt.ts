import type { Signal } from "../types";
import { getCache, setCache } from "../cache";
import { generateId, extractDomain, deduplicate } from "../utils";
import { inferGeoFromText } from "../geo";

const CACHE_TTL = 10 * 60 * 1000; // 10 min

// GDELT DOC 2.1 API (no key required)
const GDELT_BASE = "https://api.gdeltproject.org/api/v2/doc/doc";

interface GDELTArticle {
  url: string;
  url_mobile?: string;
  title: string;
  seendate: string;
  socialimage?: string;
  domain: string;
  language: string;
  sourcecountry: string;
}

interface GDELTResponse {
  articles?: GDELTArticle[];
}

function gdeltDateToISO(d: string): string {
  // GDELT format: YYYYMMDDHHMMSS
  if (d.length === 14) {
    return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}T${d.slice(8, 10)}:${d.slice(10, 12)}:${d.slice(12, 14)}Z`;
  }
  return d;
}

function normalizeArticle(
  article: GDELTArticle,
  keywords: string[]
): Signal {
  const publishedAt = gdeltDateToISO(article.seendate);
  const geo = inferGeoFromText(article.title + " " + article.sourcecountry);

  return {
    id: generateId(article.url),
    title: article.title || "Untitled",
    url: article.url,
    source: article.domain,
    domain: article.domain,
    publishedAt,
    geo: geo || undefined,
    keywords,
    imageUrl: article.socialimage || undefined,
    sourceCount: 1,
  };
}

export const DEFAULT_KEYWORDS = [
  "conflict",
  "airstrike",
  "missile",
  "drone",
  "earthquake",
  "explosion",
  "protest",
  "sanctions",
  "military",
];

export async function fetchGDELTSignals(
  query: string,
  timespan = "1440" // minutes, default 24h
): Promise<Signal[]> {
  const cacheKey = `gdelt_${slugifyQuery(query)}_${timespan}`;
  const cached = getCache<Signal[]>(cacheKey);
  if (cached) return cached;

  const params = new URLSearchParams({
    query: query,
    mode: "artlist",
    maxrecords: "50",
    format: "json",
    timespan: `${timespan}min`,
    sort: "DateDesc",
  });

  try {
    const resp = await fetch(`${GDELT_BASE}?${params.toString()}`, {
      signal: AbortSignal.timeout(10000),
    });

    if (!resp.ok) throw new Error(`GDELT error: ${resp.status}`);

    const data: GDELTResponse = await resp.json();
    const articles = data.articles || [];

    const keywords = query.split(" ").filter(Boolean);
    const signals = articles.map((a) => normalizeArticle(a, keywords));
    const deduped = deduplicate(signals, (s) => s.url);

    setCache(cacheKey, deduped, CACHE_TTL);
    return deduped;
  } catch {
    return fetchSignalsFallback();
  }
}

export async function fetchMultiKeywordSignals(
  keywords: string[],
  timespan = "1440"
): Promise<Signal[]> {
  const query = keywords.slice(0, 5).join(" OR ");
  return fetchGDELTSignals(query, timespan);
}

export async function fetchSignalsFallback(): Promise<Signal[]> {
  try {
    const resp = await fetch("/sample-data/signals.json");
    if (resp.ok) return resp.json();
  } catch {}
  return [];
}

function slugifyQuery(q: string): string {
  return q.replace(/[^a-z0-9]/gi, "_").slice(0, 40);
}

export function groupSignalsByDomain(signals: Signal[]): Record<string, Signal[]> {
  return signals.reduce((acc, s) => {
    if (!acc[s.domain]) acc[s.domain] = [];
    acc[s.domain].push(s);
    return acc;
  }, {} as Record<string, Signal[]>);
}

export function countSourcesForSignals(signals: Signal[]): Map<string, number> {
  const clusterMap = new Map<string, Set<string>>();
  for (const s of signals) {
    const key = s.title.slice(0, 60).toLowerCase();
    if (!clusterMap.has(key)) clusterMap.set(key, new Set());
    clusterMap.get(key)!.add(s.domain);
  }
  const result = new Map<string, number>();
  for (const s of signals) {
    const key = s.title.slice(0, 60).toLowerCase();
    result.set(s.id, clusterMap.get(key)?.size || 1);
  }
  return result;
}
