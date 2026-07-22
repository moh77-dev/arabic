-- Global weekly leaderboard.
--
-- Real user rows live in `gamification`/`profiles` (owner-only RLS), so a plain view can't show
-- other players. Instead we expose ONLY non-sensitive columns (display name, avatar, weekly XP,
-- league) through a SECURITY DEFINER function that any client may call. The board is real players
-- only; the app pads a thin league with clearly-labelled local "practice" rivals, so nothing fake
-- is ever stored as if it were a real account.

create or replace function public.get_weekly_leaderboard(p_league text default 'bronze', p_limit int default 30)
returns table (display_name text, avatar text, weekly_xp int, league text)
language sql
stable
security definer
set search_path = public
as $$
  select p.display_name, g.active_avatar as avatar, g.weekly_xp, g.league
  from public.gamification g
  join public.profiles p on p.id = g.user_id
  where g.league = p_league
  order by g.weekly_xp desc
  limit greatest(1, least(p_limit, 100));
$$;

grant execute on function public.get_weekly_leaderboard(text, int) to anon, authenticated;
