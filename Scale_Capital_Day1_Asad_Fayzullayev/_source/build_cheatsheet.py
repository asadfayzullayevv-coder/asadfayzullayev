# -*- coding: utf-8 -*-
"""One-page A4 speaker cheat sheet: content.json -> cheatsheet.html -> PDF (via Playwright/Chromium).
python3 build_cheatsheet.py <out_dir>"""
import json, os, subprocess, sys, html

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(HERE)
C = json.load(open(os.path.join(HERE, "content.json"), encoding="utf-8"))
E = lambda s: html.escape(s)

ROWS = [
    ("11:00", "1–3", "Знакомство", "Через 2 часа — решение, а не конспект. Цифры TASS — результат команды, не мой. Голосование по стадиям.", "«Запомните свою проблему роста — это рост или уже масштабирование?»"),
    ("11:10", "4–6", "Growth ≠ Scale · вектор", "A: расходы ×2 вместе с клиентами. B: выручка растёт быстрее расходов. 4 вектора. Оценка без доказательства = 1.", "«Посмотрим, как это выглядело в жизни: 7 рынков»"),
    ("11:25", "7–10", "Экспансия TASS Vision", "Повторяемый способ находить и обслуживать клиентов. OMID: пилот → ROI → договор → rollout. Встреча ≠ продажа. Access ≠ PMF.", "«Мы говорили, как приводить. Теперь — как удерживать»"),
    ("11:45", "11–12", "Retention B2C / B2B", "Активация → ценное повторное действие → когорта. DAU/MAU ≠ удержание. B2B: logo, GRR, NRR. Кривая выравнивается = ядро.", "«На фундаменте удержания растёт LTV»"),
    ("12:00", "13–15", "LTV · экономика · loops", "Отток ↓, допродажа, расширение. Мост 100→105: GRR 90%, NRR 105%. Payback 7,1 → 14,3 мес. при CAC ×2. Контакты ≠ loop.", "«Теории достаточно. 25 минут — ваша работа»"),
    ("12:10", "16", "ПРАКТИКА · 25 мин", "Workbook стр. 1–4. 12:13 работа · 12:30 подготовка защиты. Обход команд, вопросы из гайда.", "12:35 «Время. Первая команда — к экрану»"),
    ("12:35", "17", "Защита · 4 × 5 мин", "3 мин решение + 2 мин фидбек. 5 критериев × 1–5 = 25. Жёсткий таймер.", "«Последние 5 минут — выводы»"),
    ("12:55", "18", "Итоги · ДЗ", "Доказанный спрос → повторяемая модель → устойчивая ценность. ДЗ: когорты, эксперимент, «что сломается при ×3».", "Финиш строго 13:00"),
]
NUMS = [("7", "рынков: UZ KZ KG AZ GE TR PE"), ("52", "закрытых контракта"), ("≈$270K", "ARR компании (не личный)"), ("×1,69", "MRR после нового тарифа"),
        ("63", "точки OMID (Азербайджан)"), ("−250+", "обращений/мес. в Anorbank")]
Q5 = ["Какая у вас стадия? Поднимите руку.", "У кого при удвоении клиентов команда тоже выросла бы вдвое?", "Кто в клиенте может сказать «нет», даже если директор сказал «да»?",
      "Назовите одно повторное ценное действие в вашем продукте.", "Что будет с вашей экономикой, если CAC удвоится?"]
DONT = ["Награда — компании, не моя", "Пилоты ≠ платные контракты", "Не называть годы пилотов и их результаты", "Никаких непубличных цифр Anorbank", "208% KPI — только после уточнения периода"]

rows_html = "".join(
    f'<tr class="{ "hl" if "ПРАКТИКА" in r[2] else "" }"><td class="t">{r[0]}</td><td class="s">{r[1]}</td><td><b>{E(r[2])}</b><div class="th">{E(r[3])}</div></td><td class="tr">{E(r[4])}</td></tr>'
    for r in ROWS)
nums_html = "".join(f'<div class="num"><div class="n">{E(a)}</div><div class="l">{E(b)}</div></div>' for a, b in NUMS)
q_html = "".join(f"<li>{E(q)}</li>" for q in Q5)
dont_html = "".join(f"<li>{E(q)}</li>" for q in DONT)

