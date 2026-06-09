#!/usr/bin/env bash
set -euo pipefail

BASE="$(cd "$(dirname "$0")" && pwd)"
FFMPEG="${FFMPEG:-/opt/homebrew/bin/ffmpeg}"
FFPROBE="${FFPROBE:-/opt/homebrew/bin/ffprobe}"
VIDEO="$BASE/output/星骸王座-短影音-第01篇-雨夜星核-1080x1920.mp4"
VOICE="$BASE/voice/openai-narration.m4a"
MUSIC="$BASE/music/epic-bed.m4a"
TMP="$BASE/tmp/openai-audio-replace.mp4"

if [[ ! -f "$VOICE" ]]; then
  echo "Missing OpenAI narration: $VOICE" >&2
  echo "Run: (cd \"$BASE\" && OPENAI_API_KEY=... node voice/openai-tts.mjs)" >&2
  exit 2
fi

mkdir -p "$BASE/music" "$BASE/tmp"

# Locally synthesized, copyright-clean epic bed. It is intentionally low and simple;
# the OpenAI narration remains the foreground.
"$FFMPEG" -y -v warning \
  -f lavfi -t 93 -i "anoisesrc=color=brown:amplitude=0.018:sample_rate=44100" \
  -f lavfi -t 93 -i "sine=frequency=55:sample_rate=44100" \
  -f lavfi -t 93 -i "sine=frequency=110:sample_rate=44100" \
  -f lavfi -t 93 -i "sine=frequency=220:sample_rate=44100" \
  -f lavfi -t 93 -i "sine=frequency=330:sample_rate=44100" \
  -filter_complex "[0:a]volume=0.06[wind];[1:a]volume=0.05,afade=t=in:st=0:d=6,afade=t=out:st=87:d=6[bass1];[2:a]volume=0.035,afade=t=in:st=18:d=6,afade=t=out:st=87:d=6[bass2];[3:a]volume=0.020,afade=t=in:st=35:d=8,afade=t=out:st=87:d=6[mid1];[4:a]volume=0.012,afade=t=in:st=55:d=8,afade=t=out:st=87:d=6[mid2];[wind][bass1][bass2][mid1][mid2]amix=inputs=5:duration=longest:normalize=0,lowpass=f=4200,alimiter=limit=0.42[a]" \
  -map "[a]" -ar 44100 -ac 2 -c:a aac -b:a 160k "$MUSIC"

"$FFMPEG" -y -v warning -i "$VIDEO" -i "$VOICE" -i "$MUSIC" \
  -filter_complex "[1:a]volume=1.00,highpass=f=70,lowpass=f=11000[narr];[2:a]volume=0.22[bed];[narr][bed]amix=inputs=2:duration=longest:normalize=0,alimiter=limit=0.86[a]" \
  -map 0:v:0 -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$TMP"

mv "$TMP" "$VIDEO"

"$FFPROBE" -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate -of default=nw=1 "$VIDEO"
"$FFPROBE" -v error -show_entries format=duration,size -of default=nw=1 "$VIDEO"
"$FFMPEG" -i "$VIDEO" -af volumedetect -f null - 2>&1 | rg 'mean_volume|max_volume' || true
