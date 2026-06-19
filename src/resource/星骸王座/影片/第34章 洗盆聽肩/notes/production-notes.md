# 第34章 洗盆聽肩｜製作紀錄

## 視覺設計

- 主軸：公用藥盆被拖到街心，北街用銅鈴、節拍錘與眾人的手聲一起守第二下，逼照壁不能安靜借肩。
- 主圖來源：沿用第34篇短影音既有 Image 2 key-art 4 張；候選第五張與第一張構圖重複，因此成片以 4 張不重複滿版圖渲染。
- 所有主圖均為章節專屬故事圖，圖內不放標題、logo、浮水印或可讀宣傳文字；標題與社群文字使用本機字體後製。

## 輸出檔案

- 影片：`output/星骸王座-第34章 洗盆聽肩-字幕有聲書-720p.mp4`
- YouTube 縮圖：`thumbnails/星骸王座-第34章-洗盆聽肩-thumbnail.png`
- IG 宣傳圖：`output/instagram-promo.png`
- 字幕：`subtitles/星骸王座-第34章 洗盆聽肩.srt`
- 主圖 QA：`qa/ch34-slide-contact-sheet.png`
- 影片抽幀 QA：`qa/ch34-frame-contact-sheet.png`

## Build

- `python3 scripts/build-audiobook-chapter-video.py --novel '星骸王座' --chapter-title '第34章 洗盆聽肩' --chapter-file 'src/resource/星骸王座/文章/第34章 洗盆聽肩.txt' --output-dir 'src/resource/星骸王座/影片/第34章 洗盆聽肩' --slide-count 4`

## QA

- 影片格式：h264 / 1280x720 / 24fps / yuv420p。
- 影片長度：1183.223991 秒。
- 檔案大小：34277327 bytes。
- 音量：mean -26.1 dB，max -6.6 dB。
- 字幕：310 cues，494 行，最長 19 字，開頭標點 0 行，超過 22 字 0 行。
- 抽幀確認：已輸出 contact sheet，用於檢查滿版畫面、字幕可讀性與無明顯卡頓/黑畫面。
