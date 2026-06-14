# 星骸王座 第11章 灰棚錯結 影片製作紀錄

## Scope

- Chapter source: `src/resource/星骸王座/文章/第11章 灰棚錯結.txt`
- Output video: `output/星骸王座-第11章 灰棚錯結-字幕有聲書-720p.mp4`
- Thumbnail: `thumbnails/星骸王座-第11章-灰棚錯結-thumbnail.png`
- Instagram image: `output/instagram-promo.png`

## Visual Direction

- This chapter focuses on wrong knots, route misdirection, and the medicine-door recognition cloth.
- Seven Image 2 story slides were used: white-shed wheel marks, charcoal-yard car-swap knot, kitchen planning, Hu house back-kitchen refuge, A-Tang swapping the cart knot, medicine-door recognition cloth, and the bitter-herb break at the end.
- The cover hook is `結一錯，夜路就偏。`
- The first generated social-cover base was rejected because the blank slip looked too close to generated pseudo-writing. A clean replacement was generated with a blank stained slip before typography was added locally.

## Build

```bash
python3 scripts/build-audiobook-chapter-video.py \
  --novel '星骸王座' \
  --chapter-title '第11章 灰棚錯結' \
  --chapter-file 'src/resource/星骸王座/文章/第11章 灰棚錯結.txt' \
  --output-dir 'src/resource/星骸王座/影片/第11章 灰棚錯結' \
  --slide-count 7
```

- TTS voice: Edge `zh-TW-YunJheNeural`, `--rate=+0%`, `--pitch=-2Hz`.
- Background: official low-stimulation rain / white-noise bed.

## QA

- Video: H.264, 1280x720, 24 fps, `yuv420p`
- Duration: `1295.351995` seconds
- Size: `40,949,325` bytes
- Audio: `mean_volume: -25.8 dB`, `max_volume: -6.2 dB`
- Subtitle QA: 341 cues, 507 subtitle lines, max line length 20, no leading closing punctuation, no lines over 22 characters.
- Slide contact sheet: `qa/ch11-slide-contact-sheet.png`
- Final frame contact sheet: `qa/ch11-frame-contact-sheet.png`

## Review Notes

- Visual sequence matches the chapter's causal chain: read gray marks, identify swap-car knot, plan the wrong route, hide Zhou Shen in a noisy refuge, swap the gray-cart knot, watch the medicine-door cloth, and ruin the recognition cloth.
- Thumbnail and IG cover were visually checked for no clipped text, no decorative line crossing title glyphs, no unnecessary watermark, and no fake generated text.
- Final audio stayed inside the current soft sleep-listening target without extra attenuation.
