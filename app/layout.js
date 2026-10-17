import { Anton, Cormorant_Garamond, Inter } from 'next/font/google';
import './globals.css';
import Starfield from '@/components/Starfield';
import Intro from '@/components/Intro';

const display = Anton({ weight: '400', subsets: ['latin'], variable: '--f-display' });
const serif = Cormorant_Garamond({ weight: ['500', '600', '700'], subsets: ['latin'], variable: '--f-serif' });
const sans = Inter({ subsets: ['latin'], variable: '--f-sans' });

export const metadata = {
  title: 'Abdul Jabbar — Portfolio',
  description: 'Creative portfolio — UI/UX & Web Development',
  other: { google: 'notranslate' },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }, { url: '/favicon.ico', sizes: 'any' }],
    apple: '/apple-touch-icon.png',
  },
};

/* true  = layar pembuka hanya tampil SEKALI per tab/sesi browser
   false = tampil setiap halaman dibuka atau di-refresh (enak untuk dicoba saat membangun) */
const INTRO_ONCE = false;

/* Berjalan sebelum halaman digambar, supaya layar pembuka langsung menutupi tanpa berkedip.
   Dilewati kalau pengguna memilih "kurangi gerakan" (reduced motion). */
const BOOT = `try{var d=document.documentElement;if(!matchMedia('(prefers-reduced-motion: reduce)').matches${INTRO_ONCE ? "&&!sessionStorage.getItem('intro')" : ''})d.dataset.intro='on'}catch(e){}`;

export default function RootLayout({ children }) {
  return (
    <html lang="id" translate="no" data-theme="dark" suppressHydrationWarning className={`notranslate ${display.variable} ${serif.variable} ${sans.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT }} />
      </head>
      <body>
        <Starfield />
        <Intro />
        {children}
      </body>
    </html>
  );
}