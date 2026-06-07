# 《星骸王座》第01章影片製作紀錄

## Official Output

- Video: `src/resource/星骸王座/影片/第01章 星核在雨夜說謊/output/星骸王座-第01章 星核在雨夜說謊-字幕有聲書-720p.mp4`
- Subtitle sidecar: `src/resource/星骸王座/影片/第01章 星核在雨夜說謊/subtitles/星骸王座-第01章 星核在雨夜說謊.srt`
- Thumbnail: `src/resource/星骸王座/影片/第01章 星核在雨夜說謊/thumbnails/星骸王座-第01章-星核在雨夜說謊-thumbnail.png`
- Duration: 15:50.167
- Resolution: 1280x720
- Frame rate: 24 fps
- Video codec: H.264
- Audio codec: AAC mono 44.1kHz
- File size: about 25.2 MB

## Official Sources

- Chapter text: `src/resource/星骸王座/文章/第01章 星核在雨夜說謊.txt`
- Timed narration source: generated from the chapter text with Edge `zh-TW-YunJheNeural`, `--rate=+0%`, `--pitch=-2Hz`, saved locally under `source/` and ignored by Git.
- Visual source: `src/resource/星骸王座/素材/圖像/主角圖片素材/星骸王座-沈曜阿棠.png`
- Visual source: `src/resource/星骸王座/素材/圖像/首頁爆款素材/星骸王座-霜河戰鬥主視覺.png`
- Visual fallback/source: `public/assets/tianshu-banner.png`

## Official Build

- Script: `scripts/build-audiobook-chapter-video.py`
- Output folder: `src/resource/星骸王座/影片/第01章 星核在雨夜說謊/`
- TTS and subtitle rule: narration media and VTT timing come from the same Edge TTS run; SRT is grouped from VTT timing instead of average-character timing.
- Background audio: rain plus white noise only; no melodic music, no fire layer.
- Mix ratios: narration `0.92`; main rain/white-noise bed `0.20`; fine rain texture `0.020`; low rain body `0.010`; final bus `0.84`; narration limiter `0.64:level=false`; final limiter `0.62:level=false`.
- Voice chain: high-pass `80Hz`, slight warmth lift around `220Hz`, EQ cuts around `3200Hz` and `6200Hz`, low-pass `9000Hz`, conservative limiting.
- Effective post-bus ratio: narration about `0.773`, main rain bed about `0.168`; main background bed is about 21.7% of narration, fine/low texture about 2.2% and 1.1%.
- Visual direction: fixed story images with timed cuts. No pan, zoom, vertical jitter, or shaking motion.
- Slide count: 4 fixed background pages.
- Slide duration: about 237.540 seconds each, roughly 3 minutes 58 seconds.

## Official QA

- FFprobe confirmed 1280x720, 24fps, 15:50.167 duration, 22,804 frames.
- Final audio measured `mean_volume: -25.9 dB`, `max_volume: -6.5 dB`.
- Subtitle QA: 246 cues, max 19 characters per subtitle line, max 2 lines, no overlong cues, no second-line leading punctuation.
- Four frames were extracted at 00:00:08, 00:03:55, 00:07:45, and 00:11:30 to check subtitle placement and visual framing.
- Output video, generated source audio, generated stills, and temp frames are ignored by Git. Notes, subtitles, script, and thumbnail PNGs may be tracked.

## 2026-06-07 1x Soft-Voice Preview

- Status: approved by user and promoted to the official full build above.
- The 20-second preview files were removed after approval to keep the chapter folder clean.
- Approved settings: Edge `zh-TW-YunJheNeural`, `--rate=+0%`, `--pitch=-2Hz`, narration `volume=0.92`, high-pass `80Hz`, slight warmth around `220Hz`, EQ cuts around `3200Hz` and `6200Hz`, low-pass `9000Hz`, narration limiter `0.64:level=false`.

## Prototype Lessons

- Top-level `video-resource/` was used only during exploration. It has been removed from the official workflow; future chapter assets go under `src/resource/<novel>/影片/<chapter>/`.
- The first full draft used rough average-character subtitle timing and did not stay synchronized enough. Official builds must generate subtitles from the same TTS run as the narration.
- Early motion tests used pan/zoom and vertical movement that felt distracting. Official chapter visuals use fixed images with timed cuts.
- Music-bed tests were either too quiet, too bright, or too stimulating. The official direction is rain plus white noise, no melody.
- Compression/limiter tests that raised perceived loudness were rejected. Official mixes use conservative limiters with `level=false` and verify with `volumedetect`.
- Long VTT cues can contain too much text. Official SRT grouping must split long cue text first, then verify max 2 lines and no leading punctuation on the second line.
