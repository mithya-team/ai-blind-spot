# The AI Blind Spot: roundtable games

Short phone games and a leaderboard for **"The AI Blind Spot: Your AI Is Only as Smart as the Information It Can Access"**. It's an executive roundtable hosted by OpenText with AWS and Capgemini, for 12 to 20 senior executives, with no slides, demos or pitches.

> **Status: five candidate games, three will ship.** The site currently carries five games so the internal team can vote. The event should show three. See [Choosing the final three](#choosing-the-final-three).

People play on their own phones whenever they have a few minutes. They sign in with first name and company, play each game (three attempts, best one counts), and compete on a per-game and an overall leaderboard. The leaderboard can also be shown on a screen in the room.

- **Live site:** https://mithya-team.github.io/ai-blind-spot/
- **Repository:** https://github.com/mithya-team/ai-blind-spot
- **Status:** working prototype. The games, sign-in, rounds, leaderboards, prizes, hosting and the shared leaderboard code are done. **The shared leaderboard is off until a Supabase project is connected**; see [Shared leaderboard](#shared-leaderboard), about 10 minutes of setup.

---

## Contents

1. [Quick start](#quick-start)
2. [What's in the box](#whats-in-the-box)
3. [How a player moves through it](#how-a-player-moves-through-it)
4. [The rules](#the-rules)
5. [The three games](#the-three-games)
6. [Code structure](#code-structure)
7. [Data model](#data-model)
8. [Shared leaderboard](#shared-leaderboard)
9. [Deployment and hosting](#deployment-and-hosting)
10. [Share images and icons](#share-images-and-icons)
11. [Testing](#testing)
12. [Design system](#design-system)
13. [Brand assets and sign-off](#brand-assets-and-sign-off)
14. [Privacy and data](#privacy-and-data)
15. [Event-day checklist](#event-day-checklist)
16. [Known limitations and open items](#known-limitations-and-open-items)
17. [Decisions already made](#decisions-already-made)

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
leaderboard.html    Overall + one tab per game, the prizes, a QR code; ?screen = the TV in the room
shared/config.js    Event settings: shared-leaderboard keys, prizes, QR address, "Not you?" switch
shared/common.js    Everything shared: players, rounds, scores, sync, the phone-only screen, cards, tutorial, sound, logos
shared/common.css   Styles for the shared cards (intro, tutorial, results)
shared/ot-icon.png  OpenText "ot" icon (from their partner brand guide)
icons/              Favicons and home-screen icon, made from the OpenText "ot" icon
og/                 Share images (1200 x 630), one per page, for link previews
tools/og/           Generator for the share images (see "Share images and icons")
icons/qr-play.svg   QR code to the live site, shown on computers and the TV
supabase/schema.sql Database setup for the shared leaderboard
shared/ot-word.png  OpenText wordmark in white (rendered from their partner brand guide)
README.md           This file
```

The AWS and Capgemini marks are inline SVG paths inside `shared/common.js` (`LOGOS` and `LOGOS_FULL`).

---

## How a player moves through it

1. **`index.html`**: title, one-line description ("about 90 seconds each"), full sponsor logos, a prize teaser built from `shared/config.js` that links to the leaderboard, and "Who's playing?".
   - New players type first name and company (both required).
   - Returning players pick themselves from "Played before? Pick your name". The list filters as they type a first name.
   - The "pick your name" list only shows people who signed in **on this device**. With a shared leaderboard, listing everyone would let a player pick someone else's name.
   - If this device already has a signed-in player, the page skips straight to `games.html`.
2. **`games.html`**: one card per game (tall columns on wide screens, one column on phones; with more than three games, all of them sit side by side from 1280 px and wrap three to a row below that). Each card shows progress (three dots, one per attempt), the best score and the next action, for example "Play attempt 2 of 3". The header has "Playing as …", "Not you?" (which signs out) and the leaderboard link.
3. **A game page.** The shared shell (in `common.js`) shows:
   1. **Intro card:** what the game means in terms of the roundtable's theme, round progress and the sound switch.
   2. **Tutorial:** 4 or 5 animated steps, shown the first time only and replayable from "How to play". The last button reads "Play attempt 1 of 3".
   3. **The round.**
   4. **Results card:** score, a one-line takeaway built from the round's stats, four stat tiles, round progress, the next button and the top 5.
4. **`leaderboard.html`**: one table for everyone, no tabs and no "you" highlighting (it's a public display).
   - **Columns:** rank, player, one column per game, total. Each game cell shows the player's **points out of 1,000** (these add up to the total) and their **best score** underneath. The top player in each game gets a crown and a tinted cell.
   - **Ranking by one game:** tap a game's column heading (on phones, the chips above the list) to rank by that game; each row then shows that game's themed stats. Tap Total to go back.
   - **Prizes** sit on the right on wide screens, above the list on phones, each showing who holds that place now. Wide screens also show a "Scan to play" QR code.
   - **Scaling:** below 1,100 px wide the rows are cards. From 1,100 px every size is in `--u` (1/1440 of the window width), so the page fills a laptop, a large monitor, a 4K screen or a TV the same way.
   - **`?screen`** is the TV: no controls, as many whole rows as fit, refreshes every 4 s.
   - **`?demo`** fills it with invented players (never saved), to show the page before anyone has played.
   - **"All games"** only appears for players on phones and tablets, never on a computer or the TV.
   - **Header:** logos, then "The AI Blind Spot · Leaderboard" on the same row, so the table starts level with the prizes.

**Phones and tablets only.** On a device without a touchscreen, the first page is always an intro with a "Scan to play" QR code and a link to the leaderboard, the leaderboard is always just the leaderboard, and the games pages are locked (`showGate()` in `common.js`). Detection is by touch (`any-pointer: coarse` or `maxTouchPoints > 1`), not width, so tablets in landscape and iPads (which report themselves as Macs) still play. **Team shortcut:** on the intro or the leaderboard, type the word **play** on the keyboard (nothing on screen hints at it). The browser is unlocked and goes to the games list, or to sign-in first if nobody is signed in on it. From the games you reach the leaderboard as usual; the intro and the leaderboard never show a way back to the games. Adding `?desktop` to an address also unlocks, and `?desktop=0` locks the browser again. `?auto`, `?tut` and `?debug` also skip the screen.

**The TV (`leaderboard.html?screen`).** The same table without controls, showing as many whole rows as fit, with the prizes and a large QR code on the right. With the shared leaderboard it refreshes every 4 s and shows a "Live" badge, or "Reconnecting" if the connection drops.

**Wide screens.** Games run full-window on any screen size (when allowed, see above): the canvas fills the browser and the game adapts to it. The intro, tutorial and results cards switch to a two-column layout when the window is at least 980 × 620 px (rules beside the title, the demo beside the explanation, the leaderboard beside the score). Each card's contents are grouped in `.ga` / `.gb` wrappers, which are `display: contents` on phones so the single-column order is unchanged. A desktop playfield is larger than a phone's, so desktop and phone scores aren't strictly comparable; at the event most people play on phones.

---

## The rules

| Rule | Detail |
|---|---|
| Identity | First name (max 24 chars) plus company (max 32). A player's key is `lower(name) + "\|" + lower(company)`. |
| Rounds per game | 3 attempts, all scored. After that the game is "Complete". There is no practice round: the tutorial teaches each game instead. |
| Which score counts | The best of the player's attempts. On a tie in a game, whoever got there first ranks higher. |
| Prizes | 1st, 2nd and 3rd on the **Overall** leaderboard, plus a prize for everyone who plays. Set in `shared/config.js`. |
| Overall leaderboard | Each game is worth up to 1,000 points: the top score in that game gets 1,000 and everyone else gets `round(1000 × score / top)`. The overall score is the sum, so up to 3,000 with three games. Ties are broken by number of games played, then by whoever set their scores earlier. Rows show "2 of 3 played" when someone skipped a game. Because it's relative, everyone's points in a game shift when that game's top score improves. |
| Layout | Every player gets a random layout. A fixed shared layout was considered and rejected. |
| Round length | Golden Thread, Clear Cut and Vital Signs: 75 s. Stack Up: 90 s. Deep Dive: until context runs out or you reach the bottom (about 2.5 min at most). |

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

**OpenText's story deck (November 2026, in the project folder, not committed)** adds:
- **The line, used verbatim:** "We Give Clients Trusted Context & Connected Data for AI Outcomes." It appears where it lands as the answer to what was just played: on the results card after a player's last attempt at a game, as the footer of the leaderboard (phones, computers and the TV), and on the computer "play on your phone" screen (`OT_LINE` in `shared/common.js`). It is deliberately not on the sign-in page: the event has a no-pitch rule and that is the first screen a customer reads. Don't paraphrase it.
- **Two facts** (`FACTS`): 88% of AI pilots never reach production (IDC), and 77% of executives say a fifth of their data or less is usable by AI. Both are on the computer intro. On results cards each game shows its own deck line under the player's takeaway (`deck` in `GAMES`); Deep Dive shows the 88% fact instead (`fact`). The deck gives no source for the 77% figure; confirm one before the event.
- **Trusted context vs connected data:** connected data tells an agent what is happening (Golden Thread); trusted context tells it whether it's safe to act (Clear Cut's seals). Vital Signs' oxygen is both.
- **The AI Ladder** (`LADDER`, `rung(played)`): climbed by playing, never by rank. Signing in is In-App AI and each game played is one more rung, so three games reach Agentic Enterprise. The games page shows the four rungs and what takes the player up one; leaderboard rows carry the title. (It was by rank quartile until 2026-11-23. That labelled a customer's company "In-App AI" on a public screen for losing a phone game, and gave a lone player with 0 points the top title.)
- **AI is a team sport:** Stack Up shows the hosts' logo tiles on the layers OpenText's deck gives them: AWS on Infrastructure, OpenText on Context & Connected Data, Capgemini on Orchestration (`TILE_SRC`).
- **The ecosystem slide's partner logos** are not used and not in this repo (removed 2026-11-23; they are other companies' marks from an internal deck). The client chose to keep only the three hosts' logos in Stack Up. Never put a partner's logo on an obstacle.
- **One idea per game** (`idea`, `caption`, `deck` in `GAMES`): Stack Up is the AI stack, Vital Signs is context as oxygen, Golden Thread is connected data ("tells an agent what is happening"), Deep Dive is content out of reach, Clear Cut is trusted context ("tells an agent whether it's safe to act"). The idea is the eyebrow on the game's card, the caption is on screen all through play, and the deck line sits under the takeaway on the results card.
- **"Your agent"** is the thing that acts (the diver in Deep Dive, what the thread and the seals serve); "your AI" is the whole stack or body.
- **Prize name:** "OpenText Aviator socks" (Aviator is OpenText's AI brand).

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
- **Every frame explains itself (2026-11-23).** The games are also watched over a shoulder, photographed and screenshotted, so nothing relies on the player having read the tutorial:
  - The shell keeps a strip at the bottom of the screen all through play: the game's `caption`, then the three host marks, "The AI Blind Spot", the game's name and the attempt. Games keep anything the player must touch above `BS.SAFE_BOTTOM`.
  - Objects carry their own short labels (walls, seals, body parts, fragments). Labels are part of the object, two or three words, and never float over the path the player is steering through.
  - **Pause:** the small button in the strip, or putting the phone down (page hidden), freezes the game behind a card with the game's name, its caption, the attempt and the score so far. Each game's frame loop skips `update` while `BS.paused` is true, and passes `score: () => …` to `BS.init` for the card.
  - The results card carries the hosts, the event, the game and the player's name, so a screenshot of it stands alone.
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
sed -i '' -E 's#shared/common\.(js|css)(\?v=[0-9]+)?"#shared/common.\1?v=23"#g' *.html   # current is v=22; macOS sed, drop '' on Linux
```

### Adding or changing a game
1. Add an entry to `GAMES` in `common.js`: title, href, idea, caption, deck (or fact), blurb, meaning rows, stats and line.
2. Create the page with `BS.init(...)` and call `BS.finish(...)` with the stats keys you declared.
3. Add a card to `games.html`, and a tab look to `leaderboard.html` (`LOOK`).

---

## Data model

Every page reads one shape, whichever mode it's in:

```json
{
  "players": {
    "priya|capgemini": {
      "name": "Priya",
      "company": "Capgemini",
      "games": {
        "golden-thread": {
          "runs": [
            { "id": "6f1c…", "score": 1640, "stats": { "connected": 41, "longest": 9, "pictures": 2, "lost": 1 }, "at": 1794550100000 }
          ]
        }
      }
    }
  }
}
```

`runs` holds at most 3 entries. Leaderboards are computed from this in the browser (`board()`, `overall()`).

`localStorage` keys:

| Key | Contents |
|---|---|
| `bs_player` | `{ name, company }` of who is signed in on this device |
| `bs_known_v1` | Everyone who has signed in on this device (for "pick your name") |
| `bs_db_v2` | **Local mode** (no Supabase configured): every player and round played on this device |
| `bs_shared_v1` | **Shared mode**: the last copy of the shared leaderboard |
| `bs_queue_v1` | **Shared mode**: rounds played here that the server hasn't confirmed yet |
| `bs_sound`, `bs_tut_<game>`, `bs_desktop` | Sound on/off, tutorial seen, "play on a computer anyway" |

---

## Shared leaderboard

Built in, and off until `shared/config.js` names a Supabase project. Without it, each device keeps its own scores (the prototype). With it, every phone, tablet and the TV read and write one leaderboard.

### Switching it on (about 10 minutes)
1. Create a free project at [supabase.com](https://supabase.com) under the Mithya Labs account. Pick a region near the event (EU for London, for example).
2. **SQL Editor → New query**, paste all of [`supabase/schema.sql`](supabase/schema.sql), **Run**. It creates two tables (`players`, `rounds`), a trigger that refuses a fourth round per player per game, and row-level security that lets the browser read and add, nothing else.
3. **Project Settings → API**: copy the **Project URL** and the **anon / publishable** key into `supabaseUrl` and `supabaseKey` in `shared/config.js`. The anon key is designed to be public; never use the `service_role` key.
4. Bump the cache version (see [Cache-busting](#cache-busting)), commit and push. Pages redeploys in about a minute.
5. Check: play a round on two phones; both should appear on the leaderboard, with a green "Live" badge.

### How it works (`sync` in `shared/common.js`, no SDK, plain REST)
- **Playing a round:** `record()` adds it to `bs_queue_v1` with a random `client_id`, then `sync.run()` sends it. Because the server ignores a repeated `client_id`, a retry after a dropped connection can't count twice.
- **Reading:** `sync.pull()` fetches all players and rounds (a few hundred rows at most) into `bs_shared_v1`. `db()` merges that copy with anything still queued, so the player sees their own round immediately even offline.
- **When:** on every page load, when the phone comes back online or back to the foreground, after every round, every 8 s on the leaderboard and every 4 s on the TV. Pages redraw on the `bs:sync` event.
- **Rules on the server:** the three-round limit is enforced by the trigger, so nobody can add a fourth from another phone. A round the server refuses is dropped from the queue.
- **Attempts follow the name, not the phone:** signing in with the same name and company on a second phone continues the same three attempts.

### Admin
In the Supabase SQL Editor:
- Clear all test data before the event: `truncate rounds, players;`
- Remove one player: `delete from players where key = 'priya|capgemini';` (their rounds go too)
- Export: **Table Editor → rounds → Export to CSV**, or `select * from rounds order by created_at;`

### Fairness
- **Ties** go to whoever set the score first (server time).
- **"Not you?"** lets a phone switch names, which also means a fresh three attempts under a new name. On event day set `allowSwitchPlayer: false` in `shared/config.js` to hide it, and have the host confirm winners in person.
- **Fake scores:** anyone who reads the code could post a round directly with the anon key. For a 20-person roundtable a host check of the top three is enough; if more is ever needed, move the insert behind a Supabase Edge Function that checks plausibility.

### Testing it without Supabase
Any server that speaks PostgREST's `GET /rest/v1/players`, `GET /rest/v1/rounds` and `POST …?on_conflict=` with `Prefer: resolution=ignore-duplicates` works. During development a ~100-line Python mock with the same rules (three rounds, unique `client_id`) was used to test two phones, the offline queue and the server's refusal of a fourth round.

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

## Share images and icons

Every page has a description, favicon tags and Open Graph / Twitter tags, so a link pasted into WhatsApp, Slack, LinkedIn or iMessage shows a preview card.

- **Images:** `og/<page>.png`, 1200 x 630. Each game's image is real gameplay beside the title; the first page and games page are the real pages with the sign-in and personal details hidden; the leaderboard has a podium in the game colours.
- **Tags:** `og:image` uses the full `https://mithya-team.github.io/ai-blind-spot/og/…` address (preview crawlers need absolute URLs). **If the site moves to a custom domain, update those addresses in every page** (search for `mithya-team.github.io`).
- **Icons:** `icons/favicon.ico` (16/32/48), `icons/favicon-32.png`, `icons/icon-192.png` and `icons/apple-touch-icon.png` (180, square, for iPhone home screens), all from the OpenText "ot" icon. See the brand caveat below.
- **Regenerating:** after the vote, or after any visual change, run the generator so the images match:

  ```bash
  python3 -m http.server 8791 --bind 127.0.0.1    # repo root, separate terminal
  python3 tools/og/make.py                         # rewrites og/*.png
  ```

  It needs Python with Pillow, Node 20+, and Playwright's headless Chrome (`npx playwright install chromium-headless-shell`, or set `CHROME=` to a Chrome binary). Remove dropped games from `GAMES` in `tools/og/make.py` first, and delete their `og/*.png`.
- **Caching:** WhatsApp, LinkedIn and Slack cache previews for days. After changing an image, give it a new file name (or add `?v=2` to the `og:image` URL) so the new one is picked up. LinkedIn's Post Inspector can force a refresh.

## Testing

### URL options
| Option | Where | What it does |
|---|---|---|
| `?auto` | game pages | Skips the cards and starts a round straight away, signing in as "Tester · Test Co" if nobody is signed in |
| `?debug` | game pages | Exposes `window.__dbg` (game state, `step(n)` to advance frames manually) |
| `?t=20` | Golden Thread, Clear Cut | Round length in seconds |
| `?from=3000` | Deep Dive | Start depth in metres (0 to 6,100) |
| `?tut` | game pages | Opens the tutorial directly |
| `?screen` | leaderboard | The TV layout: no controls, rows fitted to the screen |
| `?demo` | leaderboard | Fills it with invented players (not saved) |
| `#deep-dive` etc. | leaderboard | Ranks by that game |
| `?desktop` | any page | Play on a computer anyway (remembered; `?desktop=0` undoes it). Or type **play** on the "Play on your phone" screen |

### Resetting a device
In the browser console: `localStorage.clear()`. Or use "Not you?" to sign out. With the shared leaderboard on, scores live on the server: clear them there (see [Admin](#admin)).

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
| OpenText | "ot" tile (most pages) and icon plus wordmark (first page) | Taken and rendered from OpenText's partner brand guide (Aug 2025) | The guide says the "ot" icon should **not** be used separately from the wordmark. Ask OpenText whether the tile-only use is acceptable, or switch to the full logo everywhere. The **favicon and home-screen icon** are the same icon on its own, so include them in the question. |
| AWS | Smile logo, as a tile and full | Simple Icons (SVG) | Use AWS's official co-marketing files if available. |
| Capgemini | Spade tile and full wordmark | Wikimedia Commons (SVG) | Use Capgemini's official files if available. |

- **Inter as OpenText's typeface:** the client believes Inter is OpenText's brand typeface; confirm with their brand team.
- **Public visibility:** the event name and logos are publicly viewable in this repository and on the live site.

---

## Privacy and data

- **What's collected:** first name and company. No email. The sign-in screen says these appear on the event leaderboard.
- **Where it's stored:** each player's own browser, and once the shared leaderboard is connected, the Supabase project. The leaderboard is public to anyone with the link, as the sign-in screen says.
- **Shared store:** names and companies sit on Supabase's servers. Keep the project in a suitable region and **delete the data after the event** (`truncate rounds, players;`).
- **No tracking:** no analytics, no cookies and no third-party scripts apart from Google Fonts (and calls to your own Supabase project). Self-host Inter if even that isn't wanted.

---

## Event-day checklist

- [ ] Shared leaderboard connected (`shared/config.js`) and tested from several phones at once; the TV shows "Live".
- [ ] Prizes and photos final in `shared/config.js`.
- [ ] `allowSwitchPlayer: false` in `shared/config.js`, so phones can't switch names for extra attempts.
- [ ] Official logos in place and sponsor sign-offs received.
- [ ] All test players and scores cleared (`truncate rounds, players;`).
- [ ] Tried on at least one iPhone and one Android, on the venue Wi-Fi if possible.
- [ ] The TV and computer screens already show a QR code; print `icons/qr-play.svg` for tables or cards too.
- [ ] TV showing `leaderboard.html?screen` in a full-screen browser, with the screen kept awake.
- [ ] Host confirms the top three in person before handing out prizes.
- [ ] Someone briefed to help people sign in, and to remind them that only their best of three attempts counts.
- [ ] Export the results after the event, then delete the data.

---

## Known limitations and open items

- **Shared leaderboard not connected yet:** the code is in; it needs a Supabase project (see [Shared leaderboard](#shared-leaderboard)).
- **Prize photos:** `prizes/*.png` are product cutouts (transparent background) made from each brand's own product images: Ray-Ban Meta Wayfarer Gen 2 (ray-ban.com), TUMI Alpha Bravo Packable Backpack in Chalk (TUMI Hong Kong; the Thailand link had expired), WHOOP band, and LARQ bottle in navy (both supplied by the client, 2026-11-19). The socks still show a drawn icon. Set them with `img` in `shared/config.js`; two paths show an either/or prize side by side.
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
- **Devices:** games are for phones and tablets only; computers get a "Play on your phone" screen with a QR code. The leaderboard works everywhere and has a TV layout (client decision, 2026-11-19).
- **Prizes:** shown on the leaderboard on phone, desktop and TV, for 1st, 2nd and 3rd Overall plus everyone who plays. The client has cleared the prizes with their team.
- **Fairness:** ties go to whoever scored first; a host confirms winners; "Not you?" can be hidden on event day.
- **Sign-in:**
  - Name and company are asked once, on the first page. Returning players pick themselves from a list of names used on that device.
  - No email, because it would feel like lead capture at a no-pitch event.
- **Pages:** the first page is intro and sign-in only. The games list is a separate page.
- **Explainers:** each game explains how its mechanics map to the roundtable's theme, and the results and leaderboard show themed stats (on the leaderboard, when ranked by a game).
- **Game order** everywhere: Stack Up, Vital Signs, Golden Thread, Deep Dive, Clear Cut (client, 2026-11-20). It follows the order of `GAMES` in `shared/common.js`.
- **Leaderboard:** one table, no tabs, no "you" line or highlight, since it's shown publicly; scales with the screen up to 4K and TV.
- **Typography and colour:** Inter everywhere; games differ by colour only. The Clear Cut card is dark on the games list so it doesn't outshine the other two.
- **Sound:** off by default.
- **Desktop (for testing with `?desktop`):** games run full screen, with no phone-shaped frame. The intro, tutorial and results cards use a two-column layout on wide windows. (A phone frame was tried and dropped.)
