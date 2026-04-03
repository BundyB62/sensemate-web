-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users profile table (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  username text,
  plan text default 'free', -- free, pro, premium
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Companions table
create table if not exists public.companions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  avatar_url text,
  personality jsonb default '{}',
  appearance jsonb default '{}',
  relationship_style text default 'bestfriend',
  bond_score integer default 0,
  bond_level integer default 1,
  emotion_state jsonb default '{"mood": 0.5, "energy": 0.5, "trust": 0.3}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Messages table
create table if not exists public.messages (
  id uuid default uuid_generate_v4() primary key,
  companion_id uuid references public.companions(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  emotion text default 'neutral',
  type text default 'text', -- text, image
  created_at timestamptz default now()
);

-- Memories table
create table if not exists public.memories (
  id uuid default uuid_generate_v4() primary key,
  companion_id uuid references public.companions(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  key text not null,
  value text not null,
  created_at timestamptz default now()
);

-- RLS Policies
alter table public.profiles enable row level security;
alter table public.companions enable row level security;
alter table public.messages enable row level security;
alter table public.memories enable row level security;

-- Profiles policies
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Companions policies
create policy "Users can manage own companions" on public.companions for all using (auth.uid() = user_id);

-- Messages policies
create policy "Users can manage own messages" on public.messages for all using (auth.uid() = user_id);

-- Memories policies
create policy "Users can manage own memories" on public.memories for all using (auth.uid() = user_id);

-- Function to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
