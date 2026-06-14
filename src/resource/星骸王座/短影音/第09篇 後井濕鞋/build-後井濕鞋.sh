#!/usr/bin/env bash
set -euo pipefail
BASE="$(cd "$(dirname "$0")" && pwd)"
FFMPEG="${FFMPEG:-/opt/homebrew/bin/ffmpeg}"
FFPROBE="${FFPROBE:-/opt/homebrew/bin/ffprobe}"
if [[ ! -x "$FFMPEG" ]]; then FFMPEG="$(command -v ffmpeg)"; fi
if [[ ! -x "$FFPROBE" ]]; then FFPROBE="$(command -v ffprobe)"; fi
CONFIG="$BASE/source/storyboard.json"
json_value() {
  KEY="$1" CONFIG="$CONFIG" python3 - <<'PY'
import json
import os

with open(os.environ["CONFIG"], encoding="utf-8") as f:
    data = json.load(f)
value = data[os.environ["KEY"]]
if isinstance(value, float):
    print(f"{value:.2f}")
else:
    print(value)
PY
}
TOTAL_DURATION="$(json_value totalDuration)"
SUBTITLE_CUTOFF="$(json_value subtitleCutoff)"
OUTPUT_FILE="$(json_value outputFile)"
VIDEO="$BASE/output/$OUTPUT_FILE"
VOICE_ACTED="$BASE/voice/edge-acted-narration.m4a"
mkdir -p "$BASE/source/normalized" "$BASE/tmp" "$BASE/output" "$BASE/voice" "$BASE/subtitles" "$BASE/qa"
find "$BASE/tmp" -maxdepth 1 -type f \( -name 'seg-*.mp4' -o -name 'segments.txt' -o -name 'slideshow.mp4' -o -name 'voice-*.txt' -o -name 'voice-*.mp3' -o -name 'voice-segments.txt' -o -name 'voice-plan.tsv' -o -name 'frame-plan.tsv' \) -delete
BASE="$BASE" CONFIG="$CONFIG" python3 - <<'PY'
import json, os, re
from pathlib import Path
base=Path(os.environ['BASE']); data=json.load(open(os.environ['CONFIG'],encoding='utf-8'))
plan=[]
for i,seg in enumerate(data['voiceSegments'],1):
    slug=re.sub(r'[^A-Za-z0-9_-]+','-',seg['slug']).strip('-') or f'seg{i:02d}'
    (base/'tmp'/f'voice-{i:02d}-{slug}.txt').write_text(seg['text'].strip()+'\n',encoding='utf-8')
    plan.append('\t'.join([f'{i:02d}',slug,seg['voice'],seg.get('rate','+0%'),seg.get('pitch','+0Hz')]))
(base/'tmp'/'voice-plan.tsv').write_text('\n'.join(plan)+'\n',encoding='utf-8')
PY
while IFS=$'\t' read -r idx slug voice rate pitch; do
  python3 -m edge_tts --file "$BASE/tmp/voice-$idx-$slug.txt" --voice "$voice" --rate="$rate" --pitch="$pitch" --write-media "$BASE/tmp/voice-$idx-$slug.mp3"
