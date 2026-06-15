# 天書 Novel Writing Rules

## Core Goal

- Write original Traditional Chinese serial fiction that feels intentional, human, and worth following.
- Think in long-term-serialization mode. Every chapter should serve a durable long arc, not just chase short-term excitement.
- The target reader is here for story, tension, emotion, payoff, and curiosity. Do not explain how the chapter is structured.
- Each chapter should create enough unresolved curiosity that the reader wants the next update, but it should still feel satisfying on its own.
- The core reader wants relaxed, direct, satisfying serial fiction. Make the prose easy to enter, the stakes concrete, the protagonist's pressure clear, and the chapter rewarding even while the long mystery remains unresolved.
- Every chapter needs a reader-facing promise, not just a plot task. Define the emotional reason someone would keep reading: revenge against fate, fear of being erased, a blade held back, a black-box process made public, or a craft truth forcing power to show its crack.
- Aim for雅俗共賞: tension and depth should coexist with readable scenes, clear emotional pressure, lived daily details, small wins, and momentum.
- Audience experience comes first. Use reader and user feedback to adjust pacing, emphasis, mystery density, emotional spacing, and spotlight allocation when that feedback improves engagement or clarity.
- Long-term serialization is a rhythm, not only a mystery reserve. After a local high point, allow cooling space: aftermath, fatigue, ordinary costs, small humor, repaired trust, witness reactions, or a concrete practical problem before the next pressure wave.
- AI output speed is only an internal production aid. It is never the artistic goal, never public-facing value, and never a reason to accept flat prose, thin emotion, or interchangeable author voices.

## Length And Storage

- Each active-title routine chapter must be 6,000-6,500 Traditional Chinese non-whitespace characters unless the user explicitly sets a different target. Previously published chapters may remain at their published length and must not be expanded only to satisfy a later rule change.
- Save every chapter as an independent `.txt` file. For migrated title folders, use `src/resource/<novel title>/文章/`; for unmigrated folders, use the existing `src/resource/<novel title>/` root until that title is reorganized.
- Update `src/resource/manifest.json` after writing or revising chapter files.
- Never store chapter bodies inline in `app.js`.
- Published chapters are locked canon. Do not edit an already published chapter unless the user explicitly authorizes a post-publication correction. For `星骸王座`, Chapters 1 through 7 are already public-facing audiobook/video releases and must remain unchanged during routine prose cleanup.
- Chapter titles should be short, memorable, and production-friendly. For unpublished or newly generated chapters, prefer clear, immediately understandable titles in roughly 4-7 Traditional Chinese characters and do not exceed 7 unless the user explicitly approves a longer title.
- Do not over-compress chapter titles into opaque four-character shorthand when a clearer 5-7 character title reads better. Reduce polyphonic/易誤讀字 when practical, especially for reader-facing chapter cards and narration metadata.
- Do not use long sentence-like chapter titles as a routine pattern, especially repeated structures such as `先...的人...`, `...先把...`, or titles that explain the whole scene. Use an evocative object, place, action, or threat instead.
- Already published video/audiobook chapter titles are locked with their public assets. Do not rename published chapters unless the user explicitly approves a public metadata correction.
- For automation runs, treat `local chapter written`, `manifest updated`, `commit created`, `push succeeded`, and `live site updated` as separate states. Do not report the chapter as published on the site until the live manifest matches the local manifest.
- At the start of every six-hour automation run, check for deferred publish debt with `node scripts/check-publish-state.mjs --auto-publish-if-ahead`. If old local-only commits are still ahead of upstream and origin is reachable again, publish them before generating more chapters. If origin is unreachable, record that deferred publish debt explicitly instead of leaving the website state ambiguous.
- Do not treat a dirty worktree as proof that the latest commit was not pushed. Publish state must be judged by branch sync and site verification, while unrelated modified/untracked files must be reported separately as residual workspace dirt.

## Continuity

