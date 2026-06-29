alter table public.analytics_daily drop constraint if exists analytics_daily_pkey;
alter table public.analytics_daily add column if not exists id bigint generated always as identity;
alter table public.analytics_daily add constraint analytics_daily_pkey primary key (id);
alter table public.analytics_daily alter column book_id drop not null;
alter table public.analytics_daily alter column persona_id drop not null;
alter table public.analytics_daily alter column topic_id drop not null;
create unique index if not exists analytics_daily_identity_idx
  on public.analytics_daily (day, metric, book_id, persona_id, topic_id) nulls not distinct;

create policy topics_admin_all on public.topics for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy feature_flags_admin_update on public.feature_flags for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy topic_sources_admin_all on public.topic_sources for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy ai_sessions_admin_all on public.ai_sessions for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy participants_admin_all on public.ai_session_participants for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy messages_admin_update on public.messages for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy messages_admin_read on public.messages for select to authenticated
  using ((select public.is_admin()));
create policy feedback_admin_all on public.feedback_items for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy reports_admin_update on public.reports for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

grant update on public.feature_flags to authenticated;
grant insert, update on public.topics, public.topic_sources, public.ai_sessions, public.ai_session_participants to authenticated;
grant update on public.messages, public.feedback_items, public.reports to authenticated;

create or replace function public.increment_analytics_metric(p_metric text, p_book_id text default null, p_topic_id uuid default null)
returns void
language plpgsql security definer set search_path = '' as $$
declare v_persona_id uuid;
declare v_day date := (now() at time zone 'Asia/Taipei')::date;
begin
  if p_metric not in ('engaged_reader', 'chapter_complete', 'search', 'topic_view') then raise exception 'invalid_metric'; end if;
  if p_book_id is not null then
    select id into v_persona_id from public.personas where book_id = p_book_id and role = 'persona' and is_active limit 1;
    if v_persona_id is null then return; end if;
  elsif p_topic_id is null then
    raise exception 'missing_analytics_target';
  end if;
  insert into public.analytics_daily (day, book_id, persona_id, topic_id, metric, value)
  values (v_day, p_book_id, v_persona_id, p_topic_id, p_metric, 1)
  on conflict (day, metric, book_id, persona_id, topic_id)
  do update set value = public.analytics_daily.value + 1;
end;
$$;

drop policy if exists messages_public_read on public.messages;
create policy messages_public_read on public.messages for select to anon, authenticated
  using (
    status = 'visible'
    and exists (select 1 from public.rooms r where r.id = room_id and r.is_public)
    and (
      session_id is null
      or exists (
        select 1 from public.ai_sessions s
        where s.id = session_id and s.visibility = 'public' and s.status in ('running', 'published')
      )
    )
  );

create or replace function public.admin_create_session(
  p_topic_id uuid,
  p_persona_ids uuid[],
  p_scheduled_for timestamptz default now(),
  p_visibility text default 'internal'
)
returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_session_id uuid;
  v_room_id uuid;
  v_persona_id uuid;
  v_position integer := 0;
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  if array_length(p_persona_ids, 1) < 2 or array_length(p_persona_ids, 1) > 4 then
    raise exception 'participant_count_invalid';
  end if;
  select id into v_room_id from public.rooms where slug = 'ai-council';
  insert into public.ai_sessions (room_id, topic_id, status, visibility, scheduled_for, created_by)
  values (v_room_id, p_topic_id, 'queued', p_visibility, p_scheduled_for, auth.uid())
  returning id into v_session_id;
  foreach v_persona_id in array p_persona_ids loop
    v_position := v_position + 1;
    insert into public.ai_session_participants (session_id, persona_id, turn_order)
    values (v_session_id, v_persona_id, v_position);
  end loop;
  update public.topics set status = 'scheduled' where id = p_topic_id;
  insert into public.generation_jobs (kind, payload, idempotency_key, available_at)
  values ('ai_session', jsonb_build_object('sessionId', v_session_id), 'council:' || v_session_id::text, p_scheduled_for);
  return v_session_id;
end;
$$;

create or replace function public.admin_review_session(p_session_id uuid, p_decision text)
returns void
language plpgsql security definer set search_path = '' as $$
declare v_topic_id uuid;
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  if p_decision not in ('publish', 'reject') then raise exception 'invalid_decision'; end if;
  select topic_id into v_topic_id from public.ai_sessions where id = p_session_id and status = 'reviewing' for update;
  if v_topic_id is null then raise exception 'session_not_reviewable'; end if;
  if p_decision = 'publish' then
    update public.messages m
    set status = 'visible'
    where m.session_id = p_session_id
      and m.status = 'quarantined'
      and not exists (
        select 1 from jsonb_each_text(m.moderation_labels) label where label.value = 'true'
      );
    update public.ai_sessions set status = 'published', visibility = 'public' where id = p_session_id;
    update public.topics set status = 'discussed' where id = v_topic_id;
  else
    update public.messages set status = 'rejected' where session_id = p_session_id;
    update public.ai_sessions set status = 'cancelled', visibility = 'internal' where id = p_session_id;
    update public.topics set status = 'approved' where id = v_topic_id;
  end if;
end;
$$;

create or replace function public.queue_next_council_session(p_scheduled_for timestamptz default now())
returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_topic_id uuid;
  v_room_id uuid;
  v_session_id uuid;
  v_position integer := 0;
  v_persona record;
