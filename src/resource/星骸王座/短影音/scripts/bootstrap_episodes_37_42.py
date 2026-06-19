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
        "episode": 37,
        "folder_title": "井口第二手",
        "chapter_source": "第37章 井繩共肩",
        "hook_candidates": [
            "最危險的，不是最會提水的人。",
            "你還沒開口，他就先把第二桶接走了。",
            "這條街最先被偷的，可能不是水，是好心。 ",
        ],
        "hook": "你還沒開口，他就先把第二桶接走了。",
        "beats": ["井口掛牌", "未喊先接", "兩桶一起晃", "黑木塞露字", "喊名分井力", "孩子又先補手"],
        "plan_title": "井口第二手",
        "plan_candidates": [
            "最危險的，不是最會提水的人。",
            "你還沒開口，他就先把第二桶接走了。",
            "這條街最先被偷的，可能不是水，是好心。",
        ],
        "plan_beats": [
            "起：北街今天打井先掛牌，第二手不能再悶著接。",
            "承：挑菜老婦故意讓兩桶水一起晃，要逼人把那口重吞回自己肩上。",
            "轉：黑木塞掉下來，寫明對方怕的就是把肩分開。",
            "合：真正讓沈曜變臉的不是老婦，是那個跑腿孩子又先補了第二手。",
        ],
        "visual_note": "井口、繩結、共肩木環、兩桶同時失手、孩子先補手。",
        "key_art_sources": [
            {"source": "第36篇 分肩白路/source/key-art/key-01.png", "look": {"tint": (36, 44, 62), "tint_strength": 0.10, "contrast": 1.06, "brightness": 0.98, "vignette": 0.22}},
            {"source": "第36篇 分肩白路/source/key-art/key-03.png", "look": {"tint": (30, 40, 58), "tint_strength": 0.12, "contrast": 1.08, "brightness": 0.97, "vignette": 0.26}},
            {"source": "第34篇 洗盆聽肩/source/key-art/key-01.png", "look": {"tint": (32, 44, 68), "tint_strength": 0.10, "contrast": 1.04, "brightness": 0.98, "vignette": 0.18}},
            {"source": "第21篇 檐後二炭/source/key-art/key-01.png", "look": {"tint": (28, 38, 60), "tint_strength": 0.14, "contrast": 1.10, "brightness": 0.96, "vignette": 0.24}},
        ],
        "frame_specs": [
            {"key": 1, "zoom": 1.02, "dx": -0.10, "dy": -0.02},
            {"key": 2, "zoom": 1.12, "dx": 0.12, "dy": -0.06},
            {"key": 3, "zoom": 1.05, "dx": 0.00, "dy": 0.02},
            {"key": 2, "zoom": 1.18, "dx": -0.08, "dy": 0.10},
            {"key": 4, "zoom": 1.10, "dx": 0.08, "dy": -0.04},
            {"key": 3, "zoom": 1.14, "dx": -0.10, "dy": 0.06, "mirror": True},
            {"key": 2, "zoom": 1.24, "dx": 0.05, "dy": 0.04},
            {"key": 1, "zoom": 1.16, "dx": 0.14, "dy": 0.02},
            {"key": 4, "zoom": 1.22, "dx": -0.14, "dy": 0.08},
            {"key": 3, "zoom": 1.18, "dx": 0.12, "dy": -0.08},
            {"key": 2, "zoom": 1.08, "dx": -0.14, "dy": -0.04},
        ],
        "voice_segments": [
            {"slug": "hook", "voice": "zh-TW-HsiaoChenNeural", "rate": "+0%", "pitch": "-4Hz", "style": "Hit", "text": "你還沒開口，他就先把第二桶接走了。"},
            {"slug": "setup", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "北街今天打井掛牌，誰下桶誰接手，當場說清。"},
            {"slug": "shen", "voice": "zh-CN-YunxiNeural", "rate": "+2%", "pitch": "-3Hz", "style": "Choice", "text": "沈曜只看：誰總在沒人喊前，先把那口重接走。"},
            {"slug": "oldwoman", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "老婦故意讓兩桶水一起晃，逼人把那一下吞回肩上。"},
            {"slug": "rope", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "阿福差點又補，短繩卻先把他勒停。"},
            {"slug": "clue", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-4Hz", "style": "Default", "text": "黑木塞掉下來，只寫一句：肩肯分，路就斷。"},
            {"slug": "reveal", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "大家這才懂，最危的不是會喊的人，是先來接的人。"},
            {"slug": "rule", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "北街當場改規矩：夜裡打第二桶，得先喊名字。"},
            {"slug": "lead", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "可最讓沈曜變臉的，還是跑腿孩子又先把第二手接穩了。官網看星骸王座。"},
        ],
    },
    {
        "episode": 38,
        "folder_title": "後槽先應",
        "chapter_source": "第38章 井槽點名",
        "hook_candidates": [
            "比井口更會偷人的，是洗布棚後那條長木槽。",
            "大家都會防第一手，最難防的是後面那一下。",
            "你以為事情做完了，它才開始找人。",
        ],
        "hook": "比井口更會偷人的，是洗布棚後那條長木槽。",
        "beats": ["長槽異響", "先手後槽", "小腳夫又補", "木舌露字", "點名接力", "總應未滿"],
        "plan_title": "後槽先應",
        "plan_candidates": [
            "比井口更會偷人的，是洗布棚後那條長木槽。",
            "大家都會防第一手，最難防的是後面那一下。",
            "你以為事情做完了，它才開始找人。",
        ],
        "plan_beats": [
            "起：大家明明已學會先喊名字，長木槽卻還在偷第二口力。",
            "承：小腳夫剛接完熱水，下一息又想把槽尾灰水一併送走。",
            "轉：阿棠從木槽裡挑出木舌，證明對方等的就是後槽那一下。",
            "合：北街第一次把先手和後槽分開掛牌，還看見照壁其實還沒借滿。",
        ],
        "visual_note": "長木槽、水盆、掛牌、跑腿孩子、木舌與後槽空位。",
        "key_art_sources": [
            {"source": "第34篇 洗盆聽肩/source/key-art/key-01.png", "look": {"tint": (34, 44, 66), "tint_strength": 0.10, "contrast": 1.05, "brightness": 0.98, "vignette": 0.20}},
            {"source": "第34篇 洗盆聽肩/source/key-art/key-02.png", "look": {"tint": (26, 38, 60), "tint_strength": 0.12, "contrast": 1.08, "brightness": 0.96, "vignette": 0.24}},
            {"source": "第33篇 盆耳回肩/source/key-art/key-02.png", "look": {"tint": (30, 44, 62), "tint_strength": 0.10, "contrast": 1.04, "brightness": 0.98, "vignette": 0.18}},
            {"source": "第35篇 落肩舊訣/source/key-art/key-04.png", "look": {"tint": (30, 40, 58), "tint_strength": 0.12, "contrast": 1.08, "brightness": 0.97, "vignette": 0.22}},
        ],
        "frame_specs": [
            {"key": 1, "zoom": 1.02, "dx": -0.02, "dy": -0.04},
            {"key": 2, "zoom": 1.20, "dx": 0.10, "dy": -0.08},
            {"key": 3, "zoom": 1.12, "dx": -0.08, "dy": 0.06},
            {"key": 4, "zoom": 1.06, "dx": 0.08, "dy": 0.02},
            {"key": 2, "zoom": 1.18, "dx": -0.12, "dy": 0.12},
            {"key": 1, "zoom": 1.16, "dx": 0.12, "dy": 0.08},
            {"key": 3, "zoom": 1.22, "dx": 0.06, "dy": -0.04},
            {"key": 4, "zoom": 1.18, "dx": -0.10, "dy": 0.10},
            {"key": 2, "zoom": 1.26, "dx": 0.14, "dy": -0.02},
            {"key": 1, "zoom": 1.10, "dx": -0.14, "dy": -0.08},
            {"key": 4, "zoom": 1.22, "dx": 0.10, "dy": 0.02},
        ],
        "voice_segments": [
            {"slug": "hook", "voice": "zh-TW-HsiaoChenNeural", "rate": "+0%", "pitch": "-4Hz", "style": "Hit", "text": "比井口更會偷人的，是洗布棚後那條長木槽。"},
            {"slug": "setup", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "大家明明學會先喊名字，一忙起來，卻還是有人補完後面那一下。"},
            {"slug": "shen", "voice": "zh-CN-YunxiNeural", "rate": "+2%", "pitch": "-3Hz", "style": "Choice", "text": "沈曜只看：誰總把後槽做掉。"},
            {"slug": "runner", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "小腳夫剛接完熱水，下一息又想把槽尾灰水一起送走。"},
            {"slug": "clue", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-4Hz", "style": "Default", "text": "阿棠從木槽裡挑出木舌：力走久了，最後還是會滑回同一個人。"},
            {"slug": "payoff", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "北街第一次把先手和後槽分開掛牌。"},
            {"slug": "twist", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "照壁還在等你嫌麻煩，等你又把那一下吞回去。"},
            {"slug": "expose", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-4Hz", "style": "Hit", "text": "瘦高漢一碰木牌就露餡，因為他要試的是誰會補到最後。"},
            {"slug": "lead", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "如果每件雜事最後都落到同一個人，他是不是早被整條街養成熟路？官網看星骸王座。"},
        ],
    },
    {
        "episode": 39,
        "folder_title": "先喊誰",
        "chapter_source": "第39章 先名後力",
        "hook_candidates": [
            "真正會害死一個人的，可能不是刀，是全街一急就先喊他的名字。",
            "你以為是在求救，其實是在把力往同一個人身上推。",
            "名字一旦被喊熟，整條街都會往那邊滑。",
        ],
        "hook": "真正會害死一個人的，可能不是刀，是全街一急就先喊他的名字。",
        "beats": ["先報活口", "名字養熟", "木葉露字", "看火老頭被翻四次", "藥鋪禁喊阿棠", "孩子脫口喊沈曜"],
        "plan_title": "先喊誰",
        "plan_candidates": [
            "真正會害死一個人的，可能不是刀，是全街一急就先喊他的名字。",
            "你以為是在求救，其實是在把力往同一個人身上推。",
            "名字一旦被喊熟，整條街都會往那邊滑。",
        ],
        "plan_beats": [
            "起：北街今天先報缺藥、缺火、缺手，不准再先喊熟人。",
            "承：大家逐漸發現，一亂起來最先被想到的人，才是最危的那個。",
            "轉：灰桶裡掉出木葉，明寫名字一喊熟，所有力氣都會自己回去。",
            "合：阿棠把藥鋪改成先報活，可孩子摔碗時，整條街還是先喊了沈曜。",
        ],
        "visual_note": "名字牌、木板、灰桶、藥鋪門口、誰被先想到。",
        "key_art_sources": [
            {"source": "第36篇 分肩白路/source/key-art/key-04.png", "look": {"tint": (38, 44, 60), "tint_strength": 0.10, "contrast": 1.06, "brightness": 0.98, "vignette": 0.22}},
            {"source": "第31篇 回腕板/source/key-art/key-01.png", "look": {"tint": (34, 42, 62), "tint_strength": 0.12, "contrast": 1.08, "brightness": 0.97, "vignette": 0.20}},
            {"source": "第35篇 落肩舊訣/source/key-art/key-01.png", "look": {"tint": (40, 46, 58), "tint_strength": 0.08, "contrast": 1.05, "brightness": 0.99, "vignette": 0.18}},
            {"source": "第33篇 盆耳回肩/source/key-art/key-04.png", "look": {"tint": (32, 40, 58), "tint_strength": 0.10, "contrast": 1.06, "brightness": 0.98, "vignette": 0.20}},
        ],
        "frame_specs": [
            {"key": 1, "zoom": 1.04, "dx": -0.08, "dy": -0.02},
            {"key": 2, "zoom": 1.10, "dx": 0.08, "dy": -0.02},
            {"key": 3, "zoom": 1.14, "dx": -0.10, "dy": 0.04},
            {"key": 4, "zoom": 1.10, "dx": 0.10, "dy": 0.00},
            {"key": 2, "zoom": 1.22, "dx": -0.12, "dy": 0.10},
            {"key": 1, "zoom": 1.18, "dx": 0.14, "dy": 0.04},
            {"key": 3, "zoom": 1.20, "dx": 0.06, "dy": -0.06},
            {"key": 4, "zoom": 1.24, "dx": -0.06, "dy": 0.08},
            {"key": 2, "zoom": 1.08, "dx": 0.12, "dy": -0.10},
            {"key": 1, "zoom": 1.20, "dx": -0.14, "dy": 0.08},
            {"key": 3, "zoom": 1.12, "dx": 0.10, "dy": 0.02},
        ],
        "voice_segments": [
            {"slug": "hook", "voice": "zh-TW-HsiaoChenNeural", "rate": "+0%", "pitch": "-4Hz", "style": "Hit", "text": "最危險的不是刀，是全街一急就先喊你的名字。"},
            {"slug": "setup", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "北街今天先報缺藥、缺火、缺手，不准先喊誰來救。"},
            {"slug": "atang", "voice": "zh-TW-HsiaoChenNeural", "rate": "+2%", "pitch": "-5Hz", "style": "Choice", "text": "阿棠把藥鋪和井邊全改成先報活，不先想熟人。"},
            {"slug": "reveal", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "因為名字一喊熟，水、火、藥、門，最後都會自己往那邊靠。"},
            {"slug": "clue", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-4Hz", "style": "Default", "text": "灰桶裡掉出木葉：名字一喊熟，所有力氣都會自己回去。"},
            {"slug": "oldman", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "看火老頭一天被翻了四次牌，連他自己都愣住了。"},
            {"slug": "cut", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "藥鋪門口立刻改規矩：先報活，不准先喊阿棠。"},
            {"slug": "climax", "voice": "zh-TW-HsiaoChenNeural", "rate": "+2%", "pitch": "-5Hz", "style": "Hit", "text": "可孩子摔碗那一刻，整條街第一個脫口而出的，卻還是沈曜。"},
            {"slug": "lead", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "如果連名字都能被人養成路，沈曜還能躲多久？官網看星骸王座。"},
        ],
    },
    {
        "episode": 40,
        "folder_title": "最後那個肩",
        "chapter_source": "第40章 後肩回名",
        "hook_candidates": [
            "名字可以藏，肩膀藏不了。",
            "大家不再先喊你，卻還是會把最後那個肩遞給你。",
            "最重那一下，不一定落在前面的人身上。",
        ],
        "hook": "名字可以藏，肩膀藏不了。",
        "beats": ["熟名轉熟肩", "最後那寸重", "木葉露後肩", "前肩後肩換肩", "暖肩墊喚舊傷", "後手不續"],
        "plan_title": "最後那個肩",
        "plan_candidates": [
            "名字可以藏，肩膀藏不了。",
            "大家不再先喊你，卻還是會把最後那個肩遞給你。",
            "最重那一下，不一定落在前面的人身上。",
        ],
        "plan_beats": [
            "起：北街昨天才學會別先喊熟名，今天照壁就改問最後那個後肩。",
            "承：一桶水、一個病人、一盆灰撞在一起，所有人還是會先找最扛得住的人。",
            "轉：舊橫擔裡掉出木葉，明寫名字瘦了，肩卻還是老樣子。",
            "合：阿棠把前肩、後肩、換肩全拆開，卻也看見對方想用沈曜的舊傷把後肩喚回去。",
        ],
        "visual_note": "後肩、換肩、舊橫擔、暖肩墊、沈曜舊傷與群體分肩。",
        "key_art_sources": [
            {"source": "第36篇 分肩白路/source/key-art/key-03.png", "look": {"tint": (40, 42, 56), "tint_strength": 0.10, "contrast": 1.08, "brightness": 0.98, "vignette": 0.24}},
            {"source": "第35篇 落肩舊訣/source/key-art/key-03.png", "look": {"tint": (34, 40, 56), "tint_strength": 0.12, "contrast": 1.06, "brightness": 0.98, "vignette": 0.20}},
            {"source": "第35篇 落肩舊訣/source/key-art/key-02.png", "look": {"tint": (42, 44, 58), "tint_strength": 0.08, "contrast": 1.04, "brightness": 0.99, "vignette": 0.18}},
            {"source": "第36篇 分肩白路/source/key-art/key-02.png", "look": {"tint": (30, 40, 60), "tint_strength": 0.12, "contrast": 1.08, "brightness": 0.97, "vignette": 0.24}},
        ],
        "frame_specs": [
            {"key": 1, "zoom": 1.06, "dx": -0.06, "dy": -0.04},
            {"key": 2, "zoom": 1.10, "dx": 0.12, "dy": -0.02},
            {"key": 3, "zoom": 1.16, "dx": -0.10, "dy": 0.06},
            {"key": 4, "zoom": 1.14, "dx": 0.10, "dy": 0.08},
            {"key": 1, "zoom": 1.18, "dx": 0.10, "dy": -0.10},
            {"key": 3, "zoom": 1.22, "dx": -0.12, "dy": 0.10, "mirror": True},
            {"key": 2, "zoom": 1.18, "dx": 0.08, "dy": 0.04},
            {"key": 4, "zoom": 1.22, "dx": -0.08, "dy": -0.04},
            {"key": 1, "zoom": 1.12, "dx": -0.12, "dy": 0.12},
            {"key": 3, "zoom": 1.18, "dx": 0.12, "dy": -0.06},
            {"key": 4, "zoom": 1.08, "dx": 0.06, "dy": 0.02},
        ],
        "voice_segments": [
            {"slug": "hook", "voice": "zh-TW-HsiaoChenNeural", "rate": "+0%", "pitch": "-4Hz", "style": "Hit", "text": "名字可以藏，肩膀藏不了。"},
            {"slug": "setup", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "北街昨天才學會別先喊熟名，今天照壁就改問最後那個後肩。"},
            {"slug": "crowd", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "水、病人、灰盆一撞上去，大家眼睛還是會先找最扛得住的人。"},
            {"slug": "clue", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-4Hz", "style": "Default", "text": "舊橫擔裡掉出一句話：名字可以少喊，最後那個肩還是會自己回去。"},
            {"slug": "atang", "voice": "zh-TW-HsiaoChenNeural", "rate": "+2%", "pitch": "-5Hz", "style": "Choice", "text": "阿棠立刻把前肩、後肩、換肩全分開。"},
            {"slug": "pad", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "可對方又送來一條暖肩墊，想把沈曜那道舊傷重新喚回來。"},
            {"slug": "payoff", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "北街第一次看懂，原來後肩也能分。"},
            {"slug": "twist", "voice": "zh-TW-HsiaoChenNeural", "rate": "+2%", "pitch": "-4Hz", "style": "Hit", "text": "但沈曜更怕的，是大家一急，還是會把最後那一下默默遞給他。"},
            {"slug": "lead", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "如果整條街最習慣把重壓回他那道舊傷上，他還能躲多久？官網看星骸王座。"},
        ],
    },
    {
        "episode": 41,
        "folder_title": "名字外的手",
        "chapter_source": "第41章 後手分名",
        "hook_candidates": [
            "最容易被偷走的，不是前面那雙手，是事情快完時又補一下的人。",
            "名字都躲開了，照壁就開始偷尾事。",
            "你以為自己只是順手，其實正在把命往身上收。",
        ],
        "hook": "最容易被偷走的，不是前面那雙手，是事情快完時又補一下的人。",
        "beats": ["尾事成牌", "郭伯連補三口", "黑紙露字", "尾事分名", "阿福只守收聲", "命外成命"],
        "plan_title": "名字外的手",
        "plan_candidates": [
            "最容易被偷走的，不是前面那雙手，是事情快完時又補一下的人。",
            "名字都躲開了，照壁就開始偷尾事。",
            "你以為自己只是順手，其實正在把命往身上收。",
        ],
        "plan_beats": [
            "起：阿棠把熄火、送藥、補門、收布全做成尾事牌。",
            "承：郭伯一亂起來，就順手把最後幾口一起做完。",
            "轉：門楔裡掉出黑紙，明寫不點名的後手最後會自己變成命路。",
            "合：北街第一次看見，原來不把所有事全做完，人也不會死。",
        ],
        "visual_note": "熄火、送藥、補門、孩子與老人、門楔黑紙、只守一口尾事。",
        "key_art_sources": [
            {"source": "第21篇 檐後二炭/source/key-art/key-01.png", "look": {"tint": (26, 36, 58), "tint_strength": 0.14, "contrast": 1.08, "brightness": 0.96, "vignette": 0.26}},
            {"source": "第21篇 檐後二炭/source/key-art/key-02.png", "look": {"tint": (38, 42, 56), "tint_strength": 0.10, "contrast": 1.05, "brightness": 0.98, "vignette": 0.20}},
            {"source": "第21篇 檐後二炭/source/key-art/key-03.png", "look": {"tint": (44, 42, 52), "tint_strength": 0.08, "contrast": 1.04, "brightness": 0.99, "vignette": 0.18}},
            {"source": "第24篇 盤腳偏熱/source/key-art/key-03.png", "look": {"tint": (30, 36, 54), "tint_strength": 0.14, "contrast": 1.10, "brightness": 0.96, "vignette": 0.28}},
        ],
        "frame_specs": [
            {"key": 1, "zoom": 1.04, "dx": -0.08, "dy": -0.04},
            {"key": 2, "zoom": 1.10, "dx": 0.08, "dy": -0.02},
            {"key": 3, "zoom": 1.12, "dx": -0.10, "dy": 0.04},
            {"key": 4, "zoom": 1.18, "dx": 0.12, "dy": -0.06},
            {"key": 1, "zoom": 1.16, "dx": 0.10, "dy": 0.10},
            {"key": 2, "zoom": 1.22, "dx": -0.12, "dy": 0.08},
            {"key": 3, "zoom": 1.06, "dx": 0.10, "dy": 0.06},
            {"key": 4, "zoom": 1.22, "dx": -0.10, "dy": 0.10},
            {"key": 2, "zoom": 1.18, "dx": 0.12, "dy": -0.08},
            {"key": 1, "zoom": 1.08, "dx": -0.12, "dy": 0.04},
            {"key": 3, "zoom": 1.18, "dx": 0.06, "dy": -0.02},
        ],
        "voice_segments": [
            {"slug": "hook", "voice": "zh-TW-HsiaoChenNeural", "rate": "+0%", "pitch": "-4Hz", "style": "Hit", "text": "最容易被偷走的，不是前面那雙手，是做完後又補一下的人。"},
            {"slug": "setup", "voice": "zh-TW-HsiaoChenNeural", "rate": "+10%", "pitch": "-3Hz", "style": "Default", "text": "阿棠今天把熄火、送藥、補門、收布，全做成尾事牌。"},
            {"slug": "reveal", "voice": "zh-TW-HsiaoChenNeural", "rate": "+10%", "pitch": "-3Hz", "style": "Default", "text": "誰一亂就把最後幾口一起做完，誰就最危險。"},
            {"slug": "guobo", "voice": "zh-CN-YunxiNeural", "rate": "+4%", "pitch": "-3Hz", "style": "Choice", "text": "郭伯本來只提一桶水，轉眼卻連端湯、壓風、補炭都想補完。"},
            {"slug": "clue", "voice": "zh-TW-HsiaoChenNeural", "rate": "+10%", "pitch": "-4Hz", "style": "Default", "text": "門楔裡掉出黑紙：你不點名，那隻手最後會自己變成命。"},
            {"slug": "payoff", "voice": "zh-TW-HsiaoChenNeural", "rate": "+10%", "pitch": "-3Hz", "style": "Default", "text": "北街第一次把尾事一口口分出去，最會收尾的人也得站著看。"},
            {"slug": "twist", "voice": "zh-TW-HsiaoChenNeural", "rate": "+10%", "pitch": "-3Hz", "style": "Default", "text": "很多以為非誰不可的事，其實只是你太習慣讓他全吞。"},
            {"slug": "climax", "voice": "zh-TW-HsiaoChenNeural", "rate": "+2%", "pitch": "-5Hz", "style": "Hit", "text": "阿福這次沒有再把所有亂一起補完，他只守住那一口收聲。"},
            {"slug": "lead", "voice": "zh-TW-HsiaoChenNeural", "rate": "+10%", "pitch": "-3Hz", "style": "Default", "text": "當所有人都學會分尾，照壁下一步還會去找哪一雙更安靜的手？官網看星骸王座。"},
        ],
    },
    {
        "episode": 42,
        "folder_title": "誰又收平了",
        "chapter_source": "第42章 餘手留痕",
        "hook_candidates": [
            "有人不搶第一手，也不碰最後一手，卻總能把整個亂局悄悄收平。",
            "最像善意的那一下，反而最容易先沒有名字。",
            "這條街現在連收尾都要留痕，因為太會體貼的人最危險。",
        ],
        "hook": "有人不搶第一手，也不碰最後一手，卻總能把整個亂局悄悄收平。",
        "beats": ["故意留亂", "天亮又被收平", "暖肩墊黑紙", "誰手發癢先按灰", "亂留見牌", "最先沒名字的人"],
        "plan_title": "誰又收平了",
        "plan_candidates": [
            "有人不搶第一手，也不碰最後一手，卻總能把整個亂局悄悄收平。",
            "最像善意的那一下，反而最容易先沒有名字。",
            "這條街現在連收尾都要留痕，因為太會體貼的人最危險。",
        ],
        "plan_beats": [
            "起：阿棠故意把洗布槽與屋內小亂留著，天亮卻又被人收得太乾淨。",
            "承：這種人不搶功，也不被點名，只是總想替別人把難看的地方先抹平。",
            "轉：暖肩墊裡翻出黑紙，直接寫明命外可平。",
            "合：沈曜立下按灰留痕的新規，整條街第一次逼自己別把日子收得太漂亮。",
        ],
        "visual_note": "暖肩墊、灰痕、亂處留痕、扶正與掖被角、洗布槽與後井公物。",
        "key_art_sources": [
            {"source": "第24篇 盤腳偏熱/source/key-art/key-01.png", "look": {"tint": (42, 44, 58), "tint_strength": 0.08, "contrast": 1.05, "brightness": 0.99, "vignette": 0.18}},
            {"source": "第24篇 盤腳偏熱/source/key-art/key-03.png", "look": {"tint": (28, 36, 54), "tint_strength": 0.14, "contrast": 1.10, "brightness": 0.96, "vignette": 0.28}},
            {"source": "第21篇 檐後二炭/source/key-art/key-03.png", "look": {"tint": (40, 40, 54), "tint_strength": 0.10, "contrast": 1.05, "brightness": 0.98, "vignette": 0.20}},
            {"source": "第32篇 空背來手/source/key-art/key-03.png", "look": {"tint": (24, 34, 56), "tint_strength": 0.16, "contrast": 1.12, "brightness": 0.95, "vignette": 0.30}},
        ],
        "frame_specs": [
            {"key": 1, "zoom": 1.04, "dx": -0.08, "dy": -0.02},
            {"key": 2, "zoom": 1.10, "dx": 0.12, "dy": -0.06},
            {"key": 3, "zoom": 1.14, "dx": -0.08, "dy": 0.08},
            {"key": 4, "zoom": 1.18, "dx": 0.08, "dy": 0.08},
            {"key": 1, "zoom": 1.16, "dx": 0.12, "dy": 0.04},
            {"key": 2, "zoom": 1.22, "dx": -0.10, "dy": 0.10},
            {"key": 4, "zoom": 1.10, "dx": 0.10, "dy": -0.10},
            {"key": 3, "zoom": 1.20, "dx": -0.14, "dy": 0.06},
            {"key": 2, "zoom": 1.08, "dx": 0.14, "dy": -0.02},
            {"key": 1, "zoom": 1.20, "dx": -0.12, "dy": 0.08},
            {"key": 4, "zoom": 1.16, "dx": 0.06, "dy": 0.02},
        ],
        "voice_segments": [
            {"slug": "hook", "voice": "zh-TW-HsiaoChenNeural", "rate": "+2%", "pitch": "-4Hz", "style": "Hit", "text": "有人不搶第一手，也不碰最後一手，卻總能把亂局悄悄收平。"},
            {"slug": "setup", "voice": "zh-TW-HsiaoChenNeural", "rate": "+10%", "pitch": "-3Hz", "style": "Default", "text": "阿棠昨夜故意把洗布槽弄亂，天一亮，居然又被人收得太乾淨。"},
            {"slug": "reveal", "voice": "zh-TW-HsiaoChenNeural", "rate": "+10%", "pitch": "-3Hz", "style": "Default", "text": "那個人不是英雄，只是看見門歪了就扶，看見被角亂了就掖。"},
            {"slug": "clue", "voice": "zh-TW-HsiaoChenNeural", "rate": "+10%", "pitch": "-4Hz", "style": "Default", "text": "暖肩墊裡只留一句：最像善意的那一手，最容易先沒有名字。"},
            {"slug": "payoff", "voice": "zh-TW-HsiaoChenNeural", "rate": "+10%", "pitch": "-3Hz", "style": "Default", "text": "沈曜當場立新規，誰手一癢想補，就先按灰留痕。"},
            {"slug": "rule", "voice": "zh-TW-HsiaoChenNeural", "rate": "+10%", "pitch": "-3Hz", "style": "Default", "text": "北街第一次逼自己把亂留下來，不准再悶聲把日子收漂亮。"},
            {"slug": "climax", "voice": "zh-TW-HsiaoChenNeural", "rate": "+2%", "pitch": "-5Hz", "style": "Hit", "text": "星核只提醒一句：最先沒名字的，往往就是最會替人收平亂局的人。"},
            {"slug": "twist", "voice": "zh-TW-HsiaoChenNeural", "rate": "+10%", "pitch": "-3Hz", "style": "Default", "text": "所以這一次，北街不求好看，只求先把那雙手看清。"},
            {"slug": "lead", "voice": "zh-TW-HsiaoChenNeural", "rate": "+12%", "pitch": "-3Hz", "style": "Default", "text": "如果連善後都能被養成路，下一個被整條街推回去的人會是誰？官網看星骸王座。"},
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
