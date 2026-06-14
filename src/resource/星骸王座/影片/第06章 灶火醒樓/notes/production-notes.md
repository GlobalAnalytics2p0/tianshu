# 星骸王座 第06章 灶火醒樓 Production Notes

## Scope

- Chapter source: `src/resource/星骸王座/文章/第06章 灶火醒樓.txt`
- Output video: `src/resource/星骸王座/影片/第06章 灶火醒樓/output/星骸王座-第06章 灶火醒樓-字幕有聲書-720p.mp4`
- Thumbnail: `src/resource/星骸王座/影片/第06章 灶火醒樓/thumbnails/星骸王座-第06章-灶火醒樓-thumbnail.png`
- Instagram promo: `src/resource/星骸王座/影片/第06章 灶火醒樓/output/instagram-promo.png`

## Visual Direction

- This chapter focuses on "灶火醒樓": one small rescue turning into a controlled neighborhood disturbance.
- Visual sequence:
  1. 周嬸家後門借灶救人，沈曜與阿棠扶著裴照川進門。
  2. 灶房內處理斷箭傷，火光、熱水、麻布與草藥形成壓迫感。
  3. 阿福外出買蔥、豆腐與麻布，整條巷子被鄰里聲響叫醒。
  4. 沈曜與阿棠在灶邊檢視半頁紙，只保留不可讀符記，不放可讀劇透文字。
  5. 沈曜把血袍送到北街水溝口，製造錯誤追蹤方向。
  6. 章尾破板車拖短灰犬繩在巷口點門，留下懸念。
- All generated scene art uses high-detail cinematic fantasy-noir composition. No screenshots, placeholders, abstract backgrounds, or generic ranking visuals were used.

## Build

- Render command used `scripts/build-audiobook-chapter-video.py`.
- Explicit slide count: `--slide-count 6`.
- Reason: the chapter has six distinct story beats, and the final dog-leash/counter-tracking image must appear in the closing minutes instead of reusing the blood-robe diversion scene too long.

## QA

- Video codec: H.264.
- Resolution: 1280x720.
- Frame rate: 24 fps.
- Pixel format: yuv420p.
- Duration: 1238.5 seconds, approximately 20:38.
- File size: 38,802,361 bytes.
- Audio: AAC mono, mean volume -25.8 dB, max volume -6.5 dB.
- Subtitles: 329 cues, max line length 20 characters.
- Subtitle checks: no leading closing punctuation, no lines over 22 characters.
- Contact sheet: `src/resource/星骸王座/影片/第06章 灶火醒樓/qa/ch06-frame-contact-sheet.png`

## Review Result

- Passed visual continuity review.
- Early, middle, and late frames match the chapter progression.
- The closing frame shows the broken cart and short grey dog leash, matching the chapter hook.

## Publish Record

- YouTube:
  - Published URL: `https://youtu.be/1EGffELOkD8`
  - Video ID: `1EGffELOkD8`
  - Title: `《星骸王座》第06章 灶火醒樓｜有聲書・玄幻長篇`
  - Visibility: Public.
  - Restrictions: None.
  - Published date shown by YouTube Studio: Jun 12, 2026.
  - Checks: Copyright and Community Guidelines both reported "No issues found."
  - Public watch-page verification: `playabilityStatus.status` returned `OK`.
  - Playlist: `天書小說 | 星骸王座`.
  - Thumbnail: custom uploaded thumbnail preview was visible in YouTube Studio.
- Instagram:
  - Permalink: `https://www.instagram.com/tianshu_novel/p/DZc8LUOma6j/`
  - Profile count changed from 5 posts to 6 posts after publishing.
  - Caption verified on permalink with `一鍋豆腐湯，叫醒整條巷。`
  - Pre-publish share switches for Threads and Facebook were both off.
- Threads:
  - Permalink: `https://www.threads.com/@tianshu_novel/post/DZc7Mgbkyu-`
  - Permalink verified with the chapter 6 copy and YouTube card.
- Facebook:
  - Public permalink: `https://www.facebook.com/permalink.php?story_fbid=122108642091346890&id=1200398056482505`
  - Business Suite composer target was changed from Facebook + Instagram to Facebook page only.
  - Pre-publish switches verified off: `Make this an ad post`, `Set date and time`, `Share to Facebook Story`, and `Boost`.
  - Public permalink verified with the chapter 6 copy and YouTube URL.
  - Business Suite Content list showed the Facebook text post under `天書小說｜原創小說天地-日更`.
- Meta cross-platform verification:
  - Business Suite Content list showed separate chapter 6 rows:
    - Instagram: `Photo`, `tianshu_novel`, Fri Jun 12, 12:24am.
    - Facebook: `Text`, `天書小說｜原創小說天地-日更`, Fri Jun 12, 12:18am.
- Upload working copies:
  - `/tmp/tianshu-upload/xinghai-wangzuo-ch06-video.mp4`
  - `/tmp/tianshu-upload/xinghai-wangzuo-ch06-thumbnail.png`
  - `/tmp/tianshu-upload/xinghai-wangzuo-ch06-instagram.png`
