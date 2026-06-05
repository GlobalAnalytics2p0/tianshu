# Agent Notes

## Persistent Project Requirements

- Build this as a pure static website for GitHub Pages by default. Keep the root `index.html`, `styles.css`, and `app.js` deployable without a backend or build step unless the user explicitly changes direction.
- The homepage must render full-width across the available viewport. Do not cap the desktop main content to a narrow fixed width that leaves the right side blank.
- Keep the supplied design as the visual source of truth: dark novel app UI, desktop sidebar, mobile top tabs, mobile bottom nav, hero, ranking, categories, and AI novel section.
- VIP membership and daily check-in must stay removed unless the user explicitly asks to restore them.
- Login stays as a placeholder interface for now.
- RWD quality is mandatory: no overlapping text, no clipped labels, no empty right-side layout, and mobile cards must remain readable at 390px width.
- This project should keep using code-native UI text and controls rather than baking interface text into screenshots.
- Long book titles should use a shortened decorative label on generated cover art. Full titles must remain in card body text, Modal headings, and downloadable metadata.
- Current product direction is AI-only. Do not reintroduce existing commercial novel titles such as prior ranking examples unless the user explicitly reverses this decision.
- Brand icon direction: use `public/assets/tianshu-mark.svg` as the canonical site/favicon/channel-avatar mark. It combines dark novel-app styling, gold "天書" book symbolism, AI node accents, and a YouTube-friendly play cue.
- YouTube channel direction: recommended channel name is `天書小說 AI 劇場`, recommended handle is `@TianshuNovel`, and `public/assets/youtube-channel-banner.svg` is the current banner direction. Actual account creation and final URL require the user to log into Google/YouTube.
- The AI library must maintain 5 categories with 8 original AI novels per category, for 40 total AI titles.
- Ranking, hero, category, Modal, and download surfaces should all refer to AI original serials rather than existing novels.
- Canonical AI novel text lives under `src/resource/`. Each novel must have its own subfolder, and each chapter must be saved as a separate `.txt` file named like `第01章 章節題目.txt`.
- Before generating any new chapter, read that novel's existing `.txt` chapters and `src/resource/manifest.json` so continuity, character state, clues, and unresolved hooks are preserved.
- Each normal generated chapter must be 4,000-5,000 Traditional Chinese characters. Do not silently shorten chapters unless the user explicitly accepts a smaller batch.
- Novel prose must be immersive creator-facing fiction for readers. Do not write scaffolding or explainer/meta language such as "這一章", "讀者會", "主角", "章末", "第一章的安排", "第二章會", outline notes, automation notes, or commentary about how the text is structured.
- The interface can show chapter labels for navigation, but the `.txt` novel body should not describe chapter planning or future automation behavior.

## Content And Download Rules

- Do not scrape, download, bundle, or link to unlicensed copyrighted commercial novel TXT files.
- The download flow should support original AI text, public-domain text, licensed text, or user-provided TXT files.
- Commercial novel entries may keep metadata, summaries, chapter placeholders, and an import-ready `chapters` structure until lawful content is available.

## Maintenance Rule

- When future requests add requirements, constraints, known bugs, or design decisions, update this `agent.md` in the same change so the next pass does not repeat resolved mistakes.

## Current Known Decisions

- Static hosting target: GitHub Pages.
- Primary surface: homepage only.
- AI novel automation exists in Codex with id `ai` and should generate original Traditional Chinese content only.
- Automation cadence target: every day at 09:00 Asia/Taipei, update every AI title with one new 4,000-5,000 Traditional Chinese character chapter where feasible.
- 2026-06-06 reset: prior inline/generated chapter bodies were cleared from the app. The canonical content was regenerated as 40 standalone opening `.txt` files under `src/resource/<novel>/`, with one chapter per novel and no second chapters retained.
- The homepage must load AI book/chapter content from `src/resource/manifest.json` and the `.txt` chapter files, not from inline chapter strings in `app.js`.
- Full commercial texts are intentionally not present in the repository.
