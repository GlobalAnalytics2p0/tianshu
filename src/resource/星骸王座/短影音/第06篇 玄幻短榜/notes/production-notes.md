# 第06篇 玄幻短榜製作紀錄

## 目標

- 用 BookTok/Reels 常見的推薦與榜單格式，做《星骸王座》的冷硬玄幻入坑卡。
- 不說「這本書多好看」，改說「看膩無敵開局，換一部開局就被判死的玄幻」。
- 目標互動：收藏、轉給喜歡冷硬玄幻的人，並導向官網搜尋。

## 創作判斷

- 榜單格式容易變成投影片，因此中段穿插劇情感圖：流放、星核、死法、普通人反擊、黑棺銅錢、拆命運。
- 文字卡用 Pillow 生成，確保中文、官網與帳號不亂字。
- 旁白避免使用 `主角`、`這本書`、`設定` 等介紹腔，改用具體鉤子。
- 只放一段男聲星核低語，增加聲音變化但不破壞推薦片節奏。

## 聲音設定

- 基底旁白：`zh-TW-HsiaoChenNeural`。
- 星核低聲：`zh-TW-YunJheNeural`，一句完整自然句。
- 字幕由每段 TTS 實際 ffprobe 時長自動生成。

## 待驗證

- build 後確認 1080x1920、30fps、SAR 1:1、DAR 9:16。
- 確認 voice track 沒被 `-t` 截斷。
- 確認 CTA end card 停留 8 秒且無 burned-in subtitle。
- 確認文字卡在手機安全區內可讀。

## 最終驗證

- 成品：`output/星骸王座-短影音-第06篇-玄幻短榜-1080x1920.mp4`。
- 影片：62.000 秒，1080x1920，30fps，SAR 1:1，DAR 9:16。
- 音訊：62.000 秒；voice source 58.216 秒，未被截斷。
- 音量：mean -22.0 dB，max -7.0 dB。
- QA contact sheet：`qa/ranking-video-contact-sheet.png`。
- CTA：57 秒抽樣已無 burned-in subtitle，end card 可讀。

## 2026-06-10 Review 重建

- 問題：`第一個鉤子`、`第二個鉤子` 這類字眼太像內部企劃稿，旁白 AI 感較重。
- 修正：改成 `理由一`、`理由二`、`理由三`，並收短 `它的爽感不是一路碾` 等句子。
- 節奏：總長由 62s 壓到 58s，CTA 仍保留 8.5s。
- Review output：video 58.000s，audio 58.000s，voice 54.472s，1080x1920，30fps，SAR 1:1，DAR 9:16。
- QA contact sheet：`qa/ranking-recut-contact-sheet.png`。
