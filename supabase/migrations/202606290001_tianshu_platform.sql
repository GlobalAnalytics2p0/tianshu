create extension if not exists pgcrypto with schema extensions;

do $$ begin
  create type public.profile_role as enum ('reader', 'moderator', 'admin', 'service');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.room_kind as enum ('platform', 'book', 'ai_council');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.actor_kind as enum ('reader', 'persona', 'editor', 'system');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.message_status as enum ('pending', 'visible', 'quarantined', 'rejected');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.session_status as enum ('queued', 'running', 'reviewing', 'published', 'failed', 'cancelled');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.topic_status as enum ('proposed', 'approved', 'scheduled', 'discussed', 'archived');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.feedback_kind as enum ('question', 'complaint', 'suggestion', 'topic_proposal', 'readability');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.feedback_status as enum ('pending', 'approved', 'consumed', 'dismissed');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.job_status as enum ('pending', 'processing', 'completed', 'failed', 'cancelled');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '天書讀者' check (char_length(display_name) between 1 and 40),
  avatar_url text,
  role public.profile_role not null default 'reader',
  is_suspended boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.feature_flags (
  key text primary key check (key ~ '^[a-z0-9_]+$'),
  enabled boolean not null default false,
  description text not null default '',
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.books (
  id text primary key,
  title text not null unique,
  author_name text not null,
  category text not null,
  premise text not null default '' check (char_length(premise) <= 2000),
  cover_image text,
  latest_chapter text,
  latest_context text not null default '' check (char_length(latest_context) <= 6000),
  chapter_count integer not null default 0 check (chapter_count >= 0),
  manifest_updated_at timestamptz,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.personas (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  display_name text not null,
  initial text not null check (char_length(initial) between 1 and 4),
  accent text not null default '#996dff',
  book_id text references public.books(id) on delete set null,
  role public.actor_kind not null check (role in ('persona', 'editor')),
  focus text not null default '',
  prompt_version integer not null default 1 check (prompt_version > 0),
  system_prompt text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  kind public.room_kind not null,
  title text not null,
  book_id text references public.books(id) on delete cascade,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rooms_book_kind_check check ((kind = 'book' and book_id is not null) or kind <> 'book')
);

create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 120),
  rationale text not null default '' check (char_length(rationale) <= 1000),
  status public.topic_status not null default 'proposed',
  proposed_by uuid references public.profiles(id) on delete set null,
  search_growth numeric(6,2) not null default 0,
  vote_score numeric(6,2) not null default 0,
  vote_count integer not null default 0 check (vote_count >= 0),
  participant_score numeric(6,2) not null default 0,
  recency_score numeric(6,2) not null default 100,
  trend_score numeric(6,2) generated always as (
    least(100, greatest(0, search_growth)) * 0.4
    + least(100, greatest(0, vote_score)) * 0.3
    + least(100, greatest(0, participant_score)) * 0.2
    + least(100, greatest(0, recency_score)) * 0.1
  ) stored,
  risk_level text not null default 'normal' check (risk_level in ('normal', 'review_required', 'blocked')),
  source_label text not null default '平台提案',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.topic_sources (
  id bigint generated always as identity primary key,
  topic_id uuid not null references public.topics(id) on delete cascade,
  source_type text not null check (source_type in ('reader', 'search', 'editor', 'web_search', 'approved_url')),
  source_url text,
  source_title text,
  excerpt text check (char_length(excerpt) <= 2000),
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.topic_votes (
  topic_id uuid not null references public.topics(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (topic_id, user_id)
);

create table if not exists public.ai_sessions (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete restrict,
  status public.session_status not null default 'queued',
  visibility text not null default 'internal' check (visibility in ('internal', 'public')),
  max_turns smallint not null default 6 check (max_turns between 1 and 6),
  current_turn smallint not null default 0 check (current_turn between 0 and 6),
  scheduled_for timestamptz not null,
  started_at timestamptz,
  completed_at timestamptz,
  editor_summary text,
  citations jsonb not null default '[]'::jsonb,
  failure_reason text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_session_participants (
  session_id uuid not null references public.ai_sessions(id) on delete cascade,
  persona_id uuid not null references public.personas(id) on delete restrict,
  turn_order smallint not null check (turn_order between 1 and 6),
  created_at timestamptz not null default now(),
  primary key (session_id, persona_id),
  unique (session_id, turn_order)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  session_id uuid references public.ai_sessions(id) on delete cascade,
  parent_id uuid references public.messages(id) on delete set null,
  user_id uuid references public.profiles(id) on delete set null,
  persona_id uuid references public.personas(id) on delete set null,
  actor_kind public.actor_kind not null,
  speaker_name text not null check (char_length(speaker_name) between 1 and 60),
  content text not null check (char_length(content) between 1 and 1600),
  status public.message_status not null default 'pending',
  turn_index smallint check (turn_index between 0 and 6),
  moderation_labels jsonb not null default '{}'::jsonb,
  citations jsonb not null default '[]'::jsonb,
  openai_response_id text,
  created_at timestamptz not null default now(),
  constraint messages_actor_owner_check check (
    (actor_kind = 'reader' and user_id is not null and persona_id is null)
    or (actor_kind in ('persona', 'editor') and persona_id is not null and user_id is null)
    or (actor_kind = 'system' and user_id is null)
  )
);

create table if not exists public.reactions (
  message_id uuid not null references public.messages(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('helpful', 'insightful', 'agree')),
  created_at timestamptz not null default now(),
  primary key (message_id, user_id, kind)
);

create table if not exists public.reports (
  id bigint generated always as identity primary key,
  message_id uuid not null references public.messages(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null check (reason in ('spam', 'harassment', 'unsafe', 'misinformation', 'other')),
  detail text not null default '' check (char_length(detail) <= 500),
  status text not null default 'open' check (status in ('open', 'reviewed', 'dismissed', 'actioned')),
  created_at timestamptz not null default now(),
  unique (message_id, reporter_id)
);

create table if not exists public.feedback_items (
  id uuid primary key default gen_random_uuid(),
  message_id uuid references public.messages(id) on delete set null,
  book_id text references public.books(id) on delete cascade,
  kind public.feedback_kind not null,
  status public.feedback_status not null default 'pending',
  excerpt text not null check (char_length(excerpt) between 1 and 500),
  summary text not null default '' check (char_length(summary) <= 1200),
  confidence numeric(4,3) check (confidence between 0 and 1),
  consumed_chapter text,
  consumed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.generation_jobs (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('author_reply', 'ai_session', 'feedback_extract', 'ranking_aggregate', 'retention')),
  status public.job_status not null default 'pending',
  payload jsonb not null default '{}'::jsonb,
  idempotency_key text not null unique,
  attempts smallint not null default 0 check (attempts between 0 and 8),
  available_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  worker_id text,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.idempotency_keys (
  key text primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  operation text not null,
  response jsonb,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours')
);

create table if not exists public.analytics_event_keys (
  day date not null,
  fingerprint_hash text not null check (char_length(fingerprint_hash) = 64),
  target_key text not null check (char_length(target_key) between 3 and 160),
  metric text not null check (metric in ('engaged_reader', 'chapter_complete', 'search', 'topic_view')),
  scope text not null default '',
  created_at timestamptz not null default now(),
  primary key (day, fingerprint_hash, target_key, metric, scope)
);

create table if not exists public.analytics_daily (
  day date not null,
  book_id text references public.books(id) on delete cascade,
  persona_id uuid references public.personas(id) on delete cascade,
  topic_id uuid references public.topics(id) on delete cascade,
  metric text not null check (metric in ('engaged_reader', 'chapter_complete', 'search', 'discussion_participant', 'topic_view')),
  value numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  primary key (day, metric, book_id, persona_id, topic_id)
);

create table if not exists public.author_scores_daily (
  day date not null,
  persona_id uuid not null references public.personas(id) on delete cascade,
  engaged_readers numeric(6,2) not null default 0,
  helpful_ratio numeric(6,2) not null default 0,
  completion_rate numeric(6,2) not null default 0,
  growth_rate numeric(6,2) not null default 0,
  score numeric(6,2) generated always as (
    least(100, greatest(0, engaged_readers)) * 0.35
    + least(100, greatest(0, helpful_ratio)) * 0.25
    + least(100, greatest(0, completion_rate)) * 0.2
    + least(100, greatest(0, growth_rate)) * 0.2
  ) stored,
  created_at timestamptz not null default now(),
  primary key (day, persona_id)
);

create table if not exists public.ai_run_usage (
  id bigint generated always as identity primary key,
  job_id uuid references public.generation_jobs(id) on delete set null,
  session_id uuid references public.ai_sessions(id) on delete set null,
  model text not null,
  operation text not null,
  input_tokens integer not null default 0 check (input_tokens >= 0),
  output_tokens integer not null default 0 check (output_tokens >= 0),
  latency_ms integer check (latency_ms >= 0),
  estimated_cost_usd numeric(12,6) not null default 0 check (estimated_cost_usd >= 0),
  success boolean not null default true,
  error_code text,
  created_at timestamptz not null default now()
);

create index if not exists personas_book_id_idx on public.personas(book_id);
create index if not exists rooms_book_id_idx on public.rooms(book_id);
create unique index if not exists rooms_one_book_room_idx on public.rooms(book_id) where kind = 'book';
create index if not exists topics_status_score_created_idx on public.topics(status, trend_score desc, created_at desc);
create index if not exists topics_proposed_by_idx on public.topics(proposed_by);
create index if not exists topic_sources_topic_id_idx on public.topic_sources(topic_id);
create index if not exists topic_votes_user_id_idx on public.topic_votes(user_id);
create index if not exists ai_sessions_room_id_idx on public.ai_sessions(room_id);
create index if not exists ai_sessions_topic_id_idx on public.ai_sessions(topic_id);
create index if not exists ai_sessions_status_schedule_idx on public.ai_sessions(status, scheduled_for)
  where status in ('queued', 'running', 'reviewing');
create index if not exists ai_session_participants_persona_id_idx on public.ai_session_participants(persona_id);
create index if not exists messages_room_created_id_idx on public.messages(room_id, created_at desc, id desc)
  where status = 'visible';
create index if not exists messages_session_turn_idx on public.messages(session_id, turn_index)
  where session_id is not null;
create index if not exists messages_user_created_idx on public.messages(user_id, created_at desc)
  where user_id is not null;
create index if not exists messages_parent_id_idx on public.messages(parent_id) where parent_id is not null;
create index if not exists messages_persona_id_idx on public.messages(persona_id) where persona_id is not null;
create index if not exists reactions_user_id_idx on public.reactions(user_id);
create index if not exists reports_reporter_id_idx on public.reports(reporter_id);
create index if not exists feedback_book_status_created_idx on public.feedback_items(book_id, status, created_at desc);
create index if not exists feedback_message_id_idx on public.feedback_items(message_id) where message_id is not null;
create index if not exists generation_jobs_pending_idx on public.generation_jobs(available_at, created_at)
  where status = 'pending';
create index if not exists idempotency_expiry_idx on public.idempotency_keys(expires_at);
create index if not exists ai_run_usage_created_idx on public.ai_run_usage(created_at desc);
create index if not exists ai_run_usage_job_id_idx on public.ai_run_usage(job_id) where job_id is not null;
create index if not exists ai_run_usage_session_id_idx on public.ai_run_usage(session_id) where session_id is not null;

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$ declare table_name text; begin
  foreach table_name in array array['profiles','feature_flags','books','personas','rooms','topics','ai_sessions','feedback_items','generation_jobs']
  loop
    execute format('drop trigger if exists %I_touch_updated_at on public.%I', table_name, table_name);
    execute format('create trigger %I_touch_updated_at before update on public.%I for each row execute function public.touch_updated_at()', table_name, table_name);
  end loop;
end $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1), '天書讀者'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role in ('moderator', 'admin') and not is_suspended
  );
$$;

create or replace function public.claim_generation_job(p_worker_id text, p_kind text default null)
returns public.generation_jobs
language plpgsql security definer set search_path = '' as $$
declare claimed public.generation_jobs;
begin
  update public.generation_jobs
  set status = 'processing', worker_id = p_worker_id, started_at = now(), attempts = attempts + 1, updated_at = now()
  where id = (
    select id from public.generation_jobs
    where status = 'pending'
      and available_at <= now()
      and (p_kind is null or kind = p_kind)
    order by available_at, created_at
    limit 1
    for update skip locked
  )
  returning * into claimed;
  return claimed;
end;
$$;

create or replace function public.refresh_topic_vote_scores()
returns void language sql security definer set search_path = '' as $$
  update public.topics t
  set vote_score = least(100, coalesce(v.vote_count, 0) * 20),
      vote_count = coalesce(v.vote_count, 0),
      status = case when t.status = 'proposed' and t.risk_level = 'normal' and v.vote_count >= 5 then 'approved'::public.topic_status else t.status end,
      updated_at = now()
  from (
    select topic_id, count(*)::numeric as vote_count
    from public.topic_votes group by topic_id
  ) v
  where t.id = v.topic_id;
$$;

alter table public.profiles enable row level security;
alter table public.feature_flags enable row level security;
alter table public.books enable row level security;
alter table public.personas enable row level security;
alter table public.rooms enable row level security;
alter table public.topics enable row level security;
alter table public.topic_sources enable row level security;
alter table public.topic_votes enable row level security;
alter table public.ai_sessions enable row level security;
alter table public.ai_session_participants enable row level security;
alter table public.messages enable row level security;
alter table public.reactions enable row level security;
alter table public.reports enable row level security;
alter table public.feedback_items enable row level security;
alter table public.generation_jobs enable row level security;
alter table public.idempotency_keys enable row level security;
alter table public.analytics_event_keys enable row level security;
alter table public.analytics_daily enable row level security;
alter table public.author_scores_daily enable row level security;
alter table public.ai_run_usage enable row level security;

create policy profiles_self_read on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));
create policy feature_flags_public_read on public.feature_flags for select to anon, authenticated using (true);
create policy profiles_self_update on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()) and role = 'reader');
create policy books_public_read on public.books for select to anon, authenticated using (true);
create policy personas_public_read on public.personas for select to anon, authenticated using (is_active);
create policy rooms_public_read on public.rooms for select to anon, authenticated using (is_public);
create policy topics_public_read on public.topics for select to anon, authenticated
  using (status in ('approved', 'scheduled', 'discussed') and risk_level <> 'blocked'
    and exists (select 1 from public.feature_flags f where f.key = 'ai_hub_enabled' and f.enabled));
