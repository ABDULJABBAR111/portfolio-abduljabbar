import { supabase } from './supabase';
import { fallback } from './fallback.mjs';

export async function getData() {
  if (!supabase) return fallback;
  try {
    const [p, s, pr, ce] = await Promise.all([
      supabase.from('profile').select('*').eq('id', 1).maybeSingle(),
      supabase.from('services').select('*').order('sort'),
      supabase.from('projects').select('*').order('sort'),
      supabase.from('certificates').select('*').order('sort'),
    ]);
    const pick = (r, d) => (r.data && r.data.length ? r.data : d);
    return {
      profile: p.data || fallback.profile,
      services: pick(s, fallback.services),
      projects: pick(pr, fallback.projects),
      certificates: pick(ce, fallback.certificates),
    };
  } catch {
    return fallback;
  }
}