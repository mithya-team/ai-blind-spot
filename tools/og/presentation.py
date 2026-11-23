"""Regenerate the presentation's share (Open Graph) image: og/presentation.png, 1200 x 630.

It is the real opening scene of presentation/index.html, captured once the dawn has come up,
with the controls hidden. Needs the same tools as make.py (Node 20+, Playwright's headless Chrome).

    python3 -m http.server 8791 --bind 127.0.0.1     # from the repo root, in another terminal
    python3 tools/og/presentation.py                  # writes og/presentation.png

Set B= to use another address, for example B=http://localhost:8137.
"""
import os, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
B = os.environ.get('B', 'http://127.0.0.1:8791')
TIDY = "js:document.querySelectorAll('.tools,.navb,.rail,.hint,.cue,.bar').forEach(e=>e.style.display='none');1"

subprocess.run(['node', os.path.join(HERE, 'shot.mjs'), os.path.join(ROOT, 'og', 'presentation.png'), '1200', '630',
                f'url:{B}/presentation/index.html?present', TIDY, 'wait:7000'], check=True)
print('wrote og/presentation.png')
