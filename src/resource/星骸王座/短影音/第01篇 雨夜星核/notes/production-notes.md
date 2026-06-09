# 第01篇 雨夜星核短影音製作紀錄

## 目標

- 製作一支 1080x1920、9:16、約 90 秒的直式短影音 preview。
- 每 5 秒換一張圖，總計 18 張主分鏡圖。
- 使用人聲旁白、繁中字幕、雨夜/霜河/星核/死亡預視主題。
- 所有製作檔集中在 `src/resource/星骸王座/短影音/第01篇 雨夜星核/`。

## 規格

- Resolution: 1080x1920
- Aspect ratio: 9:16
- Frame rate: 30 fps
- Target duration: about 90 seconds
- Slide duration: 5 seconds each
- Image count: 18
- Voice: macOS `say` preview voice if Edge/OpenAI TTS is unavailable
- Output: `output/星骸王座-短影音-第01篇-雨夜星核-1080x1920.mp4`

## Source Policy

- No copyrighted footage or copied novel text.
- Base images should be generated or owned project assets.
- Image prompts must request no embedded text, no watermark, no logos.
- Large audio/video outputs remain local and are not intended for Git tracking.

## 2026-06-09 Preview Output

- Output video: `output/星骸王座-短影音-第01篇-雨夜星核-1080x1920.mp4`
- Resolution: 1080x1920
- Aspect ratio: 9:16
- Frame rate: 30 fps
- Duration: 93.000 seconds
- File size: about 20.8 MB
- Image sources: `source/images/frame-01.png` through `source/images/frame-18.png`
- Normalized frames: `source/normalized/frame-01.png` through `source/normalized/frame-18.png`
- Narration text: `voice/narration.txt`
- Preview narration audio: `voice/narration-preview.m4a`
- Subtitle sidecars: `subtitles/subtitles.srt`, `subtitles/subtitles.ass`
- QA contact sheet: `qa/contact-sheet.png`
- Rebuild script: `build-preview.sh`

## QA Notes

- FFprobe confirmed 1080x1920, 30 fps, 93.000 seconds.
- 18 generated still images were normalized to 1080x1920 before assembly.
- Visual QA sampled frames at 00:00:03, 00:00:32, and 00:01:20. The final ASS subtitle burn-in is readable and stays within vertical safe area.
- Audio uses macOS `say` voice `Eddy (Chinese (Taiwan))` as preview narration because `edge-tts` was unavailable in the current environment. Treat this as a preview voice, not the final premium voice.
- Final mix uses preview narration plus very low pink-noise rain texture. Last measured output after the safer mix was around mean `-21.3 dB`, max `-1.3 dB`.

## OpenAI Audio Upgrade Plan

- User rejected the macOS `say` voice quality and requested OpenAI quality for the material/video pipeline.
- Existing visuals were produced with OpenAI image generation and are acceptable as the visual base for this preview.
- Added `voice/openai-tts.mjs` to generate `voice/openai-narration.m4a` using OpenAI Speech API (`gpt-4o-mini-tts`, default voice `cedar`) from `voice/narration.txt`.
- Added `build-openai-audio.sh` to replace the current MP4 audio track with OpenAI narration plus a low, locally synthesized epic bed. The music bed is intentionally under the narration and generated locally to avoid copyrighted music.
- 2026-06-09 retry: user supplied an OpenAI API key through the local clipboard and the script reached the OpenAI Speech API, but the API returned `429 insufficient_quota`. This means the current API project/account has no usable quota or billing has not taken effect. The OpenAI narration was not generated and the MP4 audio track was not replaced.
- Current blocker: OpenAI API quota/billing is unavailable for the supplied key, so OpenAI narration cannot be generated yet.
- Once a key is available, run:

```bash
cd 'src/resource/星骸王座/短影音/第01篇 雨夜星核'
OPENAI_API_KEY='...' node voice/openai-tts.mjs
./build-openai-audio.sh
```

- `build-openai-audio.sh` overwrites `output/星骸王座-短影音-第01篇-雨夜星核-1080x1920.mp4` audio in place while copying the existing video stream.

## 2026-06-09 Edge Female Voice Output

