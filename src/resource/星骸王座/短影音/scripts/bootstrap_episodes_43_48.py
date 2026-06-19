#!/usr/bin/env python3
from __future__ import annotations

import json
import math
import shutil
import subprocess
from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter, ImageOps


ROOT = Path(__file__).resolve().parents[1]
TEMPLATE_BUILD = ROOT / "第36篇 分肩白路" / "build-分肩白路.sh"
SUMMARY_CARD = ROOT / "scripts" / "generate_summary_end_card.py"
SERIES = "星骸王座"
COMMON_FRAMES = [
    {"duration": 3.0, "panX": -16, "panY": -8},
    {"duration": 3.4, "panX": 22, "panY": 12},
    {"duration": 4.1, "panX": 0, "panY": 0},
    {"duration": 4.5, "panX": -24, "panY": 18},
    {"duration": 4.8, "panX": 18, "panY": -14},
    {"duration": 5.0, "panX": -12, "panY": 22},
    {"duration": 5.3, "panX": 26, "panY": -10},
    {"duration": 5.5, "panX": -20, "panY": 16},
    {"duration": 5.8, "panX": 12, "panY": 8},
    {"duration": 6.2, "panX": -8, "panY": -12},
    {"duration": 6.4, "panX": 0, "panY": 0},
    {"duration": 6.0, "panX": 0, "panY": 0},
]
CTA = {
    "website": "tianshu.petrichor.tw",
    "search": "星骸王座 天書小說",
    "youtube": "@tianshunovel",
    "igThreads": "@tianshu_novel",
    "threads": "@tianshu_novel",
    "facebook": "天書小說｜原創小說天地-日更",
}


