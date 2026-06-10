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

VIDEO="$BASE/output/星骸王座-短影音-第04篇-活手亂槽-1080x1920.mp4"
VOICE_ACTED="$BASE/voice/edge-acted-narration.m4a"
LICENSED_MUSIC="$BASE/music/Darkling-Kevin-MacLeod.mp3"
MUSIC="$BASE/music/living-hands-bed.m4a"
TOTAL_DURATION="64.00"
SUBTITLE_CUTOFF="53.50"

mkdir -p "$BASE/source/normalized" "$BASE/tmp" "$BASE/output" "$BASE/voice" "$BASE/subtitles" "$BASE/music" "$BASE/qa"

find "$BASE/tmp" -maxdepth 1 -type f \( \
  -name 'seg-*.mp4' -o -name 'segments.txt' -o -name 'slideshow.mp4' -o \
  -name 'voice-*.txt' -o -name 'voice-*.mp3' -o -name 'voice-segments.txt' \
\) -delete

cat > "$BASE/tmp/voice-01-hook.txt" <<'EOF'
他們要認一隻手。
沈曜叫來整條巷子的手。
EOF

cat > "$BASE/tmp/voice-02-hands.txt" <<'EOF'
洗布婦、挑灰漢、藥鋪小夥計。
全往板上按。
EOF

cat > "$BASE/tmp/voice-03-enemy.txt" <<'EOF'
別亂。
我要的是那一隻真手。
EOF

cat > "$BASE/tmp/voice-04-board.txt" <<'EOF'
第七欄靠乾板認人。
手汗、藥氣、濕氣，都不能亂。
EOF

cat > "$BASE/tmp/voice-05-setup.txt" <<'EOF'
阿棠撒粉。
周嬸拖來舊門板。
EOF

cat > "$BASE/tmp/voice-06-zhou.txt" <<'EOF'
都按！
誰的手沒做過活？讓它認個夠。
EOF

cat > "$BASE/tmp/voice-07-splash.txt" <<'EOF'
阿福一瓢豆渣灰水潑下去。
灰頁濕了，乾板也濕了。
EOF

cat > "$BASE/tmp/voice-08-bloom.txt" <<'EOF'
一條紋變成十幾條手路。
EOF

cat > "$BASE/tmp/voice-09-tangle.txt" <<'EOF'
掌心、虎口、老繭。
全咬在一起。
EOF

cat > "$BASE/tmp/voice-10-payoff.txt" <<'EOF'
敵人想靠乾淨收人。
這一回，被活人弄到失準。
EOF

cat > "$BASE/tmp/voice-11-cta.txt" <<'EOF'
想看普通人怎麼反咬第七欄，
去天書小說，看星骸王座。
EOF

python3 -m edge_tts --file "$BASE/tmp/voice-01-hook.txt" --voice "zh-TW-HsiaoChenNeural" --rate=+5% --pitch=-2Hz --write-media "$BASE/tmp/voice-01-hook.mp3"
python3 -m edge_tts --file "$BASE/tmp/voice-02-hands.txt" --voice "zh-TW-HsiaoChenNeural" --rate=+2% --pitch=-3Hz --write-media "$BASE/tmp/voice-02-hands.mp3"
python3 -m edge_tts --file "$BASE/tmp/voice-03-enemy.txt" --voice "zh-TW-YunJheNeural" --rate=-2% --pitch=-2Hz --write-media "$BASE/tmp/voice-03-enemy.mp3"
python3 -m edge_tts --file "$BASE/tmp/voice-04-board.txt" --voice "zh-TW-HsiaoChenNeural" --rate=-1% --pitch=-3Hz --write-media "$BASE/tmp/voice-04-board.mp3"
python3 -m edge_tts --file "$BASE/tmp/voice-05-setup.txt" --voice "zh-TW-HsiaoChenNeural" --rate=+2% --pitch=-3Hz --write-media "$BASE/tmp/voice-05-setup.mp3"
python3 -m edge_tts --file "$BASE/tmp/voice-06-zhou.txt" --voice "zh-TW-HsiaoChenNeural" --rate=+8% --pitch=-8Hz --write-media "$BASE/tmp/voice-06-zhou.mp3"
python3 -m edge_tts --file "$BASE/tmp/voice-07-splash.txt" --voice "zh-TW-HsiaoChenNeural" --rate=+3% --pitch=-2Hz --write-media "$BASE/tmp/voice-07-splash.mp3"
python3 -m edge_tts --file "$BASE/tmp/voice-08-bloom.txt" --voice "zh-TW-HsiaoChenNeural" --rate=-1% --pitch=-3Hz --write-media "$BASE/tmp/voice-08-bloom.mp3"
python3 -m edge_tts --file "$BASE/tmp/voice-09-tangle.txt" --voice "zh-TW-HsiaoChenNeural" --rate=-2% --pitch=-3Hz --write-media "$BASE/tmp/voice-09-tangle.mp3"
python3 -m edge_tts --file "$BASE/tmp/voice-10-payoff.txt" --voice "zh-TW-HsiaoChenNeural" --rate=-1% --pitch=-3Hz --write-media "$BASE/tmp/voice-10-payoff.mp3"
python3 -m edge_tts --file "$BASE/tmp/voice-11-cta.txt" --voice "zh-TW-HsiaoChenNeural" --rate=+0% --pitch=-3Hz --write-media "$BASE/tmp/voice-11-cta.mp3"