create policy topic_sources_public_read on public.topic_sources for select to anon, authenticated
  using (exists (select 1 from public.topics t where t.id = topic_id and t.status in ('approved', 'scheduled', 'discussed') and t.risk_level <> 'blocked')
    and exists (select 1 from public.feature_flags f where f.key = 'ai_hub_enabled' and f.enabled));
create policy topic_votes_public_read on public.topic_votes for select to anon, authenticated using (true);
create policy ai_sessions_public_read on public.ai_sessions for select to anon, authenticated
  using (visibility = 'public' and status in ('running', 'published')
    and exists (select 1 from public.feature_flags f where f.key = 'ai_hub_enabled' and f.enabled));
create policy participants_public_read on public.ai_session_participants for select to anon, authenticated
  using (exists (select 1 from public.ai_sessions s where s.id = session_id and s.visibility = 'public' and s.status in ('running', 'published')));
create policy messages_public_read on public.messages for select to anon, authenticated
  using (status = 'visible' and exists (select 1 from public.rooms r where r.id = room_id and r.is_public));
create policy reactions_public_read on public.reactions for select to anon, authenticated
  using (exists (select 1 from public.messages m where m.id = message_id and m.status = 'visible'));
create policy feedback_owner_read on public.feedback_items for select to authenticated
  using ((select public.is_admin()) or exists (select 1 from public.messages m where m.id = message_id and m.user_id = (select auth.uid())));
