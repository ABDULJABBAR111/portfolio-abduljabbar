'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

/* ====== Pengaturan cepat ======
   STEP   : sudut antar kartu pada cincin 3D (makin besar = makin miring)
   RADIUS : jari-jari cincin. Makin KECIL = kartu makin RAPAT
   SPIN   : jarak scroll (px) yang dibutuhkan untuk memutar 1 kartu */
const STEP = (36 * Math.PI) / 180;
const RADIUS = 1.5;
const SPIN = 280;

const mod = (a, n) => ((a % n) + n) % n;

function Chevron({ dir }) {
  const rot = { up: 180, down: 0, left: 90, right: -90 }[dir];
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ transform: `rotate(${rot}deg)` }} aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

/* Carousel 3D berbentuk cincin.
   axis="x" : berputar kiri-kanan (dipakai untuk Projek)
   axis="y" : berputar atas-bawah (dipakai untuk Sertifikat)
   wheel    : geser horizontal saat kursor di atas carousel memutar kartu
   drag     : geser dengan mouse / jari (hanya untuk axis x) */
export default function Coverflow({ items, render, axis = 'x', wheel = false, drag = false, label, prevLabel, nextLabel, live, liveLabel }) {
  const n = items.length;
  const vertical = axis === 'y';
  const stage = useRef(null);
  const cards = useRef([]);
  const s = useRef({ cur: 0, target: 0, raf: 0, size: 300, idle: 0, drag: null, block: false, reduce: false, gesture: false, base: 0 });
  const [active, setActive] = useState(0);

  /* Menaruh setiap kartu pada posisi cincin sesuai nilai putaran saat ini */
  const paint = useCallback(() => {
    const st = s.current;
    if (!n) return;
    const R = st.size * RADIUS;
    cards.current.forEach((el, i) => {
      if (!el) return;
      const raw = mod(i - st.cur + n / 2, n) - n / 2; // jarak ke kartu depan, berputar tanpa ujung
      const abs = Math.abs(raw);
      const a = Math.max(-2.6, Math.min(2.6, raw)) * STEP;
      const pos = R * Math.sin(a);
      const z = R * (Math.cos(a) - 1);
      const sc = 1 - 0.08 * Math.min(abs, 2);
      const deg = ((vertical ? -a : a) * 180) / Math.PI;
      const op = abs <= 1.6 ? 1 : Math.max(0, 1 - (abs - 1.6) / 0.6);
      el.style.transform = vertical
        ? `translate3d(0,${pos}px,${z}px) rotateX(${deg}deg) scale(${sc})`
        : `translate3d(${pos}px,0,${z}px) rotateY(${deg}deg) scale(${sc})`;
      el.style.opacity = String(op);
      el.style.zIndex = String(100 - Math.round(abs * 10));
      el.style.visibility = op < 0.02 ? 'hidden' : 'visible';
      el.style.pointerEvents = op > 0.4 ? 'auto' : 'none';
      el.style.setProperty('--dim', (Math.min(abs, 1.5) * 0.38).toFixed(3));
      // kartu depan tajam; makin jauh makin blur. Berubah halus mengikuti scroll/geser
      const bmax = vertical ? 3 : 8;
      el.style.setProperty('--blur', `${(Math.min(Math.max(abs - 0.12, 0), 1) * bmax).toFixed(2)}px`);
      el.dataset.on = abs < 0.5 ? '1' : '0';
    });
    setActive(mod(Math.round(st.cur), n));
  }, [n, vertical]);

  /* Animasi halus: posisi menyusul target sedikit demi sedikit */
  const tick = useCallback(() => {
    const st = s.current;
    const diff = st.target - st.cur;
    if (Math.abs(diff) < 0.0006) { st.cur = st.target; st.raf = 0; paint(); return; }
    st.cur += st.reduce ? diff : diff * 0.11;
    paint();
    st.raf = requestAnimationFrame(tick);
  }, [paint]);

  const kick = useCallback(() => { if (!s.current.raf) s.current.raf = requestAnimationFrame(tick); }, [tick]);

  /* Ukur ukuran kartu, gambar ulang saat ukuran layar berubah */
  useEffect(() => {
    const el = stage.current;
    if (!el || !n) return;
    const st = s.current;
    st.reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const measure = () => {
      const c = cards.current[0];
      if (c) { st.size = vertical ? c.offsetHeight : c.offsetWidth; paint(); }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => { ro.disconnect(); cancelAnimationFrame(st.raf); st.raf = 0; };
  }, [n, vertical, paint]);

  /* Hanya saat kursor berada di atas carousel: geser horizontal (trackpad / shift+scroll) memutar kartu.
     Scroll vertikal tetap menggulir halaman seperti biasa, jadi halaman tidak ikut memutar kartu. */
  useEffect(() => {
    const el = stage.current;
    const st = s.current;
    if (!wheel || !n || !el || st.reduce) return;
    let idle = 0;
    const onWheel = (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      if (!st.gesture) { st.gesture = true; st.base = Math.round(st.target); }
      st.target += Math.max(-80, Math.min(80, e.deltaX)) / SPIN;
      kick();
      clearTimeout(idle);
      idle = setTimeout(() => {
        const delta = st.target - st.base;
        const steps = Math.abs(delta) > 0.12 ? Math.max(1, Math.round(Math.abs(delta))) * Math.sign(delta) : 0;
        st.target = st.base + steps;
        st.gesture = false;
        kick();
      }, 150);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => { el.removeEventListener('wheel', onWheel); clearTimeout(idle); };
  }, [wheel, n, kick]);

  if (!n) return null;

  const go = (d) => { const st = s.current; st.target = Math.round(st.target) + d; kick(); };
  const goTo = (i) => {
    const st = s.current;
    const base = Math.round(st.target);
    let k = mod(i - base, n);
    if (k > n / 2) k -= n;
    st.target = base + k;
    kick();
  };

  const onKey = (e) => {
    const back = vertical ? 'ArrowUp' : 'ArrowLeft';
    const fwd = vertical ? 'ArrowDown' : 'ArrowRight';
    if (e.key === fwd) { e.preventDefault(); go(1); }
    else if (e.key === back) { e.preventDefault(); go(-1); }
  };

  const down = (e) => {
    if (!drag || vertical || (e.pointerType === 'mouse' && e.button !== 0)) return;
    s.current.drag = { x: e.clientX, t: s.current.target, id: e.pointerId, moved: false };
  };
  const move = (e) => {
    const st = s.current;
    const d = st.drag;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 8) {
      d.moved = true;
      try { e.currentTarget.setPointerCapture(d.id); } catch {}
    }
    if (d.moved) { st.target = d.t - dx / (st.size * 0.85); kick(); }
  };
  const up = () => {
    const st = s.current;
    if (st.drag?.moved) {
      st.target = Math.round(st.target);
      kick();
      st.block = true;
      setTimeout(() => { st.block = false; }, 60);
    }
    st.drag = null;
  };

  const prev = (
    <button type="button" className="cf-btn" onClick={() => go(-1)} aria-label={prevLabel}><Chevron dir={vertical ? 'up' : 'left'} /></button>
  );
  const next = (
    <button type="button" className="cf-btn" onClick={() => go(1)} aria-label={nextLabel}><Chevron dir={vertical ? 'down' : 'right'} /></button>
  );
  const count = <span className="cf-count" aria-live="polite">{String(active + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>;

  return (
    <div className={`cf ${vertical ? 'y' : 'x'}`}>
      {vertical && n > 1 && <div className="cf-ctrl">{prev}{count}</div>}

      <div
        ref={stage}
        className={`cf-stage ${drag && !vertical ? 'can-drag' : ''}`}
        role="group"
        aria-roledescription="carousel"
        aria-label={label}
        tabIndex={0}
        onKeyDown={onKey}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onClickCapture={(e) => { if (s.current.block) { e.preventDefault(); e.stopPropagation(); } }}
      >
        {items.map((it, i) => (
          <div
            key={it.id ?? i}
            ref={(el) => { cards.current[i] = el; }}
            className="cf-card"
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} / ${n}`}
            onClick={(e) => { if (active !== i) { e.preventDefault(); goTo(i); } }}
          >
            {render(it, i, active === i)}
          </div>
        ))}
      </div>

      {n > 1 && (vertical ? (
        <div className="cf-ctrl">{next}</div>
      ) : (
        <div className="cf-ctrl">
          {prev}
          <div className="cf-dots">
            {items.map((it, i) => {
              const on = !!live?.(it);
              return (
                <button key={i} type="button" className="cf-dot" data-live={on ? '1' : undefined} title={on ? liveLabel : undefined}
                  aria-label={`${i + 1} / ${n}${on && liveLabel ? ` · ${liveLabel}` : ''}`} aria-current={active === i} onClick={() => goTo(i)} />
              );
            })}
          </div>
          {next}
        </div>
      ))}
    </div>
  );
}