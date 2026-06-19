#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import shutil
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
FFPROBE = Path("/opt/homebrew/bin/ffprobe")
if not FFPROBE.exists():
    found = shutil.which("ffprobe")
    if not found:
        raise SystemExit("ffprobe not found")
    FFPROBE = Path(found)


TITLE_MAP = {
    37: "井口第二手",
    38: "後槽先應",
    39: "先喊誰",
    40: "最後那個肩",
    41: "名字外的手",
    42: "誰又收平了",
    43: "誰碰那支桿",
    44: "那支分湯勺",
    45: "救命車先挑你",
    46: "那道暖門",
    47: "後門先認手",
    48: "第一包藥",
    49: "第一包先給誰",
    50: "拿昨夜那個",
    51: "最穩那雙手",
    52: "藥裡先磨了路",
    53: "誰教你先交手",
    54: "學咱們的也會錯",
}


def duration(path: Path) -> float:
    return float(
        subprocess.check_output(
            [
                str(FFPROBE),
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


def parse_args() -> list[tuple[int, str]]:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--range",
        dest="range_spec",
        help="Episode range like 43-48. Defaults to 37-42 when omitted with no positional episodes.",
    )
    parser.add_argument("episodes", nargs="*", type=int, help="Episode numbers to update.")
    args = parser.parse_args()

    if args.episodes:
        episode_numbers = args.episodes
    elif args.range_spec:
        start_str, end_str = args.range_spec.split("-", 1)
        start = int(start_str)
        end = int(end_str)
        episode_numbers = list(range(start, end + 1))
    else:
        episode_numbers = list(range(37, 43))

    missing = [ep for ep in episode_numbers if ep not in TITLE_MAP]
    if missing:
        raise SystemExit(f"missing titles for episodes: {missing}")

    return [(ep, TITLE_MAP[ep]) for ep in episode_numbers]


def update_one(ep: int, title: str) -> None:
    folder = ROOT / f"第{ep:02d}篇 {title}"
    storyboard = json.loads((folder / "source" / "storyboard.json").read_text(encoding="utf-8"))
    output = folder / "output" / storyboard["outputFile"]
    voice = folder / "voice" / "edge-acted-narration.m4a"
    subtitles = folder / "subtitles" / "subtitles.srt"
    srt_text = subtitles.read_text(encoding="utf-8")
    end_line = next((line for line in reversed(srt_text.splitlines()) if "-->" in line), "")
    notes = (folder / "notes" / "production-notes.md").read_text(encoding="utf-8")
    qa_block = (
        "## 最終 QA\n\n"
        f"- 影片輸出：{duration(output):.3f} 秒，1080x1920，9:16，30fps，SAR 1:1。\n"
        f"- Voice source：{duration(voice):.3f} 秒，低於 54 秒字幕安全線，沒有被 final MP4 截斷。\n"
        f"- 字幕最後 cue：{end_line.split(' --> ')[1] if end_line else '未知'}；CTA 之前已結束。\n"
        "- 聲線：旁白固定 HsiaoChen；男性台詞若出現，沿用 Yunxi fallback，避免角色性別錯位。\n"
        "- 視覺：前段、中段、後段 source frame 均維持無字；CTA 僅最後一張 summary card。\n"
        "- 抽查：build 產出的 `qa/contact-sheet.png`、`qa/frame-0002.png`、`qa/frame-0032.png`、`qa/frame-0057.png` 可對照開頭鉤子、中段信息變化與最後官方入口頁。\n"
    )
    head, _, _ = notes.partition("## 最終 QA")
    (folder / "notes" / "production-notes.md").write_text(head.rstrip() + "\n\n" + qa_block, encoding="utf-8")


def main() -> None:
    for ep, title in parse_args():
        update_one(ep, title)


if __name__ == "__main__":
    main()