create policy reports_owner_read on public.reports for select to authenticated
  using (reporter_id = (select auth.uid()) or (select public.is_admin()));
create policy author_scores_public_read on public.author_scores_daily for select to anon, authenticated
  using (exists (select 1 from public.feature_flags f where f.key = 'ai_hub_enabled' and f.enabled));

revoke all on all tables in schema public from anon, authenticated;
grant select on public.feature_flags, public.rooms, public.topic_sources, public.author_scores_daily to anon, authenticated;
grant select (id, title, author_name, category, premise, cover_image, latest_chapter, chapter_count, manifest_updated_at, is_active, created_at, updated_at)
  on public.books to anon, authenticated;
grant select (id, book_id, slug, display_name, initial, accent, role, focus, is_active, created_at, updated_at)
  on public.personas to anon, authenticated;
grant select (id, title, rationale, status, search_growth, vote_score, vote_count, participant_score, recency_score, trend_score, risk_level, source_label, created_at, updated_at)
  on public.topics to anon, authenticated;
grant select (id, room_id, topic_id, status, visibility, max_turns, current_turn, scheduled_for, started_at, completed_at, editor_summary, citations, created_at, updated_at)
  on public.ai_sessions to anon, authenticated;
grant select (session_id, persona_id, turn_order, created_at) on public.ai_session_participants to anon, authenticated;
grant select (id, room_id, session_id, parent_id, persona_id, actor_kind, speaker_name, content, status, turn_index, citations, created_at)
  on public.messages to anon, authenticated;
