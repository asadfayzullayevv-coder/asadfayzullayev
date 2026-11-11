# -*- coding: utf-8 -*-
"""Builds the three Word documents from content.json.
python3 build_docs.py <out_dir>"""
import json, os, re, sys
from docx import Document
from docx.enum.section import WD_ORIENT, WD_SECTION
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Pt, Cm, RGBColor

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(HERE)
C = json.load(open(os.path.join(HERE, "content.json"), encoding="utf-8"))
EV, SL = C["EVENT"], C["SLIDES"]
MAIN = [s for s in SL if not s["backup"]]

NAVY, SLATE, ORANGE, TEAL = "101827", "64748B", "B45309", "0F766E"
TINT, LINE, TEAL_LT, ORANGE_LT = "EEF2F6", "D7DEE7", "CCFBF1", "FEF3C7"
FONT = "Inter"


def rgb(h): return RGBColor.from_string(h)


def shade(cell, hexcolor):
    tcPr = cell._tc.get_or_add_tcPr()
    sh = OxmlElement("w:shd"); sh.set(qn("w:val"), "clear"); sh.set(qn("w:color"), "auto"); sh.set(qn("w:fill"), hexcolor)
    tcPr.append(sh)


def borders(table, color=LINE, sz=6):
    tbl = table._tbl
    tblPr = tbl.tblPr
    b = OxmlElement("w:tblBorders")
    for e in ("top", "left", "bottom", "right", "insideH", "insideV"):
        el = OxmlElement(f"w:{e}"); el.set(qn("w:val"), "single"); el.set(qn("w:sz"), str(sz)); el.set(qn("w:color"), color)
        b.append(el)
    tblPr.append(b)


def fix_widths(table, widths):
    tbl = table._tbl
    tblPr = tbl.tblPr
    for e in tblPr.findall(qn("w:tblW")): tblPr.remove(e)
    tw = OxmlElement("w:tblW"); tw.set(qn("w:w"), str(int(sum(widths) * 567))); tw.set(qn("w:type"), "dxa"); tblPr.append(tw)
    lay = OxmlElement("w:tblLayout"); lay.set(qn("w:type"), "fixed"); tblPr.append(lay)
    grid = tbl.tblGrid
    for i, gc in enumerate(grid.findall(qn("w:gridCol"))):
        gc.set(qn("w:w"), str(int(widths[i] * 567)))
    for row in table.rows:
        for i, c in enumerate(row.cells):
            c.width = Cm(widths[i])


def cell_margins(table, top=80, bottom=80, left=110, right=110):
    tblPr = table._tbl.tblPr
    m = OxmlElement("w:tblCellMar")
    for k, v in (("top", top), ("left", left), ("bottom", bottom), ("right", right)):
        el = OxmlElement(f"w:{k}"); el.set(qn("w:w"), str(v)); el.set(qn("w:type"), "dxa"); m.append(el)
    tblPr.append(m)


def row_height(row, cm, exact=False):
    trPr = row._tr.get_or_add_trPr()
    h = OxmlElement("w:trHeight"); h.set(qn("w:val"), str(int(cm * 567))); h.set(qn("w:hRule"), "exact" if exact else "atLeast")
    trPr.append(h)


def no_split(row):
    trPr = row._tr.get_or_add_trPr()
    c = OxmlElement("w:cantSplit"); trPr.append(c)


def set_font(style, size=None, bold=None, color=None, name=FONT):
    style.font.name = name
    rpr = style.element.get_or_add_rPr()
    rf = rpr.find(qn("w:rFonts"))
    if rf is None:
        rf = OxmlElement("w:rFonts"); rpr.append(rf)
    for a in ("w:ascii", "w:hAnsi", "w:cs", "w:eastAsia"):
        rf.set(qn(a), name)
    if size: style.font.size = Pt(size)
    if bold is not None: style.font.bold = bold
    if color: style.font.color.rgb = rgb(color)


