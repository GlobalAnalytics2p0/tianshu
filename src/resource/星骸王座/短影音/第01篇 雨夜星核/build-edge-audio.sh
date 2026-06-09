#!/usr/bin/env bash
set -euo pipefail

BASE="$(cd "$(dirname "$0")" && pwd)"
FFMPEG="${FFMPEG:-/opt/homebrew/bin/ffmpeg}"
FFPROBE="${FFPROBE:-/opt/homebrew/bin/ffprobe}"
VIDEO="$BASE/output/星骸王座-短影音-第01篇-雨夜星核-1080x1920.mp4"
TEXT="$BASE/voice/narration.txt"
VOICE="$BASE/voice/edge-HsiaoYu-narration.mp3"
VTT="$BASE/voice/edge-HsiaoYu-word-boundary.vtt"
MUSIC="$BASE/music/edge-epic-bed.m4a"
TMP="$BASE/tmp/edge-audio-replace.mp4"

mkdir -p "$BASE/music" "$BASE/tmp"

python3 -m edge_tts \
  --file "$TEXT" \
  --voice "zh-TW-HsiaoYuNeural" \
  --rate=-4% \
  --pitch=-2Hz \
  --write-media "$VOICE" \
  --write-subtitles "$VTT"

# Copyright-clean low epic bed: dark wind, low drone, and restrained harmonic lift.
"$FFMPEG" -y -v warning \
  -f lavfi -t 93 -i "anoisesrc=color=brown:amplitude=0.018:sample_rate=44100" \
  -f lavfi -t 93 -i "sine=frequency=49:sample_rate=44100" \
  -f lavfi -t 93 -i "sine=frequency=98:sample_rate=44100" \
  -f lavfi -t 93 -i "sine=frequency=196:sample_rate=44100" \
  -f lavfi -t 93 -i "sine=frequency=392:sample_rate=44100" \
  -filter_complex "[0:a]volume=0.055[wind];[1:a]volume=0.045,afade=t=in:st=0:d=6,afade=t=out:st=87:d=6[bass1];[2:a]volume=0.035,afade=t=in:st=16:d=7,afade=t=out:st=87:d=6[bass2];[3:a]volume=0.018,afade=t=in:st=36:d=8,afade=t=out:st=87:d=6[mid1];[4:a]volume=0.010,afade=t=in:st=58:d=8,afade=t=out:st=87:d=6[mid2];[wind][bass1][bass2][mid1][mid2]amix=inputs=5:duration=longest:normalize=0,lowpass=f=4200,alimiter=limit=0.40[a]" \
  -map "[a]" -ar 44100 -ac 2 -c:a aac -b:a 160k "$MUSIC"

"$FFMPEG" -y -v warning -i "$VIDEO" -i "$VOICE" -i "$MUSIC" \
  -filter_complex "[1:a]volume=1.10,highpass=f=80,lowpass=f=11500,acompressor=threshold=-18dB:ratio=2.2:attack=8:release=130[narr];[2:a]volume=0.18[bed];[narr][bed]amix=inputs=2:duration=longest:normalize=0,alimiter=limit=0.88[a]" \
  -map 0:v:0 -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$TMP"

mv "$TMP" "$VIDEO"

"$FFPROBE" -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,duration -of default=nw=1 "$VIDEO"
"$FFPROBE" -v error -select_streams a:0 -show_entries stream=codec_name,sample_rate,channels,duration -of default=nw=1 "$VIDEO"
"$FFMPEG" -i "$VIDEO" -af volumedetect -f null - 2>&1 | rg 'mean_volume|max_volume' || true
