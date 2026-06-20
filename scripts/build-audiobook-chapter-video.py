#!/usr/bin/env python3
from __future__ import annotations

import argparse
import math
import os
import random
import re
import shutil
import socket
import subprocess
import textwrap
import time
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
CANVAS = (1280, 720)
FPS = 24
EDGE_RATE = "+0%"
EDGE_PITCH = "-2Hz"
MAX_SLIDE_SECONDS = 300
MAX_CAPTION_CHARS = 28
MAX_CAPTION_SECONDS = 4.8
NARRATION_VOLUME = 0.92
RAIN_WHITE_NOISE_VOLUME = 0.20
RAIN_FINE_VOLUME = 0.020
RAIN_LOW_VOLUME = 0.010
FINAL_MIX_VOLUME = 0.84
CLOSING_PUNCTUATION = "，、。：；！？）」』》】"
EDGE_TTS_RETRY_ATTEMPTS = 2
EDGE_TTS_TIMEOUT_SECONDS = 90
FFMPEG_AUDIO_TIMEOUT_SECONDS = 180
FFMPEG_VIDEO_TIMEOUT_SECONDS = 900


def assert_edge_tts_dns_available() -> None:
    try:
        socket.getaddrinfo("speech.platform.bing.com", 443)
    except OSError as error:
        raise RuntimeError(
            "Edge TTS DNS lookup failed for speech.platform.bing.com; "
            "video rebuild requires network/DNS access to Microsoft Edge TTS."
        ) from error


def run(args: list[str], capture: bool = False, timeout: float | None = None) -> subprocess.CompletedProcess[str]:
    return subprocess.run(args, check=True, cwd=ROOT, text=True, capture_output=capture, timeout=timeout)


def run_edge_tts_with_retries(
    args: list[str],
    media: Path,
    subtitles: Path,
    label: str,
) -> None:
    last_error: subprocess.CalledProcessError | subprocess.TimeoutExpired | None = None
    for attempt in range(1, EDGE_TTS_RETRY_ATTEMPTS + 1):
        for partial in (media, subtitles):
            if partial.exists():
                partial.unlink()
        try:
            run(args, timeout=EDGE_TTS_TIMEOUT_SECONDS)
        except (subprocess.CalledProcessError, subprocess.TimeoutExpired) as error:
            last_error = error
        if has_usable_file(media) and has_usable_file(subtitles):
            return
        if attempt < EDGE_TTS_RETRY_ATTEMPTS:
            time.sleep(1.5 * attempt)
    if last_error is not None:
        raise last_error
    raise RuntimeError(f"Edge TTS failed or returned empty output after retries: {label}")


def ffprobe_duration(path: Path) -> float:
    result = run(
        [
            "/opt/homebrew/bin/ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(path),
        ],
        capture=True,
    )
    return float(result.stdout.strip())


