# 第03篇 樓下未醒短影音製作紀錄

## 製作定位

- 本支偏懸疑微短劇，不做玄幻設定介紹。
- 單一事件：第七欄需要一個「樓下未醒」的乾淨現場，沈曜反制方法不是拔刀，而是把整條巷子叫醒。
- 開頭鉤子：`半夜最怕的，不是有人敲門。是樓下太安靜。`

## 規格

- Resolution: 1080x1920
- Aspect ratio: 9:16
- Frame rate: 30 fps
- Target duration: about 64.5 seconds
- Main images: 10 story frames plus 1 CTA end card
- Output: `output/星骸王座-短影音-第03篇-樓下未醒-1080x1920.mp4`

## 聲音設計

- 基底旁白：`zh-TW-HsiaoChenNeural`
- 冷流程男聲：`zh-TW-YunJheNeural`, `rate=-2%`, `pitch=-2Hz`
- 周嬸角色女聲：`zh-TW-HsiaoYuNeural`, `rate=+2%`, `pitch=-4Hz`
- 周嬸是明確女性角色，第二女聲只用於該角色一句台詞，不作旁白替代。

## 視覺設計

- 前半以冷藍、空巷、白紙、門縫建構「太安靜」。
- 中段轉入灶火、周嬸、阿福、蔥豆腐與街坊聲，色溫由冷轉暖。
- 結尾用被弄髒的白紙與醒樓 CTA，讓主題落在「普通人都醒著」。

## QA 要點

- 檢查男聲流程段與周嬸女聲段字幕同步。
- 檢查 CTA 後不疊字幕，URL 與搜尋詞可讀。
- 檢查 voice source 未被 MP4 截斷。

## 2026-06-09 最終輸出

- Output: `output/星骸王座-短影音-第03篇-樓下未醒-1080x1920.mp4`
- Video: 1080x1920, 30fps, SAR 1:1, DAR 9:16, duration 64.500s.
- Audio: AAC mono 24000Hz, duration 64.500s.
- Voice source: `voice/edge-acted-narration.m4a`, duration 64.168s; final MP4 沒有截斷旁白。
- Mix volume: mean `-21.9 dB`, max `-7.0 dB`; no clipping.
- QA contact sheet: `qa/awake-downstairs-contact-sheet.png`.
- Subtitle cutoff: 56.62s，CTA 段保持乾淨。
- TTS 修正：`zh-TW-YunJheNeural` 對簿冊式短語 `樓下未醒，現場乾淨` 不穩，已改成自然句 `樓下還沒醒。現場太乾淨，可以收尾了。`

## 2026-06-10 Review 重建

- 問題：周嬸使用 `zh-TW-HsiaoYuNeural` 太年輕、太乾淨，聽起來像 AI；旁白也有 `這幾個字的意思很冷` 這類解釋腔。
- 修正：周嬸改用 `zh-TW-HsiaoChenNeural`、`rate=+8%`、`pitch=-8Hz`，台詞改成 `都起來！燈點上，水燒開，誰也別裝睡。`
- 文案收短：刪掉多餘解釋與過長 CTA，讓 end card 承擔導流資訊。
- Build 修正：加入 final encode 前 voice duration 檢查。曾抓到 voice 65.416s > video 60.000s，已重寫並修正。
- Review output：video 60.000s，audio 60.000s，voice 58.048s，1080x1920，30fps，SAR 1:1，DAR 9:16。
- QA contact sheet：`qa/awake-downstairs-recut-contact-sheet.png`。
