import { useId } from 'react';

/* Ilustrasi vektor (SVG) untuk kartu layanan: kaca bertingkat yang melayang dan bergeser mengikuti kursor.
   Tajam di layar apa pun (HD) karena bukan gambar. Warna mengikuti satu hue yang selaras dengan tema.

   ====== Pengaturan cepat ======
   HUES : warna dasar tiap kartu (derajat, 0-360). Dibuat dekat dengan aksen tema (indigo/violet/biru es)
   kindOf : memilih ilustrasi dari judul layanan (kata kunci). Kalau tidak cocok, dipilih berurutan. */
export const HUES = [246, 268, 218, 198, 284];

const KINDS = ['ui', 'web', 'motion', 'proto', 'system'];

export function kindOf(s = {}, i = 0) {
  const k = `${s.title_en ?? ''} ${s.title_id ?? ''} ${s.title ?? ''}`.toLowerCase();
  if (/\bui\b|\bux\b/.test(k)) return 'ui';
  if (/web|develop|pengembangan|frontend|backend/.test(k)) return 'web';
  if (/interact|interaksi|motion|animasi|animation/.test(k)) return 'motion';
  if (/prototyp/.test(k)) return 'proto';
  if (/system|sistem/.test(k)) return 'system';
  return KINDS[i % KINDS.length];
}

const hsl = (h, s, l, a = 1) => `hsla(${Math.round(h + 360) % 360}, ${s}%, ${l}%, ${a})`;
const W = (a) => `rgba(255,255,255,${a})`;

/* bintang kecil berkelip */
function Spark({ x, y, s = 5, d = 0, c }) {
  const k = s * 0.28;
  // posisi di <g>, animasi di <path>: supaya skala berkelip berpusat di bintangnya sendiri
  return (
    <g transform={`translate(${x} ${y})`}>
      <path
        className="sa-tw"
        style={{ animationDelay: `${d}s` }}
        d={`M0 ${-s} L${k} ${-k} L${s} 0 L${k} ${k} L0 ${s} L${-k} ${k} L${-s} 0 L${-k} ${-k}Z`}
        fill={c}
      />
    </g>
  );
}

/* panel kaca: isi bergradasi, tepi terang di sudut kiri-atas, garis kilap tipis di bagian atas */
function Glass({ x, y, w, h, r = 12, u, dark = false, glow }) {
  return (
    <g>
      {glow && <rect x={x - 3} y={y - 3} width={w + 6} height={h + 6} rx={r + 3} fill="none" stroke={glow} strokeWidth="1.4" opacity=".9" />}
      <rect x={x} y={y} width={w} height={h} rx={r} fill={u(dark ? 'gd' : 'g')} stroke={u('gs')} strokeWidth="1" />
      <path d={`M${x + r} ${y + 0.8} H${x + w - r}`} stroke={W(0.55)} strokeWidth="1" strokeLinecap="round" />
    </g>
  );
}

function Cursor({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0 L0 17 L4.6 12.8 L7.6 19.6 L10.6 18.3 L7.6 11.6 L13.6 11.6Z" fill="#fff" stroke="rgba(8,10,40,.75)" strokeWidth="1.2" strokeLinejoin="round" />
    </g>
  );
}

