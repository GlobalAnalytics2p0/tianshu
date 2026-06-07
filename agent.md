# Agent Notes

## Persistent Project Requirements

- Core narrative doctrine is long-term-first. Every active serial should be planned, paced, and protected as a long-running work rather than a short-term hook machine.
- Audience response matters. Future content direction, pacing, focus, and local reader reward should be adjusted when credible user/reader feedback reveals confusion, impatience, boredom, attachment, or stronger interest in a particular thread.
- Continuity is default law. Unless the user explicitly requests a reset or revision, all new writing must build on existing canon instead of rewriting prior chapters.
- When continuity understanding is incomplete, the correct action is to reread prior material and continuity files, not to guess loosely or silently retcon.
- Daily chapter output remains fixed at 4,000-5,000 Traditional Chinese non-whitespace characters.
- Reader experience should favor immersion, continuity, and slow-burn attachment over premature payoff. Do not reveal too many major protagonists, endgame truths, or top-tier conflicts too early.
- Chapter movement can stay intuitive and flexible, but it should not become急功近利. Strong scenes may take more space, and post-climax decompression is part of the intended pacing rather than wasted space.

- Build this as a pure static website for GitHub Pages by default. Keep the root `index.html`, `styles.css`, and `app.js` deployable without a backend or build step unless the user explicitly changes direction.
- The homepage must render full-width across the available viewport. Do not cap the desktop main content to a narrow fixed width that leaves the right side blank.
- Keep the supplied design as the visual source of truth: dark novel app UI, desktop sidebar, mobile top tabs, mobile bottom nav, hero, ranking, categories, and AI novel section.
- VIP membership and daily check-in must stay removed unless the user explicitly asks to restore them.
- Login stays as a placeholder interface for now.
- RWD quality is mandatory: no overlapping text, no clipped labels, no empty right-side layout, and mobile cards must remain readable at 390px width.
- This project should keep using code-native UI text and controls rather than baking interface text into screenshots.
- Long book titles should use a shortened decorative label on generated cover art. Full titles must remain in card body text, Modal headings, and downloadable metadata.
- Current product direction is AI-only. Do not reintroduce existing commercial novel titles such as prior ranking examples unless the user explicitly reverses this decision.
- Brand icon direction: use `public/assets/tianshu-icon.png` as the canonical site/favicon/channel-avatar mark and direct YouTube upload asset. The current visual direction is matte, tactile, literary, and bookplate-like, not shiny or AI-glossy.
- YouTube channel direction: channel name is `天書小說`, handle is `@tianshunovel`, and `public/assets/tianshu-banner.png` is the current banner upload asset. Actual account creation and final URL require the user to log into Google/YouTube.
- YouTube icon/banner assets should be PNG-only and should not keep SVG direction files or split background files. Banner background should feel like a quiet literary reading room/bookstore with paper texture, no glitter, no neon, no glossy fantasy-AI shine, and no individual novel names. Banner tagline should use `爆款小說`.
- The AI library must maintain 5 categories with 8 original AI novels per category, for 40 total AI titles.
- The full library can remain visible on the static site, but active maintenance is currently narrowed to 5 category leaders only unless the user explicitly changes scope again: `星骸王座` (玄幻), `灰塔觀測者` (奇幻), `雪刃照孤城` (武俠), `凌晨三點的演算法` (都市), and `大明墨工` (歷史).
- Public-facing website copy should use the `天書` brand vocabulary instead of `AI`, for example `天書小說榜`, `天書原創連載`, and `天書熱門分類`.
- The homepage `天書小說榜` should rank only those 5 active category leaders, one per category, instead of mixing all 40 titles into the top five.
- Ranking, hero, category, Modal, and download surfaces should all refer to 天書 original serials rather than existing novels.
- Canonical AI novel text lives under `src/resource/`. Each novel must have its own subfolder, and each chapter must be saved as a separate `.txt` file named like `第01章 章節題目.txt`.
- Before generating any new chapter, read that novel's existing `.txt` chapters and `src/resource/manifest.json` so continuity, character state, clues, and unresolved hooks are preserved.
- Before generating or revising any of the five active titles, also read `src/resource/五本長篇共通管理規範.md` plus that title's `核心靈魂檔案.md`, `作者思路.md`, `人物架構.md`, `每日寫作狀態.md`, and `伏筆事件台帳.md`. These files are mandatory author/persona and continuity refresh files, not optional notes.
- Every AI novel must be planned as a long-running serial that can credibly sustain at least 1,500 chapters without collapsing its core premise, power ceiling, relationship engine, or central mystery too early.
- Each normal generated chapter must be 4,000-5,000 Traditional Chinese characters. Do not silently shorten chapters unless the user explicitly accepts a smaller batch.
- Daily automation must save generated chapters into the matching `src/resource/<novel title>/` folder and update `src/resource/manifest.json` so the static GitHub Pages site can load the newest content.
- Future routine updates and daily chapter generation should target only the novel text for the 5 active category leaders above unless the user explicitly broadens scope. The other 35 titles stay frozen in place for now.
- The five active titles should be treated as five independent authors with separate personality, emotional temperature, prose rhythm, clue style, and chapter engine. Do not use one generic voice across all five.
- Daily chapters should satisfy a relaxed serial-fiction reader: direct white-language prose, concrete stakes, one local reward or reversal, readable momentum, and long-term foreshadowing that is not immediately explained.
- Video planning, audiobook planning, and related asset work should stay out of the default daily automation path unless the user explicitly asks for them.
- After daily automation generation and validation pass, commit the AI content update and push it to GitHub using the configured upstream. Stage only the intended AI content/rule changes for that run, typically `src/resource/manifest.json`, new/changed `src/resource/<novel title>/*.txt`, and `src/resource/writing-rules.md` only when rules actually change. Do not stage unrelated UI/assets/docs changes.
- Novel prose must be immersive creator-facing fiction for readers. Do not write scaffolding or explainer/meta language such as "這一章", "讀者會", "主角", "章末", "第一章的安排", "第二章會", outline notes, automation notes, or commentary about how the text is structured.
- The interface can show chapter labels for navigation, but the `.txt` novel body should not describe chapter planning or future automation behavior.
- Before any AI novel generation or revision, read and follow `src/resource/writing-rules.md`. Treat it as the durable writing-quality rulebook for plot tension, slower foreshadowing, character focus, style variation, human-like prose, and review gates.
- First chapters should introduce the protagonist's pressure, desire, fear, and ordinary context before the supernatural/business/political hook escalates. Early chapters should usually keep the active cast to the protagonist plus one or two key supporting characters.
- Do not rush every clue into an immediate reveal. Foreshadowing can stay unresolved across chapters when it improves tension and retention.
- Long-arc foreshadowing is mandatory: plant clues, debts, rivalries, institutions, and personal wounds early, then pay them off gradually across many chapters instead of burning major reveals within the first few updates.
- New chapters should usually anchor through one clear viewpoint character first, then widen only when the scene has earned it. Start from one person, one pressure, and one lived situation before broadening the cast or conspiracy surface.
- After a high-intensity beat, allow emotional reset and re-accumulation instead of forcing nonstop escalation. Readers should not be held in permanent overdrive.
- Minor characters are allowed and encouraged when they add life, humor, class/work pressure, witness stakes, or a concrete reason the protagonist's choice matters. Keep them functional and avoid crowding the active cast.
- Avoid templated montage rhythm. Prefer fewer events with deeper scene work, longer paragraphs where appropriate, clearer cause-and-effect transitions, and no filler repetition to hit word count.
- Do not generate the 40 AI novels by reusing one shared paragraph template with swapped names/settings. Batch work still needs per-title scene logic, clue order, character pressure, and prose rhythm.

