'use client';
import { useEffect, useMemo, useRef, useState } from 'react';

/* ====== Pengaturan cepat ======
   FLY     : lama dasar satu ikon terbang (detik). Makin jauh asalnya, makin lama
   STAGGER : sebaran waktu berangkat antar ikon (detik, total)
   SCATTER : lama animasi buyar (detik)
   REGROUP : jeda setelah buyar sebelum ikon terbang kembali (ms)
   DEPTH   : seberapa jauh ikon berangkat di kedalaman 3D (px)
   PERSP   : harus sama dengan `perspective` pada .tl-field di CSS */
const FLY = 1.7;
const STAGGER = 1.1;
const SCATTER = 1.7;
const REGROUP = 1900;
const DEPTH = 420;
const PERSP = 900;

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
/* Warna cadangan untuk tool tanpa warna khas: diturunkan dari namanya */
const hue = (s) => { let h = 0; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) % 360; return `hsl(${h} 85% 70%)`; };
/* Dibulatkan 2 desimal: Math.sin bisa beda di digit terakhir antara server dan browser, dan itu memicu error hydration */
const r2 = (v) => Math.round(v * 100) / 100;
const rnd = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

/* Posisi tiap ikon dihitung dari urutannya (tanpa angka acak saat render).
   Desktop : dua baris selang-seling (pola sarang) yang memenuhi lebar panel.
   HP      : grid 4 kolom. Semua dalam persen terhadap area ikon (di atas judul). */
function layout(n) {
  const cols = Math.max(1, Math.ceil(n / 2));
  const mcols = 4;
  const rows = Math.max(1, Math.ceil(n / mcols));
  const items = Array.from({ length: n }, (_, i) => {
    const row = i % 2;
    const k = Math.floor(i / 2);
    const col = i % mcols;
    const mrow = Math.floor(i / mcols);
    return {
      hx: r2(n < 4 ? 50 + (i - (n - 1) / 2) * 16 : 8 + ((k + row * 0.5) / (cols - 0.5)) * 84),
      hy: r2(row ? 79 + Math.sin(k * 1.7 + 1) * 3 : 46 + Math.sin(k * 1.7) * 3),
      mx: r2(14 + col * 24),
      my: r2((rows === 1 ? 60 : 33 + mrow * (54 / (rows - 1))) + (col % 2 ? 3 : -3)),
      r: ((i * 37) % 17) - 8,
    };
  });
  return { items, rows };
}

/* Titik awal di LUAR layar (koordinat viewport): kiri, kanan, atau bawah */
function origin(i, run, vw, vh) {
  const e = (i + run) % 3;
  const a = 0.12 + rnd(i * 3.1 + run * 7.3) * 0.76;
  const pad = 240;
  if (e === 0) return { x: -pad, y: vh * a };
  if (e === 1) return { x: vw + pad, y: vh * a };
  return { x: vw * a, y: vh + pad };
}

/* Lintasan terbang: kurva melengkung dari luar layar ke slot.
   Ikon condong mengikuti arah terbang (seperti roket), makin dekat makin besar (kedalaman 3D),
   lalu mendarat dengan sedikit membal. off = titik awal relatif terhadap slot (px). */
