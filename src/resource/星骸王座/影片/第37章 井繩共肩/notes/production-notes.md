# 第37章 井繩共肩｜製作紀錄

## 視覺設計

- 主軸：後井轆轤開始問整條街共用的第二力，北街用木環、紅繩與點名分手，防止未喊先接的人被照壁記熟。
- 主圖來源：沿用第37篇短影音既有 Image 2 key-art 4 張；額外候選與井口主構圖接近，因此成片以 4 張不重複滿版圖渲染。
- 所有主圖均為章節專屬故事圖，圖內不放標題、logo、浮水印或可讀宣傳文字；標題與社群文字使用本機字體後製。

## 輸出檔案

- 影片：`output/星骸王座-第37章 井繩共肩-字幕有聲書-720p.mp4`
- YouTube 縮圖：`thumbnails/星骸王座-第37章-井繩共肩-thumbnail.png`
- IG 宣傳圖：`output/instagram-promo.png`
- 字幕：`subtitles/星骸王座-第37章 井繩共肩.srt`
- 主圖 QA：`qa/ch37-slide-contact-sheet.png`
- 影片抽幀 QA：`qa/ch37-frame-contact-sheet.png`

## Build

- `python3 scripts/build-audiobook-chapter-video.py --novel '星骸王座' --chapter-title '第37章 井繩共肩' --chapter-file 'src/resource/星骸王座/文章/第37章 井繩共肩.txt' --output-dir 'src/resource/星骸王座/影片/第37章 井繩共肩' --slide-count 4`

## QA

- 影片格式：h264 / 1280x720 / 24fps / yuv420p。
- 影片長度：1179.528005 秒。
- 檔案大小：33033218 bytes。
- 音量：mean -26.1 dB，max -6.7 dB。
- 字幕：313 cues，492 行，最長 19 字，開頭標點 0 行，超過 22 字 0 行。
- 抽幀確認：已輸出 contact sheet，用於檢查滿版畫面、字幕可讀性與無明顯卡頓/黑畫面。
