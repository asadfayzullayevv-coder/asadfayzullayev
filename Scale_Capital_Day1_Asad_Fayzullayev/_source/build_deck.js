// Scale & Capital — Day 1 deck. Run: node build_deck.js <outfile.pptx>
const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");

const C = JSON.parse(fs.readFileSync(path.join(__dirname, "content.json"), "utf8"));
const MAP = JSON.parse(fs.readFileSync(path.join(__dirname, "assets/map_markers.json"), "utf8"));
const OUT = process.argv[2] || path.join(__dirname, "deck.pptx");

// ---------- design tokens
const K = {
  navy: "101827", ink: "0F172A", panel: "1E293B", panel2: "273449",
  off: "F8FAFC", white: "FFFFFF", slate: "64748B", slate2: "94A3B8", line: "E2E8F0", tint: "EEF2F6",
  orange: "F59E0B", orangeDk: "B45309", teal: "0D9488", tealLt: "CCFBF1", tealDk: "0F766E", orangeLt: "FEF3C7",
};
const F = "Inter";
const W = 13.333, H = 7.5, MX = 0.6, CW = W - 2 * MX;

const THEME = {
  name: "Scale and Capital",
  headFontFace: F, bodyFontFace: F,
  colors: {
    dk1: K.navy, lt1: K.white, dk2: K.ink, lt2: K.off,
    accent1: K.teal, accent2: K.orange, accent3: K.slate, accent4: K.navy, accent5: K.slate2, accent6: K.tealDk,
    hlink: K.teal, folHlink: K.slate,
  },
};

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = "Асад Файзуллаев";
pres.company = "Scale and Capital Bootcamp";
pres.title = "Scale & Capital — День 1: От первых клиентов до 7 рынков";
pres.theme = { headFontFace: F, bodyFontFace: F };

const footer = (dark) => [
  { text: { text: "Scale & Capital  ·  День 1  ·  Асад Файзуллаев", options: { x: MX, y: 7.0, w: 7, h: 0.3, fontFace: F, fontSize: 10, color: dark ? K.slate2 : K.slate, margin: 0 } } },
];
const titlePh = (dark) => ({
  placeholder: {
    options: { name: "title", type: "title", x: MX, y: 0.78, w: 10.6, h: 1.05, fontFace: F, fontSize: 28, bold: true, align: "left",
      color: dark ? K.white : K.navy, valign: "top", margin: 0, lineSpacingMultiple: 0.95 },
    text: "",
  },
});
pres.defineSlideMaster({ title: "LIGHT", background: { color: K.off }, objects: [...footer(false), titlePh(false)],
  slideNumber: { x: W - MX - 0.6, y: 7.0, w: 0.6, h: 0.3, fontFace: F, fontSize: 10, color: K.slate, align: "right" } });
pres.defineSlideMaster({ title: "DARK", background: { color: K.navy }, objects: [...footer(true), titlePh(true)],
  slideNumber: { x: W - MX - 0.6, y: 7.0, w: 0.6, h: 0.3, fontFace: F, fontSize: 10, color: K.slate2, align: "right" } });
pres.defineSlideMaster({ title: "COVER", background: { color: K.navy }, objects: [] });

// ---------- helpers
function T(s, text, o) {
  s.addText(text, Object.assign({ fontFace: F, margin: 0, isTextBox: true, valign: "top", color: K.navy, fontSize: 14, fit: "none" }, o));
}
function R(s, o) { s.addShape(o.rr ? pres.shapes.ROUNDED_RECTANGLE : pres.shapes.RECTANGLE, Object.assign({ line: { type: "none" } }, o, o.rr ? { rectRadius: o.rr } : {})); }
function kicker(s, txt, dark) {
  T(s, txt.toUpperCase(), { x: MX, y: 0.42, w: 8, h: 0.28, fontSize: 11, bold: true, color: K.orange, charSpacing: 2 });
}
function chip(s, txt, dark) {
  s.addText(txt, { x: W - MX - 1.7, y: 0.38, w: 1.7, h: 0.36, fontFace: F, fontSize: 12, bold: true, align: "center", valign: "middle",
    color: dark ? K.white : K.navy, margin: 0, isTextBox: true,
    shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.18, line: { color: dark ? K.slate : K.slate2, width: 1 }, fill: { color: dark ? K.navy : K.off } });
}
function notes(s, d) {
  const L = [];
  L.push(`[${d.start}–${d.end}]  ${d.title}`);
  L.push(`ЦЕЛЬ: ${d.goal}`);
  L.push("");
  L.push("ЧТО ГОВОРИТЬ:");
  d.say.forEach((p) => L.push(p));
  if (d.example) { L.push(""); L.push("ПРИМЕР: " + d.example); }
  if (d.question) { L.push(""); L.push("ВОПРОС АУДИТОРИИ: " + d.question); }
  if (d.qa && d.qa.length) { L.push(""); L.push("ВЕРОЯТНЫЕ ВОПРОСЫ:"); d.qa.forEach(([q, a]) => L.push(`— ${q}\n   ${a}`)); }
  L.push(""); L.push("ПЕРЕХОД: " + d.transition);
  if (d.cut) { L.push(""); L.push("ЕСЛИ НЕ ХВАТАЕТ ВРЕМЕНИ: " + d.cut); }
  s.addNotes(L.join("\n"));
}
const bySlide = {}; C.SLIDES.forEach((d) => (bySlide[d.key] = d));
const SECTIONS = { 1: "Знакомство", 2: "Growth vs Scale", 3: "Международная экспансия", 4: "Retention", 5: "LTV и экономика", 6: "Практика", 7: "Защита решений", 8: "Выводы", 0: "Backup" };
const KICK = { 1: "Scale & Capital · День 1", 2: "Блок 2 · Вектор роста", 3: "Блок 3 · Кейс TASS Vision", 4: "Блок 4 · Retention", 5: "Блок 5 · LTV и экономика", 6: "Блок 6 · Практика", 7: "Блок 7 · Защита", 8: "Итоги", 0: "Backup" };
let lastSection = null;
function newSlide(key, dark, opts = {}) {
  const d = bySlide[key];
  const sec = SECTIONS[d.block];
  if (sec !== lastSection) { pres.addSection({ title: sec }); lastSection = sec; }
  const s = pres.addSlide({ masterName: opts.cover ? "COVER" : dark ? "DARK" : "LIGHT", sectionTitle: sec });
  if (!opts.cover) {
    s.addText(d.title, { placeholder: "title" });
    kicker(s, KICK[d.block], dark);
    chip(s, d.backup ? "Backup " + d.n : `${d.start} – ${d.end}`, dark);
  }
  notes(s, d);
  return { s, d };
}
const chartBase = (o) => Object.assign({
  catAxisLabelFontFace: F, valAxisLabelFontFace: F, dataLabelFontFace: F, legendFontFace: F, titleFontFace: F,
  catAxisLabelColor: K.slate, valAxisLabelColor: K.slate, catAxisLabelFontSize: 12, valAxisLabelFontSize: 11,
  valGridLine: { color: K.line, size: 0.75 }, catGridLine: { style: "none" }, catAxisLineShow: true, catAxisLineColor: K.slate2,
  valAxisLineShow: false, showLegend: false, dataLabelFontSize: 12, dataLabelColor: K.navy,
}, o);