function flightFrames(off, r, side) {
  const C = { x: off.x * 0.5 + side * 120, y: off.y * 0.5 - 60 };
  const N = 44;
  const PATH = 0.88;
  const frames = [];
  for (let k = 0; k <= N; k++) {
    const u = k / N;
    const t = 1 - Math.pow(1 - u, 2.4); // melaju lalu mengerem pelan saat tiba
    const m = 1 - t;
    const x = m * m * off.x + 2 * m * t * C.x;
    const y = m * m * off.y + 2 * m * t * C.y;
    const vx = 2 * m * (C.x - off.x) - 2 * t * C.x;
    const vy = 2 * m * (C.y - off.y) - 2 * t * C.y;
    const lean = clamp((Math.atan2(vx, -vy) * 180) / Math.PI, -70, 70);
    const w = smooth(0.6, 1, u);
    const ang = lean * (1 - w) + r * w;
    const sc = 0.45 + 0.55 * smooth(0, 1, u);
    const z = -DEPTH * Math.pow(m, 1.15);
    frames.push({
      offset: u * PATH,
      opacity: Math.min(1, u / 0.12),
      transform: `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotate(${ang.toFixed(1)}deg) scale(${sc.toFixed(3)})`,
    });
  }
  const home = (s) => `translate3d(0px, 0px, 0px) rotate(${r}deg) scale(${s})`;
  frames.push({ offset: 0.94, opacity: 1, transform: home(1.08) });
  frames.push({ offset: 1, opacity: 1, transform: home(1) });
  return frames;
}

/* Buyar: sedikit menyusut dulu (aba-aba), lalu melayang menjauh sambil mundur ke kedalaman, melambat halus */
function burstFrames(r, v) {
  const at = (x, y, z, a, s) => `translate3d(${x}px, ${y}px, ${z}px) rotate(${a}deg) scale(${s})`;
  return [
    { transform: at(0, 0, 0, r, 1), offset: 0, easing: 'cubic-bezier(.3, 0, .4, 1)' },
    { transform: at(0, 0, 0, r, 0.9), offset: 0.1, easing: 'cubic-bezier(.3, .08, .2, 1)' },
    { transform: at(v.x, v.y, -380, v.a, 0.55), offset: 1 },
  ];
}

/* Ikon tool: saat panel terlihat, tiap ikon terbang sebagai roket dari LUAR layar menuju slotnya.
   Klik dua kali pada ikon -> semuanya buyar dengan halus, lalu terbang kembali ke slot masing-masing.
   icons : { 'Next.js': 'path svg', ... } dari server. Awalan "stroke:" = ikon garis.
   Nama tanpa logo tampil sebagai singkatan 2 huruf. title tampil di bagian bawah panel. */
