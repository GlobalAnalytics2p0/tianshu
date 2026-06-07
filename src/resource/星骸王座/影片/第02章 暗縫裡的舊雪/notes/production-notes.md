# 《星骸王座》第02章影片製作紀錄

## Official Output

- Video: `src/resource/星骸王座/影片/第02章 暗縫裡的舊雪/output/星骸王座-第02章 暗縫裡的舊雪-字幕有聲書-720p.mp4`
- Subtitle sidecar: `src/resource/星骸王座/影片/第02章 暗縫裡的舊雪/subtitles/星骸王座-第02章 暗縫裡的舊雪.srt`
- Thumbnail: `src/resource/星骸王座/影片/第02章 暗縫裡的舊雪/thumbnails/星骸王座-第02章-暗縫裡的舊雪-thumbnail.png`
- Duration: 21:32.952
- Resolution: 1280x720
- Frame rate: 24 fps
- Video codec: H.264
- Audio codec: AAC mono 44.1kHz
- File size: about 32.9 MB

## Official Sources

- Chapter text: `src/resource/星骸王座/文章/第02章 暗縫裡的舊雪.txt`
- Timed narration source: generated from the chapter text with Edge `zh-TW-YunJheNeural`, `--rate=+0%`, `--pitch=-2Hz`, saved locally under `source/` and ignored by Git.
- Visual source: `src/resource/星骸王座/素材/圖像/首頁爆款素材/星骸王座-霜河戰鬥主視覺.png`
- Visual source: `src/resource/星骸王座/素材/圖像/主角圖片素材/星骸王座-沈曜阿棠.png`
- Visual fallback/source: `public/assets/tianshu-banner.png`

## Official Build

- Script: `scripts/build-audiobook-chapter-video.py`
- Output folder: `src/resource/星骸王座/影片/第02章 暗縫裡的舊雪/`
- TTS and subtitle rule: narration media and VTT timing come from the same Edge TTS run; SRT is grouped from VTT timing instead of average-character timing.
- Background audio: rain plus white noise only; no melodic music, no fire layer.
- Mix ratios: narration `0.92`; main rain/white-noise bed `0.20`; fine rain texture `0.020`; low rain body `0.010`; final bus `0.84`; narration limiter `0.64:level=false`; final limiter `0.62:level=false`.
- Voice chain: high-pass `80Hz`, slight warmth lift around `220Hz`, EQ cuts around `3200Hz` and `6200Hz`, low-pass `9000Hz`, conservative limiting.
- Visual direction: fixed story images with timed cuts. No pan, zoom, vertical jitter, or shaking motion.
- Slide count: 5 fixed background pages.
- Slide duration: about 258.590 seconds each, roughly 4 minutes 19 seconds.
- Title label strategy: show the chapter label only on the first slide, so later slide artwork does not cover character faces.

## Official QA

- FFprobe confirmed 1280x720, 24fps, 21:32.952 duration, 31,030 frames.
- Final audio measured `mean_volume: -26.0 dB`, `max_volume: -6.0 dB`.
- Subtitle QA: 343 cues, max 19 characters per subtitle line, max 2 lines, no overlong cues, no leading closing punctuation on subtitle lines.
- A frame at 00:05:00 was extracted after the title-label adjustment to confirm the later slide does not cover character faces.
- Output video, generated source audio, generated stills, and temporary QA frames are ignored by Git. Notes, subtitles, script, and thumbnail PNG may be tracked.

## Fixes Applied During Production

- Updated `scripts/build-audiobook-chapter-video.py` so closing punctuation such as `」` is attached to the previous subtitle chunk instead of starting a new line or cue.
- Updated slide rendering so the title label appears only on the first slide. Earlier drafts placed the label on every slide, which could cover faces in the second background image.

