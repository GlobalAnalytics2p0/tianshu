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
- Brand icon direction: use `public/assets/tianshu-mark.svg` as the canonical site/favicon/channel-avatar mark. The mark should avoid symmetric open-page shapes that read awkwardly; current direction links T and S as a "天書" monogram, with T as the book spine and S as a flowing page/fate line. Use `public/assets/youtube-channel-avatar.png` for direct YouTube upload.
- YouTube channel direction: channel name is `天書小說`, handle is `@tianshunovel`, and `public/assets/youtube-channel-banner.svg` plus `public/assets/youtube-channel-banner.png` are the current banner direction/upload asset. Actual account creation and final URL require the user to log into Google/YouTube.
- Current YouTube banner uses `public/assets/youtube-channel-background.png` as an immersive no-text novel-theatre background, with safe-area overlay and three YouTube-style CTA chips: 訂閱, 按讚, 分享. Background book/poster imagery should stay textless; do not reintroduce individual novel names in the banner. Banner tagline should use `爆款小說`, not `爆款鉤子`.
- The AI library must maintain 5 categories with 8 original AI novels per category, for 40 total AI titles.
- Ranking, hero, category, Modal, and download surfaces should all refer to AI original serials rather than existing novels.
- Canonical AI novel text lives under `src/resource/`. Each novel must have its own subfolder, and each chapter must be saved as a separate `.txt` file named like `第01章 章節題目.txt`.
- Before generating any new chapter, read that novel's existing `.txt` chapters and `src/resource/manifest.json` so continuity, character state, clues, and unresolved hooks are preserved.
- Every AI novel must be planned as a long-running serial that can credibly sustain at least 1,500 chapters without collapsing its core premise, power ceiling, relationship engine, or central mystery too early.
- Each normal generated chapter must be 4,000-5,000 Traditional Chinese characters. Do not silently shorten chapters unless the user explicitly accepts a smaller batch.
- Daily automation must save generated chapters into the matching `src/resource/<novel title>/` folder and update `src/resource/manifest.json` so the static GitHub Pages site can load the newest content.
- After daily automation generation and validation pass, commit the AI content update and push it to GitHub using the configured upstream. Stage only the intended AI content/rule changes for that run, typically `src/resource/manifest.json`, new/changed `src/resource/<novel title>/*.txt`, and `src/resource/writing-rules.md` only when rules actually change. Do not stage unrelated UI/assets/docs changes.
- Novel prose must be immersive creator-facing fiction for readers. Do not write scaffolding or explainer/meta language such as "這一章", "讀者會", "主角", "章末", "第一章的安排", "第二章會", outline notes, automation notes, or commentary about how the text is structured.
- The interface can show chapter labels for navigation, but the `.txt` novel body should not describe chapter planning or future automation behavior.
- Before any AI novel generation or revision, read and follow `src/resource/writing-rules.md`. Treat it as the durable writing-quality rulebook for plot tension, slower foreshadowing, character focus, style variation, human-like prose, and review gates.
- First chapters should introduce the protagonist's pressure, desire, fear, and ordinary context before the supernatural/business/political hook escalates. Early chapters should usually keep the active cast to the protagonist plus one or two key supporting characters.
- Do not rush every clue into an immediate reveal. Foreshadowing can stay unresolved across chapters when it improves tension and retention.
- Long-arc foreshadowing is mandatory: plant clues, debts, rivalries, institutions, and personal wounds early, then pay them off gradually across many chapters instead of burning major reveals within the first few updates.
- Avoid templated montage rhythm. Prefer fewer events with deeper scene work, longer paragraphs where appropriate, clearer cause-and-effect transitions, and no filler repetition to hit word count.
- Do not generate the 40 AI novels by reusing one shared paragraph template with swapped names/settings. Batch work still needs per-title scene logic, clue order, character pressure, and prose rhythm.

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
- Automation publish requirement: after successful validation, create a Git commit such as `chore: daily AI novel update YYYY-MM-DD` and push to the configured GitHub upstream. If git status is dirty at start, record the baseline and avoid committing unrelated pre-existing changes. If commit or push fails because remote/auth/upstream is unavailable, report the failure clearly.
- 2026-06-06 reset: prior inline/generated chapter bodies were cleared from the app. The canonical content was regenerated as 40 standalone opening `.txt` files under `src/resource/<novel>/`, with one chapter per novel and no second chapters retained.
- 2026-06-06 writing-quality revision request: all first chapters should be reviewed and revised for deeper tension, slower foreshadowing, clearer protagonist setup, smaller active cast, varied genre tone, more human prose, natural transitions, and 4,000-5,000 character length.
- 2026-06-06 review correction: reject chapter batches that paste the manifest `premise` into prose, repeat paragraph skeletons, use numbered/obvious filler beats, or contain repeated/near-repeated paragraph prefixes inside a chapter.
- 2026-06-06 long-serial rule: every title must preserve runway for 1,500+ chapters, using layered long-term arcs and slower payoff scheduling so core mysteries, emotional debts, and setting secrets can unfold over a very long release horizon.
- The homepage must load AI book/chapter content from `src/resource/manifest.json` and the `.txt` chapter files, not from inline chapter strings in `app.js`.
- Full commercial texts are intentionally not present in the repository.
