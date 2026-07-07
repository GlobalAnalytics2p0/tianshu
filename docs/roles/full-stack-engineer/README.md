# 全端工程師上任手冊

## 職責

全端工程師負責讓天書平台可部署、可讀取內容、可自動更新、可產出有聲書與影片。核心原則是維持 GitHub Pages 友善的純靜態網站，同時保護大型本機產物不要進 GitHub。

## 必讀順序

1. `agent.md`
2. `README.md`
3. `.gitignore`
4. `src/resource/manifest.json`
5. `app.js`
6. `scripts/build-audiobook-chapter-video.py`
7. `scripts/generate-openai-audiobook.mjs`
8. 當次作品的 `影片/`、`有聲書/`、`素材/` 製作紀錄

## 靜態網站架構

- 根目錄 `index.html`、`styles.css`、`app.js` 是 GitHub Pages 直接部署面。
- `app.js` 從 `src/resource/manifest.json` 載入書籍資料，再讀各章節 `.txt`。
- 不要把小說正文寫回 `app.js`。
- 本地預覽使用 `python3 -m http.server 4173`，用 `http://localhost:4173` 開啟，不要用 `file://` 測試 fetch 行為。
- GitHub Pages 上不會遇到 `file://` 的 CORS/fetch 問題，因為它會透過 HTTP(S) 提供靜態檔。

## Automation 與 Git

- 每 6 小時 Asia/Taipei（00:00、06:00、12:00、18:00）的更新目標是五本 active title，各新增一章可行時 6,000-6,500 字。
- 六小時流程的總入口是 `node scripts/supervise-ai-flow.mjs`。它負責把 GitHub 預檢、deferred publish debt catch-up、本地品質驗證、發布後驗站與檢討紀錄串成同一個閉環。
- 每輪標準 gate：
  - 生成前：`node scripts/supervise-ai-flow.mjs --phase preflight --write-ledger`。只有 decision 是 `ready-for-generation` 才進入內容生成。
  - 生成後、commit 前：`node scripts/supervise-ai-flow.mjs --phase post-generation --write-ledger`。只有 decision 是 `ready-to-publish` 才能 commit/push。
  - push 後：`node scripts/supervise-ai-flow.mjs --phase post-publish`。只有 decision 是 `published-and-verified` 才能對外回報網站已更新；這一步不要加 `--write-ledger`，避免驗站後又產生未提交變更。
- Supervisor 會把最新機器可讀報告寫到 `tmp/automation-supervision/latest.json`，並把可持續檢討紀錄寫到 `src/resource/automation-supervision-log.md`。`tmp/automation-supervision/` 是暫存，不提交；ledger 是耐久檢討檔，可提交。
- 若 supervisor decision 是 `blocked`，不要繞過它。先處理 `hardIssues` 與 `nextActions`，或把 blocker 清楚回報；警示 `warnings` 不一定阻斷，但必須轉成下一輪寫作或修稿目標。
- 若 decision 是 `resume-generation`，表示 `tmp/automation-supervision/active-batch.json` 已證明 dirty active content 屬於同一個 automation 批次；只生成 `missingTitles`，不可重寫已完成 title。若是 `resume-validation`，五本都已存在，只重跑 post-generation gate，不得再生成。這兩種恢復決策都不代表可發布，仍須等 `ready-to-publish`。
- preflight 驗的是「上一個已提交版本是否上站」，必須使用 `node scripts/verify-site-publication.mjs --expected-ref HEAD`；push 後驗站才使用預設的 working-tree manifest。兩者不可混用，否則 partial batch 的未提交 manifest 會被錯拿去比對上一版正式站。
- active batch 期間若另有使用者明確授權、且已通過驗證的舊章修訂需要共存，可用 `node scripts/automation-batch-state.mjs --register-coexisting --reason <原因> --path <路徑>...` 登記。這不是自動收編髒檔：工具會保存逐檔 SHA-256，任何未登記路徑或登記後內容變動都會再次阻擋。沒有使用者明確授權不得登記；能先完成／提交原批次時，優先避免共用工作樹交錯。
- 開始大量生成前先做 GitHub 預檢，不要只看 remote 是否存在。標準做法是先跑 `node scripts/check-publish-state.mjs --auto-publish-if-ahead`：
  - 若 branch 已經 `ahead > 0` 且遠端可達，先清掉 deferred publish debt，再開始新內容。
  - 若 branch `ahead > 0` 但遠端不可達，必須把「網站仍停在舊版」當成顯式 blocker 寫進記錄與回報。
  - 若 branch `behind > 0`，先處理分支分歧，不要直接生成新內容。
  - 若 branch 同步但 `origin` 不可達，預設也要直接停下。只有使用者明確批准本輪接受網站不可見時，才可改用 `node scripts/check-publish-state.mjs --auto-publish-if-ahead --allow-local-only` 進入例外 local-only 流程。
- 若沒有跑上面的腳本，至少也要確認 `origin` 存在，並用 `git ls-remote --exit-code origin HEAD` 檢查遠端與 SSH/auth 是否正常。這一步失敗時，要明確回報 blocker，不要等到全部寫完才發現無法提交。
- 生成前必須由內容創作者規則刷新連貫性。
- 成功後更新章節 `.txt`、`src/resource/manifest.json`、相關狀態檔與對應 `反思.md`（如內容創作者有新的耐久回饋要落檔）。
- 驗證通過後才 commit 並 push。
- `commit created`、`push succeeded`、`raw GitHub updated`、`GitHub Pages live manifest updated` 是四個不同狀態。沒有通過最後一關前，不得宣稱網站已更新。
- push 後必須執行 `node scripts/verify-site-publication.mjs`。這支腳本會檢查：
  - 當前 branch 是否與 upstream 完全同步，沒有 local-only commit。
  - `raw.githubusercontent.com` 的 `src/resource/manifest.json` 是否已等於本地 manifest。
  - 自訂網域或 GitHub Pages 網址實際送出的 `manifest.json` 是否已等於本地 manifest。
  - 正式首頁是否引用可存取的 Vite hashed JavaScript bundle，且沒有退回原始 `/app.js`。
