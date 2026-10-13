'use client';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { T } from '@/lib/i18n';
import Coverflow from '@/components/Coverflow';
import ToolsOrbit from '@/components/ToolsOrbit';
import ServiceArt, { HUES, kindOf } from '@/components/ServiceArt';

const FOTO = '/foto-aj2.png'; /* file ada di folder public/ */
const NAME = 'Abdul Jabbar';
const CV = '/cv-abdul-jabbar.pdf'; /* file ada di folder public/ */
// ISI username kamu (atau isi p.github / p.instagram di data profil)
const GITHUB_URL = 'https://github.com/USERNAME_KAMU';
const INSTAGRAM_URL = 'https://instagram.com/abd_jbbrrr';
const WA_NUMBER = '6288296272131';
const INITIALS = NAME.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

/* Koneksi ke Supabase untuk pengunjung + like/dislike */
const SB = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const sb = (path, opt = {}) =>
  fetch(`${SB.replace(/\/+$/, '').replace(/\/rest\/v1$/, '')}/rest/v1/${path}`, {
    ...opt,
    headers: { apikey: KEY, 'Content-Type': 'application/json' },
  });

/* Teks muncul kata per kata saat elemen masuk layar */
function W({ text = '', as: Tag = 'span', delay = 0, step = 55, className = '', ...rest }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let io;
    const start = () => {
      if (!('IntersectionObserver' in window)) { setOn(true); return; }
      io = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } },
        { threshold: 0.1 }
      );
      io.observe(el);
    };
    // selama layar pembuka tampil, teks menunggu dulu supaya animasinya tidak terlewat
    if (document.documentElement.dataset.intro === 'on') window.addEventListener('intro:done', start, { once: true });
    else start();
    return () => { io?.disconnect(); window.removeEventListener('intro:done', start); };
  }, []);

  const words = String(text ?? '').split(' ');
  return (
    <Tag ref={ref} className={`rv ${on ? 'in' : ''} ${className}`.trim()} {...rest}>
      {words.map((w, i) => (
        <Fragment key={`${i}-${w}`}>
          <span className="w" style={{ '--d': `${delay + i * step}ms` }}>{w}</span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </Tag>
  );
}

/* Isi detail tiap layanan (urut sesuai kartu). Bisa ditimpa lewat kolom items_id / items_en (array) di Supabase */
const ITEMS = {
  id: [
    ['Riset pengguna dan persona', 'Wireframe dan alur pengguna', 'Desain antarmuka (UI)', 'Pengujian kegunaan'],
    ['Website responsif dan cepat', 'Next.js / React / Laravel', 'Integrasi API dan database', 'SEO dan optimasi performa'],
    ['Animasi dan transisi halus', 'Micro-interaction', 'Efek hover dan scroll', 'Pengalaman yang ramah aksesibilitas'],
    ['Prototipe interaktif', 'Alur pengguna lengkap', 'Uji ide sebelum dibangun', 'Serah terima ke developer'],
    ['Pustaka komponen', 'Warna, tipografi, dan spacing', 'Dokumentasi pemakaian', 'Konsisten di semua halaman'],
  ],
  en: [
    ['User research and personas', 'Wireframes and user flows', 'Interface (UI) design', 'Usability testing'],
    ['Fast, responsive websites', 'Next.js / React / Laravel', 'API and database integration', 'SEO and performance tuning'],
    ['Smooth animation and transitions', 'Micro-interactions', 'Hover and scroll effects', 'Accessibility-friendly experiences'],
    ['Interactive prototypes', 'Complete user flows', 'Test ideas before building', 'Developer handoff'],
    ['Component library', 'Color, type, and spacing tokens', 'Usage documentation', 'Consistency across every page'],
  ],
};

/* Kartu layanan: kaca bertema + ilustrasi vektor HD.
   Gerak miring, angkat, dan pantulan cahaya dihitung per frame dengan efek pegas (bukan transisi CSS),
   jadi mengalir halus di layar 60/120Hz dan tidak patah saat kursor berpindah cepat. */
function ServiceCard({ s, i, f, t, onOpen }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  const M = useRef({ tx: 0, ty: 0, tl: 0, x: 0, y: 0, l: 0, tmx: 0, tmy: 0, mx: 0, my: 0, raf: 0, last: 0, still: true });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) { setOn(true); return; }
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const tick = useCallback((now) => {
    const el = ref.current;
    const m = M.current;
    if (!el) return;
    const dt = Math.min(0.05, (now - (m.last || now)) / 1000);
    m.last = now;
    const kt = 1 - Math.exp(-dt * 8);   // miring & parallax: lembut
    const kl = 1 - Math.exp(-dt * 6);   // angkat: sedikit lebih pelan
    const kc = 1 - Math.exp(-dt * 18);  // cahaya: cepat menyusul kursor
    m.x += (m.tx - m.x) * kt; m.y += (m.ty - m.y) * kt; m.l += (m.tl - m.l) * kl;
    m.mx += (m.tmx - m.mx) * kc; m.my += (m.tmy - m.my) * kc;
    el.style.setProperty('--rx', `${(-m.y * 7).toFixed(3)}deg`);
    el.style.setProperty('--ry', `${(m.x * 8).toFixed(3)}deg`);
    el.style.setProperty('--px', m.x.toFixed(4));
    el.style.setProperty('--py', m.y.toFixed(4));
    el.style.setProperty('--lift', m.l.toFixed(4));
    el.style.setProperty('--mx', `${m.mx.toFixed(1)}px`);
    el.style.setProperty('--my', `${m.my.toFixed(1)}px`);
    const rest = m.tl === 0 && Math.abs(m.x) < 0.002 && Math.abs(m.y) < 0.002 && m.l < 0.002;
    if (rest) { m.raf = 0; m.last = 0; return; }
    m.raf = requestAnimationFrame(tick);
  }, []);

  const kick = () => { if (!M.current.raf) M.current.raf = requestAnimationFrame(tick); };
  useEffect(() => () => cancelAnimationFrame(M.current.raf), []);

  const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const enter = (e) => {
    if (e.pointerType !== 'mouse' || reduce()) return;
    const el = ref.current;
    const r = el.getBoundingClientRect();
    const m = M.current;
    m.tl = 1;
    m.mx = m.tmx = e.clientX - r.left; m.my = m.tmy = e.clientY - r.top; // cahaya langsung muncul di posisi kursor
    kick();
  };
  const move = (e) => {
    if (e.pointerType !== 'mouse' || reduce()) return;
    const r = ref.current.getBoundingClientRect();
    const m = M.current;
    m.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
    m.ty = ((e.clientY - r.top) / r.height) * 2 - 1;
    m.tmx = e.clientX - r.left; m.tmy = e.clientY - r.top;
    m.tl = 1;
    kick();
  };
  const leave = () => { const m = M.current; m.tx = 0; m.ty = 0; m.tl = 0; kick(); };
  const focus = () => { if (reduce()) return; M.current.tl = 1; kick(); };

  const hue = HUES[i % HUES.length];
  return (
    <button
      type="button"
      ref={ref}
      className={`svc ${on ? 'in' : ''}`}
      style={{ '--d': `${i * 90}ms`, '--h': hue }}
      onPointerEnter={enter}
      onPointerMove={move}
      onPointerLeave={leave}
      onFocus={focus}
      onBlur={leave}
      onClick={() => onOpen(i)}
      aria-haspopup="dialog"
      aria-label={`${f(s, 'title')}: ${t.open}`}
    >
      {s.image_url
        ? <span className="svc-img" aria-hidden="true" style={{ backgroundImage: `url(${s.image_url})` }} />
        : <span className="svc-art" aria-hidden="true"><ServiceArt kind={kindOf(s, i)} hue={hue} /></span>}
      <span className="svc-scrim" aria-hidden="true" />
      <span className="svc-sheen" aria-hidden="true" />
      <span className="svc-no" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
      <span className="svc-plus" aria-hidden="true">+</span>
      <W as="span" className="svc-title" text={f(s, 'title')} delay={i * 90} />
      <span className="svc-hint">{t.open}</span>
    </button>
  );
}

/* Jendela detail layanan (memakai <dialog> bawaan: Esc, fokus, dan klik luar sudah otomatis) */
function ServiceDialog({ item, index, lang, t, f, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (item && !d.open) d.showModal();
    if (!item && d.open) d.close();
  }, [item]);

  const dlgMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--px', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
    e.currentTarget.style.setProperty('--py', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
  };
  const dlgLeave = (e) => { e.currentTarget.style.setProperty('--px', '0'); e.currentTarget.style.setProperty('--py', '0'); };

  const custom = item?.[`items_${lang}`];
  const list = Array.isArray(custom) && custom.length ? custom : ITEMS[lang]?.[index] ?? [];

  return (
    <dialog
      ref={ref}
      className="dlg"
      aria-labelledby="dlg-title"
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) ref.current.close(); }}
    >
      {item && (
        <div className="dlg-box" style={{ '--h': HUES[index % HUES.length] }}>
          <button type="button" className="dlg-x" onClick={() => ref.current.close()} aria-label={t.close}>✕</button>
          <div className="dlg-media" onPointerMove={dlgMove} onPointerLeave={dlgLeave}>
            {item.image_url
              ? <span className="svc-img" aria-hidden="true" style={{ backgroundImage: `url(${item.image_url})` }} />
              : <ServiceArt kind={kindOf(item, index)} hue={HUES[index % HUES.length]} />}
          </div>
          <div className="dlg-body">
            <h3 id="dlg-title" className="cond">{f(item, 'title')}</h3>
            <p>{f(item, 'desc')}</p>
            {list.length > 0 && (
              <>
                <p className="dlg-sub">{t.includes}</p>
                <ul className="dlg-list">
                  {list.map((x, k) => <li key={x} style={{ '--d': `${200 + k * 90}ms` }}>{x}</li>)}
                </ul>
              </>
            )}
            <a href="#kontak" className="dlg-cta" onClick={() => ref.current.close()}>{t.discuss}</a>
          </div>
        </div>
      )}
    </dialog>
  );
}

