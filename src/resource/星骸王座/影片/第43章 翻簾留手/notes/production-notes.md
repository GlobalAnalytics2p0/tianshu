# 第43章 翻簾留手｜製作紀錄

## 視覺設計

- 主軸：公共簾桿、門簾與公用物件被迫留手留痕，北街把誰碰公物、誰替人翻簾、誰讓公物自動歸手都拖到白天記錄。
- 主圖來源：沿用第43篇短影音既有 Image 2 key-art；第5張候選與第4張重複，因此成片使用4張不重複滿版圖渲染。
- 所有主圖均為章節專屬故事圖，圖內不放標題、logo、浮水印或可讀宣傳文字；標題與社群文字使用本機字體後製。

## 輸出檔案

- 影片：`output/星骸王座-第43章 翻簾留手-字幕有聲書-720p.mp4`
- YouTube 縮圖：`thumbnails/星骸王座-第43章-翻簾留手-thumbnail.png`
- IG 宣傳圖：`output/instagram-promo.png`
- 字幕：`subtitles/星骸王座-第43章 翻簾留手.srt`
- 主圖 QA：`qa/ch43-slide-contact-sheet.png`
- 影片抽幀 QA：`qa/ch43-frame-contact-sheet.png`

## Build

- `python3 scripts/build-audiobook-chapter-video.py --novel '星骸王座' --chapter-title '第43章 翻簾留手' --chapter-file 'src/resource/星骸王座/文章/第43章 翻簾留手.txt' --output-dir 'src/resource/星骸王座/影片/第43章 翻簾留手' --slide-count 4`

## QA

- 影片格式：h264 / 1280x720 / 24fps / yuv420p。
- 影片長度：1192.871995 秒。
- 檔案大小：33635111 bytes。
- 音量：mean -26.1 dB，max -6.9 dB。
- 字幕：315 cues，491 行，最長 20 字，開頭標點 0 行，超過 22 字 0 行。
- 抽幀確認：已輸出 contact sheet，用於檢查滿版畫面、字幕可讀性與無明顯卡頓/黑畫面。
