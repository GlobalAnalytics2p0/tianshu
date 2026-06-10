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

VIDEO="$BASE/output/星骸王座-短影音-第03篇-樓下未醒-1080x1920.mp4"
VOICE_ACTED="$BASE/voice/edge-acted-narration.m4a"
LICENSED_MUSIC="$BASE/music/Darkling-Kevin-MacLeod.mp3"
MUSIC="$BASE/music/awake-downstairs-bed.m4a"
TOTAL_DURATION="60.00"
SUBTITLE_CUTOFF="51.00"

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
半夜最怕的，不是敲門。
是樓下沒聲。
EOF

cat > "$BASE/tmp/voice-02-silent.txt" <<'EOF'
沒咳嗽。
沒燈。
灶冷著，門也不響。
EOF

cat > "$BASE/tmp/voice-03-rule.txt" <<'EOF'
樓下還沒醒。
現場乾淨，可以收了。
EOF

cat > "$BASE/tmp/voice-04-meaning.txt" <<'EOF'
這句一落，人就乾淨死了。
沒人作證。
EOF

cat > "$BASE/tmp/voice-05-choice.txt" <<'EOF'
沈曜沒有拔刀。
他先去敲周嬸家的灶門。
EOF

cat > "$BASE/tmp/voice-06-zhou.txt" <<'EOF'
都起來！
燈點上，水燒開，誰也別裝睡。
EOF

cat > "$BASE/tmp/voice-07-afU.txt" <<'EOF'
阿福拎著蔥和豆腐跑出去。
EOF

cat > "$BASE/tmp/voice-08-alley.txt" <<'EOF'
隔壁男人故意咳。
婦人開門罵。
鍋氣和腳步聲，塞滿巷子。
EOF

cat > "$BASE/tmp/voice-09-dirty.txt" <<'EOF'
乾淨死局，髒了。
吵了。
活人都在場。
EOF

cat > "$BASE/tmp/voice-10-payoff.txt" <<'EOF'
第七欄最怕的，不是刀。
是每一戶都醒著。
EOF

cat > "$BASE/tmp/voice-11-cta.txt" <<'EOF'
去天書小說，看星骸王座。
EOF

python3 -m edge_tts --file "$BASE/tmp/voice-01-hook.txt" --voice "zh-TW-HsiaoChenNeural" --rate=+5% --pitch=-2Hz --write-media "$BASE/tmp/voice-01-hook.mp3"
python3 -m edge_tts --file "$BASE/tmp/voice-02-silent.txt" --voice "zh-TW-HsiaoChenNeural" --rate=-4% --pitch=-4Hz --write-media "$BASE/tmp/voice-02-silent.mp3"
python3 -m edge_tts --file "$BASE/tmp/voice-03-rule.txt" --voice "zh-TW-YunJheNeural" --rate=-2% --pitch=-2Hz --write-media "$BASE/tmp/voice-03-rule.mp3"
python3 -m edge_tts --file "$BASE/tmp/voice-04-meaning.txt" --voice "zh-TW-HsiaoChenNeural" --rate=+0% --pitch=-2Hz --write-media "$BASE/tmp/voice-04-meaning.mp3"
python3 -m edge_tts --file "$BASE/tmp/voice-05-choice.txt" --voice "zh-TW-HsiaoChenNeural" --rate=+1% --pitch=-3Hz --write-media "$BASE/tmp/voice-05-choice.mp3"
python3 -m edge_tts --file "$BASE/tmp/voice-06-zhou.txt" --voice "zh-TW-HsiaoChenNeural" --rate=+8% --pitch=-8Hz --write-media "$BASE/tmp/voice-06-zhou.mp3"
python3 -m edge_tts --file "$BASE/tmp/voice-07-afU.txt" --voice "zh-TW-HsiaoChenNeural" --rate=+4% --pitch=-2Hz --write-media "$BASE/tmp/voice-07-afU.mp3"
python3 -m edge_tts --file "$BASE/tmp/voice-08-alley.txt" --voice "zh-TW-HsiaoChenNeural" --rate=+2% --pitch=-2Hz --write-media "$BASE/tmp/voice-08-alley.mp3"
python3 -m edge_tts --file "$BASE/tmp/voice-09-dirty.txt" --voice "zh-TW-HsiaoChenNeural" --rate=-2% --pitch=-3Hz --write-media "$BASE/tmp/voice-09-dirty.mp3"
python3 -m edge_tts --file "$BASE/tmp/voice-10-payoff.txt" --voice "zh-TW-HsiaoChenNeural" --rate=-1% --pitch=-3Hz --write-media "$BASE/tmp/voice-10-payoff.mp3"
python3 -m edge_tts --file "$BASE/tmp/voice-11-cta.txt" --voice "zh-TW-HsiaoChenNeural" --rate=+0% --pitch=-3Hz --write-media "$BASE/tmp/voice-11-cta.mp3"

BASE="$BASE" FFPROBE="$FFPROBE" SUBTITLE_CUTOFF="$SUBTITLE_CUTOFF" python3 - <<'PY'
import os
import subprocess
from pathlib import Path

base = Path(os.environ["BASE"])
ffprobe = os.environ["FFPROBE"]
subtitle_cutoff = float(os.environ["SUBTITLE_CUTOFF"])