/* Kartu miring 3D: mengikuti arah kursor (hanya mouse; sentuhan diabaikan) */
function Tilt({ as: Tag = 'div', max = 10, className = '', children, ...rest }) {
  const ref = useRef(null);
  const move = (e) => {
    if (e.pointerType !== 'mouse') return;
    const el = ref.current;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty('--ry', `${((x - 0.5) * max * 2).toFixed(2)}deg`);
    el.style.setProperty('--rx', `${((0.5 - y) * max * 2).toFixed(2)}deg`);
    el.style.setProperty('--gx', `${(x * 100).toFixed(1)}%`);
    el.style.setProperty('--gy', `${(y * 100).toFixed(1)}%`);
    el.dataset.on = '1';
  };
  const leave = () => {
    const el = ref.current;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
    delete el.dataset.on;
  };
  return (
    <Tag ref={ref} className={`tilt ${className}`.trim()} onPointerMove={move} onPointerLeave={leave} {...rest}>
      {children}
    </Tag>
  );
}

/* Ikon garis untuk lapisan "Browser" */
const BROWSER_ICON = 'stroke:M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z M2 9h20 M5.5 7h.01 M8.5 7h.01';

/* Adegan 3D: empat lapisan aplikasi (Browser, Next.js, Laravel, MySQL) bertumpuk secara isometrik.
   Tumpukan berayun pelan, lapisan melayang bergantian, cahaya data naik-turun menembus semua lapisan,
   dan saat kursor di atasnya lapisan merenggang. Seluruh adegan juga miring mengikuti kursor. */
