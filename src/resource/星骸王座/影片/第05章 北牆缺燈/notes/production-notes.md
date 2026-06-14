# 星骸王座 第05章 北牆缺燈 影片製作紀錄

## 產出狀態

- 製作日期：2026-06-09
- 章節文章：`src/resource/星骸王座/文章/第05章 北牆缺燈.txt`
- 正式影片：`src/resource/星骸王座/影片/第05章 北牆缺燈/output/星骸王座-第05章 北牆缺燈-字幕有聲書-720p.mp4`
- 字幕：`src/resource/星骸王座/影片/第05章 北牆缺燈/subtitles/星骸王座-第05章 北牆缺燈.srt`
- YouTube 縮圖：`src/resource/星骸王座/影片/第05章 北牆缺燈/thumbnails/星骸王座-第05章-北牆缺燈-thumbnail.png`
- IG 宣傳圖：`src/resource/星骸王座/影片/第05章 北牆缺燈/output/instagram-promo.png`
- 本章已上傳 YouTube，並已在 Instagram、Threads、Facebook 各自發布宣傳。

## 視覺 Brief

本章視覺核心是北牆缺燈、半塌石溝、拴棺棚、裴照川半冊影、少指送棺人、星砂灰，以及阿棠在天亮前的低燈接應。最終使用 Image 2 生成章節專屬故事圖，不沿用第 4 章牆角犬圖，不使用網站截圖、程式 placeholder、抽象背景或套版圖。

## 正式圖像

- `source/slide-01.png`：北牆裂口、犬印、熄滅風燈與遠方拴棺棚。
- `source/slide-02.png`：拴棺棚內，沈曜潛伏觀察，裴照川抱冊，灰背犬倒地，少指送棺人收尾。
- `source/slide-03.png`：沈曜用細鐵鑿與柱木地形對抗少指送棺人的短刀。
- `source/slide-04.png`：星砂灰從棚底黑縫爆開，少指送棺人借灰退走。
- `source/slide-05.png`：裴照川指向木槽裡的半冊影與紙角，沈曜壓住傷勢問話。
- `source/slide-06.png`：阿棠持布罩藥盞接應，沈曜扶裴照川沿石溝撤離。
- `source/social-cover-base.png`：方形社群封面底圖，無嵌字，重點為缺燈、薄冊與沈曜取證。

## 聲音與影片設定

- TTS：Edge `zh-TW-YunJheNeural`
- 語速與音高：`--rate=+0%`、`--pitch=-2Hz`
- 背景：雨聲 / 白噪音流程，無旋律音樂
- 解析度：1280x720
- 幀率：24fps
- 時長：1268.808 秒，約 21:08
- 影片圖數：6 張，每張約 211.468 秒
- 本章使用 `--reuse-tts --slide-count 6` 重渲染。原因：預設 5 張圖版本尾段沒有切到阿棠接應圖，與尾段內容不夠貼合。

## QA 結果

- `ffprobe`：H.264、1280x720、24fps、yuv420p。
- 檔案大小：約 40.3 MB。
- `volumedetect`：`mean_volume: -25.8 dB`、`max_volume: -6.5 dB`，符合柔和聆聽範圍。
- 字幕：336 cues，最長單行 19 字，無開頭閉合標點，無超過 28 字的字幕行。
- 抽幀檢查：`qa/ch05-frame-contact-sheet.png`，01:00、05:00、09:00、13:00、17:00、20:00 畫面均與章節內容相符。20:00 已切到阿棠接應圖。
- 縮圖 / IG 圖：使用 `STHeiti Medium.ttc` 本機排字，未遮擋沈曜臉部、熄滅風燈、紙角或薄冊；無框內溢出、線條穿字與角落水印。

## 發布紀錄

- YouTube：`https://youtu.be/FtCvL7vZH6I`
  - 標題：`《星骸王座》第05章 北牆缺燈｜有聲書・玄幻長篇`
  - 狀態：Public；YouTube Studio 顯示 `Restrictions: None`。
  - 縮圖：已套用本章 custom thumbnail。
- Instagram：`https://www.instagram.com/tianshu_novel/p/DZbYfDTmYQk/`
  - 使用 `output/instagram-promo.png`，profile 貼文數由 4 增加為 5。
  - 發布後確認 caption 包含第 05 章文案、YouTube 搜尋導流、官網 bio 導流與 hashtag。
  - Meta Business Suite Content 列表顯示為獨立 Instagram 貼文列，ID `18083425769543576`。
- Threads：`https://www.threads.com/@tianshu_novel/post/DZbXxmzE_Tp`
  - 獨立發布第 5 章宣傳文字。
  - 已確認 permalink 內容包含第 5 章文案與 `https://youtu.be/FtCvL7vZH6I` 連結。
  - 發布後檢查 Threads profile，未出現 IG caption 的同步重複貼文。
- Facebook：`https://www.facebook.com/61590406722346/posts/122108123313346890`
  - 透過 Meta Business Suite 發布。
  - 發布前確認 Post to 僅選 Facebook page，Instagram 未選取；Set date and time、Share to Facebook Story、Boost 皆為 `false`。
  - 發布後確認 permalink 包含第 05 章文案、`待補` 與 `https://youtu.be/FtCvL7vZH6I`。
  - Meta Business Suite Content 列表顯示 Facebook row ID `122108123313346890` 與 Instagram row 分離，未以 IG 同步取代 Facebook 獨立貼文。

## 製作注意

- 章節圖若有多個明確劇情段落，不應只依 5 分鐘規則機械取圖。當尾段內容需要獨立畫面時，使用 `--slide-count` 指定章節實際需要的圖數，並重新抽幀確認尾段對齊。
- Instagram 圖片上傳沿用原生 macOS file picker 與 `/tmp/tianshu-upload/xinghai-wangzuo-ch05-instagram.png`；未更改 Chrome extension 權限。
- 第 5 章通過後，才可依同樣單章流程進入第 6 章。
