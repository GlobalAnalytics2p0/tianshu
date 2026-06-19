# 星骸王座 第08章 藍灰木籤 Production Notes

## Scope

- Chapter source: `src/resource/星骸王座/文章/第08章 藍灰木籤.txt`
- Output video: `src/resource/星骸王座/影片/第08章 藍灰木籤/output/星骸王座-第08章 藍灰木籤-字幕有聲書-720p.mp4`
- Thumbnail: `src/resource/星骸王座/影片/第08章 藍灰木籤/thumbnails/星骸王座-第08章-藍灰木籤-thumbnail.png`
- Instagram promo: `src/resource/星骸王座/影片/第08章 藍灰木籤/output/instagram-promo.png`

## Visual Direction

- This chapter focuses on contaminating the false death route with smell, witnesses, and human noise, then revealing the colder "back well" clue.
- Visual sequence:
  1. Dawn tactical planning with bitter mugwort water and an improvised alley-route cloth map.
  2. 夏婆 is brought into the house and chooses to help wake the lane.
  3. Lower Lane becomes noisy and medicinal, with steam, coughing, lamps, and 阿福 spreading ash.
  4. 阿棠 and 沈曜 prepare the medicine-shop back trough and wash buckets with mixed smells.
  5. Night entry: stray dog tests the scent, followed by the medicine man, lantern-bearer, and basket woman.
  6. Back-trough clash: 沈曜 grabs the flipped lantern while herb sludge and 阿棠's powder disrupt the route.
  7. Closing clue: broken lantern metal and a short thick blue-gray wooden tally with a well-like mark.
- All final images were generated as chapter-specific Image 2 story art. No screenshots, placeholders, generic textures, or reused chapter art were used.

## Build

- Render command used `scripts/build-audiobook-chapter-video.py`.
- Explicit slide count: `--slide-count 7`.
- Reason: Chapter 8 has two separate late beats, the back-trough lantern clash and the final back-well tally clue. Seven slides keep the ending visually aligned while still giving each slide about three minutes of screen time.
- Title typography for thumbnail/IG was applied locally with `ヒラギノ明朝 ProN` for the main title and `STHeiti` for smaller labels. No redundant corner watermark was added.

## QA

- Video codec: H.264.
- Resolution: 1280x720.
- Frame rate: 24 fps.
- Pixel format: yuv420p.
- Duration: 1278.375 seconds, approximately 21:18.
- File size: 42,101,249 bytes.
- Audio: AAC mono, mean volume -25.8 dB, max volume -6.5 dB.
- Subtitles: 336 cues, max line length 19 characters.
- Subtitle checks: no leading closing punctuation, no lines over 22 characters.
- Contact sheet: `src/resource/星骸王座/影片/第08章 藍灰木籤/qa/ch08-frame-contact-sheet.png`

## Review Result

- Passed visual continuity review.
- Early frames show the bitter-water plan and 夏婆's emotional choice.
- Middle frames show the living lane and the medicine-shop back trough.
- Late frames show the night entry, lantern disruption, and final back-well tally clue.
- Thumbnail and Instagram promo were visually inspected for title fit, line placement, text clipping, main-object visibility, and redundant watermark issues.

## Publish Record

- Published to YouTube on 2026-06-16.
- YouTube URL: `https://youtu.be/kRlPKlecYG8`
- YouTube title: `《星骸王座》第08章 藍灰木籤｜有聲書・玄幻長篇`
- Visibility: Public.
- Studio status after publish: Published Jun 16, 2026; restrictions none.
- YouTube checks completed with no issues found.
- Public oEmbed verification returned HTTP 200 and matched the channel/title.

## Social Promotion Record

- YouTube Community post published and verified in the channel Posts tab on 2026-06-16. No permalink was captured.
- Threads post published and verified: `https://www.threads.com/@tianshu_novel/post/DZptKBAEwAz`
- Facebook Page post published and verified on `https://www.facebook.com/profile.php?id=61590406722346`. The page showed the Chapter 8 copy and YouTube link preview after posting; no single-post permalink was captured.
- Instagram post published from `output/instagram-promo.png` and Instagram returned `已分享你的貼文。` after upload. Threads and Facebook sync switches were confirmed off before publishing. The Instagram permalink could not be captured reliably because the Chrome/Instagram DOM control timed out after the successful publish confirmation.

## Operational Notes

- Chrome file chooser automation returned `Not allowed` for `fileChooser.setFiles` during the YouTube upload flow. The upload still completed through YouTube Studio; keep this as a known Chrome/extension limitation and verify upload state inside Studio before publishing.
- Instagram Chinese caption entry should use the macOS clipboard paste path when Computer Use literal typing drops Chinese characters. For this post, the first typed caption lost Chinese text; it was replaced with a full clipboard paste before publishing.
- For Instagram, always confirm Threads/Facebook sync switches are off when the platform posts are being created independently.
