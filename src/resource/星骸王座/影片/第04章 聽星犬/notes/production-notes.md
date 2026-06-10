# 星骸王座 第04章 聽星犬 影片製作紀錄

## 產出狀態

- 製作日期：2026-06-09
- 章節文章：`src/resource/星骸王座/文章/第04章 聽星犬.txt`
- 正式影片：`src/resource/星骸王座/影片/第04章 聽星犬/output/星骸王座-第04章 聽星犬-字幕有聲書-720p.mp4`
- 字幕：`src/resource/星骸王座/影片/第04章 聽星犬/subtitles/星骸王座-第04章 聽星犬.srt`
- YouTube 縮圖：`src/resource/星骸王座/影片/第04章 聽星犬/thumbnails/星骸王座-第04章-聽星犬-thumbnail.png`
- IG 宣傳圖：`src/resource/星骸王座/影片/第04章 聽星犬/output/instagram-promo.png`
- 本章已上傳 YouTube，並已在 Instagram、Threads、Facebook 各自發布宣傳。

## 視覺 Brief

本章視覺核心是藥鋪夜搜、血味誘犬、苦艾灰、廢炭棚、灶灰假木籤、銅哨與北牆墓坡。最終使用 Image 2 生成章節專屬故事圖，不使用網站截圖、程式 placeholder、抽象背景或重複套版圖。

## 正式圖像

- `source/slide-01.png`：後院枯井、沈曜抹血入雪泥、阿棠持藥渣與舊棉襖。
- `source/slide-02.png`：前堂藥櫃被搜、阿福被逼問、聽星犬聞血味。
- `source/slide-03.png`：廢炭棚追逐、舊棉襖誘餌、炭灰與巡星司追索。
- `source/slide-04.png`：灶房灰燼、聽星犬扒出假木籤、阿棠與巡星司對峙。
- `source/slide-05.png`：北牆裂縫、舊墓坡、沈曜手持銅哨與第二枚木籤。
- `source/slide-06.png`：灰坑備用圖，受傷邊卒與沈曜藏身聽動靜。正式影片時長未超過 25 分鐘，本次未使用。
- `source/social-cover-base.png`：方形社群封面底圖，無嵌字，後續用本機字體排版。

## 聲音與影片設定

- TTS：Edge `zh-TW-YunJheNeural`
- 語速與音高：`--rate=+0%`、`--pitch=-2Hz`
- 背景：雨聲 / 白噪音流程，無旋律音樂
- 解析度：1280x720
- 幀率：24fps
- 時長：1378.128 秒，約 22:58
- 影片圖數：5 張，每張約 275.626 秒

## QA 結果

- `ffprobe`：H.264、1280x720、24fps、yuv420p。
- 檔案大小：約 43.6 MB。
- `volumedetect`：`mean_volume: -25.9 dB`、`max_volume: -6.3 dB`，符合柔和聆聽範圍。
- 字幕：365 cues，最長單行 19 字，無開頭閉合標點，無超過 28 字的字幕行。
- 抽幀檢查：`qa/ch04-frame-contact-sheet.png`，01:00、06:00、11:00、16:00、21:00 畫面均與章節內容相符，字幕未遮擋關鍵人物、狗、銅哨或木籤。
- 縮圖 / IG 圖：使用 `STHeiti Medium.ttc` 本機排字，避免缺字、框內溢出、線條穿字與角落多餘水印。

## 發布紀錄

- YouTube：`https://youtu.be/tRQptgWRX8c`
  - 標題：`《星骸王座》第04章 聽星犬｜有聲書・玄幻長篇`
  - 狀態：Public；YouTube Studio 顯示 `Restrictions: None`。
  - 縮圖：已套用本章 custom thumbnail。
  - 留言：已發布並置頂前 3 章與官網導流留言。
- Instagram：`https://www.instagram.com/tianshu_novel/p/DZaWud1mSmD/`
  - 使用 `output/instagram-promo.png`，profile 貼文數由 3 增加為 4。
  - 發布前確認分享到 Threads / Facebook 的兩個開關皆為 `false`，避免同步貼文。
  - 發布後確認 caption 包含第 04 章文案、YouTube 搜尋導流與 hashtag。
- Threads：`https://www.threads.com/@tianshu_novel/post/DZaUs7lk0D2`
  - 獨立發布第 4 章宣傳文字。
  - 已確認 permalink 內容包含第 4 章文案與 YouTube link preview / `tRQptgWRX8c` 連結。
- Facebook：`https://www.facebook.com/61590406722346/posts/122107784865346890`
  - 透過 Meta Business Suite 發布。
  - 發布前確認 Post to 僅選 Facebook page，Instagram 未選取；ad、scheduled time、story、boost 皆未啟用。
  - 發布後確認 permalink 包含第 04 章文案、`缺頁名簿` 與 `https://youtu.be/tRQptgWRX8c`。

## 製作注意

- 第一次長文 TTS 遇到 `edge_tts.exceptions.NoAudioReceived`，並留下 0B `.mp3` 與 `.vtt`。處理方式是先測短句 voice 是否恢復，再刪除 0B 半成品重跑完整流程。本次重跑成功。
- Chrome extension 直接 `setFiles` 上傳 IG 圖時被本機檔案權限擋下；改用 Chrome 前景分頁與系統選檔流程完成，未更改 extension 權限。
- 第 4 章通過後，才可依同樣單章流程進入第 5 章。