grant select on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;
grant select on public.feedback_items, public.reports to authenticated;

create or replace view public.v_author_leaderboard
with (security_invoker = true) as
select
  p.id as persona_id,
  p.book_id,
  p.display_name as author,
  p.initial,
  p.accent,
  p.focus,
  b.title,
  b.cover_image,
  s.score,
  s.engaged_readers,
  s.helpful_ratio,
  s.completion_rate,
  s.growth_rate,
  case when s.score is null then '資料累積中' else '七日真實分數' end as score_label
from public.personas p
left join public.books b on b.id = p.book_id
left join lateral (
  select * from public.author_scores_daily a
  where a.persona_id = p.id order by a.day desc limit 1
) s on true
where p.is_active and p.role = 'persona'
  and exists (select 1 from public.feature_flags f where f.key = 'ai_hub_enabled' and f.enabled)
order by s.score desc nulls last, p.display_name;

create or replace view public.v_hot_topics
with (security_invoker = true) as
select
  t.id,
  t.title,
  t.source_label as source,
  case when t.vote_count < 5 then null else round(t.trend_score) end as score,
  case when t.vote_count < 5 then '新題材' else '熱度' end as label,
  t.vote_count as votes,
  t.created_at
from public.topics t
where t.status in ('approved', 'scheduled', 'discussed') and t.risk_level <> 'blocked'
  and exists (select 1 from public.feature_flags f where f.key = 'ai_hub_enabled' and f.enabled)