- OpenAI Speech API remained blocked by `insufficient_quota`, so the short-video audio was rebuilt with Edge TTS to guarantee usable narration.
- Voice: `zh-TW-HsiaoYuNeural`, female Taiwan Mandarin, `rate=-4%`, `pitch=-2Hz`.
- Generated files: `voice/edge-HsiaoYu-narration.mp3` and `voice/edge-HsiaoYu-word-boundary.vtt`.
- Added rebuild script: `build-edge-audio.sh`.
- The script replaces the existing MP4 audio track in place and mixes the female narration with a restrained, locally synthesized epic bed.
- Verified output: 1080x1920, 30 fps, 93.000 seconds, AAC audio around 92.971 seconds.
- Measured volume after mix: mean `-23.3 dB`, max `-5.3 dB`; narration remains foreground and no clipping was detected.

## 2026-06-09 POV Rhythm Revision

- Revised the first video away from a generic book-trailer explanation and into a Shen Yao first-person POV hook.
- Updated narration, ASS subtitles, SRT sidecar, and planning notes to focus on: `它救了我一次，也騙了我一次`.
- Added `build-pov-video.sh` for the revised rhythm version. It rebuilds the MP4 from the existing OpenAI-generated frames, Edge TTS female narration, burned-in POV subtitles, and a restrained synthesized epic bed.
- Timing change: front-loaded faster cuts in the first 15 seconds, then slower suspicion/reversal beats through the ending choice.
- Verified revised output: container duration `79.018` seconds, video stream 1080x1920 at 30 fps, AAC audio, file size about 14 MB.
- Measured volume after POV mix: mean `-23.7 dB`, max `-5.4 dB`; no clipping was detected.
- QA frames: `qa/pov-frame-0003.png`, `qa/pov-frame-0024.png`, `qa/pov-frame-0073.png`, and `qa/pov-contact-sheet.png`.

## 2026-06-09 Tighter Short-Video Revision

- Revised again after user feedback that the 79-second POV cut still felt loose and the voice felt stiff.
- Market-practice takeaway recorded for this cut: use an immediate 1-second hook, faster visual changes, shorter spoken clauses, a mid-video re-hook, and large on-screen text that reinforces only the strongest phrases.
- Tightened narration from explanatory POV into short, spoken beats: `它救了我 / 也騙了我`, `我差點自己走進棺材`, `這是一個會少說半句的怪物`.
- Switched Edge voice from `zh-TW-HsiaoYuNeural` to `zh-TW-HsiaoChenNeural`, with `rate=+7%` and `pitch=-1Hz`. This keeps the Taiwan Mandarin female voice but makes the delivery less slow and less audiobook-like.
- Adjusted audio mix: narration gain increased, bed volume reduced, compressor tightened to keep the voice forward.
- Revised output verified: container duration `62.066` seconds, audio duration `62.021` seconds, 1080x1920 at 30 fps, file size about 13 MB.
- Measured volume after tighter mix: mean `-23.5 dB`, max `-7.7 dB`; no clipping was detected.
- QA frames: `qa/tight-frame-0003.png`, `qa/tight-frame-0020.png`, `qa/tight-frame-0057.png`, and `qa/tight-contact-sheet.png`.

## 2026-06-09 Stronger Background Music Pass

- User feedback: the cut still felt like it had little or no background music.
- Kept the music copyright-clean by synthesizing the bed locally in FFmpeg instead of importing unknown copyrighted music.
- Rebuilt `music/edge-epic-bed.m4a` with stronger audible elements: dark wind, low drone, heartbeat-like pulse, mid-frequency lift, and a brighter tail layer near the final CTA.
- Raised bed mix from `0.12` to `0.24`, then kept narration forward with higher narration gain, compression, and limiter protection.
- Verified output remained 1080x1920 at 30 fps, duration `62.066` seconds, AAC audio `62.021` seconds.
- Measured volume after music pass: mean `-23.5 dB`, max `-7.8 dB`; no clipping was detected.
- QA frames: `qa/music-frame-0003.png`, `qa/music-frame-0031.png`, `qa/music-frame-0058.png`, and `qa/music-contact-sheet.png`.

## 2026-06-09 Licensed Background Music Pass

