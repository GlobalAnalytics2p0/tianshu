# 第12篇 東槽回認製作紀錄

## 2026-06-11 初版

- 定位：他們不認臉，只認手
- 參考章節：第12章 東槽回認, 第13章 活手亂槽
- 結構：異常鉤子、流程壓近、人物出手、局部反轉、CTA。
- 背景音：完全移除。主檔不使用 Creative Commons、royalty-free 或外部完整曲目，避免 TikTok/抖音內容指紋靜音。
- 旁白：基底女聲 `zh-TW-HsiaoChenNeural`；男性台詞使用 `zh-TW-YunJheNeural`；周嬸/阿棠台詞仍用基底女聲微調 rate/pitch，避免第二女聲造成 AI 感。
- 同步：build script 依每段 Edge TTS 實際 duration 動態生成 ASS/SRT，並在 final encode 前檢查 voice source 不得超過影片長度。
- 視覺：2 張 AI key art 存於 `source/key-art/`，10 張直式 frame 存於 `source/images/`；所有 frame 為本篇專用。
## 2026-06-11 最終重建驗收

- Output: `output/星骸王座-短影音-第12篇-東槽回認-1080x1920.mp4`。
- Video: 60.000s，`1080,1920,1:1,9:16,30/1`。
- Audio: 60.000s，`aac,24000,1`，無背景音、無外部音樂曲目。
- Voice source: `voice/edge-acted-narration.m4a`，55.328s；final MP4 沒有截斷旁白。
- Mix volume: mean `-22.8 dB`，max `-7.5 dB`；no clipping。
- QA: `qa/contact-sheet.png` 已抽查；第 07-12 批次修正過 frame 1-8 底部內建文案，避免與 ASS 字幕重疊。
- Background music check: build script 未引用 `LICENSED_MUSIC`、`Darkling`、`amix`、`anoisesrc` 或任何 `music/` 輸入；本支主檔只保留人聲與靜音空間。
