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

VIDEO="$BASE/output/星骸王座-短影音-第06篇-玄幻短榜-1080x1920.mp4"
VOICE_ACTED="$BASE/voice/edge-acted-narration.m4a"
LICENSED_MUSIC="$BASE/music/Darkling-Kevin-MacLeod.mp3"
MUSIC="$BASE/music/xuanhuan-ranking-bed.m4a"
TOTAL_DURATION="58.00"
SUBTITLE_CUTOFF="49.50"

mkdir -p "$BASE/source/normalized" "$BASE/tmp" "$BASE/output" "$BASE/voice" "$BASE/subtitles" "$BASE/music" "$BASE/qa"

find "$BASE/tmp" -maxdepth 1 -type f \( \
  -name 'seg-*.mp4' -o -name 'segments.txt' -o -name 'slideshow.mp4' -o \
  -name 'voice-*.txt' -o -name 'voice-*.mp3' -o -name 'voice-segments.txt' \
\) -delete

cat > "$BASE/tmp/voice-01-hook.txt" <<'EOF'
看膩無敵開局？
換一部，開局就被判死的玄幻。
EOF

cat > "$BASE/tmp/voice-02-exile.txt" <<'EOF'
少年沈曜不是天選。
他被流放、被追，連活著都像欠命。
EOF

cat > "$BASE/tmp/voice-03-core.txt" <<'EOF'
理由一。
星核會說謊。
它給路，也挖坑。
EOF

cat > "$BASE/tmp/voice-04-core-warning.txt" <<'EOF'
你會死在下一次變強前。
EOF

cat > "$BASE/tmp/voice-05-death.txt" <<'EOF'
理由二。
變強前，先看見死法。
EOF

cat > "$BASE/tmp/voice-06-people.txt" <<'EOF'
理由三。
他不靠大招清場。
巷子的燈、灶火、手和哭聲，都能反擊。
EOF

cat > "$BASE/tmp/voice-07-payoff.txt" <<'EOF'
爽感不是一路碾。
是差一點死，還把命運拆開一寸。
EOF

cat > "$BASE/tmp/voice-08-save.txt" <<'EOF'
喜歡冷硬玄幻、少年逆命、長線懸疑，先收藏。
EOF

cat > "$BASE/tmp/voice-09-cta.txt" <<'EOF'
官網看星骸王座。
搜尋，星骸王座，天書小說。
EOF

python3 -m edge_tts --file "$BASE/tmp/voice-01-hook.txt" --voice "zh-TW-HsiaoChenNeural" --rate=+5% --pitch=-2Hz --write-media "$BASE/tmp/voice-01-hook.mp3"
python3 -m edge_tts --file "$BASE/tmp/voice-02-exile.txt" --voice "zh-TW-HsiaoChenNeural" --rate=+1% --pitch=-3Hz --write-media "$BASE/tmp/voice-02-exile.mp3"
python3 -m edge_tts --file "$BASE/tmp/voice-03-core.txt" --voice "zh-TW-HsiaoChenNeural" --rate=+1% --pitch=-3Hz --write-media "$BASE/tmp/voice-03-core.mp3"
python3 -m edge_tts --file "$BASE/tmp/voice-04-core-warning.txt" --voice "zh-TW-YunJheNeural" --rate=-2% --pitch=-4Hz --write-media "$BASE/tmp/voice-04-core-warning.mp3"
python3 -m edge_tts --file "$BASE/tmp/voice-05-death.txt" --voice "zh-TW-HsiaoChenNeural" --rate=+0% --pitch=-3Hz --write-media "$BASE/tmp/voice-05-death.mp3"
python3 -m edge_tts --file "$BASE/tmp/voice-06-people.txt" --voice "zh-TW-HsiaoChenNeural" --rate=+1% --pitch=-3Hz --write-media "$BASE/tmp/voice-06-people.mp3"
python3 -m edge_tts --file "$BASE/tmp/voice-07-payoff.txt" --voice "zh-TW-HsiaoChenNeural" --rate=-1% --pitch=-3Hz --write-media "$BASE/tmp/voice-07-payoff.mp3"
python3 -m edge_tts --file "$BASE/tmp/voice-08-save.txt" --voice "zh-TW-HsiaoChenNeural" --rate=+0% --pitch=-3Hz --write-media "$BASE/tmp/voice-08-save.mp3"
python3 -m edge_tts --file "$BASE/tmp/voice-09-cta.txt" --voice "zh-TW-HsiaoChenNeural" --rate=+0% --pitch=-3Hz --write-media "$BASE/tmp/voice-09-cta.mp3"

