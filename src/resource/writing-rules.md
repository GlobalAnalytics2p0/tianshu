# 天書 Novel Writing Rules

## Core Goal

- Write original Traditional Chinese serial fiction that feels intentional, human, and worth following.
- The target reader is here for story, tension, emotion, payoff, and curiosity. Do not explain how the chapter is structured.
- Each chapter should create enough unresolved curiosity that the reader wants the next update, but it should still feel satisfying on its own.
- The core reader wants relaxed, direct, satisfying serial fiction. Make the prose easy to enter, the stakes concrete, the protagonist's pressure clear, and the chapter rewarding even while the long mystery remains unresolved.
- Aim for雅俗共賞: tension and depth should coexist with readable scenes, clear emotional pressure, lived daily details, small wins, and momentum.

## Length And Storage

- Each normal chapter must be 4,000-5,000 Traditional Chinese non-whitespace characters.
- Save every chapter as an independent `.txt` file under `src/resource/<novel title>/`.
- Update `src/resource/manifest.json` after writing or revising chapter files.
- Never store chapter bodies inline in `app.js`.

## Continuity

- Before writing a new chapter, read `src/resource/manifest.json`, this rules file, `agent.md`, `src/resource/五本長篇共通管理規範.md`, the novel's `核心靈魂檔案.md`, `作者思路.md`, `人物架構.md`, `每日寫作狀態.md`, `伏筆事件台帳.md`, and all existing `.txt` chapters for that novel.
- Preserve character state, setting rules, unresolved hooks, emotional consequences, clues, debts, injuries, secrets, and relationship changes.
- Do not contradict previous chapters. If a prior scene leaves a mystery, either deepen it or pay off only part of it.
- Refresh the correct author persona before writing. The five active books must not share the same sentence rhythm, emotional temperature, clue style, or chapter engine.
- Every title must retain enough structural runway to serialize beyond 1,500 chapters. Do not spend the premise, final villain tier, ultimate setting answer, or irreversible relationship endgame too early.
- The full library can stay online, but routine maintenance is currently limited to 5 category leaders only: `星骸王座`, `灰塔觀測者`, `雪刃照孤城`, `凌晨三點的演算法`, and `大明墨工`.
- Unless the user explicitly changes scope, daily work should update only the novel text and manifest metadata for those 5 titles. The other 35 titles remain frozen.
- Video planning, audiobook planning, and non-novel asset work are out of the default daily update path unless the user explicitly asks for them.

## Plot And Tension

- Build around one clear event or problem per chapter. Let it breathe before adding another major turn.
- Use the long-serial rhythm of "small event fast, major truth slow": the day's concrete incident should move, hurt, and resolve partially; the central mystery should advance only by one controlled layer.
- Give the reader a local reward whenever possible: a clever escape, a recovered clue, a face-saving reversal, an enemy misread, a saved minor character, a practical gain, or a sharper emotional commitment.
- Keep important foreshadowing alive for longer. Do not reveal every hook immediately after it appears.
- Use slow-burn escalation: ordinary pressure, wrong detail, personal stake, risky choice, partial reversal, stronger unanswered question.
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
- Paragraphs can be longer when staying with one event, conversation, or emotional beat. Avoid jumpy short-section montage.
- Prefer specific physical detail over abstract labels. Use concrete rooms, weather, sounds, small habits, money, work, wounds, tools, documents, and social pressure.
- Prefer white-language clarity over literary stiffness. Depth should come from situation, choice, sensory detail, and consequence, not from archaic phrasing or abstract moralizing.
- Make transitions natural. A new clue should arise from the prior action, not appear just because the chapter needs another twist.
- Do not batch-write books by reusing the same paragraph skeleton and only replacing names, objects, factions, or settings. Each novel needs its own scene logic, clue sequence, emotional pressure, and rhythm.
- Long serials need renewable pressure. Build recurring institutions, obligations, resentments, professions, geography, and power costs that can keep producing conflict without repeating the same scene skeleton.

## Forbidden Prose Patterns

- Do not write meta or scaffolding phrases in novel bodies, including: `這一章`, `讀者會`, `主角`, `章末`, `第一章的安排`, `第二章會`, `後續自動化`, `故事不再`, `鉤子啟動`, `第一次反咬`.
- Do not explain the chapter's writing intent, structure, hook strategy, or future automation.
- Do not paste the premise as a summary paragraph. Convert the premise into lived scenes.
- Do not repeat filler paragraphs to reach length.
- Do not use obvious padding phrases such as numbered repetitions, repeated silence beats, repeated clue-inspection beats, or near-identical paragraph openings to reach length.
- Do not overpack names or lore terms. Too many proper nouns in early chapters lowers clarity.

## Review Gate

- After generation or revision, check:
  - 4,000-5,000 non-whitespace Traditional Chinese characters.
  - No forbidden meta/scaffolding phrases.
  - The body does not contain the manifest `premise` sentence verbatim.
  - No repeated filler paragraphs.
  - No repeated or near-repeated paragraph prefixes inside the same chapter.
  - The protagonist is clear.
  - The author persona for that title is visibly distinct.
  - The chapter gives at least one local reader reward without exhausting the long arc.
  - The chapter follows one main event with natural transitions.
  - The final hook is intriguing but not over-explained.
  - The chapter does not exhaust the novel's long-term runway and leaves future arc space consistent with a 1,500+ chapter serial.
  - `每日寫作狀態.md` and `伏筆事件台帳.md` are updated when the chapter changes continuity, clues, relationships, debts, injuries, secrets, or next-event direction.
