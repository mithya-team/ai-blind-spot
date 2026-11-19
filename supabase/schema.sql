-- The AI Blind Spot: shared leaderboard.
-- Run once in a new Supabase project (Dashboard → SQL Editor → New query → paste → Run).
-- Then put the project URL and the "anon" (publishable) key in shared/config.js.
-- The browser only ever uses the anon key; these policies let it read scores and add new ones, nothing else.

create table if not exists players (
  key        text primary key,                       -- lower(name) || '|' || lower(company), made by the browser
  name       text not null check (char_length(name) between 1 and 24),
  company    text not null check (char_length(company) between 1 and 32),
  created_at timestamptz not null default now()
);

create table if not exists rounds (
  id         bigint generated always as identity primary key,
  client_id  uuid not null unique,                   -- made by the phone, so a retry can't count twice
  player_key text not null references players(key) on delete cascade,
  game       text not null check (game in ('golden-thread', 'deep-dive', 'clear-cut', 'stack-up', 'vital-signs')),
  score      integer not null check (score between 0 and 100000),
  stats      jsonb not null default '{}',
  created_at timestamptz not null default now()      -- server time; breaks ties (earlier wins)
);
create index if not exists rounds_game_player on rounds (game, player_key);

-- Three attempts per player per game, enforced here so no phone can add a fourth.
create or replace function max_three_rounds() returns trigger language plpgsql as $$
begin
  perform pg_advisory_xact_lock(hashtext(new.player_key || '/' || new.game));
  if (select count(*) from rounds where player_key = new.player_key and game = new.game) >= 3 then
    raise exception 'All three attempts already played';
  end if;
  return new;
end $$;
drop trigger if exists rounds_max_three on rounds;
create trigger rounds_max_three before insert on rounds for each row execute function max_three_rounds();

-- Row-level security: anyone with the anon key can read and insert. No updates or deletes from the browser.
alter table players enable row level security;
alter table rounds enable row level security;
drop policy if exists "read players" on players;
drop policy if exists "add players" on players;
drop policy if exists "read rounds" on rounds;
drop policy if exists "add rounds" on rounds;
create policy "read players" on players for select to anon using (true);
create policy "add players" on players for insert to anon with check (true);
create policy "read rounds" on rounds for select to anon using (true);
create policy "add rounds" on rounds for insert to anon with check (true);

-- Admin, from the SQL Editor (runs as the owner, so RLS doesn't apply):
--   Clear all test data before the event:   truncate rounds, players;
--   Remove one player and their rounds:     delete from players where key = 'priya|capgemini';
--   Final standings export:                 select * from rounds order by created_at;
-- After the vote, trim the game list in the check constraint above:
--   alter table rounds drop constraint rounds_game_check;
--   alter table rounds add constraint rounds_game_check check (game in ('golden-thread', 'stack-up', 'vital-signs'));