BASE="$BASE" FFPROBE="$FFPROBE" SUBTITLE_CUTOFF="$SUBTITLE_CUTOFF" python3 - <<'PY'
import os, subprocess
from pathlib import Path
base = Path(os.environ["BASE"])
ffprobe = os.environ["FFPROBE"]
subtitle_cutoff = float(os.environ["SUBTITLE_CUTOFF"])
segments = [
    ("voice-01-hook.mp3", [("他們要認一隻手", "Hit", 2.4), ("沈曜叫來\\N整條巷子的手", "Hit", 2.8)]),
    ("voice-02-hands.mp3", [("洗布婦\\N挑灰漢\\N藥鋪小夥計", "Default", 3.2), ("全往板上按", "Choice", 1.8)]),
    ("voice-03-enemy.mp3", [("別亂", "Hit", 1.5), ("我要的是\\N那一隻真手", "Hit", 2.7)]),
    ("voice-04-board.mp3", [("第七欄靠乾板認人", "Default", 2.6), ("手汗\\N藥氣\\N濕氣", "Default", 2.7), ("都不能亂", "Hit", 1.8)]),
    ("voice-05-setup.mp3", [("阿棠撒粉", "Default", 1.6), ("周嬸拖來舊門板", "Choice", 2.6)]),
    ("voice-06-zhou.mp3", [("都按", "Hit", 1.2), ("誰的手沒做過活\\N讓它認個夠", "Hit", 3.1)]),
    ("voice-07-splash.mp3", [("阿福一瓢灰水\\N潑下去", "Default", 2.8), ("灰頁濕了\\N乾板也濕了", "Hit", 2.6)]),
    ("voice-08-bloom.mp3", [("一條紋\\N變成十幾條手路", "Choice", 4.0)]),
    ("voice-09-tangle.mp3", [("掌心\\N虎口\\N老繭", "Default", 2.6), ("全咬在一起", "Choice", 2.0)]),
    ("voice-10-payoff.mp3", [("敵人想靠乾淨收人", "Default", 2.8), ("這一回\\N被活人弄到失準", "Choice", 3.0)]),
    ("voice-11-cta.mp3", [("想看普通人\\N怎麼反咬第七欄", "Default", 3.0), ("去天書小說\\N看《星骸王座》", "Choice", 2.8)]),
]
def duration(path: Path) -> float:
    return float(subprocess.check_output([ffprobe, "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", str(path)], text=True).strip())