// ============================================================ 1 COVER
{
  const { s } = newSlide("cover", true, { cover: true });
  T(s, "SCALE & CAPITAL  ·  ДЕНЬ 1  ·  11:00–13:00", { x: MX, y: 0.7, w: 8, h: 0.3, fontSize: 12, bold: true, color: K.orange, charSpacing: 2 });
  T(s, "От первых клиентов\nдо 7 рынков", { x: MX, y: 1.75, w: 8.2, h: 2.2, fontSize: 54, bold: true, color: K.white, lineSpacingMultiple: 0.95 });
  T(s, "Как масштабировать стартап, а не его расходы", { x: MX, y: 4.05, w: 7.6, h: 0.5, fontSize: 22, color: K.off });
  T(s, "Growth Strategy, International Expansion, Retention & LTV", { x: MX, y: 4.6, w: 7.6, h: 0.35, fontSize: 14, color: K.slate2 });
  T(s, "Асад Файзуллаев", { x: MX, y: 6.0, w: 6, h: 0.4, fontSize: 18, bold: true, color: K.white });
  T(s, "Anorbank  |  ex-TASS Vision", { x: MX, y: 6.42, w: 6, h: 0.32, fontSize: 14, color: K.slate2 });
  // growth path: 7 markets as ascending dots
  const codes = ["UZ", "KZ", "KG", "AZ", "GE", "TR", "PE"];
  const pts = codes.map((c, i) => {
    const t = i / 6;
    return { c, x: 8.9 + t * 3.6, y: 5.9 - Math.pow(t, 1.6) * 3.9 };
  });
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    s.addShape(pres.shapes.LINE, { x: a.x, y: Math.min(a.y, b.y), w: b.x - a.x, h: Math.abs(b.y - a.y), flipV: true, line: { color: K.slate, width: 1.25 } });
  }
  pts.forEach((p, i) => {
    const r = i === 0 ? 0.2 : 0.15;
    s.addShape(pres.shapes.OVAL, { x: p.x - r, y: p.y - r, w: 2 * r, h: 2 * r, fill: { color: i === 0 ? K.orange : K.teal }, line: { color: K.navy, width: 2 } });
    T(s, p.c, { x: p.x - 0.5, y: p.y + 0.24, w: 1.0, h: 0.25, fontSize: 11, bold: true, color: K.slate2, align: "center" });
  });
}

// ============================================================ 2 SPEAKER
{
  const { s } = newSlide("speaker", false);
  // left context
  const L = [
    ["Сейчас", "Anorbank — Project Manager", "Цифровая платформа, мобильный B2C-продукт, экосистемные и партнёрские интеграции"],
    ["Ранее", "TASS Vision — B2B Growth", "AI-видеоаналитика для ритейла: enterprise-продажи, партнёрства, пилоты, тарифы"],
  ];
  L.forEach((r, i) => {
    const y = 2.15 + i * 1.75;
    T(s, r[0].toUpperCase(), { x: MX, y, w: 4.2, h: 0.28, fontSize: 11, bold: true, color: K.slate, charSpacing: 2 });
    T(s, r[1], { x: MX, y: y + 0.34, w: 4.4, h: 0.4, fontSize: 18, bold: true });
    T(s, r[2], { x: MX, y: y + 0.8, w: 4.2, h: 0.75, fontSize: 14, color: K.slate });
  });
  // right stats 2x2
  const st = [["7", "рынков присутствия\nили развития бизнеса"], ["52", "закрытых контракта"], ["≈ $270K", "ARR компании"], ["AI Startup\nof the Year", "Nexus Awards · Baku ID 2025"]];
  const gx = 5.6, gy = 1.95, cw = 3.45, ch = 2.05, gap = 0.3;
  st.forEach((v, i) => {
    const x = gx + (i % 2) * (cw + gap), y = gy + Math.floor(i / 2) * (ch + gap);
    R(s, { x, y, w: cw, h: ch, fill: { color: K.white }, rr: 0.08, shadow: { type: "outer", color: "0F172A", opacity: 0.06, blur: 8, offset: 2, angle: 90 } });
    const award = i === 3;
    T(s, v[0], { x: x + 0.3, y: y + 0.28, w: cw - 0.5, h: award ? 1.0 : 0.95, fontSize: award ? 24 : 48, bold: true, color: i === 0 ? K.teal : K.navy, valign: award ? "top" : "top", lineSpacingMultiple: 0.95 });
    T(s, v[1], { x: x + 0.3, y: y + 1.32, w: cw - 0.5, h: 0.6, fontSize: 13, color: K.slate });
  });
  T(s, "Результаты компании TASS Vision и команды за период работы спикера; данные предоставлены спикером. Награда присуждена компании.",
    { x: gx, y: 6.42, w: 7.15, h: 0.4, fontSize: 10, color: K.slate, italic: true });
}

// ============================================================ 3 STAGES
{
  const { s } = newSlide("stages", true);
  const st = [
    ["01", "Idea / MVP", "Продукт есть или почти есть, платящих клиентов нет", "Найти доказательства спроса"],
    ["02", "Первые пользователи", "Люди пользуются, денег мало или нет", "Активация и удержание"],
    ["03", "Первые платящие клиенты", "Есть выручка и повторные оплаты", "Retention, LTV, повторяемость"],
    ["04", "Готовимся к масштабу", "Новые рынки, сегменты, инвестиции", "Выбор вектора и экономика"],
  ];
  const cw = (CW - 3 * 0.3) / 4;
  // progression line
  s.addShape(pres.shapes.LINE, { x: MX + 0.3, y: 2.3, w: CW - 0.6, h: 0, line: { color: K.slate, width: 1.25, endArrowType: "triangle" } });
  st.forEach((v, i) => {
    const x = MX + i * (cw + 0.3);
    s.addShape(pres.shapes.OVAL, { x: x + 0.22, y: 2.18, w: 0.24, h: 0.24, fill: { color: i === 3 ? K.orange : K.teal }, line: { color: K.navy, width: 2 } });
    R(s, { x, y: 2.65, w: cw, h: 3.0, fill: { color: K.panel }, rr: 0.08 });
    T(s, v[0], { x: x + 0.25, y: 2.88, w: 1, h: 0.4, fontSize: 14, bold: true, color: K.orange });
    T(s, v[1], { x: x + 0.25, y: 3.3, w: cw - 0.4, h: 0.8, fontSize: 16, bold: true, color: K.white });
    T(s, v[2], { x: x + 0.25, y: 4.12, w: cw - 0.5, h: 0.7, fontSize: 13, color: K.slate2 });
    T(s, "Фокус: " + v[3], { x: x + 0.25, y: 4.95, w: cw - 0.5, h: 0.55, fontSize: 13, bold: true, color: K.tealLt });
  });
  T(s, "Поднимите руку — одна рука на команду.   Затем: «Главная проблема роста — одним предложением».",
    { x: MX, y: 6.0, w: CW, h: 0.4, fontSize: 16, color: K.white });
}

// ============================================================ 4 GROWTH ≠ SCALE
{
  const { s } = newSlide("growth_scale", false);
  const models = [
    { name: "Модель A — рост", sub: "Расходы растут вместе с клиентами", cost: [9, 18], res: "Прибыль $1K → $2K  ·  маржа 10% → 10%", col: K.slate2 },
    { name: "Модель B — масштабирование", sub: "Расходы растут медленнее выручки", cost: [9, 12], res: "Прибыль $1K → $8K  ·  маржа 10% → 40%", col: K.orange },
  ];
  const cw = 5.85;
  models.forEach((m, i) => {
    const x = MX + i * (cw + 0.4);
    T(s, m.name, { x, y: 2.0, w: cw, h: 0.4, fontSize: 18, bold: true, color: i ? K.teal : K.navy });
    T(s, m.sub, { x, y: 2.4, w: cw, h: 0.32, fontSize: 14, color: K.slate });
    s.addChart(pres.charts.BAR, [
      { name: "Выручка", labels: ["10 клиентов", "20 клиентов"], values: [10, 20] },
      { name: "Расходы", labels: ["10 клиентов", "20 клиентов"], values: m.cost },
    ], chartBase({
      x, y: 2.8, w: cw, h: 2.75, barDir: "col", barGapWidthPct: 60, barGrouping: "clustered",
      chartColors: [K.navy, m.col], showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: '"$"0"K"',
      valAxisMaxVal: 24, valAxisMinVal: 0, valAxisMajorUnit: 5, valAxisHidden: true, valGridLine: { style: "none" },
      showLegend: true, legendPos: "t", legendFontSize: 12, legendColor: K.slate,
    }));
    R(s, { x, y: 5.7, w: cw, h: 0.62, fill: { color: i ? K.tealLt : K.tint }, rr: 0.06 });
    T(s, m.res, { x: x + 0.25, y: 5.7, w: cw - 0.5, h: 0.62, fontSize: 16, bold: true, valign: "middle", color: i ? K.tealDk : K.navy });
  });
  T(s, "Учебный пример, $K в месяц: 10 клиентов × $1K. Масштабирование — когда выручка растёт быстрее расходов.",
    { x: MX, y: 6.48, w: CW, h: 0.3, fontSize: 11, color: K.slate, italic: true });
}

