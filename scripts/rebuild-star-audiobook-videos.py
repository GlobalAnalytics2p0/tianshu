#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
NOVEL = "星骸王座"


def run(cmd: list[str]) -> None:
    print(" ".join(cmd), flush=True)
    subprocess.run(cmd, cwd=ROOT, check=True)


def existing_slide_count(output_dir: Path) -> int:
    slides = sorted((output_dir / "source").glob("slide-*.png"))
    return len(slides) or 1


def main() -> None:
    parser = argparse.ArgumentParser(description="Rebuild 星骸王座 audiobook videos from current chapter text.")
    parser.add_argument("--start", type=int, default=1)
    parser.add_argument("--end", type=int, default=10)
    args = parser.parse_args()

    manifest = json.loads((ROOT / "src/resource/manifest.json").read_text(encoding="utf-8"))
    book = next(item for item in manifest["books"] if item["title"] == NOVEL)
    chapters = [chapter for chapter in book["chapters"] if args.start <= chapter["number"] <= args.end]

    for chapter in chapters:
        number = chapter["number"]
        chapter_title = f"第{number:02d}章 {chapter['title']}"
        chapter_file = ROOT / chapter["path"]
        output_dir = ROOT / "src/resource" / NOVEL / "影片" / chapter_title
        slide_count = existing_slide_count(output_dir)
        run(
            [
                "python3",
                "scripts/build-audiobook-chapter-video.py",
                "--novel",
                NOVEL,
                "--chapter-title",
                chapter_title,
                "--chapter-file",
                str(chapter_file.relative_to(ROOT)),
                "--output-dir",
                str(output_dir.relative_to(ROOT)),
                "--slide-count",
                str(slide_count),
            ]
        )


if __name__ == "__main__":
    main()
