'use client';
import { useEffect, useRef, useState } from 'react';

/* Layar pembuka: petir menyambar di atas langit berbintang, teks sambutan muncul,
   lalu layar memudar dan seluruh halaman "masuk" satu per satu (menu turun, huruf naik, kubus menyatu).
   Klik / tekan Enter, Spasi, atau Esc untuk melewati. Tidak tampil kalau pengguna memilih "kurangi gerakan".

   Petir digambar serealistis mungkin di <canvas> (tajam di layar HD/Retina):
   - bentuk fraktal bercabang (batang utama + cabang + ranting) yang menipis ke ujung
   - "leader" redup turun dulu, lalu sambaran balik menyala terang dan berkedip 2-3 kali
   - inti putih panas, selubung biru, dan pendar lembut (bloom) tanpa pinggiran kaku
   - awan di atas ikut tersinari, langit berkilat, percikan di titik sambar, layar sedikit bergetar

   ====== Pengaturan cepat ======
   HOLD    : lama layar pembuka tampil sebelum memudar (ms)
   STRIKES : daftar sambaran. at = mulai (ms), dur = lama leader turun (ms), seed = bentuk petir,
             x = posisi horizontal (0..1), far = petir jauh di latar (lebih kecil & redup)
   COPY    : teks sambutan [baris kecil, baris besar]
   Supaya hanya tampil sekali per sesi, ubah INTRO_ONCE di layout.js */
const HOLD = 2900;
const STRIKES = [
  { at: 300, dur: 430, seed: 7, x: 0.52 },
  { at: 980, dur: 300, seed: 41, x: 0.17, far: true },
  { at: 1650, dur: 390, seed: 23, x: 0.58 },
];
const COPY = {
  id: ['Selamat datang di', 'Portofolio'],
  en: ['Welcome to my', 'Portofolio'],
};

/* warna aksen tema (--ac) dibaca langsung dari CSS */
const rgb = (v, d) => {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(v || '').trim());
  return m ? [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16)) : d;
};

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/* >>> lightning */
/* angka acak yang selalu sama untuk seed yang sama */
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Jalur bergerigi (midpoint displacement): tiap putaran, titik tengah tiap ruas digeser menyamping
   sebanding panjang ruasnya, lalu dibelah lagi. Hasilnya fraktal, mirip sambaran asli. */
function channel(r, a, b, gens, rough = 0.42) {
  let pts = [a, b];
  for (let g = 0; g < gens; g++) {
    const out = [pts[0]];
    for (let i = 0; i < pts.length - 1; i++) {
      const p = pts[i];
      const q = pts[i + 1];
      const dx = q[0] - p[0];
      const dy = q[1] - p[1];
      const len = Math.hypot(dx, dy) || 1;
      const o = (r() - 0.5) * len * rough * (r() < 0.12 ? 1.7 : 1); // sesekali tekukan tajam
      out.push([(p[0] + q[0]) / 2 + (-dy / len) * o, (p[1] + q[1]) / 2 + (dx / len) * o], q);
    }
    pts = out;
  }
  return pts;
}

/* Satu pohon petir: batang utama dari atas, cabang yang melebar ke bawah, ranting di cabang.
   Tiap ruas menyimpan: titik, waktu tiba (t), lebar, dan terang (br). Cabang makin tipis & redup. */
