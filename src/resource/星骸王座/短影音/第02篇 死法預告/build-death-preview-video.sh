#!/usr/bin/env bash
set -euo pipefail

BASE="$(cd "$(dirname "$0")" && pwd)"
FFMPEG="${FFMPEG:-/opt/homebrew/bin/ffmpeg}"
FFPROBE="${FFPROBE:-/opt/homebrew/bin/ffprobe}"

if [[ ! -x "$FFMPEG" ]]; then
  FFMPEG="$(command -v ffmpeg)"
fi
if [[ ! -x "$FFPROBE" ]]; then
  FFPROBE="$(command -v ffprobe)"
fi

VIDEO="$BASE/output/星骸王座-短影音-第02篇-死法預告-1080x1920.mp4"
VOICE_ACTED="$BASE/voice/edge-acted-narration.m4a"
LICENSED_MUSIC="$BASE/music/Darkling-Kevin-MacLeod.mp3"
MUSIC="$BASE/music/death-preview-bed.m4a"
TOTAL_DURATION="68.00"
SUBTITLE_CUTOFF="60.00"

mkdir -p "$BASE/source/normalized" "$BASE/tmp" "$BASE/output" "$BASE/voice" "$BASE/subtitles" "$BASE/music" "$BASE/qa"

find "$BASE/tmp" -maxdepth 1 -type f \( \
  -name 'seg-*.mp4' -o \
  -name 'segments.txt' -o \
  -name 'slideshow.mp4' -o \
  -name 'voice-*.txt' -o \
  -name 'voice-*.mp3' -o \
  -name 'voice-segments.txt' \
\) -delete

cat > "$BASE/tmp/voice-01-hook.txt" <<'EOF'
修煉前，他先看見死法。
別人升級，他先死一次。
EOF

cat > "$BASE/tmp/voice-02-snow.txt" <<'EOF'
雪地裡，有一個沈曜趴著。
手指還壓在雪上。
可那個人，不會再抬頭。
EOF

cat > "$BASE/tmp/voice-03-alive.txt" <<'EOF'
他低頭看見自己還活著。
星核在掌心發冷。
像剛把他從那條死路上拉回來。
EOF

cat > "$BASE/tmp/voice-04-warning.txt" <<'EOF'
下一種死法，已經在前面等你。
走錯一步，你就回不來。
EOF

cat > "$BASE/tmp/voice-05-coffin.txt" <<'EOF'
黑棺旁，出現第二個影子。
棺蓋上那點星光，亮得太乾淨。
乾淨到像在請他靠近。
EOF

cat > "$BASE/tmp/voice-06-pressure.txt" <<'EOF'
他不敢信。
可他也不能停。
追兵的燈，已經進了巷口。
EOF

cat > "$BASE/tmp/voice-07-pursuer.txt" <<'EOF'
人在前面，別讓他碰那顆星核。
封住巷口，不要讓他跑。
EOF

cat > "$BASE/tmp/voice-08-final.txt" <<'EOF'
沈曜沒有照星光走。
他割斷最亮的那條線。
想看他怎麼改掉死法，
去天書小說，看星骸王座第一章。
EOF

python3 -m edge_tts --file "$BASE/tmp/voice-01-hook.txt" --voice "zh-TW-HsiaoChenNeural" --rate=+5% --pitch=-2Hz --write-media "$BASE/tmp/voice-01-hook.mp3"
python3 -m edge_tts --file "$BASE/tmp/voice-02-snow.txt" --voice "zh-TW-HsiaoChenNeural" --rate=-4% --pitch=-4Hz --write-media "$BASE/tmp/voice-02-snow.mp3"
python3 -m edge_tts --file "$BASE/tmp/voice-03-alive.txt" --voice "zh-TW-HsiaoChenNeural" --rate=-2% --pitch=-4Hz --write-media "$BASE/tmp/voice-03-alive.mp3"
python3 -m edge_tts --file "$BASE/tmp/voice-04-warning.txt" --voice "zh-TW-YunJheNeural" --rate=-2% --pitch=-2Hz --write-media "$BASE/tmp/voice-04-warning.mp3"
python3 -m edge_tts --file "$BASE/tmp/voice-05-coffin.txt" --voice "zh-TW-HsiaoChenNeural" --rate=+0% --pitch=-3Hz --write-media "$BASE/tmp/voice-05-coffin.mp3"
python3 -m edge_tts --file "$BASE/tmp/voice-06-pressure.txt" --voice "zh-TW-HsiaoChenNeural" --rate=+3% --pitch=-3Hz --write-media "$BASE/tmp/voice-06-pressure.mp3"
python3 -m edge_tts --file "$BASE/tmp/voice-07-pursuer.txt" --voice "zh-TW-YunJheNeural" --rate=-2% --pitch=-2Hz --write-media "$BASE/tmp/voice-07-pursuer.mp3"
python3 -m edge_tts --file "$BASE/tmp/voice-08-final.txt" --voice "zh-TW-HsiaoChenNeural" --rate=+1% --pitch=-3Hz --write-media "$BASE/tmp/voice-08-final.mp3"

