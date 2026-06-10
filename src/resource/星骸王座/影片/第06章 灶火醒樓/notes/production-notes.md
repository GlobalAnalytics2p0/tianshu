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
