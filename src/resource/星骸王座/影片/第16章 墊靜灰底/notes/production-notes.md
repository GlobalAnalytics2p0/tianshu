# 第16章 墊靜灰底 Production Notes

## Visual Brief

- 章節核心：敵方不只照手、照口，也開始照「簍底」；沈曜與阿棠用假底反塞灰紙，把北紙巷烘底院與「北後照底，不照人」拖出來。
- 視覺主線：東槽翻底弄亂、阿棠製作假舊底、北紙巷烘底院試靜、反塞灰紙破局、北後瘦長男人現身、回東槽攤開程藥舊底證物。
- 圖像原則：6 張正式分鏡皆為第 16 章專屬 Image 2 故事圖；不使用網站截圖、低質 placeholder、抽象背景或只換字模板。

## Deliverables

- Slides: `source/slide-01.png` through `source/slide-06.png`
- Social cover base: `source/social-cover-base.png`
- YouTube thumbnail: `thumbnails/星骸王座-第16章-墊靜灰底-thumbnail.png`
- Instagram image: `output/instagram-promo.png`
- Video: `output/星骸王座-第16章 墊靜灰底-字幕有聲書-720p.mp4`
- Subtitles: `subtitles/星骸王座-第16章 墊靜灰底.srt`
- QA sheets: `qa/ch16-slide-contact-sheet.png`, `qa/ch16-frame-contact-sheet.png`

## QA

- Video codec: H.264
- Resolution: 1280x720
- Frame rate: 24 fps
- Pixel format: yuv420p
- Duration: 1333.823991 seconds
- File size: 41309517 bytes
- Final audio volume: mean -26.3 dB, max -6.8 dB
- Subtitle QA: 350 cues, 533 lines, max line length 19 characters, 0 leading-punctuation lines, 0 lines over 22 characters

## Notes

- Initial full-text Edge TTS returned `NoAudioReceived` and left a partial `.mp3` plus 0B `.vtt`. A short `zh-TW-YunJheNeural` voice test succeeded, so the video script was updated to support chunked Edge TTS, concatenated audio, and merged VTT timings.
- Final render used the chunked TTS path; audio/subtitle QA passed after merge.
- Cover hook used for local typography: `北後照底，不照人。`
- This chapter has not been uploaded to YouTube or social platforms in this production pass.