// ============================================================ 5 VECTORS
{
  const { s } = newSlide("vectors", false);
  const cells = [
    ["1", "География", "Geography", "Новые страны и города", "TASS Vision: Казахстан, Азербайджан, Перу"],
    ["2", "Новые сегменты", "Customer Segments", "Тот же продукт — другой тип клиента", "От отдельных магазинов к сетям; аптечный сектор"],
    ["3", "Продукт и тарифы", "Product Expansion", "Новые модули, пакеты, сервисы", "Новый тарифный пакет; партнёрские сервисы в банковском приложении"],
    ["4", "Существующие клиенты", "Existing Customer Expansion", "Больше выручки от текущей базы", "Сетевой клиент подключает новые точки"],
  ];
  const gx = 1.15, gy = 2.0, cw = 4.0, ch = 2.15, g = 0.2;
  cells.forEach((c, i) => {
    const x = gx + (i % 2) * (cw + g), y = gy + Math.floor(i / 2) * (ch + g);
    const far = i < 2;
    R(s, { x, y, w: cw, h: ch, fill: { color: far ? K.white : K.tealLt }, rr: 0.06, line: far ? { color: K.line, width: 1 } : { type: "none" } });
    T(s, c[0], { x: x + 0.25, y: y + 0.2, w: 0.5, h: 0.4, fontSize: 20, bold: true, color: far ? K.orange : K.teal });
    T(s, c[1], { x: x + 0.7, y: y + 0.2, w: cw - 0.9, h: 0.4, fontSize: 17, bold: true });
    T(s, c[2], { x: x + 0.7, y: y + 0.58, w: cw - 0.9, h: 0.3, fontSize: 11, color: K.slate, italic: true });
    T(s, c[3], { x: x + 0.25, y: y + 0.95, w: cw - 0.5, h: 0.35, fontSize: 13, bold: true, color: K.navy });
    T(s, c[4], { x: x + 0.25, y: y + 1.32, w: cw - 0.5, h: 0.7, fontSize: 13, color: K.slate });
  });
  // vertical axis
  s.addShape(pres.shapes.LINE, { x: 0.82, y: 2.05, w: 0, h: 4.4, line: { color: K.slate2, width: 1.25, beginArrowType: "triangle" } });
  T(s, "дальше: дороже, дольше", { x: -0.45, y: 2.95, w: 2.0, h: 0.3, fontSize: 11, color: K.slate, rotate: 270, align: "center" });
  T(s, "ближе: быстрее, дешевле", { x: -0.45, y: 5.25, w: 2.0, h: 0.3, fontSize: 11, color: K.slate, rotate: 270, align: "center" });
  // stage column
  const sx = 9.7, sw = W - MX - sx;
  T(s, "ЧТО ВЫБИРАТЬ ПО СТАДИИ", { x: sx, y: 2.0, w: sw, h: 0.3, fontSize: 11, bold: true, color: K.slate, charSpacing: 2 });
  const st = [["Idea / MVP", "Ни один: ваш вектор — найти PMF"], ["Первые платящие", "Чаще 4 и 3: удержать, допродать, расширить"], ["Готовы к масштабу", "1 и 2 — при доказанной повторяемости"]];
  st.forEach((v, i) => {
    const y = 2.45 + i * 1.32;
    T(s, v[0], { x: sx, y, w: sw, h: 0.35, fontSize: 16, bold: true });
    T(s, v[1], { x: sx, y: y + 0.38, w: sw, h: 0.75, fontSize: 14, color: K.slate });
  });
}

// ============================================================ 6 DECISION MATRIX
{
  const { s } = newSlide("matrix", false);
  const crit = ["Спрос (Customer demand)", "Доступ к клиентам (Distribution)", "Экономика (Unit economics)", "Потенциал удержания (Retention)", "Операционная готовность"];
  const sc = [[3, 4, 4], [2, 3, 5], [3, 3, 5], [3, 4, 4], [2, 3, 4]];
  const tot = [0, 1, 2].map((j) => sc.reduce((a, r) => a + r[j], 0));
  const heat = { 1: "FDE68A", 2: "FEF3C7", 3: "F1F5F9", 4: "CCFBF1", 5: "99F6E4" };
  const hdr = (t) => ({ text: t, options: { bold: true, color: K.white, fill: { color: K.navy }, fontSize: 13, align: "center", valign: "middle" } });
  const rows = [[{ text: "Критерий, 1–5", options: { bold: true, color: K.white, fill: { color: K.navy }, fontSize: 13, valign: "middle" } },
    hdr("H1  Новый рынок:\nКазахстан"), hdr("H2  Новый сегмент:\nсети кофеен"), hdr("H3  Модуль закупок\nдля текущих клиентов")]];
  crit.forEach((c, i) => rows.push([{ text: c, options: { fontSize: 14, color: K.navy, valign: "middle" } },
    ...sc[i].map((v) => ({ text: String(v), options: { fontSize: 18, bold: true, align: "center", valign: "middle", color: K.navy, fill: { color: heat[v] } } }))]));
  rows.push([{ text: "Итого из 25", options: { bold: true, fontSize: 15, valign: "middle", color: K.navy } },
    ...tot.map((v, j) => ({ text: String(v), options: { fontSize: 22, bold: true, align: "center", valign: "middle", color: j === 2 ? K.white : K.navy, fill: { color: j === 2 ? K.teal : K.white } } }))]);
  s.addTable(rows, { x: MX, y: 2.0, w: 8.4, colW: [3.3, 1.7, 1.7, 1.7], rowH: [0.72, 0.56, 0.56, 0.56, 0.56, 0.56, 0.66], fontFace: F,
    border: { type: "solid", color: K.line, pt: 1 }, fill: { color: K.white }, margin: [0.04, 0.12, 0.04, 0.12] });
  T(s, "Учебный пример: вымышленный B2B-сервис учёта для ресторанов (Ташкент).", { x: MX, y: 6.4, w: 8.4, h: 0.3, fontSize: 11, italic: true, color: K.slate });
  const sx = 9.45, sw = W - MX - sx;
  R(s, { x: sx, y: 2.0, w: sw, h: 4.18, fill: { color: K.navy }, rr: 0.08 });
  T(s, "ПРАВИЛО МАТРИЦЫ", { x: sx + 0.3, y: 2.25, w: sw - 0.6, h: 0.3, fontSize: 11, bold: true, color: K.orange, charSpacing: 2 });
  T(s, "Оценка без\nдоказательства = 1", { x: sx + 0.3, y: 2.62, w: sw - 0.5, h: 1.1, fontSize: 19, bold: true, color: K.white });
  T(s, "Матрица не доказывает правильность решения. Она заставляет команду спорить о фактах, а не о вкусах.",
    { x: sx + 0.3, y: 3.85, w: sw - 0.6, h: 1.2, fontSize: 14, color: K.slate2 });
  T(s, "H1 проигрывает не из-за спроса, а из-за доступа и операционки.", { x: sx + 0.3, y: 5.15, w: sw - 0.6, h: 0.9, fontSize: 14, bold: true, color: K.tealLt });
}