## Content And Download Rules

- Do not scrape, download, bundle, or link to unlicensed copyrighted commercial novel TXT files.
- The download flow should support original AI text, public-domain text, licensed text, or user-provided TXT files.
- Commercial novel entries may keep metadata, summaries, chapter placeholders, and an import-ready `chapters` structure until lawful content is available.

## Video Production Rules

- Build YouTube audiobook-style videos with local scripted tooling such as FFmpeg rather than expensive generative-video services by default.
- Keep video production assets organized per novel and chapter, for example `video-resource/<novel title>/<chapter title>/`.
- Final video output must be at least 720p, meaning minimum 1280x720 resolution. Prefer 1080p when the background source and processing time allow it.
- Audio and video artifacts must stay local and must not be committed to GitHub. `.gitignore` should exclude generated audio folders, rendered video/output folders, cache/temp folders, and common audio/video file extensions.
- Lightweight metadata, production notes, subtitle files, and automation scripts may be committed when useful, as long as they do not embed large binary media.
- For standalone audiobook exports, keep generated audio files local and ignored by Git. Store reusable voice direction, pacing, and production notes as small Markdown files under each novel's `有聲書/` folder.
- If no cloud TTS API key is available, macOS `say` with a Traditional Chinese voice is an acceptable first-pass local pipeline, but note the limitation and be prepared to replace it with a higher-quality Taiwan Mandarin TTS later.

