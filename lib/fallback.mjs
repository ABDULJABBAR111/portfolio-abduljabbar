// Data default. Dipakai saat Supabase belum diisi, dan sebagai sumber `npm run seed`.
export const fallback = {
  profile: {
    id: 1, name: 'Mangaa',
    role_en: 'Full-Stack Web Developer', role_id: 'Full-Stack Web Developer',
    intro_en: 'I turn ideas into fast, secure, and user-friendly web apps, covering everything from UI design to the server and database.',
    intro_id: 'Saya membantu mewujudkan ide menjadi aplikasi web yang cepat, aman, dan mudah digunakan, mulai dari desain antarmuka sampai server dan database.',
    quote_id: 'Saya merancang pengalaman digital yang intuitif, indah, dan berdampak.',
    about_en: 'I am an Informatics Engineering student with a passion for minimal design, clean interfaces and seamless experiences. I believe great design is not just about how it looks, but how it works.',
    about_id: 'Saya mahasiswa Teknik Informatika yang menyukai desain minimalis, antarmuka bersih, dan pengalaman yang mulus. Saya percaya desain yang baik bukan hanya soal tampilan, tetapi cara kerjanya.',
    years: '2+', projects_count: '10+', clients: '5+',
    email: 'abduljabbarrr321@gnmail.com', phone: '+62 882 9627 2131', location: 'Bogor, Indonesia',
    photo_url: '', linkedin: 'https://linkedin.com/in/username', behance: 'https://behance.net/username',
    tools: ['Figma', 'VS Code', 'Next.js', 'React', 'Supabase'],
    traits_en: ['Detail oriented', 'Problem solver', 'Minimal & modern', 'Always learning'],
    traits_id: ['Teliti', 'Pemecah masalah', 'Minimalis & modern', 'Selalu belajar'],

  },
  services: [
    { sort: 1, icon: '✦', title_en: 'UI/UX Design', title_id: 'Desain UI/UX', desc_en: 'Designing intuitive and engaging experiences that drive results.', desc_id: 'Merancang pengalaman yang intuitif dan menarik demi hasil nyata.' },
    { sort: 2, icon: '▣', title_en: 'Web Development', title_id: 'Pengembangan Web', desc_en: 'Building modern, responsive and high-performance websites.', desc_id: 'Membangun website modern, responsif, dan berperforma tinggi.' },
    { sort: 3, icon: '◈', title_en: 'Interaction Design', title_id: 'Desain Interaksi', desc_en: 'Creating meaningful interactions and smooth micro experiences.', desc_id: 'Membuat interaksi bermakna dan pengalaman mikro yang halus.' },
    { sort: 4, icon: '▭', title_en: 'Prototyping', title_id: 'Prototyping', desc_en: 'Turning ideas into clickable prototypes and user flows.', desc_id: 'Mengubah ide menjadi prototipe interaktif dan alur pengguna.' },
    { sort: 5, icon: '❖', title_en: 'Design Systems', title_id: 'Design System', desc_en: 'Building consistent design languages and reusable components.', desc_id: 'Membangun bahasa desain konsisten dan komponen yang dapat dipakai ulang.' },
  ],
  steps: [
    { sort: 1, title_en: 'Discover', title_id: 'Temukan', desc_en: 'Understanding goals, audience and project requirements.', desc_id: 'Memahami tujuan, audiens, dan kebutuhan proyek.' },
    { sort: 2, title_en: 'Define', title_id: 'Definisikan', desc_en: 'Research, wireframing and structuring the right solution.', desc_id: 'Riset, wireframe, dan menyusun solusi yang tepat.' },
    { sort: 3, title_en: 'Design', title_id: 'Desain', desc_en: 'Crafting clean, modern and user-centric visuals.', desc_id: 'Membuat visual yang bersih, modern, dan berpusat pada pengguna.' },
    { sort: 4, title_en: 'Develop', title_id: 'Kembangkan', desc_en: 'Turning the design into working code.', desc_id: 'Mengubah desain menjadi kode yang berfungsi.' },
    { sort: 5, title_en: 'Deliver', title_id: 'Serahkan', desc_en: 'Testing, refining and delivering pixel-perfect results.', desc_id: 'Menguji, menyempurnakan, dan menyerahkan hasil yang presisi.' },
  ],
  projects: [
    { sort: 1, title: 'Elevate Studio', category_en: 'Web Design / Development', category_id: 'Desain / Pengembangan Web', image_url: '', link: '' },
    { sort: 2, title: 'Nexus Finance', category_en: 'UI/UX Design', category_id: 'Desain UI/UX', image_url: '', link: '' },
    { sort: 3, title: 'Travelora', category_en: 'Web Design', category_id: 'Desain Web', image_url: '', link: '' },
    { sort: 4, title: 'Veloce App', category_en: 'UI/UX Design', category_id: 'Desain UI/UX', image_url: '', link: '' },
  ],
  // GANTI dengan sertifikat aslimu. image_url = foto/scan sertifikat (boleh dikosongkan).
  certificates: [
    { sort: 1, title_en: 'Certificate Name 1', title_id: 'Nama Sertifikat 1', issuer: 'Penyelenggara', year: '2025', image_url: '' },
    { sort: 2, title_en: 'Certificate Name 2', title_id: 'Nama Sertifikat 2', issuer: 'Penyelenggara', year: '2025', image_url: '' },
    { sort: 3, title_en: 'Certificate Name 3', title_id: 'Nama Sertifikat 3', issuer: 'Penyelenggara', year: '2024', image_url: '' },
    { sort: 4, title_en: 'Certificate Name 4', title_id: 'Nama Sertifikat 4', issuer: 'Penyelenggara', year: '2024', image_url: '' },
    { sort: 5, title_en: 'Certificate Name 5', title_id: 'Nama Sertifikat 5', issuer: 'Penyelenggara', year: '2023', image_url: '' },
  ],
};
