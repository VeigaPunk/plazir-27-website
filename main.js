/* PLAZIR-27 — generative ASCII hero + boot + reveal
   The field: two reaching traces converge at center — the touch.
   Characters morph; the pointer bends the field. */

(() => {
  'use strict';
  document.documentElement.classList.add('js');

  /* ---------- boot overlay ---------- */
  const boot = document.getElementById('boot');
  const LINES = [
    ['> incoming transmission ............', 'dim'],
    ['> substrate: ufo-fsd / doctrine loaded', ''],
    ['> lanes: kimi · grok · sol · luna · spark · ds · qwen · OX-ALPHA', ''],
    ['> xask dry rule ............ ARMED', ''],
    ['> cache-on-spawn ........... WARM', ''],
    ['> frontier is not a place.', 'dim'],
    ['', ''],
    ['> launch_', ''],
  ];
  let bi = 0;
  const bootNext = () => {
    if (bi >= LINES.length) { finishBoot(); return; }
    const [txt, cls] = LINES[bi++];
    const el = document.createElement('span');
    el.className = 'bline' + (cls ? ' ' + 'b' + cls : '');
    el.textContent = txt;
    boot.appendChild(el);
    setTimeout(bootNext, txt ? 90 : 30);
  };
  const finishBoot = () => {
    setTimeout(() => boot.classList.add('done'), 350);
  };
  boot.addEventListener('click', finishBoot);
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    LINES.forEach(([t, c]) => {
      const el = document.createElement('span');
      el.className = 'bline' + (c ? ' b' + c : '');
      el.textContent = t;
      boot.appendChild(el);
    });
    finishBoot();
  } else {
    setTimeout(bootNext, 200);
  }

  /* ---------- ASCII hero field ---------- */
  const gridEl = document.getElementById('asciigrid');
  const CHW = 7.2, CHH = 13;          // cell px approx at 11px/13px
  const RAMP = ' ·:;=+*#%@';
  let cols = 0, rows = 0, cells = null;
  let mx = -1e4, my = -1e4;           // pointer
  let t = 0;

  function size() {
    cols = Math.min(260, Math.ceil(window.innerWidth / CHW));
    rows = Math.min(120, Math.ceil(window.innerHeight / CHH));
    cells = new Float32Array(cols * rows);
  }
  size();
  window.addEventListener('resize', size);

  window.addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; });
  window.addEventListener('pointerleave', () => { mx = my = -1e4; });

  /* The touch: two fingertips reaching toward center on a diagonal.
     dL / dR — distance to each hand's trace; where they meet, it sparks. */
  function field(c, r, time) {
    const u = c / cols, v = r / rows;              // 0..1
    const cx = 0.5, cy = 0.44;                     // meeting point

    // left hand trace: approaches from upper-left, slight curl
    const lx = 0.16 + 0.28 * v + 0.02 * Math.sin(v * 9 + time * .6);
    const dL = Math.abs(u - lx) * 1.15 + Math.max(0, v - cy) * .6;
    // right hand trace: approaches from lower-right
    const rx = 0.86 - 0.30 * (1 - v) + 0.02 * Math.sin(v * 8 - time * .5);
    const dR = Math.abs(u - rx) * 1.15 + Math.max(0, cy - v) * .6;

    // spark at the gap between fingertips
    const ds = Math.hypot(u - cx, (v - cy) * 1.35);
    const spark = Math.exp(-ds * 26) * (0.75 + 0.25 * Math.sin(time * 7));

    // ambient plasma
    const plasma =
      0.16 * Math.sin(u * 14 + time * .8) * Math.cos(v * 11 - time * .6) +
      0.10 * Math.sin((u + v) * 22 + time * 1.3);

    // pointer ripple
    const pm = Math.hypot((u * cols * CHW - mx) / 90, (v * rows * CHH - my) / 90);
    const ripple = pm < 6 ? 0.35 * Math.exp(-pm * pm * .4) * (0.6 + 0.4 * Math.sin(time * 5 - pm * 3)) : 0;

    const hands = Math.exp(-dL * 34) + Math.exp(-dR * 34);
    return hands * .8 + spark * 1.6 + plasma + ripple;
  }

  let last = 0;
  function frame(ts) {
    requestAnimationFrame(frame);
    if (ts - last < 66) return;                    // ~15fps, terminal cadence
    last = ts;
    t = ts / 1000;

    // fade the field out as you scroll past the hero
    const sc = window.scrollY / Math.max(1, window.innerHeight);
    const fade = sc > 1 ? 0 : 1 - sc * .85;
    if (fade <= 0) { if (gridEl.textContent) gridEl.textContent = ''; return; }

    let out = '';
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let v = field(c, r, t) * fade;
        if (v < 0.02) { out += ' '; continue; }
        let idx = (v * (RAMP.length - 1)) | 0;
        if (idx >= RAMP.length) idx = RAMP.length - 1;
        out += RAMP[idx];
      }
      out += '\n';
    }
    gridEl.textContent = out;
  }
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    requestAnimationFrame(frame);
  } else {
    // static single render
    let out = '';
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let v = field(c, r, 1.7);
        let idx = Math.min(RAMP.length - 1, Math.max(0, (v * (RAMP.length - 1)) | 0));
        out += v < 0.02 ? ' ' : RAMP[idx];
      }
      out += '\n';
    }
    gridEl.textContent = out;
  }

  /* ---------- scroll reveal ---------- */
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } });
  }, { threshold: 0.08 });
  document.querySelectorAll('.rv').forEach((el) => io.observe(el));
})();
