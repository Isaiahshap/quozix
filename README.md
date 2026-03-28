# Quozix News

**Quozix News** is a free, open-source single-page web app: live **news TV** channels and **news-focused radio** stations from around the world, plotted on an interactive 3D globe. Built with Next.js (static export), TypeScript, Tailwind CSS, globe.gl, and hls.js.

---

## What it does

- **News TV** — Channels come from [iptv-org](https://github.com/iptv-org/iptv)’s *News* category playlist, merged with metadata from local CSVs, filtered against a blocklist, and checked at build time for browser-friendly (CORS-friendly) HTTPS streams. The result is written to `public/data/news-tv.json`.
- **News radio** — Stations are loaded from the [Radio Browser](https://www.radio-browser.info/) API at runtime, with filtering so the list skews toward actual news / news-talk stations (not general music or entertainment).
- **Globe** — Each country you can select is positioned using country centroids; dots reflect TV-only, radio-only, or both.
- **Playback** — TV opens in a full-screen lightbox; radio uses a bottom audio bar. Many streams still fail in-browser due to geo-blocking or dead URLs; the UI explains that and offers retries and official-site links when available.

Quozix News does **not** host streams. It is a viewer and directory that points at third-party URLs.

---

## Tech stack

| Layer        | Technology                                      |
| ------------ | ----------------------------------------------- |
| Framework    | Next.js 16 (App Router, static export)         |
| Language     | TypeScript                                      |
| Styling      | Tailwind CSS v4                                 |
| Motion       | Framer Motion                                   |
| Globe        | globe.gl (Three.js)                             |
| HLS playback | hls.js (+ native HLS where supported)           |
| Analytics    | Google Analytics (gtag), optional in `layout`   |

---

## Prerequisites

- Node.js 18+
- [pnpm](https://pnpm.io/) (recommended)

---

## Install & run

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Build & data

A `prebuild` hook regenerates TV data before every production build:

```bash
pnpm build
```

To rebuild TV JSON only:

```bash
pnpm build:data
```

This runs `scripts/build-news-data.mjs`, which reads `csvs/channels.csv`, `csvs/blocklist.csv`, fetches the iptv-org news M3U, and writes `public/data/news-tv.json`.

Static output is emitted to `out/` (see `next.config.ts`).

---

## Project structure (high level)

```
quozix/
├── app/
│   ├── layout.tsx       # Root layout, fonts, metadata, scripts
│   ├── page.tsx         # Single-page globe + panels + players
│   └── globals.css
├── components/Globe/    # globe.gl wrapper + view
├── lib/
│   ├── fetchers/news.ts # News TV (JSON) + news radio (API)
│   ├── geo.ts           # Country centroids for the globe
│   ├── types.ts
│   └── utils.ts
├── scripts/
│   └── build-news-data.mjs
├── csvs/                # iptv-org-style channel metadata (optional local source)
└── public/data/
    └── news-tv.json     # Generated at build time
```

Older fetcher modules may remain under `lib/fetchers/` for reference; the live app is **news-only** and driven by `lib/fetchers/news.ts` plus the build script.

---

## Data sources

| Source        | Role                          | API key |
| ------------- | ----------------------------- | ------- |
| iptv-org M3U  | News TV stream URLs + logos   | None    |
| Local `csvs/` | Channel metadata / blocklists | N/A     |
| Radio Browser | News-filtered live radio      | None    |

---

## Limitations

- **Streams break** — Community IPTV links and radio endpoints change or block browsers; not every channel will play everywhere.
- **Filtering is heuristic** — Radio tags and names are used to prefer news; some false positives or misses are possible.
- **Legal / rights** — All trademarks and broadcasts belong to their owners; this project is an index/player only.

---

## Ethics & disclaimer

Use this project responsibly. It does not host media, does not imply affiliation with broadcasters, and is not valid for safety-critical or operational decisions. See the in-app “About” modal for the full disclaimer.

---

## Contributing

Issues and pull requests are welcome. Keep changes focused and consistent with existing patterns.

---

## License

MIT License — see [LICENSE](LICENSE).

Copyright (c) 2026 Yeshaya Shapiro