- User feedback: the first few slides changed too quickly, and the background should use an actual no-copyright/royalty-free music track without covering narration.
- Added licensed music file: `music/Darkling-Kevin-MacLeod.mp3`.
- License record: `music/licenses/Darkling-Kevin-MacLeod.txt`.
- Attribution required if published: `Darkling Kevin MacLeod (incompetech.com), Licensed under Creative Commons: By Attribution 3.0 License`.
- Adjusted the first three frame durations from fast 1.5-1.7 second beats to slower 2.1-2.4 second beats, then shortened the final hold so total runtime stays around 62 seconds.
- Rebuilt `music/edge-epic-bed.m4a` from the licensed track with trimming, fade-in/fade-out, filtering, and low-volume mix under narration.
- Verified output: 1080x1920, 30 fps, video duration `62.000` seconds, AAC audio duration `62.021` seconds.
- Measured mix after licensed music: mean `-21.8 dB`, max `-6.8 dB`; no clipping was detected. If narration is still not forward enough on phone speakers, lower the bed mix from `0.42` to `0.32`.
- QA frames: `qa/licensed-music-frame-0003.png`, `qa/licensed-music-frame-0031.png`, `qa/licensed-music-frame-0058.png`, and `qa/licensed-music-contact-sheet.png`.

## 2026-06-09 Acted Edge TTS Pass

- User chose not to open another TTS service account, so the voice workflow was improved within Edge TTS.
- Rewrote the narration into an actor-style script with shorter spoken clauses, emotional transitions, and more natural reveal order.
- Replaced single-pass TTS with segmented Edge TTS generation. Each emotional block is generated separately, then concatenated:
  - Hook: `zh-TW-HsiaoChenNeural`, `rate=+2%`, `pitch=-2Hz`.
  - Death vision: `zh-TW-HsiaoChenNeural`, `rate=-2%`, `pitch=-4Hz`.
  - Reversal: `zh-TW-HsiaoChenNeural`, `rate=+6%`, `pitch=-2Hz`.
  - Monster realization: `zh-TW-HsiaoYuNeural`, `rate=-4%`, `pitch=-5Hz`.
  - Cost/threat: `zh-TW-HsiaoChenNeural`, `rate=+3%`, `pitch=-2Hz`.
  - Final question: `zh-TW-HsiaoChenNeural`, `rate=-2%`, `pitch=-3Hz`.
- New generated narration file: `voice/edge-acted-narration.m4a`.
- Extended the final image hold and licensed music bed to fit the more natural pauses.
- Verified output: 1080x1920, 30 fps, video duration `66.133` seconds, AAC audio duration `66.014` seconds, file size about 15 MB.
- Measured mix after acted TTS pass: mean `-21.5 dB`, max `-5.8 dB`; no clipping was detected.
- QA frames: `qa/acted-frame-0004.png`, `qa/acted-frame-0034.png`, `qa/acted-frame-0063.png`, and `qa/acted-contact-sheet.png`.

## 2026-06-09 Black Coffin Hook Rewrite

- User feedback: the voice tone was acceptable, but the copy still felt strange and too centered on the abstract `騙不騙` idea.
- Market research takeaway: stronger short-video/book hooks use a concrete scene and curiosity gap instead of explaining lore. The new hook follows the actual first-chapter scene: three coins, one black coffin, a warning voice, and a star core inside a corpse.
- Replaced the prior concept hook with: `有人給我三枚銅錢，叫我守一口黑棺。天亮以前，不准開。`
- Reoriented the video around one event line:
  - Take three coins to guard a sealed black coffin.
  - The coffin becomes warm in freezing rain.
  - A voice warns: do not open it.
  - Shen Yao opens it anyway and finds a dead star master with a glowing star core.
  - Pursuers arrive and identify the star core.
  - Shen Yao sees his own death vision.
  - CTA: go to Tianshu Novels to read chapter 1.
- Updated `voice/narration.txt`, `subtitles/subtitles.ass`, `subtitles/subtitles.srt`, `企劃.md`, and the segmented Edge TTS blocks inside `build-pov-video.sh`.
- Verified output: 1080x1920, 30 fps, video duration `66.133` seconds, AAC audio duration `66.014` seconds, file size about 14 MB.
- Measured mix after black-coffin rewrite: mean `-21.9 dB`, max `-6.7 dB`; no clipping was detected.
- QA frames: `qa/coffin-hook-frame-0004.png`, `qa/coffin-hook-frame-0024.png`, `qa/coffin-hook-frame-0058.png`, and `qa/coffin-hook-contact-sheet.png`.

