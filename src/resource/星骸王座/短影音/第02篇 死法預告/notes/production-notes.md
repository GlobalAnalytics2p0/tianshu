# 第02篇 死法預告短影音製作紀錄

## 製作定位

- 本支不做章節摘要，而是打一個高概念事件：沈曜修煉前先看見自己的死法，必須在預告成真前改路。
- 文案避免「作品介紹」與抽象設定解說，改用雪地死影、黑棺、星核警告、追兵遠燈、割斷命線來承接。
- 目標受眾是沒有耐心的短影音觀眾；前三秒直接給異常句：`修煉前，他先看見死法。`

## 規格

- Resolution: 1080x1920
- Aspect ratio: 9:16
- Frame rate: 30 fps
- Target duration: about 62 seconds
- Main images: 11 story frames plus 1 CTA end card
- Output: `output/星骸王座-短影音-第02篇-死法預告-1080x1920.mp4`

## 聲音設計

- 基底旁白：`zh-TW-HsiaoChenNeural`
- 星核警告：`zh-TW-YunJheNeural`
- 追兵喊話：`zh-TW-YunJheNeural`
- 不使用第二女聲當旁白替代；旁白切回時固定回到 `zh-TW-HsiaoChenNeural`。
- 男聲台詞寫成完整句，避免 Edge TTS 對極短句發生 `NoAudioReceived` 或節奏不穩。

## 視覺設計

- 先使用已生成的「死亡預告綜合鉤子」作前三秒核心畫面。
- 補 4 張承接動作圖：手按雪面、星核警告、追兵遠燈、回頭選擇。
- 最終 `frame-01` 到 `frame-11` 按影片順序重新整理，讓 build script 不需額外 mapping。
- `frame-12` 是本地產生的 CTA end card，使用 `STHeiti Medium.ttc` 確認中文可讀。

## 授權音樂

- 使用第 01 篇已保存授權資料的 `Darkling-Kevin-MacLeod.mp3`。
- License: Creative Commons: By Attribution 3.0 License.
- 音樂只做低音量 bed，不蓋過人聲；輸出後必須跑 `volumedetect`。

## QA 要點

- Build script 會用實際 TTS segment duration 動態生成 ASS/SRT，避免男聲後字幕漂移。
- Contact sheet 必須抽樣：前三秒 hook、星核男聲、追兵男聲、回女旁白、CTA end card。
- CTA end card 至少停留 7 秒，不疊字幕，確保官網與搜尋詞可讀。
