# 第32章 空背來手｜製作紀錄

## 視覺設計

- 主軸：空背鹽箱、程舊屋後牆與裂藥盆被拖到白天，沈曜忍住不敲滿三輕一重，保住沈家回腕不被照壁借走。
- 主圖來源：沿用第32篇短影音既有 Image 2 key-art 4 張，另選 1 張無字群像 frame 作長片第五張；全部轉為 1280x720 滿版 slide。
- 所有主圖均為章節專屬故事圖，圖內不放標題、logo、浮水印或可讀宣傳文字；標題與社群文字使用本機字體後製。

## 輸出檔案

- 影片：`output/星骸王座-第32章 空背來手-字幕有聲書-720p.mp4`
- YouTube 縮圖：`thumbnails/星骸王座-第32章-空背來手-thumbnail.png`
- IG 宣傳圖：`output/instagram-promo.png`
- 字幕：`subtitles/星骸王座-第32章 空背來手.srt`
- 主圖 QA：`qa/ch32-slide-contact-sheet.png`
- 影片抽幀 QA：`qa/ch32-frame-contact-sheet.png`

## Build

- `python3 scripts/build-audiobook-chapter-video.py --novel '星骸王座' --chapter-title '第32章 空背來手' --chapter-file 'src/resource/星骸王座/文章/第32章 空背來手.txt' --output-dir 'src/resource/星骸王座/影片/第32章 空背來手' --slide-count 5`

## QA

- 影片格式：h264 / 1280x720 / 24fps / yuv420p。
- 影片長度：1189.791667 秒。
- 檔案大小：34883786 bytes。
- 音量：mean -26.1 dB，max -6.5 dB。
- 字幕：319 cues，511 行，最長 19 字，開頭標點 0 行，超過 22 字 0 行。
- 抽幀確認：已輸出 contact sheet，用於檢查滿版畫面、字幕可讀性與無明顯卡頓/黑畫面。
