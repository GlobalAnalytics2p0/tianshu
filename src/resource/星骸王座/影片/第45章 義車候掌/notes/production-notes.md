# 第45章 義車候掌｜製作紀錄

## 視覺設計

- 主軸：義棚救命車進入北街，四角扶木、左前掌位、病童與街坊換手留灰；北街拆開救命時最容易被照壁養熟的那一掌。
- 主圖來源：沿用第45篇短影音既有 Image 2 key-art；內建 image generation 未留下可接入本機檔案，因此以現有無字素材為主，並手動替換第3張為車身/扶位近景，降低重複與提升義車辨識度。
- 所有主圖均為章節專屬故事圖，圖內不放標題、logo、浮水印或可讀宣傳文字；標題與社群文字使用本機字體後製。

## 輸出檔案

- 影片：`output/星骸王座-第45章 義車候掌-字幕有聲書-720p.mp4`
- YouTube 縮圖：`thumbnails/星骸王座-第45章-義車候掌-thumbnail.png`
- IG 宣傳圖：`output/instagram-promo.png`
- 字幕：`subtitles/星骸王座-第45章 義車候掌.srt`
- 主圖 QA：`qa/ch45-slide-contact-sheet.png`
- 影片抽幀 QA：`qa/ch45-frame-contact-sheet.png`

## Build

- `python3 scripts/build-audiobook-chapter-video.py --novel '星骸王座' --chapter-title '第45章 義車候掌' --chapter-file 'src/resource/星骸王座/文章/第45章 義車候掌.txt' --output-dir 'src/resource/星骸王座/影片/第45章 義車候掌' --slide-count 4`

## QA

- 影片格式：h264 / 1280x720 / 24fps / yuv420p。
- 影片長度：1203.168005 秒。
- 檔案大小：33920456 bytes。
- 音量：mean -26.1 dB，max -6.6 dB。
- 字幕：318 cues，496 行，最長 20 字，開頭標點 0 行，超過 22 字 0 行。
- 抽幀確認：已輸出 contact sheet，用於檢查滿版畫面、字幕可讀性與無明顯卡頓/黑畫面。
