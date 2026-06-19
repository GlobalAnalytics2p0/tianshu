#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


WIDTH = 1080
HEIGHT = 1920
BG_TOP = (8, 13, 22)
BG_BOTTOM = (18, 28, 43)
PANEL_FILL = (8, 16, 28, 220)
PANEL_STROKE = (120, 217, 255, 200)
TEXT_MAIN = (240, 245, 247)
TEXT_MUTED = (167, 223, 250)
TEXT_ACCENT = (255, 204, 120)
TEXT_SOFT = (178, 194, 208)


def font(size: int, *, bold: bool = False) -> ImageFont.FreeTypeFont:
    candidates = [
        "/System/Library/Fonts/STHeiti Medium.ttc",
        "/System/Library/Fonts/PingFang.ttc",
        "/System/Library/Fonts/Hiragino Sans GB.ttc",
        "/Library/Fonts/Arial Unicode.ttf",
    ]
    latin_candidates = [
        "/System/Library/Fonts/Supplemental/Avenir Next.ttc",
        "/System/Library/Fonts/Supplemental/Helvetica.ttc",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
    ]
    pool = candidates + latin_candidates if bold else candidates + latin_candidates
    for path in pool:
        if Path(path).exists():
            try:
                return ImageFont.truetype(path, size=size)
            except OSError:
                continue
    return ImageFont.load_default()


def draw_center_text(draw: ImageDraw.ImageDraw, y: int, text: str, text_font, fill, *, stroke=0, stroke_fill=None):
    bbox = draw.textbbox((0, 0), text, font=text_font, stroke_width=stroke)
    x = (WIDTH - (bbox[2] - bbox[0])) // 2
    draw.text((x, y), text, font=text_font, fill=fill, stroke_width=stroke, stroke_fill=stroke_fill)


def rounded_box(draw: ImageDraw.ImageDraw, xy, *, fill, outline, width=3, radius=36):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def glow_line(canvas: Image.Image, y: int):
    overlay = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.rounded_rectangle((110, y, WIDTH - 110, y + 6), radius=8, fill=(116, 219, 255, 180))
    overlay = overlay.filter(ImageFilter.GaussianBlur(7))
    canvas.alpha_composite(overlay)
    d = ImageDraw.Draw(canvas)
    d.rounded_rectangle((130, y + 6, WIDTH - 130, y + 10), radius=6, fill=(126, 223, 255, 230))


def build_card(series_title: str) -> Image.Image:
    img = Image.new("RGBA", (WIDTH, HEIGHT), BG_TOP + (255,))
    px = img.load()
    for y in range(HEIGHT):
        t = y / (HEIGHT - 1)
        r = int(BG_TOP[0] * (1 - t) + BG_BOTTOM[0] * t)
        g = int(BG_TOP[1] * (1 - t) + BG_BOTTOM[1] * t)
        b = int(BG_TOP[2] * (1 - t) + BG_BOTTOM[2] * t)
        for x in range(WIDTH):
            px[x, y] = (r, g, b, 255)

    haze = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    hd = ImageDraw.Draw(haze)
    hd.ellipse((620, 80, 1130, 690), fill=(255, 168, 92, 34))
    hd.ellipse((-160, 1040, 420, 1820), fill=(72, 140, 255, 26))
    hd.ellipse((420, 1260, 1120, 2060), fill=(80, 190, 255, 22))
    haze = haze.filter(ImageFilter.GaussianBlur(70))
    img.alpha_composite(haze)

    stars = ImageDraw.Draw(img)
    star_points = [
        (126, 172), (924, 214), (204, 338), (820, 382), (156, 566), (890, 620),
        (256, 794), (944, 852), (174, 1076), (804, 1138), (244, 1362), (906, 1428),
        (130, 1606), (856, 1694),
    ]
    for x, y in star_points:
        r = 4 if (x + y) % 2 else 3
        stars.ellipse((x - r, y - r, x + r, y + r), fill=(183, 235, 255, 220))
    small_points = [(320, 238), (672, 300), (716, 470), (342, 646), (748, 760), (288, 932), (664, 1010), (770, 1288), (340, 1528), (710, 1580)]
    for x, y in small_points:
        stars.ellipse((x - 2, y - 2, x + 2, y + 2), fill=(183, 235, 255, 180))

    panel = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    pd = ImageDraw.Draw(panel)
    rounded_box(pd, (74, 88, WIDTH - 74, HEIGHT - 108), fill=PANEL_FILL, outline=(180, 228, 245, 160), width=2, radius=44)
    rounded_box(pd, (92, 108, WIDTH - 92, HEIGHT - 128), fill=(0, 0, 0, 0), outline=(180, 228, 245, 220), width=3, radius=40)
    img.alpha_composite(panel)

    d = ImageDraw.Draw(img)
    draw_center_text(d, 176, "天書小說", font(52), TEXT_MUTED)
    draw_center_text(d, 246, f"《{series_title}》", font(104, bold=True), TEXT_MAIN)
    draw_center_text(d, 364, "官方入口", font(78, bold=True), TEXT_MAIN)
    draw_center_text(d, 446, "看連載、找更新、認官方帳號，都從這裡開始", font(34), TEXT_SOFT)
    glow_line(img, 518)

    rounded_box(d, (122, 588, WIDTH - 122, 838), fill=(10, 22, 36, 196), outline=(110, 213, 255, 210), width=3, radius=34)
    draw_center_text(d, 634, "官網閱讀", font(42), TEXT_ACCENT)
    draw_center_text(d, 698, "tianshu.petrichor.tw", font(66, bold=True), TEXT_MAIN, stroke=2, stroke_fill=(6, 12, 20))
    draw_center_text(d, 780, "搜尋：星骸王座 天書小說", font(44), TEXT_MUTED)

    card_y = 914
    items = [
        ("YouTube", "@tianshunovel"),
        ("Threads", "@tianshu_novel"),
        ("Facebook", "天書小說｜原創小說天地-日更"),
    ]
    for idx, (label, value) in enumerate(items):
        top = card_y + idx * 184
        rounded_box(d, (122, top, WIDTH - 122, top + 132), fill=(8, 18, 30, 210), outline=PANEL_STROKE, width=3, radius=30)
        d.text((168, top + 30), label, font=font(38), fill=TEXT_ACCENT)
        vfont = font(40, bold=True) if idx < 2 else font(34, bold=True)
        d.text((432, top + (32 if idx < 2 else 36)), value, font=vfont, fill=TEXT_MAIN)

    rounded_box(d, (122, 1528, WIDTH - 122, 1752), fill=(5, 14, 24, 225), outline=(110, 213, 255, 235), width=3, radius=34)
    draw_center_text(d, 1586, "先記住官網，再記住搜尋詞", font(46), TEXT_ACCENT)
    draw_center_text(d, 1666, "影片看到哪一篇，都能順著找回來", font(40), TEXT_MAIN)

    draw_center_text(d, 1818, "Original Fiction Only  •  天書小說", font(30), (160, 177, 194))
    return img.convert("RGB")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", required=True)
    parser.add_argument("--title", default="星骸王座")
    args = parser.parse_args()

    out = Path(args.output)
    out.parent.mkdir(parents=True, exist_ok=True)
    build_card(args.title).save(out, format="PNG")


if __name__ == "__main__":
    main()
