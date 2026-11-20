-- Peaceverse24.com — Military-Grade Supabase Row Level Security (RLS) Migration
-- Enables RLS on ALL tables and enforces authenticated access

-- 1. Profiles table (Required)
alter table if exists profiles enable row level security;

drop policy if exists "auth required" on profiles;
create policy "auth required" on profiles
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- 2. Posts table
alter table if exists posts enable row level security;

drop policy if exists "auth required" on posts;
create policy "auth required" on posts
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- 3. Stories table
alter table if exists stories enable row level security;

drop policy if exists "auth required" on stories;
create policy "auth required" on stories
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- 4. Comments table
alter table if exists comments enable row level security;

drop policy if exists "auth required" on comments;
create policy "auth required" on comments
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- 5. Messages table (Encrypted + Auth Required)
alter table if exists messages enable row level security;

drop policy if exists "auth required" on messages;
create policy "auth required" on messages
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- 6. Friend Requests table
alter table if exists friend_requests enable row level security;

drop policy if exists "auth required" on friend_requests;
create policy "auth required" on friend_requests
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- 7. Pages table
alter table if exists pages enable row level security;

drop policy if exists "auth required" on pages;
create policy "auth required" on pages
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- 8. Notifications table
alter table if exists notifications enable row level security;

drop policy if exists "auth required" on notifications;
create policy "auth required" on notifications
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
