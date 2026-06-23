# 天書平台營運文件總覽

本資料夾是給未來 Agent 上任使用的角色入口。新 Agent 不應只讀零散檔案，而應先進入對應角色資料夾，再依照角色手冊讀取必要的 source-of-truth 文件。

## 角色入口

- `docs/roles/content-creator/README.md`：內容創作者。負責小說正文、作者人格、連載狀態、伏筆台帳、對外內容表述。
- `docs/roles/social-media-director/README.md`：社群總監。負責 YouTube、Instagram、Threads、Facebook 的平台化推廣與獨立發布。
- `docs/roles/social-media-director/social-resources.md`：社群資源清單。集中保存目前可用平台、官方連結、素材與發布注意事項。
- `docs/roles/full-stack-engineer/README.md`：全端工程師。負責靜態網站、資料載入、Automation、影音生成腳本、GitHub Pages 與 Git 提交流程。

## 高層原則

- `agent.md` 是全域長期記憶與最高層規則。任何新需求、限制、踩雷紀錄或重要決策都要同步更新。
- 網站維持純靜態，目標部署到 GitHub Pages，不依賴後端服務。
- 小說正文、章節路徑與 manifest 是前端資料層，不要為了整理文件任意移動。
- 影音、音檔、大圖輸出與暫存檔不進 GitHub。可重建的中間檔應清理；不可重建但仍有用途的來源素材要放在作品資料夾內並維持 Git 忽略。
- 社群平台不開同步功能。Instagram、Threads、Facebook、YouTube 各自獨立撰寫、獨立發布、獨立驗證。

## MD 檔職責歸屬

| 類型 | 路徑 | 主要負責角色 |
| --- | --- | --- |
| 全域規則 | `agent.md` | 全角色共同維護，高層決策優先 |
| 專案說明 | `README.md` | 全端工程師 |
| 寫作規則 | `src/resource/writing-rules.md` | 內容創作者 |
| 五本長篇管理 | `src/resource/五本長篇共通管理規範.md` | 內容創作者 |
| Automation 閉環監督 | `src/resource/automation-supervision-log.md` | 全端工程師主責，內容創作者協作 |
| 小說企劃與連載狀態 | `src/resource/<作品>/README.md`、`核心靈魂檔案.md`、`作者思路.md`、`人物架構.md`、`每日寫作狀態.md`、`伏筆事件台帳.md`、`反思.md` | 內容創作者 |
| 已遷移作品企劃 | `src/resource/<作品>/素材/*.md`（含 `反思.md`） | 內容創作者 |
| 有聲書規則與紀錄 | `src/resource/<作品>/有聲書/README.md`、`src/resource/<作品>/素材/有聲書/**/*.md` | 全端工程師主責，內容創作者協作 |
| 影片規劃與製作紀錄 | `src/resource/<作品>/影片/**/*.md`、`src/resource/<作品>/素材/影片/README.md` | 全端工程師主責，社群總監協作 |
| 社群策略與資源 | `docs/roles/social-media-director/*.md` | 社群總監 |
| 角色上任手冊 | `docs/roles/**/README.md` | 對應角色 |
