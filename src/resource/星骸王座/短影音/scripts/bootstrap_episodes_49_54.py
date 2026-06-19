#!/usr/bin/env python3
from __future__ import annotations

import json
import math
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
        "episode": 49,
        "folder_title": "第一包先給誰",
        "chapter_source": "第48-49章 白石藥手 / 晨市穩手",
        "hook_candidates": [
            "最毒的不是藥，是病家一急就把第一包先塞給同一雙手。",
            "真正會把命交出去的，不是病，是第一包藥先認人。",
            "你以為自己只是先遞藥，整條白路卻正等這一下。",
        ],
        "hook": "最毒的不是藥，是病家一急就把第一包先塞給同一雙手。",
        "beats": ["第一包先塞熟手", "昨夜活命變招牌", "拆包見順序", "晨市先問來源", "病家自己按住", "後頭兩包也想認人"],
        "plan_title": "第一包先給誰",
        "plan_candidates": [
            "最毒的不是藥，是病家一急就把第一包先塞給同一雙手。",
            "真正會把命交出去的，不是病，是第一包藥先認人。",
            "你以為自己只是先遞藥，整條白路卻正等這一下。",
        ],
        "plan_beats": [
            "起：白石巷已開始教病家，第一包先給最穩那雙手。",
            "承：昨夜活下來的孩子，被拿來當今天整條晨市的招牌。",
            "轉：阿棠拆開藥包，發現連遞藥順序都被人先寫好了。",
            "合：北街把『先報哪裡聽的，再拆第一包』拖成晨市白天規矩。",
        ],
        "visual_note": "分藥桌、白石粉、晨市擁擠人群、病家遞藥與阿棠拆藥紙。",
        "key_art_sources": [
            {"source": "第48篇 第一包藥/source/key-art/key-01.png", "look": {"tint": (42, 44, 56), "tint_strength": 0.08, "contrast": 1.05, "brightness": 0.99, "vignette": 0.18}},
            {"source": "第48篇 第一包藥/source/key-art/key-03.png", "look": {"tint": (32, 38, 56), "tint_strength": 0.12, "contrast": 1.08, "brightness": 0.97, "vignette": 0.24}},
            {"source": "第44篇 那支分湯勺/source/key-art/key-01.png", "look": {"tint": (44, 44, 56), "tint_strength": 0.08, "contrast": 1.05, "brightness": 0.99, "vignette": 0.18}},
            {"source": "第47篇 後門先認手/source/key-art/key-03.png", "look": {"tint": (34, 40, 58), "tint_strength": 0.10, "contrast": 1.06, "brightness": 0.98, "vignette": 0.22}},
        ],
        "frame_specs": [
            {"key": 1, "zoom": 1.04, "dx": -0.06, "dy": -0.04},
            {"key": 2, "zoom": 1.14, "dx": 0.10, "dy": -0.02},
            {"key": 3, "zoom": 1.18, "dx": -0.10, "dy": 0.06},
            {"key": 1, "zoom": 1.12, "dx": 0.08, "dy": 0.08},
            {"key": 4, "zoom": 1.18, "dx": -0.12, "dy": 0.10},
            {"key": 2, "zoom": 1.22, "dx": 0.10, "dy": -0.08},
            {"key": 3, "zoom": 1.16, "dx": -0.08, "dy": 0.04},
            {"key": 1, "zoom": 1.18, "dx": 0.12, "dy": 0.02},
            {"key": 4, "zoom": 1.10, "dx": -0.10, "dy": -0.06},
            {"key": 2, "zoom": 1.24, "dx": 0.14, "dy": 0.08},
            {"key": 3, "zoom": 1.12, "dx": -0.12, "dy": 0.00},
        ],
        "voice_segments": [
            {"slug": "hook", "voice": "zh-TW-HsiaoChenNeural", "rate": "+0%", "pitch": "-4Hz", "style": "Hit", "text": "最毒的不是藥，是病家一急就把第一包先塞給同一雙手。"},
            {"slug": "setup", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "白石巷最近都在教：孩子一抖，第一包先給最穩那個。"},
            {"slug": "shen", "voice": "zh-CN-YunxiNeural", "rate": "+2%", "pitch": "-3Hz", "style": "Choice", "text": "先別找人情。先看誰又把第一包往同一隻手塞。"},
            {"slug": "scene", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "昨夜才救過孩子，今晨整條街就拿那件事當招牌。"},
            {"slug": "clue", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-4Hz", "style": "Default", "text": "阿棠拆開藥包，發現連分藥次序都被人先寫好了。"},
            {"slug": "rule", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "北街當場改規矩：先報哪裡聽的，再拆第一包。"},
            {"slug": "twist", "voice": "zh-TW-HsiaoChenNeural", "rate": "+2%", "pitch": "-5Hz", "style": "Hit", "text": "可真有老人發寒時，所有眼睛還是先往那雙手看去。"},
            {"slug": "lead", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "如果第一包一急就會認人，後頭兩包會把誰一路養熟？官網看星骸王座。"},
        ],
    },
    {
        "episode": 50,
        "folder_title": "拿昨夜那個",
        "chapter_source": "第49章 晨市穩手",
        "hook_candidates": [
            "更陰的是，他們現在連你昨夜救回來的孩子，都拿來教你把命交出去。",
            "你昨天救的人，今天就被拿來當說服別人的招牌。",
            "最髒的不是假話，是它拿真的活命去騙下一戶。",
        ],
        "hook": "更陰的是，他們現在連你昨夜救回來的孩子，都拿來教你把命交出去。",
        "beats": ["昨夜活命成招牌", "三個攤口接力", "路紙角落留句", "先問誰拿孩子說嘴", "晨市小姑娘被帶進去", "活命故事被拿去騙下一戶"],
        "plan_title": "拿昨夜那個",
        "plan_candidates": [
            "更陰的是，他們現在連你昨夜救回來的孩子，都拿來教你把命交出去。",
            "你昨天救的人，今天就被拿來當說服別人的招牌。",
            "最髒的不是假話，是它拿真的活命去騙下一戶。",
        ],
        "plan_beats": [
            "起：晨市今天到處都在說，昨夜那個孩子就是靠穩手活回來的。",
            "承：磨石攤、豆皮口和賣粥婦人，一口接一口把同一句送進病家耳裡。",
            "轉：路紙最角落只寫著：若有人問，就說昨夜那個。",
            "合：北街今天不先查病，先查誰拿別人的活命去帶路。",
        ],
        "visual_note": "晨市人潮、哭過的小姑娘、攤口遞話、病家抱人與紙角特寫。",
        "key_art_sources": [
            {"source": "第43篇 誰碰那支桿/source/key-art/key-01.png", "look": {"tint": (34, 42, 62), "tint_strength": 0.10, "contrast": 1.06, "brightness": 0.98, "vignette": 0.22}},
            {"source": "第47篇 後門先認手/source/key-art/key-03.png", "look": {"tint": (34, 40, 58), "tint_strength": 0.10, "contrast": 1.06, "brightness": 0.98, "vignette": 0.22}},
            {"source": "第48篇 第一包藥/source/key-art/key-02.png", "look": {"tint": (36, 40, 54), "tint_strength": 0.10, "contrast": 1.06, "brightness": 0.98, "vignette": 0.20}},
            {"source": "第44篇 那支分湯勺/source/key-art/key-03.png", "look": {"tint": (36, 40, 56), "tint_strength": 0.10, "contrast": 1.04, "brightness": 0.98, "vignette": 0.20}},
        ],
        "frame_specs": [
            {"key": 1, "zoom": 1.06, "dx": -0.08, "dy": -0.04},
            {"key": 2, "zoom": 1.10, "dx": 0.12, "dy": -0.02},
            {"key": 3, "zoom": 1.18, "dx": -0.10, "dy": 0.06},
            {"key": 4, "zoom": 1.12, "dx": 0.08, "dy": 0.08},
            {"key": 1, "zoom": 1.20, "dx": -0.12, "dy": 0.10},
            {"key": 2, "zoom": 1.16, "dx": 0.10, "dy": -0.08},
            {"key": 3, "zoom": 1.22, "dx": -0.08, "dy": 0.04},
            {"key": 4, "zoom": 1.16, "dx": 0.12, "dy": 0.02},
            {"key": 2, "zoom": 1.10, "dx": -0.10, "dy": -0.06},
            {"key": 1, "zoom": 1.22, "dx": 0.14, "dy": 0.08},
            {"key": 3, "zoom": 1.12, "dx": -0.12, "dy": 0.00, "mirror": True},
        ],
        "voice_segments": [
            {"slug": "hook", "voice": "zh-TW-HsiaoChenNeural", "rate": "+0%", "pitch": "-4Hz", "style": "Hit", "text": "更陰的是，他們現在連你昨夜救回來的孩子，都拿來教你把命交出去。"},
            {"slug": "setup", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "晨市今天到處都在說：昨夜那個孩子，就是靠穩手活回來的。"},
            {"slug": "shen", "voice": "zh-CN-YunxiNeural", "rate": "+2%", "pitch": "-3Hz", "style": "Choice", "text": "別信那句。那不是救命經驗，是拿人活命來帶路。"},
            {"slug": "scene", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "磨石攤、豆皮口、賣粥婦人，一個接一個把同一句送進病家耳裡。"},
            {"slug": "clue", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-4Hz", "style": "Default", "text": "路紙最角落只寫一句：若有人問，就說昨夜那個。"},
            {"slug": "rule", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "北街今天先不問病，先問誰拿昨夜的孩子教你。"},
            {"slug": "twist", "voice": "zh-TW-HsiaoChenNeural", "rate": "+2%", "pitch": "-5Hz", "style": "Hit", "text": "最先被說動的，不是外人，是想幫忙的晨市小姑娘。"},
            {"slug": "lead", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "如果連你活下來那一夜都能被拿去騙下一戶，這條路到底想收走誰？官網看星骸王座。"},
        ],
    },
    {
        "episode": 51,
        "folder_title": "最穩那雙手",
        "chapter_source": "第48-49章 白石藥手 / 晨市穩手",
        "hook_candidates": [
            "市場最危險的，不是假藥，是那句「先找最穩那雙手」。",
            "越像省事的話，越可能是在替你挑手。",
            "真正會把命交出去的，往往只是一句聽起來很穩的建議。",
        ],
        "hook": "市場最危險的，不是假藥，是那句「先找最穩那雙手」。",
        "beats": ["好心話最像陷阱", "先藥後驚", "別過白板", "三只碗拆手", "嘴上會分眼睛不會", "穩手被越養越像主手"],
        "plan_title": "最穩那雙手",
        "plan_candidates": [
            "市場最危險的，不是假藥，是那句「先找最穩那雙手」。",
            "越像省事的話，越可能是在替你挑手。",
            "真正會把命交出去的，往往只是一句聽起來很穩的建議。",
        ],
        "plan_beats": [
            "起：晨市現在最流行的一句話，不是藥名，是先找最穩那雙手。",
            "承：這句話一路帶著先藥後驚、別過白板與昨夜那個的借口往病家耳裡鑽。",
            "轉：阿棠把藥、驚、人三只碗排開，當場教大家別讓同一隻手一路走滿。",
            "合：嘴上都說會分，真到老人發抖時，眼睛還是先去找最穩那個。",
        ],
        "visual_note": "藥碗、攤口、人群視線、阿棠擺三只碗與慌張病家。",
        "key_art_sources": [
            {"source": "第45篇 救命車先挑你/source/key-art/key-01.png", "look": {"tint": (38, 42, 56), "tint_strength": 0.10, "contrast": 1.06, "brightness": 0.98, "vignette": 0.22}},
            {"source": "第44篇 那支分湯勺/source/key-art/key-02.png", "look": {"tint": (38, 42, 58), "tint_strength": 0.10, "contrast": 1.08, "brightness": 0.97, "vignette": 0.24}},
            {"source": "第43篇 誰碰那支桿/source/key-art/key-01.png", "look": {"tint": (34, 42, 62), "tint_strength": 0.10, "contrast": 1.06, "brightness": 0.98, "vignette": 0.22}},
            {"source": "第47篇 後門先認手/source/key-art/key-03.png", "look": {"tint": (34, 40, 58), "tint_strength": 0.10, "contrast": 1.06, "brightness": 0.98, "vignette": 0.22}},
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
            {"slug": "hook", "voice": "zh-TW-HsiaoChenNeural", "rate": "+0%", "pitch": "-4Hz", "style": "Hit", "text": "市場最危險的，不是假藥，是那句先找最穩那雙手。"},
            {"slug": "setup", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "這句話聽起來像好心，病家一急，卻最容易把命直接交出去。"},
            {"slug": "shen", "voice": "zh-CN-YunxiNeural", "rate": "+2%", "pitch": "-3Hz", "style": "Choice", "text": "越像省事，越像有人在替你挑手。"},
            {"slug": "scene", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "有人教你先藥後驚，有人教你別過白板，有人教你只信昨夜救過人的那個。"},
            {"slug": "clue", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-4Hz", "style": "Default", "text": "沈曜一看就懂，這不是亂講，是整條晨市在替同一句話接力。"},
            {"slug": "rule", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "阿棠把藥、驚、人三只碗排開，當場教病家別讓同一隻手一路走滿。"},
            {"slug": "twist", "voice": "zh-TW-HsiaoChenNeural", "rate": "+2%", "pitch": "-5Hz", "style": "Hit", "text": "可老人一抖，大家嘴上說會分，眼睛還是先去找最穩那個。"},
            {"slug": "lead", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "如果一條街都被教成先找最穩那雙手，誰會被它越養越像主手？官網看星骸王座。"},
        ],
    },
    {
        "episode": 52,
        "folder_title": "藥裡先磨了路",
        "chapter_source": "第49章 晨市穩手",
        "hook_candidates": [
            "更冷的是，你還沒開口，路就先被磨進藥包裡了。",
            "他們不是先寫路再配藥，是配藥時就把順序磨進去。",
            "你以為自己在拆藥，其實是在拆一條別人早寫好的路。",
        ],
        "hook": "更冷的是，你還沒開口，路就先被磨進藥包裡了。",
        "beats": ["藥紙沾細粉", "不是舊白石", "暖藥邊也有", "先拆三手", "碰藥紙先留痕", "配藥時就先帶路"],
        "plan_title": "藥裡先磨了路",
        "plan_candidates": [
            "更冷的是，你還沒開口，路就先被磨進藥包裡了。",
            "他們不是先寫路再配藥，是配藥時就把順序磨進去。",
            "你以為自己在拆藥，其實是在拆一條別人早寫好的路。",
        ],
        "plan_beats": [
            "起：晨市拆藥時，藥紙邊全沾著同一種細白粉。",
            "承：阿棠沿著藥紙、藥包邊角和暖藥碎末一路追，看出這不是舊白石。",
            "轉：那是晨市磨盤的新粉，還混了會留路的薄白附。",
            "合：北街立刻改成藥先拆三手，誰碰過藥紙都得當場留痕。",
        ],
        "visual_note": "藥紙特寫、白粉細末、拆藥碗、阿棠手邊刀背與晨市磨盤感。",
        "key_art_sources": [
            {"source": "第47篇 後門先認手/source/key-art/key-01.png", "look": {"tint": (24, 34, 56), "tint_strength": 0.16, "contrast": 1.12, "brightness": 0.95, "vignette": 0.30}},
            {"source": "第48篇 第一包藥/source/key-art/key-01.png", "look": {"tint": (42, 44, 56), "tint_strength": 0.08, "contrast": 1.05, "brightness": 0.99, "vignette": 0.18}},
            {"source": "第44篇 那支分湯勺/source/key-art/key-04.png", "look": {"tint": (32, 38, 54), "tint_strength": 0.14, "contrast": 1.10, "brightness": 0.96, "vignette": 0.26}},
            {"source": "第42篇 誰又收平了/source/key-art/key-01.png", "look": {"tint": (44, 44, 56), "tint_strength": 0.08, "contrast": 1.05, "brightness": 0.99, "vignette": 0.18}},
        ],
        "frame_specs": [
            {"key": 1, "zoom": 1.08, "dx": -0.08, "dy": -0.04},
            {"key": 2, "zoom": 1.16, "dx": 0.12, "dy": -0.02},
            {"key": 1, "zoom": 1.20, "dx": -0.10, "dy": 0.06},
            {"key": 3, "zoom": 1.14, "dx": 0.08, "dy": 0.04},
            {"key": 4, "zoom": 1.18, "dx": -0.12, "dy": 0.10},
            {"key": 2, "zoom": 1.22, "dx": 0.10, "dy": -0.08},
            {"key": 1, "zoom": 1.16, "dx": -0.08, "dy": 0.04},
            {"key": 3, "zoom": 1.18, "dx": 0.12, "dy": 0.02},
            {"key": 4, "zoom": 1.10, "dx": -0.10, "dy": -0.06, "mirror": True},
            {"key": 2, "zoom": 1.24, "dx": 0.14, "dy": 0.08},
            {"key": 1, "zoom": 1.12, "dx": -0.12, "dy": 0.00},
        ],
        "voice_segments": [
            {"slug": "hook", "voice": "zh-TW-HsiaoChenNeural", "rate": "+0%", "pitch": "-4Hz", "style": "Hit", "text": "更冷的是，你還沒開口，路就先被磨進藥包裡了。"},
            {"slug": "setup", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "北街今天拆藥時，藥紙邊竟全沾著一樣的細白粉。"},
            {"slug": "shen", "voice": "zh-CN-YunxiNeural", "rate": "+2%", "pitch": "-3Hz", "style": "Choice", "text": "先別聞藥。先看那包藥想把你帶去哪隻手。"},
            {"slug": "scene", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "阿棠刮開藥紙角，連第一撮暖藥邊上都磨著同一層粉。"},
            {"slug": "clue", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-4Hz", "style": "Default", "text": "那不是舊白石，是晨市磨盤的新粉，還混了會留路的薄白附。"},
            {"slug": "rule", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "北街立刻改法：藥先拆三手，誰碰過藥紙都得當場留痕。"},
            {"slug": "twist", "voice": "zh-TW-HsiaoChenNeural", "rate": "+2%", "pitch": "-5Hz", "style": "Hit", "text": "這才知道，對方不是先寫路再配藥，是配藥時就把順序磨進去了。"},
            {"slug": "lead", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "如果連藥包都會替你先認手，下一個一開紙就被帶走的人會是誰？官網看星骸王座。"},
        ],
    },
    {
        "episode": 53,
        "folder_title": "誰教你先交手",
        "chapter_source": "第49章 晨市穩手",
        "hook_candidates": [
            "北街現在先問的，不是病，是誰教你把藥交給那隻手。",
            "最可怕的不是病家亂，是很多戶都被教成同一種亂法。",
            "當一整條街都說不出第一句話是誰塞進來的，手就已經被挑好了。",
        ],
        "hook": "北街現在先問的，不是病，是誰教你把藥交給那隻手。",
        "beats": ["四口立牌", "不是先問病", "每口都補一句", "很多人說不出來源", "求藥順序成白天工規", "同一種亂法被拖亮"],
        "plan_title": "誰教你先交手",
        "plan_candidates": [
            "北街現在先問的，不是病，是誰教你把藥交給那隻手。",
            "最可怕的不是病家亂，是很多戶都被教成同一種亂法。",
            "當一整條街都說不出第一句話是誰塞進來的，手就已經被挑好了。",
        ],
        "plan_beats": [
            "起：周嬸把晨市分成四口，每一口都先立『先報哪裡聽的』。",
            "承：有人從磨石攤聽，有人從豆皮口聽，也有人又被粥桶旁多補一句。",
            "轉：很多人回頭一想，根本說不出第一句話是誰塞進來的。",
            "合：北街把求藥順序本身拖成白天工規，先問哪戶，再問哪手。",
        ],
        "visual_note": "晨市四口、木牌、群眾圍看、周嬸指路與人群茫然回想。",
        "key_art_sources": [
            {"source": "第42篇 誰又收平了/source/key-art/key-03.png", "look": {"tint": (40, 40, 54), "tint_strength": 0.10, "contrast": 1.05, "brightness": 0.98, "vignette": 0.20}},
            {"source": "第45篇 救命車先挑你/source/key-art/key-03.png", "look": {"tint": (34, 40, 56), "tint_strength": 0.10, "contrast": 1.05, "brightness": 0.98, "vignette": 0.20}},
            {"source": "第48篇 第一包藥/source/key-art/key-04.png", "look": {"tint": (42, 40, 52), "tint_strength": 0.08, "contrast": 1.04, "brightness": 0.99, "vignette": 0.18}},
            {"source": "第44篇 那支分湯勺/source/key-art/key-02.png", "look": {"tint": (38, 42, 58), "tint_strength": 0.10, "contrast": 1.08, "brightness": 0.97, "vignette": 0.24}},
        ],
        "frame_specs": [
            {"key": 1, "zoom": 1.04, "dx": -0.06, "dy": -0.04},
            {"key": 2, "zoom": 1.10, "dx": 0.12, "dy": -0.02},
            {"key": 3, "zoom": 1.16, "dx": -0.10, "dy": 0.06},
            {"key": 4, "zoom": 1.12, "dx": 0.08, "dy": 0.08},
            {"key": 1, "zoom": 1.18, "dx": -0.12, "dy": 0.10},
            {"key": 2, "zoom": 1.18, "dx": 0.10, "dy": -0.08},
            {"key": 3, "zoom": 1.20, "dx": -0.08, "dy": 0.04},
            {"key": 4, "zoom": 1.18, "dx": 0.12, "dy": 0.02},
            {"key": 2, "zoom": 1.10, "dx": -0.10, "dy": -0.06, "mirror": True},
            {"key": 1, "zoom": 1.22, "dx": 0.14, "dy": 0.08},
            {"key": 3, "zoom": 1.12, "dx": -0.12, "dy": 0.00},
        ],
        "voice_segments": [
            {"slug": "hook", "voice": "zh-TW-HsiaoChenNeural", "rate": "+0%", "pitch": "-4Hz", "style": "Hit", "text": "北街現在先問的，不是病，是誰教你把藥交給那隻手。"},
            {"slug": "setup", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "因為真正可怕的，不是病家亂，是很多戶都被教成同一種亂法。"},
            {"slug": "shen", "voice": "zh-CN-YunxiNeural", "rate": "+2%", "pitch": "-3Hz", "style": "Choice", "text": "先報哪裡聽的。再報誰碰了第一包。"},
            {"slug": "scene", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "周嬸把晨市分成四口，每一口都要先說這句話是誰教你的。"},
            {"slug": "clue", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-4Hz", "style": "Default", "text": "一戶從磨石攤聽，一戶從豆皮口聽，一戶從粥桶旁又被補了一句。"},
            {"slug": "rule", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "北街把求藥順序也拖成白天工規：先問哪戶，再問哪手。"},
            {"slug": "twist", "voice": "zh-TW-HsiaoChenNeural", "rate": "+2%", "pitch": "-5Hz", "style": "Hit", "text": "最尷尬的是，很多人回頭一想，自己根本說不出第一句是誰塞進來的。"},
            {"slug": "lead", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "如果一條街都忘了是誰先教的，那隻手不是更容易被養成熟路？官網看星骸王座。"},
        ],
    },
    {
        "episode": 54,
        "folder_title": "學咱們的也會錯",
        "chapter_source": "第48-49章 白石藥手 / 晨市穩手",
        "hook_candidates": [
            "最陰的不是偷藥路，是它開始學你怎麼救人。",
            "它連你立的保命規矩都抄走了，只是順序全反過來。",
            "真正可怕的，是敵人開始照著你的活法做一份假的。",
        ],
        "hook": "最陰的不是偷藥路，是它開始學你怎麼救人。",
        "beats": ["倒格舊布", "連四格都抄", "學牌學分藥", "學不走人情火氣", "白板釘出反話", "假的越像越表示在偷"],
        "plan_title": "學咱們的也會錯",
        "plan_candidates": [
            "最陰的不是偷藥路，是它開始學你怎麼救人。",
            "它連你立的保命規矩都抄走了，只是順序全反過來。",
            "真正可怕的，是敵人開始照著你的活法做一份假的。",
        ],
        "plan_beats": [
            "起：晨市車底翻出一卷舊布，寫的也是藥、牌、驚、門，只是次序全反了。",
            "承：對方已開始學北街怎麼立格、怎麼分藥，再拿回去試哪戶最肯先交手。",
            "轉：阿棠把那卷布直接釘上白板，只寫一句：學咱們的，也會錯。",
            "合：因為它會學牌、學分藥，卻學不走周嬸那口罵，和病家自己按住的那隻手。",
        ],
        "visual_note": "白板、舊布格子、藥碗、晨市人群與被釘上的錯格布。",
        "key_art_sources": [
            {"source": "第47篇 後門先認手/source/key-art/key-03.png", "look": {"tint": (34, 40, 58), "tint_strength": 0.10, "contrast": 1.06, "brightness": 0.98, "vignette": 0.22}},
            {"source": "第42篇 誰又收平了/source/key-art/key-03.png", "look": {"tint": (40, 40, 54), "tint_strength": 0.10, "contrast": 1.05, "brightness": 0.98, "vignette": 0.20}},
            {"source": "第44篇 那支分湯勺/source/key-art/key-04.png", "look": {"tint": (32, 38, 54), "tint_strength": 0.14, "contrast": 1.10, "brightness": 0.96, "vignette": 0.26}},
            {"source": "第48篇 第一包藥/source/key-art/key-03.png", "look": {"tint": (34, 38, 56), "tint_strength": 0.12, "contrast": 1.08, "brightness": 0.97, "vignette": 0.24}},
        ],
        "frame_specs": [
            {"key": 1, "zoom": 1.06, "dx": -0.08, "dy": -0.04},
            {"key": 2, "zoom": 1.12, "dx": 0.12, "dy": -0.02},
            {"key": 3, "zoom": 1.18, "dx": -0.10, "dy": 0.06},
            {"key": 1, "zoom": 1.12, "dx": 0.08, "dy": 0.08},
            {"key": 4, "zoom": 1.20, "dx": -0.12, "dy": 0.10},
            {"key": 2, "zoom": 1.18, "dx": 0.10, "dy": -0.08},
            {"key": 3, "zoom": 1.22, "dx": -0.08, "dy": 0.04},
            {"key": 1, "zoom": 1.16, "dx": 0.12, "dy": 0.02},
            {"key": 4, "zoom": 1.10, "dx": -0.10, "dy": -0.06},
            {"key": 2, "zoom": 1.24, "dx": 0.14, "dy": 0.08, "mirror": True},
            {"key": 3, "zoom": 1.12, "dx": -0.12, "dy": 0.00},
        ],
        "voice_segments": [
            {"slug": "hook", "voice": "zh-TW-HsiaoChenNeural", "rate": "+0%", "pitch": "-4Hz", "style": "Hit", "text": "最陰的不是偷藥路，是它開始學你怎麼救人。"},
            {"slug": "setup", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "白巾婆子不只抄路紙，連北街自己立的四格都學著做了一份。"},
            {"slug": "shen", "voice": "zh-CN-YunxiNeural", "rate": "+2%", "pitch": "-3Hz", "style": "Choice", "text": "它學得越像，越代表它想把你們自己的笨規矩拿回去用。"},
            {"slug": "scene", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "晨市車底翻出一卷倒格舊布，寫的也是藥、牌、驚、門，只是次序全反了。"},
            {"slug": "clue", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-4Hz", "style": "Default", "text": "對方已經開始拿北街的救命法去試，哪一戶最肯先把人情交出去。"},
            {"slug": "rule", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "阿棠把那卷布直接釘上白板，只寫一句：學咱們的，也會錯。"},
            {"slug": "twist", "voice": "zh-TW-HsiaoChenNeural", "rate": "+2%", "pitch": "-5Hz", "style": "Hit", "text": "因為它會學牌、會學分藥，卻學不走周嬸那口罵，和病家自己按住的那隻手。"},
            {"slug": "lead", "voice": "zh-TW-HsiaoChenNeural", "rate": "+8%", "pitch": "-3Hz", "style": "Default", "text": "如果連救人的笨規矩都有人偷學，北街下一次得把什麼活法先護住？官網看星骸王座。"},
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
        "- 視覺規則：本批沿用白石藥手與晨市穩手前後章回的既有無字圖重新構圖成 4 張本篇專用 key art，再派生 12 張直式 frame；劇情 frame 保持全無字，CTA 僅保留最後一張官方入口 summary card。\n\n"
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
