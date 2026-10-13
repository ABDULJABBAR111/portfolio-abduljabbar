import { existsSync } from 'node:fs';
import { join } from 'node:path';
import Portfolio from '@/components/Portfolio';
import { getData } from '@/lib/data';
import { iconFor } from '@/lib/toolIcons';
import { extraIconFor } from '@/lib/extraIcons';
import { colorFor } from '@/lib/toolColors';

export const revalidate = 60;

/* Daftar tools sesuai CV. Tambah / hapus nama di sini.
   (Daftar ini menggantikan kolom profile.tools dari Supabase.) */
const TOOLS = [
  'HTML', 'CSS', 'JavaScript', 'PHP', 'Laravel', 'React.js', 'Next.js', 'Tailwind CSS', 'Bootstrap',
  'MySQL', 'VS Code', 'Git', 'GitHub', 'XAMPP',
];

/* Teks "Tentang saya" (menggantikan kolom profile.about_id / about_en dari Supabase) */
const ABOUT = {
  id: 'Saya adalah lulusan Teknik Informatika yang berfokus pada pemrograman web, mulai dari antarmuka yang responsif, logika di sisi server, hingga pengelolaan database, seperti pada website portofolio ini yang saya bangun dengan Next.js dan Supabase. Saya memiliki kemampuan belajar yang baik, teliti, bertanggung jawab, serta mampu bekerja secara individu maupun dalam tim. Dengan motivasi untuk terus belajar dan mengembangkan keterampilan, saya siap beradaptasi dengan lingkungan kerja dan tantangan baru.',
  en: 'I am an Informatics Engineering graduate focused on web programming, from responsive interfaces and server-side logic to database management, just like this portfolio website, which I built with Next.js and Supabase. I learn quickly, pay close attention to detail, take responsibility, and work well both independently and in a team. Driven to keep learning and growing my skills, I am ready to adapt to new work environments and challenges.',
};

/* Projek yang selalu tampil paling depan. Tambah projek baru di sini. */
const MY_PROJECTS = [
  {
    id: 'laundrypro',
    sort: 0,
    title: 'LaundryPro',
    category_id: 'Sistem Manajemen Laundry',
    category_en: 'Laundry Management System',
    link: 'https://laundry-app-theta-three.vercel.app/',
    image_url: '', // isi dengan link screenshot kalau sudah ada
  },
  {
    id: 'uts-dashboard',
    sort: 1,
    title: 'Dashboard Universitas Pamulang',
    category_id: 'Sistem Informasi Manajemen Karyawan',
    category_en: 'Employee Management Information System',
    link: 'https://abduljabbar111.github.io/UTS/',
    image_url: '',
  },
  {
    id: 'form-login',
    sort: 2,
    title: 'Form Login',
    category_id: 'Desain UI / Halaman Login',
    category_en: 'UI Design / Login Page',
    link: 'https://abduljabbar111.github.io/FORM-LOGIN/',
    image_url: '',
  },
  {
    id: 'kalkulator-jabbar',
    sort: 3,
    title: 'Kalkulator',
    category_id: 'Aplikasi Web Kalkulator',
    category_en: 'Calculator Web App',
    link: 'https://abduljabbar111.github.io/KALKULATOR-JABBAR/',
    image_url: '',
  },
  {
    id: 'game-tetris',
    sort: 4,
    title: 'Game Tetris',
    category_id: 'Game Web (JavaScript)',
    category_en: 'Web Game (JavaScript)',
    link: 'https://abduljabbar111.github.io/Game-Tetris/',
    image_url: '',
  },
];
/* Ubah ke false untuk menyembunyikan 4 projek contoh (Elevate Studio, dll.) dari Supabase */
const SHOW_SAMPLE_PROJECTS = false;

