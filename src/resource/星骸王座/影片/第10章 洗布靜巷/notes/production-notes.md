# 星骸王座 第10章 洗布靜巷 影片製作紀錄

## Scope

- Chapter source: `src/resource/星骸王座/文章/第10章 洗布靜巷.txt`
- Output video: `output/星骸王座-第10章 洗布靜巷-字幕有聲書-720p.mp4`
- Thumbnail: `thumbnails/星骸王座-第10章-洗布靜巷-thumbnail.png`
- Instagram image: `output/instagram-promo.png`

## Visual Direction

- This chapter focuses on the daytime cleanup system: washing yard, white cloth, gray-lime runoff, hidden ledger core, ash cart, and the half-collapsed white shed near the North Wall.
- Seven Image 2 story slides were used so the final minutes land on the white-shed clue rather than staying on an earlier washing-yard image.
- The cover hook is `白布一晾，活人就被分路。`
- Base images were generated without embedded text, logos, or watermarks; Traditional Chinese typography was added locally for the thumbnail and IG cover.

## Build

```bash
python3 scripts/build-audiobook-chapter-video.py \
  --novel '星骸王座' \
  --chapter-title '第10章 洗布靜巷' \
  --chapter-file 'src/resource/星骸王座/文章/第10章 洗布靜巷.txt' \
  --output-dir 'src/resource/星骸王座/影片/第10章 洗布靜巷' \
  --slide-count 7
```

- TTS voice: Edge `zh-TW-YunJheNeural`, `--rate=+0%`, `--pitch=-2Hz`.
- Background: official low-stimulation rain / white-noise bed.
- Initial render peaked at `-5.8 dB`, so the final MP4 audio was attenuated by `-0.7 dB` while copying the video stream unchanged.

## QA

- Video: H.264, 1280x720, 24 fps, `yuv420p`
- Duration: `1292.916667` seconds
- Size: `42,795,270` bytes
- Audio: `mean_volume: -26.6 dB`, `max_volume: -6.5 dB`
- Subtitle QA: 330 cues, 499 subtitle lines, max line length 19, no leading closing punctuation, no lines over 22 characters.
- Slide contact sheet: `qa/ch10-slide-contact-sheet.png`
- Final frame contact sheet: `qa/ch10-frame-contact-sheet.png`

## Review Notes

- Visual sequence matches the chapter: kitchen gray paper, washing yard measuring, public disruption, ledger theft, hidden route marks, gray cart, white shed ending hook.
- Thumbnail and IG cover were visually checked for no clipped text, no decorative line crossing title glyphs, and no extra corner watermark.
- Final audio is within the current soft sleep-listening target after attenuation.
