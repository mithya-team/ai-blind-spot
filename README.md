# The AI Blind Spot: roundtable games

Three short phone games for "The AI Blind Spot: Your AI Is Only as Smart as the Information It Can Access", an executive roundtable hosted by OpenText with AWS and Capgemini. Players sign in with first name and company, play each game (one practice round, then three ranked attempts), and compete on a leaderboard.

**Live site:** https://mithya-team.github.io/ai-blind-spot/

## The games

| Game | File | Idea |
|---|---|---|
| Golden Thread | `golden-thread.html` | Drag one line through scattered content fragments; avoid blind spots. Longer threads score more. |
| Deep Dive | `deep-dive.html` | Steer a light down through six layers of the business; collect documents, dodge legacy walls. |
| Clear Cut | `clear-cut.html` | Swipe to shatter barrier panes; tap gold governance seals, never cut them. |

## Pages

- `index.html`: intro and sign-in (name and company, or pick yourself if you've played before).
- `games.html`: the three games and your progress.
- `leaderboard.html`: Overall plus one tab per game. Add `?screen` for the room display (large type, rotates through the tabs).
- `play.html`: on wide screens a game runs here inside a phone-shaped frame, so desktop players get the same playfield as phones.

## How it's built

Plain HTML, CSS and JavaScript. No build step and no dependencies apart from Google Fonts (Inter). Each game is a single file with its own canvas code. Everything shared is in `shared/`:

- `shared/common.js`: player identity, rounds and attempts, scoring records, the leaderboard and overall standings, the intro, tutorial and results cards, and sound.
- `shared/common.css`: styles for those cards.

When you change a file in `shared/`, bump the `?v=` number on its links in every HTML page so phones don't keep an old cached copy.

## Scores are stored on each device (to do)

Scores, players and the overall standings currently live in each browser's `localStorage` under `bs_db_v2`, so each phone only sees its own players. To make one leaderboard across everyone, replace the storage in `shared/common.js`:

- `db()` and `save()`: read and write the whole score store.
- `setPlayer()` and `players()`: the player list used by the "Played before? Pick your name" picker.

Everything else (`record`, `board`, `overall`, `standing`) works on top of those, so a hosted store (Supabase, Firebase or a small API) only needs to provide players and their rounds per game.

## Run locally

```bash
python3 -m http.server 8123
```

Then open http://localhost:8123.

Test options on game pages: `?auto` skips the cards and starts a round as "Tester", `?debug` exposes `window.__dbg`, `?t=20` shortens a round to 20 seconds (Golden Thread and Clear Cut), `?from=3000` starts Deep Dive at 3,000 m, `?tut` opens the tutorial, and `?nostage` skips the desktop frame.

## Brand assets

The OpenText, AWS and Capgemini marks in `shared/` and `shared/common.js` were taken from public sources (OpenText's partner brand guide, Simple Icons, Wikimedia Commons). Replace them with official files and get each sponsor's sign-off before the event. OpenText's guide says its "ot" icon should not be used apart from the wordmark.

The site is marked `noindex` so search engines don't list it.