function makeBolt(W, H, s, k) {
  const r = mulberry32(s.seed);
  const far = !!s.far;
  const x0 = W * (s.x + (r() - 0.5) * 0.04);
  const x1 = W * (s.x + (r() - 0.5) * 0.1);
  const y1 = H * (far ? 0.5 + r() * 0.08 : 0.93 + r() * 0.03);
  const scale = far ? 0.5 : 1;
  const WID = [2.1, 1.25, 0.82, 0.55];
  const BR = [1, 0.8, 0.6, 0.45];
  const LEN = [0, 0.07 + 0.2, 0.04 + 0.1, 0.025 + 0.05];
  const PROB = [0.075, 0.05, 0.028, 0];
  const segs = [];
  let tmax = 0;
  const trunkLen = y1 + 20;
  let side = r() < 0.5 ? 1 : -1;

  const addPoly = (pts, depth, t0) => {
    let L = 0;
    for (let i = 0; i < pts.length - 1; i++) L += Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
    let cum = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const p = pts[i];
      const q = pts[i + 1];
      const d = Math.hypot(q[0] - p[0], q[1] - p[1]);
      const f = cum / (L || 1);
      const t = t0 + cum / trunkLen;
      segs.push({
        x1: p[0], y1: p[1], x2: q[0], y2: q[1], t, d: depth,
        w: WID[depth] * (1 - 0.6 * f) * k * scale,
        br: BR[depth] * (1 - 0.3 * f) * (far ? 0.55 : 1),
      });
      cum += d;
      tmax = Math.max(tmax, t0 + cum / trunkLen);
      // cabang baru tumbuh dari titik ini
      if (depth < 3 && i > 3 && r() < PROB[depth] * (depth === 0 ? 0.5 + f : 1)) {
        const vx = q[0] - p[0];
        const vy = q[1] - p[1];
        const vl = Math.hypot(vx, vy) || 1;
        side = r() < 0.7 ? -side : side;
        const ang = side * (0.3 + r() * 0.85);
        const ca = Math.cos(ang);
        const sa = Math.sin(ang);
        let dx = (vx / vl) * ca - (vy / vl) * sa;
        let dy = (vx / vl) * sa + (vy / vl) * ca;
        if (dy < 0.22) { dy = 0.22 + r() * 0.35; const n = Math.hypot(dx, dy); dx /= n; dy /= n; } // cabang selalu condong ke bawah
        const len = H * (depth === 0 ? 0.07 + r() * 0.22 : LEN[depth + 1] * (0.6 + r() * 0.8)) * (far ? 0.6 : 1);
        const b = channel(r, q, [q[0] + dx * len, q[1] + dy * len], depth === 0 ? 6 : 5);
        addPoly(b, depth + 1, t0 + cum / trunkLen);
      }
    }
  };
  addPoly(channel(r, [x0, -24], [x1, y1], 7, 0.36), 0, 0);

  // cabang yang tumbuh paling akhir ikut menentukan lamanya leader; sambaran utama terjadi saat batang mencapai tanah
  const contact = 1 / tmax;
  return { segs, tmax, contact, x0, x1, y1, far, thr: -1, tip: [x0, 0] };
}
/* <<< lightning */

/* Awan tipis (noise fraktal) yang baru kelihatan saat tersinari kilat */
function makeClouds() {
  const w = 320;
  const h = 150;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  const img = g.createImageData(w, h);
  const hash = (x, y) => { const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return n - Math.floor(n); };
  const noise = (x, y) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    const u = xf * xf * (3 - 2 * xf);
    const v = yf * yf * (3 - 2 * yf);
    const a = hash(xi, yi);
    const b = hash(xi + 1, yi);
    const c2 = hash(xi, yi + 1);
    const d = hash(xi + 1, yi + 1);
    return a + (b - a) * u + (c2 - a) * v + (a - b - c2 + d) * u * v;
  };
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let amp = 0.5;
      let f = 0;
      let sc = 0.018;
      for (let o = 0; o < 5; o++) { f += amp * noise(x * sc + o * 17, y * sc * 1.7 + o * 9); amp *= 0.5; sc *= 2.1; }
      const edge = Math.pow(1 - y / h, 1.3); // makin ke bawah makin menghilang
      const a = clamp((f - 0.34) * 2.2, 0, 1) * edge;
      const i = (y * w + x) * 4;
      img.data[i] = 150;
      img.data[i + 1] = 168;
      img.data[i + 2] = 235;
      img.data[i + 3] = Math.round(a * 255);
    }
  }
  g.putImageData(img, 0, 0);
  return c;
}