BASE="$BASE" FFPROBE="$FFPROBE" SUBTITLE_CUTOFF="$SUBTITLE_CUTOFF" python3 - <<'PY'
import os
import subprocess
from pathlib import Path

base = Path(os.environ["BASE"])
ffprobe = os.environ["FFPROBE"]
subtitle_cutoff = float(os.environ["SUBTITLE_CUTOFF"])

segments = [
    ("voice-01-hook.mp3", [
        ("修煉前\\N他先看見死法", "Hit", 2.5),
        ("別人升級\\N他先死一次", "Hit", 2.3),
    ]),
    ("voice-02-snow.mp3", [
        ("雪地裡\\N有一個沈曜趴著", "Default", 2.5),
        ("手指還壓在雪上", "Default", 1.8),
        ("可那個人\\N不會再抬頭", "Hit", 2.4),
    ]),
    ("voice-03-alive.mp3", [
        ("他低頭看見自己還活著", "Default", 2.4),
        ("星核在掌心發冷", "Default", 2.0),
        ("像剛把他\\N從死路拉回來", "Default", 2.7),
    ]),
    ("voice-04-warning.mp3", [
        ("下一種死法\\N已經在前面等你", "Hit", 3.0),
        ("走錯一步\\N你就回不來", "Hit", 2.5),
    ]),
    ("voice-05-coffin.mp3", [
        ("黑棺旁\\N出現第二個影子", "Default", 2.5),
        ("那點星光\\N亮得太乾淨", "Default", 2.6),
        ("乾淨到像在請他靠近", "Hit", 2.5),
    ]),
    ("voice-06-pressure.mp3", [
        ("他不敢信", "Default", 1.5),
        ("可他也不能停", "Default", 1.7),
        ("追兵的燈\\N已經進了巷口", "Hit", 2.7),
    ]),
    ("voice-07-pursuer.mp3", [
        ("人在前面\\N別讓他碰那顆星核", "Hit", 3.0),
        ("封住巷口\\N不要讓他跑", "Hit", 2.5),
    ]),
    ("voice-08-final.mp3", [
        ("沈曜沒有照星光走", "Choice", 2.4),
        ("他割斷最亮的那條線", "Choice", 2.5),
        ("想看他怎麼改掉死法", "Default", 2.6),
        ("去天書小說\\N看《星骸王座》第一章", "Choice", 2.8),
    ]),
]

def duration(path: Path) -> float:
    output = subprocess.check_output([
        ffprobe,
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=nw=1:nk=1",
        str(path),
    ], text=True).strip()
    return float(output)

def ass_time(seconds: float) -> str:
    seconds = max(0, seconds)
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    whole = int(seconds % 60)
    centis = int(round((seconds - int(seconds)) * 100))
    if centis == 100:
        whole += 1
        centis = 0
    return f"{hours}:{minutes:02d}:{whole:02d}.{centis:02d}"

def srt_time(seconds: float) -> str:
    seconds = max(0, seconds)
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    whole = int(seconds % 60)
    millis = int(round((seconds - int(seconds)) * 1000))
    if millis == 1000:
        whole += 1
        millis = 0
    return f"{hours:02d}:{minutes:02d}:{whole:02d},{millis:03d}"

events = []
cursor = 0.0
for filename, cues in segments:
    seg_dur = duration(base / "tmp" / filename)
    total_weight = sum(weight for _, _, weight in cues)
    seg_cursor = cursor
    for cue_index, (text, style, weight) in enumerate(cues):
        cue_start = seg_cursor
        cue_end = cursor + seg_dur if cue_index == len(cues) - 1 else seg_cursor + seg_dur * (weight / total_weight)
        if cue_start >= subtitle_cutoff:
            break
        cue_end = min(cue_end, subtitle_cutoff - 0.05)
        if cue_end - cue_start >= 0.35:
            events.append((cue_start, cue_end, style, text))
        seg_cursor = cue_end
    cursor += seg_dur

subtitle_dir = base / "subtitles"
subtitle_dir.mkdir(parents=True, exist_ok=True)

ass_lines = [
    "[Script Info]",
    "ScriptType: v4.00+",
    "PlayResX: 1080",
    "PlayResY: 1920",
    "ScaledBorderAndShadow: yes",
    "",
    "[V4+ Styles]",
    "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
    "Style: Default,STHeiti,72,&H00FFFFFF,&H00FFFFFF,&HDD070402,&HAA000000,-1,0,0,0,100,100,1,0,3,5,0,2,70,70,320,1",
    "Style: Hit,STHeiti,84,&H00FFFFFF,&H00FFFFFF,&HDD180600,&HAA000000,-1,0,0,0,100,100,1,0,3,7,0,2,65,65,350,1",
    "Style: Choice,STHeiti,76,&H00EAF8FF,&H00FFFFFF,&HDD160B03,&HAA000000,-1,0,0,0,100,100,1,0,3,5,0,2,70,70,300,1",
    "",
    "[Events]",
    "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
]

for start, end, style, text in events:
    ass_lines.append(f"Dialogue: 0,{ass_time(start)},{ass_time(end)},{style},,0,0,0,,{text}")

