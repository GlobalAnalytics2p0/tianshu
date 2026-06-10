# 第04篇 活手亂槽短影音製作紀錄

## 製作定位

- 單一事件：第七欄要認一隻手，沈曜讓整條巷子的手一起伸出來。
- 這支主打群體反制，不做主角個人帥照堆疊。
- 開頭鉤子：`他們要認一隻手。沈曜叫來整條巷子的手。`

## 規格

- Resolution: 1080x1920
- Aspect ratio: 9:16
- Frame rate: 30 fps
- Target duration: 70 seconds
- Main images: 10 story frames plus 1 CTA end card
- Output: `output/星骸王座-短影音-第04篇-活手亂槽-1080x1920.mp4`

## 聲音設計

- 基底旁白：`zh-TW-HsiaoChenNeural`
- 敵方男聲：`zh-TW-YunJheNeural`, `rate=-2%`, `pitch=-2Hz`
- 周嬸角色女聲：`zh-TW-HsiaoYuNeural`, `rate=+2%`, `pitch=-4Hz`

## 視覺設計

- 前段：一隻手與許多手的強對比。
- 中段：乾板、灰頁、東槽、周嬸拖板、阿棠撒粉、阿福潑灰水。
- 後段：亂紋爆開與灰頁被毀，給出短影音局部爽點。

## QA 要點

- 抽樣檢查男聲敵方段、周嬸女聲段、亂紋爆開段與 CTA。
- 檢查 voice source 未被 MP4 截斷。
- 檢查 SAR 1:1、DAR 9:16。

## 2026-06-09 最終輸出

- Output: `output/星骸王座-短影音-第04篇-活手亂槽-1080x1920.mp4`
- Video: 1080x1920, 30fps, SAR 1:1, DAR 9:16, duration 70.000s.
- Audio: AAC mono 24000Hz, duration 70.000s.
- Voice source: `voice/edge-acted-narration.m4a`, duration 63.304s; final MP4 沒有截斷旁白。
- Mix volume: mean `-22.1 dB`, max `-6.8 dB`; no clipping.
- QA contact sheet: `qa/living-hands-contact-sheet.png`.
- Subtitle cutoff: 60.95s，CTA 段保持乾淨。
- 製作注意：第 4 支視覺成敗取決於群體手勢，不要把後續同類題材拍成主角單人海報。

## 2026-06-10 Review 重建

- 問題：周嬸同樣使用 `zh-TW-HsiaoYuNeural`，聲線偏年輕，和畫面裡大嬸拖板的粗糙感不合。
- 修正：周嬸改用 `zh-TW-HsiaoChenNeural`、`rate=+8%`、`pitch=-8Hz`，台詞改為 `都按！誰的手沒做過活？讓它認個夠。`
- 文案收短：刪掉較說明式句子，改成更直接的現場動作。
- Build 修正：加入 final encode 前 voice duration 檢查。
- Review output：video 64.000s，audio 64.000s，voice 59.128s，1080x1920，30fps，SAR 1:1，DAR 9:16。
- QA contact sheet：`qa/living-hands-recut-contact-sheet.png`。