def load_font(size: int, serif: bool = False) -> ImageFont.FreeTypeFont:
    candidates = [
        "/System/Library/Fonts/Supplemental/Songti.ttc" if serif else "/System/Library/Fonts/STHeiti Medium.ttc",
        "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ]
    for candidate in candidates:
        try:
            return ImageFont.truetype(candidate, size=size)
        except OSError:
            continue
    return ImageFont.load_default()


def cover_crop(image: Image.Image, anchor: tuple[float, float]) -> Image.Image:
    image = image.convert("RGB")
    iw, ih = image.size
    cw, ch = CANVAS
    scale = max(cw / iw, ch / ih)
    resized = image.resize((int(iw * scale), int(ih * scale)), Image.Resampling.LANCZOS)
    max_x = max(0, resized.size[0] - cw)
    max_y = max(0, resized.size[1] - ch)
    left = int(max_x * anchor[0])
    top = int(max_y * anchor[1])
    return resized.crop((left, top, left + cw, top + ch))


def add_vignette(base: Image.Image) -> Image.Image:
    overlay = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    for i in range(205):
        alpha = int(118 * (i / 205) ** 1.75)
        draw.rectangle((i, i, CANVAS[0] - i, CANVAS[1] - i), outline=(0, 0, 0, alpha), width=2)
    return Image.alpha_composite(base.convert("RGBA"), overlay).convert("RGB")


def add_caption_safe_gradient(base: Image.Image) -> Image.Image:
    overlay = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    for y in range(420, CANVAS[1]):
        alpha = int(138 * ((y - 420) / (CANVAS[1] - 420)) ** 1.35)
        draw.line((0, y, CANVAS[0], y), fill=(0, 0, 0, alpha))
    return Image.alpha_composite(base.convert("RGBA"), overlay).convert("RGB")


def add_weather_texture(base: Image.Image, seed: int, density: int) -> Image.Image:
    rng = random.Random(seed)
    texture = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    draw = ImageDraw.Draw(texture)
    for _ in range(density):
        x = rng.randint(0, CANVAS[0])
        y = rng.randint(0, CANVAS[1])
        radius = rng.choice([1, 1, 1, 2, 2])
        alpha = rng.randint(22, 80)
        color = rng.choice([(210, 224, 236, alpha), (170, 190, 215, alpha), (230, 216, 180, alpha // 2)])
        draw.ellipse((x, y, x + radius, y + radius), fill=color)
    return Image.alpha_composite(base.convert("RGBA"), texture.filter(ImageFilter.GaussianBlur(0.45))).convert("RGB")


def add_label(base: Image.Image, novel: str, subtitle: str) -> Image.Image:
    image = base.convert("RGBA")
    draw = ImageDraw.Draw(image)
    title_font = load_font(29)
    sub_font = load_font(20)
    draw.rounded_rectangle((28, 28, 500, 112), radius=10, fill=(5, 9, 14, 142), outline=(213, 197, 150, 92), width=1)
    draw.text((48, 45), novel, font=title_font, fill=(236, 226, 196, 246))
    draw.text((48, 83), subtitle, font=sub_font, fill=(206, 216, 224, 226))
    return image.convert("RGB")


def available_visuals(novel: str) -> list[Path]:
    explicit = [
        ROOT / f"src/resource/{novel}/素材/圖像/首頁爆款素材/{novel}-霜河戰鬥主視覺.png",
        ROOT / f"src/resource/{novel}/素材/圖像/主角圖片素材/{novel}-沈曜阿棠.png",
        ROOT / "public/assets/tianshu-banner.png",
    ]
    visuals = [path for path in explicit if path.exists()]
    if visuals:
        return visuals
    image_root = ROOT / f"src/resource/{novel}/素材/圖像"
    if image_root.exists():
        visuals = sorted(image_root.rglob("*.png"))
    if visuals:
        return visuals
    return [ROOT / "public/assets/tianshu-banner.png"]


def slide_count_for_duration(duration: float) -> int:
    return max(1, math.ceil(duration / MAX_SLIDE_SECONDS))


def build_stills(novel: str, chapter_title: str, source_dir: Path, count: int, regenerate: bool) -> list[Path]:
    source_dir.mkdir(parents=True, exist_ok=True)
    existing = [source_dir / f"slide-{index + 1:02d}.png" for index in range(count)]
    if not regenerate and all(path.exists() for path in existing):
        return existing

    visuals = available_visuals(novel)
    anchors = [(0.34, 0.52), (0.26, 0.42), (0.58, 0.50), (0.72, 0.52), (0.44, 0.46)]
    subtitles = [
        chapter_title,
        "霜河邊境 · 雨夜",
        "守墓棚 · 星核",
        "亂葬坡外風雪未停",
        "黑棺與第一道裂響",
    ]
    stills: list[Path] = []
    for index in range(count):
        visual = visuals[index % len(visuals)]
        base = cover_crop(Image.open(visual), anchors[index % len(anchors)])
        base = Image.blend(base, Image.new("RGB", CANVAS, (5, 9, 14)), 0.20)
        base = add_vignette(base)
        base = add_caption_safe_gradient(base)
        base = add_weather_texture(base, seed=700 + index, density=210)
        if index == 0:
            base = add_label(base, novel, subtitles[index % len(subtitles)])
        out = source_dir / f"slide-{index + 1:02d}.png"
        base.save(out, optimize=True)
        stills.append(out)
    return stills


def safe_label(value: str) -> str:
    return re.sub(r"[/%:+ ]+", "-", value.strip()).strip("-")


def has_usable_file(path: Path) -> bool:
    return path.exists() and path.stat().st_size > 0


def temp_path_for(path: Path) -> Path:
    if path.suffix:
        return path.with_name(f".{path.stem}.tmp-{os.getpid()}{path.suffix}")
    return path.with_name(f".{path.name}.tmp-{os.getpid()}")


def clean_temp_path(path: Path) -> None:
    if path.is_dir():
        shutil.rmtree(path)
    elif path.exists():
        path.unlink()


def replace_file_after_success(temp_path: Path, final_path: Path) -> None:
    if not has_usable_file(temp_path):
        raise RuntimeError(f"Temporary output is missing or empty: {temp_path}")
    temp_path.replace(final_path)


def split_tts_text(text: str, max_chars: int = 2200) -> list[str]:
    pieces = re.split(r"(?<=[。！？；\n])", text)
    chunks: list[str] = []
    buffer = ""
    for piece in pieces:
        if not piece:
            continue
        if len(buffer) + len(piece) <= max_chars:
            buffer += piece
            continue
        if buffer.strip():
            chunks.append(buffer.strip())
        buffer = piece
        while len(buffer) > max_chars:
            chunks.append(buffer[:max_chars].strip())
            buffer = buffer[max_chars:]
    if buffer.strip():
        chunks.append(buffer.strip())
    return chunks


def fmt_vtt(seconds: float) -> str:
    millis = int(round((seconds - int(seconds)) * 1000))
    total = int(seconds)
    if millis == 1000:
        total += 1
        millis = 0
    h = total // 3600
    m = (total % 3600) // 60
    s = total % 60
    return f"{h:02d}:{m:02d}:{s:02d}.{millis:03d}"


def merge_vtts(chunk_vtts: list[Path], chunk_durations: list[float], out: Path) -> None:
    offset = 0.0
    merged: list[str] = ["WEBVTT", ""]
    for chunk_vtt, duration in zip(chunk_vtts, chunk_durations):
        for line in chunk_vtt.read_text(encoding="utf-8").splitlines():
            stripped = line.strip()
            if not stripped or stripped == "WEBVTT":
                continue
            if "-->" not in line:
                merged.append(line)
                continue
            start_raw, end_part = line.split("-->", 1)
            end_bits = end_part.strip().split(maxsplit=1)
            end_raw = end_bits[0]
            settings = f" {end_bits[1]}" if len(end_bits) > 1 else ""
            start = parse_vtt_timestamp(start_raw.strip()) + offset
            end = parse_vtt_timestamp(end_raw.strip()) + offset
            merged.append(f"{fmt_vtt(start)} --> {fmt_vtt(end)}{settings}")
        offset += duration
    out.write_text("\n".join(merged).rstrip() + "\n", encoding="utf-8")


def concat_audio(chunks: list[Path], out: Path) -> None:
    list_file = out.with_suffix(".concat.txt")
    lines = []
    for chunk in chunks:
        escaped = str(chunk.resolve()).replace("'", "'\\''")
        lines.append(f"file '{escaped}'")
    list_file.write_text("\n".join(lines) + "\n", encoding="utf-8")
    try:
        subprocess.run(
            [
                "/opt/homebrew/bin/ffmpeg",
                "-hide_banner",
                "-loglevel",
                "error",
                "-y",
                "-f",
                "concat",
                "-safe",
                "0",
                "-i",
                str(list_file),
                "-c:a",
                "libmp3lame",
                "-b:a",
                "48k",
                str(out),
            ],
            check=True,
            cwd=ROOT,
            timeout=FFMPEG_AUDIO_TIMEOUT_SECONDS,
        )
    finally:
        clean_temp_path(list_file)


def synthesize_timed_narration_chunked(
    text_file: Path,
    source_dir: Path,
    media: Path,
    vtt: Path,
    edge_rate: str,
    edge_pitch: str,
) -> tuple[Path, Path]:
    temp_media = temp_path_for(media)
    temp_vtt = temp_path_for(vtt)
    chunk_dir = source_dir / f".{media.stem}-chunks.tmp-{os.getpid()}"
    clean_temp_path(temp_media)
    clean_temp_path(temp_vtt)
    clean_temp_path(chunk_dir)
    chunk_dir.mkdir(parents=True, exist_ok=True)
    chunks = split_tts_text(text_file.read_text(encoding="utf-8"))
    if not chunks:
        raise ValueError(f"No TTS text found in {text_file}")

    try:
        media_chunks: list[Path] = []
        vtt_chunks: list[Path] = []
        durations: list[float] = []
        for index, chunk in enumerate(chunks, start=1):
            chunk_text = chunk_dir / f"chunk-{index:02d}.txt"
            chunk_media = chunk_dir / f"chunk-{index:02d}.mp3"
            chunk_vtt = chunk_dir / f"chunk-{index:02d}.vtt"
            chunk_text.write_text(chunk, encoding="utf-8")
            for partial in (chunk_media, chunk_vtt):
                if partial.exists():
                    partial.unlink()
            run_edge_tts_with_retries(
                [
                    "python3",
                    "-m",
                    "edge_tts",
                    "--file",
                    str(chunk_text),
                    "--voice",
                    "zh-TW-YunJheNeural",
                    f"--rate={edge_rate}",
                    f"--pitch={edge_pitch}",
                    "--write-media",
                    str(chunk_media),
                    "--write-subtitles",
                    str(chunk_vtt),
                ],
                chunk_media,
                chunk_vtt,
                str(chunk_text),
            )
            if not has_usable_file(chunk_media) or not has_usable_file(chunk_vtt):
                raise RuntimeError(f"Edge TTS chunk failed or returned empty output: {chunk_text}")
            media_chunks.append(chunk_media)
            vtt_chunks.append(chunk_vtt)
            durations.append(ffprobe_duration(chunk_media))

        concat_audio(media_chunks, temp_media)
        merge_vtts(vtt_chunks, durations, temp_vtt)
        replace_file_after_success(temp_media, media)
        replace_file_after_success(temp_vtt, vtt)
    finally:
        clean_temp_path(temp_media)
        clean_temp_path(temp_vtt)
        clean_temp_path(chunk_dir)
    return media, vtt


def build_tts_script(
    novel: str,
    chapter_title: str,
    chapter_file: Path,
    source_dir: Path,
    label: str,
    preview_seconds: float | None,
) -> tuple[Path, Path]:
    source_dir.mkdir(parents=True, exist_ok=True)
    body = chapter_file.read_text(encoding="utf-8").strip()
    if preview_seconds is not None:
        # Give Edge TTS enough text to exceed the trimmed preview duration.
        body = re.sub(r"\s+", "", body)[: max(180, int(preview_seconds * 9))]
    text = f"{novel}。{chapter_title.replace(' ', '，')}。\n\n{body}"
    text_file = source_dir / f"{novel}-{chapter_title}-{label}-tts-script.txt"
    temp_text_file = temp_path_for(text_file)
    clean_temp_path(temp_text_file)
    temp_text_file.write_text(text, encoding="utf-8")
    return temp_text_file, text_file


def synthesize_timed_narration(
    text_file: Path,
    source_dir: Path,
    novel: str,
    chapter_title: str,
    label: str,
    edge_rate: str,
    edge_pitch: str,
    reuse: bool,
) -> tuple[Path, Path]:
    media = source_dir / f"{novel}-{chapter_title}-{label}-Edge-YunJhe-{safe_label(edge_rate)}-{safe_label(edge_pitch)}.mp3"
    vtt = source_dir / f"{novel}-{chapter_title}-{label}-word-boundary.vtt"
    if reuse and has_usable_file(media) and has_usable_file(vtt):
        return media, vtt
    assert_edge_tts_dns_available()
    temp_media = temp_path_for(media)
    temp_vtt = temp_path_for(vtt)
    clean_temp_path(temp_media)
    clean_temp_path(temp_vtt)

    if len(text_file.read_text(encoding="utf-8")) > 3500:
        return synthesize_timed_narration_chunked(text_file, source_dir, media, vtt, edge_rate, edge_pitch)

    try:
        run_edge_tts_with_retries(
            [
                "python3",
                "-m",
                "edge_tts",
                "--file",
                str(text_file),
                "--voice",
                "zh-TW-YunJheNeural",
                f"--rate={edge_rate}",
                f"--pitch={edge_pitch}",
                "--write-media",
                str(temp_media),
                "--write-subtitles",
                str(temp_vtt),
            ],
            temp_media,
            temp_vtt,
            str(text_file),
        )
    except subprocess.CalledProcessError:
        clean_temp_path(temp_media)
        clean_temp_path(temp_vtt)
        return synthesize_timed_narration_chunked(text_file, source_dir, media, vtt, edge_rate, edge_pitch)
    if not has_usable_file(temp_media) or not has_usable_file(temp_vtt):
        clean_temp_path(temp_media)
        clean_temp_path(temp_vtt)
        return synthesize_timed_narration_chunked(text_file, source_dir, media, vtt, edge_rate, edge_pitch)
    replace_file_after_success(temp_media, media)
    replace_file_after_success(temp_vtt, vtt)
    return media, vtt


def parse_vtt_timestamp(value: str) -> float:
    hours, minutes, rest = value.split(":")
    if "," in rest:
        seconds, millis = rest.split(",")
    elif "." in rest:
        seconds, millis = rest.split(".")
    else:
        seconds, millis = rest, "0"
    return int(hours) * 3600 + int(minutes) * 60 + int(seconds) + int(millis) / 1000


def fmt_srt(seconds: float) -> str:
    millis = int(round((seconds - int(seconds)) * 1000))
    total = int(seconds)
    if millis == 1000:
        total += 1
        millis = 0
    h = total // 3600
    m = (total % 3600) // 60
    s = total % 60
    return f"{h:02d}:{m:02d}:{s:02d},{millis:03d}"


def wrap_caption(text: str, width: int = 18) -> str:
    lines = textwrap.wrap(text, width=width, break_long_words=True, break_on_hyphens=False)
    if len(lines) == 2 and len(lines[1]) <= 4 and len(lines[0]) > width // 2:
        move = min(6, len(lines[0]) - width // 2)
        lines = [lines[0][:-move], lines[0][-move:] + lines[1]]
    for index in range(1, len(lines)):
        while lines[index] and lines[index][0] in CLOSING_PUNCTUATION:
            lines[index - 1] += lines[index][0]
            lines[index] = lines[index][1:]
    lines = [line for line in lines if line]
    return "\n".join(lines[:2])


def attach_leading_closing_punctuation(chunks: list[str]) -> list[str]:
    fixed: list[str] = []
    for chunk in chunks:
        while chunk and chunk[0] in CLOSING_PUNCTUATION and fixed:
            fixed[-1] += chunk[0]
            chunk = chunk[1:]
        if chunk:
            fixed.append(chunk)
    return fixed


def split_caption_text(text: str, max_chars: int = MAX_CAPTION_CHARS) -> list[str]:
    text = re.sub(r"\s+", "", text)
    pieces = re.split(r"(?<=[，、。：；！？])", text)
    chunks: list[str] = []
    buffer = ""
    for piece in pieces:
        if not piece:
            continue
        if len(buffer + piece) <= max_chars:
            buffer += piece
            continue
        if buffer:
            chunks.append(buffer)
        buffer = piece
        while len(buffer) > max_chars:
            chunks.append(buffer[:max_chars])
            buffer = buffer[max_chars:]
    if buffer:
        chunks.append(buffer)
    return attach_leading_closing_punctuation(chunks)


def split_timed_entry(start: float, end: float, text: str) -> list[tuple[float, float, str]]:
    chunks = split_caption_text(text)
    if len(chunks) <= 1:
        return [(start, end, text)]
    weights = [max(1, len(chunk)) for chunk in chunks]
    duration = max(0.2, end - start)
    now = start
    timed: list[tuple[float, float, str]] = []
    for index, (chunk, weight) in enumerate(zip(chunks, weights)):
        if index == len(chunks) - 1:
            chunk_end = end
        else:
            chunk_end = now + duration * weight / sum(weights)
        timed.append((now, chunk_end, chunk))
        now = chunk_end
    return timed


def build_grouped_srt(vtt: Path, srt: Path, duration: float) -> None:
    srt.parent.mkdir(parents=True, exist_ok=True)
    entries: list[tuple[float, float, str]] = []
    lines = [line.strip() for line in vtt.read_text(encoding="utf-8").splitlines()]
    index = 0
    while index < len(lines):
        line = lines[index]
        if "-->" not in line:
            index += 1
            continue
        start_raw, end_raw = [part.strip() for part in line.split("-->")]
        text = lines[index + 1].strip() if index + 1 < len(lines) else ""
        text = re.sub(r"<[^>]+>", "", text)
        if text:
            start = parse_vtt_timestamp(start_raw)
            end = parse_vtt_timestamp(end_raw)
            entries.extend(split_timed_entry(start, end, text))
        index += 2

    groups: list[tuple[float, float, str]] = []
    current_text = ""
    current_start = 0.0
    current_end = 0.0
    for start, end, text in entries:
        if not current_text:
            current_start = start
            current_text = text
            current_end = end
            continue
        would_be = current_text + text
        if len(would_be) <= MAX_CAPTION_CHARS and end - current_start <= MAX_CAPTION_SECONDS:
            current_text = would_be
            current_end = end
            continue
        groups.append((current_start, current_end + 0.18, wrap_caption(current_text)))
        current_start = start
        current_text = text
        current_end = end
    if current_text:
        groups.append((current_start, current_end + 0.18, wrap_caption(current_text)))

    with srt.open("w", encoding="utf-8") as handle:
        written = 0
        for group_index, (start, end, text) in enumerate(groups):
            if start >= duration - 0.2:
                continue
            if group_index + 1 < len(groups):
                end = min(end, groups[group_index + 1][0] - 0.04)
            end = min(end, duration - 0.2)
            if end <= start:
                continue
            written += 1
            handle.write(f"{written}\n{fmt_srt(start)} --> {fmt_srt(end)}\n{text}\n\n")


def build_video(stills: list[Path], srt: Path, narration: Path, output: Path, duration: float) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    segment_count = len(stills)
    segment_duration = duration / segment_count
    inputs: list[str] = []
    filters: list[str] = []
    for index, still in enumerate(stills):
        inputs += ["-loop", "1", "-framerate", str(FPS), "-t", f"{segment_duration:.3f}", "-i", str(still)]
        filters.append(f"[{index}:v]scale=1280:720,setsar=1,trim=duration={segment_duration:.3f},setpts=PTS-STARTPTS[v{index}]")

    narration_index = segment_count
    rain_bed_index = segment_count + 1
    rain_fine_index = segment_count + 2
    rain_low_index = segment_count + 3
    inputs += ["-i", str(narration)]
    inputs += ["-f", "lavfi", "-t", f"{duration:.3f}", "-i", "anoisesrc=color=pink:amplitude=0.055:seed=4311"]
    inputs += ["-f", "lavfi", "-t", f"{duration:.3f}", "-i", "anoisesrc=color=white:amplitude=0.030:seed=8607"]
    inputs += ["-f", "lavfi", "-t", f"{duration:.3f}", "-i", "anoisesrc=color=brown:amplitude=0.025:seed=1207"]

    joined = "".join(f"[v{i}]" for i in range(segment_count))
    style = (
        "FontName=PingFang TC,"
        "FontSize=26,"
        "PrimaryColour=&H00F7F1E8,"
        "OutlineColour=&HA0000000,"
        "BackColour=&H83000000,"
        "BorderStyle=3,"
        "Outline=1,"
        "Shadow=0,"
        "Alignment=2,"
        "MarginV=46"
    )
    filters.append(
        f"{joined}concat=n={segment_count}:v=1:a=0,"
        f"trim=duration={duration:.3f},setpts=PTS-STARTPTS,"
        f"subtitles='{srt}':force_style='{style}'[v]"
    )
    filters.append(
        f"[{narration_index}:a]aresample=44100,volume={NARRATION_VOLUME},"
        "highpass=f=80,"
        "equalizer=f=220:t=q:w=1.0:g=0.8,"
        "equalizer=f=3200:t=q:w=0.9:g=-3.4,"
        "equalizer=f=6200:t=q:w=0.8:g=-4.2,"
        "lowpass=f=9000,"
        "alimiter=limit=0.64:level=false[narr]"
    )
    filters.append(
        f"[{rain_bed_index}:a]aresample=44100,highpass=f=420,lowpass=f=4200,volume={RAIN_WHITE_NOISE_VOLUME},"
        f"afade=t=in:st=0:d=2,afade=t=out:st={max(0, duration - 3):.3f}:d=3[rainbed]"
    )
    filters.append(f"[{rain_fine_index}:a]aresample=44100,highpass=f=1200,lowpass=f=5200,volume={RAIN_FINE_VOLUME}[rainfine]")
    filters.append(f"[{rain_low_index}:a]aresample=44100,lowpass=f=1200,volume={RAIN_LOW_VOLUME}[rainlow]")
    filters.append(
        "[narr][rainbed][rainfine][rainlow]amix=inputs=4:duration=first:dropout_transition=0:normalize=0,"
        f"volume={FINAL_MIX_VOLUME},alimiter=limit=0.62:level=false[a]"
    )

    cmd = [
        "/opt/homebrew/bin/ffmpeg",
        "-y",
        *inputs,
        "-filter_complex",
        ";".join(filters),
        "-map",
        "[v]",
        "-map",
        "[a]",
        "-t",
        f"{duration:.3f}",
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "28",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        "-movflags",
        "+faststart",
        str(output),
    ]
    subprocess.run(cmd, check=True, cwd=ROOT, timeout=FFMPEG_VIDEO_TIMEOUT_SECONDS)


def audiobook_output_path(novel: str, chapter_title: str) -> Path:
    chapter_dir = ROOT / "src/resource" / novel / "有聲書" / chapter_title
    filename = f"{novel}-{chapter_title.replace(' ', '-')}-Edge-YunJhe.zh-TW.m4a"
    return chapter_dir / filename


def export_standalone_audiobook(narration: Path, out: Path) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    temp_out = temp_path_for(out)
    clean_temp_path(temp_out)
    try:
        subprocess.run(
            [
                "/opt/homebrew/bin/ffmpeg",
                "-hide_banner",
                "-loglevel",
                "error",
                "-y",
                "-i",
                str(narration),
                "-vn",
                "-c:a",
                "aac",
                "-b:a",
                "128k",
                "-movflags",
                "+faststart",
                str(temp_out),
            ],
            check=True,
            cwd=ROOT,
            timeout=FFMPEG_AUDIO_TIMEOUT_SECONDS,
        )
        replace_file_after_success(temp_out, out)
    finally:
        clean_temp_path(temp_out)


def normalize_script_text(value: str) -> str:
    return re.sub(r"\s+", "", value.replace("\r\n", "\n").strip())


def strip_tts_lead(value: str) -> str:
    lines = value.replace("\r\n", "\n").splitlines()
    for index, line in enumerate(lines):
        if not line.strip():
            continue
        if re.match(r"^.+。第\d+章，", line.strip()):
            del lines[index]
        break
    return "\n".join(lines)


def assert_tts_matches_chapter(chapter_file: Path, tts_script: Path) -> None:
    chapter_text = normalize_script_text(chapter_file.read_text(encoding="utf-8"))
    tts_text = normalize_script_text(strip_tts_lead(tts_script.read_text(encoding="utf-8")))
    if chapter_text != tts_text:
        raise RuntimeError(f"TTS script does not match chapter text: {tts_script}")


def parse_args() -> argparse.Namespace:
    default_novel = "星骸王座"
    default_chapter_title = "第01章 星核在雨夜說謊"
    parser = argparse.ArgumentParser(description="Build a 720p audiobook chapter video with synced subtitles and rain white noise.")
    parser.add_argument("--novel", default=default_novel)
    parser.add_argument("--chapter-title", default=default_chapter_title)
    parser.add_argument("--chapter-file", type=Path)
    parser.add_argument("--output-dir", type=Path)
    parser.add_argument("--edge-rate", default=EDGE_RATE)
    parser.add_argument("--edge-pitch", default=EDGE_PITCH)
    parser.add_argument("--preview-seconds", type=float)
    parser.add_argument("--output-label")
    parser.add_argument("--slide-count", type=int, help="Use an explicit number of slide images instead of duration-derived count.")
    parser.add_argument("--regenerate-stills", action="store_true", help="Regenerate chapter still images instead of reusing existing slide-*.png files.")
    parser.add_argument("--reuse-tts", action="store_true", help="Reuse existing generated Edge TTS media and VTT timing files.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    chapter_file = args.chapter_file or ROOT / f"src/resource/{args.novel}/文章/{args.chapter_title}.txt"
    output_dir = args.output_dir or ROOT / f"src/resource/{args.novel}/影片/{args.chapter_title}"
    output_dir = output_dir.resolve()
    source_dir = output_dir / "source"
    if args.output_label:
        label = args.output_label
    elif args.preview_seconds is not None:
        label = f"{int(args.preview_seconds)}秒預覽"
    else:
        label = "字幕有聲書"
    subtitle_name = f"{args.novel}-{args.chapter_title}.srt" if label == "字幕有聲書" else f"{args.novel}-{args.chapter_title}-{label}.srt"
    subtitle_file = output_dir / "subtitles" / subtitle_name
    output = output_dir / "output" / f"{args.novel}-{args.chapter_title}-{label}-720p.mp4"

    text_file, final_text_file = build_tts_script(args.novel, args.chapter_title, chapter_file.resolve(), source_dir, label, args.preview_seconds)
    try:
        narration, vtt = synthesize_timed_narration(
            text_file,
            source_dir,
            args.novel,
            args.chapter_title,
            label,
            args.edge_rate,
            args.edge_pitch,
            args.reuse_tts,
        )
        if args.preview_seconds is None:
            assert_tts_matches_chapter(chapter_file.resolve(), text_file)
        text_file.replace(final_text_file)
    except Exception:
        clean_temp_path(text_file)
        raise
    source_duration = ffprobe_duration(narration)
    duration = min(source_duration, args.preview_seconds) if args.preview_seconds is not None else source_duration
    slide_count = args.slide_count or slide_count_for_duration(duration)
    if slide_count < 1:
        raise ValueError("--slide-count must be at least 1")
    stills = build_stills(args.novel, args.chapter_title, source_dir, slide_count, args.regenerate_stills)
    build_grouped_srt(vtt, subtitle_file, duration)
    standalone_audiobook = None
    if args.preview_seconds is None and label == "字幕有聲書":
        standalone_audiobook = audiobook_output_path(args.novel, args.chapter_title)
        export_standalone_audiobook(narration, standalone_audiobook)
    build_video(stills, subtitle_file, narration, output, duration)

    slide_duration = duration / len(stills)
    print(output)
    print(f"duration={duration:.3f}")
    print(f"slides={len(stills)}")
    print(f"slide_duration={slide_duration:.3f}")
    print(f"subtitles={subtitle_file}")
    if standalone_audiobook:
        print(f"audiobook={standalone_audiobook}")


if __name__ == "__main__":
    main()