// ============================================================ 7 MAP
{
  const { s } = newSlide("map", false);
  // region map (right)
  const rw = 7.7, rh = rw * MAP.region.H / MAP.region.W, rx = W - MX - rw, ry = 1.95;
  s.addImage({ path: path.join(__dirname, "assets/map_region.png"), x: rx, y: ry, w: rw, h: rh, altText: "Карта: Турция, Грузия, Азербайджан, Казахстан, Узбекистан, Кыргызстан" });
  const off = { "268": [0, -0.42], "031": [0.25, 0.3], "792": [0.15, 0.05], "398": [0, 0], "860": [0.05, 0.05], "417": [0.0, 0.42] };
  for (const [id, m] of Object.entries(MAP.region.markers)) {
    if (!off[id]) continue;
    const cx = rx + m.fx * rw + off[id][0], cy = ry + m.fy * rh + off[id][1];
    const onFill = ["398", "792"].includes(id);
    s.addText(m.ru, { x: cx - 0.85, y: cy - 0.16, w: 1.7, h: 0.32, fontFace: F, fontSize: 13, bold: true, align: "center", valign: "middle", margin: 0, isTextBox: true,
      color: onFill ? K.white : K.navy, ...(onFill ? {} : { fill: { color: K.white }, shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.12 }) });
  }
  // world inset (left)
  const ww = 4.1, wh = ww * MAP.world.H / MAP.world.W, wx = MX, wy = 1.95;
  s.addImage({ path: path.join(__dirname, "assets/map_world.png"), x: wx, y: wy, w: ww, h: wh, altText: "Карта мира: Перу и страны Евразии, где работала TASS Vision" });
  const pe = MAP.world.markers["604"];
  s.addText("Перу", { x: wx + pe.fx * ww + 0.15, y: wy + pe.fy * wh - 0.15, w: 0.7, h: 0.28, fontFace: F, fontSize: 12, bold: true, color: K.navy, margin: 0, isTextBox: true, valign: "middle" });
  // stats + takeaway
  const facts = [["7", "рынков"], ["52", "контракта"], ["≈$270K", "ARR"]];
  facts.forEach((f, i) => {
    const x = MX + i * 1.4;
    T(s, f[0], { x, y: 4.25, w: 1.4, h: 0.5, fontSize: i === 2 ? 20 : 26, bold: true, color: K.teal, valign: "bottom" });
    T(s, f[1], { x, y: 4.78, w: 1.4, h: 0.3, fontSize: 12, color: K.slate });
  });
  T(s, "Главное — не число стран, а воспроизводимый способ находить и обслуживать клиентов.", { x: MX, y: 5.35, w: 4.2, h: 1.0, fontSize: 16, bold: true });
  // legend
  R(s, { x: rx, y: 6.33, w: 0.18, h: 0.18, fill: { color: K.orange }, rr: 0.03 });
  T(s, "домашний рынок", { x: rx + 0.26, y: 6.29, w: 1.7, h: 0.26, fontSize: 11, color: K.slate, valign: "middle" });
  R(s, { x: rx + 2.0, y: 6.33, w: 0.18, h: 0.18, fill: { color: K.teal }, rr: 0.03 });
  T(s, "рынки присутствия или развития бизнеса (данные спикера)", { x: rx + 2.26, y: 6.29, w: 5.3, h: 0.26, fontSize: 11, color: K.slate, valign: "middle" });
}

// ============================================================ 8 AZERBAIJAN
{
  const { s } = newSlide("azerbaijan", true);
  T(s, "OMID", { x: MX, y: 2.05, w: 3.6, h: 0.35, fontSize: 14, bold: true, color: K.slate2, charSpacing: 2 });
  T(s, "63", { x: MX, y: 2.35, w: 3.6, h: 1.3, fontSize: 88, bold: true, color: K.orange });
  T(s, "торговые точки сети хозяйственных магазинов, Азербайджан", { x: MX, y: 3.75, w: 3.4, h: 0.65, fontSize: 14, color: K.off });
  T(s, "+ Avromed — аптечный сегмент", { x: MX, y: 4.55, w: 3.6, h: 0.35, fontSize: 14, bold: true, color: K.tealLt });
  // flow
  const steps = [["Pilot", "Пилот на нескольких точках"], ["ROI Validation", "Проверка эффекта на данных клиента"], ["Commercial Agreement", "Цена, срок, условия"], ["Multi-location Rollout", "Развёртывание на сеть"]];
  const fx = 4.75, fw = W - MX - fx, sw = (fw - 3 * 0.32) / 4;
  steps.forEach((v, i) => {
    const x = fx + i * (sw + 0.32);
    R(s, { x, y: 2.05, w: sw, h: 1.75, fill: { color: i === 3 ? K.teal : K.panel }, rr: 0.08 });
    T(s, `0${i + 1}`, { x: x + 0.2, y: 2.2, w: 0.6, h: 0.3, fontSize: 12, bold: true, color: i === 3 ? K.white : K.orange });
    T(s, v[0], { x: x + 0.2, y: 2.48, w: sw - 0.3, h: 0.62, fontSize: 14, bold: true, color: K.white });
    T(s, v[1], { x: x + 0.2, y: 3.12, w: sw - 0.3, h: 0.62, fontSize: 12, color: i === 3 ? K.white : K.slate2 });
    if (i < 3) T(s, "→", { x: x + sw, y: 2.6, w: 0.32, h: 0.4, fontSize: 18, bold: true, color: K.slate2, align: "center" });
  });
  T(s, "Концептуальная модель — не фактическая история контракта с OMID.", { x: fx, y: 3.9, w: fw, h: 0.3, fontSize: 11, italic: true, color: K.slate2 });
  // decision makers
  T(s, "КТО РЕШАЕТ В СЕТИ", { x: fx, y: 4.42, w: fw, h: 0.3, fontSize: 11, bold: true, color: K.slate2, charSpacing: 2 });
  const dm = ["Владелец / CEO", "Операции", "IT и безопасность", "Финансы", "Управляющие точек"];
  let x = fx;
  dm.forEach((t) => {
    const w = 0.26 + t.length * 0.092;
    s.addText(t, { x, y: 4.8, w, h: 0.42, fontFace: F, fontSize: 12, color: K.white, align: "center", valign: "middle", margin: 0, isTextBox: true,
      shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.21, line: { color: K.slate, width: 1 } });
    x += w + 0.12;
  });
  R(s, { x: MX, y: 5.6, w: CW, h: 0.85, fill: { color: K.panel }, rr: 0.08 });
  T(s, [{ text: "Правило:  ", options: { bold: true, color: K.orange } }, { text: "не обещайте масштаб до доказанного результата пилота. Договоритесь заранее, какой результат на пилоте достаточен для следующего шага.", options: { color: K.white } }],
    { x: MX + 0.3, y: 5.6, w: CW - 0.6, h: 0.85, fontSize: 15, valign: "middle" });
}

