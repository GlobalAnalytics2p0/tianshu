# 天書小說 AI 劇場靜態首頁

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

- `public/assets/tianshu-mark.svg`：網站 favicon、頁面品牌 mark、YouTube 頻道頭像方向。
- `public/assets/youtube-channel-banner.svg`：YouTube 頻道橫幅方向，版面採 2560x1440，可保留中心安全區內容。
- 頻道名稱建議：`天書小說 AI 劇場`
- 頻道 Handle 建議：`@TianshuNovel`

每日 09:00 的 Codex Automation 會負責更新 AI 原創章節；章節目標長度為 4,000-5,000 字，最低應超過 1,000-2,000 字，並保留章末鉤子與下一章懸念。
