#!/usr/bin/env python3
"""Run QA checks for a Tianshu audiobook chapter video."""

from __future__ import annotations

import argparse
import json
import math
import re
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


FFMPEG = Path("/opt/homebrew/bin/ffmpeg")
FFPROBE = Path("/opt/homebrew/bin/ffprobe")
CANVAS = (320, 180)
BAD_SRT_PREFIX = set("，。！？；：、）」』】》〉")


def font(size: int) -> ImageFont.ImageFont:
    for path in [
        "/System/Library/Fonts/PingFang.ttc",
        "/System/Library/Fonts/STHeiti Medium.ttc",
        "/System/Library/Fonts/Supplemental/Songti.ttc",
    ]:
        if Path(path).exists():
            return ImageFont.truetype(path, size=size)
    return ImageFont.load_default()


def run(cmd: list[str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(cmd, check=True, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)


def ffprobe(video: Path) -> dict:
    result = run([
        str(FFPROBE),
        "-v",
        "error",
        "-print_format",
        "json",
        "-show_format",
        "-show_streams",
        str(video),
    ])
    return json.loads(result.stdout)


def parse_duration(data: dict) -> float:
    duration = data.get("format", {}).get("duration")
    return float(duration or 0)


def volume_stats(video: Path) -> tuple[str | None, str | None]:
    result = subprocess.run(
        [str(FFMPEG), "-hide_banner", "-i", str(video), "-af", "volumedetect", "-vn", "-sn", "-dn", "-f", "null", "/dev/null"],
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    text = result.stdout + "\n" + result.stderr
    mean = re.search(r"mean_volume:\s*([-\d.]+ dB)", text)
    maxv = re.search(r"max_volume:\s*([-\d.]+ dB)", text)
    return (mean.group(1) if mean else None, maxv.group(1) if maxv else None)


def srt_stats(path: Path) -> dict:
    if not path.exists():
        return {"exists": False}
    text = path.read_text(encoding="utf-8")
    blocks = [block.strip() for block in re.split(r"\n\s*\n", text) if block.strip()]
    lines: list[str] = []
    for block in blocks:
        for line in block.splitlines()[2:]:
            clean = line.strip()
            if clean:
                lines.append(clean)
    bad_prefix = [line for line in lines if line and line[0] in BAD_SRT_PREFIX]
    long_lines = [line for line in lines if len(line) > 22]
    return {
        "exists": True,
        "cues": len(blocks),
        "lines": len(lines),
        "max_line_length": max((len(line) for line in lines), default=0),
        "bad_prefix_count": len(bad_prefix),
        "long_line_count": len(long_lines),
    }


def extract_frames(video: Path, qa_dir: Path, duration: float, chapter_no: int) -> Path:
    qa_dir.mkdir(parents=True, exist_ok=True)
    points = [max(2, duration * p) for p in (0.05, 0.20, 0.38, 0.56, 0.74, 0.92)]
    frames: list[Path] = []
    for index, seconds in enumerate(points, start=1):
        out = qa_dir / f"ch{chapter_no:02d}-frame-{index:02d}.jpg"
        run([
            str(FFMPEG),
            "-hide_banner",
            "-y",
            "-ss",
            f"{seconds:.3f}",
            "-i",
            str(video),
            "-frames:v",
            "1",
            "-q:v",
            "2",
            str(out),
        ])
        frames.append(out)
    sheet = qa_dir / f"ch{chapter_no:02d}-frame-contact-sheet.png"
    make_contact_sheet(frames, sheet)
    return sheet


def make_contact_sheet(paths: list[Path], out: Path) -> None:
    cols = 3
    rows = math.ceil(len(paths) / cols)
    sheet = Image.new("RGB", (cols * CANVAS[0], rows * (CANVAS[1] + 40)), (14, 16, 18))
    draw = ImageDraw.Draw(sheet)
    ft = font(15)
    for index, path in enumerate(paths):
        img = Image.open(path).convert("RGB").resize(CANVAS, Image.Resampling.LANCZOS)
        x = (index % cols) * CANVAS[0]
        y = (index // cols) * (CANVAS[1] + 40)
        sheet.paste(img, (x, y))
        draw.text((x + 8, y + CANVAS[1] + 8), path.name, font=ft, fill=(230, 230, 230))
    sheet.save(out, optimize=True)


def select_stream(data: dict, kind: str) -> dict:
    for stream in data.get("streams", []):
        if stream.get("codec_type") == kind:
            return stream
    return {}


def write_notes(args: argparse.Namespace, summary: dict) -> None:
    title_only = args.chapter_title.split(" ", 1)[1] if " " in args.chapter_title else args.chapter_title
    notes_dir = args.output_dir / "notes"
    notes_dir.mkdir(parents=True, exist_ok=True)
    video_rel = f"output/{Path(summary['video']).name}"
    srt_name = Path(summary["srt"]).name if summary.get("srt") else ""
    lines = [
        f"# {args.chapter_title}｜製作紀錄",
        "",
        "## 視覺設計",
        "",
        f"- 主軸：{args.visual_brief}",
        f"- 主圖來源：{args.image_note}",
        "- 所有主圖均為章節專屬故事圖，圖內不放標題、logo、浮水印或可讀宣傳文字；標題與社群文字使用本機字體後製。",
        "",
        "## 輸出檔案",
        "",
        f"- 影片：`{video_rel}`",
        f"- YouTube 縮圖：`thumbnails/星骸王座-第{args.chapter_no:02d}章-{title_only}-thumbnail.png`",
        "- IG 宣傳圖：`output/instagram-promo.png`",
        f"- 字幕：`subtitles/{srt_name}`",
        f"- 主圖 QA：`qa/ch{args.chapter_no:02d}-slide-contact-sheet.png`",
        f"- 影片抽幀 QA：`qa/ch{args.chapter_no:02d}-frame-contact-sheet.png`",
        "",
        "## Build",
        "",
        f"- `{args.build_command}`",
        "",
        "## QA",
        "",
        f"- 影片格式：{summary['video_codec']} / {summary['width']}x{summary['height']} / {summary['frame_rate']}fps / {summary['pix_fmt'] or 'unknown'}。",
        f"- 影片長度：{summary['duration']:.6f} 秒。",
        f"- 檔案大小：{summary['file_size']} bytes。",
        f"- 音量：mean {summary.get('mean_volume') or 'unknown'}，max {summary.get('max_volume') or 'unknown'}。",
    ]
    srt = summary.get("srt_stats", {})
    if srt.get("exists"):
        lines.append(
            f"- 字幕：{srt['cues']} cues，{srt['lines']} 行，最長 {srt['max_line_length']} 字，開頭標點 {srt['bad_prefix_count']} 行，超過 22 字 {srt['long_line_count']} 行。"
        )
    else:
        lines.append("- 字幕：未找到 SRT。")
    lines.append("- 抽幀確認：已輸出 contact sheet，用於檢查滿版畫面、字幕可讀性與無明顯卡頓/黑畫面。")
    (notes_dir / "production-notes.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--chapter-no", type=int, required=True)
    parser.add_argument("--chapter-title", required=True)
    parser.add_argument("--output-dir", type=Path, required=True)
    parser.add_argument("--visual-brief", required=True)
    parser.add_argument("--image-note", required=True)
    parser.add_argument("--build-command", required=True)
    args = parser.parse_args()

    videos = sorted((args.output_dir / "output").glob("*.mp4"))
    if not videos:
        raise SystemExit(f"No mp4 found in {args.output_dir / 'output'}")
    video = max(videos, key=lambda path: path.stat().st_mtime)
    data = ffprobe(video)
    vstream = select_stream(data, "video")
    duration = parse_duration(data)
    mean_volume, max_volume = volume_stats(video)
    frame_sheet = extract_frames(video, args.output_dir / "qa", duration, args.chapter_no)
    srts = sorted((args.output_dir / "subtitles").glob("*.srt"))
    srt = srts[0] if srts else None
    srt_info = srt_stats(srt) if srt else {"exists": False}

    rate = vstream.get("avg_frame_rate") or vstream.get("r_frame_rate") or "0/1"
    if "/" in rate:
        num, den = rate.split("/", 1)
        try:
            frame_rate = f"{float(num) / float(den):.3f}".rstrip("0").rstrip(".")
        except Exception:
            frame_rate = rate
    else:
        frame_rate = rate
    summary = {
        "video": str(video),
        "srt": str(srt) if srt else None,
        "frame_sheet": str(frame_sheet),
        "duration": duration,
        "file_size": video.stat().st_size,
        "video_codec": vstream.get("codec_name"),
        "width": vstream.get("width"),
        "height": vstream.get("height"),
        "frame_rate": frame_rate,
        "pix_fmt": vstream.get("pix_fmt"),
        "mean_volume": mean_volume,
        "max_volume": max_volume,
        "srt_stats": srt_info,
    }
    (args.output_dir / "qa" / "qa-summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    write_notes(args, summary)
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
