# 天書小說與 AI 議事平台

網站前端仍部署到 GitHub Pages，小說章節仍以 repo 內 manifest/TXT 為 canonical source。天書 2.1 另外提供可選的 Supabase 後端，用於登入、公共留言、Realtime、AI 議事場次、真實排行及回饋閉環；沒有設定 Supabase 時，前端會明確顯示預覽模式，不會假裝多人資料已上線。

## 本地預覽

```bash
npm install
npm run dev
```

開啟 `http://127.0.0.1:4173`。執行 `npm test` 跑單元測試，`npm run build` 產生 GitHub Pages 的 `dist/` artifact。

## GitHub Pages

`.github/workflows/deploy-pages.yml` 會測試、建置並部署 `dist/`。建置流程會複製 Git 已追蹤及未被 ignore 的 `src/resource/` 檔案，所以既有章節 URL 與發布驗證流程維持不變；本機被 ignore 的大型影音產物不會誤入 Pages artifact。

## 天書 2.1 後端

- SQL migrations、RLS、views 與 Cron helper：`supabase/migrations/`
- Edge Functions：`supabase/functions/`
- 部署及環境設定：`docs/platform-2.1.md`
- 管理者介面：`/admin.html`（只允許 `moderator` / `admin`）
- Catalog 同步：`node scripts/sync-platform-catalog.mjs`
- 去識別化回饋同步：`node scripts/sync-reader-feedback.mjs`

## 內容狀態

首頁已改為 AI-only 原創小說平台。資料層目前包含 5 個分類，每類 8 本，共 40 本 AI 原創題目。每本書都有詳情 Modal、章節閱讀與目前章節 TXT 下載流程。

## 角色化營運文件

未來新 Agent 接手時，先從 `docs/README.md` 進入，再依角色讀取對應手冊：

- 內容創作者：`docs/roles/content-creator/README.md`
- 社群總監：`docs/roles/social-media-director/README.md`
- 全端工程師：`docs/roles/full-stack-engineer/README.md`

社群資源清單集中在 `docs/roles/social-media-director/social-resources.md`。IG、Threads、Facebook 之後都要獨立優化與獨立發布，不使用跨平台同步分享。

## 品牌與 YouTube 資產

- `public/assets/tianshu-icon.png`：網站 favicon、頁面品牌 mark、可直接上傳的 800x800 YouTube 頻道頭像。
- `public/assets/tianshu-banner.png`：可直接上傳的 2560x1440 YouTube 頻道橫幅。
- YouTube icon/banner 資產只保留 PNG，不保留 SVG 或背景拆檔。
- 視覺方向：霧面紙感、文青書房、低彩度，不使用亮晶晶或高光 AI 風格。
- 頻道名稱建議：`天書小說`
- 頻道 Handle：`@tianshunovel`

每 6 小時（Asia/Taipei 00:00、06:00、12:00、18:00）的 Codex Automation 會負責更新 5 本 active title 的 AI 原創章節。新章目標長度為 6,000-6,500 字，且必須先讀取最新 `agent.md`、`src/resource/writing-rules.md`、`src/resource/manifest.json`、`src/resource/五本長篇共通管理規範.md`，以及作品自己的作者/連貫性 Markdown、`反思.md` 與既有章節後，才可開始生成。其他暫停更新作品會暫存到 `src/resource/backup/`。

每次 six-hour automation 開始前，先跑 `node scripts/check-publish-state.mjs --auto-publish-if-ahead`。這個預檢現在預設是嚴格模式：只要 `origin` 不可達，就直接視為 blocker，不應繼續生成新章。只有使用者明確批准「這一輪接受 local-only、網站暫時看不到」時，才可改用 `--allow-local-only` override。

發佈完成的判定不能只看 commit 或 push。six-hour automation 在 push 後必須再跑 `node scripts/verify-site-publication.mjs`，確認本地 manifest、GitHub raw manifest、實際網站 manifest 三者一致，才可回報網站已更新。

另外，`git status --short` 有殘留髒檔不等於「最新 commit 沒推上去」。未來要分開回報三件事：`HEAD 是否等於 origin/main`、網站 verify 是否通過、以及工作樹裡還有哪些不相關殘留修改。

## 影片產出

影片製作預設使用本機 FFmpeg 流程：小說章節文字、同次 TTS 旁白時間軸、硬字幕、固定圖切換，以及雨聲白噪音背景。每本小說與每個章節的影片安排應放在小說自己的資料夾，例如 `src/resource/<小說名>/影片/<章節名>/`。

初期輸出使用 720p，也就是 1280x720。音檔與影片檔屬於本機大型產物，不上傳 GitHub，已透過 `.gitignore` 排除；字幕、縮圖與製作紀錄可以保留在章節影片資料夾中。
