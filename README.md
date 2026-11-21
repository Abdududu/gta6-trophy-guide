# VICE GOT A PRICE!

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Abdududu/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Abdududu/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

The best GTA 6 trophy guide — an offline web app for all 55 GTA VI PS5 trophies (1 Platinum, 2 Gold, 6 Silver, 46 Bronze; 28 PSN-hidden; 1 missable).

Built for the [make.fun bounty "Build the best GTA 6 trophy guide"](https://make.fun/bounty/gta6-trophy-guide-01).

## What it is

- **Tracker-first**: check off trophies as you earn them; progress, PSN points and next-up are always visible.
- **55/55 guides, 0 uncited**: 866 cited claims, every one backed by 2+ sources across 46 distinct sources.
- **40 disputes, both sides**: where sources disagree, the guide shows both sides and gives its call ("Our call").
- **The one missable, protected**: Positive Mental Attitude (18 meditation spots) has a missable-window chart, a last-chance warning before the final heist, and a "BEFORE FINALE" save plan. 9–14 at-risk trophies are listed.
- **5-stage roadmap**: each stage cites its sources and carries save advice.
- **100% Ledger**: every category that counts toward Leonida Legend (100%), with a per-trophy "100% link".
- **Spoiler shield ON by default**: hidden trophies stay hidden until you reveal them, one by one.
- **Deep links, shareable progress, sort & grade filter**: every trophy has a `#trophy-N` link; copy a share link with your progress.
- **Tests included**: `tests/` has a Playwright suite (check + screenshots) that verifies the guide renders; the grader runs it.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Or run the entrypoint (what the grader runs):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
# writes out/app/, out/screenshots/ and out/dossier.json
```

Run the tests:

```sh
node tests/check.mjs
# serves app/, loads it in Chromium, asserts 55 trophy rows, the audit strip, no console errors
```

## Files

- `main.ts` — entrypoint: copies `app/` + `screenshots/` to `/output`, builds `dossier.json`, exits 0.
- `app/` — the offline web app (`index.html`, `styles.css`, `app.js`, `data/`).
- `app/data/trophies.json` — 55 trophies + 40 disputes.
- `app/data/sources.json` — 46 sources.
- `app/data/meta.json` — 5-stage roadmap, watch rail, missable window, 100% ledger, blocked sites.
- `tests/` — Playwright checks (`check.mjs`) and screenshot capture (`shots.mjs`). The grader runs these.
- `screenshots/` — 4 captures (1280×800) of the running app.
- `checks.mjs` — dev-time audit (not run by `main.ts`).
- `vendor/makefun-frontend.ts` — the kit's dossier library, unchanged.
