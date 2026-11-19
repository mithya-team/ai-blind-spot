"""Regenerate the share (Open Graph) images, 1200 x 630, into og/ at the repo root.

Needs: Python 3 with Pillow, Node 20+, and Playwright's headless Chrome
(`npx playwright install chromium-headless-shell`; set CHROME= to its binary if it isn't found).

    python3 -m http.server 8791 --bind 127.0.0.1     # from the repo root, in another terminal
    python3 tools/og/make.py                          # writes og/*.png

The game images are real gameplay, captured mid-round with each game's ?debug hooks,
then placed beside the title in card.html. The first page and games page are the real
pages, tidied for a still image. After the final three games are chosen, drop the other
two from GAMES below and rerun: games.png then shows only the three.
"""
import os, pathlib, subprocess, urllib.parse
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
OUT = os.path.join(ROOT, 'og')
TMP = os.path.join(HERE, '.cache'); os.makedirs(TMP, exist_ok=True)
B = 'http://127.0.0.1:8791'
SET = "js:localStorage.clear();BS.setPlayer('Tester','Test Co');1"
HIDE = "js:BS.pill.style.display='none';1"

def run(out, w, h, *steps):
    subprocess.run(['node', os.path.join(HERE, 'shot.mjs'), out, str(w), str(h), *steps], check=True)

# id, title, line, background, glow, accent, title colour, capture steps (600 x 630, mid-round)
GAMES = [
    ('golden-thread', 'Golden Thread', 'Connect scattered content into one answer. Connected data is context.', '#0a1535', 'rgba(54,84,190,.55)', '#e8c773', '#f6dc98',
     ['wait:2200', "path:(()=>{const n=__dbg.nodes().filter(n=>n.y>150&&n.y<520&&n.x>40&&n.x<560).sort((a,b)=>a.x-b.x);return n.slice(0,5).map(n=>[n.x,n.y])})()", 'wait:120']),
    ('deep-dive', 'Deep Dive', 'How deep can your AI go before it runs out of context?', '#071c2b', 'rgba(30,120,170,.5)', '#7fe3ff', '#c9f4ff',
     ['path:[[300,400],[280,400],[320,400]]', 'wait:5200'], '&from=2400'),
    ('clear-cut', 'Clear Cut', 'Shatter the barriers around your content. Never cut governance.', '#1d1840', 'rgba(120,96,220,.5)', '#c9b8ff', '#e6dcff',
     ['wait:6000', 'path:[[20,440],[300,340],[590,250]]', 'wait:60']),
    ('stack-up', 'Stack Up', 'Build your AI stack. It is only as strong as the context it stands on.', '#06201a', 'rgba(40,150,110,.5)', '#7df0b8', '#b6f7d6',
     ['wait:300', 'js:[0,.06,-.08,.03,0,.02].forEach(o=>__dbg.place(o));1', 'wait:550']),
    ('vital-signs', 'Vital Signs', 'Context is the oxygen of AI. Keep it breathing.', '#1e0b1a', 'rgba(170,50,100,.45)', '#ff9db2', '#ffc4d0',
     ['wait:2600', "js:const s=__dbg.state();__dbg.govern(s.bubbles.findIndex(b=>!b.kind));__dbg.feed(0,'brain');__dbg.set('muscle',.22);__dbg.set('nerve',.55);1", 'wait:900']),
]

def card(out, t, d, bg, glow, acc, title, img=None, art=None, f=None):
    q = {'t': t, 'd': d, 'bg': bg, 'glow': glow, 'acc': acc, 'title': title}
    if img: q['img'] = pathlib.Path(img).as_uri()
    if art: q['art'] = art
    if f: q['f'] = f
    run(out, 1200, 630, 'url:' + pathlib.Path(HERE, 'card.html').as_uri() + '?' + urllib.parse.urlencode(q), 'wait:1800')

for g in GAMES:
    gid, name, desc, bg, glow, acc, title, steps = g[:8]
    extra = g[8] if len(g) > 8 else ''
    cap = os.path.join(TMP, f'cap-{gid}.png')
    run(cap, 600, 630, f'url:{B}/index.html', SET, f'url:{B}/{gid}.html?auto&debug{extra}', 'wait:500', HIDE, *steps)
    card(os.path.join(OUT, f'{gid}.png'), name, desc, bg, glow, acc, title, img=cap)

# Leaderboard: a podium in the game colours, with a trophy.
cols = ['#f1d48a', '#9eeaff', '#d9ccff', '#8ff0c0', '#ffa3b6']
bars = ''.join(
    f'<rect x="{150 + i * 80}" y="{560 - hgt}" width="62" height="{hgt}" rx="12" fill="{c}" fill-opacity=".9"/>'
    f'<rect x="{150 + i * 80}" y="{560 - hgt}" width="62" height="{hgt}" rx="12" fill="url(#sh)"/>'
    for i, (c, hgt) in enumerate(zip(cols, [250, 330, 410, 300, 220])))
trophy = ('<g transform="translate(323 64) scale(4)" fill="none" stroke="#f6dc98" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'
          '<path d="M7 4h10v5a5 5 0 0 1-10 0V4zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M12 14v4M8.5 20h7"/></g>')
art = ('<svg viewBox="0 0 600 630" width="600" height="630" xmlns="http://www.w3.org/2000/svg">'
       '<defs><linearGradient id="sh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient>'
       '<radialGradient id="gl"><stop offset="0" stop-color="#f6dc98" stop-opacity=".35"/><stop offset="1" stop-color="#f6dc98" stop-opacity="0"/></radialGradient></defs>'
       f'<circle cx="371" cy="110" r="120" fill="url(#gl)"/>{trophy}{bars}<rect x="130" y="560" width="440" height="2" fill="#fff" fill-opacity=".25"/></svg>')
card(os.path.join(OUT, 'leaderboard.png'), 'Leaderboard', 'Every game is worth up to 1,000 points. Who reads the room best?',
     '#070a13', 'rgba(54,78,160,.5)', '#8fb0ff', '#eef1f8', art=urllib.parse.quote(art), f='Live in the room · <b>Beat the room</b>')

# First page and games page: the real pages, with the sign-in form and personal bits hidden.
run(os.path.join(OUT, 'index.png'), 1200, 630, f'url:{B}/index.html', 'js:localStorage.clear();1', f'url:{B}/index.html?desktop', 'wait:400',
    "js:document.querySelector('form.join').style.visibility='hidden';const h=document.querySelector('h1');h.style.fontSize='150px';const l=document.querySelector('.lede');l.style.fontSize='27px';l.style.maxWidth='26ch';1", 'wait:2200')
big = os.path.join(TMP, 'games-big.png')
run(big, 1600, 840, f'url:{B}/index.html', SET, f'url:{B}/games.html?desktop', 'wait:400',
    "js:document.querySelectorAll('.who,.standing,.note').forEach(e=>e.style.visibility='hidden');document.querySelector('.sub').textContent='Quick games on the AI blind spot. Three attempts each, best one counts.';1", 'wait:2200')
Image.open(big).resize((1200, 630), Image.LANCZOS).save(os.path.join(OUT, 'games.png'))
print('Wrote', ', '.join(sorted(os.listdir(OUT))))
