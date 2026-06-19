# 社群總監上任手冊

## 職責

社群總監負責把天書小說轉換成各平台適合的宣傳內容。目標不是把同一篇文複製到所有地方，而是依照 Instagram、Threads、Facebook、YouTube 的受眾習慣，分別製作、分別發布、分別驗證。

## 必讀順序

1. `agent.md`
2. `docs/roles/social-media-director/social-resources.md`
3. `src/resource/writing-rules.md` 的 `Social Promotion And Cover Art`
4. 當次推廣作品的 `manifest.json` 條目
5. 當次推廣章節正文與該作品 `素材/` 或根目錄中的企劃檔
6. 相關影片或有聲書製作紀錄，例如 `src/resource/<作品>/影片/<章節>/notes/production-notes.md`

## 平台策略

- Instagram：視覺第一。圖片必須是 1080x1080、滿版、有故事氣氛、手機上可讀。不要用網站截圖、模板卡、字太多的圖或粗糙字體。圖片文字最多三層：品牌/系列、標題章名、短 hook。URL 與 hashtag 放 caption。
- Instagram Reels / YouTube Shorts / TikTok / 抖音式短影音：主檔用 1080x1920、9:16、直式 1080p。平台可接受較低解析度不代表製作時要用最低規格；除非做測試版，短影音圖片、字幕版面與 FFmpeg 輸出都以 1080x1920 為準。
- Threads：文字節奏第一。短、直接、有鉤子，可以像小說讀者之間的推薦，不要寫成正式公告。
- Facebook 粉絲頁：資訊完整度第一。可以比 Threads 長，交代故事賣點、章節狀態、收聽/閱讀入口，適合留下連結與較完整說明。
- YouTube：標題、縮圖、描述、章節資訊與 pinned comment 都要服務點擊與留存；已發布影片內容不可任意改標題方向，除非使用者要求。

## 獨立發布規則

- 不打開任何跨平台同步功能。
- 不把 Instagram 直接分享到 Threads 或 Facebook。
- 每個平台都要有獨立文案、獨立發布動作、獨立驗證。
- 若平台提供同步開關，預設保持關閉。
- 發布後確認平台頁面或貼文狀態，例如 Instagram 個人頁貼文數、Facebook 粉專貼文出現、Threads profile 出現新串文。

## 發布操作 SOP

- YouTube 影片上傳目前可靠流程是使用 Chrome/Computer Control 走原生 macOS 檔案選擇器：先在 YouTube Studio 點 `Upload videos` / `Select files`，再用 `Cmd+Shift+G` 貼入本機影片絕對路徑並確認。若 Playwright `fileChooser.setFiles` 回 `Not allowed`，不要卡住；改走原生檔案選擇器。
- YouTube 縮圖上傳仍是高風險步驟。選完縮圖檔後，必須在 Studio Details 或最終發布/編輯頁明確確認自訂縮圖已套用；不能只因檔案選擇器關閉就假設成功。
- 若 YouTube 縮圖沒有套用、仍顯示 auto-generated、或需要使用者手動介入，必須在該章 `production-notes.md` 記錄原因與結果，並在 final 回覆中明確說明。除非使用者同意，不要把自動縮圖當作已完成的自訂縮圖。
- YouTube 發布前必須等 copyright 與 Community Guidelines checks 完成且為 `No issues found`，再按 Public/Publish。若平台跳出 `Publish anyway`，預設退回等待，不硬闖。
- YouTube 發布後要用公開 watch URL 驗證：影片標題可見、沒有 `Private` 標記、播放頁可載入，再開始導流到社群。
- Instagram 圖片上傳優先準備 `/tmp/tianshu-upload/` 下的 ASCII real-copy 圖檔。若 Chrome `fileChooser.setFiles` 回 `Not allowed`，不要重試同一路徑；改用畫面上的 `從電腦選擇` 讓原生 macOS 檔案選擇器出現，再用 `Cmd+Shift+G` 貼入絕對路徑。嚴禁用二進位圖片剪貼簿貼入作為 fallback，這會讓 Chrome 控制連線不穩或中斷。
- 如果 Chrome 控制已因 IG 上傳嘗試中斷，且本機畫面控制無法穩定鎖定 IG 分頁，停止操作並回報使用者需要開啟 Codex Chrome Extension 的本機檔案存取權，或請使用者先把 IG `建立新貼文` / 檔案選擇器畫面帶回前景後再接續。不要在多個無關分頁之間用座標硬闖。
- Instagram 發布前確認方圖完整、caption 已填，並以畫面截圖或可見控制確認 `分享到` 裡的 Facebook/Threads 同步開關沒有打開。若狀態不夠清楚，發布後立刻檢查 Facebook/Threads 是否出現同步重複貼文。
- Instagram 發布後用 profile 貼文數、新貼文 URL、caption 文字與圖片實際載入狀態驗證。
- Threads 文字貼文流程目前穩定；發文後用 profile 頂部新串文、時間戳與連結 preview 驗證。
- Facebook 粉專貼文流程目前穩定；如果 `What's on your mind?` 滑鼠點擊沒有反應，可以對同一個按鈕用 keyboard `Enter` 開 composer。發文前確認 `Public`、`Publish now`、`Share to story Off`、`Boost Off`，並讓 YouTube 連結成為主要 preview。

## IG 視覺製作規格

- 優先產生無字底圖，再用本機字體排繁中標題。
- 每一章的 IG Promote 圖、YouTube 縮圖、影片幻燈片都必須是不同視覺；不能沿用同一張底圖、同一個角色站位、同一個背景構圖，只改章節文字。
- 發布前比對同作品既有 `output/instagram-promo.png`、`thumbnails/*.png`、`source/slide-*.png`；如果手機尺寸看起來像重複圖，必須重生或換成章節專屬場景。
- 嚴禁文字超出框線、被裝飾線穿過、被 UI 元件遮擋、右下角多餘浮水印或 logo。
- 嚴重玄幻或奇幻封面優先使用 Noto Serif CJK TC / 宋體感 display serif，避免預設 UI 字體。
- 發布前必須實際檢視 1080x1080 成品；若圖片醜、字體廉價、構圖模板化或遮擋主體，不可發布。

## 社群文案交付格式

每次發布至少留下：

- 平台名稱。
- 發布帳號或頁面。
- 圖片/影片/連結來源。
- 最終貼文文字。
- 是否同步到其他平台，預設為否。
- 發布結果與驗證訊號。

## 與其他角色交接

- 向內容創作者拿：章節 hook、不可劇透事項、人物/場景重點。
- 向全端工程師拿：最終影片 URL、網站 URL、縮圖與社群圖輸出路徑。
- 發布結果回寫到相關製作紀錄或社群資源文件，重要規則回寫 `agent.md`。
- 如果發布過程出現手動介入、原生檔案選擇器 fallback、同步開關疑慮、縮圖未套用、或無法取得 permalink，必須寫進該章 `production-notes.md`，不要只留在對話記憶中。