(subtitle_dir / "subtitles.ass").write_text("\n".join(ass_lines) + "\n", encoding="utf-8")

srt_lines = []
for index, (start, end, _, text) in enumerate(events, start=1):
    srt_lines.append(str(index))
    srt_lines.append(f"{srt_time(start)} --> {srt_time(end)}")
    srt_lines.extend(text.replace("\\N", "\n").splitlines())
    srt_lines.append("")

(subtitle_dir / "subtitles.srt").write_text("\n".join(srt_lines), encoding="utf-8")
PY

printf "file '%s'\n" "$BASE/tmp/voice-01-hook.mp3" > "$BASE/tmp/voice-segments.txt"
printf "file '%s'\n" "$BASE/tmp/voice-02-snow.mp3" >> "$BASE/tmp/voice-segments.txt"
printf "file '%s'\n" "$BASE/tmp/voice-03-alive.mp3" >> "$BASE/tmp/voice-segments.txt"
printf "file '%s'\n" "$BASE/tmp/voice-04-warning.mp3" >> "$BASE/tmp/voice-segments.txt"
printf "file '%s'\n" "$BASE/tmp/voice-05-coffin.mp3" >> "$BASE/tmp/voice-segments.txt"
printf "file '%s'\n" "$BASE/tmp/voice-06-pressure.mp3" >> "$BASE/tmp/voice-segments.txt"
printf "file '%s'\n" "$BASE/tmp/voice-07-pursuer.mp3" >> "$BASE/tmp/voice-segments.txt"
printf "file '%s'\n" "$BASE/tmp/voice-08-final.mp3" >> "$BASE/tmp/voice-segments.txt"

"$FFMPEG" -y -v warning -f concat -safe 0 -i "$BASE/tmp/voice-segments.txt" \
  -af "aresample=24000,apad=pad_dur=1.4" -c:a aac -b:a 160k "$VOICE_ACTED"

for source in "$BASE"/source/images/frame-*.png; do
  name="$(basename "$source")"
  "$FFMPEG" -y -v error -i "$source" \
    -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1" \
    "$BASE/source/normalized/$name"
done

durations=(4.4 4.8 4.3 5.2 5.0 5.4 4.8 5.0 6.3 6.2 8.6 8.0)
pan_x=(-24 26 -18 22 -20 24 -15 30 -25 18 -22 0)
pan_y=(20 -18 24 -12 18 -22 10 -16 22 -18 14 0)

for i in $(seq -w 1 12); do
  idx=$((10#$i - 1))
  duration="${durations[$idx]}"
  dx="${pan_x[$idx]}"
  dy="${pan_y[$idx]}"
  fade_start="$(awk -v d="$duration" 'BEGIN { printf "%.2f", d - 0.18 }')"
  "$FFMPEG" -y -v error -loop 1 -t "$duration" -i "$BASE/source/normalized/frame-$i.png" \
    -vf "scale=1180:2098:force_original_aspect_ratio=increase,crop=1180:2098,crop=1080:1920:x='(iw-ow)/2+($dx*t/$duration)':y='(ih-oh)/2+($dy*t/$duration)',setsar=1,fade=t=in:st=0:d=0.16,fade=t=out:st=$fade_start:d=0.18,fps=30,format=yuv420p" \
    -c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p "$BASE/tmp/seg-$i.mp4"
  printf "file '%s'\n" "seg-$i.mp4" >> "$BASE/tmp/segments.txt"
done

(cd "$BASE/tmp" && "$FFMPEG" -y -v error -f concat -safe 0 -i segments.txt -c copy slideshow.mp4)

"$FFMPEG" -y -v warning -i "$LICENSED_MUSIC" \
  -filter_complex "atrim=0:$TOTAL_DURATION,asetpts=PTS-STARTPTS,volume=0.17,highpass=f=55,lowpass=f=9000,afade=t=in:st=0:d=2,afade=t=out:st=56.4:d=5.2,alimiter=limit=0.52[a]" \
  -map "[a]" -ar 44100 -ac 2 -c:a aac -b:a 160k "$MUSIC"

"$FFMPEG" -y -v warning -i "$BASE/tmp/slideshow.mp4" -i "$VOICE_ACTED" -i "$MUSIC" \
  -filter_complex "[0:v]ass='$BASE/subtitles/subtitles.ass'[v];[1:a]volume=1.48,highpass=f=85,lowpass=f=11800,acompressor=threshold=-20dB:ratio=2.7:attack=5:release=105[narr];[2:a]volume=0.40[bed];[narr][bed]amix=inputs=2:duration=longest:normalize=0,alimiter=limit=0.88[a]" \
  -map "[v]" -map "[a]" -t "$TOTAL_DURATION" -c:v libx264 -preset medium -crf 19 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart "$VIDEO"

"$FFPROBE" -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,duration -of default=nw=1 "$VIDEO"
"$FFPROBE" -v error -select_streams a:0 -show_entries stream=codec_name,sample_rate,channels,duration -of default=nw=1 "$VIDEO"
"$FFMPEG" -i "$VIDEO" -af volumedetect -f null - 2>&1 | rg 'mean_volume|max_volume' || true
