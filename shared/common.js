/* Shared shell for The AI Blind Spot games.
   - Player: asked once on the home page, remembered on this device.
   - Rounds: one practice round, then 3 ranked attempts per game. Best ranked attempt counts;
     if no ranked attempt was played, the practice score counts.
   - Intro card (what the game means), step-by-step tutorial, end screen with themed stats.
   - Sound: small Web Audio synth, off by default.
   Everything is stored on this device for now (bs_db_v2). Swap db()/save() for a hosted store later. */
(() => {
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = n => Math.round(n).toLocaleString('en-US');
  const pl = (n, one, many) => `${fmt(n)} ${n === 1 ? one : (many || one + 's')}`;
  const params = new URLSearchParams(location.search);
  const nav = (url, replace) => { if (replace) location.replace(url); else location.href = url; };
  const MAX_RUNS = 3;

  /* ---------- Co-brand marks (launcher-style squircles) ---------- */
  const AWS_TEXT = 'M6.763 10.036c0 .296.032.535.088.71.064.176.144.368.256.576.04.063.056.127.056.183 0 .08-.048.16-.152.24l-.503.335a.383.383 0 0 1-.208.072c-.08 0-.16-.04-.239-.112a2.47 2.47 0 0 1-.287-.375 6.18 6.18 0 0 1-.248-.471c-.622.734-1.405 1.101-2.347 1.101-.67 0-1.205-.191-1.596-.574-.391-.384-.59-.894-.59-1.533 0-.678.239-1.23.726-1.644.487-.415 1.133-.623 1.955-.623.272 0 .551.024.846.064.296.04.6.104.918.176v-.583c0-.607-.127-1.03-.375-1.277-.255-.248-.686-.367-1.3-.367-.28 0-.568.031-.863.103-.295.072-.583.16-.862.272a2.287 2.287 0 0 1-.28.104.488.488 0 0 1-.127.023c-.112 0-.168-.08-.168-.247v-.391c0-.128.016-.224.056-.28a.597.597 0 0 1 .224-.167c.279-.144.614-.264 1.005-.36a4.84 4.84 0 0 1 1.246-.151c.95 0 1.644.216 2.091.647.439.43.662 1.085.662 1.963v2.586zm-3.24 1.214c.263 0 .534-.048.822-.144.287-.096.543-.271.758-.51.128-.152.224-.32.272-.512.047-.191.08-.423.08-.694v-.335a6.66 6.66 0 0 0-.735-.136 6.020 6.020 0 0 0-.75-.048c-.535 0-.926.104-1.19.32-.263.215-.39.518-.39.917 0 .375.095.655.295.846.191.2.47.296.838.296zm6.41.862c-.144 0-.24-.024-.304-.08-.064-.048-.12-.16-.168-.311L7.586 5.55a1.398 1.398 0 0 1-.072-.32c0-.128.064-.2.191-.2h.783c.151 0 .255.025.31.08.065.048.113.16.16.312l1.342 5.284 1.245-5.284c.04-.16.088-.264.151-.312a.549.549 0 0 1 .32-.08h.638c.152 0 .256.025.32.08.063.048.12.16.151.312l1.261 5.348 1.381-5.348c.048-.16.104-.264.16-.312a.52.52 0 0 1 .311-.08h.743c.127 0 .2.065.2.2 0 .04-.009.08-.017.128a1.137 1.137 0 0 1-.056.2l-1.923 6.17c-.048.16-.104.263-.168.311a.51.51 0 0 1-.303.08h-.687c-.151 0-.255-.024-.32-.08-.063-.056-.119-.16-.15-.32l-1.238-5.148-1.23 5.14c-.04.16-.087.264-.15.32-.065.056-.177.08-.32.08zm10.256.215c-.415 0-.83-.048-1.229-.143-.399-.096-.71-.2-.918-.32-.128-.071-.215-.151-.247-.223a.563.563 0 0 1-.048-.224v-.407c0-.167.064-.247.183-.247.048 0 .096.008.144.024.048.016.12.048.2.08.271.12.566.215.878.279.319.064.63.096.95.096.502 0 .894-.088 1.165-.264a.86.86 0 0 0 .415-.758.777.777 0 0 0-.215-.559c-.144-.151-.416-.287-.807-.415l-1.157-.36c-.583-.183-1.014-.454-1.277-.813a1.902 1.902 0 0 1-.4-1.158c0-.335.073-.63.216-.886.144-.255.335-.479.575-.654.24-.184.51-.32.83-.415.32-.096.655-.136 1.006-.136.175 0 .359.008.535.032.183.024.35.056.518.088.16.04.312.08.455.127.144.048.256.096.336.144a.69.69 0 0 1 .24.2.43.43 0 0 1 .071.263v.375c0 .168-.064.256-.184.256a.83.83 0 0 1-.303-.096 3.652 3.652 0 0 0-1.532-.311c-.455 0-.815.071-1.062.223-.248.152-.375.383-.375.71 0 .224.08.416.24.567.159.152.454.304.877.44l1.134.358c.574.184.99.44 1.237.767.247.327.367.702.367 1.117 0 .343-.072.655-.207.926-.144.272-.336.511-.583.703-.248.2-.543.343-.886.447-.36.111-.734.167-1.142.167z';
  const AWS_SMILE = 'M21.698 16.207c-2.626 1.94-6.442 2.969-9.722 2.969-4.598 0-8.74-1.7-11.87-4.526-.247-.223-.024-.527.272-.351 3.384 1.963 7.559 3.153 11.877 3.153 2.914 0 6.114-.607 9.06-1.852.439-.2.814.287.383.607zM22.792 14.961c-.336-.43-2.22-.207-3.074-.103-.255.032-.295-.192-.063-.36 1.5-1.053 3.967-.75 4.254-.399.287.36-.08 2.826-1.485 4.007-.215.184-.423.088-.327-.151.32-.79 1.03-2.57.695-2.994z';
  const CAP_LIGHT = 'm 153.2175,21.2782 c 3.4962,0 6.1962,-2.8462 6.2312,-6.225 -0.245,-1.475 -0.7625,-4.2037 -4.585,-4.2037 -4.19,0 -5.5762,5.8487 -8.985,9.6237 -0.2737,2.1438 -2.305,4.0625 -4.8387,4.385 0.62,0.6488 2.0025,1.0013 3.6525,1.0013 3.0175,0 6.67,-0.9088 8.5837,-2.7988 -2.5537,0.035 -4.1937,-1.6062 -4.355,-3.8762 1.245,1.5087 2.6513,2.0937 4.2963,2.0937';
  const CAP_DARK = 'M 159.4434,14.805 c -0.079,-3.9263 -1.9437,-7.2363 -4.825,-9.8788 -2.1875,-1.9962 -4.785,-3.515 -7.5087,-4.6575 -0.215,-0.092 -0.44,-0.1812 -0.66,-0.2687 -3.3538,4.0187 -14.965,7.0162 -14.965,15.44 0,3.29 2.08,6.3712 5.1312,7.6075 1.7725,0.6687 3.54,0.7025 5.3125,0.1062 1.5775,-0.5175 2.8713,-1.4937 3.95,-2.68 3.4088,-3.775 4.795,-9.6187 8.98,-9.6187 3.8275,0 4.345,2.7237 4.59,4.1987 0,-0.01 0,-0.1075 -0.01,-0.2487';
  const CAP_WORD = 'm 126.3725,11.972 c 0,-1.86 -0.1125,-3.1 -1.3288,-3.1 -0.5562,0 -0.825,0.1125 -1.3087,0.2725 0.43,6.28 -0.9913,11.8125 -2.7238,11.8125 -2.2712,0 -1.1387,-13.4625 -5.9475,-13.4625 -4.4387,0 -5.0787,10.7475 -5.5812,10.7475 -0.3425,0 -0.395,-2.8225 -0.3763,-4.9763 0.1863,-1.03 0.2888,-1.9575 0.2888,-2.6612 0,-1 -0.41,-2.7288 -2.6813,-1.865 0.079,7.6862 -1.46,12.3287 -3.1937,12.3287 -2.5388,0 -2.5675,-6.9675 -2.5675,-8.8862 0,-1.875 0.1362,-4.38 -2.6513,-3.4913 -0.415,6.7038 -2.1737,11.7625 -3.2812,11.7625 -1.6513,0 -1.3188,-11.5812 -4.8888,-11.5812 -3.2125,0 -4.2037,10.9712 -4.8725,10.9712 -1.1962,0 0.3763,-12.3487 -4.2625,-12.3487 -2.4312,0 -3.3987,4.1212 -4.3512,8.735 -0.185,0.8937 -0.375,0.9237 -0.41,-0.087 -0.024,-0.8588 -0.029,-1.7238 -0.019,-2.5825 1.1663,-4.6388 -0.2587,-6.3525 -2.4075,-5.1175 0.6938,8.56 -3.2375,12.7437 -6.25,12.7437 -1.0887,0 -1.9487,-0.4637 -2.5875,-1.1962 3.6125,-2.2163 5.2188,-4.76 5.2188,-7.2463 0,-2.69 -1.5475,-4.2425 -4.1163,-4.2425 -3.5837,0 -5.59,3.6913 -5.59,6.8313 0,1.6887 0.3175,3.125 0.835,4.3062 -1.2312,0.5863 -2.3925,1.0938 -3.4725,1.5863 -0.098,-3.2275 -0.4587,-6.615 -0.7362,-9.745 -1.91,-0.5275 -2.4663,0.39 -2.6125,2.0887 -0.3425,3.8775 -1.7775,6.285 -3.0475,6.285 -0.9525,0 -1.5375,-1.1625 -1.6063,-2.3975 -0.3562,-6.2162 4.6875,-7.945 7.3288,-7.0412 0.5475,-1.3725 -0.054,-2.3588 -2.4363,-2.3588 -2.8862,0 -5.0437,1.7538 -6.6262,4.0038 -1.0538,1.5 -2.275,2.5637 -3.8963,3.8487 0.044,-0.3662 0.064,-0.7375 0.064,-1.1037 0,-4.38 -2.3738,-6.3038 -4.6388,-6.3038 -1.875,0 -3.0562,1.1225 -3.74,2.8513 -0.1662,-1.7338 -0.5125,-2.48 -1.5187,-2.48 -0.43,0 -1.03,0.1212 -1.67,0.4337 0.2925,0.9675 0.405,3.1113 0.405,4.5175 0,5.2675 -1.5088,7.6313 -2.9588,7.6313 -1.66,0 -1.9237,-6.25 -2.065,-8.6813 -0.2587,-0.098 -0.5325,-0.1512 -0.8112,-0.1512 -1.5038,0 -1.6988,2.0162 -2.07,3.8712 -0.41,2.0563 -1.5913,4.6388 -3.345,4.6388 -1.0588,0 -1.7238,-1.02 -1.8063,-2.8563 -0.1712,-3.725 2.93,-8.14 7.7788,-6.7675 0.6337,-1.4837 -0.3625,-2.6125 -2.3738,-2.6125 -3.545,0 -6.475,2.6513 -7.7537,5.7913 -1.2988,2.8812 -3.57,7.11 -8.1888,7.11 C 6.26,21.7975 3.76,18.95 3.76,12.9787 c 0,-5.1462 3.2462,-10.035 6.7087,-10.035 2.4213,0 2.9838,2.3838 2.7688,4.62 1.255,1.005 3.31,0.067 3.31,-2.4462 0,-1.7338 -1.4063,-4.6738 -5.9513,-4.6738 C 4.9712,0.4437 0,6.055 0,13.4225 0,20.5612 3.6225,24.78 8.75,24.78 c 3.2375,0 6.2887,-1.845 8.3937,-5.2538 0.5325,2.9838 2.5638,4.2388 4.0863,4.2388 2.4662,0 4.0775,-1.5975 4.9562,-3.755 0.5475,2.1625 1.7038,3.765 3.6288,3.765 1.3525,0 2.4112,-0.6888 3.2075,-1.7875 -0.3175,7.5187 -0.7125,12.3137 3.73,11.3725 -0.6875,-2.1388 -0.9075,-6.0313 -0.9075,-9.5275 0,-9.565 1.5775,-12.7138 3.555,-12.7138 1.435,0 1.8987,1.825 1.8987,3.7738 0,1.045 -0.1025,2.2462 -0.3662,3.325 -2.4313,1.5337 -4.37,2.745 -4.37,4.2825 0,1.2162 0.9037,1.3275 1.685,1.3275 1.865,0 4.1112,-1.83 5.3512,-5.2825 1.0838,-0.6588 2.1725,-1.4113 3.2125,-2.4363 -0.034,0.3513 -0.054,0.7025 -0.054,1.0638 0,3.4275 1.4987,5.5037 3.8962,5.5037 1.88,0 3.2863,-1.3337 4.2825,-3.33 0.064,1.1513 0.1025,2.2113 0.1175,3.1825 -3.8087,1.7638 -8.0225,3.55 -8.0225,8.5213 0,2.5725 1.855,4.5062 4.2725,4.5062 5.3075,0 6.5188,-5.6 6.5675,-12.1087 1.7288,-0.7475 3.0125,-1.3238 4.4975,-2.0613 1.2688,1.5925 2.9975,2.3888 4.58,2.3888 2.9925,0 5.2438,-1.5875 7.05,-4.805 0.3175,2.4462 0.9525,4.805 2.2563,4.805 2.3725,0 2.8562,-12.4125 4.6187,-12.4125 1.3525,0 0.245,13.4275 3.8138,13.4275 3.0562,0 3.6275,-11.8163 5.1175,-11.8163 1.055,0 1.1325,10.8013 4.4625,10.8013 1.6362,0 3.4137,-1.9688 4.3012,-6.09 0.42,2.745 1.8025,6.09 4.5075,6.09 1.5775,0 2.935,-1.5975 3.9838,-3.7163 0.2887,2.1825 0.9037,3.7163 2.1,3.7163 3.11,0 3.0075,-12.3838 5.4687,-12.3838 1.9188,0 1.3288,12.3838 5.8988,12.3838 2.1725,0 3.2025,-1.8513 3.8187,-4.18 0.8388,3.4225 2.2013,4.18 3.315,4.18 0.7075,0 1.245,-0.25 1.9488,-1.085 -3.5363,-1.5325 -3.2375,-7.1138 -3.2375,-10.7175 m -74.8438,21.27 c -1.0987,0 -1.68,-1.045 -1.68,-2.2225 0,-3.1788 2.3338,-4.8625 5.205,-6.3125 -0.1275,6.9425 -1.7437,8.535 -3.525,8.535 m 14.2775,-22.51 c 1.0688,0 1.6788,0.9812 1.5713,2.3925 -0.1213,1.655 -1.3275,3.555 -3.4275,5.0437 -1.0938,-3.115 -0.2775,-7.4362 1.8562,-7.4362 M 99.6722,6.035 c 1.0162,-0.034 1.7287,-0.9075 1.7337,-1.9475 0.01,-1.04 -0.6987,-1.8613 -1.7187,-1.8225 -1.02,0.035 -1.85,0.9087 -1.855,1.9487 -0.01,1.04 0.82,1.855 1.84,1.8213 m 25.3325,0.5275 c 0.9275,-0.034 1.685,-0.8638 1.685,-1.855 0,-0.9913 -0.7425,-1.7675 -1.67,-1.7388 -0.9288,0.034 -1.685,0.8688 -1.69,1.86 -0.01,0.9913 0.7475,1.7675 1.675,1.7338 m 34.4387,8.2425 c -0.079,-3.9263 -1.9437,-7.2363 -4.825,-9.8788 -2.1875,-1.9962 -4.785,-3.515 -7.5087,-4.6575 -0.215,-0.092 -0.44,-0.1812 -0.66,-0.2687 -3.3538,4.0187 -14.965,7.0162 -14.965,15.44 0,3.29 2.08,6.3712 5.1312,7.6075 1.7725,0.6687 3.54,0.7025 5.3125,0.1062 1.5775,-0.5175 2.8713,-1.4937 3.95,-2.68 3.4088,-3.775 4.795,-9.6187 8.98,-9.6187 3.8275,0 4.345,2.7237 4.59,4.1987 0,-0.01 0,-0.1075 -0.01,-0.2487';
  /* Full logos for the intro page, in their light-on-dark versions. */
  const LOGOS_FULL = `<span class="bs-full" aria-label="OpenText, AWS and Capgemini">
    <span class="lf ot"><img src="shared/ot-icon.png" alt=""><img src="shared/ot-word.png" alt="OpenText"></span>
    <svg class="lf aws" viewBox="0 3.8 24 15.8" role="img" aria-label="AWS"><path fill="#fff" d="${AWS_TEXT}"/><path fill="#FF9900" d="${AWS_SMILE}"/></svg>
    <svg class="lf cap" viewBox="-0.5 -0.5 160.5 36.6" role="img" aria-label="Capgemini"><path fill="#fff" fill-rule="evenodd" d="${CAP_WORD}"/><path fill="#fff" fill-opacity=".6" fill-rule="evenodd" d="${CAP_LIGHT}"/></svg>
  </span>`;
  const LOGOS = `<span class="bs-logos" aria-label="OpenText, AWS and Capgemini">
    <span class="bs-lg bs-ot"><img src="shared/ot-icon.png" alt="OpenText"></span>
    <svg class="bs-lg" viewBox="0 0 24 24" role="img" aria-label="AWS"><rect width="24" height="24" fill="#232F3E"/><g transform="translate(12 12.4) scale(.68) translate(-12 -12)"><path fill="#fff" d="${AWS_TEXT}"/><path fill="#FF9900" d="${AWS_SMILE}"/></g></svg>
    <svg class="bs-lg" viewBox="0 0 24 24" role="img" aria-label="Capgemini"><rect width="24" height="24" fill="#fff"/><g transform="translate(12 12) scale(.54) translate(-145.6 -12.7)"><path fill="#0070AD" fill-rule="evenodd" d="${CAP_DARK}"/><path fill="#12ABDB" fill-rule="evenodd" d="${CAP_LIGHT}"/></g></svg>
  </span>`;

  /* ---------- Game registry: what each game means, and which stats it reports ---------- */
  const GAMES = {
    'golden-thread': {
      title: 'Golden Thread', href: 'golden-thread.html',
      blurb: 'Connect scattered, unstructured content into one answer. Keep clear of the blind spots.',
      meaning: [
        ['Fragments', 'Unstructured content: contracts, emails, invoices, tickets and customer records, scattered across your systems.'],
        ['The thread', 'Connected data. Linking fragments gives your AI context, and a longer thread means a better answer.'],
        ['Blind spots', 'Information your AI can’t reach. Touch one and the connection breaks.'],
        ['Full picture', 'All five kinds in one thread: the complete view of a customer. Double points.'],
      ],
      stats: [
        { k: 'connected', l: 'Fragments connected' },
        { k: 'longest', l: 'Longest thread' },
        { k: 'pictures', l: 'Full pictures' },
        { k: 'lost', l: 'Threads lost to blind spots', bad: true },
      ],
      line: s => `Longest ${fmt(s.longest || 0)} · ${pl(s.pictures || 0, 'full picture')} · ${fmt(s.lost || 0)} lost to blind spots`,
    },
    'deep-dive': {
      title: 'Deep Dive', href: 'deep-dive.html',
      blurb: 'Most of what your company knows sits below the surface. Context is your AI\u2019s oxygen: how deep can it go?',
      meaning: [
        ['The dive', 'Down through the layers of your business: cloud apps, shared drives, email archives, legacy apps and systems of record.'],
        ['Context', 'Your AI\u2019s oxygen, shown as its glow. It runs down unless it reaches more content.'],
        ['Documents', 'Each one you collect is content your AI can now use. It tops up your context.'],
        ['Walls', 'Legacy systems that block access. Hitting one drains your context.'],
      ],
      stats: [
        { k: 'depth', l: 'Deepest point reached', unit: ' m' },
        { k: 'layers', l: 'Layers opened up', of: 6 },
        { k: 'docs', l: 'Documents recovered' },
        { k: 'hits', l: 'Legacy walls hit', bad: true },
      ],
      line: s => `Down to ${s.layerName || fmt(s.depth || 0) + ' m'} · ${pl(s.docs || 0, 'document')} · ${pl(s.hits || 0, 'wall')} hit`,
    },
    'clear-cut': {
      title: 'Clear Cut', href: 'clear-cut.html',
      blurb: 'Cut through the barriers between your AI and your content. Never cut governance.',
      meaning: [
        ['Frosted panes', 'The barriers around your unstructured content: silos, legacy apps, hidden data and scattered files.'],
        ['Cutting', 'Clearing a barrier makes the document behind it visible to your AI.'],
        ['Gold seals', 'The governed, secure layer: security, privacy and compliance. Tap to approve. Never cut through one.'],
      ],
      stats: [
        { k: 'cleared', l: 'Barriers cleared' },
        { k: 'approved', l: 'Seals approved' },
        { k: 'combo', l: 'Best combo' },
        { k: 'breaches', l: 'Governance breaches', bad: true },
      ],
      line: s => `${pl(s.cleared || 0, 'barrier')} cleared · ${fmt(s.approved || 0)} approved · ${pl(s.breaches || 0, 'breach', 'breaches')}`,
    },
    'stack-up': {
      title: 'Stack Up', href: 'stack-up.html',
      blurb: 'Build the six layers of your AI stack. Every layer is only as wide as the one beneath it.',
      meaning: [
        ['The stack', 'Six layers, bottom to top: infrastructure, systems of record, context, language models, orchestration, agents.'],
        ['The cut', 'Whatever overhangs the layer below is lost. No layer can be wider than the one it stands on.'],
        ['Context', 'The blue layer, Context & Connected Data, is the oxygen. Models and agents are only as strong as it is.'],
        ['The body', 'Skeleton, vital organs, oxygen, brain, nervous system, muscles: one for each layer.'],
      ],
      stats: [
        { k: 'stacks', l: 'Full stacks built' },
        { k: 'context', l: 'Context layer width', unit: '%' },
        { k: 'perfect', l: 'Perfect drops' },
        { k: 'collapses', l: 'Stacks collapsed', bad: true },
      ],
      line: s => `${pl(s.stacks || 0, 'stack')} · context ${s.context == null ? '–' : fmt(s.context) + '%'} · ${pl(s.collapses || 0, 'collapse')}`,
    },
    'vital-signs': {
      title: 'Vital Signs', href: 'vital-signs.html',
      blurb: 'Context is the oxygen of AI. Keep the brain, nerves and muscles breathing.',
      meaning: [
        ['The body', 'Your AI. The brain is its models, the nervous system is orchestration, the muscles are its agents.'],
        ['Oxygen', 'Governed context. Every part uses it up as it works, and stalls without it.'],
        ['Raw content', 'Unstructured and ungoverned: emails, files, records. Tap to govern it and it becomes oxygen.'],
        ['Stalls', 'A part that runs out of oxygen stops. Feed it raw content and it chokes.'],
      ],
      stats: [
        { k: 'oxygen', l: 'Average oxygen level', unit: '%' },
        { k: 'fed', l: 'Context delivered' },
        { k: 'governed', l: 'Raw content governed' },
        { k: 'stalls', l: 'Stalls', bad: true },
      ],
      line: s => `Oxygen ${fmt(s.oxygen || 0)}% · ${fmt(s.fed || 0)} delivered · ${pl(s.stalls || 0, 'stall')}`,
    },
  };

  /* ---------- Device-local data ---------- */
  const DB_KEY = 'bs_db_v2';
  const LAYERS = ['Cloud apps', 'Shared drives', 'Email archives', 'Legacy applications', 'Systems of record', 'Offline archives'];
  const db = () => {
    const d = store.get(DB_KEY, { players: {} });
    // Deep Dive used to be "Back to 1964": carry saved rounds over and restate their stats as depth.
    let moved = false;
    for (const k in d.players) {
      const g = d.players[k].games || {}, old = g['back-to-1964'];
      if (!old) continue;
      const fix = run => {
        if (!run) return run;
        const st = run.stats || {};
        if (st.depth == null && st.year != null) {
          const layers = st.eras || Math.min(6, 1 + Math.floor(Math.max(0, 2015 - st.year + 10) / 10));
          run.stats = { depth: Math.round((2026 - st.year) * 100), layers, layerName: LAYERS[Math.max(0, layers - 1)], docs: st.docs, hits: st.hits };
        }
        return run;
      };
      if (!g['deep-dive']) g['deep-dive'] = { practice: fix(old.practice), runs: (old.runs || []).map(fix) };
      delete g['back-to-1964']; moved = true;
    }
    if (moved) store.set(DB_KEY, d);
    return d;
  };
  const save = d => store.set(DB_KEY, d);
  const pkey = p => (p.name.trim() + '|' + (p.company || '').trim()).toLowerCase();

  /* ---------- Sound (off by default) ---------- */
  const SND = { on: store.get('bs_sound', false), ctx: null, out: null };
  function ac() {
    if (!SND.ctx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      SND.ctx = new C();
      SND.out = SND.ctx.createGain(); SND.out.gain.value = .55; SND.out.connect(SND.ctx.destination);
    }
    if (SND.ctx.state === 'suspended') SND.ctx.resume();
    return SND.ctx;
  }
  function tone(c, { f = 440, f2, type = 'sine', dur = .12, vol = .14, delay = 0, attack = .006 }) {
    const t = c.currentTime + delay, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(SND.out); o.start(t); o.stop(t + dur + .02);
  }
  function noise(c, { dur = .15, vol = .12, delay = 0, type = 'lowpass', f = 1200, f2 }) {
    const t = c.currentTime + delay, n = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain();
    s.buffer = buf; fl.type = type; fl.frequency.setValueAtTime(f, t);
    if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(vol, t);
    s.connect(fl); fl.connect(g); g.connect(SND.out); s.start(t);
  }
  const PENTA = [0, 2, 4, 7, 9];
  const note = (n, base = 523.25) => base * Math.pow(2, (PENTA[n % 5] + 12 * Math.floor(n / 5)) / 12);
  const SFX = {
    tap: c => tone(c, { f: 660, dur: .06, vol: .08 }),
    start: c => { tone(c, { f: 392, dur: .14 }); tone(c, { f: 587, dur: .2, delay: .1 }); },
    link: (c, o) => tone(c, { f: note(Math.min(o.n || 0, 14)), type: 'triangle', dur: .16, vol: .11 }),
    bank: (c, o) => { const n = o.n || 3; [0, 2, 4].forEach((k, i) => tone(c, { f: note(k + Math.min(n, 10)), type: 'triangle', dur: .35, vol: .1, delay: i * .05 })); },
    full: c => [0, 1, 2, 3, 4, 5].forEach(i => tone(c, { f: note(i + 5), dur: .3, vol: .07, delay: i * .045 })),
    snap: c => { noise(c, { dur: .3, vol: .16, f: 900, f2: 120 }); tone(c, { f: 300, f2: 70, type: 'sawtooth', dur: .35, vol: .07 }); },
    pickup: (c, o) => tone(c, { f: 880 * Math.pow(2, ((o.n || 0) % 6) / 12), f2: 1320, dur: .12, vol: .09 }),
    hit: c => { tone(c, { f: 140, f2: 45, dur: .3, vol: .22 }); noise(c, { dur: .18, vol: .1, f: 500 }); },
    era: c => { tone(c, { f: 196, dur: 1.1, vol: .09, attack: .25 }); tone(c, { f: 784, dur: .9, vol: .05, delay: .15 }); },
    cut: c => { noise(c, { dur: .1, vol: .1, type: 'highpass', f: 2500 }); tone(c, { f: 1800 + Math.random() * 1400, dur: .25, vol: .05 }); },
    combo: (c, o) => [0, 1, 2].forEach(i => tone(c, { f: note((o.n || 2) + i * 2 + 2), type: 'triangle', dur: .2, vol: .08, delay: i * .06 })),
    approve: c => { tone(c, { f: 784, dur: .2, vol: .1 }); tone(c, { f: 1175, dur: .35, vol: .09, delay: .08 }); },
    breach: c => { tone(c, { f: 220, f2: 90, type: 'square', dur: .4, vol: .07 }); tone(c, { f: 233, f2: 95, type: 'square', dur: .4, vol: .05 }); noise(c, { dur: .25, vol: .1, f: 800 }); },
    warn: c => tone(c, { f: 440, dur: .08, vol: .06, type: 'square' }),
    end: c => [659, 523, 392].forEach((f, i) => tone(c, { f, type: 'triangle', dur: .3, vol: .1, delay: i * .12 })),
    win: c => [0, 2, 4, 5, 7, 9].forEach(i => tone(c, { f: note(i + 3), type: 'triangle', dur: .45, vol: .09, delay: i * .08 })),
  };

  /* Animate a number from a to b. Always lands on the final value, even if the tab is hidden. */
  const calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function countUp(el, a, b, dur, f, delay = 0) {
    const done = () => { el.textContent = f(b); };
    if (calm || document.hidden || a === b) { done(); return; }
    el.textContent = f(a);
    const run = () => {
      const t0 = performance.now();
      const tick = now => {
        const p = Math.min(1, (now - t0) / dur);
        el.textContent = f(a + (b - a) * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    setTimeout(run, delay);
    setTimeout(done, delay + dur + 300);
  }

  const BS = {
    params, fmt, esc, pl, GAMES, MAX_RUNS, LOGOS, LOGOS_FULL,
    ease: t => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3),
    rr(c, x, y, w, h, r) {
      r = Math.min(r, w / 2, h / 2);
      c.beginPath(); c.moveTo(x + r, y);
      c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
      c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
    },
    fit(canvas, w = window.innerWidth, h = window.innerHeight) {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { ctx, w, h, dpr };
    },
    vibrate(p) { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} },

    /* Sound */
    soundOn() { return SND.on; },
    setSound(on) { SND.on = !!on; store.set('bs_sound', SND.on); if (on) { ac(); this.sfx('tap'); } },
    sfx(name, opt = {}) { if (!SND.on || !SFX[name]) return; const c = ac(); if (c) try { SFX[name](c, opt); } catch (e) {} },

    /* Tutorial helper: a ghost fingertip. pressed draws the touch ripple. */
    drawHand(c, x, y, pressed, color = '#fff') {
      const r = pressed ? 13 : 16;
      c.save();
      c.fillStyle = color; c.strokeStyle = color;
      if (pressed) { c.globalAlpha = .16; c.beginPath(); c.arc(x, y, 25, 0, 7); c.fill(); }
      c.globalAlpha = pressed ? .34 : .2; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
      c.globalAlpha = .95; c.lineWidth = 2; c.beginPath(); c.arc(x, y, r, 0, 7); c.stroke();
      c.restore();
    },

    /* Player */
    player() { return store.get('bs_player', { name: '', company: '' }); },
    hasPlayer() { const p = this.player(); return !!(p.name && p.company); },
    setPlayer(name, company) {
      const p = { name: name.trim().slice(0, 24), company: company.trim().slice(0, 32) };
      store.set('bs_player', p);
      // Keep a record of everyone who has signed in, so a returning player can pick themselves.
      const d = db(), k = pkey(p), row = d.players[k] || (d.players[k] = { name: p.name, company: p.company, games: {} });
      row.seen = Date.now(); save(d);
    },
    /* Everyone known here, most recent first. With a hosted store this becomes the event's player list. */
    players() {
      const d = db();
      return Object.keys(d.players).map(k => ({ key: k, name: d.players[k].name, company: d.players[k].company, seen: d.players[k].seen || 0 }))
        .sort((a, b) => b.seen - a.seen);
    },
    clearPlayer() { store.set('bs_player', { name: '', company: '' }); },

    /* Rounds and scores */
    progress(id, p = this.player()) {
      const d = db(), pl = d.players[pkey(p)];
      return (pl && pl.games[id]) || { practice: null, runs: [] };
    },
    nextMode(id) {
      const g = this.progress(id);
      if (!g.practice) return 'practice';
      return g.runs.length < MAX_RUNS ? 'ranked' : 'done';
    },
    standing(id, p = this.player()) {
      const g = this.progress(id, p);
      if (g.runs.length) {
        const b = g.runs.reduce((a, r) => (r.score > a.score ? r : a));
        return { score: b.score, stats: b.stats, source: 'ranked', runs: g.runs.length };
      }
      if (g.practice) return { score: g.practice.score, stats: g.practice.stats, source: 'practice', runs: 0 };
      return null;
    },
    best(id) { const s = this.standing(id); return s ? s.score : null; },
    record(id, mode, score, stats) {
      const p = this.player(), d = db(), k = pkey(p);
      const pl = d.players[k] || (d.players[k] = { name: p.name, company: p.company, games: {} });
      pl.seen = Date.now();
      const g = pl.games[id] || (pl.games[id] = { practice: null, runs: [] });
      const prev = this.standing(id);
      const run = { score: Math.round(score), stats, at: Date.now() };
      if (mode === 'practice') g.practice = run; else g.runs.push(run);
      save(d);
      const now = this.standing(id);
      return { run, prevBest: prev ? prev.score : null, standing: now };
    },
    board(id) {
      const d = db(), rows = [];
      for (const k in d.players) {
        const p = d.players[k], s = this.standing(id, p);
        if (s) rows.push({ key: k, name: p.name, company: p.company, ...s });
      }
      return rows.sort((a, b) => b.score - a.score);
    },
    /* Overall standing across all games. Each game is worth up to 1,000 points:
       the top score in a game gets 1,000 and every other score is scaled against it. */
    overall() {
      const rows = {};
      Object.keys(GAMES).forEach(id => {
        const b = this.board(id), top = b.length ? b[0].score : 0;
        b.forEach(r => {
          const o = rows[r.key] || (rows[r.key] = { key: r.key, name: r.name, company: r.company, parts: {}, score: 0, played: 0 });
          const pts = top > 0 ? Math.round(1000 * Math.max(0, r.score) / top) : 0;
          o.parts[id] = { pts, raw: r.score, source: r.source };
          o.score += pts; o.played++;
        });
      });
      return Object.values(rows).sort((a, b) => b.score - a.score || b.played - a.played);
    },
    pips(id, current) {
      const g = this.progress(id);
      const cell = (txt, done, cur, score) => `<div class="pip${done ? ' done' : ''}${cur ? ' cur' : ''}"><i></i><b>${txt}</b><small>${score != null ? fmt(score) : (cur ? 'Next' : '–')}</small></div>`;
      let h = cell('Practice', !!g.practice, current === 'practice', g.practice && g.practice.score);
      for (let i = 0; i < MAX_RUNS; i++) {
        const r = g.runs[i];
        h += cell(`Attempt ${i + 1}`, !!r, current === 'ranked' && i === g.runs.length, r && r.score);
      }
      return `<div class="pips">${h}</div>`;
    },
    modeLabel(id, mode) {
      if (mode === 'practice') return 'Practice round';
      return `Attempt ${this.progress(id).runs.length + 1} of ${MAX_RUNS}`;
    },

    /* ---------- Game page shell ---------- */
    init(cfg) {
      this.cfg = cfg;
      const meta = GAMES[cfg.id];
      if (params.has('auto') && !this.hasPlayer()) this.setPlayer('Tester', 'Test Co');
      if (!this.hasPlayer()) { nav('index.html?next=' + encodeURIComponent(meta.href), true); return; }
      this.seen = store.get('bs_tut_' + cfg.id, false);

      const mk = (cls, html) => { const d = document.createElement('div'); d.className = cls; d.innerHTML = html; document.body.append(d); return d; };
      const p = this.player();
      this.ovIntro = mk('ov', `<div class="card wide intro"><div class="ga">
        ${LOGOS}
        <div class="kicker">The AI Blind Spot</div>
        <h1>${meta.title}</h1>
        <p class="tag">${cfg.tagline}</p></div>
        <div class="meaning">${meta.meaning.map(([t, d]) => `<div><b>${t}</b><span>${d}</span></div>`).join('')}</div>
        <div class="gb"><div id="bs-ipips"></div>
        <div class="srow"><span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4z"/><path id="bs-sndw" d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/></svg><b id="bs-sndl" style="font-weight:500"></b></span><button class="toggle" id="bs-snd" type="button" role="switch" aria-label="Sound"></button></div>
        <button class="btn" id="bs-go" type="button"></button>
        <div class="links"><button class="link" id="bs-how" type="button">How to play</button><a class="link" href="leaderboard.html">Leaderboard</a><a class="link" href="games.html">All games</a></div>
        <p class="who">Playing as ${esc(p.name)} · ${esc(p.company)}</p></div>
      </div>`);
      this.ovTut = mk('ov tut', `<div class="card wide">
        <div class="tuthead"><span id="bs-tstep"></span><button class="link" id="bs-tskip" type="button">Skip</button></div>
        <div class="demo"><canvas id="bs-tcv"></canvas></div>
        <div class="gb"><h2 id="bs-ttitle"></h2>
        <p class="ttext" id="bs-ttext"></p>
        <div class="dots" id="bs-tdots"></div>
        <div class="tbtns"><button class="btn ghost" id="bs-tback" type="button">Back</button><button class="btn" id="bs-tnext" type="button">Next</button></div></div>
      </div>`);
      this.ovEnd = mk('ov', `<div class="card wide end"><div class="ga">
        <div class="kicker" id="bs-emode"></div>
        <div class="headline" id="bs-head"></div>
        <div class="big" id="bs-score"></div>
        <div class="label" id="bs-label"></div>
        <p class="theme" id="bs-theme"></p>
        <div class="statgrid" id="bs-stats"></div>
        <div id="bs-epips"></div>
        <button class="btn" id="bs-next" type="button"></button></div>
        <div class="gb"><div class="lbtitle"><span>Leaderboard</span><span id="bs-rank"></span></div>
        <ol class="lb" id="bs-lb"></ol>
        <div class="links"><a class="link" href="leaderboard.html">Full leaderboard</a><a class="link" href="games.html">All games</a></div></div>
      </div>`);
      this.pill = mk('bs-mode', '');

      const snd = this.ovIntro.querySelector('#bs-snd');
      const paintSnd = () => {
        snd.setAttribute('aria-checked', SND.on);
        this.ovIntro.querySelector('#bs-sndl').textContent = SND.on ? 'Sound on' : 'Sound off';
        this.ovIntro.querySelector('#bs-sndw').style.opacity = SND.on ? 1 : .25;
      };
      snd.onclick = () => { this.setSound(!SND.on); paintSnd(); };
      paintSnd();
      this.ovIntro.querySelector('#bs-go').onclick = () => {
        ac_if();
        if (!this.seen && this.nextMode(cfg.id) !== 'done') this.tutorial();
        else this.begin();
      };
      this.ovIntro.querySelector('#bs-how').onclick = () => this.tutorial();
      this.ovEnd.querySelector('#bs-next').onclick = () => {
        ac_if();
        if (this.nextMode(cfg.id) === 'done') nav('leaderboard.html#' + cfg.id);
        else { this.ovEnd.classList.remove('show'); this.begin(); }
      };
      const ac_if = () => { if (SND.on) ac(); };

      document.addEventListener('touchmove', e => { if (e.target.tagName === 'CANVAS' && !e.target.closest('.demo')) e.preventDefault(); }, { passive: false });
      document.addEventListener('dblclick', e => e.preventDefault());

      if (params.has('auto')) { setTimeout(() => this.begin(), 50); return; }
      if (params.has('tut')) { this.tutorial(); return; }
      this.showIntro();
    },
    showIntro() {
      const id = this.cfg.id, mode = this.nextMode(id), go = this.ovIntro.querySelector('#bs-go');
      this.ovIntro.querySelector('#bs-ipips').innerHTML = this.pips(id, mode);
      go.disabled = false;
      this.ovIntro.querySelector('#bs-how').style.display = this.seen ? '' : 'none';
      if (mode === 'done') { go.textContent = 'All attempts played'; go.disabled = true; }
      else if (!this.seen) go.textContent = 'How to play';
      else go.textContent = mode === 'practice' ? 'Play practice round' : `Play attempt ${this.progress(id).runs.length + 1} of ${MAX_RUNS}`;
      this.ovIntro.classList.add('show'); this.ovIntro.scrollTop = 0;
    },
    tutorial() {
      const steps = this.cfg.tutorial || [], o = this.ovTut, $ = s => o.querySelector(s);
      if (!steps.length) { this.begin(); return; }
      this.ovIntro.classList.remove('show');
      o.classList.add('show');
      const cv = $('#bs-tcv'), box = cv.parentElement;
      let i = 0, t0 = performance.now(), raf = 0, fit = null;
      const resize = () => { fit = this.fit(cv, box.clientWidth, box.clientHeight); };
      const show = () => {
        const s = steps[i], last = i === steps.length - 1, mode = this.nextMode(this.cfg.id);
        $('#bs-tstep').textContent = `Step ${i + 1} of ${steps.length}`;
        $('#bs-ttitle').textContent = s.title;
        $('#bs-ttext').textContent = s.text;
        $('#bs-tdots').innerHTML = steps.map((_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('');
        $('#bs-tback').style.visibility = i ? 'visible' : 'hidden';
        $('#bs-tnext').textContent = !last ? 'Next' : mode === 'practice' ? 'Play practice round' : mode === 'ranked' ? `Play attempt ${this.progress(this.cfg.id).runs.length + 1} of ${MAX_RUNS}` : 'Done';
        t0 = performance.now();
      };
      const loop = now => {
        if (!fit) resize();
        const { ctx, w, h } = fit;
        ctx.clearRect(0, 0, w, h);
        try { steps[i].demo(ctx, w, h, (now - t0) / 1000); } catch (e) { console.error(e); }
        raf = requestAnimationFrame(loop);
      };
      const onResize = () => { fit = null; };
      window.addEventListener('resize', onResize);
      const close = play => {
        cancelAnimationFrame(raf); o.classList.remove('show'); window.removeEventListener('resize', onResize);
        store.set('bs_tut_' + this.cfg.id, true); this.seen = true;
        if (play && this.nextMode(this.cfg.id) !== 'done') this.begin(); else this.showIntro();
      };
      $('#bs-tnext').onclick = () => { this.sfx('tap'); if (i < steps.length - 1) { i++; show(); } else close(true); };
      $('#bs-tback').onclick = () => { if (i > 0) { i--; show(); } };
      $('#bs-tskip').onclick = () => close(false);
      this._tutDebug = { next: () => $('#bs-tnext').onclick(), frame: (t = 1) => { if (!fit) resize(); fit.ctx.clearRect(0, 0, fit.w, fit.h); steps[i].demo(fit.ctx, fit.w, fit.h, t); } };
      requestAnimationFrame(() => { resize(); show(); raf = requestAnimationFrame(loop); });
    },
    begin() {
      const id = this.cfg.id, mode = this.nextMode(id);
      if (mode === 'done') { this.showIntro(); return; }
      this.mode = mode;
      this.ovIntro.classList.remove('show');
      if (document.activeElement) document.activeElement.blur();
      this.pill.textContent = this.modeLabel(id, mode);
      this.pill.classList.add('show');
      this.sfx('start');
      this.cfg.onStart(mode);
    },

    /* r = { score, headline, theme, stats: { key: value }, win } */
    finish(r) {
      const id = this.cfg.id, meta = GAMES[id], mode = this.mode || 'practice';
      const modeText = this.modeLabel(id, mode);
      const res = this.record(id, mode, r.score, r.stats || {});
      this.pill.classList.remove('show');
      this.sfx(r.win || (res.run.score > 0 && (res.prevBest == null || res.run.score > res.prevBest)) ? 'win' : 'end');
      const $ = s => this.ovEnd.querySelector(s);
      $('#bs-emode').textContent = modeText;
      $('#bs-head').textContent = r.headline || 'Game over';
      countUp($('#bs-score'), 0, r.score, 1100, fmt, 250);
      const st = res.standing;
      let label, isBest = false;
      if (mode === 'practice') label = 'Practice score. It counts until you play a ranked attempt.';
      else if (res.run.score >= st.score) { label = 'Your best attempt · on the leaderboard'; isBest = true; }
      else label = `Your best attempt: ${fmt(st.score)}`;
      $('#bs-label').textContent = label;
      $('#bs-label').classList.toggle('best', isBest);
      $('#bs-theme').textContent = r.theme || '';
      const s = r.stats || {};
      $('#bs-stats').innerHTML = meta.stats.map(x => `<div class="${x.bad ? 'bad' : ''}${x.bad && !s[x.k] ? ' zero' : ''}"><b><em style="font-style:normal">${s[x.k] == null ? '—' : x.raw ? esc(s[x.k]) : fmt(s[x.k])}</em>${x.of && s[x.k] != null ? `<small> of ${x.of}</small>` : ''}${x.unit && s[x.k] != null ? `<small>${x.unit}</small>` : ''}</b><span>${x.l}</span></div>`).join('');
      meta.stats.forEach((x, i) => {
        const v = s[x.k];
        if (typeof v !== 'number') return;
        const el = $('#bs-stats').children[i].querySelector('em');
        countUp(el, x.from != null ? x.from : 0, v, 800, x.raw ? n => String(Math.round(n)) : fmt, 500 + i * 110);
      });
      const next = this.nextMode(id);
      $('#bs-epips').innerHTML = this.pips(id, next);
      $('#bs-next').textContent = next === 'done' ? 'See the full leaderboard' : `Play attempt ${this.progress(id).runs.length + 1} of ${MAX_RUNS}`;
      const board = this.board(id), me = pkey(this.player()), rank = board.findIndex(b => b.key === me) + 1;
      $('#bs-rank').textContent = rank ? `You're #${rank} of ${board.length}` : '';
      const li = (row, pos) => `<li class="${row.key === me ? 'me' : ''}"><span class="pos">${pos}</span><span class="nm">${esc(row.name)}<small>${esc(row.company)}${row.source === 'practice' ? ' · practice' : ''}</small></span><span class="sc">${fmt(row.score)}</span></li>`;
      const TOP = 5;
      let html = board.slice(0, TOP).map((row, i) => li(row, i + 1)).join('');
      if (rank > TOP) html += '<li class="gap">···</li>' + li(board[rank - 1], rank);
      $('#bs-lb').innerHTML = html;
      this.ovEnd.classList.add('show');
      this.ovEnd.scrollTop = 0;
    },
  };
  window.BS = BS;
})();