function StackScene({ icons = {}, en }) {
  const layers = [
    { n: 'Web', sub: en ? 'Development' : 'Pengembangan', svg: 'stroke:M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18z M3 12h18 M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z' },
    { n: 'UI/UX', sub: en ? 'Interface & experience' : 'Antarmuka & pengalaman', svg: 'stroke:M3 5h18v14H3z M3 9.5h18 M9 9.5V19' },
    { n: 'Prototyping', sub: en ? 'Interactive flows' : 'Alur interaktif', svg: 'stroke:M5 4h5v5H5z M14 15h5v5h-5z M10 6.5h2a3 3 0 0 1 3 3v5.5' },
    { n: 'Design System', sub: en ? 'Components & tokens' : 'Komponen & token', svg: 'stroke:M4 4h6.5v6.5H4z M13.5 4H20v6.5h-6.5z M4 13.5h6.5V20H4z M13.5 13.5H20V20h-6.5z' },
  ];
  return (
    <Tilt className="st3" max={9}>
      <div className="st3-glow" aria-hidden="true" />
      <div
        className="st3-scene"
        role="img"
        aria-label={en
          ? 'Four layers of what I do: web, UI/UX, prototyping, and design systems'
          : 'Empat lapisan yang saya kerjakan: web, UI/UX, prototyping, dan design system'}
      >
        <div className="st3-stack">
          {layers.map((x, i) => {
            const d = x.svg;
            const line = typeof d === 'string' && d.startsWith('stroke:');
            return (
              <div className="st3-layer" key={x.n} style={{ '--i': i }}>
                <span className="st3-slab">
                  <span className="st3-ico">
                    {d ? <svg viewBox="0 0 24 24" className={line ? 'st' : undefined}><path d={line ? d.slice(7) : d} /></svg> : <b>{x.n.slice(0, 2)}</b>}
                  </span>
                  <span className="st3-lab"><b>{x.n}</b><small>{x.sub}</small></span>
                </span>
              </div>
            );
          })}
          <i className="st3-pkt" style={{ '--d': '0s' }} />
          <i className="st3-pkt" style={{ '--d': '-1.2s' }} />
          <i className="st3-pkt" style={{ '--d': '-2.4s' }} />
        </div>
      </div>
    </Tilt>
  );
}

/* Perjalanan: garis waktu yang menggambar dirinya saat terlihat, lalu kartu muncul satu per satu */
function StatusCard({ en }) {
  const [t, setT] = useState('');
  useEffect(() => {
    const tick = () => setT(new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Asia/Jakarta' }).format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="st-card">
      <div className="st-top">
        <span className="st-live"><i />{en ? 'Available for projects' : 'Tersedia untuk proyek'}</span>
      </div>
      <div className="st-clock" aria-label="WIB">{t || '--:--:--'}<small>WIB</small></div>
      <div className="st-meta">
        <span><b>&lt; 24{en ? ' h' : ' jam'}</b>{en ? 'Reply time' : 'Waktu balas'}</span>
        <span><b>Bogor</b>{en ? 'Based in' : 'Berdomisili'}</span>
        <span><b>Remote</b>{en ? 'Work style' : 'Cara kerja'}</span>
      </div>
    </div>
  );
}

function ContactForm({ en, email }) {
  const [f, setF] = useState({ name: '', mail: '', msg: '', bot: '' });
  const [st, setSt] = useState('idle');
  const KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;
  const set = (k) => (e) => setF((v) => ({ ...v, [k]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault();
    if (f.bot) return;
    if (!KEY) {
      const sub = encodeURIComponent(en ? `Message from ${f.name}` : `Pesan dari ${f.name}`);
      const body = encodeURIComponent(`${f.msg}\n\n- ${f.name} (${f.mail})`);
      window.location.href = `mailto:${email}?subject=${sub}&body=${body}`;
      return;
    }
    setSt('busy');
    try {
      const r = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ access_key: KEY, name: f.name, email: f.mail, message: f.msg, subject: `Portfolio: ${f.name}`, from_name: 'Portfolio' }),
      });
      const j = await r.json();
      if (j.success) { setSt('ok'); setF({ name: '', mail: '', msg: '', bot: '' }); } else setSt('err');
    } catch { setSt('err'); }
  };
  return (
    <form className="cform" onSubmit={submit}>
      <h4>{en ? 'Send me a message' : 'Kirim pesan'}</h4>
      <div className="cf-2">
        <label><span>{en ? 'Name' : 'Nama'}</span><input required value={f.name} onChange={set('name')} placeholder={en ? 'Your name' : 'Nama kamu'} autoComplete="name" /></label>
        <label><span>Email</span><input required type="email" value={f.mail} onChange={set('mail')} placeholder="nama@email.com" autoComplete="email" /></label>
      </div>
      <label><span>{en ? 'Message' : 'Pesan'}</span><textarea required rows={4} value={f.msg} onChange={set('msg')} placeholder={en ? 'Tell me about your project…' : 'Ceritakan kebutuhan kamu…'} /></label>
      <input className="cf-bot" tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.bot} onChange={set('bot')} />
      <button type="submit" disabled={st === 'busy'}>
        {st === 'busy' ? (en ? 'Sending…' : 'Mengirim…') : (en ? 'Send message' : 'Kirim pesan')} <i aria-hidden="true">→</i>
      </button>
      <p className={`cf-note ${st}`} role="status">
        {st === 'ok' ? (en ? 'Sent! I will reply soon.' : 'Terkirim! Saya segera balas.') : st === 'err' ? (en ? 'Failed to send. Please try again or email me directly.' : 'Gagal terkirim. Coba lagi atau email langsung.') : ''}
      </p>
    </form>
  );
}

