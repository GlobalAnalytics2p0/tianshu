#!/usr/bin/env bash
set -euo pipefail

BASE="$(cd "$(dirname "$0")" && pwd)"
FFMPEG="${FFMPEG:-/opt/homebrew/bin/ffmpeg}"
FFPROBE="${FFPROBE:-/opt/homebrew/bin/ffprobe}"
VIDEO="$BASE/output/星骸王座-短影音-第01篇-雨夜星核-1080x1920.mp4"
VOICE_ACTED="$BASE/voice/edge-acted-narration.m4a"
MUSIC="$BASE/music/edge-epic-bed.m4a"
LICENSED_MUSIC="$BASE/music/Darkling-Kevin-MacLeod.mp3"

mkdir -p "$BASE/source/normalized" "$BASE/tmp" "$BASE/output" "$BASE/music" "$BASE/qa"

find "$BASE/tmp" -maxdepth 1 -type f \( -name 'pov-seg-*.mp4' -o -name 'pov-segments.txt' -o -name 'pov-slideshow.mp4' -o -name 'pov-final.mp4' -o -name 'voice-*.txt' -o -name 'voice-*.mp3' -o -name 'voice-*.m4a' -o -name 'voice-segments.txt' \) -delete

cat > "$BASE/tmp/voice-01-hook.txt" <<'EOF'
有人給我三枚銅錢。

叫我守一口黑棺。

他說，天亮以前，不准開。
EOF

cat > "$BASE/tmp/voice-02-death.txt" <<'EOF'
半夜，棺材變熱了。

雨那麼冷。

棺木卻像貼著人的胸口。
EOF

cat > "$BASE/tmp/voice-03-reversal.txt" <<'EOF'
裡面有個聲音對我說。
EOF

cat > "$BASE/tmp/voice-03-warning.txt" <<'EOF'
別開。

開了你會死。

聽見沒有，別開。
EOF

cat > "$BASE/tmp/voice-04-monster.txt" <<'EOF'
我還是撬開了。

棺裡躺著一個死透的星師。

他的胸口，亮著一顆星核。
EOF

cat > "$BASE/tmp/voice-05-cost.txt" <<'EOF'
坡上有人衝下來。

他們不是來收屍。
EOF

cat > "$BASE/tmp/voice-05-shout.txt" <<'EOF'
星核在他身上。

抓住他，別讓他跑。
EOF

cat > "$BASE/tmp/voice-06-question.txt" <<'EOF'
我把星核塞進懷裡。

下一秒，我看見自己的死相。

九根長釘，穿過我的胸口。

想知道我怎麼活下來。

去天書小說看星骸王座第一章。
EOF

python3 -m edge_tts --file "$BASE/tmp/voice-01-hook.txt" --voice "zh-TW-HsiaoChenNeural" --rate=+4% --pitch=-2Hz --write-media "$BASE/tmp/voice-01-hook.mp3"
python3 -m edge_tts --file "$BASE/tmp/voice-02-death.txt" --voice "zh-TW-HsiaoChenNeural" --rate=-3% --pitch=-4Hz --write-media "$BASE/tmp/voice-02-death.mp3"
python3 -m edge_tts --file "$BASE/tmp/voice-03-reversal.txt" --voice "zh-TW-HsiaoChenNeural" --rate=-6% --pitch=-5Hz --write-media "$BASE/tmp/voice-03-reversal.mp3"
python3 -m edge_tts --file "$BASE/tmp/voice-03-warning.txt" --voice "zh-TW-YunJheNeural" --rate=-6% --pitch=-4Hz --write-media "$BASE/tmp/voice-03-warning.mp3"
python3 -m edge_tts --file "$BASE/tmp/voice-04-monster.txt" --voice "zh-TW-HsiaoChenNeural" --rate=+1% --pitch=-4Hz --write-media "$BASE/tmp/voice-04-monster.mp3"
python3 -m edge_tts --file "$BASE/tmp/voice-05-cost.txt" --voice "zh-TW-HsiaoChenNeural" --rate=+7% --pitch=-2Hz --write-media "$BASE/tmp/voice-05-cost.mp3"
python3 -m edge_tts --file "$BASE/tmp/voice-05-shout.txt" --voice "zh-TW-YunJheNeural" --rate=+3% --pitch=-2Hz --write-media "$BASE/tmp/voice-05-shout.mp3"
python3 -m edge_tts --file "$BASE/tmp/voice-06-question.txt" --voice "zh-TW-HsiaoChenNeural" --rate=-1% --pitch=-3Hz --write-media "$BASE/tmp/voice-06-question.mp3"

BASE="$BASE" FFPROBE="$FFPROBE" python3 - <<'PY'
import os
import subprocess
from pathlib import Path

base = Path(os.environ["BASE"])
ffprobe = os.environ["FFPROBE"]