/* ===== 1. UI/UX: jendela antarmuka + palet warna + kotak seleksi + kursor ===== */
function UiArt({ u, c }) {
  return (
    <>
      <g className="sa-l0"><ellipse cx="120" cy="96" rx="104" ry="74" fill={u('gl')} /></g>
      <g className="sa-l1"><g className="sa-fl a">
        <ellipse cx="120" cy="158" rx="62" ry="7" fill={u('sh')} />
        <Glass x={60} y={24} w={120} h={124} r={14} u={u} />
        <path d="M60 38 a14 14 0 0 1 14-14 h92 a14 14 0 0 1 14 14 v8 H60Z" fill={W(0.09)} />
        <circle cx="74" cy="35" r="2.7" fill={c.hi} /><circle cx="83" cy="35" r="2.7" fill={c.ac} /><circle cx="92" cy="35" r="2.7" fill={c.cy} />
        <clipPath id={u('cb', true)}><rect x="70" y="54" width="100" height="46" rx="9" /></clipPath>
        <rect x="70" y="54" width="100" height="46" rx="9" fill={u('bar')} />
        <g clipPath={u('cb')}>
          <path d="M70 102 L98 72 L117 90 L133 76 L170 102Z" fill={W(0.26)} />
          <path d="M70 102 L92 84 L108 98 L124 88 L148 102Z" fill={W(0.16)} />
          <circle cx="151" cy="68" r="7.5" fill={W(0.9)} />
        </g>
        <rect x="70" y="108" width="76" height="5.5" rx="2.75" fill={W(0.62)} />
        <rect x="70" y="119" width="54" height="5.5" rx="2.75" fill={W(0.3)} />
        <rect x="70" y="131" width="44" height="12" rx="6" fill={c.hi} />
        <rect x="120" y="134" width="32" height="6" rx="3" fill={W(0.22)} />
      </g></g>
      <g className="sa-l2"><g className="sa-fl b">
        <Glass x={18} y={46} w={30} h={86} r={15} u={u} />
        <circle cx="33" cy="66" r="8" fill={c.lt} /><circle cx="30.4" cy="63.4" r="2.4" fill={W(0.75)} />
        <circle cx="33" cy="89" r="8" fill={c.ac} /><circle cx="30.4" cy="86.4" r="2.4" fill={W(0.75)} />
        <circle cx="33" cy="112" r="8" fill={c.cy} /><circle cx="30.4" cy="109.4" r="2.4" fill={W(0.75)} />
        <Glass x={192} y={34} w={32} h={32} r={10} u={u} />
        <text x="208" y="56" textAnchor="middle" fontSize="15" fontWeight="700" fill="#fff" fontFamily="Inter, system-ui, sans-serif">Aa</text>
        <Glass x={190} y={78} w={36} h={58} r={10} u={u} dark />
        <rect x="197" y="88" width="22" height="3.5" rx="1.75" fill={W(0.5)} /><circle cx="211" cy="89.8" r="4" fill={c.hi} />
        <rect x="197" y="103" width="22" height="3.5" rx="1.75" fill={W(0.5)} /><circle cx="203" cy="104.8" r="4" fill={c.ac} />
        <rect x="197" y="118" width="22" height="3.5" rx="1.75" fill={W(0.5)} /><circle cx="214" cy="119.8" r="4" fill={c.cy} />
      </g></g>
      <g className="sa-l3"><g className="sa-fl c">
        <rect x="65" y="127" width="54" height="20" rx="7" fill="none" stroke={c.hi} strokeWidth="1.3" strokeDasharray="3.2 3" />
        {[[65, 127], [119, 127], [65, 147], [119, 147]].map(([x, y]) => <rect key={`${x}${y}`} x={x - 2.6} y={y - 2.6} width="5.2" height="5.2" rx="1.2" fill="#fff" stroke={c.md} strokeWidth="1" />)}
        <Cursor x={104} y={136} />
      </g></g>
      <Spark x={206} y={22} s={6} c={c.hi} /><Spark x={36} y={30} s={4} d={1.1} c={c.lt} /><Spark x={14} y={150} s={3.4} d={2} c={c.ac} />
    </>
  );
}

