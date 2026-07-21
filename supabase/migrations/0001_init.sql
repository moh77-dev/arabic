-- Lahja database schema
-- Run with: supabase db push  (or paste into the Supabase SQL editor)

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  native_language text,
  arabic_experience text check (arabic_experience in ('none','a_little','intermediate','fluent_other_dialect')),
  goals text[] default '{}',
  favorite_dialect text,
  difficulty text check (difficulty in ('easy','moderate','challenging','intense')),
  daily_goal_minutes int default 10,
  reminder_time time default '19:00',
  speech_confidence text check (speech_confidence in ('beginner','shy','comfortable','confident')),
  subscription_tier text not null default 'free' check (subscription_tier in ('free','premium','family')),
  subscription_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are viewable by owner" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles are insertable by owner" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles are updatable by owner" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up.
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', 'Learner'));
  insert into public.gamification (user_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- gamification
-- ---------------------------------------------------------------------------
create table public.gamification (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  xp int not null default 0,
  total_xp int not null default 0,
  level int not null default 1,
  coins int not null default 100,
  diamonds int not null default 10,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_study_date date,
  weekly_xp int not null default 0,
  weekly_goal_xp int not null default 500,
  freezes_available int not null default 1,
  season_pass_level int not null default 1,
  season_pass_xp int not null default 0,
  active_title text default 'Newcomer',
  active_avatar text default 'default_1',
  league text not null default 'bronze' check (league in ('bronze','silver','gold','sapphire','ruby','emerald','amethyst','diamond')),
  updated_at timestamptz not null default now()
);

alter table public.gamification enable row level security;

create policy "gamification viewable by owner" on public.gamification
  for select using (auth.uid() = user_id);
create policy "gamification updatable by owner" on public.gamification
  for update using (auth.uid() = user_id);
create policy "gamification insertable by owner" on public.gamification
  for insert with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- daily_activity  (backs quest progress: earn_xp, complete_lessons, etc.)
-- ---------------------------------------------------------------------------
create table public.daily_activity (
  user_id uuid references public.profiles(id) on delete cascade,
  activity_date date not null default current_date,
  xp int not null default 0,
  lessons_completed int not null default 0,
  perfect_lessons int not null default 0,
  speaking_done int not null default 0,
  words_reviewed int not null default 0,
  conversations_completed int not null default 0,
  primary key (user_id, activity_date)
);

alter table public.daily_activity enable row level security;

create policy "daily_activity owner rw" on public.daily_activity
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- srs_cards (spaced repetition state per user per word)
-- ---------------------------------------------------------------------------
create table public.srs_cards (
  user_id uuid references public.profiles(id) on delete cascade,
  word_id text not null,
  ease_factor numeric not null default 2.5,
  interval_days int not null default 0,
  repetitions int not null default 0,
  due_at timestamptz not null default now(),
  last_reviewed_at timestamptz,
  lapses int not null default 0,
  primary key (user_id, word_id)
);

alter table public.srs_cards enable row level security;

create policy "srs_cards owner rw" on public.srs_cards
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index srs_cards_due_idx on public.srs_cards (user_id, due_at);

-- ---------------------------------------------------------------------------
-- lesson_completions
-- ---------------------------------------------------------------------------
create table public.lesson_completions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  lesson_id text not null,
  accuracy numeric not null check (accuracy >= 0 and accuracy <= 1),
  xp_earned int not null default 0,
  completed_at timestamptz not null default now()
);

alter table public.lesson_completions enable row level security;

create policy "lesson_completions owner rw" on public.lesson_completions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index lesson_completions_user_idx on public.lesson_completions (user_id, lesson_id);

-- ---------------------------------------------------------------------------
-- user_achievements
-- ---------------------------------------------------------------------------
create table public.user_achievements (
  user_id uuid references public.profiles(id) on delete cascade,
  achievement_id text not null,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

alter table public.user_achievements enable row level security;

create policy "user_achievements owner rw" on public.user_achievements
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- friendships
-- ---------------------------------------------------------------------------
create table public.friendships (
  user_id uuid references public.profiles(id) on delete cascade,
  friend_id uuid references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','blocked')),
  created_at timestamptz not null default now(),
  primary key (user_id, friend_id),
  check (user_id <> friend_id)
);

alter table public.friendships enable row level security;

create policy "friendships visible to participants" on public.friendships
  for select using (auth.uid() = user_id or auth.uid() = friend_id);
create policy "friendships insertable by requester" on public.friendships
  for insert with check (auth.uid() = user_id);
create policy "friendships updatable by participants" on public.friendships
  for update using (auth.uid() = user_id or auth.uid() = friend_id);
create policy "friendships deletable by participants" on public.friendships
  for delete using (auth.uid() = user_id or auth.uid() = friend_id);

-- ---------------------------------------------------------------------------
-- conversation_history + conversation_scores
-- ---------------------------------------------------------------------------
create table public.conversation_history (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  character_id text not null,
  speaker text not null check (speaker in ('user','ai')),
  text_arabic text,
  text_transliteration text,
  text_english text,
  audio_url text,
  created_at timestamptz not null default now()
);

alter table public.conversation_history enable row level security;

create policy "conversation_history owner rw" on public.conversation_history
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.conversation_scores (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  character_id text not null,
  pronunciation int,
  grammar int,
  vocabulary int,
  confidence int,
  naturalness int,
  fluency int,
  overall int,
  corrections jsonb default '[]',
  strengths jsonb default '[]',
  areas_to_improve jsonb default '[]',
  created_at timestamptz not null default now()
);

alter table public.conversation_scores enable row level security;

create policy "conversation_scores owner rw" on public.conversation_scores
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- ai_generated_content — cache of AI-generated lessons/vocab so repeated
-- requests for the same (user, topic, dialect) don't re-hit OpenAI.
-- ---------------------------------------------------------------------------
create table public.ai_generated_content (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('lesson','vocabulary','grammar_explanation')),
  dialect_id text not null,
  topic text,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.ai_generated_content enable row level security;

create policy "ai_generated_content owner rw" on public.ai_generated_content
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Weekly leaderboard: intentionally exposes only non-sensitive columns
-- (display name, avatar, weekly XP, league) to every authenticated user —
-- required for cross-user leaderboard/social features to function at all.
-- ---------------------------------------------------------------------------
create view public.weekly_leaderboard as
  select p.id as user_id, p.display_name, g.active_avatar, g.weekly_xp, g.league
  from public.gamification g
  join public.profiles p on p.id = g.user_id
  order by g.weekly_xp desc;

grant select on public.weekly_leaderboard to authenticated;

-- ---------------------------------------------------------------------------
-- updated_at helper trigger
-- ---------------------------------------------------------------------------
create function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();
create trigger gamification_set_updated_at before update on public.gamification
  for each row execute procedure public.set_updated_at();
