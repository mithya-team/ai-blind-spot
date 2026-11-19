# The AI Blind Spot: roundtable games

Short phone games and a leaderboard for **"The AI Blind Spot: Your AI Is Only as Smart as the Information It Can Access"**. It's an executive roundtable hosted by OpenText with AWS and Capgemini, for 12 to 20 senior executives, with no slides, demos or pitches.

> **Status: five candidate games, three will ship.** The site currently carries five games so the internal team can vote. The event should show three. See [Choosing the final three](#choosing-the-final-three).

People play on their own phones whenever they have a few minutes. They sign in with first name and company, play each game (three attempts, best one counts), and compete on a per-game and an overall leaderboard. The leaderboard can also be shown on a screen in the room.

- **Live site:** https://mithya-team.github.io/ai-blind-spot/
- **Repository:** https://github.com/mithya-team/ai-blind-spot
- **Status:** working prototype. The games, sign-in, rounds, leaderboards, desktop layout and hosting are done. **The leaderboard is not shared between devices yet**; see [Making the leaderboard shared](#making-the-leaderboard-shared), which is the main piece of work left.

---

## Contents

1. [Quick start](#quick-start)
2. [What's in the box](#whats-in-the-box)
3. [How a player moves through it](#how-a-player-moves-through-it)
4. [The rules](#the-rules)
5. [The three games](#the-three-games)
6. [Code structure](#code-structure)
7. [Data model](#data-model)
8. [Making the leaderboard shared](#making-the-leaderboard-shared)
9. [Deployment and hosting](#deployment-and-hosting)
10. [Testing](#testing)
11. [Design system](#design-system)
12. [Brand assets and sign-off](#brand-assets-and-sign-off)
13. [Privacy and data](#privacy-and-data)
14. [Event-day checklist](#event-day-checklist)
15. [Known limitations and open items](#known-limitations-and-open-items)
16. [Decisions already made](#decisions-already-made)

---

## Quick start

No build step, no package manager, no dependencies apart from Google Fonts (Inter). Any static file server works.

```bash
git clone https://github.com/mithya-team/ai-blind-spot.git
cd ai-blind-spot
python3 -m http.server 8123
```

Open http://localhost:8123. To try it on a phone on the same Wi-Fi, open `http://<your-computer's-LAN-IP>:8123`. Some office networks block device-to-device traffic, so if that fails, push to a branch and use the live site.

Serve the folder over HTTP rather than opening the files from disk (`file://`), so saved progress and fonts behave as they will when hosted.

---

## What's in the box

```
index.html          First page: intro, co-brand logos, sign-in ("Who's playing?")
games.html          The games, your progress in each, your overall standing
golden-thread.html  Game: Golden Thread
deep-dive.html      Game: Deep Dive
clear-cut.html      Game: Clear Cut
stack-up.html       Game: Stack Up     (candidate, added for the vote)
vital-signs.html    Game: Vital Signs  (candidate, added for the vote)
leaderboard.html    Overall + one tab per game; ?screen = room display
shared/common.js    Everything shared: players, rounds, scores, leaderboards, cards, tutorial, sound, logos
shared/common.css   Styles for the shared cards (intro, tutorial, results)
shared/ot-icon.png  OpenText "ot" icon (from their partner brand guide)
shared/ot-word.png  OpenText wordmark in white (rendered from their partner brand guide)
README.md           This file
```

The AWS and Capgemini marks are inline SVG paths inside `shared/common.js` (`LOGOS` and `LOGOS_FULL`).

---

## How a player moves through it

1. **`index.html`**: title, one-line description, full sponsor logos, and "Who's playing?".
   - New players type first name and company (both required).
   - Returning players pick themselves from "Played before? Pick your name". The list filters as they type a first name.
   - If this device already has a signed-in player, the page skips straight to `games.html`.
2. **`games.html`**: one card per game (tall columns on wide screens, one column on phones; with more than three games, all of them sit side by side from 1280 px and wrap three to a row below that). Each card shows progress (three dots, one per attempt), the best score and the next action, for example "Play attempt 2 of 3". The header has "Playing as …", "Not you?" (which signs out) and the leaderboard link.
3. **A game page.** The shared shell (in `common.js`) shows:
   1. **Intro card:** what the game means in terms of the roundtable's theme, round progress and the sound switch.
   2. **Tutorial:** 4 or 5 animated steps, shown the first time only and replayable from "How to play". The last button reads "Play attempt 1 of 3".
   3. **The round.**
   4. **Results card:** score, a one-line takeaway built from the round's stats, four stat tiles, round progress, the next button and the top 5.
4. **`leaderboard.html`**: Overall plus one tab per game, with each row showing the game's themed stats.

**Wide screens.** Every game runs full-window on any screen size: the canvas fills the browser and the game adapts to it. The intro, tutorial and results cards switch to a two-column layout when the window is at least 980 × 620 px (rules beside the title, the demo beside the explanation, the leaderboard beside the score). Each card's contents are grouped in `.ga` / `.gb` wrappers, which are `display: contents` on phones so the single-column order is unchanged. A desktop playfield is larger than a phone's, so desktop and phone scores aren't strictly comparable; at the event most people play on phones.

---

## The rules

| Rule | Detail |
|---|---|
| Identity | First name (max 24 chars) plus company (max 32). A player's key is `lower(name) + "\|" + lower(company)`. |
| Rounds per game | 3 attempts, all scored. After that the game is "Complete". There is no practice round: the tutorial teaches each game instead. |
| Which score counts | The best of the player's attempts. |
| Overall leaderboard | Each game is worth up to 1,000 points: the top score in that game gets 1,000 and everyone else gets `round(1000 × score / top)`. The overall score is the sum, so up to 3,000. Ties are broken by number of games played. Rows show "2 of 3 played" when someone skipped a game. Because it's relative, everyone's points in a game shift when that game's top score improves. |
| Layout | Every player gets a random layout. A fixed shared layout was considered and rejected. |
| Round length | Golden Thread and Clear Cut: 75 s. Deep Dive: until your light runs out or you reach the bottom (about 2.5 min at most). |

These live in `shared/common.js`: `MAX_RUNS`, `nextMode()`, `standing()`, `record()`, `board()` and `overall()`.

---

## The three games

There are five while the team votes: the original three, plus Stack Up and Vital Signs.

### Where the themes come from
OpenText's current positioning (two slides shared by the client in November 2026) is the source for the wording in every game. Use these terms exactly:

- **The stack**, bottom to top: Infrastructure, Systems of Record, **Context & Connected Data** (OpenText's layer), Language Models, Orchestration, Application & Agents.
- **The body analogy**, in the same order: skeleton, vital organs, **oxygen**, brain, nervous system, muscles. "Context is the oxygen" is the headline idea, and "models and agents stall without context" is their line.
- **OpenText's claim:** governed, secure, unstructured content as the context layer.
- **Capgemini's angle** (their CEO's post on AI costs): oversight, rework and governance are the hidden cost of AI.

Each game carries one of these: Golden Thread is *connected data*, Deep Dive is *context as oxygen*, Clear Cut is *governed*, Stack Up is *the six layers*, Vital Signs is *the body*.

Every game is one HTML file, drawn on a `<canvas>`. They share the same contract with the shell:

```js
BS.init({ id, tagline, onStart(mode), tutorial: [{ title, text, demo(ctx, w, h, t) }] });
// ...when the round ends:
BS.finish({ score, headline, theme, stats: { ... }, win });
```

`BS.GAMES[id]` in `common.js` holds each game's title, card copy, the "what this means" rows, the stat tiles and the leaderboard stats line.

### Golden Thread (`golden-thread.html`, id `golden-thread`)
- **Play:** drag one finger through drifting fragments (contract, email, invoice, ticket, customer record) to link them into a thread, then lift to bank it. Dark "blind spots" drift in; touching one breaks the thread, which then scores nothing.
- **Score:** 10 × n² per banked thread of n fragments. A thread with all five kinds is a "full picture" and scores double.
- **Difficulty:** more fragments over time (11 to 16), and blind spots from 5 s, rising from 1 to about 4.
- **Stats:** `connected`, `longest`, `pictures`, `lost`.
- **Look:** engraved navy with gold.

### Deep Dive (`deep-dive.html`, id `deep-dive`)
- **Play:** slide to steer your AI as it sinks through six layers of the business: Cloud apps, Shared drives, Email archives, Legacy applications, Systems of record and Offline archives, from 0 to 6,200 m. Walls are legacy systems; glowing documents top up your **context**, the meter under the depth reading, described to players as the AI's oxygen. Context runs down over time and when you hit walls, and the glow around the AI dims with it. The game ends when context runs out ("Your AI ran out of context") or at the bottom ("All the way down"). In the code the meter is still the variable `light`.
- **Score:** depth descended in metres, plus 25 per document, plus a bonus for reaching the bottom (1,000 + 10 × remaining context).
- **Difficulty:** fall speed, gap width, wall density, context drain and darkness all increase with depth.
- **Stats:** `depth`, `layers`, `layerName`, `docs`, `hits`.
- **Internals:** the maths still runs on an internal "year" axis (2026 down to 1964) left over from its earlier version, "Back to 1964". That axis is never shown to players; depth = (2026 − internal year) × 100 m. The old name was dropped on purpose (see [Decisions](#decisions-already-made)).
- **Saved scores:** `common.js` moves any saved `back-to-1964` rounds to `deep-dive` on load.

### Clear Cut (`clear-cut.html`, id `clear-cut`)
- **Play:** frosted glass panes (barriers: SILO, LEGACY, HIDDEN, SCATTERED) rise. Swipe through them to shatter them and reveal the document behind. Gold governance seals must be tapped to approve them, never cut; cutting one is a breach, and you have 3 lives.
- **Score:**
  - +10 per pane.
  - A combo of n panes in one swipe adds 10 × n × (n − 1).
  - +25 per approved seal.
- **Difficulty:** more panes, and seals go from 20% to 32% of what spawns.
- **Stats:** `cleared`, `approved`, `combo`, `breaches`.

### Stack Up (`stack-up.html`, id `stack-up`) — candidate
- **Play:** a layer of the AI stack slides across the screen; tap (or click, or press space) to drop it. Whatever overhangs the layer below is cut away, so each layer can only be as wide as the one beneath it. You build the six layers from Infrastructure up to Application & Agents, then start a new, faster stack. Missing a layer completely collapses the stack. Three collapses or 90 seconds end the round.
- **The message is the rule:** the blue Context & Connected Data layer limits everything above it. Dashed guides rise from its edges once it lands.
- **Body analogy:** each slab carries its body part (on wide screens the parts sit beside the stack as callouts).
- **Score:** per layer, 100 × its width as a share of the base. A perfect drop (within 3.5% of the base width) adds 25, 50, 75 then 100 for consecutive perfects. Finishing a stack adds 500 × the top layer's width. Everything is multiplied by 1 + 0.2 × the number of stacks already finished, and rounded to 5.
- **Difficulty:** slide speed rises with each finished stack (1.05 base widths per second, +0.12 per stack, capped after nine).
- **Stats:** `stacks`, `context` (average width of the context layer, %), `perfect`, `collapses`.
- **Internals:** slabs are stored in "stack units" (`u` = left edge from the centre line, `ww` = width, both as a fraction of the base width), so a round survives a window resize. Behind the intro card the game plays itself.
- **Look:** dark emerald, with the context layer in OpenText blue.

### Vital Signs (`vital-signs.html`, id `vital-signs`) — candidate
- **Play:** a figure of light stands for the AI. Its brain is the models, its nervous system is orchestration, its muscles are the agents. Each has a ring that runs down as it works. Blue bubbles are governed context (oxygen): drag one onto a part to refill it. Grey bubbles are raw, unstructured content: tap one to govern it, and it turns blue. Feed a part raw content and it chokes (it loses oxygen). A part whose ring empties stalls. Three stalls or 75 seconds end the round.
- **Score:** 20 per delivery (30 if the part was under 25%), 5 per bubble governed, and 2 per working part every second. Deliveries and the per-second score are multiplied by a "steady" multiplier that rises by 1 for every 6 seconds without a stall or choke, up to ×5.
- **Difficulty:** parts use oxygen faster as the round goes on (3.2% to 6.2% per second, with short surges at about double), bubbles arrive faster, and more of them are raw (30% to 50%).
- **Stats:** `oxygen` (average level, %), `fed`, `governed`, `stalls`.
- **Extras:** the heartbeat trace under the score reflects the average oxygen level and flattens when a part stalls. On wide screens a legend lists all six body parts against the six stack layers.
- **Look:** deep plum with rose; the figure is abstract on purpose, so it doesn't look medical.

### Choosing the final three
The event should show three games (12 to 20 executives, each game has four rounds). After the vote, remove each dropped game in four places:
1. Its entry in `GAMES` in `shared/common.js` (this also removes it from the Overall score).
2. Its card in `games.html`.
3. Its entry in `LOOK` in `leaderboard.html`.
4. Its HTML file.

Then clear test data (see [Resetting a device](#resetting-a-device)). Deep Dive and Vital Signs both use the oxygen idea, so keeping both would repeat it; the suggestion to the client was to keep one of them.

### Shared game behaviour
- **Performance:**
  - Device pixel ratio is capped at 2, and the frame time step at 0.05 s.
  - Glows and sprites are pre-rendered to offscreen canvases, with no per-frame `shadowBlur` and no `ctx.filter`.
  - Particles are capped at about 150.
  - Golden Thread also drops some ambient effects if frames run slow.
- **Reduced motion:** `prefers-reduced-motion` tones down shake, flashes and transitions.
- **Sound:** synthesised with Web Audio, off by default, with a switch on each intro card. The setting is remembered.
- **Haptics:** `navigator.vibrate` where supported; iPhones don't support it.

---

## Code structure

### `shared/common.js` exposes `window.BS`
| Area | Members |
|---|---|
| Helpers | `params`, `fmt`, `esc`, `pl`, `ease`, `rr`, `fit(canvas)`, `vibrate` |
| Registry | `GAMES`, `MAX_RUNS`, `LOGOS` (square tiles), `LOGOS_FULL` (full logos) |
| Player | `player()`, `hasPlayer()`, `setPlayer(name, company)`, `players()`, `clearPlayer()` |
| Rounds | `progress(id)`, `nextMode(id)` (`'ranked' \| 'done'`), `standing(id)`, `best(id)`, `record(id, mode, score, stats)` |
| Leaderboards | `board(id)`, `overall()` |
| Game shell | `init(cfg)`, `finish(result)`, `tutorial()`, `begin()`, `pips()`, `modeLabel()`, `drawHand()` |
| Sound | `soundOn()`, `setSound(on)`, `sfx(name, opt)` |

All of it runs synchronously against a local store through two private functions, `db()` and `save()`. That's the seam for a hosted store.

### Cache-busting
Every page links `shared/common.js?v=N` and `shared/common.css?v=N`. **When you change anything in `shared/`, bump `N` in every HTML file**, or phones keep the old copy:

```bash
sed -i '' -E 's#shared/common\.(js|css)(\?v=[0-9]+)?"#shared/common.\1?v=16"#g' *.html   # current is v=15; macOS sed, drop '' on Linux
```

### Adding or changing a game
1. Add an entry to `GAMES` in `common.js`: title, href, blurb, meaning rows, stats and line.
2. Create the page with `BS.init(...)` and call `BS.finish(...)` with the stats keys you declared.
3. Add a card to `games.html`, and a tab look to `leaderboard.html` (`LOOK`).

---

## Data model

Stored today in each browser's `localStorage`:

| Key | Contents |
|---|---|
| `bs_db_v2` | All players and rounds on this device (below) |
| `bs_player` | `{ name, company }` of who is signed in on this device |
| `bs_sound` | `true` / `false` |
| `bs_tut_<game-id>` | `true` once that game's tutorial has been seen |

`bs_db_v2` shape:

```json
{
  "players": {
    "priya|capgemini": {
      "name": "Priya",
      "company": "Capgemini",
      "seen": 1794550000000,
      "games": {
        "golden-thread": {
          "runs": [
            { "score": 1640, "stats": { "connected": 41, "longest": 9, "pictures": 2, "lost": 1 }, "at": 1794550100000 }
          ]
        }
      }
    }
  }
}
```

`runs` holds at most 3 entries. Leaderboards are computed from this on the client.

---

## Making the leaderboard shared

**This is the main remaining task.** Today each phone only sees players and scores recorded on that phone. GitHub Pages only serves static files, so a shared leaderboard needs a small hosted store.

### Recommended: Supabase (free tier)
It works directly from a static site with a public "anon" key, has Postgres with row-level security, and has realtime updates for the room display. Firebase or a small API on AWS would work the same way; nothing below depends on Supabase specifically.

**1. Create a project** under a Mithya Labs account. Create the account yourselves; it isn't set up yet.

**2. Schema** (run in the SQL editor):

```sql
create table players (
  key        text primary key,              -- lower(name) || '|' || lower(company)
  name       text not null check (char_length(name) between 1 and 24),
  company    text not null check (char_length(company) between 1 and 32),
  created_at timestamptz not null default now(),
  last_seen  timestamptz not null default now()
);

create table rounds (
  id         bigint generated always as identity primary key,
  player_key text not null references players(key) on delete cascade,
  game       text not null check (game in ('golden-thread', 'deep-dive', 'clear-cut', 'stack-up', 'vital-signs')),  -- trim to the final three
  mode       text not null default 'ranked' check (mode = 'ranked'),
  score      integer not null check (score between 0 and 100000),
  stats      jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index on rounds (game, player_key);

-- Enforce the rules on the server: at most three rounds per player per game.
create or replace function max_three_ranked() returns trigger language plpgsql as $$
begin
  if new.mode = 'ranked' and (select count(*) from rounds
      where player_key = new.player_key and game = new.game and mode = 'ranked') >= 3 then
    raise exception 'All three attempts already played';
  end if;
  return new;
end $$;
create trigger rounds_max_three before insert on rounds for each row execute function max_three_ranked();

-- Public read and insert only. No updates or deletes from the client.
alter table players enable row level security;
alter table rounds  enable row level security;
create policy "read players"   on players for select using (true);
create policy "add players"    on players for insert with check (true);
create policy "touch players"  on players for update using (true) with check (true);  -- only for last_seen; tighten if needed
create policy "read rounds"    on rounds  for select using (true);
create policy "add rounds"     on rounds  for insert with check (true);
```

Tighten the score bounds per game once you've seen real scores, or move score validation into an RPC.

**3. Wire it into `shared/common.js`.** Keep the public `BS` API and the UI synchronous: treat `localStorage` as a cache that mirrors the server.

- **On page load**, before rendering: fetch `players` and `rounds` and rebuild the `bs_db_v2` shape above into the cache. One small query is fine for 20 people; for more, select only what each page needs.
- **`setPlayer()`**: upsert into `players` (and update `last_seen`), then update the cache.
- **`record()`**: insert into `rounds`, then update the cache. If the insert is rejected (for example a fourth attempt), keep the server's answer.
- **`players()`, `board()`, `overall()`**: unchanged; they read the cache.
- **`leaderboard.html?screen`**: subscribe to realtime inserts on `rounds`, or keep its existing 4-second refresh but re-fetch. `games.html` should re-fetch on focus.
- **Offline:** if a write fails, queue it in `localStorage` and retry, so a dropped connection doesn't lose a round.

The Supabase JS client loads from a CDN with a plain `<script>` tag, so the no-build setup can stay. The anon key is designed to be public; row-level security is what protects the data.

**4. Admin.** Add a simple way to:
- clear all test data before the event: `truncate rounds, players;`
- export results afterwards: CSV from the Supabase table view.

### Things the shared store changes
- **Returning on a new phone:** a player picks their name from the shared list and keeps their attempts. Today that only works on the same device.
- **Impersonation:** anyone can pick anyone's name from the list. Acceptable for a private event of 12 to 20 people; add a 4-digit PIN at sign-in if that's not enough.
- **Cheating:** scores are computed in the browser, so a determined person could post a fake score. The bounds and the attempt trigger limit the damage. Server-side replay validation isn't worth it for this event.

---

## Deployment and hosting

- **Today:** GitHub Pages from the `main` branch, repository root. Every push to `main` redeploys in about a minute. Pages settings: Settings → Pages.
- **Free plan:** the Mithya Labs organisation is on GitHub's free plan, so Pages requires the repository to be public. It is public.
- **Search engines:** every page has `<meta name="robots" content="noindex, nofollow">`, so people only find it through the link.
- **Custom domain (optional):** add a `CNAME` file containing the domain, point a DNS `CNAME` record at `mithya-team.github.io`, then enable HTTPS in Pages settings.
- **Moving hosts:** Netlify, Vercel, Cloudflare Pages, S3 + CloudFront or the client's own host all work unchanged: upload the folder as it is. Keep relative paths; everything is relative today.
- **Caching:** Pages sends short cache headers, and the `?v=N` links handle the shared files. Game pages themselves are not versioned; if someone sees an old game after a deploy, a reload fixes it.
- **Older copy:** there is also a private claude.ai artifact copy from early phone testing. It won't receive changes. Share the GitHub Pages link only.

---

## Testing

### URL options
| Option | Where | What it does |
|---|---|---|
| `?auto` | game pages | Skips the cards and starts a round straight away, signing in as "Tester · Test Co" if nobody is signed in |
| `?debug` | game pages | Exposes `window.__dbg` (game state, `step(n)` to advance frames manually) |
| `?t=20` | Golden Thread, Clear Cut | Round length in seconds |
| `?from=3000` | Deep Dive | Start depth in metres (0 to 6,100) |
| `?tut` | game pages | Opens the tutorial directly |
| `?screen` | leaderboard | Room-display layout, rotates through the tabs every 12 s |
| `#deep-dive` etc. | leaderboard | Opens that tab |

### Resetting a device
In the browser console: `localStorage.clear()`. Or use "Not you?" to sign out without deleting scores.

### What has and hasn't been tested
- **Tested:**
  - Headless Chrome at phone (375 × 812, 320 × 568, 430 × 932), tablet and desktop sizes.
  - Hosted versions in desktop Chrome.
  - The game logic, scoring, end screens, rounds, leaderboards and sign-in flows.
- **Not yet tested on real devices:**
  - **Frame rate** on mid-range and older phones, and with iPhone Low Power Mode (30 fps).
  - **iOS Safari rendering:** Clear Cut and Deep Dive use an off-canvas shadow trick for soft shadows. If Safari handles it differently they lose their shadows but still work.
  - **Touch feel and difficulty balance** with real players.
  - **Stack Up and Vital Signs** were built last and have only been played in headless Chrome with a simulated mouse. Vital Signs' drag-and-drop in particular needs trying with a real finger, and both games' difficulty is a first guess. Both use a little per-frame `shadowBlur` (the blue context slab; the oxygen bubbles), which the older three games avoid; check frame rate on older phones.
  - **Sound** on iOS: audio starts only after a tap, which the sound switch provides.
  - **Venue Wi-Fi.**

---

## Design system

- **Typeface:** Inter only, everywhere, including inside the games. Bold (700) for titles, Regular (400) for body, with 500 and 600 for small labels and buttons. The games are told apart **by colour only**, never by typeface (client decision).
- **Base:** night-sky navy `#070a13`, text `#eef1f8`, accent blue `#8fb0ff`.
- **Game colours:**

  | Game | Accent | Card background |
  |---|---|---|
  | Golden Thread | gold `#f1d48a` / `#f6dc98` | navy `#0a1535` |
  | Deep Dive | cyan `#9eeaff` | deep teal `#0d2a40` |
  | Clear Cut | lilac `#d9ccff` | deep plum `#211d47` (inside the game: light frosted glass) |
  | Stack Up | emerald `#7df0b8` / `#8ff0c0` | deep green `#0a2a22` (context layer: blue `#4a8dff`) |
  | Vital Signs | rose `#ff9db2` / `#ffa3b6` | deep wine `#2c1024` (oxygen: cyan `#9fe8ff`) |

- **Shared card theme:** each game sets CSS variables in its `:root` (`--bg --fg --accent --on-accent --card --line --chip --scrim --font-display --display-weight --demo-bg --bad`); `shared/common.css` styles the cards from them.
- **First page:** an animated eclipse. The "o" in "Blind Spot" and the large eclipse in the top right are the "blind spot"; small points of light (information) drift across and disappear behind it.

---

## Brand assets and sign-off

**Before the event, get each sponsor to sign off its logo use, and swap in official files:**

| Sponsor | Used | Source today | Note |
|---|---|---|---|
| OpenText | "ot" tile (most pages) and icon plus wordmark (first page) | Taken and rendered from OpenText's partner brand guide (Aug 2025) | The guide says the "ot" icon should **not** be used separately from the wordmark. Ask OpenText whether the tile-only use is acceptable, or switch to the full logo everywhere. |
| AWS | Smile logo, as a tile and full | Simple Icons (SVG) | Use AWS's official co-marketing files if available. |
| Capgemini | Spade tile and full wordmark | Wikimedia Commons (SVG) | Use Capgemini's official files if available. |

- **Inter as OpenText's typeface:** the client believes Inter is OpenText's brand typeface; confirm with their brand team.
- **Public visibility:** the event name and logos are publicly viewable in this repository and on the live site.

---

## Privacy and data

- **What's collected:** first name and company. No email. The sign-in screen says these appear on the event leaderboard.
- **Where it's stored today:** each player's own browser only.
- **With a shared store:** names and companies will sit on the store's servers. Keep the project in a suitable region and **delete the data after the event** (`truncate rounds, players;`).
- **No tracking:** no analytics, no cookies and no third-party scripts apart from Google Fonts. Self-host Inter if even that isn't wanted.

---

## Event-day checklist

- [ ] Shared leaderboard live and tested from several phones at once.
- [ ] Official logos in place and sponsor sign-offs received.
- [ ] All test players and scores cleared (`truncate rounds, players;`).
- [ ] Tried on at least one iPhone and one Android, on the venue Wi-Fi if possible.
- [ ] A QR code to the live URL printed for tables, cards or the screen.
- [ ] Room screen showing `leaderboard.html?screen`. Use a browser in full-screen mode, keep the screen awake, and sign it out of any player so no row is highlighted.
- [ ] Someone briefed to help people sign in, and to remind them that only their best of three attempts counts.
- [ ] Export the results after the event, then delete the data.

---

## Known limitations and open items

- **Leaderboard is per device:** see [Making the leaderboard shared](#making-the-leaderboard-shared).
- **Phones in landscape** get the plain full-window game, because the window is too short for the desktop frame. Portrait is the intended way to play.
- **Tablets** get the phone frame without the side panels until the window is about 1,040 px wide.
- **"Not you?"** signs the device out; other players' saved data on that device stays.
- **Deep Dive's internal axis** is still named in years (see above). It's harmless, but worth renaming if you touch that file.
- **The overall score is relative**, so points shift as the top scores change. The alternative, points by finishing position, was discussed and not chosen.
- **Branding** is not signed off (see above).

---

## Decisions already made

These were settled with the client. Please don't undo them without checking.

- **Games:** three games at the event, chosen by an internal vote from the five candidates above (the client's plan, November 2026).
- **Wording:** games use OpenText's own terms: context and connected data, the six stack layers, the body analogy with context as oxygen, governed unstructured content. Deep Dive's meter is "context", not "light".
- **Still true:** "Deep Dive" replaced "Back to 1964": the client felt no real company thinks about its information in decades, so the theme is **depth and layers**, never years or eras.
- **Rounds:** three attempts per game, best one counts, no practice round (changed 2026-11-19 to keep it simple; the tutorial teaches each game). Old saved data may hold a `practice` entry per game, which is ignored.
- **Layouts:** random layout per player.
- **Sign-in:**
  - Name and company are asked once, on the first page. Returning players pick themselves from a list.
  - No email, because it would feel like lead capture at a no-pitch event.
- **Pages:** the first page is intro and sign-in only. The games list is a separate page.
- **Explainers:** each game explains how its mechanics map to the roundtable's theme, and the results and leaderboard show themed stats.
- **Typography and colour:** Inter everywhere; games differ by colour only. The Clear Cut card is dark on the games list so it doesn't outshine the other two.
- **Sound:** off by default.
- **Desktop:** games run full screen on desktop, with no phone-shaped frame. The intro, tutorial and results cards use a two-column layout on wide windows. (A phone frame was tried and dropped.)
- **Leaderboard:** an Overall tab across all games is required. No big title or description under the tabs.
