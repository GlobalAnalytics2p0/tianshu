# 星骸王座 第07章 翻燈問藥 Production Notes

## Scope

- Chapter source: `src/resource/星骸王座/文章/第07章 翻燈問藥.txt`
- Output video: `src/resource/星骸王座/影片/第07章 翻燈問藥/output/星骸王座-第07章 翻燈問藥-字幕有聲書-720p.mp4`
- Thumbnail: `src/resource/星骸王座/影片/第07章 翻燈問藥/thumbnails/星骸王座-第07章-翻燈問藥-thumbnail.png`
- Instagram promo: `src/resource/星骸王座/影片/第07章 翻燈問藥/output/instagram-promo.png`

## Visual Direction

- This chapter focuses on false medicine records, flipped lantern route marks, and blue-gray door tallies.
- Visual sequence:
  1. Dawn alley interrogation at 周嬸家, with medicine basket and black-cloth lantern.
  2. Interior countermeasure: 阿棠 gives 沈曜 medicinal ash while 阿福 exits to make the real cough-route audible.
  3. North Street funeral-goods shop: the unlit lantern is flipped to reveal hidden grooves.
  4. A porter drops an herb packet, exposing a thin blue-gray wooden tally.
  5. Lower Lane door-marking: a vulnerable quiet household is tagged with a blue-gray tally.
  6. Closing beat: 周嬸家 itself has been marked, and the house prepares a noisy medicinal countermeasure.
- All final images were generated as chapter-specific story art with Image 2 and saved under `source/`.
- A first attempt for the closing slide was rejected because generated paper marks looked like pseudo-text. The final `slide-06.png` was regenerated with blank/unreadable wrappers.

## Build

- Render command used `scripts/build-audiobook-chapter-video.py`.
- Explicit slide count: `--slide-count 6`.
- Reason: the chapter has six clear visual beats, and the final "周嬸家也被記上" scene needs to appear near the ending rather than leaving the video on the lower-lane mark too long.
- Title typography for thumbnail/IG was applied locally with `ヒラギノ明朝 ProN` for the main title and `STHeiti` for smaller labels. No extra corner watermark was added.

## QA

- Video codec: H.264.
- Resolution: 1280x720.
- Frame rate: 24 fps.
- Pixel format: yuv420p.
- Duration: 1010.28 seconds, approximately 16:50.
- File size: 31,905,403 bytes.
- Audio: AAC mono, mean volume -25.9 dB, max volume -6.5 dB.
- Subtitles: 267 cues, max line length 19 characters.
- Subtitle checks: no leading closing punctuation, no lines over 22 characters.
- Contact sheet: `src/resource/星骸王座/影片/第07章 翻燈問藥/qa/ch07-frame-contact-sheet.png`

## Review Result

- Passed visual continuity review.
- Early frames show the interrogation and interior misdirection setup.
- Middle frames show the flipped lantern and fallen tally clue.
- Late frames show the lower-lane door mark and the closing mark at 周嬸家.
- Thumbnail and Instagram promo were visually inspected for title fit, line placement, text clipping, and redundant watermark issues.

## Publish Record

- YouTube published on 2026-06-14: `https://youtu.be/3FBOdCcZWuM`
- YouTube Studio status after publish: Visibility `Public`, Restrictions `None`, Date `Jun 14, 2026`, Status `Published`.
- Copyright and Community Guidelines checks completed with no issues found before publishing.
- Custom thumbnail was visible in YouTube Studio before publishing.
- Public watch verification: YouTube oEmbed returned HTTP 200 with title `《星骸王座》第07章 翻燈問藥｜有聲書・玄幻長篇` and author `天書小說 | TianShu`.

## Social Publish Record

- Threads published and verified on 2026-06-14: `https://www.threads.com/@tianshu_novel/post/DZj31ygE_0M`
- Facebook Page published and verified on 2026-06-14 at `https://www.facebook.com/profile.php?id=61590406722346`.
- Facebook verification detail: the page showed the 第07章〈翻燈問藥〉post text, the YouTube URL `https://youtu.be/3FBOdCcZWuM`, the official website URL `https://tianshu.petrichor.tw/`, and the link preview. The exact single-post permalink was not exposed during verification.
- Instagram published and verified on 2026-06-14: `https://www.instagram.com/tianshu_novel/p/DZj54pBmVMS/`
- Instagram profile count changed from 6 posts to 7 posts after publishing.
- Instagram upload note: the browser file chooser API returned a permission error earlier, but the image was already successfully attached before final captioning. Before sharing, both Threads and Facebook sync switches were checked and confirmed `false`, so the IG post was published independently.
