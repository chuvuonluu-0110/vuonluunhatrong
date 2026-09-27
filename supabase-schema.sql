-- ==============================================================================
-- HADES' POMEGRANATES — THẮP HOA ĐĂNG CHO LINH HỒN
-- Supabase Database Schema & Row Level Security (RLS) Policies
-- Features: Thắp hoa đăng, Đọc hoa đăng, Chỉnh sửa lời nhắn, Xóa lời nhắn
-- ==============================================================================
--
-- Instructions:
-- 1. Create a project at https://supabase.com (free tier is supported).
-- 2. Open the Supabase Dashboard -> SQL Editor.
-- 3. Paste and run this SQL script.
-- 4. Open Project Settings -> API.
-- 5. Copy your Project URL and anon public key.
-- 6. Insert them into `script.js` under `SUPABASE_CONFIG`:
--    const SUPABASE_CONFIG = {
--      url: 'https://YOUR_PROJECT_ID.supabase.co',
--      anonKey: 'YOUR_SUPABASE_ANON_KEY'
--    };
-- ==============================================================================

-- 1. Create Table: soul_lanterns
create table if not exists public.soul_lanterns (
  id uuid default gen_random_uuid() primary key,
  character_id text not null,
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default null
);

-- Ensure updated_at column exists if table was created previously
alter table public.soul_lanterns add column if not exists updated_at timestamp with time zone default null;

-- 2. Performance Index for fast character-specific retrieval & ordering
create index if not exists soul_lanterns_character_id_idx on public.soul_lanterns(character_id);
create index if not exists soul_lanterns_created_at_idx on public.soul_lanterns(created_at);

-- 3. Enable Row Level Security (RLS)
alter table public.soul_lanterns enable row level security;

-- Drop existing policies if re-running
drop policy if exists "Allow anonymous read access" on public.soul_lanterns;
drop policy if exists "Allow anonymous insert access" on public.soul_lanterns;
drop policy if exists "Allow anonymous update access" on public.soul_lanterns;
drop policy if exists "Allow anonymous delete access" on public.soul_lanterns;

-- 4. Policy: Allow any visitor (anonymous) to read lanterns
create policy "Allow anonymous read access"
  on public.soul_lanterns
  for select
  using (true);

-- 5. Policy: Allow any visitor (anonymous) to insert lanterns
-- Ensures non-empty messages and max 1000 characters
create policy "Allow anonymous insert access"
  on public.soul_lanterns
  for insert
  with check (
    length(trim(message)) > 0
    and length(message) <= 1000
    and character_id is not null
  );

-- 6. Policy: Allow visitors to update lantern messages
-- Ensures updated messages remain valid (non-empty and max 1000 characters)
create policy "Allow anonymous update access"
  on public.soul_lanterns
  for update
  using (true)
  with check (
    length(trim(message)) > 0
    and length(message) <= 1000
  );

-- 7. Policy: Allow visitors to delete lantern messages
create policy "Allow anonymous delete access"
  on public.soul_lanterns
  for delete
  using (true);