## 2026-06-09 Conversion End Card And Voice Switch Pass

- Added a reusable production rule file at `../短影音製作規則.md` to capture the full short-video process before scaling production.
- Added CTA end card asset: `source/images/frame-19.png`.
- Updated the build to use 19 frames. Frame 18 now bridges into the CTA; frame 19 holds the final conversion page.
- Final end card displays:
  - `tianshu.petrichor.tw`
  - Search keyword: `星骸王座 天書小說`
  - YouTube: `@tianshunovel`
  - IG / Threads: `@tianshu_novel`
- Kept the video around the accepted length by splitting the old final hold into frame 18 plus frame 19.
- Trimmed the final burned-in subtitle so it does not overlap the end card. The last card now remains clean and readable.
- Added voice switching for non-narrator speech:
  - Main narration remains `zh-TW-HsiaoChenNeural` / `zh-TW-HsiaoYuNeural`.
  - The coffin warning and pursuer shout use `zh-TW-YunJheNeural` with safer rate/pitch settings.
  - Very short YunJhe lines failed with `NoAudioReceived`, so those lines were expanded into complete spoken warnings/shouts before synthesis.
- Verified output after voice switch and CTA: 1080x1920, 30 fps, video duration `66.133` seconds, AAC audio duration `66.014` seconds, file size about 13 MB.
- Measured mix after voice switch and CTA: mean `-21.9 dB`, max `-5.8 dB`; no clipping was detected.
- QA frames: `qa/voice-switch-frame-0018.png`, `qa/voice-switch-frame-0036.png`, `qa/voice-switch-frame-0061.png`, and `qa/voice-switch-contact-sheet.png`.

## 2026-06-09 Voice Role And Subtitle Sync Fix

- User feedback: after male voice started, voice and subtitle timing drifted; user also preferred keeping the original female narrator instead of switching to a second female voice.
- Fixed base narration rule in this video:
  - Main narrator now stays on `zh-TW-HsiaoChenNeural`.
  - Removed `zh-TW-HsiaoYuNeural` from the narrator flow.
  - Male lines stay on `zh-TW-YunJheNeural` for the coffin warning and pursuer shout.
- Fixed subtitle drift structurally, not by hand-tweaking timestamps:
  - `build-pov-video.sh` now probes each generated TTS segment duration with `ffprobe`.
  - It regenerates `subtitles/subtitles.ass` and `subtitles/subtitles.srt` from the real segment durations on every build.
  - This prevents later subtitle drift when male/female voice durations differ.
- Very short YunJhe male lines can fail or create timing issues, so male dialogue is written as complete spoken warnings/shouts:
  - `別開。開了你會死。聽見沒有，別開。`
  - `星核在他身上。抓住他，別讓他跑。`
- Updated durable rules in `../短影音製作規則.md`:
  - base narrator must stay the same female voice;
  - character gender must match voice gender;
  - subtitles must be generated from real TTS durations;
  - QA must sample male voice, return-to-narrator, and CTA sections.
- Verified output after sync fix: 1080x1920, 30 fps, video duration `66.133` seconds, AAC audio duration `66.014` seconds, file size about 13 MB.
- Measured mix after sync fix: mean `-21.8 dB`, max `-5.8 dB`; no clipping was detected.
- QA frames: `qa/synced-voice-frame-0018.png`, `qa/synced-voice-frame-0037.png`, `qa/synced-voice-frame-0061.png`, and `qa/synced-voice-contact-sheet.png`.

## Next Improvement Notes For Impatient Viewers

- The first second must show a contradiction, not context: `它救了我，也騙了我` is stronger than any worldbuilding line.
- Every 2-3 seconds should change at least one stimulus: image, subtitle size, sound hit, camera crop, or text emphasis.
- Re-hook around 15-20 seconds with a reversal: `我避開了刀，卻差點自己走進棺材`.
- Keep subtitles to one idea per screen; avoid two-line explanatory sentences unless the second line is the twist.
- Add more concrete threat words than lore words: `刀`, `棺材`, `死局`, `誰替我死` outperform abstract terms like `命運` or `制度`.
- The final CTA should ask for a decision rather than a generic follow: `你敢相信它嗎？留言：信 / 不信`.
