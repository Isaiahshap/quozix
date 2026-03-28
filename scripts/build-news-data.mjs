#!/usr/bin/env node
/**
 * Build-time script: generates public/data/news-tv.json
 *
 * Sources:
 *   - csvs/channels.csv   (iptv-org channel metadata)
 *   - csvs/blocklist.csv  (iptv-org block list)
 *   - https://iptv-org.github.io/iptv/categories/news.m3u  (stream URLs)
 *
 * Each stream is CORS-verified — only browser-playable streams are included.
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const CORS_CHECK_CONCURRENCY = 40;
const CORS_TIMEOUT_MS = 8000;
const ORIGIN = "https://quozix.app";

// Country code normalization (iptv-org uses some non-ISO codes)
const NORMALIZE_CC = { UK: "GB", AN: "NL", CS: "RS" };
function normalizeCountry(cc) {
  const u = (cc || "").toUpperCase();
  return NORMALIZE_CC[u] || u;
}

// Parse a simple CSV
function parseCSV(content) {
  const lines = content.split(/\r?\n/);
  if (!lines.length) return [];
  const headers = lines[0].split(",");
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const cols = line.split(",");
    const row = {};
    headers.forEach((h, idx) => {
      row[h.trim()] = (cols[idx] || "").trim().replace(/^"|"$/g, "");
    });
    rows.push(row);
  }
  return rows;
}

// Parse iptv-org M3U — returns { channelId, logoUrl, streamUrl }[]
function parseM3U(text) {
  const lines = text.split(/\r?\n/);
  const result = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith("#EXTINF:")) continue;

    const tvgIdMatch = line.match(/tvg-id="([^"]*)"/);
    if (!tvgIdMatch) continue;
    const rawTvgId = tvgIdMatch[1];
    const channelId = rawTvgId.split("@")[0];
    if (!channelId) continue;

    const logoMatch = line.match(/tvg-logo="([^"]*)"/);
    const logoUrl = logoMatch ? logoMatch[1] : "";

    let streamUrl = "";
    for (let j = i + 1; j < lines.length && j < i + 6; j++) {
      const candidate = lines[j].trim();
      if (!candidate) continue;
      if (candidate.startsWith("http://") || candidate.startsWith("https://")) {
        streamUrl = candidate;
        i = j;
        break;
      }
      if (candidate.startsWith("#") && !candidate.startsWith("#EXTVLCOPT")) break;
    }

    if (streamUrl) result.push({ channelId, logoUrl, streamUrl });
  }
  return result;
}

// Check if a stream URL is accessible from a browser (CORS check)
async function checkCORS(url) {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), CORS_TIMEOUT_MS);

    // First try HEAD (fast, low bandwidth)
    let resp;
    try {
      resp = await fetch(url, {
        method: "HEAD",
        headers: { Origin: ORIGIN, "User-Agent": "Mozilla/5.0 (compatible; QuozixBot/1.0)" },
        signal: ctrl.signal,
      });
    } catch {
      // Some servers don't support HEAD; fall back to GET with range
      try {
        resp = await fetch(url, {
          method: "GET",
          headers: {
            Origin: ORIGIN,
            Range: "bytes=0-0",
            "User-Agent": "Mozilla/5.0 (compatible; QuozixBot/1.0)",
          },
          signal: ctrl.signal,
        });
      } catch {
        clearTimeout(timer);
        return false;
      }
    }
    clearTimeout(timer);

    if (!resp.ok && resp.status !== 206) return false;

    const acao = (resp.headers.get("access-control-allow-origin") || "").trim();
    return acao === "*" || acao === ORIGIN;
  } catch {
    return false;
  }
}

// Run CORS checks with limited concurrency
async function checkAllCORS(streams, concurrency) {
  const results = new Array(streams.length).fill(false);
  let idx = 0;
  let passed = 0;

  async function worker() {
    while (idx < streams.length) {
      const i = idx++;
      results[i] = await checkCORS(streams[i].streamUrl);
      if (results[i]) passed++;
      if ((i + 1) % 50 === 0) {
        process.stdout.write(`\r  CORS checked: ${i + 1}/${streams.length}  ✓ ${passed} pass`);
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);
  process.stdout.write(`\r  CORS checked: ${streams.length}/${streams.length}  ✓ ${passed} pass\n`);

  return results;
}

async function main() {
  console.log("📡 Building news TV channel data...\n");

  // ── 1. Load channels.csv ─────────────────────────────────────────────────
  console.log("  Reading csvs/channels.csv...");
  const channelsRaw = readFileSync(resolve(ROOT, "csvs/channels.csv"), "utf8");
  const allChannels = parseCSV(channelsRaw);

  const channelMap = new Map();
  for (const ch of allChannels) {
    const categories = (ch.categories || "").split(";").map((c) => c.trim());
    const isNews = categories.includes("news");
    const isClosed = ch.closed && ch.closed.trim() !== "";
    const isNSFW = ch.is_nsfw === "TRUE";
    if (isNews && !isClosed && !isNSFW) {
      channelMap.set(ch.id, {
        id: ch.id,
        name: ch.name,
        country: normalizeCountry(ch.country || ""),
        website: ch.website || "",
      });
    }
  }
  console.log(`  → ${channelMap.size} active news channels in CSV`);

  // ── 2. Load blocklist.csv ────────────────────────────────────────────────
  console.log("  Reading csvs/blocklist.csv...");
  const blocklistRaw = readFileSync(resolve(ROOT, "csvs/blocklist.csv"), "utf8");
  const blockedIds = new Set(parseCSV(blocklistRaw).map((r) => r.channel));
  console.log(`  → ${blockedIds.size} blocked channels`);

  // ── 3. Fetch news M3U ────────────────────────────────────────────────────
  const M3U_URL = "https://iptv-org.github.io/iptv/categories/news.m3u";
  console.log(`  Fetching ${M3U_URL}...`);

  let rawStreams = [];
  try {
    const resp = await fetch(M3U_URL);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    rawStreams = parseM3U(await resp.text());
    console.log(`  → ${rawStreams.length} streams in M3U`);
  } catch (err) {
    console.warn(`  ⚠ M3U fetch failed: ${err.message}`);
  }

  // ── 4. Pre-filter obvious non-playable streams ───────────────────────────
  const httpsStreams = rawStreams.filter((s) => {
    if (!s.streamUrl.startsWith("https://")) return false; // no HTTP (mixed content)
    if (blockedIds.has(s.channelId)) return false;
    return true;
  });
  console.log(`  → ${httpsStreams.length} streams after HTTPS + blocklist filter`);

  // ── 5. CORS verification ─────────────────────────────────────────────────
  console.log(`  Checking CORS access (${CORS_CHECK_CONCURRENCY} concurrent, ${CORS_TIMEOUT_MS / 1000}s timeout)...`);
  const corsResults = await checkAllCORS(httpsStreams, CORS_CHECK_CONCURRENCY);

  const corsStreams = httpsStreams.filter((_, i) => corsResults[i]);
  console.log(`  → ${corsStreams.length} streams browser-accessible (CORS verified)`);

  // ── 6. Join with channel metadata ────────────────────────────────────────
  const seen = new Set();
  const output = [];

  for (const stream of corsStreams) {
    const { channelId, logoUrl, streamUrl } = stream;
    if (seen.has(streamUrl)) continue;
    seen.add(streamUrl);

    const meta = channelMap.get(channelId);
    const idParts = channelId.split(".");
    const countryFromId = normalizeCountry(idParts[idParts.length - 1] || "");
    const country = meta?.country || countryFromId;
    const name = meta?.name || channelId;

    output.push({
      id: channelId,
      name,
      countryCode: country,
      logoUrl: logoUrl || undefined,
      streamUrl,
      website: meta?.website || undefined,
      categories: ["news"],
      languages: [],
      groupTitle: "News",
    });
  }

  // ── 7. Write output ──────────────────────────────────────────────────────
  mkdirSync(resolve(ROOT, "public/data"), { recursive: true });
  const outPath = resolve(ROOT, "public/data/news-tv.json");
  writeFileSync(outPath, JSON.stringify(output, null, 0));

  const sizeKB = (readFileSync(outPath).length / 1024).toFixed(0);
  console.log(`\n✅ Written to public/data/news-tv.json (${sizeKB} KB, ${output.length} verified streams)`);

  const byCountry = {};
  for (const ch of output) {
    byCountry[ch.countryCode] = (byCountry[ch.countryCode] || 0) + 1;
  }
  const top = Object.entries(byCountry)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15)
    .map(([cc, n]) => `${cc}:${n}`)
    .join("  ");
  console.log(`   Top countries: ${top}`);
}

main().catch((err) => {
  console.error("❌ build-news-data failed:", err);
  process.exit(1);
});