def new_doc(title, landscape=False):
    d = Document()
    sec = d.sections[0]
    if landscape:
        sec.orientation = WD_ORIENT.LANDSCAPE
        sec.page_width, sec.page_height = Cm(29.7), Cm(21.0)
    else:
        sec.page_width, sec.page_height = Cm(21.0), Cm(29.7)
    sec.left_margin = sec.right_margin = Cm(2.0)
    sec.top_margin, sec.bottom_margin = Cm(1.8), Cm(1.8)
    st = d.styles
    rpr_def = d.styles.element.find(qn("w:docDefaults")).find(qn("w:rPrDefault")).find(qn("w:rPr"))
    rf = rpr_def.find(qn("w:rFonts"))
    for a in list(rf.attrib): del rf.attrib[a]
    for a in ("w:ascii", "w:hAnsi", "w:cs", "w:eastAsia"): rf.set(qn(a), FONT)
    for sty in d.styles.element.findall(qn("w:style")):
        r = sty.find(qn("w:rPr"))
        if r is not None and r.find(qn("w:rFonts")) is not None:
            f = r.find(qn("w:rFonts"))
            for a in list(f.attrib):
                if "Theme" in a: del f.attrib[a]
            for a in ("w:ascii", "w:hAnsi", "w:cs", "w:eastAsia"): f.set(qn(a), FONT)
    set_font(st["Normal"], 10.5, color="1F2937")
    st["Normal"].paragraph_format.space_after = Pt(5)
    st["Normal"].paragraph_format.line_spacing = 1.18
    for name, size, col, before, after in (("Title", 26, NAVY, 0, 6), ("Heading 1", 17, NAVY, 14, 6), ("Heading 2", 13, NAVY, 12, 4), ("Heading 3", 11, TEAL, 8, 3)):
        s = st[name]; set_font(s, size, True, col)
        s.paragraph_format.space_before = Pt(before); s.paragraph_format.space_after = Pt(after)
        s.paragraph_format.keep_with_next = True
        # remove theme color/underline on Title
        rpr = s.element.get_or_add_rPr()
        for tag in ("w:u",):
            for e in rpr.findall(qn(tag)): rpr.remove(e)
    # Title paragraph border removal (default Title style has bottom border)
    pPr = st["Title"].element.get_or_add_pPr()
    for e in pPr.findall(qn("w:pBdr")): pPr.remove(e)
    for lst in ("List Bullet", "List Number"):
        set_font(st[lst], 10.5, color="1F2937"); st[lst].paragraph_format.space_after = Pt(3)
    d.core_properties.title = title
    d.core_properties.author = EV["speaker"]
    # footer
    fp = sec.footer.paragraphs[0]
    fp.alignment = WD_ALIGN_PARAGRAPH.LEFT
    r = fp.add_run(f"{EV['track']} · День 1 · {title}    "); r.font.size = Pt(8.5); r.font.color.rgb = rgb(SLATE)
    add_page_field(fp)
    return d


def add_page_field(p):
    r = p.add_run(); r.font.size = Pt(8.5); r.font.color.rgb = rgb(SLATE)
    f1 = OxmlElement("w:fldChar"); f1.set(qn("w:fldCharType"), "begin")
    it = OxmlElement("w:instrText"); it.set(qn("xml:space"), "preserve"); it.text = "PAGE"
    f2 = OxmlElement("w:fldChar"); f2.set(qn("w:fldCharType"), "end")
    r._r.append(f1); r._r.append(it); r._r.append(f2)


MARK = re.compile(r"(\[[^\]]+\])")


def rich(p, text, size=None, color=None, bold=False, italic=False):
    """Adds text, highlighting [ПАУЗА]/[УТОЧНИТЬ:…]/[ЛИЧНАЯ ИСТОРИЯ:…] markers."""
    for part in MARK.split(text):
        if not part: continue
        r = p.add_run(part)
        if size: r.font.size = Pt(size)
        if part.startswith("["):
            r.bold = True
            if part.startswith("[ПАУЗА") or part.startswith("[СЧИТАЕМ") or part.startswith("[ДАТЬ"):
                r.font.color.rgb = rgb(TEAL)
            else:
                r.font.color.rgb = rgb("7C2D12")
                rpr = r._r.get_or_add_rPr(); hl = OxmlElement("w:highlight"); hl.set(qn("w:val"), "yellow"); rpr.append(hl)
        else:
            r.bold = bold; r.italic = italic
            if color: r.font.color.rgb = rgb(color)
    return p


def para(d, text="", size=None, color=None, bold=False, italic=False, after=None, style=None, align=None):
    p = d.add_paragraph(style=style)
    if text: rich(p, text, size, color, bold, italic)
    if after is not None: p.paragraph_format.space_after = Pt(after)
    if align: p.alignment = align
    return p


def label(d, text, color=SLATE):
    p = d.add_paragraph(); r = p.add_run(text.upper()); r.bold = True; r.font.size = Pt(8.5); r.font.color.rgb = rgb(color)
    rpr = r._r.get_or_add_rPr(); sp = OxmlElement("w:spacing"); sp.set(qn("w:val"), "30"); rpr.append(sp)
    p.paragraph_format.space_after = Pt(2); p.paragraph_format.space_before = Pt(6); p.paragraph_format.keep_with_next = True
    return p


def table(d, rows, widths, header=True, head_fill=NAVY, font=9.5, fills=None, heights=None, compact=False):
    t = d.add_table(rows=len(rows), cols=len(widths))
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    t.autofit = False
    borders(t); cell_margins(t, *( (40, 40, 110, 110) if compact else (80, 80, 110, 110)))
    for i, row in enumerate(rows):
        no_split(t.rows[i])
        if heights and heights[i]: row_height(t.rows[i], heights[i])
        for j, val in enumerate(row):
            c = t.cell(i, j); c.width = Cm(widths[j])
            c.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.TOP
            p = c.paragraphs[0]; p.paragraph_format.space_after = Pt(0)
            if isinstance(val, tuple):
                txt, opt = val
            else:
                txt, opt = val, {}
            lines = str(txt).split("\n")
            for k, ln in enumerate(lines):
                if k: p = c.add_paragraph(); p.paragraph_format.space_after = Pt(0)
                hint = opt.get("hint")
                rich(p, ln, size=opt.get("size", font), color=("FFFFFF" if header and i == 0 else opt.get("color")),
                     bold=(header and i == 0) or opt.get("bold", False), italic=opt.get("italic", False))
            if header and i == 0:
                shade(c, head_fill)
            elif opt.get("fill"):
                shade(c, opt["fill"])
            elif fills and fills.get((i, j)):
                shade(c, fills[(i, j)])
    # header repeat
    if header:
        trPr = t.rows[0]._tr.get_or_add_trPr(); h = OxmlElement("w:tblHeader"); trPr.append(h)
    fix_widths(t, widths)
    d.add_paragraph().paragraph_format.space_after = Pt(2)
    return t


