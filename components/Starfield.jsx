'use client';
import { useEffect, useRef } from 'react';

/* Langit berbintang di belakang seluruh halaman: bintang berkelip dan melayang pelan,
   bergeser mengikuti kursor dan saat halaman di-scroll (efek kedalaman), kabut cahaya yang bergerak lambat,
   dan sesekali bintang jatuh. Berhenti otomatis saat tab tidak aktif.

   ====== Pengaturan cepat ======
   DENSITY : makin kecil = bintang makin banyak (1 bintang per sekian px²)
   MAX     : batas jumlah bintang
   DRIFT   : kecepatan melayang naik (px/detik; bintang dekat lebih cepat)
   PARALLAX: seberapa jauh bintang dekat bergeser mengikuti kursor (px)
   SCROLL  : seberapa banyak bintang ikut bergeser saat scroll (0 = tidak ikut)
   SHOOT   : jeda (detik) antar bintang jatuh [min, maks] */
const DENSITY = 8500;
const MAX = 260;
const DRIFT = 5;
const PARALLAX = 24;
const SCROLL = 0.14;
const SHOOT = [6, 12];

/* warna aksen tema (--ac) dibaca langsung dari CSS */
const rgb = (v, d) => {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(v || '').trim());
  return m ? [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16)) : d;
};

export default function Starfield() {
  const ref = useRef(null);

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext('2d');
    if (!cv || !ctx) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const css = getComputedStyle(document.documentElement);
    const ac = rgb(css.getPropertyValue('--ac'), [139, 147, 255]);
    const ac2 = rgb(css.getPropertyValue('--ac2'), [90, 99, 240]);
    const deep = ac2.map((v, i) => Math.round(v + ([10, 12, 60][i] - v) * 0.25)); // biru tua untuk kabut

    // lingkaran cahaya kecil untuk bintang terang
    const sprite = document.createElement('canvas');
    sprite.width = 64;
    sprite.height = 64;
    {
      const g = sprite.getContext('2d');
      const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, 'rgba(255,255,255,1)');
      gr.addColorStop(0.25, 'rgba(200,215,255,.35)');
      gr.addColorStop(1, 'rgba(200,215,255,0)');
      g.fillStyle = gr;
      g.fillRect(0, 0, 64, 64);
    }

    // posisi disimpan 0..1 supaya ukuran layar berubah tidak mengacak ulang bintang
    const stars = Array.from({ length: MAX }, () => {
      const d = 0.15 + Math.random() * 0.85;
      const tint = Math.random() < 0.14;
      return {
        x: Math.random(), y: Math.random(), d,
        r: 0.35 + d * 1.1, a: 0.28 + d * 0.62,
        sp: 0.6 + Math.random() * 1.8, ph: Math.random() * 6.283,
        glow: d > 0.86 && Math.random() < 0.7,
        c: tint ? `rgb(${ac[0]},${ac[1]},${ac[2]})` : 'rgb(226,233,255)',
      };
    });

    let W = 1;
    let H = 1;
    let n = 0;
    let raf = 0;
    let last = 0;
    let t = 0;
    let mx = 0;
    let my = 0;
    let tx = 0;
    let ty = 0;
    let shoot = null;
    let nextShoot = 4;

    const nebula = (cx, cy, r, c, a) => {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},${a})`);
      g.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const big = Math.max(W, H);
      nebula(W * (0.18 + 0.05 * Math.sin(t * 0.07)), H * (0.3 + 0.06 * Math.cos(t * 0.05)), big * 0.55, deep, 0.2);
      nebula(W * (0.86 + 0.04 * Math.cos(t * 0.06)), H * (0.78 + 0.05 * Math.sin(t * 0.08)), big * 0.5, ac, 0.1);

      const sy = window.scrollY * SCROLL;
      for (let i = 0; i < n; i++) {
        const s = stars[i];
        let x = (s.x * W + mx * PARALLAX * s.d) % W;
        if (x < 0) x += W;
        let y = (s.y * H - t * DRIFT * s.d - sy * s.d) % H;
        if (y < 0) y += H;
        const a = s.a * (0.62 + 0.38 * Math.sin(t * s.sp + s.ph));
        if (s.glow) {
          const R = s.r * 7;
          ctx.globalAlpha = a * 0.55;
          ctx.drawImage(sprite, x - R, y - R, R * 2, R * 2);
        }
        ctx.globalAlpha = a;
        ctx.fillStyle = s.c;
        ctx.beginPath();
        ctx.arc(x, y, s.r, 0, 6.283);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // bintang jatuh
      if (shoot) {
        const k = shoot.age / shoot.life;
        const hx = shoot.x + shoot.vx * shoot.age;
        const hy = shoot.y + shoot.vy * shoot.age;
        const len = 170;
        const sp = Math.hypot(shoot.vx, shoot.vy);
        const ex = hx - (shoot.vx / sp) * len;
        const ey = hy - (shoot.vy / sp) * len;
        const al = Math.sin(Math.PI * k);
        const g = ctx.createLinearGradient(hx, hy, ex, ey);
        g.addColorStop(0, `rgba(255,255,255,${0.9 * al})`);
        g.addColorStop(0.3, `rgba(${ac[0]},${ac[1]},${ac[2]},${0.45 * al})`);
        g.addColorStop(1, `rgba(${ac[0]},${ac[1]},${ac[2]},0)`);
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(hx, hy);
        ctx.lineTo(ex, ey);
        ctx.stroke();
      }
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      n = Math.min(MAX, Math.round((W * H) / DENSITY));
      if (reduce) draw();
    };
    resize();
    window.addEventListener('resize', resize);

    if (reduce) return () => window.removeEventListener('resize', resize);

    const frame = (now) => {
      raf = 0;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now;
      t += dt;
      const k = 1 - Math.exp(-dt * 3);
      mx += (tx - mx) * k;
      my += (ty - my) * k;

      if (shoot) { shoot.age += dt; if (shoot.age >= shoot.life) shoot = null; }
      else if (t > nextShoot) {
        const a = 0.45 + Math.random() * 0.3;
        const v = 1000 + Math.random() * 500;
        shoot = { x: W * (0.3 + Math.random() * 0.65), y: H * Math.random() * 0.35, vx: -Math.cos(a) * v, vy: Math.sin(a) * v, age: 0, life: 0.85 };
        nextShoot = t + SHOOT[0] + Math.random() * (SHOOT[1] - SHOOT[0]);
      }

      draw();
      raf = requestAnimationFrame(frame);
    };
    const kick = () => { if (!raf && !document.hidden) { last = 0; raf = requestAnimationFrame(frame); } };
    const onVis = () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else kick(); };
    const onMove = (e) => {
      if (e.pointerType !== 'mouse') return;
      tx = (e.clientX / W - 0.5) * 2;
      ty = (e.clientY / H - 0.5) * 2;
    };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('pointermove', onMove, { passive: true });
    kick();

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={ref} className="stars" aria-hidden="true" />;
}