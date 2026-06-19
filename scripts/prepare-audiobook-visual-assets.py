#!/usr/bin/env python3
"""Prepare chapter-specific visual assets for Tianshu audiobook videos."""

from __future__ import annotations

import argparse
import math
import shutil
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont


CANVAS = (1280, 720)
IG_CANVAS = (1080, 1080)

FONT_CANDIDATES_SERIF = [
    "/System/Library/Fonts/Supplemental/Songti.ttc",
    "/System/Library/Fonts/ヒラギノ明朝 ProN.ttc",
    "/System/Library/Fonts/STHeiti Medium.ttc",
]
FONT_CANDIDATES_SANS = [
    "/System/Library/Fonts/PingFang.ttc",
    "/System/Library/Fonts/STHeiti Medium.ttc",
    "/System/Library/Fonts/Hiragino Sans GB.ttc",
]


def first_existing(paths: list[str]) -> str | None:
    for path in paths:
        if Path(path).exists():
            return path
    return None


SERIF_FONT = first_existing(FONT_CANDIDATES_SERIF)
SANS_FONT = first_existing(FONT_CANDIDATES_SANS) or SERIF_FONT


def font(size: int, serif: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    path = SERIF_FONT if serif else SANS_FONT
    if path:
        return ImageFont.truetype(path, size=size)
    return ImageFont.load_default()


def cover_crop(img: Image.Image, size: tuple[int, int], anchor: tuple[float, float] = (0.5, 0.5)) -> Image.Image:
    img = img.convert("RGB")
    target_w, target_h = size
    source_w, source_h = img.size
    source_ratio = source_w / source_h
    target_ratio = target_w / target_h
    if source_ratio > target_ratio:
        crop_h = source_h
        crop_w = int(round(crop_h * target_ratio))
    else:
        crop_w = source_w
        crop_h = int(round(crop_w / target_ratio))
    left = int(round((source_w - crop_w) * anchor[0]))
    top = int(round((source_h - crop_h) * anchor[1]))
    left = max(0, min(left, source_w - crop_w))
    top = max(0, min(top, source_h - crop_h))
    return img.crop((left, top, left + crop_w, top + crop_h)).resize(size, Image.Resampling.LANCZOS)


def contain(img: Image.Image, box: tuple[int, int]) -> Image.Image:
    img = img.convert("RGB")
    box_w, box_h = box
    scale = min(box_w / img.width, box_h / img.height)
    return img.resize((int(round(img.width * scale)), int(round(img.height * scale))), Image.Resampling.LANCZOS)


def add_vignette(img: Image.Image, strength: float = 0.55) -> Image.Image:
    w, h = img.size
    mask = Image.new("L", img.size, 0)
    px = mask.load()
    cx, cy = w / 2, h / 2
    max_dist = math.sqrt(cx * cx + cy * cy)
    for y in range(h):
        for x in range(w):
            dist = math.sqrt((x - cx) ** 2 + (y - cy) ** 2) / max_dist
            value = int(255 * min(1, max(0, (dist - 0.25) / 0.75)) * strength)
            px[x, y] = value
    overlay = Image.new("RGB", img.size, (0, 0, 0))
    return Image.composite(overlay, img, mask)


def make_landscape_slide(src: Path, out: Path, anchor_y: float = 0.56) -> None:
    img = Image.open(src).convert("RGB")
    ratio = img.width / img.height
    anchor = (0.5, anchor_y if ratio < 1.45 else 0.5)
    base = cover_crop(img, CANVAS, anchor=anchor)
    base = ImageEnhance.Contrast(base).enhance(1.03)
    base = ImageEnhance.Color(base).enhance(0.92)
    base = add_vignette(base, 0.42)
    out.parent.mkdir(parents=True, exist_ok=True)
    base.save(out, optimize=True)


def text_size(draw: ImageDraw.ImageDraw, text: str, ft: ImageFont.ImageFont) -> tuple[int, int]:
    box = draw.textbbox((0, 0), text, font=ft)
    return box[2] - box[0], box[3] - box[1]


def fit_font(draw: ImageDraw.ImageDraw, text: str, max_w: int, start: int, min_size: int, serif: bool) -> ImageFont.ImageFont:
    for size in range(start, min_size - 1, -2):
        ft = font(size, serif=serif)
        if text_size(draw, text, ft)[0] <= max_w:
            return ft
    return font(min_size, serif=serif)


def wrap_text(draw: ImageDraw.ImageDraw, text: str, ft: ImageFont.ImageFont, max_w: int) -> list[str]:
    lines: list[str] = []
    current = ""
    for char in text:
        candidate = current + char
        if text_size(draw, candidate, ft)[0] <= max_w or not current:
            current = candidate
        else:
            lines.append(current)
            current = char
    if current:
        lines.append(current)
    return lines


def gradient_overlay(img: Image.Image, left: bool = True, bottom: bool = True) -> Image.Image:
    out = img.convert("RGBA")
    w, h = out.size
    layer = Image.new("RGBA", out.size, (0, 0, 0, 0))
    px = layer.load()
    for y in range(h):
        for x in range(w):
            a = 0
            if left:
                a = max(a, int(190 * max(0, 1 - x / (w * 0.62))))
            if bottom:
                a = max(a, int(150 * max(0, (y - h * 0.45) / (h * 0.55))))
            px[x, y] = (2, 5, 9, min(210, a))
    out.alpha_composite(layer)
    return out.convert("RGB")


def draw_cover_text(img: Image.Image, chapter_no: int, title_only: str, hook: str, square: bool = False) -> Image.Image:
    img = gradient_overlay(img)
    draw = ImageDraw.Draw(img)
    w, h = img.size
    margin = 74 if not square else 72
    gold = (218, 176, 95)
    offwhite = (239, 237, 228)
    muted = (180, 193, 204)

    label_ft = font(28 if not square else 30)
    title_ft = fit_font(draw, "星骸王座", int(w * 0.58), 76 if not square else 84, 50, serif=True)
    chapter_ft = fit_font(draw, f"第{chapter_no}章｜{title_only}", int(w * 0.72), 44 if not square else 46, 30, serif=False)
    hook_ft = font(31 if not square else 34)

    y = margin if not square else 96
    draw.text((margin, y), "天書原創有聲書", font=label_ft, fill=muted, stroke_width=1, stroke_fill=(8, 12, 16))
    y += 46
    draw.text((margin, y), "星骸王座", font=title_ft, fill=offwhite, stroke_width=3, stroke_fill=(6, 8, 12))
    y += text_size(draw, "星骸王座", title_ft)[1] + 28
    draw.line((margin, y, margin + 220, y), fill=gold, width=3)
    y += 26
    draw.text((margin, y), f"第{chapter_no}章｜{title_only}", font=chapter_ft, fill=gold, stroke_width=2, stroke_fill=(5, 7, 10))
    y += text_size(draw, f"第{chapter_no}章｜{title_only}", chapter_ft)[1] + 24
    max_hook_w = int(w * (0.54 if not square else 0.78))
    for line in wrap_text(draw, hook, hook_ft, max_hook_w)[:2]:
        draw.text((margin, y), line, font=hook_ft, fill=offwhite, stroke_width=2, stroke_fill=(5, 7, 10))
        y += text_size(draw, line, hook_ft)[1] + 12
    return img


def make_thumbnail(base_src: Path, out: Path, chapter_no: int, title_only: str, hook: str) -> None:
    base = cover_crop(Image.open(base_src), CANVAS, anchor=(0.54, 0.54))
    base = draw_cover_text(base, chapter_no, title_only, hook, square=False)
    out.parent.mkdir(parents=True, exist_ok=True)
    base.save(out, optimize=True)


def make_ig(base_src: Path, out: Path, chapter_no: int, title_only: str, hook: str) -> None:
    base = cover_crop(Image.open(base_src), IG_CANVAS, anchor=(0.58, 0.5))
    base = draw_cover_text(base, chapter_no, title_only, hook, square=True)
    out.parent.mkdir(parents=True, exist_ok=True)
    base.save(out, optimize=True)


def make_contact_sheet(paths: list[Path], out: Path) -> None:
    thumbs: list[Image.Image] = []
    for path in paths:
        img = Image.open(path).convert("RGB").resize((320, 180), Image.Resampling.LANCZOS)
        thumbs.append(img)
    cols = min(3, len(thumbs))
    rows = math.ceil(len(thumbs) / cols)
    sheet = Image.new("RGB", (cols * 320, rows * 220), (14, 16, 18))
    draw = ImageDraw.Draw(sheet)
    label_ft = font(16)
    for index, img in enumerate(thumbs):
        x = (index % cols) * 320
        y = (index // cols) * 220
        sheet.paste(img, (x, y))
        draw.text((x + 10, y + 188), paths[index].name, font=label_ft, fill=(235, 235, 235))
    out.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out, optimize=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--chapter-no", type=int, required=True)
    parser.add_argument("--chapter-title", required=True)
    parser.add_argument("--short-dir", type=Path, required=True)
    parser.add_argument("--output-dir", type=Path, required=True)
    parser.add_argument("--extra-image", type=Path)
    parser.add_argument("--hook", required=True)
    args = parser.parse_args()

    title_only = args.chapter_title.split(" ", 1)[1] if " " in args.chapter_title else args.chapter_title
    source_dir = args.output_dir / "source"
    source_dir.mkdir(parents=True, exist_ok=True)
    (args.output_dir / "thumbnails").mkdir(parents=True, exist_ok=True)
    (args.output_dir / "output").mkdir(parents=True, exist_ok=True)
    (args.output_dir / "qa").mkdir(parents=True, exist_ok=True)
    (args.output_dir / "notes").mkdir(parents=True, exist_ok=True)

    key_art = sorted((args.short_dir / "source" / "key-art").glob("*.png"))
    if len(key_art) < 4:
        raise SystemExit(f"Expected at least 4 key-art images in {args.short_dir}")

    slide_inputs = key_art[:4]
    if args.extra_image:
        extra_dest = source_dir / "longform-extra-image.png"
        shutil.copyfile(args.extra_image, extra_dest)
        slide_inputs.append(extra_dest)

    slides: list[Path] = []
    portrait_anchors = [0.42, 0.50, 0.38, 0.48, 0.50]
    for index, src in enumerate(slide_inputs, start=1):
        out = source_dir / f"slide-{index:02d}.png"
        make_landscape_slide(src, out, anchor_y=portrait_anchors[(index - 1) % len(portrait_anchors)])
        slides.append(out)

    cover_base = source_dir / "social-cover-base.png"
    if args.extra_image:
        make_landscape_slide(source_dir / "longform-extra-image.png", cover_base)
    else:
        shutil.copyfile(slides[-1], cover_base)

    thumb = args.output_dir / "thumbnails" / f"星骸王座-第{args.chapter_no:02d}章-{title_only}-thumbnail.png"
    ig = args.output_dir / "output" / "instagram-promo.png"
    make_thumbnail(cover_base, thumb, args.chapter_no, title_only, args.hook)
    make_ig(cover_base, ig, args.chapter_no, title_only, args.hook)

    make_contact_sheet(slides, args.output_dir / "qa" / f"ch{args.chapter_no:02d}-slide-contact-sheet.png")

    print(f"slides={len(slides)}")
    print(f"thumbnail={thumb}")
    print(f"instagram={ig}")
    print(f"contact_sheet={args.output_dir / 'qa' / f'ch{args.chapter_no:02d}-slide-contact-sheet.png'}")


if __name__ == "__main__":
    main()