def callout(d, text, fill=TINT, color=NAVY, bold=False, size=10.5, width=17.0):
    t = d.add_table(rows=1, cols=1); t.alignment = WD_TABLE_ALIGNMENT.CENTER
    borders(t, fill, 4); cell_margins(t, 140, 140, 200, 200)
    c = t.cell(0, 0); shade(c, fill); fix_widths(t, [width]); no_split(t.rows[0])
    lines = text.split("\n")
    p = c.paragraphs[0]
    for k, ln in enumerate(lines):
        if k: p = c.add_paragraph()
        p.paragraph_format.space_after = Pt(2)
        rich(p, ln, size=size, color=color, bold=bold)
    d.add_paragraph().paragraph_format.space_after = Pt(2)
    return t


def new_section(d, landscape):
    drop_trailing_spacer(d)
    sec = d.add_section(WD_SECTION.NEW_PAGE)
    if landscape:
        sec.orientation = WD_ORIENT.LANDSCAPE; sec.page_width, sec.page_height = Cm(29.7), Cm(21.0)
        sec.top_margin, sec.bottom_margin = Cm(1.5), Cm(1.3)
    else:
        sec.orientation = WD_ORIENT.PORTRAIT; sec.page_width, sec.page_height = Cm(21.0), Cm(29.7)
        sec.top_margin, sec.bottom_margin = Cm(1.8), Cm(1.8)
    return sec


_PB = {"on": False}


def page_break(d):
    _PB["on"] = True


def drop_trailing_spacer(d):
    body = d.element.body
    last = [e for e in body if e.tag != qn("w:sectPr")][-1]
    if last.tag == qn("w:p") and not "".join(last.itertext()).strip() and last.find(".//" + qn("w:sectPr")) is None and last.find(".//" + qn("w:br")) is None:
        body.remove(last)


def H(d, text, level):
    if _PB["on"]:
        drop_trailing_spacer(d)
    h = d.add_heading(text, level=level)
    if _PB["on"]:
        h.paragraph_format.page_break_before = True; _PB["on"] = False
    return h


def cover(d, kicker, title, subtitle, lines):
    p = para(d, kicker.upper(), 9, ORANGE, True, after=30)
    p = d.add_paragraph(style="Title"); p.add_run(title)
    para(d, subtitle, 13, SLATE, after=18)
    for k, v in lines:
        p = d.add_paragraph(); p.paragraph_format.space_after = Pt(2)
        r = p.add_run(k + "  "); r.bold = True; r.font.color.rgb = rgb(NAVY); r.font.size = Pt(10.5)
        r = p.add_run(v); r.font.color.rgb = rgb("1F2937"); r.font.size = Pt(10.5)