/* ===== 2. Web: jendela kode + pratinjau situs + lencana </> ===== */
function WebArt({ u, c }) {
  const L = (x, y, w, f, o = 1) => <rect x={x} y={y} width={w} height="5.4" rx="2.7" fill={f} opacity={o} />;
  return (
    <>
      <g className="sa-l0"><ellipse cx="124" cy="92" rx="106" ry="74" fill={u('gl')} /></g>
      <g className="sa-l1"><g className="sa-fl b">
        <Glass x={120} y={16} w={106} h={88} r={12} u={u} dark />
        <path d="M120 28 a12 12 0 0 1 12-12 h82 a12 12 0 0 1 12 12 v6 H120Z" fill={W(0.08)} />
        <circle cx="131" cy="26" r="2.2" fill={W(0.6)} /><circle cx="139" cy="26" r="2.2" fill={W(0.4)} />
        <rect x="131" y="43" width="84" height="28" rx="7" fill={u('bar')} opacity=".6" />
        <rect x="131" y="78" width="38" height="18" rx="5" fill={W(0.14)} /><rect x="177" y="78" width="38" height="18" rx="5" fill={W(0.14)} />
      </g></g>
      <g className="sa-l2"><g className="sa-fl a">
        <ellipse cx="94" cy="160" rx="62" ry="7" fill={u('sh')} />
        <Glass x={22} y={48} w={140} h={106} r={13} u={u} />
        <path d="M22 61 a13 13 0 0 1 13-13 h114 a13 13 0 0 1 13 13 v10 H22Z" fill={W(0.09)} />
        <circle cx="36" cy="59" r="2.7" fill={c.hi} /><circle cx="45" cy="59" r="2.7" fill={c.ac} /><circle cx="54" cy="59" r="2.7" fill={c.cy} />
        <rect x="70" y="53" width="44" height="12" rx="6" fill={W(0.12)} />
        {[84, 96, 108, 120, 132].map((y, i) => <rect key={y} x="34" y={y + 0.5} width="7" height="4.4" rx="2.2" fill={W(0.22)} />)}
        {L(52, 83, 24, c.ac)}{L(80, 83, 36, c.lt)}{L(120, 83, 14, W(0.4))}
        {L(62, 95, 18, c.cy)}{L(84, 95, 48, W(0.55))}
        {L(62, 107, 34, c.lt)}{L(100, 107, 26, c.ac)}
        {L(52, 119, 44, W(0.42))}{L(100, 119, 20, c.cy)}
        {L(52, 131, 12, c.ac)}
        <rect className="sa-blink" x="68" y="130" width="3" height="8" rx="1" fill={c.hi} />
      </g></g>
      <g className="sa-l3"><g className="sa-fl c">
        <circle cx="176" cy="128" r="30" fill={u('gl')} opacity=".9" />
        <circle cx="176" cy="128" r="24" fill={u('orb')} stroke={W(0.6)} strokeWidth="1.2" />
        <ellipse cx="168" cy="118" rx="12" ry="6.5" fill={W(0.32)} transform="rotate(-24 168 118)" />
        <text x="176" y="134" textAnchor="middle" fontSize="16" fontWeight="800" fill="#fff" fontFamily="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace">{'</>'}</text>
      </g></g>
      <Spark x={226} y={118} s={5} c={c.hi} /><Spark x={16} y={30} s={4.4} d={1.4} c={c.lt} /><Spark x={206} y={160} s={3.4} d={2.2} c={c.ac} />
    </>
  );
}

/* ===== 3. Interaksi: riak dari kursor, jalur gerak, toggle & slider ===== */
function MotionArt({ u, c }) {
  const PATH = 'M22 142 C 62 40, 128 176, 218 52';
  return (
    <>
      <g className="sa-l0">
        <ellipse cx="120" cy="90" rx="104" ry="76" fill={u('gl')} />
        {[22, 42, 62].map((r, i) => <circle key={r} className="sa-ring" style={{ animationDelay: `${i * 1.2}s` }} cx="120" cy="88" r={r} fill="none" stroke={c.lt} strokeWidth="1.5" />)}
      </g>
      <g className="sa-l1">
        <path d={PATH} fill="none" stroke={c.lt} strokeWidth="1.8" strokeDasharray="1.5 7" strokeLinecap="round" opacity=".7" />
        <path className="sa-trail" d={PATH} pathLength="100" fill="none" stroke={c.hi} strokeWidth="3.4" strokeLinecap="round" strokeDasharray="9 100" />
        {[[22, 142], [218, 52]].map(([x, y]) => (
          <g key={x} transform={`translate(${x} ${y}) rotate(45)`}><rect x="-5.5" y="-5.5" width="11" height="11" rx="2.5" fill={u('g')} stroke={u('gs')} /></g>
        ))}
      </g>
      <g className="sa-l2"><g className="sa-fl a">
        <circle cx="120" cy="88" r="30" fill={u('gl')} />
        <circle cx="120" cy="88" r="18" fill={u('orb')} stroke={W(0.6)} strokeWidth="1.2" />
        <ellipse cx="114" cy="81" rx="8.5" ry="4.6" fill={W(0.38)} transform="rotate(-24 114 81)" />
      </g></g>
      <g className="sa-l3"><g className="sa-fl c">
        <Cursor x={126} y={94} s={1.12} />
        <Glass x={20} y={32} w={52} h={26} r={13} u={u} />
        <rect x="24" y="36" width="44" height="18" rx="9" fill={u('bar')} opacity=".9" />
        <circle cx="59" cy="45" r="7.2" fill="#fff" />
        <Glass x={172} y={24} w={48} h={30} r={10} u={u} dark />
        <rect x="179" y="32" width="26" height="4" rx="2" fill={W(0.55)} /><rect x="179" y="41" width="34" height="4" rx="2" fill={W(0.25)} />
      </g></g>
      <g className="sa-l2"><g className="sa-fl b">
        <Glass x={136} y={136} w={86} h={26} r={13} u={u} dark />
        <rect x="146" y="147.5" width="66" height="4.4" rx="2.2" fill={W(0.2)} />
        <rect x="146" y="147.5" width="40" height="4.4" rx="2.2" fill={u('bar')} />
        <circle cx="186" cy="149.7" r="7.4" fill={c.hi} stroke={c.md} strokeWidth="1.6" />
      </g></g>
      <Spark x={30} y={110} s={4.6} c={c.hi} /><Spark x={214} y={100} s={3.6} d={1.3} c={c.lt} /><Spark x={96} y={20} s={3.4} d={2.1} c={c.ac} />
    </>
  );
}

