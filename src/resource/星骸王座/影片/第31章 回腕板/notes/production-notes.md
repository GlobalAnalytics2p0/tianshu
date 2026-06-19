# 第31章 回腕板｜製作紀錄

## 視覺設計

- 主軸：回腕板與灰架記腕把病家夜裡半醒的回手拖到白天，沈曜與阿棠逼北街眾人把自己的手路記回來，照壁則開始試圖先問回腕、再借沈手。
- 主圖來源：沿用第31篇短影音既有 Image 2 key-art 4 張，另補 1 張章節專屬 Image 2 橫版故事圖；全部轉為 1280x720 滿版 slide。
- 所有主圖均為章節專屬故事圖，圖內不放標題、logo、浮水印或可讀宣傳文字；標題與社群文字使用本機字體後製。

## 輸出檔案

- 影片：`output/星骸王座-第31章 回腕板-字幕有聲書-720p.mp4`
- YouTube 縮圖：`thumbnails/星骸王座-第31章-回腕板-thumbnail.png`
- IG 宣傳圖：`output/instagram-promo.png`
- 字幕：`subtitles/星骸王座-第31章 回腕板.srt`
- 主圖 QA：`qa/ch31-slide-contact-sheet.png`
- 影片抽幀 QA：`qa/ch31-frame-contact-sheet.png`

## Build

- `python3 scripts/build-audiobook-chapter-video.py --novel '星骸王座' --chapter-title '第31章 回腕板' --chapter-file 'src/resource/星骸王座/文章/第31章 回腕板.txt' --output-dir 'src/resource/星骸王座/影片/第31章 回腕板' --slide-count 5`

## QA

- 影片格式：h264 / 1280x720 / 24fps / yuv420p。
- 影片長度：1212.041667 秒。
- 檔案大小：36183166 bytes。
- 音量：mean -26.0 dB，max -6.5 dB。
- 字幕：319 cues，518 行，最長 19 字，開頭標點 0 行，超過 22 字 0 行。
- 抽幀確認：已輸出 contact sheet，用於檢查滿版畫面、字幕可讀性與無明顯卡頓/黑畫面。
