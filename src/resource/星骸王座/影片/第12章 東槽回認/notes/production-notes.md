# 星骸王座 第12章 東槽回認 影片製作紀錄

## Scope

- Chapter source: `src/resource/星骸王座/文章/第12章 東槽回認.txt`
- Output video: `output/星骸王座-第12章 東槽回認-字幕有聲書-720p.mp4`
- Thumbnail: `thumbnails/星骸王座-第12章-東槽回認-thumbnail.png`
- Instagram image: `output/instagram-promo.png`

## Visual Direction

- This chapter focuses on the East Trough and the enemy's hand-recognition method rather than a simple household route.
- Seven Image 2 story slides were used: predawn wheel tracks, Zhou Shen waking the trough, the basket carrier with low gray lamp and hidden dry board, dry-board hand recognition, gray-water disruption, Shen Yao/A-Tang taking the board and cloth, and the aftermath handprint clue.
- The cover hook is `認的不是門，是手。`
- Dry-board pages and slips were kept blank or abstract to avoid generated pseudo-writing.

## Build

```bash
python3 scripts/build-audiobook-chapter-video.py \
  --novel '星骸王座' \
  --chapter-title '第12章 東槽回認' \
  --chapter-file 'src/resource/星骸王座/文章/第12章 東槽回認.txt' \
  --output-dir 'src/resource/星骸王座/影片/第12章 東槽回認' \
  --slide-count 7
```

- TTS voice: Edge `zh-TW-YunJheNeural`, `--rate=+0%`, `--pitch=-2Hz`.
- Background: official low-stimulation rain / white-noise bed.

## QA

- Video: H.264, 1280x720, 24 fps, `yuv420p`
- Duration: `1254.863991` seconds
- Size: `42,191,513` bytes
- Audio: `mean_volume: -25.8 dB`, `max_volume: -6.2 dB`
- Subtitle QA: 333 cues, 495 subtitle lines, max line length 19, no leading closing punctuation, no lines over 22 characters.
- Slide contact sheet: `qa/ch12-slide-contact-sheet.png`
- Final frame contact sheet: `qa/ch12-frame-contact-sheet.png`

## Review Notes

- Visual sequence tracks the chapter's escalation: East Trough surveillance, public disruption, hidden dry-board tool, hand recognition, gray-water break, dry-board capture, and the old-scar clue.
- Thumbnail and IG cover were checked for no clipped text, no title-line collision, and no generated fake writing.
- Final audio stayed inside the current soft sleep-listening target without extra attenuation.