def ass_time(seconds: float) -> str:
    seconds=max(0,seconds); h=int(seconds//3600); m=int((seconds%3600)//60); s=int(seconds%60); c=int(round((seconds-int(seconds))*100))
    if c==100: s+=1; c=0
    return f"{h}:{m:02d}:{s:02d}.{c:02d}"
def srt_time(seconds: float) -> str:
    seconds=max(0,seconds); h=int(seconds//3600); m=int((seconds%3600)//60); s=int(seconds%60); ms=int(round((seconds-int(seconds))*1000))
    if ms==1000: s+=1; ms=0
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"
events=[]; cursor=0.0
for filename, cues in segments:
    seg_dur=duration(base/"tmp"/filename)
    total_weight=sum(weight for _,_,weight in cues)
    seg_cursor=cursor
    for cue_index,(text,style,weight) in enumerate(cues):
        start=seg_cursor
        end=cursor+seg_dur if cue_index==len(cues)-1 else seg_cursor+seg_dur*(weight/total_weight)
        if start >= subtitle_cutoff:
            break
        end=min(end, subtitle_cutoff-0.05)
        if end-start >= 0.35:
            events.append((start,end,style,text))
        seg_cursor=end
    cursor += seg_dur
subtitle_dir=base/"subtitles"; subtitle_dir.mkdir(parents=True,exist_ok=True)
ass_lines=[
    "[Script Info]","ScriptType: v4.00+","PlayResX: 1080","PlayResY: 1920","ScaledBorderAndShadow: yes","",
    "[V4+ Styles]",
    "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
    "Style: Default,STHeiti,72,&H00FFFFFF,&H00FFFFFF,&HDD070402,&HAA000000,-1,0,0,0,100,100,1,0,3,5,0,2,70,70,320,1",
    "Style: Hit,STHeiti,84,&H00FFFFFF,&H00FFFFFF,&HDD180600,&HAA000000,-1,0,0,0,100,100,1,0,3,7,0,2,65,65,350,1",
    "Style: Choice,STHeiti,76,&H00EAF8FF,&H00FFFFFF,&HDD160B03,&HAA000000,-1,0,0,0,100,100,1,0,3,5,0,2,70,70,300,1",
    "","[Events]","Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
]
for start,end,style,text in events:
    ass_lines.append(f"Dialogue: 0,{ass_time(start)},{ass_time(end)},{style},,0,0,0,,{text}")
(subtitle_dir/"subtitles.ass").write_text("\n".join(ass_lines)+"\n",encoding="utf-8")
srt=[]
for idx,(start,end,_,text) in enumerate(events,1):
    srt += [str(idx), f"{srt_time(start)} --> {srt_time(end)}", *text.replace("\\N","\n").splitlines(), ""]
(subtitle_dir/"subtitles.srt").write_text("\n".join(srt),encoding="utf-8")
PY

printf "file '%s'\n" "$BASE/tmp/voice-01-hook.mp3" > "$BASE/tmp/voice-segments.txt"
printf "file '%s'\n" "$BASE/tmp/voice-02-hands.mp3" >> "$BASE/tmp/voice-segments.txt"
printf "file '%s'\n" "$BASE/tmp/voice-03-enemy.mp3" >> "$BASE/tmp/voice-segments.txt"
printf "file '%s'\n" "$BASE/tmp/voice-04-board.mp3" >> "$BASE/tmp/voice-segments.txt"
printf "file '%s'\n" "$BASE/tmp/voice-05-setup.mp3" >> "$BASE/tmp/voice-segments.txt"
printf "file '%s'\n" "$BASE/tmp/voice-06-zhou.mp3" >> "$BASE/tmp/voice-segments.txt"
printf "file '%s'\n" "$BASE/tmp/voice-07-splash.mp3" >> "$BASE/tmp/voice-segments.txt"
printf "file '%s'\n" "$BASE/tmp/voice-08-bloom.mp3" >> "$BASE/tmp/voice-segments.txt"
printf "file '%s'\n" "$BASE/tmp/voice-09-tangle.mp3" >> "$BASE/tmp/voice-segments.txt"
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

durations=(4.4 5.0 5.0 5.2 5.0 5.2 5.5 6.0 6.0 6.2 10.5)
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
  -filter_complex "atrim=0:$TOTAL_DURATION,asetpts=PTS-STARTPTS,volume=0.17,highpass=f=55,lowpass=f=9000,afade=t=in:st=0:d=2,afade=t=out:st=56:d=6.5,alimiter=limit=0.52[a]" \
  -map "[a]" -ar 44100 -ac 2 -c:a aac -b:a 160k "$MUSIC"

"$FFMPEG" -y -v warning -i "$BASE/tmp/slideshow.mp4" -i "$VOICE_ACTED" -i "$MUSIC" \
  -filter_complex "[0:v]ass='$BASE/subtitles/subtitles.ass'[v];[1:a]volume=1.48,highpass=f=85,lowpass=f=11800,acompressor=threshold=-20dB:ratio=2.7:attack=5:release=105[narr];[2:a]volume=0.40[bed];[narr][bed]amix=inputs=2:duration=longest:normalize=0,alimiter=limit=0.88[a]" \
  -map "[v]" -map "[a]" -t "$TOTAL_DURATION" -c:v libx264 -preset medium -crf 19 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart "$VIDEO"

"$FFPROBE" -v error -select_streams v:0 -show_entries stream=width,height,sample_aspect_ratio,display_aspect_ratio,r_frame_rate,duration -of default=nw=1 "$VIDEO"
"$FFPROBE" -v error -select_streams a:0 -show_entries stream=codec_name,sample_rate,channels,duration -of default=nw=1 "$VIDEO"
"$FFMPEG" -i "$VIDEO" -af volumedetect -f null - 2>&1 | rg 'mean_volume|max_volume' || true
