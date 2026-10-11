/* Warna khas tiap teknologi (dipakai untuk logo berwarna + cahaya di ikon Tools).
   Warna sudah dicerahkan sedikit supaya jelas di atas ubin gelap.
   Tool yang tidak ada di daftar ini otomatis diberi warna dari namanya. */
const COLORS = {
  html5: '#FF6A3D', css: '#3FA9F5', javascript: '#F7DF1E', typescript: '#4C9BFF', php: '#8E9BD6', laravel: '#FF4F44',
  mysql: '#5BA7D6', postgresql: '#6FA3D8', mongodb: '#4FC55E', sqlite: '#4DA3E0', mariadb: '#C7A27A', supabase: '#3ECF8E',
  firebase: '#FFB300', redis: '#F2554B', prisma: '#7FA8E6', react: '#61DAFB', nextdotjs: '#FFFFFF', vuedotjs: '#41D392',
  svelte: '#FF6A3D', angular: '#FF4A5A', astro: '#B27CFF', tailwindcss: '#38BDF8', bootstrap: '#A97BFF', sass: '#F26FB1',
  jquery: '#4D9EE8', nodedotjs: '#6CC24A', express: '#FFFFFF', nestjs: '#F2476F', python: '#FFD43B', flutter: '#47C5FB',
  dart: '#3FB6D9', kotlin: '#B27CFF', go: '#3FD0E6', graphql: '#F055B5', git: '#F4694B', github: '#FFFFFF', gitlab: '#FC7A3A',
  docker: '#4DA8F5', vercel: '#FFFFFF', netlify: '#33D6C8', cloudflare: '#F6821F', vite: '#A58CFF', npm: '#F0463F',
  composer: '#C9A27A', postman: '#FF7A45', swagger: '#7FD954', linux: '#FFD24A', wordpress: '#4AA3DF', codeigniter: '#F2623F',
  xampp: '#FB7A24', figma: '#F2603E', androidstudio: '#4CD08A', jira: '#3F8CFF', notion: '#FFFFFF', trello: '#3F9BFF',
  vscode: '#3AA0FF',
};

const ALIAS = {
  html: 'html5', css3: 'css', js: 'javascript', ts: 'typescript', postgres: 'postgresql', mongo: 'mongodb',
  reactjs: 'react', next: 'nextdotjs', nextjs: 'nextdotjs', vue: 'vuedotjs', vuejs: 'vuedotjs', tailwind: 'tailwindcss',
  scss: 'sass', node: 'nodedotjs', nodejs: 'nodedotjs', expressjs: 'express', nest: 'nestjs', golang: 'go',
  visualstudiocode: 'vscode', code: 'vscode',
};

export function colorFor(name = '') {
  const key = String(name).toLowerCase().replace(/[^a-z0-9]/g, '');
  return COLORS[ALIAS[key] ?? key] ?? null;
}