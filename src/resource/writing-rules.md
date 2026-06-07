# 天書 Novel Writing Rules

## Core Goal

- Write original Traditional Chinese serial fiction that feels intentional, human, and worth following.
- Think in long-term-serialization mode. Every chapter should serve a durable long arc, not just chase short-term excitement.
- The target reader is here for story, tension, emotion, payoff, and curiosity. Do not explain how the chapter is structured.
- Each chapter should create enough unresolved curiosity that the reader wants the next update, but it should still feel satisfying on its own.
- The core reader wants relaxed, direct, satisfying serial fiction. Make the prose easy to enter, the stakes concrete, the protagonist's pressure clear, and the chapter rewarding even while the long mystery remains unresolved.
- Aim for雅俗共賞: tension and depth should coexist with readable scenes, clear emotional pressure, lived daily details, small wins, and momentum.
- Audience experience comes first. Use reader and user feedback to adjust pacing, emphasis, mystery density, emotional spacing, and spotlight allocation when that feedback improves engagement or clarity.
- Long-term serialization is a rhythm, not only a mystery reserve. After a local high point, allow cooling space: aftermath, fatigue, ordinary costs, small humor, repaired trust, witness reactions, or a concrete practical problem before the next pressure wave.

## Length And Storage

- Each normal chapter must be 6,000-6,500 Traditional Chinese non-whitespace characters unless the user explicitly sets a different target. Previously published chapters may remain at their published length and must not be expanded only to satisfy a later rule change.
- Save every chapter as an independent `.txt` file. For migrated title folders, use `src/resource/<novel title>/文章/`; for unmigrated folders, use the existing `src/resource/<novel title>/` root until that title is reorganized.
- Update `src/resource/manifest.json` after writing or revising chapter files.
- Never store chapter bodies inline in `app.js`.
- Published chapters are locked canon. Do not edit an already published chapter unless the user explicitly authorizes a post-publication correction. For `星骸王座`, `第01章 星核在雨夜說謊` is already published and must remain unchanged.

## Continuity

- Before writing a new chapter, read `src/resource/manifest.json`, this rules file, `agent.md`, `src/resource/五本長篇共通管理規範.md`, the novel's `核心靈魂檔案.md`, `作者思路.md`, `人物架構.md`, `每日寫作狀態.md`, `伏筆事件台帳.md`, and all existing `.txt` chapters for that novel. For migrated folders, read continuity Markdown from `src/resource/<novel title>/素材/` and chapters from `src/resource/<novel title>/文章/`.
- Unless the user explicitly requests otherwise, all new content extends existing canon. Do not go back and revise earlier chapter events, outcomes, or facts just to make the next chapter easier.
- Preserve character state, setting rules, unresolved hooks, emotional consequences, clues, debts, injuries, secrets, and relationship changes.
- Do not contradict previous chapters. If a prior scene leaves a mystery, either deepen it or pay off only part of it.
- If understanding is incomplete, reread the earlier chapters and continuity files until the logic is clear enough to continue without retcon pressure.
- Refresh the correct author persona before writing. The five active books must not share the same sentence rhythm, emotional temperature, clue style, or chapter engine.
- If writing produces a new durable insight, record it in the correct Markdown file before ending the run. Do not rely on vague future recall.
- Every title must retain enough structural runway to serialize beyond 1,500 chapters. Do not spend the premise, final villain tier, ultimate setting answer, or irreversible relationship endgame too early.
- The full library can stay online, but routine maintenance is currently limited to 5 category leaders only: `星骸王座`, `灰塔觀測者`, `雪刃照孤城`, `凌晨三點的演算法`, and `大明墨工`.
- Unless the user explicitly changes scope, daily work should update only the novel text and manifest metadata for those 5 titles. The other 35 titles remain frozen.
- Video planning, audiobook planning, and non-novel asset work are out of the default daily update path unless the user explicitly asks for them.

## Plot And Tension

