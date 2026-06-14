# 第17篇 灰架記底製作紀錄

## 2026-06-11 初版

- 定位：活人還沒被問，你家的簍底已經被掛上架。
- 參考章節：第17章 灰架記底。
- 結構：異常鉤子、流程壓近、角色出手、局部反轉、CTA。
- 背景音：完全移除。主檔不使用 Creative Commons、royalty-free 或外部完整曲目，避免 TikTok/抖音內容指紋靜音。
- 旁白：基底女聲 `zh-TW-HsiaoChenNeural`；男性台詞使用 `zh-TW-YunJheNeural`；女性角色台詞仍用基底女聲微調 rate/pitch，避免第二女聲造成 AI 感。
- 同步：build script 依每段 Edge TTS 實際 duration 動態生成 ASS/SRT，並在 final encode 前檢查 voice source 不得超過影片長度。
- 視覺：3 張 AI key art 存於 `source/key-art/`，12 張直式 frame 存於 `source/images/`；所有 frame 為本篇專用。
- 本篇聲音切換：zh-TW-HsiaoChenNeural, zh-TW-YunJheNeural。

## 2026-06-11 最終驗收

- Output: `output/星骸王座-短影音-第17篇-灰架記底-1080x1920.mp4`。
- Video: 60.000s，`1080x1920`，SAR `1:1`，DAR `9:16`，`30/1`。
- Audio: 60.000s，`aac`，`24000Hz`，channels `1`。
- Voice source: 53.216s；subtitle latest end 52.420s；CTA 6 秒保持無字幕導流頁。
- Mix volume: mean `-23.1 dB`，max `-6.7 dB`；no clipping。
- Background music check: 主檔無背景音，build script 未引用外部音樂、混音背景音或歷史曲名。
- QA: `qa/contact-sheet.png` 已產出並抽查；字幕在手機安全區內，CTA frame 可讀。
