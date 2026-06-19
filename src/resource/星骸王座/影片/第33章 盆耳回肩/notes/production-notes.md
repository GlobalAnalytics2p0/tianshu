# 第33章 盆耳回肩｜製作紀錄

## 視覺設計

- 主軸：病家藥盆、盆耳熱灰、試肩板與節拍錘被拖到白天，北街眾人看懂照壁正在借半夜扶盆那一下肩。
- 主圖來源：沿用第33篇短影音既有 Image 2 key-art 4 張作長片主視覺；嘗試補新 Image 2 橫圖但本機未取得可引用檔案，為避免第五張重複，成片以 4 張不重複滿版圖渲染。
- 所有主圖均為章節專屬故事圖，圖內不放標題、logo、浮水印或可讀宣傳文字；標題與社群文字使用本機字體後製。

## 輸出檔案

- 影片：`output/星骸王座-第33章 盆耳回肩-字幕有聲書-720p.mp4`
- YouTube 縮圖：`thumbnails/星骸王座-第33章-盆耳回肩-thumbnail.png`
- IG 宣傳圖：`output/instagram-promo.png`
- 字幕：`subtitles/星骸王座-第33章 盆耳回肩.srt`
- 主圖 QA：`qa/ch33-slide-contact-sheet.png`
- 影片抽幀 QA：`qa/ch33-frame-contact-sheet.png`

## Build

- `python3 scripts/build-audiobook-chapter-video.py --novel '星骸王座' --chapter-title '第33章 盆耳回肩' --chapter-file 'src/resource/星骸王座/文章/第33章 盆耳回肩.txt' --output-dir 'src/resource/星骸王座/影片/第33章 盆耳回肩' --slide-count 4`

## QA

- 影片格式：h264 / 1280x720 / 24fps / yuv420p。
- 影片長度：1206.666667 秒。
- 檔案大小：35917915 bytes。
- 音量：mean -26.1 dB，max -6.6 dB。
- 字幕：322 cues，501 行，最長 19 字，開頭標點 0 行，超過 22 字 0 行。
- 抽幀確認：已輸出 contact sheet，用於檢查滿版畫面、字幕可讀性與無明顯卡頓/黑畫面。