- 這個驗證必須在 `git push` 成功返回之後才執行，不可與 push 並行。否則 verifier 看到的 `ahead > 0` 只是 push 尚未完成中的中間態，會造成假性「未發佈」失敗。
- 若 `node scripts/verify-site-publication.mjs` 失敗，回報必須明確區分：
  - `ahead > 0`：內容還在本地，根本沒有完整發佈。
  - raw GitHub 已更新但 live site 未更新：屬於 Pages/CDN 部署延遲，不能說已上站，只能說已 push、等待站點生效。
  - remote/auth 失敗：屬於發佈 blocker，不能把本地完成誤報成網站完成。
- 工作樹 dirty 與 publish 狀態是兩件事。遇到「看起來又沒推」的質疑時，先用 `git rev-parse HEAD`、`git rev-parse origin/main`、`git rev-list --left-right --count @{upstream}...HEAD` 判定 branch sync，再用 `node scripts/verify-site-publication.mjs` 判定站點狀態，最後才另外列出殘留 dirty paths。不要把不相關短影音或素材髒檔誤報成未 push。
- `check-publish-state.mjs` 的 active dirty 偵測必須涵蓋五本已遷移作品的 `文章/` 章節與 `素材/` 狀態檔，不得只對 `星骸王座` 使用新路徑、其他作品仍用舊路徑。已驗證的 automation-owned partial batch 回報 `resumable-batch`；沒有 owner、HEAD 不符、章號超出預期或 dirty 路徑不符才回報 `working-tree-publish-debt` 並阻擋。
- 連貫性審核修稿與 writer batch 是兩種不同 owner。審核交接只有在 `state=ready-for-coordinator`、`sourceHead` 等於目前 HEAD、exact dirty paths 與逐檔 SHA-256／刪除 digest 全部吻合時，才能由 `scripts/recovery-handoff-state.mjs` 判定有效。建立交接後要跑 `node scripts/recovery-handoff-state.mjs --seal`；任何額外路徑、digest 漂移或 blocked handoff 都不得自動收編。缺少先前排程章節屬 writer cadence 問題，不應把一批已完成且通過驗證的 continuity repair 誤標成 blocked；沒有 writer active batch 時，writer-only review-receipt gate 應記為不適用並改用該修稿批次的獨立 receipts。
- 流程檢討重點：最容易反覆卡住的不是 Pages，而是「前一輪 local-only commit 沒先補發佈，下一輪又繼續生成」。這種 backlog 不可視為正常狀態；下一次網路恢復時要優先補推並驗站。
- commit 時只 stage 當次意圖內的內容；若起始狀態已有 dirty files，要記錄並避免混入不相關變更。
- `src/resource/backup/` 用來放 35 本暫停更新作品；routine six-hour automation 不應對 backup 內作品做內容改寫。

## 影音產出

- 預設使用本機 FFmpeg 流程，不使用昂貴生成式影片。
- 解析度至少 720p，初期預設 1280x720。
- 章節影片資料夾使用 `src/resource/<作品>/影片/<章節>/`，底下可有 `source/`、`subtitles/`、`output/`、`thumbnails/`、`tmp/`、`notes/`。
- 大型音檔、影片、source、output、tmp、cache 都不提交 GitHub。
- 可提交的通常是腳本、字幕 sidecar、縮圖、製作紀錄與輕量 metadata。
- 正式星骸流程使用 Edge `zh-TW-YunJheNeural`、`--rate=+0%`、`--pitch=-2Hz`，雨聲白噪音背景，字幕由同次 TTS timing 產生。
- 若 Edge TTS 回傳 `NoAudioReceived` 或留下 0B `.mp3` / `.vtt`，先視為失敗半成品，不可用 `--reuse-tts` 帶過。先用同 voice 合成短句確認服務恢復，再刪除 0B 檔案重跑；不要把 macOS `say` 當成可發布替代品。
- `scripts/build-audiobook-chapter-video.py` 支援 `--slide-count`。當預設時長推算的圖數會讓尾段內容停在錯誤畫面時，用 `--reuse-tts --slide-count <圖數>` 重渲染，並重新看 contact sheet。
- `星骸王座` 第 4 章到第 15 章影片必須一章一章做。每章都視為獨立任務：讀正文、定視覺 brief、用 Image 2 產高質感章節圖、檢查圖片、產影片、跑 QA、寫 notes，完成後才進下一章。
- 不可用批次腳本或程式生成低質感 placeholder 圖來交付第 4-15 章；最終 slide、thumbnail、IG 圖都必須是符合章節內容的高質感故事圖。

## Repository 清潔

- 移除 `.DS_Store`、暫存檔、舊版中間輸出、可重建 cache。
- 不刪除 canonical 章節 `.txt`、`manifest.json`、角色手冊、素材企劃檔、縮圖、字幕與必要製作紀錄。
- 不使用破壞性 git 指令回復使用者或前一輪 Agent 的變更。

## 與其他角色交接

- 向內容創作者確認：章節是否已鎖定、是否可發布、manifest metadata 是否正確。
- 向社群總監提供：最終影片 URL、縮圖路徑、IG 圖輸出路徑、官網連結。
- 重大系統規則或部署限制要回寫 `agent.md` 與本手冊。