function Journey({ en }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) { setOn(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const items = en
    ? [
        { y: '2022', t: 'Started Informatics Engineering', s: 'Universitas Pamulang' },
        { y: '2025 – 2026', t: 'Marketing Operational', s: 'Quinn Photo Studio' },
        { y: '2026', t: 'Informatics Engineering graduate', s: 'GPA 3.54' },
        { y: 'Now', t: 'Open to work', s: 'Full-Stack Web Developer' },
      ]
    : [
        { y: '2022', t: 'Mulai kuliah Teknik Informatika', s: 'Universitas Pamulang' },
        { y: '2025 – 2026', t: 'Marketing Operational', s: 'Quinn Photo Studio' },
        { y: '2026', t: 'Lulusan Teknik Informatika', s: 'IPK 3,54' },
        { y: 'Sekarang', t: 'Terbuka untuk kerja', s: 'Full-Stack Web Developer' },
      ];
  const rowRef = useRef(null);
  useEffect(() => {
    const row = rowRef.current;
    if (!row || !window.matchMedia('(hover: hover)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lis = Array.from(row.querySelectorAll('li'));
    const st = { tx: 0, x: 0, a: 0, ta: 0, raf: 0, last: 0 };
    const tick = (now) => {
      const dt = Math.min(0.05, (now - (st.last || now)) / 1000);
      st.last = now;
      st.x += (st.tx - st.x) * (1 - Math.exp(-dt * 9));
      st.a += (st.ta - st.a) * (1 - Math.exp(-dt * 6));
      const r = row.getBoundingClientRect();
      row.style.setProperty('--ox', `${st.x.toFixed(1)}px`);
      row.style.setProperty('--oa', st.a.toFixed(3));
      lis.forEach((li) => {
        const lr = li.getBoundingClientRect();
        const d = Math.abs(st.x - (lr.left + 8 - r.left));
        const pr = Math.max(0, 1 - d / (r.width / lis.length)) ** 1.6;
        li.style.setProperty('--pr', pr.toFixed(3));
        li.style.setProperty('--pull', (((st.x - (lr.left + lr.width / 2 - r.left)) / lr.width) * st.a).toFixed(3));
      });
      if (Math.abs(st.tx - st.x) > 0.2 || Math.abs(st.ta - st.a) > 0.002) st.raf = requestAnimationFrame(tick);
      else { st.raf = 0; st.last = 0; }
    };
    const wake = () => { if (!st.raf) st.raf = requestAnimationFrame(tick); };
    const move = (e) => {
      const r = row.getBoundingClientRect();
      st.tx = Math.max(8, Math.min(r.width, e.clientX - r.left));
      if (!st.ta) st.x = st.tx;
      st.ta = 1;
      wake();
    };
    const leave = () => { st.ta = 0; wake(); };
    const host = row.parentElement;
    host.addEventListener('pointermove', move);
    host.addEventListener('pointerleave', leave);
    return () => { host.removeEventListener('pointermove', move); host.removeEventListener('pointerleave', leave); cancelAnimationFrame(st.raf); };
  }, []);
  return (
    <div className={`jr ${on ? 'in' : ''}`} ref={ref} style={{ '--n': items.length }}>
      <p className="jr-cap">{en ? 'My journey' : 'Perjalanan saya'}</p>
      <ol className="jr-row" ref={rowRef}>
        <i className="jr-line" aria-hidden="true" />
        <i className="jr-orb" aria-hidden="true" />
        {items.map((it, i) => (
          <li key={it.t} style={{ '--i': i }}>
            <i className="jr-dot" aria-hidden="true" />
            <Tilt className="jr-card" max={10}>
              <small>{it.y}</small>
              <b>{it.t}</b>
              <span>{it.s}</span>
            </Tilt>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* Pratinjau langsung website projek: halaman asli dimuat lebih besar lalu diperkecil agar muat di bingkai browser.
   Skeleton tetap tampil sampai halamannya selesai dimuat. */
function LivePreview({ src, title }) {
  const box = useRef(null);
  const [ready, setReady] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dim, setDim] = useState({ s: 0.4, h: 900 });
  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setReady(true), 4000); // cadangan kalau onLoad tidak terpanggil
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => {
      const s = el.clientWidth / 1280;
      if (s > 0) setDim({ s, h: el.clientHeight / s });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <span className={`pj-live ${ready ? 'on' : ''}`} ref={box}>
      {mounted && (
        <iframe
          src={src}
          title={title}
          tabIndex={-1}
          aria-hidden="true"
          sandbox="allow-scripts allow-same-origin"
          referrerPolicy="no-referrer"
          onLoad={() => setReady(true)}
          style={{ width: 1280, height: dim.h, transform: `scale(${dim.s})` }}
        />
      )}
    </span>
  );
}

/* Kartu unduh CV: kertas CV 3D yang miring mengikuti kursor, tombol dengan status mengunduh -> selesai */
function CvCard({ en }) {
  const [st, setSt] = useState('idle'); // idle -> busy -> done -> idle
  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const start = () => {
    if (st !== 'idle') return;
    setSt('busy');
    timers.current.push(setTimeout(() => setSt('done'), 1400), setTimeout(() => setSt('idle'), 4200));
  };
  const label = st === 'busy' ? (en ? 'Downloading…' : 'Mengunduh…') : st === 'done' ? (en ? 'Downloaded' : 'Terunduh') : (en ? 'Download CV' : 'Unduh CV');
  return (
    <Tilt className="cv" max={3}>
      <span className="cv-paper" aria-hidden="true">
        <span className="cv-sheet">
          <i className="cv-head"><b /><u /></i>
          <i className="cv-l w3" /><i className="cv-l w2" /><i className="cv-l w1" />
        </span>
      </span>
      <span className="cv-info">
        <b className="cv-title">Curriculum Vitae</b>
        <small className="cv-meta">PDF · 175 KB</small>
      </span>
      <span className="cv-act">
        <a className="cv-alt" href={CV} target="_blank" rel="noreferrer">{en ? 'View' : 'Lihat'}</a>
        <a className="cv-btn" data-st={st} href={CV} download="CV_Abdul_Jabbar.pdf" onClick={start}>
          <i className="cv-fill" aria-hidden="true" />
          <svg viewBox="0 0 24 24" aria-hidden="true">
            {st === 'done' ? <path d="m5 12.5 4.5 4.5L19 7.5" /> : <path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 20h14" />}
          </svg>
          <span>{label}</span>
        </a>
      </span>
    </Tilt>
  );
}

/* Ikon perisai untuk lencana sertifikasi */
function Shield() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.5 4.5 5.5v6c0 4.6 3.1 8.4 7.5 10 4.4-1.6 7.5-5.4 7.5-10v-6z" />
      <path d="m8.6 12.2 2.4 2.4 4.4-4.8" />
    </svg>
  );
}

/* Jendela detail sertifikat: data singkat + daftar unit kompetensi */
function CertDialog({ item, lang, t, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (item && !d.open) d.showModal();
    if (!item && d.open) d.close();
  }, [item]);

  const L = (k) => item?.[`${k}_${lang}`];
  const units = item?.[`units_${lang}`] ?? [];
  const meta = item
    ? [[t.cName, item.name], [t.cQual, L('qual')], [t.cArea, L('area')], [t.cReg, item.reg], [t.cDate, L('date')], [t.cValid, L('valid')], [t.cBody, item.issuer]].filter(([, v]) => v)
    : [];

  return (
    <dialog
      ref={ref}
      className="dlg"
      aria-labelledby="cdl-title"
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) ref.current.close(); }}
    >
      {item && (
        <div className="dlg-box cdl">
          <button type="button" className="dlg-x" onClick={() => ref.current.close()} aria-label={t.close}>✕</button>
          <div className="cdl-side">
            <span className="cdl-badge" aria-hidden="true"><Shield /></span>
            <small className="cdl-kick">{t.certOne}</small>
            <h3 id="cdl-title" className="cond">{L('title')}</h3>
            <dl className="cdl-meta">
              {meta.map(([k, v], i) => (
                <div key={k} style={{ '--d': `${150 + i * 70}ms` }}><dt>{k}</dt><dd>{v}</dd></div>
              ))}
            </dl>
            {item.pdf && (
              <>
                <a className="dlg-cta" href={item.pdf} target="_blank" rel="noreferrer">{t.certPdf} ↗</a>
                {item.pdfMissing && process.env.NODE_ENV !== 'production' && (
                  <p className="cdl-warn">File PDF belum ada. Taruh di folder <code>public</code> dengan nama <code>{String(item.pdf).replace(/^\//, '')}</code>, lalu muat ulang halaman.</p>
                )}
              </>
            )}
          </div>
          {units.length > 0 && (
            <div className="cdl-units">
              <p className="cdl-ut">{item?.[`unitsLabel_${lang}`] ?? t.units}<em>{units.length}</em></p>
              <ol className="cdl-list">
                {units.map((u, k) => (
                  <li key={u} style={{ '--d': `${200 + k * 70}ms` }}><span>{String(k + 1).padStart(2, '0')}</span>{u}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </dialog>
  );
}

/* Jumlah pengunjung + tombol suka / tidak suka.
   Kalau statistik gagal dimuat, buka alamat situs dengan tambahan ?debug=1 untuk melihat penyebabnya. */
const ls = {
  get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
  del: (k) => { try { localStorage.removeItem(k); } catch {} },
};

function Reactions({ t }) {
  const [s, setS] = useState({ visits: 0, likes: 0, dislikes: 0 });
  const [mine, setMine] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [dbg, setDbg] = useState(false);

  const fail = (e) => { console.error(e); setErr(String(e?.message || e)); };

  const load = async () => {
    const r = await sb('site_stats?id=eq.1&select=visits,likes,dislikes', { cache: 'no-store' });
    if (!r.ok) throw new Error(`Baca gagal ${r.status}: ${await r.text()}`);
    const rows = await r.json();
    if (!rows[0]) throw new Error('Baris id=1 belum ada di tabel site_stats');
    setS(rows[0]);
    setErr('');
  };

  useEffect(() => {
    setMine(ls.get('vote'));
    setDbg(/[?&]debug\b/.test(window.location.search));
    (async () => {
      try {
        if (!SB || !KEY) throw new Error('Env Supabase belum terisi di Vercel (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY), lalu Redeploy');
        if (!ls.get('visited')) {
          const r = await sb('rpc/increment_visit', { method: 'POST', body: '{}' });
          if (!r.ok) throw new Error(`Kunjungan gagal ${r.status}: ${await r.text()}`);
          ls.set('visited', '1');
        }
        await load();
      } catch (e) { fail(e); }
    })();
  }, []);

  const vote = async (kind) => {
    if (busy) return;
    const next = mine === kind ? null : kind; // klik lagi = batalkan
    setBusy(true);
    try {
      if (!SB || !KEY) throw new Error('Env Supabase belum terisi');
      const r = await sb('rpc/vote', { method: 'POST', body: JSON.stringify({ new_kind: next, old_kind: mine }) });
      if (!r.ok) throw new Error(`Vote gagal ${r.status}: ${await r.text()}`);
      if (next) ls.set('vote', next);
      else ls.del('vote');
      setMine(next);
      await load();
    } catch (e) { fail(e); }
    setBusy(false);
  };

  return (
    <>
      <p className="rate">{t.rate}</p>
      <ul className="stats">
        <li><b>{s.visits}</b>{t.views}</li>
        <li>
          <button type="button" className={`react ${mine === 'like' ? 'on' : ''}`} onClick={() => vote('like')} disabled={busy} aria-pressed={mine === 'like'} aria-label="Like">
            👍 <b>{s.likes}</b>
          </button>
        </li>
        <li>
          <button type="button" className={`react ${mine === 'dislike' ? 'on' : ''}`} onClick={() => vote('dislike')} disabled={busy} aria-pressed={mine === 'dislike'} aria-label="Dislike">
            👎 <b>{s.dislikes}</b>
          </button>
        </li>
      </ul>
      {dbg && err ? <p role="alert" style={{ flexBasis: '100%', margin: 0, fontSize: '.78rem', color: '#ff8a8a', wordBreak: 'break-word' }}>{err}</p> : null}
    </>
  );
}

/* Hero: bola cahaya dengan cincin orbit. Murni CSS (hanya transform dan opacity), tanpa canvas, jadi ringan dan scroll tetap mulus.
   Animasi otomatis berhenti saat hero tidak terlihat di layar. */
function HeroOrb() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) delete el.dataset.off; else el.dataset.off = '1'; }, { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div className="cutout orb3" ref={ref} aria-hidden="true">
      <i className="orb3-glow" />
      <div className="orb3-rings">
        <span className="orb3-ring r1"><i /></span>
        <span className="orb3-ring r2"><i /><i className="b" /></span>
        <span className="orb3-ring r3"><i /></span>
      </div>
      <div className="orb3-core"><i className="orb3-spec" /></div>
      <i className="orb3-sp s1" /><i className="orb3-sp s2" /><i className="orb3-sp s3" /><i className="orb3-sp s4" /><i className="orb3-sp s5" />
    </div>
  );
}

export default function Portfolio({ data }) {
  const { profile: p, services, projects } = data;
  const certificates = data.certificates ?? [];
  const [lang, setLang] = useState('id');
  const [openCert, setOpenCert] = useState(null);
  const [openSvc, setOpenSvc] = useState(null);
  const stageRef = useRef(null);
  const topRef = useRef(null);
  const navRef = useRef(null);
  const [active, setActive] = useState('');

  /* Header: progres scroll, bar memadat saat digulir, dan menu aktif mengikuti bagian yang sedang dilihat */
  useEffect(() => {
    const ids = ['tentang', 'projek', 'kontak'];
    let raf = 0;
    const run = () => {
      raf = 0;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const bar = topRef.current;
      if (bar) {
        bar.style.setProperty('--p', max > 0 ? Math.min(1, y / max).toFixed(4) : '0');
        bar.dataset.stuck = y > 24 ? '1' : '0';
      }
      let cur = '';
      const line = window.innerHeight * 0.4;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) cur = id;
      }
      if (max > 0 && y >= max - 4) cur = ids[ids.length - 1];
      setActive((p) => (p === cur ? p : cur));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(run); };
    run();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(raf); };
  }, []);

  /* Penanda menu bergeser ke tautan yang aktif */
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const place = () => {
      const a = nav.querySelector('a[aria-current="true"]');
      if (!a) { nav.style.setProperty('--io', '0'); return; }
      nav.style.setProperty('--ix', `${a.offsetLeft}px`);
      nav.style.setProperty('--iw', `${a.offsetWidth}px`);
      nav.style.setProperty('--io', '1');
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(nav);
    return () => ro.disconnect();
  }, [active, lang]);

  useEffect(() => {
    const saved = localStorage.getItem('lang') || (navigator.language.startsWith('id') ? 'id' : 'en');
    setLang(saved);
    document.documentElement.lang = saved;
  }, []);

  /* Hero interaktif: parallax berlapis, lampu sorot yang mengikuti kursor, huruf besar yang bereaksi,
     kubus 3D yang ikut bergeser, dan garis bidik dengan koordinat. Saat kursor tidak ada, semuanya melayang pelan sendiri. */
  useEffect(() => {
    const el = stageRef.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const S = { x: 0, y: 0, tx: 0, ty: 0, px: 0, py: 0, tpx: 0, tpy: 0, on: false, f: 0.5, last: 0 };
    let raf = 0;
    let seen = true;
    const smooth = (v) => { const c = Math.min(1, Math.max(0, v)); return c * c * (3 - 2 * c); };

    const frame = (now) => {
      raf = 0;
      if (!seen) { S.last = 0; return; }
      const dt = S.last ? Math.min(0.05, (now - S.last) / 1000) : 0.016; // dtk: perhitungan per detik, jadi sama mulus di layar 60/120Hz
      S.last = now;
      const W = el.clientWidth;
      const H = el.clientHeight;
      if (!S.on) { // melayang sendiri
        const s = now / 1000;
        S.tx = Math.sin(s * 0.55) * 0.3;
        S.ty = Math.cos(s * 0.4) * 0.2;
        S.tpx = W * (0.5 + Math.sin(s * 0.55) * 0.3);
        S.tpy = H * (0.42 + Math.cos(s * 0.4) * 0.12);
      }
      const a1 = 1 - Math.exp(-dt * 4.2);  // parallax & foto: lambat dan lembut
      const a2 = 1 - Math.exp(-dt * 6.5);  // lampu sorot: sedikit lebih sigap
      S.x += (S.tx - S.x) * a1; S.y += (S.ty - S.y) * a1;
      S.px += (S.tpx - S.px) * a2; S.py += (S.tpy - S.py) * a2;
      S.f += ((S.on ? 1 : 0.5) - S.f) * (1 - Math.exp(-dt * 3));
      el.style.setProperty('--mx', S.x.toFixed(3));
      el.style.setProperty('--my', S.y.toFixed(3));
      el.style.setProperty('--sx', `${S.px.toFixed(1)}px`);
      el.style.setProperty('--sy', `${S.py.toFixed(1)}px`);

      const mega = el.querySelector('.mega');
      if (mega) {
        const range = Math.max(200, W * 0.24);
        mega.querySelectorAll('span').forEach((sp) => {
          const cx = mega.offsetLeft + sp.offsetLeft + sp.offsetWidth / 2;
          const cy = mega.offsetTop + sp.offsetTop + sp.offsetHeight / 2;
          const k = smooth(1 - Math.hypot(cx - S.px, (cy - S.py) * 0.6) / range);
          sp.style.setProperty('--k', (k * S.f).toFixed(3));
        });
      }
      raf = requestAnimationFrame(frame);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };

    const move = (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = el.getBoundingClientRect();
      S.on = true; el.dataset.on = '1';
      S.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      S.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      S.tpx = e.clientX - r.left; S.tpy = e.clientY - r.top;
    };
    const leave = () => { S.on = false; delete el.dataset.on; };
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; if (seen) kick(); }, { threshold: 0 });
    io.observe(el);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    kick();
    return () => {
      io.disconnect();
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
      cancelAnimationFrame(raf);
    };
  }, []);

  const changeLang = (l) => { setLang(l); localStorage.setItem('lang', l); document.documentElement.lang = l; };

  const t = T[lang];
  const f = (o, k) => o[`${k}_${lang}`];
  const qr = (u) => `https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=8&data=${encodeURIComponent(u)}`;
  const word = t.mega;
  const en = lang === 'en';
  const stats = [['S1', en ? 'Informatics Eng.' : 'Teknik Informatika'], ['PROGRAMMER', '']];

  return (
    <main className="wrap">
      <header className="top" ref={topRef}>
        <a
          href="#"
          className="brand"
          aria-label={NAME}
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        >
          <span className="brand-mark" aria-hidden="true">{INITIALS}</span>
          <W className="tagtxt" text={t.tag} />
        </a>

        <nav className="nav" ref={navRef} aria-label="Navigasi">
          <i className="nav-ind" aria-hidden="true" />
          {[['tentang', t.nav.about], ['projek', t.nav.projects], ['kontak', t.nav.contact]].map(([id, label], i) => (
            <a key={id} href={`#${id}`} aria-current={active === id ? 'true' : undefined}>
              <W text={label} delay={150 + i * 100} />
            </a>
          ))}
        </nav>

        <div className="top-r">
          <span className="avail"><b className="dot" /><W text={t.avail} delay={250} /></span>
          <div className="seg" data-v={lang} role="group" aria-label={t.lang}>
            <i className="seg-thumb" aria-hidden="true" />
            {['en', 'id'].map((l) => (
              <button key={l} type="button" onClick={() => changeLang(l)} aria-pressed={lang === l} aria-label={`${t.lang}: ${l}`} className={lang === l ? 'on' : ''}>{l.toUpperCase()}</button>
            ))}
          </div>
        </div>
      </header>

      <section className="stage" ref={stageRef} style={{ '--n': word.length }}>
        <h1 className="mega" aria-label={word}>
          {word.split('').map((c, i) => (
            <span key={`${lang}-${i}`} aria-hidden="true" style={{ '--i': i }}>{c}</span>
          ))}
        </h1>

        <i className="spot" aria-hidden="true" />

        <HeroOrb />

        <div className="badge" aria-hidden="true">
          <svg viewBox="0 0 120 120">
            <defs><path id="circ" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" /></defs>
            <text><textPath href="#circ" textLength="272" lengthAdjust="spacing">DESIGN • CODE • CREATE • DELIVER • </textPath></text>
          </svg>
          <span>✦</span>
        </div>

        <div className="hl">
          <W as="h2" className="cond" text={t.role} delay={700} step={90} />
          <W as="p" text={t.intro} delay={1100} step={45} />
          <W className="sign" text={NAME} delay={2400} step={170} />
        </div>

        <div className="hr">
          <W as="p" className="tagline cond" text={t.tagline} delay={1000} step={110} />
          <W as="p" className="loc" text={[t.based, p.location].filter(Boolean).join(' ')} delay={1700} step={70} />
        </div>
      </section>

      <ToolsOrbit
        title={<W as="h3" className="cond sec" text={t.tools} />}
        tools={p.tools ?? []}
        icons={data.toolIcons ?? {}}
      />

      <section className="box about" id="tentang">
        <W as="h3" className="cond sec" text={t.about} />
        <div className="a3">
          <Tilt className="a3-card" max={9}>
            <i className="a3-ring" aria-hidden="true" />
            <span className="a3-plate" aria-hidden="true" />
            <i className="a3-scan" aria-hidden="true" />
            <span className="a3-pop"><img src={FOTO} alt={NAME} /></span>
            <span className="a3-chip c1" aria-hidden="true"><b>{stats[0][0]}</b>{stats[0][1]}</span>
            <span className="a3-chip c2" aria-hidden="true"><b>{stats[1][0]}</b>{stats[1][1]}</span>
            <span className="a3-chip c3" aria-hidden="true"><b>&lt;/&gt;</b>Full-Stack</span>
          </Tilt>
          <div className="a3-txt">
            <W as="p" text={f(p, 'about')} step={30} />
            <ul className="traits">
              {(() => {
                const base = (lang === 'en' ? p.traits_en : p.traits_id) ?? [];
                const team = en ? 'Teamwork' : 'Bekerja tim';
                return base.some((x) => /tim|team/i.test(x)) ? base : [...base, team];
              })().map((x, i) => (
                <li key={x}><W text={x} delay={400 + i * 140} /></li>
              ))}
            </ul>
            <ul className="a3-stats">
              {stats.map(([n, l]) => (
                <li key={n}><Tilt className="a3-stat" max={14}><b>{n}</b>{l ? <span>{l}</span> : null}</Tilt></li>
              ))}
            </ul>
            <CvCard en={en} />
          </div>
          <StackScene icons={data.toolIcons ?? {}} en={en} />
        </div>
        <Journey en={en} />
      </section>

      <section className="box">
        <W as="h3" className="cond sec" text={t.what} />
        <div className="services">
          {services.map((s, i) => (
            <ServiceCard key={s.id ?? i} s={s} i={i} f={f} t={t} onOpen={setOpenSvc} />
          ))}
        </div>
        <ServiceDialog
          item={openSvc !== null ? services[openSvc] : null}
          index={openSvc ?? 0}
          lang={lang}
          t={t}
          f={f}
          onClose={() => setOpenSvc(null)}
        />
      </section>

      <section className="box split" id="projek">
        <div className="certs">
          <W as="h3" className="cond sec" text={t.certs} />
          <Coverflow
            axis="y"
            items={certificates}
            label={t.certs}
            prevLabel={t.prev}
            nextLabel={t.next}
            render={(c, i, on) => (
              <span className="cert">
                <i className="cert-foil" aria-hidden="true" />
                <span className="cert-top">
                  <span className="cert-badge" aria-hidden="true"><Shield /></span>
                  <span className="cert-kick">{t.certOne}</span>
                  {c.year && <span className="cert-yr">{c.year}</span>}
                </span>
                <span className="cert-mid">
                  <small>{t.certFor}</small>
                  <b className="cert-name">{c.name ?? NAME}</b>
                  <small>{c[`is_${lang}`] ?? t.certIs}</small>
                  <b className="cert-role">{c.role ?? f(c, 'title')}</b>
                </span>
                <span className="cert-foot">
                  <span className="cert-by">{c.issuer}</span>
                  {c.units_id ? (
                    <button type="button" className="cf-pill" disabled={!on} tabIndex={on ? 0 : -1} onClick={() => setOpenCert(c)}>{t.certDetail} →</button>
                  ) : null}
                </span>
              </span>
            )}
          />
        </div>

        <div className="work">
          <W as="h3" className="cond sec" text={t.work} />
          <Coverflow
            axis="x"
            wheel
            drag
            items={projects}
            label={t.work}
            prevLabel={t.prev}
            nextLabel={t.next}
            render={(pr, i, on) => (
              <span className="pj">
                <span className="pj-bar" aria-hidden="true">
                  <i /><i /><i className={pr.link ? 'on' : undefined} />
                  <em>
                    <span className="pj-url">{pr.link ? pr.link.replace(/^https?:\/\//, '').replace(/\/$/, '') : pr.title}</span>
                    {pr.link ? <span className="pj-st">{en ? 'Live' : 'Aktif'}</span> : null}
                  </em>
                </span>
                <span className="pj-shot">
                  {/* urutan: screenshot (image_url) -> pratinjau langsung (link) -> kerangka kosong */}
                  {pr.image_url ? (
                    <img src={pr.image_url} alt={`${pr.title} - ${f(pr, 'category')}`} loading="lazy" decoding="async" draggable="false" />
                  ) : (
                    <>
                      <span className="pj-ph" aria-hidden="true"><i /><i /><i /><i /><i /></span>
                      {pr.link ? <LivePreview src={pr.link} title={pr.title} /> : null}
                    </>
                  )}
                </span>
                <span className="cf-cap">
                  <span className="cf-txt">
                    <b className="cf-title">{pr.title}</b>
                    <small>{f(pr, 'category')}</small>
                  </span>
                  {pr.link ? (
                    <a className="cf-pill" href={pr.link} target="_blank" rel="noreferrer" tabIndex={on ? 0 : -1}>{t.view} ↗</a>
                  ) : (
                    <span className="cf-pill">{String(i + 1).padStart(2, '0')}</span>
                  )}
                </span>
              </span>
            )}
          />
        </div>
        <CertDialog item={openCert} lang={lang} t={t} onClose={() => setOpenCert(null)} />
      </section>

      <section className="box collab" id="kontak">
        <div>
          <W as="h3" className="cond sec" text={t.collab} />
          <W as="p" text={t.collabText} step={45} />
          <ul className="contact">
            <li><a href={`mailto:${p.email}`}><W text={p.email} delay={200} /></a></li>
            <li><W text={p.phone} delay={350} /></li>
            <li><W text={p.location} delay={500} /></li>
            {p.website ? <li><W text={p.website} delay={650} /></li> : null}
          </ul>
          <StatusCard en={en} />
        </div>
        <div className="ct-right">
          <div className="soc">
            {[
              ['GitHub', p.github || GITHUB_URL, 'M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.7 5.4-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z', en ? 'See my code' : 'Lihat kode saya'],
              ['WhatsApp', `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(en ? 'Hi Abdul, I saw your portfolio.' : 'Halo Abdul, saya lihat portofolio kamu.')}`, 'M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.2 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .6l-.4.6c-.2.2-.3.4-.1.7.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.7-.1l.9-1.1c.2-.3.4-.2.7-.1l1.9.9c.3.1.5.2.5.4.1.1.1.7-.1 1.2Z', en ? 'Chat directly' : 'Chat langsung'],
              ['Instagram', p.instagram || INSTAGRAM_URL, 'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5Zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5Zm5-3.2a1.1 1.1 0 1 1-1.1 1.1A1.1 1.1 0 0 1 17 6.3Z', en ? 'Follow me' : 'Ikuti saya'],
            ].map(([n, u, d, sub]) => (
              <Tilt as="a" key={n} href={u} target="_blank" rel="noreferrer" className={`soc-btn soc-${n.toLowerCase()}`} max={12}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d={d} /></svg>
                <b>{n}</b>
                <small>{sub}</small>
                <em aria-hidden="true">↗</em>
              </Tilt>
            ))}
          </div>
          <ContactForm en={en} email={p.email} />
        </div>
        <W as="p" className="closing" text={t.closing} step={90} />
      </section>

      <section className="statbar bottom">
        <Reactions t={t} />
      </section>
    </main>
  );
}