segments = [
    ("voice-01-hook.mp3", [
        ("半夜最怕的\\N不是敲門", "Hit", 2.8),
        ("是樓下沒聲", "Hit", 2.0),
    ]),
    ("voice-02-silent.mp3", [
        ("沒咳嗽", "Default", 1.3),
        ("沒燈", "Default", 1.1),
        ("灶冷著\\N門也不響", "Hit", 2.4),
    ]),
    ("voice-03-rule.mp3", [
        ("樓下還沒醒", "Hit", 2.2),
        ("現場乾淨\\N可以收了", "Hit", 2.6),
    ]),
    ("voice-04-meaning.mp3", [
        ("這句一落\\N人就乾淨死了", "Default", 3.0),
        ("沒人作證", "Hit", 1.5),
    ]),
    ("voice-05-choice.mp3", [
        ("沈曜沒有拔刀", "Default", 2.2),
        ("他先去敲\\N周嬸家的灶門", "Choice", 2.8),
    ]),
    ("voice-06-zhou.mp3", [
        ("都起來", "Hit", 1.4),
        ("燈點上\\N水燒開\\N誰也別裝睡", "Hit", 3.0),
    ]),
    ("voice-07-afU.mp3", [
        ("阿福拎著\\N蔥和豆腐跑出去", "Default", 3.8),
    ]),
    ("voice-08-alley.mp3", [
        ("隔壁男人故意咳", "Default", 2.0),
        ("婦人開門罵", "Default", 1.6),
        ("鍋氣和腳步聲\\N塞滿巷子", "Choice", 3.0),
    ]),
    ("voice-09-dirty.mp3", [
        ("乾淨死局\\N髒了", "Default", 2.4),
        ("吵了\\N活人都在場", "Hit", 2.4),
    ]),
    ("voice-10-payoff.mp3", [
        ("第七欄最怕的\\N不是刀", "Default", 2.8),
        ("是每一戶都醒著", "Choice", 2.6),
    ]),
    ("voice-11-cta.mp3", [
        ("去天書小說\\N看《星骸王座》", "Choice", 3.0),
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
    "Style: Choice,STHeiti,76,&H00FFF1C8,&H00FFFFFF,&HDD160B03,&HAA000000,-1,0,0,0,100,100,1,0,3,5,0,2,70,70,300,1",
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
printf "file '%s'\n" "$BASE/tmp/voice-02-silent.mp3" >> "$BASE/tmp/voice-segments.txt"
printf "file '%s'\n" "$BASE/tmp/voice-03-rule.mp3" >> "$BASE/tmp/voice-segments.txt"
printf "file '%s'\n" "$BASE/tmp/voice-04-meaning.mp3" >> "$BASE/tmp/voice-segments.txt"
printf "file '%s'\n" "$BASE/tmp/voice-05-choice.mp3" >> "$BASE/tmp/voice-segments.txt"
printf "file '%s'\n" "$BASE/tmp/voice-06-zhou.mp3" >> "$BASE/tmp/voice-segments.txt"
printf "file '%s'\n" "$BASE/tmp/voice-07-afU.mp3" >> "$BASE/tmp/voice-segments.txt"
printf "file '%s'\n" "$BASE/tmp/voice-08-alley.mp3" >> "$BASE/tmp/voice-segments.txt"
printf "file '%s'\n" "$BASE/tmp/voice-09-dirty.mp3" >> "$BASE/tmp/voice-segments.txt"
printf "file '%s'\n" "$BASE/tmp/voice-10-payoff.mp3" >> "$BASE/tmp/voice-segments.txt"
printf "file '%s'\n" "$BASE/tmp/voice-11-cta.mp3" >> "$BASE/tmp/voice-segments.txt"

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

durations=(4.2 4.2 4.8 5.0 5.4 5.2 5.1 6.3 5.6 5.2 9.0)
pan_x=(-18 22 -24 18 -16 16 24 -26 20 -18 0)
pan_y=(20 -18 18 -22 16 -16 18 -18 22 -14 0)

for i in $(seq -w 1 11); do
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
  -filter_complex "atrim=0:$TOTAL_DURATION,asetpts=PTS-STARTPTS,volume=0.16,highpass=f=55,lowpass=f=9000,afade=t=in:st=0:d=2,afade=t=out:st=58.8:d=5.5,alimiter=limit=0.52[a]" \
  -map "[a]" -ar 44100 -ac 2 -c:a aac -b:a 160k "$MUSIC"

"$FFMPEG" -y -v warning -i "$BASE/tmp/slideshow.mp4" -i "$VOICE_ACTED" -i "$MUSIC" \
  -filter_complex "[0:v]ass='$BASE/subtitles/subtitles.ass'[v];[1:a]volume=1.48,highpass=f=85,lowpass=f=11800,acompressor=threshold=-20dB:ratio=2.7:attack=5:release=105[narr];[2:a]volume=0.40[bed];[narr][bed]amix=inputs=2:duration=longest:normalize=0,alimiter=limit=0.88[a]" \
  -map "[v]" -map "[a]" -t "$TOTAL_DURATION" -c:v libx264 -preset medium -crf 19 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart "$VIDEO"

"$FFPROBE" -v error -select_streams v:0 -show_entries stream=width,height,sample_aspect_ratio,display_aspect_ratio,r_frame_rate,duration -of default=nw=1 "$VIDEO"
"$FFPROBE" -v error -select_streams a:0 -show_entries stream=codec_name,sample_rate,channels,duration -of default=nw=1 "$VIDEO"
"$FFMPEG" -i "$VIDEO" -af volumedetect -f null - 2>&1 | rg 'mean_volume|max_volume' || true
