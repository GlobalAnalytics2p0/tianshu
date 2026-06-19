# 第42章 餘手留痕｜製作紀錄

## 視覺設計

- 主軸：北街發現照壁沿著善意餘手把亂局悄悄收平，於是要求亂處先留、平前留痕、誰手發癢先按灰。
- 主圖來源：沿用第42篇短影音既有 Image 2 key-art 4 張；額外候選與第三張灰痕構圖接近，因此成片以 4 張不重複滿版圖渲染。
- 所有主圖均為章節專屬故事圖，圖內不放標題、logo、浮水印或可讀宣傳文字；標題與社群文字使用本機字體後製。

## 輸出檔案

- 影片：`output/星骸王座-第42章 餘手留痕-字幕有聲書-720p.mp4`
- YouTube 縮圖：`thumbnails/星骸王座-第42章-餘手留痕-thumbnail.png`
- IG 宣傳圖：`output/instagram-promo.png`
- 字幕：`subtitles/星骸王座-第42章 餘手留痕.srt`
- 主圖 QA：`qa/ch42-slide-contact-sheet.png`
- 影片抽幀 QA：`qa/ch42-frame-contact-sheet.png`

## Build

- `python3 scripts/build-audiobook-chapter-video.py --novel '星骸王座' --chapter-title '第42章 餘手留痕' --chapter-file 'src/resource/星骸王座/文章/第42章 餘手留痕.txt' --output-dir 'src/resource/星骸王座/影片/第42章 餘手留痕' --slide-count 4`

## QA

- 影片格式：h264 / 1280x720 / 24fps / yuv420p。
- 影片長度：1195.500000 秒。
- 檔案大小：35166229 bytes。
- 音量：mean -26.0 dB，max -6.6 dB。
- 字幕：320 cues，511 行，最長 19 字，開頭標點 0 行，超過 22 字 0 行。
- 抽幀確認：已輸出 contact sheet，用於檢查滿版畫面、字幕可讀性與無明顯卡頓/黑畫面。