/* ===== 4. Prototyping: tiga layar ponsel yang tersambung alur ===== */
function ProtoArt({ u, c }) {
  const Phone = ({ x, y, w, h, dark }) => (
    <g>
      <Glass x={x} y={y} w={w} h={h} r={11} u={u} dark={dark} />
      <rect x={x + w / 2 - 8} y={y + 5} width="16" height="3.4" rx="1.7" fill={W(0.38)} />
    </g>
  );
  return (
    <>
      <g className="sa-l0">
        <ellipse cx="120" cy="96" rx="106" ry="74" fill={u('gl')} />
        <path d="M68 110 C 80 110 78 134 90 134 M150 134 C 162 134 160 110 172 110" fill="none" stroke={c.lt} strokeWidth="6" strokeLinecap="round" opacity=".12" />
      </g>
      <g className="sa-l1"><g className="sa-fl b">
        <Phone x={14} y={56} w={54} h={92} dark />
        <rect x="22" y="74" width="38" height="22" rx="6" fill={u('bar')} opacity=".6" />
        <rect x="22" y="102" width="30" height="4.6" rx="2.3" fill={W(0.45)} /><rect x="22" y="111" width="38" height="4.6" rx="2.3" fill={W(0.22)} />
        <circle cx="68" cy="110" r="3.6" fill={c.hi} stroke={c.md} strokeWidth="1.4" />
        <Phone x={172} y={56} w={54} h={92} dark />
        {[[180, 74], [200, 74], [180, 92], [200, 92]].map(([x, y], i) => <rect key={x + y} x={x} y={y} width="18" height="14" rx="4" fill={i === 3 ? c.lt : W(0.2)} opacity={i === 3 ? 0.9 : 1} />)}
        <rect x="180" y="112" width="38" height="4.6" rx="2.3" fill={W(0.34)} />
        <circle cx="172" cy="110" r="3.6" fill={c.hi} stroke={c.md} strokeWidth="1.4" />
      </g></g>
      <g className="sa-l2"><g className="sa-fl a">
        <ellipse cx="120" cy="162" rx="40" ry="6" fill={u('sh')} />
        <Phone x={90} y={34} w={60} h={118} />
        <rect x="98" y="52" width="44" height="34" rx="7" fill={u('bar')} />
        <path d="M98 86 L114 68 L124 78 L132 70 L142 86Z" fill={W(0.26)} />
        <rect x="98" y="94" width="40" height="5" rx="2.5" fill={W(0.62)} /><rect x="98" y="104" width="28" height="5" rx="2.5" fill={W(0.3)} />
        <rect x="98" y="118" width="44" height="16" rx="8" fill={c.hi} />
        <rect x="95" y="115" width="50" height="22" rx="9" fill="none" stroke={c.ac} strokeWidth="1.3" strokeDasharray="3.2 3" className="sa-hot" />
        <circle cx="90" cy="125" r="3.6" fill={c.hi} stroke={c.md} strokeWidth="1.4" />
        <circle cx="150" cy="125" r="3.6" fill={c.hi} stroke={c.md} strokeWidth="1.4" />
      </g></g>
      <g className="sa-l3"><g className="sa-fl c">
        <path className="sa-flow" d="M71.6 110 C 82 110 78 125 86.4 125" fill="none" stroke={c.hi} strokeWidth="2" strokeDasharray="4 5" strokeLinecap="round" />
        <path className="sa-flow" d="M153.6 125 C 164 125 160 110 168.4 110" fill="none" stroke={c.hi} strokeWidth="2" strokeDasharray="4 5" strokeLinecap="round" />
        <Glass x={108} y={6} w={24} h={24} r={12} u={u} />
        <path d="M117 12.5 L125 18 L117 23.5Z" fill="#fff" />
        <Cursor x={128} y={128} s={0.95} />
      </g></g>
      <Spark x={34} y={30} s={4.6} c={c.hi} /><Spark x={212} y={32} s={3.8} d={1.2} c={c.lt} /><Spark x={226} y={160} s={3.4} d={2} c={c.ac} />
    </>
  );
}

