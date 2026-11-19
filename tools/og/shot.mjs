// node shot.mjs <out.png> <w> <h> <step>...   step = "url:<url>" | "wait:<ms>" | "js:<code>" | "click:<x>,<y>" | "shot:<file>"
import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
// Headless Chrome over the DevTools protocol. Used by make.py to capture pages and render the share cards.
import { readdirSync, existsSync } from 'node:fs';
const findChrome = () => { // Playwright's chrome-headless-shell, any version, unless CHROME is set
  const base = process.env.HOME + '/Library/Caches/ms-playwright';
  if (!existsSync(base)) return null;
  for (const d of readdirSync(base).filter(d => d.startsWith('chromium_headless_shell')).sort().reverse())
    for (const sub of ['chrome-headless-shell-mac-arm64', 'chrome-headless-shell-mac-x64', 'chrome-headless-shell-linux64']) {
      const p = `${base}/${d}/${sub}/chrome-headless-shell`; if (existsSync(p)) return p;
    }
  return null;
};
const BIN = process.env.CHROME || findChrome();
const [out, w, h, ...steps] = process.argv.slice(2);
const port = 9300 + Math.floor(Math.random() * 500);
const prof = mkdtempSync(join(tmpdir(), 'shot-'));
const ch = spawn(BIN, [`--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, `--window-size=${w},${h}`, '--hide-scrollbars', '--autoplay-policy=no-user-gesture-required', 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let list;
for (let i = 0; i < 50; i++) { try { list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); if (list.length) break; } catch (e) {} await sleep(100); }
const ws = new WebSocket(list.find(t => t.type === 'page').webSocketDebuggerUrl);
await new Promise(r => ws.onopen = r);
let id = 0; const pend = {};
ws.onmessage = e => {
  const m = JSON.parse(e.data);
  if (m.id && pend[m.id]) { pend[m.id](m); delete pend[m.id]; }
  else if (m.method === 'Runtime.exceptionThrown') console.log('EXC>', m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
  else if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') console.log('ERR>', m.params.args.map(a => a.description || a.value).join(' '));
};
const send = (method, params = {}) => new Promise(r => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
await send('Emulation.setDeviceMetricsOverride', { width: +w, height: +h, deviceScaleFactor: 1, mobile: +w < 700 });
// Phones and tablets are touch devices: emulate touch below 700px wide, or when TOUCH=1 (TOUCH=0 turns it off).
const touch = process.env.TOUCH ? process.env.TOUCH === '1' : +w < 700;
if (touch) await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
await send('Page.enable'); await send('Runtime.enable');
const snap = async file => { const r = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(file, Buffer.from(r.result.data, 'base64')); };
for (const s of steps) {
  const k = s.slice(0, s.indexOf(':')), v = s.slice(s.indexOf(':') + 1);
  if (k === 'url') { await send('Page.navigate', { url: v }); await sleep(800); }
  else if (k === 'wait') await sleep(+v);
  else if (k === 'shot') await snap(v);
  else if (k === 'js') { const r = await send('Runtime.evaluate', { expression: v, awaitPromise: true, returnByValue: true }); const val = r.result?.exceptionDetails?.exception?.description || r.result?.result?.value; if (val !== undefined && val !== 1) console.log('js>', JSON.stringify(val)); }
  else if (k === 'dragjs' || k === 'tapjs') {
    const r = await send('Runtime.evaluate', { expression: v, returnByValue: true }); const p = r.result.result.value;
    const ev = (type, x, y, buttons) => send('Input.dispatchMouseEvent', { type, x, y, button: 'left', buttons, clickCount: 1 });
    await ev('mousePressed', p[0], p[1], 1);
    if (k === 'dragjs') for (let i = 1; i <= 12; i++) { await ev('mouseMoved', p[0] + (p[2] - p[0]) * i / 12, p[1] + (p[3] - p[1]) * i / 12, 1); await sleep(25); }
    await sleep(60); await ev('mouseReleased', k === 'dragjs' ? p[2] : p[0], k === 'dragjs' ? p[3] : p[1], 0);
  }
  else if (k === 'path') { // press at the first point, glide through the rest, keep holding
    const r = await send('Runtime.evaluate', { expression: v, returnByValue: true }); const pts = r.result.result.value;
    const ev = (type, x, y, buttons) => send('Input.dispatchMouseEvent', { type, x, y, button: 'left', buttons, clickCount: 1 });
    await ev('mousePressed', pts[0][0], pts[0][1], 1);
    for (let j = 1; j < pts.length; j++) for (let i = 1; i <= 8; i++) { await ev('mouseMoved', pts[j-1][0] + (pts[j][0] - pts[j-1][0]) * i / 8, pts[j-1][1] + (pts[j][1] - pts[j-1][1]) * i / 8, 1); await sleep(12); }
  }
  else if (k === 'click') { const [x, y] = v.split(',').map(Number); for (const type of ['mousePressed', 'mouseReleased']) await send('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1 }); }
}
await snap(out);
ws.close(); ch.kill();
process.exit(0);
