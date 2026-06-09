# 《星骸王座》第03章影片製作紀錄

## Official Output

- Video: `src/resource/星骸王座/影片/第03章 墓牆舊名/output/星骸王座-第03章 墓牆舊名-字幕有聲書-720p.mp4`
- Subtitle sidecar: `src/resource/星骸王座/影片/第03章 墓牆舊名/subtitles/星骸王座-第03章 墓牆舊名.srt`
- Thumbnail: `src/resource/星骸王座/影片/第03章 墓牆舊名/thumbnails/星骸王座-第03章-墓牆舊名-thumbnail.png`
- Instagram promo image: `src/resource/星骸王座/影片/第03章 墓牆舊名/output/instagram-promo.png`
- Duration: 22:43.776
- Resolution: 1280x720
- Frame rate: 24 fps
- Video codec: H.264
- Audio codec: AAC mono 44.1kHz
- File size: about 44.0 MB

## Official Sources

- Chapter text: `src/resource/星骸王座/文章/第03章 墓牆舊名.txt`
- Timed narration source: generated from the chapter text with Edge `zh-TW-YunJheNeural`, `--rate=+0%`, `--pitch=-2Hz`, saved locally under `source/` and ignored by Git.
- Visual source: `src/resource/星骸王座/素材/圖像/首頁爆款素材/星骸王座-霜河戰鬥主視覺.png`
- Visual source: `src/resource/星骸王座/素材/圖像/主角圖片素材/星骸王座-沈曜阿棠.png`
- Visual fallback/source: `public/assets/tianshu-banner.png`
- Chapter-specific regenerated visuals: `source/slide-01.png` through `source/slide-05.png` now use 第03章-only old station / grave wall / star-poison needle / bronze nameplate scenes.
- Chapter-specific Instagram base: `source/social-cover-base.png` now uses the underground old station and scratched grave-wall scene.

## Official Build

- Script: `scripts/build-audiobook-chapter-video.py`
- Output folder: `src/resource/星骸王座/影片/第03章 墓牆舊名/`
- TTS and subtitle rule: narration media and VTT timing come from the same Edge TTS run; SRT is grouped from VTT timing instead of average-character timing.
- Background audio: rain plus white noise only; no melodic music, no fire layer.
- Mix ratios: narration `0.92`; main rain/white-noise bed `0.20`; fine rain texture `0.020`; low rain body `0.010`; final bus `0.84`; narration limiter `0.64:level=false`; final limiter `0.62:level=false`.
- Voice chain: high-pass `80Hz`, slight warmth lift around `220Hz`, EQ cuts around `3200Hz` and `6200Hz`, low-pass `9000Hz`, conservative limiting.
- Visual direction: fixed story images with timed cuts. No pan, zoom, vertical jitter, or shaking motion.
- Slide count: 5 fixed background pages.
- Slide duration: about 272.755 seconds each, roughly 4 minutes 33 seconds.
- Title label strategy: show the chapter label only on the first slide, so later slide artwork does not cover character faces.

## Official QA

- FFprobe confirmed 1280x720, 24fps, 22:43.776 duration.
- Final audio measured `mean_volume: -26.0 dB`, `max_volume: -5.7 dB`.
- Subtitle QA: 369 cues, max 19 characters per subtitle line, no overlong cues, no leading closing punctuation on subtitle lines.
- Representative frames at 00:01:00 and 00:12:00 were extracted to confirm subtitle readability and that text overlays do not cover important visual elements.
- YouTube thumbnail and Instagram promo image were visually inspected after regeneration. Chapter title now renders fully as `第03章 墓牆舊名`; no extra watermark, no yellow line crossing title text, and no text overflow.
- 2026-06-09 uniqueness QA: 第03章 Instagram promo image was replaced after the published version reused the 第02章 snowy two-character base composition too closely. New promo art uses the chapter-specific underground old station, scratched grave wall names, lantern, bronze nameplate, and star-poison needle scene.
- 2026-06-09 duplicate asset QA: checked current `output/instagram-promo.png`, `thumbnails/*.png`, and `source/slide-*.png` across current 星骸王座 chapter video folders; exact duplicate groups = 0.
- Output video, generated source audio, generated stills, and temporary QA frames are ignored by Git. Notes, subtitles, script, and thumbnail PNG may be tracked.

## Publishing Log

- YouTube published on 2026-06-09: https://youtu.be/Qq8QxxLNKW8
- YouTube upload required user/manual file-selection assistance after Chrome `fileChooser.setFiles` returned `Not allowed`. Metadata was then filled in Studio; the custom thumbnail was visibly applied as an uploaded thumbnail; copyright/community checks completed with no issues; the public watch page loaded without a Private/unavailable marker.
- Threads published independently on 2026-06-09: https://www.threads.com/@tianshu_novel/post/DZWQsd3E6Dt
- Facebook Page published independently on 2026-06-09: https://www.facebook.com/profile.php?id=61590406722346
  - Facebook permalink was not captured from the generated page links, but the page was verified to show the 第03章 YouTube preview after posting.
  - Publish settings before posting: Public, Publish now, Share to story Off. Boost was not activated.
- Instagram published independently on 2026-06-09: https://www.instagram.com/tianshu_novel/p/DZWR27Xmcjs/
  - Image upload first failed through Chrome `fileChooser.setFiles` with `Not allowed`.
  - Successful fallback: click IG `從電腦選擇`, use the native macOS file picker, `Cmd+Shift+G`, and open `/tmp/tianshu-upload/xinghai-wangzuo-ch03-instagram.png`.
  - Caption and hashtags were verified on the final IG post. Facebook was checked afterward and no IG-caption duplicate or IG permalink sync post was found.
  - 2026-06-09 correction: the local IG upload image has been replaced with a new unique Chapter 3 scene. Instagram feed media cannot be replaced in-place after publishing; updating the live feed requires deleting/archiving and reposting, or publishing a separate corrected post.
- Platform sync status: no intentional sync/cross-post was used. Threads, Facebook, and Instagram were posted as independent platform-native posts.

## Fixes Applied During Production

- Regenerated the YouTube thumbnail and Instagram promo image after the first draft rendered the chapter title incorrectly as `第03章 墓 名`.
- Chapter title text is now drawn as a single line using a Chinese-capable system font, with no manual per-character spacing.
- Replaced `source/social-cover-base.png`, `output/instagram-promo.png`, and `/tmp/tianshu-upload/xinghai-wangzuo-ch03-instagram.png` with a new chapter-specific IG image because Chapter 2 and Chapter 3 must not share the same Promote base image or visual composition.
- Replaced 第03章 `source/slide-01.png` through `source/slide-05.png` with chapter-specific images and re-rendered the local 720p MP4 so the local video file no longer reuses 第02章 slide images.
- Created ASCII real-copy upload assets under `/tmp/tianshu-upload/` to avoid macOS file picker issues with Traditional Chinese paths:
  - `/tmp/tianshu-upload/xinghai-wangzuo-ch03-video.mp4`
  - `/tmp/tianshu-upload/xinghai-wangzuo-ch03-thumbnail.png`
  - `/tmp/tianshu-upload/xinghai-wangzuo-ch03-instagram.png`
