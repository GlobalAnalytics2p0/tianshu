# 第44章 公勺留肩｜製作紀錄

## 視覺設計

- 主軸：照護棚、公用湯勺、熱布架與病家分工；北街把照護順手、公勺、公佈與公桿拆開記名，防止照壁沿公務照護養熟肩。
- 主圖來源：沿用第44篇短影音既有 Image 2 key-art；第5張候選與第4張重複，因此成片使用4張不重複滿版圖渲染。
- 所有主圖均為章節專屬故事圖，圖內不放標題、logo、浮水印或可讀宣傳文字；標題與社群文字使用本機字體後製。

## 輸出檔案

- 影片：`output/星骸王座-第44章 公勺留肩-字幕有聲書-720p.mp4`
- YouTube 縮圖：`thumbnails/星骸王座-第44章-公勺留肩-thumbnail.png`
- IG 宣傳圖：`output/instagram-promo.png`
- 字幕：`subtitles/星骸王座-第44章 公勺留肩.srt`
- 主圖 QA：`qa/ch44-slide-contact-sheet.png`
- 影片抽幀 QA：`qa/ch44-frame-contact-sheet.png`

## Build

- `python3 scripts/build-audiobook-chapter-video.py --novel '星骸王座' --chapter-title '第44章 公勺留肩' --chapter-file 'src/resource/星骸王座/文章/第44章 公勺留肩.txt' --output-dir 'src/resource/星骸王座/影片/第44章 公勺留肩' --slide-count 4`

## QA

- 影片格式：h264 / 1280x720 / 24fps / yuv420p。
- 影片長度：1183.008005 秒。
- 檔案大小：31735410 bytes。
- 音量：mean -26.1 dB，max -6.6 dB。
- 字幕：305 cues，489 行，最長 20 字，開頭標點 0 行，超過 22 字 0 行。
- 抽幀確認：已輸出 contact sheet，用於檢查滿版畫面、字幕可讀性與無明顯卡頓/黑畫面。
