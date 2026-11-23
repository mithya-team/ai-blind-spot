# OpenText story: interactive presentation

A redesign of OpenText's messaging deck ("The path to the Agentic Enterprise", Nov 2026) as one paged web presentation that serves two uses: a presenter leading it, and a link sent to people who go through it alone.

- **Open it:** `presentation/index.html` (one HTML file plus `assets/`, no build step). Inter loads from Google Fonts and falls back to system fonts offline.
- **Source material:** the deck itself and a transcript of its slides and speaker notes (`SOURCE-DIGEST.md`) are kept out of this public repo, like the other client source files. Ask the team for them.
- **Search engines:** the page carries a `noindex` tag, like the rest of the site. Anyone with the link can open it, including the speaker notes (`N`).

## One presentation, with or without the reading text

The scenes, steps and layouts are the same for both uses. The **Read / Present** switch at the top right only adds or removes the extra sentences.

| | Read (default) | Present |
|---|---|---|
| For | A link sent to someone | A presenter on a screen |
| Words | Headline plus a sentence or two taken from the speaker notes | Headline only |
| Open with | the plain URL | the switch, `P`, or `?present` in the URL |
| Controls | always visible | step aside after a few seconds without the pointer moving |

**Moving through it (either view):** `→` `←`, `Space`, a click or tap (the left fifth of the screen goes back), a swipe, a scroll (one gesture is one step), or the arrows at the bottom right. Nothing scrolls as a long page.

Other keys: `N` speaker notes, `G` all scenes, `F` full screen, `P` the switch, `Home` / `End` jump to the ends. `Esc` only closes the notes or the scene list; it never changes the view (the browser also uses it to leave full screen).

- **Notes in their own window:** open the notes (`N`) and choose "Open in a separate window". It follows the presentation, shows the next scene, a clock and a timer, and its arrow keys drive the presentation.
- **Deep links:** `#gap`, `#stack.5`, `#ladder.3` (scene, then step). The address keeps `?present` when presenting, so a copied link opens the same way.

## The story (15 scenes)

| # | Scene (`id`) | Steps | What happens |
|---|---|---|---|
| 1 | Opening (`open`) | 1 | Dawn over the ocean, the 3D "ot" whole on the water; leaving goes through the "o" |
| 2 | The gap (`gap`) | 2 | 88%, then 77%, told with a hundred glass beads |
| 3 | Three pillars (`pillars`) | 1 | Three glass pillars; each jumps to its chapter |
| 4 | Pillar 1 (`ch1`) | 1 | Chapter opener |
| 5 | What AI needs (`need`) | 2 | The question, then two glass rings that lock together; one pulse of light runs through both |
| 6 | The AI stack (`stack`) | 8 | Six layers as a body, the oxygen reveal, then the portfolio, then partners per layer |
| 7 | Who we are (`who`) | 3 | The statement, three numbers, clients in control and industries |
| 8 | Pillar 2 (`ch2`) | 1 | Chapter opener |
| 9 | The AI Ladder (`ladder`) | 5 | Overview, then four rungs with "live today" and "future vision"; a ball hops from rung to rung |
| 10 | Client Zero (`zero`) | 4 | The claim, $1.5B, Global Command Centre, 60+ |
| 11 | Pillar 3 (`ch3`) | 1 | Chapter opener |
| 12 | AI is a team sport (`team`) | 2 | Rowing photo with the four names painted on the blades, then "One shared win" |
| 13 | How we partner (`partner`) | 4 | One approach, then the three moves |
| 14 | Every day (`everyday`) | 1 | Four moments in your day; the sun crosses once and each card wakes as it passes |
| 15 | Close (`close`) | 1 | The closing line word for word |

Things people can touch: the partner logos (pick one per layer), the ladder rungs, the pillars and the everyday cards (tap one to single it out). The portfolio tiles carry each area's line inside the tile in the Read view and show names only in the Present view; nothing is revealed on hover.

## Changes from the deck's order

- The 88% / 77% slide comes straight after the opening, before the three pillars.
- "Who we are" moves from slide 3 to the end of Pillar 1, after the stack, portfolio and ecosystem.
- The ecosystem slide appears once (in Pillar 1, on the stack). The deck repeats it in Pillar 3 with no notes.
- The five ladder slides are one scene with five steps.

## Where things live in `index.html`

- **Scenes:** one `<section class="scene">` each, in story order. `data-steps` is the number of steps after the first. Children with `data-at="n"` appear from step n on; `data-only="n"` (or `"a-b"`) only at those steps.
- **Reading text:** elements with class `say` or `ro` are hidden when the switch is on Present (`body[data-text=off]`).
- **Speaker notes:** the `NOTES` object at the top of the script, word for word from the deck. A leading `n|` ties a line to step n. `[LOCALIZE ...]` cues live here only and never appear on screen.
- **Numbers that count up:** `<span class="n" data-to="88">`.
- **Sizing:** `1rem` is 1% of a 16:9 stage, so everything scales from a laptop to 4K. Upright screens use the block under `@media (max-aspect-ratio:4/5)`.
- **Any screen shape:** backgrounds always fill the screen. The rowing photo is sized so the band holding all four oar blades always fits the width; where that leaves it shorter than the screen it fades into white.
- **Oar labels:** each name sits on its blade at the blade's own angle (`--x`, `--y`, `--a`, `--f` on each `.oar`), sized from the photo. On upright phones they are set slightly larger and heavier, since the blades are small there (about 9 to 11 px on a 375 px wide phone).
- **Ladder ball:** `hop()` in the script. The ball's arc, bounces, squash and the dip of the rung are all worked out from the time since the hop began.

## Artwork

- `assets/ot-3d.webp`: OpenText's own 3D "ot", cut out of the deck's title image. The outline is the official logo vector fitted to the photo. Done locally; the image was not sent to any service.
- `assets/plate-ocean.webp`: the same title image with the "ot" removed, used as the backdrop.
- `assets/logo.svg`, `assets/logo-white.svg`: the official logo vector from the deck file.
- `assets/team-rowing.webp`: the deck's rowing photo, enlarged from 960 px to 1920 px (it is soft on a very large screen).
- The glass slabs (AI stack and ladder) are drawn in code, not images: rounded corners, a lit edge, and real translucency, so layers behind show through. Their look is set by the `.slab` rules and the colour sets next to them.
- The glass rings ("What AI needs", Client Zero) are drawn in code too: `ringArt()` in the script stacks strokes into a rounded tube, clear until lit. The pair is woven (the left ring passes over at the top and under at the bottom) by a second copy of the left ring shown only at the top crossing (`.xtop`). The chapter openers' arcs use the same idea.
- The light wave background, the ocean photo and the sky-and-city photo are the deck's own images. Partner and client logos are the deck's files with empty margins trimmed, used only where the deck uses them.

## To confirm with OpenText

- The 3D "ot" is used on its own as hero art, as their deck does. Brand Central says the icon should not be used apart from the logo, so this needs their sign-off.
- Reading-mode sentences are edited from the speaker notes and become public-facing text.
- The order changes listed above.
- "Experience" is a portfolio tile with no description anywhere in the deck. "Developer Tools" uses a line shortened from the notes.
- "Source: IDC" is shown under 88% (from the notes); 77% has no named source in the deck.
- The everyday examples and logos are region-specific in the deck ("determined by region").