- Build around one clear event or problem per chapter. Let it breathe before adding another major turn.
- Default to one primary viewpoint center at the start of the chapter. Let the reader settle into one person, one pressure, and one immediate situation before expanding the scope.
- Use the long-serial rhythm of "small event fast, major truth slow": the day's concrete incident should move, hurt, and resolve partially; the central mystery should advance only by one controlled layer.
- The 6,000-6,500 character format should support stronger audiobook retention: deepen scene continuity, let danger breathe, add concrete minor-character pressure, and include one or two staged reversals. Do not use the added length for repeated inspection beats, repeated silence, or abstract explanation.
- Do not treat every chapter as a bigger explosion than the last. A long serial should alternate pressure and release, letting a smaller consequence, meal, walk, injury, debt, search, or conversation carry interest between peaks.
- Give the reader a local reward whenever possible: a clever escape, a recovered clue, a face-saving reversal, an enemy misread, a saved minor character, a practical gain, or a sharper emotional commitment.
- Keep important foreshadowing alive for longer. Do not reveal every hook immediately after it appears.
- Use slow-burn escalation: ordinary pressure, wrong detail, personal stake, risky choice, partial reversal, stronger unanswered question.
- Do not front-load too many major protagonists, master plans, top-level factions, or ultimate answers. Curiosity should widen by control, not by immediate overexposure.
- Avoid mechanical escalation where every paragraph adds a new object, new institution, or new mystery.
- A good final hook should sharpen a question, not dump a full explanation.
- Plan in layers: chapter payoff, short arc payoff, mid-arc reversal, and very long arc payoff. Seed threads that can stay dormant for dozens or hundreds of chapters before returning in a stronger form.
- When planting foreshadowing, prefer partial answers, mistaken interpretations, hidden costs, and delayed recognitions. Major clues should mature over time instead of being immediately explained in the next chapter.

## Character Rules

- Early chapters must make the main character concrete: daily pressure, personal weakness, desire, fear, moral line, and why they cannot simply walk away.
- Keep the active cast small. Early chapters should usually focus on the protagonist plus one or two important supporting characters.
- Avoid introducing too many named people, factions, titles, or relics in one chapter.
- Let personality emerge through choices, gestures, dialogue, and memory instead of biography dumps.
- Small roles are encouraged when useful, but they must have a function: witness pressure, add humor or life texture, expose class/workplace/institutional stakes, carry a clue, or make the protagonist's choice matter to someone concrete.
- Do not turn minor characters into exposition devices. Give them one human detail, one pressure, or one recognizable desire, then let the scene move.

## Style

- Vary tone by book and genre. Some serials can be deep, restrained, and oppressive; others can be爽文, direct, clever, and momentum-driven.
- Prose should feel human: less template rhythm, fewer repeated sentence structures, clearer cause and effect, more intuitive transitions.
- Paragraphs can be longer when staying with one event, conversation, or emotional beat. Avoid jumpy short-section montage. Strong scenes are allowed to take a larger share of the chapter.
- Prefer specific physical detail over abstract labels. Use concrete rooms, weather, sounds, small habits, money, work, wounds, tools, documents, and social pressure.
- Prefer white-language clarity over literary stiffness. Depth should come from situation, choice, sensory detail, and consequence, not from archaic phrasing or abstract moralizing.
- After a climax or heavy reveal, allow a brief emotional reset before building toward the next pressure wave. Rest is part of pacing, not a failure of pacing.
- Do not keep readers in nonstop high-arousal mode. Peak, release, and re-accumulation should form a readable curve.
- Side plots may interact with the main line across many chapters. They do not need to close in the same chapter, but they must remain intentional, trackable, and eventually convergent rather than multiplying without return.
- The reader should be able to inhabit the protagonist's body, stress, hesitation, and sensory field. Favor immersion over summary.
- Make transitions natural. A new clue should arise from the prior action, not appear just because the chapter needs another twist.
- Do not batch-write books by reusing the same paragraph skeleton and only replacing names, objects, factions, or settings. Each novel needs its own scene logic, clue sequence, emotional pressure, and rhythm.
- Long serials need renewable pressure. Build recurring institutions, obligations, resentments, professions, geography, and power costs that can keep producing conflict without repeating the same scene skeleton.

## Social Promotion And Cover Art

