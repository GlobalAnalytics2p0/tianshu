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
- 開始大量生成前先做 GitHub 預檢，不要只看 remote 是否存在。標準做法是先跑 `node scripts/check-publish-state.mjs --auto-publish-if-ahead`：
  - 若 branch 已經 `ahead > 0` 且遠端可達，先清掉 deferred publish debt，再開始新內容。
  - 若 branch `ahead > 0` 但遠端不可達，必須把「網站仍停在舊版」當成顯式 blocker 寫進記錄與回報。
  - 若 branch `behind > 0`，先處理分支分歧，不要直接生成新內容。
  - 若 branch 同步但 `origin` 不可達，才能進入明確標註為 local-only 的這一輪。
- 若沒有跑上面的腳本，至少也要確認 `origin` 存在，並用 `git ls-remote --exit-code origin HEAD` 檢查遠端與 SSH/auth 是否正常。這一步失敗時，要明確回報 blocker，不要等到全部寫完才發現無法提交。
- 生成前必須由內容創作者規則刷新連貫性。
- 成功後更新章節 `.txt`、`src/resource/manifest.json`、相關狀態檔與對應 `反思.md`（如內容創作者有新的耐久回饋要落檔）。
- 驗證通過後才 commit 並 push。
- `commit created`、`push succeeded`、`raw GitHub updated`、`GitHub Pages live manifest updated` 是四個不同狀態。沒有通過最後一關前，不得宣稱網站已更新。
- push 後必須執行 `node scripts/verify-site-publication.mjs`。這支腳本會檢查：
  - 當前 branch 是否與 upstream 完全同步，沒有 local-only commit。
  - `raw.githubusercontent.com` 的 `src/resource/manifest.json` 是否已等於本地 manifest。
  - 自訂網域或 GitHub Pages 網址實際送出的 `manifest.json` 是否已等於本地 manifest。
- 若 `node scripts/verify-site-publication.mjs` 失敗，回報必須明確區分：
  - `ahead > 0`：內容還在本地，根本沒有完整發佈。
  - raw GitHub 已更新但 live site 未更新：屬於 Pages/CDN 部署延遲，不能說已上站，只能說已 push、等待站點生效。
  - remote/auth 失敗：屬於發佈 blocker，不能把本地完成誤報成網站完成。
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

## Repository 清潔

- 移除 `.DS_Store`、暫存檔、舊版中間輸出、可重建 cache。
- 不刪除 canonical 章節 `.txt`、`manifest.json`、角色手冊、素材企劃檔、縮圖、字幕與必要製作紀錄。
- 不使用破壞性 git 指令回復使用者或前一輪 Agent 的變更。

## 與其他角色交接

- 向內容創作者確認：章節是否已鎖定、是否可發布、manifest metadata 是否正確。
- 向社群總監提供：最終影片 URL、縮圖路徑、IG 圖輸出路徑、官網連結。
- 重大系統規則或部署限制要回寫 `agent.md` 與本手冊。