## Maintenance Rule

- When future requests add requirements, constraints, known bugs, or design decisions, update this `agent.md` in the same change so the next pass does not repeat resolved mistakes.

## Current Known Decisions

- Static hosting target: GitHub Pages.
- Primary surface: homepage only.
- AI novel automation exists in Codex with id `ai` and should generate original Traditional Chinese content only.
- Automation cadence target: every day at 09:00 Asia/Taipei, update only the 5 active category leaders with one new 4,000-5,000 Traditional Chinese character chapter each where feasible.
- Automation publish requirement: after successful validation, create a Git commit such as `chore: daily AI novel update YYYY-MM-DD` and push to the configured GitHub upstream. If git status is dirty at start, record the baseline and avoid committing unrelated pre-existing changes. If commit or push fails because remote/auth/upstream is unavailable, report the failure clearly.
- 2026-06-06 reset: prior inline/generated chapter bodies were cleared from the app. The canonical content was regenerated as 40 standalone opening `.txt` files under `src/resource/<novel>/`, with one chapter per novel and no second chapters retained.
- 2026-06-06 writing-quality revision request: all first chapters should be reviewed and revised for deeper tension, slower foreshadowing, clearer protagonist setup, smaller active cast, varied genre tone, more human prose, natural transitions, and 4,000-5,000 character length.
- 2026-06-06 review correction: reject chapter batches that paste the manifest `premise` into prose, repeat paragraph skeletons, use numbered/obvious filler beats, or contain repeated/near-repeated paragraph prefixes inside a chapter.
- 2026-06-06 long-serial rule: every title must preserve runway for 1,500+ chapters, using layered long-term arcs and slower payoff scheduling so core mysteries, emotional debts, and setting secrets can unfold over a very long release horizon.
- 2026-06-07 scope revision: the previous "5 hottest books" note is superseded by a stricter per-category rule. Ongoing updates should only touch one leader per category: `星骸王座`, `灰塔觀測者`, `雪刃照孤城`, `凌晨三點的演算法`, and `大明墨工`, unless the user explicitly selects a different pool.
- 2026-06-07 director workflow revision: active-title folders now include `README.md`, `每日寫作狀態.md`, and `伏筆事件台帳.md`. Future generation must use these files to refresh author persona, current state, next-event focus, minor-character slots, local reader reward, and foreshadowing/payoff status before writing.
- The homepage must load AI book/chapter content from `src/resource/manifest.json` and the `.txt` chapter files, not from inline chapter strings in `app.js`.
- Full commercial texts are intentionally not present in the repository.
