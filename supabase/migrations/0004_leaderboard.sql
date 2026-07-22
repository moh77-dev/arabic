-- Global weekly leaderboard.
--
-- Real user rows live in `gamification`/`profiles` (owner-only RLS), so a plain view can't show
-- other players. Instead we expose ONLY non-sensitive columns (display name, avatar, weekly XP,
-- league) through a SECURITY DEFINER function that any client may call. Seeded "rival" rows keep
-- each league populated while the community is still small.

-- ---------------------------------------------------------------------------
-- Seeded rivals so a league is never empty.
-- ---------------------------------------------------------------------------
create table if not exists public.leaderboard_bots (
  id uuid primary key default uuid_generate_v4(),
  display_name text not null,
  avatar text not null default 'default_1',
  weekly_xp int not null default 0,
  league text not null default 'bronze' check (league in ('bronze','silver','gold','sapphire','ruby','emerald','amethyst','diamond'))
);

-- RLS on, no policies: the table is only ever read through get_weekly_leaderboard() below.
alter table public.leaderboard_bots enable row level security;

insert into public.leaderboard_bots (display_name, avatar, weekly_xp, league) values
  -- bronze
  ('Yacine', 'falcon', 540, 'bronze'),
  ('Fatiha', 'default_2', 480, 'bronze'),
  ('Bilal', 'camel', 410, 'bronze'),
  ('Salma', 'oasis', 360, 'bronze'),
  ('Mourad', 'tea', 300, 'bronze'),
  ('Rania', 'crescent', 250, 'bronze'),
  ('Hamza', 'desert_fox', 190, 'bronze'),
  -- silver
  ('Amine', 'falcon', 940, 'silver'),
  ('Nour', 'default_2', 880, 'silver'),
  ('Karim', 'camel', 800, 'silver'),
  ('Yasmine', 'oasis', 720, 'silver'),
  ('Sofiane', 'tea', 650, 'silver'),
  ('Lina', 'crescent', 560, 'silver'),
  -- gold
  ('Zohra', 'default_2', 2410, 'gold'),
  ('Sami', 'falcon', 1980, 'gold'),
  ('Dana', 'oasis', 1640, 'gold'),
  ('Riad', 'camel', 1410, 'gold'),
  ('Ines', 'crescent', 1200, 'gold'),
  ('Tarek', 'desert_fox', 980, 'gold'),
  -- sapphire
  ('Mehdi', 'falcon', 3200, 'sapphire'),
  ('Rasha', 'default_2', 2800, 'sapphire'),
  ('Bassel', 'camel', 2400, 'sapphire'),
  -- ruby
  ('Faisal', 'falcon', 4200, 'ruby'),
  ('Maya', 'oasis', 3800, 'ruby'),
  -- emerald
  ('Osman', 'desert_fox', 5200, 'emerald'),
  ('Arwa', 'crescent', 4700, 'emerald'),
  -- amethyst
  ('Haider', 'falcon', 6400, 'amethyst'),
  -- diamond
  ('Kinan', 'falcon', 8100, 'diamond')
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- The public leaderboard function: real players + rivals for one league.
-- ---------------------------------------------------------------------------
create or replace function public.get_weekly_leaderboard(p_league text default 'bronze', p_limit int default 30)
returns table (display_name text, avatar text, weekly_xp int, league text)
language sql
stable
security definer
set search_path = public
as $$
  select display_name, avatar, weekly_xp, league
  from (
    select p.display_name, g.active_avatar as avatar, g.weekly_xp, g.league
    from public.gamification g
    join public.profiles p on p.id = g.user_id
    where g.league = p_league
    union all
    select b.display_name, b.avatar, b.weekly_xp, b.league
    from public.leaderboard_bots b
    where b.league = p_league
  ) rows
  order by weekly_xp desc
  limit greatest(1, least(p_limit, 100));
$$;

grant execute on function public.get_weekly_leaderboard(text, int) to anon, authenticated;