doc = f"""<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>Speaker Quick Reference</title>
<style>
@page {{ size: A4; margin: 0; }}
:root {{ --navy:#101827; --slate:#64748B; --line:#E2E8F0; --orange:#F59E0B; --orangeDk:#B45309; --teal:#0D9488; --tealDk:#0F766E; --tint:#F1F5F9; }}
* {{ box-sizing: border-box; margin: 0; padding: 0; }}
body {{ font-family: Inter, Arial, sans-serif; color: var(--navy); width: 210mm; height: 297mm; padding: 7mm 10mm 5mm; font-size: 9.2pt; line-height: 1.24; background:#fff; }}
.head {{ display:flex; justify-content:space-between; align-items:flex-end; border-radius: 3mm; background: var(--navy); color:#fff; padding: 3.4mm 5mm; }}
.k {{ font-size: 7.8pt; letter-spacing: .14em; font-weight:700; color: var(--orange); text-transform: uppercase; }}
h1 {{ font-size: 14.5pt; line-height:1.1; margin-top: 1.2mm; }}
.head .r {{ text-align:right; font-size: 8.6pt; color:#CBD5E1; white-space:nowrap; }}
.head .r b {{ color:#fff; font-size: 14pt; display:block; }}
h2 {{ font-size: 7.8pt; letter-spacing: .14em; text-transform: uppercase; color: var(--slate); margin: 2.5mm 0 1.2mm; }}
table {{ width:100%; border-collapse: collapse; }}
td, th {{ border-bottom: .3mm solid var(--line); padding: 1.05mm 1.6mm; vertical-align: top; }}
th {{ text-align:left; font-size:7.6pt; color: var(--slate); font-weight:700; text-transform: uppercase; letter-spacing:.08em; }}
td.t {{ font-weight:800; font-size: 11pt; width: 15mm; }}
td.s {{ color: var(--slate); width: 11mm; font-weight:600; }}
td.tr {{ width: 58mm; color: var(--tealDk); font-style: italic; font-size: 8.8pt; }}
.th {{ color:#334155; font-size: 8.8pt; margin-top: .4mm; }}
tr.hl td {{ background: #FEF3C7; }}
.grid {{ display:grid; grid-template-columns: 1fr 1fr; gap: 4mm; }}
.nums {{ display:grid; grid-template-columns: repeat(3, 1fr); gap: 2mm; }}
.num {{ background: var(--tint); border-radius: 2mm; padding: 1.5mm 2.2mm; }}
.num .n {{ font-size: 13pt; font-weight: 800; color: var(--tealDk); line-height: 1.05; }}
.num .l {{ font-size: 8.2pt; color: #334155; margin-top: .6mm; }}
ol, ul {{ padding-left: 4.6mm; }} li {{ margin-bottom: .6mm; }}
.box {{ border-radius: 2.5mm; padding: 2.4mm 3.2mm; }}
.go {{ background: #CCFBF1; }} .go b {{ color: var(--tealDk); }}
.warn {{ background: #FEF3C7; }} .warn li {{ font-size: 8.8pt; }}
.final {{ background: var(--navy); color:#fff; border-radius: 3mm; padding: 3mm 5mm; margin-top: 3mm; display:flex; justify-content:space-between; align-items:center; gap: 6mm; }}
.final .q {{ font-size: 13pt; font-weight: 800; }} .final .s {{ font-size: 9pt; color:#CBD5E1; max-width: 70mm; }}
.small {{ font-size: 8.6pt; color: var(--slate); }}
</style></head><body>
<div class="head"><div><div class="k">Scale &amp; Capital · День 1 · шпаргалка спикера</div><h1>{E(C['EVENT']['title'])}: как масштабировать стартап, а не его расходы</h1></div>
<div class="r"><b>11:00–13:00</b>120 мин · 18 слайдов + B1, B2</div></div>

<h2>Тайминг, тезисы и переходы</h2>
<table><tr><th>Старт</th><th>Слайды</th><th>Блок и главный тезис</th><th>Переход</th></tr>{rows_html}</table>

<div class="grid" style="margin-top:1mm">
 <div>
  <h2>Цифры TASS Vision и Anorbank (данные спикера)</h2>
  <div class="nums">{nums_html}</div>
  <div class="small" style="margin-top:1.6mm">Конверсия продаж 29–37% — только с оговоркой о методике. Награда AI Startup of the Year (Nexus Awards, Baku ID 2025) — компании.</div>
  <h2>5 главных вопросов залу</h2>
  <ol>{q_html}</ol>
 </div>
 <div>
  <h2>Запуск практики · 12:10</h2>
  <div class="box go">
   <b>1.</b> «У каждой команды — workbook. 7 вопросов на слайде. 25 минут».<br>
   <b>2.</b> Тайминг: до 12:13 — вопросы · 12:13–12:30 — стр. 1–4 · 12:30–12:35 — защита.<br>
   <b>3.</b> Правила: «нет данных — так и пишите», «оценка без доказательства = 1», один вектор.<br>
   <b>4.</b> Включить таймер. Обойти каждую команду: «Какой факт стоит за этой пятёркой?»<br>
   <b>5.</b> Практику не сокращать меньше 20 минут.
  </div>
  <h2>Нельзя говорить</h2>
  <div class="box warn"><ul>{dont_html}</ul></div>
  <h2>Если отстаём</h2>
  <div class="small" style="color:#334155">11:28 на слайде 6 → сл. 7 только вывод · 11:48 на сл. 10 → только чек-лист · 12:12 на сл. 14 → без LTV/CAC, сл. 15 — три уровня.</div>
 </div>
</div>

<div class="final"><div><div class="k">Финальная мысль</div><div class="q">Не масштабируйте то, что ещё не научились повторять.</div></div>
<div class="s">Масштабирование усиливает не только сильные стороны бизнеса, но и его проблемы. Выберите один вектор — проверьте на реальных данных.</div></div>
</body></html>"""

html_path = os.path.join(HERE, "cheatsheet.html")
open(html_path, "w", encoding="utf-8").write(doc)
pdf_path = os.path.join(OUT, "05_Speaker_Quick_Reference.pdf")
js = f"""
const {{ chromium }} = require('playwright');
(async () => {{
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('file://{html_path}'); await p.waitForTimeout(300);
  const h = await p.evaluate(() => document.body.scrollHeight);
  console.log('body px', h, 'A4 px', Math.round(297/25.4*96));
  await p.pdf({{ path: '{pdf_path}', format: 'A4', printBackground: true, margin: {{top:0,right:0,bottom:0,left:0}}, pageRanges: '1-' }});
  await b.close();
}})();
"""
subprocess.run(["node", "-e", js], check=True, env=dict(os.environ, NODE_PATH="/opt/node22/lib/node_modules"))
print("written", pdf_path)
