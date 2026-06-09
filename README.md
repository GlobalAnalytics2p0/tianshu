# 天書小說靜態首頁

這個版本是純靜態網站，可直接部署到 GitHub Pages，不需要後端服務。

## 本地預覽

```bash
python3 -m http.server 4173
```

開啟 `http://localhost:4173`。

## GitHub Pages

將 `index.html`、`styles.css`、`app.js`、`public/`、`design/` 與 `.nojekyll` 推到 GitHub Pages 指定分支即可。

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

每次 six-hour automation 開始前，先跑 `node scripts/check-publish-state.mjs --auto-publish-if-ahead`。如果前一輪因網路問題留下 local-only commit，這一步會要求先補發佈，避免網站一直停在舊版卻繼續累積新章。

發佈完成的判定不能只看 commit 或 push。six-hour automation 在 push 後必須再跑 `node scripts/verify-site-publication.mjs`，確認本地 manifest、GitHub raw manifest、實際網站 manifest 三者一致，才可回報網站已更新。

## 影片產出

影片製作預設使用本機 FFmpeg 流程：小說章節文字、同次 TTS 旁白時間軸、硬字幕、固定圖切換，以及雨聲白噪音背景。每本小說與每個章節的影片安排應放在小說自己的資料夾，例如 `src/resource/<小說名>/影片/<章節名>/`。

初期輸出使用 720p，也就是 1280x720。音檔與影片檔屬於本機大型產物，不上傳 GitHub，已透過 `.gitignore` 排除；字幕、縮圖與製作紀錄可以保留在章節影片資料夾中。