BASE="$BASE" FFPROBE="$FFPROBE" SUBTITLE_CUTOFF="$SUBTITLE_CUTOFF" python3 - <<'PY'
import os
import subprocess
from pathlib import Path

base = Path(os.environ["BASE"])
ffprobe = os.environ["FFPROBE"]
subtitle_cutoff = float(os.environ["SUBTITLE_CUTOFF"])
segments = [
    ("voice-01-hook.mp3", [("看膩無敵開局", "Hit", 2.2), ("換一部\\N開局就被判死的玄幻", "Hit", 3.4)]),
    ("voice-02-exile.mp3", [("少年沈曜不是天選", "Default", 2.5), ("被流放\\N被追\\N連活著都像欠命", "Default", 3.5)]),
    ("voice-03-core.mp3", [("理由一", "Choice", 1.2), ("星核會說謊", "Hit", 2.2), ("它給路\\N也挖坑", "Default", 2.0)]),
    ("voice-04-core-warning.mp3", [("你會死在\\N下一次變強前", "Hit", 3.4)]),
    ("voice-05-death.mp3", [("理由二", "Choice", 1.3), ("變強前\\N先看見死法", "Default", 3.0)]),
    ("voice-06-people.mp3", [("理由三", "Choice", 1.3), ("不靠大招清場", "Default", 2.0), ("燈、灶火、手和哭聲\\N都能反擊", "Default", 4.0)]),
    ("voice-07-payoff.mp3", [("不是一路碾", "Default", 2.0), ("差一點死\\N還拆開命運一寸", "Choice", 3.6)]),
    ("voice-08-save.mp3", [("冷硬玄幻\\N少年逆命\\N長線懸疑", "Default", 3.2), ("先收藏", "Hit", 1.6)]),
    ("voice-09-cta.mp3", [("官網看《星骸王座》", "Default", 2.5), ("搜尋\\N星骸王座 天書小說", "Choice", 3.0)]),
]


def duration(path: Path) -> float:
    return float(
        subprocess.check_output(
            [
                ffprobe,
                "-v",
                "error",
                "-show_entries",
                "format=duration",
                "-of",
                "default=nw=1:nk=1",
                str(path),
            ],
            text=True,
        ).strip()
    )


def ass_time(seconds: float) -> str:
    seconds = max(0, seconds)
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    c = int(round((seconds - int(seconds)) * 100))
    if c == 100:
        s += 1
        c = 0
    return f"{h}:{m:02d}:{s:02d}.{c:02d}"


def srt_time(seconds: float) -> str:
    seconds = max(0, seconds)
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    ms = int(round((seconds - int(seconds)) * 1000))
    if ms == 1000:
        s += 1
        ms = 0
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


events = []
cursor = 0.0
for filename, cues in segments:
    seg_dur = duration(base / "tmp" / filename)
    total_weight = sum(weight for _, _, weight in cues)
    seg_cursor = cursor
    for cue_index, (text, style, weight) in enumerate(cues):
        start = seg_cursor
        end = cursor + seg_dur if cue_index == len(cues) - 1 else seg_cursor + seg_dur * (weight / total_weight)
        if start >= subtitle_cutoff:
            break
        end = min(end, subtitle_cutoff - 0.05)
        if end - start >= 0.35:
            events.append((start, end, style, text))
        seg_cursor = end
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

srt = []
for idx, (start, end, _, text) in enumerate(events, 1):
    srt += [str(idx), f"{srt_time(start)} --> {srt_time(end)}", *text.replace("\\N", "\n").splitlines(), ""]
(subtitle_dir / "subtitles.srt").write_text("\n".join(srt), encoding="utf-8")
PY

