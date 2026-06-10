# 第05篇 阿棠的手製作紀錄

## 目標

- 短片主軸是「阿棠不是被救，她主動伸手進死局」。
- 不做章節摘要，不把阿棠做成戀愛向被保護角色。
- 讓 BookTok/Reels 類受眾先感到角色張力，再導到官網。

## 創作判斷

- 開頭不用「女主」這種平台套路詞，改為「她不是等人救的人」，避免廉價標籤。
- 沈曜與阿棠的情緒線落在「別替我收手」與「互留活路」，不是告白或救美。
- 視覺重心從手、乾板、藥門、舊簍、苦灰一路推進，讓每張圖有因果而非平行氛圍展示。
- 程母舊簍只當壓力來源，不在短片裡講穿生死或完整身世。

## 聲音設定

- 基底旁白：`zh-TW-HsiaoChenNeural`。
- 阿棠：`zh-TW-HsiaoYuNeural`，僅用兩段角色台詞。
- 白路記手人：`zh-TW-YunJheNeural`，使用完整自然句降低 TTS 失敗風險。
- 字幕由每段 TTS 實際 ffprobe 時長自動生成，不沿用固定時間軸。

## 圖像設定

- 11 張敘事圖使用 OpenAI image generation 產出，已複製到本篇 `source/images/`。
- 第 12 張 CTA 用本機 Pillow 生成，避免 AI 亂字。
- 圖像風格維持冷硬邊境、灰藍雪夜、藥灰與舊簍，不使用明亮奇幻或紫色霓虹。

## 待驗證

- build 後確認 1080x1920、30fps、SAR 1:1、DAR 9:16。
- 確認 voice track 沒被 `-t` 截斷。
- 確認男聲段與阿棠聲線段後字幕同步。
- 確認 CTA 停留至少 6 秒且無 burned-in subtitle。

## 最終驗證

- 成品：`output/星骸王座-短影音-第05篇-阿棠的手-1080x1920.mp4`。
- 影片：74.000 秒，1080x1920，30fps，SAR 1:1，DAR 9:16。
- 音訊：74.000 秒；voice source 68.800 秒，未被截斷。
- 音量：mean -22.3 dB，max -7.1 dB。
- QA contact sheet：`qa/atang-hand-video-contact-sheet.png`。
- 字幕：由每段 TTS 實際時長生成；CTA end card 本身無 burned-in subtitle。

## 本篇修正記錄

- 第一次 build 擋下 voice 77.944 秒超過 74 秒，未硬截音。
- 第二次改為收短文案，不拉長也不加速到不自然；最終 voice 68.800 秒。
