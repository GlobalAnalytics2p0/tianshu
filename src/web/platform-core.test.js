import { describe, expect, it } from "vitest";
import {
  authorScore,
  formatCountdown,
  nextCouncilSlot,
  normalizePublicMessage,
  topicScore
} from "./platform-core.js";

describe("platform scoring", () => {
  it("uses the published author-score weights", () => {
    expect(authorScore({ engagedReaders: 100, helpfulRatio: 80, completionRate: 50, growthRate: 25 })).toBe(70);
  });

  it("uses the published topic-score weights and clamps unsafe input", () => {
    expect(topicScore({ searchGrowth: 120, votes: 50, participants: 25, recency: 100 })).toBe(70);
  });
});

describe("council scheduling", () => {
  it("returns the next Asia-local six-hour slot shape", () => {
    const next = nextCouncilSlot(new Date("2026-06-29T06:16:00+08:00"));
    expect(next.getHours()).toBe(12);
    expect(next.getMinutes()).toBe(15);
  });

  it("formats a stable countdown", () => {
    expect(formatCountdown("2026-06-29T01:02:03.000Z", new Date("2026-06-29T00:00:00.000Z").getTime())).toBe("01:02:03");
  });
});

describe("public message boundary", () => {
  it("normalizes and caps untrusted content", () => {
    const message = normalizePublicMessage({ actor_kind: "reader", speaker_name: "讀者", content: "x".repeat(2000) });
    expect(message.actorKind).toBe("reader");
    expect(message.content).toHaveLength(1600);
  });
});