order by t.trend_score desc, t.created_at desc;

create or replace view public.v_latest_chapters
with (security_invoker = true) as
select id as book_id, title, author_name as author, cover_image, latest_chapter, chapter_count, manifest_updated_at
from public.books where is_active order by manifest_updated_at desc nulls last, title;

create or replace view public.v_home_feed
with (security_invoker = true) as
select
  s.id,
  s.room_id,
  s.status,
  t.title,
  t.source_label as topic_label,
  s.editor_summary as summary,
  s.citations as sources,
  s.scheduled_for,
  (
    select coalesce(jsonb_agg(jsonb_build_object(
      'id', p.id, 'name', p.display_name, 'initial', p.initial, 'accent', p.accent, 'title', b.title
    ) order by sp.turn_order), '[]'::jsonb)
    from public.ai_session_participants sp
    join public.personas p on p.id = sp.persona_id
    left join public.books b on b.id = p.book_id
    where sp.session_id = s.id
  ) as participants,
  (
    select coalesce(jsonb_agg(jsonb_build_object(
      'id', m.id, 'actorKind', m.actor_kind, 'speaker', m.speaker_name, 'content', m.content,
      'createdAt', m.created_at, 'turnIndex', m.turn_index, 'accent', coalesce(p.accent, '#ffd37b'),
      'citations', m.citations
    ) order by m.turn_index, m.created_at), '[]'::jsonb)
    from public.messages m left join public.personas p on p.id = m.persona_id
    where m.session_id = s.id and m.status = 'visible'
  ) as messages
from public.ai_sessions s
join public.topics t on t.id = s.topic_id
where s.visibility = 'public' and s.status in ('running', 'published')
  and exists (select 1 from public.feature_flags f where f.key = 'ai_hub_enabled' and f.enabled)
order by case s.status when 'running' then 0 else 1 end, coalesce(s.started_at, s.scheduled_for) desc
limit 1;

grant select on public.v_author_leaderboard, public.v_hot_topics, public.v_latest_chapters, public.v_home_feed to anon, authenticated;

insert into public.rooms (slug, kind, title, is_public)
values ('platform-lobby', 'platform', '天書平台討論', true), ('ai-council', 'ai_council', '天書 AI 議事廳', true)
on conflict (slug) do nothing;

insert into public.feature_flags (key, enabled, description)
values
  ('ai_hub_enabled', false, '顯示 AI 議事廳、作者榜與熱搜首頁'),
  ('posting_enabled', false, '允許已登入讀者留言、投票與提案'),
  ('auto_sessions_enabled', false, '允許排程自動建立 AI 場次')
on conflict (key) do nothing;
