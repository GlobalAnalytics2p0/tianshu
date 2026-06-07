# Sample Runner Loop Production Notes

## Purpose

- Build a 5-minute rough sample for the future `天書小說` audiobook video format.
- Visual direction: continuous runner / light game-HUD loop, mild tension, low distraction.
- Audio direction: quiet classical placeholder music only. Future narration should dominate.

## Source Assets

- Video: Mixkit `Runner training in a park`
  - Page: https://mixkit.co/free-stock-video/runner-training-in-a-park-722/
  - Download used locally: `https://assets.mixkit.co/videos/722/722-720.mp4`
  - License noted on source page: Mixkit Stock Video Free License.
  - Duration/source resolution: 30.03s, 1280x720, 23.976fps.
- Music: Mixkit Classical `Cristales` by Eugenio Mininni
  - Page: https://mixkit.co/free-stock-music/classical/
  - Download used locally: `https://assets.mixkit.co/music/577/577.mp3`
  - License noted on source page: Mixkit Stock Music Free License.
  - Duration: about 4:58.

## Rendered Sample

- Output: `video-resource/sample-runner/output/tianshu-runner-loop-sample-5min.mp4`
- Duration: 300.008s
- Resolution: 1280x720
- Video codec: H.264
- Audio codec: AAC
- Background music level: `volume=0.14`, fade-in 3s, fade-out 6s.
- Mid-section audio estimate: RMS about -38 dB, peak about -20 dB, intentionally quiet for narration planning.

## Notes

- FFmpeg is suitable for this pipeline, but it is not macOS built-in. This machine uses Homebrew FFmpeg at `/opt/homebrew/bin/ffmpeg`.
- The sample uses licensed stock footage rather than commercial game footage to avoid copyright issues.
- The HUD overlay is intentionally subtle. For final audiobook videos, keep motion engaging but avoid visual clutter that competes with narration.
- When real audiobook narration is ready, replace placeholder music or duck it under narration with sidechain compression.