/* ===== 5. Design System: kisi komponen yang saling terhubung ===== */
function SystemArt({ u, c }) {
  const X = (col) => 31 + col * 62;
  const Y = (row) => 34 + row * 56;
  const T = (col, row, children, o = {}) => (
    <g key={`${col}${row}`}>
      <Glass x={X(col)} y={Y(row)} w={54} h={46} r={11} u={u} glow={o.glow} />
      {children(X(col), Y(row))}
    </g>
  );
  return (
    <>
      <g className="sa-l0">
        <ellipse cx="120" cy="92" rx="106" ry="76" fill={u('gl')} />
        <path d="M58 57 H120 H182 V113 H120 H58Z M120 57 V113" fill="none" stroke={c.lt} strokeWidth="1.2" strokeDasharray="1.5 6" strokeLinecap="round" opacity=".6" />
      </g>
      <g className="sa-l1"><g className="sa-fl b">
        {T(0, 0, (x, y) => (
          <>
            <circle cx={x + 17} cy={y + 23} r="10" fill={c.lt} /><circle cx={x + 28} cy={y + 23} r="10" fill={c.ac} opacity=".92" /><circle cx={x + 39} cy={y + 23} r="10" fill={c.cy} opacity=".88" />
            <circle cx={x + 14} cy={y + 19} r="2.6" fill={W(0.7)} />
          </>
        ))}
        {T(1, 0, (x, y) => (
          <>
            <text x={x + 27} y={y + 28} textAnchor="middle" fontSize="22" fontWeight="800" fill="#fff" fontFamily="Inter, system-ui, sans-serif">Aa</text>
            <rect x={x + 14} y={y + 35} width="26" height="3.6" rx="1.8" fill={W(0.4)} />
          </>
        ))}
        {T(2, 0, (x, y) => (
          <>
            <rect x={x + 8} y={y + 9} width="38" height="15" rx="7.5" fill={u('bar')} />
            <rect x={x + 8} y={y + 29} width="38" height="11" rx="5.5" fill="none" stroke={c.hi} strokeWidth="1.3" />
          </>
        ))}
      </g></g>
      <g className="sa-l2"><g className="sa-fl a">
        {T(0, 1, (x, y) => (
          <>
            <rect x={x + 8} y={y + 10} width="38" height="19" rx="9.5" fill={u('bar')} />
            <circle cx={x + 36.5} cy={y + 19.5} r="6.8" fill="#fff" />
            <rect x={x + 8} y={y + 35} width="26" height="3.6" rx="1.8" fill={W(0.34)} />
          </>
        ))}
        {T(1, 1, (x, y) => (
          <>
            <rect x={x + 6} y={y + 8} width="24" height="3.4" rx="1.7" fill={W(0.45)} />
            <rect x={x + 6} y={y + 17} width="42" height="21" rx="7" fill={W(0.1)} stroke={c.hi} strokeWidth="1.4" />
            <rect x={x + 12} y={y + 22.5} width="18" height="3.6" rx="1.8" fill={W(0.6)} />
            <rect className="sa-blink" x={x + 32} y={y + 22} width="2.4" height="10" rx="1" fill={c.hi} />
          </>
        ), { glow: c.ac })}
        {T(2, 1, (x, y) => (
          <>
            <rect x={x + 9} y={y + 9} width="11" height="11" rx="3.2" fill={c.hi} />
            <path d={`M${x + 11.4} ${y + 14.6} l2.6 2.6 l4.4 -5`} fill="none" stroke="rgba(10,13,60,.9)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <rect x={x + 25} y={y + 12} width="20" height="4.4" rx="2.2" fill={W(0.55)} />
            <rect x={x + 9} y={y + 27} width="11" height="11" rx="3.2" fill="none" stroke={W(0.7)} strokeWidth="1.4" />
            <rect x={x + 25} y={y + 30} width="14" height="4.4" rx="2.2" fill={W(0.28)} />
          </>
        ))}
      </g></g>
      <g className="sa-l3"><Cursor x={X(1) + 36} y={Y(1) + 30} s={0.95} /></g>
      <Spark x={14} y={26} s={4.6} c={c.hi} /><Spark x={226} y={30} s={3.8} d={1.2} c={c.lt} /><Spark x={224} y={158} s={4} d={2} c={c.ac} />
    </>
  );
}