/* Sertifikat asli. File PDF-nya ada di folder public/ */
const CERTS = [
  {
    id: 'bnsp-programmer',
    title_id: 'Sertifikat Kompetensi Programmer',
    title_en: 'Programmer Certificate of Competence',
    issuer: 'BNSP · LSP Universitas Pamulang',
    year: '2026',
    name: 'Abdul Jabbar',
    role: 'Programmer',
    reg: 'J.1426.01428 2026',
    qual_id: 'Pemrogram (Programmer)',
    qual_en: 'Programmer',
    area_id: 'Aktivitas Pemrograman, Konsultasi dan Kegiatan YBDI',
    area_en: 'Programming, Consulting, and Activities Related Thereto',
    date_id: 'Tangerang Selatan, 30 Januari 2026',
    date_en: 'South Tangerang, 30 January 2026',
    valid_id: '3 (tiga) tahun',
    valid_en: '3 (three) years',
    pdf: '/sertifikat-lsp-abdul-jabbar.pdf',
    units_id: [
      'Menggunakan Spesifikasi Program',
      'Menulis Kode dengan Prinsip Sesuai Guidelines dan Best Practices',
      'Mengimplementasikan Pemrograman Terstruktur',
      'Mengimplementasikan Pemrograman Berorientasi Objek',
      'Menggunakan Library atau Komponen Pre-Existing',
      'Menerapkan Akses Basis Data',
      'Membuat Dokumen Kode Program',
      'Melakukan Debugging',
      'Melaksanakan Pengujian Unit Program',
    ],
    units_en: [
      'Using Program Specifications',
      'Writing Code in Accordance with Guidelines and Best Practices',
      'Implementing Structured Programming',
      'Implementing Object-Oriented Programming',
      'Using Libraries or Pre-Existing Components',
      'Applying Database Access',
      'Creating a Program Code Document',
      'Debugging',
      'Testing Program Units',
    ],
  },
  {
    id: 'toefl-prediction',
    title_id: 'Sertifikat TOEFL Prediction Test',
    title_en: 'TOEFL Prediction Test Certificate',
    issuer: 'Lembaga Bahasa Universitas Pamulang',
    year: '2025',
    name: 'Abdul Jabbar',
    is_id: 'telah meraih skor',
    is_en: 'achieved a score of',
    role: '357 (Beginner)',
    reg: '0477 / LBU / III / 2025',
    qual_id: 'TOEFL Prediction Test',
    qual_en: 'TOEFL Prediction Test',
    area_id: 'Bahasa Inggris',
    area_en: 'English language',
    date_id: 'Maret 2025',
    date_en: 'March 2025',
    valid_id: 'Sampai 24 Maret 2027',
    valid_en: 'Until 24 March 2027',
    pdf: '/sertifikat-toefl-abdul-jabbar.pdf',
    unitsLabel_id: 'Rincian skor',
    unitsLabel_en: 'Score breakdown',
    units_id: ['Listening Comprehension: 33', 'Structure and Written Expression: 40', 'Reading Comprehension: 34', 'Total skor: 357 (Level Beginner)'],
    units_en: ['Listening Comprehension: 33', 'Structure and Written Expression: 40', 'Reading Comprehension: 34', 'Total score: 357 (Beginner level)'],
  },
  {
    id: 'sololearn-1',
    title_id: 'Sololearn: JavaScript Intermediate',
    title_en: 'Sololearn: JavaScript Intermediate',
    issuer: 'Sololearn',
    name: 'Abdul Jabbar',
    role: 'JAVASCRIPT INTERMEDIATE',
    pdf: 'https://www.sololearn.com/en/certificates/CC-WRXK0VCF',
    pdfLabel_id: 'Lihat sertifikat di Sololearn',
    pdfLabel_en: 'View certificate on Sololearn',
  },
  {
    id: 'sololearn-2',
    title_id: 'Sololearn: Introduction to JavaScript',
    title_en: 'Sololearn: Introduction to JavaScript',
    issuer: 'Sololearn',
    name: 'Abdul Jabbar',
    role: 'INTRODUCTION TO JAVASCRIPT',
    pdf: 'https://www.sololearn.com/en/certificates/CC-NZT50ONT',
    pdfLabel_id: 'Lihat sertifikat di Sololearn',
    pdfLabel_en: 'View certificate on Sololearn',
  },
  {
    id: 'sololearn-3',
    title_id: 'Sololearn: Introduction to CSS',
    title_en: 'Sololearn: Introduction to CSS',
    issuer: 'Sololearn',
    name: 'Abdul Jabbar',
    role: 'INTRODUCTION TO CSS',
    pdf: 'https://www.sololearn.com/en/certificates/CC-IVVCJVHA',
    pdfLabel_id: 'Lihat sertifikat di Sololearn',
    pdfLabel_en: 'View certificate on Sololearn',
  },
  {
    id: 'sololearn-4',
    title_id: 'Sololearn: Introduction to HTML',
    title_en: 'Sololearn: Introduction to HTML',
    issuer: 'Sololearn',
    name: 'Abdul Jabbar',
    role: 'INTRODUCTION TO HTML',
    pdf: 'https://www.sololearn.com/en/certificates/CC-N73NVUR3',
    pdfLabel_id: 'Lihat sertifikat di Sololearn',
    pdfLabel_en: 'View certificate on Sololearn',
  },
];

/* Tombol "Lihat sertifikat asli (PDF)" SELALU tampil. Kalau file PDF-nya belum ada di folder public/,
   tombolnya tetap ada dan terminal memberi tahu nama file yang dicari. */
const withPdf = (c) => {
  if (!c.pdf || /^https?:\/\//.test(c.pdf)) return c;
  if (existsSync(join(process.cwd(), 'public', c.pdf.replace(/^\//, '')))) return c;
  console.warn(`[sertifikat] File belum ada: public${c.pdf}  -> taruh PDF-nya di folder public/ dengan nama persis itu.`);
  return { ...c, pdfMissing: true };
};

export default async function Page() {
  const data = await getData();
  const profile = { ...data.profile, tools: TOOLS, about_id: ABOUT.id, about_en: ABOUT.en };
  const projects = [...MY_PROJECTS, ...(SHOW_SAMPLE_PROJECTS ? data.projects.filter((p) => !MY_PROJECTS.some((m) => m.title === p.title)) : [])];
  // Logo dicari di server, jadi browser hanya menerima path ikon yang dipakai
  const toolIcons = Object.fromEntries(TOOLS.map((n) => [n, iconFor(n) ?? extraIconFor(n)]).filter(([, d]) => d));
  const toolColors = Object.fromEntries(TOOLS.map((n) => [n, colorFor(n)]).filter(([, c]) => c));
  return <Portfolio data={{ ...data, profile, projects, certificates: CERTS.map(withPdf), toolIcons, toolColors }} />;
}