export default function Intro() {
  const root = useRef(null);
  const cv = useRef(null);
  const [lang, setLang] = useState('id');

  useEffect(() => {
    const html = document.documentElement;
    if (html.dataset.intro !== 'on') return; // tidak aktif (kurangi gerakan / sudah pernah tampil)
    const el = root.current;
    const canvas = cv.current;
    const ctx = canvas?.getContext('2d');
    if (!el || !ctx) { delete html.dataset.intro; window.dispatchEvent(new Event('intro:done')); return; }

    try { setLang(localStorage.getItem('lang') || (navigator.language.startsWith('id') ? 'id' : 'en')); } catch {}
    window.scrollTo(0, 0);

    const ac = rgb(getComputedStyle(html).getPropertyValue('--ac'), [139, 147, 255]);
    const content = el.querySelector('.intro-c');
    const clouds = makeClouds();
    let W = 1;
    let H = 1;
    let dpr = 1;
    let raf = 0;
    let leaving = false;
    let last = 0;
    const timers = [];
    const at = (ms, fn) => timers.push(setTimeout(fn, ms));
    const bolts = STRIKES.map(() => null);
    const sparks = [];

    /* lapisan gambar petir: inti (resolusi penuh), selubung (1/2), pendar lembut (1/6 dan 1/18).
       Lapisan kecil sengaja diperbesar halus supaya pendarnya lembut tanpa pinggiran. */
    const mk = (sc) => {
      const c = document.createElement('canvas');
      c.width = Math.max(2, Math.round(W * dpr * sc));
      c.height = Math.max(2, Math.round(H * dpr * sc));
      const g = c.getContext('2d');
      g.setTransform(c.width / W, 0, 0, c.height / H, 0, 0);
      g.lineCap = 'round';
      g.lineJoin = 'round';
      return { c, g };
    };
    let L = null;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      L = { core: mk(1), hot: mk(0.5), g1: mk(1 / 6), g2: mk(1 / 18), cloud: mk(1 / 4) };
      bolts.fill(null); // bentuk petir dibuat ulang sesuai ukuran layar
    };
    resize();
    window.addEventListener('resize', resize);

    /* gambar ruas petir yang sudah "tiba" (t <= thr) ke semua lapisan */
    const paint = (b, thr, leader) => {
      const k = clamp(W / 1400, 0.75, 1.5);
      const pass = [
        [L.core, 1, 1, (c) => `rgb(${c},${c},${Math.min(255, c + 8)})`],
        [L.hot, 3.4, 1, (c) => `rgb(${c * 0.72 | 0},${c * 0.85 | 0},${c})`],
        [L.g1, 11, 1, (c) => `rgb(${c * 0.5 | 0},${c * 0.64 | 0},${c})`],
        [L.g2, 30, 1, (c) => `rgb(${c * ac[0] / 255 | 0},${c * ac[1] / 255 | 0},${c * ac[2] / 255 | 0})`],
      ];
      for (const [layer] of pass) layer.g.clearRect(0, 0, W, H);
      let tip = b.tip;
      let tipT = -1;
      for (const s of b.segs) {
        if (s.t > thr) continue;
        const c = Math.round(255 * clamp(s.br, 0, 1));
        for (const [layer, mul, , col] of pass) {
          if (leader && layer !== L.core && layer !== L.hot) continue;
          layer.g.strokeStyle = col(c);
          layer.g.lineWidth = Math.max(0.4, s.w * mul);
          layer.g.beginPath();
          layer.g.moveTo(s.x1, s.y1);
          layer.g.lineTo(s.x2, s.y2);
          layer.g.stroke();
        }
        if (s.d === 0 && s.t > tipT) { tipT = s.t; tip = [s.x2, s.y2]; }
      }
      b.tip = tip;
      b.thr = thr;
      void k;
    };

    /* kuat kilatan pada waktu tc (ms sejak batang menyentuh tanah): sambaran balik + 2 kedipan susulan */
    const envelope = (tc, slow) => {
      if (tc < 0) return 0;
      let e = 0;
      for (const [d, a, kk] of [[0, 1, 85], [125, 0.78, 70], [255, 0.52, 95]]) if (tc >= d) e = Math.max(e, a * Math.exp(-(tc - d) / kk));
      const tail = 0.3 * Math.exp(-tc / slow);
      return Math.max(e, tail);
    };

    const T0 = performance.now();
    const frame = (now) => {
      const t = now - T0;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now;
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 1;

      // cahaya lembut di belakang teks
      const pulse = 0.5 + 0.5 * Math.sin(t / 520);
      const amb = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.5);
      const fade = clamp(t / 900, 0, 1);
      amb.addColorStop(0, `rgba(${ac[0]},${ac[1]},${ac[2]},${(0.1 + 0.05 * pulse) * fade * fade * (3 - 2 * fade)})`);
      amb.addColorStop(1, `rgba(${ac[0]},${ac[1]},${ac[2]},0)`);
      ctx.fillStyle = amb;
      ctx.fillRect(0, 0, W, H);

      let shake = 0;
      let light = 0;
      STRIKES.forEach((s, i) => {
        if (t < s.at) return;
        const b = bolts[i] || (bolts[i] = makeBolt(W, H, s, clamp(W / 1400, 0.75, 1.5)));
        const g = t - s.at;
        const contactAt = s.dur * b.contact;
        const tc = g - contactAt;
        const slow = s.far ? 380 : i === 0 ? 560 : 820;
        const env = envelope(tc, slow) * (s.far ? 0.5 : 1);
        const flick = tc > 0 && tc < 700 ? 0.86 + 0.14 * Math.random() : 1;
        const bright = clamp(env * flick, 0, 1);

        // 1) leader redup yang turun bercabang-cabang
        if (tc < 0) {
          const thr = Math.round(clamp(g / s.dur, 0, 1) * b.tmax * 90) / 90;
          if (thr !== b.thr) paint(b, thr, true);
          ctx.globalAlpha = s.far ? 0.3 : 0.55;
          ctx.drawImage(L.core.c, 0, 0, W, H);
          ctx.globalAlpha = s.far ? 0.1 : 0.28;
          ctx.drawImage(L.hot.c, 0, 0, W, H);
          const tg = ctx.createRadialGradient(b.tip[0], b.tip[1], 0, b.tip[0], b.tip[1], 22);
          tg.addColorStop(0, `rgba(235,242,255,${s.far ? 0.25 : 0.6})`);
          tg.addColorStop(1, 'rgba(120,160,255,0)');
          ctx.globalAlpha = 1;
          ctx.fillStyle = tg;
          ctx.fillRect(b.tip[0] - 22, b.tip[1] - 22, 44, 44);
          return;
        }

        // 2) sambaran balik: seluruh pohon menyala
        if (b.thr !== b.tmax + 1) paint(b, b.tmax + 1, false);
        light = Math.max(light, bright * (s.far ? 0.4 : 1));
        if (!s.far && tc < 200) shake = Math.max(shake, Math.exp(-tc / 55));

        // awan tersinari + langit berkilat di sekitar petir
        if (!s.far) {
          if (b.cloudFor !== W) {
            const g2 = L.cloud.g;
            g2.save();
            g2.globalCompositeOperation = 'source-over';
            g2.clearRect(0, 0, W, H);
            g2.drawImage(clouds, 0, -H * 0.04, W, H * 0.56);
            g2.globalCompositeOperation = 'destination-in';
            const m = g2.createRadialGradient(b.x0, H * 0.05, 0, b.x0, H * 0.05, W * 0.55);
            m.addColorStop(0, 'rgba(0,0,0,1)');
            m.addColorStop(1, 'rgba(0,0,0,0)');
            g2.fillStyle = m;
            g2.fillRect(0, 0, W, H);
            g2.restore();
            b.cloudImg = document.createElement('canvas');
            b.cloudImg.width = L.cloud.c.width;
            b.cloudImg.height = L.cloud.c.height;
            b.cloudImg.getContext('2d').drawImage(L.cloud.c, 0, 0);
            b.cloudFor = W;
          }
          const ce = envelope(tc, 650) * 0.8;
          ctx.globalAlpha = clamp(ce * 0.9, 0, 1);
          ctx.drawImage(b.cloudImg, 0, 0, W, H);
        }

        // kilatan layar (eksposur) + pendar besar di sekitar petir
        ctx.globalAlpha = 1;
        const wash = ctx.createRadialGradient(b.x0, H * 0.3, 0, b.x0, H * 0.3, Math.max(W, H) * 0.75);
        wash.addColorStop(0, `rgba(185,205,255,${0.3 * bright * (s.far ? 0.5 : 1)})`);
        wash.addColorStop(1, 'rgba(185,205,255,0)');
        ctx.fillStyle = wash;
        ctx.fillRect(0, 0, W, H);

        // pendar → selubung → inti
        ctx.globalAlpha = clamp(bright * 0.7, 0, 1);
        ctx.drawImage(L.g2.c, 0, 0, W, H);
        ctx.globalAlpha = clamp(bright * 0.85, 0, 1);
        ctx.drawImage(L.g1.c, 0, 0, W, H);
        ctx.globalAlpha = clamp(bright * 0.95, 0, 1);
        ctx.drawImage(L.hot.c, 0, 0, W, H);
        ctx.globalAlpha = clamp(bright * 1.1, 0, 1);
        ctx.drawImage(L.core.c, 0, 0, W, H);

        // titik sambar: kilau + kabut tanah + percikan
        if (!s.far) {
          if (!b.hit) {
            b.hit = true;
            for (let n = 0; n < 22; n++) {
              const a = -Math.PI * (0.08 + Math.random() * 0.84);
              const v = 140 + Math.random() * 460;
              sparks.push({ x: b.x1, y: b.y1, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.45 + Math.random() * 0.7, age: 0 });
            }
          }
          ctx.globalAlpha = 1;
          const R = 190 * clamp(W / 1400, 0.75, 1.4);
          const fl = ctx.createRadialGradient(b.x1, b.y1, 0, b.x1, b.y1, R);
          fl.addColorStop(0, `rgba(255,255,255,${0.9 * bright})`);
          fl.addColorStop(0.18, `rgba(190,215,255,${0.5 * bright})`);
          fl.addColorStop(1, 'rgba(100,140,255,0)');
          ctx.fillStyle = fl;
          ctx.fillRect(b.x1 - R, b.y1 - R, R * 2, R * 2);
          const hz = ctx.createLinearGradient(0, H * 0.78, 0, H);
          hz.addColorStop(0, 'rgba(120,150,255,0)');
          hz.addColorStop(1, `rgba(120,150,255,${0.26 * bright})`);
          ctx.fillStyle = hz;
          ctx.fillRect(0, H * 0.78, W, H * 0.22);
        }
      });

      // percikan (arang) yang terlempar dari titik sambar
      ctx.globalAlpha = 1;
      ctx.lineCap = 'round';
      for (let n = sparks.length - 1; n >= 0; n--) {
        const p = sparks[n];
        p.age += dt;
        if (p.age >= p.life) { sparks.splice(n, 1); continue; }
        p.vy += 900 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        const a = 1 - p.age / p.life;
        ctx.strokeStyle = `rgba(215,230,255,${a})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 0.03, p.y - p.vy * 0.03);
        ctx.stroke();
      }

      // teks ikut tersinari kilat, dan sedikit bergetar saat menyambar
      if (content) {
        content.style.filter = light > 0.01 ? `brightness(${(1 + light * 0.85).toFixed(3)})` : '';
        content.style.translate = shake > 0.02 ? `${((Math.random() - 0.5) * 7 * shake).toFixed(1)}px ${((Math.random() - 0.5) * 5 * shake).toFixed(1)}px` : '';
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    /* Selesai: halaman dilepas (animasi masuk mulai), layar pembuka memudar */
    const leave = (fast) => {
      if (leaving) return;
      leaving = true;
      window.removeEventListener('keydown', onKey);
      el.classList.add('out');
      if (fast) el.classList.add('fast');
      html.dataset.intro = 'out';
      try { sessionStorage.setItem('intro', '1'); } catch {}
      window.dispatchEvent(new Event('intro:done'));
      at(fast ? 600 : 1150, () => { cancelAnimationFrame(raf); delete html.dataset.intro; });
    };
    const onClick = () => leave(true);
    const onKey = (e) => {
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); leave(true); }
    };
    el.addEventListener('click', onClick);
    window.addEventListener('keydown', onKey);

    at(350, () => el.classList.add('s1'));
    at(900, () => el.classList.add('s2'));
    at(1600, () => el.classList.add('s3'));
    at(HOLD, () => leave(false));
    at(HOLD + 5000, () => leave(true)); // pengaman: halaman tidak mungkin tertahan

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', onKey);
      el.removeEventListener('click', onClick);
    };
  }, []);

  const [small, big] = COPY[lang] ?? COPY.id;
  return (
    <div className="intro" ref={root} aria-hidden="true">
      <canvas ref={cv} />
      <div className="intro-c">
        <p className="intro-t1">{small}</p>
        <h2 className="intro-t2 cond">{big}</h2>
        <i className="intro-bar" />
      </div>
      <span className="intro-skip">{lang === 'en' ? 'Click to skip' : 'Klik untuk lewati'}</span>
    </div>
  );
}