begin
  if not exists (select 1 from public.feature_flags where key = 'auto_sessions_enabled' and enabled) then
    return null;
  end if;
  select t.id into v_topic_id
  from public.topics t
  where t.status = 'approved'
    and t.risk_level = 'normal'
  order by t.trend_score desc, t.created_at
  limit 1
  for update skip locked;
  if v_topic_id is null then return null; end if;
  select id into v_room_id from public.rooms where slug = 'ai-council';
  insert into public.ai_sessions (room_id, topic_id, status, visibility, scheduled_for)
  values (v_room_id, v_topic_id, 'queued', 'internal', p_scheduled_for)
  returning id into v_session_id;
  for v_persona in
    select id from public.personas where role = 'persona' and is_active order by updated_at desc, display_name limit 4
  loop
    v_position := v_position + 1;
    insert into public.ai_session_participants (session_id, persona_id, turn_order)
    values (v_session_id, v_persona.id, v_position);
  end loop;
  update public.topics set status = 'scheduled' where id = v_topic_id;
  insert into public.generation_jobs (kind, payload, idempotency_key, available_at)
  values ('ai_session', jsonb_build_object('sessionId', v_session_id), 'council:' || v_session_id::text, p_scheduled_for);
  return v_session_id;
end;
$$;

create or replace function public.prune_book_messages()
returns integer
language plpgsql security definer set search_path = '' as $$
declare deleted_count integer;
begin
  delete from public.analytics_event_keys where created_at < now() - interval '90 days';
  delete from public.ai_run_usage where created_at < now() - interval '30 days';
  update public.messages set openai_response_id = null where openai_response_id is not null and created_at < now() - interval '30 days';
  delete from public.messages m
  using public.ai_sessions s
  where m.session_id = s.id and s.status <> 'published' and m.created_at < now() - interval '30 days';
  insert into public.generation_jobs (kind, payload, idempotency_key)
  select 'feedback_extract', jsonb_build_object('messageId', ranked.id), 'feedback:' || ranked.id::text
  from (
    select m.id, row_number() over (partition by r.book_id order by m.created_at desc, m.id desc) as position
    from public.messages m join public.rooms r on r.id = m.room_id
    where r.kind = 'book' and m.actor_kind = 'reader'
  ) ranked
  where ranked.position > 500
  on conflict (idempotency_key) do nothing;

  update public.feedback_items f
  set excerpt = '（原文已依保留政策移除）'
  where f.message_id in (
    select ranked.id from (
      select m.id, row_number() over (partition by r.book_id order by m.created_at desc, m.id desc) as position
      from public.messages m join public.rooms r on r.id = m.room_id
      where r.kind = 'book' and m.actor_kind = 'reader'
    ) ranked where ranked.position > 500
  );

  delete from public.messages m
  using (
    select m2.id, row_number() over (partition by r.book_id order by m2.created_at desc, m2.id desc) as position
    from public.messages m2 join public.rooms r on r.id = m2.room_id
    where r.kind = 'book'
  ) ranked
  where m.id = ranked.id
    and ranked.position > 500
    and (m.actor_kind <> 'reader' or exists (select 1 from public.feedback_items f where f.message_id = m.id));
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

revoke all on function public.admin_create_session(uuid, uuid[], timestamptz, text) from public;
grant execute on function public.admin_create_session(uuid, uuid[], timestamptz, text) to authenticated;
revoke all on function public.admin_review_session(uuid, text) from public;
grant execute on function public.admin_review_session(uuid, text) to authenticated;
revoke all on function public.queue_next_council_session(timestamptz) from public;
revoke all on function public.prune_book_messages() from public;
revoke all on function public.increment_analytics_metric(text, text, uuid) from public;
grant execute on function public.increment_analytics_metric(text, text, uuid) to service_role;

create or replace function public.configure_tianshu_cron(p_project_url text, p_cron_secret text)
returns void
language plpgsql security definer set search_path = '' as $$
begin
  if current_user not in ('postgres', 'supabase_admin') then raise exception 'forbidden'; end if;
  perform cron.unschedule(jobid) from cron.job where jobname in ('tianshu-queue-council', 'tianshu-run-ai-worker', 'tianshu-aggregate-rankings', 'tianshu-prune-comments');
  perform cron.schedule('tianshu-queue-council', '15 4,10,16,22 * * *', 'select public.queue_next_council_session(now())');
  perform cron.schedule(
    'tianshu-run-ai-worker', '*/5 * * * *',
    format($job$select net.http_post(url := %L, headers := jsonb_build_object('Content-Type','application/json','x-cron-secret',%L), body := '{}'::jsonb)$job$, p_project_url || '/functions/v1/run-ai-session', p_cron_secret)
  );
  perform cron.schedule(
    'tianshu-aggregate-rankings', '30 16 * * *',
    format($job$select net.http_post(url := %L, headers := jsonb_build_object('Content-Type','application/json','x-cron-secret',%L), body := '{}'::jsonb)$job$, p_project_url || '/functions/v1/aggregate-rankings', p_cron_secret)
  );
  perform cron.schedule('tianshu-prune-comments', '45 16 * * *', 'select public.prune_book_messages()');
end;
$$;

revoke all on function public.configure_tianshu_cron(text, text) from public;
