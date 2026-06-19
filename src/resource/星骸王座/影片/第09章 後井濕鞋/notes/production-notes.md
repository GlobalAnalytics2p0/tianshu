# 星骸王座 第09章 後井濕鞋 Production Notes

## Scope

- Chapter source: `src/resource/星骸王座/文章/第09章 後井濕鞋.txt`
- Output video: `src/resource/星骸王座/影片/第09章 後井濕鞋/output/星骸王座-第09章 後井濕鞋-字幕有聲書-720p.mp4`
- Thumbnail: `src/resource/星骸王座/影片/第09章 後井濕鞋/thumbnails/星骸王座-第09章-後井濕鞋-thumbnail.png`
- Instagram promo: `src/resource/星骸王座/影片/第09章 後井濕鞋/output/instagram-promo.png`

## Visual Direction

- This chapter follows the "後井" clue into the washing yard and turns the threat back toward 沈曜.
- Visual sequence:
  1. Dawn kitchen start with the back-well tally and trace-powder medicine packet.
  2. Washing yard investigation: wet cloth, half-covered well, ash trails, and a loose brick opening.
  3. Hidden-slot evidence: bamboo basket, damp hemp, and a small cloth shoe, without depicting restrained harm.
  4. White-hemp shed capture: gray trace-cleaner, wet shoe marks, and missing-corner lantern.
  5. West room evidence: measured white cloth bundles and blank paper-strip records.
  6. Public exposure: the washing yard is woken and dirtied with medicinal powder, water, and witnesses.
  7. Closing reversal: a messenger delivers a wet gray paper scrap to 沈曜, implying the threat now points back to him.
- Images involving vulnerable-child details were adjusted to evidence/aftermath framing after image generation safety refusal. The final slide set keeps the chapter-specific clue logic without showing explicit child endangerment.

## Build

- Render command used `scripts/build-audiobook-chapter-video.py`.
- Explicit slide count: `--slide-count 7`.
- Reason: the chapter has distinct investigation, capture, evidence, exposure, and closing-reversal beats. Seven slides keep the final wet-paper hook in the last segment.
- Title typography for thumbnail/IG was applied locally with `ヒラギノ明朝 ProN` for the main title and `STHeiti` for smaller labels.

## QA

- Video codec: H.264.
- Resolution: 1280x720.
- Frame rate: 24 fps.
- Pixel format: yuv420p.
- Duration: 1256.208 seconds, approximately 20:56.
- File size: 41,073,069 bytes.
- Audio: AAC mono, mean volume -25.8 dB, max volume -6.4 dB.
- Subtitles: 331 cues, max line length 19 characters.
- Subtitle checks: no leading closing punctuation, no lines over 22 characters.
- Contact sheet: `src/resource/星骸王座/影片/第09章 後井濕鞋/qa/ch09-frame-contact-sheet.png`

## Review Result

- Passed visual continuity review.
- Early frames show the back-well investigation setup.
- Middle frames show hidden-slot evidence, the trace-cleaner capture, and west-room records.
- Late frames show the washing yard being publicly woken, then the wet-paper closing reversal.
- Thumbnail and Instagram promo were inspected for title fit, text clipping, main-object visibility, and redundant watermark issues.

## Publishing / Social

- YouTube: user reported the video/post is visible; public video URL is `https://youtu.be/R_tGf3y4hPg`.
- Facebook: user reported the promotional post is visible; do not duplicate.
- Threads: chapter 9 was missing from the profile, then posted independently and verified at the top of `@tianshu_novel` with URL path `/@tianshu_novel/post/DZr_e0-k6rV`.
- Instagram: posted independently and verified at `https://www.instagram.com/p/DZsB2_kmROL/`. The post shows the chapter 9 caption, YouTube/website CTA, and hashtags `#星骸王座 #天書小說 #有聲書 #玄幻小說 #繁體中文小說 #原創小說`.
- Cross-platform sync: not used. IG, Threads, Facebook, and YouTube remain independent posting surfaces.