// ============================================================ 9 KAZAKHSTAN
{
  const { s } = newSlide("kazakhstan", false);
  T(s, "Казахстан:  Technodom  ·  Sulpak  ·  Mechta  ·  Meloman  ·  Europharma", { x: MX, y: 2.0, w: CW, h: 0.35, fontSize: 14, bold: true, color: K.slate });
  const st = [["Lead", "Подходит под профиль клиента"], ["Qualification", "Есть боль, бюджет, ЛПР, сроки"], ["Demo", "Ценность видна на задачах клиента"],
    ["Pilot", "Метрики, срок, ответственные, следующий шаг"], ["Paid Contract", "Договор подписан, оплата получена"], ["Expansion", "Больше точек, модулей, тариф выше"]];
  const n = st.length, gap = 0.12, bw = (CW - (n - 1) * gap) / n, base = 4.15;
  st.forEach((v, i) => {
    const x = MX + i * (bw + gap);
    const h = 1.55 - i * 0.18;
    const paid = i >= 4;
    R(s, { x, y: base - h, w: bw, h, fill: { color: paid ? K.teal : i === 3 ? K.orange : K.navy }, rr: 0.05 });
    T(s, v[0], { x: x + 0.15, y: base - h + 0.15, w: bw - 0.3, h: 0.35, fontSize: 15, bold: true, color: K.white });
    T(s, v[1], { x, y: base + 0.15, w: bw - 0.05, h: 0.7, fontSize: 12, color: K.slate });
  });
  // separator: interest vs sale
  const sepX = MX + 4 * (bw + gap) - gap / 2;
  s.addShape(pres.shapes.LINE, { x: sepX, y: 2.4, w: 0, h: 2.6, line: { color: K.orange, width: 1.5, dashType: "dash" } });
  T(s, "интерес", { x: sepX - 1.3, y: 2.42, w: 1.2, h: 0.28, fontSize: 12, bold: true, color: K.orangeDk, align: "right" });
  T(s, "продажа", { x: sepX + 0.12, y: 2.42, w: 1.2, h: 0.28, fontSize: 12, bold: true, color: K.tealDk });
  // pilot passport
  R(s, { x: MX, y: 5.2, w: CW, h: 1.2, fill: { color: K.white }, rr: 0.08, line: { color: K.line, width: 1 } });
  T(s, "ПАСПОРТ ПИЛОТА — ДО СТАРТА", { x: MX + 0.3, y: 5.35, w: 4, h: 0.3, fontSize: 11, bold: true, color: K.orangeDk, charSpacing: 2 });
  const pp = ["Цель", "Метрика и baseline", "Срок", "Ответственные с двух сторон", "Решение и цена после пилота"];
  const pws = [1.25, 2.55, 1.25, 3.15, 3.3];
  let px = MX + 0.3;
  pp.forEach((t, i) => { T(s, [{ text: `${i + 1}  `, options: { bold: true, color: K.teal } }, { text: t, options: { bold: i === 4, color: K.navy } }],
    { x: px, y: 5.72, w: pws[i] - 0.15, h: 0.55, fontSize: 14 }); px += pws[i]; });
  T(s, "Пилоты с Technodom и Meloman запускались (данные спикера); их результаты здесь не раскрываются.", { x: MX, y: 6.5, w: CW, h: 0.28, fontSize: 11, italic: true, color: K.slate });
}

// ============================================================ 10 PERU
{
  const { s } = newSlide("peru", true);
  T(s, "Access ≠ PMF", { x: MX, y: 2.0, w: 5.6, h: 1.0, fontSize: 54, bold: true, color: K.orange });
  T(s, "Встреча с глобальным брендом доказывает доступ. Она не доказывает, что там будут покупать, продлевать и рекомендовать.",
    { x: MX, y: 3.15, w: 5.2, h: 1.0, fontSize: 16, color: K.off });
  const ctx = [["Рынок", "Перу, Латинская Америка"], ["Вход", "Через локальных партнёров"], ["Статус", "Начало пилотного взаимодействия с Bose и Dyson — не платные контракты"]];
  ctx.forEach((c, i) => {
    const y = 4.45 + i * 0.6;
    T(s, c[0].toUpperCase(), { x: MX, y: y + 0.03, w: 1.2, h: 0.3, fontSize: 11, bold: true, color: K.slate2, charSpacing: 1 });
    T(s, c[1], { x: MX + 1.25, y, w: 4.1, h: 0.55, fontSize: 14, color: K.white });
  });
  const cx = 6.75, cw = W - MX - cx;
  R(s, { x: cx, y: 2.0, w: cw, h: 4.65, fill: { color: K.panel }, rr: 0.08 });
  T(s, "ЧЕК-ЛИСТ НОВОГО РЕГИОНА", { x: cx + 0.35, y: 2.22, w: cw - 0.7, h: 0.3, fontSize: 11, bold: true, color: K.orange, charSpacing: 2 });
  const q = ["Есть ли подтверждённый спрос — готовность платить?", "Кто первые 10 покупателей — поимённо?", "Какой цикл сделки?", "Какие локальные ограничения: данные, валюта, налоги, язык?", "Сколько стоят внедрение и поддержка на расстоянии?", "Можно ли повторить продажу без перелёта основателя?"];
  q.forEach((t, i) => {
    const y = 2.68 + i * 0.64;
    R(s, { x: cx + 0.35, y: y + 0.05, w: 0.28, h: 0.28, fill: { color: K.panel }, line: { color: K.tealLt, width: 1.25 }, rr: 0.04 });
    T(s, t, { x: cx + 0.85, y, w: cw - 1.2, h: 0.55, fontSize: 15, color: K.white });
  });
}

// ============================================================ 11 RETENTION B2C vs B2B
{
  const { s } = newSlide("retention", false);
  const cols = [
    { h: "B2C", sub: "Мобильный банк — Anorbank", items: [["Activation", "первое действие с ценностью, а не установка"], ["Repeat valuable action", "то, ради чего возвращаются"], ["Cohort retention", "доля когорты, активной через N месяцев"], ["DAU / MAU", "частота использования — не удержание"]],
      stat: ["−250+", "обращений в поддержку в месяц после оптимизации сценария в приложении. Качество продукта — тоже retention."] },
    { h: "B2B", sub: "AI-видеоаналитика — TASS Vision", items: [["Logo retention", "сколько клиентов осталось"], ["GRR", "сохранённая выручка без допродаж"], ["NRR", "выручка с учётом оттока и расширений"], ["Renewal · Adoption · Expansion", "продления, глубина и рост использования"]],
      stat: ["≠ логины", "Клиент может редко открывать дашборд и получать ценность каждый день: отчёты, алерты, решения по сменам."] },
  ];
  const cw = (CW - 0.4) / 2;
  cols.forEach((c, i) => {
    const x = MX + i * (cw + 0.4);
    R(s, { x, y: 1.95, w: cw, h: 4.8, fill: { color: i ? K.white : K.white }, rr: 0.08, line: { color: K.line, width: 1 } });
    T(s, c.h, { x: x + 0.35, y: 2.12, w: 1.2, h: 0.5, fontSize: 26, bold: true, color: i ? K.teal : K.orangeDk });
    T(s, c.sub, { x: x + 1.45, y: 2.24, w: cw - 1.7, h: 0.35, fontSize: 14, color: K.slate });
    c.items.forEach((it, j) => {
      const y = 2.75 + j * 0.58;
      T(s, [{ text: it[0], options: { bold: true, color: K.navy, fontSize: 14, breakLine: true } }, { text: it[1], options: { color: K.slate, fontSize: 13 } }], { x: x + 0.35, y, w: cw - 0.7, h: 0.52 });
    });
    R(s, { x: x + 0.35, y: 5.15, w: cw - 0.7, h: 1.4, fill: { color: i ? K.tealLt : K.orangeLt }, rr: 0.06 });
    T(s, c.stat[0], { x: x + 0.55, y: 5.25, w: 1.75, h: 1.2, fontSize: i ? 22 : 30, bold: true, color: i ? K.tealDk : K.orangeDk, valign: "middle" });
    T(s, c.stat[1], { x: x + 2.35, y: 5.25, w: cw - 2.9, h: 1.2, fontSize: 13, color: K.navy, valign: "middle" });
  });
}

