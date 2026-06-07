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

## 品牌與 YouTube 資產

- `public/assets/tianshu-icon.png`：網站 favicon、頁面品牌 mark、可直接上傳的 800x800 YouTube 頻道頭像。
- `public/assets/tianshu-banner.png`：可直接上傳的 2560x1440 YouTube 頻道橫幅。
- YouTube icon/banner 資產只保留 PNG，不保留 SVG 或背景拆檔。
- 視覺方向：霧面紙感、文青書房、低彩度，不使用亮晶晶或高光 AI 風格。
- 頻道名稱建議：`天書小說`
- 頻道 Handle：`@tianshunovel`

每日 09:00 的 Codex Automation 會負責更新 AI 原創章節；章節目標長度為 4,000-5,000 字，最低應超過 1,000-2,000 字，並保留章末鉤子與下一章懸念。

## 影片產出

影片製作預設使用本機 FFmpeg 流程：背景遊戲畫面循環、小說旁白音檔、字幕合成。每本小說與每個章節的影片安排應放在各自資料夾，例如 `video-resource/<小說名>/<章節名>/`。

輸出影片至少需為 720p，也就是最低 1280x720；素材允許時優先使用 1080p。音檔與影片檔屬於本機大型產物，不上傳 GitHub，已透過 `.gitignore` 排除。