- Before writing a new chapter, read `src/resource/manifest.json`, this rules file, `agent.md`, `src/resource/五本長篇共通管理規範.md`, `src/resource/Share/Rule-of-Style.md`, the novel's `風格規則.md`, `核心靈魂檔案.md`, `作者思路.md`, `人物架構.md`, `每日寫作狀態.md`, `伏筆事件台帳.md`, `反思.md`, and all existing `.txt` chapters for that novel. For migrated folders, read continuity Markdown from `src/resource/<novel title>/素材/` and chapters from `src/resource/<novel title>/文章/`.
- Unless the user explicitly requests otherwise, all new content extends existing canon. Do not go back and revise earlier chapter events, outcomes, or facts just to make the next chapter easier.
- Preserve character state, setting rules, unresolved hooks, emotional consequences, clues, debts, injuries, secrets, and relationship changes.
- Do not contradict previous chapters. If a prior scene leaves a mystery, either deepen it or pay off only part of it.
- If understanding is incomplete, reread the earlier chapters and continuity files until the logic is clear enough to continue without retcon pressure.
- Refresh the correct author persona before writing. The five active books must not share the same sentence rhythm, emotional temperature, clue style, or chapter engine.
- Treat `反思.md` as the paired senior reader's direct voice. It exists to criticize drift, expose weak beats, and force growth, not to flatter the writer.
- If writing produces a new durable insight, record it in the correct Markdown file before ending the run. Do not rely on vague future recall.
- Every title must retain enough structural runway to serialize beyond 1,500 chapters. Do not spend the premise, final villain tier, ultimate setting answer, or irreversible relationship endgame too early.
- The full library can stay online, but routine maintenance is currently limited to 5 category leaders only: `星骸王座`, `灰塔觀測者`, `雪刃照孤城`, `凌晨三點的演算法`, and `大明墨工`.
- Unless the user explicitly changes scope, six-hour scheduled work should update only the novel text and manifest metadata for those 5 titles. The other 35 titles remain frozen in `src/resource/backup/`.
- Video planning, audiobook planning, and non-novel asset work are out of the default six-hour update path unless the user explicitly asks for them.

## Automation Cadence

- Routine novel automation cadence is every 6 hours in Asia/Taipei: 00:00, 06:00, 12:00, and 18:00.
- Do not run routine novel updates every hour unless the user explicitly changes the cadence again.
- Each scheduled run should continue only the 5 active category leaders and produce at most one new chapter per active title where feasible.
- Public copy should describe the cadence as `每日 00/06/12/18 更新` or equivalent, not as `每日 09:00 更新` or hourly updates.
- If a prior run ended local-only because GitHub was unreachable, the next reachable run should clear that publish debt before adding another batch. Do not normalize an `ahead > 0` branch as ordinary background state.

## Plot And Tension

- Build around one clear event or problem per chapter. Let it breathe before adding another major turn.
- Default to one primary viewpoint center at the start of the chapter. Let the reader settle into one person, one pressure, and one immediate situation before expanding the scope.
- Use the long-serial rhythm of "small event fast, major truth slow": the day's concrete incident should move, hurt, and resolve partially; the central mystery should advance only by one controlled layer.
- Each chapter must move from A to B. A is the reader/character's current misunderstanding, helplessness, isolation, or missing proof; B is one concrete improvement, one sharper danger, and one deeper unanswered question.
- The 6,000-6,500 character format should support stronger audiobook retention: deepen scene continuity, let danger breathe, add concrete minor-character pressure, and include one or two staged reversals. Do not use the added length for repeated inspection beats, repeated silence, or abstract explanation.
- Depth must not come from archaic diction, harder-to-read phrasing, or lore dumps. Add layers through competing motives, ordinary costs, small betrayals, emotional restraint, institutional pressure, and clues that mean one thing now but can mean something sharper later.
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
- Romance elements are allowed and useful, especially in long-form audiobook chapters, but they should grow from trust, disagreement, care under pressure, shared secrets, bodily risk, and moments of choosing each other. Do not let romance hijack the genre engine or become decorative flirting pasted onto danger.
- Small roles are encouraged when useful, but they must have a function: witness pressure, add humor or life texture, expose class/workplace/institutional stakes, carry a clue, or make the protagonist's choice matter to someone concrete.
- Do not turn minor characters into exposition devices. Give them one human detail, one pressure, or one recognizable desire, then let the scene move.

## Style