// ============================================================ 12 COHORTS
{
  const { s } = newSlide("cohorts", false);
  const data = [["Янв", [100, 42, 31, 26, 24, 23]], ["Фев", [100, 44, 33, 28, 26]], ["Мар", [100, 47, 36, 31]], ["Апр", [100, 52, 41]], ["Май", [100, 55]], ["Июн", [100]]];
  const shade = (v) => v >= 100 ? K.navy : v >= 50 ? "0F766E" : v >= 40 ? "14B8A6" : v >= 30 ? "5EEAD4" : v >= 25 ? "99F6E4" : "CCFBF1";
  const hdr = (t) => ({ text: t, options: { bold: true, fontSize: 13, color: K.slate, align: "center", valign: "middle" } });
  const rows = [[hdr("Когорта"), ...["M0", "M1", "M2", "M3", "M4", "M5"].map(hdr)]];
  data.forEach(([m, vals]) => {
    const r = [{ text: m, options: { bold: true, fontSize: 14, color: K.navy, align: "center", valign: "middle" } }];
    for (let k = 0; k < 6; k++) {
      const v = vals[k];
      r.push(v === undefined ? { text: "", options: { fill: { color: K.off } } } :
        { text: v + "%", options: { fontSize: 14, bold: true, align: "center", valign: "middle", color: v >= 40 ? K.white : K.navy, fill: { color: shade(v) } } });
    }
    rows.push(r);
  });
  s.addTable(rows, { x: MX, y: 2.0, w: 7.2, colW: [1.2, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0], rowH: 0.56, fontFace: F, border: { type: "solid", color: K.off, pt: 2 }, margin: 0.04 });
  T(s, "Учебные данные: % когорты, совершившей ценное действие в месяце N.", { x: MX, y: 6.0, w: 7.2, h: 0.3, fontSize: 11, italic: true, color: K.slate });
  // arrows annotations
  T(s, "→ по строке: кривая выравнивается (26 → 24 → 23) = есть ядро", { x: MX, y: 6.3, w: 7.2, h: 0.3, fontSize: 12, bold: true, color: K.tealDk });
  // right: chart + rules
  const rx = 8.25, rw = W - MX - rx;
  s.addChart(pres.charts.LINE, [
    { name: "Кривая выравнивается", labels: ["M0", "M1", "M2", "M3", "M4", "M5"], values: [100, 42, 31, 26, 24, 23] },
    { name: "Ведро с дырой", labels: ["M0", "M1", "M2", "M3", "M4", "M5"], values: [100, 35, 20, 11, 6, 3] },
  ], chartBase({ x: rx - 0.1, y: 1.9, w: rw + 0.1, h: 2.55, chartColors: [K.teal, K.orange], lineSize: 2.5, lineDataSymbol: "circle", lineDataSymbolSize: 6,
    showLegend: true, legendPos: "t", legendFontSize: 11, legendColor: K.slate, valAxisMaxVal: 100, valAxisMajorUnit: 25, valAxisLabelFormatCode: '0"%"' }));
  const rules = [["↓ по столбцу", "M1 растёт с 42% до 55%: новые когорты удерживаются лучше"], ["↘ по диагонали", "просели все когорты в один месяц — ищите внешнюю причину"]];
  rules.forEach((r, i) => {
    const y = 4.6 + i * 0.95;
    T(s, r[0], { x: rx, y, w: rw, h: 0.32, fontSize: 15, bold: true });
    T(s, r[1], { x: rx, y: y + 0.33, w: rw, h: 0.55, fontSize: 13, color: K.slate });
  });
}

// ============================================================ 13 LTV
{
  const { s } = newSlide("ltv", true);
  const lev = [["1", "Снизить отток", "Reduce churn"], ["2", "Допродать", "Upsell & cross-sell"], ["3", "Расширить аккаунт", "Expand existing accounts"]];
  lev.forEach((l, i) => {
    const y = 2.05 + i * 0.95;
    s.addShape(pres.shapes.OVAL, { x: MX, y: y + 0.02, w: 0.52, h: 0.52, fill: { color: K.panel }, line: { color: K.teal, width: 1.5 } });
    T(s, l[0], { x: MX, y: y + 0.02, w: 0.52, h: 0.52, fontSize: 16, bold: true, color: K.white, align: "center", valign: "middle" });
    T(s, l[1], { x: MX + 0.75, y: y - 0.02, w: 3.6, h: 0.36, fontSize: 18, bold: true, color: K.white });
    T(s, l[2], { x: MX + 0.75, y: y + 0.33, w: 3.6, h: 0.3, fontSize: 12, color: K.slate2 });
  });
  // case
  R(s, { x: MX, y: 5.0, w: 4.55, h: 1.55, fill: { color: K.panel }, rr: 0.08 });
  T(s, "×1,69", { x: MX + 0.3, y: 5.12, w: 2.0, h: 0.7, fontSize: 36, bold: true, color: K.orange });
  T(s, "MRR TASS Vision после введения нового тарифного пакета (данные спикера). Влияние других факторов не исключено.",
    { x: MX + 0.3, y: 5.8, w: 4.0, h: 0.7, fontSize: 12, color: K.off });
  // waterfall
  const wx = 5.75, ww = W - MX - wx, base = 5.95, scale = 3.0 / 105, bw = 1.05;
  const steps = [["Начало года", 0, 100, K.slate2, "$100K"], ["Отток", 92, 8, K.orange, "−$8K"], ["Даунгрейд", 90, 2, K.orange, "−$2K"], ["Расширение", 90, 15, K.teal, "+$15K"], ["Конец года", 0, 105, K.white, "$105K"]];
  const gap = (ww - steps.length * bw) / (steps.length - 1);
  steps.forEach((st, i) => {
    const x = wx + i * (bw + gap);
    const y = base - (st[1] + st[2]) * scale, h = st[2] * scale;
    R(s, { x, y, w: bw, h: Math.max(h, 0.05), fill: { color: st[3] } });
    T(s, st[4], { x: x - 0.2, y: y - 0.38, w: bw + 0.4, h: 0.32, fontSize: 14, bold: true, color: K.white, align: "center" });
    T(s, st[0], { x: x - 0.2, y: base + 0.1, w: bw + 0.4, h: 0.3, fontSize: 12, color: K.slate2, align: "center" });
  });
  s.addShape(pres.shapes.LINE, { x: wx, y: base, w: ww, h: 0, line: { color: K.slate, width: 1 } });
  // badges
  [["GRR 90% · без допродаж", "", K.slate2], ["NRR 105% · с расширением", "", K.teal]].forEach((b, i) => {
    const x = wx + i * 3.35;
    s.addText(b[0], { x, y: 1.98, w: 3.1, h: 0.42, fontFace: F, fontSize: 14, bold: true, color: i ? K.white : K.navy, align: "center", valign: "middle", margin: 0, isTextBox: true,
      shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.21, fill: { color: i ? K.teal : K.slate2 } });
  });
  T(s, "Учебный мост годовой выручки когорты клиентов", { x: wx, y: 6.48, w: ww, h: 0.28, fontSize: 11, italic: true, color: K.slate2 });
}

// ============================================================ 14 UNIT ECONOMICS
{
  const { s } = newSlide("unit", false);
  const lx = MX, lw = 4.6;
  R(s, { x: lx, y: 1.95, w: lw, h: 4.8, fill: { color: K.white }, rr: 0.08, line: { color: K.line, width: 1 } });
  const rows = [["CAC", "$1 000"], ["Выручка клиента в месяц", "$200"], ["Валовая маржа", "70%"], ["Валовая прибыль в месяц", "$140"]];
  rows.forEach((r, i) => {
    const y = 2.2 + i * 0.55;
    T(s, r[0], { x: lx + 0.3, y, w: 2.8, h: 0.4, fontSize: 15, color: K.slate, valign: "middle" });
    T(s, r[1], { x: lx + 2.9, y, w: 1.4, h: 0.4, fontSize: 17, bold: true, align: "right", valign: "middle" });
  });
  s.addShape(pres.shapes.LINE, { x: lx + 0.3, y: 4.47, w: lw - 0.6, h: 0, line: { color: K.line, width: 1 } });
  T(s, "CAC payback = 1 000 / 140", { x: lx + 0.3, y: 4.6, w: lw - 0.6, h: 0.3, fontSize: 13, color: K.slate });
  T(s, "≈ 7,1 мес.", { x: lx + 0.3, y: 4.9, w: lw - 0.6, h: 0.65, fontSize: 32, bold: true, color: K.teal });
  R(s, { x: lx + 0.3, y: 5.7, w: lw - 0.6, h: 0.82, fill: { color: K.orangeLt }, rr: 0.06 });
  T(s, [{ text: "CAC ×2 = $2 000  →  ≈ 14,3 мес.\n", options: { bold: true, color: K.orangeDk } }, { text: "Ваш клиент живёт дольше?", options: { color: K.navy } }],
    { x: lx + 0.5, y: 5.7, w: lw - 1.0, h: 0.82, fontSize: 14, valign: "middle" });
  const months = Array.from({ length: 19 }, (_, i) => String(i));
  const cx = 5.55, cw = W - MX - cx;
  T(s, "Накопленная валовая прибыль от одного клиента, $", { x: cx, y: 1.95, w: cw, h: 0.32, fontSize: 14, bold: true });
  s.addChart(pres.charts.LINE, [
    { name: "Накопленная валовая прибыль", labels: months, values: months.map((m) => 140 * +m) },
    { name: "CAC $1 000", labels: months, values: months.map(() => 1000) },
    { name: "CAC $2 000", labels: months, values: months.map(() => 2000) },
  ], chartBase({ x: cx - 0.1, y: 2.3, w: cw + 0.1, h: 3.95, chartColors: [K.teal, K.slate, K.orange], lineSize: 2.5, lineDataSymbol: "none",
    showLegend: true, legendPos: "t", legendFontSize: 12, legendColor: K.slate, valAxisMaxVal: 2600, valAxisMinVal: 0, valAxisMajorUnit: 500, valAxisLabelFormatCode: "#,##0",
    showCatName: false, catAxisTitle: "месяцы жизни клиента", showCatAxisTitle: true, catAxisTitleFontSize: 11, catAxisTitleColor: K.slate,
    catAxisLabelFrequency: 3 }));
  T(s, "Учебный пример. Без учёта оттока и дисконтирования; честнее считать на contribution margin.", { x: cx, y: 6.4, w: cw, h: 0.3, fontSize: 11, italic: true, color: K.slate });
}

