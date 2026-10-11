create table if not exists profile (
  id int primary key default 1,
  name text, role_en text, role_id text, intro_en text, intro_id text,
  quote_en text, quote_id text, about_en text, about_id text,
  years text, projects_count text, clients text,
  email text, phone text, location text, website text,
  photo_url text, linkedin text, behance text,
  tools text[], traits_en text[], traits_id text[],
  testimonial_en text, testimonial_id text, testimonial_by text
);
create table if not exists services (
  id serial primary key, sort int, icon text,
  title_en text, title_id text, desc_en text, desc_id text
);
create table if not exists process_steps (
  id serial primary key, sort int,
  title_en text, title_id text, desc_en text, desc_id text
);
create table if not exists projects (
  id serial primary key, sort int, image_url text, link text,
  title text, category_en text, category_id text
);
-- Publik hanya boleh membaca; tulis lewat dashboard Supabase / service role
alter table profile enable row level security;
alter table services enable row level security;
alter table process_steps enable row level security;
alter table projects enable row level security;
create policy "public read" on profile for select using (true);
create policy "public read" on services for select using (true);
create policy "public read" on process_steps for select using (true);
create policy "public read" on projects for select using (true);