done < "$BASE/tmp/voice-plan.tsv"
: > "$BASE/tmp/voice-segments.txt"
while IFS=$'\t' read -r idx slug voice rate pitch; do printf "file '%s'\n" "$BASE/tmp/voice-$idx-$slug.mp3" >> "$BASE/tmp/voice-segments.txt"; done < "$BASE/tmp/voice-plan.tsv"
"$FFMPEG" -y -v warning -f concat -safe 0 -i "$BASE/tmp/voice-segments.txt" -af "aresample=24000,apad=pad_dur=0.8" -c:a aac -b:a 160k "$VOICE_ACTED"
BASE="$BASE" FFPROBE="$FFPROBE" TOTAL_DURATION="$TOTAL_DURATION" python3 - <<'PY'
import os, subprocess
from pathlib import Path
base=Path(os.environ['BASE']); total=float(os.environ['TOTAL_DURATION']); ffprobe=os.environ['FFPROBE']; voice=base/'voice'/'edge-acted-narration.m4a'
dur=float(subprocess.check_output([ffprobe,'-v','error','-show_entries','format=duration','-of','default=nw=1:nk=1',str(voice)],text=True).strip())
if dur > total - .2: raise SystemExit(f'voice track {dur:.3f}s exceeds safe video duration {total:.3f}s; rewrite or extend before final encode')
print(f'voice_duration={dur:.3f}s')
PY
BASE="$BASE" CONFIG="$CONFIG" FFPROBE="$FFPROBE" SUBTITLE_CUTOFF="$SUBTITLE_CUTOFF" python3 - <<'PY'
import json, os, subprocess, re
from pathlib import Path
base=Path(os.environ['BASE']); data=json.load(open(os.environ['CONFIG'],encoding='utf-8')); ffprobe=os.environ['FFPROBE']; cutoff=float(os.environ['SUBTITLE_CUTOFF'])
def duration(path): return float(subprocess.check_output([ffprobe,'-v','error','-show_entries','format=duration','-of','default=nw=1:nk=1',str(path)],text=True).strip())
def ass_time(s):
    s=max(0,s); h=int(s//3600); m=int((s%3600)//60); sec=int(s%60); c=int(round((s-int(s))*100))
    if c==100: sec+=1; c=0
    return f'{h}:{m:02d}:{sec:02d}.{c:02d}'
def srt_time(s):
    s=max(0,s); h=int(s//3600); m=int((s%3600)//60); sec=int(s%60); ms=int(round((s-int(s))*1000))
    if ms==1000: sec+=1; ms=0
    return f'{h:02d}:{m:02d}:{sec:02d},{ms:03d}'
def split_phrases(text):
    parts=[]; buf=''
    for ch in text.strip():
        if ch in '，。！？；：、':
            if buf.strip(): parts.append(buf.strip()); buf=''
        else:
            buf+=ch
    if buf.strip(): parts.append(buf.strip())
    out=[]
    for p in parts:
        while len(p)>13:
            out.append(p[:13]); p=p[13:]
        if p: out.append(p)
    return out or [text.strip()]
def make_cues(text, style):
    parts=split_phrases(text)
    cues=[]; i=0
    while i<len(parts):
        line=parts[i]
        if i+1<len(parts) and len(line)+len(parts[i+1])<=18:
            line=line+'\\N'+parts[i+1]; i+=2
        else:
            i+=1
        cues.append({'text':line,'style':style,'weight':max(1.0,len(line.replace('\\N',''))/6)})
    return cues
events=[]; cursor=0.0
for i,seg in enumerate(data['voiceSegments'],1):
    slug=re.sub(r'[^A-Za-z0-9_-]+','-',seg['slug']).strip('-') or f'seg{i:02d}'
    sd=duration(base/'tmp'/f'voice-{i:02d}-{slug}.mp3')
    cues=make_cues(seg['text'], seg.get('style','Default')); total=sum(c['weight'] for c in cues); seg_cursor=cursor
    for ci,cue in enumerate(cues):
        start=seg_cursor; end=cursor+sd if ci==len(cues)-1 else seg_cursor+sd*(cue['weight']/total)
        if start>=cutoff: break
        end=min(end,cutoff-.05)
        if end-start>=.35: events.append((start,end,cue['style'],cue['text']))
        seg_cursor=end
    cursor+=sd
sub=base/'subtitles'; sub.mkdir(exist_ok=True)
ass=['[Script Info]','ScriptType: v4.00+','PlayResX: 1080','PlayResY: 1920','ScaledBorderAndShadow: yes','','[V4+ Styles]','Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding','Style: Default,STHeiti,72,&H00FFFFFF,&H00FFFFFF,&HDD070402,&HAA000000,-1,0,0,0,100,100,1,0,3,5,0,2,70,70,320,1','Style: Hit,STHeiti,84,&H00FFFFFF,&H00FFFFFF,&HDD180600,&HAA000000,-1,0,0,0,100,100,1,0,3,7,0,2,65,65,350,1','Style: Choice,STHeiti,76,&H00EAF8FF,&H00FFFFFF,&HDD160B03,&HAA000000,-1,0,0,0,100,100,1,0,3,5,0,2,70,70,300,1','','[Events]','Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text']
for start,end,style,text in events: ass.append(f'Dialogue: 0,{ass_time(start)},{ass_time(end)},{style},,0,0,0,,{text}')
(sub/'subtitles.ass').write_text('\n'.join(ass)+'\n',encoding='utf-8')
srt=[]
for n,(start,end,_,text) in enumerate(events,1): srt += [str(n),f'{srt_time(start)} --> {srt_time(end)}',*text.replace('\\N','\n').splitlines(),'']
(sub/'subtitles.srt').write_text('\n'.join(srt),encoding='utf-8')
PY
for source in "$BASE"/source/images/frame-*.png; do name="$(basename "$source")"; "$FFMPEG" -y -v error -i "$source" -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1" "$BASE/source/normalized/$name"; done
BASE="$BASE" CONFIG="$CONFIG" python3 - <<'PY'
import json, os
from pathlib import Path
base=Path(os.environ['BASE']); data=json.load(open(os.environ['CONFIG'],encoding='utf-8'))
lines=['\t'.join([f'{i:02d}',f['file'],f"{f['duration']:.2f}",str(f.get('panX',0)),str(f.get('panY',0))]) for i,f in enumerate(data['frames'],1)]
(base/'tmp'/'frame-plan.tsv').write_text('\n'.join(lines)+'\n',encoding='utf-8')
PY
: > "$BASE/tmp/segments.txt"
while IFS=$'\t' read -r idx file duration dx dy; do
  fade_start="$(awk -v d="$duration" 'BEGIN { printf "%.2f", d - 0.18 }')"
  "$FFMPEG" -y -v error -loop 1 -t "$duration" -i "$BASE/source/normalized/$file" -vf "scale=1180:2098:force_original_aspect_ratio=increase,crop=1180:2098,crop=1080:1920:x='(iw-ow)/2+($dx*t/$duration)':y='(ih-oh)/2+($dy*t/$duration)',setsar=1,fade=t=in:st=0:d=0.16,fade=t=out:st=$fade_start:d=0.18,fps=30,format=yuv420p" -c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p "$BASE/tmp/seg-$idx.mp4"
  printf "file '%s'\n" "seg-$idx.mp4" >> "$BASE/tmp/segments.txt"
done < "$BASE/tmp/frame-plan.tsv"
(cd "$BASE/tmp" && "$FFMPEG" -y -v error -f concat -safe 0 -i segments.txt -c copy slideshow.mp4)
"$FFMPEG" -y -v warning -i "$BASE/tmp/slideshow.mp4" -i "$VOICE_ACTED" -filter_complex "[0:v]ass='$BASE/subtitles/subtitles.ass'[v];[1:a]volume=1.60,highpass=f=85,lowpass=f=11800,acompressor=threshold=-20dB:ratio=2.7:attack=5:release=105,apad,atrim=0:$TOTAL_DURATION,alimiter=limit=0.88[a]" -map "[v]" -map "[a]" -t "$TOTAL_DURATION" -c:v libx264 -preset medium -crf 19 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart "$VIDEO"
"$FFPROBE" -v error -select_streams v:0 -show_entries stream=width,height,sample_aspect_ratio,display_aspect_ratio,r_frame_rate,duration -of default=nw=1 "$VIDEO"
"$FFPROBE" -v error -select_streams a:0 -show_entries stream=codec_name,sample_rate,channels,duration -of default=nw=1 "$VIDEO"
"$FFMPEG" -i "$VIDEO" -af volumedetect -f null - 2>&1 | rg 'mean_volume|max_volume' || true
BASE="$BASE" VIDEO="$VIDEO" python3 - <<'PY'
import os, subprocess
from pathlib import Path
from PIL import Image
base=Path(os.environ['BASE']); video=Path(os.environ['VIDEO']); times=[2,12,24,36,48,57]; imgs=[]
for t in times:
    out=base/'qa'/f'frame-{int(t):04d}.png'; subprocess.run(['ffmpeg','-y','-v','error','-ss',str(t),'-i',str(video),'-frames:v','1',str(out)],check=True); imgs.append(out)
thumbs=[Image.open(p).convert('RGB').resize((180,320)) for p in imgs]
sheet=Image.new('RGB',(540,640),(8,8,8))
for i,im in enumerate(thumbs): sheet.paste(im,((i%3)*180,(i//3)*320))
sheet.save(base/'qa'/'contact-sheet.png')
PY