// ============================================================ 15 GROWTH LOOPS
{
  const { s } = newSlide("loops", true);
  // linear
  T(s, "ЛИНЕЙНАЯ МОДЕЛЬ", { x: MX, y: 2.0, w: 4, h: 0.3, fontSize: 11, bold: true, color: K.slate2, charSpacing: 2 });
  ["Реклама", "Клик", "Клиент"].forEach((t, i) => {
    const y = 2.45 + i * 0.78;
    R(s, { x: MX, y, w: 2.6, h: 0.55, fill: { color: K.panel }, rr: 0.08 });
    T(s, t, { x: MX, y, w: 2.6, h: 0.55, fontSize: 15, bold: true, color: K.white, align: "center", valign: "middle" });
    if (i < 2) s.addShape(pres.shapes.LINE, { x: MX + 1.3, y: y + 0.55, w: 0, h: 0.23, line: { color: K.slate2, width: 1.25, endArrowType: "triangle" } });
  });
  T(s, "Конец. Нужен следующий клиент — платите снова.", { x: MX, y: 4.85, w: 3.4, h: 0.6, fontSize: 13, color: K.slate2 });
  // loop diamond
  const cx = 8.55, cy = 3.65, rx = 2.25, ry = 1.25, nw = 2.35, nh = 0.62;
  const nodes = [["Ценность для клиента", 0, -ry], ["Позитивный опыт", rx, 0], ["Рекомендация / кейс", 0, ry], ["Новый квалифиц. клиент", -rx, 0]];
  const pos = nodes.map((n) => ({ t: n[0], x: cx + n[1], y: cy + n[2] }));
  // arrows between nodes (clockwise)
  // edges: top->right, right->bottom, bottom->left, left->top
  const [tp, rt, bt, lf] = pos;
  const e2 = (a, b, ax, ay, bx, by) => s.addShape(pres.shapes.LINE, { x: Math.min(ax, bx), y: Math.min(ay, by), w: Math.abs(bx - ax), h: Math.abs(by - ay), flipH: bx < ax, flipV: by < ay, line: { color: K.teal, width: 2, endArrowType: "triangle" } });
  e2(tp, rt, tp.x + nw / 2, tp.y, rt.x, rt.y - nh / 2 - 0.02);
  e2(rt, bt, rt.x, rt.y + nh / 2, bt.x + nw / 2 + 0.02, bt.y);
  e2(bt, lf, bt.x - nw / 2, bt.y, lf.x, lf.y + nh / 2 + 0.02);
  e2(lf, tp, lf.x, lf.y - nh / 2, tp.x - nw / 2 - 0.02, tp.y);
  pos.forEach((p, i) => {
    s.addText(p.t, { x: p.x - nw / 2, y: p.y - nh / 2, w: nw, h: nh, fontFace: F, fontSize: 14, bold: true, color: i === 0 ? K.navy : K.white, align: "center", valign: "middle", margin: 0.05, isTextBox: true,
      shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.31, fill: { color: i === 0 ? K.orange : K.panel }, line: { color: K.teal, width: 1.25 } });
  });
  T(s, "Выход цикла → вход следующего", { x: cx - 1.4, y: cy - 0.17, w: 2.8, h: 0.34, fontSize: 13, color: K.tealLt, align: "center", italic: true });
  // tiers
  const tiers = [["Контактная база", "Люди, которых вы знаете. Сама по себе не приводит клиентов: 100+ брендов в сети контактов — ещё не loop."],
    ["Реферальный канал", "Клиенты иногда рекомендуют вас. Полезно, но эпизодически."],
    ["Growth loop", "Рекомендация или кейс встроены в продукт и процесс — системно и измеримо."]];
  const tw = (CW - 2 * 0.3) / 3;
  tiers.forEach((t, i) => {
    const x = MX + i * (tw + 0.3);
    R(s, { x, y: 5.55, w: tw, h: 1.2, fill: { color: i === 2 ? K.teal : K.panel }, rr: 0.08 });
    T(s, t[0], { x: x + 0.25, y: 5.65, w: tw - 0.5, h: 0.32, fontSize: 15, bold: true, color: K.white });
    T(s, t[1], { x: x + 0.25, y: 5.98, w: tw - 0.5, h: 0.72, fontSize: 12, color: i === 2 ? K.white : K.slate2 });
  });
}

// ============================================================ 16 WORKSHOP
{
  const { s } = newSlide("workshop", false);
  const q = ["Где мы сейчас?", "Какой вектор роста выбираем?", "Какие доказательства спроса у нас есть?", "Какие KPI покажут успех?", "Какая главная проблема retention?", "Как повысить LTV?", "Какой эксперимент проведём за 30 дней?"];
  const pages = ["стр. 1", "стр. 2", "стр. 2", "стр. 4", "стр. 3", "стр. 3", "стр. 4"];
  q.forEach((t, i) => {
    const y = 2.0 + i * 0.6;
    T(s, String(i + 1), { x: MX, y, w: 0.45, h: 0.45, fontSize: 20, bold: true, color: K.orange, valign: "middle" });
    T(s, t, { x: MX + 0.55, y, w: 5.9, h: 0.45, fontSize: 18, bold: i === 6, valign: "middle" });
    T(s, pages[i], { x: MX + 6.45, y, w: 0.9, h: 0.45, fontSize: 12, color: K.slate, valign: "middle", align: "right" });
  });
  T(s, "Growth Decision Workbook · если данных нет — пишите «нет данных»", { x: MX, y: 6.35, w: 7.4, h: 0.3, fontSize: 12, italic: true, color: K.slate });
  const rx = 8.45, rw = W - MX - rx;
  R(s, { x: rx, y: 2.0, w: rw, h: 4.7, fill: { color: K.navy }, rr: 0.08 });
  T(s, "25 МИНУТ", { x: rx + 0.35, y: 2.22, w: rw - 0.7, h: 0.3, fontSize: 11, bold: true, color: K.orange, charSpacing: 2 });
  const tl = [["12:10", "Вопросы по заданию", "3 мин · инструкция"], ["12:13", "Работа в workbook", "17 мин · страницы 1–4"], ["12:30", "Подготовка защиты", "5 мин · 3 минуты на команду"]];
  tl.forEach((t, i) => {
    const y = 2.7 + i * 0.95;
    T(s, t[0], { x: rx + 0.35, y, w: 1.0, h: 0.4, fontSize: 18, bold: true, color: K.white });
    T(s, t[1], { x: rx + 1.4, y: y + 0.02, w: rw - 1.75, h: 0.4, fontSize: 14, color: K.white });
    T(s, t[2], { x: rx + 1.4, y: y + 0.4, w: rw - 1.75, h: 0.3, fontSize: 12, color: K.slate2 });
  });
  T(s, "Результат: 1 вектор · 2–3 KPI · эксперимент на 30 дней", { x: rx + 0.35, y: 5.65, w: rw - 0.7, h: 0.8, fontSize: 15, bold: true, color: K.tealLt });
}

