# 星骸王座影片 QA 報告

日期：2026-06-13

## 處理原則

- 已有 YouTube 發布紀錄的章節不重新處理，避免動到公開版本。
- 沒有明確 YouTube 發布紀錄的章節，逐支執行本機品質檢查。
- 這次檢查的是長篇橫式有聲書影片，不是短影音；規格要求至少 720p。

## 已發布跳過

| 章節 | 狀態依據 |
| --- | --- |
| 第01章 星核在雨夜說謊 | 寫作規則與狀態檔標記為已發布鎖定章節 |
| 第02章 暗縫裡的舊雪 | production notes：YouTube public `https://youtu.be/OE0rgOWDvpM` |
| 第03章 墓牆舊名 | production notes：YouTube public `https://youtu.be/Qq8QxxLNKW8` |
| 第04章 聽星犬 | production notes：YouTube public `https://youtu.be/tRQptgWRX8c` |
| 第05章 北牆缺燈 | production notes：YouTube public `https://youtu.be/FtCvL7vZH6I` |
| 第06章 灶火醒樓 | production notes：YouTube public `https://youtu.be/1EGffELOkD8` |

## QA 檢查項目

- `ffprobe` 確認影片 stream、音訊 stream、解析度、編碼、像素格式、FPS、時長與檔案大小。
- `ffmpeg -v error -i <video> -f null -` 完整解碼掃描，確認沒有影片或音訊解碼錯誤。
- `volumedetect` 確認音量沒有爆音，且平均音量維持在可聽範圍。
- 檢查字幕檔存在、字幕行長不超過 22 字、沒有開頭標點與爆版風險。
- 抽樣 6 個時間點輸出畫面，確認影片不是黑屏或空白畫面。

## 未發布影片 QA 結果

| 章節 | 規格 | 時長 | 音量 | 字幕 | 畫面抽樣 | 結果 |
| --- | --- | --- | --- | --- | --- | --- |
| 第07章 翻燈問藥 | 1280x720, H.264, yuv420p, 24fps | 16:50 | mean -25.9 dB, max -6.5 dB | max 19 字 | luma 23.72-55.78 | PASS |
| 第08章 藍灰木籤 | 1280x720, H.264, yuv420p, 24fps | 21:18 | mean -25.8 dB, max -6.5 dB | max 19 字 | luma 24.47-48.71 | PASS |
| 第09章 後井濕鞋 | 1280x720, H.264, yuv420p, 24fps | 20:56 | mean -25.8 dB, max -6.4 dB | max 19 字 | luma 27.14-46.36 | PASS |
| 第10章 洗布靜巷 | 1280x720, H.264, yuv420p, 24fps | 21:33 | mean -26.6 dB, max -6.5 dB | max 19 字 | luma 35.93-46.54 | PASS |
| 第11章 灰棚錯結 | 1280x720, H.264, yuv420p, 24fps | 21:35 | mean -25.8 dB, max -6.2 dB | max 20 字 | luma 24.59-39.93 | PASS |
| 第12章 東槽回認 | 1280x720, H.264, yuv420p, 24fps | 20:55 | mean -25.8 dB, max -6.2 dB | max 19 字 | luma 29.22-41.39 | PASS |
| 第13章 活手亂槽 | 1280x720, H.264, yuv420p, 24fps | 21:59 | mean -25.8 dB, max -6.3 dB | max 19 字 | luma 24.72-41.39 | PASS |
| 第14章 穩手北折 | 1280x720, H.264, yuv420p, 24fps | 20:55 | mean -26.2 dB, max -6.5 dB | max 19 字 | luma 30.27-45.44 | PASS |
| 第15章 簍口留灰 | 1280x720, H.264, yuv420p, 24fps | 20:54 | mean -25.7 dB, max -6.1 dB | max 19 字 | luma 23.25-42.07 | PASS |
| 第16章 墊靜灰底 | 1280x720, H.264, yuv420p, 24fps | 22:14 | mean -26.3 dB, max -6.8 dB | max 19 字 | luma 20.51-30.15 | PASS |
| 第17章 灰架記底 | 1280x720, H.264, yuv420p, 24fps | 20:20 | mean -26.2 dB, max -6.6 dB | max 19 字 | luma 30.82-36.25 | PASS |
| 第18章 午後聽勺 | 1280x720, H.264, yuv420p, 24fps | 22:23 | mean -26.2 dB, max -6.3 dB | max 19 字 | luma 30.19-50.29 | PASS |
| 第19章 裂腹舊屋 | 1280x720, H.264, yuv420p, 24fps | 21:50 | mean -26.2 dB, max -6.5 dB | max 20 字 | luma 20.19-30.31 | PASS |
| 第20章 北街問炭 | 1280x720, H.264, yuv420p, 24fps | 20:22 | mean -26.2 dB, max -6.7 dB | max 19 字 | luma 20.78-33.47 | PASS |
| 第21章 檐後喚炭 | 1280x720, H.264, yuv420p, 24fps | 19:54 | mean -26.1 dB, max -6.5 dB | max 20 字 | luma 21.44-25.37 | PASS |
| 第22章 閘後細紅 | 1280x720, H.264, yuv420p, 24fps | 22:02 | mean -26.1 dB, max -6.2 dB | max 19 字 | luma 18.65-30.18 | PASS |

## 結論

- 第07章到第22章的本機影片全數通過 QA。
- 未發現卡頓或檔案損壞相關的解碼錯誤。
- 未發現解析度低於 720p、缺音訊、字幕爆版、音量爆音或黑屏問題。
- 後續上傳 YouTube 前仍需另外確認平台端狀態：影片上傳完成、縮圖可見、檢查通過、Visibility 為 Public、公開 watch URL 可播放。