# =====================================================================  02 SPEAKER SCRIPT
def speaker_script():
    d = new_doc("Сценарий выступления")
    cover(d, f"{EV['track']} · День 1 · Сценарий спикера", EV["title"], EV["subtitle"], [
        ("Спикер:", f"{EV['speaker']} — {EV['speaker_role']}"),
        ("Время:", f"{EV['time']} · 120 минут · {len(MAIN)} основных слайдов + 2 запасных"),
        ("Тема дня:", EV["day"]),
        ("Главный тезис:", f"«{EV['thesis']}»"),
    ])
    para(d, "")
    label(d, "Как пользоваться сценарием")
    for t in [
        "Текст написан для устной речи: не читайте его дословно, используйте как опору. Жирные абзацы «Что говорить» — основа; остальное — страховка.",
        "[ПАУЗА] — сделайте паузу 2–3 секунды. [СЧИТАЕМ] — посчитайте руки вслух.",
        "Жёлтые пометки [УТОЧНИТЬ: …] и [ЛИЧНАЯ ИСТОРИЯ: …] — места, где нужны ваши реальные факты. Заполните их до выступления или пропустите фразу. Не заменяйте их догадками.",
        "Все расчёты на условных цифрах помечены как учебные. Никаких непубличных показателей Anorbank в сценарии нет.",
        "Блок «Если не хватает времени» у каждого слайда подсказывает, что сократить. Практику (12:10–12:35) не сокращайте меньше 20 минут.",
    ]:
        para(d, t, style="List Bullet")
    page_break(d)

    H(d, "Тайминг сессии", 1)
    rows = [["Время", "Блок", "Мин", "Слайды"]] + [[f"{b['start']}–{b['end']}", b["name"], str(b["min"]), b["slides"]] for b in C["BLOCKS"]]
    rows.append([("Итого", {"bold": True}), "", (str(sum(b["min"] for b in C["BLOCKS"])), {"bold": True}), ""])
    table(d, rows, [3.0, 9.0, 1.6, 2.4])
    H(d, "Слайды и время", 2)
    rows = [["№", "Слайд", "Время"]] + [[str(s["n"]), s["title"], f"{s['start']}–{s['end']}"] for s in MAIN]
    table(d, rows, [1.2, 12.0, 3.0], font=9, compact=True)
    page_break(d)

    block_names = {b["id"]: b for b in C["BLOCKS"]}
    cur_block = None
    for s in SL:
        if s["backup"] and cur_block != "B":
            page_break(d); H(d, "Запасные слайды (backup)", 1); cur_block = "B"
        elif not s["backup"] and s["block"] != cur_block:
            b = block_names[s["block"]]
            if cur_block is not None: page_break(d)
            H(d, f"Блок {b['id']} · {b['start']}–{b['end']} · {b['name']}", 1)
            cur_block = s["block"]
        H(d, f"Слайд {s['n']} — {s['title']}", 2)
        meta = [[("Время", {"bold": True, "color": SLATE}), f"{s['start']}–{s['end']}" if not s["backup"] else "по запросу"],
                [("Цель слайда", {"bold": True, "color": SLATE}), s["goal"]]]
        table(d, meta, [3.2, 13.8], header=False, fills={(0, 0): TINT, (1, 0): TINT})
        label(d, "Что говорить", TEAL)
        for ptxt in s["say"]:
            para(d, ptxt, 10.5, after=6)
        if s["pauses"]:
            label(d, "Паузы")
            for ptxt in s["pauses"]: para(d, ptxt, style="List Bullet")
        if s["example"]:
            label(d, "Реальный пример / данные на слайде")
            para(d, s["example"])
        if s["question"]:
            label(d, "Вопрос аудитории", ORANGE)
            callout(d, s["question"], ORANGE_LT, "7C2D12")
        if s["qa"]:
            label(d, "Вероятные вопросы и ответы")
            for q, a in s["qa"]:
                p = d.add_paragraph(); p.paragraph_format.space_after = Pt(1); p.paragraph_format.keep_with_next = True
                r = p.add_run("В: " + q); r.bold = True; r.font.color.rgb = rgb(NAVY)
                p = para(d, "О: " + a, after=6)
        label(d, "Переход к следующему слайду", TEAL)
        callout(d, "→ " + s["transition"] + ("\nЕсли не хватает времени: " + s["cut"] if s["cut"] else ""), TEAL_LT, "134E4A")

    page_break(d)
    H(d, "Приложение A. Что нужно уточнить до выступления", 1)
    para(d, "Все пометки из сценария в одном списке. Заполните их реальными фактами или уберите фразы.")
    items = []
    for s in SL:
        for t in s["say"] + [a for _, a in s["qa"]]:
            for m in MARK.findall(t):
                if m.startswith("[УТОЧНИТЬ") or m.startswith("[ЛИЧНАЯ"):
                    items.append((str(s["n"]), m.strip("[]")))
    items += [("—", "УТОЧНИТЬ: период, за который выполнен 208% годового KPI (в сценарии на слайды не вынесено)."),
              ("—", "УТОЧНИТЬ: методика расчёта конверсии продаж 29–37% (от какой стадии, за какой период).")]
    seen, rows = set(), [["Слайд", "Что уточнить"]]
    for n, m in items:
        if (n, m) in seen: continue
        seen.add((n, m)); rows.append([n, m])
    table(d, rows, [1.8, 15.2])
    H(d, "Приложение B. Факты, которые можно называть", 1)
    rows = [["Факт", "Как формулировать", "Статус"],
            ["7 рынков", "Компания присутствовала или развивала бизнес: Узбекистан, Казахстан, Кыргызстан, Азербайджан, Грузия, Турция, Перу", "данные спикера"],
            ["52 контракта", "Закрытых контракта компании за период работы спикера", "данные спикера"],
            ["≈ $270K ARR", "Годовая регулярная выручка компании, не личная выручка спикера", "данные спикера"],
            ["MRR ×1,69", "Рост MRR после введения нового тарифного пакета; без утверждения единственной причины", "данные спикера"],
            ["Конверсия 29–37%", "Заявленная конверсия продаж; методику уточнить; стадийные конверсии не выводить", "требует уточнения"],
            ["AI Startup of the Year", "Награда компании TASS Vision, Nexus Awards на Baku ID (июнь 2025)", "подтверждено публично"],
            ["OMID — 63 точки", "Сеть хозяйственных магазинов, Азербайджан", "данные спикера"],
            ["Пилоты Technodom, Meloman", "Запускались пилоты (Technodom — январь, Meloman — ноябрь); год и результаты не называть", "данные спикера"],
            ["Bose, Dyson (Перу)", "Начало пилотного взаимодействия, не платные контракты", "данные спикера"],
            ["−250+ обращений/мес", "Сокращение нагрузки на поддержку после оптимизации сценария в приложении Anorbank", "данные спикера"],
            ["100+ брендов", "Сеть профессиональных контактов; не реферальный механизм", "данные спикера"]]
    table(d, rows, [3.6, 10.0, 3.4], font=9)
    d.save(os.path.join(OUT, "02_Speaker_Script_Asad_Fayzullayev.docx"))


# =====================================================================  03 WORKBOOK

def field_table(d, fields, w1=5.2, w2=11.8, h=1.6):
    rows, heights = [], []
    for f in fields:
        name, hint = f[0], f[1]
        hh = f[2] if len(f) > 2 else h
        rows.append([(name + ("\n" + hint if hint else ""), {"bold": False}), ""])
        heights.append(hh)
    t = table(d, rows, [w1, w2], header=False, heights=heights)
    for i, f in enumerate(fields):
        c = t.cell(i, 0); shade(c, TINT)
        c.paragraphs[0].runs[0].bold = True
        c.paragraphs[0].runs[0].font.color.rgb = rgb(NAVY)
        if len(c.paragraphs) > 1:
            for r in c.paragraphs[1].runs:
                r.font.size = Pt(8.5); r.font.color.rgb = rgb(SLATE); r.italic = True
    return t