export default function ToolsOrbit({ title, tools = [], icons = {}, colors = {} }) {
  const list = useMemo(() => tools.filter(Boolean), [tools]);
  const { items, rows } = useMemo(() => layout(list.length), [list.length]);
  const root = useRef(null);
  const stage = useRef(null);
  const field = useRef(null);
  const btns = useRef([]);
  const anims = useRef([]);
  const reduce = useRef(false);
  const [phase, setPhase] = useState('wait'); // wait -> fly -> placed -> burst -> fly ...
  const [run, setRun] = useState(0);
  const [pop, setPop] = useState(null);

  const stopAll = () => {
    anims.current.forEach((a) => { try { a.cancel(); } catch {} });
    anims.current = [];
    btns.current.forEach((b) => { if (b) b.dataset.fly = ''; });
  };

  /* Mulai saat panel terlihat di layar */
  useEffect(() => {
    if (phase !== 'wait') return;
    const el = root.current;
    if (!el) return;
    reduce.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce.current || !('IntersectionObserver' in window) || !el.animate) { setPhase('placed'); return; }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { io.disconnect(); setPhase('fly'); }
    }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, [phase]);

  /* Terbang: setiap ikon berangkat dari luar layar dengan lintasan melengkung */
  useEffect(() => {
    if (phase !== 'fly') return;
    const st = stage.current;
    const fd = field.current;
    if (!st || !fd) return;
    let dead = false;
    stopAll(); // pastikan semua ikon di posisi slot sebelum diukur
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const F = fd.getBoundingClientRect();
    // titik hilang perspektif; titik awal dikoreksi supaya setelah diperkecil 3D tetap di luar layar
    const P = { x: F.left + F.width / 2, y: F.top + F.height * 0.85 };
    const k0 = PERSP / (PERSP + DEPTH);
    const jobs = [];
    btns.current.forEach((el, i) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const s = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      const D = origin(i, run, vw, vh);
      const off = { x: P.x + (D.x - P.x) / k0 - s.x, y: P.y + (D.y - P.y) / k0 - s.y };
      const dur = Math.min(2.8, FLY + Math.hypot(off.x, off.y) / 1800) * 1000;
      const side = ((i + run) % 2 ? 1 : -1) * (0.8 + rnd(i + 3) * 0.5);
      const delay = rnd(i * 1.7 + run * 3.3) * STAGGER * 1000;
      el.dataset.fly = '1';
      const a = el.animate(flightFrames(off, items[i].r, side), { duration: dur, delay, easing: 'linear', fill: 'both' });
      anims.current.push(a);
      a.finished.then(() => { el.dataset.fly = ''; }).catch(() => {});
      jobs.push(a.finished);
    });
    Promise.all(jobs).then(() => { if (!dead) setPhase('placed'); }).catch(() => {});
    return () => { dead = true; stopAll(); };
  }, [phase, run, items]);

  /* Setelah buyar: jeda sebentar, lalu terbang kembali */
  useEffect(() => {
    if (phase !== 'burst') return;
    const t = setTimeout(() => { setRun((r) => r + 1); setPhase('fly'); }, REGROUP);
    return () => clearTimeout(t);
  }, [phase]);

  /* Buyar: ikon terlempar menjauh dari ikon yang diklik, merambat seperti gelombang */
  const burst = (k) => {
    if (phase !== 'placed' || reduce.current) return;
    const st = stage.current;
    const els = btns.current;
    const a = els[k]?.getBoundingClientRect();
    if (!st || !a) return;
    const S = st.getBoundingClientRect();
    const cx = a.left + a.width / 2;
    const cy = a.top + a.height / 2;
    stopAll();
    els.forEach((el, i) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = r.left + r.width / 2 - cx;
      const dy = r.top + r.height / 2 - cy;
      const dist = Math.hypot(dx, dy);
      const ang = (dist > 1 ? Math.atan2(dy, dx) : Math.random() * Math.PI * 2) + (Math.random() - 0.5) * 0.9;
      const far = 280 + Math.random() * 260;
      const v = {
        x: Math.round(Math.cos(ang) * far),
        y: Math.round(Math.sin(ang) * far),
        a: items[i].r + Math.round((Math.random() - 0.5) * 640),
      };
      const wave = Math.min(0.32, dist / 2400);
      anims.current.push(
        el.animate(burstFrames(items[i].r, v), { duration: SCATTER * 1000, delay: wave * 1000, fill: 'both' }),
        el.animate([{ opacity: 1 }, { opacity: 1, offset: 0.3 }, { opacity: 0 }], { duration: 1150, delay: (wave + 0.3) * 1000, easing: 'ease-in-out', fill: 'both' }),
      );
    });
    setPop({ x: cx - S.left, y: cy - S.top, k: Date.now() });
    setPhase('burst');
  };

  /* Efek magnet 3D: ikon condong dan bergeser halus ke arah kursor.
     Dihitung per frame dengan penghalusan (lerp), jadi geraknya mengalir tanpa patah-patah. */
  useEffect(() => {
    if (phase !== 'placed' || reduce.current) return;
    const host = stage.current;
    const fd = field.current;
    if (!host || !fd) return;
    const RANGE = 200;
    const els = btns.current.slice(0, list.length);
    const glyphs = els.map((b) => b && b.querySelector('.tl-g'));
    const cur = els.map(() => ({ x: 0, y: 0, rx: 0, ry: 0, s: 1, k: 0 }));
    const m = { x: 0, y: 0, on: false };
    let raf = 0;

    const frame = () => {
      raf = 0;
      const F = fd.getBoundingClientRect();
      const phone = window.matchMedia('(max-width: 700px)').matches;
      let busy = false;
      glyphs.forEach((g, i) => {
        if (!g) return;
        const it = items[i];
        const cx = F.left + (F.width * (phone ? it.mx : it.hx)) / 100;
        const cy = F.top + (F.height * (phone ? it.my : it.hy)) / 100;
        const dx = m.x - cx;
        const dy = m.y - cy;
        const d = Math.hypot(dx, dy) || 1;
        const p = m.on ? Math.max(0, 1 - d / RANGE) : 0;
        const e = p * p * (3 - 2 * p);
        const T = { x: (dx / d) * 9 * e, y: (dy / d) * 9 * e, rx: -(dy / d) * 18 * e, ry: (dx / d) * 18 * e, s: 1 + 0.18 * e, k: e };
        const c = cur[i];
        for (const key in T) {
          c[key] += (T[key] - c[key]) * 0.14;
          if (Math.abs(T[key] - c[key]) > 0.002) busy = true;
        }
        g.style.transform = `translate3d(${c.x.toFixed(2)}px, ${c.y.toFixed(2)}px, 0) perspective(420px) rotateX(${c.rx.toFixed(2)}deg) rotateY(${c.ry.toFixed(2)}deg) scale(${c.s.toFixed(3)})`;
        els[i].style.setProperty('--k', c.k.toFixed(3));
      });
      if (busy) raf = requestAnimationFrame(frame);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
    const move = (e) => { if (e.pointerType !== 'mouse') return; m.x = e.clientX; m.y = e.clientY; m.on = true; kick(); };
    const leave = () => { m.on = false; kick(); };

    host.addEventListener('pointermove', move);
    host.addEventListener('pointerleave', leave);
    return () => {
      host.removeEventListener('pointermove', move);
      host.removeEventListener('pointerleave', leave);
      cancelAnimationFrame(raf);
      glyphs.forEach((g, i) => { if (g) g.style.transform = ''; els[i]?.style.removeProperty('--k'); });
    };
  }, [phase, list.length, items]);

  if (!list.length) return null;

  return (
    <section className="tl" ref={root} data-phase={phase}>
      <div className="tl-stage" ref={stage} style={{ '--shm': `${Math.max(320, rows * 88 + 150)}px` }}>
        <div className="tl-bg" aria-hidden="true">
          <i className="tl-blob a" /><i className="tl-blob b" /><i className="tl-blob c" />
          <i className="tl-grid" /><i className="tl-ring" /><i className="tl-ring b" />
        </div>

        <div className="tl-field" ref={field} role="group" aria-label={typeof title === 'string' ? title : undefined}>
          {list.map((name, i) => {
            const it = items[i];
            const d = icons[name];
            const line = typeof d === 'string' && d.startsWith('stroke:');
            return (
              <button
                key={name}
                ref={(el) => { btns.current[i] = el; }}
                type="button"
                className="tl-i"
                aria-label={name}
                tabIndex={phase === 'wait' ? -1 : 0}
                onDoubleClick={() => burst(i)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); burst(i); } }}
                style={{
                  '--hx': it.hx, '--hy': it.hy, '--mx': it.mx, '--my': it.my, '--r': `${it.r}deg`,
                  '--fd': `${(4.6 + ((i * 7) % 5) * 0.8).toFixed(1)}s`,
                  '--fl': `${(-i * 0.9).toFixed(1)}s`,
                  '--bc': colors[name] || hue(name),
                }}
              >
                <i className="tl-jet" aria-hidden="true" />
                <span className="tl-f">
                  <span className="tl-g">
                    {d ? (
                      <svg viewBox="0 0 24 24" className={line ? 'st' : undefined} aria-hidden="true"><path d={line ? d.slice(7) : d} /></svg>
                    ) : (
                      <b className="tl-m" aria-hidden="true">{String(name).slice(0, 2)}</b>
                    )}
                  </span>
                  <em className="tl-n" aria-hidden="true">{name}</em>
                </span>
              </button>
            );
          })}
        </div>

        <div className="tl-title">{title}</div>

        {pop && <i key={pop.k} className="tl-pop" style={{ left: pop.x, top: pop.y }} aria-hidden="true" />}
      </div>
    </section>
  );
}