-- Supabase schema for AprovaAI
-- Run in Supabase SQL Editor

-- UUID generator
create extension if not exists pgcrypto;

-- =====================
-- Files (upload metadata)
-- =====================
create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  bucket text not null,
  path text not null,
  name text not null,
  size bigint,
  content_type text,
  post_id uuid references public.posts(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.files enable row level security;

create policy if not exists files_insert_own on public.files for insert with check (auth.uid() = user_id);
create policy if not exists files_select_own on public.files for select using (auth.uid() = user_id);
create policy if not exists files_update_own on public.files for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists files_delete_own on public.files for delete using (auth.uid() = user_id);

create index if not exists files_post_id_idx on public.files(post_id);

-- =====================
-- Posts (themes/requests)
-- =====================
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  tema text not null,
  especificacao text not null,
  tipo_conteudo text not null,
  social_network text not null,
  publish_date timestamptz not null,
  priority text not null default 'media',
  client_id text,
  status text not null default 'pendente',
  created_at timestamptz not null default now()
);

alter table public.posts enable row level security;

create policy if not exists posts_insert_own on public.posts for insert with check (auth.uid() = user_id);
create policy if not exists posts_select_own on public.posts for select using (auth.uid() = user_id);
create policy if not exists posts_update_own on public.posts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists posts_delete_own on public.posts for delete using (auth.uid() = user_id);

-- =====================
-- Clients
-- =====================
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_name text not null,
  email text,
  services text[] not null default '{}',
  notes text,
  logo_url text,
  slug text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint clients_user_slug_unique unique (user_id, slug)
);

alter table public.clients enable row level security;

create policy if not exists clients_insert_own on public.clients for insert with check (auth.uid() = user_id);
create policy if not exists clients_select_own on public.clients for select using (auth.uid() = user_id);
create policy if not exists clients_update_own on public.clients for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists clients_delete_own on public.clients for delete using (auth.uid() = user_id);

-- If upgrading an existing DB, you may drop unused columns:
-- alter table public.clients drop column if exists contact_name;
-- alter table public.clients drop column if exists industry;
-- alter table public.clients drop column if exists status;

-- =====================
-- Storage policies for bucket `uploads`
-- =====================
-- Create bucket `uploads` in dashboard. Keep it private for signed URL previews.
create policy if not exists storage_insert_uploads_auth on storage.objects for insert with check (
  bucket_id = 'uploads' and auth.role() = 'authenticated'
);

create policy if not exists storage_select_uploads_own on storage.objects for select using (
  bucket_id = 'uploads' and (owner = auth.uid() or auth.role() = 'service_role')
);

create policy if not exists storage_update_uploads_own on storage.objects for update using (
  bucket_id = 'uploads' and owner = auth.uid()
) with check (
  bucket_id = 'uploads' and owner = auth.uid()
);

create policy if not exists storage_delete_uploads_own on storage.objects for delete using (
  bucket_id = 'uploads' and owner = auth.uid()
);

-- =====================
-- Storage policies for bucket `logos`
-- =====================
create policy if not exists storage_insert_logos_auth on storage.objects for insert with check (
  bucket_id = 'logos' and auth.role() = 'authenticated'
);



-- Public read access for logos bucket
create policy if not exists storage_select_logos_public on storage.objects for select using (
  bucket_id = 'logos'
);


create policy if not exists storage_update_logos_own on storage.objects for update using (
  bucket_id = 'logos' and owner = auth.uid()
) with check (
  bucket_id = 'logos' and owner = auth.uid()
);

create policy if not exists storage_delete_logos_own on storage.objects for delete using (
  bucket_id = 'logos' and owner = auth.uid()
);