- Vary tone by book and genre. Some serials can be deep, restrained, and oppressive; others can be爽文, direct, clever, and momentum-driven.
- Prose should feel human: less template rhythm, fewer repeated sentence structures, clearer cause and effect, more intuitive transitions.
- AI assistance may provide speed, alternate plot routes, names, and research scaffolding, but final prose must be governed by author persona and human emotional judgment. Never let production speed flatten voice, character contradiction, or scene texture.
- Use AI internally for productivity, brainstorming branches, naming, and fact scaffolding only. Public-facing site, chapter, and promotion surfaces should foreground `天書原創` and author persona rather than the AI workflow itself.
- If stuck, generate alternatives only as private scaffolding. Choose the route that best preserves continuity, forces a character cost, touches ordinary life, and protects long-arc mystery; do not choose the route merely because it is the newest or loudest.
- Brainstorming is not plot. A premise becomes plot only after its extreme rule change creates lived consequences for ordinary people, institutions, status, money, food, work, family, language, or public behavior.
- Before adding a new rule, ask: what is its limit, who profits from it, who is quietly harmed by it, and what ordinary routine becomes dangerous because of it.
- Paragraphs can be longer when staying with one event, conversation, or emotional beat. Avoid jumpy short-section montage. Strong scenes are allowed to take a larger share of the chapter.
- Do not overuse micro-paragraphs and clipped one-line beats. Short sentences should puncture a scene, not become the scene's default breathing pattern. If too many consecutive paragraphs can be read as single-line slogan beats, merge them back into fuller scene paragraphs.
- For audiobook and read-aloud flow, prefer connected white-language syntax over constant stop-start emphasis. A strong chapter may contain sharp short lines, but the surrounding prose should carry people, action, and cause-and-effect in longer flowing units so the listener can sink in instead of being repeatedly jolted out.
- Do not reuse a default chapter-opening chassis across titles or across consecutive chapters. If an opening can be reduced to a fill-in-the-blank pattern such as `某地這一日最先……` or a stock pivot like `真正露手的是……`, rewrite it until the author, pressure, and object feel title-specific.
- Prefer specific physical detail over abstract labels. Use concrete rooms, weather, sounds, small habits, money, work, wounds, tools, documents, and social pressure.
- Use precision instead of adjective stacking. Replace generic statements like "he was poor", "she was afraid", or "the room was chaotic" with an object, gesture, cost, sound, stain, or interrupted routine.
- Use verbs to create image momentum. Important scenes should move through concrete actions before interpretation: push, hide, count, tear, lift, press, listen, wait, misread, correct.
- Prefer white-language clarity over literary stiffness. Depth should come from situation, choice, sensory detail, and consequence, not from archaic phrasing or abstract moralizing.
- For mobile reading, keep paragraph breathing visible. Dense exposition walls, long lists of proper nouns, and consecutive abstract explanations should be broken into scene action or cut.
- For audiobook listening, vary the emotional texture inside a chapter: pressure, watchfulness, small human noise, quiet tenderness, restrained humor, then renewed unease. A chapter that only explains a procedure or only sustains one tension note will feel flat when heard aloud.
- After a climax or heavy reveal, allow a brief emotional reset before building toward the next pressure wave. Rest is part of pacing, not a failure of pacing.
- Do not keep readers in nonstop high-arousal mode. Peak, release, and re-accumulation should form a readable curve.
- Side plots may interact with the main line across many chapters. They do not need to close in the same chapter, but they must remain intentional, trackable, and eventually convergent rather than multiplying without return.
- The reader should be able to inhabit the protagonist's body, stress, hesitation, and sensory field. Favor immersion over summary.
- Each chapter should contain at least one tiny emotional cut that cannot be replaced by plot mechanics: an unanswered greeting, a withheld apology, someone saving food, a hand avoiding another hand, a familiar object used the wrong way, or a witness realizing they were part of the harm.
- Make transitions natural. A new clue should arise from the prior action, not appear just because the chapter needs another twist.
- Do not batch-write books by reusing the same paragraph skeleton and only replacing names, objects, factions, or settings. Each novel needs its own scene logic, clue sequence, emotional pressure, and rhythm.
- Long serials need renewable pressure. Build recurring institutions, obligations, resentments, professions, geography, and power costs that can keep producing conflict without repeating the same scene skeleton.
- Respect the writer/reader yin-yang. The writer pushes instinct and scene life forward; the paired reader in `反思.md` pushes back on weak tension, lazy explanation, false高潮, overexposure, and emotional blur.
- Preserve five-author separation. If a paragraph from one title could be pasted into another title after swapping nouns, rewrite it until the author's worldview, sentence rhythm, and type of pressure are unmistakable.
- Unpublished chapters are eligible for aggressive cleanup. If a stored draft still feels templated, over-procedural, emotionally thin, or too clipped for audiobook/listening flow, revise it before treating it as stable canon.

## Social Promotion And Cover Art

