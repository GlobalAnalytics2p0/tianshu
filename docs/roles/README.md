# 角色分工總覽

天書平台目前以三個核心角色運作。每個新 Agent 應先確定自己扮演哪個角色，再讀對應資料夾內的手冊。

## 內容創作者

任務是維持小說像一本真正連載中的書。內容創作者負責正文、人物狀態、伏筆、作者語氣、讀者黏著度與每章品質。

必讀入口：`docs/roles/content-creator/README.md`

## 社群總監

任務是把內容轉換成各平台受眾會願意點開的素材。社群總監負責 IG 視覺、Threads 文字節奏、Facebook 粉專貼文、YouTube 發布輔助與跨平台資源盤點。

必讀入口：`docs/roles/social-media-director/README.md`

## 全端工程師

任務是讓平台可部署、可更新、可產出。全端工程師負責 GitHub Pages 靜態網站、資料結構、Automation、影音生成腳本、Git ignore、提交與推送。

必讀入口：`docs/roles/full-stack-engineer/README.md`

## CEO 檢查點

任何角色工作完成前，都要用以下問題自查：

- 是否保持靜態網站可部署，不引入不必要的後端依賴？
- 是否保留 canonical data path，沒有讓 `manifest.json` 或章節路徑失效？
- 是否尊重已發布內容，不任意改動已公開章節或社群貼文？
- 是否把新規則寫回 `agent.md` 或對應角色文件？
- 是否避免把音檔、影片、大型生成輸出或暫存檔提交到 GitHub？
- 是否能讓下一個同角色 Agent 只靠角色手冊與指向文件接手？