def workbook():
    d = new_doc("Growth Decision Workbook")
    cover(d, f"{EV['track']} · День 1 · Рабочая тетрадь команды", "Growth Decision Workbook",
          "Выберите один вектор роста на ближайшие 6 месяцев — и докажите, что он правильный.", [])
    table(d, [[("Команда / стартап", {"bold": True}), ""], [("Участники", {"bold": True}), ""], [("Спикер на защите", {"bold": True}), ""]],
          [5.2, 11.8], header=False, heights=[1.0, 1.0, 1.0], fills={(0, 0): TINT, (1, 0): TINT, (2, 0): TINT})
    label(d, "Как работать — 25 минут")
    rows = [["Время", "Что делаем", "Страницы"],
            ["12:10–12:13", "Читаем задание, задаём вопросы ментору", "—"],
            ["12:13–12:30", "Заполняем срез, матрицу, retention и план", "1–4"],
            ["12:30–12:35", "Готовим 3-минутную защиту по шаблону", "5"]]
    table(d, rows, [3.2, 10.6, 3.2])
    label(d, "Три правила")
    for i0, t in enumerate(["Факты важнее мнений. Нет данных — пишите «нет данных». Это тоже результат.",
              "Оценка без доказательства = 1. Каждую «4» и «5» подкрепите фактом.",
              "Один главный вектор. Второй можно записать как наблюдение на будущее."]):
        para(d, f"{i0 + 1}.  " + t)
    callout(d, "Результат к 12:35: краткий анализ текущего состояния · выбранный вектор роста · метрики удержания · план повышения LTV · первые шаги на 30 дней.", TEAL_LT, "134E4A", True)

    page_break(d)
    H(d, "1. Startup Snapshot — где мы сейчас", 1)
    para(d, "Коротко и честно. Подсказки серым — это примеры формулировок, а не правильные ответы.", 9.5, SLATE, italic=True)
    field_table(d, [
        ("Название стартапа", "", 1.6),
        ("Продукт", "Пример: «Мобильное приложение для учёта складских остатков в ресторанах»", 2.8),
        ("Основной клиент", "Кто платит и кто пользуется? Пример: «Владельцы 1–3 ресторанов в Ташкенте; пользуется шеф-повар»", 3.2),
        ("Стадия", "☐ Idea / MVP   ☐ Первые пользователи   ☐ Первые платящие   ☐ Готовимся масштабироваться", 1.8),
        ("Выручка, если есть", "MRR или выручка за последний месяц; число платящих клиентов", 2.4),
        ("Основной канал привлечения", "Откуда пришли последние 10 клиентов? Пример: «7 — личные продажи, 3 — рекомендации»", 3.2),
        ("Ключевая проблема роста", "Одно предложение. Пример: «Клиенты подключаются, но через 2 месяца перестают вносить данные»", 4.0),
    ])

    new_section(d, True)
    H(d, "2. Growth Vector Matrix — куда расти", 1)
    para(d, "Оцените каждое направление от 1 до 5 по пяти критериям. Шкала: 1 — нет данных или только мнение команды · 3 — косвенные сигналы (интервью, интерес, похожие кейсы) · 5 — деньги или поведение (оплаты, письма о намерениях, повторные покупки, работающий канал). Последний столбец обязателен.", 9.5, SLATE, italic=True)
    hdr = ["Направление", "Спрос", "Доступ к клиентам", "Экономика", "Retention", "Реализация", "Итого / 25", "Доказательства и риски"]
    rows = [hdr]
    for n, ex in [("1. Новый рынок (география)", "Какая страна или город?"), ("2. Новый сегмент клиентов", "Какой сегмент?"),
                  ("3. Новый продукт / тариф", "Что именно?"), ("4. Рост внутри текущих клиентов", "Допродажа, расширение")]:
        rows.append([(n + "\n" + ex, {"bold": True}), "", "", "", "", "", "", ""])
    t = table(d, rows, [4.4, 2.2, 2.2, 2.2, 2.2, 2.2, 1.6, 8.7], font=9, heights=[None, 1.85, 1.85, 1.85, 1.85])
    for i in range(1, 5):
        shade(t.cell(i, 0), TINT)
        for r in t.cell(i, 0).paragraphs[1].runs: r.bold = False; r.italic = True; r.font.color.rgb = rgb(SLATE); r.font.size = Pt(8.5)
    field_table(d, [("Выбранный вектор", "Один. Пример: «Модуль закупок для текущих клиентов»", 1.0),
                    ("Почему не остальные?", "Одна фраза на каждый отвергнутый вариант", 1.5)], w1=6.0, w2=19.7)
    callout(d, "Пример заполнения (учебный): H1 «Казахстан» — 13/25: спрос 3, доступ 2, экономика 3, retention 3, реализация 2. Риск: нет канала и некому внедрять. H3 «Модуль закупок» — 22/25: 4 из 10 клиентов уже просили функцию, продажа идёт текущим клиентам без CAC.", TINT, NAVY, size=8.5, width=25.7)

    new_section(d, False)
    H(d, "3. Retention & LTV — удержание и ценность клиента", 1)
    field_table(d, [
        ("Активация", "Момент первой ценности, а не регистрация. Пример: «Ресторан внёс остатки и получил первый отчёт»", 1.8),
        ("Повторное ценное действие", "То, ради чего клиент возвращается и платит. Пример: «Еженедельная инвентаризация»", 1.8),
        ("Что измеряем как retention", "Метрика и период. B2C: % когорты с ценным действием через 1/3 мес. B2B: logo retention, GRR, NRR", 1.8),
        ("Известные причины оттока", "Что говорят ушедшие клиенты? Сколько из них вы опросили лично?", 2.0),
        ("Как повысить LTV", "Снизить отток · допродать · расширить аккаунт. Какой рычаг ваш и почему?", 2.0),
    ])
    label(d, "Мини-когорта — заполните, если есть данные (% активных клиентов)")
    rows = [["Когорта (месяц прихода)", "Размер", "M0", "M1", "M2", "M3", "M4", "M5"]] + [["", "", "100%", "", "", "", "", ""] for _ in range(4)]
    table(d, rows, [4.2, 1.8, 1.8, 1.8, 1.8, 1.8, 1.8, 2.0], font=9, heights=[None, 0.8, 0.8, 0.8, 0.8])
    para(d, "Как читать: по строке — выравнивается ли кривая; по столбцу — удерживаются ли новые когорты лучше; по диагонали — календарные события.", 9, SLATE, italic=True)
    label(d, "Быстрый расчёт экономики (если есть данные)")
    rows = [["CAC, $", "Выручка клиента в месяц, $", "Валовая маржа, %", "Валовая прибыль в месяц, $", "CAC payback, мес.", "Payback при CAC ×2"],
            ["", "", "", "", "", ""]]
    table(d, rows, [2.6, 3.0, 2.6, 3.2, 2.8, 2.8], font=8.5, heights=[None, 1.1])
    para(d, "CAC payback = CAC / валовая прибыль в месяц. Учебный пример: 1 000 / 140 ≈ 7,1 мес.; при CAC 2 000 — ≈ 14,3 мес.", 9, SLATE, italic=True)

    page_break(d)
    H(d, "4. Growth Plan — план на 30 дней", 1)
    field_table(d, [
        ("Выбранный вектор", "", 1.0),
        ("Почему именно он", "Главные факты из матрицы", 1.6),
        ("Главная гипотеза", "Формат: «Если мы сделаем X для клиентов Y, то метрика Z изменится с A до B за 30 дней»", 1.9),
        ("2–3 ключевых KPI", "Метрика · стартовое значение · цель · кто отвечает", 2.0),
        ("Ограничения и риски", "Деньги, люди, время, зависимость от партнёров", 1.6),
    ])
    label(d, "План на 30 дней")
    rows = [["Неделя", "Что делаем", "Ответственный", "Результат недели"]] + [[f"Неделя {i}", "", "", ""] for i in range(1, 5)]
    table(d, rows, [2.4, 7.4, 3.2, 4.0], font=9, heights=[None, 1.1, 1.1, 1.1, 1.1])
    label(d, "Критерии решения через 30 дней")
    rows = [["Продолжаем, если…", "Меняем подход, если…", "Останавливаем, если…"], ["", "", ""]]
    t = table(d, rows, [5.67, 5.67, 5.66], font=9, heights=[None, 2.3])
    para(d, "Пример: продолжаем, если 3 из 10 текущих клиентов оплатили модуль; меняем, если интерес есть, но оплат нет; останавливаем, если менее 2 клиентов готовы тестировать.", 9, SLATE, italic=True)

    page_break(d)
    H(d, "5. Защита решения — 3 минуты", 1)
    para(d, "Один спикер от команды. Таймер жёсткий: 3 минуты на выступление, 2 минуты на вопросы и обратную связь.", 9.5, SLATE, italic=True)
    rows = [["Секунды", "Что сказать", "Ваши тезисы"],
            ["0:00–0:30", "Где мы сейчас: продукт, клиент, стадия, ключевая проблема роста", ""],
            ["0:30–1:15", "Какой вектор выбрали и почему отвергли остальные", ""],
            ["1:15–1:45", "Доказательства спроса: факты, а не мнения", ""],
            ["1:45–2:15", "Retention: что измеряем, главная проблема, рычаг LTV", ""],
            ["2:15–3:00", "Эксперимент на 30 дней, KPI и что будет считаться провалом", ""]]
    table(d, rows, [2.4, 6.6, 8.0], font=9, heights=[None, 1.7, 1.7, 1.7, 1.7, 1.7])
    label(d, "Как вас будут оценивать — по 1–5 баллов, максимум 25")
    rows = [["Критерий", "5 баллов — это…"]] + [[r[0], r[3]] for r in C["RUBRIC"]]
    table(d, rows, [5.0, 12.0], font=9)
    label(d, "Домашнее задание к Дню 2")
    for i0, h in enumerate(C["HOMEWORK"]): para(d, f"{i0 + 1}.  " + h)
    d.save(os.path.join(OUT, "03_Growth_Decision_Workbook.docx"))


