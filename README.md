# Quozix — OSINT Media Globe

A production-quality, zero-backend OSINT-style intelligence dashboard built with Next.js, React, TypeScript, Tailwind CSS, and Framer Motion.

---

## Features

- **3D Interactive Globe** — powered by globe.gl (Three.js), with signal markers, animated arc flows, and aircraft overlays
- **Live TV Streams** — browse and watch public IPTV channels from iptv-org; full M3U parsing with metadata
- **International Radio** — search and listen to thousands of stations via Radio Browser API
- **Intel Feed** — OSINT-style news signal aggregator using GDELT DOC 2.1 API (no key required)
- **Command Palette** — `Cmd+K` global search across pages and features
- **Dark Terminal UI** — premium tech aesthetic with Space Grotesk + Inter fonts, subtle grain overlay, glow accents
- **Fully Static** — runs as a static export; no backend, no auth, no API keys required
- **Graceful Fallbacks** — CORS-resilient with curated sample data in `/public/sample-data`
- **Favorites** — localStorage-based favorites for streams and radio stations
- **Performance** — Low Power Mode disables globe arcs and animations; TTL caching for all fetched data

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Static Export) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion v12 |
| 3D Globe | globe.gl (Three.js-based) |
| Video | hls.js (with native HLS fallback for Safari) |
| Icons | lucide-react |
| Fonts | next/font — Space Grotesk + Inter |

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended)

### Install

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Build

```bash
pnpm build
```

### Static Export

The project is configured for static export (`output: "export"` in `next.config.ts`).
After `pnpm build`, the static site is in the `out/` directory and can be deployed to any static host (Vercel, Netlify, GitHub Pages, Cloudflare Pages, etc.).

---

## Data Sources

| Source | Type | API Key | Notes |
|--------|------|---------|-------|
| [GDELT Project](https://www.gdeltproject.org/) | News signals | None | DOC 2.1 API; data may be delayed |
| [iptv-org](https://github.com/iptv-org/iptv) | Live TV directory | None | Community M3U playlists |
| [Radio Browser](https://www.radio-browser.info/) | Radio stations | None | Community radio database |
| [OpenSky Network](https://opensky-network.org/) | Air activity | None | Public ADS-B; may be CORS-blocked |

---

## Known Limitations

### CORS
Some data sources (especially iptv-org's main index and OpenSky) may be blocked by browser CORS policies in certain environments. When this happens:
- The app falls back to curated sample data in `/public/sample-data/`
- A visible warning banner is shown to the user

### Stream Availability
Live streams from the iptv-org directory are community-submitted links to third-party servers. They may go offline at any time. If a stream fails:
- An error is shown with a "Retry" button
- An "Open direct" button opens the stream URL in a new tab

### GDELT Data Quality
GDELT monitors news media globally. Signals are news mentions — not verified events. Locations are inferred from text and may be inaccurate. This data is informational only.

### OpenSky ADS-B
The OpenSky anonymous API is rate-limited (~5 req/min) and may not be CORS-accessible in all browser environments. If unavailable, a static sample dataset is shown.

---

## Adding Curated Sources

You can expand the fallback datasets by editing the JSON files in `/public/sample-data/`:

- `streams.json` — Add `StreamChannel` objects to the TV fallback list
- `radio.json` — Add `RadioStation` objects to the radio fallback list
- `signals.json` — Add `Signal` objects to the intel feed fallback
- `air.json` — Add `AircraftPosition` objects to the globe air layer

All types are defined in `/lib/types.ts`.

---

## Project Structure

```
quozix/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout (fonts, AppShell)
│   ├── page.tsx            # Dashboard
│   ├── globe/page.tsx      # Full globe view
│   ├── streams/page.tsx    # Live TV
│   ├── radio/page.tsx      # Radio
│   ├── intel/page.tsx      # Intel feed
│   └── sources/page.tsx    # Sources & Terms
├── components/
│   ├── Globe/              # globe.gl wrapper
│   ├── Player/             # Video + Audio players
│   ├── Shell/              # AppShell, Sidebar, Topbar
│   ├── UI/                 # Design system primitives
│   └── CommandPalette.tsx
├── lib/
│   ├── fetchers/           # IPTV, Radio Browser, GDELT, OpenSky
│   ├── parsers/            # M3U parser
│   ├── cache.ts            # TTL localStorage cache
│   ├── geo.ts              # Country centroids + text inference
│   ├── types.ts            # Shared TypeScript types
│   └── utils.ts
└── public/
    └── sample-data/        # Fallback datasets
```

---

## Ethics & Disclaimer

- Quozix does not host any streams or media content
- All stream links are sourced from community-maintained directories
- News signals are raw mentions from GDELT — not verified facts
- Geographic coordinates are approximate text inferences
- Not suitable for safety-critical, operational, or navigation use
- No personal data is collected; favorites stored in localStorage only

---

## License

MIT — see LICENSE file.