- Treat social visuals, especially Instagram images, as reader-acquisition cover art. They must sell genre, mood, conflict, and curiosity at first glance.
- Social posts should be platform-native. Instagram, Threads, Facebook, and YouTube each need independent copy, CTA shape, and verification; do not depend on cross-platform sync or paste one identical post everywhere.
- Before preparing platform posts, use `docs/roles/social-media-director/README.md` and `docs/roles/social-media-director/social-resources.md` as the operating guide.
- Upload success and publishing success are separate checks. For YouTube, verify video upload, custom thumbnail application, checks completion, public visibility, and public watch URL separately.
- Do not treat a YouTube thumbnail file picker closing as proof that the custom thumbnail was applied. Confirm the visible Studio thumbnail/preview; if it falls back to auto-generated or needs manual help, record that in the chapter production notes.
- For Instagram, Threads, and Facebook, verify each platform's own final post state after publishing. Do not assume a post appeared because another platform or share toggle reported success.
- Use owned or generated chapter-specific story art rather than website screenshots, UI cards, generic banners, or text-heavy layouts.
- Generate base artwork with no embedded text or logos, then add accurate Traditional Chinese typography locally.
- The image should show one strong story signal: protagonist, danger, mystery object, setting pressure, or iconic scene. Do not make the visual abstract when the chapter has a concrete hook.
- Keep the composition full-bleed, cinematic, and phone-readable. Avoid covering the protagonist's face, central relic/object, or main action with text boxes.
- Limit text on IG images to title/chapter plus one short hook. Put long summaries, links, hashtags, and calls to action in the post caption.
- Brand labels, badges, and frames must fit their text with generous padding. A no-frame label is better than a cramped or overflowing badge.
- Decorative rules, lines, or separators must never cross through title glyphs or interfere with readability.
- Avoid redundant corner watermarks or small extra logos unless the user explicitly asks for them.
- Use a display-quality CJK title font that fits the genre, such as Noto Serif CJK TC for serious fantasy/玄幻 assets, with restrained shadow or glow.
- Reject promotion assets with clipped text, overlapping elements, cheap-looking fonts, crowded URL blocks, unnecessary watermarks, or anything that feels like a generic automation template.

## Forbidden Prose Patterns

- Do not write meta or scaffolding phrases in novel bodies, including: `這一章`, `讀者會`, `主角`, `章末`, `第一章的安排`, `第二章會`, `後續自動化`, `故事不再`, `鉤子啟動`, `第一次反咬`.
- Do not explain the chapter's writing intent, structure, hook strategy, or future automation.
- Do not paste the premise as a summary paragraph. Convert the premise into lived scenes.
- Do not repeat filler paragraphs to reach length.
- Do not use obvious padding phrases such as numbered repetitions, repeated silence beats, repeated clue-inspection beats, or near-identical paragraph openings to reach length.
- Do not overpack names or lore terms. Too many proper nouns in early chapters lowers clarity.

## Review Gate

- After generation or revision, check:
  - 6,000-6,500 non-whitespace Traditional Chinese characters for new or unpublished chapters, with documented exceptions only for already-published locked chapters or explicit user approval.
  - No forbidden meta/scaffolding phrases.
  - The body does not contain the manifest `premise` sentence verbatim.
  - No repeated filler paragraphs.
  - No repeated or near-repeated paragraph prefixes inside the same chapter.
  - The protagonist is clear.
  - The author persona for that title is visibly distinct.
  - The chapter gives at least one local reader reward without exhausting the long arc.
  - The chapter respects existing canon instead of rewriting prior events.
  - The emotional curve is readable: build, peak, brief reset, then renewed anticipation.
  - The chapter does not keep the reader in permanent emergency mode; it uses cooling beats and ordinary consequence where the prior scene intensity calls for it.
  - The chapter is immersive enough that the reader can stay inside the protagonist's lived experience.
  - The chapter follows one main event with natural transitions.
  - The final hook is intriguing but not over-explained.
  - The chapter does not exhaust the novel's long-term runway and leaves future arc space consistent with a 1,500+ chapter serial.
  - `每日寫作狀態.md` and `伏筆事件台帳.md` are updated when the chapter changes continuity, clues, relationships, debts, injuries, secrets, or next-event direction.
  - If the writing pass revealed a reusable lesson, it has been recorded in the right durable file instead of being left implicit.