# =====================================================================  04 MENTOR GUIDE
def mentor_guide():
    d = new_doc("Mentor Facilitation Guide")
    cover(d, f"{EV['track']} · День 1 · Гайд наставника", "Mentor Facilitation Guide",
          "Как провести двухчасовую сессию «Вектор роста и удержание клиентов» ровно в 120 минут.", [
              ("Ведущий:", EV["speaker"]), ("Время:", EV["time"]), ("Результат для команд:", "анализ текущего состояния · вектор роста · метрики удержания · план LTV · шаги на 30 дней")])
    label(d, "Подготовка до начала (за 30 минут)")
    for t in ["Проектор и кликер проверены; презентация открыта в режиме докладчика (заметки на втором экране).",
              "Распечатаны: Growth Decision Workbook — по 2 экземпляра на команду; шпаргалка спикера; таблица оценки (раздел E).",
              "Таймер на экране или телефон с громким сигналом. Ручки и маркеры на столах.",
              "Заранее узнать у организаторов число команд. Если больше четырёх — решить, кто защищается (добровольцы или жребий), остальные сдают workbook письменно.",
              "Заполнить пометки [УТОЧНИТЬ] в сценарии (Приложение A сценария)."]:
        para(d, t, style="List Bullet")

    page_break(d)
    H(d, "A. Run of Show — поминутное расписание", 1)
    rows = [["Время", "№", "Что происходит", "Режим"]]
    mode = {1: "Лекция + опрос", 2: "Лекция + вопросы", 3: "Кейсы", 4: "Лекция + вопросы", 5: "Лекция", 6: "Работа команд", 7: "Защита", 8: "Итоги"}
    for s in MAIN:
        rows.append([f"{s['start']}–{s['end']}", str(s["n"]), (s["title"] + "\n" + s["goal"], {}), mode[s["block"]]])
    t = table(d, rows, [2.4, 1.3, 10.3, 3.0], font=9)
    for i in range(1, len(rows)):
        ps = t.cell(i, 2).paragraphs
        ps[0].runs[0].bold = True
        for r in ps[1].runs: r.font.color.rgb = rgb(SLATE); r.font.size = Pt(8.5)
    callout(d, "Контрольные точки: 11:25 — начинаем кейсы TASS Vision · 11:45 — retention · 12:10 — практика стартует при любых обстоятельствах · 12:35 — защита · 12:55 — итоги.", ORANGE_LT, "7C2D12", True, 9.5)

    H(d, "B. Interaction Plan — вопросы аудитории", 1)
    rows = [["Время", "№", "Вопрос", "Формат"]]
    fmt = {3: "Поднятие рук + 2–3 устных ответа", 4: "Поднятие рук", 5: "Про себя — проверим в практике", 6: "Риторический", 7: "1–2 ответа",
           8: "1–2 ответа", 9: "Поднятие рук", 10: "Выкрики из зала, 1 минута", 11: "2–3 ответа", 12: "Поднятие рук", 13: "Риторический", 14: "Риторический", 15: "Риторический → в практику"}
    for s in MAIN:
        if s["question"] and s["n"] in fmt:
            rows.append([s["start"], str(s["n"]), s["question"], fmt[s["n"]]])
    table(d, rows, [1.6, 1.2, 10.4, 3.8], font=9)
    para(d, "Правило интерактива: на каждый вопрос — не больше 60 секунд. Если обсуждение разгорелось, скажите: «Отличный вопрос — разберём его на защите или в перерыве».", 9.5, SLATE, italic=True)

    page_break(d)
    H(d, "C. Team Workshop — 25 минут практики", 1)
    rows = [["Время", "Ведущий делает", "Команды делают"],
            ["12:10–12:13", "Объясняет 7 вопросов слайда 16, показывает workbook, напоминает правила: «нет данных — так и пишите», «оценка без доказательства = 1»", "Задают вопросы, распределяют роли: кто пишет, кто считает, кто защищает"],
            ["12:13–12:20", "Обходит команды: проверяет, что стр. 1 заполнена за 5–7 минут", "Стр. 1 — Startup Snapshot; стр. 2 — матрица"],
            ["12:20–12:27", "Задаёт каждой команде 1–2 вопроса из раздела F; следит, чтобы выбрали ОДИН вектор", "Стр. 3 — retention и LTV; выбор вектора"],
            ["12:27–12:30", "Объявляет: «3 минуты до подготовки защиты»", "Стр. 4 — план на 30 дней и критерии решения"],
            ["12:30–12:35", "Объявляет порядок выступлений, включает таймер на экране", "Стр. 5 — готовят 3-минутную защиту"]]
    table(d, rows, [2.4, 7.3, 7.3], font=9)
    label(d, "Если команда застряла")
    for t in ["Нет выручки → заполняйте матрицу по сигналам спроса (интервью, письма о намерениях), а retention — как план измерения.",
              "Спорят между двумя векторами → «Какой из них быстрее и дешевле проверить за 30 дней?»",
              "Пишут общие слова («улучшить продукт») → «Какую цифру это изменит и на сколько?»",
              "Выбирают новый рынок без данных → «Сколько потенциальных клиентов там вы лично знаете поимённо?»"]:
        para(d, t, style="List Bullet")

    H(d, "D. Pitch Review — защита 4 команд", 1)
    rows = [["Время", "Команда", "Формат"], ["12:35–12:40", "Команда 1", "3 мин — решение · 2 мин — вопросы и обратная связь"], ["12:40–12:45", "Команда 2", "3 + 2"],
            ["12:45–12:50", "Команда 3", "3 + 2"], ["12:50–12:55", "Команда 4", "3 + 2"]]
    table(d, rows, [3.0, 3.0, 11.0], font=9)
    label(d, "Структура обратной связи за 2 минуты")
    for i0, t in enumerate(["15 секунд — что сильное (конкретно: «у вас единственных есть данные об оплатах»).",
              "60 секунд — один-два острых вопроса из раздела F.",
              "30 секунд — одна рекомендация: что сделать в первые 7 дней эксперимента.",
              "15 секунд — оценка по рубрике (можно вслух или только в таблице)."]):
        para(d, f"{i0 + 1}.  " + t)
    para(d, "Остановка по времени: «Спасибо, время. Последнее предложение — какой эксперимент на 30 дней?»", 9.5, SLATE, italic=True)

    page_break(d)
    H(d, "E. Evaluation Rubric — оценка решений", 1)
    para(d, "Пять критериев по шкале 1–5. Максимум — 25 баллов. 2 и 4 — промежуточные оценки.")
    rows = [["Критерий", "1 балл", "3 балла", "5 баллов"]] + [list(r) for r in C["RUBRIC"]]
    t = table(d, rows, [3.6, 4.3, 4.5, 4.6], font=8.5)
    for i in range(1, len(rows)): shade(t.cell(i, 0), TINT); t.cell(i, 0).paragraphs[0].runs[0].bold = True
    label(d, "Таблица оценки")
    rows = [["Критерий", "Команда 1", "Команда 2", "Команда 3", "Команда 4"]] + [[r[0], "", "", "", ""] for r in C["RUBRIC"]] + [[("Итого / 25", {"bold": True}), "", "", "", ""]]
    table(d, rows, [5.4, 2.9, 2.9, 2.9, 2.9], font=9, heights=[None] + [0.85] * 6)

    page_break(d)
    H(d, "F. Mentor Questions — вопросы наставника", 1)
    para(d, f"{len(C['MENTOR_QUESTIONS'])} вопросов, сгруппированных по темам. Задавайте один вопрос за раз и молчите, пока команда отвечает.")
    rows = [["№", "Тема", "Вопрос"]] + [[str(i + 1), t, q] for i, (t, q) in enumerate(C["MENTOR_QUESTIONS"])]
    table(d, rows, [1.0, 3.4, 12.6], font=9)

    page_break(d)
    H(d, "G. Difficult Questions & Answers", 1)
    para(d, "Вероятные вопросы из зала и короткие содержательные ответы. Если вопрос про инвестиции и сделки — коротко ответьте и перенесите на День 3; про операционку и локализацию — на День 2.")
    for i, (topic, q, a) in enumerate(C["HARD_QA"]):
        p = d.add_paragraph(); p.paragraph_format.space_after = Pt(1); p.paragraph_format.keep_with_next = True
        r = p.add_run(f"{i + 1}. {topic}:  "); r.bold = True; r.font.color.rgb = rgb(TEAL)
        r = p.add_run(q); r.bold = True; r.font.color.rgb = rgb(NAVY)
        para(d, a, after=8)

    H(d, "H. Time Management", 1)
    rows = [["Если к этому времени…", "Вы на слайде…", "Что сократить"],
            ["11:12", "3 (опрос)", "Опрос только руками, без устных ответов (−2 мин)"],
            ["11:28", "6 (матрица)", "Слайд 7 — только вывод, без перечисления стран (−3 мин)"],
            ["11:48", "10 (Перу)", "Слайд 10 — только «Access ≠ PMF» и чек-лист; слайд 9 — без абзаца о закупках (−3 мин)"],
            ["12:03", "12 (когорты)", "Пропустить диагональ; на слайде 13 — только мост и кейс ×1,69 (−3 мин)"],
            ["12:12", "14 (экономика)", "Слайд 14 — один расчёт без LTV/CAC; слайд 15 — только три уровня (контакты, рефералы, loop). Практика стартует не позже 12:15"],
            ["12:35", "практика", "Если команды не готовы — дать 2 минуты, защиту сократить до 2+2 минуты на команду"],
            ["12:55", "защита", "Если команд больше 4 — остальные сдают workbook письменно; итоги — строго 5 минут"]]
    table(d, rows, [3.2, 3.0, 10.8], font=9)
    callout(d, "Что нельзя сокращать: практику — меньше 20 минут; защиту — меньше 4 команд × 4 минуты; итоги и домашнее задание. Без них участники не получат ожидаемый результат дня.", ORANGE_LT, "7C2D12", True, 9.5)
    label(d, "Что можно сокращать без потери смысла")
    for t in ["Банковский пример на слайде 5.", "Абзац про Startup Genome на слайде 4.", "Вопросы про веса критериев на слайде 6.",
              "Перечисление всех B2B-метрик на слайде 11 (оставить logo retention, GRR, NRR).", "Примеры B2C/B2B на слайде 15."]:
        para(d, t, style="List Bullet")
    d.save(os.path.join(OUT, "04_Mentor_Facilitation_Guide.docx"))


if __name__ == "__main__":
    speaker_script(); workbook(); mentor_guide()
    print("docs written to", OUT)
