QUOZIX NEWS
===========

Quozix News is a free, open-source single-page web app: live news TV channels and
news-focused radio stations from around the world, on an interactive 3D globe.
Stack: Next.js (static export), TypeScript, Tailwind CSS, globe.gl, hls.js.

WHAT IT DOES
------------

- News TV: iptv-org "News" playlist + local CSV metadata and blocklist; build
  script checks CORS-friendly HTTPS streams and writes public/data/news-tv.json.

- News radio: Radio Browser API at runtime, filtered toward news / news-talk.

- Globe: country centroids; dots show TV, radio, or both.

- TV plays in a full-screen lightbox; radio uses a bottom bar.

Quozix News does NOT host streams. It only links and plays third-party URLs.

INSTALL & RUN
-------------

  pnpm install
  pnpm dev

Then open http://localhost:3000

BUILD
-----

  pnpm build

prebuild runs scripts/build-news-data.mjs (TV JSON). Rebuild TV data only:

  pnpm build:data

Static site output: out/

DATA SOURCES
------------

- iptv-org M3U (news category) for TV URLs
- csvs/ for channel metadata and blocklist
- Radio Browser for radio stations

No API keys required for those.

LIMITATIONS
-----------

Many streams fail (geo-block, dead URL). Radio/news filtering is heuristic.

LEGAL: Broadcasters own their content; this project is an index/player only.

LICENSE
-------

MIT License. See LICENSE file in this repository.

Copyright (c) 2026 Yeshaya Shapiro