/* cadangan kalau judul layanan tidak dikenali */
function StarArt({ u, c }) {
  return (
    <>
      <g className="sa-l0">
        <ellipse cx="120" cy="90" rx="100" ry="74" fill={u('gl')} />
        {[28, 50, 72].map((r, i) => <circle key={r} className="sa-ring" style={{ animationDelay: `${i * 1.2}s` }} cx="120" cy="90" r={r} fill="none" stroke={c.lt} strokeWidth="1.4" />)}
      </g>
      <g className="sa-l2"><g className="sa-fl a">
        <path d="M120 38 C122 70 130 80 162 90 C130 100 122 110 120 142 C118 110 110 100 78 90 C110 80 118 70 120 38Z" fill={u('orb')} stroke={W(0.6)} strokeWidth="1.2" />
      </g></g>
      <Spark x={44} y={40} s={5} c={c.hi} /><Spark x={198} y={52} s={4} d={1.3} c={c.lt} /><Spark x={190} y={142} s={4.4} d={2} c={c.ac} />
    </>
  );
}

const ART = { ui: UiArt, web: WebArt, motion: MotionArt, proto: ProtoArt, system: SystemArt, star: StarArt };

export default function ServiceArt({ kind = 'star', hue = 246, className = '' }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const u = (n, raw) => (raw ? `${uid}${n}` : `url(#${uid}${n})`);
  const c = {
    hi: hsl(hue, 100, 90),
    lt: hsl(hue, 96, 74),
    md: hsl(hue, 86, 58),
    dk: hsl(hue, 70, 26),
    ac: hsl(hue + 44, 96, 76),
    cy: hsl(hue - 46, 96, 76),
  };
  const Art = ART[kind] ?? ART.star;
  const id = (n) => `${uid}${n}`;
  return (
    <svg className={`sa ${className}`.trim()} viewBox="0 0 240 180" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={id('g')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".34" /><stop offset="1" stopColor="#fff" stopOpacity=".07" />
        </linearGradient>
        <linearGradient id={id('gd')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".16" /><stop offset="1" stopColor="#fff" stopOpacity=".03" />
        </linearGradient>
        <linearGradient id={id('gs')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".8" /><stop offset=".5" stopColor="#fff" stopOpacity=".16" /><stop offset="1" stopColor="#fff" stopOpacity=".3" />
        </linearGradient>
        <linearGradient id={id('bar')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c.md} /><stop offset="1" stopColor={c.ac} />
        </linearGradient>
        <radialGradient id={id('gl')} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor={c.lt} stopOpacity=".5" /><stop offset=".55" stopColor={c.md} stopOpacity=".16" /><stop offset="1" stopColor={c.md} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id('orb')} cx=".35" cy=".3" r=".85">
          <stop offset="0" stopColor={c.hi} /><stop offset=".45" stopColor={c.lt} /><stop offset="1" stopColor={c.md} />
        </radialGradient>
        <radialGradient id={id('sh')} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#02030f" stopOpacity=".55" /><stop offset="1" stopColor="#02030f" stopOpacity="0" />
        </radialGradient>
      </defs>
      <Art u={u} c={c} />
    </svg>
  );
}