// ============================================================ 17 TEAM REVIEW
{
  const { s } = newSlide("review", true);
  const tm = ["12:35", "12:40", "12:45", "12:50"];
  T(s, "4 КОМАНДЫ × 5 МИНУТ", { x: MX, y: 2.0, w: 5, h: 0.3, fontSize: 11, bold: true, color: K.orange, charSpacing: 2 });
  tm.forEach((t, i) => {
    const y = 2.45 + i * 0.86;
    R(s, { x: MX, y, w: 5.55, h: 0.7, fill: { color: K.panel }, rr: 0.08 });
    T(s, t, { x: MX + 0.25, y, w: 1.0, h: 0.7, fontSize: 18, bold: true, color: K.white, valign: "middle" });
    T(s, `Команда ${i + 1}`, { x: MX + 1.3, y, w: 1.6, h: 0.7, fontSize: 15, bold: true, color: K.white, valign: "middle" });
    T(s, "3 мин решение · 2 мин фидбек", { x: MX + 2.7, y, w: 2.75, h: 0.7, fontSize: 12, color: K.slate2, valign: "middle" });
  });
  T(s, "Остальные: один вопрос к каждой команде.", { x: MX, y: 6.0, w: 5.3, h: 0.35, fontSize: 13, color: K.slate2 });
  const rx = 6.75, rw = W - MX - rx;
  T(s, "КРИТЕРИИ ОЦЕНКИ · 1–5 · МАКСИМУМ 25", { x: rx, y: 2.0, w: rw, h: 0.3, fontSize: 11, bold: true, color: K.orange, charSpacing: 2 });
  const cr = ["Логика выбора рынка или сегмента", "Качество подтверждающих данных", "Понимание retention и LTV", "Экономическая реалистичность", "Практичность эксперимента на 30 дней"];
  cr.forEach((c, i) => {
    const y = 2.45 + i * 0.72;
    T(s, c, { x: rx, y, w: rw - 2.1, h: 0.55, fontSize: 14, color: K.white, valign: "middle" });
    for (let k = 0; k < 5; k++) s.addShape(pres.shapes.OVAL, { x: rx + rw - 1.95 + k * 0.4, y: y + 0.15, w: 0.25, h: 0.25, fill: { color: K.panel }, line: { color: K.slate, width: 1 } });
  });
  T(s, "«Какая метрика опровергнет вашу гипотезу?»", { x: rx, y: 6.0, w: rw, h: 0.35, fontSize: 14, italic: true, color: K.tealLt });
}

// ============================================================ 18 FINAL
{
  const { s } = newSlide("final", true);
  T(s, "Не масштабируйте то, что ещё не научились повторять.", { x: MX, y: 1.85, w: 10.5, h: 0.45, fontSize: 20, color: K.off });
  const tk = [["01", "Найдите доказанный спрос", "Поведение и деньги, а не лайки и встречи"], ["02", "Создайте повторяемую модель", "Предсказуемо: вложили X → получили Y клиентов, которые остаются"], ["03", "Масштабируйте устойчивую ценность", "Только то, что растёт быстрее расходов"]];
  const tw = (CW - 2 * 0.3) / 3;
  tk.forEach((t, i) => {
    const x = MX + i * (tw + 0.3);
    T(s, t[0], { x, y: 2.65, w: 1, h: 0.4, fontSize: 16, bold: true, color: K.orange });
    T(s, t[1], { x, y: 3.05, w: tw - 0.2, h: 0.8, fontSize: 20, bold: true, color: K.white });
    T(s, t[2], { x, y: 3.9, w: tw - 0.2, h: 0.65, fontSize: 14, color: K.slate2 });
  });
  R(s, { x: MX, y: 4.85, w: CW, h: 1.85, fill: { color: K.panel }, rr: 0.08 });
  T(s, "ДОМАШНЕЕ ЗАДАНИЕ К ДНЮ 2", { x: MX + 0.35, y: 5.02, w: 6, h: 0.3, fontSize: 11, bold: true, color: K.orange, charSpacing: 2 });
  C.HOMEWORK.forEach((h, i) => T(s, [{ text: `${i + 1}  `, options: { bold: true, color: K.tealLt } }, { text: h, options: { color: K.white } }],
    { x: MX + 0.35, y: 5.4 + i * 0.4, w: CW - 0.7, h: 0.38, fontSize: 14 }));
}

// ============================================================ BACKUP
{
  const { s } = newSlide("pmf", false);
  const cols = [["Сильные сигналы", K.teal, K.tealLt, ["Кривая удержания выравнивается", "Клиенты возвращаются без напоминаний", "Платят повторно и продлевают", "Приводят других клиентов", "Цикл сделки сокращается", "Тест Шона Эллиса: ≥40% «очень разочарованы»"]],
    ["Ловушки", K.orangeDk, K.orangeLt, ["Регистрации и скачивания", "Лист ожидания, лайки, комплименты", "Пилоты без перехода в оплату", "Выручка от одного крупного клиента", "Рост только за счёт платной рекламы", "Покупки друзей и знакомых"]]];
  const cw = (CW - 0.4) / 2;
  cols.forEach((c, i) => {
    const x = MX + i * (cw + 0.4);
    R(s, { x, y: 2.0, w: cw, h: 4.6, fill: { color: c[2] }, rr: 0.08 });
    T(s, c[0], { x: x + 0.35, y: 2.2, w: cw - 0.7, h: 0.45, fontSize: 22, bold: true, color: c[1] });
    c[3].forEach((t, j) => T(s, [{ text: i ? "✕  " : "✓  ", options: { bold: true, color: c[1] } }, { text: t, options: { color: K.navy } }], { x: x + 0.35, y: 2.85 + j * 0.6, w: cw - 0.7, h: 0.5, fontSize: 16 }));
  });
}
{
  const { s } = newSlide("formulas", false);
  const f = [["CAC", "Затраты на привлечение за период / новые платящие клиенты за период"], ["Валовая маржа", "(Выручка − прямые затраты на обслуживание) / выручка"],
    ["Contribution margin", "Выручка − все переменные затраты на клиента (обслуживание, продажи, внедрение, поддержка)"], ["CAC payback", "CAC / валовая прибыль клиента в месяц"],
    ["LTV (простая)", "Валовая прибыль в месяц / месячный отток — ориентир при стабильном оттоке"], ["Logo retention", "Клиенты на конец периода из стартовой базы / клиенты на начало"],
    ["GRR", "(Стартовая выручка − отток − даунгрейды) / стартовая выручка"], ["NRR", "(Стартовая выручка − отток − даунгрейды + расширения) / стартовая выручка"]];
  const rows = f.map(([a, b]) => [{ text: a, options: { bold: true, fontSize: 15, color: K.navy, valign: "middle" } }, { text: b, options: { fontSize: 14, color: K.navy, valign: "middle" } }]);
  s.addTable(rows, { x: MX, y: 2.0, w: CW, colW: [2.9, CW - 2.9], rowH: 0.54, fontFace: F, fill: { color: K.white }, border: { type: "solid", color: K.line, pt: 1 }, margin: [0.04, 0.15, 0.04, 0.15] });
}

(async () => {
  await pres.writeFile({ fileName: OUT });
  try {
    const { applyTheme } = require(process.env.PPTX_SKILL + "/scripts/apply_theme.js");
    await applyTheme(OUT, THEME);
  } catch (e) { console.error("applyTheme skipped:", e.message); }
  console.log("written", OUT);
})();
