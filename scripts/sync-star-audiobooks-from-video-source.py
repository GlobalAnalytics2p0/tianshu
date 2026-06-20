#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
NOVEL = "星骸王座"


def normalize(value: str) -> str:
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


def ffprobe_duration(path: Path) -> float:
    out = subprocess.check_output(
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
        cwd=ROOT,
        text=True,
    )
    return float(out.strip())


def convert_to_m4a(src: Path, out: Path) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    tmp = out.with_name(f".{out.stem}.tmp{out.suffix}")
    if tmp.exists():
        tmp.unlink()
    try:
        subprocess.run(
            [
                "/opt/homebrew/bin/ffmpeg",
                "-hide_banner",
                "-loglevel",
                "error",
                "-y",
                "-i",
                str(src),
                "-vn",
                "-c:a",
                "aac",
                "-b:a",
                "128k",
                "-movflags",
                "+faststart",
                str(tmp),
            ],
            cwd=ROOT,
            check=True,
        )
        if not tmp.exists() or tmp.stat().st_size == 0:
            raise RuntimeError(f"empty output: {tmp}")
        tmp.replace(out)
    finally:
        if tmp.exists():
            tmp.unlink()


def write_note(chapter_number: int, title: str, chapter_path: Path, audio_path: Path, duration: float) -> None:
    note_dir = ROOT / "src/resource" / NOVEL / "素材" / "有聲書" / "製作紀錄"
    note_dir.mkdir(parents=True, exist_ok=True)
    note_path = note_dir / f"第{chapter_number:02d}章 {title}.md"
    rel_chapter = chapter_path.relative_to(ROOT)
    rel_audio = audio_path.relative_to(ROOT)
    minutes = int(duration // 60)
    seconds = int(round(duration % 60))
    note = f"""# 《{NOVEL}》第{chapter_number:02d}章有聲書製作紀錄

## 來源

- 正文章節：`{rel_chapter}`
- 音訊來源：同章影片 source narration，已先驗證 TTS 腳本與 canonical 正文完全一致。
- 輸出檔案：`{rel_audio}`

## 2026-06-20 Edge Neural TTS 版

- 語音：`zh-TW-YunJheNeural`
- 影片聲源設定：Edge YunJhe `+0%` / `-2Hz`
- 格式：AAC `.m4a`
- 長度：約 {minutes} 分 {seconds:02d} 秒
- 品質定位：由已通過正文一致性檢查的影片 narration 轉出，可作為正式有聲書檔案。

## 注意事項

- 音訊成品屬大型衍生檔，依目前規則保留在本機並由 `.gitignore` 忽略，不納入 Git commit。
- 若正文之後再修改，必須先重做有聲書，再重做影片與字幕。
"""
    note_path.write_text(note, encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Create standalone 星骸王座 audiobooks only when video TTS matches current article text.")
    parser.add_argument("--start", type=int, default=11)
    parser.add_argument("--end", type=int, default=45)
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()

    manifest = json.loads((ROOT / "src/resource/manifest.json").read_text(encoding="utf-8"))
    book = next(item for item in manifest["books"] if item["title"] == NOVEL)
    made: list[str] = []
    skipped: list[str] = []

    for chapter in book["chapters"]:
        number = chapter["number"]
        if not (args.start <= number <= args.end):
            continue
        title = chapter["title"]
        chapter_title = f"第{number:02d}章 {title}"
        article_path = ROOT / chapter["path"]
        video_source = ROOT / "src/resource" / NOVEL / "影片" / chapter_title / "source"
        tts_script = video_source / f"{NOVEL}-{chapter_title}-字幕有聲書-tts-script.txt"
        narration = video_source / f"{NOVEL}-{chapter_title}-字幕有聲書-Edge-YunJhe-0-2Hz.mp3"
        audio_out = ROOT / "src/resource" / NOVEL / "有聲書" / chapter_title / f"{NOVEL}-{chapter_title.replace(' ', '-')}-Edge-YunJhe.zh-TW.m4a"

        if not tts_script.exists() or not narration.exists():
            skipped.append(f"{number:02d} {title}: missing video source")
            continue
        if normalize(article_path.read_text(encoding="utf-8")) != normalize(strip_tts_lead(tts_script.read_text(encoding="utf-8"))):
            skipped.append(f"{number:02d} {title}: video TTS differs from current article")
            continue
        if audio_out.exists() and not args.force:
            skipped.append(f"{number:02d} {title}: audiobook already exists")
            continue

        convert_to_m4a(narration, audio_out)
        duration = ffprobe_duration(audio_out)
        write_note(number, title, article_path, audio_out, duration)
        made.append(f"{number:02d} {title}: {duration:.3f}s")

    print(f"created={len(made)}")
    for item in made:
        print(f"created {item}")
    print(f"skipped={len(skipped)}")
    for item in skipped:
        print(f"skipped {item}")


if __name__ == "__main__":
    main()
