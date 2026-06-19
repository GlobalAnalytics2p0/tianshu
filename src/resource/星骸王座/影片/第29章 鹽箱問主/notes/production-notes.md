# 第29章 鹽箱問主｜製作紀錄

## 視覺設計

- 主軸：北街把鹽箱與病家手路拖到白天，濕紙問紋、孩子守箱與問主手暴露出照壁下一步。
- 主圖來源：沿用第29篇短影音既有 Image 2 key-art 4 張，另補 1 張 Image 2 橫版主圖；全部轉為 1280x720 滿版 slide。
- 所有主圖均為章節專屬故事圖，圖內不放標題、logo、浮水印或可讀宣傳文字；標題與社群文字使用本機字體後製。

## 輸出檔案

- 影片：`output/星骸王座-第29章 鹽箱問主-字幕有聲書-720p.mp4`
- YouTube 縮圖：`thumbnails/星骸王座-第29章-鹽箱問主-thumbnail.png`
- IG 宣傳圖：`output/instagram-promo.png`
- 字幕：`subtitles/星骸王座-第29章 鹽箱問主.srt`
- 主圖 QA：`qa/ch29-slide-contact-sheet.png`
- 影片抽幀 QA：`qa/ch29-frame-contact-sheet.png`

## Build

- `python3 scripts/build-audiobook-chapter-video.py --novel '星骸王座' --chapter-title '第29章 鹽箱問主' --chapter-file 'src/resource/星骸王座/文章/第29章 鹽箱問主.txt' --output-dir 'src/resource/星骸王座/影片/第29章 鹽箱問主' --slide-count 5`

## QA

- 影片格式：h264 / 1280x720 / 24fps / yuv420p。
- 影片長度：1234.708333 秒。
- 檔案大小：37639584 bytes。
- 音量：mean -26.2 dB，max -6.5 dB。
- 字幕：327 cues，508 行，最長 19 字，開頭標點 0 行，超過 22 字 0 行。
- 抽幀確認：已輸出 contact sheet，用於檢查滿版畫面、字幕可讀性與無明顯卡頓/黑畫面。
