import { createClient } from '@supabase/supabase-js';
import { fallback } from '../lib/fallback.mjs';

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const run = async (label, q) => {
  const { error } = await q;
  if (error) throw new Error(`${label}: ${error.message}`);
  console.log('✔', label);
};

await run('profile', db.from('profile').upsert(fallback.profile));
for (const [table, rows] of [['services', fallback.services], ['process_steps', fallback.steps], ['projects', fallback.projects]]) {
  await run(`${table} (reset)`, db.from(table).delete().gt('id', 0));
  await run(table, db.from(table).insert(rows));
}
// Tabel sertifikat bersifat opsional: kalau belum dibuat, dilewati saja.
try {
  await run('certificates (reset)', db.from('certificates').delete().gt('id', 0));
  await run('certificates', db.from('certificates').insert(fallback.certificates));
} catch (e) {
  console.warn('! certificates dilewati:', e.message);
}
console.log('Seed selesai.');