- Treat social visuals, especially Instagram images, as reader-acquisition cover art. They must sell genre, mood, conflict, and curiosity at first glance.
- Social posts should be platform-native. Instagram, Threads, Facebook, and YouTube each need independent copy, CTA shape, and verification; do not depend on cross-platform sync or paste one identical post everywhere.
- Before preparing platform posts, use `docs/roles/social-media-director/README.md` and `docs/roles/social-media-director/social-resources.md` as the operating guide.
- Upload success and publishing success are separate checks. For YouTube, verify video upload, custom thumbnail application, checks completion, public visibility, and public watch URL separately.
- Do not treat a YouTube thumbnail file picker closing as proof that the custom thumbnail was applied. Confirm the visible Studio thumbnail/preview; if it falls back to auto-generated or needs manual help, record that in the chapter production notes.
- For Instagram, Threads, and Facebook, verify each platform's own final post state after publishing. Do not assume a post appeared because another platform or share toggle reported success.
- For Instagram, do not publish until the `分享到` area has been checked and Facebook/Threads sync is off or clearly not active. If file upload automation is blocked, use the native macOS file picker with an ASCII `/tmp/tianshu-upload/` path instead of retrying the same blocked file chooser.
- For short-form vertical video, use a 1080x1920 9:16 master by default for YouTube Shorts, TikTok/Douyin-style feeds, Instagram Reels, and Facebook Reels. This is a vertical 1080p master, not horizontal 1920x1080. Platform minimums may be lower, but production assets should keep 1080x1920 unless a platform-specific test deliberately uses another ratio.
- For `星骸王座` Chapter 4 through Chapter 15 videos, production must proceed one chapter at a time. Finish one chapter's Image 2 visuals, video, audio/subtitle QA, thumbnail/IG QA, and notes before moving to the next chapter.
- Chapter 4 through Chapter 15 visuals must be high-quality Image 2 story art based on that chapter's actual events. Reject code-drawn placeholders, generic abstract backgrounds, repeated composition, or any image that feels cheap, ugly, or unrelated to the chapter.
- Use owned or generated chapter-specific story art rather than website screenshots, UI cards, generic banners, or text-heavy layouts.
- Generate base artwork with no embedded text or logos, then add accurate Traditional Chinese typography locally.
- Each chapter's visual assets must be visually unique. Inner content images, video slides, Instagram Promote images, and thumbnails may share a consistent series style, but must not reuse the same base image, crop, character pose, or background composition with only the text changed.
- Before publishing a social image or thumbnail, compare it against prior images from the same novel. If two chapters read as the same image at phone size, replace the newer one with a chapter-specific scene.
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
  - Chapter title length is production-friendly: prefer clear 4-7 Traditional Chinese characters and do not exceed 7 for unpublished/new chapters.
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
  - The chapter passes the rule-change test: the new idea changes a routine, a class relation, a work process, or a value judgment beyond the protagonist alone.
  - The chapter passes the precision test: important emotion is carried by concrete detail and action, not adjective stacking.
  - The chapter passes the five-author test: its rhythm and pressure cannot be mistaken for another active title.
  - The chapter does not exhaust the novel's long-term runway and leaves future arc space consistent with a 1,500+ chapter serial.
  - `每日寫作狀態.md` and `伏筆事件台帳.md` are updated when the chapter changes continuity, clues, relationships, debts, injuries, secrets, or next-event direction.
  - `反思.md` has been consulted before writing and updated after every successful new chapter with the paired reader's latest durable criticism, praise-with-condition, or direct corrective suggestion.
  - If the writing pass revealed a reusable lesson, it has been recorded in the right durable file instead of being left implicit.
  - For automation publishes, `node scripts/verify-site-publication.mjs` passes after push. If it does not pass, the run may be locally complete or pushed, but it must not be described as live on the website.
  - For automation publish reporting, include explicit evidence for `HEAD`, `origin/main`, `ahead/behind`, and whether any remaining dirty paths are unrelated to the published batch. Never compress these into a vague "有推上去/沒推上去" judgment.

## 2026-06-08 補充節奏註記

- 當敵方或制度性的黑路仰賴安靜、正常、順手來完成收尾時，反制不必先靠硬闖。優先考慮把現場叫醒、弄髒、弄亮，讓普通人的聲音、腳步、火氣與日常流程一起破壞那條路。

## 2026-06-14 Rule of Style 補充

- `src/resource/Share/Rule-of-Style.md` 是五本 active title 的共通風格規則。未發布章節改稿與新章生成都必須先過該檔的 AI 輔助邊界、腦洞三問、需求階梯與四項文筆檢查。
- AI 可以提高產能，但不能取代作者的獨特視角。每次寫作都要讓「資料與規則」服務於角色感受，而不是讓角色成為規則展示架。
- 新規則、新能力、新制度、新黑箱必須展示連帶反應：主角生活、普通人日常、階層秩序與價值觀至少要被碰到其中兩項。
- 市場與包裝建議只能用來校準讀者承諾，不可用來追逐模板或仿寫爆款。天書要賣的是五位作者的獨特情緒解方，不是可替換的 AI 產能。
- 章節改稿要過 A 到 B 檢查、情緒切口檢查與五作者反同質化檢查；若刪掉書名和人名後像另一部作品，必須重寫作者聲音。