segments = [
    ("voice-01-hook.mp3", [
        ("有人給我三枚銅錢", "Hit", 2.4),
        ("叫我守一口黑棺", "Hit", 2.2),
        ("天亮以前\\N不准開", "Hit", 2.4),
    ]),
    ("voice-02-death.mp3", [
        ("半夜\\N棺材變熱了", "Default", 2.4),
        ("雨那麼冷", "Default", 1.7),
        ("棺木卻像貼著人的胸口", "Default", 2.6),
    ]),
    ("voice-03-reversal.mp3", [
        ("裡面有個聲音對我說", "Default", 1.0),
    ]),
    ("voice-03-warning.mp3", [
        ("別開", "Hit", 1.5),
        ("開了\\N你會死", "Hit", 1.9),
        ("聽見沒有\\N別開", "Hit", 2.2),
    ]),
    ("voice-04-monster.mp3", [
        ("我還是撬開了", "Default", 2.0),
        ("棺裡躺著死透的星師", "Default", 3.0),
        ("胸口亮著一顆星核", "Default", 2.7),
    ]),
    ("voice-05-cost.mp3", [
        ("坡上有人衝下來", "Default", 2.0),
        ("他們不是來收屍", "Default", 2.0),
    ]),
    ("voice-05-shout.mp3", [
        ("星核在他身上", "Hit", 2.0),
        ("抓住他\\N別讓他跑", "Hit", 2.6),
    ]),
    ("voice-06-question.mp3", [
        ("我把星核塞進懷裡", "Default", 2.6),
        ("下一秒\\N我看見自己的死相", "Default", 3.0),
        ("九根長釘\\N穿過我的胸口", "Hit", 3.0),
        ("想知道我怎麼活下來", "Default", 2.4),
        ("去天書小說\\N看《星骸王座》第一章", "Choice", 2.4),
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
        # Keep the final CTA card visually clean. The card itself carries the URL and handles.
        if cue_start >= 58.7:
            break
        cue_end = min(cue_end, 58.55)
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
printf "file '%s'\n" "$BASE/tmp/voice-02-death.mp3" >> "$BASE/tmp/voice-segments.txt"
printf "file '%s'\n" "$BASE/tmp/voice-03-reversal.mp3" >> "$BASE/tmp/voice-segments.txt"
printf "file '%s'\n" "$BASE/tmp/voice-03-warning.mp3" >> "$BASE/tmp/voice-segments.txt"
printf "file '%s'\n" "$BASE/tmp/voice-04-monster.mp3" >> "$BASE/tmp/voice-segments.txt"
printf "file '%s'\n" "$BASE/tmp/voice-05-cost.mp3" >> "$BASE/tmp/voice-segments.txt"
printf "file '%s'\n" "$BASE/tmp/voice-05-shout.mp3" >> "$BASE/tmp/voice-segments.txt"
printf "file '%s'\n" "$BASE/tmp/voice-06-question.mp3" >> "$BASE/tmp/voice-segments.txt"

"$FFMPEG" -y -v warning -f concat -safe 0 -i "$BASE/tmp/voice-segments.txt" \
  -af "aresample=24000,apad=pad_dur=1.4" -c:a aac -b:a 160k "$VOICE_ACTED"

for source in "$BASE"/source/images/frame-*.png; do
  name="$(basename "$source")"
  "$FFMPEG" -y -v error -i "$source" \
    -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1" \
    "$BASE/source/normalized/$name"
done

durations=(2.4 2.1 2.2 3.0 3.9 3.0 2.3 2.1 3.2 2.7 3.0 4.1 3.0 3.6 2.7 3.7 3.9 7.8 7.1)

for i in $(seq -w 1 19); do
  duration="${durations[$((10#$i - 1))]}"
  fade_start="$(awk -v d="$duration" 'BEGIN { printf "%.2f", d - 0.16 }')"
  "$FFMPEG" -y -v error -loop 1 -t "$duration" -i "$BASE/source/normalized/frame-$i.png" \
    -vf "fade=t=in:st=0:d=0.12,fade=t=out:st=$fade_start:d=0.16,fps=30,format=yuv420p" \
    -c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p "$BASE/tmp/pov-seg-$i.mp4"
  printf "file '%s'\n" "pov-seg-$i.mp4" >> "$BASE/tmp/pov-segments.txt"
done

(cd "$BASE/tmp" && "$FFMPEG" -y -v error -f concat -safe 0 -i pov-segments.txt -c copy pov-slideshow.mp4)

"$FFMPEG" -y -v warning -i "$LICENSED_MUSIC" \
  -filter_complex "atrim=0:66,asetpts=PTS-STARTPTS,volume=0.18,highpass=f=55,lowpass=f=9000,afade=t=in:st=0:d=2,afade=t=out:st=61:d=5,alimiter=limit=0.52[a]" \
  -map "[a]" -ar 44100 -ac 2 -c:a aac -b:a 160k "$MUSIC"

"$FFMPEG" -y -v warning -i "$BASE/tmp/pov-slideshow.mp4" -i "$VOICE_ACTED" -i "$MUSIC" \
  -filter_complex "[0:v]ass='$BASE/subtitles/subtitles.ass'[v];[1:a]volume=1.45,highpass=f=85,lowpass=f=11800,acompressor=threshold=-20dB:ratio=2.6:attack=5:release=105[narr];[2:a]volume=0.42[bed];[narr][bed]amix=inputs=2:duration=longest:normalize=0,alimiter=limit=0.88[a]" \
  -map "[v]" -map "[a]" -c:v libx264 -preset medium -crf 19 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart "$VIDEO"

"$FFPROBE" -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,duration -of default=nw=1 "$VIDEO"
"$FFPROBE" -v error -select_streams a:0 -show_entries stream=codec_name,sample_rate,channels,duration -of default=nw=1 "$VIDEO"
"$FFMPEG" -i "$VIDEO" -af volumedetect -f null - 2>&1 | rg 'mean_volume|max_volume' || true
