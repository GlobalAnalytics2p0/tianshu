#!/usr/bin/env bash
set -euo pipefail

BASE="$(cd "$(dirname "$0")" && pwd)"
FFMPEG="${FFMPEG:-/opt/homebrew/bin/ffmpeg}"
FFPROBE="${FFPROBE:-/opt/homebrew/bin/ffprobe}"

mkdir -p "$BASE/source/normalized" "$BASE/tmp" "$BASE/output" "$BASE/qa"

find "$BASE/tmp" -maxdepth 1 -type f \( -name 'seg-*.mp4' -o -name 'segments.txt' -o -name 'slideshow.mp4' \) -delete

for source in "$BASE"/source/images/frame-*.png; do
  name="$(basename "$source")"
  "$FFMPEG" -y -v error -i "$source" \
    -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1" \
    "$BASE/source/normalized/$name"
done

for i in $(seq -w 1 18); do
  "$FFMPEG" -y -v error -loop 1 -t 5.15 -i "$BASE/source/normalized/frame-$i.png" \
    -vf "fade=t=in:st=0:d=0.20,fade=t=out:st=4.95:d=0.20,fps=30,format=yuv420p" \
    -c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p "$BASE/tmp/seg-$i.mp4"
  printf "file '%s'\n" "seg-$i.mp4" >> "$BASE/tmp/segments.txt"
done

(cd "$BASE/tmp" && "$FFMPEG" -y -v error -f concat -safe 0 -i segments.txt -c copy slideshow.mp4)

"$FFMPEG" -y -v warning -i "$BASE/tmp/slideshow.mp4" -i "$BASE/voice/narration-preview.m4a" \
  -f lavfi -t 93 -i "anoisesrc=color=pink:amplitude=0.014:sample_rate=44100" \
  -filter_complex "[0:v]ass='$BASE/subtitles/subtitles.ass'[v];[1:a]volume=0.78[narr];[2:a]volume=0.08[bed];[narr][bed]amix=inputs=2:duration=longest:normalize=0,alimiter=limit=0.72[a]" \
  -map "[v]" -map "[a]" -c:v libx264 -preset medium -crf 19 -pix_fmt yuv420p \
  -c:a aac -b:a 160k -movflags +faststart \
  "$BASE/output/星骸王座-短影音-第01篇-雨夜星核-1080x1920.mp4"

"$FFPROBE" -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate -of default=nw=1 \
  "$BASE/output/星骸王座-短影音-第01篇-雨夜星核-1080x1920.mp4"
"$FFPROBE" -v error -show_entries format=duration,size -of default=nw=1 \
  "$BASE/output/星骸王座-短影音-第01篇-雨夜星核-1080x1920.mp4"
