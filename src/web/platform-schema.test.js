import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync("supabase/migrations/202606290001_tianshu_platform.sql", "utf8");
const operations = readFileSync("supabase/migrations/202606290002_admin_cron_retention.sql", "utf8");
const worker = readFileSync("supabase/functions/run-ai-session/index.ts", "utf8");

describe("Tianshu platform security contract", () => {
  it("enables RLS and starts all rollout flags disabled", () => {
    expect(migration).toContain("alter table public.messages enable row level security");
    expect(migration).toContain("alter table public.ai_run_usage enable row level security");
    expect(migration).toMatch(/\('ai_hub_enabled', false/);
    expect(migration).toMatch(/\('posting_enabled', false/);
    expect(migration).toMatch(/\('auto_sessions_enabled', false/);
  });

  it("does not grant anonymous profile, voter, reaction, or system prompt reads", () => {
    expect(migration).not.toMatch(/grant select on public\.profiles[^;]*to anon/);
    expect(migration).not.toMatch(/grant select on public\.topic_votes[^;]*to anon/);
    expect(migration).not.toMatch(/grant select on public\.reactions[^;]*to anon/);
    const personaGrant = migration.match(/grant select \(([^)]+)\)\s+on public\.personas/s)?.[1] || "";
    expect(personaGrant).not.toContain("system_prompt");
  });

  it("uses a locked queue and cursor-compatible message index", () => {
    expect(migration).toContain("for update skip locked");
    expect(migration).toContain("messages_room_created_id_idx");
    expect(migration).toContain("room_id, created_at desc, id desc");
  });

  it("keeps AI sessions finite and behind human publication review", () => {
    expect(worker).toContain("Math.min(Number(session.max_turns || 6), 6)");
    expect(worker).toContain('status: "reviewing"');
    expect(worker).toContain('visibility: "internal"');
    expect(operations).toContain("admin_review_session");
    expect(operations).toContain("status = 'published', visibility = 'public'");
  });

  it("schedules Taipei council slots in UTC and enforces retention", () => {
    expect(operations).toContain("15 4,10,16,22 * * *");
    expect(operations).toContain("created_at < now() - interval '30 days'");
    expect(operations).toContain("created_at < now() - interval '90 days'");
  });
});
