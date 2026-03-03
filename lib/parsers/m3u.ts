import type { StreamChannel } from "../types";
import { generateId, deduplicate } from "../utils";

function parseAttributes(line: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const regex = /(\S+?)="([^"]*)"/g;
  let match;
  while ((match = regex.exec(line)) !== null) {
    attrs[match[1]] = match[2];
  }
  return attrs;
}

function parseDisplayName(extinf: string): string {
  const lastComma = extinf.lastIndexOf(",");
  if (lastComma === -1) return "";
  return extinf.slice(lastComma + 1).trim();
}

export function parseM3U(content: string): StreamChannel[] {
  const lines = content.split(/\r?\n/).map((l) => l.trim());
  const channels: StreamChannel[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("#EXTINF:")) {
      const attrs = parseAttributes(line);
      const displayName = parseDisplayName(line);

      // Find next URL line
      let urlLine = "";
      for (let j = i + 1; j < lines.length && j < i + 5; j++) {
        const candidate = lines[j];
        if (
          candidate.startsWith("http://") ||
          candidate.startsWith("https://") ||
          candidate.startsWith("rtmp://") ||
          candidate.startsWith("rtsp://")
        ) {
          urlLine = candidate;
          i = j;
          break;
        }
        if (candidate.startsWith("#") && !candidate.startsWith("#EXTVLCOPT")) {
          break;
        }
      }

      if (urlLine && (urlLine.startsWith("http://") || urlLine.startsWith("https://"))) {
        const name = attrs["tvg-name"] || displayName || "Unknown Channel";
        const countryCode = (attrs["tvg-country"] || "").toUpperCase().slice(0, 2) || "XX";
        const language = attrs["tvg-language"] || "";
        const groupTitle = attrs["group-title"] || "";
        const logoUrl = attrs["tvg-logo"] || undefined;

        channels.push({
          id: generateId(urlLine),
          name,
          countryCode,
          languages: language ? [language] : [],
          categories: groupTitle ? [groupTitle] : [],
          logoUrl,
          streamUrl: urlLine,
          groupTitle,
        });
      }
    }

    i++;
  }

  return deduplicate(channels, (c) => c.streamUrl);
}

export async function fetchAndParseM3U(url: string): Promise<StreamChannel[]> {
  const resp = await fetch(url, { cache: "no-store" });
  if (!resp.ok) throw new Error(`Failed to fetch M3U: ${resp.status}`);
  const text = await resp.text();
  return parseM3U(text);
}