printf "file '%s'\n" "$BASE/tmp/voice-01-hook.mp3" > "$BASE/tmp/voice-segments.txt"
printf "file '%s'\n" "$BASE/tmp/voice-02-exile.mp3" >> "$BASE/tmp/voice-segments.txt"
printf "file '%s'\n" "$BASE/tmp/voice-03-core.mp3" >> "$BASE/tmp/voice-segments.txt"
printf "file '%s'\n" "$BASE/tmp/voice-04-core-warning.mp3" >> "$BASE/tmp/voice-segments.txt"
printf "file '%s'\n" "$BASE/tmp/voice-05-death.mp3" >> "$BASE/tmp/voice-segments.txt"
printf "file '%s'\n" "$BASE/tmp/voice-06-people.mp3" >> "$BASE/tmp/voice-segments.txt"
printf "file '%s'\n" "$BASE/tmp/voice-07-payoff.mp3" >> "$BASE/tmp/voice-segments.txt"
printf "file '%s'\n" "$BASE/tmp/voice-08-save.mp3" >> "$BASE/tmp/voice-segments.txt"
printf "file '%s'\n" "$BASE/tmp/voice-09-cta.mp3" >> "$BASE/tmp/voice-segments.txt"

"$FFMPEG" -y -v warning -f concat -safe 0 -i "$BASE/tmp/voice-segments.txt" \
  -af "aresample=24000,apad=pad_dur=1.0" -c:a aac -b:a 160k "$VOICE_ACTED"

BASE="$BASE" FFPROBE="$FFPROBE" TOTAL_DURATION="$TOTAL_DURATION" python3 - <<'PY'
import os
import subprocess
from pathlib import Path

base = Path(os.environ["BASE"])
total = float(os.environ["TOTAL_DURATION"])
ffprobe = os.environ["FFPROBE"]
voice = base / "voice" / "edge-acted-narration.m4a"
dur = float(
    subprocess.check_output(
        [ffprobe, "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", str(voice)],
        text=True,
    ).strip()
)
if dur > total - 0.2:
    raise SystemExit(f"voice track {dur:.3f}s exceeds safe video duration {total:.3f}s; rewrite or extend before final encode")
print(f"voice_duration={dur:.3f}s")
PY

for source in "$BASE"/source/images/frame-*.png; do
  name="$(basename "$source")"
  "$FFMPEG" -y -v error -i "$source" \
    -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1" \
    "$BASE/source/normalized/$name"
done

durations=(5.0 5.5 5.5 5.5 5.5 5.0 5.5 5.5 6.5 8.5)
pan_x=(0 -18 16 -20 18 -16 18 0 0 0)
pan_y=(0 14 -16 18 -14 16 -18 0 0 0)
for i in $(seq -w 1 10); do
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
  -filter_complex "atrim=0:$TOTAL_DURATION,asetpts=PTS-STARTPTS,volume=0.16,highpass=f=55,lowpass=f=9000,afade=t=in:st=0:d=2,afade=t=out:st=50:d=7.0,alimiter=limit=0.52[a]" \
  -map "[a]" -ar 44100 -ac 2 -c:a aac -b:a 160k "$MUSIC"

"$FFMPEG" -y -v warning -i "$BASE/tmp/slideshow.mp4" -i "$VOICE_ACTED" -i "$MUSIC" \
  -filter_complex "[0:v]ass='$BASE/subtitles/subtitles.ass'[v];[1:a]volume=1.50,highpass=f=85,lowpass=f=11800,acompressor=threshold=-20dB:ratio=2.7:attack=5:release=105[narr];[2:a]volume=0.38[bed];[narr][bed]amix=inputs=2:duration=longest:normalize=0,alimiter=limit=0.88[a]" \
  -map "[v]" -map "[a]" -t "$TOTAL_DURATION" -c:v libx264 -preset medium -crf 19 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart "$VIDEO"

"$FFPROBE" -v error -select_streams v:0 -show_entries stream=width,height,sample_aspect_ratio,display_aspect_ratio,r_frame_rate,duration -of default=nw=1 "$VIDEO"
"$FFPROBE" -v error -select_streams a:0 -show_entries stream=codec_name,sample_rate,channels,duration -of default=nw=1 "$VIDEO"
"$FFMPEG" -i "$VIDEO" -af volumedetect -f null - 2>&1 | rg 'mean_volume|max_volume' || true
