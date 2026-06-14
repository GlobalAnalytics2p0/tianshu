# 星骸王座 第13章 活手亂槽 影片製作紀錄

## Scope

- Chapter source: `src/resource/星骸王座/文章/第13章 活手亂槽.txt`
- Output video: `output/星骸王座-第13章 活手亂槽-字幕有聲書-720p.mp4`
- Thumbnail: `thumbnails/星骸王座-第13章-活手亂槽-thumbnail.png`
- Instagram image: `output/instagram-promo.png`

## Visual Direction

- This chapter turns the enemy's hand-recognition method against itself by flooding East Trough with many living hands.
- Seven Image 2 story slides were used: crowded hand-marked trough, A-Tang's floating-confusion powder, coal cart hand-sample, north-turn charcoal shed surveillance, wet-page disruption, returning with the token/page clue, and the public handprint board.
- The cover hook is `一百隻手，把白路按亂。`
- Any gray page or token content was kept abstract, blank, or knot-like, not generated as readable writing.

## Build

```bash
python3 scripts/build-audiobook-chapter-video.py \
  --novel '星骸王座' \
  --chapter-title '第13章 活手亂槽' \
  --chapter-file 'src/resource/星骸王座/文章/第13章 活手亂槽.txt' \
  --output-dir 'src/resource/星骸王座/影片/第13章 活手亂槽' \
  --slide-count 7
```

- TTS voice: Edge `zh-TW-YunJheNeural`, `--rate=+0%`, `--pitch=-2Hz`.
- Background: official low-stimulation rain / white-noise bed.

## QA

- Video: H.264, 1280x720, 24 fps, `yuv420p`
- Duration: `1318.656009` seconds
- Size: `44,681,111` bytes
- Audio: `mean_volume: -25.8 dB`, `max_volume: -6.3 dB`
- Subtitle QA: 356 cues, 525 subtitle lines, max line length 19, no leading closing punctuation, no lines over 22 characters.
- Slide contact sheet: `qa/ch13-slide-contact-sheet.png`
- Final frame contact sheet: `qa/ch13-frame-contact-sheet.png`

## Review Notes

- Visual sequence matches the chapter's escalation: public hand noise, powder-based handprint confusion, coal-cart sample path, charcoal-shed recorder, gray-page contamination, old knot clue, and the final living-hands countermeasure.
- Thumbnail and IG cover were visually checked for no clipped typography, no title-line collision, no watermark, and no fake generated text.
- Final audio stayed inside the current soft sleep-listening target without extra attenuation.