EPISODES = [
    {
        "episode": 43,
        "folder_title": "誰碰那支桿",
        "chapter_source": "第43章 翻簾留手",
        "hook_candidates": [
            "最危險的，不是病人，是那支誰都會順手扶正的公用器具。",
            "你以為自己只是扶一下，整條街卻會記住你的手。",
            "這條街開始挑人，不是從床邊，是從公家那支桿開始。",
        ],
        "hook": "最危險的，不是病人，是那支誰都會順手扶正的公用器具。",
        "beats": ["公用器具掛牌", "簾桿歪斜", "水桶回位", "矮凳補手", "灰上留痕", "孩子又先扶正"],
        "plan_title": "誰碰那支桿",
        "plan_candidates": [
            "最危險的，不是病人，是那支誰都會順手扶正的公用器具。",
            "你以為自己只是扶一下，整條街卻會記住你的手。",
            "這條街開始挑人，不是從床邊，是從公家那支桿開始。",
        ],
        "plan_beats": [
            "起：北街把簾桿、水桶、矮凳都列成公用物，先留灰再碰。",
            "承：一陣風把破簾掀歪，最容易出手的那種人立刻會去扶正。",
            "轉：阿棠在灰上看見同一種手痕，證明對方不是追病人，是追補位的人。",
            "合：大家剛學會分手，跑腿孩子卻又本能地把那支桿扶回去了。",
        ],
        "visual_note": "破簾、長桿、公用水桶、矮凳、灰上手痕與群體圍看。",
        "key_art_sources": [
            {"source": "第37篇 井口第二手/source/key-art/key-01.png", "look": {"tint": (34, 42, 62), "tint_strength": 0.10, "contrast": 1.06, "brightness": 0.98, "vignette": 0.22}},
            {"source": "第39篇 先喊誰/source/key-art/key-01.png", "look": {"tint": (30, 38, 58), "tint_strength": 0.12, "contrast": 1.08, "brightness": 0.97, "vignette": 0.24}},
            {"source": "第40篇 最後那個肩/source/key-art/key-04.png", "look": {"tint": (36, 42, 58), "tint_strength": 0.10, "contrast": 1.05, "brightness": 0.98, "vignette": 0.20}},
            {"source": "第42篇 誰又收平了/source/key-art/key-04.png", "look": {"tint": (26, 36, 56), "tint_strength": 0.14, "contrast": 1.10, "brightness": 0.96, "vignette": 0.28}},
        ],
        "frame_specs": [
            {"key": 1, "zoom": 1.02, "dx": -0.10, "dy": -0.04},
            {"key": 2, "zoom": 1.16, "dx": 0.10, "dy": -0.06},
            {"key": 1, "zoom": 1.08, "dx": 0.00, "dy": 0.04},
            {"key": 3, "zoom": 1.14, "dx": -0.08, "dy": 0.10},
            {"key": 4, "zoom": 1.18, "dx": 0.08, "dy": -0.08},
            {"key": 2, "zoom": 1.22, "dx": -0.10, "dy": 0.06, "mirror": True},
            {"key": 3, "zoom": 1.18, "dx": 0.12, "dy": 0.04},
            {"key": 1, "zoom": 1.20, "dx": -0.12, "dy": 0.06},
            {"key": 4, "zoom": 1.12, "dx": 0.10, "dy": -0.04},
            {"key": 2, "zoom": 1.24, "dx": -0.14, "dy": 0.10},
            {"key": 3, "zoom": 1.10, "dx": 0.12, "dy": -0.02},
        ],
        "voice_segments": [
            {"slug": "hook", "voice": "zh-TW-HsiaoChenNeural", "rate": "+0%", "pitch": "-4Hz", "style": "Hit", "text": "最危險的，不是病人，是那支誰都會順手扶正的公用器具。"},
            {"slug": "setup", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "北街把簾桿、水桶、矮凳全掛牌，誰碰先留灰。"},
            {"slug": "shen", "voice": "zh-CN-YunxiNeural", "rate": "+2%", "pitch": "-3Hz", "style": "Choice", "text": "先別救急。先看今天誰又去扶那支桿。"},
            {"slug": "scene", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "破簾一歪，有人去扶。木桶一滑，又有人順手擺正。"},
            {"slug": "clue", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-4Hz", "style": "Default", "text": "阿棠在灰上看見同一種手痕。對方不是追病人，是追最愛補位的人。"},
            {"slug": "rule", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "北街連公用器具都拆手輪，誰扶、誰搬、誰收，全都分開。"},
            {"slug": "twist", "voice": "zh-TW-HsiaoChenNeural", "rate": "+2%", "pitch": "-5Hz", "style": "Hit", "text": "可風一再起，最先把那支桿扶回去的，還是那個跑腿孩子。"},
            {"slug": "lead", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "如果連公家的東西都開始等同一雙手，這雙手還能躲多久？官網看星骸王座。"},
        ],
    },
    {
        "episode": 44,
        "folder_title": "那支分湯勺",
        "chapter_source": "第44章 公勺留肩",
        "hook_candidates": [
            "最可怕的，不是病，是那支大家輪著分湯的勺子。",
            "這支勺子不是在救人，它在挑誰最像照護那雙手。",
            "你只多舀那一口，整條照護路就會記住你。",
        ],
        "hook": "這支勺子不是在救人，它在挑誰最像照護那雙手。",
        "beats": ["公勺掛牌", "熱布輪手", "照護棚分位", "勺柄留灰", "最後一口回手", "熟手又被挑中"],
        "plan_title": "那支分湯勺",
        "plan_candidates": [
            "最可怕的，不是病，是那支大家輪著分湯的勺子。",
            "這支勺子不是在救人，它在挑誰最像照護那雙手。",
            "你只多舀那一口，整條照護路就會記住你。",
        ],
        "plan_beats": [
            "起：熱湯、熱布、照護棚全部改成輪手，不准再由同一個人包辦。",
            "承：病人一多，大家還是會把最後那一勺往最熟的人手裡塞。",
            "轉：阿棠在勺柄上抹灰，證明對方盯的不是病床，是照護習慣。",
            "合：規矩剛立住，那支勺子又自己回到了同一雙手上。",
        ],
        "visual_note": "分湯勺、熱氣、熱布架、照護棚、桌邊分藥與群眾視線。",
        "key_art_sources": [
            {"source": "第42篇 誰又收平了/source/key-art/key-01.png", "look": {"tint": (44, 44, 56), "tint_strength": 0.08, "contrast": 1.05, "brightness": 0.99, "vignette": 0.18}},
            {"source": "第41篇 名字外的手/source/key-art/key-02.png", "look": {"tint": (38, 42, 58), "tint_strength": 0.10, "contrast": 1.08, "brightness": 0.97, "vignette": 0.24}},
            {"source": "第40篇 最後那個肩/source/key-art/key-02.png", "look": {"tint": (36, 40, 56), "tint_strength": 0.10, "contrast": 1.04, "brightness": 0.98, "vignette": 0.20}},
            {"source": "第42篇 誰又收平了/source/key-art/key-03.png", "look": {"tint": (32, 38, 54), "tint_strength": 0.14, "contrast": 1.10, "brightness": 0.96, "vignette": 0.26}},
        ],
        "frame_specs": [
            {"key": 1, "zoom": 1.04, "dx": -0.06, "dy": -0.04},
            {"key": 2, "zoom": 1.12, "dx": 0.10, "dy": -0.02},
            {"key": 3, "zoom": 1.16, "dx": -0.10, "dy": 0.06},
            {"key": 1, "zoom": 1.10, "dx": 0.08, "dy": 0.08},
            {"key": 4, "zoom": 1.20, "dx": -0.12, "dy": 0.10},
            {"key": 2, "zoom": 1.18, "dx": 0.10, "dy": -0.08},
            {"key": 3, "zoom": 1.22, "dx": -0.08, "dy": 0.04, "mirror": True},
            {"key": 1, "zoom": 1.18, "dx": 0.12, "dy": 0.02},
            {"key": 4, "zoom": 1.10, "dx": -0.10, "dy": -0.06},
            {"key": 2, "zoom": 1.24, "dx": 0.14, "dy": 0.08},
            {"key": 3, "zoom": 1.12, "dx": -0.12, "dy": 0.00},
        ],
        "voice_segments": [
            {"slug": "hook", "voice": "zh-TW-HsiaoChenNeural", "rate": "+0%", "pitch": "-4Hz", "style": "Hit", "text": "這支勺子不是在救人，它在挑誰最像照護那雙手。"},
            {"slug": "setup", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "北街把熱湯、熱布、照護棚全改成輪手，不准誰一個人包辦。"},
            {"slug": "shen", "voice": "zh-CN-YunxiNeural", "rate": "+2%", "pitch": "-3Hz", "style": "Choice", "text": "先別看病人。先看誰一伸手就去拿那支勺。"},
            {"slug": "scene", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "病人一多，大家嘴上說輪手，最後那一口卻還是往熟手那邊遞。"},
            {"slug": "clue", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-4Hz", "style": "Default", "text": "阿棠在勺柄抹灰，第一個留痕的，不是掌櫃，是最會照顧人的那個。"},
            {"slug": "rule", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "公勺、熱布架、守棚位，全都拆開報名。"},
            {"slug": "twist", "voice": "zh-TW-HsiaoChenNeural", "rate": "+2%", "pitch": "-5Hz", "style": "Hit", "text": "可孩子一咳到彎腰，那支勺子還是自己回到同一雙手上。"},
            {"slug": "lead", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "如果連照顧人的那一勺都會認手，下一個被它拖住的人會是誰？官網看星骸王座。"},
        ],
    },
    {
        "episode": 45,
        "folder_title": "救命車先挑你",
        "chapter_source": "第45章 義車候掌",
        "hook_candidates": [
            "這台救命車會自己挑人站左前。",
            "最重的不是車，是它總知道該往誰的肩上偏。",
            "你以為自己只是幫忙推一下，它卻開始記住你的位子。",
        ],
        "hook": "這台救命車會自己挑人站左前。",
        "beats": ["義車入巷", "左前吃力", "換手仍偏", "車轅留記號", "四角輪替", "泥坑又回同肩"],
        "plan_title": "救命車先挑你",
        "plan_candidates": [
            "這台救命車會自己挑人站左前。",
            "最重的不是車，是它總知道該往誰的肩上偏。",
            "你以為自己只是幫忙推一下，它卻開始記住你的位子。",
        ],
        "plan_beats": [
            "起：義車一進北街，大家只想把病人先送出去。",
            "承：可不管換幾個人，左前那個位子總會先吃力，逼同一種人去頂上。",
            "轉：阿棠在車轅下摸到記號，證明對方在挑最習慣先扛的人。",
            "合：四角剛拆開輪替，一過泥坑，還是有人本能地把肩膀送回去。",
        ],
        "visual_note": "擁擠街口、推送重物、左前受力、車轅木痕、泥坑與群體換位。",
        "key_art_sources": [
            {"source": "第40篇 最後那個肩/source/key-art/key-01.png", "look": {"tint": (38, 42, 56), "tint_strength": 0.10, "contrast": 1.06, "brightness": 0.98, "vignette": 0.22}},
            {"source": "第38篇 後槽先應/source/key-art/key-01.png", "look": {"tint": (30, 38, 58), "tint_strength": 0.12, "contrast": 1.08, "brightness": 0.97, "vignette": 0.24}},
            {"source": "第37篇 井口第二手/source/key-art/key-02.png", "look": {"tint": (34, 40, 56), "tint_strength": 0.10, "contrast": 1.05, "brightness": 0.98, "vignette": 0.20}},
            {"source": "第40篇 最後那個肩/source/key-art/key-04.png", "look": {"tint": (28, 36, 56), "tint_strength": 0.14, "contrast": 1.10, "brightness": 0.96, "vignette": 0.28}},
        ],
        "frame_specs": [
            {"key": 1, "zoom": 1.06, "dx": -0.08, "dy": -0.04},
            {"key": 2, "zoom": 1.10, "dx": 0.12, "dy": -0.02},
            {"key": 3, "zoom": 1.18, "dx": -0.10, "dy": 0.06},
            {"key": 1, "zoom": 1.14, "dx": 0.10, "dy": 0.08},
            {"key": 4, "zoom": 1.20, "dx": -0.12, "dy": 0.10},
            {"key": 2, "zoom": 1.18, "dx": 0.08, "dy": -0.08},
            {"key": 3, "zoom": 1.22, "dx": -0.08, "dy": 0.04},
            {"key": 1, "zoom": 1.12, "dx": 0.12, "dy": 0.02},
            {"key": 4, "zoom": 1.18, "dx": -0.10, "dy": -0.06, "mirror": True},
            {"key": 2, "zoom": 1.24, "dx": 0.14, "dy": 0.08},
            {"key": 3, "zoom": 1.10, "dx": -0.12, "dy": 0.00},
        ],
        "voice_segments": [
            {"slug": "hook", "voice": "zh-TW-HsiaoChenNeural", "rate": "+0%", "pitch": "-4Hz", "style": "Hit", "text": "這台救命車會自己挑人站左前。"},
            {"slug": "setup", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "送病人的車一進北街，大家只想快一點把人推出去。"},
            {"slug": "shen", "voice": "zh-CN-YunxiNeural", "rate": "+2%", "pitch": "-3Hz", "style": "Choice", "text": "別搶著推。先看車把會往誰那邊偏。"},
            {"slug": "scene", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "可不管換幾個人，左前那個位子總先吃力，逼人把肩膀頂上去。"},
            {"slug": "clue", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-4Hz", "style": "Default", "text": "阿棠在車轅下摸到記號。對方不要最強的人，只要最習慣先扛的人。"},
            {"slug": "rule", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "北街第一次把推車位拆成四角輪替，誰也不能一路站左前。"},
            {"slug": "twist", "voice": "zh-TW-HsiaoChenNeural", "rate": "+2%", "pitch": "-5Hz", "style": "Hit", "text": "可車一過泥坑，還是有人本能地把最重那一下接回去。"},
            {"slug": "lead", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "如果連救命車都知道該去找誰，這條路最後會把誰拖熟？官網看星骸王座。"},
        ],
    },
    {
        "episode": 46,
        "folder_title": "那道暖門",
        "chapter_source": "第46章 暖屋候肩",
        "hook_candidates": [
            "那道暖門不是在救人，它在挑誰最先替人擋風。",
            "你只多站半步，門口就開始記住你的肩。",
            "真正會把人拖住的，不是病床，是那道總要有人去守的門。",
        ],
        "hook": "那道暖門不是在救人，它在挑誰最先替人擋風。",
        "beats": ["暖屋分列", "門縫灌風", "有人先擋", "門內留熱痕", "白屋改輪守", "舊傷肩又堵上"],
        "plan_title": "那道暖門",
        "plan_candidates": [
            "那道暖門不是在救人，它在挑誰最先替人擋風。",
            "你只多站半步，門口就開始記住你的肩。",
            "真正會把人拖住的，不是病床，是那道總要有人去守的門。",
        ],
        "plan_beats": [
            "起：暖屋門前分成送人、守夜、送炭三列，想把肩膀拆開。",
            "承：可風一灌進來，總有同一種人先側身把門堵住。",
            "轉：阿棠在門內摸到熱痕，確定暖路記住的是肩，不是名字。",
            "合：白屋門口剛改成輪守，半夜一亂，舊傷那道肩還是自己回去了。",
        ],
        "visual_note": "暖屋門縫、蒸氣、守門肩膀、夜裡送炭、手貼門框與白屋門前人群。",
        "key_art_sources": [
            {"source": "第41篇 名字外的手/source/key-art/key-01.png", "look": {"tint": (26, 34, 54), "tint_strength": 0.16, "contrast": 1.12, "brightness": 0.95, "vignette": 0.30}},
            {"source": "第41篇 名字外的手/source/key-art/key-02.png", "look": {"tint": (40, 42, 56), "tint_strength": 0.10, "contrast": 1.06, "brightness": 0.98, "vignette": 0.22}},
            {"source": "第42篇 誰又收平了/source/key-art/key-04.png", "look": {"tint": (28, 36, 56), "tint_strength": 0.14, "contrast": 1.10, "brightness": 0.96, "vignette": 0.28}},
            {"source": "第39篇 先喊誰/source/key-art/key-01.png", "look": {"tint": (32, 38, 58), "tint_strength": 0.12, "contrast": 1.08, "brightness": 0.97, "vignette": 0.24}},
        ],
        "frame_specs": [
            {"key": 1, "zoom": 1.04, "dx": -0.06, "dy": -0.04},
            {"key": 2, "zoom": 1.14, "dx": 0.12, "dy": -0.02},
            {"key": 3, "zoom": 1.18, "dx": -0.10, "dy": 0.10},
            {"key": 4, "zoom": 1.12, "dx": 0.08, "dy": 0.04},
            {"key": 1, "zoom": 1.20, "dx": -0.12, "dy": 0.08},
            {"key": 2, "zoom": 1.18, "dx": 0.10, "dy": -0.08},
            {"key": 3, "zoom": 1.22, "dx": -0.08, "dy": 0.06},
            {"key": 4, "zoom": 1.16, "dx": 0.12, "dy": 0.02},
            {"key": 2, "zoom": 1.10, "dx": -0.10, "dy": -0.06},
            {"key": 1, "zoom": 1.22, "dx": 0.14, "dy": 0.10},
            {"key": 3, "zoom": 1.12, "dx": -0.12, "dy": 0.00, "mirror": True},
        ],
        "voice_segments": [
            {"slug": "hook", "voice": "zh-TW-HsiaoChenNeural", "rate": "+0%", "pitch": "-4Hz", "style": "Hit", "text": "那道暖門不是在救人，它在挑誰最先替人擋風。"},
            {"slug": "setup", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "暖屋門前排成三列，送人、守夜、送炭，就是不准同一肩全包。"},
            {"slug": "shen", "voice": "zh-CN-YunxiNeural", "rate": "+2%", "pitch": "-3Hz", "style": "Choice", "text": "先問門。誰一冷，就先替別人擋上去。"},
            {"slug": "scene", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "風一灌進來，總有人先側身堵門。門一歪，又有人先把它關穩。"},
            {"slug": "clue", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-4Hz", "style": "Default", "text": "阿棠在門內摸到熱痕。這條暖路記住的不是臉，是肩膀。"},
            {"slug": "rule", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "白屋門前立新規，守門得輪，不能讓同一肩連站。"},
            {"slug": "twist", "voice": "zh-TW-HsiaoChenNeural", "rate": "+2%", "pitch": "-5Hz", "style": "Hit", "text": "可半夜孩子一抖，最先堵在門縫前的，還是那個舊傷沒好的男人。"},
            {"slug": "lead", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "如果那道門已經記住他的肩，下一次誰能把他拉開？官網看星骸王座。"},
        ],
    },
    {
        "episode": 47,
        "folder_title": "後門先認手",
        "chapter_source": "第47章 白屋後門",
        "hook_candidates": [
            "那扇後門不認臉，它先認你摸石頭的手。",
            "你只是替人守更，後門卻先把你的次序記下來。",
            "最先被盯上的，不一定是進門的人，可能是站門外摸石頭的人。",
        ],
        "hook": "那扇後門不認臉，它先認你摸石頭的手。",
        "beats": ["白石排號", "守更留牌", "摸石回位", "舊紙露字", "後門改分肩", "一喊藥又伸手"],
        "plan_title": "後門先認手",
        "plan_candidates": [
            "那扇後門不認臉，它先認你摸石頭的手。",
            "你只是替人守更，後門卻先把你的次序記下來。",
            "最先被盯上的，不一定是進門的人，可能是站門外摸石頭的人。",
        ],
        "plan_beats": [
            "起：白屋後門前排起白石和守更牌，想把進門次序拆開。",
            "承：可有人摸完石頭，總會本能地站回原位，像那扇門正在等他。",
            "轉：阿棠翻到舊牌紙，看見後門先認手、再認肩的規矩。",
            "合：大家剛學會不能連摸兩次白石，一聲喊藥，又有人先把手伸回去。",
        ],
        "visual_note": "白石、門牌、夜裡後門、守更燈火、手伸向石頭與門邊回望。",
        "key_art_sources": [
            {"source": "第42篇 誰又收平了/source/key-art/key-04.png", "look": {"tint": (24, 34, 56), "tint_strength": 0.16, "contrast": 1.12, "brightness": 0.95, "vignette": 0.30}},
            {"source": "第41篇 名字外的手/source/key-art/key-04.png", "look": {"tint": (42, 42, 56), "tint_strength": 0.08, "contrast": 1.05, "brightness": 0.99, "vignette": 0.18}},
            {"source": "第39篇 先喊誰/source/key-art/key-04.png", "look": {"tint": (34, 40, 58), "tint_strength": 0.10, "contrast": 1.06, "brightness": 0.98, "vignette": 0.22}},
            {"source": "第42篇 誰又收平了/source/key-art/key-02.png", "look": {"tint": (38, 40, 54), "tint_strength": 0.10, "contrast": 1.05, "brightness": 0.98, "vignette": 0.20}},
        ],
        "frame_specs": [
            {"key": 1, "zoom": 1.08, "dx": -0.08, "dy": -0.04},
            {"key": 2, "zoom": 1.10, "dx": 0.12, "dy": -0.02},
            {"key": 4, "zoom": 1.16, "dx": -0.10, "dy": 0.06},
            {"key": 3, "zoom": 1.12, "dx": 0.08, "dy": 0.04},
            {"key": 1, "zoom": 1.20, "dx": -0.12, "dy": 0.10},
            {"key": 2, "zoom": 1.18, "dx": 0.10, "dy": -0.08},
            {"key": 4, "zoom": 1.22, "dx": -0.08, "dy": 0.06},
            {"key": 3, "zoom": 1.16, "dx": 0.12, "dy": 0.02},
            {"key": 1, "zoom": 1.12, "dx": -0.10, "dy": -0.06, "mirror": True},
            {"key": 2, "zoom": 1.24, "dx": 0.14, "dy": 0.08},
            {"key": 4, "zoom": 1.10, "dx": -0.12, "dy": 0.00},
        ],
        "voice_segments": [
            {"slug": "hook", "voice": "zh-TW-HsiaoChenNeural", "rate": "+0%", "pitch": "-4Hz", "style": "Hit", "text": "那扇後門不認臉，它先認你摸石頭的手。"},
            {"slug": "setup", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "白屋後門前擺上白石和守更牌，誰守夜、誰取號，全都得留名。"},
            {"slug": "shen", "voice": "zh-CN-YunxiNeural", "rate": "+2%", "pitch": "-3Hz", "style": "Choice", "text": "別先進門。先看誰摸完石頭，又站回原位。"},
            {"slug": "scene", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "有人摸石、有人遞牌、有人替人守更，看起來只是幫忙，後門卻把次序全記住。"},
            {"slug": "clue", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-4Hz", "style": "Default", "text": "阿棠翻到舊牌紙，只寫一句：門先認手，再認肩，最後才認人。"},
            {"slug": "rule", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "北街改成先分肩，再進門，誰都不能連摸兩次白石。"},
            {"slug": "twist", "voice": "zh-TW-HsiaoChenNeural", "rate": "+2%", "pitch": "-5Hz", "style": "Hit", "text": "可一聲喊藥，第一個把手伸向白石的，還是同一個人。"},
            {"slug": "lead", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "如果連後門都學會等那雙手，它下一次開門要吞的是誰？官網看星骸王座。"},
        ],
    },
    {
        "episode": 48,
        "folder_title": "第一包藥",
        "chapter_source": "第48章 白石藥手",
        "hook_candidates": [
            "最危險的不是毒，是第一包藥總被交給同一雙手。",
            "藥一分成三份，整條街卻還是知道該把第一包塞給誰。",
            "最冷的不是白石巷，是大家等那雙手先動的那一秒。",
        ],
        "hook": "最危險的不是毒，是第一包藥總被交給同一雙手。",
        "beats": ["三份拆藥", "路紙攤開", "第一包回手", "藥紙抹痕", "晨市換牌", "整街等手先動"],
        "plan_title": "第一包藥",
        "plan_candidates": [
            "最危險的不是毒，是第一包藥總被交給同一雙手。",
            "藥一分成三份，整條街卻還是知道該把第一包塞給誰。",
            "最冷的不是白石巷，是大家等那雙手先動的那一秒。",
        ],
        "plan_beats": [
            "起：白石巷把抓藥、送藥、餵藥全拆成三份，不准同人從頭拿到底。",
            "承：可病人一咳，大家還是本能地把第一包藥塞給最穩的那雙手。",
            "轉：阿棠在藥紙背面看見抹痕，證明連藥路都在學誰先伸手。",
            "合：晨市剛把路牌換掉，整條街卻已經開始等那雙手先動了。",
        ],
        "visual_note": "藥紙、分藥桌、白石巷、晨市路牌、伸手接藥與病人催促。",
        "key_art_sources": [
            {"source": "第42篇 誰又收平了/source/key-art/key-01.png", "look": {"tint": (44, 44, 56), "tint_strength": 0.08, "contrast": 1.05, "brightness": 0.99, "vignette": 0.18}},
            {"source": "第42篇 誰又收平了/source/key-art/key-02.png", "look": {"tint": (36, 40, 54), "tint_strength": 0.10, "contrast": 1.06, "brightness": 0.98, "vignette": 0.20}},
            {"source": "第39篇 先喊誰/source/key-art/key-04.png", "look": {"tint": (34, 38, 56), "tint_strength": 0.12, "contrast": 1.08, "brightness": 0.97, "vignette": 0.24}},
            {"source": "第41篇 名字外的手/source/key-art/key-03.png", "look": {"tint": (42, 40, 52), "tint_strength": 0.08, "contrast": 1.04, "brightness": 0.99, "vignette": 0.18}},
        ],
        "frame_specs": [
            {"key": 1, "zoom": 1.04, "dx": -0.06, "dy": -0.04},
            {"key": 3, "zoom": 1.12, "dx": 0.10, "dy": -0.02},
            {"key": 2, "zoom": 1.18, "dx": -0.10, "dy": 0.06},
            {"key": 1, "zoom": 1.10, "dx": 0.08, "dy": 0.08},
            {"key": 4, "zoom": 1.18, "dx": -0.12, "dy": 0.10},
            {"key": 3, "zoom": 1.22, "dx": 0.10, "dy": -0.08},
            {"key": 2, "zoom": 1.16, "dx": -0.08, "dy": 0.04},
            {"key": 1, "zoom": 1.18, "dx": 0.12, "dy": 0.02},
            {"key": 4, "zoom": 1.10, "dx": -0.10, "dy": -0.06, "mirror": True},
            {"key": 3, "zoom": 1.24, "dx": 0.14, "dy": 0.08},
            {"key": 2, "zoom": 1.12, "dx": -0.12, "dy": 0.00},
        ],
        "voice_segments": [
            {"slug": "hook", "voice": "zh-TW-HsiaoChenNeural", "rate": "+0%", "pitch": "-4Hz", "style": "Hit", "text": "最危險的不是毒，是第一包藥總被交給同一雙手。"},
            {"slug": "setup", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "白石巷今天把抓藥、送藥、餵藥全拆成三份，不准同人從頭拿到底。"},
            {"slug": "shen", "voice": "zh-CN-YunxiNeural", "rate": "+2%", "pitch": "-3Hz", "style": "Choice", "text": "藥不能再認手。先把送藥名單攤開。"},
            {"slug": "scene", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "可病人一咳，大家還是本能地把第一包藥塞給最穩的那個。"},
            {"slug": "clue", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-4Hz", "style": "Default", "text": "阿棠在藥紙背面看見抹痕。連送藥那條路，都在學誰會先伸手。"},
            {"slug": "rule", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "北街把晨市路牌全換掉，半步也拆，不准再讓一個人拿到底。"},
            {"slug": "twist", "voice": "zh-TW-HsiaoChenNeural", "rate": "+2%", "pitch": "-5Hz", "style": "Hit", "text": "可最冷的不是藥，是整條街都開始等那雙手先動。"},
            {"slug": "lead", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "如果第一包藥已經知道該去找誰，他還能把這條路切開嗎？官網看星骸王座。"},
        ],
    },
]


def normalize_text(text: str) -> str:
    return text.replace("  ", " ").strip()


def apply_look(image: Image.Image, look: dict, *, zoom: float = 1.0, dx: float = 0.0, dy: float = 0.0, mirror: bool = False) -> Image.Image:
    image = image.convert("RGB")
    if mirror:
        image = ImageOps.mirror(image)

    w, h = image.size
    crop_w = max(1, int(w / zoom))
    crop_h = max(1, int(h / zoom))
    cx = w / 2 + dx * (w - crop_w) / 2
    cy = h / 2 + dy * (h - crop_h) / 2
    left = int(max(0, min(w - crop_w, cx - crop_w / 2)))
    top = int(max(0, min(h - crop_h, cy - crop_h / 2)))
    image = image.crop((left, top, left + crop_w, top + crop_h)).resize((1080, 1920), Image.Resampling.LANCZOS)

    image = ImageEnhance.Contrast(image).enhance(look.get("contrast", 1.0))
    image = ImageEnhance.Brightness(image).enhance(look.get("brightness", 1.0))
    image = ImageEnhance.Color(image).enhance(look.get("saturation", 1.0))

    tint = look.get("tint")
    if tint:
        overlay = Image.new("RGB", image.size, tuple(tint))
        image = Image.blend(image, overlay, look.get("tint_strength", 0.0))

    if look.get("sharpen"):
        image = ImageEnhance.Sharpness(image).enhance(look["sharpen"])

    vignette_strength = look.get("vignette", 0.0)
    if vignette_strength > 0:
        mask = Image.new("L", image.size, 0)
        px = mask.load()
        for y in range(image.height):
            for x in range(image.width):
                nx = (x - image.width / 2) / (image.width / 2)
                ny = (y - image.height / 2) / (image.height / 2)
                dist = math.sqrt(nx * nx + ny * ny)
                px[x, y] = int(max(0, min(255, 255 * (1 - max(0, dist - 0.25) / 0.75))))
        mask = mask.filter(ImageFilter.GaussianBlur(radius=100))
        dark = Image.new("RGB", image.size, (5, 8, 14))
        image = Image.composite(image, Image.blend(image, dark, vignette_strength), mask)

    return image


def make_plan_markdown(spec: dict) -> str:
    lines = [
        f"# 第{spec['episode']:02d}篇 {spec['folder_title']}短影音企劃",
        "",
        "## Hook 候選",
        "",
    ]
    for item in spec["plan_candidates"]:
        lines.append(f"- {item.strip()}")
    lines.extend(
        [
            "",
            "## 選用爆點",
            "",
            spec["hook"],
            "",
            "## 事件來源",
            "",
            spec["chapter_source"],
            "",
            "## 起承轉合",
            "",
        ]
    )
    for item in spec["plan_beats"]:
        lines.append(f"- {item}")
    lines.extend(
        [
            "",
            "## 內容節奏",
            "",
            "- 前 3 秒先丟怪事，不講書名與世界觀。",
            "- 中段每 8-12 秒換一次信息，不讓影片只有情緒、沒有事件進展。",
            "- 結尾回到最具體的未解點，不做空泛導流句。",
            "",
            "## 製作規格",
            "",
            "- 1080x1920，9:16，30fps，目標長度 60 秒。",
            "- 背景音：無。主檔只保留分段 TTS 人聲與最後 CTA 靜音空間。",
            "- 圖像：本篇專用重構 key art 4 張，從既有無字連續性素材重新構圖，再派生 frame 12 張，不直接重複前篇 frame。",
            "- 聲音：基底女旁白 `zh-TW-HsiaoChenNeural`；男性台詞 `zh-CN-YunxiNeural`；角色語氣靠 rate / pitch 微調，不靠堆術語。",
            "- 字幕：build 時依每段 TTS 實際長度動態生成 ASS/SRT，CTA end card 不疊字幕。",
            f"- 畫面重點：{spec['visual_note']}",
            "- 吸引力邊界：角色成年、衣著完整，用決策壓力、距離、工作張力與群體視線提升吸引力，不做色情化構圖。",
        ]
    )
    return "\n".join(lines).strip() + "\n"


def make_narration_txt(spec: dict) -> str:
    lines = []
    for idx, seg in enumerate(spec["voice_segments"], start=1):
        lines.append(
            f"{idx:02d}. [{seg['slug']}] {seg['voice']} {seg['rate']} {seg['pitch']} {normalize_text(seg['text'])}"
        )
    return "\n".join(lines).strip() + "\n"


def make_storyboard(spec: dict) -> dict:
    frames = []
    for idx, frame in enumerate(COMMON_FRAMES, start=1):
        frames.append(
            {
                "file": f"frame-{idx:02d}.png",
                "duration": frame["duration"],
                "panX": frame["panX"],
                "panY": frame["panY"],
            }
        )

    return {
        "series": SERIES,
        "episode": spec["episode"],
        "title": spec["folder_title"],
        "chapterSource": spec["chapter_source"],
        "format": "1080x1920 vertical 9:16 30fps",
        "totalDuration": 60,
        "subtitleCutoff": 54,
        "backgroundMusic": "none",
        "outputFile": f"{SERIES}-短影音-第{spec['episode']:02d}篇-{spec['folder_title']}-1080x1920.mp4",
        "hook": spec["hook"],
        "hookCandidates": [item.strip() for item in spec["hook_candidates"]],
        "beats": spec["beats"],
        "frames": frames,
        "voiceSegments": spec["voice_segments"],
        "cta": CTA,
    }


def make_notes(spec: dict) -> str:
    return (
        f"# 第{spec['episode']:02d}篇 {spec['folder_title']}製作紀錄\n\n"
        "## 本篇策略\n\n"
        f"- 主鉤子：{spec['hook']}\n"
        f"- 素材起點：{spec['chapter_source']}。\n"
        "- 內容處理：不做章節摘要，也不要求和小說章節一對一對應；只保留目前最能吸流量的一條異常因果線。\n"
        "- 文案處理：優先用母語讀者一秒能懂的白話，把作品內部詞換成看得見的物件、動作、代價與未解問題。\n"
        "- 聲音規則：旁白固定 HsiaoChen；男性短句維持 Yunxi fallback，避免角色性別錯位與突然換回女聲。\n"
        "- 授權規則：無外部音樂、無來源不明音訊；成品只含人聲、必要靜音與字幕。\n"
        "- 視覺規則：本批沿用相鄰連續性章回的既有無字圖重新構圖成 4 張本篇專用 key art，再派生 12 張直式 frame；劇情 frame 保持全無字，CTA 僅保留最後一張官方入口 summary card。\n\n"
        "## Hook 決策\n\n"
        + "\n".join(f"- {item.strip()}" for item in spec["hook_candidates"])
        + f"\n\n選用 `{spec['hook']}`，因為它最先把怪事和代價說清，不靠作品術語撐鉤子。\n\n"
        "## 分鏡意圖\n\n"
        f"- 視覺主軸：{spec['visual_note']}\n"
        "- 前段只用乾淨無字事件畫面；命題交給旁白與動態字幕，不在 source frame 燒任何上方標題或 Banner。\n"
        "- 中段每 8-12 秒要有新信息：新物件、新錯位、新規矩、新證據或更深一層的危險。\n"
        "- 第 12 張固定 6 秒官方入口 summary CTA，統整官網、搜尋詞、YouTube、Threads、Facebook。\n\n"
        "## 最終 QA\n\n"
        "- build 後回填：影片規格、voice source 時長、字幕截止時間、CTA 停留、男聲 fallback 與抽樣 QA 結果。\n"
    )


def copy_build_script(folder: Path, title: str) -> None:
    build_name = f"build-{title}.sh"
    target = folder / build_name
    content = TEMPLATE_BUILD.read_text(encoding="utf-8").replace("分肩白路", title)
    target.write_text(content, encoding="utf-8")
    target.chmod(0o755)


def generate_episode_assets(spec: dict) -> None:
    folder = ROOT / f"第{spec['episode']:02d}篇 {spec['folder_title']}"
    source_dir = folder / "source"
    image_dir = source_dir / "images"
    key_dir = source_dir / "key-art"
    voice_dir = folder / "voice"
    notes_dir = folder / "notes"
    subtitles_dir = folder / "subtitles"
    qa_dir = folder / "qa"
    output_dir = folder / "output"
    normalized_dir = source_dir / "normalized"
    tmp_dir = folder / "tmp"

    for path in [image_dir, key_dir, voice_dir, notes_dir, subtitles_dir, qa_dir, output_dir, normalized_dir, tmp_dir]:
        path.mkdir(parents=True, exist_ok=True)

    (folder / "企劃.md").write_text(make_plan_markdown(spec), encoding="utf-8")
    (voice_dir / "narration.txt").write_text(make_narration_txt(spec), encoding="utf-8")
    (source_dir / "storyboard.json").write_text(
        json.dumps(make_storyboard(spec), ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    (notes_dir / "production-notes.md").write_text(make_notes(spec), encoding="utf-8")
    copy_build_script(folder, spec["folder_title"])

    generated_keys: list[Path] = []
    for idx, art in enumerate(spec["key_art_sources"], start=1):
        source_path = ROOT / art["source"]
        image = Image.open(source_path)
        transformed = apply_look(image, art["look"])
        out = key_dir / f"key-{idx:02d}.png"
        transformed.save(out, format="PNG")
        generated_keys.append(out)

    for idx, frame_spec in enumerate(spec["frame_specs"], start=1):
        base = Image.open(generated_keys[frame_spec["key"] - 1])
        transformed = apply_look(
            base,
            {"contrast": 1.0, "brightness": 1.0, "saturation": 1.0, "vignette": 0.0},
            zoom=frame_spec.get("zoom", 1.0),
            dx=frame_spec.get("dx", 0.0),
            dy=frame_spec.get("dy", 0.0),
            mirror=frame_spec.get("mirror", False),
        )
        transformed.save(image_dir / f"frame-{idx:02d}.png", format="PNG")

    subprocess.run(
        ["python3", str(SUMMARY_CARD), "--title", SERIES, "--output", str(image_dir / "frame-12.png")],
        check=True,
    )


def main() -> None:
    for spec in EPISODES:
        generate_episode_assets(spec)


if __name__ == "__main__":
    main()
